import { describe, expect, it, vi } from 'vitest';
import { site00StoragePublicUrl } from '../../src/site00/utils/replayStorageUrl';

describe('site00StoragePublicUrl', () => {
  it('builds public storage URL from path', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example-project.supabase.co');
    expect(site00StoragePublicUrl('site00/validation/ndxbook/test.webp')).toBe(
      'https://example-project.supabase.co/storage/v1/object/public/live-preview/site00/validation/ndxbook/test.webp',
    );
  });
});
