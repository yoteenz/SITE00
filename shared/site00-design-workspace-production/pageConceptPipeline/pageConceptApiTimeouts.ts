/**
 * P0.VR.PAGE-CONCEPT-FETCH-ABORT-ASYNC-RUN1 — client/API timeout contract (ms).
 */

/** Short-lived START / trace / dry-run POST (must not wait for providers). */
export const PAGE_CONCEPT_START_TIMEOUT_MS = 45_000;

/** Each GET poll for run status. */
export const PAGE_CONCEPT_POLL_TIMEOUT_MS = 30_000;

/** Interval between run status polls. */
export const PAGE_CONCEPT_POLL_INTERVAL_MS = 2_500;

/** Legacy synchronous generate — deprecated; kept for tests only. */
export const PAGE_CONCEPT_SYNC_GENERATE_TIMEOUT_MS = 90_000;
