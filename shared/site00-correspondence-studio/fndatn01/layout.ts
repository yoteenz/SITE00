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
  v,
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

type MicroStyle = { size: number; lh: number; color: string; track: number; weight?: number };

/** One line of masthead / footer microcopy, as its own block so its leading is exact (no 16 px strut). */
function micro(text: string, o: MicroStyle): string {
  return `<div style="font-family:${FONT_BODY};font-size:${o.size}px;line-height:${o.lh}px;mso-line-height-rule:exactly;letter-spacing:${o.track}em;font-weight:${o.weight ?? 500};color:${o.color};text-transform:uppercase;white-space:nowrap"><span>${text}</span></div>`;
}

/** Microcopy lines stacked at a fixed pitch. */
function lines(items: string[], o: MicroStyle): string {
  return items.map((t) => micro(esc(t), o)).join('');
}

/** The masthead's two red architectural strokes. */
function slashes(size: number): string {
  return `<span class="keep-red" style="font-family:${FONT_BODY};font-weight:300;font-size:${size}px;line-height:${size}px;color:${T.red};letter-spacing:-.02em;font-style:italic;white-space:nowrap">//</span>`;
}

const MAST_LIST = ['IDEAS', 'SYSTEMS', 'FOUNDATIONS', 'REALITY'];
const LABEL_GREY = '#8e8a83';

export type MastOpts = {
  preheader: string;
  /** Desktop service label (line 1 ink, line 2 grey). */
  line1: string;
  line2: string;
  /** Mobile label lines when the mobile authority differs from desktop. */
  mobileLines?: string[];
  /** Short rule under A CLEARER TOMORROW TOGETHER (01 and 02 authorities). */
  rule?: boolean;
};

/**
 * Masthead, rebuilt from the authority geometry. Desktop (680): wordmark, divider, service label pair,
 * then red strokes, the four-word list, a divider and the grey A CLEARER TOMORROW TOGETHER, on one
 * centre line. Mobile (390) is its own row: larger wordmark, label lines, strokes and list.
 */
