/**
 * Event-specific onboarding / identity lifecycle compositions.
 * Shared primitives + distinct artifacts — not one universal template.
 */
import type { EmailCompositionId } from '../../art-direction/template-manifest.js';
import {
  artifactFrame,
  coordinateMark,
  emailCTA,
  emailDoc,
  emailFooter,
  microLabel,
  progressRail,
  systemHeader,
  technicalAnnotation,
} from '../../art-direction/primitives.js';
import { renderAccessSecurityReferenceEmail } from '../../art-direction/access-security.js';
import type { CompositionInput } from '../compositions.js';
import { EMAIL, esc } from '../tokens.js';

function coords(): string {
  return `<span style="font-family:${EMAIL.fontStack};font-size:8px;color:${EMAIL.stone};letter-spacing:0.12em;">00.000° · 00.000° · 00.000°</span>`;
}

/** ACCESS CREDENTIAL ISSUED — Family 01 reference-fidelity secure terminal */
export function composeAccessCredentialIssued(input: CompositionInput, subject: string, preheader: string): string {
  return renderAccessSecurityReferenceEmail(
    { ...input, headerCategory: 'SECURITY · CONTROL' },
    subject,
    preheader,
  );
}

/** WELCOME LOCATION — light architectural, location key artifact */
export function composeWelcomeLocation(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const loc = esc(v.locationId ?? v.memberId ?? '00-0147');
  const name = esc(v.clientName ?? 'NEW MEMBER');

  const locationKey = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL.white};border:1px solid ${EMAIL.border};border-left:4px solid ${EMAIL.red};">
<tr><td style="padding:20px 18px;"><table role="presentation" width="100%"><tr>
<td width="42%" valign="middle" align="center" style="border-right:1px dashed ${EMAIL.border};">
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:48px;font-weight:800;color:${EMAIL.black};">00</p>
<p style="margin:8px 0 0;font-size:9px;letter-spacing:0.14em;color:${EMAIL.red};">LOCATION KEY</p>
</td>
<td width="58%" valign="top" style="padding-left:16px;">
${microLabel('LOCATION', 'light')}<p style="margin:0 0 10px;font-size:16px;font-weight:800;color:${EMAIL.red};">${loc}</p>
${microLabel('ASSIGNED TO', 'light')}<p style="margin:0 0 10px;font-size:12px;font-weight:700;">${name}</p>
${microLabel('STATUS', 'light')}<p style="margin:0 0 10px;font-size:10px;">OCCUPIED</p>
${microLabel('FIRST STOP', 'light')}<p style="margin:0;font-size:10px;color:${EMAIL.red};">${esc(v.firstStop ?? 'ORIGIN')}</p>
</td></tr></table></td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:#f2f0e9;"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ WELCOME</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">WELCOME TO SITE 00</p>
<p class="hero-xl" style="margin:0;font-size:36px;line-height:38px;font-weight:800;color:${EMAIL.black};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:10px 0 0;font-size:10px;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:16px 36px;">${locationKey}</td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0;font-size:11px;line-height:18px;color:#444;">WE SAVED YOU A ROOM.<br/>Tell us what we're building inside it.</p>
</td></tr>
<tr><td class="pad" style="padding:12px 36px;">${progressRail(4, 1)}<p style="margin:8px 0 0;font-size:8px;color:${EMAIL.stone};text-align:center;">01 ORIGIN · 02 IDENTITY · 03 BLDR · 04 PRODUCTION</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: '#f2f0e9', body });
}

