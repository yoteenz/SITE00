import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  FIGMA_STYLE_PACKAGE_KEYS,
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_DESIGN_BENCH_POLL_INTERVAL_MS,
  GROK_DESIGN_BENCH_STALL_MS,
  GROK_PROVIDER_TIMEOUT,
  GROK_RUN_STALLED,
  P0_VR_DESIGNBENCH_GROK1_BUILD,
  P0_VR_DESIGNBENCH_GROK1F4_LINEAGE,
} from '../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  archiveGrokTwinTestAIncident,
  markGrokTwinTestAServerLost,
  persistGrokTwinTestARun,
  readGrokTwinTestADurationHistory,
  readGrokTwinTestAIncidents,
} from '../shared/site00-design-bench/grokTwinTestA/persist.js';
import { emptyGrokTiming, evaluateGrokEta, finalizeGrokTiming } from '../shared/site00-design-bench/grokTwinTestA/timing.js';
import type { GrokDesignBenchRun } from '../shared/site00-design-bench/grokTwinTestA/types.js';
import {
  applyGrokStallWatchdog,
  grokExecutionTimedOut,
  isGrokRunCancelRequested,
  requestGrokRunCancel,
} from '../api/_lib/site00GrokDesignBench/grokWatchdog.js';
import { buildGrok46ResponsesPayload } from '../api/_lib/site00GrokDesignBench/grokVisionProvider.js';
import { cancelGrokDesignBenchRun, grokDesignBenchRuntimeHealth } from '../api/_lib/site00GrokDesignBench/service.js';
import { putGrokDesignBenchRun, resetGrokDesignBenchStoreForTests } from '../api/_lib/site00GrokDesignBench/store.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

function mockLocalStorage() {
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
  return store;
}

function sampleRun(patch: Partial<GrokDesignBenchRun> = {}): GrokDesignBenchRun {
  const queuedAt = new Date(Date.now() - 54 * 60 * 1000).toISOString();
  return {
    runId: 'incident-54m',
    projectId: 'ndxbook',
    model: 'GROK',
    provider: 'xai',
    providerLabel: 'xAI',
    providerModel: 'grok-4.6',
    modelId: 'grok-4.6',
    webSearchEnabled: false,
    stage: 'ANALYZING_VISUAL',
    stageLabel: 'Analyzing visual hierarchy…',
    progressPercent: 28,
    etaApproximate: true,
    estimatedRemainingMs: 5000,
    error: null,
    reference: null,
    package: null,
    timing: { ...emptyGrokTiming(), queuedAt, startedAt: queuedAt, providerStartedAt: queuedAt },
    cost: {
      reported: false,
      currency: null,
      amount: null,
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      note: 'Pending provider',
    },
    inputReceipt: null,
    providerFailure: null,
    composerInvoked: false,
    otherModelOutputAccessed: false,
    testBDataRead: false,
    lastStateChangeAt: queuedAt,
    providerRequestStatus: 'IN_FLIGHT',
    ...patch,
  };
}

