/**
 * Dependency-free Solana public identifiers + RPC URL constants.
 * Safe for browser bundles — no @solana/web3.js, Buffer, or Node APIs.
 */

/** Canonical Chaos Paradox (CPX) mainnet mint. */
export const CPX_MAINNET_MINT_ADDRESS =
  '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X' as const;

/** Mesh settlement program ID (separate from the CPX SPL mint). */
export const MESHSENDER_PROGRAM_ID =
  'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg' as const;

export const CPX_DECIMALS_EXPECTED = 6 as const;
export const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as const;

/**
 * Official Solana Labs public mainnet RPC (docs: api.mainnet.solana.com).
 * Node/CLI: typically reachable. Browser origins (e.g. GitHub Pages) may receive HTTP 403.
 */
export const DEFAULT_MAINNET_RPC = 'https://api.mainnet.solana.com' as const;
/** Known-working public mainnet RPC (PublicNode) — preferred for browser mint reads. */
export const SECONDARY_MAINNET_RPC = 'https://solana-rpc.publicnode.com' as const;
/**
 * Independent browser-verified public mainnet RPC (no API key).
 * Used only when official api.mainnet.solana.com is blocked from the browser (HTTP 403).
 */
export const BROWSER_INDEPENDENT_SECONDARY_RPC =
  'https://solana-mainnet.gateway.tatum.io' as const;
