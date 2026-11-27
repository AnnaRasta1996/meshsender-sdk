# MeshSender Open SDK — Hackathon Flagship Edition

Public-safe TypeScript SDK for **MeshSender** / **Chaos Paradox (CPX)**.

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

## Developer Playground

`playground/` is powered by **`meshsender-sdk.bundle.js`** generated from the same TypeScript source (`npm run build:browser`). Divergent handwritten algorithm copies are not used.

```bash
npm run playground:serve
# http://127.0.0.1:8787/
npm run playground:interact
```

## GitHub Pages (not enabled)

Workflow stub: `.github/workflows/pages.yml` prepares the allowlisted `playground/` artifact only.  
**Do not enable Pages / public open until owner approval after independent review.**

## License

**MIT proposed for this Open SDK package only.**  
Private MeshSender / `secure-mesh-chat` product source is not licensed by this file.  
Repository should remain **PRIVATE** until explicit owner approval.
