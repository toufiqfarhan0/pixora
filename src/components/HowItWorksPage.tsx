import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Key,
  Zap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Database,
  Globe,
  Share2,
} from 'lucide-react';

interface HowItWorksPageProps {
  onBackToLanding: () => void;
  onLaunchCanvas: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onBackToLanding,
  onLaunchCanvas,
}) => {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-page)] text-zinc-900 font-[var(--font-body)] pt-20 pb-20 px-6 sm:px-12 max-w-5xl mx-auto">
      {/* Top back button */}
      <button
        onClick={onBackToLanding}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Pixora Home</span>
      </button>

      {/* Page Title Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          <Cpu className="h-3 w-3" />
          <span className="font-mono uppercase tracking-wider text-[11px]">Under the Hood</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-[var(--font-display)] text-zinc-900 tracking-tight leading-tight">
          How Pixora Works
        </h1>
        <p className="text-zinc-600 text-base mt-3 leading-relaxed">
          A step-by-step breakdown of how MagicBlock Ephemeral Rollups eliminate latency, gas fees, and wallet friction on Solana.
        </p>
      </div>

      {/* Official MagicBlock Graveyard & Architecture Alignment (Light Mode) */}
      <div className="bg-white text-zinc-900 rounded-2xl border border-zinc-200/90 p-6 sm:p-7 shadow-popover mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-700 font-mono text-[11px] font-bold uppercase tracking-wider">
              MagicBlock Build Graveyard
            </span>
            <span className="text-xs font-mono text-zinc-600">
              Idea: <strong className="text-zinc-900">Massively Shared Pixel Canvas</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <a
              href="https://build.magicblock.app/graveyard?cat=Games&idea=pixel-canvas"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:text-brand-700 font-semibold transition-colors flex items-center gap-1"
            >
              <span>Graveyard Idea</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://docs.magicblock.gg/pages/get-started/introduction/why-magicblock"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1"
            >
              <span>Why MagicBlock Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-5 font-mono">
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100/90 flex flex-col gap-1.5 shadow-2xs">
            <span className="text-xs text-rose-600 font-bold">▸ 01. The Problem</span>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 font-[var(--font-display)]">
              Shared canvases die with their servers
            </p>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Traditional web2 canvases (like r/place) store state on centralized Redis/SQL databases. When hosting expires or servers crash, communal art is lost forever.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100/90 flex flex-col gap-1.5 shadow-2xs">
            <span className="text-xs text-emerald-600 font-bold">▸ 02. The Engine</span>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 font-[var(--font-display)]">
              ER lands a million placements in 10ms
            </p>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Solana L1's 400ms latency and per-tx gas fees make continuous drawing impossible. MagicBlock Ephemeral Rollup executes at sub-10ms with zero gas per pixel.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-100/90 flex flex-col gap-1.5 shadow-2xs">
            <span className="text-xs text-brand-600 font-bold">▸ 03. The Result</span>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 font-[var(--font-display)]">
              The canvas outlives any server
            </p>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Cryptographic state root hashes are committed directly to Solana Layer 1. The canvas is permanently immutable and exists on the decentralized blockchain forever.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visual Flow Diagram */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-popover p-6 mb-16 overflow-x-auto">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-6">
          Architecture Flow: Ephemeral Rollup Lifecycle
        </h2>

        <div className="min-w-[650px] flex items-center justify-between gap-4 py-4 px-2">
          {/* Node 1: Client */}
          <div className="flex-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 shadow-sm">
              <Key className="h-5 w-5" />
            </div>
            <span className="font-bold text-xs text-zinc-900">1. User & Privy</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Session Key Auth</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center text-zinc-300 font-mono text-[10px]">
            <span>1-click</span>
            <span className="text-brand-500 font-bold">➔</span>
          </div>

          {/* Node 2: Magic Router */}
          <div className="flex-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 shadow-sm">
              <Globe className="h-5 w-5" />
            </div>
            <span className="font-bold text-xs text-zinc-900">2. Magic Router</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Account Delegation</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center text-zinc-300 font-mono text-[10px]">
            <span>10ms sync</span>
            <span className="text-emerald-500 font-bold">➔</span>
          </div>

          {/* Node 3: Ephemeral Rollup */}
          <div className="flex-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col items-center text-center ring-1 ring-emerald-300/60">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-bold text-xs text-emerald-900">3. Ephemeral Rollup</span>
            <span className="text-[10px] text-emerald-700 font-mono mt-0.5">10ms · Gasless</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center text-zinc-300 font-mono text-[10px]">
            <span>Commit</span>
            <span className="text-purple-500 font-bold">➔</span>
          </div>

          {/* Node 4: Solana L1 */}
          <div className="flex-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <span className="font-bold text-xs text-zinc-900">4. Solana Layer 1</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Permanent Ledger</span>
          </div>
        </div>
      </div>

      {/* 3 Detailed Steps */}
      <div className="space-y-12">
        {/* Step 1 */}
        <div className="flex items-start gap-5">
          <div className="h-10 w-10 rounded-2xl bg-brand-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-md">
            01
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-[var(--font-display)]">
              Session Delegation via Privy & Magic Router
            </h3>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              When you join Pixora, you authenticate once through Privy using your MetaMask wallet. Pixora delegates the canvas state account to MagicBlock’s Ephemeral Rollup. A short-lived session key is saved locally in your browser to sign each pixel placement without requiring wallet approvals.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-md">
            02
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-[var(--font-display)]">
              Sub-10ms Gasless Execution on the Ephemeral Rollup
            </h3>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              While delegated, pixel updates do not compete for space on Solana Layer 1. Instead, they execute on MagicBlock’s specialized high-frequency Solana Virtual Machine (SVM) runtime. Transactions confirm in <strong>10 milliseconds with zero gas fees</strong>, enabling real-time drawing and collaborative painting.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-5">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-md">
            03
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-[var(--font-display)]">
              Atomic State Commit to Solana Base Layer
            </h3>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              When a round finishes or upon manual trigger, a Magic Action computes a cryptographic root hash of all pixel positions and authors. It submits a single settlement transaction back to Solana Layer 1, permanently anchoring the collaborative artwork to the blockchain ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 pt-12 border-t border-zinc-200">
        <h2 className="text-2xl font-bold font-[var(--font-display)] text-zinc-900 mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-subtle">
            <h3 className="font-bold text-sm text-zinc-900 mb-1.5 font-[var(--font-display)]">
              Is an Ephemeral Rollup a new Layer 2 blockchain?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              No. Unlike traditional Layer 2s, Ephemeral Rollups don't fragment liquidity or require bridging. They are temporary, on-demand SVM runtimes directly linked to Solana L1 accounts through account delegation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-subtle">
            <h3 className="font-bold text-sm text-zinc-900 mb-1.5 font-[var(--font-display)]">
              What happens if two painters draw on the same pixel?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The Ephemeral Rollup validator sequences transactions in strict FIFO order within each 10ms micro-block. State transitions are deterministic, and the newest valid signed stroke updates the in-memory matrix and broadcasts across all peers instantly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-subtle">
            <h3 className="font-bold text-sm text-zinc-900 mb-1.5 font-[var(--font-display)]">
              How are gas fees zero for painters?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Transaction execution on the Ephemeral Rollup node is sponsored and zero-cost during the active session. Only the final state commit consumes a single transaction fee on Solana L1.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-subtle">
            <h3 className="font-bold text-sm text-zinc-900 mb-1.5 font-[var(--font-display)]">
              Can I export the canvas?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Yes! You can download a high-resolution PNG of the entire canvas at any moment using the download button in the toolbar.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 p-8 rounded-2xl bg-brand-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-elevated">
        <div>
          <h3 className="text-xl font-bold font-[var(--font-display)]">Ready to paint onchain?</h3>
          <p className="text-xs text-brand-100 mt-1">
            Experience 10ms block times with zero gas fees on Pixora.
          </p>
        </div>
        <button
          onClick={onLaunchCanvas}
          className="bg-white text-brand-600 hover:bg-brand-50 font-semibold px-6 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <span>Open Live Canvas</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
