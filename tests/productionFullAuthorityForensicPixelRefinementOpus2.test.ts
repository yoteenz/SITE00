/**
 * P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2
 * Guards for the forensic record and the refinement built on it:
 *   · the recovered authority record (inventory / lineage / route map / unresolved / contact sheets) stays consistent;
 *   · Expression media resolves only to canonical, registered repo media (nothing generated, nothing borrowed);
 *   · the media kit keeps images primary (inspectable, internal rails, honest empties);
 *   · HUB, Production Floor, Inbox, Activity and Library keep one viewport and the 8.5px phone type floor.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { getProductionStudioWorldActorCatalogue } from '../shared/site00-studio-world/acting-catalogue/index.js';
import type { ExpressionData } from '../src/site00/components/productionAuthority/expression/expressionData';
import { actorMedia, aspectMedia, characterMedia, lookMedia, roleMedia, type MediaItem } from '../src/site00/components/productionAuthority/expression/expressionMedia';
import { FaceRail, Gallery, MediaCard, MediaGrid, RecordHero } from '../src/site00/components/productionAuthority/expression/ExpressionMediaKit';
import { PRODUCTION_ASSETS } from '../src/site00/productionAssets';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const json = <T,>(rel: string) => JSON.parse(read(rel)) as T;
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const FA = 'artifacts/production-full-authority-forensics';
const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(MemoryRouter, null, el));

/** CSS blocks inside one @media query (first occurrence of each matching query, concatenated). */
function mediaBlocks(css: string, query: string): string {
  const out: string[] = [];
  let i = css.indexOf(query);
  while (i > -1) {
    const open = css.indexOf('{', i);
    let depth = 0;
    let j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) break;
    }
    out.push(css.slice(open + 1, j));
    i = css.indexOf(query, j);
  }
  return out.join('\n');
}

