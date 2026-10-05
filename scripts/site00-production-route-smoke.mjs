#!/usr/bin/env node
/**
 * P0.PROD.PROJECTS-ROUTE-RELIABILITY1 — production SPA shell route smoke (no browser auth).
 */
import { writeFileSync } from 'node:fs';
import {
  CANONICAL_SPA_SHELL_ROUTES,
  SPA_SHELL_MARKER,
  isRawApacheErrorHtml,
} from './spa-route-prefixes.mjs';

const FRONTEND_URL = (process.env.SITE00_FRONTEND_URL ?? 'https://site00.com').replace(/\/$/, '');
const REPEAT = Math.max(1, Number(process.env.SPA_ROUTE_REPEAT ?? 20));
const CRITICAL = ['/projects', '/projects/', '/projects/ndxbook/design'];

async function probeOnce(path) {
  const url = `${FRONTEND_URL}${path}`;
  const res = await fetch(url, { headers: { Accept: 'text/html' }, redirect: 'follow' });
  const html = await res.text();
  const raw403 = isRawApacheErrorHtml(html);
  const shell = html.includes(SPA_SHELL_MARKER) || html.includes("id='root'");
  const contentType = res.headers.get('content-type') ?? '';
  return {
    path,
    url,
    status: res.status,
    server: res.headers.get('server'),
    contentType,
    shell,
    raw403,
    ok: res.status === 200 && shell && !raw403 && contentType.includes('text/html'),
  };
}

async function probeRepeated(path, times) {
  const results = [];
  for (let i = 0; i < times; i++) {
    results.push(await probeOnce(path));
  }
  const failures = results.filter((r) => !r.ok);
  return {
    path,
    times,
    pass: times - failures.length,
    fail: failures.length,
    samples: failures.slice(0, 3),
  };
}

async function main() {
  const receipt = {
    frontendUrl: FRONTEND_URL,
    repeat: REPEAT,
    routes: {},
    critical: {},
    status: 'PASS',
    errors: [],
  };

  for (const route of CANONICAL_SPA_SHELL_ROUTES) {
    const once = await probeOnce(route);
    receipt.routes[route] = once;
    if (!once.ok) {
      receipt.status = 'FAIL';
      receipt.errors.push(`${route} HTTP ${once.status} shell=${once.shell} raw403=${once.raw403}`);
    }
  }

  for (const route of CRITICAL) {
    receipt.critical[route] = await probeRepeated(route, REPEAT);
    if (receipt.critical[route].fail > 0) {
      receipt.status = 'FAIL';
      receipt.errors.push(`${route} repeated failures ${receipt.critical[route].fail}/${REPEAT}`);
    }
  }

  const out = process.env.ROUTE_SMOKE_RECEIPT_PATH;
  if (out) writeFileSync(out, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
  process.exit(receipt.status === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
