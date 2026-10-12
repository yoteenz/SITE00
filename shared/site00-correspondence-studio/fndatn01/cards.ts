/**
 * FNDATN-01 in-artifact card data.
 *
 * The extracted hero art keeps each paper card but clears its variable fields (extract_assets.py). These
 * layers put the fields back as live, escaped HTML text at the positions the founder authority prints
 * them, measured in CSS px of the 680 x 300 desktop hero and the 390 px mobile hero.
 *
 * Email-safe by construction: the position comes from table padding and fixed row heights, never from
 * absolute positioning. The card's perspective is followed with per-row indents, which every client
 * renders. The card's tilt is a CSS `transform` on a wrapper of its own, a progressive enhancement:
 * clients that drop it (Gmail, Outlook for Windows) show the same rows level, still on the blank paper.
 */
import { FONT_BODY, T, esc, href } from './html.js';

type Pt = readonly [x: number, y: number];

export type CardSpec = {
  /** Left edge and cap-centre y of the authority's first and last field labels. */
  first: Pt;
  last: Pt;
  /** Field rows the authority prints between `first` and `last`. */
  rows: number;
  /** Left edge of the value column on the first row. */
  valueX: number;
  /** Right limit for values: the card's printed rule or seal. */
  valueMax: number;
  /** Clockwise tilt of the card's text, degrees. */
  rotate: number;
  label: number;
  value: number;
  /** Short scope tags printed beside the fields (03 and 07). */
  side?: { first: Pt; last: Pt; rows: number; size: number };
};

export type CardRow = { label: string; value: string; tone?: 'red' | 'ink'; personalized?: boolean; pill?: { url: string } };

/** Measured from the authority JPEGs through the same crop and scale as each hero (see FNDATN_01_ARTIFACT_DATA.md). */
export const CARD_SPECS = {
  '01_invitation': {
    desktop: { first: [390.7, 160.3], last: [380.7, 200.7], rows: 4, valueX: 444.5, valueMax: 538, rotate: 2.6, label: 6.5, value: 8 },
    mobile: { first: [133.3, 223.8], last: [124.2, 261.3], rows: 4, valueX: 178.7, valueMax: 268, rotate: 5, label: 6, value: 7.5 },
  },
  '02_intake_received': {
    desktop: { first: [405.3, 151], last: [394.2, 214.2], rows: 5, valueX: 457.8, valueMax: 575, rotate: 4.7, label: 6.5, value: 8 },
    mobile: { first: [127, 260.2], last: [112.3, 321.3], rows: 5, valueX: 175.7, valueMax: 276, rotate: 6.8, label: 6, value: 7 },
  },
  '03_recommendation_quote': {
    desktop: {
      first: [409.2, 146.2],
      last: [399.2, 212.8],
      rows: 6,
      valueX: 473.7,
      valueMax: 560,
      rotate: 1.9,
      label: 6.5,
      value: 8,
      side: { first: [604, 152.8], last: [601, 194.5], rows: 6, size: 6 },
    },
    mobile: {
      first: [92.5, 308.7],
      last: [80.8, 376.2],
      rows: 6,
      valueX: 165.8,
      valueMax: 258,
      rotate: 4.3,
      label: 6,
      value: 7.5,
      side: { first: [297, 324], last: [294.2, 366.2], rows: 6, size: 5.5 },
    },
  },
  '04_payment_received': {
    desktop: { first: [355, 161], last: [344.7, 233.5], rows: 7, valueX: 413.3, valueMax: 512, rotate: 3.7, label: 6.5, value: 7.5 },
  },
  '07_quote_expiry': {
    desktop: {
      first: [354, 163],
      last: [343, 226.3],
      rows: 6,
      valueX: 405,
      valueMax: 492,
      rotate: 2.7,
      label: 6.5,
      value: 7.5,
      side: { first: [528, 161.7], last: [524.3, 204], rows: 6, size: 6 },
    },
    mobile: {
      first: [169.7, 266.7],
      last: [159.3, 316.3],
      rows: 6,
      valueX: 206.8,
      valueMax: 274,
      rotate: 6.9,
      label: 5.5,
      value: 6.5,
      side: { first: [293.5, 276.7], last: [288.2, 312.5], rows: 6, size: 5 },
    },
  },
} as const satisfies Record<string, { desktop?: CardSpec; mobile?: CardSpec }>;

