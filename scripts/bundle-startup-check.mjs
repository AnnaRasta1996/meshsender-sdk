/**
 * Execute generated browser bundle in a browser-compatible sandbox:
 * no Node require, no Buffer global, no process.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = path.join(root, 'playground', 'meshsender-sdk.bundle.js');

if (!existsSync(bundlePath)) {
  console.error('BUNDLE_MISSING', bundlePath);
  process.exit(1);
}

const source = readFileSync(bundlePath, 'utf8');
if (source.includes('__require("@solana/web3.js")') || source.includes("__require('@solana/web3.js')")) {
  console.error('BUNDLE_CONTAINS_SOLANA_WEB3_REQUIRE');
  process.exit(1);
}
if (source.includes('src/solana/mainnetReadOnly')) {
  console.error('BUNDLE_CONTAINS_MAINNET_READONLY');
  process.exit(1);
}
if (!source.includes('Bundled license information') && !source.includes('noble-hashes')) {
  console.error('BUNDLE_MISSING_THIRD_PARTY_LICENSE_NOTICES');
  process.exit(1);
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  fetch: globalThis.fetch,
  atob: globalThis.atob,
  btoa: globalThis.btoa,
  TextEncoder: globalThis.TextEncoder,
  TextDecoder: globalThis.TextDecoder,
  Uint8Array: globalThis.Uint8Array,
  ArrayBuffer: globalThis.ArrayBuffer,
  crypto: globalThis.crypto,
  Math,
  JSON,
  Error,
  Map,
  Set,
  Promise,
  Date,
  // Intentionally omit: require, module, exports, Buffer, process, global
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'meshsender-sdk.bundle.js' });

const sdk = sandbox.MeshSenderSDK;
if (!sdk || typeof sdk.runSimulatedDeliveryPipeline !== 'function') {
  console.error('BUNDLE_SDK_GLOBAL_MISSING');
  process.exit(1);
}
if (typeof sdk.fetchInspectCpxMint !== 'function') {
  console.error('BUNDLE_RPC_HELPER_MISSING');
  process.exit(1);
}
if (sdk.CPX_MAINNET_MINT_ADDRESS !== '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X') {
  console.error('BUNDLE_MINT_CONSTANT_MISSING');
  process.exit(1);
}

const pipe = sdk.runSimulatedDeliveryPipeline({
  simulationInput: {
    seed: 'bundle-startup',
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
      packetId: 'bundle',
      from: 'Alice',
      to: 'Bob',
      createdAtMs: 0,
      ttlMs: 60_000,
      payload: 'startup',
    },
  },
  globalRemainingRawOverride: 200_000n,
});

if (!pipe.ok || !pipe.relay) {
  console.error('BUNDLE_PIPELINE_FAIL', pipe);
  process.exit(1);
}
if (pipe.relay.totalPayableRaw > 200_000n) {
  console.error('BUNDLE_BUDGET_EXCEEDED', pipe.relay.totalPayableRaw.toString());
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    noSolanaWeb3Require: true,
    noBufferGlobal: typeof sandbox.Buffer === 'undefined',
    noRequireGlobal: typeof sandbox.require === 'undefined',
    delivered: true,
    totalPayableRaw: pipe.relay.totalPayableRaw.toString(),
    perRelay: pipe.relay.perRelayPayableRaw.map((x) => x.toString()),
    forwardTimes: pipe.relay.forwardedAtMsByHop,
  })
);
console.log('BUNDLE_STARTUP_OK');
