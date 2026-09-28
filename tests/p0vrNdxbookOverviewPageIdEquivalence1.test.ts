import { describe, expect, it } from 'vitest';

import { canonicalDesignPageCapturePageId } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { designPageIdsEquivalent } from '../shared/site00-design-workspace-production/designPageIdentity.js';

describe('ndxbook overview durable run page_id aliases', () => {
  it('Supabase run page_id matches design registry overview', () => {
    const registry = 'ndxbook:overview';
    const dbPageId = 'ndxbook:overview:/projects/ndxbook';
    expect(canonicalDesignPageCapturePageId('ndxbook', registry)).toBe('ndxbook:/projects/ndxbook');
    expect(designPageIdsEquivalent('ndxbook', registry, dbPageId)).toBe(true);
  });
});
