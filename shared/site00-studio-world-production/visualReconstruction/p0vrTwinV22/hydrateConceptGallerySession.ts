import type { ConceptDirectedTwinSession, VisualConceptVersion } from '../p0vrTwinV21/types.js';
import { runPageCreativeDirector } from '../p0vrTwinV21/runPageCreativeDirector.js';
import { listAllConceptDirectedTwinSessions } from '../p0vrTwinV21/conceptDirectedTwinSessionStore.js';
import {
  backfillConceptGalleryFromHistory,
  emptyConceptGallery,
} from './conceptGalleryState.js';
import {
  discoverExistingV2ConceptGenerations,
  type RemoteStorageGenerationRecord,
  type V2ConceptGenerationRecord,
} from './discoverExistingV2ConceptGenerations.js';
import { P0_VR_TWIN_V22_BUILD } from './constants.js';
import { repairConceptGalleryHostBoundary } from '../p0vrTwinV22R2/repairConceptGalleryHostBoundary.js';
import type { BackfillReceipt, GalleryHydrationReceipt } from './types.js';

function mergeHistoryFromDiscovery(
  session: ConceptDirectedTwinSession,
  records: V2ConceptGenerationRecord[],
): ConceptDirectedTwinSession {
  if (!session.creativeDirection) {
    const creativeDirection = runPageCreativeDirector({
      pageIntent: session.pageIntent,
      functionGraph: session.functionGraph,
      brandContext: session.brandContext,
      blueprintGrammar: session.blueprintGrammar,
    });
    session = { ...session, creativeDirection };
  }

  const existingIds = new Set(session.history.map((h) => h.versionId));
  const existingUrls = new Set(
    session.history.map((h) => h.imageStorageRef ?? h.imageUrl).filter(Boolean) as string[],
  );

  let history = [...session.history];
  for (const r of records) {
    const key = r.imageStorageRef ?? r.imageUrl;
    if (existingIds.has(r.generationId) || (key && existingUrls.has(key))) continue;
    const version: VisualConceptVersion = {
      versionId: r.generationId.startsWith('vc-') || r.generationId.startsWith('cc-') ? r.generationId : `vc-${r.generationId}`,
      sessionId: session.sessionId,
      label: '',
      imageUrl: r.imageUrl,
      imageStorageRef: r.imageStorageRef,
      creativeDirection: session.creativeDirection!,
      founderInstruction: r.founderInstruction ?? null,
      parentVersionId: r.parentVersionId ?? null,
      status: 'DRAFT',
      createdAt: r.createdAt,
    };
    history.push(version);
    existingIds.add(version.versionId);
    if (key) existingUrls.add(key);
  }

  history.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    ...session,
    history,
    visualConcept:
      session.visualConcept ??
      (records.at(-1)
        ? {
            conceptId: records.at(-1)!.generationId,
            imageUrl: records.at(-1)!.imageUrl,
            imageStorageRef: records.at(-1)!.imageStorageRef,
            provider: records.at(-1)!.provider,
            model: records.at(-1)!.model,
            promptDigest: 'recovered',
            status: 'READY' as const,
          }
        : session.visualConcept),
    status:
      history.length > 0 && session.status === 'TWIN_V2_DIRECTION_READY'
        ? 'TWIN_V2_CONCEPT_READY'
        : session.status,
    updatedAt: new Date().toISOString(),
  };
}

