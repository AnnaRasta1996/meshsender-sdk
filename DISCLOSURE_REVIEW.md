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
| Existing Squads V4 multisig Treasury (fact of existence / ~150B historical funding class) | Public narrative only | Documented in README / Playground / walkthrough — **no addresses, members, or treasury tx links** |
| Reserve/founder/treasury/admin wallets | Private labels | **Not exported** (allowlist) |
| Auth / recovery / Keychain | Private | **Not exported** |
| Settlement execution | Private / gated OFF | **Blocked in SDK** |
| Native Squads tx integration / Seed Vault | Not claimed in Open SDK | **Not exported / not claimed** |
| Anti-fraud internals | Private | **Not exported** |

## Residual risk

- Browser playground loads generated `meshsender-sdk.bundle.js` from the same public SDK source (`browser-entry.ts`); no divergent handwritten algorithms
- Browser bundle uses `publicIdentifiers` + `publicRpcFetch` only — never `@solana/web3.js` / Node require
- Live RPC calls may be rate-limited; failures must be reported honestly
- MIT + allowlist apply to **this Open SDK package only** — do not expand license scope to private product source

## Pages workflow

`.github/workflows/pages.yml` prepares the allowlisted `playground/` artifact on manual dispatch.
Deploy uses official `actions/deploy-pages` only when workflow input `owner_approve_deploy=true`.
Default remains prepare-only. **Future Pages redeploys still require explicit owner approval.**

## Publication status

- This Open SDK repository is **PUBLIC**.
- Private MeshSender / `secure-mesh-chat` product source remains **PRIVATE** and is not published here.
- npm package remains `"private": true` (no npm registry publication).
- Economic gates remain **OFF**.