export function mast(opts: MastOpts): string {
  const ink = { size: 7.5, lh: 11, color: T.ink, track: 0.3, weight: 500 };
  const grey = { ...ink, color: LABEL_GREY };
  const listStyle = { size: 6.5, lh: 8.5, color: T.ink, track: 0.2, weight: 500 };
  const rightGrey = { size: 6.5, lh: 8.5, color: '#9a968f', track: 0.25, weight: 500 };
  const desk = `<table class="mast desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff">
<tr>
<td valign="middle" style="padding:9px 0 9px 25px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:22px">${SITE_WORD(18, 0.27)}</td>
<td valign="middle" style="padding-right:16px">${vrule(17, '#2b2b2b')}</td>
<td valign="middle" style="white-space:nowrap">${micro(esc(opts.line1), ink)}${micro(esc(opts.line2), grey)}</td>
</tr></table>
</td>
<td valign="middle" align="right" style="padding:6px 29px 6px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:15px">${slashes(26)}</td>
<td valign="middle" style="padding-right:56px">${lines(MAST_LIST, listStyle)}</td>
<td valign="middle" style="padding-right:13px">${vrule(18, '#3a3a3a')}</td>
<td valign="middle">${lines(['A CLEARER', 'TOMORROW', 'TOGETHER.'], rightGrey)}${opts.rule ? `<div style="width:11px;height:1px;line-height:1px;font-size:1px;background:#9a968f;margin-top:3px">&nbsp;</div>` : ''}</td>
</tr></table>
</td>
</tr>
</table>`;
  const m = opts.mobileLines ?? [opts.line1, opts.line2];
  const mLab = { size: 6.5, lh: 10, color: T.ink, track: 0.2, weight: 600 };
  const mob = mobileOnly(`<table class="mast-m mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:11px 18px 11px 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:15px;white-space:nowrap">${SITE_WORD(22, 0.25)}</td>
<td valign="middle" style="padding-right:12px">${vrule(22, '#2b2b2b')}</td>
<td class="lab" valign="middle" style="white-space:nowrap">${m.map((t, i) => micro(esc(t), i === m.length - 1 && m.length > 1 ? { ...mLab, color: LABEL_GREY, weight: 500 } : mLab)).join('')}</td>
<td valign="middle" align="right" style="padding-left:8px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:16px">${slashes(23)}</td>
<td valign="middle">${lines(MAST_LIST, { size: 6, lh: 7.5, color: T.ink, track: 0.18, weight: 600 })}</td>
</tr></table></td>
</tr></table>
</td></tr>
</table>`);
  // The hidden preheader rides inside the masthead table (first text in the message, one content block in the studio).
  const pre = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff">${esc(opts.preheader)}${PREHEADER_PAD}</div>`;
  return `${desk.replace('<tr>\n<td valign="middle" style="padding:9px 0 9px 25px">', `<tr>\n<td valign="middle" style="padding:9px 0 9px 25px">${pre}`)}
${mob}`;
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
  /** Desktop body measure. Default 196 px: about 34 characters a line, the authority's break. */
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
${headline(copy.headline, (copy.deskSize ?? (copy.headline.length > 2 ? 40 : 46)) + 2)}
${copy.sub ? `<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div><p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:17px;letter-spacing:.1em;font-weight:600;color:${T.ink};text-transform:uppercase">${copy.sub}</p>` : ''}
<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>
<div style="max-width:${copy.deskBodyWidth ?? 196}px">${bodyCopy(copy.body, 9.5, T.ink, 'font-weight:500;letter-spacing:.1em;', 14)}</div>
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
  opts: {
    height: number;
    alt: string;
    fit: MobileCopyFit;
    card?: CardLayer & { artHeight: number };
    /** Natural art height at 390 px, required with `lip` when there is no card. */
    artHeight?: number;
    /** A panel lip over the bottom of the art: the last `height` px of the hero carry `html` (see panelHead). */
    lip?: { height: number; html: string };
  },
): string {
  const lines = copy.mobileHeadline ?? copy.headline;
  const f = opts.fit;
  const body = f.body ?? 10.5;
  // The zone height is on an unpadded cell (padding would add to it); the copy's padding sits inside.
  const copyRow = `<tr><td class="hero-copy" valign="top" height="${f.zone}" style="height:${f.zone}px;padding:0"><div style="padding:${f.padTop ?? 24}px 20px 0 20px">
${copy.kicker ? `${kicker(copy.kicker)}<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div>` : ''}
${headline(lines, (f.head ?? (lines.length > 3 ? 36 : 40)) + 2)}
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
  if (!opts.card && !opts.lip) {
    const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${copyRow}</table>`;
    return mobileOnly(`<table class="hero mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%" aria-label="${esc(opts.alt)}">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-mobile.jpg`), width: 390, height: opts.height, fallback: '#ebe8e3', position: 'center bottom', content, className: 'full' })}</tr>
</table>`);
  }
  // With a card or a panel lip, the art and its live content are locked together at the 390 px design
  // width (the same geometry `cover` gives at 390): centred on wider phones, left-anchored and cropped on
  // the right (scene only) on narrower ones. A lip is the art's last rows in a second cell, drawn at the
  // same size and offset so the image runs on unbroken under the panel's top edge.
  const art = opts.card?.artHeight ?? opts.artHeight;
  if (!art) throw new Error(`FNDATN-01 ${slug} mobile hero needs its art height`);
  const m = coverMap(art, opts.height);
  const lipH = opts.lip?.height ?? 0;
  const lock = (y: number) => ({ width: Math.round(390 * m.k * 10) / 10, height: opts.height, x: -Math.round(m.ox * 10) / 10, y });
  const src = asset(`assets/${slug}/hero-mobile.jpg`);
  const content = `<table role="presentation" width="390" cellpadding="0" cellspacing="0" border="0" style="width:390px">${copyRow}${cardRow}</table>`;
  const lipRow = opts.lip ? `<tr>${bgCell({ src, width: 390, height: lipH, fallback: '#ffffff', content: opts.lip.html, lock: lock(-(opts.height - lipH)) })}</tr>` : '';
  return mobileOnly(`<table class="hero mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;table-layout:fixed" aria-label="${esc(opts.alt)}">
