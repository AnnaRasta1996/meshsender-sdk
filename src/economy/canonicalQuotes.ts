/**
 * Economy — BigInt/rational arithmetic mirroring locked Master Guide rules.
 * Simulation / quoting only. No private settlement execution engine.
 * Unresolved decisions (DG1 genesis, DG3 weight use) are explicitly blocked.
 */

import { Readiness } from '../readiness.js';

export const ECONOMY_READINESS = Readiness.VERIFIED_SYNTHETIC;

export const CPX_DECIMALS = 6 as const;
export const CPX_RAW_SCALE = 1_000_000n;
export const OFFLINE_SERVICE_BURN_EUR = '0.0005' as const;
export const RELAY_REWARD_EUR_TARGET = '0.005' as const;
export const RELAY_REWARD_CPX_CEILING_RAW = 1_000_000n;
export const NODE_REWARD_CAP_RAW = 1_000n * CPX_RAW_SCALE;
export const GLOBAL_BUDGET_NUMERATOR = 5n;
export const GLOBAL_BUDGET_DENOMINATOR = 10_000n;
export const MARKET_BURN_NUMERATOR = 1n;
export const MARKET_BURN_DENOMINATOR = 1_000n;
export const REFERRAL_REFERRER_NUM = 3n;
export const REFERRAL_REFERRER_DEN = 100n;
export const REFERRAL_RELAY_NUM = 97n;
export const REFERRAL_RELAY_DEN = 100n;
export const REFERRAL_MAX_EDGES = 5 as const;
export const FIRST5000_NODE_COUNT = 5_000 as const;
export const FIRST5000_PER_NODE_RAW = 100n * CPX_RAW_SCALE;
export const FIRST5000_TOTAL_RAW = 500_000n * CPX_RAW_SCALE;
export const REWARD_PERIOD_DURATION_MS = 30n * 24n * 60n * 60n * 1000n;
export const DG2_RULE = 'nearest_representable_6_decimals_ties_round_up' as const;
export const PLATFORM_FEE = 0 as const;
/** Master Guide: Internet messaging and receiving are free (0 CPX). */
export const ONLINE_MESSAGING_CPX_RAW = 0n;
export const ONLINE_RECEIVING_CPX_RAW = 0n;
/** Master Guide: normal wallet→wallet app burn is 0; only real SOL fees/rent. */
export const WALLET_TO_WALLET_APP_BURN_RAW = 0n;
/** DG10: relay node pays 0 SOL; sender-approved SOL fees/rent are separate. */
export const RELAY_SOL_EXPENSE = 0 as const;
export const ECONOMY_SIMULATION_DISCLAIMER =
  'HYPOTHETICAL_SIMULATION_INPUTS_NOT_LIVE_PRICING_OR_PAYOUT' as const;

export type ExactRational = Readonly<{ numerator: bigint; denominator: bigint }>;
export type DivRem = Readonly<{
  quotient: bigint;
  remainder: bigint;
  dividend: bigint;
  divisor: bigint;
}>;

function assertPositiveDenominator(d: bigint): void {
  if (d <= 0n) throw new Error('ECONOMY_DENOMINATOR_MUST_BE_POSITIVE');
}
function assertNonNegative(v: bigint, label: string): void {
  if (v < 0n) throw new Error(`ECONOMY_NEGATIVE:${label}`);
}
function divRem(dividend: bigint, divisor: bigint): DivRem {
  assertPositiveDenominator(divisor);
  assertNonNegative(dividend, 'dividend');
  return {
    quotient: dividend / divisor,
    remainder: dividend % divisor,
    dividend,
    divisor,
  };
}
function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

export function reduceRational(r: ExactRational): ExactRational {
  assertPositiveDenominator(r.denominator);
  assertNonNegative(r.numerator, 'numerator');
  const g = gcd(r.numerator, r.denominator);
  return { numerator: r.numerator / g, denominator: r.denominator / g };
}

