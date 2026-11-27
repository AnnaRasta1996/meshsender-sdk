import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  runOfflineStoreCarryForward,
  createDemoDeliveryProof,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  digestPayload,
  generateDemoKeyPair,
  buildPagedRelayEvidence,
  signDemoRelayHop,
  computeRouteSeedHex,
  quoteDeliveryEconomy,
  simulateBilateralDeal,
  createDemoPublicPassport,
  verifyPublicPassport,
  FEATURE_READINESS_MATRIX,
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
  createDefaultSimTransportBundle,
  offlineServiceBurnCpxRawFromEurPriceDecimal,
  nominalRelayRewardCpxRawFromEurPriceDecimal,
  marketBurnRawExactOrFail,
} from '../src/index.ts';

describe('MeshSender Open SDK core', () => {
  it('simulates offline store-carry-forward delivery with duplicate suppression', () => {
    const result = runOfflineStoreCarryForward({
      seed: 'demo-seed',
      nodes: ['A', 'B', 'C'],
      edges: [
        { a: 'A', b: 'B' },
        { a: 'B', b: 'C' },
      ],
      mobility: [
        { atMs: 1_000, meeting: ['A', 'B'] },
        { atMs: 2_000, meeting: ['B', 'C'] },
      ],
      packet: {
        packetId: 'pkt-1',
        from: 'A',
        to: 'C',
        createdAtMs: 0,
        ttlMs: 10_000,
        payload: 'hello-offline',
      },
    });
    assert.equal(result.delivered, true);
    assert.equal(result.readiness, 'SIMULATED');
    assert.ok((result.hops ?? 0) >= 1);
  });

  it('verifies delivery proof and rejects tampering', () => {
    const signer = generateDemoKeyPair();
    const proof = createDemoDeliveryProof({
      claims: {
        messageId: 'm1',
        fromNodeId: 'A',
        toNodeId: 'C',
        deliveredAtMs: 2000,
        hops: 2,
        ingressTransport: 'ble',
        payloadDigestHex: digestPayload('hello-offline'),
      },
      signer,
    });
    assert.equal(verifyDemoDeliveryProof(proof).ok, true);
    const tampered = tamperDemoDeliveryProof(proof, { hops: 99 });
    assert.equal(verifyDemoDeliveryProof(tampered).ok, false);
  });

  it('builds paged relay evidence with verifiable hops', () => {
    const messageId = 'msg-relay';
    const hops = [0, 1, 2].map((i) => {
      const signer = generateDemoKeyPair();
      return signDemoRelayHop({
        messageId,
        signer,
        hop: {
          absoluteRelayIndex: i,
          relayNodeId: `R${i}`,
          previousNodeId: i === 0 ? 'A' : `R${i - 1}`,
          forwardedAtMs: 1000 + i,
          ingressTransport: 'ble',
          rewardRawDecimal: '1000000',
        },
      });
    });
    const seed = computeRouteSeedHex({
      messageId,
      intentDigestHex: digestPayload('intent'),
      nonceB64: 'bm9uY2U=',
      senderDigestHex: digestPayload('sender'),
      recipientDigestHex: digestPayload('recipient'),
    });
    assert.match(seed, /^[0-9a-f]{64}$/);
    const bundle = buildPagedRelayEvidence({
      messageId,
      intentDigestHex: digestPayload('intent'),
      nonceB64: 'bm9uY2U=',
      senderDigestHex: digestPayload('sender'),
      recipientDigestHex: digestPayload('recipient'),
      hops,
      maxPageBodyBytes: 2048,
    });
    assert.equal(bundle.verifiedHopCount, 3);
    assert.ok(bundle.pages.length >= 1);
    assert.equal(bundle.disclosure, 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL');
  });

  it('quotes economy with launch reference price €0.0005', () => {
    const quote = quoteDeliveryEconomy({
      cpxEurPriceDecimal: '0.0005',
      alreadyCountedNodePeriodRaw: 0n,
      rewardReserveRawAtPeriodStart: 1_500_000_000_000n * 1_000_000n,
      actualPayableRawForReferralDemo: 100n,
    });
    assert.equal(quote.offlineBurnRaw, 1_000_000n);
    assert.equal(quote.nominalRelayRaw, 1_000_000n);
    assert.equal(quote.platformFee, 0);
    assert.equal(quote.settlementExecution, 'BLOCKED_NOT_IN_OPEN_SDK');
    if ('referrerRaw' in quote.referral) {
      assert.equal(quote.referral.referrerRaw + quote.referral.relayRaw, 100n);
    }
  });

  it('market quote: full principal to recipient + 0.10% burn, zero platform fee', () => {
    const burn = marketBurnRawExactOrFail(1_000_000n);
    assert.equal(burn, 1_000n);
    const buyer = generateDemoKeyPair();
    const seller = generateDemoKeyPair();
    const deal = simulateBilateralDeal({
      draft: {
        agreementId: 'agr-1',
        category: 'product',
        title: 'Demo widget',
        principalCpxDecimal: '1.000000',
        buyerNodeId: 'buyer',
        sellerNodeId: 'seller',
        createdAtMs: 1,
      },
      buyer,
      seller,
    });
    assert.equal(deal.verified, true);
    assert.equal(deal.payment.recipientReceivesRaw, 1_000_000n);
    assert.equal(deal.payment.buyerExtraBurnRaw, 1_000n);
    assert.equal(deal.payment.platformCommission, 0);
    assert.equal(deal.payment.custodialEscrow, false);
  });

  it('node passport public verify works; transport sims exist; public ids fixed', () => {
    const kp = generateDemoKeyPair();
    const passport = createDemoPublicPassport({ nodeId: 'node-1', signer: kp });
    assert.equal(verifyPublicPassport(passport).ok, true);
    const transports = createDefaultSimTransportBundle();
    assert.equal(transports.ble.readiness, 'SIMULATED');
    assert.equal(CPX_MAINNET_MINT_ADDRESS, '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X');
    assert.equal(MESHSENDER_PROGRAM_ID, 'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg');
    assert.ok(FEATURE_READINESS_MATRIX.length >= 8);
    const burn = offlineServiceBurnCpxRawFromEurPriceDecimal('0.0005');
    const nominal = nominalRelayRewardCpxRawFromEurPriceDecimal('0.0005');
    assert.equal(burn.serviceBurnCpxRaw, 1_000_000n);
    assert.equal(nominal.nominalRewardCpxRaw, 1_000_000n);
  });
});
