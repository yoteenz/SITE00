import { existsSync } from 'node:fs';

/** Chromium for live QA: $SITE00_QA_CHROMIUM, else the cloud image's pre-installed build, else Playwright's default. */
export function qaChromiumPath() {
  const candidates = [process.env.SITE00_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'];
  return candidates.find((p) => p && existsSync(p));
}
