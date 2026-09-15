import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import { SITE00_ROUTES, site00ProjectDesignTwinTestAPath } from '../src/site00/config/routes.js';
import {
  GROK_JOB_STAGES,
  GROK_TWIN_TEST_A_HEADER,
  GROK_TWIN_TEST_A_STORAGE_PREFIX,
  GROK_TWIN_TEST_A_SUBHEADER,
  P0_VR_DESIGNBENCH_GROK1_LINEAGE,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import { grokTwinTestARoute } from '../shared/site00-design-bench/grokTwinTestA/route.js';
import { GROK_TWIN_TEST_A_ISOLATION_CONTRACT, assertGrokTwinTestASourceIsolation } from '../shared/site00-design-bench/grokTwinTestA/isolation.js';
import { validateGrokReferenceUpload } from '../shared/site00-design-bench/grokTwinTestA/uploadValidation.js';
import { sha256HexFromBytes } from '../shared/site00-design-bench/grokTwinTestA/sha256.js';
import { estimateRemainingMs, formatDurationMmSs, grokStageProgress } from '../shared/site00-design-bench/grokTwinTestA/timing.js';
import { packageContractPresence } from '../shared/site00-design-bench/grokTwinTestA/packageGuard.js';
import { persistGrokTwinTestARun, readPersistedGrokTwinTestARun } from '../shared/site00-design-bench/grokTwinTestA/persist.js';
import { resetGrokDesignBenchStoreForTests } from '../api/_lib/site00GrokDesignBench/store.js';
import { startGrokDesignBenchRun, getPublicGrokDesignBenchRun, grokDesignBenchAudit } from '../api/_lib/site00GrokDesignBench/service.js';
import { grokJobUsesOnlyGrok } from '../api/_lib/site00GrokDesignBench/jobRunner.js';
import { auditGrokDesignBenchProvider, parseGrokPackageJson } from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';

const PNG_1X1_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const MODULE_FILES = [
  'shared/site00-design-bench/grokTwinTestA/constants.ts',
  'shared/site00-design-bench/grokTwinTestA/types.ts',
  'shared/site00-design-bench/grokTwinTestA/isolation.ts',
  'src/site00/pages/DesignTwinTestAPage.tsx',
  'src/site00/components/designBench/GrokTwinTestAArtboard.tsx',
  'src/site00/services/grokTwinTestAClient.ts',
  'api/site00/twin-test-a-design-bench.ts',
  'api/_lib/site00GrokDesignBench/service.ts',
  'api/_lib/site00GrokDesignBench/jobRunner.ts',
  'api/_lib/site00GrokDesignBench/grokVisionProvider.ts',
];

const UNTOUCHED_TWIN_FILES = [
  'src/site00/pages/DesignTwinImplementationPage.tsx',
  'src/site00/pages/DesignTwinV4ProofPage.tsx',
];

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('P0.VR.DESIGNBENCH.GROK1 twin-testA', () => {
  beforeEach(() => {
    resetGrokDesignBenchStoreForTests();
  });

  it('1. twin-testA route exists', () => {
    expect(SITE00_ROUTES.projectDesignTwinTestA).toBe('/projects/:projectSlug/design/twin-testA');
    expect(grokTwinTestARoute('ndxbook')).toBe('/projects/ndxbook/design/twin-testA');
    expect(site00ProjectDesignTwinTestAPath('ndxbook')).toBe('/projects/ndxbook/design/twin-testA');
    expect(read('src/routes/Site00Routes.tsx')).toContain('projectDesignTwinTestA');
    expect(read('src/routes/Site00Routes.tsx')).toContain('DesignTwinTestAPage');
  });

  it('2. route identifies TEST A · GROK', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(GROK_TWIN_TEST_A_HEADER).toBe('TWIN DESIGN BENCHMARK');
    expect(GROK_TWIN_TEST_A_SUBHEADER).toBe('TEST A · GROK');
    expect(page).toContain('GROK_TWIN_TEST_A_HEADER');
    expect(page).toContain('GROK_TWIN_TEST_A_SUBHEADER');
    expect(page).toContain('twin-test-a-model-label');
    expect(P0_VR_DESIGNBENCH_GROK1_LINEAGE).toBe('P0.VR.DESIGNBENCH.GROK1');
  });

  it('3. valid upload accepted', () => {
    expect(
      validateGrokReferenceUpload({ filename: 'golden.png', mime: 'image/png', byteLength: 1200 }).ok,
    ).toBe(true);
    expect(
      validateGrokReferenceUpload({ filename: 'golden.JPG', mime: 'image/jpeg', byteLength: 1200 }).ok,
    ).toBe(true);
    expect(
      validateGrokReferenceUpload({ filename: 'golden.webp', mime: 'image/webp', byteLength: 1200 }).ok,
    ).toBe(true);
  });

  it('4. invalid upload rejected', () => {
    expect(validateGrokReferenceUpload({ filename: 'notes.gif', mime: 'image/gif', byteLength: 12 }).ok).toBe(false);
    expect(validateGrokReferenceUpload({ filename: 'empty.png', mime: 'image/png', byteLength: 0 }).ok).toBe(false);
    expect(validateGrokReferenceUpload({ filename: 'x.png', mime: 'image/png', byteLength: 20_000_000 }).ok).toBe(false);
  });

  it('5–6. preview metadata + SHA256 captured', async () => {
    const bytes = Buffer.from(PNG_1X1_B64, 'base64');
    const sha = await sha256HexFromBytes(bytes);
    expect(sha).toHaveLength(64);
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('twin-test-a-preview');
    expect(page).toContain('twin-test-a-sha256');
    expect(page).toContain('twin-test-a-dims');
    expect(page).toContain('twin-test-a-aspect');
  });

  it('7. Start disabled without reference', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('START GROK TEST');
    expect(page).toContain('disabled={startDisabled}');
    expect(page).toContain('!localRef');
  });

  it('8–10. start freezes reference, launches Grok-only job', async () => {
    const run = await startGrokDesignBenchRun({
      projectId: 'ndxbook',
      filename: 'golden.png',
      mime: 'image/png',
      width: 390,
      height: 844,
      imageBase64: PNG_1X1_B64,
      awaitCompletion: true,
    });
    expect(run.reference?.immutableForRun).toBe(true);
    expect(run.reference?.sha256).toHaveLength(64);
    expect(run.model).toBe('GROK');
    expect(run.provider).toBe('xai');
    expect(run.modelId).toBe('grok-4.6');
    expect(run.providerModel).toBe('grok-4.6');
    expect(run.stage).toBe('COMPLETE');
    expect(run.composerInvoked).toBe(false);
    expect(run.otherModelOutputAccessed).toBe(false);
    expect(run.testBDataRead).toBe(false);
    expect(grokJobUsesOnlyGrok(run)).toBe(true);
    expect(auditGrokDesignBenchProvider().alternateProviderFallback).toBe(false);
  });

  it('10. no alternate provider fallback', () => {
    const provider = read('api/_lib/site00GrokDesignBench/grokVisionProvider.ts');
    expect(provider).toContain('XAI_API_KEY');
    expect(provider).not.toContain('ANTHROPIC_API_KEY!.');
    expect(provider).not.toContain('openai/gpt');
    expect(provider).not.toContain('fal-ai');
    expect(provider).toContain('no fallback');
    expect(grokDesignBenchAudit().alternateProviderFallback).toBe(false);
    expect(GROK_TWIN_TEST_A_ISOLATION_CONTRACT.alternateProviderFallback).toBe(false);
  });

  it('11–13. progress stages, timer, approximate ETA', () => {
    expect(GROK_JOB_STAGES).toContain('ANALYZING_VISUAL');
    expect(GROK_JOB_STAGES).toContain('RENDERING_VISUAL_TRANSLATION');
    expect(grokStageProgress('ANALYZING_VISUAL')).toBeGreaterThan(0);
    expect(formatDurationMmSs(92000)).toBe('01:32');
    const eta = estimateRemainingMs({ stage: 'ANALYZING_VISUAL', elapsedMs: 10000, historicalAverageMs: 90000 });
    expect(eta).toBeGreaterThan(0);
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('GROK IS TRANSLATING YOUR INTERFACE');
    expect(page).toContain('ESTIMATED REMAINING');
    expect(page).toContain('ETA is approximate');
    expect(page).toContain('twin-test-a-elapsed');
  });

  it('14–21. result persists with full Figma-style package', async () => {
    const store = new Map<string, string>();
    const ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: ls },
      configurable: true,
    });

    const run = await startGrokDesignBenchRun({
      projectId: 'ndxbook',
      filename: 'golden.png',
      mime: 'image/png',
      width: 390,
      height: 844,
      imageBase64: PNG_1X1_B64,
      awaitCompletion: true,
    });
    persistGrokTwinTestARun(run);
    const stored = readPersistedGrokTwinTestARun();
    expect(stored?.runId).toBe(run.runId);
    expect(stored?.package).toBeTruthy();
    const presence = packageContractPresence(run.package);
    expect(presence.visualTranslation).toBe(true);
    expect(presence.figmaStylePackage).toBe(true);
    expect(presence.sectionTree).toBe(true);
    expect(presence.componentTree).toBe(true);
    expect(presence.typography).toBe(true);
    expect(presence.colors).toBe(true);
    expect(presence.spacing).toBe(true);
    expect(presence.surfaces).toBe(true);
    expect(presence.assetMap).toBe(true);
    expect(presence.visualHierarchy).toBe(true);
    expect(presence.implementationHandoff).toBe(true);
    expect(run.package?.implementationHandoff.title).toBe('GrokComposerImplementationHandoff');
    expect(getPublicGrokDesignBenchRun(run.runId)?.runId).toBe(run.runId);
    expect(GROK_TWIN_TEST_A_STORAGE_PREFIX).toBe('site00:twin-test-a:');
  });

  it('22. Composer is never invoked', () => {
    for (const file of MODULE_FILES) {
      const imports = read(file)
        .split('\n')
        .filter((line) => /^\s*import\s/.test(line))
        .join('\n')
        .toLowerCase();
      expect(imports).not.toContain('invokecomposer');
      expect(imports).not.toContain('composeragent');
    }
    expect(GROK_TWIN_TEST_A_ISOLATION_CONTRACT.composerInvoked).toBe(false);
  });

  it('23. test B / Sol data is never read', () => {
    for (const file of MODULE_FILES) {
      const imports = read(file)
        .split('\n')
        .filter((line) => /^\s*import\s/.test(line))
        .join('\n');
      expect(imports).not.toContain('twin-testB');
      expect(imports).not.toContain('twin-test-b');
      expect(imports).not.toContain('solDesignBench');
      expect(imports).not.toContain('site00:sol-design-bench');
    }
  });

  it('24. existing Twin routes remain isolated / untouched by this module', () => {
    for (const file of MODULE_FILES) {
      const imports = read(file)
        .split('\n')
        .filter((line) => /^\s*import\s/.test(line))
        .join('\n');
      const leaks = assertGrokTwinTestASourceIsolation(imports);
      expect(leaks).toEqual([]);
    }
    for (const file of UNTOUCHED_TWIN_FILES) {
      expect(read(file)).not.toContain('twin-testA');
      expect(read(file)).not.toContain('GrokDesignBench');
    }
    expect(read('src/site00/config/routes.ts')).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(read('src/site00/config/routes.ts')).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
  });

  it('parses Grok JSON and lists required job stages', () => {
    const parsed = parseGrokPackageJson('```json\n{"visualInterfacePreview":{"layers":[1]}}\n```');
    expect((parsed as { visualInterfacePreview: { layers: number[] } }).visualInterfacePreview.layers).toEqual([1]);
    expect(GROK_JOB_STAGES).toEqual([
      'IDLE',
      'UPLOADING',
      'QUEUED',
      'INGESTING_REFERENCE',
      'ANALYZING_VISUAL',
      'DECOMPOSING_LAYOUT',
      'BUILDING_DESIGN_SYSTEM',
      'BUILDING_COMPONENT_SPEC',
      'RENDERING_VISUAL_TRANSLATION',
      'BUILDING_HANDOFF',
      'FINALIZING',
      'COMPLETE',
      'FAILED',
    ]);
  });
});
