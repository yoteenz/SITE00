/**
 * Family 01 ACCESS / SECURITY — reference-fidelity composition (approved board).
 * Shared by lifecycle ACCESS_CREDENTIAL and family-default ACCESS_SECURITY templates.
 * Mobile: composition-preserving compression — NOT generic stack/reflow.
 */
import type { CompositionInput } from '../design/compositions.js';
import { EMAIL, esc } from '../design/tokens.js';
import {
  accessGlyph,
  emailDoc,
  microLabel,
  redRule,
  systemHeader,
  technicalAnnotation,
} from './primitives.js';

export type AccessSecurityRenderInput = CompositionInput & {
  headerCategory?: string;
  statusLabel?: string;
};

/** Family 01 scoped responsive rules — preserves desktop composition at 375px. */
export const ACCESS_SECURITY_MOBILE_STYLES = `@media only screen and (max-width:620px){
.access-terminal .pad{padding-left:14px!important;padding-right:14px!important}
.access-terminal .access-hero-left{width:32%!important;max-width:32%!important;display:table-cell!important;vertical-align:middle!important}
.access-terminal .access-hero-right{width:68%!important;max-width:68%!important;display:table-cell!important;vertical-align:middle!important;padding-left:10px!important}
.access-terminal .access-glyph-desktop{display:none!important}
.access-terminal .access-glyph-mobile{display:block!important}
.access-terminal .access-hero-xl{font-size:22px!important;line-height:24px!important}
.access-terminal .access-hero-sub{font-size:8px!important;line-height:13px!important}
.access-terminal .access-cred-left{width:55%!important;max-width:55%!important;display:table-cell!important;vertical-align:top!important;padding-right:8px!important}
.access-terminal .access-cred-qr{width:45%!important;max-width:45%!important;display:table-cell!important;vertical-align:top!important;padding-left:8px!important;border-left:1px solid #2a2a2a!important}
.access-terminal .access-cred-panel{padding:12px 12px 14px!important}
.access-terminal .access-member-id{font-size:18px!important;margin-bottom:10px!important}
.access-terminal .access-issued-gap{margin-bottom:10px!important}
.access-terminal .access-qr-img{width:72px!important;height:72px!important}
.access-terminal .access-sec-4col{display:none!important}
.access-terminal .access-sec-2x2{display:table!important;width:100%!important}
.access-terminal .access-sec-2x2 td{width:50%!important;display:table-cell!important;vertical-align:top!important;padding:10px 6px!important}
.access-terminal .access-footer-left{width:33%!important;display:table-cell!important;vertical-align:top!important;font-size:7px!important;line-height:12px!important}
.access-terminal .access-footer-center{width:34%!important;display:table-cell!important;vertical-align:middle!important}
.access-terminal .access-footer-right{width:33%!important;display:table-cell!important;vertical-align:top!important;text-align:right!important;font-size:7px!important;line-height:12px!important}
.access-terminal .access-footer-box p:first-child{font-size:16px!important}
.access-terminal .access-cta a{padding:14px 16px!important;font-size:10px!important}
}`;

function qrImg(dataUrl?: string, size = 96): string {
  if (!dataUrl) return '';
  return `<img class="access-qr-img" src="${dataUrl}" width="${size}" height="${size}" alt="Scan to enter SITE 00" style="display:block;margin:0 auto;width:${size}px;height:${size}px;"/>`;
}

function cornerBrackets(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" align="left" style="font-family:${EMAIL.fontStack};font-size:10px;color:${EMAIL.red};line-height:1;">⌜</td>
<td width="50%" align="right" style="font-family:${EMAIL.fontStack};font-size:10px;color:${EMAIL.red};line-height:1;">⌝</td>
</tr><tr><td align="left" style="font-family:${EMAIL.fontStack};font-size:10px;color:${EMAIL.red};line-height:1;">⌞</td>
<td align="right" style="font-family:${EMAIL.fontStack};font-size:10px;color:${EMAIL.red};line-height:1;">⌟</td></tr></table>`;
}

function crosshairMark(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="width:24px;height:24px;">
<tr><td align="center" valign="middle" style="border:1px solid ${EMAIL.red};font-size:8px;color:${EMAIL.red};font-weight:700;">+</td></tr></table>`;
}

