/**
 * Shared helpers for bounded Supabase list reads (workload containment).
 */

export type BoundedListOptions = {
  /** 1-based page index */
  page?: number;
  limit?: number;
  /** Max allowed limit for this query class */
  maxLimit?: number;
  /** Default when limit omitted */
  defaultLimit?: number;
};

export type BoundedListMeta = {
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
};

export const SITE00_DEFAULT_LIST_LIMIT = 100;
export const SITE00_MAX_LIST_LIMIT = 500;
export const SITE00_JUDGMENT_LIST_DEFAULT_LIMIT = 200;
export const SITE00_JUDGMENT_LIST_MAX_LIMIT = 1000;

export function clampListLimit(
  raw: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number {
  const n = raw ?? defaultLimit;
  if (!Number.isFinite(n) || n < 1) return defaultLimit;
  return Math.min(Math.floor(n), maxLimit);
}

export function resolveBoundedListRange(options: BoundedListOptions = {}): {
  page: number;
  limit: number;
  from: number;
  to: number;
} {
  const maxLimit = options.maxLimit ?? SITE00_MAX_LIST_LIMIT;
  const defaultLimit = options.defaultLimit ?? SITE00_DEFAULT_LIST_LIMIT;
  const limit = clampListLimit(options.limit, defaultLimit, maxLimit);
  const pageRaw = options.page ?? 1;
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

export function boundedListMeta(
  rowCount: number,
  page: number,
  limit: number,
): BoundedListMeta {
  const hasMore = rowCount >= limit;
  return {
    page,
    limit,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };
}

export type ChunkedFetchOptions = {
  pageSize?: number;
  maxRows?: number;
};

/** Fetch full history in bounded chunks (preserves completeness up to maxRows). */
export async function fetchAllRowsInChunks<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  options: ChunkedFetchOptions = {},
): Promise<{ rows: T[]; truncated: boolean }> {
  const pageSize = clampListLimit(options.pageSize, 200, 1000);
  const maxRows = clampListLimit(options.maxRows, 10_000, 50_000);
  const rows: T[] = [];
  let from = 0;
  let truncated = false;
  while (rows.length < maxRows) {
    const remaining = maxRows - rows.length;
    const chunkSize = Math.min(pageSize, remaining);
    const to = from + chunkSize - 1;
    const page = await fetchPage(from, to);
    if (!page.length) break;
    if (page.length > remaining) {
      rows.push(...page.slice(0, remaining));
      truncated = true;
      break;
    }
    rows.push(...page);
    if (page.length < chunkSize) break;
    if (rows.length >= maxRows) {
      truncated = true;
      break;
    }
    from += chunkSize;
  }
  return { rows, truncated };
}
