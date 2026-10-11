import { ESTIMATOR_VERSION } from '../../../studioos/estimation/version';
import type {
  BuilderSpatialBlueprintSubmission,
  BuilderSpatialSubmittedPayload,
} from '../../../../shared/site00-builder-spatial-intake/types';
import { BUILDER_SPATIAL_DRAFT_SCHEMA } from '../../../../shared/site00-builder-spatial-intake/types';
import { snapshotFromSpatialState } from './blueprintSessionContract';
import type { SpatialBuilderState } from './types';

export function buildBlueprintSubmissionRecord(
  spatialState: SpatialBuilderState,
  opts: { allowEstimate: boolean; version: number; submittedAt: string },
): BuilderSpatialBlueprintSubmission {
  const snapshot = snapshotFromSpatialState(spatialState, { allowEstimate: opts.allowEstimate });
  if (!snapshot.submission_ready) {
    const blockers = snapshot.submission_blockers.join(', ') || 'INCOMPLETE';
    throw new Error(`BLUEPRINT NOT READY: ${blockers}`);
  }
  return {
    version: opts.version,
    submittedAt: opts.submittedAt,
    estimatorVersion: ESTIMATOR_VERSION,
    spatialState: { ...spatialState },
    snapshot: JSON.parse(JSON.stringify(snapshot)) as Record<string, unknown>,
  };
}

export function buildSubmittedPayloadFromDraft(input: {
  spatialState: SpatialBuilderState;
  allowEstimate: boolean;
  previousSubmitted: BuilderSpatialSubmittedPayload | null;
  revisionRequests: BuilderSpatialSubmittedPayload['revisionRequests'];
}): BuilderSpatialSubmittedPayload {
  const prevVersion = input.previousSubmitted?.current.version ?? 0;
  const history = input.previousSubmitted
    ? [...(input.previousSubmitted.history ?? []), input.previousSubmitted.current]
    : [];

  const current = buildBlueprintSubmissionRecord(input.spatialState, {
    allowEstimate: input.allowEstimate,
    version: prevVersion + 1,
    submittedAt: new Date().toISOString(),
  });

  return {
    schemaVersion: BUILDER_SPATIAL_DRAFT_SCHEMA,
    current,
    history,
    revisionRequests: input.revisionRequests ?? [],
  };
}

export function parseSubmittedPayload(payload: Record<string, unknown> | null | undefined): BuilderSpatialSubmittedPayload | null {
  if (!payload || payload.schemaVersion !== BUILDER_SPATIAL_DRAFT_SCHEMA) return null;
  if (!payload.current || typeof payload.current !== 'object') return null;
  return payload as unknown as BuilderSpatialSubmittedPayload;
}
