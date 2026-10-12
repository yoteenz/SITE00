/**
 * FNDATN-01 email HTML primitives. Table layout, inline styles, live text, no JavaScript.
 * Every dynamic string passes through `esc` or `href`.
 */

export const T = {
  ink: '#111111',
  body: '#2a2a2a',
  mute: '#7a766f',
  faint: '#a39f97',
  red: '#ce1017',
  paper: '#f4f2ee',
  line: '#dcd8d0',
  white: '#ffffff',
  marble: '#f6f5f2',
  canvas: 680,
} as const;

export const FONT_BODY = "'Saira Semi Condensed','Arial Narrow',Arial,Helvetica,sans-serif";
/** Heavy traced specimen. Headers and editorial numbers. Body stays Saira. */
export const FONT_DISPLAY = "'SITE 00 Display','Arial Narrow',Arial,Helvetica,sans-serif";

export function esc(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Only absolute https links are allowed into an email. */
export function href(url: string): string {
  if (!/^https:\/\/[^\s"'<>]+$/i.test(url)) throw new Error(`FNDATN-01 refuses non-https link: ${url}`);
  return esc(url);
}

/** Personalized value marker (studio counts `.v`). */
export function v(value: string | number): string {
  return `<span class="v">${esc(value)}</span>`;
}

export type AssetResolver = (rel: string) => string;

export function assetResolver(assetBase: string, root: string): AssetResolver {
  const base = assetBase.replace(/\/$/, '');
  return (rel: string) => esc(`${base}${root}/${rel.replace(/^\//, '')}`);
}

export function fontFaces(assetBase: string, fndatnRoot: string): string {
  const base = assetBase.replace(/\/$/, '');
  const saira = [300, 400, 500, 600, 700]
    .map(
      (w) =>
        `@font-face{font-family:'Saira Semi Condensed';font-style:normal;font-weight:${w};src:url('${base}${fndatnRoot}/fonts/saira-semi-condensed-latin-${w}.woff2') format('woff2');}`,
    )
    .join('\n');
  const display = [400, 500, 600, 700, 800, 900]
    .map(
      (w) =>
        `@font-face{font-family:'SITE 00 Display';font-style:normal;font-weight:${w};src:url('${base}${fndatnRoot}/fonts/site00-correspondence-display.woff2?v=1.3') format('woff2');}`,
    )
    .join('\n');
  return `${saira}\n${display}`;
}

export const BASE_CSS = `
:root{color-scheme:light only;supported-color-schemes:light only}
body{margin:0!important;padding:0!important;background:#ffffff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
td{mso-line-height-rule:exactly}
img{border:0;outline:none;text-decoration:none;display:block;-ms-interpolation-mode:bicubic}
a{text-decoration:none}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
u + #body a{color:inherit;text-decoration:none}
.email{width:100%;max-width:680px;margin:0 auto}
.mob-only{display:none;max-height:0;overflow:hidden;mso-hide:all}
@media screen and (max-width:480px){
  .desk-only{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all}
  .mob-only{display:block!important;max-height:none!important;overflow:visible!important}
  table.mob-only{display:table!important}
  .full{width:100%!important;max-width:100%!important}
  .px{padding-left:20px!important;padding-right:20px!important}
  .stack{display:block!important;width:100%!important;box-sizing:border-box}
  .h-m{font-size:40px!important;line-height:38px!important}
  .btn-m{display:block!important;width:100%!important;box-sizing:border-box;text-align:center!important}
  .hide-m{display:none!important}
  .gap-m{padding-right:9px!important}
  .gap-m .site{font-size:18px!important;line-height:18px!important;letter-spacing:.04em!important}
  .tiny-m span{font-size:6.5px!important;line-height:10px!important;letter-spacing:.12em!important}
  .slash-m{font-size:18px!important;line-height:18px!important;padding-right:6px!important}
  .tiny-m{padding-right:0!important}
  .foot-r{text-align:left!important;padding-top:0!important}
}
[data-ogsc] .keep-ink, [data-ogsb] .keep-ink{color:#111111!important}
[data-ogsc] .keep-red, [data-ogsb] .keep-red{color:#ce1017!important}
`;

export function microLabel(text: string, color: string = T.mute, size = 9): string {
  return `<span style="font-family:${FONT_BODY};font-size:${size}px;line-height:${Math.round(size * 1.45)}px;letter-spacing:.18em;color:${color};text-transform:uppercase">${text}</span>`;
}

/** Period, comma, semicolon, and asterisk are the red marks. The rest of the display line stays ink. */
const RED_DISPLAY = new Set(['.', ',', ';', '*']);

export function displayText(text: string): string {
  let out = '';
  for (const ch of text) {
    const safe = esc(ch);
    out += RED_DISPLAY.has(ch) ? `<span class="keep-red" style="color:${T.red}">${safe}</span>` : safe;
  }
  return out;
}

export function headline(lines: string[], size = 44, extraClass = ''): string {
  const body = lines.map((line) => displayText(line)).join('<br>');
  return `<h1 class="keep-ink ${extraClass}" style="margin:0;font-family:${FONT_DISPLAY};font-weight:900;font-size:${size}px;line-height:${Math.round(size * 1.02)}px;letter-spacing:0;color:${T.ink};text-transform:uppercase;mso-line-height-rule:exactly">${body}<span class="keep-red" style="color:${T.red}">.</span></h1>`;
}

export function sectionTitle(text: string, size = 30): string {
  return `<h2 class="keep-ink" style="margin:0;font-family:${FONT_DISPLAY};font-weight:900;font-size:${size}px;line-height:${Math.round(size * 1.02)}px;letter-spacing:0;color:${T.ink};text-transform:uppercase">${displayText(text)}<span class="keep-red" style="color:${T.red}">.</span></h2>`;
}

export function kicker(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT_BODY};font-size:11px;line-height:14px;letter-spacing:.2em;color:${T.red};font-weight:500;text-transform:uppercase;padding-right:12px" class="keep-red">${text}</td>
<td style="padding-top:1px"><div style="width:44px;height:1px;line-height:1px;font-size:1px;background:${T.red}">&nbsp;</div></td>
</tr></table>`;
}

export function bodyCopy(text: string, size = 12.5, color: string = T.body, extra = '', lineHeight?: number): string {
  const leading = lineHeight ?? Math.round(size * 1.5);
  return `<p style="margin:0;font-family:${FONT_BODY};font-size:${size}px;line-height:${leading}px;letter-spacing:.07em;color:${color};text-transform:uppercase;${extra}">${text}</p>`;
}

export function tagline(lines: string[]): string {
  return `<div style="width:24px;height:1px;line-height:1px;font-size:1px;background:${T.ink};margin:0 0 9px">&nbsp;</div>${bodyCopy(lines.map(esc).join('<br>'), 8.5, T.ink, 'letter-spacing:.2em;font-weight:500;')}`;
}

/** Bulletproof button: VML roundrect for Outlook, padded anchor elsewhere. */
export function button(label: string, url: string, opts: { width?: number; color?: string; mobileColor?: string } = {}): string {
  const width = opts.width ?? 300;
  const color = opts.color ?? T.red;
  const safe = href(url);
  return `<!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safe}" style="height:46px;v-text-anchor:middle;width:${width}px;" stroke="f" fillcolor="${color}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;font-weight:bold;">${esc(label)} &rarr;</center></v:rect><![endif]--><!--[if !mso]><!--><a class="btn-m${opts.mobileColor ? ' btn-alt' : ''}" href="${safe}" target="_blank" rel="noopener" style="display:inline-block;width:${width}px;max-width:100%;box-sizing:border-box;background:${color};color:#ffffff;font-family:${FONT_BODY};font-size:12px;line-height:16px;font-weight:600;letter-spacing:.16em;text-align:center;text-transform:uppercase;white-space:nowrap;padding:15px 10px">${esc(label)}&nbsp;&nbsp;&rarr;</a><!--<![endif]-->`;
}

export function caption(text: string, align = 'center'): string {
  return `<p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:9.5px;line-height:14px;letter-spacing:.16em;color:${T.mute};text-transform:uppercase;text-align:${align}">${text}</p>`;
}

export function img(src: string, alt: string, width: number, height: number | null, extra = ''): string {
  const h = height ? ` height="${height}"` : '';
  const hs = height ? `height:${height}px;` : 'height:auto;';
  return `<img src="${src}" alt="${esc(alt)}" width="${width}"${h} style="display:block;width:${width}px;${hs}max-width:100%;border:0;${extra}">`;
}

export function icon(src: string, alt: string, size = 22): string {
  return `<img src="${src}" alt="${esc(alt)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border:0">`;
}

/** Background-image cell with VML fallback for Outlook. Content renders as live HTML on top. */
export function bgCell(opts: { src: string; width: number; height: number; fallback: string; position?: string; content: string; className?: string }): string {
  const pos = opts.position ?? 'center center';
  return `<td class="${opts.className ?? ''}" background="${opts.src}" bgcolor="${opts.fallback}" width="${opts.width}" height="${opts.height}" valign="top" style="background-color:${opts.fallback};background-image:url('${opts.src}');background-size:cover;background-position:${pos};background-repeat:no-repeat;height:${opts.height}px">
<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${opts.width}px;height:${opts.height}px;"><v:fill type="frame" src="${opts.src}" color="${opts.fallback}" /><v:textbox inset="0,0,0,0"><![endif]-->
${opts.content}
<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
</td>`;
}

export function vrule(height: number, color: string = T.line): string {
  return `<div style="width:1px;height:${height}px;background:${color};line-height:1px;font-size:1px">&nbsp;</div>`;
}

export function mobileOnly(html: string): string {
  return `<!--[if !mso]><!-->${html}<!--<![endif]-->`;
}

export const SITE_WORD = (size = 26) =>
  `<span class="keep-ink site" style="font-family:${FONT_DISPLAY};font-weight:600;font-size:${size}px;line-height:${size}px;letter-spacing:.04em;color:${T.ink}">SITE&nbsp;00</span>`;
