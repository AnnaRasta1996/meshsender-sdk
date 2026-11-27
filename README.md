# MeshSender Open SDK — Hackathon Flagship Edition

Public-safe TypeScript SDK for **MeshSender** / **Chaos Paradox (CPX)**.

## See it

| Link | What |
|---|---|
| **Product video (YouTube)** | [https://www.youtube.com/watch?v=K9X8EYo6-CE](https://www.youtube.com/watch?v=K9X8EYo6-CE) — *See MeshSender in Action — Real Android Prototype* |
| **English walkthrough** | [docs/DEMO_VIDEO_GUIDE.md](./docs/DEMO_VIDEO_GUIDE.md) |
| **Interactive Playground** | [https://annarasta1996.github.io/meshsender-sdk/](https://annarasta1996.github.io/meshsender-sdk/) |

Footage is an **earlier working Android development build** (vertical Short). The Playground embeds the same video above Guided Demo / Developer Mode, with a collapsible English walkthrough. Economic gates remain **OFF**.

## Product vision (preserved)

MeshSender aims to eliminate mandatory dependence on centralized carriers for core messaging: encrypted store-carry-forward across devices (Internet + BLE + Wi-Fi Direct + LoRa transports), cryptographic delivery/relay evidence concepts, Solana-native CPX economics (Reward Reserve funded relays), and Paradox Market direct peer payments (full recipient principal + 0.10% burn, zero platform fee).

## What this SDK can do now

| Capability | Readiness |
|---|---|
| Deterministic offline SCF Network Lab | SIMULATED |
| Transport adapter interfaces + sims | SIMULATED (hardware PENDING) |
| Delivery / relay / passport crypto fixtures | VERIFIED_SYNTHETIC (illustrative protocols) |
| Economy BigInt quotes + capped payable simulation | VERIFIED_SYNTHETIC (non-spending) |
| Paradox Market bilateral + payment quote | SIMULATED |
| CPX mint + settlement program inspection | LIVE_READ_ONLY |

## CPX mint vs settlement program

These are **different** on-chain objects:

- **CPX SPL token mint:** `9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X`
- **Mesh settlement program ID:** `GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg`

The mint is the token. The program ID is a separate executable account (may be not found / not executable on a given cluster). The SDK never confuses them and never deploys.

## Existing Solana Mainnet Infrastructure

Chaos Paradox (**CPX**) already has **real Solana mainnet infrastructure established before this hackathon** — separate from what the Open SDK demonstrates today.

| Layer | Status |
|---|---|
| **CPX SPL mint** | Live on Solana mainnet (public mint address above; Open SDK can live-read it) |
| **Squads-based multisig Treasury** | Existing project Treasury infrastructure on Solana mainnet (Squads Protocol V4). Historical funding on the order of **~150B CPX**. Reward Reserve is a **separate** allocation from Treasury. Exact Treasury / Reserve / member / admin addresses stay in the **private product** configuration and are **not** published in this Open SDK |
| **Custom mesh settlement program** | Declared program ID above — **implementation / deploy not treated as live executable settlement** in this Open SDK. The Playground may inspect the account read-only |
| **This Open SDK + hackathon Playground** | Deterministic labs, synthetic proofs, non-spending economy quotes, live mint inspection — **not** native Squads transaction integration, **not** Seed Vault integration, **not** automatic economic settlement |
| **Production paid-mesh / settlement execution** | **OFF** (economic gates OFF) |

Do **not** read this section as a claim that the Open SDK signs Squads vault transactions, runs Seed Vault flows, or executes live settlement. Wallet addresses and explorer links that would disclose private treasury/reserve identities are intentionally omitted pending separate disclosure approval (`PUBLICATION_ALLOWLIST` / `DISCLOSURE_REVIEW`).

## Pending production features

- Physical BLE / Wi-Fi Direct / LoRa adapters
- Production settlement / paid-mesh writes (economic gates OFF)
- Two-device live agreement exchange (U54F8)
- Production identity authority (Node Passport here is synthetic possession proof only)

## One-command demo

```bash
cd meshsender-sdk
npm install
npm run demo
```

Skip live RPC:

```bash
# Windows PowerShell
$env:MESHSENDER_SDK_SKIP_LIVE='1'; npm run demo
```

## Install / build / test

Node.js **20+** required.

```bash
npm install
npm run typecheck
npm run build
npm test
npm run demo
npm run playground:serve
```

Import after build:

```ts
import {
  runSimulatedDeliveryPipeline,
  liveMainnetSnapshot,
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
} from '@meshsender/sdk';
```

Local path import (this repo):

```ts
import { runSimulatedDeliveryPipeline } from './dist/index.js';
```

## Judge Playground (guided demo)

`playground/` is powered by **`meshsender-sdk.bundle.js`** generated from the same TypeScript source (`npm run build:browser`). No divergent handwritten algorithm copies.

### Local demo for judges

```bash
npm install
npm run build:browser
npm run playground:serve
# open http://127.0.0.1:8787/
```

1. Click **Start Guided Demo** — headline *Humanity Is the Infrastructure.*
2. Press **Continue** through the 8-step story (offline delivery → outage → proof → relay → passport → economy → Market → live Solana).
3. Use **Developer Mode** for every existing JSON/control surface.
4. Readiness badges stay visible: `SIMULATED` / `VERIFIED_SYNTHETIC` / `LIVE_READ_ONLY` / `PENDING`.

```bash
npm run playground:interact   # page + SDK flow checks
npm run bundle:startup        # browser-sandbox bundle boot
```

## GitHub Pages

Live playground: [https://annarasta1996.github.io/meshsender-sdk/](https://annarasta1996.github.io/meshsender-sdk/)

Workflow: `.github/workflows/pages.yml` (`pages-manual-gated`).

- Trigger: **workflow_dispatch only** (no push/PR auto-deploy).
- Job `prepare`: builds browser bundle and uploads **allowlisted `playground/`** artifact only.
- Job `deploy`: official `actions/deploy-pages` — runs **only** when input `owner_approve_deploy=true`.
- Default input is `false` → prepare artifact without publishing.
- **Future Pages deploys still require explicit owner approval** via `owner_approve_deploy`.

## Release status (current)

- Repository visibility: **PUBLIC** (https://github.com/AnnaRasta1996/meshsender-sdk)
- GitHub Pages: **live** (manual owner-gated redeploys)
- npm: package marked `"private": true` — **not** published to the npm registry
- Economic gates: **OFF** (no signing / spend / settlement deploy)
- MIT: proposed for **this Open SDK package only** (private product source is not licensed by this file)

## License

**MIT proposed for this Open SDK package only.**  
Private MeshSender / `secure-mesh-chat` product source remains private and is not licensed by this file.
