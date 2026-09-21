/**
 * P0.VR.PAGE-CONCEPT-LIVE-STAGE-PROGRESSION1 — single source of truth for panel progression.
 */

import type { PageConceptGenerationStatus } from './types.js';
import type { PageConceptStageId } from '../designPageConceptGeneratorShell.js';
import type {
  PageConceptCgptSubstepRunDetail,
  PageConceptCgptSubstepServerState,
} from './pageConceptCgptSubstepRun.js';

export type PageConceptProgressStageId = PageConceptStageId;

export type PageConceptCgptSubstepId =
  | 'creative-direction'
  | 'page-intelligence'
  | 'brand-context'
  | 'key-messages'
  | 'visual-moodboard';

export type PageConceptSubstepRunState =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETE'
  | 'RATE_LIMITED'
  | 'FAILED';

/** Truthful CGPT prep order — synthesis last. */
export const PAGE_CONCEPT_CGPT_SUBSTEP_ORDER: readonly PageConceptCgptSubstepId[] = [
  'page-intelligence',
  'brand-context',
  'key-messages',
  'visual-moodboard',
  'creative-direction',
];

export type PageConceptPanelProgress = {
  currentStage: PageConceptProgressStageId;
  currentSubstep: PageConceptCgptSubstepId | null;
  stageStatusById: Record<PageConceptProgressStageId, PageConceptSubstepRunState>;
  substepStatusById: Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>;
  nbpActiveLabel: string | null;
  updatedAt: string;
  failureStage: PageConceptProgressStageId | null;
  failureSubstep: PageConceptCgptSubstepId | null;
};

export function emptyCgptSubstepMap(): Record<PageConceptCgptSubstepId, PageConceptSubstepRunState> {
  return {
    'creative-direction': 'PENDING',
    'page-intelligence': 'PENDING',
    'brand-context': 'PENDING',
    'key-messages': 'PENDING',
    'visual-moodboard': 'PENDING',
  };
}

export function buildCgptSubstepStatuses(input: {
  activeSubstep: PageConceptCgptSubstepId;
  failedSubstep?: PageConceptCgptSubstepId | null;
}): Record<PageConceptCgptSubstepId, PageConceptSubstepRunState> {
  const map = emptyCgptSubstepMap();
  const activeIdx = PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.indexOf(input.activeSubstep);
  for (const id of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
    const idx = PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.indexOf(id);
    if (input.failedSubstep === id) {
      map[id] = 'FAILED';
    } else if (idx < activeIdx) {
      map[id] = 'COMPLETE';
    } else if (id === input.activeSubstep) {
      map[id] = 'ACTIVE';
    } else {
      map[id] = 'PENDING';
    }
  }
  return map;
}

export function buildStageStatusesForPipeline(input: {
  currentStage: PageConceptProgressStageId;
  failedStage?: PageConceptProgressStageId | null;
}): Record<PageConceptProgressStageId, PageConceptSubstepRunState> {
  const order: PageConceptProgressStageId[] = ['CGPT', 'GPT2', 'NBP'];
  const idx = order.indexOf(input.currentStage);
  const out: Record<PageConceptProgressStageId, PageConceptSubstepRunState> = {
    CGPT: 'PENDING',
    GPT2: 'PENDING',
    NBP: 'PENDING',
  };
  for (const stage of order) {
    const stageIdx = order.indexOf(stage);
    if (input.failedStage === stage) {
      out[stage] = 'FAILED';
    } else if (stageIdx < idx) {
      out[stage] = 'COMPLETE';
    } else if (stage === input.currentStage) {
      out[stage] = 'ACTIVE';
    } else {
      out[stage] = 'PENDING';
    }
  }
  return out;
}

