import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7M_LINEAGE } from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import type { MobileImplementationRender } from './types.js';
import { writeLocalMobileImplementationRender } from './mobileTwinPipelineNode.js';

/** Node/vitest entry — uses sharp to persist render JPG under r7m-generated/. */
export async function runGenerateMobileImplementationRenderNode(
  session: DesignPageAuthorityReviewSession,
): Promise<DesignPageAuthorityReviewSession> {
  let next = ensureMobileDesignReferenceAuthority(session);
  const ref = next.mobileTwinPipeline!.designReference!;
  const runId = `r7m-render-${Date.now()}`;
  const composition = buildMobileTwinCompositionState({ runId, reference: ref });
  composition.status = 'RECONCILED';

  const written = await writeLocalMobileImplementationRender({
    referenceUri: ref.sourceImageUri,
    renderId: runId,
  });
  const render: MobileImplementationRender = {
    id: runId,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    referenceAuthorityId: ref.id,
    renderImageUri: written.publicPath,
    renderImageHash: written.hash,
    widthPx: written.width,
    heightPx: written.height,
    provider: 'LOCAL_COMPILER',
    providerJobRef: `${P0_VR_TWIN_V30R7M_LINEAGE}-render-${runId}`,
    status: 'FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const pipeline = next.mobileTwinPipeline!;
  return {
    ...next,
    mobileTwinPipeline: {
      ...pipeline,
      compositionStates: [...pipeline.compositionStates, composition],
      activeCompositionStateId: composition.id,
      renders: [...pipeline.renders, render],
      activeRenderId: render.id,
      renderGate: 'FOUNDER_REVIEW',
      artifactsById: {
        ...pipeline.artifactsById,
        [composition.id]: composition,
        [render.id]: render,
      },
      falJobsDispatched: pipeline.falJobsDispatched,
    },
    updatedAt: new Date().toISOString(),
  };
}
