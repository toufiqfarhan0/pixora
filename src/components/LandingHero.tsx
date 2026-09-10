import React, { useState } from 'react';
import {
  Zap,
  Layers,
  Fuel,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Cpu,
  MousePointer,
} from 'lucide-react';

interface LandingHeroProps {
  onLaunchCanvas: () => void;
  onOpenHowItWorks: () => void;
  onOpenWalletModal: () => void;
  userAddress: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchCanvas,
  onOpenHowItWorks,
  onOpenWalletModal,
  userAddress,
}) => {
  // Mini interactive teaser canvas in hero
  const [miniColors, setMiniColors] = useState<{ [key: string]: string }>({
    '7,7': '#FF4D26',
    '7,8': '#FF4D26',
    '8,7': '#FF4D26',
    '8,8': '#10B981',
    '6,6': '#4F46E5',
    '9,9': '#4F46E5',
  });
  const [activeTeaserColor, setActiveTeaserColor] = useState('#FF4D26');

  const handleTeaserClick = (x: number, y: number) => {
    setMiniColors((prev) => ({
      ...prev,
      [`${x},${y}`]: activeTeaserColor,
    }));
  };

  return (
    <div className="w-full bg-[var(--bg-page)] text-zinc-900 font-[var(--font-body)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 sm:px-12 max-w-7xl mx-auto light-dot-grid">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-brand-600 pulse-indicator-mint" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              Solana Blitz v8 · Graveyard Resurrection #1
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-[var(--font-display)] text-zinc-900 leading-[1.08] mb-6">
            The First <span className="text-brand-600 underline decoration-brand-200 decoration-wavy underline-offset-8">Sub-10ms</span> Massively Shared Onchain Canvas.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed mb-8 max-w-2xl">
            Draw, collaborate, and co-create digital art on Solana at 100x the speed of Layer 1. Powered by MagicBlock Ephemeral Rollups with zero gas fees and instant cryptographic state commits.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <button onClick={onLaunchCanvas} className="btn-solid text-sm py-3 px-6 rounded-xl shadow-lg">
              <span>Launch Live Canvas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onOpenHowItWorks} className="btn-outline text-sm py-3 px-6 rounded-xl">
              <span>Explore How It Works</span>
            </button>
          </div>

          {/* Key Metrics Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl font-[var(--font-mono)]">
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-subtle text-left">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Zap className="h-3.5 w-3.5 text-brand-600" />
                <span>Block Latency</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">10 ms</p>
              <span className="text-[10px] text-zinc-400 font-sans">vs 400ms on Layer 1</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-subtle text-left">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Fuel className="h-3.5 w-3.5 text-emerald-600" />
                <span>Gas Per Stroke</span>
              </div>
              <p className="text-xl font-bold text-emerald-600">0 SOL</p>
              <span className="text-[10px] text-zinc-400 font-sans">Gasless via ER</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-subtle text-left">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span>Canvas Area</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">16,384</p>
              <span className="text-[10px] text-zinc-400 font-sans">128 × 128 Onchain Pixels</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-subtle text-left">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                <span>Finality</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">Atomic L1</p>
              <span className="text-[10px] text-zinc-400 font-sans">Merkle State Root</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Teaser Widget */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-popover p-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-zinc-400 ml-2">
                  Interactive Live Teaser · Try Painting Below!
                </span>
              </div>
              <div className="flex items-center gap-1">
                {['#FF4D26', '#121316', '#4F46E5', '#10B981', '#F59E0B', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveTeaserColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-5 w-5 rounded-full transition-transform ${
                      activeTeaserColor === c ? 'scale-125 ring-2 ring-zinc-400' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 16x16 interactive grid */}
            <div className="flex justify-center p-2 bg-zinc-50 rounded-xl border border-zinc-100">
              <div
                className="grid gap-0.5 select-none"
                style={{
                  gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                  width: '320px',
                  height: '320px',
                }}
              >
                {Array.from({ length: 256 }).map((_, i) => {
                  const x = i % 16;
                  const y = Math.floor(i / 16);
                  const key = `${x},${y}`;
                  const color = miniColors[key] || '#FFFFFF';
                  return (
                    <div
                      key={key}
                      onClick={() => handleTeaserClick(x, y)}
                      style={{ backgroundColor: color }}
                      className="border border-zinc-200/60 rounded-xs hover:border-brand-500 cursor-crosshair transition-colors"
                      title={`Pixel (${x}, ${y})`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <MousePointer className="h-3 w-3 text-brand-600" />
                Click anywhere to place pixels at 10ms
              </span>
              <button
                onClick={onLaunchCanvas}
                className="text-brand-600 hover:text-brand-700 font-semibold hover:underline flex items-center gap-1"
              >
                Expand to 128×128 Canvas <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section: Solana L1 vs MagicBlock ER */}
      <section className="py-16 px-6 sm:px-12 max-w-5xl mx-auto border-t border-zinc-200/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-zinc-900">
            Why Canvas on Standard Solana Failed
          </h2>
          <p className="text-sm text-zinc-600 mt-2">
            The Graveyard is filled with projects that tried to build onchain games and canvases directly on L1.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional L1 Card */}
          <div className="p-6 rounded-2xl bg-white border border-rose-200/70 shadow-subtle flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600">
                Traditional Solana L1
              </span>
              <span className="text-xs text-rose-500 font-semibold">Unplayable</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>400ms Block Latency:</strong> Drawing stutters and lags behind human hand movements.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Wallet Pop-up Hell:</strong> Phantom pops up asking for approval on every single dot placed.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Network Fees:</strong> Drawing 50 pixels costs $0.10+ in wasted gas fees.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Account Contention:</strong> High concurrent edits block or fail transactions.</span>
              </li>
            </ul>
          </div>

          {/* Pixora + MagicBlock Card */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-elevated flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600">
                Pixora on MagicBlock ER
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                10ms Speed
              </span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-700">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span><strong>10ms Block Time:</strong> Instant visual feedback for continuous, fluid brush strokes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span><strong>Zero Gas per Pixel:</strong> Paint thousands of pixels without spending a single lamport.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span><strong>Session Delegation:</strong> Connect once via Privy or Phantom; no pop-ups during painting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span><strong>Solana L1 Settlement:</strong> 1-click atomic commit permanently seals canvas to Solana L1.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Architecture Highlights */}
      <section className="py-16 px-6 sm:px-12 max-w-6xl mx-auto border-t border-zinc-200/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
            Built for Solana Blitz v8
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-zinc-900 mt-1">
            Engineered with Purpose
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-2 font-[var(--font-display)]">
                10ms High-Frequency Engine
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Transactions process continuously on dedicated SVM execution environments, allowing 100+ strokes per minute without blockchain throttling.
              </p>
            </div>
            <span className="text-[11px] font-mono text-brand-600 font-bold mt-4 block">
              MagicBlock Runtime →
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-2 font-[var(--font-display)]">
                Privy & Session Keys
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Connect via email, Google, Twitter, or Solana wallet. A temporary session key authorizes gasless drawing without exposing private keys.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 font-bold mt-4 block">
              Privy Embedded Auth →
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-2 font-[var(--font-display)]">
                Atomic L1 State Commit
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                When a canvas round is sealed, MagicBlock's Magic Actions generate a cryptographic root hash committed directly back to Solana Layer 1.
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-600 font-bold mt-4 block">
              Solana Settlement →
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-10 px-6 text-center text-xs text-zinc-400 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
          <a
            href="https://build.magicblock.app/graveyard"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            MagicBlock Graveyard ↗
          </a>
          <a
            href="https://docs.magicblock.gg"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            Documentation ↗
          </a>
          <a
            href="https://github.com/toufiqfarhan0/pixora"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            GitHub Repo ↗
          </a>
        </div>
        <p>© 2026 Pixora · Built for Solana Blitz v8 with MagicBlock Ephemeral Rollups.</p>
      </footer>
    </div>
  );
};
