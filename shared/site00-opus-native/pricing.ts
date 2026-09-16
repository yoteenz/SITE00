/**
 * P0.VR.OPUS-NATIVE1 — Phase 6: token pricing and cost maths.
 *
 * Rates are configuration, not truth. They are here so the cost ledger can
 * produce a receipt without a network call, and so the panel can show an
 * estimate before dispatch. Every receipt records the rate table version it was
 * priced with, so a later rate change does not silently rewrite history.
 */

export const OPUS_NATIVE_RATE_TABLE_VERSION = 'opus-native-rates-v1';

/** USD per million tokens. */
export interface OpusTokenRates {
  input: number;
  output: number;
  /** Cache writes cost more than plain input; cache reads cost far less. */
  cacheWrite: number;
  cacheRead: number;
}

/**
 * Default rates. Overridable server-side with SITE00_OPUS_NATIVE_RATES so the
 * founder can correct them without a deploy if Anthropic's pricing moves.
 */
export const OPUS_NATIVE_DEFAULT_RATES: OpusTokenRates = {
  input: 15,
  output: 75,
  cacheWrite: 18.75,
  cacheRead: 1.5,
};

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
}

export const EMPTY_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheWriteTokens: 0,
  cacheReadTokens: 0,
};

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
  };
}

function perMillion(tokens: number, rate: number): number {
  return (tokens / 1_000_000) * rate;
}

export function usageCostUsd(usage: TokenUsage, rates: OpusTokenRates = OPUS_NATIVE_DEFAULT_RATES): number {
  const total =
    perMillion(usage.inputTokens, rates.input) +
    perMillion(usage.outputTokens, rates.output) +
    perMillion(usage.cacheWriteTokens, rates.cacheWrite) +
    perMillion(usage.cacheReadTokens, rates.cacheRead);
  return round6(total);
}

/**
 * What the run would have cost if every cache read had been a full-price input
 * token. This is the number that justifies the caching architecture, so it is
 * recorded rather than inferred later.
 */
export function cacheSavingsUsd(usage: TokenUsage, rates: OpusTokenRates = OPUS_NATIVE_DEFAULT_RATES): number {
  const asFullPrice = perMillion(usage.cacheReadTokens, rates.input);
  const asCacheRead = perMillion(usage.cacheReadTokens, rates.cacheRead);
  return round6(Math.max(0, asFullPrice - asCacheRead));
}

export function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/**
 * Cheap token estimate for pre-dispatch display. Deliberately conservative:
 * it is better to over-estimate what a run will cost than to surprise the
 * founder afterwards. Roughly 3.6 characters per token for English prose mixed
 * with code, which measures slightly high for prose and slightly low for
 * minified content — neither of which appears in a compiled design context.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.6);
}

/**
 * Pre-dispatch projection for a whole run, not a single request.
 *
 * A naive estimate that prices one turn is badly wrong, because an agent loop
 * resends the growing conversation on every iteration: the second turn pays
 * for the first turn's tool results again, and so on. The first version of
 * this runtime under-projected a real proof run by roughly five times for
 * exactly that reason.
 *
 * So the projection models the loop. The stable prefix is written once and
 * read thereafter; the volatile context is resent every turn; and tool results
 * accumulate, which is the quadratic term. It is deliberately conservative.
 * The estimate informs the founder — the cost guard, which checks real usage
 * before every dispatch, is what actually protects them.
 */
export function projectRunCost(input: {
  volatileTokens: number;
  cacheableTokens: number;
  expectedTurns: number;
  maxOutputTokens: number;
  rates?: OpusTokenRates;
  /** true once the stable prefix is already warm from an earlier run. */
  cacheWarm: boolean;
}): number {
  const rates = input.rates ?? OPUS_NATIVE_DEFAULT_RATES;
  const turns = Math.max(1, input.expectedTurns);

  // Each turn adds roughly this much tool-result text that later turns resend.
  const TOOL_RESULT_PER_TURN = 1_800;
  const accumulatedToolResults = TOOL_RESULT_PER_TURN * ((turns * (turns - 1)) / 2);
  const inputTokens = input.volatileTokens * turns + accumulatedToolResults;

  // Agents rarely emit their full output allowance on every turn.
  const outputTokens = (input.maxOutputTokens / 4) * Math.min(turns, 3);

  const cacheWriteTokens = input.cacheWarm ? 0 : input.cacheableTokens;
  const cacheReadTokens = input.cacheableTokens * (input.cacheWarm ? turns : turns - 1);

  return usageCostUsd({ inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens }, rates);
}

export function formatUsd(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(5)}`;
}
