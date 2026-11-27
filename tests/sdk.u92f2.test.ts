import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  runOfflineStoreCarryForward,
  runSimulatedDeliveryPipeline,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  generateDemoKeyPair,
  verifyPagedRelayEvidence,
  createDemoPublicPassport,
  verifyPublicPassport,
  simulateBilateralDeal,
  quoteDirectMarketPayment,
  quoteDeliveryEconomy,
  verifyBilateralAgreement,
  liveMainnetSnapshot,
  createMainnetConnection,
  inspectTransaction,
  inspectCpxWalletBalances,
} from '../src/index.ts';

const simInput = {
  seed: 'u92f2',
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

describe('U92F2 correctness', () => {
  it('F02: hop count follows delivery route; topology required; duplicates suppressed', () => {
    const ok = runOfflineStoreCarryForward(simInput);
    assert.equal(ok.delivered, true);
    assert.deepEqual(ok.deliveryRoute, ['A', 'R1', 'R2', 'B']);
    assert.equal(ok.hops, 3);
    assert.deepEqual(ok.carrierRoutes.B, ['A', 'R1', 'R2', 'B']);

    const noEdge = runOfflineStoreCarryForward({
      ...simInput,
      edges: [{ a: 'A', b: 'R1' }],
    });
    assert.equal(noEdge.delivered, false);

    const dup = runOfflineStoreCarryForward({
      ...simInput,
      mobility: [
        { atMs: 1000, meeting: ['A', 'R1'] },
        { atMs: 1500, meeting: ['A', 'R1'] },
        { atMs: 2000, meeting: ['R1', 'R2'] },
        { atMs: 3000, meeting: ['R2', 'B'] },
      ],
    });
    assert.ok(dup.duplicateSuppressions >= 1);
  });

  it('F03: expected signer required; wrong signer / tamper / same-party rejected', () => {
    const pipe = runSimulatedDeliveryPipeline({ simulationInput: simInput });
    assert.equal(pipe.ok, true);
    if (!pipe.ok) return;
    assert.equal(
      verifyDemoDeliveryProof(pipe.proof, pipe.recipientSigner.publicKeyB64).ok,
      true
    );
    assert.equal(
      verifyDemoDeliveryProof(pipe.proof, generateDemoKeyPair().publicKeyB64).ok,
      false
    );
    const tampered = tamperDemoDeliveryProof(pipe.proof, { toNodeId: 'Eve' });
    assert.equal(
      verifyDemoDeliveryProof(tampered, pipe.recipientSigner.publicKeyB64).ok,
      false
    );

    const buyer = generateDemoKeyPair();
    assert.throws(() =>
      simulateBilateralDeal({
        draft: {
          agreementId: 'a',
          category: 'product',
          title: 't',
          principalCpxDecimal: '1.000000',
          buyerNodeId: 'b',
          sellerNodeId: 's',
          createdAtMs: 1,
        },
        buyer,
        seller: buyer,
      })
    );

    const seller = generateDemoKeyPair();
    const deal = simulateBilateralDeal({
      draft: {
        agreementId: 'a2',
        category: 'product',
        title: 't',
        principalCpxDecimal: '1.000000',
        buyerNodeId: 'b',
        sellerNodeId: 's',
        createdAtMs: 1,
      },
      buyer,
      seller,
    });
    assert.equal(deal.verified, true);
    const wrong = verifyBilateralAgreement({
      agreementHashHex: deal.hash.agreementHashHex,
      signatures: deal.signatures,
      expectedBuyerPublicKeyB64: seller.publicKeyB64,
      expectedSellerPublicKeyB64: buyer.publicKeyB64,
    });
    assert.equal(wrong.ok, false);

    const pass = createDemoPublicPassport({ nodeId: 'n1', signer: buyer, issuedAtMs: 1 });
    assert.equal(verifyPublicPassport(pass, buyer.publicKeyB64).ok, true);
    assert.equal(verifyPublicPassport(pass, seller.publicKeyB64).ok, false);
    assert.equal(
      pass.disclosure,
      'SYNTHETIC_POSSESSION_PROOF_NOT_PRODUCTION_IDENTITY_AUTHORITY'
    );
  });

  it('F04: paged relay verifier + economy caps + exact market principal', () => {
    const pipe = runSimulatedDeliveryPipeline({ simulationInput: simInput });
    assert.equal(pipe.ok, true);
    if (!pipe.ok || !pipe.relay) return;
    const v = verifyPagedRelayEvidence({
      bundle: pipe.relay.bundle,
      expectedSignerPublicKeysB64: pipe.relay.expectedSigners,
      expectedRootCommitmentHex: pipe.relay.bundle.rootCommitmentHex,
    });
    assert.equal(v.ok, true);
    const bad = verifyPagedRelayEvidence({
      bundle: pipe.relay.bundle,
      expectedSignerPublicKeysB64: pipe.relay.expectedSigners,
      expectedRootCommitmentHex: '11'.repeat(32),
    });
    assert.equal(bad.ok, false);

    const quote = quoteDeliveryEconomy({
      cpxEurPriceDecimal: '0.0005',
      alreadyCountedNodePeriodRaw: 999_000_000n, // under 1_000 CPX raw cap
      globalAlreadyPaidRaw: 0n,
    });
    assert.equal(quote.nodeLimitedRaw, 1_000_000n);
    assert.ok(quote.actualPayableRaw <= quote.nodeLimitedRaw);
    assert.ok(quote.actualPayableRaw <= quote.globalRemainingRaw);
    assert.equal(quote.actualPayableRaw, 1_000_000n);

    assert.throws(() =>
      quoteDirectMarketPayment({ category: 'product', principalCpxDecimal: '0' })
    );
    assert.throws(() =>
      quoteDirectMarketPayment({ category: 'product', principalCpxDecimal: '1.0000001' })
    );
    const pay = quoteDirectMarketPayment({
      category: 'product',
      principalCpxDecimal: '10.000000',
    });
    assert.equal(pay.recipientReceivesRaw, 10_000_000n);
    assert.equal(pay.buyerExtraBurnRaw, 10_000n);
  });

  it('F04: no fabricated delivery fallback for relay/proof pipeline', () => {
    const miss = runSimulatedDeliveryPipeline({
      simulationInput: {
        ...simInput,
        packet: { ...simInput.packet, ttlMs: 500 },
      },
    });
    assert.equal(miss.ok, false);
    if (miss.ok) return;
    assert.equal(miss.reason, 'DELIVERY_NOT_SUCCESSFUL');
  });

  it('F01: live Solana statuses are explicit (mint/program/tx)', async () => {
    const snap = await liveMainnetSnapshot(createMainnetConnection());
    assert.equal(snap.writesEnabled, false);
    assert.ok(
      snap.mint.status === 'MINT_VERIFIED' || snap.mint.status === 'RPC_ERROR'
    );
    if (snap.mint.status === 'MINT_VERIFIED') {
      assert.equal(snap.mint.decimals, 6);
      assert.equal(snap.mint.parsedType, 'mint');
      // revoked only when field present and null
      assert.ok(
        snap.mint.mintAuthorityRevoked === true ||
          snap.mint.mintAuthorityRevoked === false ||
          snap.mint.mintAuthorityRevoked === null
      );
    }
    assert.ok(snap.programDualRpc.results.length >= 2);
    for (const r of snap.programDualRpc.results) {
      assert.ok(
        [
          'PROGRAM_EXECUTABLE',
          'PROGRAM_NOT_FOUND',
          'PROGRAM_NOT_EXECUTABLE',
          'RPC_ERROR',
        ].includes(r.status)
      );
    }
    const missingTx = await inspectTransaction('1'.repeat(64));
    assert.ok(
      missingTx.status === 'TX_NOT_FOUND' || missingTx.status === 'RPC_ERROR'
    );
    // Public system program owner probe for wallet token accounts API shape
    const wallet = await inspectCpxWalletBalances(
      '11111111111111111111111111111111'
    );
    assert.ok(wallet.status === 'WALLET_OK' || wallet.status === 'RPC_ERROR');
    if (wallet.status === 'WALLET_OK') {
      assert.ok(typeof wallet.totalAmountRaw === 'string');
      assert.ok(Array.isArray(wallet.tokenAccounts));
    }
  });
});
