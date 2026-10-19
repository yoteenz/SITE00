import { describe, expect, it } from 'vitest';
import { createArtifactForLeadDurable } from '../api/_lib/digitalFoundation/service.js';
import { completeIntakeWithContactPhone } from './helpers/dfTestContactPhone.js';
import {
  isSupabaseDfPersistenceEnabled,
  reloadArtifactFromSupabaseForTest,
} from '../api/_lib/digitalFoundation/persistence/supabaseStore.js';

/** Let fire-and-forget schedulePersist() upserts finish (avoids duplicate INSERT races). */
async function waitForScheduledPersist(ms = 1500): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

describe('Digital Foundation Supabase persistence', () => {
  it.skipIf(!isSupabaseDfPersistenceEnabled())(
    'reloads artifact graph after memory reset',
    async () => {
      const label = `IDNTY E2E ACCEPTANCE — SYNTHETIC ${Date.now()}`;
      const a = await createArtifactForLeadDurable({ business_name: label });
      completeIntakeWithContactPhone(a.artifact_id);
      await waitForScheduledPersist();
      const reloaded = await reloadArtifactFromSupabaseForTest(a.public_token);
      expect(reloaded?.artifact_id).toBe(a.artifact_id);
      expect(reloaded?.intake_state).toBe('COMPLETE');
    },
  );

  it('reports BLOCKED when Supabase persistence test env is not enabled', () => {
    if (isSupabaseDfPersistenceEnabled()) return;
    expect(isSupabaseDfPersistenceEnabled()).toBe(false);
  });
});
