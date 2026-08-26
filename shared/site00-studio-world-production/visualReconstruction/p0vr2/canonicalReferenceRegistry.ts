import { CANONICAL_VIEWPORT_DIMENSIONS } from './constants.js';
import { proposeReferenceScope } from './scopeClassification.js';
import type {
  CanonicalReferenceStatus,
  CanonicalVisualReference,
  DesignViewportClass,
  VisualImplementationCanon,
  VisualReconstructionRun,
} from './types.js';

const references = new Map<string, CanonicalVisualReference>();
const implementationCanons = new Map<string, VisualImplementationCanon>();
const runs = new Map<string, VisualReconstructionRun>();

function refKey(projectId: string, screenId: string, viewportClass: DesignViewportClass): string {
  return `${projectId}:${screenId}:${viewportClass}`;
}

export function registerCanonicalVisualReference(
  input: Omit<CanonicalVisualReference, 'referenceId' | 'createdAt' | 'version' | 'status'> & {
    referenceId?: string;
    version?: number;
    status?: CanonicalReferenceStatus;
  },
): CanonicalVisualReference {
  const key = refKey(input.projectId, input.screenId, input.viewportClass);
  const existing = [...references.values()].filter(
    (r) =>
      r.projectId === input.projectId &&
      r.screenId === input.screenId &&
      r.viewportClass === input.viewportClass &&
      r.status === 'ACTIVE_CANONICAL',
  );

  for (const prev of existing) {
    references.set(prev.referenceId, { ...prev, status: 'SUPERSEDED' });
    markImplementationCanonStale(input.projectId, input.screenId, input.viewportClass);
  }

  const version = input.version ?? existing.length + 1;
  const record: CanonicalVisualReference = {
    referenceId: input.referenceId ?? `${key}:v${version}`,
    projectId: input.projectId,
    screenId: input.screenId,
    route: input.route,
    viewportClass: input.viewportClass,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
    scope: input.scope,
    scopeTargetId: input.scopeTargetId,
    assetId: input.assetId,
    storagePath: input.storagePath,
    version,
    status: input.status ?? 'ACTIVE_CANONICAL',
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    supersedes: existing[0]?.referenceId ?? input.supersedes ?? null,
    notes: input.notes,
  };
  references.set(record.referenceId, record);
  return record;
}

export function createDraftReferenceFromUpload(input: {
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  storagePath: string;
  createdBy: string;
  cropWidth: number;
  cropHeight: number;
  iconSheet?: boolean;
  scopeOverride?: CanonicalVisualReference['scope'];
  scopeTargetOverride?: string;
}): CanonicalVisualReference {
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[input.viewportClass];
  const proposed = proposeReferenceScope({
    screenId: input.screenId,
    projectId: input.projectId,
    route: input.route,
    viewportClass: input.viewportClass,
    cropWidth: input.cropWidth,
    cropHeight: input.cropHeight,
    iconSheet: input.iconSheet,
  });

  return registerCanonicalVisualReference({
    projectId: input.projectId,
    screenId: input.screenId,
    route: input.route,
    viewportClass: input.viewportClass,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    scope: input.scopeOverride ?? proposed.scope,
    scopeTargetId: input.scopeTargetOverride ?? proposed.scopeTargetId,
    assetId: `upload-${Date.now()}`,
    storagePath: input.storagePath,
    status: 'DRAFT',
    createdBy: input.createdBy,
    supersedes: null,
    notes: proposed.rationale,
  });
}

export function promoteReferenceToCanonical(referenceId: string): CanonicalVisualReference | null {
  const draft = references.get(referenceId);
  if (!draft) return null;
  return registerCanonicalVisualReference({ ...draft, status: 'ACTIVE_CANONICAL', supersedes: draft.supersedes });
}

export function getActiveCanonicalReference(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): CanonicalVisualReference | null {
  return (
    [...references.values()].find(
      (r) =>
        r.projectId === projectId &&
        r.screenId === screenId &&
        r.viewportClass === viewportClass &&
        r.status === 'ACTIVE_CANONICAL',
    ) ?? null
  );
}

export function listCanonicalReferences(projectId?: string): CanonicalVisualReference[] {
  return [...references.values()].filter((r) => !projectId || r.projectId === projectId);
}

export function markImplementationCanonStale(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): void {
  const key = refKey(projectId, screenId, viewportClass);
  const canon = implementationCanons.get(key);
  if (canon) {
    implementationCanons.set(key, { ...canon, status: 'STALE_AGAINST_NEW_REFERENCE' });
  }
}

export function promoteVisualImplementationCanon(input: Omit<VisualImplementationCanon, 'canonId' | 'status'>): VisualImplementationCanon {
  const key = refKey(input.projectId, input.screenId, input.viewportClass);
  const canon: VisualImplementationCanon = {
    ...input,
    canonId: `${key}:canon:${input.implementationVersion}`,
    status: 'ACTIVE',
  };
  for (const [id, existing] of implementationCanons) {
    if (id.startsWith(key) && existing.status === 'ACTIVE') {
      implementationCanons.set(id, { ...existing, status: 'SUPERSEDED' });
    }
  }
  implementationCanons.set(key, canon);
  return canon;
}

export function getActiveImplementationCanon(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): VisualImplementationCanon | null {
  const key = refKey(projectId, screenId, viewportClass);
  const canon = implementationCanons.get(key);
  return canon && (canon.status === 'ACTIVE' || canon.status === 'STALE_AGAINST_NEW_REFERENCE') ? canon : null;
}

export function recordVisualReconstructionRun(run: VisualReconstructionRun): void {
  runs.set(run.runId, run);
}

export function getLatestReconstructionRun(
  projectId: string,
  screenId: string,
  viewportClass: DesignViewportClass,
): VisualReconstructionRun | null {
  const matches = [...runs.values()].filter(
    (r) => r.projectId === projectId && r.screenId === screenId && r.viewportClass === viewportClass,
  );
  return matches.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null;
}

export function clearCanonicalRegistryForTest(): void {
  references.clear();
  implementationCanons.clear();
  runs.clear();
}

export function seedCanonicalRegistry(records: CanonicalVisualReference[]): void {
  for (const record of records) {
    references.set(record.referenceId, record);
  }
}

export function seedImplementationCanons(records: VisualImplementationCanon[]): void {
  for (const record of records) {
    const key = refKey(record.projectId, record.screenId, record.viewportClass);
    implementationCanons.set(key, record);
  }
}
