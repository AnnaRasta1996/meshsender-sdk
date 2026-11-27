/**
 * Actual playground interactions via bundled SDK logic (Node mirror of UI flows).
 * Reports honestly if browser automation runtime is unavailable.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runSimulatedDeliveryPipeline,
  verifyDemoDeliveryProof,
  tamperDemoDeliveryProof,
  verifyPagedRelayEvidence,
  createDemoPublicPassport,
  verifyPublicPassport,
  generateDemoKeyPair,
  quoteDeliveryEconomy,
  quoteDirectMarketPayment,
  fetchInspectCpxMint,
  fetchInspectProgramDualRpc,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'playground');
const bundlePath = path.join(root, 'meshsender-sdk.bundle.js');

async function main(): Promise<void> {
  if (!existsSync(bundlePath)) {
    console.error('BROWSER_BUNDLE_MISSING');
    process.exitCode = 1;
    return;
  }
  const bundle = readFileSync(bundlePath, 'utf8');
  if (
    !bundle.includes('runSimulatedDeliveryPipeline') ||
    bundle.includes('sdk-browser.js') ||
    bundle.includes('__require("@solana/web3.js")') ||
    bundle.includes('src/solana/mainnetReadOnly')
  ) {
    console.error('BROWSER_BUNDLE_INVALID');
    process.exitCode = 1;
    return;
  }

  // Serve playground and fetch index (HTTP + asset checks).
  const server = createServer((req, res) => {
    const rel = (req.url || '/') === '/' ? '/index.html' : req.url!;
    const file = path.normalize(path.join(root, rel));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end('no');
      return;
    }
    try {
      const data = readFileSync(file);
      res.writeHead(200);
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('no');
    }
  });

  await new Promise<void>((resolve) => server.listen(8791, '127.0.0.1', resolve));
  const html = await (await fetch('http://127.0.0.1:8791/')).text();
  const js = await (await fetch('http://127.0.0.1:8791/meshsender-sdk.bundle.js')).text();
  const app = await (await fetch('http://127.0.0.1:8791/app.js')).text();
  server.close();

  const pageOk =
    html.includes('data-testid="btn-offline"') &&
    html.includes('data-testid="btn-guided"') &&
    html.includes('Humanity Is the Infrastructure') &&
    html.includes('meshsender-sdk.bundle.js') &&
    !html.includes('sdk-browser.js') &&
    js.length > 1000 &&
    app.includes('MeshSenderSDK') &&
    app.includes('Need successful delivery first') &&
    !app.includes("getElementById('btn-offline').click()");

  // Execute the same interactive flows the UI buttons trigger.
  const pipe = runSimulatedDeliveryPipeline({
    simulationInput: {
      seed: 'interact',
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
        packetId: 'ui',
        from: 'Alice',
        to: 'Bob',
        createdAtMs: 0,
        ttlMs: 60_000,
        payload: 'ui',
      },
    },
  });
  if (!pipe.ok || !pipe.relay) {
    console.error('INTERACT_PIPELINE_FAIL', pipe);
    process.exitCode = 1;
    return;
  }
  const proofOk = verifyDemoDeliveryProof(pipe.proof, pipe.recipientSigner.publicKeyB64).ok;
  const tamperOk = verifyDemoDeliveryProof(
    tamperDemoDeliveryProof(pipe.proof, { hops: 9 }),
    pipe.recipientSigner.publicKeyB64
  ).ok;
  const relayOk = verifyPagedRelayEvidence({
    bundle: pipe.relay.bundle,
    expectedSignerPublicKeysB64: pipe.relay.expectedSigners,
    expectedRootCommitmentHex: pipe.relay.bundle.rootCommitmentHex,
  }).ok;
  const kp = generateDemoKeyPair();
  const pass = createDemoPublicPassport({ nodeId: 'n', signer: kp, issuedAtMs: 1 });
  const passOk = verifyPublicPassport(pass, kp.publicKeyB64).ok;
  const econ = quoteDeliveryEconomy({ cpxEurPriceDecimal: '0.0005' });
  const market = quoteDirectMarketPayment({
    category: 'product',
    principalCpxDecimal: '10.000000',
  });

  let solana: unknown = null;
  let browserRuntime: 'NODE_MIRROR_OF_UI_FLOWS' | 'BROWSER_AUTOMATION_UNAVAILABLE' =
    'NODE_MIRROR_OF_UI_FLOWS';
  try {
    // No Playwright/Puppeteer shipped — honest label.
    browserRuntime = 'BROWSER_AUTOMATION_UNAVAILABLE';
    solana = {
      mint: await fetchInspectCpxMint(),
      dual: await fetchInspectProgramDualRpc(),
    };
  } catch (e) {
    solana = { error: e instanceof Error ? e.message : String(e) };
  }

  console.log(
    JSON.stringify(
      {
        pageOk,
        browserRuntime,
        proofOk,
        tamperRejected: tamperOk === false,
        relayOk,
        passOk,
        actualPayableRaw: econ.actualPayableRaw.toString(),
        marketBurnCpx: market.buyerExtraBurnCpx,
        solana,
      },
      null,
      2
    )
  );
  console.log('PLAYGROUND_INTERACT_COMPLETE');
  if (!pageOk || !proofOk || tamperOk || !relayOk || !passOk) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
