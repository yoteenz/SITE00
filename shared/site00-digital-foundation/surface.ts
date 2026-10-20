import { shouldWithholdClientQuoteFromClient } from './clientQuoteGate.js';
import { isLaunchGateIntakeOnly } from './launchGate.js';
import type { DigitalFoundationArtifact, DigitalFoundationArtifactPayload, DigitalFoundationQuote } from './types.js';

export type ArtifactSurface = DigitalFoundationArtifactPayload['surface'];

export function resolveArtifactSurface(artifact: DigitalFoundationArtifact): ArtifactSurface {
  if (artifact.payment_state === 'REFUNDED' || artifact.payment_state === 'DISPUTED') {
    return 'PAYMENT_RECOVERY';
  }
  if (artifact.completion_state === 'COMPLETE') {
    if (artifact.build_interest !== 'NONE') {
      return 'BUILD_UPSELL';
    }
    return 'COMPLETE';
  }
  if (artifact.payment_state === 'PAID' || artifact.project_state !== 'NOT_STARTED') {
    return 'PORTAL';
  }
  if (artifact.state === 'AWAITING_PAYMENT') return 'CHECKOUT';
  if (artifact.state === 'AWAITING_ACCEPTANCE' || artifact.state === 'QUOTE_READY') return 'QUOTE';
  if (artifact.state === 'RECOMMENDATION_READY') return 'RECOMMENDATION';
  if (artifact.intake_state === 'IN_PROGRESS' || artifact.state === 'INTAKE_IN_PROGRESS') return 'INTAKE';
  return 'PROSPECT';
}

function clientLifecycleUnlocked(artifact: DigitalFoundationArtifact): boolean {
  return (
    artifact.payment_state === 'PAID' ||
    artifact.project_state !== 'NOT_STARTED' ||
    artifact.completion_state === 'COMPLETE'
  );
}

/** Applies launch gate and G-02 quote withholding after the normal lifecycle surface is resolved. */
export function resolveArtifactSurfaceForClient(
  artifact: DigitalFoundationArtifact,
  quote?: DigitalFoundationQuote | null,
): ArtifactSurface {
  const base = resolveArtifactSurface(artifact);
  const unlocked = clientLifecycleUnlocked(artifact);

  if (isLaunchGateIntakeOnly()) {
    if (unlocked) return base;
    if (base === 'PROSPECT' || base === 'INTAKE') return base;
    if (artifact.intake_state === 'COMPLETE') return 'INTAKE_SUBMITTED';
    return base;
  }

  if (!unlocked && shouldWithholdClientQuoteFromClient(artifact, quote ?? null) && artifact.intake_state === 'COMPLETE') {
    return 'INTAKE_SUBMITTED';
  }
  return base;
}
