import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Radio,
  Trophy,
  Activity,
  Flame,
  User,
  Crown,
  Sparkles,
} from 'lucide-react';
import { ActivityItem, AuthMode, Pixel } from '../types/canvas';
import { shortAddress } from '../lib/magicblock';

interface ActivitySidebarProps {
  activities: ActivityItem[];
  totalPixels: number;
  userAddress?: string | null;
  authMode?: AuthMode;
  loginMethod?: string | null;
  pixels?: Pixel[];
}

interface LeaderboardEntry {
  author: string;
  count: number;
  percent: string;
  color: string;
  isCurrentUser: boolean;
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  activities,
  totalPixels,
  userAddress,
  authMode = 'live',
  loginMethod,
  pixels = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'leaderboard'>('stream');

  // Compute live session leaderboard from current onchain canvas state (only when leaderboard tab is active)
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    if (activeTab !== 'leaderboard') return [];
    const counts = new Map<string, { count: number; color: string }>();

    // Aggregate from full pixel state if available, else from activities
    const sourceList = pixels.length > 0 ? pixels : activities;

    sourceList.forEach((p) => {
      const author = p.author || 'Solana Painter';
      const existing = counts.get(author);
      if (existing) {
        existing.count += 1;
        existing.color = p.color || existing.color;
      } else {
        counts.set(author, { count: 1, color: p.color || '#FF4D26' });
      }
    });

    const total = Math.max(sourceList.length, 1);

