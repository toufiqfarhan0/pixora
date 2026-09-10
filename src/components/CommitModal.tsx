import React, { useState } from 'react';
import { X, CheckCircle2, Layers, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Pixel, AuthMode } from '../types/canvas';
import { computeCanvasStateHash, shortAddress } from '../lib/magicblock';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixels: Pixel[];
  onCommit: (allPixels: Pixel[]) => Promise<{
    txHash: string;
    stateRoot: string;
    timestamp: number;
    pixelCount: number;
  }>;
  isCommitting: boolean;
  lastCommitResult: {
    txHash: string;
    stateRoot: string;
    timestamp: number;
    pixelCount: number;
  } | null;
  authMode?: AuthMode;
  onOpenPrivyModal?: () => void;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  pixels,
  onCommit,
  isCommitting,
  lastCommitResult,
  authMode = 'live',
  onOpenPrivyModal,
}) => {
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTriggerCommit = async () => {
    const result = await onCommit(pixels);
    if (result) {
      setSuccess(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4D26', '#4F46E5', '#EC4899', '#F59E0B', '#A855F7'],
      });
    }
  };

  const stateHash = computeCanvasStateHash(pixels);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-[var(--font-body)]">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl border border-zinc-200 shadow-popover relative text-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-full hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 font-[var(--font-display)]">
              Commit Canvas to Solana L1
            </h3>
            <p className="text-xs text-zinc-500 font-[var(--font-mono)]">
              MagicBlock Ephemeral Rollup ➔ Solana Base Layer
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="py-5 flex flex-col gap-4 font-[var(--font-mono)] text-xs">
          <p className="text-zinc-600 font-[var(--font-body)] text-sm leading-relaxed">
            While drawing, strokes were processed at <strong>10ms with zero gas</strong> on MagicBlock's Ephemeral Rollup. Committing seals the entire collaborative state permanently into the Solana blockchain ledger.
          </p>

          {/* Live Notice */}
          {!success && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center gap-2 text-xs text-orange-800 font-sans">
              <span className="h-2 w-2 rounded-full bg-[#FF4D26] shrink-0" />
              <span>
                <strong>Solana L1 Settlement:</strong> This commit will be signed and sealed into Solana L1.
              </span>
            </div>
          )}

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Active Pixels</span>
              <p className="text-lg font-bold text-zinc-900 mt-0.5">{pixels.length.toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Gas Saved on ER</span>
              <p className="text-lg font-bold text-[#FF4D26] mt-0.5">
                ${(pixels.length * 0.002).toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Cryptographic State Hash */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Canvas State Root Hash</span>
            <p className="text-[11px] text-brand-600 break-all font-mono">
              {lastCommitResult ? lastCommitResult.stateRoot : stateHash}
            </p>
          </div>

          {/* Success Proof Banner */}
          {success && lastCommitResult && (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-[#FF4D26] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 min-w-0 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 text-sm font-[var(--font-display)]">
                    Successfully Committed to Solana L1!
                  </span>
                  <span className="text-[10px] font-mono text-[#FF4D26] bg-orange-100/80 px-2 py-0.5 rounded-full font-bold">
                    Devnet Confirmed
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  Receipt: {shortAddress(lastCommitResult.txHash, 8)}
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${lastCommitResult.txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#FF4D26] font-semibold hover:underline mt-0.5"
                >
                  View on Solana Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
          <button onClick={onClose} className="btn-outline text-xs">
            Close
          </button>
          {!success ? (
            <button
              onClick={handleTriggerCommit}
              disabled={isCommitting}
              className="btn-solid text-xs py-2 px-4"
            >
              {isCommitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Committing State…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-white/80" />
                  <span>Confirm L1 Commit</span>
                </>
              )}
            </button>
          ) : (
            <button onClick={onClose} className="btn-solid text-xs py-2 px-4">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
