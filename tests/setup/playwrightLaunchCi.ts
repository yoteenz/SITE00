/** Launch Chromium when installed; skip live suites gracefully in CI without browsers. */
export async function launchPlaywrightChromiumOrSkip(): Promise<
  Awaited<ReturnType<(typeof import('playwright'))['chromium']['launch']>> | null
> {
  try {
    const { chromium } = await import('playwright');
    return await chromium.launch({ headless: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Executable doesn't exist|browserType\.launch/i.test(msg)) {
      console.warn('[playwright] Chromium missing — skipping live browser test');
      return null;
    }
    throw err;
  }
}
