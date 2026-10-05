#!/usr/bin/env node
/**
 * Copy nested .htaccess + SPA shell stub into route-prefix folders after Vite build.
 * GoDaddy frequently has a physical projects/ directory; root rewrites may not run.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SPA_ROUTE_PREFIXES } from './spa-route-prefixes.mjs';

export { SPA_ROUTE_PREFIXES };

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const NESTED_TEMPLATE = path.join(ROOT, 'scripts', 'spa-htaccess-nested.txt');
const ROOT_HTACCESS = path.join(ROOT, 'public', '.htaccess');

const nestedBody = readFileSync(NESTED_TEMPLATE, 'utf8');
const rootBody = readFileSync(ROOT_HTACCESS, 'utf8');
const shellIndex = path.join(DIST, 'index.html');

if (!existsSync(shellIndex)) {
  console.warn('site00-propagate-spa-htaccess: dist/index.html missing — run vite build first');
}

for (const prefix of SPA_ROUTE_PREFIXES) {
  const dir = path.join(DIST, prefix);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, '.htaccess'), nestedBody, 'utf8');
  writeFileSync(path.join(dir, 'htaccess-nested.txt'), nestedBody, 'utf8');
  if (existsSync(shellIndex)) {
    copyFileSync(shellIndex, path.join(dir, 'index.html'));
  }
}

writeFileSync(path.join(DIST, 'htaccess-deploy.txt'), rootBody, 'utf8');
copyFileSync(ROOT_HTACCESS, path.join(DIST, '.htaccess'));

console.log(
  `Wrote nested SPA .htaccess + index.html stub for ${SPA_ROUTE_PREFIXES.length} route prefixes + htaccess-deploy.txt`,
);
