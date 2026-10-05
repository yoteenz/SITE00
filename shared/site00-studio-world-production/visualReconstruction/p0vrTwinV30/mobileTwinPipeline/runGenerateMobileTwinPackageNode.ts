import type { DesignPageAuthorityReviewSession } from '../types.js';
import { writeLocalMobileBlueprintTwinSvg } from './mobileTwinPipelineNode.js';
import {
  assertMobileTwinPackagePreconditions,
  finalizeMobileTwinPackageSession,
} from './runGenerateMobileTwinPackageCore.js';

/** Node/vitest Phase B — persists blueprint twin SVG under r7m-generated/. */
export async function runGenerateMobileTwinPackageNode(
  session: DesignPageAuthorityReviewSession,
): Promise<DesignPageAuthorityReviewSession> {
  assertMobileTwinPackagePreconditions(session);
  const pipeline = session.mobileTwinPipeline!;
  const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId)!;
  const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId)!;
  const runId = `r7m-pkg-${Date.now()}`;
  const twinWritten = await writeLocalMobileBlueprintTwinSvg({
    composition,
    twinId: runId,
    width: render.widthPx,
    height: render.heightPx,
  });
  return finalizeMobileTwinPackageSession(session, twinWritten, runId);
}
