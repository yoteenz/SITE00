/**
 * P0.VR.OPUS-NATIVE1 — Phase 5 + 16 + 21: the Anthropic transport.
 *
 * Two implementations behind one interface:
 *
 *   anthropic — the real thing. Opus 5, server-side key, prompt caching.
 *   scripted  — a deterministic transcript replayed through the identical
 *               runtime loop. It exists so the tool layer, patch system,
 *               browser loop, guards, receipts, review gate and revert can be
 *               exercised and regression-tested with no credential and no
 *               spend. It fabricates no results: every tool call it emits is
 *               really executed by the real tool layer against the real
 *               repository.
 *
 * The scripted provider is not a mock of the runtime. It is a mock of the model
 * only, which is precisely the one component that cannot be tested for free.
 */

import {
  ANTHROPIC_API_URL,
  ANTHROPIC_VERSION_HEADER,
  anthropicApiKey,
  OPUS_NATIVE_MODEL,
  redactSecrets,
} from './config.js';
import type { OpusModelEffort } from '../../../shared/site00-opus-native/modeContracts.js';
import type { TokenUsage } from '../../../shared/site00-opus-native/pricing.js';
import { estimateTokens } from '../../../shared/site00-opus-native/pricing.js';

export interface ProviderTextBlock { type: 'text'; text: string }
export interface ProviderImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
}
export interface ProviderToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}
export interface ProviderToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  is_error?: boolean;
  content: Array<ProviderTextBlock | ProviderImageBlock>;
}

export type ProviderContentBlock =
  | ProviderTextBlock
  | ProviderImageBlock
  | ProviderToolUseBlock
  | ProviderToolResultBlock;

export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: ProviderContentBlock[];
}

/** System blocks carry the cache breakpoints. */
export interface ProviderSystemBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface ProviderRequest {
  system: ProviderSystemBlock[];
  messages: ProviderMessage[];
  tools: Array<{ name: string; description: string; input_schema: unknown }>;
  maxTokens: number;
  effort: OpusModelEffort;
}

export interface ProviderResponse {
  stopReason: string;
  content: ProviderContentBlock[];
  usage: TokenUsage;
}

export interface OpusProvider {
  id: 'anthropic' | 'scripted';
  send(request: ProviderRequest): Promise<ProviderResponse>;
}

export class ProviderError extends Error {
  constructor(
    public readonly kind:
      | 'MISSING_API_KEY'
      | 'RATE_LIMIT'
      | 'INSUFFICIENT_CREDIT'
      | 'PROVIDER_TIMEOUT'
      | 'PROVIDER_5XX'
      | 'UNKNOWN',
    detail: string,
  ) {
    super(redactSecrets(detail));
    this.name = 'ProviderError';
  }
}

/**
 * Effort is expressed as a thinking budget. Anthropic has no `effort`
 * parameter, so the runtime maps mode intent onto the budget it does have,
 * which is what stops every QUICK tweak from running at maximum reasoning.
 */
const THINKING_BUDGET: Record<OpusModelEffort, number> = {
  low: 0,
  medium: 4_000,
  high: 16_000,
};

export function createAnthropicProvider(): OpusProvider {
  return {
    id: 'anthropic',
    async send(request: ProviderRequest): Promise<ProviderResponse> {
      const key = anthropicApiKey();
      if (!key) throw new ProviderError('MISSING_API_KEY', 'ANTHROPIC_API_KEY is not configured');

      const thinkingBudget = THINKING_BUDGET[request.effort];
      const body: Record<string, unknown> = {
        model: OPUS_NATIVE_MODEL,
        max_tokens: request.maxTokens,
        system: request.system,
        messages: request.messages,
        tools: request.tools,
      };
      if (thinkingBudget > 0) {
        body.thinking = { type: 'enabled', budget_tokens: thinkingBudget };
      }

      let response: Response;
      try {
        response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': key,
            'anthropic-version': ANTHROPIC_VERSION_HEADER,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(600_000),
        });
      } catch (error) {
        const message = (error as Error).message ?? '';
        if (/timeout|abort/i.test(message)) {
          throw new ProviderError('PROVIDER_TIMEOUT', `Anthropic request timed out: ${message}`);
        }
        throw new ProviderError('UNKNOWN', `Anthropic request failed: ${message}`);
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (response.status === 429) throw new ProviderError('RATE_LIMIT', text || 'rate limited');
        if (response.status === 402 || /credit|billing/i.test(text)) {
          throw new ProviderError('INSUFFICIENT_CREDIT', text || 'insufficient credit');
        }
        if (response.status >= 500) throw new ProviderError('PROVIDER_5XX', `${response.status} ${text}`);
        throw new ProviderError('UNKNOWN', `${response.status} ${text}`);
      }

      const payload = (await response.json()) as {
        stop_reason?: string;
        content?: ProviderContentBlock[];
        usage?: {
          input_tokens?: number;
          output_tokens?: number;
          cache_creation_input_tokens?: number;
          cache_read_input_tokens?: number;
        };
      };

      return {
        stopReason: payload.stop_reason ?? 'end_turn',
        content: (payload.content ?? []).filter(
          (block) => block.type === 'text' || block.type === 'tool_use',
        ),
        usage: {
          inputTokens: payload.usage?.input_tokens ?? 0,
          outputTokens: payload.usage?.output_tokens ?? 0,
          cacheWriteTokens: payload.usage?.cache_creation_input_tokens ?? 0,
          cacheReadTokens: payload.usage?.cache_read_input_tokens ?? 0,
        },
      };
    },
  };
}

