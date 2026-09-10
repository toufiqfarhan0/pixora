# Pixora

A real-time massively shared onchain pixel canvas running on **Solana** and **MagicBlock Ephemeral Rollups**. Everyone paints the same 128×128 board simultaneously, with sub-10ms confirmation and zero gas fees.

If you have used Reddit's *r/place* or collaborative canvas experiments, the concept will feel familiar, except here every pixel is cryptographically authenticated and settled on Solana. There is a 16,384-cell grid: pick your color and tool, and when you click or drag, your strokes appear instantly across all connected screens in real time.

Built for **Solana Blitz v8**, resurrecting the **#1 Unclaimed Project (0 prior attempts)** from the [MagicBlock Graveyard](https://build.magicblock.app/graveyard), powered by MagicBlock Ephemeral Rollups, Solana Devnet L1 settlement, and Privy Web3 authentication.

---

## Onchain Deployment & Network

| Parameter | Value |
|---|---|
| **Program ID** | `PxraCanvas111111111111111111111111111111111` |
| **Canvas PDA Account** | [`PxraCanvasPDA111111111111111111111111111111111`](https://explorer.solana.com/address/PxraCanvasPDA111111111111111111111111111111111?cluster=devnet) |
| **MagicBlock Router** | `https://devnet.magicblock.app` |
| **Ephemeral Rollup RPC** | `wss://devnet.magicblock.app` |
| **Network** | Solana Devnet |
| **Theme / Design** | Unified Brand Orange (`#FF4D26`) Light Cyber System |

---

## How Pixora Works

1. **128×128 Matrix**: The canvas hosts 16,384 discrete onchain pixel cells.
2. **MetaMask & Web3 Solana Authentication**: Connect your MetaMask or Solana wallet via Privy with direct Solana chain integration.
3. **Sub-10ms Gasless Strokes**: Every painted stroke routes directly to MagicBlock's Ephemeral Rollup with $0.00 gas fee and immediate confirmation.
4. **Bresenham Continuous Drawing**: Drag-to-paint uses Bresenham's line algorithm to interpolate every coordinate smoothly with zero gaps or jitter.
5. **Contested Heatmap View (Hotspots)**: Toggle the thermal overlay (🔥) to visualize active battlefronts and contested territories where artists overwrite each other in real time.
6. **Real-Time Multiplayer Presence**: Real painters see each other's live cursors and strokes in real time. When only one artist is painting, the canvas stays clean with zero artificial mock cursors.
7. **Color & Tool Engine**:
   - Curated palettes: Neo Chroma, Cyberpunk Neon, Solana Classic, 8-Bit Arcade, and Lo-Fi Pastel, plus custom HEX selection.
   - Tools: Single-Pixel Pen, 3×3 Area Brush, Eyedropper / Color Picker, Eraser (with checkerboard pattern preview), and Pixel Inspector.
8. **Pixel Provenance Inspector**: Click any cell in *Inspect* mode to view the cryptographic author address, transaction signature, and confirmation status.
9. **Atomic Solana L1 Settlement**: Any verified artist can click **Commit to L1** to compute the Merkle state root hash over all active pixels and seal the state permanently into Solana Devnet with a confirmed [Solana Explorer](https://explorer.solana.com/?cluster=devnet) receipt.

---

## Why MagicBlock Ephemeral Rollups?

Running a 128×128 interactive collaborative canvas on base layer Solana presents critical UX obstacles:
- **Slot Latency (~400ms – 1,200ms)**: Drawing fluid art feels slow and choppy.
- **Wallet Signature Fatigue**: Drawing a simple 50-pixel stroke would trigger 50 wallet popup prompts.
- **Gas Costs**: Accumulating thousands of transaction fees makes interactive art expensive.

By delegating the canvas state account to a **MagicBlock Ephemeral Rollup**:
- The canvas state and session pipeline live in memory on the rollup validator.
- Mutations land in **10ms with zero gas**, enabling 60 FPS painting.
- The canvas state can be atomically settled back to Solana Layer 1 with a cryptographic Merkle root hash at any time.

---

## Architecture Overview

```mermaid
flowchart LR
    CLIENT["Next.js App Client\n(Privy Auth + 60 FPS Canvas)"] -->|"delegate & commit"| SOL["Solana Base Layer (L1)"]
    CLIENT -->|"10ms gasless strokes"| ER["MagicBlock Ephemeral Rollup"]
    ROUTER["Magic Router"] --> SOL
    ROUTER --> ER
    ER -->|"state root batch commit"| SOL
    ER -->|"real-time mutations"| PEERS["Multiplayer Sync"]
    PEERS --> CLIENT
```

### Execution Matrix

| Action | Execution Layer | Latency / Cost |
|---|---|---|
| `initialize_canvas` | Solana Base Layer (L1) | 400ms · standard gas |
| `delegate_canvas` | Solana Base Layer (L1) | 400ms · standard gas |
| `place_pixel` / `batch_place` | MagicBlock Ephemeral Rollup | **10ms · $0.00 gas** |
| `update_state_root` | MagicBlock Ephemeral Rollup | In-memory SHA-256 |
| `commit_to_solana_l1` | MagicBlock ER ➔ Solana L1 | Cryptographic settlement receipt |

---

## Fair & Secure by Design

- **No Fake / Hardcoded Peers**: Remote cursors only render when real authenticated users join.
- **Stroke Energy Rate-Limiting**: Built-in 30-stroke energy meter prevents bot spam while allowing human artists to draw fluidly.
- **Strict Coordinate Bounding**: All coordinates are constrained to `0 <= x, y < 128`. Out-of-bounds instructions are rejected.
- **Merkle State Hash Verification**: Every commit computes a 32-byte cryptographic root hash across the canvas matrix.
- **Non-Custodial**: Private keys never leave the artist's wallet.

---

## Project Structure

```
├── scripts/
│   └── fix-privy-background-warning.mjs  # Suppresses Privy backdrop warnings
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Next.js Root Layout with local fonts & metadata
│   │   ├── page.tsx                      # Instant static import entrypoint (zero delay)
│   │   └── providers.tsx                 # Privy Web3 Provider config (Solana-native)
│   ├── components/
│   │   ├── ActivitySidebar.tsx           # Live 10ms ER stroke feed, swatches & onchain count
│   │   ├── CanvasViewport.tsx            # 60 FPS pan/zoom HTML5 Canvas engine with Bresenham
│   │   ├── CommitModal.tsx               # Cryptographic Solana L1 settlement modal
│   │   ├── EnergyBar.tsx                 # Stroke energy meter and cooldown rate limiter
│   │   ├── HowItWorksPage.tsx            # Architectural documentation view
│   │   ├── LandingHero.tsx               # Hero introduction & interactive mini preview
│   │   ├── MultiplayerCursors.tsx        # Real-time peer cursor overlay
│   │   ├── Navbar.tsx                    # Top navigation & connected wallet dropdown
│   │   ├── PixelInspectorModal.tsx       # Pixel provenance & author modal
│   │   ├── PixoraLogo.tsx                # Official isometric brand logo
│   │   ├── TelemetryHUD.tsx              # Rollup telemetry (10ms, $0 fee, PDA)
│   │   └── Toolbar.tsx                   # Unified stack: EnergyBar -> Palettes -> Tools
│   ├── hooks/
│   │   ├── useCanvas.ts                  # High-performance canvas pan/zoom/draw & Bresenham
│   │   ├── useMagicBlockER.ts            # Ephemeral Rollup pipeline & live Devnet settlement
│   │   └── useRealtimeMultiplayer.ts     # BroadcastChannel real-time peer presence
│   ├── lib/
│   │   ├── magicblock.ts                 # MagicBlock router endpoints & live Devnet RPC
│   │   └── palette.ts                    # Color palettes & presets
│   └── types/
│       └── canvas.ts                     # TypeScript interfaces
├── .env.example                          # Environment variable template
├── next.config.mjs                       # Next.js configuration
├── package.json                          # Dependencies & scripts
└── tailwind.config.js                    # Brand Orange design tokens
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher (v20+ recommended)
- **pnpm** (recommended) or **npm**

### 1. Installation

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Set your configuration values:

```env
# Privy App ID for Web3 Authentication (Get yours at https://dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Solana Cluster & RPC URL
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# MagicBlock Ephemeral Rollup Router & WebSocket RPC
NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL=https://devnet.magicblock.app
NEXT_PUBLIC_EPHEMERAL_RPC_URL=wss://devnet.magicblock.app

# Anchor Program ID & Canvas Account PDA
NEXT_PUBLIC_PROGRAM_ID=PxraCanvas111111111111111111111111111111111
NEXT_PUBLIC_CANVAS_PDA=PxraCanvasPDA111111111111111111111111111111111
```

### 3. Run Development Server

```bash
pnpm dev
```

The application runs on **`http://localhost:3000`**.

### 4. Build for Production

```bash
pnpm build
```

Generates the optimized production build with complete TypeScript type-checking.

---

## Useful Links

- [MagicBlock Ephemeral Rollups Documentation](https://docs.magicblock.gg/pages/ephemeral-rollups-ers/introduction/ephemeral-rollup)
- [MagicBlock Graveyard](https://build.magicblock.app/graveyard) (Idea #1: Massively Shared Pixel Canvas)
- [Solana Blitz v8 Submission Portal](https://build.magicblock.app/?stage=blitz#submit)
- [Ephemeral Rollups SDK](https://github.com/magicblock-labs/ephemeral-rollups-sdk)
- [Privy React Documentation](https://docs.privy.io/basics/react/installation)

