import { describe, expect, it } from 'vitest';
import { createArtifactForLead } from '../api/_lib/digitalFoundation/service.js';
import { completeIntakeWithContactPhone } from './helpers/dfTestContactPhone.js';
import {
  isSupabaseDfPersistenceEnabled,
  persistArtifactGraph,
  reloadArtifactFromSupabaseForTest,
} from '../api/_lib/digitalFoundation/persistence/supabaseStore.js';

describe('Digital Foundation Supabase persistence', () => {
  it.skipIf(!isSupabaseDfPersistenceEnabled())(
    'reloads artifact graph after memory reset',
    async () => {
      const a = createArtifactForLead({ business_name: 'Persist Co' });
      completeIntakeWithContactPhone(a.artifact_id);
      await persistArtifactGraph(a.artifact_id);
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
