# Publication allowlist (exact)

Allowlist for this **public** Open SDK repository. MIT proposed for **this SDK package only**.
Private MeshSender product source is **not** covered and must stay out of this tree.
Future GitHub Pages redeploys still require owner `owner_approve_deploy`.

## Allowed

- `package.json`, `package-lock.json`, `tsconfig.json`
- `LICENSE`, `README.md`, `FEATURE_READINESS.md`, `DISCLOSURE_REVIEW.md`, `PUBLICATION_ALLOWLIST.md`
- `docs/**` including `docs/DEMO_VIDEO_GUIDE.md` (English product-video walkthrough)
- `src/**/*.ts`
- `tests/**/*.ts`
- `examples/**/*.ts`
- `playground/**` including generated `meshsender-sdk.bundle.js`, guided judge UI (`index.html`, `app.js`, `styles.css`), original `favicon.svg`, and `product-video-config.js` (owner YouTube URL; no MP4 binaries)
- `scripts/demo.ts`, `scripts/serve-playground.mjs`, `scripts/build-browser.mjs`, `scripts/playground-interact.ts`, `scripts/bundle-startup-check.mjs`
- `src/solana/publicIdentifiers.ts` (browser-safe mint/program/RPC constants)
- `.github/workflows/pages.yml` (manual dispatch; deploy gated by `owner_approve_deploy`; Pages not public until owner approval)
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
