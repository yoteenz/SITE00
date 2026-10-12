/**
 * FNDATN-01 editorial geometry in a real browser. Every assertion reads rendered boxes:
 * text line rects from DOM ranges, the hero art cell, protected zones mapped through the art's
 * cover scale, CTA boxes and scroll extents. No string-length or CSS-source checks.
 *
 * Scenarios: `webfont` loads the pack fonts; `fallback` blocks them and wraps the body as Gmail does,
 * so the email's own fallback-client CSS and the Arial-metric plan are what render.
 */
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright';
import { emailForClient, type ClientFontScenario } from '../shared/site00-correspondence-studio/editorial/clientSimulation';
import { FNDATN01_FIXTURE_CONTEXT, FNDATN01_FIXTURE_NOTE, FNDATN01_STRESS_LONG_CONTEXT, fixtureFor, type Fndatn01FixtureVariant } from '../shared/site00-correspondence-studio/fndatn01/fixtures';
import { desktopHero, mobileHero, type HeroCopy } from '../shared/site00-correspondence-studio/fndatn01/hero';
import { assetResolver } from '../shared/site00-correspondence-studio/fndatn01/html';
import { documentHtml } from '../shared/site00-correspondence-studio/fndatn01/layout';
import { FNDATN01_PUBLIC_ROOT, type Fndatn01EmailId } from '../shared/site00-correspondence-studio/fndatn01/pack';
import { renderFndatn01Email } from '../shared/site00-correspondence-studio/fndatn01/render';
import { FNDATN01_EMAIL_IDS, fndatn01DesktopZone, fndatn01MobileZone } from '../shared/site00-correspondence-studio/fndatn01/zones';
import { launchPlaywrightChromiumOrSkip } from './setup/playwrightLaunchCi';

const ORIGIN = 'http://fndatn01.geometry.test';
const VIEWPORTS = [390, 430, 600, 768, 1280] as const;
const SCENARIOS: ClientFontScenario[] = ['webfont', 'fallback'];
const PUBLIC = join(process.cwd(), 'public');
const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.webp': 'image/webp' };

type ZoneMap = Record<string, { canvas: { width: number; height: number }; zones: { id: string; rect: readonly number[] }[] }>;

function zoneMap(): ZoneMap {
  const out: ZoneMap = {};
  for (const id of FNDATN01_EMAIL_IDS) {
    for (const c of [fndatn01DesktopZone(id, 2), fndatn01MobileZone(id, 3)]) {
      out[`${c.slug}:${c.device}`] = { canvas: c.canvas, zones: c.protectedZones.map((z) => ({ id: z.id, rect: z.rect })) };
    }
  }
  return out;
}

const ZONES = zoneMap();
const documents = new Map<string, string>();

function renderEmail(id: Fndatn01EmailId, variant: Fndatn01FixtureVariant): string {
  const r = renderFndatn01Email(id, fixtureFor(id, variant), {
    ...(variant === 'stress_long' ? FNDATN01_STRESS_LONG_CONTEXT : FNDATN01_FIXTURE_CONTEXT),
    mode: 'review',
    assetBase: '',
    founderAuthorized: id === '01',
    reviewNote: FNDATN01_FIXTURE_NOTE,
  });
  if (!r.ok) throw new Error(`${id} ${variant} ineligible: ${r.eligibility.reasons.join(',')}`);
  return r.html;
}

/** Heroes alone with synthetic body paragraphs that set in roughly two, four and six lines. */
const PARAGRAPHS: Record<number, string> = {
  2: 'YOUR NEXT STEP IS READY WHENEVER YOU ARE.',
  4: 'WE HAVE PREPARED EVERYTHING YOU NEED FOR THE NEXT STEP. REVIEW THE DETAILS AT YOUR PACE AND REPLY WITH ANY QUESTIONS YOU HAVE.',
  6: 'WE HAVE PREPARED EVERYTHING YOU NEED FOR THE NEXT STEP OF YOUR DIGITAL FOUNDATION. REVIEW THE DETAILS AT YOUR OWN PACE, CONFIRM WHAT LOOKS RIGHT, AND REPLY TO THIS EMAIL WITH ANY QUESTIONS. OUR TEAM READS EVERY REPLY.',
};
const HEADLINES: Record<Fndatn01EmailId, string[]> = {
  '01': ['BEGIN YOUR', 'FOUNDATION'],
  '02': ["WE'VE RECEIVED", 'YOUR INTAKE'],
  '03': ['YOUR', 'RECOMMENDATION', 'IS READY'],
  '04': ['PAYMENT', 'RECEIVED'],
  '05': ['YOUR', 'FOUNDATION', 'IS COMPLETE'],
  '06': ['YOUR', 'FOUNDATION', 'IS ALMOST READY'],
  '07': ['YOUR QUOTE', 'IS ABOUT TO', 'EXPIRE SOON'],
};

