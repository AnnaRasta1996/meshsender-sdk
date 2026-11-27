# Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                 Developer Playground (static)              │
│              HTML / CSS / JS  (no React build)             │
└─────────────────────────────┬──────────────────────────────┘
                              │ uses mirrored demo APIs
┌─────────────────────────────▼──────────────────────────────┐
│                 @meshsender/sdk (TypeScript)               │
│  NetworkLab │ Transport │ Proofs │ Relay │ Passport        │
│  Economy    │ Market    │ Solana LIVE_READ_ONLY            │
└───────┬───────────────┬─────────────────────┬──────────────┘
        │               │                     │
   SIMULATED      VERIFIED_SYNTHETIC    mainnet JSON-RPC
   topology           Ed25519/SHA256      mint/program reads
```

## Design rules

1. **Product vision preserved** — offline mesh + CPX DeFi narrative stays intact.
2. **Disclosure-safe** — illustrative protocol domains for proofs/relay; no private wire export.
3. **Economy fidelity** — locked Master Guide BigInt rules (DG2); unresolved gates fail closed.
4. **Solana honesty** — read-only only; never fabricate write success.
5. **Standalone package** — no private git history; publication allowlist enforced.
