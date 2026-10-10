import { describe, expect, it } from 'vitest';
import { FORBIDDEN_CLIENT_TERMS } from '../builder-experience';
import {
  FEEL_OPTIONS as SPATIAL_FEEL_OPTIONS,
  PACE_OPTIONS as SPATIAL_PACE_OPTIONS,
  PLACE_OPTIONS as SPATIAL_PLACE_OPTIONS,
  WORK_OPTIONS as SPATIAL_WORK_OPTIONS,
  canEnterRoom,
  emptySpatialState,
  snapshotFromSpatialState,
} from '../builder-experience/spatialStudio';
import type { SpatialBuilderState } from '../builder-experience/spatialStudio';
import { FEEL_PALETTES, compose } from './buildObject/composition';
import {
  BLOCKER_COPY,
  FEEL_OPTIONS,
  PACE_OPTIONS,
  PATH_OPTIONS,
  STUDIO_ROOMS,
  WORK_MODULES,
  buildSpec,
  canEnterStudioRoom,
  expandInvestment,
  feelVisualSystem,
  furthestOpenRoom,
  moduleLevelCheck,
  parseStudioRoom,
  roomCanContinue,
  spacedRange,
} from './studioModel';
import { sameChoices, saveIndicator } from './useStudioSession';

const ready = (patch: Partial<SpatialBuilderState> = {}): SpatialBuilderState => ({
  ...emptySpatialState(),
  room: 'BLUEPRINT',
  placePath: 'ADVANCED',
  feelVibe: 'MODERN',
  workModules: ['PAGES', 'SHOP'],
  pace: 'STANDARD',
  ...patch,
});

describe('studio model consumes the spatial contract (no second engine)', () => {
  it('room options are exactly the contract ids', () => {
    expect(PATH_OPTIONS.map((o) => o.id)).toEqual(SPATIAL_PLACE_OPTIONS.map((o) => o.id));
    expect(FEEL_OPTIONS.map((o) => o.id)).toEqual(SPATIAL_FEEL_OPTIONS.map((o) => o.id));
    expect(new Set(WORK_MODULES.map((o) => o.id))).toEqual(new Set(SPATIAL_WORK_OPTIONS.map((o) => o.id)));
    expect(PACE_OPTIONS.map((o) => o.id)).toEqual(SPATIAL_PACE_OPTIONS.map((o) => o.id));
  });

  it('FEEL descriptors read the visual system the contract maps onto', () => {
    expect(feelVisualSystem('MODERN')?.id).toBe('ARCHITECTURAL_MINIMAL');
    expect(feelVisualSystem('IMMERSIVE')?.id).toBe('CINEMATIC_LUXURY');
    expect(FEEL_OPTIONS.find((o) => o.id === 'MODERN')!.descriptor).toBe('CLEAN. REFINED. TIMELESS.');
  });

  it('room access is the contract rule', () => {
    const states: SpatialBuilderState[] = [
      emptySpatialState(),
      { ...emptySpatialState(), placePath: 'SIMPLE' },
      { ...emptySpatialState(), placePath: 'SIMPLE', feelVibe: 'BOLD' },
      ready({ pace: null }),
      ready(),
    ];
    for (const state of states) {
      for (const room of STUDIO_ROOMS) {
        expect(canEnterStudioRoom(state, room.id)).toBe(canEnterRoom(state, room.spatial));
      }
    }
    expect(furthestOpenRoom(emptySpatialState())).toBe('place');
    expect(furthestOpenRoom(ready())).toBe('blueprint');
    expect(roomCanContinue(ready({ pace: null }), 'pace')).toBe(false);
    expect(parseStudioRoom('work/extra')).toBe('work');
    expect(parseStudioRoom('nowhere')).toBeNull();
  });

  it('SIMPLE + an advanced capability asks first; moving to ADVANCED resolves the contract decision', () => {
    const simple = ready({ placePath: 'SIMPLE', workModules: ['PAGES'] });
    expect(moduleLevelCheck(simple, 'SHOP')).toEqual({ raises: true, reason: 'SHOP IS PART OF AN ADVANCED BUILD.' });
    expect(moduleLevelCheck(simple, 'BLOG').raises).toBe(false);
    expect(moduleLevelCheck({ ...simple, placePath: 'ADVANCED' }, 'SHOP').raises).toBe(false);
    const kept = snapshotFromSpatialState({ ...simple, workModules: ['PAGES', 'SHOP'] }, { allowEstimate: true });
    expect(kept.submission_ready).toBe(false);
    expect(kept.submission_blockers).toContain('BLUEPRINT_INCOMPLETE');
    const moved = snapshotFromSpatialState({ ...simple, placePath: 'ADVANCED', workModules: ['PAGES', 'SHOP'] }, { allowEstimate: true });
    expect(moved.submission_ready).toBe(true);
  });

  it('every contract blocker has client words', () => {
    for (const code of ['PLACE_NOT_CHOSEN', 'FEEL_NOT_CHOSEN', 'WORK_EMPTY', 'PACE_NOT_CHOSEN', 'BLUEPRINT_INCOMPLETE', 'ESTIMATE_INVALID']) {
      expect(BLOCKER_COPY[code]).toBeDefined();
    }
  });

  it('records the CUSTOM contract gap: a CUSTOM Blueprint never becomes submittable (reported, not patched)', () => {
    const custom = snapshotFromSpatialState(ready({ placePath: 'CUSTOM', paceNotes: 'A direction' }), { allowEstimate: true });
    expect(custom.submission_ready).toBe(false);
    expect(custom.blueprint.lines.filter((l) => l.open).map((l) => l.key)).toEqual(expect.arrayContaining(['TYPE', 'COLOR', 'IMAGE']));
  });

  it('display helpers only reformat the canonical strings', () => {
    expect(expandInvestment('$17K–$32K')).toBe('$17,000 – $32,000');
    expect(spacedRange('3–6 MONTHS')).toBe('3 – 6 MONTHS');
  });
});

