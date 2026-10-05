import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildF6R1ProofReceiptBackfill,
  fingerprintSolStructuredOutputProofConfiguration,
  getCurrentSolStructuredOutputProofConfiguration,
  isSolStructuredOutputProofReceiptCompatible,
  loadOrBackfillSolStructuredOutputProofReceipt,
  resetSolStructuredOutputProofReceiptStoreForTests,
  setSolStructuredOutputProofReceiptStoreForTests,
} from '../api/_lib/site00SolDesignBench/proofReceiptStore';
import {
  getSolDesignBenchProviderReadiness,
  resetSolDesignBenchForTests,
  setSolDesignBenchExecutorForTests,
} from '../api/_lib/site00SolDesignBench/service';
import {
  canStartSolFounderGolden,
  shouldClearStaleSolFailure,
} from '../src/site00/pages/SolDesignBenchmarkPage';
import type {
  SolStructuredOutputProofConfiguration,
  SolStructuredOutputProofReceipt,
} from '../shared/site00-sol-design-bench/modelContract';
import type { SolDesignBenchRun } from '../shared/site00-sol-design-bench/contracts';

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.RAILWAY_GIT_COMMIT_SHA;
  setSolDesignBenchExecutorForTests(null);
  resetSolStructuredOutputProofReceiptStoreForTests();
  await resetSolDesignBenchForTests();
});

