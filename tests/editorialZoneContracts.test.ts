import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { simulateFallbackClient } from '../shared/site00-correspondence-studio/editorial/clientSimulation';
import { breakUnits, textWidth, wrapText } from '../shared/site00-correspondence-studio/editorial/measure';
import { fitWidth, planHero, solveHeroOverlay, type HeroText } from '../shared/site00-correspondence-studio/editorial/solve';
import { rectsIntersect, safeRight, type EditorialZoneContract } from '../shared/site00-correspondence-studio/editorial/zones';
import { FNDATN01_FIXTURE_CONTEXT, FNDATN01_FIXTURE_NOTE, FNDATN01_STRESS_LONG_CONTEXT, fixtureFor } from '../shared/site00-correspondence-studio/fndatn01/fixtures';
import { button } from '../shared/site00-correspondence-studio/fndatn01/html';
import { renderFndatn01Email } from '../shared/site00-correspondence-studio/fndatn01/render';
import { FNDATN01_EMAIL_IDS, fndatn01DesktopZone, fndatn01MobileZone } from '../shared/site00-correspondence-studio/fndatn01/zones';
import { getCorrespondenceWorkspace } from '../shared/site00-correspondence-studio/workspace';

type Measured = { heroes: Record<string, Record<'desktop' | 'mobile', { authority_lines: number[][]; authority_text_right: number; canvas: number[] }>> };
const MEASURED: Measured = JSON.parse(
  readFileSync(join(process.cwd(), 'docs/site00/correspondence/fndatn-01/FNDATN_01_EDITORIAL_ZONES_MEASURED.json'), 'utf8'),
);

const CONTRACTS: EditorialZoneContract[] = FNDATN01_EMAIL_IDS.flatMap((id) => [fndatn01DesktopZone(id, 2), fndatn01MobileZone(id, 3)]);

const COPY: HeroText = {
  kicker: 'FOR CLIENT',
  headline: ['YOUR', 'FOUNDATION', 'IS READY'],
  body: 'WE HAVE PREPARED EVERYTHING YOU NEED FOR THE NEXT STEP. REVIEW THE DETAILS AT YOUR PACE AND REPLY WITH ANY QUESTIONS YOU HAVE.',
  tagline: 'SAME VISION.\nMORE CLARITY.\nA STRONGER TOMORROW.',
};

describe('FNDATN-01 editorial zone contracts', () => {
  it('declares one desktop and one mobile contract for each of the seven emails', () => {
    expect(CONTRACTS).toHaveLength(14);
    for (const c of CONTRACTS) {
      expect(c.schema).toBe('SITE00_EDITORIAL_ZONE_V1');
      expect(c.overflow).toBe('NEVER_CLIP');
      expect(c.fallback).toBe('STACK_ABOVE_ART');
      expect(c.protectedZones.length).toBeGreaterThan(0);
    }
  });

  it('matches the measured art canvas and authority copy edge', () => {
    for (const c of CONTRACTS) {
      const m = MEASURED.heroes[c.slug][c.device];
      expect(c.authorityTextRight).toBe(m.authority_text_right);
      expect(c.canvas.width).toBe(m.canvas[0]);
      expect(Math.abs(c.canvas.height - m.canvas[1])).toBeLessThanOrEqual(1);
    }
  });

  it('keeps the text-safe edge near the approved copy edge', () => {
    for (const c of CONTRACTS) {
      // Desktop authority copy starts left of the hero crop while live copy keeps a 28px inset.
      const tolerance = c.device === 'desktop' ? 62 : 12;
      expect(c.maxRight, `${c.slug} ${c.device}`).toBeLessThanOrEqual(c.authorityTextRight + tolerance);
    }
  });

  it('never marks founder-approved copy as protected art', () => {
    for (const c of CONTRACTS) {
      for (const line of MEASURED.heroes[c.slug][c.device].authority_lines) {
        for (const z of c.protectedZones) {
          expect(rectsIntersect(z.rect, line as unknown as readonly [number, number, number, number]), `${c.slug} ${c.device} ${z.id}`).toBe(false);
        }
      }
    }
  });

  it('places every planned line inside the safe area of its own row band', () => {
    for (const c of CONTRACTS) {
      for (const scenario of ['webfont', 'fallback'] as const) {
        const plan = solveHeroOverlay(c, COPY, scenario);
        if (plan.mode !== 'OVERLAY') continue;
        for (const r of plan.roles) {
          let line = 0;
          for (const seg of r.segments) {
            for (let i = 0; i < seg.lines.length; i += 1, line += 1) {
              const y0 = r.y0 + line * r.lineHeight;
              expect(c.inset.left + seg.width + r.trailing, `${c.slug} ${c.device} ${scenario} ${r.role}`).toBeLessThanOrEqual(
                safeRight(c, y0, y0 + r.lineHeight) + 0.001,
              );
            }
          }
          expect(r.y1).toBeLessThanOrEqual(Math.max(c.floor, c.expansionFloor ?? c.floor));
        }
      }
    }
  });

  it('is deterministic', () => {
    for (const c of CONTRACTS) expect(JSON.stringify(planHero(c, COPY))).toBe(JSON.stringify(planHero(c, COPY)));
  });

  it('walks the ladder: reduces within limits before stacking, and stacks rather than clip', () => {
    const c = fndatn01DesktopZone('07', 3);
    const long = solveHeroOverlay(c, { ...COPY, body: `${COPY.body} ${COPY.body} ${COPY.body}` }, 'webfont');
    expect(long.mode).toBe('STACK');
    expect(long.decisions.some((d) => d.startsWith('L5'))).toBe(true);
    const plan = solveHeroOverlay(c, { ...COPY, headline: ['YOUR QUOTE', 'IS ABOUT TO', 'EXPIRE SOON'] }, 'webfont');
    for (const r of plan.roles) expect(r.size).toBeGreaterThanOrEqual(c.roles[r.role]!.size.min);
  });

  it('drops the kicker rule before wrapping a long name', () => {
    const c = fndatn01MobileZone('01', 2);
    const plan = solveHeroOverlay(c, { ...COPY, headline: ['BEGIN YOUR', 'FOUNDATION'], kicker: 'FOR MAXIMILIANA-ALEXANDRIA' }, 'webfont');
    expect(plan.mode).toBe('OVERLAY');
    expect(plan.roles.find((r) => r.role === 'kicker')!.trailing).toBe(0);
  });
});

