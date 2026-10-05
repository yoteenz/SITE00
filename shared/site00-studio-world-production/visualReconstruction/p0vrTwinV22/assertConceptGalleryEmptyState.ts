export class StaleV2EmptyStateError extends Error {
  readonly code = 'STALE_V2_EMPTY_STATE' as const;
  constructor(
    message: string,
    readonly discoverableCount: number,
    readonly canonicalCount: number,
  ) {
    super(message);
    this.name = 'StaleV2EmptyStateError';
  }
}

export function assertConceptGalleryEmptyState(input: {
  emptyStateShown: boolean;
  discoverableGenerationCount: number;
  canonicalConceptCount: number;
}): void {
  if (
    input.emptyStateShown &&
    (input.discoverableGenerationCount > 0 || input.canonicalConceptCount > 0)
  ) {
    throw new StaleV2EmptyStateError(
      'STALE_V2_EMPTY_STATE: visual generations exist but UI rendered empty gallery',
      input.discoverableGenerationCount,
      input.canonicalConceptCount,
    );
  }
}

export function shouldShowV2EmptyState(discoverableCount: number, canonicalCount: number): boolean {
  return discoverableCount === 0 && canonicalCount === 0;
}
