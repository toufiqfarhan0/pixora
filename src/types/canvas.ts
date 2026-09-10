export interface Pixel {
  x: number;
  y: number;
  color: string;
  author: string;
  timestamp: number;
  txHash?: string;
  isERConfirmed: boolean;
  isVerified?: boolean;
}

export interface CanvasState {
  width: number;
  height: number;
  pixels: Map<string, Pixel>; // key: `${x},${y}`
}

export type ToolMode = 'pen' | 'brush' | 'eraser' | 'picker';

export type AuthMode = 'live';

export interface ERTelemetry {
  blockTimeMs: number;
  gasSpentUsd: number;
  txCount: number;
  lastTxTime: number | null;
  status: 'active' | 'committing' | 'synced' | 'disconnected';
  activeRollupNode: string;
  delegatedAccount: string;
  l1CommittedCount: number;
  lastL1CommitHash: string | null;
  authMode?: AuthMode;
}

export interface ActivityItem {
  id: string;
  x: number;
  y: number;
  color: string;
  author: string;
  timestamp: number;
  isMock?: boolean;
  isVerified?: boolean;
}

export interface ColorPalette {
  name: string;
  id: string;
  colors: string[];
}
