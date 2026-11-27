import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  allocateSequentialRelayRewards,
  runSimulatedDeliveryPipeline,
  extractRelayForwardTimestampsFromEvents,
  CPX_RAW_SCALE,
  nominalRelayRewardCpxRawFromEurPriceDecimal,
} from '../src/index.ts';

const simInput = {
  seed: 'u92f3',
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

describe('U92F3 browser + reward budget', () => {
  it('F02: two relays with 0.2 CPX remaining must not exceed 0.2 CPX total', () => {
    const remaining = 200_000n; // 0.2 CPX
    const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal('0.0005').nominalRewardCpxRaw;
    assert.ok(nominal > remaining);
    const alloc = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: nominal,
      globalRemainingRaw: remaining,
    });
    assert.equal(alloc.perRelayPayableRaw.length, 2);
    assert.equal(alloc.perRelayPayableRaw[0], 200_000n);
    assert.equal(alloc.perRelayPayableRaw[1], 0n);
    assert.equal(alloc.totalPayableRaw, 200_000n);
    assert.ok(alloc.totalPayableRaw <= remaining);
    assert.equal(alloc.globalRemainingAfterRaw, 0n);
    // Independent assignment would have been 0.2+0.2=0.4 — must not happen.
    assert.notEqual(
      alloc.perRelayPayableRaw[0]! + alloc.perRelayPayableRaw[1]!,
      remaining * 2n
    );
  });

  it('F02: zero remaining budget yields all-zero payables', () => {
    const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal('0.0005').nominalRewardCpxRaw;
    const alloc = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: nominal,
      globalRemainingRaw: 0n,
    });
    assert.deepEqual([...alloc.perRelayPayableRaw], [0n, 0n]);
    assert.equal(alloc.totalPayableRaw, 0n);
  });

  it('F02: normal delivery sequential allocation + real forward timestamps', () => {
    const pipe = runSimulatedDeliveryPipeline({ simulationInput: simInput });
    assert.equal(pipe.ok, true);
    if (!pipe.ok || !pipe.relay) return;
    assert.equal(pipe.relay.forwardedAtMsByHop.length, 2);
    assert.deepEqual([...pipe.relay.forwardedAtMsByHop], [2000, 3000]);
    const fromEvents = extractRelayForwardTimestampsFromEvents(
      pipe.simulation.events,
      pipe.simulation.deliveryRoute!
    );
    assert.deepEqual([...fromEvents], [...pipe.relay.forwardedAtMsByHop]);
    assert.equal(pipe.relay.perRelayPayableRaw.length, 2);
    assert.equal(
      pipe.relay.totalPayableRaw,
      pipe.relay.perRelayPayableRaw[0]! + pipe.relay.perRelayPayableRaw[1]!
    );
    // With default large pool, each hop gets full nominal (not shared-capped incorrectly).
    const nominal = pipe.economy.nominalRelayRaw;
    assert.equal(pipe.relay.perRelayPayableRaw[0], nominal);
    assert.equal(pipe.relay.perRelayPayableRaw[1], nominal);
    assert.equal(pipe.relay.totalPayableRaw, nominal * 2n);
  });

  it('F02: pipeline respects tight global remaining across relays', () => {
    const remaining = 200_000n;
    const pipe = runSimulatedDeliveryPipeline({
      simulationInput: simInput,
      globalRemainingRawOverride: remaining,
    });
    assert.equal(pipe.ok, true);
    if (!pipe.ok || !pipe.relay) return;
    assert.equal(pipe.relay.totalPayableRaw, remaining);
    assert.ok(pipe.relay.totalPayableRaw <= remaining);
    assert.equal(pipe.relay.perRelayPayableRaw[0]! + pipe.relay.perRelayPayableRaw[1]!, remaining);
    assert.ok(pipe.relay.perRelayPayableRaw[0]! <= remaining);
    assert.ok(pipe.relay.perRelayPayableRaw[1]! <= remaining - pipe.relay.perRelayPayableRaw[0]!);
  });

  it('F02: scale constant sanity (0.2 CPX raw)', () => {
    assert.equal((CPX_RAW_SCALE * 2n) / 10n, 200_000n);
  });
});
