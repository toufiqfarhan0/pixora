import { useState, useEffect, useCallback, useRef } from 'react';
import { Pixel } from '../types/canvas';
import { shortAddress } from '../lib/magicblock';

export interface RemoteCursor {
  id: string;
  name: string;
  address: string | null;
  color: string;
  x: number;
  y: number;
  isDrawing: boolean;
  lastActive: number;
}

type MultiplayerMessage =
  | {
      type: 'CURSOR_MOVE';
      cursor: RemoteCursor;
    }
  | {
      type: 'PIXEL_PAINT';
      pixel: Pixel;
    }
  | {
      type: 'BATCH_PIXELS';
      pixels: Pixel[];
    }
  | {
      type: 'PEER_LEAVE';
      id: string;
    }
  | {
      type: 'REQUEST_PEERS';
      senderId: string;
    }
  | {
      type: 'ANNOUNCE_PEER';
      cursor: RemoteCursor;
    };

interface UseRealtimeMultiplayerProps {
  userAddress: string | null;
  selectedColor: string;
  onRemotePaint?: (pixel: Pixel) => void;
  onRemoteBatch?: (pixels: Pixel[]) => void;
  onInitCanvas?: (pixels: Pixel[]) => void;
}

export function useRealtimeMultiplayer({
  userAddress,
  selectedColor,
  onRemotePaint,
  onRemoteBatch,
  onInitCanvas,
}: UseRealtimeMultiplayerProps) {
  // Real active remote peers map: peerId -> RemoteCursor
  const [remotePeers, setRemotePeers] = useState<RemoteCursor[]>([]);

  // Unique ID for this browser session/tab (stable per session)
  const sessionId = useRef(
    'peer_' + Math.random().toString(36).slice(2, 9)
  ).current;

  // Store mutable props in refs to avoid tearing down and re-opening the EventSource stream
  const onRemotePaintRef = useRef(onRemotePaint);
  onRemotePaintRef.current = onRemotePaint;

  const onRemoteBatchRef = useRef(onRemoteBatch);
  onRemoteBatchRef.current = onRemoteBatch;

  const onInitCanvasRef = useRef(onInitCanvas);
  onInitCanvasRef.current = onInitCanvas;

  const userAddressRef = useRef(userAddress);
  userAddressRef.current = userAddress;

  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;

  const channelRef = useRef<BroadcastChannel | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const peersMapRef = useRef<Map<string, RemoteCursor>>(new Map());
  const localPosRef = useRef<{ x: number; y: number; isDrawing: boolean }>({
    x: 64,
    y: 64,
    isDrawing: false,
  });

  const pendingBatchRef = useRef<Pixel[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getDisplayName = useCallback(() => {
    if (userAddressRef.current) {
      return shortAddress(userAddressRef.current, 4);
    }
    return 'Spectator';
  }, []);

  const flushPendingBatch = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (pendingBatchRef.current.length === 0) return;

    const batch = [...pendingBatchRef.current];
    pendingBatchRef.current = [];

    // Local BroadcastChannel for instant batch delivery across tabs
    if (channelRef.current && batch.length > 1) {
      try {
        channelRef.current.postMessage({
          type: 'BATCH_PIXELS',
          pixels: batch,
        });
      } catch {}
    }

    // Cross-browser / server relay
    fetch('/api/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        event:
          batch.length === 1
            ? { type: 'PIXEL_PAINT', pixel: batch[0] }
            : { type: 'BATCH_PIXELS', pixels: batch },
      }),
    }).catch(() => {});
  }, [sessionId]);

  // Stable single connection setup: runs ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. BroadcastChannel for instant local intra-browser sync (tabs in same browser)
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('pixora_realtime_presence_v1');
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<MultiplayerMessage>) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'CURSOR_MOVE') {
          if (msg.cursor.id === sessionId) return;
          peersMapRef.current.set(msg.cursor.id, msg.cursor);
          setRemotePeers(Array.from(peersMapRef.current.values()));
        } else if (msg.type === 'PIXEL_PAINT') {
          onRemotePaintRef.current?.(msg.pixel);
        } else if (msg.type === 'BATCH_PIXELS') {
          if (msg.pixels && msg.pixels.length > 0) {
            onRemoteBatchRef.current
              ? onRemoteBatchRef.current(msg.pixels)
              : onInitCanvasRef.current?.(msg.pixels);
          }
        } else if (msg.type === 'PEER_LEAVE') {
          peersMapRef.current.delete(msg.id);
          setRemotePeers(Array.from(peersMapRef.current.values()));
        } else if (msg.type === 'REQUEST_PEERS') {
          if (msg.senderId !== sessionId && userAddressRef.current) {
            channel?.postMessage({
              type: 'ANNOUNCE_PEER',
              cursor: {
                id: sessionId,
                name: getDisplayName(),
                address: userAddressRef.current,
                color: selectedColorRef.current,
                x: localPosRef.current.x,
                y: localPosRef.current.y,
                isDrawing: localPosRef.current.isDrawing,
                lastActive: Date.now(),
              },
            });
          }
        } else if (msg.type === 'ANNOUNCE_PEER') {
          if (msg.cursor.id === sessionId) return;
          peersMapRef.current.set(msg.cursor.id, msg.cursor);
          setRemotePeers(Array.from(peersMapRef.current.values()));
        }
      };

      channel.postMessage({
        type: 'REQUEST_PEERS',
        senderId: sessionId,
      });
    }

    // 2. Server-Sent Events (SSE) for cross-browser sync (Firefox <-> Comet <-> Chrome)
    const es = new EventSource(`/api/realtime?sessionId=${sessionId}`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data || !data.type) return;

        if (data.type === 'INIT_STATE') {
          if (data.pixels && data.pixels.length > 0) {
            onInitCanvasRef.current?.(data.pixels);
          }
        } else if (data.type === 'PIXEL_PAINT') {
          onRemotePaintRef.current?.(data.pixel);
        } else if (data.type === 'BATCH_PIXELS') {
          if (data.pixels && data.pixels.length > 0) {
            onRemoteBatchRef.current
              ? onRemoteBatchRef.current(data.pixels)
              : onInitCanvasRef.current?.(data.pixels);
          }
        }
      } catch {
        // Ignore ping comments
      }
    };

    // Periodic cleanup of stale local cursors
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      peersMapRef.current.forEach((peer, id) => {
        if (now - peer.lastActive > 10000) {
          peersMapRef.current.delete(id);
          changed = true;
        }
      });
      if (changed) {
        setRemotePeers(Array.from(peersMapRef.current.values()));
      }
    }, 4000);

    return () => {
      flushPendingBatch();
      clearInterval(interval);
      if (channel) {
        channel.postMessage({ type: 'PEER_LEAVE', id: sessionId });
        channel.close();
        channelRef.current = null;
      }
      if (es) {
        es.close();
        eventSourceRef.current = null;
      }
    };
  }, [sessionId, getDisplayName, flushPendingBatch]);

  // Emit local pointer position to same-browser tabs at 60fps with zero HTTP network requests
  const broadcastCursor = useCallback(
    (x: number, y: number, isDrawing: boolean) => {
      localPosRef.current = { x, y, isDrawing };

      if (!channelRef.current) return;

      const cursor: RemoteCursor = {
        id: sessionId,
        name: getDisplayName(),
        address: userAddressRef.current,
        color: userAddressRef.current ? selectedColorRef.current : '#94A3B8',
        x,
        y,
        isDrawing: userAddressRef.current ? isDrawing : false,
        lastActive: Date.now(),
      };

      try {
        channelRef.current.postMessage({
          type: 'CURSOR_MOVE',
          cursor,
        });
      } catch {
        // Ignored
      }
    },
    [sessionId, getDisplayName]
  );

  // Broadcast placed pixel to all other connected tabs AND cross-browser via micro-batching
  const broadcastPixel = useCallback(
    (pixel: Pixel) => {
      // 1. Local BroadcastChannel (immediate 0ms for individual click)
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'PIXEL_PAINT',
            pixel,
          });
        } catch {
          // Ignored
        }
      }

      // 2. Queue for cross-browser / Vercel server relay
      pendingBatchRef.current.push(pixel);

      // Micro-batch flush every 30ms (~33 batches/sec max, completely within HTTP limits, 0 dropped pixels)
      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => {
          flushPendingBatch();
        }, 30);
      }
    },
    [flushPendingBatch]
  );

  // Broadcast entire batch of existing pixels to server (only called when needed, not in a loop)
  const broadcastBatch = useCallback(
    (pixels: Pixel[]) => {
      if (!pixels || pixels.length === 0) return;
      fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          event: { type: 'BATCH_PIXELS', pixels },
        }),
      }).catch(() => {});
    },
    [sessionId]
  );

  return {
    remotePeers,
    broadcastCursor,
    broadcastPixel,
    broadcastBatch,
    flushPendingBatch,
    peerCount: remotePeers.length,
  };
}
