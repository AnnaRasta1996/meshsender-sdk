import {
  runSimulatedDeliveryPipeline,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  generateDemoKeyPair,
} from '../src/index.ts';

const pipe = runSimulatedDeliveryPipeline({
  simulationInput: {
    seed: 'tamper',
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
      packetId: 't1',
      from: 'A',
      to: 'B',
      createdAtMs: 0,
      ttlMs: 100,
      payload: 'p',
    },
  },
});
if (!pipe.ok) throw new Error('need delivery');
const bad = tamperDemoDeliveryProof(pipe.proof, { payloadDigestHex: 'ab'.repeat(32) });
console.log({
  valid: verifyDemoDeliveryProof(pipe.proof, pipe.recipientSigner.publicKeyB64).ok,
  tamperedRejected: verifyDemoDeliveryProof(bad, pipe.recipientSigner.publicKeyB64).ok === false,
  wrongSignerRejected:
    verifyDemoDeliveryProof(pipe.proof, generateDemoKeyPair().publicKeyB64).ok === false,
});
