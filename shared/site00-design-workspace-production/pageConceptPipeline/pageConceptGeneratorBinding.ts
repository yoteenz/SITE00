/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-COMPOSER-INTEGRATION1 — maps persisted pipeline
 * state onto the Opus shell (stage chips, slot keys, founder-readable copy).
 * Pure presentation; no provider calls.
 */

import type { PageConceptStageId, PageConceptStageState } from '../designPageConceptGeneratorShell.js';
import { PAGE_CONCEPT_DEFAULT_STAGE_STATE } from '../designPageConceptGeneratorShell.js';
import { resolveMobileConceptSlotForJob } from './pageConceptCandidateReconciliation.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptArtifactDisplayUrl.js';
import { pageConceptCanonicalNbpDisabled } from './pageConceptCanonicalPipeline.js';
import type {
  PageConceptCgptCreativeBrief,
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageConceptGenerationStatus,
  PageConceptRenditionSlotId,
  PageCreativeInjection,
} from './types.js';

export type NbpShellSlotKey =
  | 'gpt2.mobile.a'
  | 'gpt2.mobile.b'
  | 'gpt2.mobile.c'
  | 'nbp.mobile.a'
  | 'nbp.mobile.b'
  | 'nbp.mobile.c'
  | 'nbp.desktop.a'
  | 'nbp.desktop.b'
  | 'nbp.desktop.c';

export type Gpt2MobileSlotPresentationMeta = {
  territoryLabel: string | null;
  webExpressionCreativePremise?: string | null;
  webExpressionWebsiteMetaphor?: string | null;
  webExpressionGraphicDevice?: string | null;
  webExpressionCompositionSystem?: string | null;
  webExpressionImageRole?: string | null;
  webExpressionDistinctiveMove?: string | null;
  webExpressionCreativeTension?: string | null;
  webExpressionArtDirectionPremise?: string | null;
  webExpressionSignatureGraphicDevice?: string | null;
  webExpressionTypographicConcept?: string | null;
  webExpressionImageArtDirection?: string | null;
  webExpressionEditorialCompositionRule?: string | null;
  webExpressionColorExpression?: string | null;
  webExpressionControlledDisruption?: string | null;
  webExpressionBespokeMoment?: string | null;
  rationale: string | null;
  pageValidityPass: boolean | null;
  captureInfluenceMode: string | null;
  screenshotOverreachWarning: boolean | null;
  provider: string;
  promptVersion: string | null;
  screenshotFunctionMapPresent?: boolean | null;
  regionsPreservedLabel?: string | null;
  interactionsPreservedLabel?: string | null;
  bottomNavLockedToSource?: boolean | null;
  designAuthorityLabel?: string | null;
  screenshotDesignAuthority?: 'NO' | 'YES' | null;
};

export type NbpSlotPresentation = {
  key: NbpShellSlotKey;
  label: 'A' | 'B' | 'C';
  viewport: 'MOBILE' | 'DESKTOP';
  renditionSlot: PageConceptRenditionSlotId;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  imageSrc: string | null;
  failureReason: string | null;
  /** GPT2 mobile founder review (presentation only). */
  gpt2Mobile?: Gpt2MobileSlotPresentationMeta;
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

  if (pageConceptCanonicalNbpDisabled()) {
    if (ps?.creativeInjectionError && !ps.creativeInjection) {
      return { CGPT: 'FAILED', GPT2: 'NOT_STARTED', NBP: 'NOT_STARTED' };
    }
    const mobileReady = (ps?.mobileConcepts ?? []).filter((c) => c.status === 'READY').length;
    const hasMobileJobs = state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE');
    switch (status) {
      case 'CGPT_RUNNING':
        return { CGPT: 'ACTIVE', GPT2: 'PENDING', NBP: 'PENDING' };
      case 'GPT2_RUNNING':
        return { CGPT: 'COMPLETE', GPT2: 'ACTIVE', NBP: 'PENDING' };
      case 'GPT2_MOBILE_AWAITING_SELECTION':
        return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PENDING' };
      case 'VIEWPORT_TABLET_RUNNING':
      case 'VIEWPORT_DESKTOP_RUNNING':
      case 'VIEWPORT_FAMILY_REVIEW':
        return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'ACTIVE' };
      default:
        if (ps?.creativeInjection && (mobileReady >= 3 || hasMobileJobs)) {
          if (mobileReady >= 3) return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PENDING' };
          return { CGPT: 'COMPLETE', GPT2: 'ACTIVE', NBP: 'PENDING' };
        }
        if (ps?.creativeInjection) return { CGPT: 'COMPLETE', GPT2: 'PENDING', NBP: 'PENDING' };
        return PAGE_CONCEPT_DEFAULT_STAGE_STATE;
    }
  }

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
    case 'GPT2_MOBILE_AWAITING_SELECTION':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PENDING' };
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

export function pageConceptCanonicalGpt2MobileActive(state: PageConceptGenerationState): boolean {
  if (pageConceptCanonicalNbpDisabled()) return true;
  return (
    state.pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' ||
    state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE') ||
    (state.pipelineSet?.mobileConcepts?.length ?? 0) > 0
  );
}

