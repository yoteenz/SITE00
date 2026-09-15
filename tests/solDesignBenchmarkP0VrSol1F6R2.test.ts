import { afterEach, describe, expect, it } from 'vitest';
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
} from '../api/_lib/site00SolDesignBench/service';
import type {
  SolStructuredOutputProofConfiguration,
  SolStructuredOutputProofReceipt,
} from '../shared/site00-sol-design-bench/modelContract';

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
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