export function parseDecimalToRational(decimal: string): ExactRational {
  const trimmed = decimal.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`ECONOMY_INVALID_DECIMAL:${decimal}`);
  }
  const parts = trimmed.split('.');
  const whole = parts[0] ?? '0';
  const frac = parts[1] ?? '';
  const denominator = frac.length === 0 ? 1n : 10n ** BigInt(frac.length);
  const numerator = BigInt(whole) * denominator + BigInt(frac === '' ? '0' : frac);
  return reduceRational({ numerator, denominator });
}

export function rawToCpxDecimal(raw: bigint): string {
  assertNonNegative(raw, 'raw');
  const whole = raw / CPX_RAW_SCALE;
  const frac = raw % CPX_RAW_SCALE;
  return `${whole}.${frac.toString().padStart(CPX_DECIMALS, '0')}`;
}

/** DG2 locked: nearest 6-decimal raw; exact half ties round upward. */
export function rationalCpxToRawDg2(rationalCpx: ExactRational): {
  ok: true;
  raw: bigint;
  exact: boolean;
} {
  assertPositiveDenominator(rationalCpx.denominator);
  assertNonNegative(rationalCpx.numerator, 'numerator');
  const rem = divRem(rationalCpx.numerator * CPX_RAW_SCALE, rationalCpx.denominator);
  if (rem.remainder === 0n) return { ok: true, raw: rem.quotient, exact: true };
  const raw = rem.remainder * 2n >= rem.divisor ? rem.quotient + 1n : rem.quotient;
  return { ok: true, raw, exact: false };
}

export function offlineServiceBurnCpxRawFromEurPriceDecimal(cpxEurPriceDecimal: string): {
  ok: true;
  serviceBurnCpxRaw: bigint;
  exact: boolean;
  roundingRule: typeof DG2_RULE;
} {
  const price = parseDecimalToRational(cpxEurPriceDecimal);
  if (price.numerator === 0n) throw new Error('ECONOMY_PRICE_MUST_BE_POSITIVE');
  const burnEur = parseDecimalToRational(OFFLINE_SERVICE_BURN_EUR);
  const exactCpx = reduceRational({
    numerator: burnEur.numerator * price.denominator,
    denominator: burnEur.denominator * price.numerator,
  });
  const converted = rationalCpxToRawDg2(exactCpx);
  if (converted.raw <= 0n) throw new Error('ECONOMY_OFFLINE_BURN_ZERO_RAW');
  return {
    ok: true,
    serviceBurnCpxRaw: converted.raw,
    exact: converted.exact,
    roundingRule: DG2_RULE,
  };
}

export function nominalRelayRewardCpxRawFromEurPriceDecimal(cpxEurPriceDecimal: string): {
  ok: true;
  nominalRewardCpxRaw: bigint;
  exactRaw: boolean;
  rewardSource: 'REWARD_RESERVE';
  senderFundsRelayCpx: false;
} {
  const price = parseDecimalToRational(cpxEurPriceDecimal);
  if (price.numerator === 0n) throw new Error('ECONOMY_PRICE_MUST_BE_POSITIVE');
  const eur = parseDecimalToRational(RELAY_REWARD_EUR_TARGET);
  let uncapped = reduceRational({
    numerator: eur.numerator * price.denominator,
    denominator: eur.denominator * price.numerator,
  });
  if (uncapped.numerator > uncapped.denominator) {
    uncapped = { numerator: 1n, denominator: 1n };
  }
  const converted = rationalCpxToRawDg2(uncapped);
  if (converted.raw > RELAY_REWARD_CPX_CEILING_RAW) {
    throw new Error('ECONOMY_NOMINAL_ABOVE_CEILING');
  }
  return {
    ok: true,
    nominalRewardCpxRaw: converted.raw,
    exactRaw: converted.exact,
    rewardSource: 'REWARD_RESERVE',
    senderFundsRelayCpx: false,
  };
}

export function nodeRemainingRaw(alreadyEarnedRaw: bigint): bigint {
  assertNonNegative(alreadyEarnedRaw, 'alreadyEarnedRaw');
  const rem = NODE_REWARD_CAP_RAW - alreadyEarnedRaw;
  return rem > 0n ? rem : 0n;
}

