import {
  createDemoDeliveryProof,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  digestPayload,
  generateDemoKeyPair,
} from '../src/index.ts';

const signer = generateDemoKeyPair();
const proof = createDemoDeliveryProof({
  claims: {
    messageId: 'tamper-demo',
    fromNodeId: 'A',
    toNodeId: 'B',
    deliveredAtMs: 1,
    hops: 1,
    ingressTransport: 'lora',
    payloadDigestHex: digestPayload('payload'),
  },
  signer,
});

const bad = tamperDemoDeliveryProof(proof, { payloadDigestHex: digestPayload('evil') });
console.log({
  valid: verifyDemoDeliveryProof(proof).ok,
  tamperedRejected: verifyDemoDeliveryProof(bad).ok === false,
});
