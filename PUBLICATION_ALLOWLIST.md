# Publication allowlist (exact)

Owner must approve this list + MIT before any **public** open.

## Allowed

- `package.json`, `package-lock.json`, `tsconfig.json`
- `LICENSE`, `README.md`, `FEATURE_READINESS.md`, `DISCLOSURE_REVIEW.md`, `PUBLICATION_ALLOWLIST.md`
- `docs/**`
- `src/**/*.ts`
- `tests/**/*.ts`
- `examples/**/*.ts`
- `playground/**` including generated `meshsender-sdk.bundle.js`
- `scripts/demo.ts`, `scripts/serve-playground.mjs`, `scripts/build-browser.mjs`, `scripts/playground-interact.ts`
- `.github/workflows/pages.yml` (prepare-only; Pages not enabled)
- `.gitignore`

## Forbidden

- Private product repos / history (`secure-mesh-chat`, `smc-baseline-*`)
- Credentials, `.env*`, private wallet labels/addresses
- Native sources, proprietary routing/auth/anti-fraud/settlement engines
- Internal Master Guide / FOLDER OF THRUTH documents
- Source maps embedding private code
- Any `compare-economy-local` private helper

## Public identifiers allowed

- CPX mint `9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X`
- Program ID `GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg`
