/**
 * Feature readiness labels for judge / developer clarity.
 * Never claim LIVE write success, physical-device proof, or production settlement.
 */

export const Readiness = {
  LIVE_READ_ONLY: 'LIVE_READ_ONLY',
  VERIFIED_SYNTHETIC: 'VERIFIED_SYNTHETIC',
  SIMULATED: 'SIMULATED',
  PENDING: 'PENDING',
} as const;

export type ReadinessLabel = (typeof Readiness)[keyof typeof Readiness];

export type FeatureReadinessRow = Readonly<{
  feature: string;
  readiness: ReadinessLabel;
  notes: string;
}>;

export const FEATURE_READINESS_MATRIX: readonly FeatureReadinessRow[] = [
  {
    feature: 'Network Lab (offline store-carry-forward simulation)',
    readiness: Readiness.SIMULATED,
    notes: 'Deterministic synthetic topology/mobility/outages; no proprietary routing.',
  },
  {
    feature: 'Transport adapters (Internet / BLE / Wi-Fi Direct / LoRa)',
    readiness: Readiness.SIMULATED,
    notes: 'Public interfaces + simulated adapters. Physical hardware PENDING.',
  },
  {
    feature: 'Delivery proof crypto (Ed25519 + synthetic fixtures)',
    readiness: Readiness.VERIFIED_SYNTHETIC,
    notes: 'Illustrative SDK demo protocol. Production wire formats not exported.',
  },
  {
    feature: 'Relay evidence paging + rolling commitments',
    readiness: Readiness.VERIFIED_SYNTHETIC,
    notes: 'Illustrative commitment domains. No private anti-fraud internals.',
  },
  {
    feature: 'Node Passport public verify interfaces',
    readiness: Readiness.VERIFIED_SYNTHETIC,
    notes: 'Public identity demos only. No seeds/Keychain/recovery.',
  },
  {
    feature: 'Solana mainnet read-only (program / mint / balances / tx)',
    readiness: Readiness.LIVE_READ_ONLY,
    notes: 'Public RPC inspection only. No signing, spend, or deploy.',
  },
  {
    feature: 'Economy BigInt quotes (burn / relay / caps / referral / first-5000)',
    readiness: Readiness.VERIFIED_SYNTHETIC,
    notes: 'Locked Master Guide rules + DG2. No settlement execution engine.',
  },
  {
    feature: 'Paradox Market agreement + payment simulation',
    readiness: Readiness.SIMULATED,
    notes: 'Synthetic bilateral verify + 0.10% burn quote. Marketplace UX PENDING.',
  },
  {
    feature: 'Physical BLE / Wi-Fi Direct / LoRa devices',
    readiness: Readiness.PENDING,
    notes: 'Hardware adapters not shipped in this SDK.',
  },
  {
    feature: 'Production settlement / paid-mesh mainnet writes',
    readiness: Readiness.PENDING,
    notes: 'Economic gates remain OFF. Not part of this Open SDK.',
  },
  {
    feature: 'Two-device live agreement exchange (U54F8)',
    readiness: Readiness.PENDING,
    notes: 'Product remediation still pending.',
  },
] as const;
