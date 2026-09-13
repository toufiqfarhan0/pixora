---
name: solana-magicblock
description: Workspace skill for Pixora and MagicBlock Ephemeral Rollup development on Solana, covering Anchor program interaction, SPL Memo proofs, live Devnet transactions, and Phantom wallet integration.
tags: [solana, magicblock, pixora, devnet, phantom]
---

# Pixora Solana & MagicBlock Ephemeral Rollup Skill

## Quick Reference

### 1. Devnet Configuration
- Cluster: `https://api.devnet.solana.com`
- MagicBlock Router: `https://devnet.magicblock.app`
- Ephemeral WebSocket: `wss://devnet.magicblock.app`
- Relayer Wallet: Configured via `SOLANA_PRIVATE_KEY` in `.env`
- Relayer Public Address: `EnCmpAE2oKBeoRKsgxi1YJBTUMsTbgwZmbQNsXkV7qyD`

### 2. Live Onchain Transactions
- Real L1 Commitments are submitted through `/api/solana/commit` and broadcast to Solana Devnet using SPL Memo instructions.
- Real Stroke proofs are submitted through `/api/solana/pixel-tx` to link every batch to a verifiable transaction hash on Solana Explorer.
- Explorer URL format: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`.

### 3. Wallets Supported
- Phantom, Solflare, Backpack, Coinbase Wallet, and MetaMask on Solana via Privy.
