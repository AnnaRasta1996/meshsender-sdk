/**
 * Delivery Proofs — ILLUSTRATIVE SDK demonstration protocol.
 * Verification REQUIRES an independently supplied expected signer public key.
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

const TRANSPORTS = new Set<DemoTransport>([
  'ble',
  'wifi_direct',
  'lora',
  'internet',
  'unknown',
]);

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
    canonicalMessage: string;
  }>;

function assertClaims(claims: DemoDeliveryProofClaims): DemoDeliveryProofClaims {
  const messageId = claims.messageId.trim();
  const fromNodeId = claims.fromNodeId.trim();
  const toNodeId = claims.toNodeId.trim();
  const payloadDigestHex = claims.payloadDigestHex.trim().toLowerCase();
  if (!messageId || !fromNodeId || !toNodeId) throw new Error('CLAIMS_EMPTY_ID');
  if (!Number.isSafeInteger(claims.deliveredAtMs) || claims.deliveredAtMs < 0) {
    throw new Error('DELIVERED_AT_INVALID');
  }
  if (!Number.isSafeInteger(claims.hops) || claims.hops < 0) throw new Error('HOPS_INVALID');
  if (!TRANSPORTS.has(claims.ingressTransport)) throw new Error('TRANSPORT_INVALID');
  if (!isSha256Hex(payloadDigestHex)) throw new Error('PAYLOAD_DIGEST_INVALID');
  return {
    messageId,
    fromNodeId,
    toNodeId,
    deliveredAtMs: claims.deliveredAtMs,
    hops: claims.hops,
    ingressTransport: claims.ingressTransport,
    payloadDigestHex,
  };
}

/** Unambiguous canonical signed serialization (ordered fields, no JSON key reordering). */
export function buildCanonicalDeliveryMessage(claims: DemoDeliveryProofClaims): string {
  const c = assertClaims(claims);
  return [
    SDK_DEMO_DELIVERY_PROOF_DOMAIN,
    `messageId=${c.messageId}`,
    `fromNodeId=${c.fromNodeId}`,
    `toNodeId=${c.toNodeId}`,
    `deliveredAtMs=${c.deliveredAtMs}`,
    `hops=${c.hops}`,
    `ingressTransport=${c.ingressTransport}`,
    `payloadDigestHex=${c.payloadDigestHex}`,
  ].join('\n');
}

export function createDemoDeliveryProof(input: {
  claims: DemoDeliveryProofClaims;
  signer: DemoKeyPair;
}): DemoDeliveryProof {
  const claims = assertClaims(input.claims);
  const canonicalMessage = buildCanonicalDeliveryMessage(claims);
  return {
    ...claims,
    protocol: SDK_DEMO_DELIVERY_PROOF_DOMAIN,
    signerPublicKeyB64: input.signer.publicKeyB64,
    signatureB64: signUtf8Detached(canonicalMessage, input.signer.secretKey),
    readiness: DELIVERY_PROOF_READINESS,
    disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
    canonicalMessage,
  };
}

/**
 * Verify against an independently supplied expected signer identity.
 * Embedded signerPublicKeyB64 alone is insufficient authority.
 */
export function verifyDemoDeliveryProof(
  proof: DemoDeliveryProof,
  expectedSignerPublicKeyB64: string
): { ok: boolean; reason?: string; readiness: typeof DELIVERY_PROOF_READINESS } {
  if (proof.protocol !== SDK_DEMO_DELIVERY_PROOF_DOMAIN) {
    return { ok: false, reason: 'PROTOCOL_MISMATCH', readiness: DELIVERY_PROOF_READINESS };
  }
  let claims: DemoDeliveryProofClaims;
  try {
    claims = assertClaims(proof);
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : 'CLAIMS_INVALID',
      readiness: DELIVERY_PROOF_READINESS,
    };
  }
  const expected = expectedSignerPublicKeyB64.trim();
  if (!expected) {
    return { ok: false, reason: 'EXPECTED_SIGNER_REQUIRED', readiness: DELIVERY_PROOF_READINESS };
  }
  if (proof.signerPublicKeyB64.trim() !== expected) {
    return { ok: false, reason: 'WRONG_SIGNER', readiness: DELIVERY_PROOF_READINESS };
  }
  try {
    const pk = decodePublicKeyB64(expected);
    const message = buildCanonicalDeliveryMessage(claims);
    if (proof.canonicalMessage && proof.canonicalMessage !== message) {
      return { ok: false, reason: 'CANONICAL_MISMATCH', readiness: DELIVERY_PROOF_READINESS };
    }
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
  const nextClaims = { ...proof, ...patch };
  const canonicalMessage = (() => {
    try {
      return buildCanonicalDeliveryMessage(nextClaims);
    } catch {
      return proof.canonicalMessage;
    }
  })();
  return { ...proof, ...patch, canonicalMessage };
}

export function digestPayload(payload: string): string {
  return sha256Hex(payload);
}

export function createDeliveryProofFromSimulation(input: {
  messageId: string;
  fromNodeId: string;
  toNodeId: string;
  deliveredAtMs: number;
  hops: number;
  ingressTransport: DemoTransport;
  payloadDigestHex: string;
  recipientSigner: DemoKeyPair;
}): DemoDeliveryProof {
  return createDemoDeliveryProof({
    claims: {
      messageId: input.messageId,
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      deliveredAtMs: input.deliveredAtMs,
      hops: input.hops,
      ingressTransport: input.ingressTransport,
      payloadDigestHex: input.payloadDigestHex,
    },
    signer: input.recipientSigner,
  });
}

export { generateDemoKeyPair };
