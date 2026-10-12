/** FNDATN-01 shared composition parts. Each email arranges these differently; see emails.ts. */
import {
  BASE_CSS,
  FONT_BODY,
  FONT_DISPLAY,
  SITE_WORD,
  T,
  bgCell,
  bodyCopy,
  button,
  caption,
  esc,
  fontFaces,
  headline,
  icon,
  img,
  kicker,
  microLabel,
  mobileOnly,
  sectionTitle,
  tagline,
  vrule,
  type AssetResolver,
} from './html.js';
import { coverMap, type CardLayer } from './cards.js';

export type DocumentOpts = {
  title: string;
  preheader: string;
  assetBase: string;
  root: string;
  inbox: string | null;
  label: string;
  blocks: string[];
};

export function documentHtml(o: DocumentOpts): string {
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(o.title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>table,td,div,h1,h2,p,a,span{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]-->
<style>
${fontFaces(o.assetBase, o.root)}
${BASE_CSS}
</style>
</head>
<body id="body" style="margin:0;padding:0;background:#ffffff;word-spacing:normal">
${o.inbox ?? ''}
<div class="email" role="article" aria-roledescription="email" aria-label="${esc(o.label)}" lang="en" style="width:100%;max-width:680px;margin:0 auto;background:#ffffff">
${o.blocks.join('\n')}
</div>
</body>
</html>
`;
}

export function inboxBlock(from: string, subject: string, preheader: string, note: string): string {
  return `<div class="inbox" style="display:none">
<div class="from">${esc(from)}</div>
<div class="subj">${subject}</div>
<div class="pre">${esc(preheader)}</div>
<div class="note">${esc(note)}</div>
</div>`;
}

const PREHEADER_PAD = '&#847;&zwnj;&nbsp;'.repeat(24);

export function mast(opts: { preheader: string; line1: string; line2: string; mobileLine2?: string }): string {
  const list = ['IDEAS', 'SYSTEMS', 'FOUNDATIONS', 'REALITY'].join('<br>');
  return `<table class="mast" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff">
<tr><td style="padding:0">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff">${esc(opts.preheader)}${PREHEADER_PAD}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="px" valign="middle" style="padding:14px 0 13px 28px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="gap-m" style="padding-right:14px;white-space:nowrap">${SITE_WORD(22)}</td>
<td valign="middle" class="gap-m" style="padding-right:14px">${vrule(24, '#3a3a3a')}</td>
<td valign="middle" class="tiny-m" style="white-space:nowrap">${microLabel(esc(opts.line1), T.ink, 8.5)}<br>${microLabel(esc(opts.line2), T.faint, 8.5)}</td>
</tr></table>
</td>
<td class="px" valign="middle" align="right" style="padding:11px 28px 11px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="keep-red slash-m" style="padding-right:12px;font-family:${FONT_BODY};font-weight:300;font-size:22px;line-height:22px;color:${T.red};font-style:italic;letter-spacing:-.08em">//</td>
<td valign="middle" class="tiny-m" style="padding-right:22px">${microLabel(list, T.ink, 7)}</td>
<td valign="middle" class="hide-m" style="padding-right:14px">${vrule(28, '#9a968f')}</td>
<td valign="middle" class="hide-m">${microLabel('A CLEARER<br>TOMORROW<br>TOGETHER.', T.faint, 7)}</td>
</tr></table>
</td>
</tr></table>
</td></tr>
</table>`;
}

/** Matches DESKTOP_HERO_HEIGHT in scripts/correspondence-studio/fndatn01/extract_assets.py. */
export const DESKTOP_HERO_HEIGHT = 300;

export type HeroCopy = {
  kicker: string | null;
  headline: string[];
  mobileHeadline?: string[];
  sub?: string;
  body: string;
  mobileBody?: string;
  tagline?: string[];
  /** Mobile tagline line breaks when the authority sets it narrower than desktop. */
  mobileTagline?: string[];
  /** Desktop headline size override when the default would push the hero past its art height. */
  deskSize?: number;
  /** Desktop body measure when the art beside the column (a crystal, a book stack) sits closer than the headline's edge. */
  deskBodyWidth?: number;
  /** The tagline is dropped on desktop where the art behind the column bottom is too busy to read over. */
  deskTagline?: boolean;
};

/** `column` is the live text width; it must end before the hero object in the art. `card` puts the card's live fields back on the paper. */
export function desktopHero(asset: AssetResolver, slug: string, copy: HeroCopy, opts: { column: number; alt: string; card?: CardLayer }): string {
  // A cell's width is its content box; with the 28 px left padding the copy column spans `w`.
  const w = opts.column + 28;
  const card = opts.card
    ? `<td class="hero-card" valign="top" style="padding:${opts.card.top}px 0 0 ${opts.card.left - w}px">${opts.card.html}</td>`
    : '';
  const content = `<table role="presentation" width="${opts.card ? T.canvas : w}" cellpadding="0" cellspacing="0" border="0" align="left" style="width:${opts.card ? T.canvas : w}px"><tr>
<td class="hero-copy" width="${opts.column}" valign="top" style="width:${opts.column}px;max-width:${opts.column}px;padding:${copy.headline.length > 2 ? 20 : 26}px 0 10px 28px">
${copy.kicker ? `${kicker(copy.kicker)}<div style="height:11px;line-height:11px;font-size:1px">&nbsp;</div>` : ''}
${headline(copy.headline, copy.deskSize ?? (copy.headline.length > 2 ? 40 : 46))}
${copy.sub ? `<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div><p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:17px;letter-spacing:.1em;font-weight:600;color:${T.ink};text-transform:uppercase">${copy.sub}</p>` : ''}
<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>
${copy.deskBodyWidth ? `<div style="max-width:${copy.deskBodyWidth}px">${bodyCopy(copy.body, 10.5, T.ink, 'font-weight:500;')}</div>` : bodyCopy(copy.body, 10.5, T.ink, 'font-weight:500;')}
${copy.tagline && copy.deskTagline !== false ? `<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>${tagline(copy.tagline)}` : ''}
</td>${card}
</tr></table>`;
  return `<table class="hero desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%" aria-label="${esc(opts.alt)}">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-desktop.jpg`), width: T.canvas, height: DESKTOP_HERO_HEIGHT, fallback: opts.card ? '#ffffff' : '#ebe8e3', content, position: 'center center', lock: opts.card ? { width: T.canvas, height: DESKTOP_HERO_HEIGHT } : undefined })}</tr>
</table>`;
}

/** Mobile copy sizing. `zone` is the fixed height of the copy row; it ends above the card or object in the art. */
export type MobileCopyFit = {
  zone: number;
  head?: number;
  body?: number;
  textWidth?: number;
  padTop?: number;
  /** Where the authority prints the tagline on mobile: under the body, or beside the card (left of it). */
  tagline?: { at: 'below' } | { at: 'beside-card'; top: number };
};

export function mobileHero(
  asset: AssetResolver,
  slug: string,
  copy: HeroCopy,
  opts: { height: number; alt: string; fit: MobileCopyFit; card?: CardLayer & { artHeight: number } },
): string {
  const lines = copy.mobileHeadline ?? copy.headline;
  const f = opts.fit;
  const body = f.body ?? 10.5;
  // The zone height is on an unpadded cell (padding would add to it); the copy's padding sits inside.
  const copyRow = `<tr><td class="hero-copy" valign="top" height="${f.zone}" style="height:${f.zone}px;padding:0"><div style="padding:${f.padTop ?? 24}px 20px 0 20px">
${copy.kicker ? `${kicker(copy.kicker)}<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div>` : ''}
${headline(lines, f.head ?? (lines.length > 3 ? 36 : 40))}
<div style="height:9px;line-height:9px;font-size:1px">&nbsp;</div>
<div style="max-width:${f.textWidth ?? 240}px">${bodyCopy(copy.mobileBody ?? copy.body, body, T.ink, `line-height:${Math.round(body * 1.42)}px;letter-spacing:.06em;font-weight:500;`)}</div>
${f.tagline?.at === 'below' && copy.tagline ? `<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>${tagline(copy.mobileTagline ?? copy.tagline)}` : ''}
</div></td></tr>`;
  const beside = f.tagline?.at === 'beside-card' && copy.tagline && opts.card ? f.tagline.top : null;
  const cardRow = !opts.card
    ? ''
    : beside != null
      ? `<tr><td style="padding:0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top" width="${opts.card.left - 20}" style="width:${opts.card.left - 20}px;padding:${beside - f.zone}px 0 0 20px">${tagline(copy.mobileTagline ?? copy.tagline!)}</td>
<td class="hero-card" valign="top" style="padding:${opts.card.top - f.zone}px 0 0 0">${opts.card.html}</td>
</tr></table></td></tr>`
      : `<tr><td class="hero-card" valign="top" style="padding:${opts.card.top - f.zone}px 0 0 ${opts.card.left}px">${opts.card.html}</td></tr>`;
  if (!opts.card) {
    const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${copyRow}</table>`;
    return mobileOnly(`<table class="hero mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%" aria-label="${esc(opts.alt)}">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-mobile.jpg`), width: 390, height: opts.height, fallback: '#ebe8e3', position: 'center bottom', content, className: 'full' })}</tr>
</table>`);
  }
  // With a card, the art and its live text are locked together at the 390 px design width (the same
  // geometry `cover` gives at 390): centred on wider phones, left-anchored and cropped on the right
  // (scene only) on narrower ones.
  const m = coverMap(opts.card.artHeight, opts.height);
  const content = `<table role="presentation" width="390" cellpadding="0" cellspacing="0" border="0" style="width:390px">${copyRow}${cardRow}</table>`;
  return mobileOnly(`<table class="hero mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;table-layout:fixed" aria-label="${esc(opts.alt)}">
<tr><td align="center" style="padding:0;overflow:hidden"><div style="width:100%;overflow:hidden">
<table class="hero-lock" role="presentation" width="390" cellpadding="0" cellspacing="0" border="0" style="width:390px;margin:0 auto">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-mobile.jpg`), width: 390, height: opts.height, fallback: '#ffffff', content, lock: { width: Math.round(390 * m.k * 10) / 10, height: opts.height, x: -Math.round(m.ox * 10) / 10 } })}</tr>
</table>
</div></td></tr>
</table>`);
}

export type BandItem = { n: string; icon: string; iconAlt: string; title: string; text: string; tone?: 'muted' };

export function deskBand(asset: AssetResolver, title: string, items: BandItem[], opts: { titleWidth?: number; side?: string; sideLeft?: string } = {}): string {
  const tw = opts.titleWidth ?? 190;
  const cols = items
    .map(
      (it) => `<td valign="top" style="padding:22px 12px 22px 14px;border-left:1px solid ${T.line}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="keep-red" style="padding-right:12px;font-family:${FONT_DISPLAY};font-weight:600;font-size:21px;line-height:22px;color:${it.tone === 'muted' ? T.faint : T.red}">${esc(it.n)}</td>
