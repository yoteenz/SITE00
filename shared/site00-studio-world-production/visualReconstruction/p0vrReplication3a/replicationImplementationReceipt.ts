/**
 * P0.VR.REPLICATION.3A — Composer / pipeline wiring audit.
 */

import type { ReplicationImplementationReceipt } from './types.js';
import { P0_VR_REPLICATION_2_BUILD } from '../p0vrReplication2/constants.js';

export function buildReplicationImplementationReceipts(input: {
  replicationMode: boolean;
}): ReplicationImplementationReceipt[] {
  return [
    {
      expectedModule: 'executeShellFirstNdxReplication',
      actualModule: 'executeShellFirstNdxReplication',
      wired: true,
      calledAtRuntime: input.replicationMode,
      version: P0_VR_REPLICATION_2_BUILD,
      status: input.replicationMode ? 'WIRED_EXECUTED' : 'WIRED_NOT_EXECUTED',
      notes: 'Primary NDX REPLICATION_MODE path',
    },
    {
      expectedModule: 'authorityFirstTwinComposer / composeAuthorityFirstTwin',
      actualModule: 'deferred in twinBuildPipeline',
      wired: true,
      calledAtRuntime: false,
      version: 'p0vrRebuild1',
      status: 'IMPLEMENTED_NOT_EXECUTED',
      notes: 'Intentionally skipped when REPLICATION_MODE — not a miswire',
    },
    {
      expectedModule: 'visualReconstructionDirector',
      actualModule: 'replaced by 1R1/2 shell executors',
      wired: false,
      calledAtRuntime: false,
      version: 'p0vrReplication1',
      status: 'NOT_WIRED',
      notes: 'Director not on hot path for NDX pilot',
    },
    {
      expectedModule: 'literalRegionTracer / vision segmentation',
      actualModule: 'none',
      wired: false,
      calledAtRuntime: false,
      version: '—',
      status: 'NOT_WIRED',
      notes: 'No literal tracer module — root gap for hero internal structure',
    },
    {
      expectedModule: 'ShellFirstNdxOverviewTwin',
      actualModule: 'ShellFirstNdxOverviewTwin',
      wired: true,
      calledAtRuntime: true,
      version: P0_VR_REPLICATION_2_BUILD,
      status: 'WIRED_EXECUTED',
      notes: 'Hand-built source — EXECUTION_POLICY + SOURCE_GENERATION drift risk',
    },
    {
      expectedModule: 'legacy patch twin / OverviewMobileHomeScreen',
      actualModule: 'not selected when twinRenderMode SHELL_FIRST',
      wired: true,
      calledAtRuntime: false,
      version: 'p0vrUpgrade2',
      status: 'WIRED_NOT_EXECUTED',
      notes: 'Legacy patch fallback not used in shell-first success path',
    },
  ];
}