export function buildPageConceptPanelProgress(input: {
  currentStage: PageConceptProgressStageId;
  activeCgptSubstep?: PageConceptCgptSubstepId | null;
  failedStage?: PageConceptProgressStageId | null;
  failedSubstep?: PageConceptCgptSubstepId | null;
  nbpActiveLabel?: string | null;
  updatedAt?: string;
}): PageConceptPanelProgress {
  const activeSubstep =
    input.currentStage === 'CGPT' && input.activeCgptSubstep ?
      input.activeCgptSubstep
    : null;
  return {
    currentStage: input.currentStage,
    currentSubstep: activeSubstep,
    stageStatusById: buildStageStatusesForPipeline({
      currentStage: input.currentStage,
      failedStage: input.failedStage ?? null,
    }),
    substepStatusById:
      input.currentStage === 'CGPT' && activeSubstep ?
        buildCgptSubstepStatuses({
          activeSubstep,
          failedSubstep: input.failedSubstep ?? null,
        })
      : input.failedStage === 'CGPT' && input.failedSubstep ?
        buildCgptSubstepStatuses({
          activeSubstep: input.failedSubstep,
          failedSubstep: input.failedSubstep,
        })
      : input.currentStage !== 'CGPT' ?
        Object.fromEntries(
          PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, 'COMPLETE' as const]),
        ) as Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>
      : emptyCgptSubstepMap(),
    nbpActiveLabel: input.nbpActiveLabel ?? null,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    failureStage: input.failedStage ?? null,
    failureSubstep: input.failedSubstep ?? null,
  };
}

export function parseNbpStageLabel(currentStage: string | null): string | null {
  if (!currentStage?.startsWith('NBP_')) return null;
  return currentStage.replace(/_/g, ' ');
}

export function derivePageConceptLiveProgress(input: {
  generationStatus: PageConceptGenerationStatus;
  generating: boolean;
  activeGenerationStage: string | null;
  panelProgress: PageConceptPanelProgress | null;
  cgptFailed: boolean;
}): PageConceptPanelProgress {
  if (input.panelProgress) return input.panelProgress;

  const now = new Date().toISOString();
  if (input.generationStatus === 'GPT2_RUNNING' || input.activeGenerationStage?.startsWith('GPT2')) {
    return buildPageConceptPanelProgress({ currentStage: 'GPT2', updatedAt: now });
  }
  if (input.generationStatus === 'NBP_RUNNING' || input.activeGenerationStage?.startsWith('NBP_')) {
    return buildPageConceptPanelProgress({
      currentStage: 'NBP',
      nbpActiveLabel: parseNbpStageLabel(input.activeGenerationStage),
      updatedAt: now,
    });
  }
  if (
    input.generationStatus === 'CGPT_RUNNING' ||
    input.generationStatus === 'CGPT_RATE_LIMITED' ||
    input.generating
  ) {
    const substep = inferCgptSubstepFromStage(input.activeGenerationStage);
    return buildPageConceptPanelProgress({
      currentStage: 'CGPT',
      activeCgptSubstep: substep,
      failedStage: input.cgptFailed ? 'CGPT' : null,
      failedSubstep: input.cgptFailed ? substep : null,
      updatedAt: now,
    });
  }
  if (input.generationStatus === 'READY_FOR_FOUNDER_REVIEW' || input.generationStatus === 'PARTIAL_GENERATION') {
    return {
      currentStage: 'NBP',
      currentSubstep: null,
      stageStatusById: { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'COMPLETE' },
      substepStatusById: Object.fromEntries(
        PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, 'COMPLETE' as const]),
      ) as Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>,
      nbpActiveLabel: null,
      updatedAt: now,
      failureStage: null,
      failureSubstep: null,
    };
  }
  if (input.generationStatus === 'FAILED' && input.cgptFailed) {
    const substep = inferCgptSubstepFromStage(input.activeGenerationStage);
    return buildPageConceptPanelProgress({
      currentStage: 'CGPT',
      activeCgptSubstep: substep,
      failedStage: 'CGPT',
      failedSubstep: substep,
      updatedAt: now,
    });
  }
  return {
    currentStage: 'CGPT',
    currentSubstep: null,
    stageStatusById: { CGPT: 'PENDING', GPT2: 'PENDING', NBP: 'PENDING' },
    substepStatusById: emptyCgptSubstepMap(),
    nbpActiveLabel: null,
    updatedAt: now,
    failureStage: null,
    failureSubstep: null,
  };
}

export function mapCgptServerSubstepToPanel(
  state: PageConceptCgptSubstepServerState,
): PageConceptSubstepRunState {
  if (state === 'RUNNING') return 'ACTIVE';
  if (state === 'RATE_LIMITED') return 'RATE_LIMITED';
  if (state === 'COMPLETE') return 'COMPLETE';
  if (state === 'FAILED') return 'FAILED';
  return 'PENDING';
}

