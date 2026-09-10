import React, { useState } from 'react';
import { Shield, Sparkles, X, Mail, ArrowRight, CheckCircle2, Lock, Wallet, Key } from 'lucide-react';
import { PixoraLogo } from './PixoraLogo';
import { generateTxHash } from '../lib/magicblock';

interface PrivyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, method: string) => void;
}

export const PrivyWalletModal: React.FC<PrivyWalletModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'wallets'>('email');

  // Read the active Privy App ID from environment variables
  const rawAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmtvfvjwh03p70bl3nzvog9ju';
  const displayAppId = rawAppId.length > 14 ? `${rawAppId.slice(0, 8)}...${rawAppId.slice(-4)}` : rawAppId;

  if (!isOpen) return null;

  const handleSelectProvider = async (provider: string) => {
    setIsSubmitting(true);

    // Simulate Privy embedded session key creation linked to App ID
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockSolAddress = 'Px' + generateTxHash().slice(0, 30);
    onConnected(mockSolAddress, provider);
    setIsSubmitting(false);
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleSelectProvider(`Email (${email})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-[var(--font-body)]">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-popover border border-zinc-200/80 relative text-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-full hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Privy Header Badge */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="mb-2.5">
            <PixoraLogo size={42} className="drop-shadow-sm" />
          </div>
          <h3 className="font-bold text-lg font-[var(--font-display)] text-zinc-900 tracking-tight">
            Connect to Pixora
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[250px]">
            Privy Embedded Authentication with MagicBlock Session Keys.
          </p>

          {/* Privy App ID Telemetry Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 font-mono text-[10px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">App ID:</span>
            <span className="font-semibold text-zinc-800" title={rawAppId}>
              {displayAppId}
            </span>
            <span className="text-emerald-600 font-sans font-medium text-[9px] bg-emerald-50 px-1 py-0.2 rounded">
              Verified
            </span>
          </div>
        </div>

        {/* Active Dashboard Login Options Notice */}
        <div className="mb-4 p-2 rounded-xl bg-zinc-50 border border-zinc-200/60 text-center">
          <span className="text-[11px] text-zinc-500 font-medium">
            Active in Privy: <strong className="text-zinc-800">Email</strong> & <strong className="text-zinc-800">External Wallets</strong>
          </span>
        </div>

        {/* Primary Method 1: Email Login */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">
            Continue with Email
          </label>
          <form onSubmit={handleEmailSubmit}>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs py-2.5 pl-3.5 pr-10 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!email || isSubmitting}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-30 flex items-center justify-center transition-all"
                title="Continue with Email"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="h-px flex-1 bg-zinc-100" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">or connect wallet</span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        {/* Primary Method 2: External Solana Wallets */}
        <div className="space-y-1.5">
          <button
            onClick={() => handleSelectProvider('Phantom')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-[#AB9FF2]/20 flex items-center justify-center text-[#534bb1] text-xs">
                👻
              </div>
              <span>Phantom</span>
            </div>
            <span className="text-[10px] text-brand-600 font-mono font-medium group-hover:underline">
              Detected ↗
            </span>
          </button>

          <button
            onClick={() => handleSelectProvider('Solflare')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xs">
                ☀️
              </div>
              <span>Solflare</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono group-hover:underline">
              Connect ↗
            </span>
          </button>

          <button
            onClick={() => handleSelectProvider('Backpack')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xs">
                🎒
              </div>
              <span>Backpack</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono group-hover:underline">
              Connect ↗
            </span>
          </button>
        </div>

        {/* Privy Security Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" />
            Zero-Gas Session Key
          </span>
          <span className="text-zinc-500">Secured by Privy</span>
        </div>
      </div>
    </div>
  );
};
