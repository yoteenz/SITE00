import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('site00 Vite local API tsx loader', () => {
  it('loads Digital Foundation admin handler via CJS tsx register sidecar', async () => {
    require('../scripts/site00-register-tsx.cjs');
    const mod = await import('../api/admin/site00-foundation.js');
    expect(typeof mod.default).toBe('function');
  });
});
