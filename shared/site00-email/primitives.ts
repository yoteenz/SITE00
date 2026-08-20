import { EMAIL } from './tokens.js';
import type { EmailClassification, EmailTemplateVars, EmailTheme } from './types.js';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emailDocument(params: {
  title: string;
  preheader: string;
  theme: EmailTheme;
  body: string;
}): string {
  const bg = params.theme === 'dark' ? EMAIL.black : EMAIL.light;
  const preheader = esc(params.preheader);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${esc(params.title)}</title>
  <style type="text/css">
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-col { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .headline { font-size: 28px !important; line-height: 32px !important; }
      .cta-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bg};">
  <div style="display:none;font-size:1px;color:${bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
  ${params.body}
</body>
</html>`;
}

export function emailOuterTable(content: string, theme: EmailTheme): string {
  const bg = theme === 'dark' ? EMAIL.black : EMAIL.light;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" class="email-container" width="${EMAIL.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width:${EMAIL.maxWidth}px;width:100%;">
      ${content}
    </table>
  </td></tr>
</table>`;
}

export function emailHeader(params: { familyLabel: string; theme: EmailTheme }): string {
  const sub = EMAIL.stone;
  return `<tr><td class="mobile-pad" style="padding:28px 32px 12px;font-family:${EMAIL.fontStack};">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${sub};">SITE 00 <span style="color:${EMAIL.red};">◆</span> ${esc(params.familyLabel)}</p>
  </td></tr>`;
}

export function emailHeadlineBlock(params: {
  accentScript?: string;
  headline: string;
  subheadline?: string;
  theme: EmailTheme;
}): string {
  const text = params.theme === 'dark' ? EMAIL.white : EMAIL.black;
  const sub = params.theme === 'dark' ? '#B3B3B3' : EMAIL.stone;
  const accent = params.accentScript
    ? `<p style="margin:0 0 8px;font-family:${EMAIL.scriptAccent};font-size:22px;font-style:italic;color:${EMAIL.red};">${esc(params.accentScript)}</p>`
    : '';
  const subBlock = params.subheadline
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:18px;letter-spacing:0.08em;text-transform:uppercase;color:${sub};">${esc(params.subheadline)}</p>`
    : '';
  return `<tr><td class="mobile-pad" style="padding:8px 32px 20px;font-family:${EMAIL.fontStack};">
    ${accent}
    <h1 class="headline" style="margin:0;font-size:34px;line-height:38px;font-weight:700;letter-spacing:-0.02em;text-transform:uppercase;color:${text};">${esc(params.headline)}</h1>
    ${subBlock}
  </td></tr>`;
}

export function emailDataGrid(fields: Array<{ label: string; value: string }>, theme: EmailTheme): string {
  if (!fields.length) return '';
  const cardBg = theme === 'dark' ? '#141414' : EMAIL.white;
  const border = theme === 'dark' ? '#2A2A2A' : EMAIL.border;
  const labelColor = EMAIL.stone;
  const valueColor = theme === 'dark' ? EMAIL.white : EMAIL.black;
  const rows = fields
    .map(
      (f) => `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid ${border};font-family:${EMAIL.monoStack};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${labelColor};width:38%;">${esc(f.label)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid ${border};font-family:${EMAIL.fontStack};font-size:13px;color:${valueColor};">${esc(f.value)}</td>
      </tr>`,
    )
    .join('');
  return `<tr><td class="mobile-pad" style="padding:0 32px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cardBg};border:1px solid ${border};">
      ${rows}
    </table>
  </td></tr>`;
}

export function emailBodyLines(lines: string[], theme: EmailTheme): string {
  if (!lines.length) return '';
  const color = theme === 'dark' ? '#D9D9D9' : '#333333';
  const items = lines.map((l) => `<p style="margin:0 0 10px;font-family:${EMAIL.fontStack};font-size:14px;line-height:22px;color:${color};">${esc(l)}</p>`).join('');
  return `<tr><td class="mobile-pad" style="padding:0 32px 16px;">${items}</td></tr>`;
}

