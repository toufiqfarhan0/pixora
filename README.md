# Pixora

A real-time massively shared pixel canvas on Solana. Thousands of painters collaborate on the same 128x128 board simultaneously, with sub-10ms confirmation and zero gas fees powered by MagicBlock Ephemeral Rollups.

- Live Deployment: [https://pixora-eta-rust.vercel.app/](https://pixora-eta-rust.vercel.app/)
- Demo Video Folder: [Google Drive Demo Folder](https://drive.google.com/drive/folders/14_99VIrGWxsT-F50CVOUHnOT44g0xuH9?usp=drive_link)

If you have used collaborative pixel boards like Reddit r/place, the concept is familiar, but with Pixora every stroke is cryptographically attributed and anchored to Solana. There are 16,384 discrete cells: pick a color and tool, click or drag to draw, and strokes appear across all connected devices in real time.

Built for Solana Blitz v8, themed around collaborative onchain applications and MagicBlock Ephemeral Rollup integration.

---

## Technical Specifications

| Parameter | Value |
|---|---|
| Live App | [https://pixora-eta-rust.vercel.app/](https://pixora-eta-rust.vercel.app/) |
| Demo Video | [Google Drive Folder](https://drive.google.com/drive/folders/14_99VIrGWxsT-F50CVOUHnOT44g0xuH9?usp=drive_link) |
| Program ID | `Pxra6Kev7iEom8n9zF2fHQKwhu68hL4WnU2qVwB7uS8` |
| Canvas Account (PDA) | `8TnYwxdZvPywRioeUkkWTwaynU7jRTfEvF2GJizBvk9A` (Delegated to ER) |
| L1 Settlement Program | SPL Memo (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) |
| Network | Solana Devnet |
| Rollup Layer | MagicBlock Ephemeral Rollup (`https://devnet.magicblock.app`) |
| Authentication | Privy Web3 Auth (Phantom, Solflare, Backpack, MetaMask, Email, Google) |

### Live Verified Transactions on Solana Devnet

- L1 State Commit: [`4wEbAtge5uFDeWVddKeG4GHGTMDihoZncY3fKGu2aBLmsVRE8WAA7ZyXZb9W5zTPJtspMa1c4V3Zzp6Gj8uAUWkr`](https://explorer.solana.com/tx/4wEbAtge5uFDeWVddKeG4GHGTMDihoZncY3fKGu2aBLmsVRE8WAA7ZyXZb9W5zTPJtspMa1c4V3Zzp6Gj8uAUWkr?cluster=devnet)
- Stroke Batch Proof: [`2vd1BEqryzN6bHwjF3Q8tW4Y57bE6TtbD6uKDovgo1bS2HV6TjVjApK81rfwZwAYi2hs8hVte5EnQ2wbY7Km2CQb`](https://explorer.solana.com/tx/2vd1BEqryzN6bHwjF3Q8tW4Y57bE6TtbD6uKDovgo1bS2HV6TjVjApK81rfwZwAYi2hs8hVte5EnQ2wbY7Km2CQb?cluster=devnet)
- Multi-artist Placement Proof: [`5jrTuTXusbgnkKBqmZY4quBvG25fPkjP3RoUHLhRnRu5DLjdYM9L3a42yt14ot5VbNQdgW1fx5x6mNetrUrHp5FL`](https://explorer.solana.com/tx/5jrTuTXusbgnkKBqmZY4quBvG25fPkjP3RoUHLhRnRu5DLjdYM9L3a42yt14ot5VbNQdgW1fx5x6mNetrUrHp5FL?cluster=devnet)

---

## Why MagicBlock Ephemeral Rollups

A live, multiplayer canvas with fluid drag-painting is impossible directly on base layer Solana L1 alone:
- **Slot Latency (400ms to 1,200ms)**: Direct L1 confirmation is too slow for fluid brush strokes.
- **Wallet Signature Fatigue**: A single continuous line of 50 pixels would trigger 50 separate wallet approval dialogs.
- **Network Fees**: Paying gas for every single pixel placed makes interactive collaborative art cost-prohibitive.

MagicBlock Ephemeral Rollups solve this by delegating the canvas state account:
1. The canvas state account is delegated to the Ephemeral Rollup validator runtime.
2. Strokes process at **10ms with zero gas**, enabling 60 FPS painting.
3. The collective canvas state root is periodically and atomically committed back down to Solana Layer 1 with a verifiable Merkle root hash.

---

## How It Works

1. **Spectating**: Anyone can visit the canvas and watch strokes land live in real-time with zero login required.
2. **Connecting**: Painters connect their Solana wallet (Phantom, Solflare, Backpack, etc.) or email/social login via Privy.
3. **Session Delegation**: A session key authorizes instant painting so strokes are placed without repeated wallet popups.
4. **Instant 10ms Confirmations**: Drag-to-paint renders smooth continuous strokes using Bresenham's line algorithm. Strokes confirm on the Ephemeral Rollup at $0.00 gas.
5. **Multiplayer Live Cursors**: Connected painters see each other's live cursors and strokes across browsers and devices.
6. **Provenance & Inspection**: Click any pixel in Inspect mode to view the author's Solana wallet address, timestamp, and onchain transaction receipt.
7. **Battle Heatmap**: Toggle the heatmap overlay to see contested zones and high-activity turf battles.
8. **Solana L1 Settlement**: At any time, clicking Commit to L1 computes a cryptographic state root hash across all 16,384 cells and commits the artwork permanently to Solana Devnet.
9. **PNG Export**: One-click download of the complete canvas art as a PNG file.

---

## Architecture

```
[ Next.js Client (Privy Auth + 60 FPS Canvas) ]
         |                                |
         | (10ms gasless strokes)         | (delegate & commit)
         v                                v
[ MagicBlock Ephemeral Rollup ]  -->  [ Solana Base Layer (L1) ]
         |
         | (real-time broadcast)
         v
[ Multiplayer Engine (SSE + BroadcastChannel) ]
```

- **Solana Base Layer (L1)**: Hosts the Anchor program, Canvas PDA account, and permanent Merkle state root settlements.
- **Ephemeral Rollup**: Holds the delegated canvas account in-memory. Pixel placements, overwrites, and session validations occur at 10ms block times with zero gas fees.
- **Multiplayer Engine**: Server-Sent Events (SSE) and BroadcastChannel stream live pixel events and cursor coordinates across connected browser sessions.
- **Relayer Engine**: Secure server-side relayer (`/api/solana/commit` and `/api/solana/pixel-tx`) signs onchain state commitments using SPL Memo on Solana Devnet.

---

## Wallet Connection and Security Model

### How User Wallets Work
When a visitor connects their Phantom or Solflare wallet:
- Their public address is used to identify and attribute the pixels they place.
- In Inspect mode, any painter can click a pixel to view that author's public key and view their activity on Solana Explorer.
- The user is NOT charged gas fees for placing pixels; stroke processing is handled on the Ephemeral Rollup.

### Private Key and Relayer Protection
- The relayer private key (`SOLANA_PRIVATE_KEY`) is stored strictly in the server-side `.env` file.
- It does not have a `NEXT_PUBLIC_` prefix, so Next.js never bundles or exposes it to the browser or frontend client.
- The `.env` file is excluded in `.gitignore` and is never committed to Git.
- Users and external painters have zero access to the server key; all interactions pass through validated API routes that only broadcast formatted state memos.

---

## Dedicated Routes

- `/`: Landing page with platform overview, live interactive preview, and feature breakdown.
- `/canvas`: 60 FPS live collaborative canvas with toolbar, palette selector, battle heatmap, inspector, and telemetry HUD.
- `/how-it-works`: Architectural guide and Ephemeral Rollup lifecycle details.

---

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Privy App ID for Web3 Authentication
NEXT_PUBLIC_PRIVY_APP_ID=cmtvfvjwh03p70bl3nzvog9ju

# Solana Cluster & RPC URL
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# MagicBlock Ephemeral Rollup Router & WebSocket RPC
NEXT_PUBLIC_MAGICBLOCK_ROUTER_URL=https://devnet.magicblock.app
NEXT_PUBLIC_EPHEMERAL_RPC_URL=wss://devnet.magicblock.app

# Anchor Program ID & Canvas Account PDA
NEXT_PUBLIC_PROGRAM_ID=Pxra6Kev7iEom8n9zF2fHQKwhu68hL4WnU2qVwB7uS8
NEXT_PUBLIC_CANVAS_PDA=8TnYwxdZvPywRioeUkkWTwaynU7jRTfEvF2GJizBvk9A

# Server-Side Relayer Private Key (Base58 encoded or JSON byte array)
# Never expose this variable to the browser or commit to git
SOLANA_PRIVATE_KEY=your_base58_private_key_here
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
pnpm build
```

To run the production build:

```bash
pnpm start
```
