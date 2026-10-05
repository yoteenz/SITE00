/**
 * Resident fabrication source authority — white tee / red collar portrait + approved uniform full-body.
 * Separates runtime canonical portraits from fabrication geometry anchors.
 */
import { castingThumbnailUrl } from '../resident-intelligence/season1-ensemble/castingThumbnailAuthority.js';
import { RESIDENT_OUTFIT_SYSTEM } from './residentGeometryCompletePack.js';
import { STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES } from './residentGeometryFrames.js';

export type FabricationSourceQuality = 'LITE_ONLY' | 'HIGH_RES_ARCHIVE' | 'FOUNDER_APPROVED_PACKAGE';

export type SupersededResidentSource = {
  kind: 'SUPERSEDED_RESIDENT_SOURCE';
  repoPath: string;
  notes: string;
  lineage: 'production-authority-forensics-mount1';
};

export type CurrentFabricationSourceAuthority = {
  kind: 'CURRENT_FABRICATION_SOURCE_AUTHORITY';
  residentId: `SW-${string}`;
  sourceResidentId: string;
  portraitAuthority: { url: string; repoPath: string; role: 'FABRICATION_PORTRAIT_AND_WORK_LOOK' };
  fullBodyAuthority: { url: string | null; repoPath: string; role: 'FABRICATION_FULL_BODY_UNIFORM' };
  outfitSystem: 'WOMEN_LEGGINGS' | 'MEN_COMPRESSION_SHORTS';
  closeupAuthority: { url: string | null; repoPath: string | null; role: 'IDENTITY_CLOSEUP_REFERENCE' };
  sourceQuality: FabricationSourceQuality;
  recovery: {
    whiteTeeRedCollarCommit: string;
    whiteTeeRedCollarPr: '1303';
    season1IngestCommit: string;
    season1IngestPr: '1302';
    bundleBranch: 'cursor/production-hub-descendants-opus1';
  };
};

const SW_TO_RESIDENT: Record<`SW-${string}`, string> = {
  'SW-001': 'SW-RESIDENT-001',
  'SW-002': 'SW-RESIDENT-002',
  'SW-003': 'SW-RESIDENT-003',
  'SW-004': 'SW-RESIDENT-004',
  'SW-005': 'SW-RESIDENT-005',
  'SW-006': 'SW-RESIDENT-006',
  'SW-007': 'SW-RESIDENT-007',
  'SW-008': 'SW-RESIDENT-008',
};

function publicRepoPath(urlPath: string): string {
  return `public${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}

export const SUPERSEDED_FABRICATION_SOURCES: Record<`SW-${string}`, SupersededResidentSource> = {
  'SW-001': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-etta-vale-portrait.jpg',
    notes: 'Forensics recovery portrait (black tee). Superseded for fabrication by casting-thumbnails-v1 white tee / red collar.',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-002': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-zuri-xu-portrait.jpg',
    notes: 'Founder lite pack portrait. Superseded for fabrication by casting-thumbnails-v1.',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-003': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-jules-mercer-portrait.jpg',
    notes: 'OpenArt mounted portrait. Superseded for fabrication by casting-thumbnails-v1 (not locs cluster).',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-004': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-noa-kline-portrait.jpg',
    notes: 'Forensics lite portrait. Superseded for fabrication by casting-thumbnails-v1.',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-005': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-caspian-reed-portrait.jpg',
    notes: 'OpenArt mounted portrait. Superseded for fabrication by casting-thumbnails-v1.',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-006': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-iona-wells-portrait.jpg',
    notes: 'OpenArt mounted portrait. Superseded for fabrication by casting-thumbnails-v1 (not glam alternate).',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-007': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-marlowe-saint-portrait.jpg',
    notes: 'Forensics lite portrait. Superseded for fabrication by casting-thumbnails-v1.',
    lineage: 'production-authority-forensics-mount1',
  },
  'SW-008': {
    kind: 'SUPERSEDED_RESIDENT_SOURCE',
    repoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-elio-vahn-portrait.jpg',
    notes: 'Forensics lite portrait. Superseded for fabrication by casting-thumbnails-v1.',
    lineage: 'production-authority-forensics-mount1',
  },
};

export const SUPERSEDED_WORK_UNIFORM_IVORY: string =
  'public/site00/production-authority-assets/shared/residents/studio-world-*-uniform.jpg (ivory SW suit — NOT white-tee/red-collar)';

function approvedUniformFullBodyRepoPath(residentId: `SW-${string}`): string | null {
  const profile = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.find((p) => p.residentId === residentId);
  if (!profile) return null;
  return `artifacts/STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN/${profile.folderName}/01_FULL_BODY_UNIFORM_FRONT.png`;
}

export function buildCurrentFabricationSourceAuthority(residentId: `SW-${string}`): CurrentFabricationSourceAuthority | null {
  const sourceResidentId = SW_TO_RESIDENT[residentId];
  if (!sourceResidentId) return null;
  const thumb = castingThumbnailUrl(sourceResidentId);
  if (!thumb) return null;
  const portraitRepo = publicRepoPath(thumb);
  const fullBodyRepo = approvedUniformFullBodyRepoPath(residentId);
  if (!fullBodyRepo) return null;
  const outfitSystem = RESIDENT_OUTFIT_SYSTEM[residentId];
  if (!outfitSystem) return null;
  const closeup = null;
  return {
    kind: 'CURRENT_FABRICATION_SOURCE_AUTHORITY',
    residentId,
    sourceResidentId,
    portraitAuthority: {
      url: thumb,
      repoPath: portraitRepo,
      role: 'FABRICATION_PORTRAIT_AND_WORK_LOOK',
    },
    fullBodyAuthority: {
      url: null,
      repoPath: fullBodyRepo,
      role: 'FABRICATION_FULL_BODY_UNIFORM',
    },
    outfitSystem,
    closeupAuthority: {
      url: closeup,
      repoPath: closeup ? publicRepoPath(closeup) : null,
      role: 'IDENTITY_CLOSEUP_REFERENCE',
    },
    sourceQuality: 'FOUNDER_APPROVED_PACKAGE',
    recovery: {
      whiteTeeRedCollarCommit: '4cdac10c6885de7482d82c4b39ee601eb3f604c8',
      whiteTeeRedCollarPr: '1303',
      season1IngestCommit: 'a59131ef feat(production): ingest Studio World S1 resident visual authority (#1302)',
      season1IngestPr: '1302',
      bundleBranch: 'cursor/production-hub-descendants-opus1',
    },
  };
}

export function listFabricationSourceAuthorities(): CurrentFabricationSourceAuthority[] {
  return (Object.keys(SW_TO_RESIDENT) as `SW-${string}`[])
    .map((id) => buildCurrentFabricationSourceAuthority(id))
    .filter((x): x is CurrentFabricationSourceAuthority => x != null);
}

export const FABRICATION_BATCH_STATUS = 'GEOMETRY_COMPLETE_IN_REVIEW' as const;
