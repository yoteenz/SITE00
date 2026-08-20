import { EMAIL, esc } from './tokens.js';
import {
  accessCredentialArtifact,
  accessGlyph,
  approvalStamp,
  coordinateMark,
  dataStrip,
  deliverySeal,
  emailCTA,
  emailDoc,
  emailFooter,
  productionStamp,
  progressRail,
  systemHeader,
  technicalAnnotation,
} from '../art-direction/primitives.js';
import type { EmailClassification, EmailFamily, EmailTemplateVars, EmailTheme } from '../types.js';

export type CompositionInput = {
  family: EmailFamily;
  familyLabel: string;
  templateId?: string;
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  ctaUrl: string;
  classification: EmailClassification;
  vars: EmailTemplateVars;
  qrDataUrl?: string;
};

function qrImg(dataUrl?: string, size = EMAIL.qrDisplaySize): string {
  if (!dataUrl) return '';
  return `<img src="${dataUrl}" width="${size}" height="${size}" alt="Scan to enter SITE 00" style="margin:0 auto;"/>`;
}

function hallwayHero(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="height:128px;background:linear-gradient(180deg,#ececec 0%,#f6f6f6 100%);border-bottom:1px solid ${EMAIL.border};">
<tr><td align="center" valign="bottom" style="padding:0 36px 18px;">
<table role="presentation" width="100%" style="max-width:420px;"><tr>
<td width="33%" style="border-left:1px solid #ccc;height:72px;"></td>
<td width="34%" align="center" style="border-left:1px solid #ccc;border-right:1px solid #ccc;height:72px;vertical-align:bottom;padding-bottom:6px;">
<span style="display:inline-block;width:14px;height:14px;border:2px solid ${EMAIL.red};border-radius:50%;"></span>
</td><td width="33%" style="border-right:1px solid #ccc;height:72px;"></td>
</tr></table></td></tr></table>`;
}

function portalDoorHero(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 36px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:220px;height:150px;background:#0f0f0f;border-left:4px solid ${EMAIL.red};border-right:4px solid ${EMAIL.red};">
<tr><td align="center" valign="middle" style="background:radial-gradient(ellipse at center bottom, rgba(235,28,36,0.35) 0%, transparent 65%);">
<p style="margin:0;font-size:40px;font-weight:800;color:${EMAIL.white};letter-spacing:0.08em;">00</p>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:10px 36px 0;font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.18em;color:#666;">OUTSIDE SITE 00 · → · AUTHORIZED · → · STUDIO ACCESS</td></tr></table>`;
}

function wireframeHero(): string {
  return `<table role="presentation" width="100%" style="background:#111;height:96px;border-bottom:1px solid #222;"><tr>
<td style="padding:0 36px;">
<table role="presentation" width="100%" style="height:96px;"><tr>
<td width="70%" style="border-right:1px solid #333;border-bottom:1px solid #333;"></td>
<td width="30%" style="border-bottom:1px solid #333;"></td></tr><tr>
<td colspan="2" style="height:24px;"></td></tr></table>
<span style="float:right;margin-top:-56px;margin-right:12px;background:${EMAIL.red};color:#fff;font-weight:700;padding:4px 8px;font-size:11px;">A</span>
</td></tr></table>`;
}

function statusCard(label: string, value: string, active = false): string {
  const dot = active ? `<span style="display:inline-block;width:8px;height:8px;background:${EMAIL.green};border-radius:50%;margin-right:8px;"></span>` : '';
  return `<table role="presentation" width="100%" style="background:${EMAIL.white};border:1px solid ${EMAIL.border};"><tr>
<td style="padding:16px 18px;font-family:${EMAIL.fontStack};font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.stone};">${esc(label)}</td>
<td align="right" style="padding:16px 18px;font-size:12px;font-weight:700;color:${EMAIL.black};">${dot}${esc(value)}</td>
</tr></table>`;
}

function familyAccent(family: EmailFamily): string {
  switch (family) {
    case 'identity':
      return `${coordinateMark('light')}${technicalAnnotation('ORIENTATION · STATE MAP')}`;
    case 'review':
    case 'assets':
      return `<table role="presentation" align="center" width="80%" style="margin:0 auto 8px;height:48px;border:1px dashed #ccc;"><tr><td align="center" style="font-size:9px;color:${EMAIL.stone};">BLDR · DIRECTION</td></tr></table>`;
    case 'property':
      return `${progressRail(5, 4)}${technicalAnnotation('PROPERTY · COORDINATE PATH')}`;
    case 'billing':
      return `<table role="presentation" align="center" width="72%" style="margin:0 auto 8px;border-top:2px solid ${EMAIL.black};"><tr><td style="padding-top:8px;font-size:9px;color:${EMAIL.stone};">LEDGER · DOCUMENT</td></tr></table>`;
    case 'domain':
      return `${progressRail(3, 2)}${technicalAnnotation('DOMAIN · ROUTE')}`;
    case 'support':
      return coordinateMark('light');
    case 'internal':
      return productionStamp();
    default:
      return '';
  }
}