describe('P0.VR.DESIGNBENCH.GROK1F4 long-run watchdog', () => {
  afterEach(() => {
    resetGrokDesignBenchStoreForTests();
    delete process.env.XAI_API_KEY;
  });

  it('1. build and lineage', () => {
    expect(P0_VR_DESIGNBENCH_GROK1_BUILD).toBe('v489');
    expect(P0_VR_DESIGNBENCH_GROK1F4_LINEAGE).toBe('P0.VR.DESIGNBENCH.GROK1F4');
  });

  it('2. 10-minute execution timeout exists', () => {
    expect(GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS).toBe(10 * 60 * 1000);
    expect(GROK_PROVIDER_TIMEOUT).toBe('GROK_PROVIDER_TIMEOUT');
    const runner = read('api/_lib/site00GrokDesignBench/jobRunner.ts');
    expect(runner).toContain('GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS');
    expect(runner).toContain('controller.abort()');
    expect(runner).toContain(GROK_PROVIDER_TIMEOUT);
  });

  it('3. 5-minute stall watchdog exists', () => {
    expect(GROK_DESIGN_BENCH_STALL_MS).toBe(5 * 60 * 1000);
    expect(GROK_RUN_STALLED).toBe('RUN_STALLED');
    const run = sampleRun();
    const watched = applyGrokStallWatchdog(run, Date.parse(run.timing.queuedAt!) + GROK_DESIGN_BENCH_STALL_MS + 1);
    expect(watched.stall?.stalled).toBe(true);
    expect(watched.stall?.stalledStage).toBe('ANALYZING_VISUAL');
    expect(watched.stall?.providerRequestStatus).toBe('IN_FLIGHT');
    expect(watched.etaKind).toBe('POSSIBLE_STALL');
  });

  it('4. fake leftover ETA is removed after 2× expected or 5 min stall', () => {
    const longer = evaluateGrokEta({
      stage: 'ANALYZING_VISUAL',
      elapsedMs: 54 * 60 * 1000,
      historicalAverageMs: 90_000,
      lastStateChangeAt: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(longer.kind).toBe('TAKING_LONGER');
    expect(longer.label).toBe('TAKING LONGER THAN EXPECTED');
    expect(longer.remainingMs).toBeNull();

    const stall = evaluateGrokEta({
      stage: 'ANALYZING_VISUAL',
      elapsedMs: 54 * 60 * 1000,
      historicalAverageMs: 90_000,
      lastStateChangeAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    });
    expect(stall.kind).toBe('POSSIBLE_STALL');
    expect(stall.label).toBe('POSSIBLE STALL');

    const countdown = evaluateGrokEta({
      stage: 'ANALYZING_VISUAL',
      elapsedMs: 10_000,
      historicalAverageMs: 90_000,
    });
    expect(countdown.kind).toBe('COUNTDOWN');
    expect(countdown.remainingMs).toBe(80_000);

    expect(read('shared/site00-design-bench/grokTwinTestA/timing.ts')).not.toContain('0.25');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).not.toContain('~{formatDurationMmSs');
  });

  it('5. provider timeout marks a 11-minute in-flight run', () => {
    const started = new Date(Date.now() - 11 * 60 * 1000).toISOString();
    expect(
      grokExecutionTimedOut(
        sampleRun({ timing: { ...emptyGrokTiming(), queuedAt: started, providerStartedAt: started } }),
      ),
    ).toBe(true);
    expect(grokExecutionTimedOut(sampleRun({ timing: { ...emptyGrokTiming(), queuedAt: new Date().toISOString() } }))).toBe(
      false,
    );
  });

  it('6. cancel marks CANCEL_REQUESTED and does not count as success', () => {
    const run = sampleRun({ runId: 'cancel-me', timing: { ...emptyGrokTiming(), queuedAt: new Date().toISOString() } });
    putGrokDesignBenchRun(run);
    const next = cancelGrokDesignBenchRun('cancel-me');
    expect(next?.cancelStatus).toBe('CANCEL_REQUESTED');
    expect(isGrokRunCancelRequested('cancel-me')).toBe(true);
    requestGrokRunCancel('cancel-me');
    const persistStore = mockLocalStorage();
    persistGrokTwinTestARun({
      ...run,
      stage: 'CANCELLED',
      cancelStatus: 'CANCELLED',
      timing: { ...run.timing, totalDurationMs: 12_000 },
    });
    expect(readGrokTwinTestADurationHistory()).toEqual([]);
    expect(persistStore.get('site00:twin-test-a:v1:durationHistory') ?? '[]').toBe('[]');
  });

  it('7. 54+ minute incident is archived and not used as ETA average', () => {
    mockLocalStorage();
    const incident = sampleRun({
      timing: {
        ...emptyGrokTiming(),
        queuedAt: new Date(Date.now() - 54 * 60 * 1000).toISOString(),
        totalDurationMs: 54 * 60 * 1000,
      },
      stage: 'ANALYZING_VISUAL',
    });
    persistGrokTwinTestARun(incident);
    const incidents = readGrokTwinTestAIncidents();
    expect(incidents.some((item) => item.runId === 'incident-54m')).toBe(true);
    expect(readGrokTwinTestADurationHistory()).toEqual([]);
    archiveGrokTwinTestAIncident(incident);
    expect(readGrokTwinTestAIncidents().filter((item) => item.runId === 'incident-54m')).toHaveLength(1);
  });

  it('7b. persist strips data-URL images so boot cannot choke on a golden', () => {
    const store = mockLocalStorage();
    persistGrokTwinTestARun(
      sampleRun({
        reference: {
          runId: 'incident-54m',
          imageUrl: `data:image/png;base64,${'A'.repeat(2000)}`,
          storageRef: 'grok-twin-test-a://incident-54m',
          sha256: 'abc',
          width: 10,
          height: 10,
          mime: 'image/png',
          filename: 'golden.png',
          byteLength: 12,
          uploadedAt: new Date().toISOString(),
          immutableForRun: true,
        },
      }),
    );
    const raw = store.get('site00:twin-test-a:v1:latestRun') ?? '';
    expect(raw).not.toContain('data:image/png;base64');
    expect(raw).toContain('"sha256":"abc"');
  });

  it('8. poll 404 becomes SERVER_RUN_LOST without erasing the incident', () => {
    mockLocalStorage();
    const lost = markGrokTwinTestAServerLost(sampleRun());
    expect(lost.stage).toBe('FAILED');
    expect(lost.error).toBe('SERVER_RUN_LOST');
    expect(lost.timing.totalDurationMs).toBeGreaterThan(50 * 60 * 1000);
    expect(readGrokTwinTestAIncidents()[0]?.runId).toBe('incident-54m');
    expect(read('src/site00/services/grokTwinTestAClient.ts')).toContain("throw new Error('RUN_NOT_FOUND')");
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).toContain('markGrokTwinTestAServerLost');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).toContain('twin-test-a-incident-timing');
    expect(read('src/site00/services/grokTwinTestAClient.ts')).toContain('PENDING_API');
  });

  it('9. real timing fields are separated', () => {
    const queuedAt = '2026-09-15T18:00:00.000Z';
    const startedAt = '2026-09-15T18:00:02.000Z';
    const providerStartedAt = '2026-09-15T18:00:03.000Z';
    const providerCompletedAt = '2026-09-15T18:04:03.000Z';
    const completedAt = '2026-09-15T18:04:05.000Z';
    const timing = finalizeGrokTiming(
      {
        ...emptyGrokTiming(),
        queuedAt,
        startedAt,
        providerStartedAt,
        providerCompletedAt,
        uploadDurationMs: 1500,
      },
      completedAt,
    );
    expect(timing.queueDurationMs).toBe(2000);
    expect(timing.uploadDurationMs).toBe(1500);
    expect(timing.modelDurationMs).toBe(240_000);
    expect(timing.postProcessingDurationMs).toBe(2000);
    expect(timing.totalDurationMs).toBe(245_000);
  });

  it('10. output contract is unchanged and max_output_tokens is not added', () => {
    expect(FIGMA_STYLE_PACKAGE_KEYS).toHaveLength(14);
    const payload = buildGrok46ResponsesPayload({
      runId: 'probe',
      imageBytes: Buffer.from('abcd'),
      mime: 'image/png',
      filename: 'tiny.png',
      width: 32,
      height: 32,
      sha256: 'abc',
    });
    expect(JSON.stringify(payload)).not.toContain('max_output_tokens');
    expect(payload.model).toBe(GROK_DESIGN_BENCH_MODEL_ID);
    expect(read('api/_lib/site00GrokDesignBench/prompt.ts')).toContain('FigmaStyleInterfaceTranslationPackage');
  });

  it('11. runtime health gate and no auto-retry', async () => {
    const health = await grokDesignBenchRuntimeHealth();
    expect(health.stallWatchdog).toBe('PASS');
    expect(health.timeout).toBe('PASS');
    expect(health).toHaveProperty('founderRunReady');
    expect(read('api/_lib/site00GrokDesignBench/service.ts')).toContain('GROK_RUNTIME_HEALTH_BLOCKED');
    expect(read('api/_lib/site00GrokDesignBench/service.ts')).toContain('founderRunReady');
    expect(read('src/site00/pages/DesignTwinTestAPage.tsx')).toContain('Founder golden is not retried automatically');
    expect(read('api/_lib/site00GrokDesignBench/jobRunner.ts')).not.toMatch(/retryGrokGolden|autoRetryFounderGolden/i);
    expect(read('api/site00/twin-test-a-design-bench.ts')).toContain("action === 'cancel'");
    expect(read('api/site00/twin-test-a-design-bench.ts')).toContain('runtime_health');
  });

  it('12. page exposes cancel, stall labels, health, and poll interval', () => {
    const page = read('src/site00/pages/DesignTwinTestAPage.tsx');
    expect(page).toContain('CANCEL TEST');
    expect(page).toContain('POSSIBLE STALL');
    expect(page).toContain('TAKING LONGER THAN EXPECTED');
    expect(page).toContain('GROK_RUNTIME_HEALTH');
    expect(page).toContain('FOUNDER_RUN_READY');
    expect(page).toContain('cancelGrokTwinTestARun');
    expect(GROK_DESIGN_BENCH_POLL_INTERVAL_MS).toBe(1200);
    expect(page).toContain('GROK_DESIGN_BENCH_POLL_INTERVAL_MS');
  });

  it('13a. twin-testA boots without CTRL ROOM account guard', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toMatch(/projectDesignTwinTestA[\s\S]{0,280}DesignTwinTestAPage/);
    expect(routes).not.toMatch(/projectDesignTwinTestA[\s\S]{0,280}Site00AccountRouteGuard/);
  });

  it('13. Composer is not invoked and Sol route is untouched', () => {
    const files = [
      'api/_lib/site00GrokDesignBench/jobRunner.ts',
      'api/_lib/site00GrokDesignBench/grokWatchdog.ts',
      'api/_lib/site00GrokDesignBench/grokTimingProbe.ts',
      'src/site00/pages/DesignTwinTestAPage.tsx',
    ];
    for (const file of files) {
      expect(read(file)).not.toContain('invokeComposer');
      expect(read(file)).not.toContain('gpt-5.6-sol');
    }
    expect(read('src/site00/pages/SolDesignBenchmarkPage.tsx')).not.toContain('GROK1F4');
  });
});
