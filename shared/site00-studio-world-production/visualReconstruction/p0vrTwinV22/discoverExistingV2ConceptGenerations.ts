import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';

export type V2ConceptGenerationRecord = {
  generationId: string;
  imageUrl: string | null;
  imageStorageRef: string | null;
  createdAt: string;
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  provider: string;
  model: string;
  source:
    | 'session_history'
    | 'visual_concept'
    | 'approved_authority'
    | 'sibling_session'
    | 'remote_storage';
  founderInstruction?: string | null;
  parentVersionId?: string | null;
};

export type RemoteStorageGenerationRecord = {
  generationId: string;
  imageUrl: string;
  imageStorageRef: string;
  createdAt: string;
  sessionId: string;
};

function dedupeKey(r: Pick<V2ConceptGenerationRecord, 'generationId' | 'imageUrl' | 'imageStorageRef'>): string {
  if (r.imageStorageRef) return `ref:${r.imageStorageRef}`;
  if (r.imageUrl) return `url:${r.imageUrl}`;
  return `id:${r.generationId}`;
}

function pushRecord(map: Map<string, V2ConceptGenerationRecord>, record: V2ConceptGenerationRecord): void {
  const key = dedupeKey(record);
  const existing = map.get(key);
  if (!existing || existing.createdAt > record.createdAt) {
    map.set(key, record);
  }
}

function collectFromSession(
  map: Map<string, V2ConceptGenerationRecord>,
  session: ConceptDirectedTwinSession,
  source: V2ConceptGenerationRecord['source'],
): void {
  for (const h of session.history) {
    if (!h.imageUrl && !h.imageStorageRef) continue;
    pushRecord(map, {
      generationId: h.versionId,
      imageUrl: h.imageUrl,
      imageStorageRef: h.imageStorageRef,
      createdAt: h.createdAt,
      sessionId: session.sessionId,
      projectId: session.projectId,
      pageId: session.pageId,
      viewport: 'mobile',
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
      source,
      founderInstruction: h.founderInstruction,
      parentVersionId: h.parentVersionId,
    });
  }

  const vc = session.visualConcept;
  if (vc && (vc.imageUrl || vc.imageStorageRef) && vc.status === 'READY') {
    pushRecord(map, {
      generationId: vc.conceptId,
      imageUrl: vc.imageUrl,
      imageStorageRef: vc.imageStorageRef,
      createdAt: session.updatedAt,
      sessionId: session.sessionId,
      projectId: session.projectId,
      pageId: session.pageId,
      viewport: 'mobile',
      provider: vc.provider,
      model: vc.model,
      source: source === 'session_history' ? 'visual_concept' : source,
    });
  }

  const approved = session.approvedVisualAuthority;
  if (approved && (approved.imageUrl || approved.imageStorageRef)) {
    pushRecord(map, {
      generationId: approved.versionId,
      imageUrl: approved.imageUrl,
      imageStorageRef: approved.imageStorageRef,
      createdAt: approved.lockedAt,
      sessionId: session.sessionId,
      projectId: session.projectId,
      pageId: session.pageId,
      viewport: 'mobile',
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
      source: 'approved_authority',
    });
  }

  for (const c of session.conceptGallery?.candidates ?? []) {
    if (!c.visualAssetUrl && !c.visualAsset) continue;
    pushRecord(map, {
      generationId: c.legacyVersionId ?? c.conceptId,
      imageUrl: c.visualAssetUrl,
      imageStorageRef: c.visualAsset,
      createdAt: c.createdAt,
      sessionId: session.sessionId,
      projectId: session.projectId,
      pageId: session.pageId,
      viewport: 'mobile',
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
      source: 'session_history',
    });
  }
}

/** Discover recoverable V2 visual generations without calling paid image APIs. */
export function discoverExistingV2ConceptGenerations(input: {
  session: ConceptDirectedTwinSession;
  siblingSessions?: ConceptDirectedTwinSession[];
  remoteStorageRecords?: RemoteStorageGenerationRecord[];
}): V2ConceptGenerationRecord[] {
  const map = new Map<string, V2ConceptGenerationRecord>();
  collectFromSession(map, input.session, 'session_history');

  for (const sibling of input.siblingSessions ?? []) {
    collectFromSession(map, sibling, 'sibling_session');
  }

  for (const remote of input.remoteStorageRecords ?? []) {
    pushRecord(map, {
      generationId: remote.generationId,
      imageUrl: remote.imageUrl,
      imageStorageRef: remote.imageStorageRef,
      createdAt: remote.createdAt,
      sessionId: remote.sessionId,
      projectId: input.session.projectId,
      pageId: input.session.pageId,
      viewport: 'mobile',
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
      source: 'remote_storage',
    });
  }

  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
