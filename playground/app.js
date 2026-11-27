/* global MeshSenderSDK */
const sdk = window.MeshSenderSDK;

function show(id, value, cls) {
  const el = document.getElementById(id);
  el.textContent =
    typeof value === 'string'
      ? value
      : JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  el.className = cls || '';
}

function renderRoute(route) {
  const viz = document.getElementById('net-viz');
  if (!route || !route.length) {
    viz.innerHTML = '<span class="muted">No delivery route</span>';
    return;
  }
  viz.innerHTML = route
    .map((n, i) => {
      const node = `<span class="node">${n}</span>`;
      return i === 0 ? node : `<span class="edge">→</span>${node}`;
    })
    .join('');
}

const baseSim = {
  seed: 'playground',
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
    packetId: 'pkt-ui',
    from: 'Alice',
    to: 'Bob',
    createdAtMs: 0,
    ttlMs: 60_000,
    payload: 'ui-demo',
  },
};

let lastPipeline = null;

document.getElementById('btn-offline').onclick = () => {
  lastPipeline = sdk.runSimulatedDeliveryPipeline({
    simulationInput: baseSim,
    cpxEurPriceDecimal: document.getElementById('price').value.trim() || '0.0005',
  });
  renderRoute(lastPipeline.ok ? lastPipeline.simulation.deliveryRoute : null);
  show(
    'out-offline',
    lastPipeline.ok
      ? {
          readiness: lastPipeline.simulation.readiness,
          delivered: true,
          hops: lastPipeline.simulation.hops,
          route: lastPipeline.simulation.deliveryRoute,
          carrierRoutes: lastPipeline.simulation.carrierRoutes,
        }
      : lastPipeline,
    lastPipeline.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-outage').onclick = () => {
  const sim = sdk.runOfflineStoreCarryForward({
    ...baseSim,
    outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
    packet: { ...baseSim.packet, ttlMs: 2500 },
    mobility: [
      { atMs: 1000, meeting: ['Alice', 'Relay1'] },
      { atMs: 2000, meeting: ['Relay1', 'Relay2'] },
      { atMs: 3000, meeting: ['Relay2', 'Bob'] },
    ],
  });
  renderRoute(sim.deliveryRoute);
  show(
    'out-offline',
    {
      readiness: sim.readiness,
      delivered: sim.delivered,
      expired: sim.expired,
      hops: sim.hops,
      note: 'Outage and/or expiry path',
    },
    sim.delivered ? 'ok' : 'warn'
  );
};

document.getElementById('btn-proof').onclick = () => {
  if (!lastPipeline || !lastPipeline.ok) {
    document.getElementById('btn-offline').click();
  }
  if (!lastPipeline || !lastPipeline.ok) {
    show('out-proof', { error: 'Need successful delivery first' }, 'bad');
    return;
  }
  const proof = lastPipeline.proof;
  const expected = lastPipeline.recipientSigner.publicKeyB64;
  const ok = sdk.verifyDemoDeliveryProof(proof, expected);
  const tampered = sdk.tamperDemoDeliveryProof(proof, { hops: 99 });
  const bad = sdk.verifyDemoDeliveryProof(tampered, expected);
  const wrongSigner = sdk.verifyDemoDeliveryProof(proof, sdk.generateDemoKeyPair().publicKeyB64);
  show(
    'out-proof',
    {
      readiness: proof.readiness,
      valid: ok.ok,
      tamperedRejected: bad.ok === false,
      wrongSignerRejected: wrongSigner.ok === false,
    },
    ok.ok && !bad.ok && !wrongSigner.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-relay').onclick = () => {
  if (!lastPipeline || !lastPipeline.ok || !lastPipeline.relay) {
    document.getElementById('btn-offline').click();
  }
  if (!lastPipeline || !lastPipeline.ok || !lastPipeline.relay) {
    show('out-relay', { error: 'Need successful multi-hop delivery' }, 'bad');
    return;
  }
  const v = sdk.verifyPagedRelayEvidence({
    bundle: lastPipeline.relay.bundle,
    expectedSignerPublicKeysB64: lastPipeline.relay.expectedSigners,
    expectedRootCommitmentHex: lastPipeline.relay.bundle.rootCommitmentHex,
  });
  const tamperedRoot = sdk.verifyPagedRelayEvidence({
    bundle: lastPipeline.relay.bundle,
    expectedSignerPublicKeysB64: lastPipeline.relay.expectedSigners,
    expectedRootCommitmentHex: '0'.repeat(64),
  });
  show(
    'out-relay',
    {
      readiness: lastPipeline.relay.bundle.readiness,
      pages: lastPipeline.relay.bundle.pages.length,
      verified: v.ok,
      tamperRejected: tamperedRoot.ok === false,
      root: lastPipeline.relay.bundle.rootCommitmentHex.slice(0, 16) + '…',
    },
    v.ok && !tamperedRoot.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-passport').onclick = () => {
  const kp = sdk.generateDemoKeyPair();
  const passport = sdk.createDemoPublicPassport({ nodeId: 'node-demo', signer: kp, issuedAtMs: 1 });
  const ok = sdk.verifyPublicPassport(passport, kp.publicKeyB64);
  const wrong = sdk.verifyPublicPassport(passport, sdk.generateDemoKeyPair().publicKeyB64);
  show(
    'out-passport',
    {
      disclosure: passport.disclosure,
      authorityClaim: passport.authorityClaim,
      possessionOk: ok.ok,
      wrongSignerRejected: wrong.ok === false,
      authority: ok.authority,
    },
    ok.ok && !wrong.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-econ').onclick = () => {
  try {
    const quote = sdk.quoteDeliveryEconomy({
      cpxEurPriceDecimal: document.getElementById('price').value.trim(),
      alreadyCountedNodePeriodRaw: 0n,
      globalAlreadyPaidRaw: 0n,
    });
    show(
      'out-econ',
      {
        readiness: quote.readiness,
        offlineBurnCpx: quote.offlineBurnCpx,
        nominalRelayCpx: quote.nominalRelayCpx,
        actualPayableRaw: quote.actualPayableRaw.toString(),
        settlementExecution: quote.settlementExecution,
      },
      'ok'
    );
  } catch (e) {
    show('out-econ', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-market').onclick = () => {
  try {
    const payment = sdk.quoteDirectMarketPayment({
      category: 'product',
      principalCpxDecimal: document.getElementById('principal').value.trim(),
    });
    show(
      'out-market',
      {
        readiness: payment.readiness,
        recipientReceivesCpx: payment.recipientReceivesCpx,
        buyerExtraBurnCpx: payment.buyerExtraBurnCpx,
        platformCommission: payment.platformCommission,
      },
      'ok'
    );
  } catch (e) {
    show('out-market', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-solana').onclick = async () => {
  show('out-solana', 'Fetching…', 'warn');
  try {
    const mint = await sdk.fetchInspectCpxMint();
    const dual = await sdk.fetchInspectProgramDualRpc();
    show(
      'out-solana',
      {
        mintStatus: mint.status,
        decimals: mint.decimals,
        supplyUi: mint.supplyUi,
        mintAuthorityRevoked: mint.mintAuthorityRevoked,
        programAgreement: dual.agreement,
        programResults: dual.results.map((r) => ({
          rpcUrl: r.rpcUrl,
          status: r.status,
          executable: r.executable,
          ownerProgram: r.ownerProgram,
          slot: r.slot,
        })),
        writesEnabled: false,
      },
      mint.status === 'MINT_VERIFIED' ? 'ok' : 'warn'
    );
  } catch (e) {
    show('out-solana', { error: String(e.message || e) }, 'bad');
  }
};
