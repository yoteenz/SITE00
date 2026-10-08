import { describe, expect, it } from 'vitest';
import { estimateProject } from '../../studioos/estimation/engine';
import { FORBIDDEN_CLIENT_TERMS, builderEstimateView, chosenExperiences, deriveBuildLevel, effectiveCapabilities, toEstimateConfig } from '../builder-experience';
import { compose, towerFloors } from './buildObject/composition';
import {
  CORE_INCLUDED,
  FEEL_OPTIONS,
  PACE_OPTIONS,
  PATH_OPTIONS,
  STUDIO_DRAFT_VERSION,
  STUDIO_ROOMS,
  WORK_MODULES,
  canEnterRoom,
  emptyDraft,
  expandInvestment,
  firstOpenRoom,
  moduleLevelCheck,
  parseDraft,
  studioReadiness,
  toSelection,
} from './studioModel';
import type { StudioDraft } from './studioModel';
import { buildSubmissionPayload } from './submitBlueprint';

const draft = (patch: Partial<StudioDraft>): StudioDraft => ({ ...emptyDraft(), ...patch });

describe('Builder studio — draft → canonical selection', () => {
  it('starts empty: no build, only the core-included measurement capability', () => {
    const selection = toSelection(emptyDraft());
    expect(selection.build).toBeNull();
    expect(selection.capabilities).toEqual(['MEASURE']);
    expect(selection.delivery).toBe('STANDARD');
  });

  it('maps the four PLACE paths onto existing selection fields (no new build categories)', () => {
    const simple = toSelection(draft({ path: 'SIMPLE', feel: 'ARCHITECTURAL_MINIMAL' }));
    expect(simple.build).toBe('SITE');
    expect(simple.expression).toMatchObject({ primary: 'ARCHITECTURAL_MINIMAL', edition: 'ESSENTIAL' });
    expect(simple.keepItSimple).toBe(true);
    expect(deriveBuildLevel(simple).level).toBe('SIMPLE');

    const advanced = toSelection(draft({ path: 'ADVANCED', feel: 'ARCHITECTURAL_MINIMAL' }));
    expect(advanced.expression.edition).toBe('FULL');
    expect(deriveBuildLevel(advanced).level).toBe('ADVANCED');

    const custom = toSelection(draft({ path: 'CUSTOM', feel: 'POP_EDITORIAL' }));
    expect(custom.expression).toMatchObject({ primary: 'CUSTOM', secondary: 'POP_EDITORIAL' });
    expect(deriveBuildLevel(custom).level).toBe('CUSTOM');

    const world = toSelection(draft({ path: 'WORLD', feel: 'CINEMATIC_LUXURY' }));
    expect(world.build).toBe('WORLD');
    expect(world.world?.form).toBe('ESTATE');
    expect(world.structure).toBeNull();
  });

  it('binds every WORK module to exactly one canonical capability, experience or depth step', () => {
    const base = draft({ path: 'ADVANCED', feel: 'ARCHITECTURAL_MINIMAL' });
    const caps = (modules: StudioDraft['modules']) => toSelection({ ...base, modules }).capabilities;
    expect(caps(['SHOP'])).toContain('SELL');
    expect(caps(['BOOKING'])).toContain('BOOK');
    expect(caps(['MEMBER_AREA'])).toContain('MEMBERSHIP');
    expect(caps(['PORTAL'])).toContain('DATA_PORTAL');

    expect(toSelection({ ...base, modules: ['SHOP'] }).structure).toBe('COMMERCE');
    expect(toSelection({ ...base, modules: [] }).structure).toBe('SERVICE');

    const blog = toSelection({ ...base, modules: ['BLOG'] });
    expect(blog.experiences?.map((e) => e.id)).toContain('JOURNAL');

    const plain = toSelection(base);
    const pages = toSelection({ ...base, modules: ['PAGES'] });
    const level = deriveBuildLevel(plain).level;
    const before = chosenExperiences(plain, level);
    expect(before.every((e) => e.depth === 'FULL')).toBe(true);
    expect(pages.experiences?.every((e) => e.depth === 'EXTENSIVE')).toBe(true);
    expect(pages.experiences?.length).toBe(before.length);
  });

  it('does not enable page modules for a WORLD build', () => {
    const world = toSelection(draft({ path: 'WORLD', feel: 'CINEMATIC_LUXURY', modules: ['PAGES', 'BLOG', 'BOOKING'] }));
    expect(world.experiences).toBeNull();
    expect(world.capabilities).toContain('BOOK');
  });

  it('maps PACE onto the canonical delivery modes', () => {
    const base = draft({ path: 'SIMPLE', feel: 'ARCHITECTURAL_MINIMAL' });
    expect(toSelection({ ...base, pace: 'STANDARD' }).delivery).toBe('STANDARD');
    expect(toSelection({ ...base, pace: 'EXPEDITED' }).delivery).toBe('PRIORITY');
    expect(toSelection({ ...base, pace: 'FLEXIBLE' }).delivery).toBe('CUSTOM_SCHEDULE');
  });
});

