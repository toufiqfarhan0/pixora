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
}

export function useRealtimeMultiplayer({
  userAddress,
  selectedColor,
  onRemotePaint,
}: UseRealtimeMultiplayerProps) {
  // Real active remote peers map: peerId -> RemoteCursor (starts 100% empty, zero hardcoding)
  const [remotePeers, setRemotePeers] = useState<RemoteCursor[]>([]);

  // Unique ID for this browser session/tab
  const sessionId = useRef(
    'peer_' + Math.random().toString(36).slice(2, 9)
  ).current;

  const channelRef = useRef<BroadcastChannel | null>(null);
  const peersMapRef = useRef<Map<string, RemoteCursor>>(new Map());
  const localPosRef = useRef<{ x: number; y: number; isDrawing: boolean }>({
    x: 64,
    y: 64,
    isDrawing: false,
  });

  const getDisplayName = useCallback(() => {
    if (userAddress) {
      return shortAddress(userAddress, 4);
    }
    return 'Guest Artist';
  }, [userAddress]);

  // Set up real BroadcastChannel communication across tabs and windows
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    const channel = new BroadcastChannel('pixora_realtime_presence_v1');
    channelRef.current = channel;

    // Handle incoming messages from other real instances
    channel.onmessage = (event: MessageEvent<MultiplayerMessage>) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'CURSOR_MOVE') {
        if (msg.cursor.id === sessionId) return;
        peersMapRef.current.set(msg.cursor.id, msg.cursor);
        setRemotePeers(Array.from(peersMapRef.current.values()));
      } else if (msg.type === 'PIXEL_PAINT') {
        if (onRemotePaint) {
          onRemotePaint(msg.pixel);
        }
      } else if (msg.type === 'PEER_LEAVE') {
        peersMapRef.current.delete(msg.id);
        setRemotePeers(Array.from(peersMapRef.current.values()));
      } else if (msg.type === 'REQUEST_PEERS') {
        if (msg.senderId !== sessionId && userAddress) {
          // Announce ourselves to the newcomer
          channel.postMessage({
            type: 'ANNOUNCE_PEER',
            cursor: {
              id: sessionId,
              name: getDisplayName(),
              address: userAddress,
              color: selectedColor,
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

    // Ask existing tabs for their presence
    channel.postMessage({
      type: 'REQUEST_PEERS',
      senderId: sessionId,
    });

    // Cleanup stale peers every 2.5 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      peersMapRef.current.forEach((peer, id) => {
        if (now - peer.lastActive > 6000) {
          peersMapRef.current.delete(id);
          changed = true;
        }
      });
      if (changed) {
        setRemotePeers(Array.from(peersMapRef.current.values()));
      }
    }, 2500);

    const handleBeforeUnload = () => {
      channel.postMessage({
        type: 'PEER_LEAVE',
        id: sessionId,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.postMessage({
        type: 'PEER_LEAVE',
        id: sessionId,
      });
      channel.close();
      channelRef.current = null;
    };
  }, [sessionId, userAddress, selectedColor, getDisplayName, onRemotePaint]);

  // Emit local pointer position to real peers
  const broadcastCursor = useCallback(
    (x: number, y: number, isDrawing: boolean) => {
      localPosRef.current = { x, y, isDrawing };

      // Only broadcast presence if user is connected or actively drawing
      if (!channelRef.current) return;

      const cursor: RemoteCursor = {
        id: sessionId,
        name: getDisplayName(),
        address: userAddress,
        color: selectedColor,
        x,
        y,
        isDrawing,
        lastActive: Date.now(),
      };

      try {
        channelRef.current.postMessage({
          type: 'CURSOR_MOVE',
          cursor,
        });
      } catch (err) {
        // Channel closed or ignored
      }
    },
    [sessionId, userAddress, selectedColor, getDisplayName]
  );

  // Broadcast placed pixel to all other connected tabs/users
  const broadcastPixel = useCallback((pixel: Pixel) => {
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage({
        type: 'PIXEL_PAINT',
        pixel,
      });
    } catch (err) {
      // Channel closed or ignored
    }
  }, []);

  return {
    remotePeers,
    broadcastCursor,
    broadcastPixel,
    peerCount: remotePeers.length,
  };
}
