import { Pixel } from '../types/canvas';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

export type ServerRealtimeEvent =
  | {
      type: 'INIT_STATE';
      pixels: Pixel[];
      peers: RemoteCursor[];
      globalTxCount?: number;
    }
  | {
      type: 'PIXEL_PAINT';
      pixel: Pixel;
      globalTxCount?: number;
    }
  | {
      type: 'BATCH_PIXELS';
      pixels: Pixel[];
      globalTxCount?: number;
    }
  | {
      type: 'CURSOR_MOVE';
      cursor: RemoteCursor;
    }
  | {
      type: 'PEER_LEAVE';
      id: string;
    };

interface GlobalState {
  pixels: Map<string, Pixel>;
  clients: Map<string, (event: ServerRealtimeEvent) => void>;
  cursors: Map<string, RemoteCursor>;
  globalTxCount: number;
  lastUpdated: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __pixoraGlobalState: GlobalState | undefined;
}

const DISK_FILE = path.join(os.tmpdir(), 'pixora_canvas_snapshot.json');

function tryLoadFromDisk(): { pixels: Pixel[]; globalTxCount: number } | null {
  try {
    if (fs.existsSync(DISK_FILE)) {
      const raw = fs.readFileSync(DISK_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.pixels)) {
        return {
          pixels: data.pixels,
          globalTxCount: typeof data.globalTxCount === 'number' ? data.globalTxCount : data.pixels.length,
        };
      }
    }
  } catch {
    // Ignore disk read errors
  }
  return null;
}

export function trySaveToDisk(state: GlobalState) {
  try {
    const data = {
      pixels: Array.from(state.pixels.values()),
      globalTxCount: state.globalTxCount,
      lastUpdated: state.lastUpdated,
    };
    fs.writeFileSync(DISK_FILE, JSON.stringify(data), 'utf8');
  } catch {
    // Ignore disk write errors
  }
}

export function getServerState(): GlobalState {
  if (!globalThis.__pixoraGlobalState) {
    const loaded = tryLoadFromDisk();
    const pixelMap = new Map<string, Pixel>();
    if (loaded && loaded.pixels.length > 0) {
      loaded.pixels.forEach((p) => {
        if (p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128) {
          pixelMap.set(`${p.x},${p.y}`, p);
        }
      });
    }

    globalThis.__pixoraGlobalState = {
      pixels: pixelMap,
      clients: new Map(),
      cursors: new Map(),
      globalTxCount: loaded?.globalTxCount || pixelMap.size,
      lastUpdated: Date.now(),
    };
  }
  return globalThis.__pixoraGlobalState;
}

export function broadcastToClients(
  event: ServerRealtimeEvent,
  excludeSessionId?: string
) {
  const state = getServerState();
  state.clients.forEach((send, sessionId) => {
    if (excludeSessionId && sessionId === excludeSessionId) return;
    try {
      send(event);
    } catch {
      state.clients.delete(sessionId);
    }
  });
}

export function getPixelsSince(sinceTimestamp: number): { pixels: Pixel[]; globalTxCount: number; timestamp: number } {
  const state = getServerState();
  const result: Pixel[] = [];
  state.pixels.forEach((p) => {
    if (p.timestamp >= sinceTimestamp) {
      result.push(p);
    }
  });
  return {
    pixels: result,
    globalTxCount: state.globalTxCount,
    timestamp: Date.now(),
  };
}

