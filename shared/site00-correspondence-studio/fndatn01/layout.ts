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
  /** Desktop headline size override when the default would push the hero past its art height. */
  deskSize?: number;
  /** The tagline is dropped on desktop where the art behind the column bottom is too busy to read over. */
  deskTagline?: boolean;
};

/** `column` is the live text width; it must end before the hero object in the art. */
export function desktopHero(asset: AssetResolver, slug: string, copy: HeroCopy, opts: { column: number; alt: string }): string {
  const w = opts.column + 28;
  const content = `<table role="presentation" width="${w}" cellpadding="0" cellspacing="0" border="0" align="left" style="width:${w}px"><tr>
<td width="${w}" valign="top" style="width:${w}px;max-width:${w}px;padding:${copy.headline.length > 2 ? 20 : 26}px 0 10px 28px">
${copy.kicker ? `${kicker(copy.kicker)}<div style="height:11px;line-height:11px;font-size:1px">&nbsp;</div>` : ''}
${headline(copy.headline, (copy.deskSize ?? (copy.headline.length > 2 ? 40 : 46)) + 2)}
${copy.sub ? `<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div><p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:17px;letter-spacing:.1em;font-weight:600;color:${T.ink};text-transform:uppercase">${copy.sub}</p>` : ''}
<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>
${bodyCopy(copy.body, 10.5, T.ink, 'font-weight:500;', 15)}
${copy.tagline && copy.deskTagline !== false ? `<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>${tagline(copy.tagline)}` : ''}
</td>
</tr></table>`;
  return `<table class="hero desk-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%" aria-label="${esc(opts.alt)}">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-desktop.jpg`), width: T.canvas, height: DESKTOP_HERO_HEIGHT, fallback: '#ebe8e3', position: 'center center', content })}</tr>
</table>`;
}

