/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-COMPOSER-INTEGRATION1 — maps persisted pipeline
 * state onto the Opus shell (stage chips, slot keys, founder-readable copy).
 * Pure presentation; no provider calls.
 */

import type { PageConceptStageId, PageConceptStageState } from '../designPageConceptGeneratorShell.js';
import { PAGE_CONCEPT_DEFAULT_STAGE_STATE } from '../designPageConceptGeneratorShell.js';
import type {
  PageConceptCgptCreativeBrief,
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageConceptGenerationStatus,
  PageConceptRenditionSlotId,
  PageCreativeInjection,
} from './types.js';

export type NbpShellSlotKey =
  | 'nbp.mobile.a'
  | 'nbp.mobile.b'
  | 'nbp.mobile.c'
  | 'nbp.desktop.a'
  | 'nbp.desktop.b'
  | 'nbp.desktop.c';

export type NbpSlotPresentation = {
  key: NbpShellSlotKey;
  label: 'A' | 'B' | 'C';
  viewport: 'MOBILE' | 'DESKTOP';
  renditionSlot: PageConceptRenditionSlotId;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  imageSrc: string | null;
  failureReason: string | null;
};

const SLOT_LETTER: Record<PageConceptRenditionSlotId, 'A' | 'B' | 'C'> = {
  RENDITION_A: 'A',
  RENDITION_B: 'B',
  RENDITION_C: 'C',
};

export function nbpShellSlotKey(
  viewport: 'MOBILE' | 'DESKTOP',
  slot: PageConceptRenditionSlotId,
): NbpShellSlotKey {
  const letter = SLOT_LETTER[slot].toLowerCase();
  return `nbp.${viewport.toLowerCase()}.${letter}` as NbpShellSlotKey;
}

export function pageConceptStageStatesFromPipeline(state: PageConceptGenerationState): Record<
  PageConceptStageId,
  PageConceptStageState
> {
  const ps = state.pipelineSet;
  const status = state.generationStatus;

  if (ps?.creativeInjectionError && !ps.creativeInjection) {
    return { CGPT: 'FAILED', GPT2: 'NOT_STARTED', NBP: 'NOT_STARTED' };
  }
  if (ps?.gpt2AuthorityError && ps.creativeInjection && !ps.gpt2AuthorityConcept) {
    return { CGPT: 'COMPLETE', GPT2: 'FAILED', NBP: 'NOT_STARTED' };
  }

  switch (status) {
    case 'CGPT_RUNNING':
      return { CGPT: 'ACTIVE', GPT2: 'PENDING', NBP: 'PENDING' };
    case 'GPT2_RUNNING':
      return { CGPT: 'COMPLETE', GPT2: 'ACTIVE', NBP: 'PENDING' };
    case 'NBP_RUNNING':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'ACTIVE' };
    case 'PARTIAL_GENERATION':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PARTIAL' };
    case 'READY_FOR_FOUNDER_REVIEW':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'COMPLETE' };
    case 'FAILED':
      if (ps?.creativeInjection) {
        if (ps.gpt2AuthorityConcept) return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'FAILED' };
        return { CGPT: 'COMPLETE', GPT2: 'FAILED', NBP: 'NOT_STARTED' };
      }
      return { CGPT: 'FAILED', GPT2: 'PENDING', NBP: 'PENDING' };
    case 'PLANNED':
      return PAGE_CONCEPT_DEFAULT_STAGE_STATE;
    default:
      if (ps?.creativeInjection && ps.gpt2AuthorityConcept && state.generationJobs.length > 0) {
        const ready = state.generationJobs.filter((j) => j.status === 'READY').length;
        const failed = state.generationJobs.filter((j) => j.status === 'FAILED').length;
        if (ready === 6) return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'COMPLETE' };
        if (ready > 0 && failed > 0) return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PARTIAL' };
      }
      if (ps?.creativeInjection && ps.gpt2AuthorityConcept) {
        return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PENDING' };
      }
      if (ps?.creativeInjection) {
        return { CGPT: 'COMPLETE', GPT2: 'PENDING', NBP: 'PENDING' };
      }
      return PAGE_CONCEPT_DEFAULT_STAGE_STATE;
  }
}

export type CgptBriefRowPresentation = {
  id: string;
  label: string;
  value: string;
  lead?: boolean;
};

