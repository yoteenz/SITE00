import { describe, it, expect } from 'vitest';
import {
  boundedListMeta,
  clampListLimit,
  fetchAllRowsInChunks,
  resolveBoundedListRange,
} from '../api/_lib/supabase/boundedListQuery.js';

describe('boundedListQuery', () => {
  it('clamps invalid and excessive limits', () => {
    expect(clampListLimit(undefined, 100, 500)).toBe(100);
    expect(clampListLimit(0, 100, 500)).toBe(100);
    expect(clampListLimit(9999, 100, 500)).toBe(500);
  });

  it('resolves supabase range from page/limit', () => {
    expect(resolveBoundedListRange({ page: 2, limit: 50 })).toEqual({
      page: 2,
      limit: 50,
      from: 50,
      to: 99,
    });
  });

  it('computes hasMore when page is full', () => {
    expect(boundedListMeta(100, 1, 100)).toEqual({
      page: 1,
      limit: 100,
      hasMore: true,
      nextPage: 2,
    });
    expect(boundedListMeta(40, 1, 100).hasMore).toBe(false);
  });

  it('fetchAllRowsInChunks paginates until empty', async () => {
    const all = Array.from({ length: 250 }, (_, i) => i);
    const { rows, truncated } = await fetchAllRowsInChunks(async (from, to) => {
      return all.slice(from, to + 1);
    }, { pageSize: 100, maxRows: 500 });
    expect(rows).toHaveLength(250);
    expect(truncated).toBe(false);
  });

  it('fetchAllRowsInChunks respects maxRows cap', async () => {
    const all = Array.from({ length: 500 }, (_, i) => i);
    const { rows, truncated } = await fetchAllRowsInChunks(async (from, to) => {
      return all.slice(from, to + 1);
    }, { pageSize: 100, maxRows: 150 });
    expect(rows).toHaveLength(150);
    expect(truncated).toBe(true);
  });
});