<td valign="middle">${icon(asset(`assets/icons/${it.icon}.png`), it.iconAlt, 20)}</td>
</tr></table>
<div style="height:9px;line-height:9px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-family:${FONT_BODY};font-size:10.5px;line-height:14px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${it.title}</p>
<div style="height:5px;line-height:5px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-family:${FONT_BODY};font-size:9px;line-height:13px;letter-spacing:.12em;color:${T.mute};text-transform:uppercase">${it.text}</p>
</td>`,
    )
    .join('');
  const side = opts.side
    ? `<td valign="middle" width="96" style="width:96px;padding:0 0 0 14px;border-left:1px solid ${T.line}">${microLabel(opts.side, T.mute, 7.5)}</td>`
    : '';
  const sideLeft = opts.sideLeft ? `<td valign="middle" width="92" style="width:92px;padding:0 14px 0 0">${microLabel(opts.sideLeft, T.mute, 7.5)}</td>` : '';
  return `<table class="walk desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%">
<tr>${bgCell({
    src: asset('assets/shared/marble-band.jpg'),
    width: T.canvas,
    height: 150,
    fallback: T.marble,
    content: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 0 0 24px" width="${tw + (opts.sideLeft ? 92 : 0)}" valign="middle"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${sideLeft}<td valign="middle" style="width:${tw}px">${sectionTitle(title, 30)}</td></tr></table></td>
${cols}
${side}
<td width="12" style="width:12px;font-size:1px">&nbsp;</td>
</tr></table>`,
  })}</tr>
</table>`;
}

export function mobileRows(
  asset: AssetResolver,
  title: string,
  items: BandItem[],
  opts: { aside?: string; status?: (it: BandItem, i: number) => string } = {},
): string {
  const rows = items
    .map(
      (
        it,
        i,
      ) => `<tr><td style="padding:0 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:${i === 0 ? 0 : 1}px solid ${T.line}"><tr>
<td width="34" valign="middle" class="keep-red" style="width:34px;padding:12px 0;font-family:${FONT_DISPLAY};font-weight:600;font-size:22px;line-height:22px;color:${it.tone === 'muted' ? T.faint : T.red}">${esc(it.n)}</td>
<td width="44" valign="middle" style="width:44px;padding:12px 0">${icon(asset(`assets/icons/${it.icon}.png`), it.iconAlt, 22)}</td>
<td width="1" valign="middle" style="padding:12px 12px 12px 0">${vrule(30)}</td>
<td valign="middle" style="padding:12px 0">
<p style="margin:0;font-family:${FONT_BODY};font-size:11px;line-height:15px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${it.title}</p>
<p style="margin:3px 0 0;font-family:${FONT_BODY};font-size:9.5px;line-height:13px;letter-spacing:.1em;color:${T.mute};text-transform:uppercase">${it.text}</p>
</td>
${opts.status ? `<td valign="middle" align="left" width="96" style="width:96px;padding:12px 0 12px 12px;border-left:1px solid ${T.line}">${opts.status(it, i)}</td>` : ''}
</tr></table></td></tr>`,
    )
    .join('');
  const aside = opts.aside
    ? `<td valign="middle" align="left" width="120" style="width:120px;padding-left:14px;border-left:1px solid ${T.line}">${microLabel(opts.aside, T.ink, 7.5)}</td>`
    : '';
  return mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:${T.white}">
<tr><td style="padding:24px 20px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${sectionTitle(title, 30)}</td>${aside}</tr></table></td></tr>
${rows}
<tr><td style="height:10px;line-height:10px;font-size:1px">&nbsp;</td></tr>
</table>`);
}

export function deskAct(
  asset: AssetResolver,
  slug: string,
  cta: { label: string; url: string; caption: string },
  strips: { left?: string; right?: string; leftAlt?: string; rightAlt?: string },
): string {
  const side = (file: string | undefined, alt: string | undefined) =>
    file
      ? `<td width="150" valign="middle" style="width:150px">${img(asset(`assets/${slug}/${file}`), alt ?? '', 150, 96, 'object-fit:cover;')}</td>`
      : '<td width="150" style="width:150px">&nbsp;</td>';
  return `<table class="act desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff">
<tr>
${side(strips.left, strips.leftAlt)}
<td valign="middle" align="center" style="padding:14px 10px">${button(cta.label, cta.url, { width: 350 })}${caption(cta.caption)}</td>
${side(strips.right, strips.rightAlt)}
</tr>
</table>`;
}

export function mobileAct(cta: { label: string; url: string; caption: string }, opts: { color?: string } = {}): string {
  return mobileOnly(`<table class="act mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:18px 20px 20px" align="center">${button(cta.label, cta.url, { width: 350, color: opts.color })}${caption(cta.caption)}</td></tr>
</table>`);
}

export function mobileStrip(asset: AssetResolver, slug: string, file: string, alt: string, height: number): string {
  return mobileOnly(`<table class="rest mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%">
<tr><td>${img(asset(`assets/${slug}/${file}`), alt, 390, height, 'width:100%;height:auto;')}</td></tr>
</table>`);
}

export function foot(line1 = 'DIGITAL FOUNDATION', line2 = "BRANDS BUILT FOR WHAT'S NEXT."): string {
  return `<table class="foot" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border-top:1px solid #e7e4de">
<tr>
<td class="px stack" valign="middle" style="padding:14px 0 15px 28px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:14px;white-space:nowrap">${SITE_WORD(16)}</td>
<td valign="middle" style="padding-right:12px">${vrule(22, '#3a3a3a')}</td>
<td valign="middle" style="white-space:nowrap">${microLabel(esc(line1), T.ink, 7.5)}<br>${microLabel(esc(line2), T.faint, 7.5)}</td>
</tr></table>
</td>
<td class="px stack foot-r" valign="middle" align="right" style="padding:14px 28px 15px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" class="hide-m" style="padding-right:18px">${vrule(22, '#3a3a3a')}</td>
<td valign="middle">${microLabel('CLASSIFICATION · TRANSACTIONAL<br>SERVICE NOTICE. NO MARKETING UNSUBSCRIBE.', T.faint, 7)}</td>
</tr></table>
</td>
</tr>
</table>`;
}

export const SPACE = (h: number) => `<div style="height:${h}px;line-height:${h}px;font-size:1px">&nbsp;</div>`;
