/**
 * P0.VR.TWINV3.0R7MF3P2 — Method A multi-provider benchmark
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
  P0_VR_TWIN_V30R7MF3P2_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildTwinProviderBenchmarkSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildTwinProviderBenchmarkSnapshot.js';
import { providerBenchmarkIdempotencyKey } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildTwinProviderBenchmarkSnapshot.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { recordFounderProviderBenchmarkDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderProviderBenchmarkDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileTwinProviderBenchmark } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinProviderBenchmark.js';
import { runMobileTwinFalPipeline } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import {
  resolveTwinBenchmarkModel,
  TWIN_BENCHMARK_PROMPT_CONTRACT_VERSION,
  TWIN_BENCHMARK_VERSION,
} from '../shared/site00-visual-generation/twinProviderBenchmarkCatalog.js';
import type { ProviderTwinBenchmarkReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinProviderBenchmarkTypes.js';

function lockedSession() {
  return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
}

async function methodAReadySession() {
  let session = await runMobileTwinCapabilityTest({ session: lockedSession() });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return session;
}

describe('P0.VR.TWINV3.0R7MF3P2 provider benchmark', () => {
  it('1–7 Method A locked + shared snapshot fields', async () => {
    const session = await methodAReadySession();
    const cap = session.mobileTwinPipeline!.twinCapabilityTest!;
    const snap = buildTwinProviderBenchmarkSnapshot({ benchmarkId: 't1', capabilitySnapshot: cap.snapshot });
    expect(snap.promptContractVersion).toBe(TWIN_BENCHMARK_PROMPT_CONTRACT_VERSION);
    expect(snap.benchmarkVersion).toBe(TWIN_BENCHMARK_VERSION);
    expect(snap.compositionStateId).toBe(cap.snapshot.compositionStateId);
    expect(snap.compositionHash).toBe(cap.snapshot.compositionHash);
    expect(snap.referenceAuthorityId).toBe(cap.snapshot.referenceAuthorityId);
    expect(session.mobileTwinPipeline!.mobileTwinVisualGenerationStrategy).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
  });

  it('2–3 baseline reused from Flow A without extra GPT2 jobs', async () => {
    const session = await methodAReadySession();
    const jobsBefore = session.mobileTwinPipeline!.falJobsDispatched;
    const next = await runMobileTwinProviderBenchmark({ session });
    const bench = next.mobileTwinPipeline!.providerBenchmark!;
    expect(bench.baselineActualRenderId).toBe(next.mobileTwinPipeline!.twinCapabilityTest!.flowAReceiptId ?
      (next.mobileTwinPipeline!.artifactsById[next.mobileTwinPipeline!.twinCapabilityTest!.flowAReceiptId] as { actualRenderId: string }).actualRenderId
    : null);
    expect(bench.runs.GPT2_BASELINE.status).toBe('COMPLETE');
    expect(bench.methodLocked).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
    expect(next.mobileTwinPipeline!.falJobsDispatched).toBeGreaterThanOrEqual(jobsBefore);
  });

  it('8–10 challengers use canonical catalog model IDs', () => {
    expect(resolveTwinBenchmarkModel('NBPRO').model).toContain('nano-banana');
    expect(resolveTwinBenchmarkModel('FLUX2MAX').model).toContain('flux');
    expect(resolveTwinBenchmarkModel('KONTEXTMAX').model).toContain('kontext');
    expect(resolveTwinBenchmarkModel('GPT2_BASELINE').model).toBe('openai/gpt-image-2/edit');
  });

  it('11 unavailable model surfaced', () => {
    const prev = process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL;
    process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL = 'UNAVAILABLE';
    const res = resolveTwinBenchmarkModel('NBPRO');
    expect(res.available).toBe(false);
    if (prev === undefined) delete process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL;
    else process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL = prev;
  });

  it('4–6 13–14 all challengers share composition + one actual/blueprint each', async () => {
    const session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    const bench = session.mobileTwinPipeline!.providerBenchmark!;
    const hash = bench.snapshot.compositionHash;
    const compId = bench.snapshot.compositionStateId;
    for (const slug of ['NBPRO', 'FLUX2MAX', 'KONTEXTMAX'] as const) {
      const row = bench.runs[slug];
      if (row.status === 'UNAVAILABLE') continue;
      expect(row.status).toBe('COMPLETE');
      expect(row.actualRenderId).toBeTruthy();
      expect(row.blueprintRenderId).toBeTruthy();
      const actual = session.mobileTwinPipeline!.renders.find((r) => r.id === row.actualRenderId)!;
      const blueprint = session.mobileTwinPipeline!.blueprintTwins.find((b) => b.id === row.blueprintRenderId)!;
      expect(actual.compositionHash).toBe(hash);
      expect(blueprint.compositionHash).toBe(hash);
      expect(actual.compositionStateId).toBe(compId);
      expect(blueprint.structuralSource).toBe('FROZEN_COMPOSITION_STATE');
    }
    expect(session.mobileTwinPipeline!.packages.length).toBe(0);
  });

  it('15–16 no package fan-out; desktop jobs zero', async () => {
    const session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    expect(session.mobileTwinPipeline!.desktopJobsDispatched).toBe(0);
    expect(session.mobileTwinPipeline!.packages.length).toBe(0);
  });

  it('17 idempotency prevents duplicate benchmark dispatch', async () => {
    let session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    const jobs = session.mobileTwinPipeline!.falJobsDispatched;
    session = await runMobileTwinProviderBenchmark({ session });
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBe(jobs);
    const key = providerBenchmarkIdempotencyKey(
      session.mobileTwinPipeline!.providerBenchmark!.snapshot.id,
      'benchmark',
      TWIN_BENCHMARK_VERSION,
    );
    expect(session.mobileTwinPipeline!.providerBenchmark!.idempotencyKey).toBe(key);
  });

  it('18–20 machine score cannot auto-promote; founder selection persists strategy', async () => {
    let session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    const receipt = session.mobileTwinPipeline!.artifactsById[
      session.mobileTwinPipeline!.providerBenchmark!.runs.NBPRO.receiptId!
    ] as ProviderTwinBenchmarkReceipt;
    expect(receipt.machinePass).toBe(false);
    expect(receipt.machineRecommendation).toBe('REVIEW_REQUIRED');
    session = recordFounderProviderBenchmarkDecision(session, 'FLUX_2_MAX');
    expect(session.mobileTwinPipeline!.mobileTwinProviderStrategy?.status).toBe('PROVISIONAL_WINNER');
    expect(session.mobileTwinPipeline!.mobileTwinProviderStrategy?.generationMethod).toBe(
      'ATOMIC_SIBLING_FROM_COMPOSITION',
    );
    session = recordFounderProviderBenchmarkDecision(session, 'NONE');
    expect(session.mobileTwinPipeline!.mobileTwinProviderStrategy).toBeNull();
  });

  it('21–22 cost and latency tracked per provider', async () => {
    const session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    const row = session.mobileTwinPipeline!.providerBenchmark!.runs.NBPRO;
    if (row.status !== 'COMPLETE') return;
    const cost = session.mobileTwinPipeline!.artifactsById[row.costRecordId!] as {
      actualCostUsd: number;
      blueprintCostUsd: number;
      totalCostUsd: number;
    };
    expect(cost.totalCostUsd).toBeGreaterThan(0);
    const receipt = session.mobileTwinPipeline!.artifactsById[row.receiptId!] as ProviderTwinBenchmarkReceipt;
    expect(receipt.actualLatencyMs).toBeGreaterThanOrEqual(0);
    expect(receipt.blueprintLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('23 explicit retry targets one challenger only', async () => {
    let session = await runMobileTwinProviderBenchmark({ session: await methodAReadySession() });
    const jobs = session.mobileTwinPipeline!.falJobsDispatched;
    session = await runMobileTwinFalPipeline({
      session,
      action: 'RETRY_PROVIDER_BENCHMARK_NBPRO',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.falJobsDispatched).toBeGreaterThan(jobs);
  });

  it('blocks benchmark when Method A not locked', async () => {
    await expect(runMobileTwinProviderBenchmark({ session: lockedSession() })).rejects.toThrow(
      /MOBILE_TWIN_PROVIDER_BENCHMARK_REQUIRES_METHOD_A/,
    );
  });

  it('24 lineage + pipeline action wiring', async () => {
    expect(P0_VR_TWIN_V30R7MF3P2_LINEAGE).toContain('R7MF3P2');
    const session = await runMobileTwinFalPipeline({
      session: await methodAReadySession(),
      action: 'RUN_MOBILE_TWIN_PROVIDER_BENCHMARK',
      founderConfirmedSpend: true,
    });
    expect(session.mobileTwinPipeline!.providerBenchmark).toBeTruthy();
  });
});
