import { EMAIL, esc } from './tokens.js';
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

function doc(params: { title: string; preheader: string; bg: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="color-scheme" content="light dark"/>
<title>${esc(params.title)}</title>
<link href="${EMAIL.fontUrl}" rel="stylesheet"/>
<style>
body{margin:0!important;padding:0!important;width:100%!important;-webkit-text-size-adjust:100%}
table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
img{border:0;display:block;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
@media only screen and (max-width:620px){
.email-wrap{width:100%!important;max-width:100%!important}
.pad{padding-left:18px!important;padding-right:18px!important}
.stack{display:block!important;width:100%!important;max-width:100%!important}
.hero-xl{font-size:34px!important;line-height:36px!important}
.hero-lg{font-size:28px!important;line-height:30px!important}
.cta-cell{display:block!important;width:100%!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${params.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${params.bg};">${esc(params.preheader)}</div>
${params.body}
</body></html>`;
}

function systemHeader(family: string, _theme: EmailTheme): string {
  return `<tr><td class="pad" style="padding:26px 36px 10px;font-family:${EMAIL.fontStack};">
<p style="margin:0;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL.stone};">
SITE 00 <span style="color:${EMAIL.red};">◆</span> ${esc(family)}
</p></td></tr>`;
}

function footer(theme: EmailTheme, classification: EmailClassification): string {
  const line = theme === 'dark' ? '#222' : EMAIL.border;
  const text = EMAIL.stone;
  const unsub =
    classification === 'marketing'
      ? `<p style="margin:10px 0 0;font-size:9px;color:${text};"><a href="#" style="color:${text};text-decoration:underline;">UNSUBSCRIBE</a></p>`
      : '';
  return `<tr><td class="pad" style="padding:22px 36px 34px;border-top:1px solid ${line};text-align:center;font-family:${EMAIL.fontStack};">
<p style="margin:0;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${text};">SITE 00 <span style="color:${EMAIL.red};">◆</span></p>
<p style="margin:6px 0 0;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:${text};">${EMAIL.footerTagline}</p>
<p style="margin:10px 0 0;font-size:8px;color:${text};"><a href="https://site00.com" style="color:${text};">SITE00.COM</a> · SUPPORT · PRIVACY</p>
${unsub}
</td></tr>`;
}

function cta(label: string, url: string, variant: 'red' | 'black' | 'white'): string {
  const bg = variant === 'red' ? EMAIL.red : variant === 'black' ? EMAIL.black : EMAIL.white;
  const color = variant === 'white' ? EMAIL.black : EMAIL.white;
  const border = variant === 'white' ? `1px solid ${EMAIL.black}` : 'none';
  return `<tr><td class="pad" style="padding:6px 36px 30px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td class="cta-cell" align="center" style="background:${bg};border:${border};">
<a href="${esc(url)}" style="display:inline-block;padding:17px 36px;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${color};">${esc(label)}</a>
</td></tr></table></td></tr>`;
}

function dataCard(fields: Array<{ label: string; value: string }>, theme: EmailTheme): string {
  const bg = theme === 'dark' ? '#111' : EMAIL.light;
  const border = theme === 'dark' ? '#2a2a2a' : EMAIL.border;
  const rows = fields
    .map(
      (f, i) => `<tr>
<td style="padding:11px 16px;${i < fields.length - 1 ? `border-bottom:1px solid ${border};` : ''}font-family:${EMAIL.monoStack};font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.stone};width:42%;">${esc(f.label)}</td>
<td style="padding:11px 16px;${i < fields.length - 1 ? `border-bottom:1px solid ${border};` : ''}font-family:${EMAIL.fontStack};font-size:13px;color:${theme === 'dark' ? EMAIL.white : EMAIL.black};">${esc(f.value)}</td>
</tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:1px solid ${border};">${rows}</table>`;
}

function cornerMarks(color: string): string {
  return `<span style="font-family:${EMAIL.monoStack};font-size:14px;color:${color};letter-spacing:0.3em;">⌜⌝<br/>⌞⌟</span>`;
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
<p style="margin:0;font-size:40px;font-weight:700;color:${EMAIL.white};letter-spacing:0.08em;">00</p>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:10px 36px 0;font-family:${EMAIL.monoStack};font-size:8px;letter-spacing:0.18em;color:#666;">OUTSIDE SITE 00 · → · AUTHORIZED · → · STUDIO ACCESS</td></tr></table>`;
}

function coordinateHero(): string {
  return `<table role="presentation" width="100%"><tr><td align="center" style="padding:18px 36px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:96px;height:96px;border:1px solid ${EMAIL.border};border-radius:50%;">
<tr><td align="center" valign="middle">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:36px;height:36px;background:${EMAIL.red};"><tr><td></td></tr></table>
</td></tr></table></td></tr></table>`;
}

function wireframeHero(): string {
  return `<table role="presentation" width="100%" style="background:#111;height:96px;border-bottom:1px solid #222;"><tr>
<td style="padding:0 36px;position:relative;">
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
<td style="padding:16px 18px;font-family:${EMAIL.monoStack};font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.stone};">${esc(label)}</td>
<td align="right" style="padding:16px 18px;font-size:12px;font-weight:700;color:${EMAIL.black};">${dot}${esc(value)}</td>
</tr></table>`;
}

function familyAccent(family: EmailFamily): string {
  switch (family) {
    case 'identity':
      return `<table role="presentation" align="center" style="margin:0 auto 8px;"><tr><td style="width:64px;height:64px;border:1px solid ${EMAIL.red};border-radius:50%;text-align:center;line-height:64px;font-size:10px;color:${EMAIL.red};">◉</td></tr></table>`;
    case 'review':
    case 'assets':
      return `<table role="presentation" align="center" width="80%" style="margin:0 auto 8px;height:48px;border:1px dashed #ccc;"><tr><td align="center" style="font-size:9px;color:${EMAIL.stone};">BLDR · DIRECTION</td></tr></table>`;
    case 'property':
      return `<table role="presentation" align="center" style="margin:0 auto 8px;"><tr><td style="font-size:9px;letter-spacing:0.2em;color:${EMAIL.stone};">● ——— ● ——— ●</td></tr></table>`;
    case 'billing':
      return `<table role="presentation" align="center" width="72%" style="margin:0 auto 8px;border-top:2px solid ${EMAIL.black};"><tr><td style="padding-top:8px;font-size:9px;color:${EMAIL.stone};">RECEIPT · DOCUMENT</td></tr></table>`;
    default:
      return '';
  }
}

export function composeAccessWelcome(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const name = esc(v.clientName ?? 'MEMBER');
  const initials = esc(v.clientInitials ?? 'NK');
  const memberId = esc(v.memberId ?? '00-0001');
  const issued = esc(v.issuedDate ?? v.timestamp ?? '—');
  const qrImg = input.qrDataUrl ? `<img src="${input.qrDataUrl}" width="140" height="140" alt="Scan to enter SITE 00" style="margin:0 auto;"/>` : '';

  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark')}
<tr><td class="pad" style="padding:8px 36px 24px;"><table role="presentation" width="100%"><tr>
<td class="stack" width="52%" valign="top" style="padding-right:12px;">
<p style="margin:0 0 6px;font-family:${EMAIL.scriptAccent};font-size:26px;font-style:italic;color:${EMAIL.red};">Welcome to</p>
<p class="hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:44px;line-height:42px;font-weight:700;color:${EMAIL.white};">SITE 00</p>
<p style="margin:14px 0 0;font-size:11px;line-height:17px;letter-spacing:0.1em;text-transform:uppercase;color:#999;">YOUR SITE 00 IDENTITY<br/>HAS BEEN RECOGNIZED.</p>
</td><td class="stack" width="48%" valign="top" align="right">
<table role="presentation" align="right" cellpadding="0" cellspacing="0" style="width:92px;height:92px;border:2px solid ${EMAIL.red};transform:rotate(45deg);"><tr><td align="center" valign="middle" style="transform:rotate(-45deg);font-size:10px;font-weight:700;color:${EMAIL.red};letter-spacing:0.08em;">ACCESS<br/>00</td></tr></table>
</td>
</tr></table></td></tr>
<tr><td class="pad" style="padding:0 36px 24px;"><table role="presentation" width="100%" style="background:${EMAIL.white};"><tr><td style="padding:28px 24px;">
<table role="presentation" width="100%"><tr><td width="64"><div style="width:56px;height:56px;border:2px solid ${EMAIL.red};border-radius:50%;text-align:center;line-height:56px;font-size:18px;font-weight:700;">${initials}</div></td>
<td style="padding-left:12px;"><p style="margin:0;font-family:${EMAIL.monoStack};font-size:9px;color:${EMAIL.stone};">SITE 00 ACCESS</p>
<p style="margin:4px 0 0;font-size:20px;font-weight:700;color:${EMAIL.black};">${name}</p>
<p style="margin:6px 0 0;font-family:${EMAIL.monoStack};font-size:14px;color:${EMAIL.red};">${memberId}</p>
<p style="margin:8px 0 0;font-size:10px;color:${EMAIL.stone};">ISSUED ${issued} · <span style="color:${EMAIL.green};">AUTHORIZED</span></p></td></tr></table>
<div style="text-align:center;margin-top:22px;">${qrImg}</div>
<p style="margin:10px 0 0;text-align:center;font-size:8px;color:${EMAIL.stone};font-family:${EMAIL.monoStack};">SCAN · OR USE LINK BELOW ON THIS DEVICE</p>
</td></tr></table></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'red')}${footer('dark', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.black, body });
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
${systemHeader(input.familyLabel, 'light')}
<tr><td>${hallwayHero()}</td></tr>
<tr><td class="pad" style="padding:28px 36px 8px;"><p class="hero-lg" style="margin:0;font-size:36px;font-weight:700;text-transform:uppercase;">PROJECT<br/>INITIATED.</p>
<p style="margin:10px 0 0;font-family:${EMAIL.monoStack};font-size:16px;color:${EMAIL.red};">PROJECT ${pid}</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;">${dataCard(fields, 'light')}</td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeStudioPortal(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const project = esc(v.projectName ?? '—');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="max-width:${EMAIL.maxWidth}px;background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark')}
${portalDoorHero()}
<tr><td class="pad" style="padding:20px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:700;text-transform:uppercase;color:${EMAIL.white};">STUDIO<br/>ACCESS<br/><span style="color:${EMAIL.red};">GRANTED.</span></p>
<p style="margin:16px 0 0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;line-height:1.6;">PAYMENT CONFIRMED.<br/>YOUR PROJECT HAS ENTERED<br/>THE PRODUCTION ENVIRONMENT.</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 8px;">${statusCard('PROJECT', project, false)}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;">${statusCard('ENVIRONMENT', 'STUDIO ACTIVE', true)}</td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'white')}${footer('dark', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.black, body });
}

export function composeActionRequired(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const count = v.requiredInputCount ?? v.inputItems?.length ?? 2;
  const list = (v.inputItems ?? []).map((item, i) => `<tr><td style="padding:14px 16px;border-bottom:1px solid ${EMAIL.border};font-size:13px;"><span style="color:${EMAIL.red};font-family:${EMAIL.monoStack};">${String(i + 1).padStart(2, '0')}</span> ${esc(item)}</td></tr>`).join('');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light')}
${coordinateHero()}
<tr><td class="pad" style="padding:12px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:30px;font-weight:700;text-transform:uppercase;">PRODUCTION<br/>IS WAITING<br/>ON YOU.</p>
<p style="margin:14px 0 0;border:1px solid ${EMAIL.red};display:inline-block;padding:6px 12px;color:${EMAIL.red};font-size:10px;">${String(count).padStart(2, '0')} ITEMS REQUIRED</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;"><table role="presentation" width="100%" style="border:1px solid ${EMAIL.border};">${list}</table></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'red')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeReviewDossier(input: CompositionInput, subject: string, preheader: string): string {
  const v = input.vars;
  const n = v.directionCount ?? 3;
  const review = esc(v.reviewName ?? 'BLUEPRINT / HOMEPAGE');
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};">
${systemHeader(input.familyLabel, 'dark')}
<tr><td>${wireframeHero()}</td></tr>
<tr><td class="pad" style="padding:28px 36px;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:700;text-transform:uppercase;color:${EMAIL.white};">${n} DIRECTION${n === 1 ? '' : 'S'}<br/>HAVE ENTERED<br/><span style="color:${EMAIL.red};">REVIEW.</span></p>
<p style="margin:14px 0 0;font-size:10px;color:#888;">${review}</p></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'red')}${footer('dark', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.black, body });
}