/** REF-01 — Access / Welcome credential. Asymmetric artifact, not membership card. */
export function composeAccessWelcome(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const name = esc(v.clientName ?? 'MEMBER');
  const initials = esc(v.clientInitials ?? 'NK');
  const memberId = esc(v.memberId ?? '00-0001');
  const issued = esc(v.issuedDate ?? v.timestamp ?? '—');
  const status = esc(v.statusLabel ?? 'AUTHORIZED');
  const accent = esc(v.accentScript ?? 'WELCOME TO');
  const categoryRight = input.templateId === 'sign-in-link' ? 'ACCESS CARD' : 'ACCESS';

  const artifact = accessCredentialArtifact({
    initials,
    name,
    memberId,
    issued,
    statusLabel: status,
    qrImg: qrImg(input.qrDataUrl),
  });

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark', categoryRight)}
<tr><td class="pad" style="padding:8px 36px 20px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="58%" valign="top" style="padding-right:12px;">
<p style="margin:0 0 6px;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.red};">${accent}</p>
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:44px;line-height:42px;font-weight:800;color:${EMAIL.white};">SITE 00</p>
<p style="margin:14px 0 0;font-size:10px;line-height:16px;letter-spacing:0.1em;text-transform:uppercase;color:#888;">${esc(input.subheadline ?? 'YOUR SITE 00 IDENTITY HAS BEEN RECOGNIZED.')}</p>
</td><td class="stack" width="42%" valign="top" align="right">${accessGlyph('md')}</td>
</tr></table></td></tr>
<tr><td class="pad" style="padding:0 36px 20px;">${artifact}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

export function composeProjectInitiated(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const pid = esc(v.projectId ?? '00-0000');
  const fields = v.dataFields ?? [
    { label: 'PROJECT NAME', value: v.projectName ?? '—' },
    { label: 'PROJECT TYPE', value: v.projectType ?? 'SITE' },
    { label: 'CREATED', value: v.issuedDate ?? v.timestamp ?? '—' },
    { label: 'PROJECT ID', value: pid },
  ];
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'PROJECT')}
<tr><td>${hallwayHero()}</td></tr>
<tr><td class="pad" style="padding:28px 36px 8px;"><p class="hero-lg" style="margin:0;font-size:36px;font-weight:800;text-transform:uppercase;">PROJECT<br/>INITIATED.</p>
<p style="margin:10px 0 0;font-family:${EMAIL.fontStack};font-size:16px;color:${EMAIL.red};">PROJECT ${pid}</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;">${dataStrip(fields, 'light')}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeStudioPortal(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const project = esc(v.projectName ?? '—');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark', 'STUDIO')}
${portalDoorHero()}
<tr><td class="pad" style="padding:20px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;text-transform:uppercase;color:${EMAIL.white};">STUDIO<br/>ACCESS<br/><span style="color:${EMAIL.red};">GRANTED.</span></p>
<p style="margin:16px 0 0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;line-height:1.6;">PAYMENT CONFIRMED.<br/>YOUR PROJECT HAS ENTERED<br/>THE PRODUCTION ENVIRONMENT.</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 8px;">${statusCard('PROJECT', project, false)}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;">${statusCard('ENVIRONMENT', 'STUDIO ACTIVE', true)}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'white')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

export function composeActionRequired(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const count = v.requiredInputCount ?? v.inputItems?.length ?? 2;
  const list = (v.inputItems ?? [])
    .map(
      (item, i) => `<tr><td style="padding:14px 16px;border-bottom:1px solid ${EMAIL.border};font-size:13px;"><span style="color:${EMAIL.red};font-family:${EMAIL.fontStack};">${String(i + 1).padStart(2, '0')}</span> ${esc(item)}</td></tr>`,
    )
    .join('');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'INPUT')}