export function emailInputList(items: string[], theme: EmailTheme): string {
  if (!items.length) return '';
  const color = theme === 'dark' ? EMAIL.white : EMAIL.black;
  const rows = items
    .map(
      (item, i) => `<tr><td style="padding:12px 16px;border-bottom:1px solid ${theme === 'dark' ? '#2A2A2A' : EMAIL.border};font-family:${EMAIL.fontStack};font-size:13px;color:${color};">
        <span style="color:${EMAIL.red};font-family:${EMAIL.monoStack};font-size:11px;">${String(i + 1).padStart(2, '0')}</span> &nbsp; ${esc(item)}
      </td></tr>`,
    )
    .join('');
  return `<tr><td class="mobile-pad" style="padding:0 32px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${theme === 'dark' ? '#2A2A2A' : EMAIL.border};background:${theme === 'dark' ? '#141414' : EMAIL.white};">${rows}</table>
  </td></tr>`;
}

export function emailCredentialCard(vars: EmailTemplateVars, theme: EmailTheme): string {
  const bg = theme === 'dark' ? '#111111' : EMAIL.white;
  const initials = esc(vars.clientInitials ?? 'NK');
  const memberId = esc(vars.memberId ?? '00-0001');
  const issued = esc(vars.issuedDate ?? vars.timestamp ?? '—');
  const status = esc(vars.statusLabel ?? 'AUTHORIZED');
  return `<tr><td class="mobile-pad" style="padding:0 32px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:2px solid ${EMAIL.red};">
      <tr><td style="padding:24px;text-align:center;">
        <div style="width:72px;height:72px;margin:0 auto 16px;border:2px solid ${EMAIL.red};border-radius:50%;line-height:72px;font-family:${EMAIL.fontStack};font-size:24px;font-weight:700;color:${theme === 'dark' ? EMAIL.white : EMAIL.black};">${initials}</div>
        <p style="margin:0 0 4px;font-family:${EMAIL.monoStack};font-size:11px;letter-spacing:0.12em;color:${EMAIL.stone};">SITE 00 ACCESS</p>
        <p style="margin:0 0 16px;font-family:${EMAIL.monoStack};font-size:18px;color:${EMAIL.red};">${memberId}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px;font-family:${EMAIL.monoStack};font-size:10px;text-transform:uppercase;color:${EMAIL.stone};">ISSUED</td>
            <td style="padding:8px;font-family:${EMAIL.monoStack};font-size:10px;text-transform:uppercase;color:${EMAIL.stone};">STATUS</td>
          </tr>
          <tr>
            <td style="padding:8px;font-family:${EMAIL.fontStack};font-size:12px;color:${theme === 'dark' ? EMAIL.white : EMAIL.black};">${issued}</td>
            <td style="padding:8px;font-family:${EMAIL.fontStack};font-size:12px;color:${EMAIL.green};">${status}</td>
          </tr>
        </table>
        <div style="margin:20px auto 0;width:80px;height:80px;border:1px dashed ${EMAIL.stone};display:inline-block;position:relative;">
          <div style="position:absolute;inset:12px;border:1px solid ${EMAIL.red};opacity:0.35;"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:${EMAIL.monoStack};font-size:9px;color:${EMAIL.stone};">CODE</div>
        </div>
        <p style="margin:12px 0 0;font-size:9px;color:${EMAIL.stone};font-family:${EMAIL.monoStack};">DECORATIVE CREDENTIAL MARK — NOT A SECURITY TOKEN</p>
      </td></tr>
    </table>
  </td></tr>`;
}