export function composeMilestoneArtifact(input: CompositionInput, subject: string, preheader: string): string {
  const milestone = esc(input.vars.milestoneName ?? 'MILESTONE');
  const fields = input.vars.dataFields ?? [{ label: 'MILESTONE', value: milestone }, { label: 'PROJECT', value: input.vars.projectName ?? '—' }];
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light')}
<tr><td align="center" style="padding:24px;"><div style="width:90px;height:90px;margin:0 auto;border:2px solid ${EMAIL.red};transform:rotate(45deg);"><span style="display:block;transform:rotate(-45deg);line-height:90px;font-size:32px;color:${EMAIL.red};">✓</span></div></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:700;text-transform:uppercase;">MILESTONE<br/>RECORDED.</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;">${dataCard(fields, 'light')}</td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeRevisionNotice(input: CompositionInput, subject: string, preheader: string): string {
  const fields = input.vars.dataFields ?? [{ label: 'REVIEW', value: input.vars.reviewName ?? '—' }, { label: 'DIRECTION', value: input.vars.directionLabel ?? '—' }];
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader(input.familyLabel, 'light')}
<tr><td class="pad" style="padding:24px 36px;"><p class="hero-lg" style="margin:0;font-size:38px;font-weight:700;text-transform:uppercase;color:${EMAIL.red};">REVISION<br/>RECEIVED.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">WE'RE INCORPORATING<br/>YOUR FEEDBACK.</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;">${dataCard(fields, 'light')}</td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.white, body });
}

