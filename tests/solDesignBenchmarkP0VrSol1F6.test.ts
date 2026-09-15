import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  buildSolOpenAiRequestBody,
  SOL_SCHEMA_NAME,
} from '../api/_lib/site00SolDesignBench/provider';
import {
  SolDesignBenchOutputBudget,
  SolDesignBenchPriorProofAttestation,
} from '../shared/site00-sol-design-bench/modelContract';

async function requestInput() {
  const bytes = await sharp({
    create: { width: 32, height: 32, channels: 4, background: '#fff' },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return {
    authority: {
      authorityType: 'SolDesignBenchReferenceAuthority' as const,
      runId: 'sol_f6',
      storedFile: '/server/f6.png',
      filename: 'f6.png',
      sha256,
      width: 32,
      height: 32,
      bytes: bytes.length,
      mime: 'image/png' as const,
      timestamp: new Date(0).toISOString(),
    },
    dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
  };
}

describe('P0.VR.DESIGNBENCH.SOL1F6 output capacity', () => {
  it('uses one bounded 32K budget for founder and stress requests', async () => {
    const input = await requestInput();
    const founder = buildSolOpenAiRequestBody(input);
    const stress = buildSolOpenAiRequestBody({
      ...input,
      proofMode: 'LARGE_OUTPUT_STRESS',
    });
    expect(SolDesignBenchOutputBudget).toEqual({
      contractType: 'SolDesignBenchOutputBudget',
      maxOutputTokens: 32_000,
      appliesToStressProof: true,
      appliesToFounderRun: true,
      model: 'gpt-5.6-sol',
      schemaVersion: 'figma-interface-translation-v1',
    });
    expect(founder.max_output_tokens).toBe(32_000);
    expect(stress.max_output_tokens).toBe(founder.max_output_tokens);
  });

  it('preserves strict parsed response and multimodal model binding', async () => {
    const body = buildSolOpenAiRequestBody(await requestInput());
    expect(body).toMatchObject({
      model: 'gpt-5.6-sol',
      reasoning: { effort: 'high' },
      text: {
        format: {
          type: 'json_schema',
          name: SOL_SCHEMA_NAME,
          strict: true,
        },
      },
    });
    expect(body.input[0].content.some((part) => part.type === 'input_image')).toBe(true);
  });

  it('uses representative structure instead of artificial stress padding', async () => {
    const body = buildSolOpenAiRequestBody({
      ...await requestInput(),
      proofMode: 'LARGE_OUTPUT_STRESS',
    });
    const instruction = body.input[0].content.find((part) => part.type === 'input_text')?.text ?? '';
    expect(instruction).toContain('fully populating components, tokens, hierarchy, assets, and handoff arrays');
    expect(instruction).toContain('without duplicate prose');
    expect(instruction).not.toMatch(/\b(filler|lorem ipsum|padding characters)\b/i);
    expect(SolDesignBenchPriorProofAttestation).toMatchObject({
      tinyLiveSchemaSmokePassed: true,
      schemaValidationPass: true,
      parserPath: 'openai.responses.parse.output_parsed',
    });
  });
});
