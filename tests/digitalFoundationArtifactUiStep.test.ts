import { describe, expect, it } from 'vitest';
import { resolveDigitalFoundationArtifactUiStep } from '../shared/site00-digital-foundation/artifactUiStep.js';

const baseArtifact = {
  payment_state: 'NONE' as const,
  intake_state: 'NOT_STARTED' as const,
};

describe('resolveDigitalFoundationArtifactUiStep', () => {
  it('defaults to prospect on untouched artifact', () => {
    expect(
      resolveDigitalFoundationArtifactUiStep({
        surface: 'PROSPECT',
        artifact: baseArtifact,
      }),
    ).toBe('prospect');
  });

  it('opens intake when preferIntake is set on prospect surface', () => {
    expect(
      resolveDigitalFoundationArtifactUiStep(
        { surface: 'PROSPECT', artifact: baseArtifact },
        { preferIntake: true },
      ),
    ).toBe('intake');
  });

  it('does not force intake after payment (portal)', () => {
    expect(
      resolveDigitalFoundationArtifactUiStep(
        {
          surface: 'PORTAL',
          artifact: { ...baseArtifact, payment_state: 'PAID', intake_state: 'COMPLETE' },
        },
        { preferIntake: true },
      ),
    ).toBe('portal');
  });
});