describe('Builder studio — guard rails and readiness', () => {
  it('asks before a SIMPLE client adds a capability that needs an advanced build', () => {
    const simple = draft({ path: 'SIMPLE', feel: 'ARCHITECTURAL_MINIMAL' });
    const shop = moduleLevelCheck(simple, 'SHOP');
    expect(shop.raises).toBe(true);
    // Booking is available to every build level, so it never asks.
    expect(moduleLevelCheck(simple, 'BOOKING').raises).toBe(false);
    // Once the client keeps it, the level rises and nothing blocks submission.
    const kept = { ...simple, modules: ['SHOP' as const], acceptedLevelRaise: true };
    expect(deriveBuildLevel(toSelection(kept)).level).toBe('ADVANCED');
    expect(studioReadiness(kept).ready).toBe(true);
  });

  it('treats an unresolved level raise as an open decision', () => {
    const blocked = draft({ path: 'SIMPLE', feel: 'ARCHITECTURAL_MINIMAL', structure: 'COMMERCE' });
    const readiness = studioReadiness(blocked);
    expect(readiness.ready).toBe(false);
    expect(readiness.decisions.length).toBeGreaterThan(0);
  });

  it('gates rooms on the answers they need', () => {
    expect(firstOpenRoom(emptyDraft())).toBe('place');
    expect(canEnterRoom(emptyDraft(), 'feel')).toBe(false);
    const placed = draft({ path: 'SIMPLE' });
    expect(canEnterRoom(placed, 'feel')).toBe(true);
    expect(canEnterRoom(placed, 'work')).toBe(false);
    const felt = draft({ path: 'SIMPLE', feel: 'SOFT_ORGANIC' });
    expect(canEnterRoom(felt, 'blueprint')).toBe(true);
    expect(studioReadiness(felt).ready).toBe(true);
  });

  it('a CUSTOM direction is ready even though type, colour, image and motion are left to creative direction', () => {
    const custom = draft({ path: 'CUSTOM', feel: 'EDITORIAL_OBJECT' });
    expect(studioReadiness(custom).ready).toBe(true);
  });
});

describe('Builder studio — persistence', () => {
  it('round-trips a draft and rejects unknown versions or ids', () => {
    const saved = draft({ path: 'ADVANCED', feel: 'POP_EDITORIAL', modules: ['SHOP', 'BOOKING'], pace: 'FLEXIBLE', notes: 'Spring launch', furthestRoom: 'pace' });
    expect(parseDraft(JSON.stringify(saved))).toEqual(saved);
    expect(parseDraft(JSON.stringify({ ...saved, version: STUDIO_DRAFT_VERSION + 1 }))).toBeNull();
    expect(parseDraft('not json')).toBeNull();
    const tampered = parseDraft(JSON.stringify({ ...saved, modules: ['SHOP', 'TELEPORT'], path: 'MEGA', pace: 'WARP' }));
    expect(tampered?.modules).toEqual(['SHOP']);
    expect(tampered?.path).toBeNull();
    expect(tampered?.pace).toBe('STANDARD');
  });
});

