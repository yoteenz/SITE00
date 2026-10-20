import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  createArtifactForLead,
  getArtifactPayload,
  getClientArtifactPayloadByToken,
  markQuoteCommerciallyReady,
} from '../api/_lib/digitalFoundation/service.js';
import { completeIntakeWithContactPhone } from './helpers/dfTestContactPhone.js';
import { resolveArtifactSurfaceForClient } from '../shared/site00-digital-foundation/surface.js';

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('G-02 client quote withholding', () => {
  it('caps surface at INTAKE_SUBMITTED and redacts quote until founder commercial ready', () => {
    const a = createArtifactForLead({ business_name: 'Withhold Co' });
    completeIntakeWithContactPhone(a.artifact_id);
    const internal = getArtifactPayload(a.artifact_id);
    expect(internal.quote).toBeTruthy();
    expect(resolveArtifactSurfaceForClient(internal.artifact, internal.quote)).toBe('INTAKE_SUBMITTED');

    const clientBefore = getClientArtifactPayloadByToken(a.public_token);
    expect(clientBefore.surface).toBe('INTAKE_SUBMITTED');
    expect(clientBefore.quote).toBeNull();
    expect(clientBefore.recommendation).toBeNull();

    markQuoteCommerciallyReady(a.artifact_id);
    const clientAfter = getClientArtifactPayloadByToken(a.public_token);
    expect(clientAfter.quote).not.toBeNull();
    expect(clientAfter.surface).not.toBe('INTAKE_SUBMITTED');
  });
});
