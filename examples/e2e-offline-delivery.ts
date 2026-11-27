import {
  runOfflineStoreCarryForward,
  createDemoDeliveryProof,
  verifyDemoDeliveryProof,
  digestPayload,
  generateDemoKeyPair,
  signDemoRelayHop,
  buildPagedRelayEvidence,
  quoteDeliveryEconomy,
} from '../src/index.ts';

const sim = runOfflineStoreCarryForward({
  seed: 'example-e2e',
  nodes: ['A', 'R', 'B'],
  edges: [
    { a: 'A', b: 'R' },
    { a: 'R', b: 'B' },
  ],
  mobility: [
    { atMs: 1, meeting: ['A', 'R'] },
    { atMs: 2, meeting: ['R', 'B'] },
  ],
  packet: {
    packetId: 'ex-1',
    from: 'A',
    to: 'B',
    createdAtMs: 0,
    ttlMs: 100,
    payload: 'example',
  },
});

const signer = generateDemoKeyPair();
const proof = createDemoDeliveryProof({
  claims: {
    messageId: 'ex-1',
    fromNodeId: 'A',
    toNodeId: 'B',
    deliveredAtMs: sim.deliveryAtMs ?? 2,
    hops: sim.hops ?? 0,
    ingressTransport: 'ble',
    payloadDigestHex: digestPayload('example'),
  },
  signer,
});

const hop = signDemoRelayHop({
  messageId: 'ex-1',
  signer: generateDemoKeyPair(),
  hop: {
    absoluteRelayIndex: 0,
    relayNodeId: 'R',
    previousNodeId: 'A',
    forwardedAtMs: 1,
    ingressTransport: 'ble',
    rewardRawDecimal: '1000000',
  },
});

const evidence = buildPagedRelayEvidence({
  messageId: 'ex-1',
  intentDigestHex: digestPayload('intent'),
  nonceB64: 'ZXg=',
  senderDigestHex: digestPayload('A'),
  recipientDigestHex: digestPayload('B'),
  hops: [hop],
});

const economy = quoteDeliveryEconomy({ cpxEurPriceDecimal: '0.0005' });

console.log({
  delivered: sim.delivered,
  proofOk: verifyDemoDeliveryProof(proof).ok,
  relayRoot: evidence.rootCommitmentHex,
  offlineBurnCpx: economy.offlineBurnCpx,
  nominalRelayCpx: economy.nominalRelayCpx,
});
