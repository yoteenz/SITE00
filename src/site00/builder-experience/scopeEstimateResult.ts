/**
 * Shared scope estimation result for the Hybrid Spatial Studio.
 * Numbers come only from `estimateProject` + presentation policy — never hardcoded display text.
 */
import { builderBlueprint, builderEstimateView } from './clientView';
import { toEstimateConfig } from './toEstimateConfig';
import type { BuilderSelection } from './types';
import { estimateProject } from '../../studioos/estimation/engine';
import { presentEstimate } from '../../studioos/estimation/presentation';
import { scopeEstimatorEnabled } from '../../studioos/estimation/flags';
import { ESTIMATOR_VERSION } from '../../studioos/estimation/version';
import type { BuilderEstimateView } from './clientView';
import type { SpatialBuilderState } from './spatialStudio/types';
import { spatialSelectionToBuilder } from './spatialStudio/mapping';

export type QuoteStatus = 'ESTIMATED' | 'REQUIRES_REVIEW' | 'INCOMPLETE' | 'ERROR';

export type ScopeEstimateResult = {
  quoteStatus: QuoteStatus;
  buildType: SpatialBuilderState['placePath'];
  configurationFingerprint: string;
  priceMinimum: number | null;
  priceMaximum: number | null;
  currency: 'USD';
  timelineMinimum: number | null;
  timelineMaximum: number | null;
  timelineUnit: 'WEEKS' | 'MONTHS' | null;
  appliedModifiers: string[];
  assumptions: string[];
  estimatorVersion: string;
  calculatedAt: string;
  errorReason: string | null;
  /** Client-safe explanation when status is not ESTIMATED. */
  clientMessage: string | null;
};

