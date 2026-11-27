import {
  runSimulatedDeliveryPipeline,
  liveMainnetSnapshot,
  createMainnetConnection,
  FEATURE_READINESS_MATRIX,
  SDK_NAME,
  SDK_VERSION,
  quoteDirectMarketPayment,
} from '../src/index.ts';

async function main(): Promise<void> {
  console.log(`\n=== ${SDK_NAME} ${SDK_VERSION} — U92F2 DEMO ===\n`);

  const pipe = runSimulatedDeliveryPipeline({
    simulationInput: {
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
      packet: {
        packetId: 'demo-pkt-1',
        from: 'Alice',
        to: 'Bob',
        createdAtMs: 0,
        ttlMs: 60_000,
        payload: 'MeshSender offline hello',
      },
    },
    cpxEurPriceDecimal: '0.0005',
  });

  if (!pipe.ok) {
    console.error('PIPELINE_FAILED', pipe);
    process.exitCode = 1;
    return;
  }

  console.log('[1] Offline SCF', {
    readiness: pipe.simulation.readiness,
    delivered: true,
    hops: pipe.simulation.hops,
    route: pipe.simulation.deliveryRoute,
  });
  console.log('[2] Delivery proof', {
    readiness: pipe.proof.readiness,
    verifiedAgainstExpectedSigner: pipe.proofVerified,
  });
  console.log('[3] Relay evidence', {
    readiness: pipe.relay?.bundle.readiness,
    pages: pipe.relay?.bundle.pages.length,
    verified: pipe.relay?.verified,
    root: pipe.relay?.bundle.rootCommitmentHex.slice(0, 16) + '…',
  });
  console.log('[4] Economy', {
    offlineBurnCpx: pipe.economy.offlineBurnCpx,
    actualPayableRaw: pipe.economy.actualPayableRaw.toString(),
    settlementExecution: pipe.economy.settlementExecution,
  });
  const market = quoteDirectMarketPayment({
    category: 'product',
    principalCpxDecimal: '10.000000',
  });
  console.log('[5] Market', {
    recipientCpx: market.recipientReceivesCpx,
    burnCpx: market.buyerExtraBurnCpx,
    platformFee: market.platformCommission,
  });

  if (process.env.MESHSENDER_SDK_SKIP_LIVE === '1') {
    console.log('[6] Solana skipped');
  } else {
    const snap = await liveMainnetSnapshot(createMainnetConnection());
    console.log('[6] Solana LIVE_READ_ONLY', {
      mintStatus: snap.mint.status,
      decimals: snap.mint.status === 'MINT_VERIFIED' ? snap.mint.decimals : null,
      supplyUi: snap.mint.status === 'MINT_VERIFIED' ? snap.mint.supplyUi : null,
      mintAuthorityRevoked:
        snap.mint.status === 'MINT_VERIFIED' ? snap.mint.mintAuthorityRevoked : null,
      programStatus: snap.program.status,
      programDualAgreement: snap.programDualRpc.agreement,
      programDual: snap.programDualRpc.results.map((r) => ({
        rpc: r.rpcUrl,
        status: r.status,
        executable: r.executable,
        owner: r.ownerProgram,
        slot: r.slot,
      })),
      writesEnabled: snap.writesEnabled,
    });
  }

  for (const row of FEATURE_READINESS_MATRIX) {
    console.log(`- ${row.feature}: ${row.readiness}`);
  }
  console.log('\nDEMO_COMPLETE\n');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