export function hydrateConceptGallerySession(
  session: ConceptDirectedTwinSession,
  input?: {
    siblingSessions?: ConceptDirectedTwinSession[];
    remoteStorageRecords?: RemoteStorageGenerationRecord[];
  },
): ConceptDirectedTwinSession {
  const extraSiblings =
    input?.siblingSessions ??
    listAllConceptDirectedTwinSessions().filter(
      (s) =>
        s.sessionId !== session.sessionId &&
        s.projectId.toLowerCase() === session.projectId.toLowerCase(),
    );

  const discovered = discoverExistingV2ConceptGenerations({
    session,
    siblingSessions: extraSiblings,
    remoteStorageRecords: input?.remoteStorageRecords,
  });

  let working = mergeHistoryFromDiscovery(session, discovered);

  const priorGallery = working.conceptGallery;
  const needsBackfill =
    !priorGallery?.candidates?.length ||
    priorGallery.candidates.length < discovered.length;

  let gallery = priorGallery ?? emptyConceptGallery();
  if (needsBackfill) {
    gallery = backfillConceptGalleryFromHistory({
      ...working,
      conceptGallery: {
        ...emptyConceptGallery(),
        blueprints: priorGallery?.blueprints ?? {},
        manifests: priorGallery?.manifests ?? {},
        bindingPlans: priorGallery?.bindingPlans ?? {},
        reconciliations: priorGallery?.reconciliations ?? {},
        packages: priorGallery?.packages ?? {},
        fidelityReceipts: priorGallery?.fidelityReceipts ?? {},
        sanitizedBlueprints: priorGallery?.sanitizedBlueprints ?? {},
        generatedHostArtifacts: priorGallery?.generatedHostArtifacts ?? {},
        ownershipReceipts: priorGallery?.ownershipReceipts ?? {},
        canvasBoundaries: priorGallery?.canvasBoundaries ?? {},
        hostShellContracts: priorGallery?.hostShellContracts ?? {},
        compositePreviews: priorGallery?.compositePreviews ?? {},
        hostBoundarySanitizationReceipts: priorGallery?.hostBoundarySanitizationReceipts ?? {},
        clientCanvasBoundaries: priorGallery?.clientCanvasBoundaries ?? {},
        clientCanvasTrimReceipts: priorGallery?.clientCanvasTrimReceipts ?? {},
        clientCanvasTopReceipts: priorGallery?.clientCanvasTopReceipts ?? {},
      },
    });
  } else if (priorGallery) {
    gallery = priorGallery;
  }

  gallery = repairConceptGalleryHostBoundary(working, gallery);

  const preferredActive = needsBackfill
    ? (gallery.candidates[0]?.conceptId ?? null)
    : gallery.lastActiveConceptId &&
        gallery.candidates.some((c) => c.conceptId === gallery.lastActiveConceptId)
      ? gallery.lastActiveConceptId
      : (gallery.candidates[0]?.conceptId ?? null);

  const backfillReceipt: BackfillReceipt = {
    projectId: working.projectId,
    pageId: working.pageId,
    viewport: 'mobile',
    discoverableGenerationCount: discovered.length,
    backfilledCount: gallery.candidates.length,
    dedupedCount: Math.max(0, discovered.length - gallery.candidates.length),
    failedCount: Math.max(0, discovered.length - gallery.candidates.length),
    failedIds: [],
    canonicalConceptCount: gallery.candidates.length,
    status:
      discovered.length === 0
        ? 'NO_DISCOVERABLE_GENERATIONS'
        : gallery.candidates.length >= discovered.length
          ? 'COMPLETE'
          : gallery.candidates.length > 0
            ? 'PARTIAL'
            : 'FAILED',
    searchedSessionIds: [
      working.sessionId,
      ...(input?.siblingSessions?.map((s) => s.sessionId) ?? []),
    ],
  };

  const galleryHydrationReceipt: GalleryHydrationReceipt = {
    queryCount: gallery.candidates.length,
    activeConceptId: preferredActive,
    renderedConceptCount: gallery.candidates.length,
    emptyStateShown: gallery.candidates.length === 0,
    backfillTriggered: needsBackfill,
    status: gallery.candidates.length > 0 ? 'HYDRATED' : 'EMPTY',
  };

  gallery = {
    ...gallery,
    buildRef: P0_VR_TWIN_V22_BUILD,
    activeConceptId: preferredActive,
    backfillReceipt,
    galleryHydrationReceipt,
  };

  if (gallery.candidates.length > 0 && working.status === 'TWIN_V2_DIRECTION_READY') {
    working = { ...working, status: 'TWIN_V2_CONCEPT_READY' };
  }

  return {
    ...working,
    conceptGallery: gallery,
    updatedAt: new Date().toISOString(),
  };
}