describe('forensic authority record', () => {
  type Inv = { totals: Record<string, number>; by_family: Record<string, Record<string, number>>; entries: { authority_id: string; status: string; family: string }[] };
  const inv = json<Inv>(`${FA}/authority-inventory.json`);
  it('inventory totals reconcile with its own entries and family breakdown', () => {
    expect(inv.totals.files_inspected).toBe(4024);
    expect(inv.totals.visual_authorities).toBe(605);
    const fam = Object.values(inv.by_family);
    expect(fam.reduce((s, f) => s + f.found, 0)).toBe(inv.totals.visual_authorities);
    for (const k of ['CANONICAL', 'SUPERSEDED', 'DUPLICATE', 'CONFLICTING'] as const)
      expect(fam.reduce((s, f) => s + (f[k] ?? 0), 0), k).toBe(inv.totals[`visual_${k.toLowerCase()}`]);
    expect(inv.totals.visual_in_review + inv.totals.visual_unknown).toBe(0);
    for (const f of ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']) expect(inv.by_family[f]?.found, f).toBeGreaterThan(0);
  });
  it('route map covers every mapped route once with a known classification', () => {
    const map = json<{ totals: Record<string, number>; routes: { route: string; classification: string }[] }>(`${FA}/route-authority-map.json`);
    expect(map.routes).toHaveLength(map.totals.routes);
    expect(new Set(map.routes.map((r) => r.route)).size).toBe(map.routes.length);
    const known = ['EXACT_AUTHORITY_FOUND', 'PARTIAL_AUTHORITY', 'MULTIPLE_CONFLICTING_AUTHORITIES', 'NO_AUTHORITY_FOUND'];
    for (const r of map.routes) expect(known, r.route).toContain(r.classification);
    for (const k of known) expect(map.routes.filter((r) => r.classification === k).length, k).toBe(map.totals[k]);
  });
  it('unresolved record keeps every authority question open (never silently resolved)', () => {
    const u = json<{ unresolved: { id: string; kind: string }[] }>(`${FA}/unresolved-authorities.json`);
    const ids = u.unresolved.map((x) => x.id);
    for (let n = 1; n <= 13; n++) expect(ids).toContain(`U-${String(n).padStart(2, '0')}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('files-inspected ledger and authority contact sheets are committed', () => {
    const f = json<{ rows: unknown[] }>(`${FA}/files-inspected.json`);
    expect(f.rows).toHaveLength(4024);
    expect(existsSync(path.join(root, FA, 'contact-sheets'))).toBe(true);
  });
});

describe('Expression media resolver — canonical repo media only', () => {
  const cat = getProductionStudioWorldActorCatalogue();
  const d = {
    actor: (id: string | null | undefined) => cat.actors.find((a) => a.actorId === id) ?? null,
    charactersForRole: (req: string) => (req === 'cast-req-entry002-subject-woman' ? [{ characterId: 'char-entry002-subject-woman', actorId: null }] : []),
  } as unknown as ExpressionData;
  const all: MediaItem[] = [
    ...characterMedia(d, { characterId: 'char-entry002-subject-woman', actorId: null } as never),
    ...characterMedia(d, { characterId: 'char-entry002-ndx', actorId: null } as never),
    ...lookMedia({ era: '2016', label: '2016 IG BADDIE' } as never),
    ...lookMedia({ era: '2026', label: '2026 WOMAN' } as never),
    ...['outfits', 'hair', 'makeup', 'accessories'].flatMap(aspectMedia),
  ];
  const e2 = '/site00/production-authority-assets/entry-002/';

  it('characters lead with their own authority-board crops (portrait first)', () => {
    const subject = characterMedia(d, { characterId: 'char-entry002-subject-woman', actorId: null } as never);
    expect(subject[0]?.url).toBe(`${e2}subject-2026-portrait.jpg`);
    expect(subject.every((m) => m.url.startsWith(e2) && m.source.includes('AUTHORITY'))).toBe(true);
    expect(roleMedia(d, 'cast-req-entry002-subject-woman')).toEqual(subject);
    expect(roleMedia(d, 'cast-req-unknown')).toEqual([]);
  });
  it('a character without its own crops shows the playing actor — labelled as such', () => {
    const a = cat.actors[0]!;
    const m = characterMedia(d, { characterId: 'char-unknown', actorId: a.actorId } as never);
    expect(m.length).toBeGreaterThan(0);
    expect(m.every((x) => x.label.startsWith(`PLAYED BY ${a.stageName.toUpperCase()}`))).toBe(true);
    expect(characterMedia(d, null)).toEqual([]);
  });
  it('actors resolve to Studio World resident media, never to another record', () => {
    expect(actorMedia(null)).toEqual([]);
    const a = cat.actors[0]!;
    const m = actorMedia(a);
    expect(m[0]?.label).toBe('CASTING PORTRAIT');
    expect(m[0]?.url).toBe(a.headshotPreviewUrl);
    expect(new Set(m.map((x) => x.url)).size).toBe(m.length);
  });
  it('looks resolve by era (or the era in the label); unknown aspects stay empty', () => {
    expect(lookMedia({ era: '2016', label: '' } as never)[0]?.url).toBe(`${e2}look-2016-full.jpg`);
    expect(lookMedia({ era: 'X', label: 'THE 2026 WOMAN' } as never)[0]?.url).toBe(`${e2}look-2026-full.jpg`);
    expect(lookMedia(null)).toEqual([]);
    expect(aspectMedia('outfits')).toHaveLength(5);
    expect(aspectMedia('nope')).toEqual([]);
  });
  it('every resolver image exists on disk and is a registered PROJECT_CANON asset', () => {
    const reg = new Map(PRODUCTION_ASSETS.map((a) => [a.publicPath, a]));
    for (const m of all) {
      expect(m.url.startsWith(e2), m.url).toBe(true);
      expect(existsSync(path.join(root, 'public', m.url)), m.url).toBe(true);
      const rec = reg.get(m.url);
      expect(rec?.sourceType, m.url).toBe('PROJECT_CANON');
      expect(rec?.authorityStatus, m.url).toBe('USED_BY_AUTHORITY');
      expect(m.url).not.toMatch(/openart|https?:/);
    }
  });
  it('registry entry002 records mirror the derivation manifest (ids, files, source boards)', () => {
    const manifest = json<{ crops: { id: string; board: string }[] }>('public/site00/production-authority-assets/entry-002/manifest.json');
    const recs = PRODUCTION_ASSETS.filter((a) => a.assetId.startsWith('entry002.'));
    expect(recs.map((a) => a.assetId.slice(9)).sort()).toEqual(manifest.crops.map((c) => c.id).sort());
    for (const c of manifest.crops) {
      const r = recs.find((a) => a.assetId === `entry002.${c.id}`)!;
      expect(existsSync(path.join(root, r.repoPath!))).toBe(true);
      expect(r.notes).toContain(c.board);
      expect(existsSync(path.join(root, 'public/assets/expression-engine/entry-002/pre-storyboard-authority', c.board))).toBe(true);
    }
    expect(existsSync(path.join(root, 'public/site00/production-authority-assets/entry-002/SOURCE.md'))).toBe(true);
    expect(PRODUCTION_ASSETS.some((a) => a.assetRole === 'CAST_MEMBER' || a.assetId.startsWith('character.'))).toBe(false);
  });
});

describe('Expression media kit — image first, inspectable, honest empties', () => {
  const item = (n: number): MediaItem => ({ url: `/x/${n}.jpg`, label: `IMG ${n}`, source: 'TEST' });
  it('cards: primary media is an inspect button; no media renders an empty slot', () => {
    const full = html(createElement(MediaCard, { media: item(1), title: 'A', onInspect: () => {} }));
    expect(full).toMatch(/<button[^>]*class="exm-frame exm-frame--cover"[^>]*data-media="primary"/);
    const empty = html(createElement(MediaCard, { media: null, title: 'B', emptyLabel: 'NO CANONICAL IMAGE' }));
    expect(empty).toContain('exm-card exm-card--v is-empty');
    expect(empty).toContain('data-media="empty"');
  });
  it('gallery: thumbs ride an internal horizontal rail; phone-rail variant is opt-in', () => {
    const g = html(createElement(Gallery, { items: [item(1), item(2)], title: 'G', open: () => {}, testId: 'g' }));
    expect(g).toMatch(/class="exm-gallery__thumbs" data-scroll="internal-x"/);
    expect(g).not.toContain('exm-gallery--rail-m');
    expect(html(createElement(Gallery, { items: [item(1), item(2)], title: 'G', open: () => {}, railOnPhone: true }))).toContain('exm-gallery exm-gallery--rail-m');
    expect(html(createElement(Gallery, { items: [item(1)], title: 'G', open: () => {}, railOnPhone: true }))).not.toContain('exm-gallery__thumbs');
  });
  it('record hero facts scroll inside their pane; face rails and grids carry their layout contract', () => {
    expect(html(createElement(RecordHero, { media: item(1), title: 'H', facts: 'F' }))).toContain('class="exm-hero__facts" data-scroll="internal"');
    expect(html(createElement(FaceRail, { items: [{ key: 'a', media: item(1), name: 'A' }], label: 'L' }))).toMatch(/class="exm-faces" data-scroll="internal-x"/);
    expect(html(createElement(MediaGrid, { cols: { d: 4, t: 3, m: 2 } }, 'x'))).toContain('--exm-cd:4;--exm-ct:3;--exm-cm:2');
  });
  it('phone rail CSS hides only the duplicate primary; short phones re-balance primary media rows', () => {
    const css = strip(read('src/site00/styles/site00-production-expression-family.css'));
    expect(css).toMatch(/\.exm-gallery--rail-m \.exm-gallery__primary \{\s*display: none;/);
    const short = mediaBlocks(css, '@media (max-width: 699px) and (max-height: 700px)');
    for (const r of ["[data-family='storyboard'][data-route='root']", "[data-family='storyboard'][data-route='keyframes']", "[data-family='look'][data-route='outfits']"]) expect(short).toContain(r);
    expect(css).toMatch(/\.exf-actions__row \.exf-btn \{[^}]*white-space: normal;/);
  });
});

describe('Expression families — media priority layouts', () => {
  const casting = read('src/site00/components/productionAuthority/expression/families/CastingFamily.tsx');
  const perf = read('src/site00/components/productionAuthority/expression/families/PerformanceFamily.tsx');
  it('casting: roles fill one row of portrait cards on phones; profiles use the phone rail gallery', () => {
    expect(casting).toContain('m: Math.min(3, Math.max(1, roles.length))');
    expect(casting).toMatch(/testId="casting-actor-hero-media"[^/]*railOnPhone/);
    expect(casting).toMatch(/testId="casting-character-media"[^/]*railOnPhone/);
  });
  it('performance takes: performers lead, the honest TAKES empty state stays compact', () => {
    const takes = perf.slice(perf.indexOf("case 'takes':"), perf.indexOf('default:', perf.indexOf("case 'takes':")));
    expect(takes.indexOf('performance-direction')).toBeLessThan(takes.indexOf('performance-takes"'));
    expect(takes).toMatch(/title="TAKES"[^>]*layout="compact"/);
    expect(takes).toContain('performance-takes-unmounted');
  });
});

describe('one viewport + type floor contracts', () => {
  it('HUB: frame locked; world panel flexes; portrait tablets take the 9:16 composition; phone floor 8.5px', () => {
    const css = strip(read('src/site00/styles/site00-production-hub-one-viewport.css'));
    expect(css).toMatch(/\.pxa\[data-screen='hub'\] \.pxa-scroll:has\(\.hubx\) \{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa \.pxa-hub\.hubx \{[^}]*container-type: size;/);
    expect(css).toMatch(/\.hubx-hero \{[^}]*min-height: calc\(var\(--u\) \* var\(--hero-h\) \* var\(--hero-min\)\)/);
    expect(mediaBlocks(css, '@media (min-width: 700px) and (max-width: 1119px) and (orientation: portrait)')).toContain('100cqb');
    const phone = mediaBlocks(css, '@media (max-width: 699px)');
    const floors = [...phone.matchAll(/max\((\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
    expect(floors.length).toBeGreaterThan(3);
    expect(Math.min(...floors)).toBeGreaterThanOrEqual(8.5);
    const src = read('src/site00/components/productionAuthority/HubBody.tsx');
    const heroAt = src.indexOf('data-testid="authority-hero"');
    const hero = src.slice(heroAt, src.indexOf('data-testid="authority-status-bar"', heroAt));
    expect(hero).toContain('data-testid="hub-open-machine"');
    expect(src).toContain('<ol className="hubx-ops__list" data-scroll="internal">');
    expect(src).toContain('<ol className="hubx-feed__list" data-scroll="internal">');
  });
  it('Production Floor: frame locked; phones show six floors in one row; short frames keep floors tall', () => {
    const css = strip(read('src/site00/styles/site00-production-expression-floor.css'));
    expect(css).toMatch(/\.pxa\[data-screen='expression'\] \.pxa-scroll \{\s*overflow: hidden;/);
    expect(mediaBlocks(css, '@media (max-width: 699px)')).toMatch(/\.pxa-floorgrid \{\s*grid-template-columns: repeat\(6, minmax\(0, 1fr\)\);/);
    expect(mediaBlocks(css, '@media (min-width: 700px) and (max-height: 820px)')).toContain('.pxa-hero__side');
    expect(mediaBlocks(css, '@media (min-width: 700px)')).toMatch(/\.pxa-expression__bottom \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  });
  it('Inbox / Activity: the 8.5px floor holds for card titles, status, empties, meta labels', () => {
    const ibx = strip(read('src/site00/styles/site00-production-inbox-family.css'));
    expect(ibx).toMatch(/\.pxa \.ibx-root \.ibx-card b \{\s*font-size: 8\.5px;/);
    expect(ibx).toMatch(/\.pxa \.ibx-card__status \{\s*font-size: 8\.5px;/);
    expect(ibx).toMatch(/\.ibx-root \.ibx-card \.ibx-art \{[^}]*flex: 1 1 auto;/);
    const amx = strip(read('src/site00/styles/site00-production-activity-memory.css'));
    for (const sel of ['.amx-facts dt', '.amx-lineage small', '.amx-ranges a em']) expect(amx, sel).toMatch(new RegExp(`${sel.replace(/\./g, '\\.')} \\{[^}]*font-size: max\\(8\\.5px,`));
    expect(amx).not.toMatch(/font-size: [0-7](\.\d+)?px;/);
  });
  it('Library: long identity / summary blocks scroll as declared .rk-scroll panes (no extra scrollers)', () => {
    const lib = read('src/site00/components/productionAuthority/realm/LibraryScreen.tsx');
    expect(lib).toContain('className="lbf-char-identity rk-scroll" data-testid="library-character-identity" data-scroll="internal"');
    expect(lib).toContain('className="lbf-summary rk-scroll" data-testid="library-summary" data-scroll="internal"');
  });
  it('Design: the chamber takes the slack (no space-between bands)', () => {
    const css = strip(read('src/site00/styles/site00-production-design-pack.css'));
    expect(css).toMatch(/\.pxa \.pxa-design \{\s*justify-content: flex-start;/);
    expect(mediaBlocks(css, '@media (min-width: 1120px)')).toContain('--ch-max: 640px;');
  });
  it('Character Fabrication actor strip is a declared horizontal rail', () => {
    expect(read('src/site00/components/characterFabrication/stationIdentity.tsx')).toContain('data-testid="cf-actor-grid" data-scroll="internal-x"');
  });
});
