import { NextResponse } from 'next/server';
import { submitPixelBatchTransaction } from '@/lib/solanaRelayer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { count, author } = body as { count?: number; author?: string };

    const pixelCount = typeof count === 'number' && count > 0 ? count : 1;
    const result = await submitPixelBatchTransaction({
      count: pixelCount,
      author: author || 'Solana Painter',
    });

    return NextResponse.json({
      ok: true,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl,
      pixelCount: result.pixelCount,
    });
  } catch (err: any) {
    // If relayer is out of gas or rate limited, return a structured fallback
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || 'Stroke batch transaction failed',
      },
      { status: 400 }
    );
  }
}
