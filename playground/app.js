/* global MeshSenderSDK */
const sdk = window.MeshSenderSDK;

function show(id, value, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent =
    typeof value === 'string'
      ? value
      : JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  el.className = cls || '';
}

function clearEvidence(ids) {
  for (const id of ids) show(id, 'Ready.', '');
}

function renderRoute(targetId, route, opts) {
  const viz = document.getElementById(targetId);
  if (!viz) return;
  if (!route || !route.length) {
    viz.innerHTML = '<span class="muted">No delivery route</span>';
    return;
  }
  const active = opts && opts.activeIndex != null ? opts.activeIndex : -1;
  const doneThrough = opts && opts.doneThrough != null ? opts.doneThrough : -1;
  const withPacket = opts && opts.packetAt != null ? opts.packetAt : -1;
  viz.innerHTML = route
    .map((n, i) => {
      const cls = [
        'node',
        'phone',
        i === active ? 'active' : '',
        i <= doneThrough ? 'done' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const node = `<span class="${cls}">${n}</span>`;
      const packet = i === withPacket ? '<span class="packet" title="message"></span>' : '';
      return i === 0 ? packet + node : `<span class="edge">→</span>${packet}${node}`;
    })
    .join('');
}

function setResultCard(html) {
  document.getElementById('result-card').innerHTML = html;
}

function rawCpx(raw) {
  try {
    return sdk.rawToCpxDecimal(typeof raw === 'bigint' ? raw : BigInt(raw));
  } catch {
    return String(raw);
  }
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
let guidedStep = 0;
let guidedState = {
  pipeline: null,
  outage: null,
  passport: null,
  economy: null,
  market: null,
  solana: null,
};

const STEPS = [
  {
    title: 'Offline message: Alice → Bob',
    body:
      'Alice sends an encrypted packet without continuous internet. Phones meet, carry, and forward — Relay1 then Relay2 — until Bob receives it. This is simulated store-carry-forward, not a physical radio claim.',
  },
  {
    title: 'Outage & expiry: no delivery, no charge',
    body:
      'When Relay2 is outaged and the packet TTL expires, delivery fails. MeshSender does not invent success and does not charge a delivery-based fee for a miss.',
  },
  {
    title: 'Delivery proof & tamper rejection',
    body:
      'A synthetic Ed25519 delivery proof is verified against the expected recipient signer. Altering hops or substituting a wrong signer is rejected visibly.',
  },
  {
    title: 'Relay contributions & commitments',
    body:
      'Intermediate relays produce paged evidence with ordered indices and a rolling root commitment. Tampering the expected root fails closed.',
  },
  {
    title: 'Node Passport possession',
    body:
      'A Node Passport self-signature proves synthetic key possession only — not production identity authority.',
  },
  {
    title: 'Economic flow (non-spending)',
    body:
      'Sender offline burn, Reward Reserve relay rewards, per-node and global caps, referral split on actual payable, and First-5000 as a separate incentive outside the global pool. Settlement execution stays blocked in this SDK.',
  },
  {
    title: 'Paradox Market quote',
    body:
      'Products, services, and housing guarantees: recipient receives the full principal; buyer pays an extra 0.10% burn; platform fee is zero; no escrow.',
  },
  {
    title: 'Live Solana inspection',
    body:
      'Read-only check of the real CPX mainnet mint and the separate settlement program across two public RPCs. No signing, spend, or deploy.',
  },
];

function paintStepRail() {
  const rail = document.getElementById('step-rail');
  rail.innerHTML = STEPS.map((s, i) => {
    const cls = ['step-pill', i === guidedStep ? 'active' : '', i < guidedStep ? 'done' : '']
      .filter(Boolean)
      .join(' ');
    return `<span class="${cls}">${i + 1}. ${s.title.split(':')[0]}</span>`;
  }).join('');
}

function showMode(mode) {
  const guided = document.getElementById('guided');
  const developer = document.getElementById('developer');
  if (mode === 'guided') {
    guided.hidden = false;
    developer.hidden = true;
    paintStepRail();
    document.getElementById('step-kicker').textContent = `Step ${guidedStep + 1} of ${STEPS.length}`;
    document.getElementById('step-title').textContent = STEPS[guidedStep].title;
    document.getElementById('step-body').textContent = STEPS[guidedStep].body;
  } else if (mode === 'developer') {
    guided.hidden = true;
    developer.hidden = false;
  } else {
    guided.hidden = true;
    developer.hidden = true;
  }
}

async function animateRoute(route) {
  renderRoute('net-viz', route, { packetAt: 0, activeIndex: 0 });
  for (let i = 0; i < route.length; i++) {
    await new Promise((r) => setTimeout(r, 320));
    renderRoute('net-viz', route, { packetAt: i, activeIndex: i, doneThrough: i - 1 });
  }
  renderRoute('net-viz', route, { doneThrough: route.length - 1, packetAt: route.length - 1 });
}

async function runGuidedStep(index) {
  const price = document.getElementById('price').value.trim() || '0.0005';
  document.getElementById('step-kicker').textContent = `Step ${index + 1} of ${STEPS.length}`;
  document.getElementById('step-title').textContent = STEPS[index].title;
  document.getElementById('step-body').textContent = STEPS[index].body;
  paintStepRail();

  if (index === 0) {
    guidedState.pipeline = sdk.runSimulatedDeliveryPipeline({
      simulationInput: baseSim,
      cpxEurPriceDecimal: price,
    });
    lastPipeline = guidedState.pipeline;
    if (!guidedState.pipeline.ok) {
      setResultCard('<p class="status-bad">Delivery simulation failed unexpectedly.</p>');
      show('guided-json', guidedState.pipeline, 'bad');
      return;
    }
    await animateRoute(guidedState.pipeline.simulation.deliveryRoute);
    const hops = guidedState.pipeline.simulation.hops;
    setResultCard(`
      <h4><span class="status-ok">Delivered</span> · SIMULATED</h4>
      <ul>
        <li>Route: ${guidedState.pipeline.simulation.deliveryRoute.join(' → ')}</li>
        <li>Successful hops: <span class="amount">${hops}</span></li>
        <li>Relay payables: ${(guidedState.pipeline.relay?.perRelayPayableRaw || [])
          .map((r) => rawCpx(r) + ' CPX')
          .join(', ') || 'n/a'}</li>
      </ul>
    `);
    show('guided-json', {
      readiness: guidedState.pipeline.simulation.readiness,
      delivered: true,
      route: guidedState.pipeline.simulation.deliveryRoute,
      hops,
      perRelayPayableRaw: guidedState.pipeline.relay?.perRelayPayableRaw.map(String),
    }, 'ok');
    return;
  }

  if (index === 1) {
    lastPipeline = null;
    clearEvidence(['out-proof', 'out-relay']);
    guidedState.outage = sdk.runOfflineStoreCarryForward({
      ...baseSim,
      outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
      packet: { ...baseSim.packet, ttlMs: 2500 },
    });
    renderRoute('net-viz', guidedState.outage.deliveryRoute || ['Alice', 'Relay1'], {
      activeIndex: 1,
    });
    setResultCard(`
      <h4><span class="status-warn">No delivery</span> · SIMULATED</h4>
      <ul>
        <li>Expired: <span class="amount">${guidedState.outage.expired}</span></li>
        <li>Delivered: <span class="amount">${guidedState.outage.delivered}</span></li>
        <li>Delivery-based charge: <strong>none</strong> (miss ⇒ no invented success)</li>
        <li>Prior proof/relay results cleared</li>
      </ul>
    `);
    show('guided-json', guidedState.outage, 'warn');
    return;
  }

  if (index === 2) {
    if (!guidedState.pipeline || !guidedState.pipeline.ok) {
      guidedState.pipeline = sdk.runSimulatedDeliveryPipeline({
        simulationInput: baseSim,
        cpxEurPriceDecimal: price,
      });
      lastPipeline = guidedState.pipeline;
    }
    const pipe = guidedState.pipeline;
    if (!pipe.ok) {
      setResultCard('<p class="status-bad">Need a successful simulation first (re-run step 1).</p>');
      return;
    }
    lastPipeline = pipe;
    const ok = sdk.verifyDemoDeliveryProof(pipe.proof, pipe.recipientSigner.publicKeyB64);
    const tampered = sdk.tamperDemoDeliveryProof(pipe.proof, { hops: 99 });
    const bad = sdk.verifyDemoDeliveryProof(tampered, pipe.recipientSigner.publicKeyB64);
    const wrong = sdk.verifyDemoDeliveryProof(pipe.proof, sdk.generateDemoKeyPair().publicKeyB64);
    renderRoute('net-viz', pipe.simulation.deliveryRoute, { doneThrough: 3 });
    setResultCard(`
      <h4><span class="status-ok">Proof verified</span> · VERIFIED_SYNTHETIC</h4>
      <ul>
        <li>Valid against expected signer: <span class="amount">${ok.ok}</span></li>
        <li>Tampered hops rejected: <span class="amount">${bad.ok === false}</span></li>
        <li>Wrong signer rejected: <span class="amount">${wrong.ok === false}</span></li>
      </ul>
    `);
    show('guided-json', {
      valid: ok.ok,
      tamperedRejected: !bad.ok,
      wrongSignerRejected: !wrong.ok,
    }, 'ok');
    return;
  }

  if (index === 3) {
    const pipe = guidedState.pipeline;
    if (!pipe || !pipe.ok || !pipe.relay) {
      setResultCard('<p class="status-bad">Need multi-hop success from step 1.</p>');
      return;
    }
    const v = sdk.verifyPagedRelayEvidence({
      bundle: pipe.relay.bundle,
      expectedSignerPublicKeysB64: pipe.relay.expectedSigners,
      expectedRootCommitmentHex: pipe.relay.bundle.rootCommitmentHex,
    });
    const tamperedRoot = sdk.verifyPagedRelayEvidence({
      bundle: pipe.relay.bundle,
      expectedSignerPublicKeysB64: pipe.relay.expectedSigners,
      expectedRootCommitmentHex: '0'.repeat(64),
    });
    setResultCard(`
      <h4><span class="status-ok">Relay evidence OK</span> · VERIFIED_SYNTHETIC</h4>
      <ul>
        <li>Pages: <span class="amount">${pipe.relay.bundle.pages.length}</span></li>
        <li>Verified: <span class="amount">${v.ok}</span></li>
        <li>Tampered root rejected: <span class="amount">${tamperedRoot.ok === false}</span></li>
        <li>Root: <span class="amount">${pipe.relay.bundle.rootCommitmentHex.slice(0, 16)}…</span></li>
      </ul>
    `);
    show('guided-json', {
      pages: pipe.relay.bundle.pages.length,
      verified: v.ok,
      tamperRejected: !tamperedRoot.ok,
    }, 'ok');
    return;
  }

  if (index === 4) {
    const kp = sdk.generateDemoKeyPair();
    const passport = sdk.createDemoPublicPassport({
      nodeId: 'node-demo',
      signer: kp,
      issuedAtMs: 1,
    });
    const ok = sdk.verifyPublicPassport(passport, kp.publicKeyB64);
    const wrong = sdk.verifyPublicPassport(passport, sdk.generateDemoKeyPair().publicKeyB64);
    guidedState.passport = { passport, ok, wrong };
    setResultCard(`
      <h4><span class="status-ok">Possession proof</span> · VERIFIED_SYNTHETIC</h4>
      <ul>
        <li>Disclosure: ${passport.disclosure}</li>
        <li>Possession OK: <span class="amount">${ok.ok}</span></li>
        <li>Wrong signer rejected: <span class="amount">${wrong.ok === false}</span></li>
        <li>Authority: ${ok.authority} (not production identity)</li>
      </ul>
    `);
    show('guided-json', guidedState.passport, 'ok');
    return;
  }

  if (index === 5) {
    const quote = sdk.quoteDeliveryEconomy({
      cpxEurPriceDecimal: price,
      alreadyCountedNodePeriodRaw: 0n,
      globalAlreadyPaidRaw: 0n,
    });
    guidedState.economy = quote;
    const referral =
      quote.referral && 'referrerRaw' in quote.referral
        ? `${rawCpx(quote.referral.referrerRaw)} CPX referrer / ${rawCpx(quote.referral.relayRaw)} CPX relay`
        : quote.referral?.blocked || 'n/a';
    setResultCard(`
      <h4><span class="status-ok">Economy quote</span> · VERIFIED_SYNTHETIC · non-spending</h4>
      <ul>
        <li>Sender offline burn: <span class="amount">${quote.offlineBurnCpx} CPX</span></li>
        <li>Nominal relay (Reward Reserve): <span class="amount">${quote.nominalRelayCpx} CPX</span></li>
        <li>Actual payable (capped): <span class="amount">${rawCpx(quote.actualPayableRaw)} CPX</span></li>
        <li>Node-limited raw remaining path applied; global pool hard-cap respected</li>
        <li>Referral on actual payable: ${referral}</li>
        <li>First-5000: ${quote.first5000.nodeCount} × ${rawCpx(quote.first5000.perNodeRaw)} CPX (outside global pool)</li>
        <li>Settlement execution: ${quote.settlementExecution}</li>
      </ul>
    `);
    show('guided-json', {
      offlineBurnCpx: quote.offlineBurnCpx,
      nominalRelayCpx: quote.nominalRelayCpx,
      actualPayableRaw: quote.actualPayableRaw.toString(),
      referral: quote.referral,
      first5000: {
        nodeCount: quote.first5000.nodeCount,
        perNodeCpx: rawCpx(quote.first5000.perNodeRaw),
        insideGlobalPool: quote.first5000.insideGlobalPool,
      },
      settlementExecution: quote.settlementExecution,
    }, 'ok');
    return;
  }

  if (index === 6) {
    const categories = ['product', 'service', 'housing_guarantee'];
    const rows = categories.map((category) => {
      const payment = sdk.quoteDirectMarketPayment({
        category,
        principalCpxDecimal: document.getElementById('principal').value.trim() || '10.000000',
      });
      return { category, payment };
    });
    guidedState.market = rows;
    setResultCard(`
      <h4><span class="status-ok">Paradox Market</span> · SIMULATED · no escrow</h4>
      <ul>
        ${rows
          .map(
            (r) =>
              `<li><strong>${r.category}</strong>: recipient <span class="amount">${r.payment.recipientReceivesCpx} CPX</span>, extra burn <span class="amount">${r.payment.buyerExtraBurnCpx} CPX</span>, platform fee <span class="amount">${r.payment.platformCommission}</span></li>`
          )
          .join('')}
      </ul>
    `);
    show(
      'guided-json',
      rows.map((r) => ({
        category: r.category,
        recipientReceivesCpx: r.payment.recipientReceivesCpx,
        buyerExtraBurnCpx: r.payment.buyerExtraBurnCpx,
        platformCommission: r.payment.platformCommission,
      })),
      'ok'
    );
    return;
  }

  if (index === 7) {
    setResultCard('<h4 class="status-warn">Fetching live read-only…</h4>');
    try {
      const mint = await sdk.fetchInspectCpxMint();
      const dual = await sdk.fetchInspectProgramDualRpc();
      guidedState.solana = { mint, dual };
      setResultCard(`
        <h4><span class="status-ok">Solana inspection</span> · LIVE_READ_ONLY</h4>
        <ul>
          <li>CPX mint status: <span class="amount">${mint.status}</span>${
            mint.decimals != null ? ` · decimals ${mint.decimals}` : ''
          }${mint.supplyUi ? ` · supply ${mint.supplyUi}` : ''}</li>
          <li>Mint address: <span class="amount">${sdk.CPX_MAINNET_MINT_ADDRESS}</span></li>
          <li>Settlement program: <span class="amount">${sdk.MESHSENDER_PROGRAM_ID}</span></li>
          <li>Program dual-RPC agreement: <span class="amount">${dual.agreement}</span></li>
          <li>Writes enabled: <span class="amount">false</span></li>
        </ul>
      `);
      show(
        'guided-json',
        {
          mintStatus: mint.status,
          decimals: mint.decimals,
          supplyUi: mint.supplyUi,
          programAgreement: dual.agreement,
          programResults: dual.results,
          writesEnabled: false,
        },
        mint.status === 'MINT_VERIFIED' ? 'ok' : 'warn'
      );
    } catch (e) {
      setResultCard(`<p class="status-bad">${String(e.message || e)}</p>`);
      show('guided-json', { error: String(e.message || e) }, 'bad');
    }
  }
}

document.getElementById('btn-guided').onclick = () => {
  guidedStep = 0;
  guidedState = {
    pipeline: null,
    outage: null,
    passport: null,
    economy: null,
    market: null,
    solana: null,
  };
  showMode('guided');
  setResultCard('<p class="muted">Press Continue to run step 1.</p>');
  show('guided-json', '—', '');
  renderRoute('net-viz', ['Alice', 'Relay1', 'Relay2', 'Bob']);
};

document.getElementById('btn-dev-mode').onclick = () => showMode('developer');

document.getElementById('btn-step').onclick = async () => {
  const btn = document.getElementById('btn-step');
  btn.disabled = true;
  try {
    document.getElementById('step-kicker').textContent = `Step ${guidedStep + 1} of ${STEPS.length}`;
    document.getElementById('step-title').textContent = STEPS[guidedStep].title;
    document.getElementById('step-body').textContent = STEPS[guidedStep].body;
    paintStepRail();
    await runGuidedStep(guidedStep);
    if (guidedStep < STEPS.length - 1) {
      guidedStep += 1;
      btn.textContent = 'Continue';
    } else {
      btn.textContent = 'Replay last step';
    }
    paintStepRail();
  } finally {
    btn.disabled = false;
  }
};

document.getElementById('btn-step-back').onclick = () => {
  if (guidedStep > 0) guidedStep -= 1;
  paintStepRail();
  document.getElementById('step-kicker').textContent = `Step ${guidedStep + 1} of ${STEPS.length}`;
  document.getElementById('step-title').textContent = STEPS[guidedStep].title;
  document.getElementById('step-body').textContent = STEPS[guidedStep].body;
};

/* ——— Developer Mode (preserve all capabilities) ——— */

document.getElementById('btn-offline').onclick = () => {
  try {
    lastPipeline = sdk.runSimulatedDeliveryPipeline({
      simulationInput: baseSim,
      cpxEurPriceDecimal: document.getElementById('price').value.trim() || '0.0005',
    });
    if (!lastPipeline.ok) {
      lastPipeline = null;
      renderRoute('net-viz-dev', null);
      show('out-offline', { error: 'DELIVERY_NOT_SUCCESSFUL' }, 'bad');
      return;
    }
    renderRoute('net-viz-dev', lastPipeline.simulation.deliveryRoute);
    show(
      'out-offline',
      {
        readiness: lastPipeline.simulation.readiness,
        delivered: true,
        hops: lastPipeline.simulation.hops,
        route: lastPipeline.simulation.deliveryRoute,
        carrierRoutes: lastPipeline.simulation.carrierRoutes,
        totalRelayPayableRaw: lastPipeline.relay
          ? lastPipeline.relay.totalPayableRaw.toString()
          : null,
        perRelayPayableRaw: lastPipeline.relay
          ? lastPipeline.relay.perRelayPayableRaw.map((x) => x.toString())
          : null,
      },
      'ok'
    );
  } catch (e) {
    lastPipeline = null;
    renderRoute('net-viz-dev', null);
    show('out-offline', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-outage').onclick = () => {
  try {
    lastPipeline = null;
    clearEvidence(['out-proof', 'out-relay']);
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
    renderRoute('net-viz-dev', sim.deliveryRoute);
    show(
      'out-offline',
      {
        readiness: sim.readiness,
        delivered: sim.delivered,
        expired: sim.expired,
        hops: sim.hops,
        note: 'Outage/expiry — prior pipeline + proof/relay results cleared; no auto-success',
      },
      sim.delivered ? 'ok' : 'warn'
    );
  } catch (e) {
    lastPipeline = null;
    clearEvidence(['out-proof', 'out-relay']);
    renderRoute('net-viz-dev', null);
    show('out-offline', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-proof').onclick = () => {
  // Never auto-run a successful delivery when verification is requested.
  if (!lastPipeline || !lastPipeline.ok) {
    show('out-proof', { error: 'Need successful delivery first (run offline delivery)' }, 'bad');
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
    show('out-relay', { error: 'Need successful multi-hop delivery first' }, 'bad');
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
        referral: quote.referral,
        first5000: quote.first5000,
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
      category: document.getElementById('market-cat').value,
      principalCpxDecimal: document.getElementById('principal').value.trim(),
    });
    show(
      'out-market',
      {
        readiness: payment.readiness,
        category: document.getElementById('market-cat').value,
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
