/**
 * Browser build stub — Playwright must never ship in the SPA bundle.
 * Server/API code paths that call `import('playwright')` in shared modules
 * should fail fast if invoked in the browser.
 */

export const chromium = {
  launch: async (): Promise<never> => {
    throw new Error('Playwright is not available in the browser bundle');
  },
};

const playwrightStub = { chromium };

export default playwrightStub;
