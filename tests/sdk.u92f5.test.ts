import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allocateSequentialRelayRewards,
  conditionalReferralSplit,
  quoteDeliveryEconomy,
  quoteFailedOfflineDeliveryEconomy,
  quoteDirectMarketPayment,
  runSimulatedDeliveryPipeline,
  walletToWalletAppBurnRaw,
  ONLINE_MESSAGING_CPX_RAW,
  ONLINE_RECEIVING_CPX_RAW,
  NODE_REWARD_CAP_RAW,
  REFERRAL_MAX_EDGES,
  PUBLIC_EXPLORER_LINKS,
  CPX_MAINNET_MINT_ADDRESS,
  fetchInspectCpxMint,
  fetchInspectProgramDualRpc,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const simInput = {
  seed: 'u92f5',
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

describe('U92F5 guided economic fidelity + RPC', () => {
  it('successful two-relay delivery: aggregate rewards = sum of per-relay', () => {
    const pipe = runSimulatedDeliveryPipeline({
      simulationInput: simInput,
      cpxEurPriceDecimal: '0.0005',
    });
    assert.equal(pipe.ok, true);
    if (!pipe.ok || !pipe.relay) return;
    assert.equal(pipe.relay.perRelayPayableRaw.length, 2);
    assert.equal(
      pipe.relay.totalPayableRaw,
      pipe.relay.perRelayPayableRaw[0]! + pipe.relay.perRelayPayableRaw[1]!
    );
    assert.equal(pipe.economy.offlineBurnCpx, '1.000000');
    assert.equal(pipe.economy.onlineMessagingCpxRaw, ONLINE_MESSAGING_CPX_RAW);
    assert.equal(pipe.economy.onlineReceivingCpxRaw, ONLINE_RECEIVING_CPX_RAW);
    assert.equal(pipe.economy.rewardSource, 'REWARD_RESERVE');
    assert.equal(pipe.economy.senderFundsRelayCpx, false);
    assert.equal(pipe.economy.relaySolExpense, 0);
    assert.equal(pipe.economy.walletToWalletAppBurnRaw, 0n);
    assert.equal(pipe.economy.nodeCapRaw, NODE_REWARD_CAP_RAW);
    assert.match(pipe.economy.simulationDisclaimer, /HYPOTHETICAL/);
    // No automatic referral without eligibility.
    assert.equal(pipe.economy.referral.applied, false);
    assert.equal(pipe.economy.referral.reason, 'NO_AUTOMATIC_REFERRAL');
  });

  it('failed delivery: zero burn/rewards; no valid delivery proof', () => {
    const miss = runSimulatedDeliveryPipeline({
      simulationInput: {
        ...simInput,
        outages: { R2: [{ startMs: 0, endMs: 10_000 }] },
        packet: { ...simInput.packet, ttlMs: 2500 },
      },
    });
    assert.equal(miss.ok, false);
    if (miss.ok) return;
    assert.equal(miss.deliveryProofValid, false);
    assert.equal(miss.failedEconomy.offlineBurnRaw, 0n);
    assert.equal(miss.failedEconomy.totalRelayPayableRaw, 0n);
    assert.deepEqual([...miss.failedEconomy.perRelayPayableRaw], []);
    const zero = quoteFailedOfflineDeliveryEconomy();
    assert.equal(zero.offlineBurnCpx, '0.000000');
    assert.equal(zero.totalRelayPayableRaw, 0n);
  });

  it('conditional referral + shared caps + block unresolved', () => {
    const payable = 100_000_000n; // 100 CPX — exact 3%
    const none = conditionalReferralSplit({ actualPayableRaw: payable });
    assert.equal(none.applied, false);
    assert.equal(none.reason, 'NO_AUTOMATIC_REFERRAL');
    assert.equal(none.relayRaw, payable);

    const ok = conditionalReferralSplit({
      actualPayableRaw: payable,
      eligibility: { hasValidReferralRelationship: true, validReferredCountForReferrer: 1 },
    });
    assert.equal(ok.applied, true);
    if (!ok.applied) return;
    assert.equal(ok.referrerRaw, 3_000_000n);
    assert.equal(ok.relayRaw, 97_000_000n);
    assert.equal(ok.maxValidReferrals, REFERRAL_MAX_EDGES);

    const over = conditionalReferralSplit({
      actualPayableRaw: payable,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: REFERRAL_MAX_EDGES + 1,
      },
    });
    assert.equal(over.applied, false);
    assert.equal(over.reason, 'REFERRAL_MAX_EDGES_EXCEEDED');

    const inexact = conditionalReferralSplit({
      actualPayableRaw: 1n,
      eligibility: { hasValidReferralRelationship: true, validReferredCountForReferrer: 1 },
    });
    assert.equal(inexact.applied, false);
    assert.match(String(inexact.reason), /INEXACT|REFERRAL/);

    assert.equal(walletToWalletAppBurnRaw(10_000_000n), 0n);
  });

  it('multiple hypothetical CPX prices + tight/zero global budget', () => {
    for (const price of ['0.0005', '0.001', '0.01', '1']) {
      const q = quoteDeliveryEconomy({ cpxEurPriceDecimal: price });
      assert.ok(q.offlineBurnRaw > 0n);
      assert.ok(q.nominalRelayRaw > 0n);
      assert.ok(q.nominalRelayRaw <= 1_000_000n);
      assert.equal(q.simulationDisclaimer.includes('HYPOTHETICAL'), true);
    }
    const tight = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: 1_000_000n,
      globalRemainingRaw: 200_000n,
    });
    assert.equal(tight.totalPayableRaw, 200_000n);
    assert.deepEqual([...tight.perRelayPayableRaw], [200_000n, 0n]);
    const zero = allocateSequentialRelayRewards({
      relayCount: 2,
      nominalRewardRaw: 1_000_000n,
      globalRemainingRaw: 0n,
    });
    assert.equal(zero.totalPayableRaw, 0n);
  });

  it('market principal + burn = payer total across categories', () => {
    for (const category of ['product', 'service', 'housing_guarantee'] as const) {
      const pay = quoteDirectMarketPayment({
        category,
        principalCpxDecimal: '10.000000',
      });
      assert.equal(pay.recipientReceivesRaw + pay.buyerExtraBurnRaw, pay.buyerTotalRaw);
      assert.equal(pay.platformCommission, 0);
      assert.equal(pay.custodialEscrow, false);
      assert.equal(pay.solFeesRentSeparateSubjectToApproval, true);
      assert.equal(pay.housingRentRemainsEur, category === 'housing_guarantee');
      assert.ok(pay.exampleLabel.length > 10);
    }
  });

  it('playground separates delivery economy vs independent calculator; guided fidelity copy', () => {
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(html, /CURRENT DELIVERY ECONOMY/);
    assert.match(html, /INDEPENDENT ECONOMY CALCULATOR/);
    assert.match(html, /hypothetical simulation inputs/i);
    assert.match(app, /Scenario A/);
    assert.match(app, /Scenario B/);
    assert.match(app, /guidedStepCompleted/);
    assert.match(app, /CURRENT_DELIVERY_PIPELINE/);
    assert.match(app, /INDEPENDENT_ECONOMY_CALCULATOR/);
    assert.match(app, /clearDevRouteDependent/);
    assert.equal(app.includes("getElementById('btn-offline').click()"), false);
    assert.match(PUBLIC_EXPLORER_LINKS.cpxMintSolscan, new RegExp(CPX_MAINNET_MINT_ADDRESS));
    assert.match(PUBLIC_EXPLORER_LINKS.cpxMintPhantom, /phantom\.app/);
  });

  it('RPC primary/secondary/both-failure taxonomy (live, honest)', async () => {
    const mint = await fetchInspectCpxMint();
    assert.ok(mint.status === 'MINT_VERIFIED' || mint.status === 'RPC_ERROR');
    if (mint.status === 'MINT_VERIFIED') {
      assert.equal(mint.decimals, 6);
      assert.ok('usedFallback' in mint);
    } else {
      assert.ok(mint.failureKind);
      assert.ok(mint.error);
    }
    // Explicit primary-only URL: no automatic fallback.
    const primaryOnly = await fetchInspectCpxMint('https://api.mainnet-beta.solana.com', {
      enableFallback: false,
    });
    assert.ok(primaryOnly.status === 'MINT_VERIFIED' || primaryOnly.status === 'RPC_ERROR');
    if (primaryOnly.status === 'RPC_ERROR') {
      assert.equal(primaryOnly.usedFallback, false);
    }
    const dual = await fetchInspectProgramDualRpc();
    assert.ok(
      ['ALL_EXECUTABLE', 'ALL_NOT_FOUND', 'ALL_NOT_EXECUTABLE', 'MIXED_OR_ERROR'].includes(
        dual.agreement
      )
    );
  });
});
