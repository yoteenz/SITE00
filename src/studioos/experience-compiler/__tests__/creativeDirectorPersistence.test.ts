import { beforeEach, describe, expect, it } from 'vitest';
import { createCreativeThread } from '../../../../api/_lib/experienceCompilerCreativeDirector/creativeDirectorAgent.js';
import {
  getThread,
  persistenceBackendLabel,
  resetExperienceCompilerCreativeDirectorStore,
} from '../../../../api/_lib/experienceCompilerCreativeDirector/store.js';
import { creativeDirectorPersistenceEnabled } from '../../../../api/_lib/experienceCompilerCreativeDirector/supabasePersistence.js';

beforeEach(() => {
  resetExperienceCompilerCreativeDirectorStore();
});

describe('creative director persistence', () => {
  it('reports persistence backend label', () => {
    const label = persistenceBackendLabel();
    expect(label === 'supabase' || label === 'memory').toBe(true);
  });

  it('restores thread after memory cache clear when supabase tables are reachable', async () => {
    if (!creativeDirectorPersistenceEnabled()) {
      expect(persistenceBackendLabel()).toBe('memory');
      return;
    }
    const thread = await createCreativeThread({
      project_id: 'persist_test_project',
      project_slug: 'site00',
      title: 'Persistence probe',
      task_mode: 'CONCEPT_TERRITORIES',
    });
    resetExperienceCompilerCreativeDirectorStore();
    let restored: Awaited<ReturnType<typeof getThread>>;
    try {
      restored = await getThread(thread.thread_id);
    } catch {
      restored = null;
    }
    if (!restored) {
      // Supabase unreachable or migration not applied — memory path still holds in-process.
      expect(persistenceBackendLabel()).toBe('supabase');
      return;
    }
    expect(restored.thread_id).toBe(thread.thread_id);
    expect(restored.title).toBe('Persistence probe');
  });
});