export function nodeCapLimitedNominalRaw(input: {
  nominalRewardRaw: bigint;
  alreadyCountedNodePeriodRaw: bigint;
}): { ok: true; nodeCapLimitedNominalRaw: bigint; nodeRemainingRaw: bigint } {
  if (input.nominalRewardRaw < 0n || input.nominalRewardRaw > RELAY_REWARD_CPX_CEILING_RAW) {
    throw new Error('ECONOMY_NOMINAL_OUT_OF_RANGE');
  }
  if (
    input.alreadyCountedNodePeriodRaw < 0n ||
    input.alreadyCountedNodePeriodRaw > NODE_REWARD_CAP_RAW
  ) {
    throw new Error('ECONOMY_COUNTED_OUT_OF_RANGE');
  }
  const remaining = nodeRemainingRaw(input.alreadyCountedNodePeriodRaw);
  const limited =
    input.nominalRewardRaw < remaining ? input.nominalRewardRaw : remaining;
  return { ok: true, nodeCapLimitedNominalRaw: limited, nodeRemainingRaw: remaining };
}

/** floor(reserve * 0.05%) — never rounds upward past the 0.05% hard cap. */
export function globalPeriodPoolHardCapRaw(rewardReserveRawAtPeriodStart: bigint): bigint {
  return divRem(
    rewardReserveRawAtPeriodStart * GLOBAL_BUDGET_NUMERATOR,
    GLOBAL_BUDGET_DENOMINATOR
  ).quotient;
}

/** Pure 97/3 percentage calculation only — not a payable allocation. */
export function referralSplitRawExactOrFail(actualRewardRaw: bigint): {
  referrerRaw: bigint;
  relayRaw: bigint;
} {
  assertNonNegative(actualRewardRaw, 'actualRewardRaw');
  const rem = divRem(actualRewardRaw * REFERRAL_REFERRER_NUM, REFERRAL_REFERRER_DEN);
  if (rem.remainder !== 0n) {
    throw new Error(`ECONOMY_REFERRAL_INEXACT_RAW:rem=${rem.remainder}`);
  }
  return { referrerRaw: rem.quotient, relayRaw: actualRewardRaw - rem.quotient };
}

/** Alias: pure percentage calculation distinct from simulated payable allocation. */
export const referralPercentageSplitExactOrFail = referralSplitRawExactOrFail;

/** Canonical DG4/U35 blocked outcome when referrer unified cap cannot cover 3%. */
export const REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED =
  'U35_REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED' as const;

export type ReferralEligibility = Readonly<{
  /** Explicit opt-in. Never invent automatic referral. */
  hasValidReferralRelationship: boolean;
  /** Valid referred-node count for this referrer (max 5). */
  validReferredCountForReferrer?: number;
  /**
   * Combined relay+referral already counted for referrer in the common period.
   * Required when eligible. `null` / omitted = missing cap input (not unlimited).
   */
  alreadyCountedReferrerPeriodRaw?: bigint | null;
}>;

export type ReferralPercentageSplit = Readonly<{
  referrerRaw: bigint;
  relayRaw: bigint;
}>;

export type ReferralQuoteResult =
  | Readonly<{
      applied: true;
      levels: 1;
      referrerRaw: bigint;
      relayRaw: bigint;
      percentageSplit: ReferralPercentageSplit;
      maxValidReferrals: typeof REFERRAL_MAX_EDGES;
      countsInsideUnifiedNodeCap: true;
      referrerAlreadyCountedRaw: bigint;
      referrerRemainingRaw: bigint;
    }>
  | Readonly<{
      applied: false;
      reason:
        | 'NO_AUTOMATIC_REFERRAL'
        | 'REFERRAL_NOT_ELIGIBLE'
        | 'REFERRAL_MAX_EDGES_EXCEEDED'
        | 'REFERRAL_COUNT_INVALID'
        | 'MISSING_REFERRER_CAP_INPUT'
        | 'REFERRER_COUNTED_ABOVE_CAP'
        | typeof REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED
        | string;
      referrerRaw: 0n;
      /** When cap/owner-decision blocked, stays 0 — never silently redistribute. */
      relayRaw: bigint;
      percentageSplit?: ReferralPercentageSplit;
      referrerAlreadyCountedRaw?: bigint;
      referrerRemainingRaw?: bigint;
      ownerDecisionRequired?: boolean;
    }>;