export function emailGraphicBlock(params: { label: string; theme: EmailTheme; variant?: 'target' | 'portal' | 'artifact' | 'radar' }): string {
  const stroke = EMAIL.red;
  const bg = params.theme === 'dark' ? '#111' : EMAIL.light;
  let inner = `<circle cx="80" cy="80" r="60" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.4"/>
    <circle cx="80" cy="80" r="40" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.6"/>
    <circle cx="80" cy="80" r="8" fill="${stroke}"/>`;
  if (params.variant === 'portal') {
    inner = `<rect x="30" y="40" width="100" height="80" fill="none" stroke="${stroke}" stroke-width="2"/>
      <text x="80" y="88" text-anchor="middle" fill="${stroke}" font-size="24" font-family="monospace">00</text>`;
  }
  if (params.variant === 'artifact') {
    inner = `<polygon points="80,20 130,55 110,120 50,120 30,55" fill="none" stroke="${stroke}" stroke-width="2"/>
      <text x="80" y="88" text-anchor="middle" fill="${stroke}" font-size="20">✓</text>`;
  }
  if (params.variant === 'radar') {
    inner = `<circle cx="80" cy="80" r="55" fill="none" stroke="${stroke}" stroke-width="1"/>
      <line x1="80" y1="25" x2="80" y2="135" stroke="${stroke}" stroke-width="1" opacity="0.5"/>
      <line x1="25" y1="80" x2="135" y2="80" stroke="${stroke}" stroke-width="1" opacity="0.5"/>`;
  }
  return `<tr><td class="mobile-pad" style="padding:0 32px 20px;text-align:center;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:${bg};padding:20px;">
      <img src="data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>${inner}</svg>`)}" width="160" height="160" alt="${esc(params.label)}" style="margin:0 auto;" />
    </td></tr></table>
  </td></tr>`;
}

export function emailCTA(label: string, url: string, _theme: EmailTheme, variant: 'red' | 'black' | 'white' = 'red'): string {
  let bg: string = EMAIL.red;
  let color: string = EMAIL.white;
  if (variant === 'black') {
    bg = EMAIL.black;
    color = EMAIL.white;
  }
  if (variant === 'white') {
    bg = EMAIL.white;
    color = EMAIL.black;
  }
  const safeUrl = esc(url || '#');
  return `<tr><td class="mobile-pad" style="padding:8px 32px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td class="cta-btn" align="center" style="background:${bg};border-radius:0;">
      <a href="${safeUrl}" style="display:inline-block;padding:16px 32px;font-family:${EMAIL.fontStack};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${color};">${esc(label)}</a>
    </td></tr></table>
  </td></tr>`;
}

export function emailFooter(classification: EmailClassification, theme: EmailTheme): string {
  const text = theme === 'dark' ? EMAIL.stone : EMAIL.stone;
  const line = theme === 'dark' ? '#2A2A2A' : EMAIL.border;
  const unsub =
    classification === 'marketing'
      ? `<p style="margin:8px 0 0;font-size:10px;color:${text};"><a href="#" style="color:${text};text-decoration:underline;">UNSUBSCRIBE</a> · <a href="#" style="color:${text};text-decoration:underline;">PREFERENCES</a></p>`
      : '';
  return `<tr><td class="mobile-pad" style="padding:24px 32px 32px;border-top:1px solid ${line};font-family:${EMAIL.fontStack};text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${text};">SITE 00 <span style="color:${EMAIL.red};">◆</span></p>
    <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${text};">${EMAIL.footerTagline}</p>
    <p style="margin:12px 0 0;font-size:9px;color:${text};"><a href="https://site00.com" style="color:${text};">SITE00.COM</a> · SUPPORT · PRIVACY</p>
    ${unsub}
  </td></tr>`;
}

export function emailSignalModules(modules: Array<{ num: string; title: string; excerpt: string }>): string {
  const rows = modules
    .map(
      (m) => `<tr><td style="padding:16px 0;border-bottom:1px solid ${EMAIL.border};">
        <p style="margin:0 0 4px;font-family:${EMAIL.monoStack};font-size:10px;color:${EMAIL.red};">${esc(m.num)}</p>
        <p style="margin:0 0 6px;font-family:${EMAIL.fontStack};font-size:14px;font-weight:700;text-transform:uppercase;color:${EMAIL.black};">${esc(m.title)}</p>
        <p style="margin:0;font-family:${EMAIL.fontStack};font-size:13px;line-height:20px;color:#444;">${esc(m.excerpt)}</p>
      </td></tr>`,
    )
    .join('');
  return `<tr><td class="mobile-pad" style="padding:0 32px 20px;"><table role="presentation" width="100%">${rows}</table></td></tr>`;
}

export { esc };
