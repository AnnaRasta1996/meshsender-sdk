/**
 * Node Passport — synthetic possession-proof demos only.
 * Self-signatures prove key possession in fixtures — NOT production identity authority.
 */

import { Readiness } from '../readiness.js';
import {
  decodePublicKeyB64,
  generateDemoKeyPair,
  signUtf8Detached,
  verifyUtf8Detached,
  type DemoKeyPair,
} from '../crypto/ed25519.js';
import { sha256Hex } from '../crypto/sha256.js';

export const NODE_PASSPORT_READINESS = Readiness.VERIFIED_SYNTHETIC;
export const SDK_DEMO_PASSPORT_DOMAIN = 'meshsender.sdk.demo.node-passport.v1' as const;

export type PublicNodePassport = Readonly<{
  readiness: typeof NODE_PASSPORT_READINESS;
  protocol: typeof SDK_DEMO_PASSPORT_DOMAIN;
  nodeId: string;
  signPublicKeyB64: string;
  identityDigestHex: string;
  issuedAtMs: number;
  attestationB64: string;
  disclosure: 'SYNTHETIC_POSSESSION_PROOF_NOT_PRODUCTION_IDENTITY_AUTHORITY';
  authorityClaim: 'NONE_SYNTHETIC_DEMO_ONLY';
}>;

export interface NodePassportVerifier {
  verify(
    passport: PublicNodePassport,
    expectedSignerPublicKeyB64: string
  ): { ok: boolean; reason?: string };
}

function attestationMessage(input: {
  nodeId: string;
  signPublicKeyB64: string;
  identityDigestHex: string;
  issuedAtMs: number;
}): string {
  return [
    SDK_DEMO_PASSPORT_DOMAIN,
    `nodeId=${input.nodeId.trim()}`,
    `signPublicKeyB64=${input.signPublicKeyB64.trim()}`,
    `identityDigestHex=${input.identityDigestHex.trim().toLowerCase()}`,
    `issuedAtMs=${input.issuedAtMs}`,
  ].join('\n');
}

export function createDemoPublicPassport(input: {
  nodeId: string;
  signer: DemoKeyPair;
  issuedAtMs?: number;
}): PublicNodePassport {
  const issuedAtMs = input.issuedAtMs ?? 1;
  const nodeId = input.nodeId.trim();
  if (!nodeId) throw new Error('NODE_ID_REQUIRED');
  const identityDigestHex = sha256Hex(
    `${SDK_DEMO_PASSPORT_DOMAIN}|${nodeId}|${input.signer.publicKeyB64}`
  );
  const msg = attestationMessage({
    nodeId,
    signPublicKeyB64: input.signer.publicKeyB64,
    identityDigestHex,
    issuedAtMs,
  });
  return {
    readiness: NODE_PASSPORT_READINESS,
    protocol: SDK_DEMO_PASSPORT_DOMAIN,
    nodeId,
    signPublicKeyB64: input.signer.publicKeyB64,
    identityDigestHex,
    issuedAtMs,
    attestationB64: signUtf8Detached(msg, input.signer.secretKey),
    disclosure: 'SYNTHETIC_POSSESSION_PROOF_NOT_PRODUCTION_IDENTITY_AUTHORITY',
    authorityClaim: 'NONE_SYNTHETIC_DEMO_ONLY',
  };
}

export function verifyPublicPassport(
  passport: PublicNodePassport,
  expectedSignerPublicKeyB64: string
): {
  ok: boolean;
  reason?: string;
  readiness: typeof NODE_PASSPORT_READINESS;
  authority: 'SYNTHETIC_POSSESSION_PROOF_ONLY';
} {
  const authority = 'SYNTHETIC_POSSESSION_PROOF_ONLY' as const;
  if (passport.protocol !== SDK_DEMO_PASSPORT_DOMAIN) {
    return { ok: false, reason: 'PROTOCOL_MISMATCH', readiness: NODE_PASSPORT_READINESS, authority };
  }
  const expected = expectedSignerPublicKeyB64.trim();
  if (!expected) {
    return {
      ok: false,
      reason: 'EXPECTED_SIGNER_REQUIRED',
      readiness: NODE_PASSPORT_READINESS,
      authority,
    };
  }
  if (passport.signPublicKeyB64.trim() !== expected) {
    return { ok: false, reason: 'WRONG_SIGNER', readiness: NODE_PASSPORT_READINESS, authority };
  }
  try {
    const pk = decodePublicKeyB64(expected);
    const expectedDigest = sha256Hex(
      `${SDK_DEMO_PASSPORT_DOMAIN}|${passport.nodeId}|${passport.signPublicKeyB64}`
    );
    if (expectedDigest !== passport.identityDigestHex.trim().toLowerCase()) {
      return {
        ok: false,
        reason: 'IDENTITY_DIGEST_MISMATCH',
        readiness: NODE_PASSPORT_READINESS,
        authority,
      };
    }
    const msg = attestationMessage(passport);
    const ok = verifyUtf8Detached(msg, passport.attestationB64, pk);
    return ok
      ? { ok: true, readiness: NODE_PASSPORT_READINESS, authority }
      : { ok: false, reason: 'ATTESTATION_INVALID', readiness: NODE_PASSPORT_READINESS, authority };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION', readiness: NODE_PASSPORT_READINESS, authority };
  }
}

export function createPassportVerifier(): NodePassportVerifier {
  return {
    verify(passport, expectedSignerPublicKeyB64) {
      const r = verifyPublicPassport(passport, expectedSignerPublicKeyB64);
      return { ok: r.ok, reason: r.reason };
    },
  };
}

export { generateDemoKeyPair };
