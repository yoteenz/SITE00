/**
 * Presentation-neutral Build Object inputs for Opus visual layer.
 * No imagery, CSS, or scene technology — only configuration-derived parameters.
 */
import { deriveBuildLevel, effectiveCapabilities } from '../rules';
import type { BuilderSelection } from '../types';
import type { FeelVibeId, PacePreferenceId, PlacePathId, WorkModuleId } from './types';
import { spatialSelectionToBuilder } from './mapping';

export type BuildObjectVisualParameters = {
  build_kind: BuilderSelection['build'];
  build_level: ReturnType<typeof deriveBuildLevel>['level'];
  place_path: PlacePathId | null;
  feel_vibe: FeelVibeId | null;
  capability_count: number;
  capability_ids: ReturnType<typeof effectiveCapabilities>;
  work_modules: WorkModuleId[];
  structural_complexity: 'LIGHT' | 'STANDARD' | 'DEEP' | 'WORLD';
  expression_edition: BuilderSelection['expression']['edition'];
  production_preference: PacePreferenceId | null;
  layer_count_hint: number;
  spatial_world: boolean;
};

function structuralComplexity(selection: BuilderSelection): BuildObjectVisualParameters['structural_complexity'] {
  if (selection.build === 'WORLD') return 'WORLD';
  const { level } = deriveBuildLevel(selection);
  if (level === 'SIMPLE') return 'LIGHT';
  if (level === 'ADVANCED') return 'STANDARD';
  return 'DEEP';
}

/** Derive layer hint for Opus (not a literal 3D scene graph). */
export function buildObjectLayerHint(input: {
  placePath: PlacePathId | null;
  workModules: WorkModuleId[];
}): number {
  let n = 2;
  if (input.placePath === 'ADVANCED') n += 1;
  if (input.placePath === 'CUSTOM') n += 2;
  if (input.placePath === 'WORLD') n += 2;
  n += Math.min(4, input.workModules.length);
  return Math.min(8, n);
}

export function buildObjectParametersFromSelection(selection: BuilderSelection): BuildObjectVisualParameters {
  const caps = effectiveCapabilities(selection);
  return {
    build_kind: selection.build,
    build_level: deriveBuildLevel(selection).level,
    place_path: null,
    feel_vibe: null,
    capability_count: caps.length,
    capability_ids: caps,
    work_modules: [],
    structural_complexity: structuralComplexity(selection),
    expression_edition: selection.expression.edition,
    production_preference: null,
    layer_count_hint: buildObjectLayerHint({ placePath: null, workModules: [] }),
    spatial_world: selection.build === 'WORLD' || selection.build === 'HYBRID',
  };
}

export function buildObjectParametersFromSpatialState(input: {
  placePath: PlacePathId | null;
  feelVibe: FeelVibeId | null;
  workModules: WorkModuleId[];
  pace: PacePreferenceId | null;
}): BuildObjectVisualParameters {
  const selection = spatialSelectionToBuilder({
    version: 1,
    room: 'BLUEPRINT',
    placePath: input.placePath,
    feelVibe: input.feelVibe,
    workModules: input.workModules,
    pace: input.pace,
    paceNotes: '',
    blueprintSection: 'OVERVIEW',
    buildObjectView: 'FRONT',
    savedAt: null,
  });
  const base = buildObjectParametersFromSelection(selection);
  return {
    ...base,
    place_path: input.placePath,
    feel_vibe: input.feelVibe,
    work_modules: [...input.workModules],
    production_preference: input.pace,
    layer_count_hint: buildObjectLayerHint({
      placePath: input.placePath,
      workModules: input.workModules,
    }),
  };
}