<tr><td align="center" style="padding:0;overflow:hidden"><div style="width:100%;overflow:hidden">
<table class="hero-lock" role="presentation" width="390" cellpadding="0" cellspacing="0" border="0" style="width:390px;margin:0 auto">
<tr>${bgCell({ src, width: 390, height: opts.height - lipH, fallback: '#ffffff', content, lock: lock(0) })}</tr>
${lipRow}
</table>
</div></td></tr>
</table>`);
}

const PANEL_EDGE = '#e3dfd8';
const PANEL_GROUND = '#f2f0ec';

/** The top of a mobile section panel (white, inset 12 px), drawn inside a hero lip: section title and aside. */
export function panelHead(title: string, aside?: string, padTop = 18): string {
  const side = aside
    ? `<td valign="middle" align="left" width="112" style="width:112px;padding-left:12px;border-left:1px solid ${T.line}">${microLabel(aside, T.ink, 7)}</td>`
    : '';
  return `<table role="presentation" width="390" cellpadding="0" cellspacing="0" border="0" style="width:390px"><tr><td valign="bottom" style="padding:0 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border:1px solid ${PANEL_EDGE};border-bottom:0;border-radius:6px 6px 0 0"><tr><td style="padding:${padTop}px 16px 6px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${sectionTitle(title, 27)}</td>${side}</tr></table>
</td></tr></table>
</td></tr></table>`;
}

/** Plain-text band item; renderers escape every field. `value` is a personalized line under the text; `textTone` reddens the text. */
export type BandItem = { n: string; icon: string; iconAlt: string; title: string; text: string; tone?: 'muted'; textTone?: 'red'; value?: string };

/** An item's supporting text (and personalized value line), escaped. */
export function bandText(it: BandItem): string {
  const text = it.textTone === 'red' ? `<span class="keep-red" style="color:${T.red}">${esc(it.text)}</span>` : esc(it.text);
  return it.value ? `${text}<br><span class="keep-ink" style="color:${T.ink}">${v(it.value)}</span>` : text;
}

/** How a band item's marker reads in its authority: number then icon (01/02/04), icon then number (03/05), icon only (07). */
export type BandMark = 'num-icon' | 'icon-num' | 'icon';

export function deskBand(
  asset: AssetResolver,
  title: string,
  items: BandItem[],
  opts: { titleWidth?: number; side?: string; sideLeft?: string; mark?: BandMark } = {},
): string {
  const tw = opts.titleWidth ?? 190;
  const mark = opts.mark ?? 'num-icon';
  const num = (it: BandItem) =>
    `<td valign="middle" class="keep-red" style="${mark === 'icon-num' ? 'padding-left:9px' : 'padding-right:10px'};font-family:${FONT_DISPLAY};font-weight:600;font-size:18px;line-height:19px;color:${it.tone === 'muted' ? T.faint : T.red}">${esc(it.n)}</td>`;
  const ico = (it: BandItem) => `<td valign="middle">${icon(asset(`assets/icons/${it.icon}.png`), it.iconAlt, 18)}</td>`;
  const cols = items
    .map(
      (it) => `<td valign="top" style="padding:17px 10px 16px 12px;border-left:1px solid ${T.line}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
${mark === 'icon' ? ico(it) : mark === 'icon-num' ? `${ico(it)}${num(it)}` : `${num(it)}${ico(it)}`}
</tr></table>
<div style="height:8px;line-height:8px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-family:${FONT_BODY};font-size:9.5px;line-height:13px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${esc(it.title)}</p>
<div style="height:4px;line-height:4px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-family:${FONT_BODY};font-size:8px;line-height:11.5px;letter-spacing:.12em;color:${T.mute};text-transform:uppercase">${bandText(it)}</p>
</td>`,
    )
    .join('');
  const side = opts.side
    ? `<td valign="middle" width="90" style="width:90px;padding:0 0 0 14px;border-left:1px solid ${T.line}">${microLabel(opts.side, T.mute, 7)}</td>`
    : '';
  const sideLeft = opts.sideLeft ? `<td valign="middle" width="92" style="width:92px;padding:0 14px 0 0">${microLabel(opts.sideLeft, T.mute, 7)}</td>` : '';
  return `<table class="walk desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%">
