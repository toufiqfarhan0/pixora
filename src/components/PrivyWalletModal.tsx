import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface PrivyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, method: string) => void;
}

// Crisp SVG for MetaMask
const MetaMaskIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg className={className} viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E2761B" stroke="#E2761B" strokeMiterlimit="10" d="m274.1 35.5-99.5 73.9L194 65.4z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m44.4 35.5 98.7 74.6-18.7-44.7z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m238.3 206.8-28.5 43.1 56.8 15.6 16.3-58.3zm-174.4.4 16.2 58 56.8-15.6-28.5-43.2z" />
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeMiterlimit="10" d="m80.3 265.2 56.6-15.6-20.6-23.7z" />
    <path fill="#233447" stroke="#233447" strokeMiterlimit="10" d="m107.1 206.5 29.8 19.4-20.6-23.7z" />
    <path fill="#CD6116" stroke="#CD6116" strokeMiterlimit="10" d="m80.3 265.2 26.8-58.7-26.8-17.7z" />
    <path fill="#E4751F" stroke="#E4751F" strokeMiterlimit="10" d="m80.3 188.8 26.8 17.7 29.8 19.4-1.1-23.5z" />
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="m135.8 202.4 1.1 23.5 22.4 15.6 22.4-15.6 1.1-23.5z" />
    <path fill="#CD6116" stroke="#CD6116" strokeMiterlimit="10" d="m238.3 188.8-26.8 17.7 26.8 58.7z" />
    <path fill="#233447" stroke="#233447" strokeMiterlimit="10" d="m211.5 206.5-20.6 23.7 29.8-19.4z" />
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeMiterlimit="10" d="m181.7 249.6 56.6 15.6-36-39.3z" />
    <path fill="#E4751F" stroke="#E4751F" strokeMiterlimit="10" d="m238.3 188.8-26.8 17.7-29.8 19.4 1.1-23.5z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m174.6 109.4 19.4-44-59.3 2.2 20.4 41.8z" />
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="m194 65.4-19.4 44 80.8-26.2z" />
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="m63.2 83.2 80.8 26.2-19.4-44z" />
  </svg>
);

export const PrivyWalletModal: React.FC<PrivyWalletModalProps> = ({ isOpen, onClose, onConnected }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Dynamic detection of MetaMask
  const [isMetaMaskDetected, setIsMetaMaskDetected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMetaMask = () => {
      const w = window as any;
      setIsMetaMaskDetected(Boolean(w.ethereum?.isMetaMask));
    };

    checkMetaMask();
    const timer = setTimeout(checkMetaMask, 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMetaMask = async () => {
    setStatusNotice(null);
    setIsSubmitting(true);
    const w = window as any;

    try {
      if (!w.ethereum?.request) {
        setStatusNotice('MetaMask extension not found. Opening download page...');
        window.open('https://metamask.io/download/', '_blank');
        setIsSubmitting(false);
        return;
      }

      const accounts = await w.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        onConnected(accounts[0], 'MetaMask');
        setIsSubmitting(false);
        onClose();
      } else {
        setStatusNotice('No MetaMask account was selected.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.warn('MetaMask connection rejected:', err);
      setStatusNotice(err?.message || 'MetaMask connection was closed or cancelled.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in font-[var(--font-body)]">
      <div className="bg-white text-zinc-900 rounded-2xl w-full max-w-[340px] p-6 shadow-2xl border border-zinc-200/90 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors p-1.5 rounded-full hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center pt-1 pb-6">
          <h3 className="font-semibold text-lg text-zinc-900 tracking-tight">
            Log in or sign up
          </h3>
        </div>

        {/* Error / Status Notice */}
        {statusNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Only MetaMask Button (Exact Match to Privy UI) */}
        <div className="space-y-2.5">
          <button
            onClick={handleSelectMetaMask}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-300 bg-white hover:bg-zinc-50/90 transition-all text-sm font-medium text-zinc-900 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <MetaMaskIcon className="h-6 w-6" />
                {isMetaMaskDetected && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[15px] font-medium text-zinc-800">MetaMask</span>
            </div>
            {isMetaMaskDetected && (
              <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-600">
                Detected
              </span>
            )}
          </button>
        </div>

        {/* Authentic Privy Footer (Light Mode) */}
        <div className="mt-8 pt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-400 select-none">
          <span>Protected by</span>
          <span className="inline-flex items-center gap-1 text-zinc-700 font-semibold tracking-tight">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 inline-block" />
            <span className="tracking-tighter font-sans">privy</span>
          </span>
        </div>
      </div>
    </div>
  );
};
