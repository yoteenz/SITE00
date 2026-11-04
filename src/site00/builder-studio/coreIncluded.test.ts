import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { effectiveCapabilities, toEstimateConfig } from '../builder-experience';
import { emptySpatialState, snapshotFromSpatialState } from '../builder-experience/spatialStudio';
import type { SpatialBuilderState, WorkModuleId } from '../builder-experience/spatialStudio';
import { parseBuilderSpatialDraft, spatialStateFromEnvelope } from '../builder-experience/spatialStudio/intakeDraft';
import { estimateProject } from '../../studioos/estimation';
import { PAGE_GROUPS, coreIncludedView, featuresView, pagesView } from './blueprintTabsModel';

const work = (placePath: SpatialBuilderState['placePath'], workModules: WorkModuleId[]) =>
  snapshotFromSpatialState({ ...emptySpatialState(), placePath, feelVibe: 'MODERN', workModules, room: 'WORK' }, { computeEstimate: false }).selection;

/** The configurations the sprint asks for, as the WORK room produces them. */
const CONFIGS = {
  pagesOnly: work('SIMPLE', ['PAGES']),
  pagesShop: work('ADVANCED', ['PAGES', 'SHOP']),
  pagesPortal: work('ADVANCED', ['PAGES', 'PORTAL']),
  shopPortal: work('ADVANCED', ['PAGES', 'SHOP', 'PORTAL']),
  everything: work('ADVANCED', ['PAGES', 'BLOG', 'SHOP', 'MEMBER_AREA', 'BOOKING', 'PORTAL']),
  minimum: work('SIMPLE', ['BLOG']),
};

describe('WORK room · core pages included', () => {
  it('counts pages, groups and private pages from the same view the Blueprint PAGES tab reads', () => {
    for (const s of Object.values(CONFIGS)) {
      const view = coreIncludedView(s);
      const bp = pagesView(s);
      expect(view.pages).toEqual(bp);
      expect(view.pages.total).toBe(view.pages.groups.reduce((n, g) => n + g.pages.length, 0));
      expect(view.pages.coreGroups).toBe(view.pages.groups.length);
      expect(view.pages.groups.every((g) => g.pages.length > 0)).toBe(true);
      const privateKeys = new Set(PAGE_GROUPS.filter((g) => g.private).map((g) => g.key));
      expect(view.pages.privatePages).toBe(view.pages.groups.filter((g) => privateKeys.has(g.key)).reduce((n, g) => n + g.pages.length, 0));
    }
  });

  it('follows the selection: the reference build reads 12 / 4, a pages-only build reads no private pages', () => {
    expect(coreIncludedView(CONFIGS.shopPortal).pages).toMatchObject({ total: 12, coreGroups: 4 });
    expect(coreIncludedView(CONFIGS.pagesOnly).pages.privatePages).toBe(0);
    expect(coreIncludedView(CONFIGS.pagesOnly).pages.groups.map((g) => g.key)).not.toContain('CLIENT_SPACE');
    const totals = Object.values(CONFIGS).map((s) => `${coreIncludedView(s).pages.total}/${coreIncludedView(s).features.length}`);
    expect(new Set(totals).size).toBeGreaterThan(3);
  });

  it('lists every feature in the build once, the chosen ones first, the rest saying what brings them in', () => {
    for (const s of Object.values(CONFIGS)) {
      const { features } = coreIncludedView(s);
      expect(new Set(features.map((f) => f.id)).size).toBe(features.length);
      expect(new Set(features.map((f) => f.id))).toEqual(new Set(effectiveCapabilities(s)));
      expect(features.map((f) => f.verb).sort()).toEqual(featuresView(s).items.map((i) => i.verb).sort());
      const firstIncluded = features.findIndex((f) => !f.chosen);
      if (firstIncluded >= 0) expect(features.slice(firstIncluded).every((f) => !f.chosen && f.includedWith)).toBe(true);
      for (const f of features) expect(f.chosen).toBe(s.capabilities.includes(f.id));
    }
    const shop = coreIncludedView(CONFIGS.pagesShop).features;
    expect(shop.find((f) => f.id === 'PAYMENTS')).toMatchObject({ chosen: false, includedWith: 'INCLUDED WITH SELL' });
    expect(coreIncludedView(CONFIGS.pagesOnly).features.some((f) => f.id === 'PAYMENTS')).toBe(false);
  });

  it('describes delivery as one website laid out for phones, not a separate mobile product', () => {
    const { delivery } = coreIncludedView(CONFIGS.shopPortal);
    expect(delivery).toMatchObject({ build: 'WEBSITE', viewport: 'MOBILE READY' });
    expect(delivery.viewportPlain).toContain('ONE BUILD');
  });

  it('explains the outlined features with what brings them in, and stays in upper case', () => {
    expect(coreIncludedView(CONFIGS.shopPortal).footer).toBe('EACH CAPABILITY ADDS ITS OWN PAGES. OUTLINED FEATURES COME WITH SELL AND DATA / PORTAL.');
    expect(coreIncludedView(CONFIGS.pagesOnly).footer).toBe('EACH CAPABILITY ADDS ITS OWN PAGES AND FEATURES TO YOUR DIGITAL LOCATION.');
    for (const s of Object.values(CONFIGS)) {
      const v = coreIncludedView(s);
      for (const text of [v.footer, v.summary, v.delivery.build, v.delivery.viewport, v.delivery.viewportPlain, ...v.features.map((f) => f.verb)]) {
        expect(text).toBe(text.toUpperCase());
        expect(text).not.toMatch(/[A-Z]+_[A-Z]+|COMES WITH THIS CHOICE/);
      }
    }
  });

  it('reads a legacy saved draft and changes nothing the estimator reads', () => {
    const envelope = parseBuilderSpatialDraft({ schemaVersion: 'builder-spatial-v1', spatialStudio: { placePath: 'ADVANCED', workModules: ['SHOP'] } });
    const legacy = snapshotFromSpatialState(spatialStateFromEnvelope(envelope!), { computeEstimate: false }).selection;
    expect(coreIncludedView(legacy).pages.total).toBe(pagesView(legacy).total);
    for (const s of Object.values(CONFIGS)) {
      const before = JSON.stringify(estimateProject(toEstimateConfig(s)));
      coreIncludedView(s);
      expect(JSON.stringify(estimateProject(toEstimateConfig(s)))).toBe(before);
    }
  });

  it('opens the panel and its groups as local view state, without the old dependency notices', () => {
    const rooms = readFileSync(new URL('./rooms.tsx', import.meta.url), 'utf8');
    const panel = rooms.slice(rooms.indexOf('export function WorkControls'), rooms.indexOf('04 PACE', rooms.indexOf('export function WorkControls')));
    expect(panel).toContain('coreIncludedView(selection)');
    expect(panel).not.toMatch(/COMES_WITH|builderNotices|update\(/);
    expect(panel).toContain('<details className="bs-core__group">');
    expect(panel).toContain('aria-expanded={open}');
  });
});
