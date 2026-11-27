const sdk = window.MeshSenderSDKBrowser;

function show(id, value, cls) {
  const el = document.getElementById(id);
  el.textContent = typeof value === 'string' ? value : JSON.stringify(value, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v, 2);
  el.className = cls || '';
}

document.getElementById('btn-offline').onclick = () => {
  const result = sdk.runOfflineSim({
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
      ttlMs: 60000,
      payload: 'ui-demo',
    },
  });
  show('out-offline', result, result.delivered ? 'ok' : 'bad');
};

document.getElementById('btn-proof').onclick = async () => {
  const kp = nacl.sign.keyPair();
  const digest = await sdk.sha256Hex('ui-demo-payload');
  const claims = {
    messageId: 'pkt-ui',
    fromNodeId: 'Alice',
    toNodeId: 'Bob',
    deliveredAtMs: 3000,
    hops: 3,
    ingressTransport: 'ble',
    payloadDigestHex: digest,
  };
  const proof = sdk.createProof(claims, kp.secretKey, sdk.b64encode(kp.publicKey));
  const ok = sdk.verifyProof(proof);
  const tampered = { ...proof, hops: 99 };
  const tamperOk = sdk.verifyProof(tampered);
  show(
    'out-proof',
    {
      readiness: proof.readiness,
      disclosure: proof.disclosure,
      valid: ok,
      tamperedRejected: tamperOk === false,
    },
    ok && !tamperOk ? 'ok' : 'bad'
  );
};

document.getElementById('btn-econ').onclick = () => {
  const price = document.getElementById('price').value.trim();
  try {
    const burn = sdk.offlineBurnRaw(price);
    const relay = sdk.nominalRelayRaw(price);
    show(
      'out-econ',
      {
        readiness: 'VERIFIED_SYNTHETIC',
        price,
        offlineBurnCpx: sdk.rawToCpx(burn),
        nominalRelayCpx: sdk.rawToCpx(relay),
        rewardSource: 'REWARD_RESERVE',
        settlementExecution: 'BLOCKED_NOT_IN_OPEN_SDK',
      },
      'ok'
    );
  } catch (e) {
    show('out-econ', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-market').onclick = () => {
  const principal = document.getElementById('principal').value.trim();
  try {
    const [whole, frac = ''] = principal.split('.');
    const raw =
      BigInt(whole) * 1000000n + BigInt((frac + '000000').slice(0, 6));
    const burn = sdk.marketBurnRaw(raw);
    show(
      'out-market',
      {
        readiness: 'SIMULATED',
        recipientReceivesCpx: sdk.rawToCpx(raw),
        buyerExtraBurnCpx: sdk.rawToCpx(burn),
        buyerTotalCpx: sdk.rawToCpx(raw + burn),
        platformCommission: 0,
        custodialEscrow: false,
        marketplaceOperationalClaim: 'NOT_CLAIMED_UNFINISHED_FEATURES_PENDING',
      },
      'ok'
    );
  } catch (e) {
    show('out-market', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-solana').onclick = async () => {
  show('out-solana', 'Fetching mainnet…', 'warn');
  try {
    const snap = await sdk.liveSolana();
    show('out-solana', snap, 'ok');
  } catch (e) {
    show('out-solana', { error: String(e.message || e) }, 'bad');
  }
};

document.getElementById('btn-relay-note').onclick = () => {
  show(
    'out-relay',
    {
      readiness: 'VERIFIED_SYNTHETIC',
      disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
      note: 'Full paged relay evidence + rolling commitments run in Node: npm run demo',
      antiFraudInternals: 'NOT_EXPORTED',
    },
    'warn'
  );
};
