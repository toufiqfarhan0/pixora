import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import bs58 from 'bs58';

// SPL Memo Program ID on Solana (present across all clusters)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
);

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

let cachedConnection: Connection | null = null;
let cachedKeypair: Keypair | null = null;

function getDecodeFn() {
  const anyBs58 = bs58 as any;
  return anyBs58.decode || anyBs58.default?.decode;
}

export function getConnection(): Connection {
  if (!cachedConnection) {
    cachedConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }
  return cachedConnection;
}

export function getRelayerKeypair(): Keypair | null {
  if (cachedKeypair) return cachedKeypair;

  const rawKey = process.env.SOLANA_PRIVATE_KEY?.trim();
  if (!rawKey) {
    console.warn('[SolanaRelayer] No SOLANA_PRIVATE_KEY found in environment.');
    return null;
  }

  try {
    if (rawKey.startsWith('[') && rawKey.endsWith(']')) {
      const arr = JSON.parse(rawKey);
      cachedKeypair = Keypair.fromSecretKey(new Uint8Array(arr));
    } else {
      const decode = getDecodeFn();
      const bytes = decode(rawKey);
      cachedKeypair = Keypair.fromSecretKey(bytes);
    }
    return cachedKeypair;
  } catch (err: any) {
    console.error('[SolanaRelayer] Failed to decode SOLANA_PRIVATE_KEY:', err.message);
    return null;
  }
}

export async function getRelayerStatus(): Promise<{
  configured: boolean;
  publicKey: string | null;
  balanceSol: number;
  balanceLamports: number;
}> {
  const kp = getRelayerKeypair();
  if (!kp) {
    return {
      configured: false,
      publicKey: null,
      balanceSol: 0,
      balanceLamports: 0,
    };
  }

  try {
    const conn = getConnection();
    const lamports = await conn.getBalance(kp.publicKey);
    return {
      configured: true,
      publicKey: kp.publicKey.toBase58(),
      balanceSol: lamports / LAMPORTS_PER_SOL,
      balanceLamports: lamports,
    };
  } catch (err: any) {
    return {
      configured: true,
      publicKey: kp.publicKey.toBase58(),
      balanceSol: 0,
      balanceLamports: 0,
    };
  }
}

export interface L1CommitResult {
  txHash: string;
  stateRoot: string;
  timestamp: number;
  pixelCount: number;
  explorerUrl: string;
  slot?: number;
}

/**
 * Submit an authentic L1 State Settlement transaction to Solana Devnet.
 * Encodes the Merkle state root, author, and total pixel count into an SPL Memo onchain instruction.
 */
export async function submitL1CommitTransaction({
  stateRoot,
  pixelCount,
  author = 'Anonymous Painter',
}: {
  stateRoot: string;
  pixelCount: number;
  author?: string;
}): Promise<L1CommitResult> {
  const kp = getRelayerKeypair();
  if (!kp) {
    throw new Error(
      'Solana transaction relayer is not configured with SOLANA_PRIVATE_KEY.'
    );
  }

  const conn = getConnection();
  const balance = await conn.getBalance(kp.publicKey);
  const minRequired = 5000; // ~0.000005 SOL fee
  if (balance < minRequired) {
    throw new Error(
      `Insufficient Devnet SOL in relayer wallet (${kp.publicKey.toBase58()}). Balance: ${balance / LAMPORTS_PER_SOL} SOL. Please airdrop Devnet SOL at https://faucet.solana.com`
    );
  }

  const timestamp = Date.now();
  const memoPayload = JSON.stringify({
    app: 'Pixora',
    action: 'L1_COMMIT',
    root: stateRoot,
    pixels: pixelCount,
    author: author.slice(0, 44),
    ts: timestamp,
  });

  const instruction = new TransactionInstruction({
    keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoPayload, 'utf-8'),
  });

  const tx = new Transaction().add(instruction);
  tx.feePayer = kp.publicKey;
  const latestBlockhash = await conn.getLatestBlockhash('confirmed');
  tx.recentBlockhash = latestBlockhash.blockhash;

  const signature = await sendAndConfirmTransaction(conn, tx, [kp], {
    commitment: 'confirmed',
    skipPreflight: false,
  });

  console.log(`[SolanaRelayer] L1 Commit confirmed on Solana Devnet: ${signature}`);

  return {
    txHash: signature,
    stateRoot,
    timestamp,
    pixelCount,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    slot: latestBlockhash.lastValidBlockHeight,
  };
}

export interface PixelBatchResult {
  txHash: string;
  pixelCount: number;
  explorerUrl: string;
}

/**
 * Submit an authentic onchain batch stroke proof to Solana Devnet.
 */
export async function submitPixelBatchTransaction({
  count,
  author = 'Solana Painter',
  sampleCoords,
}: {
  count: number;
  author?: string;
  sampleCoords?: string;
}): Promise<PixelBatchResult> {
  const kp = getRelayerKeypair();
  if (!kp) {
    throw new Error('Solana transaction relayer keypair is missing.');
  }

  const conn = getConnection();
  const balance = await conn.getBalance(kp.publicKey);
  if (balance < 5000) {
    throw new Error(
      `Relayer wallet ${kp.publicKey.toBase58()} needs Devnet SOL (https://faucet.solana.com).`
    );
  }

  const memoPayload = `Pixora Pixel Batch | count=${count} | author=${author.slice(0, 44)} | at=${Date.now()}`;

  const instruction = new TransactionInstruction({
    keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoPayload, 'utf-8'),
  });

  const tx = new Transaction().add(instruction);
  tx.feePayer = kp.publicKey;
  const latestBlockhash = await conn.getLatestBlockhash('confirmed');
  tx.recentBlockhash = latestBlockhash.blockhash;

  const signature = await sendAndConfirmTransaction(conn, tx, [kp], {
    commitment: 'confirmed',
    skipPreflight: false,
  });

  return {
    txHash: signature,
    pixelCount: count,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  };
}
