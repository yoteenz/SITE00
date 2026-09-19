/**
 * P0.VR.7 — Pipeline integration: upload → contract → decomposition → plan.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { DEFAULT_DESIGN_AUTHORITY_MODE, DEFAULT_FIDELITY_MODE } from './constants.js';
import {
  confirmFidelityContract,
  createDefaultFidelityContract,
  getFidelityContract,
  getFidelityContractByReference,
  mergeFounderInstructionWithContract,
  patchFidelityContract,
} from './contractStore.js';
import { runDesignReferenceDecomposition } from './decomposition.js';
import { buildReferenceImplementationPlan } from './implementationPlan.js';
import { buildVisualCorrectionPlan } from './correctionPlan.js';
import { buildExecutionFidelityHandoff } from './executionHandoff.js';
import { runDesignReferenceScreenshotQA } from './screenshotQA.js';
import type { DesignReferenceFidelityContract, ReferenceViewportAuthority } from './types.js';
import { ensureConvergenceSessionForContract } from '../p0vr6r2/integration.js';

export function ingestReferenceWithFidelityContract(input: {
  referenceId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  referenceWidth?: number;
  referenceHeight?: number;
  founderInstruction?: string | null;
  authorityMode?: DesignReferenceFidelityContract['authorityMode'];
  fidelityMode?: DesignReferenceFidelityContract['fidelityMode'];
}): DesignReferenceFidelityContract {
  const existing = getFidelityContractByReference(input.referenceId);
  if (existing) return existing;

  let contract = createDefaultFidelityContract({
    referenceId: input.referenceId,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    viewport: input.viewport,
    founderInstruction: input.founderInstruction,
    authorityMode: input.authorityMode ?? DEFAULT_DESIGN_AUTHORITY_MODE,
    fidelityMode: input.fidelityMode ?? DEFAULT_FIDELITY_MODE,
    referenceWidth: input.referenceWidth,
    referenceHeight: input.referenceHeight,
  });

  contract = patchFidelityContract(contract.contractId, { status: 'REFERENCE_ANALYZING' })!;

  const decomposition = runDesignReferenceDecomposition({
    contractId: contract.contractId,
    referenceId: input.referenceId,
    viewport: input.viewport,
    referenceWidth: input.referenceWidth,
    referenceHeight: input.referenceHeight,
  });

  const plan = buildReferenceImplementationPlan({
    contractId: contract.contractId,
    fidelityMode: contract.fidelityMode,
    decomposition,
  });

  const viewportAuthority: ReferenceViewportAuthority = {
    viewport: input.viewport,
    referenceId: input.referenceId,
    authorityStatus: 'EXACT',
    geometryProfile: decomposition.globalGeometry,
    assetManifest: decomposition.assetManifest,
  };

  contract = patchFidelityContract(contract.contractId, {
    decomposition,
    implementationPlan: plan,
    viewportAuthorities: [viewportAuthority],
    status: 'INTERPRETATION_REVIEW',
  })!;

  if (contract.authorityMode === 'DESIGN_AUTHORITY' && contract.fidelityMode === 'EXACT') {
    ensureConvergenceSessionForContract(contract);
  }

  return contract;
}

export function confirmReferenceInterpretation(contractId: string): DesignReferenceFidelityContract | null {
  return confirmFidelityContract(contractId);
}

export function resolveEffectiveJobInstruction(
  contractId: string | null,
  founderInstruction: string,
): string {
  if (!contractId) return founderInstruction;
  const contract = getFidelityContract(contractId);
  if (!contract) return founderInstruction;
  return mergeFounderInstructionWithContract(contract, founderInstruction);
}

export function inheritFidelityForAssetCrop(contractId: string | null): {
  authorityMode: DesignReferenceFidelityContract['authorityMode'];
  fidelityMode: DesignReferenceFidelityContract['fidelityMode'];
  systemInstruction: string;
} | null {
  if (!contractId) return null;
  const contract = getFidelityContract(contractId);
  if (!contract) return null;
  return {
    authorityMode: contract.authorityMode,
    fidelityMode: contract.fidelityMode,
    systemInstruction: contract.systemFidelityInstruction,
  };
}

export function runFidelityQaIteration(
  contractId: string,
  liveCaptureAvailable: boolean,
  liveGeometryHints?: Parameters<typeof runDesignReferenceScreenshotQA>[0]['liveGeometryHints'],
): DesignReferenceFidelityContract | null {
  const contract = getFidelityContract(contractId);
  if (!contract?.decomposition) return null;

  const qa = runDesignReferenceScreenshotQA({
    contract,
    decomposition: contract.decomposition,
    liveCaptureAvailable,
    liveGeometryHints,
  });

  const correctionPlan =
    qa.driftFindings.length > 0 ? buildVisualCorrectionPlan({ contractId, findings: qa.driftFindings }) : null;

  const nextStatus =
    qa.fidelityStatus === 'HIGH_MATCH'
      ? 'HIGH_MATCH'
      : qa.fidelityStatus === 'MAJOR_DRIFT'
        ? 'VISUAL_DRIFT_FOUND'
        : 'RENDER_QA_REQUIRED';

  return patchFidelityContract(contractId, {
    latestScreenshotQa: qa,
    latestFidelityStatus: qa.fidelityStatus,
    driftFindings: qa.driftFindings,
    correctionPlan,
    iterationCount: qa.iterationCount,
    status: nextStatus,
  });
}

export function getExecutionHandoffForContract(contractId: string) {
  const contract = getFidelityContract(contractId);
  if (!contract) return null;
  return buildExecutionFidelityHandoff(contract);
}

export function blockGenericFallbackWhenGeometryExists(
  contract: DesignReferenceFidelityContract | null,
): boolean {
  if (!contract) return false;
  return contract.authorityMode === 'DESIGN_AUTHORITY' && contract.decomposition != null;
}

export { getFidelityContract, getFidelityContractByReference, listFidelityContracts } from './contractStore.js';
export { shouldBlockFalsePass } from './screenshotQA.js';