export function composeSystemCheck(input: CompositionInput, subject: string, preheader: string): string {
  const fields = input.vars.dataFields ?? [{ label: 'QA STATUS', value: 'PASSED' }, { label: 'NEXT STEP', value: 'LAUNCH AUTHORIZATION' }];
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light')}
<tr><td align="center" style="padding:28px;"><div style="width:110px;height:110px;margin:0 auto;border:1px solid ${EMAIL.red};border-radius:50%;"><div style="margin:44px auto;width:22px;height:22px;background:${EMAIL.red};border-radius:50%;"></div></div></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:30px;font-weight:700;text-transform:uppercase;">FINAL SYSTEM<br/>CHECK</p></td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;">${dataCard(fields, 'light')}</td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'red')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeLaunchAuthorization(input: CompositionInput, subject: string, preheader: string): string {
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader(input.familyLabel, 'light')}
<tr><td align="center" style="padding:28px;"><div style="width:36px;height:90px;margin:0 auto;background:linear-gradient(180deg,${EMAIL.red},#333);"></div></td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:700;text-transform:uppercase;color:${EMAIL.red};">LAUNCH<br/>SEQUENCE<br/>READY.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">YOUR APPROVAL<br/>IS REQUIRED.</p></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.white, body });
}

export function composeLocationLive(input: CompositionInput, subject: string, preheader: string): string {
  const liveUrl = esc(input.vars.liveUrl ?? input.ctaUrl);
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light')}
<tr><td class="pad" style="padding:28px 36px;text-align:center;"><p style="margin:0 0 8px;font-family:${EMAIL.scriptAccent};font-size:28px;font-style:italic;color:${EMAIL.red};">Congratulations!</p>
<p class="hero-lg" style="margin:0;font-size:34px;font-weight:700;text-transform:uppercase;">YOUR SITE<br/>IS NOW LIVE.</p>
<p style="margin:16px 0 0;font-family:${EMAIL.monoStack};color:${EMAIL.red};">${liveUrl}</p></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeProductionComplete(input: CompositionInput, subject: string, preheader: string): string {
  const body = `<table role="presentation" width="100%" style="background:${EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${EMAIL.white};">
${systemHeader(input.familyLabel, 'light')}
<tr><td align="center" style="padding:28px;">${cornerMarks(EMAIL.red)}</td></tr>
<tr><td class="pad" style="padding:8px 36px;text-align:center;"><p class="hero-lg" style="margin:0;font-size:32px;font-weight:700;text-transform:uppercase;">PRODUCTION<br/>RECORD<br/>CLOSED.</p>
<p style="margin:14px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">YOUR PROPERTY<br/>IS ACTIVE.</p></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.light, body });
}

export function composeSignalEditorial(input: CompositionInput, subject: string, preheader: string): string {
  const issue = esc(input.vars.issueNumber ?? '004');
  const rows = (input.vars.signalModules ?? []).map((m) => `<tr><td style="padding:18px 0;border-bottom:1px solid ${EMAIL.border};"><p style="margin:0 0 4px;font-family:${EMAIL.monoStack};font-size:10px;color:${EMAIL.red};">${esc(m.num)}</p><p style="margin:0 0 6px;font-size:14px;font-weight:700;text-transform:uppercase;">${esc(m.title)}</p><p style="margin:0;font-size:13px;color:#444;">${esc(m.excerpt)}</p></td></tr>`).join('');
  const body = `<table role="presentation" width="100%"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}">
${systemHeader('SIGNAL', 'light')}
<tr><td class="pad" style="padding:20px 36px;"><p style="margin:0;font-size:28px;font-weight:700;color:${EMAIL.red};">SITE 00 SIGNAL</p><p style="margin:6px 0 0;font-family:${EMAIL.monoStack};color:${EMAIL.stone};">ISSUE ${issue}</p></td></tr>
<tr><td class="pad" style="padding:12px 36px 24px;"><table role="presentation" width="100%">${rows}</table></td></tr>
${cta(input.ctaLabel, input.ctaUrl, 'black')}${footer('light', input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: EMAIL.white, body });
}