describe('Build Object composition', () => {
  it('has one palette per contract FEEL and keys change with every choice', () => {
    expect(Object.keys(FEEL_PALETTES).sort()).toEqual(SPATIAL_FEEL_OPTIONS.map((o) => o.id).sort());
    const a = compose('blueprint', buildSpec(ready()));
    const b = compose('blueprint', buildSpec(ready({ workModules: ['PAGES', 'SHOP', 'BOOKING'] })));
    const c = compose('blueprint', buildSpec(ready({ pace: 'EXPEDITED' })));
    expect(new Set([a.key, b.key, c.key]).size).toBe(3);
    expect(b.elements.length).toBeGreaterThan(a.elements.length);
    expect(compose('work', buildSpec(ready({ pace: null }))).key.endsWith('|-')).toBe(true);
  });
});

describe('save status never claims a server save it does not have', () => {
  const base = { saveState: 'saved' as const, lastSavedAt: null, errorMessage: null, conflictReason: null };
  it('only server-confirmed states say SAVED', () => {
    for (const status of ['local_only', 'sync_failed', 'restoring', 'saving', 'submission_failed', 'conflict'] as const) {
      expect(saveIndicator({ ...base, status }).label.startsWith('SAVED')).toBe(false);
    }
    expect(saveIndicator({ ...base, status: 'saved' }).label.startsWith('SAVED')).toBe(true);
    expect(saveIndicator({ ...base, status: 'local_only' }).retry).toBe(true);
    expect(saveIndicator({ ...base, status: 'sync_failed' }).retry).toBe(true);
    expect(saveIndicator({ ...base, status: 'saved', recoveredLocal: true }).detail).toMatch(/CONFLICT RESOLVED/);
  });

  it('compares choices, not timestamps or navigation', () => {
    const a = ready();
    expect(sameChoices(a, { ...a, room: 'PLACE', savedAt: 'x' })).toBe(true);
    expect(sameChoices(a, { ...a, workModules: ['SHOP', 'PAGES'] })).toBe(false);
    expect(sameChoices(a, { ...a, paceNotes: 'note' })).toBe(false);
    expect(sameChoices(null, a)).toBe(false);
  });
});

describe('client copy', () => {
  const copy = [
    ...STUDIO_ROOMS.flatMap((r) => [...r.headline, r.lede, r.cta]),
    ...PATH_OPTIONS.flatMap((o) => [o.label, o.descriptor, o.plain]),
    ...FEEL_OPTIONS.flatMap((o) => [o.label, o.descriptor]),
    ...WORK_MODULES.flatMap((o) => [o.label, o.plain]),
    ...PACE_OPTIONS.flatMap((o) => [o.label, o.sub, o.plain]),
    ...Object.values(BLOCKER_COPY).map((b) => b.text),
  ].join(' \n ');

  it('never uses the Digital Foundation day windows', () => {
    expect(copy).not.toMatch(/2\s*[–-]\s*3 BUSINESS DAYS/i);
    expect(copy).not.toMatch(/3\s*[–-]\s*5 BUSINESS DAYS/i);
  });

  it('avoids forbidden client terms', () => {
    for (const term of FORBIDDEN_CLIENT_TERMS) {
      expect(new RegExp(`\\b${term.trim()}\\b`, 'i').test(copy), term).toBe(false);
    }
  });
});
