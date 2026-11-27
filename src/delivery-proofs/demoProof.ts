/**
 * Delivery Proofs — ILLUSTRATIVE SDK demonstration protocol.
 * Uses synthetic Ed25519 keys/fixtures. Rejects tampering.
 * Production MeshSender wire formats are NOT exported here.
 */

import { Readiness } from '../readiness.js';
import {
  decodePublicKeyB64,
  generateDemoKeyPair,
  signUtf8Detached,
  verifyUtf8Detached,
  type DemoKeyPair,
} from '../crypto/ed25519.js';
import { isSha256Hex, sha256Hex } from '../crypto/sha256.js';

export const DELIVERY_PROOF_READINESS = Readiness.VERIFIED_SYNTHETIC;
export const SDK_DEMO_DELIVERY_PROOF_DOMAIN =
  'meshsender.sdk.demo.delivery-proof.v1' as const;

export type DemoTransport = 'ble' | 'wifi_direct' | 'lora' | 'internet' | 'unknown';

export type DemoDeliveryProofClaims = Readonly<{
  messageId: string;
  fromNodeId: string;
  toNodeId: string;
  deliveredAtMs: number;
  hops: number;
  ingressTransport: DemoTransport;
  payloadDigestHex: string;
}>;

export type DemoDeliveryProof = DemoDeliveryProofClaims &
  Readonly<{
    protocol: typeof SDK_DEMO_DELIVERY_PROOF_DOMAIN;
    signerPublicKeyB64: string;
    signatureB64: string;
    readiness: typeof DELIVERY_PROOF_READINESS;
    disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL';
  }>;

function buildCanonicalMessage(claims: DemoDeliveryProofClaims): string {
  return [
    SDK_DEMO_DELIVERY_PROOF_DOMAIN,
    claims.messageId.trim(),
    claims.fromNodeId.trim(),
    claims.toNodeId.trim(),
    String(claims.deliveredAtMs),
    String(claims.hops),
    claims.ingressTransport,
    claims.payloadDigestHex.trim().toLowerCase(),
  ].join('|');
}

export function createDemoDeliveryProof(input: {
  claims: DemoDeliveryProofClaims;
  signer: DemoKeyPair;
}): DemoDeliveryProof {
  if (!isSha256Hex(input.claims.payloadDigestHex.trim().toLowerCase())) {
    throw new Error('PAYLOAD_DIGEST_INVALID');
  }
  if (!Number.isSafeInteger(input.claims.hops) || input.claims.hops < 0) {
    throw new Error('HOPS_INVALID');
  }
  const message = buildCanonicalMessage(input.claims);
  const signatureB64 = signUtf8Detached(message, input.signer.secretKey);
  return {
    ...input.claims,
    payloadDigestHex: input.claims.payloadDigestHex.trim().toLowerCase(),
    protocol: SDK_DEMO_DELIVERY_PROOF_DOMAIN,
    signerPublicKeyB64: input.signer.publicKeyB64,
    signatureB64,
    readiness: DELIVERY_PROOF_READINESS,
    disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
  };
}

export function verifyDemoDeliveryProof(proof: DemoDeliveryProof): {
  ok: boolean;
  reason?: string;
  readiness: typeof DELIVERY_PROOF_READINESS;
} {
  if (proof.protocol !== SDK_DEMO_DELIVERY_PROOF_DOMAIN) {
    return { ok: false, reason: 'PROTOCOL_MISMATCH', readiness: DELIVERY_PROOF_READINESS };
  }
  if (!isSha256Hex(proof.payloadDigestHex)) {
    return { ok: false, reason: 'DIGEST_INVALID', readiness: DELIVERY_PROOF_READINESS };
  }
  if (!Number.isSafeInteger(proof.hops) || proof.hops < 0) {
    return { ok: false, reason: 'HOPS_INVALID', readiness: DELIVERY_PROOF_READINESS };
  }
  try {
    const pk = decodePublicKeyB64(proof.signerPublicKeyB64);
    const message = buildCanonicalMessage(proof);
    const ok = verifyUtf8Detached(message, proof.signatureB64, pk);
    return ok
      ? { ok: true, readiness: DELIVERY_PROOF_READINESS }
      : { ok: false, reason: 'SIGNATURE_INVALID', readiness: DELIVERY_PROOF_READINESS };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION', readiness: DELIVERY_PROOF_READINESS };
  }
}

export function tamperDemoDeliveryProof(
  proof: DemoDeliveryProof,
  patch: Partial<DemoDeliveryProofClaims>
): DemoDeliveryProof {
  return { ...proof, ...patch };
}

export function digestPayload(payload: string): string {
  return sha256Hex(payload);
}

export { generateDemoKeyPair };
