import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  quoteDeliveryEconomy,
  REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED,
  CPX_RAW_SCALE,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('U92F7 final publication preparation', () => {
  it('F01: 999.99 cap / missing / valid 97/3 / no referral allocation display fields', () => {
    const price = '0.0005';
    const blockedCap = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: 999_990_000n,
      },
    });
    assert.equal(blockedCap.preReferralPayableRaw, 1n * CPX_RAW_SCALE);
    assert.equal(blockedCap.actualPayableRaw, blockedCap.preReferralPayableRaw);
    assert.equal(blockedCap.allocationStatus, 'BLOCKED_OWNER_DECISION_REQUIRED');
    assert.equal(blockedCap.finalAllocatedReferrerRaw, 0n);
    assert.equal(blockedCap.finalAllocatedRelayRaw, 0n);
    assert.equal(blockedCap.finalAllocatedTotalRaw, 0n);
    assert.equal(blockedCap.referral.reason, REFERRER_CAP_INSUFFICIENT_OWNER_DECISION_REQUIRED);

    const missing = quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      referralEligibility: {
        hasValidReferralRelationship: true,
        validReferredCountForReferrer: 1,
        alreadyCountedReferrerPeriodRaw: null,
      },
    });
    assert.equal(missing.allocationStatus, 'BLOCKED_OWNER_DECISION_REQUIRED');
    assert.equal(missing.finalAllocatedTotalRaw, 0n);
    assert.equal(missing.referral.reason, 'MISSING_REFERRER_CAP_INPUT');

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
    assert.equal(
      applied.finalAllocatedTotalRaw,
      applied.finalAllocatedReferrerRaw + applied.finalAllocatedRelayRaw
    );
    assert.equal(applied.finalAllocatedTotalRaw, applied.preReferralPayableRaw);

    const none = quoteDeliveryEconomy({ cpxEurPriceDecimal: price });
    assert.equal(none.allocationStatus, 'NO_REFERRAL_RELAY_FULL');
    assert.equal(none.finalAllocatedReferrerRaw, 0n);
    assert.equal(none.finalAllocatedRelayRaw, none.preReferralPayableRaw);
    assert.equal(none.finalAllocatedTotalRaw, none.preReferralPayableRaw);
    assert.equal(none.referral.applied, false);
    assert.equal(none.referral.reason, 'NO_AUTOMATIC_REFERRAL');
  });

  it('F02: Pages workflow gated deploy + README/footer publication status', () => {
    const wf = readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
    const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(wf, /workflow_dispatch/);
    assert.match(wf, /owner_approve_deploy/);
    assert.match(wf, /actions\/deploy-pages@v4/);
    assert.match(wf, /inputs\.owner_approve_deploy == true/);
    assert.match(wf, /path:\s*playground/);
    assert.equal(wf.includes('on:\n  push:'), false);
    assert.match(readme, /owner_approve_deploy/);
    assert.match(readme, /BLOCKED/);
    assert.match(readme, /PRIVATE/);
    assert.match(html, /BLOCKED/);
    assert.match(html, /PRIVATE/);
    assert.match(app, /BLOCKED \/ OWNER DECISION REQUIRED/);
    assert.match(app, /INVALID\/BLOCKED/);
    assert.match(app, /preReferralPayableRaw/);
    assert.match(app, /finalAllocatedTotalRaw/);
    assert.match(app, /routeAggregatePayableRaw/);
  });
});
