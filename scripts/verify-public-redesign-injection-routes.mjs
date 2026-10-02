#!/usr/bin/env node
/**
 * HTTP smoke: injected asset URLs on key public redesign routes.
 * Usage: node scripts/verify-public-redesign-injection-routes.mjs [baseUrl]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = (process.argv[2] || 'http://localhost:5174').replace(/\/$/, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const urls = JSON.parse(
  fs.readFileSync(path.join(root, 'src/site00/authority/publicRedesignAssetUrls.ts'), 'utf8')
    .replace(/^[\s\S]*?=\s*/, '')
    .replace(/ as const;[\s\S]*$/, ''),
);

const routes = [
  { name: 'ORIGIN', path: '/' },
  { name: 'ORIGIN_ALIAS', path: '/origin' },
  { name: 'IDNTY', path: '/idnty/state' },
  { name: 'BLDR', path: '/bldr/state' },
  { name: 'BLDR_OVERVIEW', path: '/bldr/state?path=overview' },
  { name: 'BLDR_SYSTEMS', path: '/bldr/state?path=systems' },
  { name: 'EVOLVE', path: '/evolve/state' },
  { name: 'LOCATIONS', path: '/origin/locations' },
];

const assetChecks = [];
for (const url of Object.values(urls)) {
  const res = await fetch(`${base}${url}`);
  assetChecks.push({ url, status: res.status, ok: res.ok });
}

const routeChecks = [];
for (const r of routes) {
  const res = await fetch(`${base}${r.path}`);
  const html = await res.text();
  routeChecks.push({
    name: r.name,
    path: r.path,
    status: res.status,
    injectedSlots: (html.match(/data-asset-status="injected"/g) || []).length,
    placeholderSlots: (html.match(/data-asset-status="placeholder"/g) || []).length,
  });
}

const out = {
  base,
  asset_url_checks: assetChecks.filter((c) => !c.ok),
  asset_urls_ok: assetChecks.every((c) => c.ok),
  routes: routeChecks,
};
const outPath = '/opt/cursor/artifacts/public-redesign-injection-route-verify.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

if (!out.asset_urls_ok) process.exit(1);
if (routeChecks.some((r) => r.status !== 200)) process.exit(1);
