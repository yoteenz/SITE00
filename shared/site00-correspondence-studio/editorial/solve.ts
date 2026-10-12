/**
 * Deterministic hero copy placement. Runs in the generator; the email receives only the result as
 * fixed column widths, sizes and line heights.
 *
 * Priority order: readability, protected art, typographic hierarchy, approved position, then minimal
 * vertical growth. When copy does not fit the ladder is, in order:
 *   L1 wrap inside the text-safe area at authority sizes
 *   L2 allow the contract's maximum line count
 *   L3 use the design-authorized expansion floor
 *   L4 reduce font size inside the contract's strict limits
 *   L5 stack the copy in a live text region above the art
 * Copy is never clipped, hidden, or allowed outside its safe area, and the email is never scaled.
 */
import { breakUnits, plainText, textWidth, wrapText, type FontScenario, type FontSpec } from './measure.js';
import { TEXT_ROLE_ORDER, safeWidth, type EditorialZoneContract, type RoleRule, type TextRole } from './zones.js';

/** Copy per role as plain text. Headline is a list of intentional lines. */
export type HeroText = Partial<Record<Exclude<TextRole, 'headline'>, string>> & { headline: string[] };

export type PlacedRole = {
  role: TextRole;
  size: number;
  lineHeight: number;
  /** Widest column the HTML sets for this role. */
  width: number;
  /** Consecutive lines that share a column width; stepped roles narrow as they pass protected art. */
  segments: { width: number; lines: string[] }[];
  lines: string[];
  widest: number;
  y0: number;
  y1: number;
  /** Space above the role in px as placed. */
  gap: number;
  /** Width kept beside the text for the role's rule; 0 when the rule was dropped to fit. */
  trailing: number;
};

export type HeroPlan = {
  scenario: FontScenario;
  mode: 'OVERLAY' | 'STACK';
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  roles: PlacedRole[];
  omitted: TextRole[];
  decisions: string[];
  bottom: number;
};

/**
 * Browsers hint and round small text: Chromium sets 7.5px Saira up to 2.7% wider than its advance
 * table. Wrap inside the column by a proportional margin so measured and rendered breaks agree.
 */
export function fitWidth(column: number): number {
  return column - Math.max(2, column * 0.035);
}

type Failure = { role: TextRole; cause: 'MIN_WIDTH' | 'WIDTH' | 'LINES' | 'FLOOR' };
type Attempt = { ok: true; roles: PlacedRole[]; omitted: TextRole[]; bottom: number } | { ok: false; failure: Failure };

function fontOf(rule: RoleRule, size: number): FontSpec {
  return { ...rule.font, size };
}

export function scaledLineHeight(rule: RoleRule, size: number): number {
  return Math.round((rule.lineHeight * size) / rule.size.preferred);
}

function textOf(copy: HeroText, role: TextRole): string | null {
  if (role === 'headline') {
    if (!copy.headline.length) return null;
    const last = copy.headline[copy.headline.length - 1].trimEnd();
    return `${copy.headline.join('\n')}${/[!?.]$/.test(last) ? '' : '.'}`;
  }
  const t = copy[role];
  return t && t.trim() ? t : null;
}

function lineLimit(rule: RoleRule, role: TextRole, copy: HeroText, mode: 'preferred' | 'max'): number {
  if (role === 'headline') return copy.headline.length;
  if (role === 'tagline') return (copy.tagline ?? '').split('\n').length;
  if (mode === 'preferred') return rule.preferredLines ?? rule.maxLines ?? Infinity;
  return rule.maxLines ?? Infinity;
}

/** Greedy wrap where every line takes the safe width of its own row band. */
function wrapStepped(text: string, font: FontSpec, scenario: FontScenario, widthAt: (line: number) => number) {
  const lines: string[] = [];
  const widths: number[] = [];
  let longestWord = 0;
  let widest = 0;
  let overWide = false;
  const units = breakUnits(plainText(text).replace(/\n/g, ' '));
  let line = '';
  let col = widthAt(0);
  const close = () => {
    lines.push(line);
    widths.push(col);
    widest = Math.max(widest, textWidth(line, font, scenario));
  };
  for (const u of units) {
    const ww = textWidth(u.text, font, scenario);
    longestWord = Math.max(longestWord, ww);
    const next = line ? `${line}${u.glue}${u.text}` : u.text;
    if (line && textWidth(next, font, scenario) > fitWidth(col)) {
      close();
      line = u.text;
      col = widthAt(lines.length);
    } else line = next;
    if (ww > fitWidth(col)) overWide = true;
  }
  if (line) close();
  return { lines, widths, widest, longestWord, overWide };
}