function credentialGridBg(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="padding:0;height:6px;background:repeating-linear-gradient(90deg,#1a1a1a 0,#1a1a1a 8px,#141414 8px,#141414 16px);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:0;height:1px;background:#222;font-size:0;">&nbsp;</td></tr></table>`;
}

function waveformBand(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
${[40, 55, 35, 60, 45, 50, 38].map((h) => `<td style="width:14.28%;height:${h}px;border-bottom:1px solid #222;background:linear-gradient(180deg,#0f0f0f 0%,#111 100%);font-size:0;">&nbsp;</td>`).join('')}
</tr></table>`;
}

function heroCredentialPass(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="width:100%;">
<tr><td align="center" style="padding:4px 0 2px;">
<span class="access-glyph-desktop" style="display:block;">${accessGlyph('md')}</span>
<span class="access-glyph-mobile" style="display:none;">${accessGlyph('sm')}</span>
</td></tr>
<tr><td align="center">${microLabel('DIGITAL CREDENTIAL', 'dark')}</td></tr>
<tr><td align="center" style="padding-top:2px;">${technicalAnnotation('INDEX 00 · SECURE PASS')}</td></tr>
</table>`;
}

function heroStatement(headline: string, subheadline?: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:6px;">
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL.red};">ACCESS GRANTED</p>
</td></tr>
<tr><td>
<p class="access-hero-xl" style="margin:0;font-family:${EMAIL.fontStack};font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;color:${EMAIL.white};">${esc(headline)}</p>
</td></tr>
${subheadline ? `<tr><td style="padding-top:8px;"><p class="access-hero-sub" style="margin:0;font-family:${EMAIL.fontStack};font-size:9px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:#888;">${esc(subheadline)}</p></td></tr>` : ''}
</table>`;
}