<tr>${bgCell({
    src: asset('assets/shared/marble-band.jpg'),
    width: T.canvas,
    height: 112,
    fallback: T.marble,
    content: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 0 0 24px" width="${tw + (opts.sideLeft ? 92 : 0)}" valign="middle"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${sideLeft}<td valign="middle" style="width:${tw}px">${sectionTitle(title, 27)}</td></tr></table></td>
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
  opts: {
    aside?: string;
    status?: (it: BandItem, i: number) => string;
    /** Number and icon (default), or icon only (07). */
    mark?: 'num-icon' | 'icon';
    /** Title and description side by side (03), instead of stacked. */
    inline?: boolean;
    /** Render as the body of an inset panel whose head sits in the hero lip (05/06/07); `after` closes the panel (CTA). */
    panel?: { after?: string };
  } = {},
): string {
  const titleP = (it: BandItem) =>
    `<p style="margin:0;font-family:${FONT_BODY};font-size:10px;line-height:13px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${esc(it.title)}</p>`;
  const textP = (it: BandItem, top: number) =>
    `<p style="margin:${top}px 0 0;font-family:${FONT_BODY};font-size:8.5px;line-height:12px;letter-spacing:.1em;color:${T.mute};text-transform:uppercase">${bandText(it)}</p>`;
  const pad = opts.panel ? 14 : 20;
  const rows = items
    .map(
      (
        it,
        i,
      ) => `<tr><td style="padding:0 ${pad}px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:${i === 0 ? 0 : 1}px solid ${T.line}"><tr>
${opts.mark === 'icon' ? '' : `<td width="30" valign="middle" class="keep-red" style="width:30px;padding:9px 0;font-family:${FONT_DISPLAY};font-weight:600;font-size:19px;line-height:20px;color:${it.tone === 'muted' ? T.faint : T.red}">${esc(it.n)}</td>`}
<td width="36" valign="middle" style="width:36px;padding:9px 0">${icon(asset(`assets/icons/${it.icon}.png`), it.iconAlt, 19)}</td>
<td width="1" valign="middle" style="padding:9px 11px 9px 0">${vrule(24)}</td>
${
  opts.inline
    ? `<td width="88" valign="middle" style="width:88px;padding:9px 8px 9px 0">${titleP(it)}</td><td valign="middle" style="padding:9px 0">${textP(it, 0)}</td>`
    : `<td valign="middle" style="padding:9px 0">${titleP(it)}${textP(it, 2)}</td>`
}
${opts.status ? `<td valign="middle" align="left" width="96" style="width:96px;padding:9px 0 9px 10px;white-space:nowrap;border-left:1px solid ${T.line}">${opts.status(it, i)}</td>` : ''}
</tr></table></td></tr>`,
    )
    .join('');
  if (opts.panel) {
    return mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:${PANEL_GROUND}">
<tr><td style="padding:0 12px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border:1px solid ${PANEL_EDGE};border-top:0;border-radius:0 0 6px 6px">
<tr><td style="height:6px;line-height:6px;font-size:1px">&nbsp;</td></tr>
${rows}
${opts.panel.after ? `<tr><td style="padding:12px 14px 16px" align="center">${opts.panel.after}</td></tr>` : '<tr><td style="height:10px;line-height:10px;font-size:1px">&nbsp;</td></tr>'}
</table>
</td></tr>
</table>`);
  }
  const aside = opts.aside
    ? `<td valign="middle" align="left" width="120" style="width:120px;padding-left:14px;border-left:1px solid ${T.line}">${microLabel(opts.aside, T.ink, 7.5)}</td>`
    : '';
  return mobileOnly(`<table class="walk mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:${T.white}">
<tr><td style="padding:22px 20px 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${sectionTitle(title, 28)}</td>${aside}</tr></table></td></tr>
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
<td valign="middle" align="center" style="padding:10px 10px 9px">${button(cta.label, cta.url, { width: 350 })}${caption(cta.caption)}</td>
${side(strips.right, strips.rightAlt)}
</tr>
</table>`;
}

export function mobileAct(cta: { label: string; url: string; caption: string }, opts: { color?: string } = {}): string {
  return mobileOnly(`<table class="act mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff">
<tr><td style="padding:18px 20px 20px" align="center">${button(cta.label, cta.url, { width: 350, color: opts.color })}${cta.caption ? caption(cta.caption) : ''}</td></tr>
</table>`);
}

export function mobileStrip(asset: AssetResolver, slug: string, file: string, alt: string, height: number): string {
  return mobileOnly(`<table class="rest mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%">
<tr><td>${img(asset(`assets/${slug}/${file}`), alt, 390, height, 'width:100%;height:auto;')}</td></tr>
</table>`);
}

export type FootOpts = {
  /** Mobile footer variant from the 04 authority: its own label pair and a stacked classification with a red stroke. */
  mobile?: { line1: string; line2: string; classification: string[]; stroke?: boolean };
};

const CLASSIFICATION = ['CLASSIFICATION · TRANSACTIONAL', 'SERVICE NOTICE. NO MARKETING UNSUBSCRIBE.'];

/** Classification lines, with the word UNSUBSCRIBE in red so it reads clearly; everything else stays grey. */
function classLines(items: string[], o: MicroStyle): string {
  const red = (t: string) => `<span class="keep-red" style="color:${T.red}">${t}</span>`;
  return items
    .map((t) => micro(esc(t).replace(/UNSUBSCRIBE/g, (m) => red(m)), o))
    .join('');
}

/**
 * Colophon footer, rebuilt from the authority geometry: hairline top rule, wordmark, divider, DIGITAL
 * FOUNDATION and its tagline, a centre divider, then the transactional classification set right. Mobile
 * keeps the same single row at phone scale. Design microcopy only: no address, contact or legal claim is
 * invented here; real sender details belong to the delivery layer.
 */
export function foot(opts: FootOpts = {}): string {
  const ink = { size: 7, lh: 11, color: T.ink, track: 0.25, weight: 600 };
  const grey = { size: 7, lh: 11, color: LABEL_GREY, track: 0.25, weight: 500 };
  const cls = { size: 7, lh: 11, color: '#97938b', track: 0.2, weight: 500 };
  const desk = `<table class="foot desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border-top:1px solid ${T.line}">
<tr>
<td valign="middle" width="313" style="width:313px;padding:12px 0 13px 27px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:14px">${SITE_WORD(14.5, 0.19)}</td>
<td valign="middle" style="padding-right:14px">${vrule(14, '#2b2b2b')}</td>
<td valign="middle" style="white-space:nowrap">${micro('DIGITAL FOUNDATION', ink)}${micro('BRANDS BUILT FOR WHAT&#39;S NEXT.', grey)}</td>
</tr></table>
</td>
<td valign="middle" width="1" style="width:1px">${vrule(16, '#3a3a3a')}</td>
<td valign="middle" align="right" style="padding:12px 34px 13px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td align="left" style="text-align:left">${classLines(CLASSIFICATION, cls)}</td></tr></table></td>
</tr>
</table>`;
  const mm = opts.mobile;
  const mInk = { size: 6.5, lh: 10, color: T.ink, track: 0.16, weight: 600 };
  const mGrey = { ...mInk, color: LABEL_GREY, weight: 500 };
  const mCls = { size: 6.5, lh: 10, color: '#97938b', track: 0.14, weight: 500 };
  const right = mm
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${mm.stroke ? `<td valign="middle" style="padding-right:10px">${slashes(17).replace('//', '/')}</td>` : ''}<td valign="middle">${classLines(mm.classification, mCls)}</td></tr></table>`
    : classLines(['CLASSIFICATION · TRANSACTIONAL', 'SERVICE NOTICE.', 'NO MARKETING UNSUBSCRIBE.'], mCls);
  const mob = mobileOnly(`<table class="foot-m mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%;background:#ffffff;border-top:1px solid ${T.line}">
<tr><td style="padding:13px 14px 15px 18px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:10px;white-space:nowrap">${SITE_WORD(14.5, 0.19)}</td>
<td valign="middle" style="padding-right:10px">${vrule(22, '#2b2b2b')}</td>
<td class="lab" valign="middle" style="white-space:nowrap">${micro(esc(mm?.line1 ?? 'DIGITAL FOUNDATION'), mInk)}${micro(esc(mm?.line2 ?? "BRANDS BUILT FOR WHAT'S NEXT."), mGrey)}</td>
<td valign="middle" width="1" style="width:1px;padding:0 12px 0 10px">${vrule(22, '#3a3a3a')}</td>
<td class="lab" valign="middle" style="white-space:nowrap">${right}</td>
</tr></table>
</td></tr>
</table>`);
  return `${desk}
${mob}`;
}

export const SPACE = (h: number) => `<div style="height:${h}px;line-height:${h}px;font-size:1px">&nbsp;</div>`;