export function buildCgptBriefRows(brief: PageConceptCgptCreativeBrief): readonly CgptBriefRowPresentation[] {
  return [
    { id: 'creative-premise', label: 'CREATIVE PREMISE', value: brief.creativePremise, lead: true },
    { id: 'page-story', label: 'PAGE STORY', value: brief.pageStory },
    {
      id: 'visual-direction',
      label: 'VISUAL DIRECTION',
      value: [brief.colorStrategy, brief.imageryStrategy].filter(Boolean).join(' · '),
    },
    { id: 'composition', label: 'COMPOSITION', value: brief.compositionStrategy },
    { id: 'typography', label: 'TYPOGRAPHY', value: brief.typographyStrategy },
    {
      id: 'color-material',
      label: 'COLOR / MATERIAL',
      value: [brief.colorStrategy, brief.materialStrategy].filter(Boolean).join(' · '),
    },
    { id: 'imagery', label: 'IMAGERY', value: brief.imageryStrategy },
    { id: 'key-messages', label: 'KEY MESSAGES', value: brief.keyMessages.join(' · ') },
    { id: 'distinctive', label: 'DISTINCTIVE MOVE', value: brief.distinctiveMove },
    { id: 'avoid', label: 'DO NOT DO', value: brief.avoidList.join(' · ') },
  ].filter((row) => row.value.trim().length > 0);
}

/** @deprecated Use persisted brief via buildCgptBriefRows — injection-only summaries are not authoritative. */
export function buildCgptFullBriefMarkdown(injection: PageCreativeInjection): string {
  return [
    `INJECTION ${injection.injectionId}`,
    `CREATIVE THESIS: ${injection.creativeThesis}`,
    `PAGE PURPOSE: ${injection.pagePurposeInterpretation}`,
  ].join('\n\n');
}

function jobForSlot(
  jobs: readonly PageConceptGeneratedArtifact[],
  slot: PageConceptRenditionSlotId,
  viewport: 'MOBILE' | 'DESKTOP',
): PageConceptGeneratedArtifact | undefined {
  return jobs.find((j) => j.renditionSlot === slot && j.viewport === viewport);
}

export function buildNbpSlotPresentations(state: PageConceptGenerationState): readonly NbpSlotPresentation[] {
  const jobs = state.generationJobs;
  const running = state.generationStatus === 'NBP_RUNNING';
  const out: NbpSlotPresentation[] = [];
  for (const slot of ['RENDITION_A', 'RENDITION_B', 'RENDITION_C'] as const) {
    for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
      const job = jobForSlot(jobs, slot, viewport);
      let status: NbpSlotPresentation['status'] = 'PENDING';
      if (job?.status === 'READY') status = 'READY';
      else if (job?.status === 'FAILED') status = 'FAILED';
      else if (job?.status === 'RUNNING' || (running && !job)) status = 'GENERATING';
      out.push({
        key: nbpShellSlotKey(viewport, slot),
        label: SLOT_LETTER[slot],
        viewport,
        renditionSlot: slot,
        status,
        imageSrc: job?.imageUri ?? job?.artifactPath ?? null,
        failureReason: job?.failureReason ?? null,
      });
    }
  }
  return out;
}

export function pageConceptHasFailedNbpJobs(state: PageConceptGenerationState): boolean {
  return state.generationJobs.some((j) => j.status === 'FAILED');
}

export function pageConceptReviewReady(status: PageConceptGenerationStatus): boolean {
  return status === 'READY_FOR_FOUNDER_REVIEW' || status === 'PARTIAL_GENERATION';
}

export function pageConceptGenerationInFlight(status: PageConceptGenerationStatus, generating: boolean): boolean {
  return (
    generating ||
    status === 'CGPT_RUNNING' ||
    status === 'CGPT_RATE_LIMITED' ||
    status === 'GPT2_RUNNING' ||
    status === 'CGPT_AWAITING_FOUNDER_REVIEW' ||
    status === 'GPT2_AWAITING_FOUNDER_REVIEW' ||
    status === 'DUAL_RENDER_TEST_RUNNING' ||
    status === 'NBP_RUNNING'
  );
}

export function pageConceptCgptManualRetryEligible(state: PageConceptGenerationState): boolean {
  const err = state.pipelineSet?.creativeInjectionError ?? '';
  return (
    !state.pipelineSet?.creativeInjection &&
    (err.includes('CGPT_FAILED_RATE_LIMIT') ||
      err.includes('CGPT TEMPORARILY UNAVAILABLE') ||
      err.includes('CGPT_RATE_LIMITED'))
  );
}
