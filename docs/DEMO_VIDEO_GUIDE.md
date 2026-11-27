# MeshSender — English Video Walkthrough

This guide describes the **real Android prototype footage** featured in the Open SDK presentation. The recording shows an **earlier working Android development build**. It is product context for judges and contributors — not a substitute for the Interactive Playground’s labeled readiness (`SIMULATED` / `VERIFIED_SYNTHETIC` / `LIVE_READ_ONLY` / `PENDING`).

## Watch

- **YouTube:** *pending final owner-provided URL* (set `playground/product-video-config.js` → `youtubeWatchUrl`)
- **Interactive Playground:** [https://annarasta1996.github.io/meshsender-sdk/](https://annarasta1996.github.io/meshsender-sdk/)

Timestamps are omitted until the owner supplies verified timestamps for the final uploaded video. **Do not invent chapter times.**

## What the footage demonstrates

### Account registration and recovery interface

The build shows how a user creates and recovers access to a MeshSender account on-device.  
**Why it matters:** Sovereignty starts with identity the user can restore without a centralized “reset email” dependency for the core messaging path. Registration/recovery UI is the onboarding surface that makes mesh participation practical for non-experts.

### Internet messaging between two devices

When connectivity is available, the prototype demonstrates ordinary two-device messaging over the internet path.  
**Why it matters:** MeshSender is offline-first, not offline-only. A credible product keeps people talking when the network works, then continues when it fails — one conversation model across conditions.

### Mesh Mode and offline communication demonstrations

Mesh Mode illustrates device-to-device communication intended for periods without continuous internet (store-carry-forward style operation as shown in the prototype UI).  
**Why it matters:** This is the core DePIN thesis — humans and phones become infrastructure. The Open SDK Network Lab later models the same idea deterministically for judges; the video shows the earlier Android surface.

**Honesty bound:** This guide does **not** claim independently verified offline multi-hop routing, production BLE/Wi-Fi Direct certification, or physical LoRa radio operation solely from the footage. Physical radios remain **PENDING** in the Open SDK readiness labels.

### Same-conversation close-up (readability)

A closer view of the same conversation is included so message flow, layout, and status cues are easier to read on desktop and mobile.  
**Why it matters:** Judges and users should see that offline/mesh messaging is a first-class conversation experience, not a hidden debug panel.

### Offline Map and network visualization

The prototype includes offline map / network visualization so relative node context remains understandable without a live cartography backend.  
**Why it matters:** Offline communication needs spatial intuition — who is nearby, what the mesh looks like — even when cloud map tiles are unavailable.

### Integrated wallet and Phantom interface

The build surfaces wallet integration with a Phantom-oriented interface for Solana connectivity.  
**Why it matters:** MeshSender’s economy is Solana-native. Showing wallet UX early ties messaging sovereignty to user-controlled keys — without turning this Open SDK playground into a signing/spend path (economic gates remain **OFF** here).

### CPX on Solana mainnet

Chaos Paradox (**CPX**) is the project token on Solana mainnet. The Open SDK can **live-read** the public mint (`9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X`) separately from any settlement program account.  
**Why it matters:** Viewers should understand that CPX is a real on-chain mint, while **production settlement / paid-mesh writes** remain gated and are **not** executed by this Open SDK package.

### Global communication and economic vision

Together, messaging + mesh + wallet + CPX point at a single vision: communication that survives internet failure, with an economy that rewards participation (Reward Reserve–funded relay concepts; Paradox Market peer payments with zero platform fee in the product rules).  
**Why it matters:** The video sells the destination; the Open SDK proves public-safe building blocks with explicit readiness labels.

## Evolution: Android prototype → Open SDK

| Earlier Android prototype (footage) | Current Open SDK / Playground |
|---|---|
| On-device registration, chat, mesh UI, map, wallet surfaces | Public TypeScript modules + Judge Playground |
| Product experience narrative | Deterministic offline SCF lab, proofs, economy BigInt quotes, live mint inspection |
| Development build (historical) | Hackathon Flagship package — MIT proposed for **SDK only** |

The footage is **not** a claim that Market payments completed in production, that settlement executed, or that LoRa hardware shipped. Those remain **PENDING** / gates **OFF** unless separately verified.

## What this guide does *not* claim

- Independently verified offline multi-hop routing from the video alone  
- Physical LoRa operation in production  
- Production settlement execution or completed Paradox Market payments from footage alone  
- That playground hypothetical CPX prices are live payouts  

## Related links

- Playground Video Walkthrough section (same narrative, on-page)  
- `README.md` — Video · Walkthrough · Interactive Playground  
- Live CPX mint inspection in the Playground (read-only)
