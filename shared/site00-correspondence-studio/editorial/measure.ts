/**
 * Deterministic text measurement for the correspondence generator.
 *
 * Email clients cannot measure text, so every wrap decision is made here from real advance widths.
 * `webfont` is what Apple Mail, iOS Mail, Samsung Mail and the studio preview render. `fallback` is the
 * Arial-metric font that Gmail, Outlook desktop, Yahoo and Outlook.com render because they do not load
 * webfonts. Greedy wrapping is monotone: a font whose every glyph is no wider produces no more lines,
 * so a plan solved for a scenario is an upper bound for any narrower font.
 */
import { FONT_ADVANCE_EM, type FontMetricKey } from './fontMetrics.generated.js';

export type FontFamilyRole = 'body' | 'display';
export type FontScenario = 'webfont' | 'fallback';

export type FontSpec = {
  family: FontFamilyRole;
  weight: number;
  size: number;
  /** CSS letter-spacing in em, applied after every glyph. */
  tracking: number;
};

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', rarr: '→', middot: '·', times: '×' };

/** Markup to the text a client lays out: tags removed, entities decoded, `<br>` kept as newlines. */
export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#?\w+);/g, (m, k: string) => ENTITY[k] ?? (k.startsWith('#') ? String.fromCharCode(Number(k.slice(1))) : m));
}

function table(font: FontSpec, scenario: FontScenario): Record<string, number> {
  let key: FontMetricKey;
  if (scenario === 'fallback') key = font.family === 'display' || font.weight >= 600 ? 'arial700' : 'arial400';
  else if (font.family === 'display') key = 'display';
  else key = font.weight >= 600 ? 'saira600' : font.weight >= 500 ? 'saira500' : 'saira400';
  return FONT_ADVANCE_EM[key];
}

const widestCache = new Map<Record<string, number>, number>();
function widest(t: Record<string, number>): number {
  let w = widestCache.get(t);
  if (w === undefined) {
    w = Math.max(...Object.values(t));
    widestCache.set(t, w);
  }
  return w;
}

/** Rendered width in CSS px of a single line, uppercased as the templates render it. */
export function textWidth(text: string, font: FontSpec, scenario: FontScenario): number {
  const t = table(font, scenario);
  let em = 0;
  let n = 0;
  for (const ch of text.toUpperCase()) {
    em += t[ch] ?? widest(t);
    n += 1;
  }
  return em * font.size + n * font.tracking * font.size;
}

export type Wrapped = { lines: string[]; widest: number; longestWord: number };

/** Break opportunities a browser uses: spaces, and after a hyphen inside a word. */
export function breakUnits(paragraph: string): { text: string; glue: string }[] {
  const out: { text: string; glue: string }[] = [];
  for (const word of paragraph.split(/\s+/).filter(Boolean)) {
    const parts = word.split(/(?<=-)(?=[^-])/);
    parts.forEach((part, i) => out.push({ text: part, glue: i === 0 ? ' ' : '' }));
  }
  return out;
}

/** Greedy wrap at spaces and hyphens, honoring explicit newlines. A unit wider than `width` sits alone on its line. */
export function wrapText(text: string, width: number, font: FontSpec, scenario: FontScenario): Wrapped {
  const lines: string[] = [];
  let longestWord = 0;
  for (const para of plainText(text).split('\n')) {
    const units = breakUnits(para);
    let line = '';
    for (const u of units) {
      longestWord = Math.max(longestWord, textWidth(u.text, font, scenario));
      const next = line ? `${line}${u.glue}${u.text}` : u.text;
      if (line && textWidth(next, font, scenario) > width) {
        lines.push(line);
        line = u.text;
      } else line = next;
    }
    if (line || !units.length) lines.push(line);
  }
  const widestLine = Math.max(0, ...lines.map((l) => textWidth(l, font, scenario)));
  return { lines, widest: widestLine, longestWord };
}
