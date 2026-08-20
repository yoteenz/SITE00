import { EMAIL, esc } from '../design/tokens.js';
import type { EmailClassification, EmailTheme } from '../types.js';

/** Email-safe document shell with responsive rules. */
export function emailDoc(params: { title: string; preheader: string; bg: string; body: string }): string {
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
.cred-slab{margin-bottom:16px!important}
.qr-cell{padding-top:12px!important;text-align:left!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${params.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${params.bg};">${esc(params.preheader)}</div>
${params.body}
</body></html>`;
}

/** SITE 00 ◆ family label header row. */
export function systemHeader(family: string, theme: EmailTheme, categoryRight?: string): string {
  const color = theme === 'dark' ? EMAIL.stone : EMAIL.stone;
  const right = categoryRight
    ? `<td align="right" style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:${color};">${esc(categoryRight)}</td>`
    : '';
  return `<tr><td class="pad" style="padding:26px 36px 10px;font-family:${EMAIL.fontStack};">
<table role="presentation" width="100%"><tr>
<td style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${color};">
SITE 00 ${systemDiamond()} ${esc(family)}
</td>${right}</tr></table></td></tr>`;
}

/** Red diamond glyph — table-safe SITE 00 mark. */
export function systemDiamond(size = 6): string {
  return `<span style="display:inline-block;width:${size}px;height:${size}px;background:${EMAIL.red};transform:rotate(45deg);vertical-align:middle;margin:0 2px;"></span>`;
}

export function site00Wordmark(theme: EmailTheme = 'dark'): string {
  const color = theme === 'dark' ? EMAIL.white : EMAIL.black;
  return `<span style="font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${color};">SITE 00 ${systemDiamond()}</span>`;
}

export function microLabel(text: string, theme: EmailTheme = 'light'): string {
  const color = theme === 'dark' ? '#666' : EMAIL.stone;
  return `<p style="margin:0 0 3px;font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:${color};">${esc(text)}</p>`;
}

export function indexNumber(num: string): string {
  return `<span style="font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;color:${EMAIL.red};letter-spacing:0.06em;">${esc(num)}</span>`;
}

export function redRule(width = '100%'): string {
  return `<table role="presentation" width="${width}" cellpadding="0" cellspacing="0"><tr><td style="height:2px;background:${EMAIL.red};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

export function coordinateMark(theme: EmailTheme = 'dark'): string {
  const line = theme === 'dark' ? '#333' : EMAIL.border;
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="width:88px;height:88px;">
<tr><td align="center" valign="middle" style="border:1px solid ${line};">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:32px;height:32px;border:1px solid ${EMAIL.red};"><tr><td align="center" valign="middle" style="font-size:8px;color:${EMAIL.red};font-weight:700;">+</td></tr></table>
</td></tr></table>`;
}

/** Hexagonal access mark with 00 — email-safe nested borders. */
export function accessGlyph(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const dim = size === 'sm' ? 64 : size === 'lg' ? 112 : 88;
  const fontSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="width:${dim}px;height:${dim}px;">
<tr><td align="center" valign="middle" style="border:2px solid ${EMAIL.red};">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:${dim - 16}px;height:${dim - 16}px;border:1px solid #333;background:#0f0f0f;">
<tr><td align="center" valign="middle">
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:${fontSize}px;font-weight:800;color:${EMAIL.white};letter-spacing:0.04em;">00</p>
<p style="margin:4px 0 0;font-size:7px;letter-spacing:0.18em;color:${EMAIL.red};">ACCESS</p>
</td></tr></table>
</td></tr></table>`;
}

export function registrationMark(): string {
  return `<span style="font-family:${EMAIL.fontStack};font-size:14px;color:${EMAIL.red};letter-spacing:0.3em;">⌜⌝<br/>⌞⌟</span>`;
}

export function statusStamp(label: string, active = false): string {
  const color = active ? EMAIL.green : EMAIL.stone;
  return `<span style="font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:${color};font-weight:700;">${esc(label)}</span>`;
}

export function identityMark(initials: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:44px;height:44px;border:2px solid ${EMAIL.red};">
<tr><td align="center" valign="middle" style="font-family:${EMAIL.fontStack};font-size:14px;font-weight:700;color:${EMAIL.black};">${esc(initials)}</td></tr></table>`;
}

export function dataStrip(fields: Array<{ label: string; value: string }>, theme: EmailTheme): string {
  const bg = theme === 'dark' ? '#111' : EMAIL.white;
  const border = theme === 'dark' ? '#2a2a2a' : EMAIL.border;
  const rows = fields
    .map(
      (f, i) => `<tr>
<td style="padding:9px 14px;${i < fields.length - 1 ? `border-bottom:1px solid ${border};` : ''}font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.stone};width:38%;">${esc(f.label)}</td>
<td style="padding:9px 14px;${i < fields.length - 1 ? `border-bottom:1px solid ${border};` : ''}font-family:${EMAIL.fontStack};font-size:12px;font-weight:600;color:${theme === 'dark' ? EMAIL.white : EMAIL.black};">${esc(f.value)}</td>
</tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:1px solid ${border};">${rows}</table>`;
}

export function artifactFrame(content: string, theme: EmailTheme): string {
  const bg = theme === 'dark' ? '#0f0f0f' : EMAIL.light;
  const border = theme === 'dark' ? '#222' : EMAIL.border;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-left:3px solid ${EMAIL.red};border-top:1px solid ${border};border-right:1px solid ${border};border-bottom:1px solid ${border};">
<tr><td style="padding:20px 18px;">${content}</td></tr></table>`;
}

export function technicalAnnotation(text: string): string {
  return `<p style="margin:8px 0 0;font-family:${EMAIL.fontStack};font-size:7px;letter-spacing:0.16em;text-transform:uppercase;color:#555;">${esc(text)}</p>`;
}

export function emailCTA(label: string, url: string, variant: 'red' | 'black' | 'white'): string {
  const bg = variant === 'red' ? EMAIL.red : variant === 'black' ? EMAIL.black : EMAIL.white;
  const color = variant === 'white' ? EMAIL.black : EMAIL.white;
  const border = variant === 'white' ? `1px solid ${EMAIL.black}` : 'none';
  return `<tr><td class="pad" style="padding:6px 36px 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="cta-cell" align="center" style="background:${bg};border:${border};">
<a href="${esc(url)}" style="display:inline-block;padding:17px 36px;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${color};text-decoration:none;">${esc(label)}</a>
</td></tr></table></td></tr>`;
}

export function emailFooter(theme: EmailTheme, classification: EmailClassification): string {
  const text = EMAIL.stone;
  const unsub =
    classification === 'marketing'
      ? `<p style="margin:10px 0 0;font-size:9px;color:${text};"><a href="#" style="color:${text};text-decoration:underline;">UNSUBSCRIBE</a></p>`
      : '';
  const coord = technicalAnnotation('00.000 · 00.000');
  return `<tr><td class="pad" style="padding:0 36px;">${redRule()}</td></tr>
<tr><td class="pad" style="padding:18px 36px 34px;font-family:${EMAIL.fontStack};">
<table role="presentation" width="100%"><tr>
<td align="left">${site00Wordmark(theme)}</td>
<td align="right">${coord}</td>
</tr></table>
<p style="margin:10px 0 0;text-align:center;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:${text};">${EMAIL.footerTagline}</p>
<p style="margin:10px 0 0;text-align:center;font-size:8px;color:${text};"><a href="https://site00.com" style="color:${text};">SITE00.COM</a> · SUPPORT · PRIVACY</p>
${unsub}
</td></tr>`;
}

/** Compact access credential artifact — asymmetric, not a membership card. */
export function accessCredentialArtifact(params: {
  initials: string;
  name: string;
  memberId: string;
  issued: string;
  statusLabel: string;
  qrImg: string;
}): string {
  const { initials, name, memberId, issued, statusLabel, qrImg } = params;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="stack cred-slab" width="36%" valign="top" style="padding-right:14px;">
${artifactFrame(`${accessGlyph('sm')}${technicalAnnotation('CREDENTIAL · INDEX 00')}`, 'dark')}
</td>
<td class="stack" width="64%" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL.white};">
<tr><td style="padding:0;">${redRule()}</td></tr>
<tr><td style="padding:14px 16px 16px;">
<table role="presentation" width="100%"><tr>
<td valign="top" style="padding-right:10px;">
<table role="presentation"><tr>
<td style="padding-right:10px;" valign="top">${identityMark(initials)}</td>
<td valign="top">
${microLabel('SITE 00 ACCESS', 'light')}
<p style="margin:0 0 8px;font-family:${EMAIL.fontStack};font-size:14px;font-weight:700;color:${EMAIL.black};text-transform:uppercase;">${name}</p>
${microLabel('MEMBER ID', 'light')}
<p style="margin:0 0 8px;font-family:${EMAIL.fontStack};font-size:13px;font-weight:700;color:${EMAIL.red};">${memberId}</p>
${microLabel('ISSUED', 'light')}
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:9px;color:${EMAIL.stone};">${issued} · ${statusStamp(statusLabel, statusLabel === 'AUTHORIZED')}</p>
</td></tr></table>
</td>
<td class="qr-cell" width="80" align="right" valign="bottom">${qrImg}</td>
</tr></table>
${technicalAnnotation('SCAN · OR USE LINK BELOW ON THIS DEVICE')}
</td></tr></table>
</td></tr></table>`;
}

export function progressRail(steps: number, activeStep: number): string {
  const cells = Array.from({ length: steps }, (_, i) => {
    const active = i < activeStep;
    const bg = active ? EMAIL.red : '#ddd';
    return `<td style="width:${Math.floor(100 / steps)}%;height:3px;background:${bg};font-size:0;">&nbsp;</td>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="2"><tr>${cells}</tr></table>`;
}

export function productionStamp(): string {
  return `<table role="presentation" align="center" style="margin:0 auto;"><tr>
<td style="border:1px solid ${EMAIL.red};padding:6px 14px;font-size:8px;letter-spacing:0.14em;color:${EMAIL.red};font-weight:700;">PRODUCTION</td>
</tr></table>`;
}

export function approvalStamp(): string {
  return `<table role="presentation" align="center"><tr>
<td style="width:48px;height:48px;border:2px solid ${EMAIL.red};border-radius:50%;text-align:center;line-height:48px;font-size:18px;color:${EMAIL.red};">✓</td>
</tr></table>`;
}

export function deliverySeal(): string {
  return registrationMark();
}
