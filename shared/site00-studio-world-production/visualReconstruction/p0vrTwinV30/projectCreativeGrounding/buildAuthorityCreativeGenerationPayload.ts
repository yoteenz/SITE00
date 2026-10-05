import { resolveActiveProjectExpressionContract } from '../activeProjectExpressionContract.js';
import { DESIGN_PAGE_V3_HOST_PRODUCT_NAME } from '../constants.js';
import { DESIGN_PAGE_V3_LAYER_MODEL } from '../hostProjectExpressionModel.js';
import type { DesignPageV3TerritoryId } from '../hostProjectExpressionModel.js';
import { getDesignWorkspaceFunctionContract } from './designWorkspaceFunctionContract.js';
import { loadProjectCreativeContextPackage } from './loadProjectCreativeContextPackage.js';
import { NDXBOOK_TERRITORY_SHARED_ARTIFACT_FAMILY } from './ndxbookProjectCreativeContext.js';
import type { AuthorityCreativeGenerationPayload } from './types.js';
import { PROJECT_CREATIVE_CONTEXT_VERSION } from './types.js';

export const SOURCE_PRIORITY_RULE =
  '1 APPROVED PROJECT ASSET → 2 APPROVED ARTIFACT → 3 PROJECT REFERENCE → 4 PROJECT-VALID PLACEHOLDER → 5 NEW GENERATION ONLY IF ALLOWED';

export function buildAuthorityCreativeGenerationPayload(input: {
  projectId: string;
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
}): AuthorityCreativeGenerationPayload {
  const pkg = loadProjectCreativeContextPackage(input.projectId);
  resolveActiveProjectExpressionContract(input.projectId);
  return {
    site00HostContractRef: `${DESIGN_PAGE_V3_HOST_PRODUCT_NAME}:${DESIGN_PAGE_V3_LAYER_MODEL.hostShell.owner}`,
    activeProjectExpressionContractRef: `ActiveProjectExpressionContract:${input.projectId}`,
    projectCreativeContextPackage: pkg,
    projectArtifactVocabulary: pkg.artifactVocabulary,
    projectAssetSourceMap: pkg.assetSourceMap,
    designWorkspaceFunctionContract: getDesignWorkspaceFunctionContract(),
    territoryId: input.territoryId,
    viewport: input.viewport,
    projectCreativeContextVersion: PROJECT_CREATIVE_CONTEXT_VERSION,
    sharedArtifactFamily: [...NDXBOOK_TERRITORY_SHARED_ARTIFACT_FAMILY],
    sourcePriorityRule: SOURCE_PRIORITY_RULE,
  };
}
