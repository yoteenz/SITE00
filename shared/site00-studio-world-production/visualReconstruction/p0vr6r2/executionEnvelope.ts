/**
 * P0.VR.6R2 — DesignExecutionFidelityEnvelope for composer handoff.
 */

import type { DesignReferenceFidelityContract } from '../p0vr7/types.js';
import { DEFAULT_MAX_AUTOMATIC_ITERATIONS } from './constants.js';
import { requiresVisualConvergence } from './convergenceEngine.js';
import { buildDefaultDynamicMasks } from './dynamicMasking.js';
import { buildRegionRegistryFromDecomposition } from './regionRegistry.js';
import type { DesignExecutionFidelityEnvelope } from './types.js';

function envelopeId(): string {
  return `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildDesignExecutionFidelityEnvelope(input: {
  contract: DesignReferenceFidelityContract;
  visualConvergenceSessionId?: string | null;
}): DesignExecutionFidelityEnvelope | null {
  const { contract } = input;
  if (!contract.decomposition) return null;

  const convergenceRequired = requiresVisualConvergence(contract);
  const regions = buildRegionRegistryFromDecomposition({
    referenceId: contract.referenceId,
    decomposition: contract.decomposition,
  });

  return {
    envelopeId: envelopeId(),
    contractId: contract.contractId,
    referenceId: contract.referenceId,
    authorityMode: contract.authorityMode,
    fidelityMode: contract.fidelityMode,
    viewport: contract.viewport,
    geometryProfile: contract.decomposition.globalGeometry,
    typographyProfile: contract.decomposition.typography,
    spacingProfile: contract.decomposition.spacing,
    assetManifest: contract.decomposition.assetManifest,
    dynamicMasks: buildDefaultDynamicMasks(regions),
    requiredVisualQa: convergenceRequired,
    convergencePolicy: {
      visualConvergenceRequired: convergenceRequired,
      overlayQaRequired: convergenceRequired,
      regionDeltaAnalysisRequired: convergenceRequired,
      correctionLoopRequired: convergenceRequired,
      maxIterations: DEFAULT_MAX_AUTOMATIC_ITERATIONS,
    },
    verificationRequired: convergenceRequired,
    visualConvergenceSessionId: input.visualConvergenceSessionId ?? null,
  };
}

export function formatEnvelopeHandoffAppendix(envelope: DesignExecutionFidelityEnvelope): string {
  if (!envelope.convergencePolicy.visualConvergenceRequired) return '';
  return [
    '',
    'VISUAL CONVERGENCE REQUIRED.',
    'DO NOT SELF-DECLARE PIXEL PERFECT OR REFERENCE VERIFIED.',
    'RETURN CONTROL TO DesignVisualConvergenceEngine AFTER IMPLEMENTATION.',
    `MAX AUTO ITERATIONS: ${envelope.convergencePolicy.maxIterations}`,
  ].join('\n');
}
