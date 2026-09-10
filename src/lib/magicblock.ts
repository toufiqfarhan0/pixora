import { ERTelemetry, Pixel } from '../types/canvas';

export const MAGICBLOCK_DEVNET_ROUTER = 'https://devnet.magicblock.app';
export const MAGICBLOCK_WS_ENDPOINT = 'wss://devnet.magicblock.app';
export const CANVAS_ACCOUNT_PUBKEY = 'PixoraCanvas11111111111111111111111111111111';

// Format short address helper
export function shortAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

// Generate a random mock Solana tx hash
export function generateTxHash(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = '';
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Generate state root hash for L1 commitment
export function computeCanvasStateHash(pixels: Pixel[]): string {
  let hash = 0x811c9dc5;
  for (const p of pixels) {
    const str = `${p.x}:${p.y}:${p.color}`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
  }
  return '0x' + hash.toString(16).padStart(8, '0') + generateTxHash().slice(0, 56);
}

// Simulated peer painters to demonstrate the live multiplayer 10ms stream
export const MOCK_PEERS = [
  { name: '0xSola...98f2', color: '#9945FF' },
  { name: 'magic...b4a1', color: '#2E5BFF' },
  { name: 'blitz...33c9', color: '#14F195' },
  { name: 'pixel...e071', color: '#FF4FD8' },
  { name: 'cyber...551d', color: '#00FF94' },
  { name: 'sol_dev...a2b8', color: '#F5B93C' },
];
