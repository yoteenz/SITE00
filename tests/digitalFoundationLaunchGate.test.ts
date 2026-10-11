import { describe, expect, it } from 'vitest';
import { createArtifactForLead, updateIntake } from '../api/_lib/digitalFoundation/service.js';
import { getClientArtifactPayloadByToken } from '../api/_lib/digitalFoundation/service.js';
import { createCheckoutSession } from '../api/_lib/digitalFoundation/service.js';
import { LAUNCH_GATE_CHECKOUT_ERROR } from '../shared/site00-digital-foundation/launchGate.js';
import { resolveArtifactSurfaceForClient } from '../shared/site00-digital-foundation/surface.js';

describe('Digital Foundation launch gate', () => {
  it('caps client surface at INTAKE_SUBMITTED when intake-only gate is on', () => {
    const prev = process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY;
    process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY = '1';
    try {
      const a = createArtifactForLead({ business_name: 'Gate Test LLC', contact_name: 'Tester', contact_email: 'gate@test.local' });
      updateIntake(
        a.artifact_id,
        {
          business_name: 'Gate Test LLC',
          contact_name: 'Tester',
          current_email: 'gate@test.local',
          phone: '555-0100',
          industry: 'Transport',
          team_size: 2,
          needs: ['NEED_DOMAIN'],
        },
        true,
      );
      const payload = getClientArtifactPayloadByToken(a.public_token);
      expect(payload.surface).toBe('INTAKE_SUBMITTED');
      expect(resolveArtifactSurfaceForClient(payload.artifact)).toBe('INTAKE_SUBMITTED');
    } finally {
      if (prev === undefined) delete process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY;
      else process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY = prev;
    }
  });

  it('blocks checkout when intake-only gate is on', async () => {
    const prev = process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY;
    process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY = '1';
    try {
      const a = createArtifactForLead({ business_name: 'Checkout Block LLC' });
      await expect(
        createCheckoutSession({
          artifact_id: a.artifact_id,
          success_url: 'https://example.com/s',
          cancel_url: 'https://example.com/c',
        }),
      ).rejects.toThrow(LAUNCH_GATE_CHECKOUT_ERROR);
    } finally {
      if (prev === undefined) delete process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY;
      else process.env.SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY = prev;
    }
  });
});
