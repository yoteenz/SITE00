/**
 * Immersive Blueprint: every section binds what it lists to real geometry, honestly. Lists, counts and order come
 * from the Blueprint snapshot; bindings come from the registry; nothing names geometry the composition lacks;
 * selections are reversible; the timeline is an order, never a schedule.
 */
import { describe, expect, it } from 'vitest';
import { CAPABILITY_BY_ID, EXPERIENCE_BY_ID, WORK_TO_CAPABILITIES, effectiveCapabilities, emptySpatialState, snapshotFromSpatialState } from '../../builder-experience';
import type { SpatialBuilderState } from '../../builder-experience';
import { buildSpec } from '../studioModel';
import { blueprintAnatomy, inspectionFor, structureLines } from './anatomy';
import { blueprintElements, compose } from './composition';

const STATES: Partial<SpatialBuilderState>[] = [
  { placePath: 'SIMPLE', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD' },
  { placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES', 'SHOP', 'PORTAL'], pace: 'STANDARD' },
  { placePath: 'ADVANCED', feelVibe: 'EDITORIAL', workModules: ['PAGES', 'BLOG', 'BOOKING', 'MEMBER_AREA'], pace: 'EXPEDITED' },
  { placePath: 'CUSTOM', feelVibe: 'BOLD', workModules: ['PAGES', 'SHOP', 'BOOKING', 'MEMBER_AREA', 'BLOG', 'PORTAL'], pace: 'FLEXIBLE' },
  { placePath: 'WORLD', feelVibe: 'IMMERSIVE', workModules: ['PAGES', 'SHOP'], pace: 'STANDARD' },
];

const setup = (patch: Partial<SpatialBuilderState>) => {
  const state = { ...emptySpatialState(), ...patch, room: 'BLUEPRINT' as const };
  const snapshot = snapshotFromSpatialState(state);
  const spec = buildSpec(state);
  return { state, snapshot, spec, anatomy: blueprintAnatomy(spec, snapshot), ids: new Set(blueprintElements(spec).map((el) => el.id)) };
};
const label = (s: Partial<SpatialBuilderState>) => `${s.placePath} · ${s.workModules?.join('+')} · ${s.pace}`;

describe('PAGES — every page of the Blueprint, where it lives', () => {
  for (const patch of STATES) {
    it(`keeps the snapshot's pages, count and hierarchy exactly (${label(patch)})`, () => {
      const { snapshot, anatomy } = setup(patch);
      if (patch.placePath === 'WORLD') {
        expect(anatomy.pages).toBeNull();
        return;
      }
      const expected = snapshot.blueprint.experiences.map((g) => ({ group: g.group, pages: g.items.map((i) => `${i.label}|${i.depth}`) }));
      const actual = anatomy.pages!.groups.map((g) => ({ group: g.group, pages: g.pages.map((p) => `${p.label}|${p.depth}`) }));
      expect(actual).toEqual(expected);
      expect(anatomy.pages!.total).toBe(snapshot.blueprint.experiences.reduce((n, g) => n + g.items.length, 0));
      expect(anatomy.pages!.homes.reduce((n, h) => n + h.count, 0)).toBe(anatomy.pages!.groups.flatMap((g) => g.pages).filter((p) => p.home).length);
    });
  }

  it('places structure pages in the envelope and capability pages in the wing of the WORK choice that brings them', () => {
    const { anatomy, snapshot, spec } = setup(STATES[1]);
    const effective = effectiveCapabilities(snapshot.selection);
    const pages = anatomy.pages!.groups.flatMap((g) => g.pages);
    expect(pages.every((p) => p.home)).toBe(true);
    const where = Object.fromEntries(pages.map((p) => [p.label, p.home!.key]));
    expect(where).toMatchObject({ Home: 'ENVELOPE', About: 'ENVELOPE', Shop: 'WING-SHOP', Product: 'WING-SHOP', 'Bag and checkout': 'WING-SHOP', 'Records / work': 'WING-PORTAL', Account: 'WING-PORTAL' });
    // Every wing placement is backed by the registry: the module's capabilities (or what comes with them) add the page.
    for (const page of pages.filter((p) => p.home!.key.startsWith('WING-'))) {
      const module = page.home!.key.slice(5) as (typeof spec.modules)[number];
      const reach = new Set<string>(WORK_TO_CAPABILITIES[module]);
      for (let grew = true; grew; ) {
        grew = false;
        for (const cap of [...reach]) for (const next of CAPABILITY_BY_ID[cap as keyof typeof CAPABILITY_BY_ID].comesWith) if (!reach.has(next) && effective.includes(next)) reach.add(next) && (grew = true);
      }
      const id = Object.values(EXPERIENCE_BY_ID).find((e) => e.label === page.label)!.id;
      expect([...reach].some((cap) => CAPABILITY_BY_ID[cap as keyof typeof CAPABILITY_BY_ID].addsExperiences.includes(id))).toBe(true);
    }
  });

  it('never names geometry the model does not have', () => {
    for (const patch of STATES) {
      const { anatomy, ids } = setup(patch);
      for (const p of anatomy.pages?.groups.flatMap((g) => g.pages) ?? []) for (const id of p.home?.elements ?? []) expect(ids.has(id)).toBe(true);
      for (const f of anatomy.features) for (const id of f.home?.elements ?? []) expect(ids.has(id)).toBe(true);
      for (const l of anatomy.layers) for (const id of l.elements) expect(ids.has(id)).toBe(true);
      for (const s of anatomy.stages) for (const id of s.elements) expect(ids.has(id)).toBe(true);
    }
  });
});

describe('FEATURES — each capability on the module that brings it', () => {
  for (const patch of STATES) {
    it(`keeps the snapshot's capabilities and traces each one (${label(patch)})`, () => {
      const { anatomy, snapshot, spec } = setup(patch);
      expect(anatomy.features.map((f) => `${f.verb}|${f.comesWith}`)).toEqual(snapshot.blueprint.capabilities.map((c) => `${c.verb}|${c.comesWith}`));
      for (const f of anatomy.features) {
        expect(f.id).not.toBeNull();
        if (f.source === 'MODULE') expect(WORK_TO_CAPABILITIES[f.module!]).toContain(f.id);
        if (f.source === 'COMES_WITH') expect(CAPABILITY_BY_ID[Object.values(CAPABILITY_BY_ID).find((c) => c.verb === f.parent)!.id].comesWith).toContain(f.id);
        if (f.module) expect(spec.modules).toContain(f.module);
        expect(f.plain).toBe(CAPABILITY_BY_ID[f.id!].plain);
        const pages = new Set(snapshot.blueprint.experiences.flatMap((g) => g.items.map((i) => i.label)));
        for (const page of f.addsPages) expect(pages.has(page)).toBe(true);
      }
    });
  }

  it('relates SELL and TAKE PAYMENT both ways', () => {
    const { anatomy } = setup(STATES[1]);
    const sell = anatomy.features.find((f) => f.verb === 'SELL')!;
    const pay = anatomy.features.find((f) => f.verb === 'TAKE PAYMENT')!;
    expect(sell).toMatchObject({ source: 'MODULE', module: 'SHOP', bringsAlong: ['TAKE PAYMENT'], addsPages: ['Shop', 'Product', 'Bag and checkout'] });
    expect(pay).toMatchObject({ source: 'COMES_WITH', module: 'SHOP', parent: 'SELL' });
    expect(pay.home!.elements).toEqual(sell.home!.elements);
  });
});

describe('STRUCTURE — every Blueprint line in the layer whose geometry it drives', () => {
  for (const patch of STATES) {
    it(`places each line exactly once and never draws type, colour, image or motion (${label(patch)})`, () => {
      const { anatomy, snapshot } = setup(patch);
      const placed = anatomy.layers.flatMap((l) => [...l.lines, ...l.notDrawn].map((line) => line.key));
      expect(placed.sort()).toEqual(structureLines(snapshot.blueprint.lines).map((l) => l.key).sort());
      const drawn = anatomy.layers.flatMap((l) => l.lines.map((line) => line.key));
      for (const key of ['TYPE', 'COLOR', 'IMAGE', 'MOTION']) expect(drawn).not.toContain(key);
      for (const l of anatomy.layers) if (!l.elements.length) expect(l.lines).toEqual([]);
      expect(anatomy.layers.map((l) => l.n)).toEqual(anatomy.layers.map((_, i) => `L${i + 1}`));
    });
  }

  it('shows the pace layer only when pace actually adds marks', () => {
    const standard = setup(STATES[1]).anatomy.layers.find((l) => l.id === 'PACE')!;
    expect(standard.elements).toEqual([]);
    expect(standard.notDrawn.map((l) => l.key)).toEqual(['DELIVERY']);
    const expedited = setup(STATES[2]).anatomy.layers.find((l) => l.id === 'PACE')!;
    expect(expedited.elements.length).toBeGreaterThan(0);
    expect(expedited.lines.map((l) => l.key)).toEqual(['DELIVERY']);
  });

  it('only separates the layers; it never resizes or adds geometry', () => {
    const { anatomy, spec } = setup(STATES[1]);
    const plain = compose('blueprint', spec);
    const open = compose('blueprint', spec, { focus: 'STRUCTURE', inspect: inspectionFor(anatomy, 'STRUCTURE', null) });
    expect(open.elements.map((e) => `${e.id}:${e.size}`)).toEqual(plain.elements.map((e) => `${e.id}:${e.size}`));
    expect(open.elements.some((e, i) => e.position[1] !== plain.elements[i].position[1])).toBe(true);
  });
});

describe('TIMELINE — an assembly order, never a schedule', () => {
  for (const patch of STATES) {
    it(`assembles every part of the model once, with no durations (${label(patch)})`, () => {
      const { anatomy, spec } = setup(patch);
      const all = anatomy.stages.flatMap((s) => s.elements);
      expect(new Set(all).size).toBe(all.length);
      const parts = blueprintElements(spec).filter((el) => el.material !== 'figure' && !el.id.startsWith('main-') ).map((el) => el.id);
      for (const id of parts) expect(all).toContain(id);
      for (const s of anatomy.stages) expect(Object.keys(s).sort()).toEqual(['caption', 'elements', 'items', 'label', 'n']);
      for (const s of anatomy.stages) expect(`${s.caption} ${s.items.join(' ')}`).not.toMatch(/\b(WEEK|MONTH|DAY)S?\b/);
    });
  }

  it('shows built, current and future stages', () => {
    const { anatomy, spec } = setup(STATES[1]);
    const at = compose('blueprint', spec, { focus: 'TIMELINE', inspect: inspectionFor(anatomy, 'TIMELINE', null, 1) });
    const byId = new Map(at.elements.map((e) => [e.id, e]));
    for (const id of anatomy.stages[0].elements) expect(byId.get(id)!.material).not.toBe('ghost');
    for (const id of anatomy.stages[1].elements) expect(byId.get(id)).toMatchObject({ lit: true, enter: true });
    for (const id of anatomy.stages.slice(2).flatMap((s) => s.elements)) expect(byId.get(id)!.material).toBe('ghost');
    const done = compose('blueprint', spec, { focus: 'TIMELINE', inspect: inspectionFor(anatomy, 'TIMELINE', null, null) });
    expect(done.elements.filter((e) => e.material === 'ghost' || e.lit)).toEqual([]);
  });
});

describe('selection state — reversible, replaceable, bound to the model', () => {
  const { anatomy, spec } = setup(STATES[1]);
  const at = (mode: Parameters<typeof inspectionFor>[1], pick: string | null) => compose('blueprint', spec, { focus: mode, inspect: inspectionFor(anatomy, mode, pick) });

  it('OVERVIEW is the whole place: no inspection at all', () => {
    expect(inspectionFor(anatomy, 'OVERVIEW', null)).toBeUndefined();
    expect(compose('blueprint', spec, { focus: 'OVERVIEW', inspect: undefined })).toEqual(compose('blueprint', spec));
  });

  it('a selection lights its part, dims the rest and moves the camera toward it', () => {
    const shop = anatomy.pages!.groups.flatMap((g) => g.pages).find((p) => p.label === 'Shop')!;
    const c = at('PAGES', `P${shop.n}`);
    expect(c.elements.filter((e) => e.lit).map((e) => e.id).sort()).toEqual([...shop.home!.elements].sort());
    expect(c.elements.filter((e) => !e.lit && !e.id.startsWith('main-') && e.material !== 'figure').every((e) => e.material === 'ghost')).toBe(true);
    expect(c.camera.focus).toEqual(expect.arrayContaining(shop.home!.elements));
    expect(c.camera.closeness).toBeGreaterThan(0);
  });

  it('a new selection replaces the old one, and clearing it returns the section default exactly', () => {
    const base = at('FEATURES', null);
    const a = at('FEATURES', 'F2');
    const b = at('FEATURES', 'F3');
    expect(a.key).not.toBe(b.key);
    expect(b.elements.filter((e) => e.lit).map((e) => e.id)).toEqual(anatomy.features[2].home!.elements.filter((id) => b.elements.some((e) => e.id === id)));
    expect(at('FEATURES', null)).toEqual(base);
  });

  it('a layer the model does not draw lights nothing (no pretend module)', () => {
    const pace = anatomy.layers.find((l) => l.id === 'PACE')!;
    const c = at('STRUCTURE', pace.id);
    expect(c.elements.some((e) => e.lit)).toBe(false);
    expect(c.elements.some((e) => e.material === 'ghost')).toBe(false);
  });

  it('never touches the snapshot it reads (estimate, selection, Blueprint)', () => {
    const state = { ...emptySpatialState(), ...STATES[1], room: 'BLUEPRINT' as const };
    const snapshot = snapshotFromSpatialState(state);
    const before = JSON.stringify(snapshot);
    blueprintAnatomy(buildSpec(state), snapshot);
    expect(JSON.stringify(snapshot)).toBe(before);
  });
});