export function buildGpt2MobileSlotPresentations(
  state: PageConceptGenerationState,
): readonly NbpSlotPresentation[] {
  const jobs = state.generationJobs.filter((j) => j.provider === 'GPT2_MOBILE' && j.viewport === 'MOBILE');
  const running = state.generationStatus === 'GPT2_RUNNING';
  const out: NbpSlotPresentation[] = [];
  for (const slot of ['RENDITION_A', 'RENDITION_B', 'RENDITION_C'] as const) {
    const letter = SLOT_LETTER[slot];
    const mobileConceptSlot = `MOBILE_CONCEPT_${letter}` as const;
    const slotJobs = jobs
      .filter((j) => j.renditionSlot === slot || resolveMobileConceptSlotForJob(j) === mobileConceptSlot)
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    const job = slotJobs[slotJobs.length - 1];
    let status: NbpSlotPresentation['status'] = 'PENDING';
    if (job?.status === 'READY') status = 'READY';
    else if (job?.status === 'FAILED') status = 'FAILED';
    else if (job?.status === 'RUNNING' || (running && !job)) status = 'GENERATING';
    const mobileConcept = state.pipelineSet?.mobileConcepts?.find((c) => c.slot === mobileConceptSlot);
    const webTerritory = state.pipelineSet?.webExpressionTerritorySet?.territories.find(
      (t) => t.territorySlot === letter,
    );
    const debug = job?.gpt2MobileDebug;
    const rawImage = job?.imageUri ?? job?.artifactPath ?? mobileConcept?.imageUri ?? null;
    const cacheBustKey = job?.providerJobId ?? job?.artifactId ?? job?.createdAt ?? null;
    out.push({
      key: `gpt2.mobile.${letter.toLowerCase()}` as NbpShellSlotKey,
      label: letter,
      viewport: 'MOBILE',
      renditionSlot: slot,
      status,
      imageSrc: resolvePageConceptArtifactDisplayUrl(rawImage, cacheBustKey),
      failureReason: job?.failureReason ?? null,
      gpt2Mobile: {
        territoryLabel: webTerritory?.name ?? debug?.territoryLabel ?? mobileConcept?.territoryLabel ?? null,
        webExpressionCreativePremise: webTerritory?.creativePremise ?? null,
        webExpressionWebsiteMetaphor: webTerritory?.websiteMetaphor ?? null,
        webExpressionGraphicDevice: webTerritory?.graphicDevice ?? null,
        webExpressionCompositionSystem: webTerritory?.compositionSystem ?? null,
        webExpressionImageRole: webTerritory?.imageRole ?? null,
        webExpressionDistinctiveMove: webTerritory?.distinctiveMove ?? null,
        webExpressionCreativeTension: webTerritory?.creativeTension ?? null,
        webExpressionArtDirectionPremise: webTerritory?.artDirectionPremise ?? null,
        webExpressionSignatureGraphicDevice: webTerritory?.signatureGraphicDevice ?? null,
        webExpressionTypographicConcept: webTerritory?.typographicConcept ?? null,
        webExpressionImageArtDirection: webTerritory?.imageArtDirection ?? null,
        webExpressionEditorialCompositionRule: webTerritory?.editorialCompositionRule ?? null,
        webExpressionColorExpression: webTerritory?.colorExpressionSystem ?? null,
        webExpressionControlledDisruption: webTerritory?.controlledDisruption ?? null,
        webExpressionBespokeMoment: webTerritory?.bespokeMoment ?? null,
        rationale: webTerritory?.artDirectionPremise ?? webTerritory?.creativePremise ?? job?.displayTitle ?? mobileConcept?.territoryLabel ?? null,
        pageValidityPass: debug?.pageValidityPass ?? null,
        captureInfluenceMode: debug?.captureInfluenceMode ?? null,
        screenshotOverreachWarning: debug?.screenshotOverreachWarning ?? null,
        provider: debug?.provider ?? 'GPT2',
        promptVersion: debug?.effectivePromptVersion ?? null,
        screenshotFunctionMapPresent: debug?.screenshotFunctionMapPresent ?? null,
        regionsPreservedLabel: debug?.regionsPreservedLabel ?? null,
        interactionsPreservedLabel: debug?.interactionsPreservedLabel ?? null,
        bottomNavLockedToSource: debug?.bottomNavLockedToSource ?? null,
        designAuthorityLabel: debug?.designAuthorityLabel ?? null,
        screenshotDesignAuthority: debug?.screenshotDesignAuthority ?? null,
      },
    });
  }
  return out;
}

export function buildNbpSlotPresentations(state: PageConceptGenerationState): readonly NbpSlotPresentation[] {
  if (pageConceptCanonicalGpt2MobileActive(state)) {
    return buildGpt2MobileSlotPresentations(state);
  }
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

/** Provider work actively running — not founder review / mobile selection pauses. */
export function pageConceptGenerationActivelyRunning(
  status: PageConceptGenerationStatus,
  generating: boolean,
): boolean {
  return (
    generating ||
    status === 'CGPT_RUNNING' ||
    status === 'CGPT_RATE_LIMITED' ||
    status === 'GPT2_RUNNING' ||
    status === 'NBP_RUNNING' ||
    status === 'VIEWPORT_TABLET_RUNNING' ||
    status === 'VIEWPORT_DESKTOP_RUNNING'
  );
}

/** Primary GENERATE starts a fresh CGPT branch (archives prior run). */
export function pageConceptPrimaryGenerateStartsNewBranch(status: PageConceptGenerationStatus): boolean {
  return status === 'GPT2_MOBILE_AWAITING_SELECTION' || pageConceptReviewReady(status);
}

export function pageConceptGenerationInFlight(
  status: PageConceptGenerationStatus,
  generating: boolean,
): boolean {
  return pageConceptGenerationActivelyRunning(status, generating);
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