function digitalCredentialPanel(params: {
  memberId: string;
  issued: string;
  statusLabel: string;
  qrImg: string;
}): string {
  const { memberId, issued, statusLabel, qrImg } = params;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #333;">
<tr><td style="padding:0;">${credentialGridBg()}</td></tr>
<tr><td style="padding:8px 14px 4px;border-bottom:1px solid #2a2a2a;">
<table role="presentation" width="100%"><tr>
<td style="font-family:${EMAIL.fontStack};font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.red};">CREDENTIAL • INDEX 00</td>
<td align="right">${crosshairMark()}</td>
</tr></table>
</td></tr>
<tr><td style="padding:0;">${waveformBand()}</td></tr>
<tr><td class="access-cred-panel" style="padding:16px 18px 18px;">
<table role="presentation" width="100%"><tr>
<td class="access-cred-left" valign="top" width="55%" style="padding-right:14px;">
${microLabel('MEMBER ID', 'dark')}
<p class="access-member-id" style="margin:0 0 14px;font-family:${EMAIL.fontStack};font-size:24px;font-weight:800;color:${EMAIL.red};letter-spacing:0.04em;">${memberId}</p>
${microLabel('ISSUED', 'dark')}
<p class="access-issued-gap" style="margin:0 0 14px;font-family:${EMAIL.fontStack};font-size:10px;color:#ccc;letter-spacing:0.06em;">${issued}</p>
${microLabel('STATUS', 'dark')}
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;color:${EMAIL.green};letter-spacing:0.1em;text-transform:uppercase;">${statusLabel}</p>
</td>
<td class="access-cred-qr" valign="top" align="center" width="45%" style="border-left:1px solid #2a2a2a;padding-left:14px;">
${qrImg}
<p style="margin:8px 0 0;font-family:${EMAIL.fontStack};font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.white};text-align:center;">SCAN TO ACCESS</p>
<p style="margin:4px 0 0;font-family:${EMAIL.fontStack};font-size:7px;line-height:12px;letter-spacing:0.1em;text-transform:uppercase;color:#666;text-align:center;">THIS LINK EXPIRES<br/>AFTER ONE USE.</p>
</td>
</tr></table>
</td></tr></table>`;
}

type SecurityModule = { icon: string; title: string; copy: string };

const SECURITY_MODULES: SecurityModule[] = [
  { icon: '◆', title: 'SECURE LINK', copy: 'End-to-end encrypted' },
  { icon: '◷', title: 'ONE-TIME USE', copy: 'This link can only be used once' },
  { icon: '◎', title: 'VERIFIED DEVICE', copy: 'Access validated at entry' },
  { icon: '▣', title: 'CONTROLLED ENTRY', copy: 'Protected environment for creators' },
];

function securityModuleCell(m: SecurityModule, width: string): string {
  return `<td valign="top" align="center" width="${width}" style="padding:14px 8px;border-top:2px solid ${EMAIL.red};border-left:1px solid #222;">
<p style="margin:0 0 6px;font-family:${EMAIL.fontStack};font-size:16px;color:${EMAIL.red};line-height:1;">${m.icon}</p>
<p style="margin:0 0 4px;font-family:${EMAIL.fontStack};font-size:8px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL.white};">${m.title}</p>
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:7px;line-height:11px;letter-spacing:0.04em;color:#888;">${m.copy}</p>
</td>`;
}

function securityFeatureStrip(): string {
  const desktopRow = `<tr class="access-sec-4col">${SECURITY_MODULES.map((m) => securityModuleCell(m, '25%')).join('')}</tr>`;
  const mobileRows = `<table role="presentation" class="access-sec-2x2" width="100%" cellpadding="0" cellspacing="0" style="display:none;background:#0a0a0a;border:1px solid #222;">
<tr>${securityModuleCell(SECURITY_MODULES[0], '50%')}${securityModuleCell(SECURITY_MODULES[1], '50%')}</tr>
<tr>${securityModuleCell(SECURITY_MODULES[2], '50%')}${securityModuleCell(SECURITY_MODULES[3], '50%')}</tr>
</table>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;background:#0a0a0a;border:1px solid #222;">${desktopRow}</table>${mobileRows}`;
}

function accessCTA(label: string, url: string): string {
  return `<tr><td class="pad access-cta" style="padding:8px 36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="cta-cell" align="center" style="background:${EMAIL.red};border:1px solid #cc1519;">
<a href="${esc(url)}" style="display:block;padding:18px 24px;font-family:${EMAIL.fontStack};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.white};text-decoration:none;">${esc(label)}</a>
</td></tr></table></td></tr>`;
}

