/**
 * P0.VR.OPUS-NATIVE2 — Phase 16, 17, 18: preview origin resolution and named
 * diagnostics.
 *
 * ROOT CAUSE OF "PREVIEW FAILED"
 *
 * It was never the Anthropic key, and it was never Playwright. `previewBaseUrl()`
 * defaulted to `http://127.0.0.1:5174` — the Vite dev server port — with no
 * environment awareness at all. The deployed API runs on Railway in a
 * container that has no Vite dev server, no repository checkout and no
 * browser, so the loopback fetch failed and the runtime reported the only
 * thing it knew: "preview server unreachable". That one string covered a
 * misconfigured URL, an unreachable origin, a 404 route, a missing browser and
 * a dead process, so it could not be acted on.
 *
 * Two things follow, and both are structural rather than cosmetic:
 *
 *   1. the preview origin is resolved per environment instead of hardcoded to
 *      a development port, and
 *   2. blockage is reported as a named reason with a remedy, so "BLOCKED /
 *      PREVIEW_ORIGIN_UNREACHABLE" is distinguishable from "BLOCKED /
 *      BROWSER_LAUNCH_FAILED" without reading a log.
 *
 * The deeper conclusion is recorded here because it shapes the product: the
 * native runtime's visual loop requires a repository checkout, a dev server
 * and a browser in the *same* place. A stateless API container is the wrong
 * host for it. `PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT` is therefore a
 * first-class, honest verdict rather than a failure — a deployed instance is
 * expected to report it, and should not pretend a visual loop it cannot run.
 */

import { previewBaseUrl, previewOriginConfigured, runtimeEnvironment } from './config.js';

export const PREVIEW_BLOCK_REASONS = [
  'PREVIEW_ORIGIN_UNCONFIGURED',
  'PREVIEW_ORIGIN_UNREACHABLE',
  'PREVIEW_PROCESS_NOT_RUNNING',
  'ROUTE_404',
  'BROWSER_NOT_INSTALLED',
  'BROWSER_LAUNCH_FAILED',
  'SCREENSHOT_FAILED',
  'PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT',
] as const;
export type PreviewBlockReason = (typeof PREVIEW_BLOCK_REASONS)[number];

export interface PreviewReadiness {
  ready: boolean;
  reason: PreviewBlockReason | null;
  /** Safe for the panel: never contains a credential or a full env dump. */
  detail: string;
  origin: string;
  environment: string;
  /** What the founder or operator should do about it. */
  remedy: string | null;
}

const REMEDIES: Record<PreviewBlockReason, string> = {
  PREVIEW_ORIGIN_UNCONFIGURED:
    'Set SITE00_OPUS_NATIVE_PREVIEW_URL to an origin this process can reach, or run the runtime alongside the dev server.',
  PREVIEW_ORIGIN_UNREACHABLE:
    'Start the preview server, or point SITE00_OPUS_NATIVE_PREVIEW_URL at one that is already running.',
  PREVIEW_PROCESS_NOT_RUNNING: 'Run `npm run dev` (or the preview server) before dispatching a visual run.',
  ROUTE_404: 'The origin is up but does not serve this route. Check the route path and the SPA fallback.',
  BROWSER_NOT_INSTALLED: 'Install the Playwright Chromium build with `npx playwright install chromium`.',
  BROWSER_LAUNCH_FAILED: 'Chromium is installed but will not start in this container. Check sandbox flags and shared memory.',
  SCREENSHOT_FAILED: 'The page loaded but could not be captured. Check for a render-blocking error on the route.',
  PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT:
    'Run the native runtime where the repository, a dev server and a browser are all present. A stateless API container cannot host the visual loop.',
};

function block(reason: PreviewBlockReason, detail: string, origin: string): PreviewReadiness {
  return { ready: false, reason, detail, origin, environment: runtimeEnvironment(), remedy: REMEDIES[reason] };
}

/**
 * Phase 18. Probes in dependency order so the first genuine blocker is the one
 * reported: an unreachable origin is not diagnosed as a browser problem, and a
 * missing browser is not diagnosed as a route problem.
 */
export async function resolvePreviewReadiness(probeRoute?: string): Promise<PreviewReadiness> {
  const environment = runtimeEnvironment();
  const origin = previewBaseUrl();

  // A deployed API container has no checkout to render and no browser to
  // render it with. Saying so plainly beats five seconds of timeouts followed
  // by a misleading network error.
  if (environment === 'DEPLOYED' && !previewOriginConfigured()) {
    return block(
      'PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT',
      'this deployment has no preview origin configured and no local dev server; the visual loop cannot run here',
      origin,
    );
  }

  if (!previewOriginConfigured() && environment === 'UNKNOWN') {
    return block('PREVIEW_ORIGIN_UNCONFIGURED', 'no preview origin configured and the environment is unrecognised', origin);
  }

  let chromium: unknown;
  try {
    chromium = (await import('playwright')).chromium;
  } catch (error) {
    return block('BROWSER_NOT_INSTALLED', `playwright is not importable here (${(error as Error).message})`, origin);
  }
  if (!chromium) return block('BROWSER_NOT_INSTALLED', 'playwright resolved without a chromium build', origin);

  try {
    const response = await fetch(origin, { method: 'GET', signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return block('PREVIEW_ORIGIN_UNREACHABLE', `origin returned HTTP ${response.status}`, origin);
    }
  } catch (error) {
    const message = (error as Error).message ?? String(error);
    const refused = /ECONNREFUSED|fetch failed|connect/i.test(message);
    return block(
      refused ? 'PREVIEW_PROCESS_NOT_RUNNING' : 'PREVIEW_ORIGIN_UNREACHABLE',
      `${origin} did not respond (${message})`,
      origin,
    );
  }

  if (probeRoute) {
    try {
      const url = new URL(probeRoute, origin).toString();
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      if (response.status === 404) return block('ROUTE_404', `${url} returned 404`, origin);
    } catch {
      // The origin answered a moment ago, so a route probe failure is not
      // itself disqualifying; the screenshot attempt will surface it properly.
    }
  }

  return {
    ready: true,
    reason: null,
    detail: `chromium available, preview origin ${origin} responding`,
    origin,
    environment,
    remedy: null,
  };
}
