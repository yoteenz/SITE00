import { afterEach, describe, expect, it, vi } from 'vitest';

describe('webglAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('opens one probe context per page and releases it, however many thumbnails ask', async () => {
    const loseContext = vi.fn();
    const createElement = vi.fn(() => ({
      getContext: () => ({ getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null) }),
    }));
    vi.stubGlobal('document', { createElement });
    const { webglAvailable } = await import('./engine');
    for (let i = 0; i < 12; i += 1) expect(webglAvailable()).toBe(true);
    expect(createElement).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });
});
