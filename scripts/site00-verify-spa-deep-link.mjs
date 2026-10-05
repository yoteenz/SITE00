#!/usr/bin/env node
/**
 * SPA deep link probe (used after htaccess activation). Retries for GoDaddy propagation lag.
 */
import {
  CANONICAL_SPA_SHELL_ROUTES,
  isSpaShellHtml,
} from './spa-route-prefixes.mjs';

const FRONTEND_URL = (process.env.SITE00_FRONTEND_URL ?? 'https://site00.com').replace(/\/$/, '');
const PRIMARY_PROBE =
  process.env.SPA_DEEP_LINK_PROBE ??
  CANONICAL_SPA_SHELL_ROUTES.find((r) => r.includes('/projects/') && r.includes('/design')) ??
  '/projects/ndxbook/design';

const PROBES = [
  PRIMARY_PROBE,
  ...CANONICAL_SPA_SHELL_ROUTES.filter((r) => r !== PRIMARY_PROBE),
].filter((r, i, arr) => arr.indexOf(r) === i);

const ATTEMPTS = Math.max(1, Number.parseInt(process.env.SPA_VERIFY_ATTEMPTS ?? '8', 10) || 8);
const SLEEP_MS = Math.max(1000, Number.parseInt(process.env.SPA_VERIFY_SLEEP_MS ?? '10000', 10) || 10000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probePath(pathname) {
  const res = await fetch(`${FRONTEND_URL}${pathname}`, {
    headers: { Accept: 'text/html', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    redirect: 'follow',
  });
  const html = await res.text();
  const spaShell = isSpaShellHtml(html);
  return { res, html, spaShell, pathname };
}

let last = null;
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  for (const pathname of PROBES) {
    last = await probePath(pathname);
    if (last.res.ok && last.spaShell) {
      console.log(
        JSON.stringify({
          ok: true,
          url: `${FRONTEND_URL}${pathname}`,
          status: last.res.status,
          attempt,
        }),
      );
      process.exit(0);
    }
  }
  if (attempt < ATTEMPTS) {
    console.warn(
      JSON.stringify({
        ok: false,
        attempt,
        status: last?.res.status ?? 0,
        spaShell: last?.spaShell ?? false,
        probe: last?.pathname ?? PRIMARY_PROBE,
        retryInMs: SLEEP_MS,
      }),
    );
    await sleep(SLEEP_MS);
  }
}

console.error(
  JSON.stringify({
    ok: false,
    url: `${FRONTEND_URL}${last?.pathname ?? PRIMARY_PROBE}`,
    status: last?.res.status ?? 0,
    spaShell: last?.spaShell ?? false,
    attempts: ATTEMPTS,
    probes: PROBES.length,
    hint: 'cPanel: rename htaccess-deploy.txt → .htaccess and projects/htaccess-nested.txt → .htaccess (or re-run activate with FTP RNFR/RNTO)',
  }),
);
process.exit(1);
