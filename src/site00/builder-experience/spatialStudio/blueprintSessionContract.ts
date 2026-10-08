/**
 * Blueprint + estimate session contract (presentation-neutral).
 * All currency and calendar strings originate from `builderEstimateView` / canonical estimator.
 */
import { ESTIMATOR_VERSION } from '../../../studioos/estimation/version';
import { builderBlueprint, builderEstimateView, builderScopeSignal, type BlueprintView, type BuilderEstimateView } from '../clientView';
import type { BuilderSelection } from '../types';
import { spatialSelectionToBuilder } from './mapping';
import type { SpatialBuilderState } from './types';

export type BlueprintSessionSnapshot = {
  estimator_version: string;
  selection: BuilderSelection;
  blueprint: BlueprintView;
  scope: ReturnType<typeof builderScopeSignal>;
  estimate: BuilderEstimateView | null;
  estimate_error: string | null;
  saved_at: string | null;
  submission_ready: boolean;
  submission_blockers: string[];
};

export function snapshotFromSpatialState(state: SpatialBuilderState, opts?: { allowEstimate?: boolean }): BlueprintSessionSnapshot {
  const selection = spatialSelectionToBuilder(state);
  const blueprint = builderBlueprint(selection);
  const scope = builderScopeSignal(selection);
  let estimate: BuilderEstimateView | null = null;
  let estimate_error: string | null = null;
  if (opts?.allowEstimate !== false) {
    try {
      estimate = builderEstimateView(selection);
    } catch (e) {
      estimate_error = e instanceof Error ? e.message : String(e);
    }
  }
  const blockers: string[] = [];
  if (!state.placePath) blockers.push('PLACE_NOT_CHOSEN');
  if (!state.feelVibe) blockers.push('FEEL_NOT_CHOSEN');
  if (state.workModules.length === 0) blockers.push('WORK_EMPTY');
  if (!state.pace) blockers.push('PACE_NOT_CHOSEN');
  if (!blueprint.complete) blockers.push('BLUEPRINT_INCOMPLETE');
  if (estimate_error) blockers.push('ESTIMATE_INVALID');

  return {
    estimator_version: ESTIMATOR_VERSION,
    selection,
    blueprint,
    scope,
    estimate,
    estimate_error,
    saved_at: state.savedAt,
    submission_ready: blockers.length === 0 && state.room === 'BLUEPRINT',
    submission_blockers: blockers,
  };
}

/** Rooms 01–04: scope only. Blueprint: include estimate when preview flag allows. */
export function revealEstimateForRoom(room: SpatialBuilderState['room'], clientEstimatePreviewEnabled: boolean): boolean {
  return room === 'BLUEPRINT' && clientEstimatePreviewEnabled;
}
