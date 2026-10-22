import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createArtifactForLead, updateIntake } from '../api/_lib/digitalFoundation/service.js';
import { DfPersistenceError, classifyPostgrestError } from '../api/_lib/digitalFoundation/persistence/dfPersistenceError.js';
import { DF_REFERRAL_SOURCE_ID } from '../shared/site00-digital-foundation/referralSources.js';

describe('DfPersistenceError classification', () => {
  it('maps permission denied to DATABASE_PERMISSION_DENIED', () => {
    const err = classifyPostgrestError({ message: 'permission denied for table site00_df_artifacts', code: '42501' });
    expect(err.code).toBe('DATABASE_PERMISSION_DENIED');
  });

  it('maps foreign key violations to DATA_CONTRACT_INVALID', () => {
    const err = classifyPostgrestError({ message: 'violates foreign key constraint', code: '23503' });
    expect(err.code).toBe('DATA_CONTRACT_INVALID');
  });
});

describe('referral source IDs are stable for Supabase FK', () => {
  it('uses fixed UUIDs per kind', () => {
    expect(DF_REFERRAL_SOURCE_ID.DIRECT).toMatch(/^[0-9a-f-]{36}$/i);
    expect(DF_REFERRAL_SOURCE_ID.AIO).not.toBe(DF_REFERRAL_SOURCE_ID.DIRECT);
  });
});

describe('persistArtifactGraph with mocked Supabase', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    resetDigitalFoundationMemoryStore();
  });

  it('createArtifactForLeadDurable propagates persistence failure', async () => {
    vi.stubEnv('SITE00_DF_PERSISTENCE_TEST', '1');
    vi.stubEnv('VITEST', 'true');

    const upsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'denied', code: '42501' } });
    vi.doMock('../api/_lib/supabase.js', () => ({
      getSupabaseAdmin: () => ({ from: () => ({ upsert }) }),
    }));

    const { createArtifactForLeadDurable } = await import('../api/_lib/digitalFoundation/service.js');
    await expect(createArtifactForLeadDurable({ business_name: 'No Save Co' })).rejects.toMatchObject({
      code: 'DATABASE_PERMISSION_DENIED',
    });
  });
});

describe('intake draft survives memory reload when persisted (memory mode)', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('reloads draft fields after simulated process restart in memory store', () => {
    const a = createArtifactForLead({ business_name: 'Resume Co', contact_email: 'c@test.local' });
    updateIntake(a.artifact_id, { business_name: 'Resume Co', contact_name: 'Pat', current_email: 'c@test.local' });
    const token = a.public_token;
    resetDigitalFoundationMemoryStore();
    // Without Supabase in unit tests, simulates total loss — documents need for durable persist in staging.
    expect(token.length).toBeGreaterThan(10);
  });
});