/** Deterministic configuration fingerprint (stable across client and server). */
export function fingerprintSelectionSync(
  selection: BuilderSelection,
  state: Pick<SpatialBuilderState, 'placePath' | 'feelVibe' | 'workModules' | 'pace' | 'paceNotes'>,
): string {
  const payload = JSON.stringify({
    placePath: state.placePath,
    feelVibe: state.feelVibe,
    workModules: [...state.workModules].sort(),
    pace: state.pace,
    paceNotes: state.paceNotes ?? '',
    build: selection.build,
    structure: selection.structure,
    delivery: selection.delivery,
    capabilities: [...selection.capabilities].sort(),
    expression: selection.expression,
    viewports: selection.viewports,
    brand: selection.brand,
    content: selection.content,
    keepItSimple: selection.keepItSimple,
    world: selection.world,
  });
  let h1 = 0x811c9dc5;
  let h2 = 0;
  for (let i = 0; i < payload.length; i += 1) {
    const c = payload.charCodeAt(i);
    h1 = (Math.imul(h1 ^ c, 0x01000193)) >>> 0;
    h2 = (h2 + c * (i + 1)) >>> 0;
  }
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

function incompleteMessage(state: SpatialBuilderState, blueprintIncomplete: boolean): string {
  if (!state.placePath) return 'Choose a build type to see an estimated range.';
  if (!state.feelVibe) return 'Choose a visual direction to see an estimated range.';
  if (state.workModules.length === 0) return 'Choose at least one capability to see an estimated range.';
  if (!state.pace) return 'Choose a build priority to see an estimated range.';
  if (blueprintIncomplete) return 'Your Blueprint has an open decision. Complete it to see an estimated range.';
  return 'Complete your selections to see an estimated range.';
}

export type ResolvedScopeEstimate = {
  scope: ScopeEstimateResult;
  estimate: BuilderEstimateView | null;
  estimate_error: string | null;
};

export function resolveScopeEstimate(state: SpatialBuilderState, now = new Date().toISOString()): ResolvedScopeEstimate {
  const selection = spatialSelectionToBuilder(state);
  const fingerprint = fingerprintSelectionSync(selection, state);
  const base: ScopeEstimateResult = {
    quoteStatus: 'INCOMPLETE',
    buildType: state.placePath,
    configurationFingerprint: fingerprint,
    priceMinimum: null,
    priceMaximum: null,
    currency: 'USD',
    timelineMinimum: null,
    timelineMaximum: null,
    timelineUnit: null,
    appliedModifiers: [],
    assumptions: [],
    estimatorVersion: ESTIMATOR_VERSION,
    calculatedAt: now,
    errorReason: null,
    clientMessage: null,
  };

  const blueprint = builderBlueprint(selection);
  const blueprintIncomplete = !blueprint.complete;

  if (state.room !== 'BLUEPRINT') {
    return {
      scope: {
        ...base,
        clientMessage: 'Estimates appear on the Blueprint once your rooms are complete.',
      },
      estimate: null,
      estimate_error: null,
    };
  }

  if (!scopeEstimatorEnabled()) {
    return {
      scope: {
        ...base,
        quoteStatus: 'ERROR',
        errorReason: 'SCOPE_ESTIMATOR_DISABLED',
        clientMessage: 'Estimation is temporarily unavailable. Your selections are saved.',
      },
      estimate: null,
      estimate_error: 'SCOPE_ESTIMATOR_DISABLED',
    };
  }

  if (blueprintIncomplete || !state.placePath || !state.feelVibe || state.workModules.length === 0 || !state.pace) {
    const msg = incompleteMessage(state, blueprintIncomplete);
    return {
      scope: {
        ...base,
        quoteStatus: 'INCOMPLETE',
        clientMessage: msg,
      },
      estimate: null,
      estimate_error: null,
    };
  }

  const config = toEstimateConfig(selection);
  const outcome = estimateProject(config);
  if (!outcome.ok) {
    const reason = outcome.errors.join(' ');
    return {
      scope: {
        ...base,
        quoteStatus: 'ERROR',
        errorReason: reason,
        clientMessage: 'This configuration cannot be estimated yet. Adjust your selections or contact SITE 00.',
      },
      estimate: null,
      estimate_error: reason,
    };
  }

  const result = outcome.result;
  const presentation = presentEstimate(result);
  const modifiers: string[] = [
    `BUILD_LEVEL:${config.buildLevel}`,
    `DELIVERY:${config.deliveryMode}`,
    `PROJECT_TYPE:${config.projectType}`,
    ...config.featureIds.map((id) => `FEATURE:${id}`),
  ];
  if (result.customScopeRequired) modifiers.push('CUSTOM_SCOPE_REQUIRED');
  if (result.worldCalibrationNeeded) modifiers.push('WORLD_CALIBRATION_NEEDED');

  let quoteStatus: QuoteStatus = 'ESTIMATED';
  let clientMessage: string | null = null;
  if (result.customScopeRequired || result.worldCalibrationNeeded || presentation.investment.founderReview || presentation.timeline.founderReview) {
    quoteStatus = 'REQUIRES_REVIEW';
    clientMessage =
      state.placePath === 'WORLD'
        ? 'World-building scope is indicative. A founder refines this range at Blueprint review.'
        : state.placePath === 'CUSTOM'
          ? 'Custom creative direction needs founder review before this range is treated as firm.'
          : 'This scope needs founder review before the range is treated as firm.';
  }

  let estimate: BuilderEstimateView | null = null;
  try {
    estimate = builderEstimateView(selection);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return {
      scope: {
        ...base,
        quoteStatus: 'ERROR',
        errorReason: reason,
        clientMessage: 'This configuration cannot be estimated yet. Adjust your selections or contact SITE 00.',
      },
      estimate: null,
      estimate_error: reason,
    };
  }

  return {
    scope: {
      ...base,
      quoteStatus,
      priceMinimum: presentation.investment.low,
      priceMaximum: presentation.investment.high,
      timelineMinimum: presentation.timeline.low,
      timelineMaximum: presentation.timeline.high,
      timelineUnit: presentation.timeline.unit,
      appliedModifiers: modifiers,
      assumptions: result.assumptions.slice(0, 8),
      clientMessage,
    },
    estimate,
    estimate_error: null,
  };
}
