/**
 * Relay Evidence — ILLUSTRATIVE paged evidence + rolling SHA-256 commitments.
 * Demonstrates individual contribution verification and large-N folding.
 * Private anti-fraud internals are NOT included.
 */

import { Readiness } from '../readiness.js';
import { isSha256Hex, sha256Hex } from '../crypto/sha256.js';
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
  routeSeedHex: string;
  rootCommitmentHex: string;
  pages: readonly DemoRelayPage[];
  verifiedHopCount: number;
}>;

function hopAttestationMessage(input: {
  messageId: string;
  hop: Omit<DemoRelayHop, 'signatureB64' | 'signerPublicKeyB64'>;
  signerPublicKeyB64: string;
}): string {
  return [
    SDK_DEMO_RELAY_LEAF_DOMAIN,
    input.messageId,
    String(input.hop.absoluteRelayIndex),
    input.hop.relayNodeId,
    input.hop.previousNodeId,
    String(input.hop.forwardedAtMs),
    input.hop.ingressTransport,
    input.signerPublicKeyB64,
    input.hop.rewardRawDecimal,
  ].join('|');
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
      input.messageId.trim(),
      input.intentDigestHex.trim().toLowerCase(),
      input.nonceB64.trim(),
      input.senderDigestHex.trim().toLowerCase(),
      input.recipientDigestHex.trim().toLowerCase(),
    ].join('\n')
  );
}

export function computeLeafHex(hop: DemoRelayHop, messageId: string): string {
  return sha256Hex(
    [
      SDK_DEMO_RELAY_LEAF_DOMAIN,
      messageId,
      String(hop.absoluteRelayIndex),
      hop.relayNodeId,
      hop.previousNodeId,
      String(hop.forwardedAtMs),
      hop.ingressTransport,
      hop.signerPublicKeyB64,
      hop.signatureB64,
      hop.rewardRawDecimal,
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

export function verifyDemoRelayHop(messageId: string, hop: DemoRelayHop): boolean {
  try {
    const pk = decodePublicKeyB64(hop.signerPublicKeyB64);
    const msg = hopAttestationMessage({
      messageId,
      hop,
      signerPublicKeyB64: hop.signerPublicKeyB64,
    });
    return verifyUtf8Detached(msg, hop.signatureB64, pk);
  } catch {
    return false;
  }
}

/**
 * Page by serialized byte budget (technical), never by an economic hop cap.
 */
export function buildPagedRelayEvidence(input: {
  messageId: string;
  intentDigestHex: string;
  nonceB64: string;
  senderDigestHex: string;
  recipientDigestHex: string;
  hops: readonly DemoRelayHop[];
  maxPageBodyBytes?: number;
}): DemoRelayEvidenceBundle {
  const maxPageBodyBytes = input.maxPageBodyBytes ?? 28 * 1024;
  for (const hop of input.hops) {
    if (!verifyDemoRelayHop(input.messageId, hop)) {
      throw new Error(`RELAY_HOP_SIGNATURE_INVALID:${hop.absoluteRelayIndex}`);
    }
  }

  const routeSeedHex = computeRouteSeedHex(input);
  const pages: DemoRelayPage[] = [];
  let cursor = 0;
  let incoming = routeSeedHex;
  let pageIndex = 0;
  let verifiedHopCount = 0;

  while (cursor < input.hops.length) {
    let end = cursor;
    let trialOutgoing = incoming;
    let acceptedEnd = cursor;

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
      const bytes = Buffer.byteLength(JSON.stringify(trialPage), 'utf8');
      if (bytes > maxPageBodyBytes && slice.length > 1) break;
      if (bytes > maxPageBodyBytes && slice.length === 1) {
        throw new Error('SINGLE_HOP_EXCEEDS_PAGE_BUDGET');
      }
      trialOutgoing = rolling;
      acceptedEnd = end + 1;
      end += 1;
      if (bytes > maxPageBodyBytes) break;
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
    verifiedHopCount += hops.length;
    incoming = trialOutgoing;
    cursor = acceptedEnd;
    pageIndex += 1;
  }

  return {
    readiness: RELAY_EVIDENCE_READINESS,
    disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
    messageId: input.messageId,
    routeSeedHex,
    rootCommitmentHex: incoming,
    pages,
    verifiedHopCount,
  };
}
