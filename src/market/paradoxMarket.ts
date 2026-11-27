/**
 * Paradox Market — public agreement models + synthetic bilateral verification
 * + direct-payment simulations. No custodial escrow. Unfinished marketplace UX
 * is NOT claimed operational.
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
import {
  ECONOMY_READINESS,
  marketBurnRawExactOrFail,
  parseDecimalToRational,
  rationalCpxToRawDg2,
  rawToCpxDecimal,
  PLATFORM_FEE,
} from '../economy/canonicalQuotes.js';

export const MARKET_READINESS = Readiness.SIMULATED;
export const SDK_DEMO_AGREEMENT_DOMAIN = 'meshsender.sdk.demo.market-agreement.v1' as const;

export type MarketCategory = 'product' | 'service' | 'housing_guarantee';

export type MarketAgreementDraft = Readonly<{
  agreementId: string;
  category: MarketCategory;
  title: string;
  principalCpxDecimal: string;
  buyerNodeId: string;
  sellerNodeId: string;
  createdAtMs: number;
  rentRemainsEur?: true;
  notes?: string;
}>;

export type MarketAgreementHash = Readonly<{
  agreementHashHex: string;
  canonicalJson: string;
}>;

export type BilateralSignatures = Readonly<{
  buyerPublicKeyB64: string;
  sellerPublicKeyB64: string;
  buyerSignatureB64: string;
  sellerSignatureB64: string;
}>;

export type MarketPaymentQuote = Readonly<{
  readiness: typeof ECONOMY_READINESS;
  category: MarketCategory;
  principalRaw: bigint;
  principalCpx: string;
  recipientReceivesRaw: bigint;
  recipientReceivesCpx: string;
  buyerExtraBurnRaw: bigint;
  buyerExtraBurnCpx: string;
  buyerTotalRaw: bigint;
  buyerTotalCpx: string;
  platformCommission: typeof PLATFORM_FEE;
  custodialEscrow: false;
  marketplaceOperationalClaim: 'NOT_CLAIMED_UNFINISHED_FEATURES_PENDING';
}>;

function canonicalAgreementJson(draft: MarketAgreementDraft): string {
  return JSON.stringify({
    domain: SDK_DEMO_AGREEMENT_DOMAIN,
    agreementId: draft.agreementId,
    category: draft.category,
    title: draft.title,
    principalCpxDecimal: draft.principalCpxDecimal,
    buyerNodeId: draft.buyerNodeId,
    sellerNodeId: draft.sellerNodeId,
    createdAtMs: draft.createdAtMs,
    rentRemainsEur: draft.rentRemainsEur ?? null,
    notes: draft.notes ?? null,
  });
}

export function hashMarketAgreement(draft: MarketAgreementDraft): MarketAgreementHash {
  const canonicalJson = canonicalAgreementJson(draft);
  return { agreementHashHex: sha256Hex(canonicalJson), canonicalJson };
}

export function signAgreementHash(
  agreementHashHex: string,
  signer: DemoKeyPair
): string {
  const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|${agreementHashHex}`;
  return signUtf8Detached(msg, signer.secretKey);
}

export function verifyBilateralAgreement(input: {
  agreementHashHex: string;
  signatures: BilateralSignatures;
}): { ok: boolean; reason?: string; readiness: typeof MARKET_READINESS } {
  const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|${input.agreementHashHex}`;
  try {
    const buyerOk = verifyUtf8Detached(
      msg,
      input.signatures.buyerSignatureB64,
      decodePublicKeyB64(input.signatures.buyerPublicKeyB64)
    );
    const sellerOk = verifyUtf8Detached(
      msg,
      input.signatures.sellerSignatureB64,
      decodePublicKeyB64(input.signatures.sellerPublicKeyB64)
    );
    if (!buyerOk || !sellerOk) {
      return { ok: false, reason: 'SIGNATURE_INVALID', readiness: MARKET_READINESS };
    }
    return { ok: true, readiness: MARKET_READINESS };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION', readiness: MARKET_READINESS };
  }
}

export function quoteDirectMarketPayment(input: {
  category: MarketCategory;
  principalCpxDecimal: string;
}): MarketPaymentQuote {
  const rational = parseDecimalToRational(input.principalCpxDecimal);
  const converted = rationalCpxToRawDg2(rational);
  if (!converted.exact && rational.denominator !== 1n) {
    // DG2 applied for demo quote when needed; prefer exact principals in examples.
  }
  const principalRaw = converted.raw;
  const burnRaw = marketBurnRawExactOrFail(principalRaw);
  const total = principalRaw + burnRaw;
  return {
    readiness: ECONOMY_READINESS,
    category: input.category,
    principalRaw,
    principalCpx: rawToCpxDecimal(principalRaw),
    recipientReceivesRaw: principalRaw,
    recipientReceivesCpx: rawToCpxDecimal(principalRaw),
    buyerExtraBurnRaw: burnRaw,
    buyerExtraBurnCpx: rawToCpxDecimal(burnRaw),
    buyerTotalRaw: total,
    buyerTotalCpx: rawToCpxDecimal(total),
    platformCommission: PLATFORM_FEE,
    custodialEscrow: false,
    marketplaceOperationalClaim: 'NOT_CLAIMED_UNFINISHED_FEATURES_PENDING',
  };
}

export function simulateBilateralDeal(input: {
  draft: MarketAgreementDraft;
  buyer: DemoKeyPair;
  seller: DemoKeyPair;
}): {
  readiness: typeof MARKET_READINESS;
  hash: MarketAgreementHash;
  signatures: BilateralSignatures;
  verified: boolean;
  payment: MarketPaymentQuote;
} {
  const hash = hashMarketAgreement(input.draft);
  const signatures: BilateralSignatures = {
    buyerPublicKeyB64: input.buyer.publicKeyB64,
    sellerPublicKeyB64: input.seller.publicKeyB64,
    buyerSignatureB64: signAgreementHash(hash.agreementHashHex, input.buyer),
    sellerSignatureB64: signAgreementHash(hash.agreementHashHex, input.seller),
  };
  const verified = verifyBilateralAgreement({
    agreementHashHex: hash.agreementHashHex,
    signatures,
  }).ok;
  const payment = quoteDirectMarketPayment({
    category: input.draft.category,
    principalCpxDecimal: input.draft.principalCpxDecimal,
  });
  return { readiness: MARKET_READINESS, hash, signatures, verified, payment };
}

export { generateDemoKeyPair };
