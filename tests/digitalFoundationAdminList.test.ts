import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore, listArtifacts } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createArtifactForLead } from '../api/_lib/digitalFoundation/service.js';

describe('Digital Foundation admin list projection', () => {
  beforeEach(() => {
    resetDigitalFoundationMemoryStore();
  });

  it('lists artifacts with opaque public tokens for personalized URLs', () => {
    const artifact = createArtifactForLead({
      contact_name: 'Anthony',
      business_name: 'Anthony Digital Foundation',
      referral_kind: 'DIRECT',
    });
    const rows = listArtifacts();
    expect(rows.length).toBe(1);
    expect(rows[0].artifact_id).toBe(artifact.artifact_id);
    expect(rows[0].public_token).toBe(artifact.public_token);
    expect(rows[0].public_token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(`/foundation/${rows[0].public_token}`).not.toMatch(/anthony/i);
  });

  it('syncAllArtifactsIntoMemory is skipped when Supabase persistence is off', async () => {
    vi.stubEnv('SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE', '0');
    const { syncAllArtifactsIntoMemory } = await import('../api/_lib/digitalFoundation/persistence/supabaseStore.js');
    await expect(syncAllArtifactsIntoMemory()).resolves.toBeUndefined();
    vi.unstubAllEnvs();
  });
});
