import type { ClientDigitalFoundationPayload } from './clientProjection.js';

export type DigitalFoundationArtifactUiStep = 'prospect' | 'intake' | 'quote' | 'portal' | 'complete';

/** Map API surface + optional deep-link to the UI step shown on `/foundation/:token`. */
export function resolveDigitalFoundationArtifactUiStep(
  data: Pick<ClientDigitalFoundationPayload, 'surface' | 'artifact'>,
  options?: { preferIntake?: boolean },
): DigitalFoundationArtifactUiStep {
  const preferIntake = options?.preferIntake === true;
  const paid = data.artifact.payment_state === 'PAID';

  if (preferIntake && !paid && data.surface !== 'PORTAL' && data.surface !== 'COMPLETE' && data.surface !== 'BUILD_UPSELL') {
    if (
      data.surface === 'PROSPECT' ||
      data.surface === 'INTAKE' ||
      data.artifact.intake_state === 'IN_PROGRESS' ||
      data.artifact.intake_state === 'NOT_STARTED'
    ) {
      return 'intake';
    }
  }

  if (data.surface === 'INTAKE' || data.artifact.intake_state === 'IN_PROGRESS') return 'intake';
  if (data.surface === 'QUOTE' || data.surface === 'CHECKOUT' || data.surface === 'PAYMENT_RECOVERY') return 'quote';
  if (data.surface === 'PORTAL') return 'portal';
  if (data.surface === 'COMPLETE' || data.surface === 'BUILD_UPSELL') return 'complete';
  return 'prospect';
}
