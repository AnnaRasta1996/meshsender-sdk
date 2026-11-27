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

export type EconomyQuoteBundle = Readonly<{
  readiness: typeof ECONOMY_READINESS;
  cpxEurPrice: string;
  offlineBurnRaw: bigint;
  offlineBurnCpx: string;
  nominalRelayRaw: bigint;
  nominalRelayCpx: string;
  nodeLimitedRaw: bigint;
  globalPoolHardCapRaw: bigint;
  referral: { referrerRaw: bigint; relayRaw: bigint } | { blocked: string };
  first5000: ReturnType<typeof first5000Allocation>;
  platformFee: typeof PLATFORM_FEE;
  settlementExecution: 'BLOCKED_NOT_IN_OPEN_SDK';
}>;

export function quoteDeliveryEconomy(input: {
  cpxEurPriceDecimal: string;
  alreadyCountedNodePeriodRaw?: bigint;
  rewardReserveRawAtPeriodStart?: bigint;
  actualPayableRawForReferralDemo?: bigint;
}): EconomyQuoteBundle {
  const burn = offlineServiceBurnCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
  const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal(input.cpxEurPriceDecimal);
  const capped = nodeCapLimitedNominalRaw({
    nominalRewardRaw: nominal.nominalRewardCpxRaw,
    alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw ?? 0n,
  });
  const reserve = input.rewardReserveRawAtPeriodStart ?? 1_500_000_000_000n * CPX_RAW_SCALE;
  const pool = globalPeriodPoolHardCapRaw(reserve);
  let referral: EconomyQuoteBundle['referral'];
  try {
    const actual =
      input.actualPayableRawForReferralDemo ?? capped.nodeCapLimitedNominalRaw;
    referral = referralSplitRawExactOrFail(actual);
  } catch (e) {
    referral = { blocked: e instanceof Error ? e.message : String(e) };
  }
  return {
    readiness: ECONOMY_READINESS,
    cpxEurPrice: input.cpxEurPriceDecimal,
    offlineBurnRaw: burn.serviceBurnCpxRaw,
    offlineBurnCpx: rawToCpxDecimal(burn.serviceBurnCpxRaw),
    nominalRelayRaw: nominal.nominalRewardCpxRaw,
    nominalRelayCpx: rawToCpxDecimal(nominal.nominalRewardCpxRaw),
    nodeLimitedRaw: capped.nodeCapLimitedNominalRaw,
    globalPoolHardCapRaw: pool,
    referral,
    first5000: first5000Allocation(),
    platformFee: PLATFORM_FEE,
    settlementExecution: 'BLOCKED_NOT_IN_OPEN_SDK',
  };
}