function segmentsOf(lines: string[], widths: number[]): PlacedRole['segments'] {
  const out: PlacedRole['segments'] = [];
  lines.forEach((l, i) => {
    const w = Math.floor(widths[i]);
    const last = out[out.length - 1];
    if (last && last.width === w) last.lines.push(l);
    else out.push({ width: w, lines: [l] });
  });
  return out;
}

function attempt(
  c: EditorialZoneContract,
  copy: HeroText,
  sizes: Partial<Record<TextRole, number>>,
  limit: 'preferred' | 'max',
  floor: number,
  scenario: FontScenario,
): Attempt {
  const roles: PlacedRole[] = [];
  const omitted: TextRole[] = [];
  let y = c.inset.top;
  for (const role of TEXT_ROLE_ORDER) {
    const text = textOf(copy, role);
    const rule = c.roles[role];
    if (!text || !rule) continue;
    const size = sizes[role] ?? rule.size.preferred;
    const lh = scaledLineHeight(rule, size);
    const gap = roles.length ? rule.gapBefore : 0;
    const y0 = y + gap;
    const font = fontOf(rule, size);
    const layout = (trailing: number) => {
      const cap = (rule.maxWidth ?? Infinity) + trailing;
      if (rule.stepped) {
        return wrapStepped(text, font, scenario, (i) => Math.min(safeWidth(c, y0 + i * lh, y0 + (i + 1) * lh), cap) - trailing);
      }
      let band = Math.min(safeWidth(c, y0, y0 + lh), cap);
      let wrapped = wrapText(text, fitWidth(band - trailing), font, scenario);
      for (let i = 0; i < 8; i += 1) {
        const next = Math.min(safeWidth(c, y0, y0 + wrapped.lines.length * lh), cap);
        if (next >= band) break;
        band = next;
        wrapped = wrapText(text, fitWidth(band - trailing), font, scenario);
      }
      return {
        lines: wrapped.lines,
        widths: wrapped.lines.map(() => band - trailing),
        widest: wrapped.widest,
        overWide: wrapped.longestWord > fitWidth(band - trailing),
      };
    };
    let trailing = rule.trailing ?? 0;
    let laid = layout(trailing);
    if (trailing && (laid.overWide || laid.lines.length > (rule.preferredLines ?? Infinity))) {
      trailing = 0;
      laid = layout(0);
    }
    const { lines, widths, widest, overWide } = laid;
    const h = lines.length * lh;
    let cause: Failure['cause'] | null = null;
    if (Math.min(...widths) < rule.minWidth) cause = 'MIN_WIDTH';
    else if (overWide) cause = 'WIDTH';
    else if (lines.length > lineLimit(rule, role, copy, limit)) cause = role === 'headline' ? 'WIDTH' : 'LINES';
    else if (y0 + h > floor) cause = 'FLOOR';
    if (cause) {
      if (!rule.essential) {
        omitted.push(role);
        continue;
      }
      return { ok: false, failure: { role, cause } };
    }
    const segments = segmentsOf(lines, widths);
    roles.push({ role, size, lineHeight: lh, width: Math.max(...segments.map((sg) => sg.width)), segments, lines, widest, y0, y1: y0 + h, gap, trailing });
    y = y0 + h;
  }
  return { ok: true, roles, omitted, bottom: y };
}

function preferredSizes(c: EditorialZoneContract): Partial<Record<TextRole, number>> {
  const out: Partial<Record<TextRole, number>> = {};
  for (const role of TEXT_ROLE_ORDER) {
    const rule = c.roles[role];
    if (rule) out[role] = rule.size.preferred;
  }
  return out;
}

function minSize(rule: RoleRule, scenario: FontScenario): number {
  return scenario === 'fallback' ? (rule.size.fallbackMin ?? rule.size.min) : rule.size.min;
}

const SHRINK_ORDER: readonly TextRole[] = ['body', 'sub', 'tagline', 'kicker', 'headline'];

