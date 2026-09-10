import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Radio, Sparkles, CheckCircle2, Shield, User } from 'lucide-react';
import { ActivityItem, AuthMode } from '../types/canvas';
import { shortAddress } from '../lib/magicblock';

interface ActivitySidebarProps {
  activities: ActivityItem[];
  totalPixels: number;
  userAddress?: string | null;
  authMode?: AuthMode;
  loginMethod?: string | null;
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  activities,
  totalPixels,
  userAddress,
  authMode = 'live',
  loginMethod,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Count user's personal pixels in recent activity
  const userRecentPixels = activities.filter(
    (a) => a.author === userAddress || (authMode === 'live' && a.isVerified && !a.isMock)
  ).length;

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
            <Radio className="h-3.5 w-3.5 text-[#FF4D26] pulse-indicator-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              10ms ER Stream
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-semibold">
            {totalPixels.toLocaleString()} onchain
          </span>
        </div>

        {/* Active Artist Profile Card */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            authMode === 'live'
              ? 'bg-orange-50/70 border-orange-200/80 text-orange-950 shadow-2xs'
              : 'bg-zinc-50 border-zinc-200/70 text-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Your Artist Profile
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                authMode === 'live'
                  ? 'bg-orange-100/90 text-[#FF4D26] border border-orange-300/50'
                  : 'bg-zinc-200/70 text-zinc-600'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-[#FF4D26]" />
              <span>MetaMask Verified</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-[var(--font-mono)]">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <span className="font-semibold text-zinc-900" title={userAddress || ''}>
                {userAddress ? shortAddress(userAddress, 4) : 'MetaMask'}
              </span>
              <span className="text-[9px] text-[#FF4D26] bg-white/90 px-1.5 py-0.2 rounded border border-orange-200/60 font-sans font-medium">
                MetaMask
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-sans">
              Signed Onchain
            </span>
          </div>
        </div>

        {/* Live Pixel Placements Stream */}
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 max-h-72">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-[var(--font-mono)]">
            Live Stream
          </span>
          {activities.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center font-mono leading-relaxed">
              No recent activity
              <span className="text-[11px] text-zinc-400/80 mt-1 block font-sans">
                Connect MetaMask to paint live
              </span>
            </p>
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
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-zinc-800 truncate max-w-[100px]" title={act.author}>
                        {shortAddress(act.author, 3)}
                      </span>
                      {act.isVerified && (
                        <span className="inline-flex items-center text-[9px] font-bold text-[#FF4D26] bg-orange-50 px-1 rounded">
                          Live ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      ({act.x}, {act.y})
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-brand-600 font-bold block">10ms</span>
                  <span className="text-[9px] text-zinc-400 font-sans">confirmed</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>MagicBlock ER</span>
          <span className="text-[#FF4D26] font-bold">Gas: $0.00</span>
        </div>
      </div>
    </aside>
  );
};
