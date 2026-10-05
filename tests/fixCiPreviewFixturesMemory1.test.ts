import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { isPreviewReviewMemoryStoreEnabled } from '../api/_lib/site00ClientReviews/previewReviewMemoryStore.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('CI preview fixtures memory store', () => {
  it('enables in-memory preview reviews under Vitest + preview mode', () => {
    process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE = '1';
    delete process.env.SITE00_CLIENT_REVIEW_SUPABASE_INTEGRATION;
    expect(isPreviewReviewMemoryStoreEnabled()).toBe(true);
  });

  it('review repository delegates countPreviewFixtures to memory store', () => {
    const repo = read('api/_lib/site00ClientReviews/reviewRepository.ts');
    expect(repo).toContain('previewReviewMemoryStore');
    expect(repo).toContain('countPreviewFixtures(projectSlug)');
  });

  it('canonical project skips Supabase lookup in Vitest unless integration flag set', () => {
    const canonical = read('api/_lib/site00Projects/canonicalProject.ts');
    expect(canonical).toContain('SITE00_PROJECTS_SUPABASE_INTEGRATION');
    expect(canonical).toContain('skipSupabaseProjectLookupInVitest');
  });
});
