import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetSpendAuthorizationStoreForTests } from '../shared/site00-production-guardrails/index.js';
import {
  assessProviderAccess,
  assertPaidGenerationAuthorized,
  buildEntry002BenchmarkExecutionPacket,
  compileStoryboardKeyframesToProvider,
  createCinematicJob,
  createEmptyQualityReport,
  hashReferenceManifest,
  isNdxbookKling4ExecutionEnabled,
  issueBenchmarkSpendAuthorization,
  KLING4_CAPABILITY_MATRIX,
  recoverEntry002Assets,
  resetCinematicJobStoreForTests,
  validateReferenceReadiness,
  validateRoughCutHandoff,
  validateVideoOutputFile,
  buildEntry002BenchmarkReferenceManifest,
  buildEntry002BenchmarkShotContract,
  NDXBOOK_CINEMATIC_FEATURE_FLAGS,
} from '../shared/site00-ndxbook-cinematic-execution/index.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

describe('NDXBOOK Kling 4 cinematic execution (P0 audit foundation)', () => {
  beforeEach(() => {
    resetSpendAuthorizationStoreForTests();
    resetCinematicJobStoreForTests();
    delete process.env.NDXBOOK_KLING4_EXECUTION_ENABLED;
    delete process.env.VITE_NDXBOOK_KLING4_EXECUTION_ENABLED;
  });

  it('feature flag defaults disabled', () => {
    expect(isNdxbookKling4ExecutionEnabled()).toBe(false);
    expect(NDXBOOK_CINEMATIC_FEATURE_FLAGS.NDXBOOK_KLING4_EXECUTION_ENABLED).toBe('NDXBOOK_KLING4_EXECUTION_ENABLED');
  });

  it('capability matrix documents Artlist manual path', () => {
    const row = KLING4_CAPABILITY_MATRIX.find((r) => r.capability === 'PAID_GENERATION_API');
    expect(row?.site00Integration).toBe('DISABLED');
    const access = assessProviderAccess();
    expect(access.artlistAutomation).toBe('MANUAL_SUBMISSION');
    expect(access.falKlingLegacyAutomation).toBe('API_AUTOMATED');
  });

  it('recovers Entry 002 pre-storyboard + panel assets; reports missing reel keyframes', () => {
    const report = recoverEntry002Assets(REPO_ROOT);
    expect(report.assetsFound.length).toBeGreaterThan(20);
    const missingKf = report.assetsMissing.filter((a) => a.assetId.includes('REEL-KF'));
    expect(missingKf.length).toBe(3);
  });

  it('benchmark reference readiness passes on repo public assets', () => {
    const manifest = buildEntry002BenchmarkReferenceManifest(REPO_ROOT);
    const readiness = validateReferenceReadiness(manifest, { repoRoot: REPO_ROOT });
    expect(readiness.ok).toBe(true);
    if (readiness.ok) {
      expect(readiness.manifestHash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('blocks unapproved reference', () => {
    const manifest = buildEntry002BenchmarkReferenceManifest(REPO_ROOT);
    manifest.references[0]!.approvalStatus = 'DRAFT';
    const readiness = validateReferenceReadiness(manifest, { repoRoot: REPO_ROOT });
    expect(readiness.ok).toBe(false);
    if (!readiness.ok) expect(readiness.blockedReason).toBe('REFERENCE_UNAPPROVED');
  });

  it('blocks hash mismatch', () => {
    const manifest = buildEntry002BenchmarkReferenceManifest(REPO_ROOT);
    manifest.references[0]!.contentHash = 'deadbeef';
    const readiness = validateReferenceReadiness(manifest, { repoRoot: REPO_ROOT });
    expect(readiness.ok).toBe(false);
    if (!readiness.ok) expect(readiness.blockedReason).toBe('REFERENCE_HASH_MISMATCH');
  });

  it('blocks missing file', () => {
    const manifest = buildEntry002BenchmarkReferenceManifest(REPO_ROOT);
    manifest.references[0]!.fileLocation = 'public/assets/does-not-exist.jpg';
    const readiness = validateReferenceReadiness(manifest, { repoRoot: REPO_ROOT });
    expect(readiness.ok).toBe(false);
    if (!readiness.ok) expect(readiness.blockedReason).toBe('REFERENCE_MISSING');
  });

  it('compiles keyframes for benchmark shot', () => {
    const contract = buildEntry002BenchmarkShotContract(REPO_ROOT);
    const compiled = compileStoryboardKeyframesToProvider(contract);
    expect(compiled.ok).toBe(true);
  });

  it('paid generation requires feature flag + spend authorization', () => {
    const packet = buildEntry002BenchmarkExecutionPacket(REPO_ROOT);
    const blocked = assertPaidGenerationAuthorized({
      projectId: 'ndxbook',
      provider: 'artlist-kling-4',
      model: 'kling-4.0',
      shotId: packet.shotId,
      durationSec: 4,
      aspectRatio: '9:16',
      resolution: '1080p',
      referenceCount: 5,
      estimatedCostCredits: 100,
      generationCount: 1,
      outputLocation: '/tmp/out',
    });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.blockedReason).toBe('FEATURE_DISABLED');

    process.env.NDXBOOK_KLING4_EXECUTION_ENABLED = '1';
    process.env.VITE_NDXBOOK_KLING4_EXECUTION_ENABLED = '1';
    const stillBlocked = assertPaidGenerationAuthorized({
      projectId: 'ndxbook',
      provider: 'artlist-kling-4',
      model: 'kling-4.0',
      shotId: packet.shotId,
      durationSec: 4,
      aspectRatio: '9:16',
      resolution: '1080p',
      referenceCount: 5,
      estimatedCostCredits: 100,
      generationCount: 1,
      outputLocation: '/tmp/out',
    });
    expect(stillBlocked.allowed).toBe(false);
    if (!stillBlocked.allowed) expect(stillBlocked.blockedReason).toBe('UNAUTHORIZED_SPEND');

    const auth = issueBenchmarkSpendAuthorization({
      projectId: 'ndxbook',
      actorId: 'founder',
      maxCredits: 200,
      purpose: 'benchmark',
    });
    const allowed = assertPaidGenerationAuthorized({
      projectId: 'ndxbook',
      provider: 'artlist-kling-4',
      model: 'kling-4.0',
      shotId: packet.shotId,
      durationSec: 4,
      aspectRatio: '9:16',
      resolution: '1080p',
      referenceCount: 5,
      estimatedCostCredits: 100,
      generationCount: 1,
      outputLocation: '/tmp/out',
      spendAuthorizationId: auth.authorizationId,
    });
    expect(allowed.allowed).toBe(true);
  });

  it('job idempotency prevents duplicate submission', () => {
    const contract = buildEntry002BenchmarkShotContract(REPO_ROOT);
    const manifest = buildEntry002BenchmarkReferenceManifest(REPO_ROOT);
    const hash = hashReferenceManifest(manifest);
    const first = createCinematicJob({
      contract,
      referenceManifestHash: hash,
      promptHash: 'abc',
      modelVersion: 'kling-4.0',
    });
    expect(first.ok).toBe(true);
    const second = createCinematicJob({
      contract,
      referenceManifestHash: hash,
      promptHash: 'abc',
      modelVersion: 'kling-4.0',
    });
    expect(second.ok).toBe(false);
  });

  it('rough cut handoff blocks unapproved output', () => {
    const contract = buildEntry002BenchmarkShotContract(REPO_ROOT);
    const jobResult = createCinematicJob({
      contract,
      referenceManifestHash: 'x',
      promptHash: 'y',
      modelVersion: 'kling-4.0',
    });
    expect(jobResult.ok).toBe(true);
    if (!jobResult.ok) return;
    const handoff = validateRoughCutHandoff({
      job: jobResult.job,
      outputAssetId: 'asset-1',
      videoPath: '/tmp/fake.mp4',
      shotOrder: 8,
      narrativeBeat: 'RECOGNITION',
      timelineDurationSec: 4,
      founderApprovedOutput: false,
    });
    expect(handoff.ok).toBe(false);
  });

  it('output validation rejects static image as video', () => {
    const panel = path.join(
      REPO_ROOT,
      'public',
      'assets/expression-engine/entry-002/final-cinematic-storyboard/panels/ndx-entry-002-final-cinematic-storyboard-002-panel-08-v001.jpg',
    );
    const result = validateVideoOutputFile(panel);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('STATIC_IMAGE');
  });

  it('execution packet is provider-ready in manual mode', () => {
    const packet = buildEntry002BenchmarkExecutionPacket(REPO_ROOT);
    expect(packet.referenceReadiness.ok).toBe(true);
    expect(packet.keyframeCompile.ok).toBe(true);
    expect(packet.providerRequest.mode).toBe('MANUAL_SUBMISSION');
    expect(packet.providerRequest.manualInstructions).toContain('Artlist');
    expect(createEmptyQualityReport(packet.shotId).overallAutomatedQa).toBe('NOT_RUN');
  });
});