/**
 * Conditional eligible referral only (97/3, one level, max five).
 * Validates referrer unified 1000 CPX remaining before applying allocation.
 * Pure percentage ≠ actual simulated payable allocation.
 * No automatic referral. Inexact / missing cap / insufficient cap → blocked.
 */
export function conditionalReferralSplit(input: {
  actualPayableRaw: bigint;
  eligibility?: ReferralEligibility;
}): ReferralQuoteResult {
  assertNonNegative(input.actualPayableRaw, 'actualPayableRaw');
  const eligible = input.eligibility;
  if (!eligible || !eligible.hasValidReferralRelationship) {
    return {
      applied: false,
      reason: eligible ? 'REFERRAL_NOT_ELIGIBLE' : 'NO_AUTOMATIC_REFERRAL',
      referrerRaw: 0n,
      relayRaw: input.actualPayableRaw,
    };
  }
  const count = eligible.validReferredCountForReferrer;
  if (count === undefined || !Number.isInteger(count) || count < 1) {
    return {
      applied: false,
      reason: 'REFERRAL_COUNT_INVALID',
      referrerRaw: 0n,
      relayRaw: 0n, // never silent redistribute on invalid referral input
    };
  }
  if (count > REFERRAL_MAX_EDGES) {
    return {
      applied: false,
      reason: 'REFERRAL_MAX_EDGES_EXCEEDED',
      referrerRaw: 0n,
      relayRaw: 0n, // never silent redistribute when max five exceeded
    };
  }
  const counted = eligible.alreadyCountedReferrerPeriodRaw;
  if (counted === undefined || counted === null) {
    return {
      applied: false,
      reason: 'MISSING_REFERRER_CAP_INPUT',
      referrerRaw: 0n,
      relayRaw: 0n,
      ownerDecisionRequired: true,
    };
  }
  if (counted < 0n) {
    return {
      applied: false,
      reason: 'INVALID_REFERRER_COUNTED_RAW',
      referrerRaw: 0n,
      relayRaw: 0n,
      ownerDecisionRequired: true,
    };
  }
  if (counted > NODE_REWARD_CAP_RAW) {
    return {
      applied: false,
      reason: 'REFERRER_COUNTED_ABOVE_CAP',
      referrerRaw: 0n,
      relayRaw: 0n,
      referrerAlreadyCountedRaw: counted,
      referrerRemainingRaw: 0n,
      ownerDecisionRequired: true,
    };
  }
  let percentageSplit: ReferralPercentageSplit;
  try {
    percentageSplit = referralPercentageSplitExactOrFail(input.actualPayableRaw);
  } catch (e) {
    return {
      applied: false,
      reason: e instanceof Error ? e.message : String(e),
      referrerRaw: 0n,
      relayRaw: 0n,
      ownerDecisionRequired: true,
    };
  }
  const referrerRemainingRaw = nodeRemainingRaw(counted);
  if (percentageSplit.referrerRaw > referrerRemainingRaw) {
    return {
      applied: false,
      reason: REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED,
      referrerRaw: 0n,
      relayRaw: 0n,
      percentageSplit,
      referrerAlreadyCountedRaw: counted,
      referrerRemainingRaw,
      ownerDecisionRequired: true,
    };
  }
  return {
    applied: true,
    levels: 1,
    referrerRaw: percentageSplit.referrerRaw,
    relayRaw: percentageSplit.relayRaw,
    percentageSplit,
    maxValidReferrals: REFERRAL_MAX_EDGES,
    countsInsideUnifiedNodeCap: true,
    referrerAlreadyCountedRaw: counted,
    referrerRemainingRaw,
  };
}

