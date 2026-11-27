/**
 * Node Passport — public identity verification demos + integration interfaces.
 * No seed recovery, secret derivation, Keychain, or production private material.
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
  disclosure: 'PUBLIC_VERIFY_DEMO_ONLY';
}>;

export interface NodePassportVerifier {
  verify(passport: PublicNodePassport): { ok: boolean; reason?: string };
}

function attestationMessage(input: {
  nodeId: string;
  signPublicKeyB64: string;
  identityDigestHex: string;
  issuedAtMs: number;
}): string {
  return [
    SDK_DEMO_PASSPORT_DOMAIN,
    input.nodeId.trim(),
    input.signPublicKeyB64.trim(),
    input.identityDigestHex.trim().toLowerCase(),
    String(input.issuedAtMs),
  ].join('|');
}

export function createDemoPublicPassport(input: {
  nodeId: string;
  signer: DemoKeyPair;
  issuedAtMs?: number;
}): PublicNodePassport {
  const issuedAtMs = input.issuedAtMs ?? Date.now();
  const identityDigestHex = sha256Hex(
    `${SDK_DEMO_PASSPORT_DOMAIN}|${input.nodeId}|${input.signer.publicKeyB64}`
  );
  const msg = attestationMessage({
    nodeId: input.nodeId,
    signPublicKeyB64: input.signer.publicKeyB64,
    identityDigestHex,
    issuedAtMs,
  });
  return {
    readiness: NODE_PASSPORT_READINESS,
    protocol: SDK_DEMO_PASSPORT_DOMAIN,
    nodeId: input.nodeId,
    signPublicKeyB64: input.signer.publicKeyB64,
    identityDigestHex,
    issuedAtMs,
    attestationB64: signUtf8Detached(msg, input.signer.secretKey),
    disclosure: 'PUBLIC_VERIFY_DEMO_ONLY',
  };
}

export function verifyPublicPassport(passport: PublicNodePassport): {
  ok: boolean;
  reason?: string;
  readiness: typeof NODE_PASSPORT_READINESS;
} {
  if (passport.protocol !== SDK_DEMO_PASSPORT_DOMAIN) {
    return { ok: false, reason: 'PROTOCOL_MISMATCH', readiness: NODE_PASSPORT_READINESS };
  }
  try {
    const pk = decodePublicKeyB64(passport.signPublicKeyB64);
    const expectedDigest = sha256Hex(
      `${SDK_DEMO_PASSPORT_DOMAIN}|${passport.nodeId}|${passport.signPublicKeyB64}`
    );
    if (expectedDigest !== passport.identityDigestHex.trim().toLowerCase()) {
      return { ok: false, reason: 'IDENTITY_DIGEST_MISMATCH', readiness: NODE_PASSPORT_READINESS };
    }
    const msg = attestationMessage(passport);
    const ok = verifyUtf8Detached(msg, passport.attestationB64, pk);
    return ok
      ? { ok: true, readiness: NODE_PASSPORT_READINESS }
      : { ok: false, reason: 'ATTESTATION_INVALID', readiness: NODE_PASSPORT_READINESS };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION', readiness: NODE_PASSPORT_READINESS };
  }
}

export function createPassportVerifier(): NodePassportVerifier {
  return {
    verify(passport) {
      const r = verifyPublicPassport(passport);
      return { ok: r.ok, reason: r.reason };
    },
  };
}

export { generateDemoKeyPair };
