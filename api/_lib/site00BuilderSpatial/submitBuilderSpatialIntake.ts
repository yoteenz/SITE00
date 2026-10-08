/**
 * Server-side Builder spatial blueprint submission (immutable snapshot + versioning).
 */
import { parseBuilderSpatialDraft } from '../../../src/site00/builder-experience/spatialStudio/intakeDraft.js';
import {
  buildSubmittedPayloadFromDraft,
  parseSubmittedPayload,
} from '../../../src/site00/builder-experience/spatialStudio/buildSubmissionPayload.js';
import type { BuilderSpatialSubmittedPayload } from '../../../shared/site00-builder-spatial-intake/types.js';
import { isBuilderSpatialDraftPayload } from '../../../shared/site00-builder-spatial-intake/types.js';
import type { IntakeRecord } from '../site00Intakes/types.js';

export class BuilderSpatialSubmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BuilderSpatialSubmitError';
  }
}

/** Founder review snapshots always include estimator output (independent of public preview flag). */
const ALLOW_ESTIMATE_ON_SUBMIT = true;

export function intakeUsesBuilderSpatialDraft(record: IntakeRecord): boolean {
  return record.intakeType === 'BUILDER' && isBuilderSpatialDraftPayload(record.draftPayload as Record<string, unknown>);
}

export function buildBuilderSpatialSubmittedPayload(record: IntakeRecord): BuilderSpatialSubmittedPayload {
  const envelope = parseBuilderSpatialDraft(record.draftPayload as Record<string, unknown>);
  if (!envelope) {
    throw new BuilderSpatialSubmitError('BUILDER SPATIAL DRAFT REQUIRED FOR BLUEPRINT SUBMISSION');
  }
  const previous = parseSubmittedPayload(record.submittedPayload as Record<string, unknown> | null);
  const revisionRequests = envelope.revisionRequests ?? previous?.revisionRequests ?? [];

  return buildSubmittedPayloadFromDraft({
    spatialState: envelope.spatialStudio,
    allowEstimate: ALLOW_ESTIMATE_ON_SUBMIT,
    previousSubmitted: previous,
    revisionRequests,
  });
}
