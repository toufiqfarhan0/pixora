'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Activity, Fuel, Shield, Cpu, ChevronUp, ExternalLink, X } from 'lucide-react';
import { ERTelemetry, Pixel } from '../types/canvas';
import { CANVAS_ACCOUNT_PUBKEY, shortAddress } from '../lib/magicblock';

interface TelemetryHUDProps {
  telemetry: ERTelemetry;
  hoveredPixel: { x: number; y: number; pixel?: Pixel } | null;
  loginMethod?: string | null;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, hoveredPixel, loginMethod }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hudRef = useRef<HTMLDivElement>(null);
  const gasSavedUsd = (telemetry.txCount * 0.002).toFixed(2);

  // Close HUD popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (hudRef.current && !hudRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={hudRef} className="absolute bottom-4 left-4 z-30 hidden md:flex flex-col items-start font-[var(--font-body)]">
      {/* Expanded Telemetry Popover Drawer */}
      {isOpen && (
        <div className="mb-2 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-popover border border-zinc-200/90 text-zinc-900 w-80 animate-fade-in text-xs font-[var(--font-mono)]">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-brand-600 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 font-[var(--font-display)]">
                MagicBlock Ephemeral Rollup
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF4D26] font-semibold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D26] pulse-indicator-brand shrink-0" />
                <span>10ms Live</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                title="Close Drawer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Metric Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Latency */}
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Zap className="h-3 w-3 text-brand-600" /> Block Time
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-zinc-900">10 ms</span>
                <span className="text-[10px] text-zinc-400 line-through">400ms L1</span>
              </div>
            </div>

            {/* Gas Fee */}
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Fuel className="h-3 w-3 text-[#FF4D26]" /> Gas Fee
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-[#FF4D26]">$0.00</span>
                <span suppressHydrationWarning className="text-[10px] text-zinc-400">(${gasSavedUsd} saved)</span>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Activity className="h-3 w-3 text-brand-600" /> Transactions
              </span>
              <span suppressHydrationWarning className="text-sm font-bold text-zinc-900 tabular-nums mt-0.5">
                {telemetry.txCount.toLocaleString()}
              </span>
            </div>

            {/* Account Delegation */}
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Shield className="h-3 w-3 text-purple-600" /> Canvas PDA
              </span>
              <span className="text-[11px] font-bold text-zinc-800 truncate mt-0.5" title={CANVAS_ACCOUNT_PUBKEY}>
                {shortAddress(CANVAS_ACCOUNT_PUBKEY, 4)}
              </span>
            </div>
          </div>

          {/* Router & Network info */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Cluster: Solana Devnet</span>
            <a
              href="https://explorer.solana.com/address/8TnYwxdZvPywRioeUkkWTwaynU7jRTfEvF2GJizBvk9A?cluster=devnet"
              target="_blank"
              rel="noreferrer"
              className="text-[#FF4D26] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>Explorer</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Docked Compact Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-auto self-start bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-subtle border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 flex items-center gap-2 text-xs font-[var(--font-mono)] transition-all hover:bg-zinc-50 shrink-0"
        title="Toggle MagicBlock ER Telemetry"
      >
        <Cpu className="h-3.5 w-3.5 text-brand-600 shrink-0" />
        <span className="font-bold text-[11px]">10ms ER</span>
        <span className="text-zinc-300">·</span>
        <span suppressHydrationWarning className="text-[#FF4D26] font-semibold text-[11px]">$0.00 Gas</span>
        <span className="text-zinc-300">·</span>
        <span suppressHydrationWarning className="text-zinc-500 text-[11px]">{telemetry.txCount.toLocaleString()} txs</span>
        <ChevronUp
          className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-zinc-700' : ''
          }`}
        />
      </button>
    </div>
  );
};
