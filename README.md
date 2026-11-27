# MeshSender Open SDK — Hackathon Flagship Edition

Public-safe TypeScript SDK for **MeshSender** / **Chaos Paradox (CPX)**.

## See it

| Link | What |
|---|---|
| **Product video** | [See MeshSender in Action — Real Android Prototype](https://annarasta1996.github.io/meshsender-sdk/#product-video) (YouTube embed; final watch URL set by owner in `playground/product-video-config.js`) |
| **English walkthrough** | [docs/DEMO_VIDEO_GUIDE.md](./docs/DEMO_VIDEO_GUIDE.md) |
| **Interactive Playground** | [https://annarasta1996.github.io/meshsender-sdk/](https://annarasta1996.github.io/meshsender-sdk/) |

Footage is an **earlier working Android development build**. The Playground keeps Guided Demo and Developer Mode fully functional with explicit readiness labels. Economic gates remain **OFF**.

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

## GitHub Pages (prepared; deploy gated)

Workflow: `.github/workflows/pages.yml` (`pages-manual-gated`).

- Trigger: **workflow_dispatch only** (no push/PR auto-deploy).
- Job `prepare`: builds browser bundle and uploads **allowlisted `playground/`** artifact only.
- Job `deploy`: official `actions/deploy-pages` — runs **only** when input `owner_approve_deploy=true`.
- Default input is `false` → prepare artifact without publishing.

### Activation instructions (owner only, after independent review)

1. Confirm `PUBLICATION_ALLOWLIST.md` + MIT for **this SDK package only**.
2. Keep the repository **PRIVATE** until you explicitly approve a public open.
3. In GitHub Settings → Pages: set Source to **GitHub Actions** (only when you intend to publish).
4. Actions → **pages-manual-gated** → Run workflow:
   - Leave `owner_approve_deploy` **false** to prepare/upload artifact without deploy.
   - Set `owner_approve_deploy` **true** only with explicit owner approval to deploy.
5. Public open remains **BLOCKED** until that explicit approval. This unit does not publish.

## Release status (current)

- Repository visibility: **PRIVATE**
- Public GitHub Pages publication: **BLOCKED** (owner approval required)
- Economic gates: **OFF** (no signing / spend / settlement deploy)
- MIT: proposed for **SDK only** (not private product source)

## License

**MIT proposed for this Open SDK package only.**  
Private MeshSender / `secure-mesh-chat` product source is not licensed by this file.  
Repository must remain **PRIVATE** until explicit owner approval.
