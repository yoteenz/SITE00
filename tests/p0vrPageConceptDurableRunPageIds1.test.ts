import { describe, expect, it } from 'vitest';

import { expandPageConceptDurableRunPageIdCandidates } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptDurableRunPageIds.js';

describe('durable run page_id candidates', () => {
  it('includes legacy overview-scoped Supabase page_id', () => {
    const ids = expandPageConceptDurableRunPageIdCandidates({
      projectSlug: 'ndxbook',
      pageId: 'ndxbook:overview',
      screenId: 'overview',
      route: '/projects/ndxbook',
    });
    expect(ids).toContain('ndxbook:overview:/projects/ndxbook');
  });

  it('includes founder overview legacy page_id when route is missing', () => {
    const ids = expandPageConceptDurableRunPageIdCandidates({
      projectSlug: 'ndxbook',
      pageId: 'ndxbook:overview',
      screenId: 'overview',
    });
    expect(ids).toContain('ndxbook:overview:/projects/ndxbook');
  });
});
