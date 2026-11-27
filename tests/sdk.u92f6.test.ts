import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  conditionalReferralSplit,
  referralPercentageSplitExactOrFail,
  REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED,
  NODE_REWARD_CAP_RAW,
  CPX_RAW_SCALE,
  formatCpxSupplyUiFromRaw,
  PUBLIC_EXPLORER_LINKS,
  BROWSER_PREFERRED_MINT_RPC,
  SECONDARY_MAINNET_RPC,
  fetchInspectCpxMint,
  fetchHistoricalRpcSnapshot,
  resetRpcEndpointCooldownsForTests,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('U92F6 referral cap + RPC micro fix', () => {
  it('F01: eligible 1 CPX with referrer already 999.99 CPX → owner-decision blocked', () => {
    const actual = 1n * CPX_RAW_SCALE; // 1 CPX
    const counted = 999_990_000n; // 999.99 CPX
    const pct = referralPercentageSplitExactOrFail(actual);
    assert.equal(pct.referrerRaw, 30_000n); // 0.03 CPX
    assert.equal(pct.relayRaw, 970_000n);
    const remaining = NODE_REWARD_CAP_RAW - counted;
    assert.equal(remaining, 10_000n);
    assert.ok(pct.referrerRaw > remaining);

    const blocked = conditionalReferralSplit({
      actualPayableRaw: actual,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: counted,
      },
    });
    assert.equal(blocked.applied, false);
    assert.equal(blocked.reason, REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED);
    assert.equal(blocked.referrerRaw, 0n);
    assert.equal(blocked.relayRaw, 0n); // never redistribute blocked amounts
    assert.equal(blocked.ownerDecisionRequired, true);
    assert.deepEqual(blocked.percentageSplit, pct);
    assert.equal(blocked.referrerRemainingRaw, remaining);
  });

  it('F01: missing cap input / sufficient cap / no referral', () => {
    const actual = 1n * CPX_RAW_SCALE;
    const missing = conditionalReferralSplit({
      actualPayableRaw: actual,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: null,
      },
    });
    assert.equal(missing.applied, false);
    assert.equal(missing.reason, 'MISSING_REFERRER_CAP_INPUT');
    assert.equal(missing.relayRaw, 0n);

    const omitted = conditionalReferralSplit({
      actualPayableRaw: actual,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
      },
    });
    assert.equal(omitted.applied, false);
    assert.equal(omitted.reason, 'MISSING_REFERRER_CAP_INPUT');

    const ok = conditionalReferralSplit({
      actualPayableRaw: actual,
      eligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: 0n,
      },
    });
    assert.equal(ok.applied, true);
    if (!ok.applied) return;
    assert.equal(ok.referrerRaw, 30_000n);
    assert.equal(ok.relayRaw, 970_000n);
    assert.equal(ok.percentageSplit.referrerRaw, ok.referrerRaw);

    const none = conditionalReferralSplit({ actualPayableRaw: actual });
    assert.equal(none.applied, false);
    assert.equal(none.reason, 'NO_AUTOMATIC_REFERRAL');
    assert.equal(none.relayRaw, actual);
  });

  it('F02: supplyUi from BigInt raw; Phantom.com link; browser prefers publicnode', () => {
    assert.equal(formatCpxSupplyUiFromRaw('3000000000000000000'), '3000000000000.000000');
    assert.equal(BROWSER_PREFERRED_MINT_RPC, SECONDARY_MAINNET_RPC);
    assert.match(PUBLIC_EXPLORER_LINKS.cpxMintPhantom, /^https:\/\/phantom\.com\/tokens\/solana\//);
    assert.equal(PUBLIC_EXPLORER_LINKS.cpxMintPhantom.includes('phantom.app'), false);

    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(html, /referrer-counted/);
    assert.match(app, /inspectedAtIso/);
    assert.match(app, /reusedExistingResults/);
    assert.match(app, /function text\(/);
  });

  it('F02: mint inspection + historical snapshot reuse (live honest)', async () => {
    resetRpcEndpointCooldownsForTests();
    const mint = await fetchInspectCpxMint();
    assert.ok(mint.status === 'MINT_VERIFIED' || mint.status === 'RPC_ERROR');
    if (mint.status === 'MINT_VERIFIED') {
      assert.equal(mint.decimals, 6);
      assert.ok(mint.supplyUi.length > 0);
      assert.equal(mint.supplyUi, formatCpxSupplyUiFromRaw(mint.supplyRaw));
      assert.ok(mint.inspectedAtIso);
      assert.ok(mint.rpcUrl.includes('publicnode') || mint.rpcUrl.includes('mainnet'));
    }
    const snap = await fetchHistoricalRpcSnapshot({
      mint,
      programDualRpc: {
        readiness: 'LIVE_READ_ONLY',
        results: [],
        agreement: 'MIXED_OR_ERROR',
        explorer: PUBLIC_EXPLORER_LINKS,
      },
    });
    assert.equal(snap.presentation, 'HISTORICAL_SNAPSHOT_NOT_LIVE');
    assert.equal(snap.reusedExistingResults, true);
    assert.equal(snap.mint, mint);
  });
});
