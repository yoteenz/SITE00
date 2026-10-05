// Renders the live intake-guest-access HTML (Builder + Identity) to /tmp for visual QA screenshots.
import { renderEmailTemplateSync } from '../../shared/site00-email/render.ts';
import { writeFile, mkdir } from 'node:fs/promises';

const OUT = '/tmp/site00-intake-render';
await mkdir(OUT, { recursive: true });

function renderBuilder() {
  return renderEmailTemplateSync('intake-guest-access', {
    intakeType: 'BUILDER',
    intakeReference: 'BLD-7F3A1C9D',
    intakeStatusDisplay: 'IN PROGRESS',
    intakeLastSavedAtDisplay: 'AUG 20, 2026 · 6:16 PM UTC',
    intakeCompletionPercent: 42,
    secureViewUrl: 'https://site00.com/intake/access/tok_builder_abc123',
    ctaUrl: 'https://site00.com/intake/access/tok_builder_abc123',
  });
}

function renderIdentity() {
  return renderEmailTemplateSync('intake-guest-access', {
    intakeType: 'IDENTITY',
    intakeReference: 'IDN-4B2E9F01',
    intakeStatusDisplay: 'SUBMITTED',
    intakeLastSavedAtDisplay: 'AUG 19, 2026 · 9:02 AM UTC',
    intakeCompletionPercent: 100,
    secureViewUrl: 'https://site00.com/intake/access/tok_identity_xyz789',
    ctaUrl: 'https://site00.com/intake/access/tok_identity_xyz789',
  });
}

const builder = renderBuilder();
const identity = renderIdentity();
await writeFile(`${OUT}/builder.html`, builder.html, 'utf8');
await writeFile(`${OUT}/identity.html`, identity.html, 'utf8');
console.log('Wrote', `${OUT}/builder.html`, `${OUT}/identity.html`);
