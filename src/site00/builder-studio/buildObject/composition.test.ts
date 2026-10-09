/**
 * Creative Refinement 1: each selection must build its own architecture (not a rescale or recolour of one model),
 * pacing must change only how the structure assembles, and Blueprint sections must only re-light it.
 */
import { describe, expect, it } from 'vitest';
import { FEEL_OPTIONS, PLACE_OPTIONS, WORK_OPTIONS, emptySpatialState } from '../../builder-experience/spatialStudio';
import type { SpatialBuilderState } from '../../builder-experience/spatialStudio';
import { buildSpec } from '../studioModel';
import { compose } from './composition';
import type { BuildElement, BuildFocus } from './composition';

const spec = (patch: Partial<SpatialBuilderState> = {}) =>
  buildSpec({ ...emptySpatialState(), placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD', ...patch });
const ids = (els: BuildElement[]) => new Set(els.map((e) => e.id));
/** Geometry only (ids, sizes, positions): two options that differ only in colour have the same shape. */
const shape = (els: BuildElement[]) =>
  els
    .map((e) => `${e.id}:${e.size.map((n) => n.toFixed(2)).join(',')}:${e.position.map((n) => n.toFixed(2)).join(',')}:${(e.rotationY ?? 0).toFixed(2)}`)
    .sort()
    .join('|');

describe('PLACE builds a different site, not a bigger one', () => {
  it('every path has its own geometry', () => {
    const shapes = PLACE_OPTIONS.map((o) => shape(compose('place', spec({ placePath: o.id })).elements));
    expect(new Set(shapes).size).toBe(PLACE_OPTIONS.length);
  });
  it('choosing a path and coming back restores the same composition', () => {
    const a = compose('place', spec({ placePath: 'SIMPLE' }));
    compose('place', spec({ placePath: 'WORLD' }));
    expect(compose('place', spec({ placePath: 'SIMPLE' }))).toEqual(a);
  });
});

describe('FEEL is an architectural direction, not a palette swap', () => {
  it('each direction has its own geometry, element set and camera', () => {
    const comps = FEEL_OPTIONS.map((o) => compose('feel', spec({ feelVibe: o.id })));
    expect(new Set(comps.map((c) => shape(c.elements))).size).toBe(FEEL_OPTIONS.length);
    expect(new Set(comps.map((c) => [...ids(c.elements)].sort().join(','))).size).toBe(FEEL_OPTIONS.length);
    expect(new Set(comps.map((c) => `${c.camera.azimuth}/${c.camera.elevation}/${c.camera.distance}`)).size).toBeGreaterThan(1);
  });
  it('every element has a defined material (no undefined study slots)', () => {
    for (const o of FEEL_OPTIONS) {
      for (const el of compose('feel', spec({ feelVibe: o.id })).elements) expect(el.material).toBeTruthy();
    }
  });
});

describe('WORK: each capability adds its own module and removing it restores the structure', () => {
  const base = compose('work', spec({ workModules: [] }));
  it.each(WORK_OPTIONS.map((o) => o.id))('%s adds a module of its own', (id) => {
    const withIt = compose('work', spec({ workModules: [id] }));
    const added = [...ids(withIt.elements)].filter((x) => !ids(base.elements).has(x));
    const prefix = `m-${id.toLowerCase().replace('_area', '')}`;
    expect(added.length).toBeGreaterThan(0);
    expect(added.every((x) => x.startsWith(prefix))).toBe(true);
    // Removing it gives back exactly the starting structure.
    expect(compose('work', spec({ workModules: [] })).elements).toEqual(base.elements);
  });
  it('no two capabilities share a module shape', () => {
    const shapes = WORK_OPTIONS.map((o) => shape(compose('work', spec({ workModules: [o.id] })).elements.filter((e) => e.id.startsWith('m-'))));
    expect(new Set(shapes).size).toBe(WORK_OPTIONS.length);
  });
});

describe('PACE changes how the structure assembles, not what it contains', () => {
  const at = (pace: SpatialBuilderState['pace']) => compose('pace', spec({ workModules: ['PAGES', 'SHOP'], pace }));
  it('each pace has its own assembly motion', () => {
    const motions = (['STANDARD', 'EXPEDITED', 'FLEXIBLE'] as const).map((p) => at(p).motion);
    expect(new Set(motions.map((m) => `${m.duration}/${m.stagger}/${m.entry}`)).size).toBe(3);
    expect(motions.every((m) => m.replay)).toBe(true);
  });
  it('EXPEDITED adds no volume: only flat sequencing marks', () => {
    const standard = ids(at('STANDARD').elements);
    const extra = at('EXPEDITED').elements.filter((e) => !standard.has(e.id));
    expect(extra.length).toBeGreaterThan(0);
    for (const e of extra) {
      expect(e.id).toMatch(/-mark$/);
      expect(e.size[1]).toBeLessThanOrEqual(0.05);
      // Red is the capability colour: pacing marks never use it.
      expect(e.material).not.toMatch(/^red/);
    }
    const red = (els: BuildElement[]) => els.filter((e) => e.material.startsWith('red')).length;
    expect(red(at('EXPEDITED').elements)).toBe(red(at('STANDARD').elements));
    // Every shared element keeps its size: the structure is not taller or larger.
    const byId = new Map(at('STANDARD').elements.map((e) => [e.id, e.size.join(',')]));
    for (const e of at('EXPEDITED').elements) if (byId.has(e.id)) expect(e.size.join(',')).toBe(byId.get(e.id));
  });
  it('FLEXIBLE separates the same volumes and shows their joints', () => {
    const standard = at('STANDARD').elements;
    const flexible = at('FLEXIBLE').elements;
    const volumes = (els: BuildElement[]) => els.filter((e) => /^side-\d+$/.test(e.id));
    expect(volumes(flexible).map((e) => e.id)).toEqual(volumes(standard).map((e) => e.id));
    expect(Math.max(...volumes(flexible).map((e) => Math.abs(e.position[0])))).toBeGreaterThan(Math.max(...volumes(standard).map((e) => Math.abs(e.position[0]))));
    expect(flexible.some((e) => e.id.endsWith('-joint'))).toBe(true);
  });
});

describe('Blueprint sections re-light the same structure', () => {
  const focus = (f: BuildFocus) => compose('blueprint', spec({ workModules: ['PAGES', 'SHOP', 'BOOKING'] }), { focus: f });
  it('every section keeps the same elements and geometry as the overview', () => {
    const overview = focus('OVERVIEW');
    for (const f of ['STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'] as const) {
      expect(shape(focus(f).elements)).toBe(shape(overview.elements));
    }
  });
  it('STRUCTURE, PAGES and FEATURES each bring a different part forward', () => {
    const materials = (['STRUCTURE', 'PAGES', 'FEATURES'] as const).map((f) => focus(f).elements.map((e) => e.material).join(','));
    expect(new Set([...materials, focus('OVERVIEW').elements.map((e) => e.material).join(',')]).size).toBe(4);
    expect(focus('FEATURES').elements.filter((e) => e.material !== 'ghost' && !e.id.startsWith('main-') && e.material !== 'figure').every((e) => e.material === 'red' || e.material === 'redSolid')).toBe(true);
  });
  it('TIMELINE replays the assembly at the chosen pace', () => {
    expect(focus('TIMELINE').motion).toEqual(compose('pace', spec({ workModules: ['PAGES', 'SHOP', 'BOOKING'] })).motion);
    expect(new Set(['OVERVIEW', 'STRUCTURE', 'TIMELINE'].map((f) => focus(f as BuildFocus).key)).size).toBe(3);
  });
});