/** Failed/expired delivery: zero service burn and zero relay rewards. */
export function quoteFailedOfflineDeliveryEconomy(): {
  readiness: typeof ECONOMY_READINESS;
  offlineBurnRaw: 0n;
  offlineBurnCpx: string;
  totalRelayPayableRaw: 0n;
  perRelayPayableRaw: readonly [];
  referral: ReferralQuoteResult;
  simulationDisclaimer: typeof ECONOMY_SIMULATION_DISCLAIMER;
  reason: 'FAILED_OR_EXPIRED_DELIVERY_ZERO_BURN_ZERO_REWARDS';
} {
  return {
    readiness: ECONOMY_READINESS,
    offlineBurnRaw: 0n,
    offlineBurnCpx: rawToCpxDecimal(0n),
    totalRelayPayableRaw: 0n,
    perRelayPayableRaw: [],
    referral: {
      applied: false,
      reason: 'NO_AUTOMATIC_REFERRAL',
      referrerRaw: 0n,
      relayRaw: 0n,
    },
    simulationDisclaimer: ECONOMY_SIMULATION_DISCLAIMER,
    reason: 'FAILED_OR_EXPIRED_DELIVERY_ZERO_BURN_ZERO_REWARDS',
  };
}

export function walletToWalletAppBurnRaw(principalCpxRaw: bigint): typeof WALLET_TO_WALLET_APP_BURN_RAW {
  assertNonNegative(principalCpxRaw, 'principalCpxRaw');
  return WALLET_TO_WALLET_APP_BURN_RAW;
}

export function marketBurnRawExactOrFail(principalCpxRaw: bigint): bigint {
  assertNonNegative(principalCpxRaw, 'principalCpxRaw');
  const rem = divRem(principalCpxRaw * MARKET_BURN_NUMERATOR, MARKET_BURN_DENOMINATOR);
  if (rem.remainder !== 0n) {
    throw new Error(`ECONOMY_MARKET_BURN_INEXACT_RAW:rem=${rem.remainder}`);
  }
  return rem.quotient;
}

export function first5000Allocation(): {
  nodeCount: typeof FIRST5000_NODE_COUNT;
  perNodeRaw: typeof FIRST5000_PER_NODE_RAW;
  totalRaw: typeof FIRST5000_TOTAL_RAW;
  insideGlobalPool: false;
} {
  return {
    nodeCount: FIRST5000_NODE_COUNT,
    perNodeRaw: FIRST5000_PER_NODE_RAW,
    totalRaw: FIRST5000_TOTAL_RAW,
    insideGlobalPool: false,
  };
}

/**
 * DG1 OPEN — production genesis must be supplied explicitly.
 * Never invent launch/deploy/now as hidden default.
 */
export function deriveCommonRewardPeriodId(input: {
  genesisUtcMs: bigint;
  trustedTimestampMs: bigint;
}): { ok: true; periodId: bigint } | { ok: false; reason: string } {
  if (input.genesisUtcMs === null || input.genesisUtcMs === undefined) {
    return { ok: false, reason: 'DG1_GENESIS_UNRESOLVED' };
  }
  if (input.trustedTimestampMs < input.genesisUtcMs) {
    return { ok: false, reason: 'BEFORE_GENESIS' };
  }
  const delta = input.trustedTimestampMs - input.genesisUtcMs;
  return { ok: true, periodId: delta / REWARD_PERIOD_DURATION_MS };
}

/** DG3 high-confidence 1.25× weight use is OPEN — block silent application. */
export function applyHighConfidenceWeightOrBlock(_input: {
  baseRaw: bigint;
  apply125x: boolean;
}): never | { ok: true; raw: bigint } {
  throw new Error('DG3_HIGH_CONFIDENCE_WEIGHT_USE_UNRESOLVED');
}

export type ReferralAllocationStatus =
  | 'REFERRAL_APPLIED'
  | 'NO_REFERRAL_RELAY_FULL'
  | 'BLOCKED_OWNER_DECISION_REQUIRED'
  | 'INVALID_REFERRAL_BLOCKED';

