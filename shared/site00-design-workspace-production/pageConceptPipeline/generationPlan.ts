import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import { getSite00ManagedProject } from '../../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import type { PageConceptGenerationPlan } from './types.js';
import { evaluatePageConceptReadiness, evaluatePageConceptServerReadiness } from './readiness.js';
import { PAGE_CONCEPT_TARGET_TYPE } from './constants.js';
import {
  SITE00_FAL_REFERENCE_EDIT_MODEL,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../site00-visual-generation/falImageModels.js';
import {
  pageConceptInitialSpendNote,
  pageConceptLegacyNbpEnabled,
} from './pageConceptCanonicalPipeline.js';

export { PAGE_CGPT_SYNTHESIS_PROMPT_VERSION as PAGE_CGPT_PROMPT_VERSION } from './pageConceptCgptCreativeSynthesis.js';
export const PAGE_GPT2_PROMPT_VERSION = 'page-concept-gpt2-v1-authority';
export { PAGE_NBP_PROMPT_VERSION } from './pageConceptNbpAuthorityPolicy.js';
export const PAGE_NBP_MODEL = 'fal-ai/nano-banana-pro/edit';
/** GPT2 Step 2 mobile page authority — canonical GPT Image 2 (not NBP / nano-banana). */
export const PAGE_GPT2_MOBILE_FAL_MODEL = SITE00_FAL_TEXT_TO_IMAGE_MODEL;
export const PAGE_GPT2_MOBILE_FAL_EDIT_MODEL = SITE00_FAL_REFERENCE_EDIT_MODEL;

export function resolvePageGpt2MobileFalModel(referenceImageCount: number): string {
  return referenceImageCount > 0 ? PAGE_GPT2_MOBILE_FAL_EDIT_MODEL : PAGE_GPT2_MOBILE_FAL_MODEL;
}

export function buildPageConceptGenerationPlan(
  projectId: string,
  pageId: string,
  options?: { trustIncomingCaptures?: boolean },
): PageConceptGenerationPlan {
  const readiness =
    options?.trustIncomingCaptures ?
      evaluatePageConceptServerReadiness(projectId, pageId)
    : evaluatePageConceptReadiness(projectId, pageId);
  if (readiness !== 'READY_FOR_CREATIVE_INJECTION') {
    throw new Error(readiness);
  }
  const page = getDesignBoundPage(projectId, pageId);
  const managed = getSite00ManagedProject(projectId);
  if (!page || !managed) throw new Error('BLOCKED_NO_PAGE_CONTEXT');

  const captureSetId = `pcs-${projectId}-${pageId}-${Date.now()}`;

  const legacyNbp = pageConceptLegacyNbpEnabled();
  return {
    targetType: PAGE_CONCEPT_TARGET_TYPE,
    projectId,
    pageId,
    projectLabel: managed.displayName.toUpperCase(),
    pageLabel: page.pageName.toUpperCase(),
    cgptCalls: 1,
    gpt2Calls: legacyNbp ? 1 : 3,
    gpt2MobileConceptCount: legacyNbp ? 0 : 3,
    nbpRenditions: legacyNbp ? 3 : 0,
    nbpJobs: legacyNbp ? 6 : 0,
    outputCount: legacyNbp ? 6 : 3,
    captureSetId,
    functionContractId: `pfc-${projectId}-${pageId}`,
    pipelineLineage: legacyNbp ? 'LEGACY_NBP_CONCEPT_PIPELINE' : 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
    estimatedCostNote: legacyNbp ?
      '1 CGPT creative injection + 1 GPT2 page authority + 3 NBP rendition groups (Mobile + Desktop). Confirm before spend.'
    : `${pageConceptInitialSpendNote()} Confirm before spend.`,
  };
}
