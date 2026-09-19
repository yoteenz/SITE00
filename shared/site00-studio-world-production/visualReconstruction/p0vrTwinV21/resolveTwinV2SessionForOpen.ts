import type { ConceptDirectedTwinSession } from './types.js';
import { createConceptDirectedTwinSession } from './createConceptDirectedTwinSession.js';
import { loadConceptDirectedTwinSession, listConceptDirectedTwinSessionsForProject } from './conceptDirectedTwinSessionStore.js';
import { isTwinV2OverviewPageScope } from '../p0vrTwinV22/twinV2PageScope.js';

function sessionRichness(session: ConceptDirectedTwinSession): number {
  const history = session.history?.length ?? 0;
  const candidates = session.conceptGallery?.candidates?.length ?? 0;
  const visual = session.visualConcept?.imageUrl || session.visualConcept?.imageStorageRef ? 1 : 0;
  return history * 2 + candidates * 3 + visual;
}

/** Prefer the localStorage session that already holds the most Twin V2 visuals for this page. */
export function resolveTwinV2SessionForOpen(input: {
  projectId: string;
  pageId: string;
  referenceAssets?: string[];
}): ConceptDirectedTwinSession {
  const direct = loadConceptDirectedTwinSession(input.projectId, input.pageId);
  const overviewSessions = listConceptDirectedTwinSessionsForProject(input.projectId).filter((s) =>
    isTwinV2OverviewPageScope(input.projectId, s.pageId),
  );

  /** Prefer this page's localStorage session when it already has Twin V2 work (avoid swapping to a richer sibling). */
  if (direct && sessionRichness(direct) > 0) {
    return {
      ...direct,
      projectId: input.projectId,
      pageId: input.pageId,
      referenceAssets: input.referenceAssets?.length ? input.referenceAssets : direct.referenceAssets,
    };
  }

  let best = direct;
  for (const s of overviewSessions) {
    if (!best || sessionRichness(s) > sessionRichness(best)) best = s;
  }

  if (!best) {
    return createConceptDirectedTwinSession({
      projectId: input.projectId,
      pageId: input.pageId,
      referenceAssets: input.referenceAssets,
    });
  }

  return {
    ...best,
    projectId: input.projectId,
    pageId: input.pageId,
    referenceAssets: input.referenceAssets?.length ? input.referenceAssets : best.referenceAssets,
  };
}
