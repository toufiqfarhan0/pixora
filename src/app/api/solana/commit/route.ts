import { NextResponse } from 'next/server';
import { submitL1CommitTransaction, getRelayerStatus } from '@/lib/solanaRelayer';
import { getServerState, trySaveToDisk } from '@/lib/serverCanvasState';
import { computeCanvasStateHash } from '@/lib/magicblock';
import { Pixel } from '@/types/canvas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getRelayerStatus();
    const state = getServerState();
    return NextResponse.json({
      ok: true,
      relayer: status,
      lastCommit: {
        txHash: state.lastCommitTx || null,
        stateRoot: state.lastCommitRoot || null,
        timestamp: state.lastCommitTime || null,
        explorerUrl: state.lastCommitTx
          ? `https://explorer.solana.com/tx/${state.lastCommitTx}?cluster=devnet`
          : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stateRoot, pixelCount, author, pixels } = body as {
      stateRoot?: string;
      pixelCount?: number;
      author?: string;
      pixels?: Pixel[];
    };

    const state = getServerState();

    // Compute root if not provided
    let calculatedRoot = stateRoot;
    if (!calculatedRoot && Array.isArray(pixels) && pixels.length > 0) {
      calculatedRoot = computeCanvasStateHash(pixels);
    } else if (!calculatedRoot) {
      const currentPixels = Array.from(state.pixels.values());
      calculatedRoot = computeCanvasStateHash(currentPixels);
    }

    const count = typeof pixelCount === 'number' && pixelCount > 0
      ? pixelCount
      : (Array.isArray(pixels) ? pixels.length : state.pixels.size);

    const result = await submitL1CommitTransaction({
      stateRoot: calculatedRoot,
      pixelCount: count,
      author: author || 'Pixora Community',
    });

    // Save commit in global state
    state.lastCommitTx = result.txHash;
    state.lastCommitRoot = result.stateRoot;
    state.lastCommitTime = result.timestamp;
    state.lastUpdated = Date.now();
    trySaveToDisk(state);

    return NextResponse.json({
      ok: true,
      txHash: result.txHash,
      stateRoot: result.stateRoot,
      timestamp: result.timestamp,
      pixelCount: result.pixelCount,
      explorerUrl: result.explorerUrl,
      slot: result.slot,
    });
  } catch (err: any) {
    console.error('[API /solana/commit error]:', err);
    return NextResponse.json(
      {
        error: err?.message || 'Failed to submit L1 commit transaction to Solana Devnet',
      },
      { status: 400 }
    );
  }
}
