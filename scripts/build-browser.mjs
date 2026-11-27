import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'browser-entry.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'MeshSenderSDK',
  outfile: path.join(root, 'playground', 'meshsender-sdk.bundle.js'),
  platform: 'browser',
  target: ['es2020'],
  sourcemap: false,
  minify: false,
  logLevel: 'info',
  // Keep Solana web3 out of the tiny judge playground core; live RPC uses fetch helper in app.js.
  external: ['@solana/web3.js'],
});

console.log('BROWSER_BUNDLE_OK playground/meshsender-sdk.bundle.js');