export type EconomyQuoteBundle = Readonly<{
  readiness: typeof ECONOMY_READINESS;
  cpxEurPrice: string;
  simulationDisclaimer: typeof ECONOMY_SIMULATION_DISCLAIMER;
  onlineMessagingCpxRaw: typeof ONLINE_MESSAGING_CPX_RAW;
  onlineReceivingCpxRaw: typeof ONLINE_RECEIVING_CPX_RAW;
  offlineBurnEurTarget: typeof OFFLINE_SERVICE_BURN_EUR;
  offlineBurnRaw: bigint;
  offlineBurnCpx: string;
  nominalRelayEurTarget: typeof RELAY_REWARD_EUR_TARGET;
  nominalRelayRaw: bigint;
  nominalRelayCpx: string;
  nominalRelayFormula: 'min(1_CPX, EUR_0.005 / settlement_price)';
  rewardSource: 'REWARD_RESERVE';
  senderFundsRelayCpx: false;
  nodeCapRaw: typeof NODE_REWARD_CAP_RAW;
  nodeCapPeriodMs: typeof REWARD_PERIOD_DURATION_MS;
  nodeLimitedRaw: bigint;
  globalBudgetRate: '0.05%_of_reserve_remaining_at_period_start';
  globalPoolHardCapRaw: bigint;
  referral: ReferralQuoteResult;
  /** Pre-referral capped quote (node+global). Not final allocated payout when referral blocked. */
  preReferralPayableRaw: bigint;
  finalAllocatedReferrerRaw: bigint;
  finalAllocatedRelayRaw: bigint;
  finalAllocatedTotalRaw: bigint;
  allocationStatus: ReferralAllocationStatus;
  first5000: ReturnType<typeof first5000Allocation>;
  walletToWalletAppBurnRaw: typeof WALLET_TO_WALLET_APP_BURN_RAW;
  relaySolExpense: typeof RELAY_SOL_EXPENSE;
  senderApprovedSolFeesSeparate: true;
  platformFee: typeof PLATFORM_FEE;
  settlementExecution: 'BLOCKED_NOT_IN_OPEN_SDK';
}>;

/** Explicit referral requested but count invalid or > max five. */
export function isInvalidReferralInput(referral: ReferralQuoteResult): boolean {
  if (referral.applied) return false;
  return (
    referral.reason === 'REFERRAL_COUNT_INVALID' ||
    referral.reason === 'REFERRAL_MAX_EDGES_EXCEEDED'
  );
}

/** True when eligible referral cannot become an approved allocation (cap/inexact/missing/invalid). */
export function isReferralAllocationBlocked(referral: ReferralQuoteResult): boolean {
  if (referral.applied) return false;
  if (isInvalidReferralInput(referral)) return true;
  if (referral.ownerDecisionRequired) return true;
  const reason = referral.reason;
  return (
    reason === 'MISSING_REFERRER_CAP_INPUT' ||
    reason === REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED ||
    reason === 'REFERRER_COUNTED_ABOVE_CAP' ||
    reason === 'INVALID_REFERRER_COUNTED_RAW' ||
    String(reason).includes('INEXACT')
  );
}

export function deriveReferralAllocation(
  preReferralPayableRaw: bigint,
  referral: ReferralQuoteResult
): {
  allocationStatus: ReferralAllocationStatus;
  finalAllocatedReferrerRaw: bigint;
  finalAllocatedRelayRaw: bigint;
  finalAllocatedTotalRaw: bigint;
} {
  assertNonNegative(preReferralPayableRaw, 'preReferralPayableRaw');
  if (referral.applied) {
    const total = referral.referrerRaw + referral.relayRaw;
    if (total !== preReferralPayableRaw) {
      throw new Error('REFERRAL_ALLOCATION_MUST_EQUAL_PRE_REFERRAL_PAYABLE');
    }
    return {
      allocationStatus: 'REFERRAL_APPLIED',
      finalAllocatedReferrerRaw: referral.referrerRaw,
      finalAllocatedRelayRaw: referral.relayRaw,
      finalAllocatedTotalRaw: total,
    };
  }
  if (isInvalidReferralInput(referral)) {
    return {
      allocationStatus: 'INVALID_REFERRAL_BLOCKED',
      finalAllocatedReferrerRaw: 0n,
      finalAllocatedRelayRaw: 0n,
      finalAllocatedTotalRaw: 0n,
    };
  }
  if (isReferralAllocationBlocked(referral)) {
    return {
      allocationStatus: 'BLOCKED_OWNER_DECISION_REQUIRED',
      finalAllocatedReferrerRaw: 0n,
      finalAllocatedRelayRaw: 0n,
      finalAllocatedTotalRaw: 0n,
    };
  }
  // No referral relationship / not eligible → full pre-referral payable to relay path.
  return {
    allocationStatus: 'NO_REFERRAL_RELAY_FULL',
    finalAllocatedReferrerRaw: 0n,
    finalAllocatedRelayRaw: preReferralPayableRaw,
    finalAllocatedTotalRaw: preReferralPayableRaw,
  };
}