/** IDENTITY PATH — route map artifact with path nodes */
export function composeIdentityPath(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const path = esc((v.buildClass ?? 'STARTING AT ZERO').toUpperCase());
  const routeMap = `<table role="presentation" width="100%" style="border:1px solid ${EMAIL.border};background:#fafafa;">
<tr><td style="padding:16px;">
${microLabel('ROUTE MAP · IDENTITY PATH', 'light')}
<table role="presentation" width="100%" style="margin-top:12px;"><tr>
<td width="20%" align="center" style="padding:8px;border:2px solid ${EMAIL.red};background:#fff;"><p style="margin:0;font-size:8px;color:${EMAIL.red};">ORIGIN</p></td>
<td width="8%" align="center" style="font-size:14px;color:${EMAIL.red};">→</td>
<td width="24%" align="center" style="padding:8px;border:2px solid ${EMAIL.black};background:#fff;"><p style="margin:0;font-size:8px;font-weight:700;">${path}</p></td>
<td width="8%" align="center" style="font-size:14px;color:#ccc;">→</td>
<td width="20%" align="center" style="padding:8px;border:1px dashed #ccc;background:#fff;"><p style="margin:0;font-size:8px;color:#999;">BLDR</p></td>
<td width="8%" align="center" style="font-size:14px;color:#ccc;">→</td>
<td width="12%" align="center" style="padding:8px;border:1px dashed #ccc;background:#fff;"><p style="margin:0;font-size:8px;color:#999;">00</p></td>
</tr></table>
${coordinateMark('light')}
<p style="margin:12px 0 0;font-size:9px;color:${EMAIL.stone};text-align:center;">PATH RECORDED · ORIENTATION LOCKED</p>
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader('IDENTITY', 'light', 'ORIENTATION')}
<tr><td class="pad" style="padding:12px 36px;">${progressRail(4, 2)}</td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">PATH RECEIVED</p>
<p class="hero-lg" style="margin:0;font-size:30px;font-weight:800;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:10px 0 0;font-size:10px;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:12px 36px 20px;">${routeMap}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

/** IDENTITY INPUT — intake receipt / data capture record */
export function composeIdentityInput(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const receiptId = esc(v.receiptId ?? `IN-${v.memberId ?? '0147'}`);
  const fields = v.dataFields ?? [
    { label: 'RECEIPT ID', value: receiptId },
    { label: 'CAPTURED', value: v.timestamp ?? v.issuedDate ?? '—' },
    { label: 'SECTIONS', value: v.captureSections ?? '4 / 4 COMPLETE' },
    { label: 'STATUS', value: 'STORED · ENCRYPTED' },
  ];

  const receipt = artifactFrame(
    `${microLabel('INPUT RECEIPT · DATA CAPTURE', 'light')}
<table role="presentation" width="100%" style="margin-top:10px;">${fields.map((f) => `<tr><td style="padding:6px 0;border-bottom:1px dashed ${EMAIL.border};font-size:8px;color:${EMAIL.stone};">${esc(f.label)}</td><td align="right" style="padding:6px 0;border-bottom:1px dashed ${EMAIL.border};font-size:11px;font-weight:700;">${esc(f.value)}</td></tr>`).join('')}
</table>
<p style="margin:14px 0 0;text-align:center;font-size:22px;font-weight:800;color:${EMAIL.green};border:2px solid ${EMAIL.green};padding:6px;display:inline-block;width:100%;box-sizing:border-box;">CAPTURED</p>`,
    'light',
  );

  const body = `<table role="presentation" width="100%" style="background:#eceae4;"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader('IDENTITY', 'light', 'INTAKE')}
<tr><td class="pad" style="padding:12px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">INPUT CAPTURED</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;">${esc(input.headline)}</p>
</td></tr>
<tr><td class="pad" style="padding:8px 36px 20px;">${receipt}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: '#eceae4', body });
}