/** Natural CSS height of each locked mobile hero (a card or a panel lip) at the 390 px width (asset height / 2). */
export const MOBILE_ART_HEIGHT = {
  '01_invitation': 347,
  '02_intake_received': 424,
  '03_recommendation_quote': 455,
  '07_quote_expiry': 380,
  '05_foundation_complete': 366.5,
  '06_resume_intake': 394,
} as const;

export type ArtMap = { k: number; ox: number };

/** Where `cover` puts art of natural height `art` in a `width` x `cell` hero (centred): scale `k`, left crop `ox`. */
export function coverMap(art: number, cell: number, width = 390): ArtMap {
  const k = Math.max(1, cell / art);
  return { k, ox: (width * k - width) / 2 };
}

/** A spec measured on the natural art, moved into a hero that shows the art through `m`. */
export function mapSpec(spec: CardSpec, m: ArtMap): CardSpec {
  const pt = (p: Pt): Pt => [p[0] * m.k - m.ox, p[1] * m.k];
  return {
    ...spec,
    first: pt(spec.first),
    last: pt(spec.last),
    valueX: spec.valueX * m.k - m.ox,
    valueMax: spec.valueMax * m.k - m.ox,
    side: spec.side ? { ...spec.side, first: pt(spec.side.first), last: pt(spec.side.last) } : undefined,
  };
}

/** Card layer for a mobile hero `cell` px tall: maps the spec through the hero's cover geometry. */
export function mobileCardLayer(slug: keyof typeof CARD_SPECS & keyof typeof MOBILE_ART_HEIGHT, cell: number, rows: CardRow[], tags: string[] = []): CardLayer & { artHeight: number } {
  const artHeight = MOBILE_ART_HEIGHT[slug];
  return { ...cardLayer(mapSpec(CARD_SPECS[slug].mobile, coverMap(artHeight, cell)), rows, tags), artHeight };
}

/** Average advance of Saira Semi Condensed capitals, in em (0.48 measured in Chromium, rounded up for safety). */
const CAP_ADVANCE = 0.5;

function textWidth(text: string, size: number, tracking: number): number {
  return text.length * size * (CAP_ADVANCE + tracking);
}

/** Largest value size (down to 85% of the card size) and tracking that keeps the value inside the card's rule. */
function fitValue(text: string, size: number, room: number): { size: number; tracking: number } {
  for (const tracking of [0.06, 0.03, 0]) if (textWidth(text, size, tracking) <= room) return { size, tracking };
  const fitted = room / (text.length * CAP_ADVANCE);
  return { size: Math.max(Math.round(size * 0.85 * 10) / 10, Math.floor(fitted * 10) / 10), tracking: 0 };
}

/** Label tracking: the printed .16em, tightened so a long label (RECOMMENDATION) keeps a gap before its value. */
function labelTracking(text: string, size: number, column: number): number {
  for (const tracking of [0.16, 0.1, 0.05]) if (textWidth(text, size, tracking) <= column - 6) return tracking;
  return 0;
}

type Rows = { pitch: number; skew: number; top: number };

