/**
 * Reference-target HTML renders for debug COMPARE mode.
 * Static approved-layout targets — not production sends.
 */
import { EMAIL, esc } from '../design/tokens.js';
import {
  accessCredentialArtifact,
  accessGlyph,
  emailCTA,
  emailDoc,
  emailFooter,
  redRule,
  systemHeader,
} from './primitives.js';
import type { EmailArchetype } from '../types.js';

function referenceAccessCredential(): string {
  const qrPlaceholder = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:72px;height:72px;border:1px dashed ${EMAIL.stone};"><tr><td align="center" valign="middle" style="font-size:7px;color:${EMAIL.stone};">QR</td></tr></table>`;
  const artifact = accessCredentialArtifact({
    initials: 'PC',
    name: 'PREVIEW CLIENT',
    memberId: '00-0147',
    issued: 'AUG 20, 2026',
    statusLabel: 'AUTHORIZED',
    qrImg: qrPlaceholder,
  });

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.black};">
${systemHeader('ACCESS', 'dark', 'ACCESS CARD')}
<tr><td class="pad" style="padding:8px 36px 20px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="58%" valign="top">
<p style="margin:0 0 6px;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.red};">WELCOME TO</p>
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:44px;line-height:42px;font-weight:800;color:${EMAIL.white};">SITE 00</p>
<p style="margin:14px 0 0;font-size:10px;line-height:16px;letter-spacing:0.1em;text-transform:uppercase;color:#888;">YOUR SITE 00 IDENTITY<br/>HAS BEEN RECOGNIZED.</p>
</td><td class="stack" width="42%" valign="top" align="right">${accessGlyph('md')}</td>
</tr></table></td></tr>
<tr><td class="pad" style="padding:0 36px 20px;">${artifact}</td></tr>
${emailCTA('ENTER SITE 00 →', 'https://site00.com/signin', 'red')}
${emailFooter('dark', 'transactional')}
</table></td></tr></table>`;

  return emailDoc({ title: 'REF-01 Access Credential', preheader: 'Reference target', bg: EMAIL.black, body });
}

function referenceGeneric(_archetype: EmailArchetype, label: string): string {
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:40px 24px;font-family:${EMAIL.fontStack};">
<p style="margin:0 0 12px;font-size:10px;color:${EMAIL.red};letter-spacing:0.12em;">${esc(label)}</p>
<p style="margin:0;font-size:13px;color:${EMAIL.stone};">Approved reference composition — see REF sheet for visual target.</p>
${redRule('240px')}
</td></tr></table>`;
  return emailDoc({ title: label, preheader: label, bg: EMAIL.light, body });
}

const REFERENCE_RENDERERS: Partial<Record<EmailArchetype, () => string>> = {
  'access-credential': referenceAccessCredential,
};

export function renderReferenceTarget(archetype: EmailArchetype, refLabel: string): string {
  const renderer = REFERENCE_RENDERERS[archetype];
  if (renderer) return renderer();
  return referenceGeneric(archetype, refLabel);
}

/** Annotated reference panel HTML for side-by-side compare. */
export function referenceCompareLabel(refId: string): string {
  return `${refId} — APPROVED REFERENCE TARGET`;
}
