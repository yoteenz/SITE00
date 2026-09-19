import { resolveTwinOpusDirectAsset } from './twinOpusDirectAssetManifest';
import { TWIN_OPUS_DIRECT_CANDIDATES, type TwinOpusDirectCandidateSurface } from './twinOpusDirectContent';
import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';

const SURFACE_SLOT: Record<TwinOpusDirectCandidateSurface, Parameters<typeof resolveTwinOpusDirectAsset>[0]> = {
  plate: 'candidatePlate',
  grain: 'candidateGrain',
  collage: 'candidateCollage',
  archive: 'candidateArchive',
};

export function twinOpusDirectCandidateById(candidateId: string) {
  return TWIN_OPUS_DIRECT_CANDIDATES.find((c) => c.id === candidateId) ?? TWIN_OPUS_DIRECT_CANDIDATES[0];
}

export function twinOpusDirectCandidateArtifactView(
  candidateId: string,
  viewport?: string,
): DesignWorkspaceArtifactView {
  const candidate = twinOpusDirectCandidateById(candidateId);
  const src = resolveTwinOpusDirectAsset(SURFACE_SLOT[candidate.surface]) ?? '';
  return {
    src,
    title: `CONCEPT CANDIDATE · ${candidate.version}`,
    subtitle: candidate.id.toUpperCase(),
    role: 'concept-candidate',
    viewport,
    candidateId: candidate.id,
    version: candidate.version,
  };
}
