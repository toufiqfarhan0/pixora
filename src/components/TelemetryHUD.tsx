import React from 'react';
import { Zap, Activity, Fuel, Shield, Cpu } from 'lucide-react';
import { ERTelemetry, Pixel } from '../types/canvas';
import { CANVAS_ACCOUNT_PUBKEY, shortAddress } from '../lib/magicblock';

interface TelemetryHUDProps {
  telemetry: ERTelemetry;
  hoveredPixel: { x: number; y: number; pixel?: Pixel } | null;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, hoveredPixel }) => {
  const gasSavedUsd = (telemetry.txCount * 0.002).toFixed(2);

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
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-indicator-mint" />
            10ms LIVE
          </span>
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
              <Fuel className="h-3 w-3 text-emerald-600" /> Gas Fee
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-emerald-600">$0.00</span>
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
