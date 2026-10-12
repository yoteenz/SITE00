/**
 * FNDATN-01 heroes rendered from solved editorial plans (editorial/solve.ts).
 *
 * Every hero carries the webfont plan inline. When the Arial-metric plan differs, a second variant is
 * emitted for clients that refuse webfonts: Outlook desktop through conditional comments, Gmail through
 * `u + .body`, Outlook.com through its `x_` class prefix. Art is anchored top-left so it crops or
 * scales away from the copy at every served width.
 */
import { planHero, type HeroLayout, type HeroPlan, type HeroText, type PlacedRole } from '../editorial/solve.js';
import type { EditorialZoneContract } from '../editorial/zones.js';
import { plainText } from '../editorial/measure.js';
import { FONT_BODY, T, bgCell, esc, headlineAt, img, kicker, mobileOnly, type AssetResolver } from './html.js';
import { fndatn01DesktopZone, fndatn01MobileZone } from './zones.js';
import type { Fndatn01EmailId } from './pack.js';

export type HeroCopy = {
  /** Markup; personalization stays wrapped in `.v`. */
  kicker: string | null;
  headline: string[];
  sub?: string;
  body: string;
  tagline?: string[];
  /** Desktop headline base size for a long line (06). */
  deskSize?: number;
};

export type HeroBlock = { html: string; css: string; layout: HeroLayout; contract: EditorialZoneContract };

function heroText(copy: HeroCopy): HeroText {
  return {
    kicker: copy.kicker ? plainText(copy.kicker) : undefined,
    headline: copy.headline,
    sub: copy.sub,
    body: copy.body,
    tagline: copy.tagline?.join('\n'),
  };
}

function gap(h: number): string {
  return h > 0 ? `<div style="height:${h}px;line-height:${h}px;font-size:1px">&nbsp;</div>` : '';
}

function joinLines(lines: string[]): string {
  return lines.reduce((acc, l) => (acc ? `${acc}${acc.endsWith('-') ? '' : ' '}${l}` : l), '');
}

type RoleStyle = { weight: number; tracking: string; color: string };
const ROLE_STYLE: Record<'sub' | 'body' | 'tagline', RoleStyle> = {
  sub: { weight: 600, tracking: '.1em', color: T.ink },
  body: { weight: 500, tracking: '.07em', color: T.ink },
  tagline: { weight: 500, tracking: '.2em', color: T.ink },
};

/**
 * `fluid` sets columns as max-widths (stacked copy above art); otherwise columns are fixed widths that
 * reproduce the solver's line breaks.
 */
function roleHtml(r: PlacedRole, copy: HeroCopy, tracking: { body: string }, fluid: boolean): string {
  const dim = (w: number) => (fluid ? `width:100%;max-width:${w}px` : `width:${w}px;max-width:${w}px`);
  const attrs = `data-ez-role="${r.role}" data-ez-size="${r.size}"`;
  switch (r.role) {
    case 'kicker':
      return `<div ${attrs} style="${dim(r.width + r.trailing)}">${kicker(copy.kicker ?? '', { size: r.size, lineHeight: r.lineHeight, rule: r.trailing > 0 })}</div>`;
    case 'headline':
      return `<div ${attrs} style="${dim(r.width)}">${headlineAt(copy.headline, r.size, r.lineHeight)}</div>`;
    case 'sub':
    case 'body':
    case 'tagline': {
      const st = ROLE_STYLE[r.role];
      const ls = r.role === 'body' ? tracking.body : st.tracking;
      const p = (text: string, w: number, seg: number) =>
        `<p ${attrs} data-ez-seg="${seg}" style="margin:0;${dim(w)};font-family:${FONT_BODY};font-size:${r.size}px;line-height:${r.lineHeight}px;letter-spacing:${ls};font-weight:${st.weight};color:${st.color};text-transform:uppercase">${text}</p>`;
      if (r.role === 'tagline') {
        return `<div style="width:24px;height:1px;line-height:1px;font-size:1px;background:${T.ink};margin:0 0 9px">&nbsp;</div>${p((copy.tagline ?? []).map(esc).join('<br>'), r.width, 0)}`;
      }
      if (r.role === 'sub' || fluid) return p(esc(r.role === 'sub' ? (copy.sub ?? '') : copy.body), r.width, 0);
      return r.segments.map((sg, i) => p(esc(joinLines(sg.lines)), sg.width, i)).join('\n');
    }
  }
}

/** The tagline sits 9px below its rule; the solver's 22px gap already includes the rule. */
function gapFor(r: PlacedRole): number {
  return r.role === 'tagline' ? r.gap - 10 : r.gap;
}

function copyHtml(plan: HeroPlan, copy: HeroCopy, tracking: { body: string }, fluid: boolean): string {
  return plan.roles.map((r) => `${gap(gapFor(r))}${roleHtml(r, copy, tracking, fluid)}`).join('\n');
}

type Variant = 'webfont' | 'fallback';

function heroAttrs(c: EditorialZoneContract, plan: HeroPlan, variant: Variant): string {
  return `data-ez-hero="${c.slug}" data-ez-device="${c.device}" data-ez-variant="${variant}" data-ez-mode="${plan.mode}" data-ez-level="${plan.level}"`;
}

