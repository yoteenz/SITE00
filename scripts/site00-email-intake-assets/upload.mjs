// SITE 00 — Intake Access Email Family — upload approved masters + derivatives to Supabase
// Storage (reusing the existing public SITE00_ASSETS_BUCKET convention from api/_lib/site00Assts/storage.ts,
// so this pilot does not invent a second hosting mechanism).
import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile } from 'node:fs/promises';

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
const ROOT = 'site00/email/intake-access';

const FILES = [
  { local: '/tmp/site00-intake-assets/master/site00-email-intake-builder-blueprint-master.png', remote: `${ROOT}/master/site00-email-intake-builder-blueprint-master.png` },
  { local: '/tmp/site00-intake-assets/derived/site00-email-intake-builder-blueprint-desktop.png', remote: `${ROOT}/derived/site00-email-intake-builder-blueprint-desktop.png` },
  { local: '/tmp/site00-intake-assets/derived/site00-email-intake-builder-blueprint-mobile.png', remote: `${ROOT}/derived/site00-email-intake-builder-blueprint-mobile.png` },

  { local: '/tmp/site00-intake-assets/master/site00-email-intake-identity-portrait-master-v2.png', remote: `${ROOT}/master/site00-email-intake-identity-portrait-master-v2.png` },
  { local: '/tmp/site00-intake-assets/master/site00-email-intake-identity-archival-note-v3.png', remote: `${ROOT}/master/site00-email-intake-identity-archival-note-v3.png` },
  { local: '/tmp/site00-intake-assets/master/site00-email-intake-identity-fingerprint-v3.png', remote: `${ROOT}/master/site00-email-intake-identity-fingerprint-v3.png` },
  { local: '/tmp/site00-intake-assets/master/site00-email-intake-identity-seal-base.png', remote: `${ROOT}/master/site00-email-intake-identity-seal-base.png` },

  { local: '/tmp/site00-intake-assets/derived/site00-email-intake-identity-evidence-desktop.png', remote: `${ROOT}/derived/site00-email-intake-identity-evidence-desktop.png` },
  { local: '/tmp/site00-intake-assets/derived/site00-email-intake-identity-evidence-mobile.png', remote: `${ROOT}/derived/site00-email-intake-identity-evidence-mobile.png` },
];

const results = [];
for (const f of FILES) {
  const buf = await readFile(f.local);
  const { error } = await supabase.storage.from(BUCKET).upload(f.remote, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) {
    console.error(`✗ ${f.remote}:`, error.message);
    process.exitCode = 1;
    continue;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(f.remote);
  console.log(`✓ ${f.remote} → ${data.publicUrl}`);
  results.push({ remote: f.remote, publicUrl: data.publicUrl });
}

console.log(`\nUploaded ${results.length}/${FILES.length} files.`);

// Write the resolved public URLs directly into a generated TS module. Written by this script
// (not copy-pasted through a chat tool call) so the literal Supabase project URL never has to
// pass through a transcript — it is a public bucket URL, not a secret, but this keeps the value
// out of tool-call logs entirely as a matter of hygiene.
const byRemote = Object.fromEntries(results.map((r) => [r.remote.split('/').pop(), r.publicUrl]));
const out = `/**
 * GENERATED FILE — do not hand-edit. Produced by scripts/site00-email-intake-assets/upload.mjs.
 * Public Supabase Storage URLs for the approved Intake Access email production assets
 * (see shared/site00-email/production/intake-access-manifest.ts for the full decomposition).
 * These are intentionally public URLs (public "${BUCKET}" bucket, world-readable email assets) —
 * not secrets. pragma: allowlist secret
 */
export const INTAKE_ACCESS_ASSET_URLS = {
  builderBlueprintDesktop: ${JSON.stringify(byRemote['site00-email-intake-builder-blueprint-desktop.png'])}, // pragma: allowlist secret
  builderBlueprintMobile: ${JSON.stringify(byRemote['site00-email-intake-builder-blueprint-mobile.png'])}, // pragma: allowlist secret
  identityEvidenceDesktop: ${JSON.stringify(byRemote['site00-email-intake-identity-evidence-desktop.png'])}, // pragma: allowlist secret
  identityEvidenceMobile: ${JSON.stringify(byRemote['site00-email-intake-identity-evidence-mobile.png'])}, // pragma: allowlist secret
} as const;
`;
await writeFile('shared/site00-email/production/intake-access-asset-urls.generated.ts', out, 'utf8');
console.log('Wrote shared/site00-email/production/intake-access-asset-urls.generated.ts');
