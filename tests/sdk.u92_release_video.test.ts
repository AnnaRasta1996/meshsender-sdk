import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Load youtubeVideoIdFromUrl from playground/app.js without browser DOM side effects. */
function loadYoutubeParser() {
  const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
  const start = app.indexOf('function isStrictYoutubeVideoId');
  const end = app.indexOf('function mountProductVideo');
  assert.ok(start > 0 && end > start);
  const snippet = app.slice(start, end) + '\nthis.youtubeVideoIdFromUrl = youtubeVideoIdFromUrl;\n';
  const sandbox = { console, URL };
  vm.runInNewContext(snippet, sandbox);
  return sandbox.youtubeVideoIdFromUrl;
}

describe('U92_RELEASE_VIDEO_F1 final YouTube integration', () => {
  it('F01: config + Shorts/watch parse + portrait embed + no MP4', () => {
    const cfg = readFileSync(path.join(root, 'playground', 'product-video-config.js'), 'utf8');
    const html = readFileSync(path.join(root, 'playground', 'index.html'), 'utf8');
    const app = readFileSync(path.join(root, 'playground', 'app.js'), 'utf8');
    const css = readFileSync(path.join(root, 'playground', 'styles.css'), 'utf8');
    assert.match(cfg, /youtubeWatchUrl:\s*'https:\/\/www\.youtube\.com\/watch\?v=K9X8EYo6-CE'/);
    assert.match(cfg, /orientation:\s*'portrait'/);
    assert.equal(cfg.includes('.mp4'), false);

    const parse = loadYoutubeParser();
    assert.equal(parse('https://www.youtube.com/watch?v=K9X8EYo6-CE'), 'K9X8EYo6-CE');
    assert.equal(parse('https://youtube.com/shorts/K9X8EYo6-CE'), 'K9X8EYo6-CE');
    assert.equal(parse('https://youtu.be/K9X8EYo6-CE'), 'K9X8EYo6-CE');
    assert.equal(parse('https://www.youtube.com/embed/K9X8EYo6-CE'), 'K9X8EYo6-CE');
    assert.equal(parse('https://youtube.com/shorts/SHORT'), null);
    assert.equal(parse('https://www.youtube.com/watch?v=toolongvideoidx'), null);

    assert.match(app, /youtube-nocookie\.com\/embed\/\$\{encodeURIComponent\(id\)\}\?rel=0/);
    assert.match(app, /loading="lazy"/);
    assert.equal(app.includes('autoplay=1'), false);
    assert.match(app, /parts\[0\] === 'shorts'/);
    assert.match(app, /\^\[\\w-\]\{11\}\$/);
    assert.match(css, /video-aspect-portrait/);
    assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/);
    assert.match(html, /watch\?v=K9X8EYo6-CE/);
    assert.match(html, /walkthrough-details/);
    assert.match(html, /Same-conversation close-up/);
    assert.equal(html.includes('Repository remains <strong>PRIVATE</strong>'), false);
    assert.equal(html.includes('public publication\n      <strong>BLOCKED</strong>'), false);
    assert.match(html, /This repository is\s*<strong>PUBLIC<\/strong>/);
  });

  it('F02/F03: docs/README/package public metadata; private npm; no pending URL copy', () => {
    const guide = readFileSync(path.join(root, 'docs', 'DEMO_VIDEO_GUIDE.md'), 'utf8');
    const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
    const disclosure = readFileSync(path.join(root, 'DISCLOSURE_REVIEW.md'), 'utf8');
    const allow = readFileSync(path.join(root, 'PUBLICATION_ALLOWLIST.md'), 'utf8');
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

    assert.match(guide, /https:\/\/www\.youtube\.com\/watch\?v=K9X8EYo6-CE/);
    assert.equal(guide.includes('pending final owner-provided'), false);
    assert.equal(guide.includes('product-video-config.js'), false);
    assert.match(guide, /Same-conversation close-up/);
    assert.match(readme, /https:\/\/www\.youtube\.com\/watch\?v=K9X8EYo6-CE/);
    assert.match(readme, /Repository visibility: \*\*PUBLIC\*\*/);
    assert.equal(readme.includes('Repository visibility: **PRIVATE**'), false);
    assert.equal(readme.includes('Public GitHub Pages publication: **BLOCKED**'), false);
    assert.match(disclosure, /repository is \*\*PUBLIC\*\*/);
    assert.match(disclosure, /owner_approve_deploy/);
    assert.match(allow, /public\*\* Open SDK/);
    assert.equal(pkg.private, true);
    assert.equal(pkg.homepage, 'https://annarasta1996.github.io/meshsender-sdk/');
    assert.equal(pkg.repository.url, 'git+https://github.com/AnnaRasta1996/meshsender-sdk.git');
  });
});
