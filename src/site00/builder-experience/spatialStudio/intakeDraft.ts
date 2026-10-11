/**
 * Builder spatial studio ↔ canonical intake draft envelope (server + client).
 */
import {
  BUILDER_SPATIAL_DRAFT_SCHEMA,
  type BuilderSpatialDraftEnvelope,
  type BuilderSpatialRevisionRequest,
} from '../../../../shared/site00-builder-spatial-intake/types';
import { emptySpatialState, type SpatialBuilderState } from './types';

export const SPATIAL_INTAKE_DOMAIN_LABEL = 'spatial-studio';
export const SPATIAL_INTAKE_SOURCE_ROUTE = '/bldr/studio';

export function spatialStateFromEnvelope(envelope: BuilderSpatialDraftEnvelope): SpatialBuilderState {
  return { ...emptySpatialState(), ...envelope.spatialStudio, version: 1 };
}

export function envelopeFromSpatialState(
  state: SpatialBuilderState,
  prev?: BuilderSpatialDraftEnvelope | null,
): BuilderSpatialDraftEnvelope {
  const clientRevision = (prev?.clientRevision ?? 0) + 1;
  return {
    schemaVersion: BUILDER_SPATIAL_DRAFT_SCHEMA,
    spatialStudio: { ...state, savedAt: state.savedAt ?? new Date().toISOString() },
    clientRevision,
    serverRevision: prev?.serverRevision ?? 0,
    legacy: prev?.legacy,
    revisionRequests: prev?.revisionRequests,
    revisionOpen: prev?.revisionOpen,
  };
}

export function parseBuilderSpatialDraft(payload: Record<string, unknown> | null | undefined): BuilderSpatialDraftEnvelope | null {
  if (!payload || payload.schemaVersion !== BUILDER_SPATIAL_DRAFT_SCHEMA) return null;
  const spatial = payload.spatialStudio;
  if (!spatial || typeof spatial !== 'object') return null;
  return {
    schemaVersion: BUILDER_SPATIAL_DRAFT_SCHEMA,
    spatialStudio: { ...emptySpatialState(), ...(spatial as SpatialBuilderState) },
    clientRevision: Number(payload.clientRevision ?? 0),
    serverRevision: Number(payload.serverRevision ?? 0),
    legacy: payload.legacy as Record<string, unknown> | undefined,
    revisionRequests: payload.revisionRequests as BuilderSpatialRevisionRequest[] | undefined,
    revisionOpen: Boolean(payload.revisionOpen),
  };
}

export function draftPayloadFromEnvelope(envelope: BuilderSpatialDraftEnvelope): Record<string, unknown> {
  return { ...envelope };
}

export type SpatialDraftConflictResult =
  | { kind: 'use_server'; state: SpatialBuilderState; reason: string }
  | { kind: 'use_local'; state: SpatialBuilderState; reason: string }
  | { kind: 'use_merged'; state: SpatialBuilderState; reason: string };

/** Deterministic merge: server wins unless local is strictly newer by savedAt and clientRevision. */
export function resolveSpatialDraftConflict(input: {
  serverEnvelope: BuilderSpatialDraftEnvelope | null;
  localState: SpatialBuilderState | null;
  serverLastSavedAt: string | null;
}): SpatialDraftConflictResult {
  const serverState = input.serverEnvelope ? spatialStateFromEnvelope(input.serverEnvelope) : null;
  const local = input.localState;

  if (!serverState && local) {
    return { kind: 'use_local', state: local, reason: 'SERVER_DRAFT_MISSING' };
  }
  if (serverState && !local) {
    return { kind: 'use_server', state: serverState, reason: 'LOCAL_CACHE_MISSING' };
  }
  if (!serverState && !local) {
    return { kind: 'use_merged', state: emptySpatialState(), reason: 'EMPTY' };
  }

  const localSaved = local!.savedAt ? Date.parse(local!.savedAt) : 0;
  const serverSaved = input.serverLastSavedAt ? Date.parse(input.serverLastSavedAt) : 0;
  const localRev = input.serverEnvelope?.clientRevision ?? 0;

  if (localSaved > serverSaved && localSaved > 0) {
    return { kind: 'use_local', state: local!, reason: 'LOCAL_NEWER_THAN_SERVER' };
  }
  if (serverSaved > localSaved && serverSaved > 0) {
    return { kind: 'use_server', state: serverState!, reason: 'SERVER_NEWER_THAN_LOCAL' };
  }
  if (localRev > (input.serverEnvelope?.serverRevision ?? 0)) {
    return { kind: 'use_local', state: local!, reason: 'LOCAL_UNSYNCED_CHANGES' };
  }
  return { kind: 'use_server', state: serverState!, reason: 'SERVER_DEFAULT' };
}

/** Map legacy assessment answers into spatial defaults without overwriting explicit spatial choices. */
export function applyLegacyIntakeHints(
  state: SpatialBuilderState,
  legacy: Record<string, unknown> | undefined,
): SpatialBuilderState {
  if (!legacy) return state;
  let next = { ...state };

  const buildClass = String(legacy.buildClass ?? legacy.domainLabel ?? '').toLowerCase();
  if (!next.placePath && buildClass) {
    if (buildClass.includes('world')) next = { ...next, placePath: 'WORLD' };
    else if (buildClass.includes('enterprise') || buildClass.includes('system')) next = { ...next, placePath: 'ADVANCED' };
    else if (buildClass === 'not-sure') next = { ...next, placePath: 'CUSTOM' };
    else next = { ...next, placePath: 'SIMPLE' };
  }

  const answers = legacy.answers as Record<string, unknown> | undefined;
  if (answers && typeof answers === 'object') {
    const type = answers.type;
    const types = Array.isArray(type) ? type : type ? [type] : [];
    const typeStr = types.map(String).join(' ');
    if (next.workModules.length <= 1 && next.workModules[0] === 'PAGES') {
      const modules = new Set(next.workModules);
      if (typeStr.includes('ecommerce') || typeStr.includes('shop')) modules.add('SHOP');
      if (typeStr.includes('booking')) modules.add('BOOKING');
      if (typeStr.includes('membership')) modules.add('MEMBER_AREA');
      next = { ...next, workModules: Array.from(modules) as SpatialBuilderState['workModules'] };
    }
    const timeline = answers.timeline;
    if (!next.paceNotes && typeof timeline === 'string' && timeline.trim()) {
      next = { ...next, paceNotes: `LEGACY TIMELINE NOTE: ${timeline}` };
    }
    const budget = answers.budget;
    if (!next.paceNotes && typeof budget === 'string' && budget.trim()) {
      next = { ...next, paceNotes: `${next.paceNotes ? next.paceNotes + ' · ' : ''}LEGACY BUDGET NOTE: ${budget}` };
    }
  }

  const inherited = legacy.inheritedLoreSnapshot as Record<string, unknown> | undefined;
  if (!next.feelVibe && inherited?.worldMetaphor) {
    next = { ...next, feelVibe: 'IMMERSIVE' };
  }

  return next;
}
