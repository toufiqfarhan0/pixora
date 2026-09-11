import { NextResponse } from 'next/server';
import {
  getServerState,
  broadcastToClients,
  ServerRealtimeEvent,
  getPixelsSince,
  trySaveToDisk,
} from '@/lib/serverCanvasState';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 1. Fast Delta Sync JSON Endpoint (for guaranteed cross-browser recovery without SSE drops)
  if (url.searchParams.get('sync') === '1') {
    const state = getServerState();
    const since = parseInt(url.searchParams.get('since') || '0', 10);

    if (since > 0) {
      const delta = getPixelsSince(since);
      return NextResponse.json({
        ok: true,
        mode: 'delta',
        pixels: delta.pixels,
        globalTxCount: delta.globalTxCount,
        timestamp: delta.timestamp,
      });
    }

    const validPixels = Array.from(state.pixels.values()).filter(
      (p) => p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128
    );
    return NextResponse.json({
      ok: true,
      mode: 'snapshot',
      pixels: validPixels,
      globalTxCount: state.globalTxCount,
      timestamp: Date.now(),
    });
  }

  // 2. Server-Sent Events (SSE) Stream
  const sessionId = url.searchParams.get('sessionId') || `peer_${Math.random().toString(36).slice(2, 9)}`;
  const state = getServerState();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: ServerRealtimeEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          state.clients.delete(sessionId);
        }
      };

      // Register client listener
      state.clients.set(sessionId, sendEvent);

      // Clean up stale cursors (>15s inactive)
      const now = Date.now();
      state.cursors.forEach((c, id) => {
        if (now - c.lastActive > 15000) {
          state.cursors.delete(id);
        }
      });

      // Send initial snapshot immediately to the new client (clean 128x128 bounds only)
      const validPixels = Array.from(state.pixels.values()).filter(
        (p) => p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128
      );
      const initialEvent: ServerRealtimeEvent = {
        type: 'INIT_STATE',
        pixels: validPixels,
        peers: Array.from(state.cursors.values()).filter((c) => c.id !== sessionId),
        globalTxCount: state.globalTxCount,
      };
      sendEvent(initialEvent);

      // Heartbeat every 15s to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
          state.clients.delete(sessionId);
        }
      }, 15000);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        state.clients.delete(sessionId);
        state.cursors.delete(sessionId);
        broadcastToClients({ type: 'PEER_LEAVE', id: sessionId }, sessionId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, event, txCount } = body as {
      sessionId: string;
      event: ServerRealtimeEvent;
      txCount?: number;
    };

    if (!event || !event.type) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const state = getServerState();
    let stateChanged = false;

    if (typeof txCount === 'number' && txCount > state.globalTxCount) {
      state.globalTxCount = txCount;
      stateChanged = true;
    }

    if (event.type === 'PIXEL_PAINT') {
      const p = event.pixel;
      if (p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128) {
        state.pixels.set(`${p.x},${p.y}`, { ...p, timestamp: p.timestamp || Date.now() });
        state.globalTxCount = Math.max(state.globalTxCount + 1, state.pixels.size);
        state.lastUpdated = Date.now();
        stateChanged = true;
        broadcastToClients({ ...event, globalTxCount: state.globalTxCount }, sessionId);
      }
    } else if (event.type === 'BATCH_PIXELS') {
      if (Array.isArray(event.pixels)) {
        event.pixels.forEach((p) => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number' && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128) {
            state.pixels.set(`${p.x},${p.y}`, { ...p, timestamp: p.timestamp || Date.now() });
          }
        });
        state.globalTxCount = Math.max(state.globalTxCount + event.pixels.length, state.pixels.size);
        state.lastUpdated = Date.now();
        stateChanged = true;
      }
      broadcastToClients({ ...event, globalTxCount: state.globalTxCount }, sessionId);
    } else if (event.type === 'CURSOR_MOVE') {
      state.cursors.set(event.cursor.id, event.cursor);
      broadcastToClients(event, sessionId);
    } else if (event.type === 'PEER_LEAVE') {
      state.cursors.delete(event.id);
      broadcastToClients(event, sessionId);
    }

    if (stateChanged) {
      trySaveToDisk(state);
    }

    return NextResponse.json({
      ok: true,
      totalPixels: state.pixels.size,
      globalTxCount: state.globalTxCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

