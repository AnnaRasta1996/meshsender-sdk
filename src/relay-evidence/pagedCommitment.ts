/**
 * Relay Evidence — ILLUSTRATIVE paged evidence + rolling SHA-256 commitments.
 * Verification requires independently supplied expected signer identities per hop.
 */

import { Readiness } from '../readiness.js';
import { isSha256Hex, sha256Hex, utf8Bytes } from '../crypto/sha256.js';
import {
  decodePublicKeyB64,
  signUtf8Detached,
  verifyUtf8Detached,
  type DemoKeyPair,
} from '../crypto/ed25519.js';

export const RELAY_EVIDENCE_READINESS = Readiness.VERIFIED_SYNTHETIC;
export const SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN =
  'meshsender.sdk.demo.relay-route-seed.v1' as const;
export const SDK_DEMO_RELAY_LEAF_DOMAIN = 'meshsender.sdk.demo.relay-leaf.v1' as const;
export const SDK_DEMO_RELAY_FOLD_DOMAIN = 'meshsender.sdk.demo.relay-fold.v1' as const;

export type DemoRelayHop = Readonly<{
  absoluteRelayIndex: number;
  relayNodeId: string;
  previousNodeId: string;
  forwardedAtMs: number;
  ingressTransport: string;
  signerPublicKeyB64: string;
  signatureB64: string;
  rewardRawDecimal: string;
}>;

export type DemoRelayPage = Readonly<{
  pageIndex: number;
  firstAbsoluteRelayIndex: number;
  incomingCommitmentHex: string;
  outgoingCommitmentHex: string;
  isFinalPage: boolean;
  hops: readonly DemoRelayHop[];
}>;

export type DemoRelayEvidenceBundle = Readonly<{
  readiness: typeof RELAY_EVIDENCE_READINESS;
  disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL';
  messageId: string;
  intentDigestHex: string;
  nonceB64: string;
  senderDigestHex: string;
  recipientDigestHex: string;
  routeSeedHex: string;
  rootCommitmentHex: string;
  pages: readonly DemoRelayPage[];
  verifiedHopCount: number;
}>;

function utf8ByteLength(value: string): number {
  return utf8Bytes(value).length;
}

function hopAttestationMessage(input: {
  messageId: string;
  hop: Omit<DemoRelayHop, 'signatureB64' | 'signerPublicKeyB64'>;
  signerPublicKeyB64: string;
}): string {
  return [
    SDK_DEMO_RELAY_LEAF_DOMAIN,
    `messageId=${input.messageId.trim()}`,
    `absoluteRelayIndex=${input.hop.absoluteRelayIndex}`,
    `relayNodeId=${input.hop.relayNodeId.trim()}`,
    `previousNodeId=${input.hop.previousNodeId.trim()}`,
    `forwardedAtMs=${input.hop.forwardedAtMs}`,
    `ingressTransport=${input.hop.ingressTransport}`,
    `signerPublicKeyB64=${input.signerPublicKeyB64.trim()}`,
    `rewardRawDecimal=${input.hop.rewardRawDecimal.trim()}`,
  ].join('\n');
}

export function computeRouteSeedHex(input: {
  messageId: string;
  intentDigestHex: string;
  nonceB64: string;
  senderDigestHex: string;
  recipientDigestHex: string;
}): string {
  return sha256Hex(
    [
      SDK_DEMO_RELAY_ROUTE_SEED_DOMAIN,
      `messageId=${input.messageId.trim()}`,
      `intentDigestHex=${input.intentDigestHex.trim().toLowerCase()}`,
      `nonceB64=${input.nonceB64.trim()}`,
      `senderDigestHex=${input.senderDigestHex.trim().toLowerCase()}`,
      `recipientDigestHex=${input.recipientDigestHex.trim().toLowerCase()}`,
    ].join('\n')
  );
}

export function computeLeafHex(hop: DemoRelayHop, messageId: string): string {
  return sha256Hex(
    [
      SDK_DEMO_RELAY_LEAF_DOMAIN,
      `messageId=${messageId}`,
      `absoluteRelayIndex=${hop.absoluteRelayIndex}`,
      `relayNodeId=${hop.relayNodeId}`,
      `previousNodeId=${hop.previousNodeId}`,
      `forwardedAtMs=${hop.forwardedAtMs}`,
      `ingressTransport=${hop.ingressTransport}`,
      `signerPublicKeyB64=${hop.signerPublicKeyB64}`,
      `signatureB64=${hop.signatureB64}`,
      `rewardRawDecimal=${hop.rewardRawDecimal}`,
    ].join('\n')
  );
}

export function foldCommitment(previousHex: string, leafHex: string): string {
  if (!isSha256Hex(previousHex) || !isSha256Hex(leafHex)) {
    throw new Error('COMMITMENT_HEX_INVALID');
  }
  return sha256Hex([SDK_DEMO_RELAY_FOLD_DOMAIN, previousHex, leafHex].join('\n'));
}

