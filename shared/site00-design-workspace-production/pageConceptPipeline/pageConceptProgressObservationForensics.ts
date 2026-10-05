/**
 * Founder-visible progress / start authority forensics (non-secret).
 */

export type PageConceptProgressObservationForensics = {
  founderStartConfirmed: boolean;
  runId: string | null;
  runCreatedAt: string | null;
  runStatus: string | null;
  currentStage: string | null;
  currentSubstep: string | null;
  latestEventSequence: number;
  clientObservedSequence: number;
  unreadEventCount: number;
  lastPollAt: string | null;
  autoStart: false;
};

export const PAGE_CONCEPT_PROGRESS_OBSERVATION_FORENSICS_INITIAL: PageConceptProgressObservationForensics =
  {
    founderStartConfirmed: false,
    runId: null,
    runCreatedAt: null,
    runStatus: null,
    currentStage: null,
    currentSubstep: null,
    latestEventSequence: 0,
    clientObservedSequence: 0,
    unreadEventCount: 0,
    lastPollAt: null,
    autoStart: false,
  };
