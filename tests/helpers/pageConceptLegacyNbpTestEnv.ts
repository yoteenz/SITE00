import { afterEach, beforeEach } from 'vitest';

/** Opt into pre-canonical NBP orchestration for tests that assert legacy provider stages. */
export function useLegacyPageConceptNbpPipeline(): void {
  beforeEach(() => {
    process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = 'true';
  });
  afterEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });
}
