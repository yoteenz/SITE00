import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { invalidateStaleTwinBuildForActiveConcept } from './invalidateStaleTwinBuildForConcept.js';

/** Sync every ExecutableConceptPackage visual lock to its gallery candidate. */
export function syncAllPackageVisualsFromCandidates(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinSession {
  const gallery = session.conceptGallery;
  if (!gallery) return session;

  let packages = { ...gallery.packages };
  let changed = false;
  const lockedAt = new Date().toISOString();

  for (const candidate of gallery.candidates) {
    if (!candidate.visualAssetUrl) continue;
    const pkg = Object.values(packages).find((p) => p.conceptId === candidate.conceptId);
    if (!pkg) continue;
    if (
      pkg.visualAuthority.imageUrl === candidate.visualAssetUrl &&
      pkg.visualAuthority.imageStorageRef === candidate.visualAsset
    ) {
      continue;
    }
    packages = {
      ...packages,
      [pkg.packageId]: {
        ...pkg,
        visualAuthority: {
          imageUrl: candidate.visualAssetUrl,
          imageStorageRef: candidate.visualAsset,
          lockedAt,
        },
        status: 'READY',
      },
    };
    changed = true;
  }

  if (!changed) return session;

  const active = gallery.activeConceptId ?? gallery.candidates.at(-1)?.conceptId;
  const activeCandidate = gallery.candidates.find((c) => c.conceptId === active);

  return {
    ...session,
    approvedVisualAuthority:
      activeCandidate?.visualAssetUrl != null
        ? {
            versionId: activeCandidate.legacyVersionId ?? activeCandidate.conceptId,
            imageUrl: activeCandidate.visualAssetUrl,
            imageStorageRef: activeCandidate.visualAsset,
            lockedAt,
          }
        : session.approvedVisualAuthority,
    conceptGallery: { ...gallery, packages },
    updatedAt: lockedAt,
  };
}

/** After gallery hydrate/open/build: package visuals + compiled twin match active concept. */
export function reconcileTwinV2SessionState(session: ConceptDirectedTwinSession): ConceptDirectedTwinSession {
  return invalidateStaleTwinBuildForActiveConcept(syncAllPackageVisualsFromCandidates(session));
}
