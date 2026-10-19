/** Classified persistence failures for Digital Foundation (server-side only). */

export type DfPersistenceErrorCode =
  | 'DATABASE_PERMISSION_DENIED'
  | 'DATABASE_UNAVAILABLE'
  | 'SAVE_FAILED'
  | 'DATA_CONTRACT_INVALID';

export class DfPersistenceError extends Error {
  readonly code: DfPersistenceErrorCode;
  readonly detail?: string;

  constructor(code: DfPersistenceErrorCode, message: string, detail?: string) {
    super(message);
    this.name = 'DfPersistenceError';
    this.code = code;
    this.detail = detail;
  }
}

export function classifyPostgrestError(err: { message?: string; code?: string; details?: string; hint?: string }): DfPersistenceError {
  const msg = err.message ?? 'Database write failed';
  const code = err.code ?? '';
  const blob = `${code} ${msg} ${err.details ?? ''} ${err.hint ?? ''}`;
  if (/permission denied|42501|insufficient privilege/i.test(blob)) {
    return new DfPersistenceError('DATABASE_PERMISSION_DENIED', 'Database permission denied for Digital Foundation persistence', msg);
  }
  if (/foreign key|23503|violates foreign key/i.test(blob)) {
    return new DfPersistenceError('DATA_CONTRACT_INVALID', 'Digital Foundation persistence rejected a related record', msg);
  }
  if (/connection|timeout|522|ECONN|fetch failed|schema cache/i.test(blob)) {
    return new DfPersistenceError('DATABASE_UNAVAILABLE', 'Database unavailable', msg);
  }
  return new DfPersistenceError('SAVE_FAILED', msg, err.details);
}

export function assertSupabaseOk<T>(
  label: string,
  result: { data: T; error: { message?: string; code?: string; details?: string; hint?: string } | null },
): T {
  if (result.error) {
    const classified = classifyPostgrestError(result.error);
    throw new DfPersistenceError(classified.code, `${label}: ${classified.message}`, classified.detail);
  }
  return result.data;
}
