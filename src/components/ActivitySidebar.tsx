import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Radio, Sparkles } from 'lucide-react';
import { ActivityItem } from '../types/canvas';
import { shortAddress } from '../lib/magicblock';

interface ActivitySidebarProps {
  activities: ActivityItem[];
  totalPixels: number;
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ activities, totalPixels }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-16 right-4 z-20 transition-all duration-300 font-[var(--font-body)] ${
        isCollapsed ? 'translate-x-[calc(100%+1rem)]' : 'translate-x-0'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-8 top-3 h-7 w-7 rounded-l-xl bg-white border-l border-t border-b border-zinc-200/80 text-zinc-500 hover:text-zinc-900 shadow-sm flex items-center justify-center backdrop-blur-md"
        title={isCollapsed ? 'Show Activity Feed' : 'Hide Activity Feed'}
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-xl w-72 p-4 rounded-2xl shadow-popover border border-zinc-200/80 flex flex-col gap-3 max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-1.5 font-[var(--font-mono)]">
            <Radio className="h-3.5 w-3.5 text-emerald-500 pulse-indicator-mint" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              10ms ER Stream
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-semibold">
            {totalPixels.toLocaleString()} onchain
          </span>
        </div>

        {/* Live Pixel Placements */}
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 max-h-80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-[var(--font-mono)]">
            Live Stream
          </span>
          {activities.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No recent activity</p>
          ) : (
            activities.slice(0, 8).map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs font-[var(--font-mono)] animate-fade-in hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3.5 w-3.5 rounded-md shrink-0 border border-black/10 shadow-xs"
                    style={{ backgroundColor: act.color }}
                  />
                  <span className="truncate text-zinc-700 text-[11px] font-medium">
                    {shortAddress(act.author, 3)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 shrink-0">
                  <MapPin className="h-2.5 w-2.5 text-brand-600" />
                  <span>
                    ({act.x}, {act.y})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mini About Banner */}
        <div className="mt-auto pt-2 border-t border-zinc-100">
          <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-700 font-[var(--font-display)]">
              <Sparkles className="h-3 w-3 text-brand-600" />
              <span>Solana Blitz v8 Entry</span>
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-sans">
              Powered by MagicBlock Ephemeral Rollups: zero-gas state commits with 10ms finality.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
