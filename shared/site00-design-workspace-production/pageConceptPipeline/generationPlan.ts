import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import { getSite00ManagedProject } from '../../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import type { PageConceptGenerationPlan } from './types.js';
import { evaluatePageConceptReadiness, evaluatePageConceptServerReadiness } from './readiness.js';
import { PAGE_CONCEPT_TARGET_TYPE } from './constants.js';

export const PAGE_CGPT_PROMPT_VERSION = 'page-concept-cgpt-v1-injection';
export const PAGE_GPT2_PROMPT_VERSION = 'page-concept-gpt2-v1-authority';
export { PAGE_NBP_PROMPT_VERSION } from './pageConceptNbpAuthorityPolicy.js';
export const PAGE_NBP_MODEL = 'fal-ai/nano-banana-pro/edit';

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

  return {
    targetType: PAGE_CONCEPT_TARGET_TYPE,
    projectId,
    pageId,
    projectLabel: managed.displayName.toUpperCase(),
    pageLabel: page.pageName.toUpperCase(),
    cgptCalls: 1,
    gpt2Calls: 1,
    nbpRenditions: 3,
    nbpJobs: 6,
    outputCount: 6,
    captureSetId,
    functionContractId: `pfc-${projectId}-${pageId}`,
    estimatedCostNote:
      '1 CGPT creative injection + 1 GPT2 page authority + 3 NBP rendition groups (Mobile + Desktop). Confirm before spend.',
  };
}
