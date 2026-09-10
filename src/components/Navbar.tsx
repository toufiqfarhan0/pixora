import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowLeft,
  ChevronDown,
  Copy,
  Check,
  LogOut,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { shortAddress } from '../lib/magicblock';
import { AuthMode } from '../types/canvas';
import { PixoraLogo } from './PixoraLogo';

interface NavbarProps {
  currentView: 'landing' | 'canvas' | 'how-it-works';
  onNavigate: (view: 'landing' | 'canvas' | 'how-it-works') => void;
  onOpenCommit: () => void;
  onOpenWalletModal: () => void;
  onDisconnect?: () => void;
  userAddress: string | null;
  loginMethod?: string | null;
  authMode: AuthMode;
  isCommitting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCommit,
  onOpenWalletModal,
  onDisconnect,
  userAddress,
  loginMethod,
  authMode,
  isCommitting,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleCopy = () => {
    if (!userAddress) return;
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-[var(--font-body)]">
      {/* Brand & Stage badge */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity group"
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
        {authMode === 'live' && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 font-[var(--font-mono)] text-[11px]">
            <span className="h-2 w-2 rounded-full bg-brand pulse-indicator-brand" />
            <span className="text-brand-700 font-semibold">MetaMask</span>
            <span className="text-zinc-300">·</span>
            <span className="text-brand-600 font-bold">Verified</span>
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

        {/* Privy Wallet / Auth Button & Dropdown */}
        {userAddress ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="group flex h-9 min-w-[128px] items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 font-mono text-xs font-semibold leading-none text-zinc-800 transition-colors hover:border-orange-400 hover:bg-orange-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 shadow-2xs"
              title="Click to manage connected wallet"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4D26] animate-pulse shrink-0" />
              <span className="flex-1 text-left">
                {userAddress.length > 10
                  ? `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}`
                  : userAddress}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-700 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Connected User Dropdown Popover (Exact BlitzMine Reference) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[270px] rounded-xl border border-zinc-200/90 bg-white/95 p-2 shadow-popover backdrop-blur-xl z-50 animate-fade-in text-zinc-900">
                <div className="px-2.5 pb-2 pt-1.5">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Connected
                  </span>
                  <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-zinc-800 select-all">
                    {userAddress}
                  </p>
                </div>

                <div className="h-px bg-zinc-100 my-1" />

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-mono text-xs text-zinc-700 hover:bg-zinc-100/70 transition-colors text-left"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#FF4D26]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy address'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onDisconnect) onDisconnect();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-mono text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenWalletModal}
            className="flex h-9 items-center gap-2 rounded-full border border-[#FF4D26] bg-[#FF4D26] px-4 font-mono text-xs font-bold text-white shadow-sm hover:bg-[#E83E16] transition-all active:scale-[0.98]"
          >
            <Wallet className="h-3.5 w-3.5 text-white/90" />
            <span>Connect MetaMask</span>
          </button>
        )}
      </div>
    </header>
  );
};
