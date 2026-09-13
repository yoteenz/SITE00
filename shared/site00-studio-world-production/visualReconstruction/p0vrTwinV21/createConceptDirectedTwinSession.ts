import { P0_VR_TWIN_V21_BUILD } from './constants.js';
import { buildNdxCreativeBrandContext } from './buildNdxCreativeBrandContext.js';
import { buildNdxOverviewFunctionGraph } from './buildNdxOverviewFunctionGraph.js';
import { buildNdxOverviewPageIntent } from './buildNdxOverviewPageIntent.js';
import { extractBlueprintGrammarFromForensicNdx } from './extractBlueprintGrammar.js';
import { runPageCreativeDirector } from './runPageCreativeDirector.js';
import type { ConceptDirectedTwinSession } from './types.js';

export function createConceptDirectedTwinSession(input: {
  projectId: string;
  pageId: string;
  sessionId?: string;
  referenceAssets?: string[];
}): ConceptDirectedTwinSession {
  const now = new Date().toISOString();
  const pageIntent = buildNdxOverviewPageIntent();
  const functionGraph = buildNdxOverviewFunctionGraph();
  const brandContext = buildNdxCreativeBrandContext();
  const blueprintGrammar = extractBlueprintGrammarFromForensicNdx();
  const creativeDirection = runPageCreativeDirector({
    pageIntent,
    functionGraph,
    brandContext,
    blueprintGrammar,
  });

  return {
    buildRef: P0_VR_TWIN_V21_BUILD,
    generationMode: 'CONCEPT_DIRECTED_V2',
    sessionId: input.sessionId ?? `twin-v2-${input.projectId}-${input.pageId}-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: 'mobile',
    pageIntent,
    functionGraph,
    brandContext,
    designLanguage: 'NDXBOOK editorial intelligence inside SITE 00 host shell',
    blueprintGrammar,
    referenceAssets: input.referenceAssets ?? [],
    creativeDirection,
    visualConcept: null,
    founderJudgment: {
      lastAction: null,
      refineInstruction: null,
      refineRegion: null,
      approvedVersionId: null,
      updatedAt: null,
    },
    approvedVisualAuthority: null,
    sourceGeneration: { codeAllowed: false, lastBuildAt: null },
    approvedVisualToCodePlan: null,
    twinV2VisualSpec: null,
    renderedTwin: null,
    fidelityReceipt: null,
    status: 'TWIN_V2_DIRECTION_READY',
    history: [],
    createdAt: now,
    updatedAt: now,
  };
}
