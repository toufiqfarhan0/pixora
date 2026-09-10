import { useState, useEffect, useCallback, useRef } from 'react';
import { ERTelemetry, Pixel, ActivityItem, AuthMode } from '../types/canvas';
import {
  MAGICBLOCK_DEVNET_ROUTER,
  CANVAS_ACCOUNT_PUBKEY,
  generateTxHash,
  computeCanvasStateHash,
  MOCK_PEERS,
} from '../lib/magicblock';

interface UseMagicBlockERProps {
  onRemotePixel?: (pixel: Pixel) => void;
  userAddress?: string | null;
  authMode?: AuthMode;
}

export function useMagicBlockER({ onRemotePixel, userAddress, authMode = 'guest' }: UseMagicBlockERProps) {
  const [telemetry, setTelemetry] = useState<ERTelemetry>({
    blockTimeMs: 10,
    gasSpentUsd: 0.0,
    txCount: 1420, // initial simulated txns to feel active
    lastTxTime: null,
    status: 'active',
    activeRollupNode: 'magic-router-er-node-01.us-east.magicblock.app',
    delegatedAccount: CANVAS_ACCOUNT_PUBKEY,
    l1CommittedCount: 18,
    lastL1CommitHash: '5Kz7N2vC...49mP',
    authMode,
  });

  // Sync authMode to telemetry
  useEffect(() => {
    setTelemetry((prev) => ({ ...prev, authMode }));
  }, [authMode]);

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    // Initial activity stream
    return [
      { id: '1', x: 64, y: 64, color: '#FF4D26', author: 'magic...b4a1', timestamp: Date.now() - 400, isVerified: true },
      { id: '2', x: 65, y: 64, color: '#4F46E5', author: '0xSola...98f2', timestamp: Date.now() - 320, isVerified: true },
      { id: '3', x: 66, y: 64, color: '#14F195', author: 'blitz...33c9', timestamp: Date.now() - 210, isVerified: false },
      { id: '4', x: 64, y: 65, color: '#00FF94', author: 'cyber...551d', timestamp: Date.now() - 80, isVerified: false },
    ];
  });

  const [isCommitting, setIsCommitting] = useState(false);
  const [lastCommitResult, setLastCommitResult] = useState<{
    txHash: string;
    stateRoot: string;
    timestamp: number;
    pixelCount: number;
  } | null>(null);

  // Buffer of pending pixels for 10ms batching
  const pendingPixelsRef = useRef<Pixel[]>([]);

  // Push placed pixel through the 10ms Ephemeral Rollup pipeline
  const streamPixel = useCallback(
    (x: number, y: number, color: string) => {
      const isVerified = authMode === 'live';
      const authorName = userAddress ? userAddress : (isVerified ? 'Verified Artist' : 'Guest Artist');
      const txHash = generateTxHash();

      const newPixel: Pixel = {
        x,
        y,
        color,
        author: authorName,
        timestamp: Date.now(),
        txHash,
        isERConfirmed: true,
        isVerified,
      };

      pendingPixelsRef.current.push(newPixel);

      // Instantly update local telemetry
      setTelemetry((prev) => ({
        ...prev,
        txCount: prev.txCount + 1,
        lastTxTime: Date.now(),
      }));

      // Add to live activity feed
      const activity: ActivityItem = {
        id: txHash.slice(0, 10),
        x,
        y,
        color,
        author: authorName,
        timestamp: Date.now(),
        isVerified,
      };

      setActivities((prev) => [activity, ...prev.slice(0, 29)]);
    },
    [userAddress, authMode]
  );

  // Commit canvas state to Solana L1
  const commitToSolanaL1 = useCallback(async (allPixels: Pixel[]) => {
    setIsCommitting(true);
    setTelemetry((prev) => ({ ...prev, status: 'committing' }));

    try {
      // Simulate cryptographic proof and commit transaction to Solana Layer 1
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const txHash = generateTxHash();
      const stateRoot = computeCanvasStateHash(allPixels);

      setTelemetry((prev) => ({
        ...prev,
        status: 'active',
        l1CommittedCount: prev.l1CommittedCount + 1,
        lastL1CommitHash: txHash,
      }));

      const result = {
        txHash,
        stateRoot,
        timestamp: Date.now(),
        pixelCount: allPixels.length,
      };

      setLastCommitResult(result);
      return result;
    } finally {
      setIsCommitting(false);
    }
  }, []);

  // Periodic mock peer strokes to showcase live multiplayer activity (subtle, non-disruptive)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.45) return; // occasional bursts

      const peer = MOCK_PEERS[Math.floor(Math.random() * MOCK_PEERS.length)];
      // Cluster near center
      const rx = Math.floor(64 + (Math.random() - 0.5) * 48);
      const ry = Math.floor(64 + (Math.random() - 0.5) * 48);

      const peerPixel: Pixel = {
        x: rx,
        y: ry,
        color: peer.color,
        author: peer.name,
        timestamp: Date.now(),
        isERConfirmed: true,
      };

      onRemotePixel?.(peerPixel);

      setTelemetry((prev) => ({
        ...prev,
        txCount: prev.txCount + 1,
        lastTxTime: Date.now(),
      }));

      setActivities((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          x: rx,
          y: ry,
          color: peer.color,
          author: peer.name,
          timestamp: Date.now(),
          isMock: true,
        },
        ...prev.slice(0, 29),
      ]);
    }, 1800);

    return () => clearInterval(interval);
  }, [onRemotePixel]);

  return {
    telemetry,
    activities,
    streamPixel,
    commitToSolanaL1,
    isCommitting,
    lastCommitResult,
    setLastCommitResult,
  };
}
