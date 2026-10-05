/**
 * P0.VR.REPLICATION.1 — Top-level visual reconstruction orchestrator.
 */

import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { VisualConvergenceScore } from '../p0vrDiag1/types.js';
import { composeAuthorityFirstTwin } from '../p0vrRebuild1/authorityFirstTwinComposer.js';
import { evaluateAuthorityCompositionCoverage } from '../p0vrRebuild1/authorityCompositionCoverage.js';
import { buildAuthorityCompositionBlueprint } from '../p0vrRebuild1/authorityCompositionBlueprint.js';
import { P0_VR_REPLICATION_1_BUILD } from './constants.js';
import { resolveReconstructionMode } from './reconstructionModeResolver.js';
import { buildVisualPageBlueprint } from './visualPageBlueprint.js';
import { buildFunctionGraph } from './functionGraph.js';
import { buildVisualGraph } from './visualGraph.js';
import { buildFunctionToVisualBindingPlan } from './functionToVisualBindingPlan.js';
import { runBrowserReplicationLoop } from './browserReplicationLoop.js';
import { createDefaultReplicationBudgetPolicy } from './replicationBudgetPolicy.js';
import type {
  FunctionGraph,
  FunctionToVisualBindingPlan,
  ReconstructionMode,
  ReplicationIteration,
  VisualGraph,
  VisualPageBlueprint,
  VisualReplicationDiff,
} from './types.js';

export type VisualReconstructionDirectorResult = {
  mode: ReconstructionMode;
  modeReason: string;
  blueprint: VisualPageBlueprint;
  functionGraph: FunctionGraph;
  visualGraph: VisualGraph;
  bindingPlan: FunctionToVisualBindingPlan;
  replicationIterations: ReplicationIteration[];
  finalReplicationDiff: VisualReplicationDiff;
  convergenceAfter: VisualConvergenceScore;
  buildRef: string;
  legacyPatchTwin: boolean;
};

export async function runVisualReconstructionDirector(input: {
  session: ReconstructionTwinSession;
  convergenceAfter: VisualConvergenceScore | null;
  twinPreviewUrl?: string | null;
  playwrightEnabled?: boolean;
}): Promise<VisualReconstructionDirectorResult> {
  const { session } = input;
  const modeResolution = resolveReconstructionMode({
    pageId: session.pageId,
    viewport: session.viewport,
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  });

  if (modeResolution.mode !== 'REPLICATION_MODE') {
    throw new Error(`REPLICATION_REQUIRED: mode ${modeResolution.mode} — use legacy patch path`);
  }

  const blueprint = buildVisualPageBlueprint({
    pageId: session.pageId,
    viewport: session.viewport,
    authorityVersionId: session.authorityVersionId,
  });

  const functionGraph = buildFunctionGraph({
    sessionId: session.sessionId,
    contract: session.functionContract,
  });
  const visualGraph = buildVisualGraph(blueprint);
  const bindingPlan = buildFunctionToVisualBindingPlan({
    sessionId: session.sessionId,
    contract: session.functionContract,
    blueprint,
    viewport: session.viewport,
  });

  composeAuthorityFirstTwin(session);

  const authorityBlueprint = buildAuthorityCompositionBlueprint({
    pageId: session.pageId,
    viewport: session.viewport,
    authorityVersionId: session.authorityVersionId,
  });
  const authorityStack = authorityBlueprint.regionOrder;

  const coverage = evaluateAuthorityCompositionCoverage({
    blueprint: authorityBlueprint,
    twinRegionOrder: authorityStack,
    strategy: 'REBUILD_FROM_AUTHORITY',
  });

  const loop = await runBrowserReplicationLoop({
    sessionId: session.sessionId,
    twinVersionId: session.twinVersionId,
    viewport: session.viewport,
    twinPreviewUrl: input.twinPreviewUrl,
    blueprint,
    convergenceAfter: input.convergenceAfter,
    compositionCoveragePass: coverage.status === 'PASS',
    policy: createDefaultReplicationBudgetPolicy(),
    playwrightEnabled: input.playwrightEnabled ?? false,
  });

  const convergenceAfter: VisualConvergenceScore = input.convergenceAfter ?? {
    geometry: 50,
    spacing: 55,
    typography: 50,
    assets: 45,
    hierarchy: 55,
    controls: 55,
    order: 40,
    composition: 35,
    function: 100,
    overall: 45,
  };
  convergenceAfter.composition = loop.finalDiff.compositionScore ?? convergenceAfter.composition;
  convergenceAfter.overall = Math.min(
    convergenceAfter.overall,
    loop.finalDiff.compositionScore != null
      ? Math.round(loop.finalDiff.compositionScore * 0.85 + convergenceAfter.function * 0.15)
      : convergenceAfter.overall,
  );

  return {
    mode: modeResolution.mode,
    modeReason: modeResolution.reason,
    blueprint,
    functionGraph,
    visualGraph,
    bindingPlan,
    replicationIterations: loop.iterations,
    finalReplicationDiff: loop.finalDiff,
    convergenceAfter,
    buildRef: P0_VR_REPLICATION_1_BUILD,
    legacyPatchTwin: false,
  };
}
