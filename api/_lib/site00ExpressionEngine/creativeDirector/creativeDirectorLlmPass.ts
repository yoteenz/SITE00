/**
 * C1.1 — Optional LLM enhancement (Anthropic text/reasoning — no image/video).
 */

import type { CulturalRead, MinimalCreativeBrief } from '../../../../shared/site00-expression-engine/creative-director/types.js';

export async function tryLlmEnhanceCulturalRead(
  brief: MinimalCreativeBrief,
  base: CulturalRead,
): Promise<{ culturalRead: CulturalRead; providerUsed: string; requestCount: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR === '1') {
    return { culturalRead: base, providerUsed: 'DETERMINISTIC_STRUCTURED_PASSES', requestCount: 0 };
  }

  try {
    const { callAnthropicForCompletion } = await import(
      '../../site00Evolve/creativeDirection/creativeIntelligence/anthropicCompletion.js'
    );
    const { text } = await callAnthropicForCompletion(
      'You are a cultural strategist. Return JSON only with fields: underlyingTension, uncomfortableTruth, whyItMattersNow.',
      { brief: { subject: brief.subject, thesis: brief.thesis }, base },
      { maxTokens: 800 },
    );
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as Partial<CulturalRead>;
    return {
      culturalRead: {
        ...base,
        underlyingTension: parsed.underlyingTension ?? base.underlyingTension,
        uncomfortableTruth: parsed.uncomfortableTruth ?? base.uncomfortableTruth,
        whyItMattersNow: parsed.whyItMattersNow ?? base.whyItMattersNow,
      },
      providerUsed: 'ANTHROPIC_TEXT',
      requestCount: 1,
    };
  } catch {
    return { culturalRead: base, providerUsed: 'DETERMINISTIC_STRUCTURED_PASSES', requestCount: 0 };
  }
}
