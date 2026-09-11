import { NextResponse } from 'next/server';
import { getServerState, trySaveToDisk } from '@/lib/serverCanvasState';
import { Pixel } from '@/types/canvas';

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
    txCount: Math.max(state.globalTxCount, validPixels.length),
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pixels, txCount } = body as { pixels?: Pixel[]; txCount?: number };
    const state = getServerState();
    let changed = false;

    if (Array.isArray(pixels)) {
      pixels.forEach((p) => {
        if (p && p.x >= 0 && p.x < 128 && p.y >= 0 && p.y < 128) {
          state.pixels.set(`${p.x},${p.y}`, { ...p, timestamp: p.timestamp || Date.now() });
        }
      });
      changed = true;
    }

    if (typeof txCount === 'number' && txCount > state.globalTxCount) {
      state.globalTxCount = txCount;
      changed = true;
    }

    if (changed) {
      state.lastUpdated = Date.now();
      trySaveToDisk(state);
    }

    return NextResponse.json({
      status: 'ok',
      totalPixels: state.pixels.size,
      txCount: state.globalTxCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

