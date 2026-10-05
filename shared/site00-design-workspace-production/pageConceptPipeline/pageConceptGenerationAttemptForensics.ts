/**
 * P0.VR.PAGE-CONCEPT-PANEL-WIDTH-AND-ERROR-RECOVERY1 — non-secret attempt forensics.
 */

export type PageConceptGenerationAttemptForensics = {
  requestId: string;
  generationRunId: string;
  stage: string;
  endpoint: string;
  httpStatus: number | null;
  errorCode: string;
  founderMessage: string;
  retryable: boolean;
  at: string;
};

export function recordPageConceptGenerationAttemptForensics(
  input: Omit<PageConceptGenerationAttemptForensics, 'at'>,
): PageConceptGenerationAttemptForensics {
  const record = { ...input, at: new Date().toISOString() };
  if (import.meta.env?.DEV) {
    console.info('PAGE_CONCEPT_GENERATION_ATTEMPT', record);
  }
  return record;
}