function accessSecurityFooter(): string {
  return `<tr><td class="pad" style="padding:0 36px;">${redRule()}</td></tr>
<tr><td class="pad" style="padding:16px 36px 24px;font-family:${EMAIL.fontStack};">
<table role="presentation" width="100%"><tr>
<td class="access-footer-left" width="34%" valign="top" style="padding-right:8px;">
<p style="margin:0;font-size:8px;line-height:14px;letter-spacing:0.08em;text-transform:uppercase;color:#888;">SITE 00 IS AN OPERATING SYSTEM<br/>FOR CREATORS, BRANDS &amp; PRODUCTS.</p>
</td>
<td class="access-footer-center" width="32%" align="center" valign="middle" style="padding:0 6px;">
<table role="presentation" class="access-footer-box" align="center" cellpadding="0" cellspacing="0" style="border:1px solid #333;">
<tr><td style="padding:8px 12px;text-align:center;">
<p style="margin:0;font-family:${EMAIL.fontStack};font-size:22px;font-weight:800;color:${EMAIL.white};">00</p>
<p style="margin:4px 0 0;font-family:${EMAIL.fontStack};font-size:9px;font-weight:700;letter-spacing:0.14em;color:${EMAIL.red};">SITE 00</p>
</td></tr></table>
</td>
<td class="access-footer-right" width="34%" align="right" valign="top" style="padding-left:8px;">
<p style="margin:0;font-size:8px;line-height:14px;letter-spacing:0.1em;text-transform:uppercase;color:#888;text-align:right;">${EMAIL.footerTagline}</p>
<p style="margin:8px 0 0;font-size:8px;letter-spacing:0.08em;text-align:right;">
<a href="https://site00.com" style="color:#888;text-decoration:none;">SITE00.COM</a><br/>
<a href="https://site00.com/support" style="color:#888;text-decoration:none;">SUPPORT</a> ·
<a href="https://site00.com/privacy" style="color:#888;text-decoration:none;">PRIVACY</a>
</p>
</td></tr></table>
<p style="margin:12px 0 0;text-align:center;font-family:${EMAIL.fontStack};font-size:7px;letter-spacing:0.12em;color:#555;">00.000° · 00.000° · 00.000°</p>
</td></tr>`;
}

function terminalOuterFrame(innerRows: string): string {
  return `<table role="presentation" width="100%" style="background:${EMAIL.black};"><tr><td align="center" style="padding:16px 10px 20px;">
<table role="presentation" class="email-wrap access-terminal" width="${EMAIL.maxWidth}" style="background:${EMAIL.black};border:1px solid #2a2a2a;">
<tr><td style="padding:8px 12px 0;">${cornerBrackets()}</td></tr>
${innerRows}
<tr><td style="padding:0 12px 8px;">${cornerBrackets()}</td></tr>
</table></td></tr></table>`;
}

/** Inject Family 01 composition-preserving mobile CSS into email document shell. */
export function injectAccessSecurityMobileStyles(doc: string): string {
  return doc.replace(
    '@media only screen and (max-width:620px){',
    `@media only screen and (max-width:620px){
${ACCESS_SECURITY_MOBILE_STYLES.replace('@media only screen and (max-width:620px){', '').replace(/}$/, '')}`,
  );
}

/** Full ACCESS / SECURITY reference-fidelity email */
export function renderAccessSecurityReferenceEmail(
  input: AccessSecurityRenderInput,
  subject: string,
  preheader: string,
): string {
  const v = input.vars;
  const memberId = esc(v.memberId ?? '00-0147');
  const issued = esc(v.issuedDate ?? v.timestamp ?? '—');
  const status = esc(v.statusLabel ?? 'AUTHORIZED');
  const category = input.headerCategory ?? 'SECURITY · CONTROL';

  const inner = `${systemHeader('ACCESS', 'dark', category)}
<tr><td class="pad" style="padding:0 36px 14px;">${redRule()}</td></tr>
<tr><td class="pad" style="padding:4px 36px 16px;"><table role="presentation" width="100%"><tr>
<td class="access-hero-left" width="32%" valign="middle" align="center">${heroCredentialPass()}</td>
<td class="access-hero-right" width="68%" valign="middle" style="padding-left:16px;">${heroStatement(input.headline, input.subheadline)}</td>
</tr></table></td></tr>
<tr><td class="pad" style="padding:0 36px 12px;">${digitalCredentialPanel({ memberId, issued, statusLabel: status, qrImg: qrImg(input.qrDataUrl) })}</td></tr>
${accessCTA(input.ctaLabel, input.ctaUrl)}
<tr><td class="pad" style="padding:0 36px 8px;">${securityFeatureStrip()}</td></tr>
${accessSecurityFooter()}`;

  const body = terminalOuterFrame(inner);
  const doc = emailDoc({ title: subject, preheader, bg: EMAIL.black, body });
  return injectAccessSecurityMobileStyles(doc);
}
