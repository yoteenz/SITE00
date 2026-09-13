import type { ConceptDirectedTwinSession, TwinV2FidelityReceipt } from './types.js';
import { P0_VR_TWIN_V21_BUILD } from './constants.js';

export type ConceptDirectedTwinV2ComposeResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
};

/** Builds coded twin V2 only after approved visual authority exists. */
export function composeConceptDirectedTwinV2(session: ConceptDirectedTwinSession): ConceptDirectedTwinV2ComposeResult {
  if (!session.sourceGeneration.codeAllowed || !session.approvedVisualAuthority) {
    throw new Error('TWIN_V2_CODE_BLOCKED: approve visual concept before build');
  }
  if (!session.approvedVisualToCodePlan || !session.twinV2VisualSpec) {
    throw new Error('TWIN_V2_CODE_BLOCKED: missing visual-to-code plan');
  }

  const builtAt = new Date().toISOString();
  const fidelityReceipt: TwinV2FidelityReceipt = {
    visualAuthorityId: session.approvedVisualAuthority.versionId,
    renderedTwinId: session.sessionId,
    regionsMeasured: 0,
    geometryMatch: null,
    typographyMatch: null,
    assetMatch: null,
    colorMatch: null,
    internalVisualMatch: null,
    outliers: [],
    status: 'PENDING',
  };

  return {
    functionBindingSummary: [
      ...session.functionGraph.sectionNavigation.map((s) => `nav:${s}`),
      ...session.functionGraph.progress.map((p) => `progress:${p}`),
      ...session.functionGraph.recentActivity.map((a) => `activity:${a}`),
    ],
    sessionPatch: {
      renderedTwin: {
        renderMode: 'TWIN_V2_CONCEPT_DIRECTED_NDX_OVERVIEW',
        componentRef: 'ConceptDirectedNdxOverviewTwinV2',
        builtAt,
      },
      fidelityReceipt,
      status: 'TWIN_V2_REVIEW_READY',
      sourceGeneration: { ...session.sourceGeneration, lastBuildAt: builtAt },
      buildRef: P0_VR_TWIN_V21_BUILD,
    },
  };
}
