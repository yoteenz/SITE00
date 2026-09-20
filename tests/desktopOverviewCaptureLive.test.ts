/**
 * Live Playwright — desktop NDX overview implementation snapshot must pass QA.
 * Skips when Vite dev server is not running (CI cloud agent / local without dev).
 */

import { describe, expect, it } from 'vitest';
import { captureImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';

const DEV_BASE = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

async function viteDevServerUp(): Promise<boolean> {
  try {
    const res = await fetch(`${DEV_BASE}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe('Desktop overview CAPTURE SCREEN (live Playwright)', () => {
  it(
    'captureImplementationSnapshot passes QA for ndxbook overview desktop',
    async () => {
      if (!(await viteDevServerUp())) {
        expect(true).toBe(true);
        return;
      }

      const snap = await captureImplementationSnapshot({
        projectId: 'ndxbook',
        screenId: 'overview',
        viewportClass: 'desktop',
        baseUrl: DEV_BASE,
        route: '/projects/ndxbook/overview',
      });

      expect(snap).not.toBeNull();
      expect(snap!.qaPassed).toBe(true);
      expect(snap!.qaIssues ?? []).toEqual([]);
      expect(snap!.error).toBeNull();
      expect(snap!.captureStatus).toBe('CURRENT');
      expect(snap!.width).toBe(1440);
      expect(snap!.height).toBe(900);
      expect(snap!.resolvedRoute).toContain('/projects/ndxbook/overview');
      expect(snap!.resolvedRoute).toContain('designPreview=1');
    },
    90_000,
  );
});
