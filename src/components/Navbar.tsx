import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, Cpu, ArrowLeft } from 'lucide-react';
import { shortAddress } from '../lib/magicblock';
import { AuthMode } from '../types/canvas';
import { PixoraLogo } from './PixoraLogo';

interface NavbarProps {
  currentView: 'landing' | 'canvas' | 'how-it-works';
  onNavigate: (view: 'landing' | 'canvas' | 'how-it-works') => void;
  onOpenCommit: () => void;
  onOpenWalletModal: () => void;
  userAddress: string | null;
  authMode: AuthMode;
  isCommitting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCommit,
  onOpenWalletModal,
  userAddress,
  authMode,
  isCommitting,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-[var(--font-body)]">
      {/* Brand & Stage badge */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity"
        >
          {/* Official QuiverAI Isometric Brand Mark */}
          <PixoraLogo size={32} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="font-bold text-base tracking-tight font-[var(--font-display)] text-zinc-900">
            Pixora
          </span>
        </button>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-[var(--font-display)]">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              currentView === 'landing'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('canvas')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              currentView === 'canvas'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            Live Canvas
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              currentView === 'how-it-works'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            How It Works
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mode Status Pill */}
        {authMode === 'live' ? (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-[var(--font-mono)] text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-indicator-mint" />
            <span className="text-emerald-700 font-semibold">Live Mode</span>
            <span className="text-zinc-300">·</span>
            <span className="text-emerald-600 font-bold">Privy Verified</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 font-[var(--font-mono)] text-[11px]">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-amber-800 font-semibold">Guest Mode</span>
            <span className="text-zinc-300">·</span>
            <span className="text-zinc-500">10ms Free</span>
          </div>
        )}

        {/* Commit to L1 button (visible when on canvas) */}
        {currentView === 'canvas' && (
          <button
            onClick={onOpenCommit}
            disabled={isCommitting}
            className="btn-solid flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg"
            title="Commit current canvas state to Solana L1"
          >
            {isCommitting ? (
              <>
                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Committing…</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 text-white/90" />
                <span>Commit to L1</span>
              </>
            )}
          </button>
        )}

        {/* Privy Wallet / Auth Button */}
        {authMode === 'live' ? (
          <button
            onClick={onOpenWalletModal}
            className="btn-outline flex items-center gap-1.5 py-1.5 px-3 text-xs rounded-lg border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-900"
            title="Authenticated via Privy - click to view or switch"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-mono font-semibold">
              {userAddress ? shortAddress(userAddress) : 'Verified Artist'}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenWalletModal}
            className="btn-solid flex items-center gap-1.5 py-1.5 px-3 text-xs rounded-lg shadow-sm"
            title="Upgrade to Live Mode with Privy"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            <span>Go Live with Privy</span>
          </button>
        )}
      </div>
    </header>
  );
};
