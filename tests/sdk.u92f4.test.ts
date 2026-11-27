import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSimulatedDeliveryPipeline } from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const simInput = {
  seed: 'u92f4',
  nodes: ['A', 'R1', 'R2', 'B'],
  edges: [
    { a: 'A', b: 'R1' },
    { a: 'R1', b: 'R2' },
    { a: 'R2', b: 'B' },
  ],
  mobility: [
    { atMs: 1000, meeting: ['A', 'R1'] },
    { atMs: 2000, meeting: ['R1', 'R2'] },
    { atMs: 3000, meeting: ['R2', 'B'] },
  ],
  packet: {
    packetId: 'p1',
    from: 'A',
    to: 'B',
    createdAtMs: 0,
    ttlMs: 10_000,
    payload: 'hello',
  },
};

describe('U92F4 judge experience + micro fixes', () => {
  it('override larger than canonical does not increase payable total', () => {
    const baseline = runSimulatedDeliveryPipeline({ simulationInput: simInput });
    assert.equal(baseline.ok, true);
    if (!baseline.ok || !baseline.relay) return;
    const inflated = runSimulatedDeliveryPipeline({
      simulationInput: simInput,
      globalRemainingRawOverride: baseline.economy.globalRemainingRaw * 50n + 1n,
    });
    assert.equal(inflated.ok, true);
    if (!inflated.ok || !inflated.relay) return;
    assert.equal(inflated.relay.totalPayableRaw, baseline.relay.totalPayableRaw);
  });

  it('playground guided UI + no auto-run after verification request', () => {
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(html, /Humanity Is the Infrastructure/);
    assert.match(html, /btn-guided/);
    assert.match(html, /btn-dev-mode/);
    assert.match(html, /SIMULATED/);
    assert.match(html, /LIVE_READ_ONLY/);
    assert.equal(app.includes("getElementById('btn-offline').click()"), false);
    assert.match(app, /Need successful delivery first/);
    assert.match(app, /clearDevRouteDependent|clearEvidence/);
  });
});
