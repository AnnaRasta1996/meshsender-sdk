/**
 * MeshSender Open SDK — Hackathon Flagship Edition
 * Public-safe modules only. MIT proposed for this package alone.
 */

export * from './readiness.js';

export * from './network-lab/offlineSimulation.js';
export * from './transport/adapters.js';
export * from './delivery-proofs/demoProof.js';
export * from './relay-evidence/pagedCommitment.js';
export * from './node-passport/publicIdentity.js';
export * from './solana/publicIdentifiers.js';
export * from './solana/mainnetReadOnly.js';
export * from './solana/publicRpcFetch.js';
export * from './economy/canonicalQuotes.js';
export * from './market/paradoxMarket.js';
export * from './pipeline/simulatedDeliveryPipeline.js';

export const SDK_NAME = '@meshsender/sdk' as const;
export const SDK_VERSION = '0.1.0-hackathon' as const;
export const SDK_EDITION = 'HACKATHON_FLAGSHIP' as const;