function heroHarness(id: Fndatn01EmailId, lines: number): string {
  const asset = assetResolver('', FNDATN01_PUBLIC_ROOT);
  const copy: HeroCopy = {
    kicker: 'FOR <span class="v">CLIENT</span>',
    headline: HEADLINES[id],
    deskSize: id === '06' ? 34 : undefined,
    body: PARAGRAPHS[lines],
    tagline: ['SAME VISION.', 'MORE CLARITY.', 'A STRONGER TOMORROW.'],
  };
  const d = desktopHero(asset, id, copy, 'Hero art');
  const m = mobileHero(asset, id, copy, 'Hero art');
  return documentHtml({
    title: 'harness',
    preheader: 'harness',
    assetBase: '',
    root: FNDATN01_PUBLIC_ROOT,
    inbox: null,
    label: 'harness',
    blocks: [d.html, m.html],
    styles: [d.css, m.css],
  });
}

async function route(page: Page, scenario: ClientFontScenario) {
  await page.route(`${ORIGIN}/**`, async (r) => {
    const url = new URL(r.request().url());
    if (url.pathname.startsWith('/__email/')) {
      const html = documents.get(decodeURIComponent(url.pathname.slice('/__email/'.length)));
      return html ? r.fulfill({ status: 200, contentType: 'text/html', body: emailForClient(html, scenario) }) : r.fulfill({ status: 404 });
    }
    if (scenario === 'fallback' && url.pathname.endsWith('.woff2')) return r.abort();
    const file = join(PUBLIC, decodeURIComponent(url.pathname));
    if (!file.startsWith(PUBLIC) || !existsSync(file)) return r.fulfill({ status: 404 });
    return r.fulfill({ status: 200, contentType: MIME[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
  });
}

type Report = { violations: string[]; heroes: { key: string; mode: string; level: string; variant: string }[]; fonts: { display: boolean; faces: number } };

/** Runs inside the page. Returns every geometry violation found. */
function inspect({ zones, vw }: { zones: ZoneMap; vw: number }): Report {
  const out: string[] = [];
  const visible = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const textRects = (root: Element) => {
    const rects: { r: DOMRect; t: string }[] = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const t = (n.textContent ?? '').trim();
      if (!t) continue;
      const parent = n.parentElement;
      if (!parent || !visible(parent)) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of Array.from(rg.getClientRects())) if (r.width > 0.5 && r.height > 0.5) rects.push({ r, t: t.slice(0, 28) });
    }
    return rects;
  };
  const hit = (a: { left: number; top: number; right: number; bottom: number }, b: { left: number; top: number; right: number; bottom: number }) =>
    a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 0.5) out.push(`HORIZONTAL_OVERFLOW scrollWidth ${sw} > ${vw}`);

  const heroes = Array.from(document.querySelectorAll<HTMLElement>('[data-ez-hero]')).filter(visible);
  if (heroes.length !== 1) out.push(`VISIBLE_HEROES ${heroes.length}`);
  for (const h of heroes) {
    const key = `${h.dataset.ezHero}:${h.dataset.ezDevice}`;
    const z = zones[key];
    const artCell = h.querySelector('.ez-art');
    if (!z || !artCell) {
      out.push(`HERO_UNREADABLE ${key}`);
      continue;
    }
    const rects = Array.from(h.querySelectorAll('[data-ez-role]')).flatMap((el) => textRects(el).map((x) => ({ ...x, role: (el as HTMLElement).dataset.ezRole })));
    if (!rects.some((x) => x.role === 'headline')) out.push(`HEADLINE_MISSING ${key}`);
    if (h.dataset.ezMode === 'OVERLAY') {
      const art = artCell.getBoundingClientRect();
      const s = Math.max(art.width / z.canvas.width, art.height / z.canvas.height);
      const expectedHeight = (h.dataset.ezDevice === 'mobile' ? Math.max(1, art.width / z.canvas.width) : 1) * z.canvas.height;
      if (art.height > expectedHeight + 21) out.push(`HERO_CELL_GREW ${key} ${art.height.toFixed(0)} > ${expectedHeight.toFixed(0)}`);
      for (const { r, t, role } of rects) {
        if (r.left < art.left - 0.5 || r.right > art.right + 0.5 || r.top < art.top - 0.5 || r.bottom > art.bottom + 0.5) {
          out.push(`TEXT_ESCAPES_SAFE_AREA ${key} ${role} "${t}"`);
        }
        for (const zn of z.zones) {
          const zr = {
            left: art.left + zn.rect[0] * s,
            top: art.top + zn.rect[1] * s,
            right: Math.min(art.right, art.left + zn.rect[2] * s),
            bottom: Math.min(art.bottom, art.top + zn.rect[3] * s),
          };
          if (zr.right <= zr.left || zr.bottom <= zr.top) continue;
          if (hit(r, zr)) out.push(`PROTECTED_ZONE_COLLISION ${key} ${role} "${t}" × ${zn.id}`);
        }
      }
    } else {
      const img = h.querySelector('.ez-art img')?.getBoundingClientRect();
      for (const { r, t, role } of rects) if (img && r.bottom > img.top + 0.5) out.push(`STACK_TEXT_ON_ART ${key} ${role} "${t}"`);
    }
  }

  for (const a of Array.from(document.querySelectorAll('[data-ez-cta]')).filter(visible)) {
    const ar = a.getBoundingClientRect();
    if (ar.left < -0.5 || ar.right > vw + 0.5) out.push(`CTA_OUTSIDE_VIEWPORT ${ar.left.toFixed(0)}-${ar.right.toFixed(0)}`);
    for (const { r, t } of textRects(a)) {
      if (r.left < ar.left - 0.5 || r.right > ar.right + 0.5 || r.top < ar.top - 0.5 || r.bottom > ar.bottom + 0.5) out.push(`CTA_TEXT_OVERFLOW "${t}"`);
    }
  }

  const email = document.querySelector('.email');
  if (email) {
    for (const el of Array.from(email.querySelectorAll('*'))) {
      if (!visible(el) || !(el.textContent ?? '').trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.push(`CLIPPED ${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`);
    }
    const outside = textRects(email).filter(({ r }) => r.right > vw + 0.5 || r.left < -0.5);
    for (const { t } of outside.slice(0, 5)) out.push(`TEXT_OUTSIDE_VIEWPORT "${t}"`);
  }

  return {
    violations: out,
    heroes: heroes.map((h) => ({ key: `${h.dataset.ezHero}:${h.dataset.ezDevice}`, mode: h.dataset.ezMode ?? '', level: h.dataset.ezLevel ?? '', variant: h.dataset.ezVariant ?? '' })),
    fonts: { display: document.fonts.check('900 40px "SITE 00 Display"') && Array.from(document.fonts).some((f) => f.family.includes('SITE 00') && f.status === 'loaded'), faces: Array.from(document.fonts).length },
  };
}

let browser: Browser | null = null;
const pages: Partial<Record<ClientFontScenario, Page>> = {};

beforeAll(async () => {
  browser = await launchPlaywrightChromiumOrSkip();
  if (!browser) return;
  for (const scenario of SCENARIOS) {
    const page = await browser.newPage({ viewport: { width: 680, height: 900 }, deviceScaleFactor: 1 });
    await route(page, scenario);
    pages[scenario] = page;
  }
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function check(key: string, scenario: ClientFontScenario): Promise<Report[]> {
  const page = pages[scenario]!;
  const reports: Report[] = [];
  for (const vw of VIEWPORTS) {
    await page.setViewportSize({ width: vw, height: 900 });
    await page.goto(`${ORIGIN}/__email/${encodeURIComponent(key)}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(inspect, { zones: ZONES, vw });
    report.violations = report.violations.map((v) => `${vw}px ${scenario} ${v}`);
    if (scenario === 'webfont' && !report.fonts.display) report.violations.push(`${vw}px webfont DISPLAY_FONT_NOT_LOADED`);
    if (scenario === 'fallback' && report.fonts.faces > 0) report.violations.push(`${vw}px fallback WEBFONT_FACES_PRESENT ${report.fonts.faces}`);
    reports.push(report);
  }
  return reports;
}

const CASES: { id: Fndatn01EmailId; variant: Fndatn01FixtureVariant }[] = [
  ...FNDATN01_EMAIL_IDS.flatMap((id) => (['default', 'stress_long', 'stress_short'] as const).map((variant) => ({ id, variant }))),
  { id: '04', variant: 'activation_pending' },
];

describe('FNDATN-01 editorial geometry (real browser)', () => {
  for (const { id, variant } of CASES) {
    for (const scenario of SCENARIOS) {
      it(`${id} ${variant} · ${scenario} · ${VIEWPORTS.join('/')}`, async () => {
        if (!browser) return;
        const key = `${id}:${variant}`;
        documents.set(key, renderEmail(id, variant));
        const reports = await check(key, scenario);
        expect(reports.flatMap((r) => r.violations)).toEqual([]);
        const device = (vw: number) => (vw < 680 ? 'mobile' : 'desktop');
        reports.forEach((r, i) => expect(r.heroes.map((h) => h.key.split(':')[1])).toEqual([device(VIEWPORTS[i])]));
        if (scenario === 'webfont' && variant === 'default') {
          for (const r of reports) expect(r.heroes[0].mode, `${r.heroes[0].key} keeps the approved overlay`).toBe('OVERLAY');
        }
      }, 60_000);
    }
  }

  it('detector reports a widened body column, a clipped CTA and a page overflow', async () => {
    if (!browser) return;
    const page = pages.webfont!;
    documents.set('07:control', renderEmail('07', 'default'));
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(`${ORIGIN}/__email/${encodeURIComponent('07:control')}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const hero = Array.from(document.querySelectorAll<HTMLElement>('[data-ez-hero]')).find((h) => getComputedStyle(h).display !== 'none')!;
      hero.querySelectorAll<HTMLElement>('p[data-ez-role="body"]').forEach((p) => {
        p.style.width = '420px';
        p.style.maxWidth = '420px';
      });
      hero.querySelectorAll<HTMLElement>('table[width]').forEach((t) => t.removeAttribute('width'));
      hero.querySelectorAll<HTMLElement>('td[width]').forEach((t) => (t.style.width = 'auto'));
      const cta = Array.from(document.querySelectorAll<HTMLElement>('[data-ez-cta]')).find((a) => a.getBoundingClientRect().width > 0)!;
      cta.style.cssText += ';white-space:nowrap;overflow:hidden;width:80px';
      const wide = document.createElement('div');
      wide.style.width = '900px';
      wide.textContent = 'OVERFLOW';
      document.querySelector('.email')!.appendChild(wide);
    });
    const report = await page.evaluate(inspect, { zones: ZONES, vw: 768 });
    const kinds = new Set(report.violations.map((v) => v.split(' ')[0]));
    expect(kinds).toContain('PROTECTED_ZONE_COLLISION');
    expect(kinds).toContain('CLIPPED');
    expect(kinds).toContain('HORIZONTAL_OVERFLOW');
  }, 60_000);

  for (const id of FNDATN01_EMAIL_IDS) {
    for (const lines of [2, 4, 6]) {
      it(`${id} hero harness · ${lines}-line paragraph · webfont + fallback`, async () => {
        if (!browser) return;
        const key = `${id}:harness:${lines}`;
        documents.set(key, heroHarness(id, lines));
        const reports = [...(await check(key, 'webfont')), ...(await check(key, 'fallback'))];
        expect(reports.flatMap((r) => r.violations)).toEqual([]);
      }, 60_000);
    }
  }
});
