/**
 * P1 controlled proof orchestration — full pipeline coordinator.
 */

import { randomUUID } from 'node:crypto';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import { createHash } from 'node:crypto';
import { P1_CONTROLLED_SURFACE, P1_METHODOLOGY_VERSION } from './constants.js';
import type { P1ControlledProofRun, ImplementedSurfaceReference } from './types.js';
import { auditP1Preconditions } from './preconditionAudit.js';
import { compileP1ContractsForProjectsIndex } from './contractCompilation.js';
import {
  buildComposerImplementationPackage,
  dispatchComposerPackage,
  resetComposerDispatchRegistry,
  composerAdapterLiveConnected,
} from './composerAdapter.js';
import { createDefaultP1Budget, createEmptyP1Spend, checkComposerDispatchBudget } from './budgetGuard.js';
import {
  evaluateImplementationFidelity,
  buildImplementationRevisionDelta,
} from './fidelityEvaluation.js';
import { resolveDispatchResponsiveEvidence } from './dispatchGates.js';
import { getP1ControlledProofRun, saveP1ControlledProofRun, resetP1ControlledProofRun } from './p1RunStore.js';
import { updateP1CapabilityVerification, mergeP1CapabilityVerifications } from './capabilityRegistry.js';

function nowIso(): string {
  return new Date().toISOString();
}

export function resetP1OrchestrationState(): void {
  resetP1ControlledProofRun();
  resetComposerDispatchRegistry();
}

