import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  runSimulatedDeliveryPipeline,
  createDefaultSimTransportBundle,
  FEATURE_READINESS_MATRIX,
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
} from '../src/index.ts';

describe('MeshSender Open SDK core', () => {
  it('pipeline delivers proof+relay+economy from successful simulation only', () => {
    const pipe = runSimulatedDeliveryPipeline({
      simulationInput: {
        seed: 'core',
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
          packetId: 'c1',
          from: 'A',
          to: 'B',
          createdAtMs: 0,
          ttlMs: 100,
          payload: 'x',
        },
      },
    });
    assert.equal(pipe.ok, true);
    if (!pipe.ok) return;
    assert.equal(pipe.proofVerified, true);
    assert.equal(pipe.relay?.verified, true);
    assert.equal(pipe.economy.settlementExecution, 'BLOCKED_NOT_IN_OPEN_SDK');
  });

  it('public ids and transports remain stable', () => {
    assert.equal(CPX_MAINNET_MINT_ADDRESS, '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X');
    assert.equal(MESHSENDER_PROGRAM_ID, 'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg');
    assert.equal(createDefaultSimTransportBundle().ble.readiness, 'SIMULATED');
    assert.ok(FEATURE_READINESS_MATRIX.length >= 8);
  });
});