/** One scripted turn. Tool inputs are real and really executed. */
export interface ScriptedTurn {
  text?: string;
  toolUses?: Array<{ name: string; input: Record<string, unknown> }>;
  stopReason?: string;
}

export interface ScriptedTranscript {
  id: string;
  description: string;
  turns: ScriptedTurn[];
}

export function createScriptedProvider(transcript: ScriptedTranscript): OpusProvider {
  let index = 0;
  return {
    id: 'scripted',
    async send(request: ProviderRequest): Promise<ProviderResponse> {
      const turn = transcript.turns[index] ?? { text: 'No further scripted turns.', stopReason: 'end_turn' };
      index += 1;

      const content: ProviderContentBlock[] = [];
      if (turn.text) content.push({ type: 'text', text: turn.text });
      for (const [i, use] of (turn.toolUses ?? []).entries()) {
        content.push({ type: 'tool_use', id: `scripted-${index}-${i}`, name: use.name, input: use.input });
      }

      // Token accounting is estimated from the real request that was built, so
      // the receipt reflects genuine context size rather than a made-up number.
      // Cache behaviour is modelled honestly: the stable prefix is a cache
      // write on the first turn and a cache read afterwards, which is exactly
      // what the real provider does with these breakpoints.
      const cacheableText = request.system
        .filter((block) => block.cache_control)
        .map((block) => block.text)
        .join('\n');
      const volatileText = request.system
        .filter((block) => !block.cache_control)
        .map((block) => block.text)
        .join('\n');

      const cacheableTokens = estimateTokens(cacheableText);
      const firstTurn = index === 1;

      return {
        stopReason: turn.stopReason ?? ((turn.toolUses?.length ?? 0) > 0 ? 'tool_use' : 'end_turn'),
        content,
        usage: {
          inputTokens: estimateTokens(volatileText) + estimateMessageTokens(request.messages),
          outputTokens: estimateTokens(JSON.stringify(content)),
          cacheWriteTokens: firstTurn ? cacheableTokens : 0,
          cacheReadTokens: firstTurn ? 0 : cacheableTokens,
        },
      };
    },
  };
}

/**
 * An image costs roughly (width x height) / 750 tokens, which for the viewport
 * captures this runtime takes is on the order of 1,500 — nothing like the
 * length of its base64 encoding. Measuring images as text would inflate a
 * receipt by an order of magnitude and make the spend guard fire on runs that
 * were never expensive, so image blocks are counted at a flat realistic rate
 * and their payload is excluded from the text estimate.
 */
const APPROX_TOKENS_PER_VIEWPORT_IMAGE = 1_600;

export function estimateMessageTokens(messages: ProviderMessage[]): number {
  let total = 0;
  for (const message of messages) {
    for (const block of message.content) {
      if (block.type === 'image') {
        total += APPROX_TOKENS_PER_VIEWPORT_IMAGE;
      } else if (block.type === 'text') {
        total += estimateTokens(block.text);
      } else if (block.type === 'tool_use') {
        total += estimateTokens(JSON.stringify(block.input));
      } else if (block.type === 'tool_result') {
        for (const inner of block.content) {
          total += inner.type === 'image'
            ? APPROX_TOKENS_PER_VIEWPORT_IMAGE
            : estimateTokens(inner.text);
        }
      }
    }
  }
  return total;
}
