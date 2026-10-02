/**
 * Proof-harness font shim. Production loads Martian Mono from Google Fonts (site00-fonts.css). Sandboxed
 * Chromium often cannot reach Google Fonts, which silently falls back to a generic monospace and makes
 * every visual comparison wrong. When SITE00_PROOF_FONT_CACHE (default /tmp/site00-proof-fonts) holds a
 * copy fetched by `scripts/site00-cache-proof-fonts.sh`, font requests are answered from that cache.
 * Proof-only: never used by the app.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PROOF_FONT_CACHE = process.env.SITE00_PROOF_FONT_CACHE ?? '/tmp/site00-proof-fonts';

export async function routeProofFonts(target) {
  const css = path.join(PROOF_FONT_CACHE, 'martian.css');
  if (!fs.existsSync(css)) return false;
  // Playwright gives the most recently registered route priority: register the catch-all first.
  // Other Google font families are not used by the public redesign; answer empty instead of hanging.
  await target.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await target.route(/fonts\.googleapis\.com\/css2\?family=Martian\+Mono/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(css, 'utf8') }),
  );
  await target.route('https://fonts.gstatic.com/**', (route) => {
    const file = path.join(PROOF_FONT_CACHE, path.basename(new URL(route.request().url()).pathname));
    if (!fs.existsSync(file)) return route.abort();
    return route.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(file) });
  });
  return true;
}

/**
 * Proof-only passthrough for existing production assets on Supabase public storage (Origin landmark
 * plate, panel art, framework icons). Sandboxed Chromium cannot reach them; `curl` (which honours the
 * environment proxy) fetches each once into the cache. These are the SAME production files the live
 * site loads — not authority screenshots.
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

export async function routeRemoteStorage(target) {
  const dir = path.join(PROOF_FONT_CACHE, 'storage');
  fs.mkdirSync(dir, { recursive: true });
  await target.route(/\/storage\/v1\/object\/public\//, (route) => {
    const url = route.request().url();
    const file = path.join(dir, crypto.createHash('sha1').update(url).digest('hex'));
    try {
      if (!fs.existsSync(file)) execFileSync('curl', ['-fsS', '--max-time', '20', url, '-o', file]);
      const ext = path.extname(new URL(url).pathname).toLowerCase();
      const type = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[ext] ?? 'application/octet-stream';
      return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
}
