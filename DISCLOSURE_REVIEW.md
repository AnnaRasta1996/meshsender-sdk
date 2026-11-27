# Disclosure review (U92)

## Intent

Publish a hackathon-ready Open SDK that is impressive and executable without leaking private MeshSender IP.

## What was referenced (read-only, not copied wholesale)

- `canonicalEconomy.ts` — locked constants/formulas reimplemented as public quotes
- `mainnetTokenIdentity.ts` — **mint only** (no private wallet exports)
- `meshDeliveryProof.ts` — concept reference; **production wire domains not exported**
- `meshRelayLedgerCommitment.ts` / paged builder — concept reference; **illustrative SDK domains**

## Classification

| Area | Disclosure | Status |
|---|---|---|
| Economy locked rules | Public product rules from Master Guide | Exported as SDK quotes |
| Delivery proof wire | Not approved for production format export | Illustrative demo protocol |
| Relay commitment domains | Not approved for production format export | Illustrative demo protocol |
| Solana mint/program | Public | Exported |
| Reserve/founder/treasury wallets | Private labels | **Not exported** |
| Auth / recovery / Keychain | Private | **Not exported** |
| Settlement execution | Private / gated OFF | **Blocked in SDK** |
| Anti-fraud internals | Private | **Not exported** |

## Residual risk

- Browser playground mirrors algorithms in JS (allowlisted) — keep synced with `src/`
- Live RPC calls may be rate-limited; failures must be reported honestly
- Owner must still approve MIT + exact allowlist before public GitHub publish

## Decision gate

**DO NOT PUBLISH PUBLICLY until owner approves exact files and license after independent review.**
