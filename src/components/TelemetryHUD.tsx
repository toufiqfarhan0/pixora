import React, { useState } from 'react';
import { Zap, Activity, Fuel, Shield, Cpu, Timer, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ERTelemetry, Pixel } from '../types/canvas';
import { CANVAS_ACCOUNT_PUBKEY, shortAddress } from '../lib/magicblock';

interface TelemetryHUDProps {
  telemetry: ERTelemetry;
  hoveredPixel: { x: number; y: number; pixel?: Pixel } | null;
  loginMethod?: string | null;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, hoveredPixel, loginMethod }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const gasSavedUsd = (telemetry.txCount * 0.002).toFixed(2);

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-20 hidden md:flex font-[var(--font-body)] animate-fade-in">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-subtle border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 flex items-center gap-2 text-xs font-[var(--font-mono)] transition-all hover:scale-105"
          title="Expand MagicBlock Telemetry HUD"
        >
          <Cpu className="h-3.5 w-3.5 text-brand-600" />
          <span className="font-bold text-[11px]">ER Telemetry</span>
          <span className="flex items-center gap-1 text-[10px] text-[#FF4D26] font-semibold bg-orange-50 px-1.5 py-0.2 rounded-full border border-orange-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D26] animate-pulse" />
            10ms
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-20 hidden md:flex flex-col gap-2 max-w-sm font-[var(--font-body)]">
      {/* Live Telemetry Card */}
      <div className="bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-popover border border-zinc-200/80 text-zinc-900 animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-[var(--font-mono)]">
              MagicBlock Ephemeral Rollup
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF4D26] font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D26] pulse-indicator-brand" />
              10ms LIVE
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Minimize Telemetry HUD"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Metric grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-[var(--font-mono)]">
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

          {/* Gas Saved */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Fuel className="h-3 w-3 text-[#FF4D26]" /> Gas Fee
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-[#FF4D26]">$0.00</span>
              <span className="text-[10px] text-zinc-400">(${gasSavedUsd} saved)</span>
            </div>
          </div>

          {/* Transactions processed */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Activity className="h-3 w-3 text-brand-600" /> ER Transactions
            </span>
            <span className="text-sm font-bold text-zinc-900 tabular-nums mt-0.5">
              {telemetry.txCount.toLocaleString()}
            </span>
          </div>

          {/* L1 Delegation */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Shield className="h-3 w-3 text-purple-600" /> Canvas PDA
            </span>
            <span className="text-[11px] font-bold text-zinc-700 truncate mt-0.5">
              {shortAddress(CANVAS_ACCOUNT_PUBKEY, 4)}
            </span>
          </div>
        </div>

        {/* Session Mode Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-500">Session:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {loginMethod ? `${loginMethod} Active` : 'Solana ER'}
          </span>
        </div>

        {/* L1 Auto-Settle Countdown */}
        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-500 flex items-center gap-1">
            <Timer className="h-3 w-3 text-amber-500" />
            <span>L1 Auto-Settle:</span>
          </span>
          <span className="font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
            {telemetry.secondsUntilNextSettle ?? 60}s
          </span>
        </div>

        {/* Last L1 Commit Receipt */}
        {telemetry.lastL1CommitHash && telemetry.lastL1CommitHash !== 'None yet' && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">L1 Receipt:</span>
            <a
              href={`https://explorer.solana.com/tx/${telemetry.lastL1CommitHash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4D26] hover:underline flex items-center gap-1 font-semibold"
              title="View on Solana Explorer"
            >
              <span>{shortAddress(telemetry.lastL1CommitHash, 4)}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        )}

        {/* Hovered Pixel Inspector */}
        {hoveredPixel && (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-md border border-zinc-200 shadow-sm"
                style={{ backgroundColor: hoveredPixel.pixel?.color || '#FFFFFF' }}
              />
              <span className="text-zinc-600">
                X: <strong className="text-zinc-900">{hoveredPixel.x}</strong> Y: <strong className="text-zinc-900">{hoveredPixel.y}</strong>
              </span>
            </div>
            <span className="text-zinc-400">
              {hoveredPixel.pixel ? shortAddress(hoveredPixel.pixel.author, 3) : 'Empty'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
