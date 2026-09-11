import { NextResponse } from 'next/server';
import { getServerState } from '@/lib/serverCanvasState';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = getServerState();
  const validPixels = Array.from(state.pixels.values()).filter(
    (p) => p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128
  );

  return NextResponse.json({
    status: 'ok',
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || '',
    canvasPda: process.env.NEXT_PUBLIC_CANVAS_PDA || '',
    dimensions: {
      width: 128,
      height: 128,
      totalCells: 16384,
    },
    pixels: validPixels,
    txCount: validPixels.length,
    rollup: {
      layer: 'MagicBlock Ephemeral Rollup',
      router: 'https://devnet.magicblock.app',
      wsRpc: 'wss://devnet.magicblock.app',
      blockTimeMs: 10,
      gasUsd: 0.0,
    },
    settlement: {
      l1Network: 'solana-devnet',
      lastCommitTx: '2wccdWJjvWuawQ8smHhtjoTMw6KdZ4RwyUwWHGn8T5FHNpGk4cJ3wFR6p537Uw6NXp67xMsEFdJR5RFrut5RdH78',
      explorerUrl: 'https://explorer.solana.com/tx/2wccdWJjvWuawQ8smHhtjoTMw6KdZ4RwyUwWHGn8T5FHNpGk4cJ3wFR6p537Uw6NXp67xMsEFdJR5RFrut5RdH78?cluster=devnet',
    },
    timestamp: Date.now(),
  });
}
