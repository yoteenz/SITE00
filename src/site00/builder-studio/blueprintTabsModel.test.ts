import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FORBIDDEN_CLIENT_TERMS, effectiveCapabilities } from '../builder-experience';
import { emptySpatialState, snapshotFromSpatialState } from '../builder-experience/spatialStudio';
import type { SpatialBuilderState } from '../builder-experience/spatialStudio';
import { blueprintAnatomy } from './buildObject/anatomy';
import { BLUEPRINT_TABS } from './BlueprintRoom';
import {
  FLOW_STEPS,
  PAGE_GROUPS,
  STRUCTURE_GROUPS,
  featuresView,
  mainExperience,
  pageGroupElements,
  pagesView,
  structurePartElements,
  structureView,
  timelineView,
} from './blueprintTabsModel';
import { buildSpec, featureCount } from './studioModel';

const state = (over: Partial<SpatialBuilderState>): SpatialBuilderState => ({ ...emptySpatialState(), room: 'BLUEPRINT', ...over });

/** The configuration the five approved references were drawn from, plus three that differ from it. */
const CONFIGS: Record<string, SpatialBuilderState> = {
  reference: state({ placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES', 'SHOP', 'PORTAL'], pace: 'STANDARD' }),
  simplePages: state({ placePath: 'SIMPLE', feelVibe: 'EDITORIAL', workModules: ['PAGES', 'BLOG'], pace: 'STANDARD' }),
  booking: state({ placePath: 'ADVANCED', feelVibe: 'BOLD', workModules: ['PAGES', 'BOOKING', 'MEMBER_AREA'], pace: 'EXPEDITED' }),
  flexible: state({ placePath: 'ADVANCED', feelVibe: 'IMMERSIVE', workModules: ['PAGES', 'SHOP'], pace: 'FLEXIBLE' }),
};

const snap = (s: SpatialBuilderState) => snapshotFromSpatialState(s, { computeEstimate: true });

/** Machine fields the views carry for keys and icons; they are never put on screen. */
const MACHINE_FIELDS = new Set(['key', 'id', 'icon', 'n']);

/** Every string a view hands to the screen. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([k]) => !MACHINE_FIELDS.has(k))
      .flatMap(([, v]) => strings(v));
  }
  return [];
}

describe('Blueprint tabs model — real values, not the reference image', () => {
  it('reads the reference configuration exactly as the approved images show it', () => {
    const { selection } = snap(CONFIGS.reference);
    const pages = pagesView(selection);
    expect(pages.total).toBe(12);
    expect(pages.groups.map((g) => g.title)).toEqual(['FRONT DOOR', 'STORY & OFFER', 'CLIENT SPACE', 'TEAM & ACCESS']);
    expect(featuresView(selection).count).toBe(7);
    expect(mainExperience(selection)?.label).toBe('EDITORIAL');
  });

  it('follows the selection instead of hardcoding 12 pages, 7 features or the reference groups', () => {
    const counts = Object.values(CONFIGS).map((cfg) => {
      const { selection, blueprint } = snap(cfg);
      const pages = pagesView(selection);
      const features = featuresView(selection);
      // Same totals the Blueprint itself carries.
      expect(pages.total).toBe(blueprint.experiences.reduce((n, g) => n + g.items.length, 0));
      expect(features.count).toBe(featureCount(selection));
      expect(features.items.map((i) => i.id)).toEqual(effectiveCapabilities(selection));
      return `${pages.total}/${features.count}`;
    });
    expect(new Set(counts).size).toBeGreaterThan(1);
  });

  it('shows client space, private pages and payments only when the build has them', () => {
    const simple = snap(CONFIGS.simplePages).selection;
    expect(pagesView(simple).privatePages).toBe(0);
    expect(pagesView(simple).groups.some((g) => g.private)).toBe(false);
    expect(featuresView(simple).payments).toBe(false);
    expect(featuresView(simple).hasPrivate).toBe(false);
    const structure = structureView(simple);
    expect(structure.groups.find((g) => g.key === 'CLIENT_SPACE')?.present).toBe(false);
    expect(structure.access).toBe('PUBLIC');
    expect(structure.flow.map((s) => s.title)).not.toContain('CONTINUE');

    const reference = snap(CONFIGS.reference).selection;
    expect(featuresView(reference).payments).toBe(true);
    expect(structureView(reference).groups.every((g) => g.present)).toBe(true);
    expect(structureView(reference).access).toBe('PUBLIC + PRIVATE AREAS');
  });

  it('names what brought a feature in when the client did not pick it', () => {
    const { selection } = snap(CONFIGS.reference);
    const items = featuresView(selection).items;
    for (const item of items) {
      expect(Boolean(item.includedWith)).toBe(!selection.capabilities.includes(item.id));
    }
    expect(items.find((i) => i.id === 'PAYMENTS')?.includedWith).toBe('INCLUDED WITH SELL');
  });

  it('keeps the flow honest: steps without a feature of their own are left out (public pages always attract)', () => {
    const { selection } = snap(CONFIGS.simplePages);
    const flow = featuresView(selection).flow;
    expect(flow[0].key).toBe('ATTRACT');
    for (const step of flow.slice(1)) expect(step.features.length).toBeGreaterThan(0);
  });
});

describe('Blueprint tabs model — timeline comes from the estimator', () => {
  it('groups the engine phases into five delivery phases and reads who each one needs from the engine', () => {
    const view = timelineView(snap(CONFIGS.reference).selection)!;
    expect(view.phases.map((p) => p.title)).toEqual([
      'BLUEPRINT & ALIGNMENT',
      'IDENTITY & DIRECTION',
      'BUILD & INTEGRATION',
      'REVIEW & REFINEMENT',
      'LAUNCH PREPARATION',
    ]);
    // INCEPTION / BLUEPRINT need the client and happen in order; PRODUCTION + INTEGRATION do not all run alongside.
    expect(view.phases[0]).toMatchObject({ needsYou: true, runsAlongside: false });
    expect(view.phases[1]).toMatchObject({ needsYou: true, runsAlongside: true });
    expect(view.reviewRounds).toBeGreaterThan(0);
    expect(view.factors.find((f) => f.key === 'APPROVALS')?.plain).toContain(`${view.reviewDays} BUSINESS DAYS`);
  });

  it('only claims connected tools when the estimator has an integration dependency', () => {
    for (const cfg of Object.values(CONFIGS)) {
      const s = snap(cfg);
      const view = timelineView(s.selection)!;
      const connects = view.factors.some((f) => f.key === 'TOOLS');
      expect(connects).toBe(s.estimate!.dependencies.some((d) => /OUTSIDE SYSTEMS/i.test(d)));
    }
  });

  it('builds the phases only once the estimator has priced the selection', () => {
    expect(snap(state({ placePath: null })).estimate).toBeNull();
    const room = readFileSync(new URL('./BlueprintRoom.tsx', import.meta.url), 'utf8');
    expect(room).toContain('estimate ? timelineView(snapshot.selection) : null');
  });
});

describe('Blueprint tabs model — part stills light only geometry the model draws', () => {
  it('names real Build Object elements for each part and page group', () => {
    const s = CONFIGS.reference;
    const snapshot = snap(s);
    const anatomy = blueprintAnatomy(buildSpec(s), snapshot);
    for (const g of STRUCTURE_GROUPS) {
      const ids = structurePartElements(anatomy, g.key);
      for (const id of ids) expect(typeof id).toBe('string');
    }
    expect(structurePartElements(anatomy, 'FRONT_DOOR').length).toBeGreaterThan(0);
    expect(pageGroupElements(anatomy, 'CLIENT_SPACE').length).toBeGreaterThan(0);
  });
});

describe('Blueprint tabs — copy standard', () => {
  it('writes every client-facing string in upper case, for every configuration', () => {
    const fixed = strings([PAGE_GROUPS, STRUCTURE_GROUPS, FLOW_STEPS]);
    for (const text of fixed) expect(text).toBe(text.toUpperCase());
    for (const cfg of Object.values(CONFIGS)) {
      const { selection } = snap(cfg);
      const shown = strings([pagesView(selection), featuresView(selection), structureView(selection), mainExperience(selection), timelineView(selection)]);
      for (const text of shown) expect(text, text).toBe(text.toUpperCase());
    }
  });

  it('never shows internal terms, enum names or the placeholder labels the founder rejected', () => {
    const source = readFileSync(new URL('./BlueprintRoom.tsx', import.meta.url), 'utf8') + readFileSync(new URL('./blueprintTabsModel.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('<em> FROM SYSTEM</em>');
    expect(source).not.toMatch(/QUIET FROM SYSTEM/);
    for (const cfg of Object.values(CONFIGS)) {
      const { selection } = snap(cfg);
      const shown = strings([pagesView(selection), featuresView(selection), structureView(selection), timelineView(selection)]).join(' ');
      expect(shown).not.toMatch(/FULL EDITION|ESSENTIAL EDITION|FROM SYSTEM|[A-Z]+_[A-Z]+/);
      for (const term of FORBIDDEN_CLIENT_TERMS) expect(shown.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});

describe('Blueprint tabs — shell, model and product ownership', () => {
  const studio = readFileSync(new URL('./BuilderStudio.tsx', import.meta.url), 'utf8');
  const room = readFileSync(new URL('./BlueprintRoom.tsx', import.meta.url), 'utf8');

  it('keeps five tabs under one panel, inside the existing builder shell', () => {
    expect(BLUEPRINT_TABS).toEqual(['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE']);
    expect(room.match(/role="tablist"/g)).toHaveLength(1);
    expect(room).not.toMatch(/bs-header|<header className="bs-header"|BuildObjectStage /);
  });

  it('never rebuilds the stage composition from the active tab (the model stays put when tabs change)', () => {
    expect(studio).toContain('const composition = useMemo(() => compose(room, spec), [room, spec]);');
    expect(studio).not.toMatch(/compose\(room, spec, \{[^}]*tab/);
  });

  it('belongs to the SITE 00 builder, not to IDNTY Digital Foundation', () => {
    for (const source of [room, readFileSync(new URL('./blueprintTabsModel.ts', import.meta.url), 'utf8')]) {
      expect(source).not.toMatch(/from ['"][^'"]*(foundation-client|site00-digital-foundation|idnty)/i);
    }
    const routes = readFileSync(new URL('../config/routes.ts', import.meta.url), 'utf8');
    expect(routes).toContain("bldrSpatialStudio: '/bldr/studio'");
  });
});
