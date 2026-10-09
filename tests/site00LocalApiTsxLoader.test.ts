import { describe, expect, it } from 'vitest';
import { register } from 'tsx/esm/api';

describe('site00 Vite local API tsx loader', () => {
  it('loads Digital Foundation admin handler without internal tsx path imports', async () => {
    register();
    const mod = await import('../api/admin/site00-foundation.js');
    expect(typeof mod.default).toBe('function');
  });
});