export function composeStatusNotice(input: CompositionInput, subject: string, preheader: string): string {
  const theme: EmailTheme = input.vars.theme ?? 'light';
  const bg = theme === 'dark' ? EMAIL.black : EMAIL.white;
  const text = theme === 'dark' ? EMAIL.white : EMAIL.black;
  const accent = familyAccent(input.family);
  const body = `<table role="presentation" width="100%" style="background:${theme === 'dark' ? EMAIL.black : EMAIL.light};"><tr><td align="center" style="padding:20px 12px;">
<table role="presentation" class="email-wrap" width="${EMAIL.maxWidth}" style="background:${bg};">
${systemHeader(input.familyLabel, theme)}
<tr><td class="pad" style="padding:16px 36px 8px;">${accent}</td></tr>
<tr><td class="pad" style="padding:8px 36px 24px;"><p class="hero-lg" style="margin:0;font-size:28px;font-weight:700;text-transform:uppercase;color:${text};">${esc(input.headline)}</p>
${input.subheadline ? `<p style="margin:12px 0 0;font-size:11px;text-transform:uppercase;color:${EMAIL.stone};">${esc(input.subheadline)}</p>` : ''}</td></tr>
${input.vars.dataFields?.length ? `<tr><td class="pad" style="padding:12px 36px 24px;">${dataCard(input.vars.dataFields, theme)}</td></tr>` : ''}
${cta(input.ctaLabel, input.ctaUrl, theme === 'dark' ? 'white' : 'black')}${footer(theme, input.classification)}
</table></td></tr></table>`;
  return doc({ title: subject, preheader, bg: theme === 'dark' ? EMAIL.black : EMAIL.light, body });
}

export function composeInternalNotice(input: CompositionInput, subject: string, preheader: string): string {
  return composeStatusNotice({ ...input, familyLabel: 'INTERNAL' }, subject, preheader);
}
