/**
 * Studio World execution failure taxonomy.
 */

import type { StudioWorldFailureCategory } from './types.js';

export class DurablePersistenceUnavailableError extends Error {
  readonly category: StudioWorldFailureCategory = 'DURABLE_PERSISTENCE_UNAVAILABLE';

  constructor(message: string) {
    super(message);
    this.name = 'DurablePersistenceUnavailableError';
  }
}

export class StaleWriteConflictError extends Error {
  readonly category: StudioWorldFailureCategory = 'CONCURRENCY_CONFLICT';

  constructor(
    message: string,
    readonly expectedVersion: number,
    readonly actualVersion: number,
  ) {
    super(message);
    this.name = 'StaleWriteConflictError';
  }
}

export class IdempotencyConflictError extends Error {
  readonly category: StudioWorldFailureCategory = 'IDEMPOTENCY_CONFLICT';

  constructor(
    message: string,
    readonly existingRunId: string,
  ) {
    super(message);
    this.name = 'IdempotencyConflictError';
  }
}

export class PersistenceFailureError extends Error {
  readonly category: StudioWorldFailureCategory = 'PERSISTENCE_FAILURE';

  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'PersistenceFailureError';
  }
}
