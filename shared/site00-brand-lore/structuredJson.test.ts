import { describe, expect, it } from 'vitest';
import {
  extractJsonPayload,
  isJsonParseError,
  parseStructuredJson,
} from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/structuredJson.js';

describe('structuredJson', () => {
  it('parses markdown-fenced JSON', () => {
    const result = parseStructuredJson<{ ok: boolean }>('```json\n{"ok": true}\n```');
    expect(result.ok).toBe(true);
  });

  it('repairs trailing commas', () => {
    const result = parseStructuredJson<{ a: number }>('{"a": 1,}');
    expect(result.a).toBe(1);
  });

  it('extracts outer object when wrapped in prose', () => {
    const payload = extractJsonPayload('Here is the result:\n{"directions":[]}\nThanks.');
    expect(JSON.parse(payload)).toEqual({ directions: [] });
  });

  it('repairs truncated JSON with unterminated string', () => {
    const truncated = '{"directions":[{"directionName":"Fresh Shadow","bigIdea":"Editorial proof under arg';
    const result = parseStructuredJson<{ directions: Array<{ directionName?: string }> }>(truncated);
    expect(result.directions?.[0]?.directionName).toBe('Fresh Shadow');
  });

  it('detects JSON parse errors', () => {
    expect(isJsonParseError(new SyntaxError('Unterminated string in JSON at position 10'))).toBe(true);
    expect(isJsonParseError(new Error('Expected double-quoted property name in JSON at position 5'))).toBe(true);
    expect(isJsonParseError(new Error('network failure'))).toBe(false);
  });
});
