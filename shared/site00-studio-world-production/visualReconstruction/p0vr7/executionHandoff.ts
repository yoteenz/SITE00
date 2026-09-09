/**
 * P0.VR.7 — Composer / execution fidelity handoff payload.
 */

import { buildDesignExecutionFidelityEnvelope } from '../p0vr6r2/executionEnvelope.js';
import { requiresVisualConvergence } from '../p0vr6r2/convergenceEngine.js';
import { DEFAULT_MAX_AUTOMATIC_ITERATIONS } from '../p0vr6r2/constants.js';
import { SYSTEM_FIDELITY_INSTRUCTION } from './constants.js';
import type { DesignReferenceFidelityContract, ExecutionFidelityHandoff } from './types.js';
import { QA_DIMENSIONS } from './screenshotQA.js';

function handoffId(): string {
  return `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildExecutionFidelityHandoff(
  contract: DesignReferenceFidelityContract,
): ExecutionFidelityHandoff | null {
  if (!contract.decomposition || !contract.implementationPlan) return null;

  const envelope = buildDesignExecutionFidelityEnvelope({ contract });
  const convergenceRequired = requiresVisualConvergence(contract);

  return {
    handoffId: handoffId(),
    contractId: contract.contractId,
    systemInstruction: contract.systemFidelityInstruction || SYSTEM_FIDELITY_INSTRUCTION,
    founderInstruction: contract.founderInstructionAdditive,
    geometryProfile: contract.decomposition.globalGeometry,
    assetManifest: contract.decomposition.assetManifest,
    implementationPlan: contract.implementationPlan,
    qaRequirements: {
      requireScreenshotQA: contract.requireScreenshotQA || convergenceRequired,
      regions: ['HEADER', 'HERO', 'NAV', 'MAIN_CONTENT', 'FOOTER', 'BOTTOM_NAV'],
      dimensions: [...QA_DIMENSIONS],
    },
    preserveFlags: {
      function: contract.preserveFunction,
      data: contract.preserveData,
      routing: contract.preserveRouting,
      permissions: contract.preservePermissions,
    },
    rebuildFlags: {
      visual: contract.allowVisualRebuild,
      layout: contract.allowLayoutReplacement,
      protectCurrentVisuals: contract.allowCurrentVisualProtection,
    },
    visualConvergenceRequired: convergenceRequired,
    fidelityEnvelopeId: envelope?.envelopeId ?? null,
    maxConvergenceIterations: envelope?.convergencePolicy.maxIterations ?? DEFAULT_MAX_AUTOMATIC_ITERATIONS,
  };
}

export function formatExecutionHandoffPrompt(handoff: ExecutionFidelityHandoff): string {
  const lines = [
    handoff.systemInstruction,
    '',
    `GEOMETRY: ${handoff.geometryProfile.referenceWidth}x${handoff.geometryProfile.referenceHeight}`,
    `ASSETS DETECTED: ${handoff.assetManifest.length}`,
    `LIVE UI REGIONS: ${handoff.implementationPlan.liveUiRegions}`,
    `PRESERVE FUNCTION: ${handoff.preserveFlags.function ? 'YES' : 'NO'}`,
    `REBUILD VISUAL: ${handoff.rebuildFlags.visual ? 'YES' : 'NO'}`,
    `PROTECT CURRENT VISUALS: ${handoff.rebuildFlags.protectCurrentVisuals ? 'YES' : 'NO'}`,
    `SCREENSHOT QA REQUIRED: ${handoff.qaRequirements.requireScreenshotQA ? 'YES' : 'NO'}`,
    `VISUAL CONVERGENCE REQUIRED: ${handoff.visualConvergenceRequired ? 'YES' : 'NO'}`,
  ];
  if (handoff.founderInstruction) lines.push('', `FOUNDER NOTE: ${handoff.founderInstruction}`);
  if (handoff.visualConvergenceRequired) {
    lines.push(
      '',
      'VISUAL CONVERGENCE REQUIRED.',
      'DO NOT SELF-DECLARE PIXEL PERFECT OR REFERENCE VERIFIED.',
      'RETURN CONTROL TO DesignVisualConvergenceEngine AFTER IMPLEMENTATION.',
      `MAX AUTO ITERATIONS: ${handoff.maxConvergenceIterations}`,
    );
  }
  return lines.join('\n');
}