/**
 * Apply remaining node + global budget to simulated payable rewards.
 * Never exceeds caps. Referral split validates against the actual simulated payable.
 */
export function simulatePayableRelayReward(input: {
  nominalRewardRaw: bigint;
  alreadyCountedNodePeriodRaw: bigint;
  globalRemainingRaw: bigint;
}): {
  ok: true;
  nodeLimitedRaw: bigint;
  actualPayableRaw: bigint;
  neverExceedsCaps: true;
} {
  const capped = nodeCapLimitedNominalRaw({
    nominalRewardRaw: input.nominalRewardRaw,
    alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw,
  });
  assertNonNegative(input.globalRemainingRaw, 'globalRemainingRaw');
  const actual =
    capped.nodeCapLimitedNominalRaw < input.globalRemainingRaw
      ? capped.nodeCapLimitedNominalRaw
      : input.globalRemainingRaw;
  if (actual > capped.nodeCapLimitedNominalRaw || actual > input.globalRemainingRaw) {
    throw new Error('ECONOMY_CAP_EXCEEDED');
  }
  return {
    ok: true,
    nodeLimitedRaw: capped.nodeCapLimitedNominalRaw,
    actualPayableRaw: actual,
    neverExceedsCaps: true,
  };
}

/**
 * Allocate simulated relay rewards sequentially against one shared remaining
 * global budget and per-node caps. Never assigns the same capped payable
 * independently to every relay. Non-spending simulation only.
 */
export function allocateSequentialRelayRewards(input: {
  relayCount: number;
  nominalRewardRaw: bigint;
  alreadyCountedNodePeriodRawByRelay?: readonly bigint[];
  globalRemainingRaw: bigint;
}): {
  ok: true;
  perRelayPayableRaw: readonly bigint[];
  totalPayableRaw: bigint;
  globalRemainingAfterRaw: bigint;
  neverExceedsCaps: true;
} {
  if (!Number.isInteger(input.relayCount) || input.relayCount < 0) {
    throw new Error('ECONOMY_INVALID_RELAY_COUNT');
  }
  assertNonNegative(input.globalRemainingRaw, 'globalRemainingRaw');
  let remaining = input.globalRemainingRaw;
  const perRelayPayableRaw: bigint[] = [];
  let totalPayableRaw = 0n;
  for (let i = 0; i < input.relayCount; i++) {
    const counted =
      input.alreadyCountedNodePeriodRawByRelay?.[i] ??
      input.alreadyCountedNodePeriodRawByRelay?.[0] ??
      0n;
    const step = simulatePayableRelayReward({
      nominalRewardRaw: input.nominalRewardRaw,
      alreadyCountedNodePeriodRaw: counted,
      globalRemainingRaw: remaining,
    });
    perRelayPayableRaw.push(step.actualPayableRaw);
    totalPayableRaw += step.actualPayableRaw;
    remaining -= step.actualPayableRaw;
    if (remaining < 0n) throw new Error('ECONOMY_BUDGET_UNDERFLOW');
  }
  if (totalPayableRaw > input.globalRemainingRaw) {
    throw new Error('ECONOMY_AGGREGATE_EXCEEDS_GLOBAL');
  }
  return {
    ok: true,
    perRelayPayableRaw,
    totalPayableRaw,
    globalRemainingAfterRaw: remaining,
    neverExceedsCaps: true,
  };
}

