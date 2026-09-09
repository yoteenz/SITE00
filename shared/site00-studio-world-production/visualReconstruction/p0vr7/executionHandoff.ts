/**
 * P0.VR.7 — Composer / execution fidelity handoff payload.
 */

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

  return {
    handoffId: handoffId(),
    contractId: contract.contractId,
    systemInstruction: contract.systemFidelityInstruction || SYSTEM_FIDELITY_INSTRUCTION,
    founderInstruction: contract.founderInstructionAdditive,
    geometryProfile: contract.decomposition.globalGeometry,
    assetManifest: contract.decomposition.assetManifest,
    implementationPlan: contract.implementationPlan,
    qaRequirements: {
      requireScreenshotQA: contract.requireScreenshotQA,
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
  ];
  if (handoff.founderInstruction) lines.push('', `FOUNDER NOTE: ${handoff.founderInstruction}`);
  return lines.join('\n');
}