describe('P0.VR.DESIGNBENCH.SOL1F6R2 durable proof receipt', () => {
  it('binds the verified F6R1 evidence to every current provider and output configuration field', () => {
    const configuration = getCurrentSolStructuredOutputProofConfiguration();
    const receipt = buildF6R1ProofReceiptBackfill('2026-09-15T00:00:00.000Z');
    expect(configuration).toEqual({
      provider: 'openai',
      model: 'gpt-5.6-sol',
      reasoning: 'high',
      promptVersion: 'sol-design-bench-test-b-v6-output-budget-32k',
      promptHash: 'e12f2d42d959daa8c8bfff995bba017b0cd860dde6aa61032950cebdd9b5b987',
      schemaVersion: 'figma-interface-translation-v1',
      schemaName: 'figma_style_interface_translation_package',
      structuredOutputMode: 'json_schema',
      strict: true,
      parserPath: 'openai.responses.parse.output_parsed',
      maxOutputTokens: 32_000,
    });
    expect(receipt).toMatchObject({
      receiptType: 'SolStructuredOutputProofReceipt',
      receiptVersion: 1,
      proofVersion: 'sol-structured-output-proof-v6-f6r1',
      apiBuild: '6728d538b2dc5898ccc4667039a47463ecee47b7',
      apiCommit: '6728d538b2dc5898ccc4667039a47463ecee47b7',
      promptVersion: 'sol-design-bench-test-b-v6-output-budget-32k',
      model: 'gpt-5.6-sol',
      reasoning: 'high',
      maxOutputTokens: 32_000,
      tinySchemaSmokePass: true,
      largeOutputStressPass: true,
      largeOutputCharacters: 69_968,
      largeOutputTokens: 22_968,
      largeOutputTruncated: false,
      schemaValidationPass: true,
      manualJsonParseUsed: false,
      outputTextUsedAsPrimaryResult: false,
      completedAt: '2026-09-15T00:00:00.000Z',
      provenance: 'F6R1_VERIFIED_EVIDENCE_BACKFILL',
      configuration,
      tinyLiveSchemaSmoke: {
        runId: 'sol_bb016b79-7f63-47d7-8679-d4f3ec96a668',
        apiBuild: '4b803623dcf9f9768d12530087fe017f19388947',
        sourcePromptVersion: 'sol-design-bench-test-b-v5-sdk-parsed-schema',
        sourceMaxOutputTokens: 16_000,
      },
      largeOutputStress: {
        runId: 'sol_afe08020-a20c-497d-a8b5-7a7c1bf07ae4',
        apiBuild: '6728d538b2dc5898ccc4667039a47463ecee47b7',
        sourcePromptVersion: 'sol-design-bench-test-b-v6-output-budget-32k',
        sourceMaxOutputTokens: 32_000,
        outputCharacters: 69_968,
        actualOutputTokens: 22_968,
        finishReason: 'completed',
      },
      structuredOutputPipelineProofPassed: true,
    });
    expect(receipt?.configurationFingerprint)
      .toBe(fingerprintSolStructuredOutputProofConfiguration(configuration));
  });

  it.each([
    ['provider', 'other'],
    ['model', 'other'],
    ['reasoning', 'medium'],
    ['promptVersion', 'other'],
    ['promptHash', '0'.repeat(64)],
    ['schemaVersion', 'other'],
    ['schemaName', 'other'],
    ['structuredOutputMode', 'text'],
    ['strict', false],
    ['parserPath', 'manual'],
    ['maxOutputTokens', 16_000],
  ])('refuses the F6R1 backfill when %s changes', (key, value) => {
    const changed = {
      ...getCurrentSolStructuredOutputProofConfiguration(),
      [key]: value,
    } as SolStructuredOutputProofConfiguration;
    expect(buildF6R1ProofReceiptBackfill(new Date(0).toISOString(), changed)).toBeNull();
  });

  it('keeps the configuration fingerprint stable after JSONB reorders object keys', () => {
    const receipt = buildF6R1ProofReceiptBackfill(new Date(0).toISOString())!;
    const reorderedConfiguration = Object.fromEntries(
      Object.entries(receipt.configuration).reverse(),
    ) as unknown as SolStructuredOutputProofConfiguration;
    const roundTripped = {
      ...receipt,
      configuration: reorderedConfiguration,
    };
    expect(fingerprintSolStructuredOutputProofConfiguration(reorderedConfiguration))
      .toBe(receipt.configurationFingerprint);
    expect(isSolStructuredOutputProofReceiptCompatible(roundTripped)).toBe(true);
  });

  it('upgrades the order-dependent stored fingerprint without invoking the provider', async () => {
    const legacy = buildF6R1ProofReceiptBackfill('2026-09-15T21:40:00.000Z')!;
    legacy.configuration = Object.fromEntries(
      Object.entries(legacy.configuration).sort(([left], [right]) => left.localeCompare(right)),
    ) as unknown as SolStructuredOutputProofConfiguration;
    legacy.configurationFingerprint = '3571995a08e5ae4b9c13b3c06e26e171430b9a3ce52adfc58bafe19b78636aac';
    let stored = structuredClone(legacy);
    const save = vi.fn(async (receipt: SolStructuredOutputProofReceipt) => {
      stored = structuredClone(receipt);
    });
    const provider = vi.fn();
    setSolDesignBenchExecutorForTests(provider as never);
    setSolStructuredOutputProofReceiptStoreForTests({
      load: async () => structuredClone(stored),
      save,
    });

    const upgraded = await loadOrBackfillSolStructuredOutputProofReceipt();
    expect(upgraded?.structuredOutputPipelineProofPassed).toBe(true);
    expect(upgraded?.configurationFingerprint)
      .toBe(fingerprintSolStructuredOutputProofConfiguration(upgraded!.configuration));
    expect(upgraded?.configurationFingerprint).not.toBe(legacy.configurationFingerprint);
    expect(save).toHaveBeenCalledOnce();
    expect(provider).not.toHaveBeenCalled();

    const reused = await loadOrBackfillSolStructuredOutputProofReceipt();
    expect(reused?.configurationFingerprint).toBe(upgraded?.configurationFingerprint);
    expect(save).toHaveBeenCalledOnce();
    expect(provider).not.toHaveBeenCalled();
  });

  it('persists one backfill and reuses it after process-local Sol state resets', async () => {
    let stored: SolStructuredOutputProofReceipt | null = null;
    let writes = 0;
    setSolStructuredOutputProofReceiptStoreForTests({
      load: async () => stored ? structuredClone(stored) : null,
      save: async (receipt) => {
        writes += 1;
        stored = structuredClone(receipt);
      },
    });
    process.env.OPENAI_API_KEY = 'server-test-key';

    const first = await loadOrBackfillSolStructuredOutputProofReceipt();
    expect(first?.structuredOutputPipelineProofPassed).toBe(true);
    expect(writes).toBe(1);

    await resetSolDesignBenchForTests();
    const readiness = await getSolDesignBenchProviderReadiness({
      referenceImageAvailable: true,
      imageInputAttachmentPathValid: true,
    });
    expect(readiness).toMatchObject({
      state: 'READY',
      tinyLiveSchemaSmokePassed: true,
      largeOutputStressPassed: true,
      structuredOutputPipelineProofPassed: true,
      structuredOutputProofPersistence: 'SUPABASE',
      structuredOutputProofReceipt: {
        configurationFingerprint: first?.configurationFingerprint,
        provenance: 'F6R1_VERIFIED_EVIDENCE_BACKFILL',
      },
    });
    expect(writes).toBe(1);
  });

  it('safely upgrades the prior nested-only F6R2 receipt without a provider run', async () => {
    const nestedOnly = structuredClone(
      buildF6R1ProofReceiptBackfill('2026-09-15T21:40:00.000Z')!,
    ) as Record<string, unknown>;
    for (const key of [
      'proofVersion',
      'apiBuild',
      'apiCommit',
      'promptVersion',
      'model',
      'reasoning',
      'maxOutputTokens',
      'tinySchemaSmokePass',
      'largeOutputStressPass',
      'largeOutputCharacters',
      'largeOutputTokens',
      'largeOutputTruncated',
      'schemaValidationPass',
      'manualJsonParseUsed',
      'outputTextUsedAsPrimaryResult',
      'completedAt',
    ]) delete nestedOnly[key];
    let stored = nestedOnly as unknown as SolStructuredOutputProofReceipt;
    const save = vi.fn(async (receipt: SolStructuredOutputProofReceipt) => {
      stored = structuredClone(receipt);
    });
    setSolStructuredOutputProofReceiptStoreForTests({
      load: async () => stored,
      save,
    });
    const upgraded = await loadOrBackfillSolStructuredOutputProofReceipt();
    expect(upgraded).toMatchObject({
      proofVersion: 'sol-structured-output-proof-v6-f6r1',
      apiBuild: '6728d538b2dc5898ccc4667039a47463ecee47b7',
      completedAt: '2026-09-15T21:40:00.000Z',
      structuredOutputPipelineProofPassed: true,
    });
    expect(save).toHaveBeenCalledOnce();
  });

  it('reports no-reference provider readiness READY and exposes the current deploy separately', async () => {
    let stored: SolStructuredOutputProofReceipt | null = null;
    setSolStructuredOutputProofReceiptStoreForTests({
      load: async () => stored,
      save: async (receipt) => {
        stored = structuredClone(receipt);
      },
    });
    process.env.OPENAI_API_KEY = 'server-test-key';
    process.env.RAILWAY_GIT_COMMIT_SHA = 'f6r2-storage-ui-commit';
    const provider = vi.fn();
    setSolDesignBenchExecutorForTests(provider as never);

    const readiness = await getSolDesignBenchProviderReadiness();
    expect(readiness).toMatchObject({
      state: 'READY',
      referenceImageAvailable: false,
      imageInputAttachmentPathValid: false,
      structuredOutputPipelineProofPassed: true,
      currentRailwayCommit: 'f6r2-storage-ui-commit',
    });
    expect(readiness.blockingReasons).not.toContain('REFERENCE_IMAGE_UNAVAILABLE');
    expect(readiness.blockingReasons).not.toContain('IMAGE_INPUT_ATTACHMENT_PATH_INVALID');
    expect(readiness.structuredOutputProofReceipt?.apiBuild)
      .toBe('6728d538b2dc5898ccc4667039a47463ecee47b7');
    expect(provider).not.toHaveBeenCalled();
  });

  it('renders separate readiness labels and gates start on both proof and selected golden', async () => {
    const source = await readFile('src/site00/pages/SolDesignBenchmarkPage.tsx', 'utf8');
    expect(source).toContain('<small>PROVIDER READINESS</small>');
    expect(source).toContain("<small>STRICT PIPELINE PROOF</small>");
    expect(source).toContain('<small>FOUNDER GOLDEN RETRY</small>');
    expect(canStartSolFounderGolden({
      referenceSelected: false,
      providerReady: true,
      structuredPipelineReady: true,
      isInspecting: false,
      isUploading: false,
    })).toBe(false);
    expect(canStartSolFounderGolden({
      referenceSelected: true,
      providerReady: true,
      structuredPipelineReady: true,
      isInspecting: false,
      isUploading: false,
    })).toBe(true);
  });

  it('clears stale failed local proof state but preserves completed valid results', () => {
    const staleFailure = {
      status: 'FAILED',
      providerReadinessReceipt: { structuredOutputPipelineProofPassed: false },
    } as SolDesignBenchRun;
    const completed = {
      status: 'COMPLETE',
      providerReadinessReceipt: { structuredOutputPipelineProofPassed: false },
      result: {},
    } as SolDesignBenchRun;
    expect(shouldClearStaleSolFailure(staleFailure, true)).toBe(true);
    expect(shouldClearStaleSolFailure(staleFailure, false)).toBe(false);
    expect(shouldClearStaleSolFailure(completed, true)).toBe(false);
  });

  it('rejects a stored receipt after configuration drift instead of trusting its booleans', () => {
    const receipt = buildF6R1ProofReceiptBackfill(new Date(0).toISOString())!;
    const changed = {
      ...getCurrentSolStructuredOutputProofConfiguration(),
      maxOutputTokens: 16_000,
    } as SolStructuredOutputProofConfiguration;
    expect(isSolStructuredOutputProofReceiptCompatible(receipt, changed)).toBe(false);
  });

  it('blocks readiness when durable persistence is unavailable', async () => {
    setSolStructuredOutputProofReceiptStoreForTests({
      load: async () => {
        throw new Error('database unavailable');
      },
      save: async () => undefined,
    });
    process.env.OPENAI_API_KEY = 'server-test-key';
    const readiness = await getSolDesignBenchProviderReadiness({
      referenceImageAvailable: true,
      imageInputAttachmentPathValid: true,
    });
    expect(readiness).toMatchObject({
      state: 'BLOCKED',
      tinyLiveSchemaSmokePassed: false,
      largeOutputStressPassed: false,
      structuredOutputPipelineProofPassed: false,
      structuredOutputProofReceipt: null,
      structuredOutputProofPersistence: 'UNAVAILABLE',
    });
    expect(readiness.blockingReasons).toContain('STRUCTURED_OUTPUT_PIPELINE_PROOF_REQUIRED');
  });
});
