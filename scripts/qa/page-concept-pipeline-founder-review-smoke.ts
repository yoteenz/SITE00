/**
 * Agent smoke: real Playwright captures + page concept orchestrator → founder review.
 * Requires Vite on :5174. Uses vitest mocks for CGPT/GPT2/NBP (no provider spend).
 */
import { appendPageCapture } from '../../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  registerPageConceptGenerationJobs,
} from '../../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import { evaluatePageConceptReadiness } from '../../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import { loadPageConceptGenerationState } from '../../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { captureImplementationSnapshot } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';
import { runPageConceptGeneration } from '../../api/_lib/site00PageConcept/runPageConceptGeneration.js';

process.env.VITEST = 'true';

const DEV_BASE = process.env.SITE00_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5174';
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

globalThis.localStorage = new MemoryStorage();

const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
if (!overview) {
  console.error('FAIL: overview page missing');
  process.exit(1);
}
const pageId = overview.pageId;
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

if (!mobileSnap?.qaPassed || !desktopSnap?.qaPassed) {
  console.error('FAIL: capture QA', {
    mobile: mobileSnap?.qaIssues,
    desktop: desktopSnap?.qaIssues,
  });
  process.exit(1);
}

const base = {
  projectId: PROJECT,
  pageId,
  screenId: 'overview',
  route,
  timestamp: new Date().toISOString(),
  buildVersion: 'smoke',
  createdBy: 'smoke',
  source: 'IMPLEMENTATION_SNAPSHOT_API' as const,
};
appendPageCapture({ ...base, captureId: mobileSnap.snapshotId, viewport: 'MOBILE', artifactPath: mobileSnap.publicUrl });
appendPageCapture({
  ...base,
  captureId: desktopSnap.snapshotId,
  viewport: 'DESKTOP',
  artifactPath: desktopSnap.publicUrl,
});

const readiness = evaluatePageConceptReadiness(PROJECT, pageId);
if (readiness !== 'READY_FOR_CREATIVE_INJECTION') {
  console.error('FAIL: readiness', readiness);
  process.exit(1);
}

const state = loadPageConceptGenerationState(PROJECT, pageId);
const result = await runPageConceptGeneration({
  state,
  founderConfirmedSpend: true,
  mobileCapture: { captureId: mobileSnap.snapshotId, artifactBase64: 'smoke-mobile', width: 390, height: 844 },
  desktopCapture: { captureId: desktopSnap.snapshotId, artifactBase64: 'smoke-desktop', width: 1440, height: 900 },
});

let merged = applyPageConceptPipelineSet(state, result.pipelineSet);
merged = registerPageConceptGenerationJobs(merged, result.jobs);
merged = mergePageConceptArtifactsIntoGallery(merged);

const report = {
  readiness,
  readyJobs: result.jobs.filter((j) => j.status === 'READY').length,
  generationStatus: merged.generationStatus,
  gpt2: result.pipelineSet.gpt2AuthorityConcept?.conceptId ?? null,
};

console.log(JSON.stringify(report, null, 2));

if (merged.generationStatus !== 'READY_FOR_FOUNDER_REVIEW') {
  console.error('FAIL: expected READY_FOR_FOUNDER_REVIEW');
  process.exit(1);
}

console.log('PASS: page concept pipeline founder review');
process.exit(0);
