import { describe, expect, it } from 'vitest';
import { buildSite00StoragePublicUrl } from '../../src/site00/utils/replayStorageUrl';

describe('buildSite00StoragePublicUrl', () => {
  it('builds public storage URL from path', () => {
    expect(
      buildSite00StoragePublicUrl(
        'https://example-project.supabase.co', // pragma: allowlist secret
        'site00/validation/ndxbook/test.webp',
      ),
    ).toBe(
      'https://example-project.supabase.co/storage/v1/object/public/live-preview/site00/validation/ndxbook/test.webp',
    );
  });
});
