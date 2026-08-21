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
  site00Wordmark,
  systemHeader,
  technicalAnnotation,
} from '../../art-direction/primitives.js';
import { renderAccessSecurityReferenceEmail } from '../../art-direction/access-security.js';
import type { CompositionInput } from '../compositions.js';
import { EMAIL, esc } from '../tokens.js';
import { INTAKE_ACCESS_ASSET_URLS } from '../../production/intake-access-asset-urls.generated.js';

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

// -----------------------------------------------------------------------------------------------
// INTAKE ACCESS — Builder ("architectural build brief") + Identity ("editorial identity evidence
// file"). FAL-native visual production pilot — see shared/site00-email/production/
// intake-access-manifest.ts for the full reference decomposition/asset classification.
// One composition, branches internally on vars.intakeType — shared lifecycle semantics
// (record card, CTA, four assurance modules), distinct GENERATED_ASSET art direction per type.
// -----------------------------------------------------------------------------------------------

type IntakeIconName = 'secure' | 'saved' | 'info' | 'anytime';

/** Clean line icons (CODE_NATIVE — inline SVG, never emoji/generic stock icons). */
function intakeIcon(name: IntakeIconName, color: string): string {
  const attrs = `width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"`;
  const s = `stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`;
  switch (name) {
    case 'secure':
      return `<svg ${attrs}><path d="M4.5 6.5L12 3.5l7.5 3v5c0 5-3.3 8.3-7.5 9.8-4.2-1.5-7.5-4.8-7.5-9.8v-5z" ${s}/></svg>`;
    case 'saved':
      return `<svg ${attrs}><rect x="4" y="4" width="16" height="16" rx="1.5" ${s}/><path d="M8 4v5h8V4" ${s}/><path d="M8 14.5h8" ${s}/></svg>`;
    case 'info':
      return `<svg ${attrs}><rect x="3.5" y="6" width="17" height="13" rx="1.5" ${s}/><path d="M3.5 9.5h17" ${s}/><path d="M7.5 13.5h5" ${s}/></svg>`;
    case 'anytime':
      return `<svg ${attrs}><circle cx="12" cy="12" r="8.5" ${s}/><path d="M12 7.5V12l3.2 2" ${s}/></svg>`;
  }
}

/** Four lifecycle-assurance modules, 2×2 grid (preserved at all target widths — not stacked to 1 col). */
function intakeAssuranceGrid(accent: string, intakeType: 'BUILDER' | 'IDENTITY'): string {
  const brief = intakeType === 'BUILDER' ? 'brief' : 'intake';
  const modules: Array<{ icon: IntakeIconName; title: string; body: string }> = [
    { icon: 'secure', title: 'SECURE & PRIVATE', body: `Only you can access your ${brief} using your unique link.` },
    { icon: 'saved', title: 'AUTO-SAVED', body: 'We save your progress as you go, so nothing gets lost.' },
    { icon: 'info', title: 'YOUR INFORMATION', body: 'Your answers are safe, encrypted, and never shared.' },
    { icon: 'anytime', title: 'PICK UP ANYTIME', body: `Return now or later — your ${brief} will be right here.` },
  ];
  const cell = (m: (typeof modules)[number]) => `<td width="50%" valign="top" style="padding:14px 10px;">
<table role="presentation" width="100%"><tr>
<td width="24" valign="top">${intakeIcon(m.icon, accent)}</td>
<td valign="top" style="padding-left:8px;">
<p style="margin:0 0 4px;font-family:${EMAIL.fontStack};font-size:9px;font-weight:700;letter-spacing:0.08em;color:${EMAIL.black};">${esc(m.title)}</p>
<p style="margin:0;font-size:10px;line-height:15px;color:${EMAIL.stone};">${esc(m.body)}</p>
</td></tr></table></td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${EMAIL.border};">
<tr>${cell(modules[0])}${cell(modules[1])}</tr>
<tr>${cell(modules[2])}${cell(modules[3])}</tr>
</table>`;
}

