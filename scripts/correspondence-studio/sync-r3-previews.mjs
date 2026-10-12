#!/usr/bin/env node
/** Publish Email V2 R3 compositions and the R2 comparison territories into public/ for isolated iframe preview. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BENCH = path.join(ROOT, 'scripts/df-email-v2-benchmark');
const OUT = path.join(ROOT, 'public/site00-correspondence-studio/previews');
const R3_URL = '/site00-correspondence-studio/previews/r3';
const R2_URL = '/site00-correspondence-studio/previews/r2';

function cpDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name);
    const d = path.join(to, name);
    if (fs.statSync(s).isDirectory()) cpDir(s, d, filter);
    else if (filter(name)) fs.copyFileSync(s, d);
  }
}

const r3 = path.join(BENCH, 'r3');
const r3Out = path.join(OUT, 'r3');
cpDir(path.join(r3, 'assets'), path.join(r3Out, 'assets'));
cpDir(path.join(r3, 'fonts'), path.join(r3Out, 'fonts'));
for (const f of fs.readdirSync(path.join(r3, 'emails')).filter((n) => /^B0\d_R3\.html$/.test(n))) {
  const html = fs
    .readFileSync(path.join(r3, 'emails', f), 'utf8')
    .replaceAll('"../assets/', `"${R3_URL}/assets/`)
    .replaceAll('url("../assets/', `url("${R3_URL}/assets/`)
    .replaceAll('url("../fonts/', `url("${R3_URL}/fonts/`);
  fs.writeFileSync(path.join(r3Out, f), html);
  console.log('wrote r3/' + f);
}

const r2 = path.join(BENCH, 'r2');
const r2Out = path.join(OUT, 'r2');
cpDir(path.join(r2, 'assets'), path.join(r2Out, 'assets'));
cpDir(path.join(BENCH, 'source', 'fonts'), path.join(r2Out, 'fonts'), (n) => n.endsWith('.ttf'));
fs.writeFileSync(
  path.join(r2Out, 'r2.css'),
  fs.readFileSync(path.join(r2, 'r2.css'), 'utf8').replaceAll('url("../source/fonts/', `url("${R2_URL}/fonts/`),
);
for (const f of fs.readdirSync(path.join(r2, 'territories')).filter((n) => n.endsWith('.html'))) {
  const html = fs
    .readFileSync(path.join(r2, 'territories', f), 'utf8')
    .replaceAll('href="../r2.css"', `href="${R2_URL}/r2.css"`)
    .replaceAll('"../../source/assets/', '"/site00-correspondence-studio/previews/assets/')
    .replaceAll('"../../source/art/', '"/site00-correspondence-studio/previews/art/')
    .replaceAll('"../assets/', `"${R2_URL}/assets/`)
    .replaceAll('url("../assets/', `url("${R2_URL}/assets/`);
  fs.writeFileSync(path.join(r2Out, f), html);
  console.log('wrote r2/' + f);
}

const leftovers = [r3Out, r2Out].flatMap((dir) =>
  fs
    .readdirSync(dir)
    .filter((n) => n.endsWith('.html') || n.endsWith('.css'))
    .filter((n) => /\.\.\/(assets|fonts|source|r2\.css)/.test(fs.readFileSync(path.join(dir, n), 'utf8')))
    .map((n) => path.join(path.basename(dir), n)),
);
if (leftovers.length) {
  console.error('relative paths left unrewritten in', leftovers);
  process.exit(1);
}
console.log('sync complete →', OUT);