${coordinateMark('light')}
<tr><td class="pad" style="padding:12px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:30px;font-weight:800;text-transform:uppercase;">PRODUCTION<br/>IS WAITING<br/>ON YOU.</p>
<p style="margin:14px 0 0;border:1px solid ${EMAIL.red};display:inline-block;padding:6px 12px;color:${EMAIL.red};font-size:10px;">${String(count).padStart(2, '0')} ITEMS REQUIRED</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;"><table role="presentation" width="100%" style="border:1px solid ${EMAIL.border};">${list}</table></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeReviewDossier(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const n = v.directionCount ?? 3;
  const review = esc(v.reviewName ?? 'BLUEPRINT / HOMEPAGE');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark', 'REVIEW')}
<tr><td>${wireframeHero()}</td></tr>
<tr><td class="pad" style="padding:28px 36px;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;text-transform:uppercase;color:${EMAIL.white};">${n} DIRECTION${n === 1 ? '' : 'S'}<br/>HAVE ENTERED<br/><span style="color:${EMAIL.red};">REVIEW.</span></p>
<p style="margin:14px 0 0;font-size:10px;color:#888;">${review}</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
}

export function composeMilestoneArtifact(input: CompositionInput, subject: string, preheader: string): string {
  const milestone = esc(input.vars.milestoneName ?? 'MILESTONE');
  const fields = input.vars.dataFields ?? [
    { label: 'MILESTONE', value: milestone },
    { label: 'PROJECT', value: input.vars.projectName ?? '—' },
  ];
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'MILESTONE')}
<tr><td align="center" style="padding:24px;">${approvalStamp()}</td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;text-transform:uppercase;">MILESTONE<br/>RECORDED.</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;">${dataStrip(fields, 'light')}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeRevisionNotice(input: CompositionInput, subject: string, preheader: string): string {
  const fields = input.vars.dataFields ?? [
    { label: 'REVIEW', value: input.vars.reviewName ?? '—' },
    { label: 'DIRECTION', value: input.vars.directionLabel ?? '—' },
  ];
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader(input.familyLabel, 'light', 'REVISION')}
<tr><td class="pad" style="padding:24px 36px;"><p class="hero-lg" style="margin:0;font-size:38px;font-weight:800;text-transform:uppercase;color:${EMAIL.red};">REVISION<br/>RECEIVED.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">WE'RE INCORPORATING<br/>YOUR FEEDBACK.</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;">${dataStrip(fields, 'light')}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.white, body });
}

export function composeSystemCheck(input: CompositionInput, subject: string, preheader: string): string {
  const fields = input.vars.dataFields ?? [
    { label: 'QA STATUS', value: 'PASSED' },
    { label: 'NEXT STEP', value: 'LAUNCH AUTHORIZATION' },
  ];
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'QA')}
<tr><td align="center" style="padding:28px;"><div style="width:110px;height:110px;margin:0 auto;border:1px solid ${EMAIL.red};border-radius:50%;"><div style="margin:44px auto;width:22px;height:22px;background:${EMAIL.red};border-radius:50%;"></div></div></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:30px;font-weight:800;text-transform:uppercase;">FINAL SYSTEM<br/>CHECK</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;">${dataStrip(fields, 'light')}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeLaunchAuthorization(input: CompositionInput, subject: string, preheader: string): string {
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader(input.familyLabel, 'light', 'LAUNCH')}
<tr><td align="center" style="padding:28px;"><div style="width:36px;height:90px;margin:0 auto;background:linear-gradient(180deg,${EMAIL.red},#333);"></div></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;text-transform:uppercase;color:${EMAIL.red};">LAUNCH<br/>SEQUENCE<br/>READY.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">YOUR APPROVAL<br/>IS REQUIRED.</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.white, body });
}

export function composeLocationLive(input: CompositionInput, subject: string, preheader: string): string {
  const liveUrl = esc(input.vars.liveUrl ?? input.ctaUrl);
  const accent = esc(input.vars.accentScript ?? 'ARRIVAL CONFIRMED');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'LIVE')}
