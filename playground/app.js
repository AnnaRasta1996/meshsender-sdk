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

function setSummary(id, html, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.className = 'cpx-summary' + (cls ? ' ' + cls : '');
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

/** Safely render external RPC/explorer values as text (no HTML injection). */
function text(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collapseGuidedTech() {
  const d = document.getElementById('guided-tech');
  if (d) d.open = false;
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

/** Guided state — isolated from Developer Mode. */
let guidedStep = 0;
let guidedStepCompleted = false;
let guidedBusy = false;
let guidedRunId = 0;
let guidedState = emptyGuidedState();

/** Developer state — isolated from Guided. */
let devState = emptyDevState();
let devBusy = false;
let devRunId = 0;

function emptyGuidedState() {
  return {
    scenarioA: null,
    scenarioB: null,
    activeScenario: null,
    passport: null,
    market: null,
    solana: null,
    resultsByStep: {},
  };
}

function emptyDevState() {
  return {
    scenarioA: null,
    scenarioB: null,
    activeScenario: null,
    independentQuote: null,
    market: null,
    solana: null,
  };
}

const STEPS = [
  {
    title: 'Offline message: Alice → Bob',
    body:
      'Alice sends a store-carry-forward packet without continuous internet. Phones meet, carry, and forward — Relay1 then Relay2 — until Bob receives it. Payload simulation only — not a physical radio or live encryption claim.',
  },
  {
    title: 'Outage & expiry: no delivery, no charge',
    body:
      'Scenario B: Relay2 is outaged and the packet TTL expires. Delivery fails. Zero service burn and zero relay rewards. Route-dependent proofs from this miss are invalid.',
  },
  {
    title: 'Delivery proof & tamper rejection',
    body:
      'Return to Scenario A. A synthetic Ed25519 delivery proof is verified against the expected recipient signer. Altering hops or substituting a wrong signer is rejected visibly.',
  },
  {
    title: 'Relay contributions & commitments',
    body:
      'Still Scenario A. Intermediate relays produce paged evidence with ordered indices and a rolling root commitment. Tampering the expected root fails closed.',
  },
  {
    title: 'Node Passport possession',
    body:
      'A Node Passport self-signature proves synthetic key possession only — not production identity authority.',
  },
  {
    title: 'Economic flow (non-spending)',
    body:
      'Scenario A delivery economy from the same successful pipeline: free online messaging/receiving, offline burn (€0.0005 worth of CPX), Reward Reserve relay rewards, unified 1000 CPX / 30-day node cap, 0.05% global budget, conditional referral only, First-5000 separate. Hypothetical simulation inputs — not live payouts.',
  },
  {
    title: 'Paradox Market quote',
    body:
      'Distinct product, service, and housing-guarantee examples: recipient receives full principal; payer pays extra 0.10% burn; platform fee zero; no custodial escrow. Housing rent remains EUR. SOL fees/rent separate and subject to approval.',
  },
  {
    title: 'Live Solana inspection',
    body:
      'Read-only check of the real CPX mainnet mint (primary + secondary RPC fallback) and the separate settlement program across two public RPCs. No signing, spend, or deploy.',
  },
];

function paintStepRail() {
  const rail = document.getElementById('step-rail');
  rail.innerHTML = STEPS.map((s, i) => {
    const cls = [
      'step-pill',
      i === guidedStep ? 'active' : '',
      i < guidedStep || (i === guidedStep && guidedStepCompleted) ? 'done' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `<span class="${cls}">${i + 1}. ${s.title.split(':')[0]}</span>`;
  }).join('');
}

function setScenarioTag(text) {
  const el = document.getElementById('scenario-tag');
  if (el) el.textContent = text;
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

function ensureScenarioA(price) {
  if (guidedState.scenarioA && guidedState.scenarioA.ok) return guidedState.scenarioA;
  guidedState.scenarioA = sdk.runSimulatedDeliveryPipeline({
    simulationInput: baseSim,
    cpxEurPriceDecimal: price,
  });
  return guidedState.scenarioA;
}

function economyFidelityHtml(quote, routeBits) {
  const referral =
    quote.referral && quote.referral.applied
      ? `${rawCpx(quote.referral.referrerRaw)} CPX referrer / ${rawCpx(quote.referral.relayRaw)} CPX relay (97/3, 1 level)`
      : `not applied (${quote.referral?.reason || 'n/a'})`;
  const perRelay = (routeBits && routeBits.perRelayPayableRaw) || [];
  const totalRelay = routeBits && routeBits.totalPayableRaw != null ? routeBits.totalPayableRaw : null;
  return `
    <ul>
      <li>Online messaging / receiving: <span class="amount">${rawCpx(quote.onlineMessagingCpxRaw)} / ${rawCpx(quote.onlineReceivingCpxRaw)} CPX</span> (free)</li>
      <li>Successful offline burn target: €${quote.offlineBurnEurTarget} → <span class="amount">${quote.offlineBurnCpx} CPX</span></li>
      <li>Nominal relay: min(1 CPX, €${quote.nominalRelayEurTarget} / price) = <span class="amount">${quote.nominalRelayCpx} CPX</span></li>
      <li>Reward source: <span class="amount">${quote.rewardSource}</span> (senderFundsRelayCpx=${quote.senderFundsRelayCpx})</li>
      <li>Per-relay payables: ${(perRelay.map((r) => rawCpx(r) + ' CPX').join(', ') || 'n/a')}</li>
      <li>Aggregate route rewards: <span class="amount">${totalRelay != null ? rawCpx(totalRelay) : rawCpx(quote.actualPayableRaw)} CPX</span></li>
      <li>Unified node cap: <span class="amount">${rawCpx(quote.nodeCapRaw)} CPX</span> / common 30-day period</li>
      <li>Global budget: 0.05% of reserve at period start → hard-cap <span class="amount">${rawCpx(quote.globalPoolHardCapRaw)} CPX</span></li>
      <li>Conditional referral: ${referral}</li>
      <li>First-5000: ${quote.first5000.nodeCount} × ${rawCpx(quote.first5000.perNodeRaw)} CPX (outside global pool)</li>
      <li>Wallet→wallet app burn: <span class="amount">${rawCpx(quote.walletToWalletAppBurnRaw)} CPX</span></li>
      <li>Relay SOL expense: <span class="amount">${quote.relaySolExpense}</span> (sender-approved SOL fees/rent separate)</li>
      <li class="muted">${quote.simulationDisclaimer}</li>
      <li>Settlement execution: ${quote.settlementExecution}</li>
    </ul>
  `;
}

function solanaStatusClass(mintStatus, dualAgreement) {
  if (mintStatus === 'MINT_VERIFIED' && (dualAgreement === 'ALL_NOT_FOUND' || dualAgreement === 'ALL_EXECUTABLE' || dualAgreement === 'ALL_NOT_EXECUTABLE')) {
    return dualAgreement === 'ALL_EXECUTABLE' ? 'ok' : 'warn';
  }
  if (mintStatus === 'MINT_VERIFIED') return 'warn';
  return 'bad';
}

async function animateRoute(route, runId) {
  renderRoute('net-viz', route, { packetAt: 0, activeIndex: 0 });
  for (let i = 0; i < route.length; i++) {
    if (runId !== guidedRunId) return;
    await new Promise((r) => setTimeout(r, 320));
    if (runId !== guidedRunId) return;
    renderRoute('net-viz', route, { packetAt: i, activeIndex: i, doneThrough: i - 1 });
  }
  if (runId !== guidedRunId) return;
  renderRoute('net-viz', route, { doneThrough: route.length - 1, packetAt: route.length - 1 });
}

async function runGuidedStep(index, runId) {
  const price = document.getElementById('price').value.trim() || '0.0005';
  document.getElementById('step-kicker').textContent = `Step ${index + 1} of ${STEPS.length}`;
  document.getElementById('step-title').textContent = STEPS[index].title;
  document.getElementById('step-body').textContent = STEPS[index].body;
  paintStepRail();
  collapseGuidedTech();

  if (index === 0) {
    guidedState.scenarioA = sdk.runSimulatedDeliveryPipeline({
      simulationInput: baseSim,
      cpxEurPriceDecimal: price,
    });
    guidedState.activeScenario = 'A';
    setScenarioTag('Scenario A (success) active');
    if (!guidedState.scenarioA.ok) {
      setResultCard('<p class="status-bad">Delivery simulation failed unexpectedly.</p>');
      show('guided-json', guidedState.scenarioA, 'bad');
      return;
    }
    await animateRoute(guidedState.scenarioA.simulation.deliveryRoute, runId);
    if (runId !== guidedRunId) return;
    const hops = guidedState.scenarioA.simulation.hops;
    const per = guidedState.scenarioA.relay?.perRelayPayableRaw || [];
    const total = guidedState.scenarioA.relay?.totalPayableRaw;
    setResultCard(`
      <h4><span class="status-ok">Delivered</span> · SIMULATED · Scenario A</h4>
      <ul>
        <li>Route: ${guidedState.scenarioA.simulation.deliveryRoute.join(' → ')}</li>
        <li>Successful hops: <span class="amount">${hops}</span></li>
        <li>Per-relay payables: ${per.map((r) => rawCpx(r) + ' CPX').join(', ') || 'n/a'}</li>
        <li>Aggregate route rewards: <span class="amount">${total != null ? rawCpx(total) : 'n/a'} CPX</span></li>
        <li>Payload path: simulation only (not live encrypted radio transport)</li>
      </ul>
    `);
    const payload = {
      readiness: guidedState.scenarioA.simulation.readiness,
      scenario: 'A',
      delivered: true,
      route: guidedState.scenarioA.simulation.deliveryRoute,
      hops,
      perRelayPayableRaw: per.map(String),
      totalPayableRaw: total != null ? total.toString() : null,
      offlineBurnCpx: guidedState.scenarioA.economy.offlineBurnCpx,
    };
    guidedState.resultsByStep[0] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'ok' };
    show('guided-json', payload, 'ok');
    return;
  }

  if (index === 1) {
    guidedState.scenarioB = sdk.runOfflineStoreCarryForward({
      ...baseSim,
      outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
      packet: { ...baseSim.packet, ttlMs: 2500 },
    });
    const failedPipe = sdk.runSimulatedDeliveryPipeline({
      simulationInput: {
        ...baseSim,
        outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
        packet: { ...baseSim.packet, ttlMs: 2500 },
      },
      cpxEurPriceDecimal: price,
    });
    guidedState.activeScenario = 'B';
    setScenarioTag('Scenario B (failed/expired) — zero burn / zero rewards; A retained for later steps');
    renderRoute('net-viz', guidedState.scenarioB.deliveryRoute || ['Alice', 'Relay1'], {
      activeIndex: 1,
    });
    const zero = failedPipe.ok ? null : failedPipe.failedEconomy;
    setResultCard(`
      <h4><span class="status-warn">No delivery</span> · SIMULATED · Scenario B</h4>
      <ul>
        <li>Expired: <span class="amount">${guidedState.scenarioB.expired}</span></li>
        <li>Delivered: <span class="amount">${guidedState.scenarioB.delivered}</span></li>
        <li>Offline burn: <span class="amount">${zero ? zero.offlineBurnCpx : '0.000000'} CPX</span></li>
        <li>Relay rewards: <span class="amount">${zero ? rawCpx(zero.totalRelayPayableRaw) : '0.000000'} CPX</span></li>
        <li>Valid delivery proof: <span class="amount">false</span></li>
        <li>Scenario A retained for proof/economy verification on later steps</li>
      </ul>
    `);
    const payload = {
      scenario: 'B',
      outage: guidedState.scenarioB,
      failedEconomy: zero,
      deliveryProofValid: false,
      scenarioARetained: !!(guidedState.scenarioA && guidedState.scenarioA.ok),
    };
    guidedState.resultsByStep[1] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'warn' };
    show('guided-json', payload, 'warn');
    return;
  }

  if (index === 2) {
    const pipe = ensureScenarioA(price);
    guidedState.activeScenario = 'A';
    setScenarioTag('Returned to Scenario A for proof verification');
    if (!pipe.ok) {
      setResultCard('<p class="status-bad">Need successful Scenario A (re-run step 1).</p>');
      return;
    }
    const ok = sdk.verifyDemoDeliveryProof(pipe.proof, pipe.recipientSigner.publicKeyB64);
    const tampered = sdk.tamperDemoDeliveryProof(pipe.proof, { hops: 99 });
    const bad = sdk.verifyDemoDeliveryProof(tampered, pipe.recipientSigner.publicKeyB64);
    const wrong = sdk.verifyDemoDeliveryProof(pipe.proof, sdk.generateDemoKeyPair().publicKeyB64);
    renderRoute('net-viz', pipe.simulation.deliveryRoute, { doneThrough: 3 });
    setResultCard(`
      <h4><span class="status-ok">Proof verified</span> · VERIFIED_SYNTHETIC · Scenario A</h4>
      <ul>
        <li>Valid against expected signer: <span class="amount">${ok.ok}</span></li>
        <li>Tampered hops rejected: <span class="amount">${bad.ok === false}</span></li>
        <li>Wrong signer rejected: <span class="amount">${wrong.ok === false}</span></li>
      </ul>
    `);
    const payload = { scenario: 'A', valid: ok.ok, tamperedRejected: !bad.ok, wrongSignerRejected: !wrong.ok };
    guidedState.resultsByStep[2] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'ok' };
    show('guided-json', payload, 'ok');
    return;
  }

  if (index === 3) {
    const pipe = ensureScenarioA(price);
    guidedState.activeScenario = 'A';
    setScenarioTag('Scenario A — relay evidence');
    if (!pipe.ok || !pipe.relay) {
      setResultCard('<p class="status-bad">Need multi-hop success from Scenario A (step 1).</p>');
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
      <h4><span class="status-ok">Relay evidence OK</span> · VERIFIED_SYNTHETIC · Scenario A</h4>
      <ul>
        <li>Pages: <span class="amount">${pipe.relay.bundle.pages.length}</span></li>
        <li>Verified: <span class="amount">${v.ok}</span></li>
        <li>Tampered root rejected: <span class="amount">${tamperedRoot.ok === false}</span></li>
        <li>Per-relay payables: ${pipe.relay.perRelayPayableRaw.map((r) => rawCpx(r) + ' CPX').join(', ')}</li>
        <li>Aggregate: <span class="amount">${rawCpx(pipe.relay.totalPayableRaw)} CPX</span></li>
        <li>Root: <span class="amount">${pipe.relay.bundle.rootCommitmentHex.slice(0, 16)}…</span></li>
      </ul>
    `);
    const payload = {
      scenario: 'A',
      pages: pipe.relay.bundle.pages.length,
      verified: v.ok,
      tamperRejected: !tamperedRoot.ok,
      perRelayPayableRaw: pipe.relay.perRelayPayableRaw.map(String),
      totalPayableRaw: pipe.relay.totalPayableRaw.toString(),
    };
    guidedState.resultsByStep[3] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'ok' };
    show('guided-json', payload, 'ok');
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
    guidedState.resultsByStep[4] = {
      card: document.getElementById('result-card').innerHTML,
      json: guidedState.passport,
      cls: 'ok',
    };
    show('guided-json', guidedState.passport, 'ok');
    return;
  }

  if (index === 5) {
    const pipe = ensureScenarioA(price);
    guidedState.activeScenario = 'A';
    setScenarioTag('Scenario A — CURRENT DELIVERY ECONOMY (same successful pipeline)');
    if (!pipe.ok) {
      setResultCard('<p class="status-bad">Need successful Scenario A pipeline.</p>');
      return;
    }
    const quote = pipe.economy;
    setResultCard(`
      <h4><span class="status-ok">Delivery economy</span> · VERIFIED_SYNTHETIC · Scenario A · non-spending</h4>
      ${economyFidelityHtml(quote, pipe.relay)}
    `);
    const payload = {
      scenario: 'A',
      source: 'CURRENT_DELIVERY_PIPELINE',
      offlineBurnCpx: quote.offlineBurnCpx,
      nominalRelayCpx: quote.nominalRelayCpx,
      perRelayPayableRaw: pipe.relay ? pipe.relay.perRelayPayableRaw.map(String) : null,
      totalPayableRaw: pipe.relay ? pipe.relay.totalPayableRaw.toString() : null,
      actualPayableRaw: quote.actualPayableRaw.toString(),
      referral: quote.referral,
      first5000: {
        nodeCount: quote.first5000.nodeCount,
        perNodeCpx: rawCpx(quote.first5000.perNodeRaw),
        insideGlobalPool: quote.first5000.insideGlobalPool,
      },
      walletToWalletAppBurnRaw: quote.walletToWalletAppBurnRaw.toString(),
      relaySolExpense: quote.relaySolExpense,
      simulationDisclaimer: quote.simulationDisclaimer,
      settlementExecution: quote.settlementExecution,
    };
    guidedState.resultsByStep[5] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'ok' };
    show('guided-json', payload, 'ok');
    return;
  }

  if (index === 6) {
    const principal = document.getElementById('principal').value.trim() || '10.000000';
    const categories = ['product', 'service', 'housing_guarantee'];
    const rows = categories.map((category) => ({
      category,
      payment: sdk.quoteDirectMarketPayment({ category, principalCpxDecimal: principal }),
    }));
    guidedState.market = rows;
    setResultCard(`
      <h4><span class="status-ok">Paradox Market</span> · SIMULATED · no escrow</h4>
      <ul>
        ${rows
          .map(
            (r) => `
          <li>
            <strong>${r.category}</strong> — ${r.payment.exampleLabel}<br/>
            recipient <span class="amount">${r.payment.recipientReceivesCpx} CPX</span>
            + burn <span class="amount">${r.payment.buyerExtraBurnCpx} CPX</span> (0.10%)
            = payer total <span class="amount">${r.payment.buyerTotalCpx} CPX</span><br/>
            platform commission <span class="amount">${r.payment.platformCommission}</span> ·
            custodial escrow <span class="amount">${r.payment.custodialEscrow}</span> ·
            SOL fees/rent separate (approval) ·
            housing rent EUR: <span class="amount">${r.payment.housingRentRemainsEur}</span>
          </li>`
          )
          .join('')}
      </ul>
    `);
    const payload = rows.map((r) => ({
      category: r.category,
      exampleLabel: r.payment.exampleLabel,
      recipientReceivesCpx: r.payment.recipientReceivesCpx,
      buyerExtraBurnCpx: r.payment.buyerExtraBurnCpx,
      buyerTotalCpx: r.payment.buyerTotalCpx,
      platformCommission: r.payment.platformCommission,
      custodialEscrow: r.payment.custodialEscrow,
      solFeesRentSeparateSubjectToApproval: r.payment.solFeesRentSeparateSubjectToApproval,
      housingRentRemainsEur: r.payment.housingRentRemainsEur,
    }));
    guidedState.resultsByStep[6] = { card: document.getElementById('result-card').innerHTML, json: payload, cls: 'ok' };
    show('guided-json', payload, 'ok');
    return;
  }

  if (index === 7) {
    setResultCard('<h4 class="status-warn">Fetching live read-only…</h4>');
    try {
      const mint = await sdk.fetchInspectCpxMint();
      if (runId !== guidedRunId) return;
      const dual = await sdk.fetchInspectProgramDualRpc();
      if (runId !== guidedRunId) return;
      guidedState.solana = { mint, dual };
      const cls = solanaStatusClass(mint.status, dual.agreement);
      const statusSpan =
        cls === 'ok' ? 'status-ok' : cls === 'warn' ? 'status-warn' : 'status-bad';
      setResultCard(`
        <h4><span class="${statusSpan}">Solana inspection</span> · LIVE_READ_ONLY</h4>
        <ul>
          <li>CPX mint status: <span class="amount">${text(mint.status)}</span></li>
          <li>Supply UI: <span class="amount">${text(mint.supplyUi ?? '')}</span> · raw <span class="amount">${text(mint.supplyRaw ?? '')}</span></li>
          <li>Decimals: <span class="amount">${text(mint.decimals ?? '')}</span> · source <span class="amount">${text(mint.supplySource ?? '')}</span></li>
          <li>Mint authority revoked: <span class="amount">${text(mint.mintAuthorityRevoked)}</span> · freeze revoked: <span class="amount">${text(mint.freezeAuthorityRevoked)}</span></li>
          <li>Source RPC: <span class="amount">${text(mint.rpcUrl ?? '')}</span> · slot <span class="amount">${text(mint.slot)}</span></li>
          <li>Inspected at: <span class="amount">${text(mint.inspectedAtIso ?? '')}</span></li>
          <li>Failure kind: <span class="amount">${text(mint.failureKind || (mint.usedFallback ? 'PRIMARY_FAILED_SECONDARY_OK' : 'none'))}</span></li>
          <li>Used fallback: <span class="amount">${text(!!mint.usedFallback)}</span></li>
          <li>Mint: <span class="amount">${text(sdk.CPX_MAINNET_MINT_ADDRESS)}</span></li>
          <li>Program: <span class="amount">${text(sdk.MESHSENDER_PROGRAM_ID)}</span></li>
          <li>Program dual-RPC: <span class="amount">${text(dual.agreement)}</span></li>
          <li>Solscan: <a href="${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintSolscan)}" target="_blank" rel="noopener">${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintSolscan)}</a></li>
          <li>Phantom.com: <a href="${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintPhantom)}" target="_blank" rel="noopener">${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintPhantom)}</a></li>
          <li>Writes enabled: <span class="amount">false</span></li>
        </ul>
      `);
      const payload = {
        mintStatus: mint.status,
        failureKind: mint.failureKind || null,
        usedFallback: !!mint.usedFallback,
        decimals: mint.decimals,
        supplyRaw: mint.supplyRaw,
        supplyUi: mint.supplyUi,
        supplySource: mint.supplySource,
        mintAuthorityRevoked: mint.mintAuthorityRevoked,
        freezeAuthorityRevoked: mint.freezeAuthorityRevoked,
        rpcUrl: mint.rpcUrl,
        slot: mint.slot,
        inspectedAtIso: mint.inspectedAtIso,
        programAgreement: dual.agreement,
        programResults: dual.results,
        explorer: sdk.PUBLIC_EXPLORER_LINKS,
        writesEnabled: false,
      };
      guidedState.resultsByStep[7] = { card: document.getElementById('result-card').innerHTML, json: payload, cls };
      show('guided-json', payload, cls);
    } catch (e) {
      if (runId !== guidedRunId) return;
      setResultCard(`<p class="status-bad">${String(e.message || e)}</p>`);
      show('guided-json', { error: String(e.message || e) }, 'bad');
    }
  }
}

function restoreGuidedStepView(index) {
  document.getElementById('step-kicker').textContent = `Step ${index + 1} of ${STEPS.length}`;
  document.getElementById('step-title').textContent = STEPS[index].title;
  document.getElementById('step-body').textContent = STEPS[index].body;
  paintStepRail();
  const cached = guidedState.resultsByStep[index];
  if (cached) {
    setResultCard(cached.card);
    show('guided-json', cached.json, cached.cls || '');
  } else {
    setResultCard('<p class="muted">Press Continue to run this step.</p>');
    show('guided-json', '—', '');
  }
}

document.getElementById('btn-guided').onclick = () => {
  guidedRunId += 1;
  guidedStep = 0;
  guidedStepCompleted = false;
  guidedBusy = false;
  guidedState = emptyGuidedState();
  showMode('guided');
  setScenarioTag('Scenario A (success) ready');
  setResultCard('<p class="muted">Press Continue to run step 1.</p>');
  show('guided-json', '—', '');
  collapseGuidedTech();
  renderRoute('net-viz', ['Alice', 'Relay1', 'Relay2', 'Bob']);
  document.getElementById('btn-step').textContent = 'Continue';
  document.getElementById('btn-step').disabled = false;
};

document.getElementById('btn-dev-mode').onclick = () => {
  showMode('developer');
};

document.getElementById('btn-step').onclick = async () => {
  if (guidedBusy) return;
  const btn = document.getElementById('btn-step');
  guidedBusy = true;
  btn.disabled = true;
  const runId = ++guidedRunId;
  try {
    if (guidedStepCompleted && guidedStep < STEPS.length - 1) {
      guidedStep += 1;
      guidedStepCompleted = false;
    }
    await runGuidedStep(guidedStep, runId);
    if (runId !== guidedRunId) return;
    guidedStepCompleted = true;
    paintStepRail();
    btn.textContent = guidedStep >= STEPS.length - 1 ? 'Replay last step' : 'Continue';
  } finally {
    if (runId === guidedRunId) {
      guidedBusy = false;
      btn.disabled = false;
    }
  }
};

document.getElementById('btn-step-back').onclick = () => {
  if (guidedBusy) return;
  if (guidedStep > 0) {
    guidedStep -= 1;
    guidedStepCompleted = !!guidedState.resultsByStep[guidedStep];
  }
  restoreGuidedStepView(guidedStep);
  document.getElementById('btn-step').textContent =
    guidedStep >= STEPS.length - 1 && guidedStepCompleted ? 'Replay last step' : 'Continue';
};

/* ——— Developer Mode (preserve all capabilities; separate state) ——— */

function clearDevRouteDependent() {
  clearEvidence(['out-proof', 'out-relay', 'out-econ-delivery']);
  setSummary('sum-proof', 'Cleared — requires successful scenario A.', 'muted');
  setSummary('sum-relay', 'Cleared — requires successful multi-hop A.', 'muted');
  setSummary('sum-econ-delivery', 'Cleared — no current delivery economy.', 'muted');
}

document.getElementById('btn-offline').onclick = () => {
  const runId = ++devRunId;
  try {
    const price = document.getElementById('price').value.trim() || '0.0005';
    devState.scenarioA = sdk.runSimulatedDeliveryPipeline({
      simulationInput: baseSim,
      cpxEurPriceDecimal: price,
    });
    if (!devState.scenarioA.ok) {
      devState.activeScenario = 'B';
      renderRoute('net-viz-dev', null);
      clearDevRouteDependent();
      setSummary('sum-offline', 'Delivery not successful — zero burn / zero rewards path.', 'warn');
      show(
        'out-offline',
        {
          error: 'DELIVERY_NOT_SUCCESSFUL',
          failedEconomy: devState.scenarioA.failedEconomy,
          deliveryProofValid: false,
        },
        'bad'
      );
      return;
    }
    if (runId !== devRunId) return;
    devState.activeScenario = 'A';
    renderRoute('net-viz-dev', devState.scenarioA.simulation.deliveryRoute);
    const per = devState.scenarioA.relay?.perRelayPayableRaw || [];
    const total = devState.scenarioA.relay?.totalPayableRaw;
    setSummary(
      'sum-offline',
      `<strong>Scenario A</strong> delivered · burn <span class="amount">${devState.scenarioA.economy.offlineBurnCpx} CPX</span> · aggregate rewards <span class="amount">${total != null ? rawCpx(total) : 'n/a'} CPX</span> · per-relay [${per.map((r) => rawCpx(r)).join(', ')}]`,
      'ok'
    );
    show(
      'out-offline',
      {
        readiness: devState.scenarioA.simulation.readiness,
        scenario: 'A',
        delivered: true,
        hops: devState.scenarioA.simulation.hops,
        route: devState.scenarioA.simulation.deliveryRoute,
        carrierRoutes: devState.scenarioA.simulation.carrierRoutes,
        totalRelayPayableRaw: total != null ? total.toString() : null,
        perRelayPayableRaw: per.map((x) => x.toString()),
        offlineBurnCpx: devState.scenarioA.economy.offlineBurnCpx,
        simulationDisclaimer: devState.scenarioA.economy.simulationDisclaimer,
      },
      'ok'
    );
  } catch (e) {
    devState.scenarioA = null;
    renderRoute('net-viz-dev', null);
    clearDevRouteDependent();
    setSummary('sum-offline', String(e.message || e), 'bad');
    show('out-offline', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-outage').onclick = () => {
  ++devRunId;
  try {
    const price = document.getElementById('price').value.trim() || '0.0005';
    // Failed scenario B clears route-dependent proofs/rewards/burns from current delivery view.
    devState.scenarioA = null;
    clearDevRouteDependent();
    const sim = sdk.runOfflineStoreCarryForward({
      ...baseSim,
      outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
      packet: { ...baseSim.packet, ttlMs: 2500 },
    });
    const failedPipe = sdk.runSimulatedDeliveryPipeline({
      simulationInput: {
        ...baseSim,
        outages: { Relay2: [{ startMs: 0, endMs: 10_000 }] },
        packet: { ...baseSim.packet, ttlMs: 2500 },
      },
      cpxEurPriceDecimal: price,
    });
    devState.scenarioB = sim;
    devState.activeScenario = 'B';
    renderRoute('net-viz-dev', sim.deliveryRoute);
    const zero = failedPipe.ok ? null : failedPipe.failedEconomy;
    setSummary(
      'sum-offline',
      `<strong>Scenario B</strong> miss · burn <span class="amount">${zero ? zero.offlineBurnCpx : '0.000000'} CPX</span> · rewards <span class="amount">0</span> · proof invalid · prior A proofs cleared`,
      'warn'
    );
    show(
      'out-offline',
      {
        readiness: sim.readiness,
        scenario: 'B',
        delivered: sim.delivered,
        expired: sim.expired,
        hops: sim.hops,
        failedEconomy: zero,
        deliveryProofValid: false,
        note: 'Outage/expiry — route-dependent proofs/rewards/burns cleared; no auto-success',
      },
      sim.delivered ? 'ok' : 'warn'
    );
  } catch (e) {
    devState.scenarioA = null;
    clearDevRouteDependent();
    renderRoute('net-viz-dev', null);
    setSummary('sum-offline', String(e.message || e), 'bad');
    show('out-offline', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-proof').onclick = () => {
  if (!devState.scenarioA || !devState.scenarioA.ok) {
    setSummary('sum-proof', 'Need successful delivery first (run offline delivery A)', 'bad');
    show('out-proof', { error: 'Need successful delivery first (run offline delivery)' }, 'bad');
    return;
  }
  const proof = devState.scenarioA.proof;
  const expected = devState.scenarioA.recipientSigner.publicKeyB64;
  const ok = sdk.verifyDemoDeliveryProof(proof, expected);
  const tampered = sdk.tamperDemoDeliveryProof(proof, { hops: 99 });
  const bad = sdk.verifyDemoDeliveryProof(tampered, expected);
  const wrongSigner = sdk.verifyDemoDeliveryProof(proof, sdk.generateDemoKeyPair().publicKeyB64);
  setSummary(
    'sum-proof',
    `Valid=${ok.ok} · tamper rejected=${bad.ok === false} · wrong signer rejected=${wrongSigner.ok === false}`,
    ok.ok && !bad.ok && !wrongSigner.ok ? 'ok' : 'bad'
  );
  show(
    'out-proof',
    {
      readiness: proof.readiness,
      scenario: 'A',
      valid: ok.ok,
      tamperedRejected: bad.ok === false,
      wrongSignerRejected: wrongSigner.ok === false,
    },
    ok.ok && !bad.ok && !wrongSigner.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-relay').onclick = () => {
  if (!devState.scenarioA || !devState.scenarioA.ok || !devState.scenarioA.relay) {
    setSummary('sum-relay', 'Need successful multi-hop delivery first', 'bad');
    show('out-relay', { error: 'Need successful multi-hop delivery first' }, 'bad');
    return;
  }
  const pipe = devState.scenarioA;
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
  setSummary(
    'sum-relay',
    `Pages=${pipe.relay.bundle.pages.length} · verified=${v.ok} · aggregate ${rawCpx(pipe.relay.totalPayableRaw)} CPX`,
    v.ok && !tamperedRoot.ok ? 'ok' : 'bad'
  );
  show(
    'out-relay',
    {
      readiness: pipe.relay.bundle.readiness,
      scenario: 'A',
      pages: pipe.relay.bundle.pages.length,
      verified: v.ok,
      tamperRejected: tamperedRoot.ok === false,
      perRelayPayableRaw: pipe.relay.perRelayPayableRaw.map(String),
      totalPayableRaw: pipe.relay.totalPayableRaw.toString(),
      root: pipe.relay.bundle.rootCommitmentHex.slice(0, 16) + '…',
    },
    v.ok && !tamperedRoot.ok ? 'ok' : 'bad'
  );
};

document.getElementById('btn-passport').onclick = () => {
  const kp = sdk.generateDemoKeyPair();
  const passport = sdk.createDemoPublicPassport({ nodeId: 'node-demo', signer: kp, issuedAtMs: 1 });
  const ok = sdk.verifyPublicPassport(passport, kp.publicKeyB64);
  const wrong = sdk.verifyPublicPassport(passport, sdk.generateDemoKeyPair().publicKeyB64);
  setSummary(
    'sum-passport',
    `Possession OK=${ok.ok} · wrong signer rejected=${wrong.ok === false} · ${ok.authority}`,
    ok.ok && !wrong.ok ? 'ok' : 'bad'
  );
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

document.getElementById('btn-econ-delivery').onclick = () => {
  if (!devState.scenarioA || !devState.scenarioA.ok) {
    setSummary('sum-econ-delivery', 'Run successful offline delivery (A) first.', 'bad');
    show('out-econ-delivery', { error: 'Need successful delivery pipeline first' }, 'bad');
    return;
  }
  const quote = devState.scenarioA.economy;
  const relay = devState.scenarioA.relay;
  setSummary(
    'sum-econ-delivery',
    `<strong>CURRENT DELIVERY ECONOMY</strong> · burn ${quote.offlineBurnCpx} CPX · aggregate ${relay ? rawCpx(relay.totalPayableRaw) : rawCpx(quote.actualPayableRaw)} CPX · ${quote.simulationDisclaimer}`,
    'ok'
  );
  show(
    'out-econ-delivery',
    {
      source: 'CURRENT_DELIVERY_PIPELINE',
      readiness: quote.readiness,
      offlineBurnCpx: quote.offlineBurnCpx,
      nominalRelayCpx: quote.nominalRelayCpx,
      perRelayPayableRaw: relay ? relay.perRelayPayableRaw.map(String) : null,
      totalPayableRaw: relay ? relay.totalPayableRaw.toString() : null,
      referral: quote.referral,
      first5000: quote.first5000,
      walletToWalletAppBurnRaw: quote.walletToWalletAppBurnRaw.toString(),
      relaySolExpense: quote.relaySolExpense,
      simulationDisclaimer: quote.simulationDisclaimer,
      settlementExecution: quote.settlementExecution,
    },
    'ok'
  );
};

function resetIndependentQuote() {
  devState.independentQuote = null;
  setSummary('sum-econ', 'Independent quote cleared (input changed).', 'muted');
  show('out-econ', 'Ready.', '');
}

document.getElementById('price').addEventListener('input', resetIndependentQuote);
document.getElementById('referral-eligible').addEventListener('change', resetIndependentQuote);
document.getElementById('referral-count').addEventListener('input', resetIndependentQuote);
document.getElementById('referrer-counted').addEventListener('input', resetIndependentQuote);

document.getElementById('btn-econ').onclick = () => {
  try {
    const eligible = document.getElementById('referral-eligible').checked;
    const count = Number(document.getElementById('referral-count').value);
    const countedRawText = document.getElementById('referrer-counted').value.trim();
    let alreadyCountedReferrerPeriodRaw = null;
    if (countedRawText !== '') {
      alreadyCountedReferrerPeriodRaw = BigInt(countedRawText);
    }
    const quote = sdk.quoteDeliveryEconomy({
      cpxEurPriceDecimal: document.getElementById('price').value.trim(),
      alreadyCountedNodePeriodRaw: 0n,
      globalAlreadyPaidRaw: 0n,
      referralEligibility: eligible
        ? {
            hasValidReferralRelationship: true,
            validReferredCountForReferrer: count,
            alreadyCountedReferrerPeriodRaw,
          }
        : undefined,
    });
    devState.independentQuote = quote;
    const referral = quote.referral.applied
      ? `${rawCpx(quote.referral.referrerRaw)}/${rawCpx(quote.referral.relayRaw)}`
      : quote.referral.reason;
    setSummary(
      'sum-econ',
      `<strong>INDEPENDENT ECONOMY CALCULATOR</strong> · hypothetical · burn ${quote.offlineBurnCpx} CPX · payable ${rawCpx(quote.actualPayableRaw)} CPX · referral ${referral}`,
      'ok'
    );
    show(
      'out-econ',
      {
        source: 'INDEPENDENT_ECONOMY_CALCULATOR',
        readiness: quote.readiness,
        simulationDisclaimer: quote.simulationDisclaimer,
        onlineMessagingCpxRaw: quote.onlineMessagingCpxRaw.toString(),
        offlineBurnCpx: quote.offlineBurnCpx,
        nominalRelayCpx: quote.nominalRelayCpx,
        actualPayableRaw: quote.actualPayableRaw.toString(),
        globalPoolHardCapRaw: quote.globalPoolHardCapRaw.toString(),
        referral: quote.referral,
        first5000: quote.first5000,
        walletToWalletAppBurnRaw: quote.walletToWalletAppBurnRaw.toString(),
        relaySolExpense: quote.relaySolExpense,
        settlementExecution: quote.settlementExecution,
      },
      'ok'
    );
  } catch (e) {
    setSummary('sum-econ', String(e.message || e), 'bad');
    show('out-econ', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-market').onclick = () => {
  try {
    const payment = sdk.quoteDirectMarketPayment({
      category: document.getElementById('market-cat').value,
      principalCpxDecimal: document.getElementById('principal').value.trim(),
    });
    devState.market = payment;
    setSummary(
      'sum-market',
      `${payment.exampleLabel}<br/>recipient ${payment.recipientReceivesCpx} + burn ${payment.buyerExtraBurnCpx} = payer ${payment.buyerTotalCpx} CPX · fee ${payment.platformCommission} · escrow ${payment.custodialEscrow} · housing EUR ${payment.housingRentRemainsEur}`,
      'ok'
    );
    show(
      'out-market',
      {
        readiness: payment.readiness,
        category: payment.category,
        exampleLabel: payment.exampleLabel,
        recipientReceivesCpx: payment.recipientReceivesCpx,
        buyerExtraBurnCpx: payment.buyerExtraBurnCpx,
        buyerTotalCpx: payment.buyerTotalCpx,
        platformCommission: payment.platformCommission,
        custodialEscrow: payment.custodialEscrow,
        solFeesRentSeparateSubjectToApproval: payment.solFeesRentSeparateSubjectToApproval,
        housingRentRemainsEur: payment.housingRentRemainsEur,
      },
      'ok'
    );
  } catch (e) {
    setSummary('sum-market', String(e.message || e), 'bad');
    show('out-market', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('principal').addEventListener('input', () => {
  setSummary('sum-market', 'Market quote cleared (input changed).', 'muted');
  show('out-market', 'Ready.', '');
});
document.getElementById('market-cat').addEventListener('change', () => {
  setSummary('sum-market', 'Market quote cleared (category changed).', 'muted');
  show('out-market', 'Ready.', '');
});

async function runDevSolana(includeSnapshot) {
  if (devBusy) return;
  devBusy = true;
  const runId = ++devRunId;
  setSummary('sum-solana', 'Fetching live read-only…', 'warn');
  show('out-solana', 'Fetching…', 'warn');
  try {
    let mint = devState.solana && devState.solana.mint;
    let dual = devState.solana && devState.solana.dual;
    if (!includeSnapshot || !mint || !dual) {
      mint = await sdk.fetchInspectCpxMint();
      if (runId !== devRunId) return;
      dual = await sdk.fetchInspectProgramDualRpc();
      if (runId !== devRunId) return;
      devState.solana = { mint, dual };
    }
    let snapshot = null;
    if (includeSnapshot) {
      // Reuse genuine existing results — no redundant RPC when already captured.
      snapshot = await sdk.fetchHistoricalRpcSnapshot({ mint, programDualRpc: dual });
      if (runId !== devRunId) return;
    }
    const cls = solanaStatusClass(mint.status, dual.agreement);
    setSummary(
      'sum-solana',
      `mint=${text(mint.status)} · supply=${text(mint.supplyUi ?? '')} · decimals=${text(mint.decimals ?? '')} · rpc=${text(mint.rpcUrl ?? '')} · slot=${text(mint.slot)} · at=${text(mint.inspectedAtIso ?? '')}${
        mint.failureKind ? ' · ' + text(mint.failureKind) : ''
      } · fallback=${text(!!mint.usedFallback)} · program=${text(dual.agreement)}${
        snapshot
          ? ' · historical @ ' + text(snapshot.capturedAtIso) + ' reused=' + text(snapshot.reusedExistingResults) + ' (NOT LIVE)'
          : ''
      }<br/><a href="${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintSolscan)}" target="_blank" rel="noopener">Solscan</a> · <a href="${text(sdk.PUBLIC_EXPLORER_LINKS.cpxMintPhantom)}" target="_blank" rel="noopener">Phantom.com</a>`,
      cls
    );
    show(
      'out-solana',
      {
        mintStatus: mint.status,
        failureKind: mint.failureKind || null,
        usedFallback: !!mint.usedFallback,
        primary: mint.primary || mint.primaryError || null,
        secondary: mint.secondary || null,
        decimals: mint.decimals,
        supplyRaw: mint.supplyRaw,
        supplyUi: mint.supplyUi,
        supplySource: mint.supplySource,
        mintAuthorityRevoked: mint.mintAuthorityRevoked,
        freezeAuthorityRevoked: mint.freezeAuthorityRevoked,
        rpcUrl: mint.rpcUrl,
        slot: mint.slot,
        inspectedAtIso: mint.inspectedAtIso,
        programAgreement: dual.agreement,
        programResults: dual.results.map((r) => ({
          rpcUrl: r.rpcUrl,
          status: r.status,
          failureKind: r.failureKind || null,
          executable: r.executable,
          ownerProgram: r.ownerProgram,
          slot: r.slot,
        })),
        explorer: sdk.PUBLIC_EXPLORER_LINKS,
        historicalSnapshot: snapshot
          ? {
              presentation: snapshot.presentation,
              capturedAtIso: snapshot.capturedAtIso,
              reusedExistingResults: snapshot.reusedExistingResults,
            }
          : null,
        writesEnabled: false,
      },
      cls
    );
  } catch (e) {
    if (runId !== devRunId) return;
    setSummary('sum-solana', text(e.message || e), 'bad');
    show('out-solana', { error: String(e.message || e) }, 'bad');
  } finally {
    if (runId === devRunId) devBusy = false;
  }
}

document.getElementById('btn-solana').onclick = () => runDevSolana(false);
document.getElementById('btn-solana-snap').onclick = () => runDevSolana(true);
