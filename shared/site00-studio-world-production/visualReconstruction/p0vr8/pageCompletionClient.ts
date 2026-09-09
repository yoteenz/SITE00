/**
 * Browser-safe Page Completion Intelligence exports.
 */

import { runPageCompletionIntelligence } from '../pageCompletionIntelligence/pageCompletionEngine.js';

export {
  runPageCompletionIntelligence,
  runRecursivePageCompletion,
  buildPageCompletionInspectorState,
} from '../pageCompletionIntelligence/pageCompletionEngine.js';

export { runDesignReconstructionKernel, pagesPipelineInheritsSkinsKernel } from '../pageCompletionIntelligence/designReconstructionKernel.js';

export { onPageCreated, onPageUpdated, getStoredPageCompletionJob } from '../pageCompletionIntelligence/eventHandlers.js';

export { buildPageCompletionFounderActions } from '../pageCompletionIntelligence/founderActionBridge.js';

export type {
  PageCompletionInspectorState,
  PageExperienceImplementationJob,
  PageCompletionStatus,
  PageInteractionCoverage,
} from '../pageCompletionIntelligence/types.js';

export function buildPageCompletionForDesignScreen(input: {
  projectId: string;
  screenId: string;
  route: string;
  moduleScreenType?: string;
}) {
  const pageId = input.screenId;
  const isSkins = pageId.includes('skins') || input.moduleScreenType?.includes('SKINS');
  const isAssets = pageId.includes('assets');
  return runPageCompletionIntelligence({
    projectId: input.projectId,
    pageId,
    primaryRoute: input.route || `/projects/${input.projectId}/design`,
    moduleScreenType: isSkins ? 'SKINS' : isAssets ? 'ASSETS' : input.moduleScreenType,
    parentAuthorityId: isSkins ? 'skins-authority-mobile' : null,
    skinId: input.projectId,
  });
}
