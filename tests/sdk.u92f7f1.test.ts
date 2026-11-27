import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allocateSequentialRelayRewards,
  conditionalReferralSplit,
  quoteDeliveryEconomy,
  runSimulatedDeliveryPipeline,
  CPX_RAW_SCALE,
  REFERRAL_MAX_EDGES,
  REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const baseSim = {
  seed: 'u92f7f1',
  nodes: ['A', 'R1', 'R2', 'B'],
  edges: [
    { a: 'A', b: 'R1' },
    { a: 'R1', b: 'R2' },
    { a: 'R2', b: 'B' },
  ],
  mobility: [
    { atMs: 1000, meeting: ['A', 'R1'] },
    { atMs: 2000, meeting: ['R1', 'R2'] },
    { atMs: 3000, meeting: ['R2', 'B'] },
  ],
  packet: {
    packetId: 'p1',
    from: 'A',
    to: 'B',
    createdAtMs: 0,
    ttlMs: 10_000,
    payload: 'hello',
  },
};

describe('U92F7F1 final release micro fix', () => {
  it('F01: two relays without referral → route aggregate 2 CPX from sequential allocations', () => {
    const pipe = runSimulatedDeliveryPipeline({
      simulationInput: baseSim,
      cpxEurPriceDecimal: '0.0005',
    });
    assert.equal(pipe.ok, true);
    if (!pipe.ok) return;
    assert.equal(pipe.relay.perRelayPayableRaw.length, 2);
    assert.equal(pipe.relay.perRelayPayableRaw[0], 1n * CPX_RAW_SCALE);
    assert.equal(pipe.relay.perRelayPayableRaw[1], 1n * CPX_RAW_SCALE);
    assert.equal(pipe.relay.totalPayableRaw, 2n * CPX_RAW_SCALE);
    // Single-relay quote remains independent (1 CPX), not the route aggregate.
    assert.equal(pipe.economy.finalAllocatedTotalRaw, 1n * CPX_RAW_SCALE);
    assert.equal(pipe.economy.allocationStatus, 'NO_REFERRAL_RELAY_FULL');

    const tight = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: 1n * CPX_RAW_SCALE,
      globalRemainingRaw: 200_000n,
    });
    assert.equal(tight.totalPayableRaw, 200_000n);
    assert.deepEqual([...tight.perRelayPayableRaw], [200_000n, 0n]);

    const zero = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: 1n * CPX_RAW_SCALE,
      globalRemainingRaw: 0n,
    });
    assert.equal(zero.totalPayableRaw, 0n);

    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(app, /routeAggregatePayableRaw/);
    assert.match(app, /finalRouteAllocatedTotalRaw/);
    assert.match(app, /singleRelayQuote/);
    assert.match(app, /Route aggregate \(actual sequential\)/);
    assert.match(app, /INDEPENDENT ECONOMY CALCULATOR/);
  });

  it('F02: invalid referral count / >5 → INVALID_REFERRAL_BLOCKED zero allocation', () => {
    const price = '0.0005';
    const invalidCount = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 0,
        alreadyCountedReferrerPeriodRaw: 0n,
      },
    });
    assert.equal(invalidCount.allocationStatus, 'INVALID_REFERRAL_BLOCKED');
    assert.equal(invalidCount.finalAllocatedReferrerRaw, 0n);
    assert.equal(invalidCount.finalAllocatedRelayRaw, 0n);
    assert.equal(invalidCount.finalAllocatedTotalRaw, 0n);
    assert.equal(invalidCount.referral.reason, 'REFERRAL_COUNT_INVALID');
    assert.equal(invalidCount.referral.relayRaw, 0n);

    const overMax = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: REFERRAL_MAX_EDGES + 1,
        alreadyCountedReferrerPeriodRaw: 0n,
      },
    });
    assert.equal(overMax.allocationStatus, 'INVALID_REFERRAL_BLOCKED');
    assert.equal(overMax.finalAllocatedTotalRaw, 0n);
    assert.equal(overMax.referral.reason, 'REFERRAL_MAX_EDGES_EXCEEDED');
    assert.equal(overMax.referral.relayRaw, 0n);

    const splitOver = conditionalReferralSplit({
      actualPayableRaw: 100_000_000n,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: REFERRAL_MAX_EDGES + 1,
        alreadyCountedReferrerPeriodRaw: 0n,
      },
    });
    assert.equal(splitOver.applied, false);
    assert.equal(splitOver.reason, 'REFERRAL_MAX_EDGES_EXCEEDED');
    assert.equal(splitOver.relayRaw, 0n);
    assert.equal(splitOver.referrerRaw, 0n);

    // Preserve valid no-referral / 97/3 / insufficient-cap owner decision.
    const none = quoteDeliveryEconomy({ cpxEurPriceDecimal: price });
    assert.equal(none.allocationStatus, 'NO_REFERRAL_RELAY_FULL');
    assert.equal(none.finalAllocatedTotalRaw, none.preReferralPayableRaw);

    const applied = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: 0n,
      },
    });
    assert.equal(applied.allocationStatus, 'REFERRAL_APPLIED');
    assert.equal(applied.finalAllocatedReferrerRaw, 30_000n);
    assert.equal(applied.finalAllocatedRelayRaw, 970_000n);

    const blockedCap = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: 999_990_000n,
      },
    });
    assert.equal(blockedCap.allocationStatus, 'BLOCKED_OWNER_DECISION_REQUIRED');
    assert.equal(blockedCap.finalAllocatedTotalRaw, 0n);
    assert.equal(blockedCap.referral.reason, REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED);

    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(app, /INVALID\/BLOCKED/);
    assert.match(app, /INVALID_REFERRAL_BLOCKED/);
  });
});
