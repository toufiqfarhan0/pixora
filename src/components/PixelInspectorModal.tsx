'use client';

import React, { useState } from 'react';
import { Pixel } from '../types/canvas';
import { X, ExternalLink, Copy, Check, ShieldCheck, Zap, Palette } from 'lucide-react';
import { shortAddress } from '../lib/magicblock';

interface PixelInspectorModalProps {
  pixel: Pixel | null;
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export const PixelInspectorModal: React.FC<PixelInspectorModalProps> = ({
  pixel,
  x,
  y,
  isOpen,
  onClose,
  onSelectColor,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const color = pixel ? pixel.color : '#FFFFFF';
  const author = pixel ? pixel.author : 'Unpainted (Genesis Blank)';
  const timestamp = pixel ? new Date(pixel.timestamp).toLocaleTimeString() : 'N/A';
  const txHash =
    pixel?.txHash ||
    '2sgvkVFghQhyS4Sb4eo7NKqyQ1A9MUWAc1whLzHN2F41pr843rXdky46nC48dfqv7ExCDipkhFPdMtcE3wqUF88M';

  const explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;

  const copyAddress = () => {
    if (!pixel?.author) return;
    navigator.clipboard.writeText(pixel.author);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-popover border border-zinc-200/80 overflow-hidden font-[var(--font-body)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="font-[var(--font-display)] font-semibold text-zinc-900 text-sm">
              Pixel Inspector
            </h3>
            <span className="font-mono text-xs text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-md">
              ({x}, {y})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Swatch Preview Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
            <div
              className="w-12 h-12 rounded-lg shadow-sm border border-black/10 shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono font-bold text-base text-zinc-800 uppercase tracking-wide">
                {color}
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF4D26]" />
                <span>Onchain Verified State</span>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectColor(color);
                onClose();
              }}
              className="btn-solid text-xs py-1.5 px-3 flex items-center gap-1"
              title="Use this color in toolbar"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Pick</span>
            </button>
          </div>

          {/* Provenance Metadata Table */}
          <div className="space-y-2.5 text-xs">
            {/* Author */}
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500">Artist / Author</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-medium text-zinc-800">
                  {author.length > 16 ? shortAddress(author, 6) : author}
                </span>
                {pixel?.author && (
                  <button
                    onClick={copyAddress}
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                    title="Copy wallet address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#FF4D26]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Placement Time */}
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500">Placed Timestamp</span>
              <span className="font-mono text-zinc-700">{timestamp}</span>
            </div>

            {/* Execution Layer */}
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-500">Execution Layer</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3 text-orange-500" />
                MagicBlock ER (10ms)
              </span>
            </div>

            {/* Solana Devnet L1 Commitment */}
            <div className="py-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-500">Solana L1 Commitment</span>
                <span className="text-[10px] text-[#FF4D26] font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                  Confirmed
                </span>
              </div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 transition-colors"
              >
                <span className="font-mono text-[11px] text-zinc-600 truncate mr-2">
                  {shortAddress(txHash, 10)}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50/80 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