function overlay(asset: AssetResolver, c: EditorialZoneContract, plan: HeroPlan, copy: HeroCopy, cls: string, hidden: string, alt: string, variant: Variant): string {
  const tracking = { body: c.device === 'mobile' ? '.06em' : '.07em' };
  const w = c.inset.left + Math.max(...plan.roles.map((r) => r.width + r.trailing));
  const content = `<table role="presentation" width="${w}" cellpadding="0" cellspacing="0" border="0" align="left" style="width:${w}px"><tr>
<td width="${w}" valign="top" style="width:${w}px;padding:${c.inset.top}px 0 0 ${c.inset.left}px">
${copyHtml(plan, copy, tracking, false)}
</td>
</tr></table>`;
  const src = asset(c.art);
  const mobileClass = c.device === 'mobile' ? `full ez-mh-${c.slug}` : '';
  return `<table class="${cls}" ${heroAttrs(c, plan, variant)} role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${hidden}width:100%" aria-label="${esc(alt)}">
<tr>${bgCell({ src, width: c.canvas.width, height: c.canvas.height, fallback: '#ebe8e3', position: 'left top', content, className: `${mobileClass} ez-art`.trim() })}</tr>
</table>`;
}

function stack(asset: AssetResolver, c: EditorialZoneContract, plan: HeroPlan, copy: HeroCopy, cls: string, hidden: string, alt: string, variant: Variant): string {
  const tracking = { body: c.device === 'mobile' ? '.06em' : '.07em' };
  return `<table class="${cls}" ${heroAttrs(c, plan, variant)} role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${hidden}width:100%;background:#ffffff" aria-label="${esc(alt)}">
<tr><td valign="top" style="padding:${c.inset.top}px ${c.inset.left}px 22px ${c.inset.left}px">
${copyHtml(plan, copy, tracking, true)}
</td></tr>
<tr><td class="ez-art" style="padding:0;line-height:0;font-size:0">${img(asset(c.art), alt, c.canvas.width, null, 'width:100%;height:auto;')}</td></tr>
</table>`;
}

function render(asset: AssetResolver, c: EditorialZoneContract, plan: HeroPlan, copy: HeroCopy, cls: string, hidden: string, alt: string, variant: Variant): string {
  return plan.mode === 'STACK' ? stack(asset, c, plan, copy, cls, hidden, alt, variant) : overlay(asset, c, plan, copy, cls, hidden, alt, variant);
}

function samePlan(a: HeroPlan, b: HeroPlan): boolean {
  const key = (p: HeroPlan) => JSON.stringify([p.mode, p.roles.map((r) => [r.role, r.size, r.lineHeight, r.trailing, r.segments])]);
  return key(a) === key(b);
}

const HIDDEN = 'display:none;max-height:0;overflow:hidden;mso-hide:all;';

/** Mobile art keeps its proportions up to the desktop breakpoint: heights step every 20 px. */
function mobileHeightCss(c: EditorialZoneContract): string {
  const rules: string[] = [];
  for (let w = 410; w < 680; w += 20) {
    const h = Math.round((c.canvas.height * w) / c.canvas.width);
    rules.push(`@media screen and (min-width:${w}px) and (max-width:679px){td.ez-mh-${c.slug}{height:${h}px!important}}`);
  }
  return rules.join('\n');
}

export function desktopHero(asset: AssetResolver, id: Fndatn01EmailId, copy: HeroCopy, alt: string): HeroBlock {
  const c = fndatn01DesktopZone(id, copy.headline.length, copy.deskSize);
  const layout = planHero(c, heroText(copy));
  const base = 'hero desk-only';
  if (samePlan(layout.base, layout.fallback)) {
    return { html: render(asset, c, layout.base, copy, base, '', alt, 'webfont'), css: '', layout, contract: c };
  }
  const a = render(asset, c, layout.base, copy, `${base} ez-a`, '', alt, 'webfont');
  const b = render(asset, c, layout.fallback, copy, `${base} ez-b`, HIDDEN, alt, 'fallback');
  const mso = render(asset, c, layout.fallback, copy, base, '', alt, 'fallback');
  return { html: `<!--[if !mso]><!-->${a}\n${b}<!--<![endif]-->\n<!--[if mso]>${mso}<![endif]-->`, css: '', layout, contract: c };
}

export function mobileHero(asset: AssetResolver, id: Fndatn01EmailId, copy: HeroCopy, alt: string): HeroBlock {
  const c = fndatn01MobileZone(id, copy.headline.length);
  const layout = planHero(c, heroText({ ...copy, tagline: undefined }));
  const base = 'hero mob-only';
  const css = mobileHeightCss(c);
  if (samePlan(layout.base, layout.fallback)) {
    return { html: mobileOnly(render(asset, c, layout.base, copy, base, HIDDEN, alt, 'webfont')), css, layout, contract: c };
  }
  const a = render(asset, c, layout.base, copy, `${base} ez-a`, HIDDEN, alt, 'webfont');
  const b = render(asset, c, layout.fallback, copy, `${base} ez-b`, HIDDEN, alt, 'fallback');
  return { html: mobileOnly(`${a}\n${b}`), css, layout, contract: c };
}
