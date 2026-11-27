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

/** Public mainnet-beta RPC (literal — no clusterApiUrl / web3 dependency). */
export const DEFAULT_MAINNET_RPC = 'https://api.mainnet-beta.solana.com' as const;
export const SECONDARY_MAINNET_RPC = 'https://solana-rpc.publicnode.com' as const;
