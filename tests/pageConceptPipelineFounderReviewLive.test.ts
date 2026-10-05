/**
 * Live: Playwright source captures → page concept orchestrator → READY_FOR_FOUNDER_REVIEW.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  registerPageConceptGenerationJobs,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import { evaluatePageConceptReadiness } from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { captureImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';

const DEV_BASE = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';
const PROJECT = 'ndxbook';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

async function viteDevServerUp(): Promise<boolean> {
  try {
    const res = await fetch(`${DEV_BASE}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe('Page concept pipeline founder review (live)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: () => undefined });
  });

  it(
    'runs CGPT→GPT2→NBP to READY_FOR_FOUNDER_REVIEW with real Playwright captures',
    async () => {
      if (!(await viteDevServerUp())) {
        expect(true).toBe(true);
        return;
      }

      const pageId = overviewPageId();
      const route = '/projects/ndxbook/overview';

      const mobileSnap = await captureImplementationSnapshot({
        projectId: PROJECT,
        screenId: 'overview',
        viewportClass: 'mobile',
        baseUrl: DEV_BASE,
        route,
      });
      const desktopSnap = await captureImplementationSnapshot({
        projectId: PROJECT,
        screenId: 'overview',
        viewportClass: 'desktop',
        baseUrl: DEV_BASE,
        route,
      });

      expect(mobileSnap?.qaPassed).toBe(true);
      expect(desktopSnap?.qaPassed).toBe(true);
      expect(mobileSnap?.publicUrl).toBeTruthy();
      expect(desktopSnap?.publicUrl).toBeTruthy();

      const base = {
        projectId: PROJECT,
        pageId,
        screenId: 'overview',
        route,
        timestamp: new Date().toISOString(),
        buildVersion: 'vitest-live',
        createdBy: 'vitest',
        source: 'IMPLEMENTATION_SNAPSHOT_API' as const,
      };
      appendPageCapture({
        ...base,
        captureId: mobileSnap!.snapshotId,
        viewport: 'MOBILE',
        artifactPath: mobileSnap!.publicUrl,
      });
      appendPageCapture({
        ...base,
        captureId: desktopSnap!.snapshotId,
        viewport: 'DESKTOP',
        artifactPath: desktopSnap!.publicUrl,
      });

      expect(evaluatePageConceptReadiness(PROJECT, pageId)).toBe('READY_FOR_CREATIVE_INJECTION');

      const state = loadPageConceptGenerationState(PROJECT, pageId);
      const result = await runPageConceptGeneration({
        state,
        founderConfirmedSpend: true,
        mobileCapture: {
          captureId: mobileSnap!.snapshotId,
          artifactBase64: 'vitest-mobile-ref',
          width: 390,
          height: 844,
        },
        desktopCapture: {
          captureId: desktopSnap!.snapshotId,
          artifactBase64: 'vitest-desktop-ref',
          width: 1440,
          height: 900,
        },
      });

      expect(result.jobs.filter((j) => j.status === 'READY')).toHaveLength(6);
      expect(result.pipelineSet.gpt2AuthorityConcept).toBeTruthy();
      expect(result.pipelineSet.creativeInjection).toBeTruthy();

      let merged = applyPageConceptPipelineSet(state, result.pipelineSet);
      merged = registerPageConceptGenerationJobs(merged, result.jobs);
      merged = mergePageConceptArtifactsIntoGallery(merged);

      expect(merged.generationStatus).toBe('READY_FOR_FOUNDER_REVIEW');
      expect(merged.generationJobs).toHaveLength(6);
    },
    120_000,
  );
});
