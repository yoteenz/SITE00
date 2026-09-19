/**
 * P0.DEPLOY.1 — ReleasePipeline stage orchestration (pure logic for CI + UI).
 */

import type {
  ProductionReleaseReceipt,
  ReleasePipelineStage,
  ReleaseStatus,
} from './types.js';
import { RELEASE_PIPELINE_STAGES } from './types.js';
import { checkReleaseCompatibility } from './releaseCompatibilityCheck.js';
import type { BackendHealthReceipt, FrontendHealthReceipt, ReleaseManifest } from './types.js';

export type ReleasePipelineContext = {
  releaseId: string;
  commitSha: string;
  manifest: ReleaseManifest | null;
  backend: BackendHealthReceipt | null;
  frontend: FrontendHealthReceipt | null;
  stageResults: Partial<Record<ReleasePipelineStage, 'PASS' | 'FAIL' | 'SKIP'>>;
  errors: string[];
};

export function resolveReleaseStatus(ctx: ReleasePipelineContext): ReleaseStatus {
  if (ctx.errors.some((e) => e.includes('TEST_FAILED'))) return 'FAILED';
  if (ctx.errors.some((e) => e.includes('BUILD_FAILED'))) return 'FAILED';
  if (ctx.stageResults.VERIFY_BACKEND === 'FAIL') return 'PARTIAL';
  if (ctx.stageResults.DEPLOY_FRONTEND === 'FAIL') return 'PARTIAL';
  if (ctx.stageResults.VERIFY_FRONTEND === 'FAIL') return 'PARTIAL';
  if (ctx.stageResults.VERIFY_COMPATIBILITY === 'FAIL') return 'PARTIAL';

  const compat = checkReleaseCompatibility(ctx.manifest, ctx.backend, ctx.frontend);
  if (compat.status === 'VERSION_MISMATCH') return 'PARTIAL';

  if (
    ctx.stageResults.COMPLETE === 'PASS' ||
    (ctx.stageResults.VERIFY_COMPATIBILITY === 'PASS' && ctx.stageResults.VERIFY_FRONTEND === 'PASS')
  ) {
    return 'READY';
  }
  if (ctx.stageResults.BUILD === 'PASS' && ctx.stageResults.VERIFY_BACKEND === 'PASS' && !ctx.stageResults.DEPLOY_FRONTEND) {
    return 'BACKEND_VERIFYING';
  }
  if (ctx.stageResults.TEST === 'PASS') return 'BUILDING';
  return 'PLANNING';
}

export function buildProductionReleaseReceipt(ctx: ReleasePipelineContext): ProductionReleaseReceipt {
  const compat = checkReleaseCompatibility(ctx.manifest, ctx.backend, ctx.frontend);
  const now = new Date().toISOString();

  const stages = RELEASE_PIPELINE_STAGES.map((stage) => ({
    stage,
    startedAt: now,
    finishedAt: ctx.stageResults[stage] ? now : null,
    result: ctx.stageResults[stage] ?? ('SKIP' as const),
  }));

  return {
    releaseId: ctx.releaseId,
    commitSha: ctx.commitSha,
    frontendVersion: compat.frontendVersion ?? ctx.manifest?.frontendBuild ?? 'unknown',
    apiVersion: compat.apiVersion ?? ctx.manifest?.apiBuild ?? 'unknown',
    workerVersion: compat.workerVersion ?? ctx.manifest?.workerBuild ?? 'unknown',
    frontendUrl: 'https://site00.com',
    backendHealth: ctx.backend ?? {
      ok: false,
      releaseId: null,
      commitSha: null,
      apiBuild: null,
      workerBuild: null,
      contractVersion: null,
      serviceReady: false,
    },
    frontendHealth: ctx.frontend ?? {
      ok: false,
      releaseId: null,
      version: null,
      commitSha: null,
      bundleEntry: null,
    },
    compatibilityStatus: compat.status,
    deployedAt: now,
    status: resolveReleaseStatus(ctx),
    errors: ctx.errors,
    stages,
  };
}

export { RELEASE_PIPELINE_STAGES };
