/**
 * Canonical Builder Hybrid Spatial Studio intake draft + submission shapes.
 * Stored in site00_bldr_intakes.answers (API draftPayload) and submitted_payload.
 */
import type { SpatialBuilderState } from '../../src/site00/builder-experience/spatialStudio/types';

export const BUILDER_SPATIAL_DRAFT_SCHEMA = 'builder-spatial-v1' as const;

export type BuilderSpatialRevisionRequest = {
  requestedAt: string;
  adminEmail: string;
  message: string;
  forSubmissionVersion: number;
};

export type BuilderSpatialBlueprintSubmission = {
  version: number;
  submittedAt: string;
  estimatorVersion: string;
  spatialState: SpatialBuilderState;
  /** JSON-safe blueprint session snapshot (selection, blueprint, scope, estimate). */
  snapshot: Record<string, unknown>;
};

export type BuilderSpatialDraftEnvelope = {
  schemaVersion: typeof BUILDER_SPATIAL_DRAFT_SCHEMA;
  spatialStudio: SpatialBuilderState;
  clientRevision: number;
  serverRevision: number;
  legacy?: Record<string, unknown>;
  revisionRequests?: BuilderSpatialRevisionRequest[];
  revisionOpen?: boolean;
};

export type BuilderSpatialSubmittedPayload = {
  schemaVersion: typeof BUILDER_SPATIAL_DRAFT_SCHEMA;
  current: BuilderSpatialBlueprintSubmission;
  history: BuilderSpatialBlueprintSubmission[];
  revisionRequests: BuilderSpatialRevisionRequest[];
};

export function isBuilderSpatialDraftPayload(payload: Record<string, unknown> | null | undefined): boolean {
  return payload?.schemaVersion === BUILDER_SPATIAL_DRAFT_SCHEMA && typeof payload.spatialStudio === 'object';
}

export function isBuilderSpatialSubmittedPayload(payload: Record<string, unknown> | null | undefined): boolean {
  return payload?.schemaVersion === BUILDER_SPATIAL_DRAFT_SCHEMA && typeof payload.current === 'object';
}
