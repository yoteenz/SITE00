import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StartSolDesignBenchRequest } from '../shared/site00-sol-design-bench/contracts';
import {
  assertSolStructuredOutputRequest,
  buildSolOpenAiRequestBody,
  executeSolDesignAnalysis,
} from '../api/_lib/site00SolDesignBench/provider';
import {
  getSolDesignBenchRun,
  resetSolDesignBenchForTests,
  retrySolDesignBenchRun,
  setSolDesignBenchExecutorForTests,
  startSolDesignBenchRun,
} from '../api/_lib/site00SolDesignBench/service';

async function fixture() {
  const bytes = await sharp({
    create: { width: 2, height: 2, channels: 4, background: '#fff' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const request: StartSolDesignBenchRequest = {
    action: 'START_SOL_TEST',
    reference: {
      filename: 'safe-smoke-fixture.png',
      mime: 'image/png',
      bytes: bytes.length,
      width: 2,
      height: 2,
      sha256,
      dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
    },
  };
  return {
    request,
    authority: {
      authorityType: 'SolDesignBenchReferenceAuthority' as const,
      runId: 'sol_f2',
      storedFile: '/server/reference.png',
      filename: request.reference.filename,
      sha256,
      width: 2,
      height: 2,
      bytes: bytes.length,
      mime: 'image/png' as const,
      timestamp: new Date(0).toISOString(),
    },
  };
}

async function waitForFailure(runId: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const run = await getSolDesignBenchRun(runId);
    if (run?.status === 'FAILED') return run;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('run did not fail in time');
}

afterEach(async () => {
  delete process.env.OPENAI_API_KEY;
  vi.unstubAllGlobals();
  setSolDesignBenchExecutorForTests(null);
  await resetSolDesignBenchForTests();
});

describe('P0.VR.DESIGNBENCH.SOL1F2 Responses JSON request fix', () => {
  it('places a literal JSON instruction in the actual user message', async () => {
    const { request, authority } = await fixture();
    const body = buildSolOpenAiRequestBody({ authority, dataUrl: request.reference.dataUrl });
    const userText = body.input[0].content
      .filter((part) => part.type === 'input_text')
      .map((part) => part.text)
      .join(' ');
    expect(userText).toContain('valid JSON');
    expect(body.text.format.type).toBe('json_schema');
    expect(body.text.format.strict).toBe(true);
    expect(body.model).toBe('gpt-5.6-sol');
    expect(body.reasoning).toEqual({ effort: 'high' });
    expect(body.input[0].content.some((part) => part.type === 'input_image')).toBe(true);
    expect(body.tools).toEqual([]);
  });

  it('catches a missing user JSON instruction before provider dispatch', async () => {
    const { request, authority } = await fixture();
    const body = buildSolOpenAiRequestBody({ authority, dataUrl: request.reference.dataUrl });
    const invalid = structuredClone(body) as unknown as {
      input: Array<{ content: Array<{ type: string; text?: string }> }>;
    };
    invalid.input[0].content
      .filter((part) => part.type === 'input_text')
      .forEach((part) => { part.text = 'Return the required package.'; });
    expect(() => assertSolStructuredOutputRequest(
      invalid as unknown as ReturnType<typeof buildSolOpenAiRequestBody>,
    )).toThrow('SOL_STRUCTURED_OUTPUT_REQUEST_INVALID:JSON_INSTRUCTION_MISSING');
  });

  it('classifies the observed OpenAI 400 as request-invalid, not binding failure', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request, authority } = await fixture();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      error: {
        message: "Response input messages must contain the word 'json' in some form to use 'text.format' of type 'json_object'.",
      },
    }), { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(executeSolDesignAnalysis({
      runId: authority.runId,
      authority,
      dataUrl: request.reference.dataUrl,
    })).rejects.toThrow('OPENAI_RESPONSES_REQUEST_INVALID:OPENAI_400');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retry creates a new run using the frozen SHA while retaining the failed run', async () => {
    process.env.OPENAI_API_KEY = 'server-test-key';
    const { request } = await fixture();
    setSolDesignBenchExecutorForTests(async () => {
      throw new Error('SOL_RUN_FAILED_TEST');
    });
    const first = await startSolDesignBenchRun(request);
    const failed = await waitForFailure(first.runId);
    const retry = await retrySolDesignBenchRun(failed.runId);
    expect(retry.runId).not.toBe(failed.runId);
    expect(retry.retryOfRunId).toBe(failed.runId);
    expect(retry.authority.sha256).toBe(failed.authority.sha256);
    expect(retry.authority.filename).toBe(failed.authority.filename);
    const preserved = await getSolDesignBenchRun(failed.runId);
    expect(preserved?.status).toBe('FAILED');
    expect(preserved?.retryRunIds).toContain(retry.runId);
  });

  it('exposes retry UX without changing benchmark/Twin routing contracts', async () => {
    const ui = await import('node:fs/promises').then((fs) =>
      fs.readFile('src/site00/pages/SolDesignBenchmarkPage.tsx', 'utf8'));
    expect(ui).toContain('RETRY SOL TEST');
    expect(ui).toContain("body: JSON.stringify({ action: 'RETRY_SOL_TEST', sourceRunId: run.runId })");
    const routes = await import('node:fs/promises').then((fs) =>
      fs.readFile('src/site00/config/routes.ts', 'utf8'));
    expect(routes).toContain("projectDesignTwinTestB: '/projects/:projectSlug/design/twin-testB'");
    expect(routes).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(routes).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
  });
});