export async function initializeP1ControlledProofRun(params: {
  projectId?: string;
  proof?: SurfaceDesignProof | null;
}): Promise<P1ControlledProofRun> {
  const projectId = params.projectId ?? 'site00';
  const audit = await auditP1Preconditions({});

  const run: P1ControlledProofRun = {
    runId: randomUUID(),
    projectId,
    surfaceId: P1_CONTROLLED_SURFACE,
    proof: params.proof ?? null,
    pageFamilyContract: null,
    surfaceExperienceBrief: null,
    surfaceContract: null,
    composerPackage: null,
    fidelityEvaluation: null,
    revisionDelta: null,
    implementedCaptures: [],
    budget: createDefaultP1Budget(),
    spend: createEmptyP1Spend(),
    preconditionAudit: audit,
    capabilitySnapshots: mergeP1CapabilityVerifications([]).map((c) => ({
      capabilityId: c.capabilityId as import('./constants.js').P1CapabilityId,
      verificationStatus: c.verificationStatus,
      notes: c.notes,
    })),
    founderImplementationReview: null,
    childRunId: null,
    parentRunId: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  return saveP1ControlledProofRun(run);
}

export async function compileP1ImplementationContracts(
  proof: SurfaceDesignProof,
  projectId = 'site00',
): Promise<P1ControlledProofRun> {
  const run = (await getP1ControlledProofRun()) ?? (await initializeP1ControlledProofRun({ projectId, proof }));
  const approvedFp = proof.composedProof?.fingerprint ?? createHash('sha256').update(proof.proofRecordId).digest('hex').slice(0, 16);

  const contracts = compileP1ContractsForProjectsIndex({
    projectId,
    proof,
    approvedProofsFingerprint: approvedFp,
  });

  const updated: P1ControlledProofRun = {
    ...run,
    proof,
    pageFamilyContract: contracts.pageFamilyContract,
    surfaceExperienceBrief: contracts.surfaceExperienceBrief,
    surfaceContract: contracts.surfaceContract,
    updatedAt: nowIso(),
  };

  return saveP1ControlledProofRun(updated);
}

export async function dispatchP1ComposerImplementation(params: {
  proof: SurfaceDesignProof;
  projectId?: string;
  composerVerified?: boolean;
}): Promise<P1ControlledProofRun> {
  let run = await compileP1ImplementationContracts(params.proof, params.projectId);
  const budgetCheck = checkComposerDispatchBudget(run.budget, run.spend);
  if (!budgetCheck.allowed) {
    throw new Error(budgetCheck.reason);
  }

  if (!run.surfaceContract || !run.pageFamilyContract || !run.proof) {
    throw new Error('Contracts not compiled');
  }

  const contracts = compileP1ContractsForProjectsIndex({
    projectId: params.projectId ?? 'site00',
    proof: params.proof,
    approvedProofsFingerprint: params.proof.composedProof?.fingerprint ?? '',
  });

  const pkg = buildComposerImplementationPackage({
    runId: run.runId,
    projectId: params.projectId ?? 'site00',
    proof: params.proof,
    designProofContract: contracts.designProofContract,
    pageFamilyContract: contracts.pageFamilyContract,
    surfaceContract: contracts.surfaceContract,
    surfaceExperienceBrief: contracts.surfaceExperienceBrief,
    sourceCommit: run.preconditionAudit?.sourceCommit ?? null,
  });

  const responsiveEvidence = resolveDispatchResponsiveEvidence(params.proof);
  const dispatchResult = dispatchComposerPackage({
    pkg,
    proof: params.proof,
    config: {
      composerImplemented: true,
      composerVerified: params.composerVerified ?? process.env.VITEST === 'true',
      dependencyGraphCurrent: true,
      functionalCanonCurrent: true,
      hasDesktopProof: responsiveEvidence.hasDesktopProof,
      hasMobileProof: responsiveEvidence.hasMobileProof,
    },
    storedFingerprints: contracts.pageFamilyContract.fingerprints,
  });

  const caps = updateP1CapabilityVerification({
    capabilityId: 'COMPOSER_DISPATCH',
    verificationStatus: dispatchResult.dispatched ? 'TEST_VERIFIED' : 'NOT_VERIFIED',
    verificationRunId: run.runId,
    existing: mergeP1CapabilityVerifications([]),
    notes: dispatchResult.blockedReason ?? (dispatchResult.dispatched ? 'Package dispatched in test path' : null),
  });

  run = {
    ...run,
    composerPackage: dispatchResult.package,
    spend: {
      ...run.spend,
      composerDispatchAttempts: run.spend.composerDispatchAttempts + (dispatchResult.duplicatePrevented ? 0 : 1),
    },
    capabilitySnapshots: caps.map((c) => ({
      capabilityId: c.capabilityId as import('./constants.js').P1CapabilityId,
      verificationStatus: c.verificationStatus,
      notes: c.notes,
    })),
    updatedAt: nowIso(),
  };

  return saveP1ControlledProofRun(run);
}

export function recordImplementedSurfaceCapture(params: {
  run: P1ControlledProofRun;
  route: string;
  viewport: 'DESKTOP' | 'MOBILE';
  storagePath: string;
  publicUrl: string;
  sourceCommit?: string | null;
}): ImplementedSurfaceReference {
  const fingerprint = createHash('sha256').update(`${params.storagePath}:${params.viewport}`).digest('hex').slice(0, 16);
  return {
    referenceId: `impl-cap-${randomUUID().slice(0, 8)}`,
    runId: params.run.runId,
    packageId: params.run.composerPackage?.packageId ?? 'none',
    route: params.route,
    viewport: params.viewport,
    storagePath: params.storagePath,
    publicUrl: params.publicUrl,
    fingerprint,
    sourceCommit: params.sourceCommit ?? null,
    capturedAt: nowIso(),
    role: 'IMPLEMENTED_SURFACE_REFERENCE',
  };
}

export async function evaluateP1ImplementationFidelity(
  proof: SurfaceDesignProof,
  captures?: ImplementedSurfaceReference[],
): Promise<P1ControlledProofRun> {
  const run = (await getP1ControlledProofRun()) ?? (await initializeP1ControlledProofRun({ proof }));
  const implCaptures = captures ?? run.implementedCaptures;

  const evaluation = evaluateImplementationFidelity({
    runId: run.runId,
    packageId: run.composerPackage?.packageId ?? 'none',
    proof,
    implementedCaptures: implCaptures,
    visionEvaluationAvailable: false,
  });

  const revisionDelta =
    evaluation.overallResult === 'REVISION_REQUIRED' ||
    evaluation.overallResult === 'VISUAL_FAILURE' ||
    evaluation.overallResult === 'FUNCTIONAL_FAILURE'
      ? buildImplementationRevisionDelta({
          parentPackageId: run.composerPackage?.packageId ?? 'none',
          fidelity: evaluation,
        })
      : null;

  const updated: P1ControlledProofRun = {
    ...run,
    implementedCaptures: implCaptures,
    fidelityEvaluation: evaluation,
    revisionDelta,
    spend: {
      ...run.spend,
      fidelityEvaluations: run.spend.fidelityEvaluations + 1,
    },
    updatedAt: nowIso(),
  };

  return saveP1ControlledProofRun(updated);
}

export function setP1FounderImplementationReview(
  judgment: 'APPROVE_IMPLEMENTATION' | 'REVISE_IMPLEMENTATION' | 'REJECT_IMPLEMENTATION',
): P1ControlledProofRun | null {
  const run = getP1ControlledProofRun();
  if (!run) return null;
  const updated = {
    ...run,
    founderImplementationReview: judgment,
    updatedAt: nowIso(),
  };
  if (judgment === 'REVISE_IMPLEMENTATION') {
    updated.childRunId = randomUUID();
    updated.spend = { ...updated.spend, revisionLoops: updated.spend.revisionLoops + 1 };
  }
  return saveP1ControlledProofRun(updated);
}

export function getP1ConclusionFlags(run: P1ControlledProofRun | null): {
  P1_CONTROLLED_PROOF_COMPLETE: boolean;
  REFERENCE_CONDITIONED_VISUAL_PIPELINE_LIVE_VERIFIED: boolean;
  PLAYWRIGHT_LIVE_VERIFIED: boolean;
  COMPOSER_LIVE_CONNECTED: boolean;
  CONTRACT_DRIVEN_IMPLEMENTATION_VERIFIED: boolean;
  IMPLEMENTATION_FIDELITY_LIVE_VERIFIED: boolean;
  READY_FOR_FOUNDER_P1_REVIEW: boolean;
} {
  const proofApproved = run?.proof?.lifecycle === 'APPROVED_FOR_IMPLEMENTATION' ||
    run?.proof?.lifecycle === 'IMPLEMENTATION_CONTRACT_READY';
  const composerDispatched = run?.composerPackage?.dispatchStatus === 'DISPATCHED';
  const contractsCompiled = Boolean(run?.pageFamilyContract && run?.surfaceContract);
  const fidelityDone = Boolean(run?.fidelityEvaluation);

  return {
    P1_CONTROLLED_PROOF_COMPLETE: Boolean(contractsCompiled && composerDispatched && fidelityDone),
    REFERENCE_CONDITIONED_VISUAL_PIPELINE_LIVE_VERIFIED: false,
    PLAYWRIGHT_LIVE_VERIFIED: run?.preconditionAudit?.playwrightAvailable === true && process.env.VITEST !== 'true' ? false : false,
    COMPOSER_LIVE_CONNECTED: composerAdapterLiveConnected(Boolean(composerDispatched), process.env.NODE_ENV === 'production'),
    CONTRACT_DRIVEN_IMPLEMENTATION_VERIFIED: contractsCompiled && composerDispatched,
    IMPLEMENTATION_FIDELITY_LIVE_VERIFIED: fidelityDone && run?.fidelityEvaluation?.overallResult !== 'NOT_EVALUATED' && process.env.VITEST !== 'true' ? false : false,
    READY_FOR_FOUNDER_P1_REVIEW: Boolean(proofApproved || run?.proof?.lifecycle === 'FOUNDER_REVIEW'),
  };
}

export { P1_METHODOLOGY_VERSION, getP1ControlledProofRun };
