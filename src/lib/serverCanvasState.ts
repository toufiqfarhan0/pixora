import { Pixel } from '../types/canvas';

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
}

declare global {
  // eslint-disable-next-line no-var
  var __pixoraGlobalState: GlobalState | undefined;
}

export function getServerState(): GlobalState {
  if (!globalThis.__pixoraGlobalState) {
    globalThis.__pixoraGlobalState = {
      pixels: new Map<string, Pixel>(),
      clients: new Map(),
      cursors: new Map(),
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
