import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createArtifactForLead, getClientArtifactPayloadByToken, updateIntake } from '../api/_lib/digitalFoundation/service.js';

beforeEach(() => {
  resetDigitalFoundationMemoryStore();
  vi.unstubAllEnvs();
});

describe('synthetic intake draft persistence (in-process)', () => {
  it('loses in-memory draft after store reset without Supabase persistence', () => {
    const a = createArtifactForLead({ business_name: 'SYNTH · Draft Co', contact_email: 'founder@test.com' });
    updateIntake(
      a.artifact_id,
      {
        business_name: 'SYNTH · Draft Co',
        contact_name: 'Founder Test',
        current_email: 'founder@test.com',
        team_size: 2,
        needs: ['NEED_DOMAIN'],
      },
      false,
    );
    resetDigitalFoundationMemoryStore();
    expect(() => getClientArtifactPayloadByToken(a.public_token)).toThrow(/ARTIFACT_NOT_FOUND/);
  });

  it('keeps draft on same memory session before submit', () => {
    const a = createArtifactForLead({ business_name: 'SYNTH · Session Co', contact_email: 'a@b.com' });
    updateIntake(
      a.artifact_id,
      {
        business_name: 'SYNTH · Session Co',
        contact_name: 'Test',
        current_email: 'a@b.com',
        team_size: 1,
        needs: ['NEED_DOMAIN'],
      },
      false,
    );
    const payload = getClientArtifactPayloadByToken(a.public_token);
    expect(payload?.artifact.intake.contact_name).toBe('Test');
    expect(payload?.artifact.intake_state).not.toBe('COMPLETE');
  });
});
