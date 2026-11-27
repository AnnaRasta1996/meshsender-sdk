import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('U92_RELEASE product video & English walkthrough', () => {
  it('playground video section above CTAs; walkthrough; lazy embed helper; no MP4', () => {
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    const cfg = readFileSync(path.join(root, 'playground', 'product-video-config.js'), 'utf8');
    const css = readFileSync(path.join(root, 'playground', 'styles.css'), 'utf8');
    assert.match(html, /See MeshSender in Action — Real Android Prototype/);
    assert.match(html, /id="product-video"/);
    assert.match(html, /earlier working Android development build/i);
    assert.match(html, /id="video-walkthrough"/);
    assert.match(html, /English Video Walkthrough/);
    assert.match(html, /product-video-config\.js/);
    const videoIdx = html.indexOf('id="product-video"');
    const guidedBtn = html.indexOf('id="btn-guided"');
    const guidedSection = html.indexOf('id="guided"');
    assert.ok(videoIdx > 0 && guidedBtn > videoIdx, 'video section above Guided Demo button');
    assert.ok(guidedSection > guidedBtn, 'guided panel remains after CTAs');
    assert.match(app, /mountProductVideo/);
    assert.match(app, /youtube-nocookie\.com\/embed/);
    assert.match(app, /loading="lazy"/);
    assert.equal(app.includes('autoplay=1'), false);
    assert.match(cfg, /youtubeWatchUrl/);
    assert.match(css, /\.video-aspect/);
    assert.match(css, /\.product-video/);
  });

  it('docs guide + README links + allowlist; no invented timestamps file claim', () => {
    const guide = readFileSync(path.join(root, 'docs', 'DEMO_VIDEO_GUIDE.md'), 'utf8');
    const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
    const allow = readFileSync(path.join(root, 'PUBLICATION_ALLOWLIST.md'), 'utf8');
    assert.match(guide, /Account registration and recovery/);
    assert.match(guide, /Mesh Mode/);
    assert.match(guide, /Offline Map/);
    assert.match(guide, /Phantom/);
    assert.match(guide, /CPX on Solana mainnet/);
    assert.match(guide, /Do not invent chapter times/i);
    assert.match(guide, /does \*\*not\*\* claim independently verified offline multi-hop/i);
    assert.match(readme, /DEMO_VIDEO_GUIDE\.md/);
    assert.match(readme, /annarasta1996\.github\.io\/meshsender-sdk/);
    assert.match(readme, /#product-video/);
    assert.match(allow, /DEMO_VIDEO_GUIDE\.md/);
    assert.match(allow, /product-video-config\.js/);
    assert.match(allow, /no MP4/);
  });
});
