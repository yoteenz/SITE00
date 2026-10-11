#!/usr/bin/env node
/** Copy Opus V2 benchmark HTML + assets into public/ for isolated iframe preview. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'scripts/df-email-v2-benchmark/source');
const OUT = path.join(ROOT, 'public/site00-correspondence-studio/previews');

const MAP = [
  ['B01', 'B01_personal-foundation-invitation.html'],
  ['B02', 'B02_foundation-complete.html'],
  ['B03', 'B03_M06-bldr-introduction.html'],
];

function cpDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name);
    const d = path.join(to, name);
    if (fs.statSync(s).isDirectory()) cpDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.mkdirSync(OUT, { recursive: true });
cpDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
cpDir(path.join(SRC, 'art'), path.join(OUT, 'art'));
if (fs.existsSync(path.join(SRC, 'fonts'))) {
  cpDir(path.join(SRC, 'fonts'), path.join(OUT, 'fonts'));
}
fs.copyFileSync(path.join(SRC, 'base.css'), path.join(OUT, 'base.css'));

for (const [id, file] of MAP) {
  let html = fs.readFileSync(path.join(SRC, file), 'utf8');
  html = html.replace(/href="base\.css"/g, 'href="/site00-correspondence-studio/previews/base.css"');
  html = html.replace(/src="assets\//g, 'src="/site00-correspondence-studio/previews/assets/');
  html = html.replace(/src="art\//g, 'src="/site00-correspondence-studio/previews/art/');
  fs.writeFileSync(path.join(OUT, `${id}.html`), html);
  console.log('wrote', `${id}.html`);
}

console.log('sync complete →', OUT);