<tr><td class="pad" style="padding:28px 36px;text-align:center;">
<p style="margin:0 0 8px;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.red};">${accent}</p>
<p class="hero-lg" style="margin:0;font-size:34px;font-weight:800;text-transform:uppercase;">YOUR SITE<br/>IS NOW LIVE.</p>
<p style="margin:16px 0 0;font-family:${EMAIL.fontStack};color:${EMAIL.red};">${liveUrl}</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeProductionComplete(input: CompositionInput, subject: string, preheader: string): string {
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'DELIVERY')}
<tr><td align="center" style="padding:28px;">${deliverySeal()}</td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:800;text-transform:uppercase;">PRODUCTION<br/>RECORD<br/>CLOSED.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">YOUR PROPERTY<br/>IS ACTIVE.</p></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeSignalEditorial(input: CompositionInput, subject: string, preheader: string): string {
  const issue = esc(input.vars.issueNumber ?? '004');
  const rows = (input.vars.signalModules ?? [])
    .map(
      (m) => `<tr><td style="padding:18px 0;border-bottom:1px solid ${EMAIL.border};"><p style="margin:0 0 4px;font-family:${EMAIL.fontStack};font-size:10px;color:${EMAIL.red};">${esc(m.num)}</p><p style="margin:0 0 6px;font-size:14px;font-weight:700;text-transform:uppercase;">${esc(m.title)}</p><p style="margin:0;font-size:13px;color:#444;">${esc(m.excerpt)}</p></td></tr>`,
    )
    .join('');
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader('SIGNAL', 'light', 'TRANSMISSION')}
<tr><td class="pad" style="padding:20px 36px;"><p style="margin:0;font-size:28px;font-weight:800;color:${EMAIL.red};">SITE 00 SIGNAL</p><p style="margin:6px 0 0;font-family:${EMAIL.fontStack};color:${EMAIL.stone};">ISSUE ${issue}</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;"><table role="presentation" width="100%">${rows}</table></td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: EMAIL.white, body });
}

/** Family-varied status notices — not one universal card stack. */
export function composeStatusNotice(input: CompositionInput, subject: string, preheader: string): string {
  const theme: EmailTheme = input.vars.theme ?? 'light';
  const bg = theme === 'dark' ? EMAIL.black : EMAIL.white;
  const text = theme === 'dark' ? EMAIL.white : EMAIL.black;
  const accent = familyAccent(input.family);

  if (input.family === 'billing') {
    const fields = input.vars.dataFields ?? [];
    const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'LEDGER')}
<tr><td class="pad" style="padding:16px 36px 8px;">${accent}</td></tr>
<tr><td class="pad" style="padding:8px 36px;"><p class="hero-lg" style="margin:0;font-size:26px;font-weight:800;text-transform:uppercase;">${esc(input.headline)}</p></td></tr>
${fields.length ? `<tr><td class="pad" style="padding:12px 36px 24px;">${dataStrip(fields, 'light')}</td></tr>` : ''}
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
    return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
  }

  if (input.family === 'access' && (input.templateId === 'verify-email' || input.templateId === 'password-reset')) {
    const category = input.templateId === 'verify-email' ? 'VERIFY' : 'SECURITY';
    const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark', category)}
<tr><td class="pad" style="padding:20px 36px 8px;" align="center">${accessGlyph('sm')}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;text-align:center;">
<p class="hero-lg" style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;color:${EMAIL.white};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:10px;text-transform:uppercase;color:#888;">${esc(input.subheadline)}</p>` : ''}
</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'red')}${emailFooter('dark', input.classification)}
</table></td></tr></table>`;
    return emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
  }

  if (input.family === 'identity') {
    const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light', 'ORIENTATION')}
<tr><td class="pad" style="padding:20px 36px;">${progressRail(4, 1)}</td></tr>
<tr><td class="pad" style="padding:8px 36px 8px;" align="center">${accent}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;"><p class="hero-lg" style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}</td></tr>
${emailCTA(input.ctaLabel, input.ctaUrl, 'black')}${emailFooter('light', input.classification)}
</table></td></tr></table>`;
    return emailDoc({ title: subject, preheader, bg: EMAIL.light, body });
  }

  const body = `<table role="presentation" width="100%" style="background:${theme === 'dark' ? EMAIL.black : EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${bg};">
${systemHeader(input.familyLabel, theme)}
<tr><td class="pad" style="padding:16px 36px 8px;">${accent}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;"><p class="hero-lg" style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;color:${text};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}</td></tr>
${input.vars.dataFields?.length ? `<tr><td class="pad" style="padding:12px 36px 24px;">${dataStrip(input.vars.dataFields, theme)}</td></tr>` : ''}
${emailCTA(input.ctaLabel, input.ctaUrl, theme === 'dark' ? 'white' : 'black')}${emailFooter(theme, input.classification)}
</table></td></tr></table>`;
  return emailDoc({ title: subject, preheader, bg: theme === 'dark' ? EMAIL.black : EMAIL.light, body });
}

export function composeInternalNotice(input: CompositionInput, subject: string, preheader: string): string {
  return composeStatusNotice({ ...input, familyLabel: 'INTERNAL' }, subject, preheader);
}