export function mobileHero(asset: AssetResolver, slug: string, copy: HeroCopy, opts: { height: number; alt: string; textWidth?: number }): string {
  const lines = copy.mobileHeadline ?? copy.headline;
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top" style="padding:24px 20px 0 20px">
${copy.kicker ? `${kicker(copy.kicker)}<div style="height:11px;line-height:11px;font-size:1px">&nbsp;</div>` : ''}
${headline(lines, (lines.length > 3 ? 36 : 40) + 2)}
<div style="height:10px;line-height:10px;font-size:1px">&nbsp;</div>
<div style="max-width:${opts.textWidth ?? 240}px">${bodyCopy(copy.mobileBody ?? copy.body, 10.5, T.ink, 'letter-spacing:.06em;font-weight:500;', 15)}</div>
</td></tr></table>`;
  return mobileOnly(`<table class="hero mob-only" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;max-height:0;overflow:hidden;width:100%" aria-label="${esc(opts.alt)}">
<tr>${bgCell({ src: asset(`assets/${slug}/hero-mobile.jpg`), width: 390, height: opts.height, fallback: '#ebe8e3', position: 'center bottom', content, className: 'full' })}</tr>
</table>`);
}

export type RecordField = { label: string; value: string; tone?: 'red' | 'ink'; personalized?: boolean };

/** Live mirror of the card fields that were cleared from the artwork. */
function fieldValue(f: RecordField, size: number): string {
  const red = f.tone === 'red';
  return `<span class="${red ? 'keep-red' : 'keep-ink'}" style="font-family:${FONT_BODY};font-size:${size}px;line-height:${Math.round(size * 1.45)}px;letter-spacing:.08em;font-weight:${red ? 600 : 500};color:${red ? T.red : T.ink};text-transform:uppercase">${f.personalized === false ? esc(f.value) : `<span class="v">${esc(f.value)}</span>`}</span>`;
}

const LEDGER_TABLE = `role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${T.paper};border-top:1px solid ${T.line};border-bottom:1px solid ${T.line}"`;

/** Live mirror of the card fields that were cleared from the artwork. Desktop one row (two when more than five), mobile grid of two. */
export function ledger(title: string, subtitle: string, fields: RecordField[], opts: { mobile?: boolean } = {}): string {
  const perRow = fields.length <= 5 ? fields.length : Math.ceil(fields.length / 2);
  const rows: RecordField[][] = [];
  for (let i = 0; i < fields.length; i += perRow) rows.push(fields.slice(i, i + perRow));
  const cellW = Math.floor((T.canvas - 56 - 128) / perRow);
  const deskCells = rows.map(
    (row, r) =>
      `${row
        .map(
          (
            f,
          ) => `<td valign="top" width="${cellW}" style="width:${cellW}px;padding:11px 10px 11px 14px;border-left:1px solid ${T.line};${r > 0 ? `border-top:1px solid ${T.line};` : ''}">
${microLabel(esc(f.label), T.mute, 7.5)}<br>${fieldValue(f, 11)}</td>`,
        )
        .join(
          '',
        )}${row.length < perRow ? `<td colspan="${perRow - row.length}" style="border-left:1px solid ${T.line};${r > 0 ? `border-top:1px solid ${T.line};` : ''}">&nbsp;</td>` : ''}`,
  );
  const desk = `<table class="ledger desk-only" ${LEDGER_TABLE}>
<tr><td style="padding:4px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td valign="top" width="128" rowspan="${rows.length}" style="width:128px;padding:12px 14px 12px 0">
${SITE_WORD(13)}<br>${microLabel(esc(title), T.ink, 7.5)}<br>${microLabel(esc(subtitle), T.faint, 7.5)}
</td>${deskCells[0]}</tr>
${deskCells
  .slice(1)
  .map((cells) => `<tr>${cells}</tr>`)
  .join('\n')}
</table>
</td></tr>
</table>`;
  const pairs: RecordField[][] = [];
  for (let i = 0; i < fields.length; i += 2) pairs.push(fields.slice(i, i + 2));
  const mob = mobileOnly(`<table class="ledger mob-only" ${LEDGER_TABLE.replace('style="', 'style="display:none;max-height:0;overflow:hidden;')}>
<tr><td style="padding:14px 20px 4px">${SITE_WORD(13)}&nbsp;&nbsp;${microLabel(`${esc(title)} · ${esc(subtitle)}`, T.mute, 7.5)}</td></tr>
<tr><td style="padding:0 20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${pairs
    .map(
      (pair) =>
        `<tr>${pair.map((f, i) => `<td valign="top" width="50%" style="width:50%;padding:9px ${i === 0 ? 10 : 0}px 9px ${i === 0 ? 0 : 12}px;border-top:1px solid ${T.line};${i === 1 ? `border-left:1px solid ${T.line};` : ''}">${microLabel(esc(f.label), T.mute, 7.5)}<br>${fieldValue(f, 11)}</td>`).join('')}${pair.length === 1 ? `<td width="50%" style="border-top:1px solid ${T.line};border-left:1px solid ${T.line}">&nbsp;</td>` : ''}</tr>`,
    )
    .join('')}</table></td></tr>
</table>`);
  return opts.mobile === false ? desk : `${desk}\n${mob}`;
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
<p style="margin:0;font-family:${FONT_BODY};font-size:10.5px;line-height:14px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${esc(it.title)}</p>
<div style="height:5px;line-height:5px;font-size:1px">&nbsp;</div>
<p style="margin:0;font-family:${FONT_BODY};font-size:9px;line-height:13px;letter-spacing:.12em;color:${T.mute};text-transform:uppercase">${esc(it.text)}</p>
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
<p style="margin:0;font-family:${FONT_BODY};font-size:11px;line-height:15px;letter-spacing:.16em;font-weight:600;color:${it.tone === 'muted' ? T.faint : T.ink};text-transform:uppercase">${esc(it.title)}</p>
          <p style="margin:3px 0 0;font-family:${FONT_BODY};font-size:9.5px;line-height:13px;letter-spacing:.1em;color:${T.mute};text-transform:uppercase">${esc(it.text)}</p>
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
