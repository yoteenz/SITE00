#!/usr/bin/env node
/**
 * Fail CI / packaging if the SPA bundle still contains server-only Playwright deps.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distAssets = join(process.cwd(), 'dist', 'assets');
const forbidden = ['chromium-bidi', 'import"playwright"', "import'playwright'"];

let files;
try {
  files = readdirSync(distAssets).filter((name) => name.endsWith('.js'));
} catch (err) {
  console.error('verify-production-dist: dist/assets missing — run npm run build first');
  process.exit(1);
}

if (files.length === 0) {
  console.error('verify-production-dist: no JS assets in dist/assets');
  process.exit(1);
}

const hits = [];
for (const file of files) {
  const src = readFileSync(join(distAssets, file), 'utf8');
  for (const needle of forbidden) {
    if (src.includes(needle)) hits.push(`${file}: ${needle}`);
  }
}

if (hits.length) {
  console.error('verify-production-dist: forbidden strings in client bundle:\n' + hits.join('\n'));
  process.exit(1);
}

const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
if (!indexHtml.includes('site00-assts-boot-recovery.js')) {
  console.error('verify-production-dist: dist/index.html missing boot recovery script');
  process.exit(1);
}

console.log(`verify-production-dist: OK (${files.length} JS assets checked)`);
