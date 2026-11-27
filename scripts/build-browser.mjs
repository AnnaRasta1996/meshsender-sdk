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
  // Browser entry must never pull @solana/web3.js (publicIdentifiers + publicRpcFetch only).
  // Fail the build if a Node-only Solana import sneaks back in.
  plugins: [
    {
      name: 'reject-solana-web3',
      setup(build) {
        build.onResolve({ filter: /@solana\/web3\.js$/ }, () => {
          return {
            errors: [
              {
                text: 'browser bundle must not import @solana/web3.js — use publicIdentifiers / publicRpcFetch',
              },
            ],
          };
        });
      },
    },
  ],
  banner: {
    js: '/* MeshSender Open SDK browser bundle — third-party notices preserved at EOF by esbuild. */',
  },
});

console.log('BROWSER_BUNDLE_OK playground/meshsender-sdk.bundle.js');