/** IDENTITY CALIBRATION — dark alignment matrix / system dial */
export function composeIdentityCalibration(input: CompositionInput, subject: string, preheader: string): string {
  const matrix = `<table role="presentation" width="100%" style="background:#111;border:1px solid #333;">
<tr><td style="padding:18px;">
${microLabel('CALIBRATION MATRIX · ALIGNMENT', 'dark')}
<table role="presentation" width="100%" style="margin-top:12px;">${['SIGNAL', 'ORIENTATION', 'FOUNDATION', 'READINESS'].map((axis, i) => {
    const pct = [100, 100, 92, 88][i] ?? 80;
    return `<tr><td style="padding:8px 0;font-size:8px;color:#888;width:30%;">${axis}</td><td style="padding:8px 0;"><table role="presentation" width="100%"><tr><td style="width:${pct}%;height:4px;background:${EMAIL.red};"></td><td style="width:${100 - pct}%;height:4px;background:#333;"></td></tr></table></td><td align="right" style="padding:8px 0;font-size:9px;color:${EMAIL.green};width:15%;">${pct}%</td></tr>`;
  }).join('')}
</table>
<p style="margin:16px 0 0;text-align:center;font-size:36px;font-weight:800;color:${EMAIL.white};border:2px solid ${EMAIL.red};padding:12px;">00</p>
${technicalAnnotation('CALIBRATION COMPLETE · ALL AXES WITHIN TOLERANCE')}
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${systemHeader('IDENTITY', 'dark', 'CALIBRATION')}
<tr><td class="pad" style="padding:12px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">CALIBRATION COMPLETE</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;color:${EMAIL.white};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:10px;color:#888;">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:8px 36px 20px;">${matrix}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

/** IDENTITY REVIEW — dark review dossier / queue card */
export function composeIdentityReview(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const dossier = `<table role="presentation" width="100%" style="background:#0f0f0f;border:1px solid #333;border-top:3px solid ${EMAIL.red};">
<tr><td style="padding:18px;">
${microLabel('REVIEW DOSSIER · QUEUE', 'dark')}
<table role="presentation" width="100%" style="margin-top:12px;">${['IDENTITY BRIEF', 'BRAND STATES', 'ORIENTATION MAP', 'FOUNDATION SPEC'].map((item, i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:10px;color:#ccc;"><span style="color:${EMAIL.red};margin-right:8px;">${String(i + 1).padStart(2, '0')}</span>${item}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #222;font-size:8px;color:${EMAIL.green};">READY</td></tr>`).join('')}
</table>
<p style="margin:14px 0 0;font-size:9px;color:#666;">QUEUE POSITION · ${esc(v.queuePosition ?? '01')} · EST. REVIEW ${esc(v.reviewEstimate ?? '5 MIN')}</p>
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${systemHeader('IDENTITY', 'dark', 'REVIEW')}
<tr><td class="pad" style="padding:12px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">READY FOR REVIEW</p>
<p class="hero-lg" style="margin:0;font-size:30px;font-weight:800;color:${EMAIL.white};">${esc(input.headline)}</p>
</td></tr>
<tr><td class="pad" style="padding:8px 36px 20px;">${dossier}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

/** IDENTITY FOUNDATION — locked specification blueprint */
export function composeIdentityFoundation(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const blueprint = `<table role="presentation" width="100%" style="background:#fafafa;border:2px solid ${EMAIL.black};">
<tr><td style="padding:18px;">
${microLabel('FOUNDATION SPECIFICATION · LOCKED', 'light')}
<table role="presentation" width="100%" style="margin-top:12px;height:80px;border:1px dashed ${EMAIL.border};"><tr>
<td width="33%" style="border-right:1px dashed ${EMAIL.border};"></td>
<td width="34%" style="border-right:1px dashed ${EMAIL.border};" align="center" valign="middle"><p style="margin:0;font-size:24px;font-weight:800;color:${EMAIL.red};">00</p></td>
<td width="33%"></td>
</tr></table>
<table role="presentation" width="100%" style="margin-top:12px;">${[
    { label: 'SPEC VERSION', value: v.specVersion ?? 'v1.0' },
    { label: 'LOCKED AT', value: v.timestamp ?? v.issuedDate ?? '—' },
    { label: 'STATUS', value: 'LOCKED · IMMUTABLE' },
  ].map((f) => `<tr><td style="padding:6px 0;font-size:8px;color:${EMAIL.stone};">${esc(f.label)}</td><td align="right" style="padding:6px 0;font-size:11px;font-weight:700;">${esc(f.value)}</td></tr>`).join('')}
</table>
<p style="margin:14px 0 0;text-align:center;font-size:14px;font-weight:800;color:${EMAIL.black};border:3px double ${EMAIL.black};padding:8px;">FOUNDATION LOCKED</p>
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader('IDENTITY', 'light', 'FOUNDATION')}
<tr><td class="pad" style="padding:12px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">FOUNDATION LOCKED</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;">${esc(input.headline)}</p>
</td></tr>
<tr><td class="pad" style="padding:8px 36px 20px;">${blueprint}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

const LIFECYCLE_RENDERERS: Record<
  Exclude<EmailCompositionId, 'FAMILY_DEFAULT'>,
  (input: CompositionInput, subject: string, preheader: string) => string
> = {
  ACCESS_CREDENTIAL: composeAccessCredentialIssued,
  WELCOME_LOCATION: composeWelcomeLocation,
  IDENTITY_PATH: composeIdentityPath,
  IDENTITY_INPUT: composeIdentityInput,
  IDENTITY_CALIBRATION: composeIdentityCalibration,
  IDENTITY_REVIEW: composeIdentityReview,
  IDENTITY_FOUNDATION: composeIdentityFoundation,
};

export function renderLifecycleComposition(
  composition: EmailCompositionId,
  input: CompositionInput,
  subject: string,
  preheader: string,
): string | undefined {
  if (composition === 'FAMILY_DEFAULT') return undefined;
  const render = LIFECYCLE_RENDERERS[composition];
  return render(input, subject, preheader);
}
