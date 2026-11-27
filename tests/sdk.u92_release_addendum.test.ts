import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BROWSER_FALLBACK_MINT_RPC,
  BROWSER_INDEPENDENT_SECONDARY_RPC,
  BROWSER_PREFERRED_MINT_RPC,
  DEFAULT_MAINNET_RPC,
  SECONDARY_MAINNET_RPC,
} from '../src/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('U92_RELEASE addendum public browser errors', () => {
  it('F01: playground favicon.svg + relative icon link + allowlist', () => {
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const svg = readFileSync(path.join(root, 'playground', 'favicon.svg'), 'utf8');
    const allow = readFileSync(path.join(root, 'PUBLICATION_ALLOWLIST.md'), 'utf8');
    assert.match(html, /rel="icon"[^>]*href="\.\/favicon\.svg"/);
    assert.match(svg, /<svg[\s\S]*MeshSender/);
    assert.match(allow, /favicon\.svg/);
  });

  it('F02: official mainnet RPC constant + browser secondary independent of publicnode', () => {
    assert.equal(DEFAULT_MAINNET_RPC, 'https://api.mainnet.solana.com');
    assert.equal(SECONDARY_MAINNET_RPC, 'https://solana-rpc.publicnode.com');
    assert.equal(BROWSER_PREFERRED_MINT_RPC, SECONDARY_MAINNET_RPC);
    assert.equal(BROWSER_FALLBACK_MINT_RPC, BROWSER_INDEPENDENT_SECONDARY_RPC);
    assert.notEqual(BROWSER_FALLBACK_MINT_RPC, DEFAULT_MAINNET_RPC);
    assert.notEqual(BROWSER_FALLBACK_MINT_RPC, BROWSER_PREFERRED_MINT_RPC);
    assert.equal(BROWSER_FALLBACK_MINT_RPC.includes('api-key'), false);
    assert.equal(BROWSER_FALLBACK_MINT_RPC.includes('apiKey'), false);
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    assert.match(app, /solanaRpcAvailabilityHtml/);
    assert.match(app, /CPX mint/);
    assert.match(app, /Settlement program/);
  });
});
