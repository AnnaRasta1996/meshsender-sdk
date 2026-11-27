# MeshSender Open SDK — Hackathon Flagship Edition

Public-safe TypeScript SDK for **MeshSender** / **Chaos Paradox (CPX)** demonstrations aimed at Dev3pack Hackathon (**Best App Overall**, **Best DeFi on Solana**).

This package preserves the product vision:

- offline store-carry-forward mesh messaging independent of centralized carriers
- cryptographic delivery / relay evidence concepts
- Solana-native CPX economy with Reward Reserve funded relays
- Paradox Market direct peer payments (full principal + 0.10% burn, zero platform fee)

It does **not** publish the private MeshSender product repository, proprietary routing, production authentication, settlement engines, native modules, or infrastructure endpoints.

## Readiness labels

| Label | Meaning |
|---|---|
| `LIVE_READ_ONLY` | Real mainnet reads only |
| `VERIFIED_SYNTHETIC` | Real crypto/math on synthetic fixtures |
| `SIMULATED` | Deterministic local simulation |
| `PENDING` | Explicitly not available yet |

Never treat demo output as a successful production settlement or physical-device proof.

## One-command demo

```bash
cd meshsender-sdk
npm install
npm run demo
```

Skip live RPC:

```bash
set MESHSENDER_SDK_SKIP_LIVE=1
npm run demo
```

## Minimal setup

- Node.js **20+**
- Windows/macOS/Linux
- Network only required for Solana `LIVE_READ_ONLY` examples

```bash
npm install
npm run typecheck
npm test
npm run demo
npm run playground:serve
```

Open `http://127.0.0.1:8787/`.

## Modules

1. **Network Lab** — deterministic offline SCF simulation (`SIMULATED`)
2. **Transport** — Internet/BLE/Wi-Fi Direct/LoRa interfaces + sims (`SIMULATED`; hardware `PENDING`)
3. **Delivery Proofs** — Ed25519 illustrative demo protocol (`VERIFIED_SYNTHETIC`)
4. **Relay Evidence** — paged hops + rolling commitments (`VERIFIED_SYNTHETIC`)
5. **Node Passport** — public verify demos (`VERIFIED_SYNTHETIC`)
6. **Solana** — mainnet mint/program/balance/tx inspection (`LIVE_READ_ONLY`)
7. **Economy** — BigInt DG2 quotes for burn/relay/caps/referral/first-5000 (`VERIFIED_SYNTHETIC`)
8. **Paradox Market** — bilateral demo + payment quote (`SIMULATED`)
9. **Developer Playground** — static HTML/CSS/JS dashboard

## Public chain identifiers

- CPX mint: `9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X`
- Program ID: `GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg`

## Examples

```bash
npx tsx examples/e2e-offline-delivery.ts
npx tsx examples/tampered-proof.ts
npx tsx examples/live-mainnet-inspect.ts
```

## GitHub Pages

After owner approval of exact files + MIT license:

1. Create public repo `meshsender-sdk` from this standalone directory (no private git history).
2. Enable Pages from `/playground` (or deploy `playground/` to `docs/`).
3. Confirm no private source maps, credentials, wallet labels, or allowlist violations.

## License

**Proposed MIT for this Open SDK package only.**  
Do not publish until owner approves exact file list and license after independent review.

Private product (`secure-mesh-chat`) remains private.
