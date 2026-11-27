# Publication allowlist (exact)

Only these paths are candidates for a future public `meshsender-sdk` repository.
Owner must approve this list + MIT before any public publish.

## Allowed

- `package.json`
- `package-lock.json` (after install)
- `tsconfig.json`
- `LICENSE`
- `README.md`
- `FEATURE_READINESS.md`
- `DISCLOSURE_REVIEW.md`
- `PUBLICATION_ALLOWLIST.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `src/**/*.ts`
- `tests/**/*.ts`
- `examples/**/*.ts`
- `playground/**/*`
- `scripts/demo.ts`
- `scripts/serve-playground.mjs`
- `.gitignore`

## Forbidden (never publish)

- Any path under `smc-baseline-review-*` / `secure-mesh-chat`
- `scripts/compare-economy-local.ts` (private cross-check helper)
- Private wallet labels/addresses, credentials, `.env*`
- Native Android/iOS/Rust sources
- Production auth, proprietary routing, anti-fraud internals, settlement engines
- Internal Master Guide / FOLDER OF THRUTH documents
- Source maps that embed private code
- Private git history / objects from the product repo
- Infrastructure endpoints beyond public Solana RPC + public mint/program IDs

## Public identifiers allowed

- CPX mint `9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X`
- Program ID `GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg`