/** Completion treatment — numeric progress bar only when a truthful percent exists; otherwise a status pill. Never fabricated. */
function intakeCompletionRow(accent: string, pct: number | undefined, fallbackLabel: string): string {
  if (typeof pct === 'number' && Number.isFinite(pct)) {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:calc(100% - 40px);"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:${clamped}%;height:4px;background:${accent};font-size:0;line-height:0;">&nbsp;</td>
<td style="width:${100 - clamped}%;height:4px;background:${EMAIL.border};font-size:0;line-height:0;">&nbsp;</td>
</tr></table></td>
<td align="right" width="40" style="padding-left:8px;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;color:${EMAIL.black};">${clamped}%</td>
</tr></table>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:4px;background:${EMAIL.border};font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
<td align="right" width="96" style="padding-left:8px;font-family:${EMAIL.fontStack};font-size:9px;font-weight:700;letter-spacing:0.06em;color:${accent};white-space:nowrap;">${esc(fallbackLabel)}</td>
</tr></table>`;
}

/** Build Brief Record (Builder) / Identity File (Identity) record card — dynamic data only, never rasterized. */
function intakeRecordCard(params: {
  cardLabel: string;
  reference: string;
  statusDisplay: string;
  lastSavedDisplay?: string;
  completionPercent?: number;
  accent: string;
}): string {
  const { cardLabel, reference, statusDisplay, lastSavedDisplay, completionPercent, accent } = params;
  const row = (label: string, value: string) => `<tr><td style="padding-top:10px;border-top:1px dashed ${EMAIL.border};">
${microLabel(label, 'light')}<p style="margin:0;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;color:${EMAIL.black};">${esc(value)}</p>
</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL.white};border:1px solid ${EMAIL.border};border-top:3px solid ${accent};">
<tr><td style="padding:18px 20px;">
${microLabel(cardLabel, 'light')}
<p style="margin:0 0 12px;font-family:${EMAIL.fontStack};font-size:19px;font-weight:800;color:${accent};word-break:break-all;">${esc(reference)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:2px;">
${row('STATUS', statusDisplay)}
${row('LAST SAVED', lastSavedDisplay ?? 'JUST NOW')}
</table>
<div style="padding-top:12px;">${microLabel('COMPLETION', 'light')}${intakeCompletionRow(accent, completionPercent, statusDisplay)}</div>
</td></tr></table>`;
}

/** Narrow vertical rail label along the left edge of the desktop hero — CODE_NATIVE. */
function intakeVerticalRail(label: string, accent: string): string {
  return `<td width="30" valign="middle" style="border-right:1px solid ${EMAIL.border};padding-right:10px;">
<div style="writing-mode:vertical-rl;transform:rotate(180deg);font-family:${EMAIL.fontStack};font-size:9px;font-weight:700;letter-spacing:0.16em;color:${accent};white-space:nowrap;">${esc(label)}</div>
</td>`;
}

export function composeIntakeAccess(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const isBuilder = v.intakeType === 'BUILDER';
  const accent = isBuilder ? EMAIL.black : EMAIL.red;
  const ctaVariant: 'red' | 'black' = isBuilder ? 'black' : 'red';
  const railLabel = isBuilder ? 'BUILDER INTAKE ACCESS' : 'IDENTITY INTAKE ACCESS';
  const categoryRight = isBuilder ? 'BUILD BRIEF' : 'IDENTITY FILE';
  const tagline = isBuilder ? 'YOUR BRIEF. YOUR BUILD. YOUR LOCATION.' : 'YOUR IDENTITY. OUR EVIDENCE. YOUR DESTINATION.';
  const ctaLabel = isBuilder ? 'RETURN TO BUILD BRIEF →' : 'RETURN TO IDENTITY BRIEF →';
  const reference = v.intakeReference ?? (isBuilder ? 'BUILDER INTAKE' : 'IDENTITY INTAKE');
  const statusDisplay = v.intakeStatusDisplay ?? 'IN PROGRESS';
  const cardLabel = isBuilder ? 'BUILD BRIEF RECORD' : 'IDENTITY FILE';

  const headlineHtml = isBuilder
    ? `THE BRIEF<br/>HAS A<br/><span style="color:${EMAIL.red};">LOCATION.</span>`
    : `THE EVIDENCE<br/><span style="color:${EMAIL.red};">IS IN.</span>`;

  const recordCard = intakeRecordCard({
    cardLabel,
    reference,
    statusDisplay,
    lastSavedDisplay: v.intakeLastSavedAtDisplay,
    completionPercent: v.intakeCompletionPercent,
    accent,
  });

  // Desktop hero artwork — GENERATED_ASSET (B01 blueprint / I05 evidence collage). The record
  // card is pulled up over the artwork's lower edge with a negative top margin so the two read
  // as one physically-layered artifact (reference: artwork behind/overlapping the record), not
  // two independent boxes stacked in plain table flow.
  const desktopArtwork = isBuilder
    ? `<img src="${INTAKE_ACCESS_ASSET_URLS.builderBlueprintDesktop}" width="280" height="210" alt="Architectural blueprint drawing of the Builder brief location" style="display:block;width:100%;max-width:280px;height:auto;margin:0 0 0 auto;"/>`
    : `<img src="${INTAKE_ACCESS_ASSET_URLS.identityEvidenceDesktop}" width="280" height="308" alt="Identity evidence collage — archival note, fingerprint specimen and portrait fragment" style="display:block;width:100%;max-width:280px;height:auto;margin:0 0 0 auto;"/>`;

  // Both artwork and record card live in one cell (not separate <tr>s) so the negative-margin
  // overlap is predictable: a <tr> ignores margin, a <div> inside a single <td> does not.
  // Builder's blueprint has generous white space at its own bottom edge, so it can overlap the
  // card deeply without covering the record fields; Identity's collage fills edge-to-edge, so a
  // shallow overlap keeps the "touching" seam without obscuring the file reference/status.
  const overlap = isBuilder ? -46 : -14;
  const rightColumn = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
${desktopArtwork}
<div style="margin-top:${overlap}px;">${recordCard}</div>
</td></tr></table>`;

  const leftColumn = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
${intakeVerticalRail(railLabel, accent)}
<td valign="top" style="padding-left:16px;">
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:34px;line-height:37px;font-weight:800;color:${EMAIL.black};text-transform:uppercase;">${headlineHtml}</p>
<p style="margin:16px 0 0;font-size:12px;line-height:19px;color:#444;max-width:280px;">${esc(input.subheadline ?? '')}</p>
</td></tr></table>`;

  // Mobile-only recomposed hero — NOT a shrunk desktop image (XX/XXII: mobile has its own
  // art-directed crop, already produced as a distinct derivative in the manifest).
  const mobileArtwork = isBuilder
    ? `<img src="${INTAKE_ACCESS_ASSET_URLS.builderBlueprintMobile}" width="600" height="230" alt="Architectural blueprint drawing, restrained upper background" style="display:block;width:100%;height:auto;"/>`
    : `<img src="${INTAKE_ACCESS_ASSET_URLS.identityEvidenceMobile}" width="600" height="338" alt="Identity evidence strip — fingerprint specimen, archival note and portrait fragment" style="display:block;width:100%;height:auto;"/>`;

  const mobileHero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="intake-mobile-only">
<tr><td style="padding:0 18px 14px;">${mobileArtwork}</td></tr>
<tr><td class="pad" style="padding:0 18px;">
<p style="margin:0 0 6px;font-family:${EMAIL.fontStack};font-size:9px;font-weight:700;letter-spacing:0.14em;color:${accent};">${esc(railLabel)}</p>
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:30px;line-height:33px;font-weight:800;color:${EMAIL.black};text-transform:uppercase;">${headlineHtml}</p>
<p style="margin:14px 0 0;font-size:12px;line-height:19px;color:#444;">${esc(input.subheadline ?? '')}</p>
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${isBuilder ? EMAIL.light : '#F7F1EA'};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};border:1px solid ${EMAIL.border};">
<tr><td class="pad" style="padding:22px 32px 10px;"><table role="presentation" width="100%"><tr>
<td>${site00Wordmark('light')}</td>
<td class="intake-desktop-only" align="right" style="font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:${EMAIL.stone};">${esc(tagline)}</td>
</tr></table></td></tr>
<tr><td class="pad intake-desktop-only" style="padding:8px 32px 0;">
<table role="presentation" width="100%"><tr><td style="font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.stone};">${esc(categoryRight)} ACCESS</td></tr></table>
</td></tr>
<tr><td class="pad intake-desktop-only" style="padding:8px 32px 0;">
<table role="presentation" width="100%"><tr>
<td class="stack" width="54%" valign="top" style="padding-right:16px;">${leftColumn}</td>
<td class="stack" width="46%" valign="top">${rightColumn}</td>
</tr></table>
</td></tr>
<tr><td class="pad intake-desktop-only" style="padding:26px 32px 6px;">${emailCTAInline(ctaLabel, input.ctaUrl, ctaVariant)}</td></tr>
<tr><td class="pad" style="padding:6px 0 0;">${mobileHero}</td></tr>
<tr><td class="pad intake-mobile-only" style="padding:0 18px 6px;">${recordCard}</td></tr>
<tr><td class="pad intake-mobile-only" style="padding:14px 18px 6px;">${emailCTAInline(ctaLabel, input.ctaUrl, ctaVariant)}</td></tr>
<tr><td class="pad" style="padding:18px 32px 4px;">${intakeAssuranceGrid(accent, isBuilder ? 'BUILDER' : 'IDENTITY')}</td></tr>
${emailFooter('light', input.classification)}
</table></td></tr></table>`;

  return emailDoc({ title: subject, preheader, bg: isBuilder ? EMAIL.light : '#F7F1EA', body });
}

/** Standalone CTA button (not wrapped in its own <tr> — composeIntakeAccess controls row placement). */
function emailCTAInline(label: string, url: string, variant: 'red' | 'black' | 'white'): string {
  const bg = variant === 'red' ? EMAIL.red : variant === 'black' ? EMAIL.black : EMAIL.white;
  const color = variant === 'white' ? EMAIL.black : EMAIL.white;
  const border = variant === 'white' ? `1px solid ${EMAIL.black}` : 'none';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="cta-cell" align="center" style="background:${bg};border:${border};">
<a href="${esc(url)}" style="display:inline-block;padding:16px 34px;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${color};text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
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
  INTAKE_ACCESS: composeIntakeAccess,
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