export function signDemoRelayHop(input: {
  messageId: string;
  hop: Omit<DemoRelayHop, 'signatureB64' | 'signerPublicKeyB64'>;
  signer: DemoKeyPair;
}): DemoRelayHop {
  if (!Number.isSafeInteger(input.hop.absoluteRelayIndex) || input.hop.absoluteRelayIndex < 0) {
    throw new Error('RELAY_INDEX_INVALID');
  }
  const msg = hopAttestationMessage({
    messageId: input.messageId,
    hop: input.hop,
    signerPublicKeyB64: input.signer.publicKeyB64,
  });
  return {
    ...input.hop,
    signerPublicKeyB64: input.signer.publicKeyB64,
    signatureB64: signUtf8Detached(msg, input.signer.secretKey),
  };
}

export function verifyDemoRelayHop(
  messageId: string,
  hop: DemoRelayHop,
  expectedSignerPublicKeyB64: string
): { ok: boolean; reason?: string } {
  const expected = expectedSignerPublicKeyB64.trim();
  if (!expected) return { ok: false, reason: 'EXPECTED_SIGNER_REQUIRED' };
  if (hop.signerPublicKeyB64.trim() !== expected) return { ok: false, reason: 'WRONG_SIGNER' };
  try {
    const pk = decodePublicKeyB64(expected);
    const msg = hopAttestationMessage({
      messageId,
      hop,
      signerPublicKeyB64: hop.signerPublicKeyB64,
    });
    return verifyUtf8Detached(msg, hop.signatureB64, pk)
      ? { ok: true }
      : { ok: false, reason: 'SIGNATURE_INVALID' };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION' };
  }
}

export function buildPagedRelayEvidence(input: {
  messageId: string;
  intentDigestHex: string;
  nonceB64: string;
  senderDigestHex: string;
  recipientDigestHex: string;
  hops: readonly DemoRelayHop[];
  expectedSignerPublicKeysB64: readonly string[];
  maxPageBodyBytes?: number;
}): DemoRelayEvidenceBundle {
  if (input.expectedSignerPublicKeysB64.length !== input.hops.length) {
    throw new Error('EXPECTED_SIGNERS_LENGTH_MISMATCH');
  }
  for (let i = 0; i < input.hops.length; i++) {
    const hop = input.hops[i]!;
    const v = verifyDemoRelayHop(
      input.messageId,
      hop,
      input.expectedSignerPublicKeysB64[i]!
    );
    if (!v.ok) throw new Error(`RELAY_HOP_INVALID:${i}:${v.reason}`);
  }

  const routeSeedHex = computeRouteSeedHex(input);
  const maxPageBodyBytes = input.maxPageBodyBytes ?? 28 * 1024;
  const pages: DemoRelayPage[] = [];
  let cursor = 0;
  let incoming = routeSeedHex;
  let pageIndex = 0;

  while (cursor < input.hops.length) {
    let trialOutgoing = incoming;
    let acceptedEnd = cursor;
    let end = cursor;
    while (end < input.hops.length) {
      const slice = input.hops.slice(cursor, end + 1);
      let rolling = incoming;
      for (const hop of slice) {
        rolling = foldCommitment(rolling, computeLeafHex(hop, input.messageId));
      }
      const trialPage = {
        pageIndex,
        firstAbsoluteRelayIndex: cursor,
        incomingCommitmentHex: incoming,
        outgoingCommitmentHex: rolling,
        isFinalPage: end === input.hops.length - 1,
        hops: slice,
      };
      const bytes = utf8ByteLength(JSON.stringify(trialPage));
      if (bytes > maxPageBodyBytes && slice.length > 1) break;
      if (bytes > maxPageBodyBytes && slice.length === 1) {
        throw new Error('SINGLE_HOP_EXCEEDS_PAGE_BUDGET');
      }
      trialOutgoing = rolling;
      acceptedEnd = end + 1;
      end += 1;
    }
    const hops = input.hops.slice(cursor, acceptedEnd);
    pages.push({
      pageIndex,
      firstAbsoluteRelayIndex: cursor,
      incomingCommitmentHex: incoming,
      outgoingCommitmentHex: trialOutgoing,
      isFinalPage: acceptedEnd === input.hops.length,
      hops,
    });
    incoming = trialOutgoing;
    cursor = acceptedEnd;
    pageIndex += 1;
  }

  return {
    readiness: RELAY_EVIDENCE_READINESS,
    disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
    messageId: input.messageId,
    intentDigestHex: input.intentDigestHex.trim().toLowerCase(),
    nonceB64: input.nonceB64.trim(),
    senderDigestHex: input.senderDigestHex.trim().toLowerCase(),
    recipientDigestHex: input.recipientDigestHex.trim().toLowerCase(),
    routeSeedHex,
    rootCommitmentHex: incoming,
    pages,
    verifiedHopCount: input.hops.length,
  };
}

/**
 * Complete synthetic paged-evidence verifier.
 */
