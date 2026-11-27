/**
 * Paradox Market — synthetic bilateral verification + direct-payment simulations.
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
import {
  ECONOMY_READINESS,
  marketBurnRawExactOrFail,
  parseDecimalToRational,
  rationalCpxToRawDg2,
  rawToCpxDecimal,
  PLATFORM_FEE,
  CPX_DECIMALS,
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
  exampleLabel: string;
  principalRaw: bigint;
  principalCpx: string;
  recipientReceivesRaw: bigint;
  recipientReceivesCpx: string;
  buyerExtraBurnRaw: bigint;
  buyerExtraBurnCpx: string;
  buyerExtraBurnRate: '0.10%';
  buyerTotalRaw: bigint;
  buyerTotalCpx: string;
  platformCommission: typeof PLATFORM_FEE;
  custodialEscrow: false;
  solFeesRentSeparateSubjectToApproval: true;
  housingRentRemainsEur: boolean;
  marketplaceOperationalClaim: 'NOT_CLAIMED_UNFINISHED_FEATURES_PENDING';
}>;

const CATEGORY_EXAMPLES: Record<
  MarketCategory,
  { exampleLabel: string; housingRentRemainsEur: boolean }
> = {
  product: {
    exampleLabel: 'Product example — peer goods sale (full principal to seller)',
    housingRentRemainsEur: false,
  },
  service: {
    exampleLabel: 'Service example — peer work/service payment (full principal to provider)',
    housingRentRemainsEur: false,
  },
  housing_guarantee: {
    exampleLabel:
      'Housing guarantee example — CPX guarantee only; ordinary rent remains EUR outside MeshSender',
    housingRentRemainsEur: true,
  },
};

function canonicalAgreementJson(draft: MarketAgreementDraft): string {
  return [
    SDK_DEMO_AGREEMENT_DOMAIN,
    `agreementId=${draft.agreementId.trim()}`,
    `category=${draft.category}`,
    `title=${draft.title.trim()}`,
    `principalCpxDecimal=${draft.principalCpxDecimal.trim()}`,
    `buyerNodeId=${draft.buyerNodeId.trim()}`,
    `sellerNodeId=${draft.sellerNodeId.trim()}`,
    `createdAtMs=${draft.createdAtMs}`,
    `rentRemainsEur=${draft.rentRemainsEur === true ? 'true' : 'false'}`,
    `notes=${(draft.notes ?? '').trim()}`,
  ].join('\n');
}

export function hashMarketAgreement(draft: MarketAgreementDraft): MarketAgreementHash {
  const canonicalJson = canonicalAgreementJson(draft);
  return { agreementHashHex: sha256Hex(canonicalJson), canonicalJson };
}

export function signAgreementHash(agreementHashHex: string, signer: DemoKeyPair): string {
  if (!isSha256Hex(agreementHashHex.trim().toLowerCase())) {
    throw new Error('AGREEMENT_HASH_INVALID');
  }
  const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|hash=${agreementHashHex.trim().toLowerCase()}`;
  return signUtf8Detached(msg, signer.secretKey);
}

export function verifyBilateralAgreement(input: {
  agreementHashHex: string;
  signatures: BilateralSignatures;
  expectedBuyerPublicKeyB64: string;
  expectedSellerPublicKeyB64: string;
}): { ok: boolean; reason?: string; readiness: typeof MARKET_READINESS } {
  const hash = input.agreementHashHex.trim().toLowerCase();
  if (!isSha256Hex(hash)) {
    return { ok: false, reason: 'AGREEMENT_HASH_INVALID', readiness: MARKET_READINESS };
  }
  const expectedBuyer = input.expectedBuyerPublicKeyB64.trim();
  const expectedSeller = input.expectedSellerPublicKeyB64.trim();
  if (!expectedBuyer || !expectedSeller) {
    return { ok: false, reason: 'EXPECTED_SIGNERS_REQUIRED', readiness: MARKET_READINESS };
  }
  if (expectedBuyer === expectedSeller) {
    return { ok: false, reason: 'SAME_PARTY_BILATERAL_REJECTED', readiness: MARKET_READINESS };
  }
  if (input.signatures.buyerPublicKeyB64.trim() !== expectedBuyer) {
    return { ok: false, reason: 'WRONG_BUYER_SIGNER', readiness: MARKET_READINESS };
  }
  if (input.signatures.sellerPublicKeyB64.trim() !== expectedSeller) {
    return { ok: false, reason: 'WRONG_SELLER_SIGNER', readiness: MARKET_READINESS };
  }
  const msg = `${SDK_DEMO_AGREEMENT_DOMAIN}|hash=${hash}`;
  try {
    const buyerOk = verifyUtf8Detached(
      msg,
      input.signatures.buyerSignatureB64,
      decodePublicKeyB64(expectedBuyer)
    );
    const sellerOk = verifyUtf8Detached(
      msg,
      input.signatures.sellerSignatureB64,
      decodePublicKeyB64(expectedSeller)
    );
    if (!buyerOk || !sellerOk) {
      return { ok: false, reason: 'SIGNATURE_INVALID', readiness: MARKET_READINESS };
    }
    return { ok: true, readiness: MARKET_READINESS };
  } catch {
    return { ok: false, reason: 'VERIFY_EXCEPTION', readiness: MARKET_READINESS };
  }
}

/** Require positive principal exactly representable in 6 decimals (fail-closed). */
export function quoteDirectMarketPayment(input: {
  category: MarketCategory;
  principalCpxDecimal: string;
}): MarketPaymentQuote {
  const rational = parseDecimalToRational(input.principalCpxDecimal);
  const converted = rationalCpxToRawDg2(rational);
  if (!converted.exact) {
    throw new Error('MARKET_PRINCIPAL_NOT_EXACTLY_REPRESENTABLE');
  }
  if (converted.raw <= 0n) {
    throw new Error('MARKET_PRINCIPAL_MUST_BE_POSITIVE');
  }
  // Reject >6 fractional digits already handled by exactness after DG2 only if exact.
  const parts = input.principalCpxDecimal.trim().split('.');
  const frac = parts[1] ?? '';
  if (frac.length > CPX_DECIMALS) {
    throw new Error('MARKET_PRINCIPAL_TOO_PRECISE');
  }
  const principalRaw = converted.raw;
  const burnRaw = marketBurnRawExactOrFail(principalRaw);
  const total = principalRaw + burnRaw;
  const cat = CATEGORY_EXAMPLES[input.category];
  return {
    readiness: ECONOMY_READINESS,
    category: input.category,
    exampleLabel: cat.exampleLabel,
    principalRaw,
    principalCpx: rawToCpxDecimal(principalRaw),
    recipientReceivesRaw: principalRaw,
    recipientReceivesCpx: rawToCpxDecimal(principalRaw),
    buyerExtraBurnRaw: burnRaw,
    buyerExtraBurnCpx: rawToCpxDecimal(burnRaw),
    buyerExtraBurnRate: '0.10%',
    buyerTotalRaw: total,
    buyerTotalCpx: rawToCpxDecimal(total),
    platformCommission: PLATFORM_FEE,
    custodialEscrow: false,
    solFeesRentSeparateSubjectToApproval: true,
    housingRentRemainsEur: cat.housingRentRemainsEur,
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
  verifyReason?: string;
  payment: MarketPaymentQuote;
} {
  if (input.buyer.publicKeyB64 === input.seller.publicKeyB64) {
    throw new Error('SAME_PARTY_BILATERAL_REJECTED');
  }
  const hash = hashMarketAgreement(input.draft);
  const signatures: BilateralSignatures = {
    buyerPublicKeyB64: input.buyer.publicKeyB64,
    sellerPublicKeyB64: input.seller.publicKeyB64,
    buyerSignatureB64: signAgreementHash(hash.agreementHashHex, input.buyer),
    sellerSignatureB64: signAgreementHash(hash.agreementHashHex, input.seller),
  };
  const v = verifyBilateralAgreement({
    agreementHashHex: hash.agreementHashHex,
    signatures,
    expectedBuyerPublicKeyB64: input.buyer.publicKeyB64,
    expectedSellerPublicKeyB64: input.seller.publicKeyB64,
  });
  const payment = quoteDirectMarketPayment({
    category: input.draft.category,
    principalCpxDecimal: input.draft.principalCpxDecimal,
  });
  return {
    readiness: MARKET_READINESS,
    hash,
    signatures,
    verified: v.ok,
    verifyReason: v.reason,
    payment,
  };
}

export { generateDemoKeyPair };
