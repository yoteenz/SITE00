/** Result of a DOT 01 operation that is not a ledger commit (preferences, reviews): success with a value, or a plain-language error. */
export type Done<T = undefined> = { ok: true; value: T } | { ok: false; error: string };
