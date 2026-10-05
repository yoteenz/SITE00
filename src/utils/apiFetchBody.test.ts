import { describe, expect, it } from 'vitest';
import { serializeApiFetchBody } from './api';

describe('serializeApiFetchBody', () => {
  it('passes through pre-stringified JSON without double-encoding', () => {
    const payload = JSON.stringify({ slug: 'ndxbook', replayId: 'abc', answers: {} });
    expect(serializeApiFetchBody(payload)).toBe(payload);
    expect(serializeApiFetchBody(payload)).not.toContain('\\"slug\\"');
  });

  it('stringifies plain objects once', () => {
    expect(serializeApiFetchBody({ slug: 'ndxbook' })).toBe('{"slug":"ndxbook"}');
  });
});