/** Spread `n` rows over the authority's field span; fewer rows keep a pitch no looser than 1.2x the printed one. */
function rowGeometry(first: Pt, last: Pt, printed: number, n: number): Rows {
  const span = last[1] - first[1];
  const pitchA = span / Math.max(1, printed - 1);
  const skewA = (first[0] - last[0]) / Math.max(1, printed - 1);
  const pitch = n > 1 ? Math.min(span / (n - 1), pitchA * 1.2) : pitchA;
  const used = pitch * (n - 1);
  return { pitch, skew: (skewA * pitch) / pitchA, top: first[1] + (span - used) / 2 };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function fieldRows(spec: CardSpec, rows: CardRow[]): { html: string; left: number; top: number; width: number } {
  const g = rowGeometry(spec.first, spec.last, spec.rows, rows.length);
  const labelW = spec.valueX - spec.first[0];
  const pitch = Math.round(g.pitch * 2) / 2;
  const indentMax = g.skew * (rows.length - 1);
  // Block origin: the last (leftmost) row's label, half a row above the first row's cap centre.
  const firstX = spec.first[0] - (spec.first[1] - g.top) * (g.skew / g.pitch);
  const left = Math.round(firstX - indentMax);
  // Half the label-to-value drop that the tilt produces, so level rows sit centred on the printed ones.
  const drop = Math.tan((spec.rotate * Math.PI) / 180) * labelW * 0.5;
  const top = Math.round(g.top - pitch / 2 + drop);
  const room = spec.valueMax - spec.valueX;
  const body = rows
    .map((row, i) => {
      const indent = Math.round(firstX - left - g.skew * i);
      const red = row.tone === 'red';
      const fit = fitValue(row.value, spec.value, room);
      const text = row.personalized === false ? esc(row.value) : `<span class="v">${esc(row.value)}</span>`;
      const value = row.pill
        ? `<a href="${href(row.pill.url)}" target="_blank" rel="noopener" class="keep-red" style="display:inline-block;background:${T.red};color:#ffffff;font-family:${FONT_BODY};font-size:${fit.size}px;line-height:${Math.round(fit.size * 1.5)}px;letter-spacing:.1em;font-weight:600;padding:0 6px;white-space:nowrap;text-decoration:none">${esc(row.value)}</a>`
        : `<span class="${red ? 'keep-red' : 'keep-ink'}" style="font-family:${FONT_BODY};font-size:${fit.size}px;line-height:${pitch}px;letter-spacing:${fit.tracking}em;font-weight:${red ? 600 : 500};color:${red ? T.red : T.ink};white-space:nowrap">${text}</span>`;
      return `<tr><td valign="middle" style="height:${pitch}px;line-height:${pitch}px;padding:0 0 0 ${indent}px;white-space:nowrap"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" width="${r1(labelW)}" style="width:${r1(labelW)}px;height:${pitch}px;font-family:${FONT_BODY};font-size:${spec.label}px;line-height:${pitch}px;letter-spacing:${labelTracking(row.label, spec.label, labelW)}em;color:#3c3a36;white-space:nowrap">${esc(row.label)}</td>
<td valign="middle" style="height:${pitch}px;line-height:${pitch}px;white-space:nowrap">${value}</td>
</tr></table></td></tr>`;
    })
    .join('');
  const width = Math.ceil(spec.valueMax - left);
  return { html: `<table class="card-fields" role="presentation" cellpadding="0" cellspacing="0" border="0">${body}</table>`, left, top, width };
}

function sideRows(side: NonNullable<CardSpec['side']>, tags: string[]): { html: string; left: number; top: number } {
  const g = rowGeometry(side.first, side.last, side.rows, tags.length);
  const pitch = Math.round(g.pitch * 2) / 2;
  const firstX = side.first[0] - (side.first[1] - g.top) * (g.skew / g.pitch);
  const left = Math.round(firstX - g.skew * (tags.length - 1));
  const top = Math.round(g.top - pitch / 2);
  const body = tags
    .map(
      (tag, i) =>
        `<tr><td style="height:${pitch}px;line-height:${pitch}px;padding:0 0 0 ${Math.round(firstX - left - g.skew * i)}px;font-family:${FONT_BODY};font-size:${side.size}px;letter-spacing:.16em;font-weight:500;color:#2c2b28;white-space:nowrap">${esc(tag)}</td></tr>`,
    )
    .join('');
  return { html: `<table class="card-tags" role="presentation" cellpadding="0" cellspacing="0" border="0">${body}</table>`, left, top };
}

function tilt(html: string, deg: number, originX: number, originY: number): string {
  return `<div style="transform:rotate(${deg}deg);-webkit-transform:rotate(${deg}deg);transform-origin:${originX}px ${originY}px;-webkit-transform-origin:${originX}px ${originY}px">${html}</div>`;
}

export type CardLayer = { left: number; top: number; html: string };

/**
 * The card's live fields (and scope tags) as one block. `left` and `top` are hero CSS px; the caller pads
 * its cell by them. Rows are given in authority order; absent fields are simply not passed.
 */
export function cardLayer(spec: CardSpec, rows: CardRow[], tags: string[] = []): CardLayer {
  const main = fieldRows(spec, rows);
  const pivotX = Math.round((spec.first[0] + spec.valueX) / 2 - main.left);
  const fields = tilt(main.html, spec.rotate, pivotX, 0);
  if (!spec.side || !tags.length) return { left: main.left, top: main.top, html: fields };
  const side = sideRows(spec.side, tags);
  const top = Math.min(main.top, side.top);
  const mainW = side.left - main.left;
  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top" width="${mainW}" style="width:${mainW}px;padding:${main.top - top}px 0 0 0">${fields}</td>
<td valign="top" style="padding:${side.top - top}px 0 0 0">${tilt(side.html, spec.rotate, 0, 0)}</td>
</tr></table>`;
  return { left: main.left, top, html };
}