/** Solve the overlay placement for one font scenario, or report that the copy must stack. */
export function solveHeroOverlay(c: EditorialZoneContract, copy: HeroText, scenario: FontScenario): HeroPlan {
  const sizes = preferredSizes(c);
  const expansion = Math.max(c.floor, c.expansionFloor ?? c.floor);
  const steps: ['L1' | 'L2' | 'L3', 'preferred' | 'max', number, string][] = [
    ['L1', 'preferred', c.floor, 'L1 WRAP INSIDE TEXT-SAFE AREA'],
    ['L2', 'max', c.floor, 'L2 MAXIMUM LINE COUNT'],
    ['L3', 'max', expansion, 'L3 EXPANSION FLOOR'],
  ];
  const decisions: string[] = [];
  let last: Failure | null = null;
  for (const [level, limit, floor, label] of steps) {
    if (level === 'L3' && expansion === c.floor) continue;
    const r = attempt(c, copy, sizes, limit, floor, scenario);
    decisions.push(label);
    if (r.ok) return { scenario, mode: 'OVERLAY', level, roles: r.roles, omitted: r.omitted, decisions, bottom: r.bottom };
    last = r.failure;
    decisions.push(`  ${r.failure.role.toUpperCase()} ${r.failure.cause}`);
  }
  for (let guard = 0; guard < 80 && last; guard += 1) {
    const candidates = last.cause === 'FLOOR' || last.cause === 'MIN_WIDTH' ? SHRINK_ORDER : [last.role];
    const role = candidates.find((r) => {
      const rule = c.roles[r];
      return rule && textOf(copy, r) && (sizes[r] ?? rule.size.preferred) > minSize(rule, scenario);
    });
    if (!role) break;
    const rule = c.roles[role]!;
    const step = role === 'headline' ? 1 : 0.5;
    sizes[role] = Math.max(minSize(rule, scenario), (sizes[role] ?? rule.size.preferred) - step);
    const r = attempt(c, copy, sizes, 'max', expansion, scenario);
    if (r.ok) {
      const changed = TEXT_ROLE_ORDER.filter((x) => c.roles[x] && sizes[x] !== c.roles[x]!.size.preferred).map(
        (x) => `${x.toUpperCase()} ${c.roles[x]!.size.preferred}→${sizes[x]}PX`,
      );
      decisions.push(`L4 FONT WITHIN LIMITS: ${changed.join(', ')}`);
      return { scenario, mode: 'OVERLAY', level: 'L4', roles: r.roles, omitted: r.omitted, decisions, bottom: r.bottom };
    }
    last = r.failure;
  }
  decisions.push(`L5 STACK ABOVE ART: ${last ? `${last.role.toUpperCase()} ${last.cause}` : 'NO PLACEMENT'}`);
  return { ...solveHeroStack(c, copy, scenario), decisions };
}

/** Live text region above the art: full column width, authority sizes, no floor. */
export function solveHeroStack(c: EditorialZoneContract, copy: HeroText, scenario: FontScenario): HeroPlan {
  const full = c.canvas.width - c.inset.left * 2;
  const roles: PlacedRole[] = [];
  let y = 0;
  for (const role of TEXT_ROLE_ORDER) {
    const text = textOf(copy, role);
    const rule = c.roles[role];
    if (!text || !rule) continue;
    let size = rule.size.preferred;
    const floorSize = role === 'headline' ? Math.round(rule.size.preferred * 0.6) : minSize(rule, scenario);
    const width = Math.min(full, (rule.maxWidth ?? full) * (role === 'body' || role === 'sub' ? 1.6 : 1)) - (rule.trailing ?? 0);
    let wrapped = wrapText(text, fitWidth(width), fontOf(rule, size), scenario);
    while (size > floorSize && (wrapped.longestWord > fitWidth(width) || (role === 'headline' && wrapped.lines.length > copy.headline.length))) {
      size -= role === 'headline' ? 1 : 0.5;
      wrapped = wrapText(text, fitWidth(width), fontOf(rule, size), scenario);
    }
    const lh = scaledLineHeight(rule, size);
    const gap = roles.length ? rule.gapBefore : 0;
    const y0 = y + gap;
    const w = Math.floor(Math.min(full, width));
    roles.push({ role, size, lineHeight: lh, width: w, trailing: rule.trailing ?? 0, segments: [{ width: w, lines: wrapped.lines }], lines: wrapped.lines, widest: wrapped.widest, y0, y1: y0 + wrapped.lines.length * lh, gap });
    y = y0 + wrapped.lines.length * lh;
  }
  return { scenario, mode: 'STACK', level: 'L5', roles, omitted: [], decisions: ['L5 STACK ABOVE ART'], bottom: y };
}

export type HeroLayout = {
  /** Inline geometry: what webfont clients and the studio preview render. */
  base: HeroPlan;
  /** Geometry for clients that refuse webfonts (Gmail, Outlook desktop, Outlook.com). */
  fallback: HeroPlan;
};

/** Both client scenarios. If the authority font must stack, every client stacks. */
export function planHero(c: EditorialZoneContract, copy: HeroText): HeroLayout {
  const base = solveHeroOverlay(c, copy, 'webfont');
  if (base.mode === 'STACK') return { base, fallback: solveHeroStack(c, copy, 'fallback') };
  return { base, fallback: solveHeroOverlay(c, copy, 'fallback') };
}

/** Widest rendered line for a role at a size, for tests and diagnostics. */
export function measureRole(rule: RoleRule, text: string, size: number, scenario: FontScenario): number {
  return Math.max(0, ...text.split('\n').map((l) => textWidth(l, fontOf(rule, size), scenario)));
}
