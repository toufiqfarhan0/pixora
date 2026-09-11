import { NextResponse } from 'next/server';
import {
  getServerState,
  broadcastToClients,
  ServerRealtimeEvent,
} from '@/lib/serverCanvasState';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
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

      // Send initial snapshot immediately to the new client
      const initialEvent: ServerRealtimeEvent = {
        type: 'INIT_STATE',
        pixels: Array.from(state.pixels.values()),
        peers: Array.from(state.cursors.values()).filter((c) => c.id !== sessionId),
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
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, event } = body as {
      sessionId: string;
      event: ServerRealtimeEvent;
    };

    if (!event || !event.type) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const state = getServerState();

    if (event.type === 'PIXEL_PAINT') {
      const p = event.pixel;
      state.pixels.set(`${p.x},${p.y}`, p);
      broadcastToClients(event, sessionId);
    } else if (event.type === 'BATCH_PIXELS') {
      if (Array.isArray(event.pixels)) {
        event.pixels.forEach((p) => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number') {
            state.pixels.set(`${p.x},${p.y}`, p);
          }
        });
      }
      broadcastToClients(event, sessionId);
    } else if (event.type === 'CURSOR_MOVE') {
      state.cursors.set(event.cursor.id, event.cursor);
      broadcastToClients(event, sessionId);
    } else if (event.type === 'PEER_LEAVE') {
      state.cursors.delete(event.id);
      broadcastToClients(event, sessionId);
    }

    return NextResponse.json({ ok: true, totalPixels: state.pixels.size });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
