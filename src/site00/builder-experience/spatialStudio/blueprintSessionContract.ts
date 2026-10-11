/**
 * Blueprint + estimate session contract (presentation-neutral).
 * All currency and calendar strings originate from `builderEstimateView` / canonical estimator.
 */
import { scopeEstimatorEnabled } from '../../../studioos/estimation/flags';
import { ESTIMATOR_VERSION } from '../../../studioos/estimation/version';
import { resolveScopeEstimate, type ScopeEstimateResult } from '../scopeEstimateResult';
import { builderBlueprint, builderScopeSignal, type BlueprintView, type BuilderEstimateView } from '../clientView';
import type { BuilderSelection } from '../types';
import { spatialSelectionToBuilder } from './mapping';
import type { SpatialBuilderState } from './types';

export type BlueprintSessionSnapshot = {
  estimator_version: string;
  selection: BuilderSelection;
  blueprint: BlueprintView;
  scope: ReturnType<typeof builderScopeSignal>;
  scope_estimate: ScopeEstimateResult | null;
  estimate: BuilderEstimateView | null;
  estimate_error: string | null;
  saved_at: string | null;
  submission_ready: boolean;
  submission_blockers: string[];
};

export function computeEstimateForSpatialRoom(room: SpatialBuilderState['room']): boolean {
  return room === 'BLUEPRINT' && scopeEstimatorEnabled();
}

/** Whether dollar/week figures may be shown to the client (independent of computation). */
export function revealClientEstimateFigures(room: SpatialBuilderState['room'], clientEstimatePreviewEnabled: boolean): boolean {
  return room === 'BLUEPRINT' && clientEstimatePreviewEnabled;
}

/** @deprecated Use `computeEstimateForSpatialRoom` + `revealClientEstimateFigures`. Kept for handoff docs. */
export function revealEstimateForRoom(room: SpatialBuilderState['room'], clientEstimatePreviewEnabled: boolean): boolean {
  return revealClientEstimateFigures(room, clientEstimatePreviewEnabled);
}

export function snapshotFromSpatialState(
  state: SpatialBuilderState,
  opts?: { allowEstimate?: boolean; computeEstimate?: boolean },
): BlueprintSessionSnapshot {
  const selection = spatialSelectionToBuilder(state);
  const blueprint = builderBlueprint(selection);
  const scope = builderScopeSignal(selection);
  const compute =
    opts?.computeEstimate ?? (opts?.allowEstimate === false ? false : computeEstimateForSpatialRoom(state.room));

  let scope_estimate: ScopeEstimateResult | null = null;
  let estimate: BuilderEstimateView | null = null;
  let estimate_error: string | null = null;
  if (compute) {
    const resolved = resolveScopeEstimate(state);
    scope_estimate = resolved.scope;
    estimate = resolved.estimate;
    estimate_error = resolved.estimate_error;
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
    scope_estimate,
    estimate,
    estimate_error,
    saved_at: state.savedAt,
    submission_ready: blockers.length === 0 && state.room === 'BLUEPRINT',
    submission_blockers: blockers,
  };
}
