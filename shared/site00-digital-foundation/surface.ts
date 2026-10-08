import type { DigitalFoundationArtifact, DigitalFoundationArtifactPayload } from './types.js';

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
