import React, { useState } from 'react';
import { X, Mail, Shield, Check, Sparkles, ArrowRight, Wallet, Lock } from 'lucide-react';
import { generateTxHash } from '../lib/magicblock';

interface PrivyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, method: string) => void;
}

export const PrivyWalletModal: React.FC<PrivyWalletModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedMethod, setConnectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectProvider = async (provider: string) => {
    setIsSubmitting(true);
    setConnectedMethod(provider);

    // Simulate Privy's lightning-fast embedded session key creation
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
        <div className="flex flex-col items-center text-center mb-5">
          <div className="h-11 w-11 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-3 shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg font-[var(--font-display)] text-zinc-900 tracking-tight">
            Connect to Pixora
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
            Embedded Web3 authentication powered by Privy & MagicBlock Session Keys.
          </p>
        </div>

        {/* Email Input */}
        <form onSubmit={handleEmailSubmit} className="mb-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full text-xs py-2.5 pl-3.5 pr-10 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!email || isSubmitting}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-30 flex items-center justify-center transition-all"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 my-3">
          <div className="h-px flex-1 bg-zinc-100" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">or continue with</span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        {/* Social Auth Providers */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Google */}
          <button
            onClick={() => handleSelectProvider('Google')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all shadow-sm"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={() => handleSelectProvider('Twitter')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all shadow-sm"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Twitter</span>
          </button>
        </div>

        {/* Solana Native Wallets */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
            Solana Wallets
          </p>

          <button
            onClick={() => handleSelectProvider('Phantom')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 text-xs font-semibold text-zinc-800 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-[#AB9FF2]/20 flex items-center justify-center text-[#534bb1]">
                👻
              </div>
              <span>Phantom</span>
            </div>
            <span className="text-[10px] text-brand-600 font-mono">Detected</span>
          </button>

          <button
            onClick={() => handleSelectProvider('Solflare')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 text-xs font-semibold text-zinc-800 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                ☀️
              </div>
              <span>Solflare</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Connect</span>
          </button>
        </div>

        {/* Privy Security Badge */}
        <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" />
            Zero-Gas Session Key
          </span>
          <span>Protected by Privy</span>
        </div>
      </div>
    </div>
  );
};
