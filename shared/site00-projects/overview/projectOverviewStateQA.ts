/**
 * B5.9R7 — Overview stale state QA.
 */

import type { ProjectOverviewViewModel } from './types.js';
import { isGenericModulePhase, overviewHasEmptyBody } from './overviewHelpers.js';

export type ProjectOverviewStaleFailureClass =
  | 'OVERVIEW_PROGRESS_FALSE_ZERO'
  | 'OVERVIEW_PHASE_GENERIC_MODULE_NAME'
  | 'OVERVIEW_NEEDS_REVIEW_STALE'
  | 'OVERVIEW_BLOCKER_COUNT_STALE'
  | 'OVERVIEW_CURRENT_FOCUS_STALE'
  | 'OVERVIEW_MILESTONE_MISSING'
  | 'OVERVIEW_PROJECT_VISUAL_MISSING'
  | 'OVERVIEW_PROJECT_ADAPTER_NOT_MOUNTED'
  | 'OVERVIEW_GENERIC_FALLBACK_USED_IN_SPECIALIZED_PROJECT';

export type ProjectOverviewStateQAResult = {
  ok: boolean;
  failures: Array<{ class: ProjectOverviewStaleFailureClass; message: string }>;
};

export function runProjectOverviewStateQA(args: {
  model: ProjectOverviewViewModel;
  specializedProjectIds?: string[];
  expectedNeedsYourEye?: number;
  expectedBlockers?: number;
  staleFocusLabels?: string[];
}): ProjectOverviewStateQAResult {
  const failures: ProjectOverviewStateQAResult['failures'] = [];
  const { model } = args;
  const specialized = new Set(args.specializedProjectIds ?? ['ndxbook', 'frontal-slayer', 'studio-world', 'all-in-one-enterprises', 'astral-world']);

  if (model.progress.percent === 0 && model.progress.confidence === 'LOW' && !model.progress.label) {
    failures.push({
      class: 'OVERVIEW_PROGRESS_FALSE_ZERO',
      message: `${model.projectId} shows 0% without derivation evidence`,
    });
  }

  if (isGenericModulePhase(model.phase)) {
    failures.push({
      class: 'OVERVIEW_PHASE_GENERIC_MODULE_NAME',
      message: `${model.projectId} phase is generic module name: ${model.phase}`,
    });
  }

  if (args.expectedNeedsYourEye != null && model.needsYourEyeCount !== args.expectedNeedsYourEye) {
    failures.push({
      class: 'OVERVIEW_NEEDS_REVIEW_STALE',
      message: `Expected ${args.expectedNeedsYourEye} needs-your-eye, got ${model.needsYourEyeCount}`,
    });
  }

  if (args.expectedBlockers != null && model.blockerCount !== args.expectedBlockers) {
    failures.push({
      class: 'OVERVIEW_BLOCKER_COUNT_STALE',
      message: `Expected ${args.expectedBlockers} blockers, got ${model.blockerCount}`,
    });
  }

  const staleLabels = args.staleFocusLabels ?? ['INTELLIGENCE IMPORT', 'CONFIGURE META CREDENTIALS'];
  if (model.currentFocus && staleLabels.some((s) => model.currentFocus!.label.includes(s))) {
    failures.push({
      class: 'OVERVIEW_CURRENT_FOCUS_STALE',
      message: `Stale current focus: ${model.currentFocus.label}`,
    });
  }

  if (!model.nextMilestone && !model.partialState) {
    failures.push({
      class: 'OVERVIEW_MILESTONE_MISSING',
      message: `${model.projectId} missing next milestone`,
    });
  }

  if (!model.visual.imageUrl && model.visual.visualClass === 'generic' && !model.visual.initials) {
    failures.push({
      class: 'OVERVIEW_PROJECT_VISUAL_MISSING',
      message: `${model.projectId} has no project visual fallback`,
    });
  }

  if (specialized.has(model.projectId) && model.adapterId === 'generic') {
    failures.push({
      class: 'OVERVIEW_GENERIC_FALLBACK_USED_IN_SPECIALIZED_PROJECT',
      message: `${model.projectId} mounted generic overview adapter`,
    });
  }

  return { ok: failures.length === 0, failures };
}

export function runEmptyGenericProjectOverviewQA(model: ProjectOverviewViewModel): {
  ok: boolean;
  failureClass: 'EMPTY_GENERIC_PROJECT_OVERVIEW' | null;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (overviewHasEmptyBody(model)) reasons.push('overview body has no real cards');
  if (model.progress.percent === 0 && !model.progress.label) reasons.push('progress defaults to 0');
  if (!model.visual.imageUrl && model.visual.visualClass === 'generic') reasons.push('no project visual');
  if (!model.currentFocus) reasons.push('no current focus');
  if (!model.nextMilestone && !model.partialState) reasons.push('no next milestone');
  if (model.primarySignals.length === 0) reasons.push('no project-specific signals');

  return {
    ok: reasons.length === 0,
    failureClass: reasons.length > 0 ? 'EMPTY_GENERIC_PROJECT_OVERVIEW' : null,
    reasons,
  };
}