export function buildPanelProgressFromCgptSubstepDetail(
  detail: PageConceptCgptSubstepRunDetail,
  extra?: { nbpActiveLabel?: string | null; failedStage?: PageConceptProgressStageId | null },
): PageConceptPanelProgress {
  const substepStatusById = Object.fromEntries(
    PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [
      id,
      mapCgptServerSubstepToPanel(detail.substepStatusById[id] ?? 'PENDING'),
    ]),
  ) as Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>;

  const failedSubstep = PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.find(
    (id) => detail.substepStatusById[id] === 'FAILED',
  );
  return {
    currentStage: 'CGPT',
    currentSubstep: detail.currentCgptSubstep,
    stageStatusById: buildStageStatusesForPipeline({
      currentStage: 'CGPT',
      failedStage: extra?.failedStage ?? (failedSubstep ? 'CGPT' : null),
    }),
    substepStatusById,
    nbpActiveLabel: extra?.nbpActiveLabel ?? null,
    updatedAt: new Date().toISOString(),
    failureStage: failedSubstep ? 'CGPT' : null,
    failureSubstep: failedSubstep ?? null,
  };
}

export function inferCgptSubstepFromStage(stage: string | null): PageConceptCgptSubstepId {
  if (!stage) return 'page-intelligence';
  const token = stage.includes('CGPT_SUB:') ? stage.split('CGPT_SUB:')[1]?.trim() : null;
  if (token && PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.includes(token as PageConceptCgptSubstepId)) {
    return token as PageConceptCgptSubstepId;
  }
  if (stage.includes('visual-moodboard') || stage.includes('CGPT_RUNNING') || stage.includes('RETRY')) {
    return 'visual-moodboard';
  }
  if (stage.includes('key-messages')) return 'key-messages';
  if (stage.includes('brand-context')) return 'brand-context';
  if (stage.includes('page-intelligence')) return 'page-intelligence';
  return 'page-intelligence';
}

export function pageConceptPanelProgressToStageStates(
  progress: PageConceptPanelProgress,
): Record<PageConceptProgressStageId, import('../designPageConceptGeneratorShell.js').PageConceptStageState> {
  const mapRunToShell = (s: PageConceptSubstepRunState): import('../designPageConceptGeneratorShell.js').PageConceptStageState => {
    switch (s) {
      case 'ACTIVE':
        return 'ACTIVE';
      case 'COMPLETE':
        return 'COMPLETE';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  };
  return {
    CGPT: mapRunToShell(progress.stageStatusById.CGPT),
    GPT2: mapRunToShell(progress.stageStatusById.GPT2),
    NBP: mapRunToShell(progress.stageStatusById.NBP),
  };
}

export function activeCgptSubstepCopy(substep: PageConceptCgptSubstepId): string {
  const label = substep.replace(/-/g, ' ').toUpperCase();
  return `RUNNING ${label}`;
}

export function pageConceptProgressPatchForCgptSubstep(substepId: PageConceptCgptSubstepId): {
  currentStage: string;
  panelProgress: PageConceptPanelProgress;
} {
  return {
    currentStage: `CGPT_SUB:${substepId}`,
    panelProgress: buildPageConceptPanelProgress({
      currentStage: 'CGPT',
      activeCgptSubstep: substepId,
    }),
  };
}

export function pageConceptProgressPatchForCgptFailure(substepId: PageConceptCgptSubstepId): {
  currentStage: string;
  panelProgress: PageConceptPanelProgress;
} {
  return {
    currentStage: `CGPT_FAILED:${substepId}`,
    panelProgress: buildPageConceptPanelProgress({
      currentStage: 'CGPT',
      activeCgptSubstep: substepId,
      failedStage: 'CGPT',
      failedSubstep: substepId,
    }),
  };
}

export function pageConceptProgressPatchForGpt2(): {
  currentStage: string;
  panelProgress: PageConceptPanelProgress;
} {
  return {
    currentStage: 'GPT2_STARTING',
    panelProgress: buildPageConceptPanelProgress({ currentStage: 'GPT2' }),
  };
}

export function pageConceptProgressPatchForNbp(currentStage: string): {
  currentStage: string;
  panelProgress: PageConceptPanelProgress;
} {
  return {
    currentStage,
    panelProgress: buildPageConceptPanelProgress({
      currentStage: 'NBP',
      nbpActiveLabel: parseNbpStageLabel(currentStage),
    }),
  };
}
