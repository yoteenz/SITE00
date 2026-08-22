/**
 * Anthropic helper for targeted direction field completion — server-side only.
 */

import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
} from './config.js';
import type { ProviderRequestUsage } from './types.js';

type AnthropicMessageResponse = {
  content: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
};

export async function callAnthropicForCompletion(
  system: string,
  userPayload: unknown,
): Promise<{ text: string; usage: ProviderRequestUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: JSON.stringify(userPayload) }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic completion failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as AnthropicMessageResponse;
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';
  return {
    text,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}
