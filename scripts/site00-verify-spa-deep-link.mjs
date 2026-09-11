#!/usr/bin/env node
/**
 * One-shot SPA deep link probe (used after htaccess activation).
 */
const FRONTEND_URL = (process.env.SITE00_FRONTEND_URL ?? 'https://site00.com').replace(/\/$/, '');
const PROBE = process.env.SPA_DEEP_LINK_PROBE ?? '/projects/site00/design';

const res = await fetch(`${FRONTEND_URL}${PROBE}`, {
  headers: { Accept: 'text/html' },
  redirect: 'follow',
});
const html = await res.text();
const spaShell = html.includes('id="root"') || html.includes("id='root'");

if (!res.ok || !spaShell) {
  console.error(
    JSON.stringify({
      ok: false,
      url: `${FRONTEND_URL}${PROBE}`,
      status: res.status,
      spaShell,
      hint: 'Rename htaccess-deploy.txt → .htaccess and projects/htaccess-nested.txt → .htaccess in cPanel',
    }),
  );
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, url: `${FRONTEND_URL}${PROBE}`, status: res.status }));
