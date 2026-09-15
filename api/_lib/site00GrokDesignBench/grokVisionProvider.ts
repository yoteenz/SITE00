import { jsonrepair } from 'jsonrepair';
import { GROK_TWIN_TEST_A_PROVIDER, GROK_TWIN_TEST_A_PROVIDER_MODEL_DEFAULT } from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { assertFigmaStylePackage } from '../../../shared/site00-design-bench/grokTwinTestA/packageGuard.js';
import type { FigmaStyleInterfaceTranslationPackage } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { buildGrokVisualTranslationUserPrompt, GROK_VISUAL_TRANSLATION_SYSTEM } from './prompt.js';

export interface GrokVisionTranslateInput {
  imageBytes: Buffer;
  mime: string;
  filename: string;
  width: number;
  height: number;
  sha256: string;
}

export interface GrokVisionTranslateResult {
  package: FigmaStyleInterfaceTranslationPackage;
  provider: 'xai';
  providerModel: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costAmount: number | null;
  costReported: boolean;
}

const FORBIDDEN_PROVIDER_ENV = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'FAL_KEY'] as const;

export function grokDesignBenchProviderModel(): string {
  return process.env.SITE00_GROK_VISION_MODEL?.trim() || GROK_TWIN_TEST_A_PROVIDER_MODEL_DEFAULT;
}

export function grokDesignBenchApiKey(): string | null {
  const key = process.env.XAI_API_KEY?.trim();
  return key || null;
}

export function auditGrokDesignBenchProvider(): {
  provider: 'xai';
  model: typeof GROK_TWIN_TEST_A_PROVIDER;
  providerModel: string;
  configured: boolean;
  alternateProviderFallback: false;
  composerInvoked: false;
} {
  return {
    provider: GROK_TWIN_TEST_A_PROVIDER,
    model: 'GROK',
    providerModel: grokDesignBenchProviderModel(),
    configured: Boolean(grokDesignBenchApiKey()) || isGrokTestHarnessEnabled(),
    alternateProviderFallback: false,
    composerInvoked: false,
  };
}

export function isGrokTestHarnessEnabled(): boolean {
  return process.env.VITEST === 'true' || process.env.SITE00_GROK_DESIGN_BENCH_TEST_HARNESS === '1';
}

export function assertGrokOnlyProvider(): void {
  if (process.env.SITE00_GROK_DESIGN_BENCH_ALLOW_ALT === '1') {
    throw new Error('ALTERNATE_PROVIDER_FALLBACK_FORBIDDEN');
  }
  void FORBIDDEN_PROVIDER_ENV;
}

export async function translateInterfaceWithGrok(
  input: GrokVisionTranslateInput,
): Promise<GrokVisionTranslateResult> {
  assertGrokOnlyProvider();
  if (isGrokTestHarnessEnabled() && !grokDesignBenchApiKey()) {
    const { buildGrokTestHarnessPackage } = await import('./testHarness.js');
    return {
      package: assertFigmaStylePackage(buildGrokTestHarnessPackage(input)),
      provider: 'xai',
      providerModel: 'grok-test-harness',
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      costAmount: null,
      costReported: false,
    };
  }

  const apiKey = grokDesignBenchApiKey();
  if (!apiKey) {
    throw new Error('XAI_API_KEY_MISSING: set XAI_API_KEY on the Railway API service. Grok is the only provider; no fallback.');
  }

  const providerModel = grokDesignBenchProviderModel();
  const dataUrl = `data:${input.mime};base64,${input.imageBytes.toString('base64')}`;
  const endpoint = process.env.SITE00_GROK_API_BASE?.replace(/\/$/, '') || 'https://api.x.ai/v1';

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: providerModel,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: GROK_VISUAL_TRANSLATION_SYSTEM },
        {
          role: 'user',
          content: [
            { type: 'text', text: buildGrokVisualTranslationUserPrompt(input) },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`GROK_PROVIDER_HTTP_${response.status}: ${detail.slice(0, 400)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    usage_cost?: { total_cost?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('GROK_PROVIDER_EMPTY_RESPONSE');
  }

  const parsed = parseGrokPackageJson(content);
  const pkg = assertFigmaStylePackage(parsed);
  const promptTokens = payload.usage?.prompt_tokens ?? null;
  const completionTokens = payload.usage?.completion_tokens ?? null;
  const totalTokens = payload.usage?.total_tokens ?? null;
  const costAmount = typeof payload.usage_cost?.total_cost === 'number' ? payload.usage_cost.total_cost : null;

  return {
    package: pkg,
    provider: 'xai',
    providerModel,
    promptTokens,
    completionTokens,
    totalTokens,
    costAmount,
    costReported: costAmount != null,
  };
}

export function parseGrokPackageJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(fenced);
  } catch {
    return JSON.parse(jsonrepair(fenced));
  }
}
