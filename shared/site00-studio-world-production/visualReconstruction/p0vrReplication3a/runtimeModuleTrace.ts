/**
 * P0.VR.REPLICATION.3A — Modules executed on REPLICATE PAGE (NDX pilot).
 */

import type { RuntimeModuleTraceStep } from './types.js';
import { P0_VR_REPLICATION_2_BUILD } from '../p0vrReplication2/constants.js';
import { P0_VR_REPLICATION_3A_BUILD } from './constants.js';

export function buildNdxReplicationRuntimeModuleTrace(input: {
  replicationMode: boolean;
  shellFirstExecuted: boolean;
  visionProviderCalled: boolean;
}): RuntimeModuleTraceStep[] {
  return [
    {
      order: 1,
      moduleId: 'referenceResolver',
      label: 'Reference resolver (design authority version + capture)',
      executed: true,
      outputSummary: 'Authority version + live capture IDs bound to twin session',
    },
    {
      order: 2,
      moduleId: 'visualDetector',
      label: 'Visual intelligence / region detector',
      executed: false,
      outputSummary: input.visionProviderCalled
        ? 'Vision provider invoked'
        : 'NOT CALLED — profile layout used as detection proxy',
    },
    {
      order: 3,
      moduleId: 'blueprintBuilder',
      label: 'AuthorityShellBlueprint builder',
      executed: input.shellFirstExecuted,
      outputSummary: 'Macro band geometry from pageRegionLayoutProfile',
    },
    {
      order: 4,
      moduleId: 'policyResolver',
      label: 'Reconstruction mode + strategy resolver',
      executed: true,
      outputSummary: input.replicationMode ? 'REPLICATION_MODE active' : 'Non-replication mode',
    },
    {
      order: 5,
      moduleId: 'sourceGenerator',
      label: 'Twin source generator',
      executed: input.shellFirstExecuted,
      outputSummary: 'Static ShellFirstNdxOverviewTwin React surface (not blueprint-driven codegen)',
    },
    {
      order: 6,
      moduleId: 'assetResolver',
      label: 'Asset resolver / binding',
      executed: true,
      outputSummary: 'entryProductionArtwork + AssetPendingPlaceholder fallback',
    },
    {
      order: 7,
      moduleId: 'twinBuilder',
      label: 'Twin build pipeline + shell-first executor',
      executed: input.shellFirstExecuted,
      outputSummary: `executeShellFirstNdxReplication · build ${P0_VR_REPLICATION_2_BUILD}`,
    },
    {
      order: 8,
      moduleId: 'browserRenderer',
      label: 'Browser renderer (twin debug route)',
      executed: true,
      outputSummary: 'ReconstructionTwinPreviewPage → ShellFirstNdxOverviewTwin',
    },
    {
      order: 9,
      moduleId: 'diffEngine',
      label: 'Drift triangulation (3A)',
      executed: true,
      outputSummary: `buildDriftTriangulationReport · ${P0_VR_REPLICATION_3A_BUILD}`,
    },
  ];
}
