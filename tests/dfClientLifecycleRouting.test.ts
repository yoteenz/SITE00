import { describe, expect, it } from 'vitest';
import { resolveDfRoute } from '../src/site00/foundation-client/model';
import type { ClientDigitalFoundationPayload } from '../shared/site00-digital-foundation/clientProjection.js';

function payload(surface: ClientDigitalFoundationPayload['surface']): ClientDigitalFoundationPayload {
  return {
    surface,
    artifact: {
      artifact_id: 'a',
      business_name: 'Test',
      state: 'IN_PROGRESS',
      payment_state: surface === 'PORTAL' ? 'PAID' : 'UNPAID',
      created_at: '2026-01-01T00:00:00.000Z',
      last_activity_at: '2026-01-01T00:00:00.000Z',
    },
    quote: null,
    acceptance: null,
    recommendation: null,
    stages: surface === 'PORTAL' ? [{ stage_code: '01_DETAILS_RECEIVED', status: 'IN_PROGRESS', updated_at: '2026-01-01T00:00:00.000Z' }] : [],
    client_actions: [],
    approvals: [],
    ownership_record: null,
    build_readiness: null,
    credit: null,
    operations_summary: null,
    communication_preferences: { marketing_opt_in: false, project_operations: true, educational: false },
  } as ClientDigitalFoundationPayload;
}

describe('digital foundation client lifecycle routing', () => {
  it('routes pre-activation surfaces to intake/queue parents, not portal default', () => {
    const intakeSubmitted = resolveDfRoute(payload('INTAKE_SUBMITTED'), { checkout: null, activationSeen: true });
    expect(intakeSubmitted.kind).toBe('views');
    if (intakeSubmitted.kind === 'views') {
      expect(intakeSubmitted.views).toEqual(['P03']);
      expect(intakeSubmitted.defaultView).toBe('P03');
    }
  });

  it('routes paid portal surface to living portal with activation handoff', () => {
    const portal = resolveDfRoute(payload('PORTAL'), { checkout: null, activationSeen: false });
    expect(portal.kind).toBe('views');
    if (portal.kind === 'views') {
      expect(portal.views).toContain('OVERVIEW');
      expect(portal.defaultView).toBe('P06');
    }
    const portalActive = resolveDfRoute(payload('PORTAL'), { checkout: null, activationSeen: true });
    if (portalActive.kind === 'views') expect(portalActive.defaultView).toBe('OVERVIEW');
  });

  it('routes completion surfaces into the living portal with milestone view', () => {
    const complete = resolveDfRoute(
      {
        ...payload('COMPLETE'),
        artifact: {
          ...payload('COMPLETE').artifact,
          completion_state: 'COMPLETE',
          payment_state: 'PAID',
        },
      },
      { checkout: null, activationSeen: true },
    );
    expect(complete.kind).toBe('views');
    if (complete.kind === 'views') {
      expect(complete.views).toContain('OVERVIEW');
      expect(complete.views).toContain('COMPLETE');
      expect(complete.defaultView).toBe('OVERVIEW');
    }
  });
});
