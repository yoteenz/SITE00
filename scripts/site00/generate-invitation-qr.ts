#!/usr/bin/env npx tsx
/**
 * Print-ready QR for SITE 00 invitation campaigns (first-party URL, no secrets).
 *
 * Usage:
 *   npx tsx scripts/site00/generate-invitation-qr.ts [--origin https://site00.com] [--code aio-office-inv001] [--out /tmp/invite-qr.svg]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  aioOfficeInvitationCodeValue,
  invitationPublicUrl,
  renderInvitationQrSvg,
} from '../../shared/site00-invitation-system/index.js';

function arg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

async function main() {
  const origin = arg('origin', 'https://site00.com');
  const code = arg('code', aioOfficeInvitationCodeValue());
  const out = resolve(arg('out', `/tmp/site00-invite-${code}.svg`));
  const url = invitationPublicUrl(origin, code);
  const svg = await renderInvitationQrSvg({ destinationUrl: url });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg, 'utf8');
  console.log(JSON.stringify({ destination_url: url, svg_path: out, code }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
