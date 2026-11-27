import { runSimulatedDeliveryPipeline } from '../src/index.ts';

const pipe = runSimulatedDeliveryPipeline({
  simulationInput: {
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
  },
});

console.log({
  ok: pipe.ok,
  hops: pipe.ok ? pipe.simulation.hops : null,
  proofVerified: pipe.ok ? pipe.proofVerified : false,
  relayVerified: pipe.ok ? pipe.relay?.verified : false,
  offlineBurnCpx: pipe.ok ? pipe.economy.offlineBurnCpx : null,
  actualPayableRaw: pipe.ok ? pipe.economy.actualPayableRaw.toString() : null,
});
