import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    programId: 'Pxra6Kev7iEom8n9zF2fHQKwhu68hL4WnU2qVwB7uS8',
    canvasPda: '8TnYwxdZvPywRioeUkkWTwaynU7jRTfEvF2GJizBvk9A',
    dimensions: {
      width: 128,
      height: 128,
      totalCells: 16384,
    },
    rollup: {
      layer: 'MagicBlock Ephemeral Rollup',
      router: 'https://devnet.magicblock.app',
      wsRpc: 'wss://devnet.magicblock.app',
      blockTimeMs: 10,
      gasUsd: 0.0,
    },
    settlement: {
      l1Network: 'solana-devnet',
      lastCommitTx: '3U15N3fwxeC7HTD1F6tZYTgY7eGxWju3yMjZwybK14RzB6RxzNt7wiP9uc6YurFKvGy4cd56UFTMnNhM8nSdYUfh',
      explorerUrl: 'https://explorer.solana.com/tx/3U15N3fwxeC7HTD1F6tZYTgY7eGxWju3yMjZwybK14RzB6RxzNt7wiP9uc6YurFKvGy4cd56UFTMnNhM8nSdYUfh?cluster=devnet',
    },
    timestamp: Date.now(),
  });
}