describe('Builder studio — estimator binding', () => {
  it('shows the canonical estimator ranges, reformatted for display only', () => {
    const selection = toSelection(draft({ path: 'ADVANCED', feel: 'ARCHITECTURAL_MINIMAL', modules: ['SHOP'] }));
    const view = builderEstimateView(selection);
    const outcome = estimateProject(toEstimateConfig(selection, 'SELF_SERVE', 'STANDARD'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const [low, high] = expandInvestment(view.investment)
      .replace(/AROUND /, '')
      .split(' – ')
      .map((v) => Number(v.replace(/[$,]/g, '')));
    expect(low).toBe(Math.round(outcome.result.investmentLow / 1000) * 1000);
    expect(high ?? low).toBeGreaterThanOrEqual(low);
    expect(expandInvestment('$12K–$18K')).toBe('$12,000 – $18,000');
    expect(view.productionWindow).not.toMatch(/BUSINESS DAYS/);
  });

  it('recalculates when relevant choices change', () => {
    const base = draft({ path: 'ADVANCED', feel: 'ARCHITECTURAL_MINIMAL' });
    const a = builderEstimateView(toSelection(base));
    const b = builderEstimateView(toSelection({ ...base, modules: ['SHOP', 'MEMBER_AREA', 'PORTAL'] }));
    expect(b.investment).not.toBe(a.investment);
    expect(effectiveCapabilities(toSelection({ ...base, modules: ['SHOP'] }))).toEqual(expect.arrayContaining(['SELL', 'PAYMENTS', 'MEASURE']));
  });

  it('carries the selection and an estimator record into the submission payload', () => {
    const d = draft({ path: 'SIMPLE', feel: 'ARCHITECTURAL_MINIMAL', submission: { intakeId: 'x', submittedAt: '2026-10-08T00:00:00Z' } });
    const payload = buildSubmissionPayload(d, toSelection(d));
    expect(payload.builderStudio.version).toBe(1);
    expect(payload.builderStudio.estimateRecord.estimatorVersion).toBeTruthy();
    expect(payload.builderStudio.selection.build).toBe('SITE');
    expect('submission' in payload.builderStudio.studio).toBe(false);
  });
});

describe('Builder studio — Build Object composition', () => {
  const spec = { path: 'ADVANCED' as const, feel: 'ARCHITECTURAL_MINIMAL' as const, modules: [] as StudioDraft['modules'], pace: 'STANDARD' as const };

  it('adds a floor with a red module for each capability, and removes it again', () => {
    const empty = compose('work', spec);
    const shop = compose('work', { ...spec, modules: ['SHOP'] });
    expect(towerFloors(['SHOP']).length).toBe(towerFloors([]).length + 1);
    expect(shop.elements.find((e) => e.id === 'floor-SHOP-module')?.material).toBe('red');
    expect(empty.elements.find((e) => e.id.startsWith('floor-SHOP'))).toBeUndefined();
  });

  it('changes materials, not structure, when the visual direction changes', () => {
    const modern = compose('feel', spec);
    const immersive = compose('feel', { ...spec, feel: 'CINEMATIC_LUXURY' });
    expect(immersive.elements.map((e) => e.id)).toEqual(modern.elements.map((e) => e.id));
    expect(immersive.elements.map((e) => e.material)).not.toEqual(modern.elements.map((e) => e.material));
  });

  it('changes structural composition by path, and posture by pace', () => {
    const simple = compose('place', { ...spec, path: 'SIMPLE' });
    const world = compose('place', { ...spec, path: 'WORLD' });
    const plinthWidth = (c: typeof simple) => c.elements.find((e) => e.id === 'main-plinth')!.size[0];
    expect(plinthWidth(world)).toBeGreaterThan(plinthWidth(simple));
    expect(world.elements.map((e) => e.id)).not.toEqual(simple.elements.map((e) => e.id));
    const expedited = compose('pace', { ...spec, pace: 'EXPEDITED' });
    expect(expedited.elements.some((e) => e.id === 'express')).toBe(true);
    expect(compose('place', spec)).toEqual(compose('place', spec));
  });
});

describe('Builder studio — client language', () => {
  it('never shows forbidden estimator terms or Digital Foundation timelines in room copy', () => {
    const copy = [
      ...STUDIO_ROOMS.flatMap((r) => [r.lede, r.cta, ...r.headline]),
      ...PATH_OPTIONS.flatMap((o) => [o.label, o.descriptor, o.plain]),
      ...FEEL_OPTIONS.flatMap((o) => [o.label, o.descriptor]),
      ...WORK_MODULES.flatMap((o) => [o.label, o.plain]),
      ...PACE_OPTIONS.flatMap((o) => [o.label, o.sub, o.plain]),
      ...CORE_INCLUDED.flatMap((o) => [o.label, o.plain]),
    ]
      .join(' ')
      .toLowerCase();
    for (const term of FORBIDDEN_CLIENT_TERMS) expect(` ${copy} `).not.toContain(term);
    expect(copy).not.toMatch(/business days|\$\d/);
  });
});
