import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type {
  FigmaStyleInterfaceTranslationPackage,
  SolDesignBenchReferenceAuthority,
  StartSolDesignBenchRequest,
} from '../shared/site00-sol-design-bench/contracts';
import type { SolProviderResult } from '../api/_lib/site00SolDesignBench/provider';
import {
  SOL_SCHEMA_NAME,
  assertSolLegacyParserSuccessPathFirewall,
  buildSolBenchmarkInputReceipt,
  buildSolOpenAiRequestBody,
} from '../api/_lib/site00SolDesignBench/provider';
import {
  getSolDesignBenchProviderReadiness,
  getSolDesignBenchRun,
  resetSolDesignBenchForTests,
  setSolDesignBenchExecutorForTests,
  setSolStructuredOutputProofForTests,
  startSolDesignBenchRun,
  startSolStructuredOutputProof,
} from '../api/_lib/site00SolDesignBench/service';
import { strictSolPackageFixture } from './helpers/solDesignBenchmarkPackageFixture';

async function referenceFixture(): Promise<StartSolDesignBenchRequest> {
  const bytes = await sharp({
    create: { width: 32, height: 32, channels: 4, background: '#ffffff' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return {
    action: 'START_SOL_TEST',
    reference: {
      filename: 'f5-fixture.png',
      mime: 'image/png',
      bytes: bytes.length,
      width: 32,
      height: 32,
      sha256,
      dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    },
  };
}

function providerResult(
  runId: string,
  authority: SolDesignBenchReferenceAuthority,
  outputCharacters = 4_000,
): SolProviderResult {
  const packageValue = {
    ...strictSolPackageFixture(authority.sha256),
    packageType: 'FigmaStyleInterfaceTranslationPackage',
  } as FigmaStyleInterfaceTranslationPackage;
  return {
    package: packageValue,
    cost: null,
    dispatchReceipt: {
      receiptType: 'SolBenchmarkProviderDispatchReceipt',
      runId,
      provider: 'openai',
      modelId: 'gpt-5.6-sol',
      reasoningEffort: 'high',
      imageInputAttached: true,
      structuredOutputRequested: true,
      structuredOutputMode: 'json_schema',
      schemaName: SOL_SCHEMA_NAME,
      strict: true,
      schemaVersion: 'figma-interface-translation-v1',
      jsonInstructionPresent: true,
      requestedModelId: 'gpt-5.6-sol',
      actualDispatchedModelId: 'gpt-5.6-sol',
      requestedReasoningEffort: 'high',
      fallbackAllowed: false,
      webSearchEnabled: false,
      endpoint: 'https://api.openai.com/v1/responses',
      providerResponseId: 'resp_f5',
      dispatchedAt: new Date().toISOString(),
    },
    inputReceipt: buildSolBenchmarkInputReceipt({ runId, authority }),
    runtimeReceipt: {
      receiptType: 'SolStructuredOutputRuntimeReceipt',
      runId,
      liveApiBuild: 'test-build',
      provider: 'openai',
      model: 'gpt-5.6-sol',
      reasoning: 'high',
      structuredOutputMode: 'json_schema',
      schemaName: SOL_SCHEMA_NAME,
      strict: true,
      imageInputAttached: true,
      providerResponseType: 'openai.responses.parse.output_parsed',
      providerResponseSuccess: true,
      structuredResultDirect: true,
      manualJsonParseUsed: false,
      outputTextUsedAsPrimaryResult: false,
      schemaValidationPass: true,
    },
    validationReceipt: {
      receiptType: 'SolStructuredOutputValidationReceipt',
      runId,
      model: 'gpt-5.6-sol',
      schemaVersion: 'figma-interface-translation-v1',
      responseReceived: true,
      jsonParsePass: true,
      schemaValidationPass: true,
      missingFields: [],
      invalidFields: [],
      rawResponsePersistedSafely: false,
      recoverable: false,
      repairAttempted: false,
      repairSucceeded: false,
    },
    completenessReceipt: {
      receiptType: 'SolOutputCompletenessReceipt',
      runId,
      finishReason: 'completed',
      outputCharacters,
      outputTokens: Math.ceil(outputCharacters / 4),
      truncated: false,
      complete: true,
    },
    rawProviderResponse: 'x'.repeat(outputCharacters),
  };
}

async function waitForTerminal(runId: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const run = await getSolDesignBenchRun(runId);
    if (run && ['COMPLETE', 'FAILED', 'SOL_OUTPUT_VALIDATION_FAILED', 'SOL_OUTPUT_TRUNCATED'].includes(run.status)) {
      return run;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('run did not reach terminal state');
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'server-test-key';
  process.env.RAILWAY_GIT_COMMIT_SHA = 'f5-test-commit';
  setSolStructuredOutputProofForTests({
    tinyLiveSchemaSmokePassed: false,
    largeOutputStressPassed: false,
  });
});

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.RAILWAY_GIT_COMMIT_SHA;
  setSolDesignBenchExecutorForTests(null);
  await resetSolDesignBenchForTests();
});

describe('P0.VR.DESIGNBENCH.SOL1F5 parsed success path and proof gate', () => {
  it('keeps exact strict schema, model, reasoning and image request binding', async () => {
    const request = await referenceFixture();
    const authority = {
      authorityType: 'SolDesignBenchReferenceAuthority' as const,
      runId: 'sol_f5',
      storedFile: '/server/f5.png',
      filename: request.reference.filename,
      sha256: request.reference.sha256,
      width: 32,
      height: 32,
      bytes: request.reference.bytes,
      mime: 'image/png' as const,
      timestamp: new Date(0).toISOString(),
    };
    const body = buildSolOpenAiRequestBody({ authority, dataUrl: request.reference.dataUrl });
    expect(body).toMatchObject({
      model: 'gpt-5.6-sol',
      reasoning: { effort: 'high' },
      text: { format: { type: 'json_schema', name: SOL_SCHEMA_NAME, strict: true } },
    });
    expect(body.input[0].content.some((part) => part.type === 'input_image')).toBe(true);
  });

  it('removes application JSON.parse and primary output_text from provider success code', async () => {
    const source = await readFile('api/_lib/site00SolDesignBench/provider.ts', 'utf8');
    expect(source).not.toContain('JSON.parse(');
    expect(source).not.toContain('body.output_text');
    expect(source).not.toContain('extractJson(');
    expect(source).toContain('body.output_parsed');
    expect(source).toContain('DIAGNOSTIC_ONLY');
  });

  it('firewalls any regression to manual parsing or primary output text', () => {
    const valid = providerResult(
      'sol_firewall',
      {
        authorityType: 'SolDesignBenchReferenceAuthority',
        runId: 'sol_firewall',
        storedFile: '/server/f5.png',
        filename: 'f5.png',
        sha256: 'a'.repeat(64),
        width: 32,
        height: 32,
        bytes: 1,
        mime: 'image/png',
        timestamp: new Date(0).toISOString(),
      },
    ).runtimeReceipt;
    expect(() => assertSolLegacyParserSuccessPathFirewall(valid)).not.toThrow();
    expect(() => assertSolLegacyParserSuccessPathFirewall({
      ...valid,
      manualJsonParseUsed: true,
    } as never)).toThrow('SOL_LEGACY_JSON_PARSE_PATH_ACTIVE');
    expect(() => assertSolLegacyParserSuccessPathFirewall({
      ...valid,
      outputTextUsedAsPrimaryResult: true,
    } as never)).toThrow('SOL_LEGACY_JSON_PARSE_PATH_ACTIVE');
  });

  it('blocks founder starts until tiny and large production proofs pass', async () => {
    const request = await referenceFixture();
    await expect(startSolDesignBenchRun(request))
      .rejects.toThrow('STRUCTURED_OUTPUT_PIPELINE_PROOF_REQUIRED');

    setSolDesignBenchExecutorForTests(async ({ runId, authority, proofMode }) =>
      providerResult(runId, authority, proofMode === 'LARGE_OUTPUT_STRESS' ? 60_000 : 4_000));

    const tiny = await waitForTerminal(
      (await startSolStructuredOutputProof('TINY_LIVE_SCHEMA_SMOKE')).runId,
    );
    expect(tiny).toMatchObject({ status: 'COMPLETE', proofPassed: true });
    expect((await getSolDesignBenchProviderReadiness()).structuredOutputPipelineProofPassed)
      .toBe(false);

    const large = await waitForTerminal(
      (await startSolStructuredOutputProof('LARGE_OUTPUT_STRESS')).runId,
    );
    expect(large).toMatchObject({
      status: 'COMPLETE',
      proofPassed: true,
      outputCompletenessReceipt: { outputCharacters: 60_000 },
      structuredOutputRuntimeReceipt: {
        structuredResultDirect: true,
        manualJsonParseUsed: false,
        outputTextUsedAsPrimaryResult: false,
        schemaValidationPass: true,
      },
    });
    expect((await getSolDesignBenchProviderReadiness()).structuredOutputPipelineProofPassed)
      .toBe(true);

    const founderRun = await startSolDesignBenchRun(request);
    expect(founderRun.authority.sha256).toBe(request.reference.sha256);
  });
});