export function verifyPagedRelayEvidence(input: {
  bundle: DemoRelayEvidenceBundle;
  expectedSignerPublicKeysB64: readonly string[];
  expectedRootCommitmentHex: string;
}): { ok: boolean; reason?: string; readiness: typeof RELAY_EVIDENCE_READINESS } {
  const b = input.bundle;
  if (b.disclosure !== 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL') {
    return { ok: false, reason: 'DISCLOSURE_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }
  const flat = b.pages.flatMap((p) => p.hops);
  if (flat.length !== input.expectedSignerPublicKeysB64.length) {
    return { ok: false, reason: 'SIGNER_COUNT_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }
  if (flat.length !== b.verifiedHopCount) {
    return { ok: false, reason: 'HOP_COUNT_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }

  // Ordered indices + route continuity
  for (let i = 0; i < flat.length; i++) {
    const hop = flat[i]!;
    if (hop.absoluteRelayIndex !== i) {
      return { ok: false, reason: `INDEX_GAP:${i}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    if (i === 0) {
      // first hop previous may be sender node id — checked by caller continuity if needed
    } else if (hop.previousNodeId !== flat[i - 1]!.relayNodeId) {
      return { ok: false, reason: `ROUTE_CONTINUITY:${i}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    const sig = verifyDemoRelayHop(b.messageId, hop, input.expectedSignerPublicKeysB64[i]!);
    if (!sig.ok) {
      return {
        ok: false,
        reason: `HOP_SIG:${i}:${sig.reason}`,
        readiness: RELAY_EVIDENCE_READINESS,
      };
    }
  }

  // Page boundaries
  let expectedIncoming = computeRouteSeedHex(b);
  if (expectedIncoming !== b.routeSeedHex) {
    return { ok: false, reason: 'ROUTE_SEED_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }
  for (let p = 0; p < b.pages.length; p++) {
    const page = b.pages[p]!;
    if (page.pageIndex !== p) {
      return { ok: false, reason: `PAGE_INDEX:${p}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    if (page.incomingCommitmentHex !== expectedIncoming) {
      return { ok: false, reason: `PAGE_INCOMING:${p}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    if (page.firstAbsoluteRelayIndex !== page.hops[0]?.absoluteRelayIndex) {
      return { ok: false, reason: `PAGE_FIRST_INDEX:${p}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    let rolling = page.incomingCommitmentHex;
    for (const hop of page.hops) {
      rolling = foldCommitment(rolling, computeLeafHex(hop, b.messageId));
    }
    if (rolling !== page.outgoingCommitmentHex) {
      return { ok: false, reason: `PAGE_OUTGOING:${p}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    const isLast = p === b.pages.length - 1;
    if (page.isFinalPage !== isLast) {
      return { ok: false, reason: `PAGE_FINAL_FLAG:${p}`, readiness: RELAY_EVIDENCE_READINESS };
    }
    expectedIncoming = rolling;
  }

  if (b.rootCommitmentHex !== expectedIncoming) {
    return { ok: false, reason: 'ROOT_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }
  if (b.rootCommitmentHex !== input.expectedRootCommitmentHex.trim().toLowerCase()) {
    return { ok: false, reason: 'EXPECTED_ROOT_MISMATCH', readiness: RELAY_EVIDENCE_READINESS };
  }
  return { ok: true, readiness: RELAY_EVIDENCE_READINESS };
}

/** Build relay hops strictly from a successful delivery route (intermediate relays). */
export function buildRelayHopsFromDeliveryRoute(input: {
  messageId: string;
  deliveryRoute: readonly string[];
  hopSigners: readonly DemoKeyPair[];
  forwardedAtMsByHop: readonly number[];
  ingressTransport?: string;
  /** Per-relay simulated payable raw decimal (sequential budget allocation). */
  rewardRawDecimalByHop: readonly string[];
}): { hops: DemoRelayHop[]; expectedSignerPublicKeysB64: string[] } {
  // Route: [sender, relay..., recipient]. Relays are intermediates only.
  if (input.deliveryRoute.length < 3) {
    throw new Error('DELIVERY_ROUTE_NEEDS_INTERMEDIATE_RELAY');
  }
  const relays = input.deliveryRoute.slice(1, -1);
  if (relays.length !== input.hopSigners.length) {
    throw new Error('HOP_SIGNER_COUNT_MISMATCH');
  }
  if (relays.length !== input.forwardedAtMsByHop.length) {
    throw new Error('HOP_TIME_COUNT_MISMATCH');
  }
  if (relays.length !== input.rewardRawDecimalByHop.length) {
    throw new Error('HOP_REWARD_COUNT_MISMATCH');
  }
  const hops: DemoRelayHop[] = [];
  const expectedSignerPublicKeysB64: string[] = [];
  for (let i = 0; i < relays.length; i++) {
    const hop = signDemoRelayHop({
      messageId: input.messageId,
      signer: input.hopSigners[i]!,
      hop: {
        absoluteRelayIndex: i,
        relayNodeId: relays[i]!,
        previousNodeId: input.deliveryRoute[i]!,
        forwardedAtMs: input.forwardedAtMsByHop[i]!,
        ingressTransport: input.ingressTransport ?? 'ble',
        rewardRawDecimal: input.rewardRawDecimalByHop[i]!,
      },
    });
    hops.push(hop);
    expectedSignerPublicKeysB64.push(input.hopSigners[i]!.publicKeyB64);
  }
  return { hops, expectedSignerPublicKeysB64 };
}
