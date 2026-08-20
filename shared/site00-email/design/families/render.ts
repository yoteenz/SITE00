/**
 * Nine-family hero compositions — approved reference boards 01–09.
 * Each family has a distinct visual mood; templates inherit family grammar.
 */
import type { EmailFamilyCanon } from '../../families/registry.js';
import {
  accessGlyph,
  dataStrip,
  emailCTA,
  emailDoc,
  emailFooter,
  microLabel,
  progressRail,
  systemHeader,
  technicalAnnotation,
} from '../../art-direction/primitives.js';
import { assetDeliveryPackage, assetLivingBlueprint, assetMilestoneCube, imgAsset } from '../assets.js';
import type { CompositionInput } from '../compositions.js';
import { EMAIL, esc } from '../tokens.js';

function qrImg(dataUrl?: string, size = EMAIL.qrDisplaySize): string {
  if (!dataUrl) return '';
  return `<img src="${dataUrl}" width="${size}" height="${size}" alt="Scan to enter SITE 00" style="display:block;"/>`;
}

function coords(): string {
  return `<span style="font-family:${EMAIL.fontStack};font-size:8px;color:${EMAIL.stone};letter-spacing:0.12em;">00.000° · 00.000° · 00.000°</span>`;
}

function headerRow(family: string, theme: 'dark' | 'light', right?: string): string {
  return systemHeader(family, theme, right);
}

function dualCTA(primary: string, primaryUrl: string, secondary?: string, secondaryUrl?: string, variant: 'red' | 'black' = 'red'): string {
  const sec = secondary
    ? `<tr><td class="pad" style="padding:0 36px 20px;text-align:center;">
<a href="${esc(secondaryUrl ?? primaryUrl)}" style="font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.black};text-decoration:underline;">${esc(secondary)}</a></td></tr>`
    : '';
  return `${emailCTA(primary, primaryUrl, variant)}${sec}`;
}