export function quoteDeliveryEconomy(input: {
  cpxEurPriceDecimal: string;
  alreadyCountedNodePeriodRaw?: bigint;
  rewardReserveRawAtPeriodStart?: bigint;
  globalAlreadyPaidRaw?: bigint;
  /** Must equal simulated actual payable when provided; otherwise derived. */
  actualPayableRawForReferral?: bigint;
  /** Explicit eligibility only — never automatic referral. */
  referralEligibility?: ReferralEligibility;
}): EconomyQuoteBundle & {
  actualPayableRaw: bigint;
  globalRemainingRaw: bigint;
  rewardReserveRawAtPeriodStart: bigint;
} {
  const burn = offlineServiceBurnCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
  const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
  const reserve = input.rewardReserveRawAtPeriodStart ?? 1_500_000_000_000n * CPX_RAW_SCALE;
  assertNonNegative(reserve, 'rewardReserveRawAtPeriodStart');
  const pool = globalPeriodPoolHardCapRaw(reserve);
  const globalAlready = input.globalAlreadyPaidRaw ?? 0n;
  assertNonNegative(globalAlready, 'globalAlreadyPaidRaw');
  const globalRemainingRaw = pool > globalAlready ? pool - globalAlready : 0n;
  const payable = simulatePayableRelayReward({
    nominalRewardRaw: nominal.nominalRewardCpxRaw,
    alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw ?? 0n,
    globalRemainingRaw,
  });
  if (
    input.actualPayableRawForReferral !== undefined &&
    input.actualPayableRawForReferral !== payable.actualPayableRaw
  ) {
    throw new Error('REFERRAL_INPUT_MUST_MATCH_SIMULATED_PAYABLE');
  }
  const referral = conditionalReferralSplit({
    actualPayableRaw: payable.actualPayableRaw,
    eligibility: input.referralEligibility,
  });
  const preReferralPayableRaw = payable.actualPayableRaw;
  const allocation = deriveReferralAllocation(preReferralPayableRaw, referral);
  return {
    readiness: ECONOMY_READINESS,
    cpxEurPrice: input.cpxEurPriceDecimal,
    simulationDisclaimer: ECONOMY_SIMULATION_DISCLAIMER,
    onlineMessagingCpxRaw: ONLINE_MESSAGING_CPX_RAW,
    onlineReceivingCpxRaw: ONLINE_RECEIVING_CPX_RAW,
    offlineBurnEurTarget: OFFLINE_SERVICE_BURN_EUR,
    offlineBurnRaw: burn.serviceBurnCpxRaw,
    offlineBurnCpx: rawToCpxDecimal(burn.serviceBurnCpxRaw),
    nominalRelayEurTarget: RELAY_REWARD_EUR_TARGET,
    nominalRelayRaw: nominal.nominalRewardCpxRaw,
    nominalRelayCpx: rawToCpxDecimal(nominal.nominalRewardCpxRaw),
    nominalRelayFormula: 'min(1_CPX, EUR_0.005 / settlement_price)',
    rewardSource: 'REWARD_RESERVE',
    senderFundsRelayCpx: false,
    nodeCapRaw: NODE_REWARD_CAP_RAW,
    nodeCapPeriodMs: REWARD_PERIOD_DURATION_MS,
    nodeLimitedRaw: payable.nodeLimitedRaw,
    /** Pre-referral capped quote (compat). Prefer preReferralPayableRaw + finalAllocated*. */
    actualPayableRaw: preReferralPayableRaw,
    preReferralPayableRaw,
    finalAllocatedReferrerRaw: allocation.finalAllocatedReferrerRaw,
    finalAllocatedRelayRaw: allocation.finalAllocatedRelayRaw,
    finalAllocatedTotalRaw: allocation.finalAllocatedTotalRaw,
    allocationStatus: allocation.allocationStatus,
    globalBudgetRate: '0.05%_of_reserve_remaining_at_period_start',
    globalPoolHardCapRaw: pool,
    globalRemainingRaw,
    rewardReserveRawAtPeriodStart: reserve,
    referral,
    first5000: first5000Allocation(),
    walletToWalletAppBurnRaw: WALLET_TO_WALLET_APP_BURN_RAW,
    relaySolExpense: RELAY_SOL_EXPENSE,
    senderApprovedSolFeesSeparate: true,
    platformFee: PLATFORM_FEE,
    settlementExecution: 'BLOCKED_NOT_IN_OPEN_SDK',
  };
}
