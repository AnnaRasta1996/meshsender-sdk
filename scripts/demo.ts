/**
 * One-command demo: offline delivery → proof → relay evidence → economy quote
 * + tamper rejection + optional live mainnet read-only snapshot.
 */
import {
  runOfflineStoreCarryForward,
  createDemoDeliveryProof,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  digestPayload,
  generateDemoKeyPair,
  signDemoRelayHop,
  buildPagedRelayEvidence,
  quoteDeliveryEconomy,
  simulateBilateralDeal,
  liveMainnetSnapshot,
  createMainnetConnection,
  FEATURE_READINESS_MATRIX,
  SDK_NAME,
  SDK_VERSION,
} from '../src/index.ts';

async function main(): Promise<void> {
  console.log(`\n=== ${SDK_NAME} ${SDK_VERSION} — HACKATHON DEMO ===\n`);

  const sim = runOfflineStoreCarryForward({
    seed: 'hackathon-demo',
    nodes: ['Alice', 'Relay1', 'Relay2', 'Bob'],
    edges: [
      { a: 'Alice', b: 'Relay1' },
      { a: 'Relay1', b: 'Relay2' },
      { a: 'Relay2', b: 'Bob' },
    ],
    mobility: [
      { atMs: 1000, meeting: ['Alice', 'Relay1'] },
      { atMs: 2000, meeting: ['Relay1', 'Relay2'] },
      { atMs: 3000, meeting: ['Relay2', 'Bob'] },
    ],
    outages: { Relay2: [{ startMs: 1500, endMs: 1600 }] },
    packet: {
      packetId: 'demo-pkt-1',
      from: 'Alice',
      to: 'Bob',
      createdAtMs: 0,
      ttlMs: 60_000,
      payload: 'MeshSender offline hello',
    },
  });
  console.log('[1] Offline SCF', {
    readiness: sim.readiness,
    delivered: sim.delivered,
    hops: sim.hops,
    duplicates: sim.duplicateSuppressions,
  });

  const recipient = generateDemoKeyPair();
  const proof = createDemoDeliveryProof({
    claims: {
      messageId: 'demo-pkt-1',
      fromNodeId: 'Alice',
      toNodeId: 'Bob',
      deliveredAtMs: sim.deliveryAtMs ?? 3000,
      hops: sim.hops ?? 0,
      ingressTransport: 'ble',
      payloadDigestHex: digestPayload('MeshSender offline hello'),
    },
    signer: recipient,
  });
  const proofOk = verifyDemoDeliveryProof(proof);
  const tampered = tamperDemoDeliveryProof(proof, { toNodeId: 'Eve' });
  const tamperOk = verifyDemoDeliveryProof(tampered);
  console.log('[2] Delivery proof', {
    readiness: proof.readiness,
    disclosure: proof.disclosure,
    valid: proofOk.ok,
    tamperedRejected: tamperOk.ok === false,
  });

  const hops = [0, 1].map((i) => {
    const signer = generateDemoKeyPair();
    return signDemoRelayHop({
      messageId: 'demo-pkt-1',
      signer,
      hop: {
        absoluteRelayIndex: i,
        relayNodeId: `Relay${i + 1}`,
        previousNodeId: i === 0 ? 'Alice' : `Relay${i}`,
        forwardedAtMs: 1000 * (i + 1),
        ingressTransport: 'ble',
        rewardRawDecimal: '1000000',
      },
    });
  });
  const evidence = buildPagedRelayEvidence({
    messageId: 'demo-pkt-1',
    intentDigestHex: digestPayload('intent'),
    nonceB64: Buffer.from('demo-nonce').toString('base64'),
    senderDigestHex: digestPayload('Alice'),
    recipientDigestHex: digestPayload('Bob'),
    hops,
  });
  console.log('[3] Relay evidence', {
    readiness: evidence.readiness,
    pages: evidence.pages.length,
    root: evidence.rootCommitmentHex.slice(0, 16) + '…',
    hops: evidence.verifiedHopCount,
  });

  const economy = quoteDeliveryEconomy({
    cpxEurPriceDecimal: '0.0005',
    alreadyCountedNodePeriodRaw: 0n,
    rewardReserveRawAtPeriodStart: 1_500_000_000_000n * 1_000_000n,
    actualPayableRawForReferralDemo: 100n,
  });
  console.log('[4] Economy quote', {
    readiness: economy.readiness,
    offlineBurnCpx: economy.offlineBurnCpx,
    nominalRelayCpx: economy.nominalRelayCpx,
    globalPoolHardCapRaw: economy.globalPoolHardCapRaw.toString(),
    settlementExecution: economy.settlementExecution,
  });

  const market = simulateBilateralDeal({
    draft: {
      agreementId: 'demo-agr',
      category: 'product',
      title: 'Hackathon demo listing',
      principalCpxDecimal: '10.000000',
      buyerNodeId: 'buyer',
      sellerNodeId: 'seller',
      createdAtMs: Date.now(),
    },
    buyer: generateDemoKeyPair(),
    seller: generateDemoKeyPair(),
  });
  console.log('[5] Market simulation', {
    readiness: market.readiness,
    verified: market.verified,
    recipientCpx: market.payment.recipientReceivesCpx,
    burnCpx: market.payment.buyerExtraBurnCpx,
    platformFee: market.payment.platformCommission,
  });

  const skipLive = process.env.MESHSENDER_SDK_SKIP_LIVE === '1';
  if (skipLive) {
    console.log('[6] Solana LIVE_READ_ONLY skipped (MESHSENDER_SDK_SKIP_LIVE=1)');
  } else {
    try {
      const snap = await liveMainnetSnapshot(createMainnetConnection());
      console.log('[6] Solana LIVE_READ_ONLY', {
        mint: snap.mint.mintAddress,
        decimals: snap.mint.decimals,
        supplyUi: snap.mint.supplyUi,
        mintAuthorityRevoked: snap.mint.mintAuthorityRevoked,
        programExecutable: snap.program.executable,
        writesEnabled: snap.writesEnabled,
      });
    } catch (e) {
      console.log('[6] Solana LIVE_READ_ONLY failed (network)', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.log('\n[Readiness matrix]');
  for (const row of FEATURE_READINESS_MATRIX) {
    console.log(`- ${row.feature}: ${row.readiness}`);
  }
  console.log('\nDEMO_COMPLETE\n');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