describe('editorial measurement', () => {
  it('reads Arial-metric fallback text as wider than the display face', () => {
    const font = { family: 'display' as const, weight: 900, size: 46, tracking: 0 };
    expect(textWidth('RECOMMENDATION', font, 'fallback')).toBeGreaterThan(textWidth('RECOMMENDATION', font, 'webfont') * 1.8);
  });

  it('breaks after hyphens the way browsers do', () => {
    expect(breakUnits('FOR MAXIMILIANA-ALEXANDRIA').map((u) => u.text)).toEqual(['FOR', 'MAXIMILIANA-', 'ALEXANDRIA']);
    const font = { family: 'body' as const, weight: 500, size: 11, tracking: 0.2 };
    expect(wrapText('MAXIMILIANA-ALEXANDRIA', 120, font, 'webfont').lines).toEqual(['MAXIMILIANA-', 'ALEXANDRIA']);
  });

  it('wraps inside a proportional margin', () => {
    expect(fitWidth(200)).toBeCloseTo(193);
    expect(fitWidth(40)).toBe(38);
  });
});

describe('email client fallbacks', () => {
  const html = renderFndatn01Email('03', fixtureFor('03'), { ...FNDATN01_FIXTURE_CONTEXT, mode: 'review', assetBase: '', reviewNote: FNDATN01_FIXTURE_NOTE });
  if (!html.ok) throw new Error('fixture ineligible');

  it('ships a webfont variant and a fallback variant with client targeting', () => {
    expect(html.html).toMatch(/class="hero desk-only ez-a"/);
    expect(html.html).toMatch(/class="hero desk-only ez-b"[^>]*data-ez-variant="fallback"/);
    expect(html.html).toContain('<!--[if mso]><table class="hero desk-only"');
    expect(html.html).toContain('u + .body table.ez-b.desk-only');
    expect(html.html).toContain('[class~="x_ez-b"][class~="x_desk-only"]');
    expect(html.html).toContain('<body id="body" class="body"');
    const heroCells = html.html.match(/<table class="hero[^"]*"[^>]*>\s*<tr><td[^>]*>/g) ?? [];
    expect(heroCells.length).toBeGreaterThan(0);
    for (const cell of heroCells.filter((c) => c.includes('background-image'))) expect(cell).toContain('background-position:left top');
  });

  it('simulates a webfont-refusing client the way Gmail wraps the body', () => {
    const sim = simulateFallbackClient(html.html);
    expect(sim).not.toContain('@font-face');
    expect(sim).not.toContain("'Arial Narrow'");
    expect(sim).toMatch(/<body[^>]*><u><\/u><div id="body" class="body"/);
  });

  it('grows the Outlook button for a long label instead of clipping it', () => {
    expect(button('OPEN', 'https://site00.com')).toContain('height:46px');
    expect(button('REVIEW YOUR RECOMMENDATION & QUOTE', 'https://site00.com', { width: 220 })).toMatch(/height:(62|78|94)px/);
    expect(button('OPEN', 'https://site00.com')).not.toContain('white-space:nowrap');
  });

  it('moves long receipt values to the standard mobile ledger', () => {
    const long = renderFndatn01Email('04', fixtureFor('04', 'stress_long'), { ...FNDATN01_STRESS_LONG_CONTEXT, mode: 'review', assetBase: '' });
    const normal = renderFndatn01Email('04', fixtureFor('04'), { ...FNDATN01_FIXTURE_CONTEXT, mode: 'review', assetBase: '' });
    if (!long.ok || !normal.ok) throw new Error('fixture ineligible');
    expect(normal.html).toContain('receipt-mobile.jpg');
    expect(long.html).not.toContain('receipt-mobile.jpg');
    expect(long.html).toContain('CORPORATE CARD ENDING 4242');
    expect(long.html).not.toMatch(/white-space:nowrap;overflow:hidden/);
  });

  it('registers normal and stress previews for every email in the studio', () => {
    const ws = getCorrespondenceWorkspace();
    const fndatn = Object.values(ws.templates).filter((t) => t.versions.some((v) => v.pack_id === 'FNDATN-01'));
    expect(fndatn).toHaveLength(7);
    for (const t of fndatn) {
      const ids = t.versions.at(-1)!.state_previews!.map((p) => p.id);
      expect(ids).toEqual(expect.arrayContaining(['stress_long', 'stress_short']));
    }
  });
});
