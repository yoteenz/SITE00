import { getActiveCanonicalReference, recordVisualReconstructionRun } from './canonicalReferenceRegistry.js';
import { buildVisualReconstructionComposerBrief, composerBriefIncludesActualReference } from './visualReconstructionComposerBrief.js';
import { createDefaultFunctionPreservingVisualRebuildContract } from './functionPreservingVisualRebuildContract.js';
import { invalidateStaleVisualLocks } from './staleLockInvalidation.js';
import { detectSharedComponentImpact } from './sharedComponentImpact.js';
import { findDesignScreen } from './designScreenRegistry.js';
import { PARENT_GEOMETRY_FIRST_ORDER } from './constants.js';
import type {
  DesignViewportClass,
  ReconstructionPassState,
  ScopedDesignImplementationBundle,
  VisualReconstructionRun,
} from './types.js';

export type StartVisualReconstructionInput = {
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
};

export function startVisualReconstructionRun(input: StartVisualReconstructionInput): {
  run: VisualReconstructionRun;
  brief: ReturnType<typeof buildVisualReconstructionComposerBrief>;
  blocked: boolean;
  blockReason: string | null;
} {
  const reference = getActiveCanonicalReference(input.projectId, input.screenId, input.viewportClass);
  if (!reference) {
    const run: VisualReconstructionRun = {
      runId: `run-${Date.now()}`,
      projectId: input.projectId,
      screenId: input.screenId,
      route: input.route,
      viewportClass: input.viewportClass,
      referenceId: '',
      passState: 'BLOCKED',
      iteration: 0,
      overallScore: null,
      shellScore: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      composerBriefId: '',
      patchesApplied: [],
      assetsChanged: [],
      founderJudgment: null,
    };
    recordVisualReconstructionRun(run);
    return { run, brief: null as never, blocked: true, blockReason: 'FAIL_CANONICAL_REFERENCE_MISSING' };
  }

  invalidateStaleVisualLocks({
    regionIds: [...PARENT_GEOMETRY_FIRST_ORDER],
    reason: 'STALE_AFTER_REFERENCE_CHANGE',
  });

  const screen = findDesignScreen(input.projectId, input.screenId);
  const sharedImpact = screen ? detectSharedComponentImpact(screen, input.route) : [];

  const brief = buildVisualReconstructionComposerBrief({
    reference,
    targetDomRoots: screen ? [`[data-visual-reconstruction="${screen.scopeTargetId}"]`] : undefined,
  });

  const passState: ReconstructionPassState = composerBriefIncludesActualReference(brief)
    ? 'READY_TO_REBUILD'
    : 'BLOCKED';

  const run: VisualReconstructionRun = {
    runId: `run-${input.projectId}-${input.screenId}-${input.viewportClass}-${Date.now()}`,
    projectId: input.projectId,
    screenId: input.screenId,
    route: input.route,
    viewportClass: input.viewportClass,
    referenceId: reference.referenceId,
    passState,
    iteration: 0,
    overallScore: null,
    shellScore: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    composerBriefId: brief.briefId,
    patchesApplied: [],
    assetsChanged: [],
    founderJudgment: null,
  };

  recordVisualReconstructionRun(run);

  return {
    run,
    brief,
    blocked: passState === 'BLOCKED' || sharedImpact.some((r) => r.recommendation === 'BLOCK'),
    blockReason: passState === 'BLOCKED' ? 'FAIL_REFERENCE_NOT_PASSED_TO_RECONSTRUCTION' : null,
  };
}

export function compileScopedDesignImplementationBundle(input: StartVisualReconstructionInput): ScopedDesignImplementationBundle | null {
  const { run, brief, blocked } = startVisualReconstructionRun(input);
  if (blocked) return null;
  const reference = getActiveCanonicalReference(input.projectId, input.screenId, input.viewportClass)!;
  return {
    reference,
    decomposition: null,
    implementationSpec: null,
    composerBrief: brief,
    run,
  };
}

export function defaultPreservationContractIntact(): boolean {
  const c = createDefaultFunctionPreservingVisualRebuildContract();
  return c.preserveRoutes && c.preserveBusinessLogic && c.allowShellReplacement;
}