    return Array.from(counts.entries())
      .map(([author, data]) => ({
        author,
        count: data.count,
        percent: ((data.count / total) * 100).toFixed(1),
        color: data.color,
        isCurrentUser: !!(userAddress && (author === userAddress || author === 'Me')),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [activeTab, pixels, activities, userAddress]);

  // Merge live stream activities with canvas pixels so past strokes (e.g. black, orange, cyan)
  // remain preserved and visible in the 10MS ER ENGINE feed
  const displayActivities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [...activities];
    const seen = new Set(activities.map((a) => `${a.x},${a.y}`));

    // Backfill from placed canvas pixels if activities has room (newest first, bound to recent 120)
    if (pixels && pixels.length > 0) {
      const sliceStart = Math.max(0, pixels.length - 120);
      for (let i = pixels.length - 1; i >= sliceStart && list.length < 80; i--) {
        const p = pixels[i];
        const key = `${p.x},${p.y}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            id: p.txHash?.slice(0, 10) || `px-${p.x}-${p.y}-${p.timestamp || i}`,
            x: p.x,
            y: p.y,
            color: p.color,
            author: p.author || userAddress || 'Solana Painter',
            timestamp: p.timestamp || Date.now(),
            isVerified: true,
          });
        }
      }
    }

    return list.slice(0, 80);
  }, [activities, pixels, userAddress]);

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
        title={isCollapsed ? 'Show Activity & Leaderboard' : 'Hide Activity & Leaderboard'}
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
              10ms ER Engine
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-semibold">
            {totalPixels.toLocaleString()} onchain
          </span>
        </div>

        {/* Tab Switcher: Live Stream vs Leaderboard */}
        <div className="flex p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60 text-xs font-[var(--font-mono)]">
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] font-semibold ${
              activeTab === 'stream'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Activity className="h-3 w-3 text-[#FF4D26]" />
            <span>Live Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] font-semibold ${
              activeTab === 'leaderboard'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Active Artist Profile Card */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            userAddress
              ? 'bg-orange-50/70 border-orange-200/80 text-orange-950 shadow-2xs'
              : 'bg-zinc-50 border-zinc-200/70 text-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              {userAddress ? 'Your Artist Profile' : 'Spectator Mode'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                userAddress
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${userAddress ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <span>{userAddress ? 'Active' : 'Viewing Live'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-[var(--font-mono)]">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <span className="font-semibold text-zinc-900" title={userAddress || ''}>
                {userAddress ? shortAddress(userAddress, 4) : 'Spectator'}
              </span>
              <span className="text-[9px] text-[#FF4D26] bg-white/90 px-1.5 py-0.2 rounded border border-orange-200/60 font-sans font-medium">
                {userAddress ? (loginMethod || 'Solana') : 'Watch Only'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-sans">
              {userAddress ? 'Signed Onchain' : 'Auth to Draw'}
            </span>
          </div>
        </div>

        {/* Tab 1: Live Pixel Placements Stream */}
        {activeTab === 'stream' && (
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 max-h-72">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-[var(--font-mono)]">
              <span>Live Placements</span>
              <span>{displayActivities.length} recent</span>
            </div>
            {displayActivities.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center font-mono leading-relaxed">
                No recent activity
                <span className="text-[11px] text-zinc-400/80 mt-1 block font-sans">
                  Connect wallet to paint live
                </span>
              </p>
            ) : (
              displayActivities.map((act, idx) => {
                const isErase =
                  !act.color ||
                  act.color.toLowerCase() === '#ffffff' ||
                  act.color.toLowerCase() === '#fff';

                return (
                  <div
                    key={`${act.id}-${act.x}-${act.y}-${idx}`}
                    className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs font-[var(--font-mono)] animate-fade-in hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-4 w-4 rounded-md shrink-0 border border-zinc-300 shadow-2xs relative overflow-hidden"
                        style={{
                          backgroundColor: act.color || '#FFFFFF',
                          backgroundImage: isErase
                            ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)'
                            : undefined,
                          backgroundSize: '8px 8px',
                        }}
                        title={isErase ? 'Erased' : act.color}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-900 truncate max-w-[90px]" title={act.author}>
                            {shortAddress(act.author, 3)}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 font-medium">
                            {isErase ? 'erased' : act.color}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ({act.x}, {act.y})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#FF4D26] font-bold block">10ms</span>
                      <span className="text-[9px] text-zinc-400 font-sans">confirmed</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Session Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 max-h-72">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-[var(--font-mono)] flex items-center justify-between">
              <span>Top Contributors</span>
              <span>Pixels (%)</span>
            </span>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center font-mono leading-relaxed">
                No contributors yet
                <span className="text-[11px] text-zinc-400/80 mt-1 block font-sans">
                  Be the first to claim the top spot!
                </span>
              </p>
            ) : (
              leaderboard.map((entry, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={entry.author}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs font-[var(--font-mono)] transition-all ${
                      entry.isCurrentUser
                        ? 'bg-orange-50/80 border-[#FF4D26]/40 shadow-2xs ring-1 ring-[#FF4D26]/20'
                        : isTop1
                        ? 'bg-amber-50/70 border-amber-200/80'
                        : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Rank indicator */}
                      <span className="w-5 text-center font-bold text-xs shrink-0 font-mono">
                        {isTop1 ? (
                          <span className="text-amber-500 font-black">#1</span>
                        ) : isTop2 ? (
                          <span className="text-slate-500 font-black">#2</span>
                        ) : isTop3 ? (
                          <span className="text-amber-700 font-black">#3</span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">#{index + 1}</span>
                        )}
                      </span>

                      {/* Artist Color Swatch */}
                      <div
                        className="h-3.5 w-3.5 rounded-sm shrink-0 border border-black/10 shadow-2xs"
                        style={{ backgroundColor: entry.color }}
                        title={`Last color: ${entry.color}`}
                      />

                      {/* Artist Name */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-semibold truncate max-w-[100px] ${
                              entry.isCurrentUser ? 'text-[#FF4D26]' : 'text-zinc-900'
                            }`}
                            title={entry.author}
                          >
                            {entry.isCurrentUser ? 'You' : shortAddress(entry.author, 4)}
                          </span>
                          {isTop1 && <Crown className="h-3 w-3 text-amber-500 shrink-0" />}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-zinc-900 font-mono text-xs block">
                        {entry.count}{' '}
                        <span className="text-[10px] text-zinc-400 font-normal">px</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {entry.percent}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>MagicBlock ER</span>
          <span className="text-[#FF4D26] font-bold">Gas: $0.00</span>
        </div>
      </div>
    </aside>
  );
};