/** 01 ACCESS / SECURITY — Digital credential, dark field */
export function composeAccessSecurity(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const memberId = esc(v.memberId ?? '00-0147');
  const issued = esc(v.issuedDate ?? v.timestamp ?? '—');
  const status = esc(v.statusLabel ?? 'AUTHORIZED');
  const qr = qrImg(input.qrDataUrl);

  const credential = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #333;border-radius:4px;">
<tr><td style="padding:16px 18px;">
<table role="presentation" width="100%"><tr>
<td valign="top" width="55%">
${microLabel('CREDENTIAL · INDEX 00', 'dark')}
<p style="margin:6px 0 4px;font-family:${EMAIL.fontStack};font-size:9px;color:#888;">MEMBER ID</p>
<p style="margin:0 0 12px;font-family:${EMAIL.fontStack};font-size:22px;font-weight:800;color:${EMAIL.red};">${memberId}</p>
<p style="margin:0 0 4px;font-family:${EMAIL.fontStack};font-size:8px;color:#888;">ISSUED</p>
<p style="margin:0 0 12px;font-family:${EMAIL.fontStack};font-size:10px;color:#ccc;">${issued}</p>
<p style="margin:0 0 4px;font-family:${EMAIL.fontStack};font-size:8px;color:#888;">STATUS</p>
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;color:${EMAIL.green};">${status}</p>
</td>
<td valign="top" align="right" width="45%">${qr}${technicalAnnotation('SCAN TO ACCESS · ONE-TIME USE')}</td>
</tr></table></td></tr></table>`;

  const securityStrip = `<table role="presentation" width="100%" style="margin-top:16px;"><tr>
${['SECURE LINK', 'ONE-TIME USE', 'VERIFIED DEVICE', 'CONTROLLED ENTRY'].map((l) => `<td width="25%" align="center" style="padding:8px 4px;border-top:2px solid ${EMAIL.red};">
<p style="margin:0;font-size:7px;letter-spacing:0.1em;color:#888;">${l}</p></td>`).join('')}
</tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${headerRow('ACCESS', 'dark', 'SECURITY · CONTROL')}
<tr><td class="pad" style="padding:12px 36px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="28%" valign="top">${accessGlyph('sm')}</td>
<td class="stack" valign="top" style="padding-left:12px;">
<p style="margin:0 0 8px;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;color:${EMAIL.red};letter-spacing:0.14em;">ACCESS GRANTED</p>
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:32px;line-height:34px;font-weight:800;color:${EMAIL.white};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:10px;line-height:16px;color:#888;letter-spacing:0.06em;">${esc(input.subheadline)}</p>` : ''}
</td></tr></table></td></tr>
<tr><td class="pad" style="padding:0 36px 8px;">${credential}${securityStrip}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

/** 02 WELCOME / ONBOARDING — Location key, light architectural */
export function composeWelcomeOnboarding(input: CompositionInput, subject: string, preheader: string): string {
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
<p class="hero-xl" style="margin:0;font-size:36px;line-height:38px;font-weight:800;color:${EMAIL.black};">YOUR LOCATION<br/>EXISTS NOW.</p>
<p style="margin:10px 0 0;font-size:10px;color:${EMAIL.stone};">Funny. It was empty five minutes ago.</p>
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

/** 03 PROJECT / PRODUCTION — Living blueprint */
export function composeProjectProduction(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const pid = esc(v.projectId ?? '00-458');
  const phase = esc(v.phase ?? 'PHASE 02 / DESIGN & STRUCTURE');
  const progress = v.phaseProgress ?? 64;
  const module = esc(v.currentModule ?? 'VISUAL DEVELOPMENT');

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ PROJECT</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">BUILD MODE: ACTIVE</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;line-height:34px;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:10px;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:12px 36px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="55%" valign="top">
<p style="margin:0 0 4px;font-size:9px;color:${EMAIL.stone};">${phase}</p>
<p style="margin:0 0 8px;font-size:20px;font-weight:800;color:${EMAIL.red};">${progress}%</p>
${progressRail(4, 2)}
<p style="margin:12px 0 0;font-size:8px;color:${EMAIL.stone};">01 DISCOVER · 02 DESIGN · 03 BUILD · 04 DELIVER</p>
<table role="presentation" width="100%" style="margin-top:16px;border:1px solid ${EMAIL.border};"><tr><td style="padding:14px;">
<p style="margin:0 0 4px;font-size:8px;color:${EMAIL.red};">CURRENT MODULE</p>
<p style="margin:0;font-size:13px;font-weight:700;">${module}</p>
</td></tr></table>
</td>
<td class="stack" width="45%" valign="top" align="center">${imgAsset(assetLivingBlueprint(), 240, 140, 'Living blueprint wireframe')}
<p style="margin:8px 0 0;font-size:9px;color:${EMAIL.red};">PROJECT ${pid}</p></td>
</tr></table></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

/** 04 ACTION / REVIEW — Review card */
export function composeActionReview(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const fields = v.dataFields ?? [
    { label: 'PROJECT ID', value: v.projectId ?? '00-458' },
    { label: 'MODULE', value: v.currentModule ?? 'VISUAL DEVELOPMENT' },
    { label: 'DUE DATE', value: v.dueDate ?? '—' },
    { label: 'RESPONSE TIME', value: v.responseTime ?? 'EST. 5 MINUTES' },
  ];

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ REVIEW</td><td align="right"><span style="font-size:9px;color:${EMAIL.red};">REVIEW REQUEST</span> ${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p class="hero-lg" style="margin:0;font-size:34px;font-weight:800;line-height:36px;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;color:#555;line-height:17px;">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:12px 36px;">${dataStrip(fields, 'light')}</td></tr>
<tr><td class="pad" style="padding:8px 36px;border-left:3px solid ${EMAIL.red};margin-left:36px;">
<p style="margin:0 0 4px;font-size:9px;color:${EMAIL.red};">WHAT YOU'RE REVIEWING</p>
<p style="margin:0;font-size:12px;color:#444;">${esc(v.reviewContext ?? v.reviewName ?? 'Content awaiting your feedback.')}</p>
</td></tr>
${dualCTA(input.ctaLabel, input.ctaUrl, v.secondaryCtaLabel ?? 'VIEW PROJECT →', v.secondaryCtaUrl ?? input.ctaUrl, 'red')}
${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

/** 05 MILESTONE / CELEBRATION — Dark unlock moment */
export function composeMilestoneCelebration(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const phase = esc(v.milestonePhase ?? v.milestoneName ?? 'PHASE 01 / FOUNDATION');
  const impact = esc(v.milestoneImpact ?? 'SYSTEM STABILITY +24%');

  const statusCard = `<table role="presentation" width="100%" style="border:1px solid #333;"><tr><td style="padding:14px 16px;">
<p style="margin:0 0 8px;font-size:9px;color:#888;">MILESTONE · ${phase}</p>
<table role="presentation" width="100%"><tr>
<td style="font-size:9px;color:#888;padding:4px 0;">STATUS</td><td align="right" style="font-size:11px;font-weight:700;color:${EMAIL.green};">COMPLETE</td></tr>
<tr><td style="font-size:9px;color:#888;padding:4px 0;">COMPLETED</td><td align="right" style="font-size:10px;color:#ccc;">${esc(v.issuedDate ?? v.timestamp ?? '—')}</td></tr>
<tr><td style="font-size:9px;color:#888;padding:4px 0;">IMPACT</td><td align="right" style="font-size:10px;color:${EMAIL.red};">${impact}</td></tr>
</table></td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${headerRow('MILESTONE', 'dark', 'MILESTONE')}
<tr><td class="pad" style="padding:12px 36px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="55%" valign="top">
<p style="margin:0 0 8px;font-size:10px;font-weight:700;color:${EMAIL.red};">MILESTONE UNLOCKED</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;color:${EMAIL.white};line-height:34px;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:10px;color:#888;line-height:16px;">${esc(input.subheadline)}</p>` : ''}
</td>
<td class="stack" width="45%" align="center">${imgAsset(assetMilestoneCube(), 140, 140, 'Milestone unlock artifact')}</td>
</tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px 16px;">${statusCard}</td></tr>
<tr><td class="pad" style="padding:0 36px 16px;">${progressRail(4, 1)}</td></tr>
${dualCTA(input.ctaLabel, input.ctaUrl, 'VIEW PROJECT →', input.ctaUrl, 'red')}
${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

/** 06 DELIVERY / COMPLETE — Package to vault */
export function composeDeliveryComplete(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const pkg = esc(v.packageId ?? `${v.projectId ?? '00-458'}-A`);
  const fields = [
    { label: 'PACKAGE ID', value: pkg },
    { label: 'DELIVERED', value: v.deliveredAt ?? v.timestamp ?? '—' },
    { label: 'CONTENTS', value: v.packageContents ?? '12 ASSETS / FULL PACKAGE' },
    { label: 'STORAGE', value: v.storageLocation ?? 'SITE 00 VAULT / SECURE ARCHIVE' },
  ];

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ DELIVERY</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.green};">DELIVERY COMPLETE</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:16px 36px;" align="center">${imgAsset(assetDeliveryPackage(), 180, 130, 'Delivery package')}</td></tr>
<tr><td class="pad" style="padding:8px 36px 20px;">${dataStrip(fields, 'light')}</td></tr>
<tr><td class="pad" style="padding:0 36px 16px;text-align:center;"><p style="margin:0;font-size:9px;color:${EMAIL.stone};">SECURE · ORGANIZED · ALWAYS ACCESSIBLE.</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

/** 07 BILLING / PAYMENT — Build receipt */
export function composeBillingPayment(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const inv = esc(v.invoiceId ?? `INV-${v.projectId ?? '00-458'}`);
  const status = v.paymentStatus ?? 'FUNDED';
  const statusColor = status === 'FUNDED' ? EMAIL.green : status === 'FAILED' ? EMAIL.red : EMAIL.amber;
  const lines = v.lineItems ?? [
    { num: '01', label: 'FOUNDATION', detail: 'Production — Phase 01', amount: '$520.00', funded: true },
    { num: '02', label: 'MODULE B', detail: 'Rendering', amount: '$680.00', funded: true },
    { num: '03', label: 'SYSTEM', detail: 'Storage — 30 Days', amount: '$320.00', funded: true },
  ];
  const lineRows = lines
    .map(
      (l) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${EMAIL.border};font-size:10px;">
<span style="color:${EMAIL.red};">${esc(l.num)}</span> / ${esc(l.label)}<br/>
<span style="color:#666;font-size:9px;">${esc(l.detail)}</span></td>
<td align="right" style="padding:10px 0;border-bottom:1px solid ${EMAIL.border};font-size:11px;font-weight:700;">${esc(l.amount)}</td>
<td align="right" style="padding:10px 0;border-bottom:1px solid ${EMAIL.border};font-size:8px;color:${l.funded ? EMAIL.green : EMAIL.amber};">${l.funded ? 'FUNDED' : status}</td></tr>`,
    )
    .join('');

  const body = `<table role="presentation" width="100%" style="background:#eceae4;"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ LEDGER</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 4px;font-size:10px;font-weight:700;color:${EMAIL.red};">BUILD RECEIPT</p>
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:28px;font-weight:800;">${inv}</p>
<p style="margin:10px 0 0;font-size:11px;color:#555;">Your transaction has funded another part of your build.</p>
</td></tr>
<tr><td class="pad" style="padding:12px 36px;"><table role="presentation" width="100%" style="background:#fafafa;border:1px solid ${EMAIL.border};"><tr><td style="padding:18px;">
<table role="presentation" width="100%">${lineRows}</table>
<p style="margin:16px 0 0;font-size:18px;font-weight:800;border-top:2px dashed ${EMAIL.border};padding-top:12px;">TOTAL ${esc(v.currency ?? 'USD')} ${esc(v.amount ?? '$1,520.00')}</p>
<p style="margin:8px 0 0;font-size:10px;font-weight:700;color:${statusColor};">${status === 'FUNDED' ? 'HAS ENTERED THE BUILD.' : status === 'DUE' ? 'PAYMENT REQUIRED TO CONTINUE BUILD.' : status + '.'}</p>
</td></tr></table></td></tr>
${dualCTA(input.ctaLabel, input.ctaUrl, 'DOWNLOAD INVOICE', input.ctaUrl, 'red')}
${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: '#eceae4', body });
}

/** 08 ALERT / BLOCKER — Build hold tag */
export function composeAlertBlocker(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const holdId = esc(v.holdId ?? `HOLD-${v.projectId ?? '00-1827'}`);

  const holdTag = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;border:1px solid #ddd;border-left:4px solid ${EMAIL.red};">
<tr><td style="padding:18px;">
<p style="margin:0 0 8px;font-size:9px;color:${EMAIL.stone};">SITE 00 ◆ BUILD HOLD</p>
<p style="margin:0 0 12px;font-family:${EMAIL.fontStack};font-size:14px;font-weight:800;">${holdId}</p>
<table role="presentation" width="100%"><tr>
<td width="50%" style="font-size:9px;color:#666;padding:4px 0;">LOCATION<br/><strong style="color:${EMAIL.black};">${esc(v.locationId ?? v.memberId ?? '00-0147')}</strong></td>
<td width="50%" style="font-size:9px;color:#666;padding:4px 0;">PROJECT<br/><strong style="color:${EMAIL.black};">${esc(v.projectId ?? '00-458')}</strong></td>
</tr><tr>
<td style="font-size:9px;color:#666;padding:8px 0 0;">STOPPED AT<br/><strong style="color:${EMAIL.red};">${esc(v.stoppedAt ?? 'PAYMENTS / CHECKOUT')}</strong></td>
<td style="font-size:9px;color:#666;padding:8px 0 0;">WAITING ON<br/><strong style="color:${EMAIL.red};">${esc(v.waitingOn ?? 'PAYMENT CONFIGURATION')}</strong></td>
</tr></table>
<p style="margin:16px 0 0;text-align:center;font-size:28px;font-weight:800;color:${EMAIL.red};border:3px double ${EMAIL.red};padding:8px;display:inline-block;width:100%;box-sizing:border-box;">HOLD</p>
</td></tr></table>`;

  const waiting = (v.waitingItems ?? ['Checkout activation', 'Final testing', 'Launch sequence']).map((w) => `<li style="margin:0 0 6px;font-size:11px;">→ ${esc(w)}</li>`).join('');

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ OPERATIONS</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${EMAIL.red};">BUILD HOLD</p>
<p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;line-height:34px;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;color:#555;">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:12px 36px;">${holdTag}</td></tr>
<tr><td class="pad" style="padding:8px 36px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="50%" valign="top" style="padding-right:10px;">
<p style="margin:0 0 8px;font-size:9px;color:${EMAIL.red};">WHAT'S HOLDING US UP</p>
<p style="margin:0;font-size:11px;line-height:17px;">${esc(v.blockerReason ?? 'Action required before production can continue.')}</p>
</td>
<td class="stack" width="50%" valign="top">
<p style="margin:0 0 8px;font-size:9px;color:${EMAIL.stone};">WHAT'S WAITING BEHIND IT</p>
<ul style="margin:0;padding-left:16px;">${waiting}</ul>
</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;"><p style="margin:0;font-size:10px;color:${EMAIL.stone};">The crew is standing by.</p></td></tr>
${dualCTA(input.ctaLabel, input.ctaUrl, v.secondaryCtaLabel ?? 'SEE WHAT\'S WAITING →', v.secondaryCtaUrl ?? input.ctaUrl, 'red')}
<tr><td class="pad" style="padding:0 36px 24px;"><p style="margin:0;font-size:9px;color:${EMAIL.red};">STATUS: AWAITING ACTION</p></td></tr>
${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

/** 09 RE-ENGAGEMENT — Location remembers */
export function composeReengagementHuman(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const loc = esc(v.locationId ?? v.memberId ?? '00-0147');

  const occupancyTag = `<table role="presentation" width="100%" style="background:#f5f0e6;border:1px solid #ddd;border-left:4px solid ${EMAIL.red};">
<tr><td style="padding:18px;">
<p style="margin:0 0 8px;font-size:9px;color:${EMAIL.stone};">SITE 00 / LOCATION SERVICES</p>
<p style="margin:0 0 12px;font-size:14px;font-weight:800;">LOCATION ${loc}</p>
<table role="presentation" width="100%">
<tr><td style="font-size:9px;color:#888;padding:3px 0;">OCCUPANCY STATUS</td><td align="right" style="font-size:10px;color:${EMAIL.red};">${esc(v.occupancyStatus ?? 'TEMPORARILY AWAY')}</td></tr>
<tr><td style="font-size:9px;color:#888;padding:3px 0;">LOCATION STATUS</td><td align="right" style="font-size:10px;">STILL YOURS</td></tr>
<tr><td style="font-size:9px;color:#888;padding:3px 0;">BELONGINGS</td><td align="right" style="font-size:10px;">${esc(v.belongingsStatus ?? 'RIGHT WHERE YOU LEFT THEM')}</td></tr>
<tr><td style="font-size:9px;color:#888;padding:3px 0;">DEMOLITION SCHEDULED</td><td align="right" style="font-size:10px;color:${EMAIL.red};">${esc(v.demolitionStatus ?? 'ABSOLUTELY NOT.')}</td></tr>
</table>
<p style="margin:14px 0 0;text-align:center;font-size:16px;font-weight:800;color:${EMAIL.red};border:2px solid ${EMAIL.red};padding:6px;">LOCATION ON HOLD</p>
</td></tr></table>`;

  const body = `<table role="presentation" width="100%" style="background:#f2f0e9;"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:#faf8f4;">
<tr><td class="pad" style="padding:24px 36px 8px;"><table role="presentation" width="100%"><tr>
<td style="font-size:10px;color:${EMAIL.stone};">SITE 00 ◆ LOCATION</td><td align="right">${coords()}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${EMAIL.red};">Good news.</p>
<p class="hero-lg" style="margin:0;font-size:30px;font-weight:800;line-height:32px;color:${EMAIL.black};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;color:#555;line-height:17px;">${esc(input.subheadline)}</p>` : ''}
</td></tr>
<tr><td class="pad" style="padding:12px 36px;">${occupancyTag}</td></tr>
<tr><td class="pad" style="padding:8px 36px;">
<p style="margin:0 0 8px;font-size:10px;font-weight:700;color:${EMAIL.red};">NOTHING MOVED WHILE YOU WERE GONE.</p>
<p style="margin:0;font-size:11px;line-height:18px;color:#444;">Your approvals are still here.<br/>Your project is still here.<br/>Your ideas are still here.</p>
<p style="margin:12px 0 0;font-size:10px;color:${EMAIL.red};font-style:italic;">We took "later" literally.</p>
</td></tr>
${dualCTA(input.ctaLabel, input.ctaUrl, v.secondaryCtaLabel ?? 'REMIND ME WHERE I LEFT OFF →', v.secondaryCtaUrl ?? input.ctaUrl, 'red')}
<tr><td class="pad" style="padding:0 36px 20px;"><p style="margin:0;font-size:10px;color:${EMAIL.stone};">${loc} · OCCUPIED · Still has your name on it.</p></td></tr>
${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: '#f2f0e9', body });
}

const RENDERERS: Record<EmailFamilyCanon, (input: CompositionInput, subject: string, preheader: string) => string> = {
  ACCESS_SECURITY: composeAccessSecurity,
  WELCOME_ONBOARDING: composeWelcomeOnboarding,
  PROJECT_PRODUCTION: composeProjectProduction,
  ACTION_REVIEW: composeActionReview,
  MILESTONE_CELEBRATION: composeMilestoneCelebration,
  DELIVERY_COMPLETE: composeDeliveryComplete,
  BILLING_PAYMENT: composeBillingPayment,
  ALERT_BLOCKER: composeAlertBlocker,
  REENGAGEMENT_HUMAN: composeReengagementHuman,
};

export function renderFamilyEmail(
  canon: EmailFamilyCanon,
  input: CompositionInput,
  subject: string,
  preheader: string,
): string {
  const render = RENDERERS[canon];
  return render(input, subject, preheader);
}
