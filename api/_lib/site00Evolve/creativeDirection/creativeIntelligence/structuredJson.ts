/**
 * Robust structured JSON parsing for Sonnet / LLM responses.
 * Handles markdown fences, trailing commas, truncation, and minor syntax drift.
 */

import { jsonrepair } from 'jsonrepair';

export const STRUCTURED_JSON_REVISION_HINT =
  'Prior response was invalid or truncated JSON. Return ONE complete valid JSON object only — no markdown fences, no commentary, no trailing commas.';

export function isJsonParseError(err: unknown): boolean {
  if (err instanceof SyntaxError) return true;
  if (err instanceof Error) {
    return /JSON|Unexpected token|Unterminated string|double-quoted property name/i.test(err.message);
  }
  return false;
}

/** Strip markdown fences and isolate the outermost JSON object or array. */
export function extractJsonPayload(text: string): string {
  let payload = text.trim();
  if (!payload) throw new SyntaxError('Empty model response');

  const fenceMatch = payload.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    payload = fenceMatch[1].trim();
  } else if (payload.startsWith('```')) {
    payload = payload.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  const objStart = payload.indexOf('{');
  const arrStart = payload.indexOf('[');
  const start =
    objStart === -1
      ? arrStart
      : arrStart === -1
        ? objStart
        : Math.min(objStart, arrStart);

  if (start === -1) throw new SyntaxError('No JSON object or array found in model response');

  const openChar = payload[start];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < payload.length; i += 1) {
    const ch = payload[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return payload.slice(start, i + 1);
    }
  }

  return payload.slice(start);
}

function parseWithRepair(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch (firstErr) {
    try {
      return JSON.parse(jsonrepair(payload));
    } catch {
      throw firstErr;
    }
  }
}

export function parseStructuredJson<T>(text: string): T {
  const payload = extractJsonPayload(text);
  return parseWithRepair(payload) as T;
}

export async function withStructuredJsonRetry<T>(params: {
  call: (revisionHint: string | null) => Promise<{ text: string }>;
  parse: (text: string) => T;
  maxAttempts?: number;
}): Promise<T> {
  const maxAttempts = params.maxAttempts ?? 2;
  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const revisionHint = attempt === 0 ? null : STRUCTURED_JSON_REVISION_HINT;
    try {
      const { text } = await params.call(revisionHint);
      return params.parse(text);
    } catch (err) {
      lastErr = err;
      if (!isJsonParseError(err) || attempt === maxAttempts - 1) throw err;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('Structured JSON parse failed after retry');
}
