#!/usr/bin/env node
/**
 * Copy nested .htaccess into SPA route-prefix folders after Vite build.
 * GoDaddy frequently has a physical projects/ directory; root rewrites may not run.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const NESTED_TEMPLATE = path.join(ROOT, 'scripts', 'spa-htaccess-nested.txt');
const ROOT_HTACCESS = path.join(ROOT, 'public', '.htaccess');

export const SPA_ROUTE_PREFIXES = [
  'projects',
  'services',
  'control',
  'origin',
  'studio-world',
  'admin',
  'app',
  'assts',
  'idnty',
  'bldr',
  'evolve',
  'validation',
  'astral-world',
  'sign-in',
  'identity',
  'register',
  'create-account',
];

const nestedBody = readFileSync(NESTED_TEMPLATE, 'utf8');
const rootBody = readFileSync(ROOT_HTACCESS, 'utf8');

for (const prefix of SPA_ROUTE_PREFIXES) {
  const dir = path.join(DIST, prefix);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, '.htaccess'), nestedBody, 'utf8');
  // Visible copy — GoDaddy FTP/cPanel often skips dotfiles; post-deploy activates via rename/upload.
  writeFileSync(path.join(dir, 'htaccess-nested.txt'), nestedBody, 'utf8');
}

writeFileSync(path.join(DIST, 'htaccess-deploy.txt'), rootBody, 'utf8');
copyFileSync(ROOT_HTACCESS, path.join(DIST, '.htaccess'));

console.log(
  `Wrote nested SPA .htaccess for ${SPA_ROUTE_PREFIXES.length} route prefixes + htaccess-deploy.txt + htaccess-nested.txt`,
);
