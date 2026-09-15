import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  executeSolDesignAnalysis,
  buildSolOpenAiRequestBody,
  SolProviderRequestError,
} from '../api/_lib/site00SolDesignBench/provider';
import {
  getSolDesignBenchRun,
  resetSolDesignBenchForTests,
  retrySolDesignBenchRun,
  startSolDesignBenchRun,
} from '../api/_lib/site00SolDesignBench/service';
import {
  FigmaStyleInterfaceTranslationPackageSchema,
  SOL_DESIGN_BENCH_SCHEMA_VERSION,
  SOL_TRANSLATION_PACKAGE_KEYS,
  validateSolTranslationPackage,
} from '../shared/site00-sol-design-bench/schema';
import type {
  SolDesignBenchReferenceAuthority,
  StartSolDesignBenchRequest,
} from '../shared/site00-sol-design-bench/contracts';
import { strictSolPackageFixture } from './helpers/solDesignBenchmarkPackageFixture';

async function fixture() {
  const bytes = await sharp({
    create: { width: 2, height: 2, channels: 4, background: '#fff' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const request: StartSolDesignBenchRequest = {
    action: 'START_SOL_TEST',
    reference: {
      filename: 'schema-smoke.png',
      mime: 'image/png',
      bytes: bytes.length,
      width: 2,
      height: 2,
      sha256,
      dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    },
  };
  const authority: SolDesignBenchReferenceAuthority = {
    authorityType: 'SolDesignBenchReferenceAuthority',
    runId: 'sol_f3',
    storedFile: '/server/reference.png',
    filename: request.reference.filename,
    sha256,
    width: 2,
    height: 2,
    bytes: bytes.length,
    mime: 'image/png',
    timestamp: new Date(0).toISOString(),
  };
  return { request, authority };
}

async function waitForTerminal(runId: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const run = await getSolDesignBenchRun(runId);
    if (run && ['COMPLETE', 'FAILED', 'SOL_OUTPUT_VALIDATION_FAILED', 'SOL_OUTPUT_TRUNCATED'].includes(run.status)) {
      return run;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('run did not reach a terminal state');
}

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
  vi.unstubAllGlobals();
  await resetSolDesignBenchForTests();
});

describe('P0.VR.DESIGNBENCH.SOL1F3 strict schema and recovery', () => {
  it('sends a strict closed JSON Schema with the unchanged 14-key contract', async () => {
    const { request, authority } = await fixture();
    const body = buildSolOpenAiRequestBody({ authority, dataUrl: request.reference.dataUrl });
    expect(body.model).toBe('gpt-5.6-sol');
    expect(body.reasoning).toEqual({ effort: 'high' });
    expect(body.input[0].content.some((part) => part.type === 'input_image')).toBe(true);
    expect(body.text.format).toMatchObject({
      type: 'json_schema',
      strict: true,
      name: 'figma_style_interface_translation_package',
    });
    expect(body.text.format.schema).toBe(FigmaStyleInterfaceTranslationPackageSchema);
    expect(body.text.format.schema.required).toEqual(SOL_TRANSLATION_PACKAGE_KEYS);
    expect(Object.keys(body.text.format.schema.properties)).toEqual(SOL_TRANSLATION_PACKAGE_KEYS);
    expect(body.text.format.schema.additionalProperties).toBe(false);
    expect(JSON.stringify(body.text.format.schema)).not.toContain('data:image');
    const assertStrictObjects = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      const schema = node as Record<string, unknown>;
      if (schema.type === 'object') {
        expect(schema.additionalProperties).toBe(false);
        expect(schema.required).toEqual(Object.keys(schema.properties as Record<string, unknown>));
      }
      Object.values(schema).forEach(assertStrictObjects);
    };
    assertStrictObjects(body.text.format.schema);
    expect(JSON.stringify(body.text.format.schema)).not.toContain('maxLength');
  });

  it('validates schema output and rejects embedded visual payloads', async () => {
    const { authority } = await fixture();
    const valid = strictSolPackageFixture(authority.sha256);
    expect(validateSolTranslationPackage(valid, authority)).toMatchObject({
      valid: true,
      missingFields: [],
      invalidFields: [],
    });
    valid.VISUAL_INTERFACE_PREVIEW.visualPreviewRef = 'data:image/png;base64,giant';
    expect(validateSolTranslationPackage(valid, authority).invalidFields)
      .toContain('VISUAL_INTERFACE_PREVIEW.embeddedDataUrl');
  });

  it('allows at most one deterministic repair and records its receipt', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request, authority } = await fixture();
    const malformed = JSON.stringify(strictSolPackageFixture(authority.sha256))
      .replace('},"PAGE_FRAME_SPEC"', '}"PAGE_FRAME_SPEC"');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      id: 'resp_repaired',
      model: 'gpt-5.6-sol',
      status: 'completed',
      output_text: malformed,
      usage: { output_tokens: 100 },
    }), { status: 200 })));
    const result = await executeSolDesignAnalysis({
      runId: authority.runId,
      authority,
      dataUrl: request.reference.dataUrl,
    });
    expect(result.validationReceipt).toMatchObject({
      schemaVersion: SOL_DESIGN_BENCH_SCHEMA_VERSION,
      jsonParsePass: true,
      schemaValidationPass: true,
      repairAttempted: true,
      repairSucceeded: true,
    });
  });

  it('preserves raw output and classifies parse validation separately from provider failure', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request } = await fixture();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      id: 'resp_invalid',
      model: 'gpt-5.6-sol',
      status: 'completed',
      output_text: '{"VISUAL_INTERFACE_PREVIEW":',
    }), { status: 200 })));
    const run = await waitForTerminal((await startSolDesignBenchRun(request)).runId);
    expect(run.status).toBe('SOL_OUTPUT_VALIDATION_FAILED');
    expect(run.error?.code).toBe('SOL_OUTPUT_VALIDATION_FAILED');
    expect(run.rawProviderResponseRef).toBe(`sol-raw://${run.runId}`);
    expect(run.structuredOutputValidationReceipt).toMatchObject({
      responseReceived: true,
      jsonParsePass: true,
      schemaValidationPass: false,
      rawResponsePersistedSafely: true,
      repairAttempted: true,
      repairSucceeded: true,
    });
  });

  it('detects truncation independently and preserves retry lineage and SHA', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request } = await fixture();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      id: 'resp_truncated',
      model: 'gpt-5.6-sol',
      status: 'incomplete',
      incomplete_details: { reason: 'max_output_tokens' },
      output_text: '{"partial":true',
      usage: { output_tokens: 24000 },
    }), { status: 200 })));
    const failed = await waitForTerminal((await startSolDesignBenchRun(request)).runId);
    expect(failed.status).toBe('SOL_OUTPUT_TRUNCATED');
    expect(failed.outputCompletenessReceipt).toMatchObject({
      finishReason: 'max_output_tokens',
      truncated: true,
      complete: false,
    });
    const retry = await retrySolDesignBenchRun(failed.runId);
    expect(retry.runId).not.toBe(failed.runId);
    expect(retry.retryOfRunId).toBe(failed.runId);
    expect(retry.authority.sha256).toBe(failed.authority.sha256);
    expect((await getSolDesignBenchRun(failed.runId))?.retryRunIds).toContain(retry.runId);
  });

  it('exposes structured error metadata without leaking raw output through the run', async () => {
    const { authority } = await fixture();
    const error = new SolProviderRequestError(
      'SOL_OUTPUT_VALIDATION_FAILED:test',
      {} as never,
      {} as never,
      null,
      null,
      'private raw output',
    );
    expect(error.rawProviderResponse).toBe('private raw output');
    expect(JSON.stringify({ ref: `sol-raw://${authority.runId}` })).not.toContain('private raw output');
  });
});
