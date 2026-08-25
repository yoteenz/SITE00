/**
 * P0.CB.1A — Reference version lifecycle (create, archive, promote).
 */

import { randomUUID } from 'node:crypto';
import type {
  CreativeReferenceAsset,
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
} from '../types.js';
import type {
  ActiveCreativeReferenceAuthority,
  CreativeReferenceVersion,
  ReferenceVersionArchive,
  ReferenceVersionStatus,
} from './types.js';

export function versionedReferenceAssetId(sequenceId: string, versionNumber: number): string {
  return `ref-board-${sequenceId}-v${versionNumber}`;
}

export function ensureReferenceVersioningInitialized(
  state: FounderCreativeIngestionState,
): FounderCreativeIngestionState {
  if (state.referenceVersions.length > 0) return state;

  const now = new Date().toISOString();
  const versions: CreativeReferenceVersion[] = [];
  const authority: ActiveCreativeReferenceAuthority[] = [];
  const archives: ReferenceVersionArchive[] = [];

  for (const sequence of state.parentSequences) {
    const asset =
      state.referenceAssets.find((entry) => entry.assetId.includes(sequence.sequenceId)) ??
      state.referenceAssets.find((entry) => entry.assetId === `ref-board-${sequence.sequenceId}`);
    if (!asset) continue;

    const versionId = randomUUID();
    const board = state.referenceBoards.find((entry) => entry.sequenceId === sequence.sequenceId) ?? null;
    versions.push({
      referenceVersionId: versionId,
      parentSequenceId: sequence.sequenceId,
      referenceAssetId: asset.assetId,
      boardId: board?.boardId ?? null,
      versionNumber: 1,
      createdAt: asset.uploadedAt ?? now,
      createdBy: 'founder',
      source: 'INITIAL',
      status: 'ACTIVE',
      supersedesReferenceVersionId: null,
      reason: 'Initial Row 01 ingestion',
      notes: null,
    });
    authority.push({
      parentSequenceId: sequence.sequenceId,
      activeReferenceVersionId: versionId,
      draftReferenceVersionId: null,
      updatedAt: now,
    });

    const slideRefs = state.slideReferences.filter((entry) => entry.sequenceId === sequence.sequenceId);
    const specs = state.reconstructionSpecs.filter((entry) => entry.sequenceId === sequence.sequenceId);
    const production = state.productionAssets.filter((entry) => entry.sequenceId === sequence.sequenceId);
    if (slideRefs.length > 0 || specs.length > 0) {
      archives.push({
        referenceVersionId: versionId,
        parentSequenceId: sequence.sequenceId,
        referenceAsset: asset,
        board,
        slideReferences: slideRefs,
        reconstructionSpecs: specs,
        productionAssets: production,
        archivedAt: now,
        immutable: true,
      });
    }
  }

  return {
    ...state,
    referenceVersions: versions,
    activeReferenceAuthority: authority,
    referenceVersionArchives: archives,
    referenceDiffs: state.referenceDiffs ?? [],
    updatedAt: now,
  };
}

export function getActiveReferenceVersion(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): CreativeReferenceVersion | null {
  const auth = state.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  if (!auth) return null;
  return state.referenceVersions.find((entry) => entry.referenceVersionId === auth.activeReferenceVersionId) ?? null;
}

export function getDraftReferenceVersion(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): CreativeReferenceVersion | null {
  const auth = state.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  if (!auth?.draftReferenceVersionId) return null;
  return state.referenceVersions.find((entry) => entry.referenceVersionId === auth.draftReferenceVersionId) ?? null;
}

export function nextVersionNumber(state: FounderCreativeIngestionState, sequenceId: string): number {
  const versions = state.referenceVersions.filter((entry) => entry.parentSequenceId === sequenceId);
  return versions.length === 0 ? 1 : Math.max(...versions.map((entry) => entry.versionNumber)) + 1;
}

export function archiveActiveReferenceVersion(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  const active = getActiveReferenceVersion(state, sequenceId);
  if (!active) return state;

  const asset = state.referenceAssets.find((entry) => entry.assetId === active.referenceAssetId);
  if (!asset) return state;

  const board = state.referenceBoards.find((entry) => entry.boardId === active.boardId) ?? null;
  const slideRefs = state.slideReferences.filter((entry) => entry.sequenceId === sequenceId);
  const specs = state.reconstructionSpecs.filter((entry) => entry.sequenceId === sequenceId);
  const production = state.productionAssets.filter((entry) => entry.sequenceId === sequenceId);

  const archive: ReferenceVersionArchive = {
    referenceVersionId: active.referenceVersionId,
    parentSequenceId: sequenceId,
    referenceAsset: asset,
    board,
    slideReferences: slideRefs,
    reconstructionSpecs: specs,
    productionAssets: production,
    archivedAt: new Date().toISOString(),
    immutable: true,
  };

  const alreadyArchived = state.referenceVersionArchives.some(
    (entry) => entry.referenceVersionId === active.referenceVersionId,
  );

  return {
    ...state,
    referenceVersionArchives: alreadyArchived
      ? state.referenceVersionArchives
      : [...state.referenceVersionArchives, archive],
    updatedAt: new Date().toISOString(),
  };
}

export function createDraftReferenceVersion(
  state: FounderCreativeIngestionState,
  params: {
    sequenceId: string;
    previewUrl: string | null;
    storagePath?: string | null;
    source: CreativeReferenceVersion['source'];
    reason?: string | null;
    notes?: string | null;
    createdBy?: string;
  },
): { state: FounderCreativeIngestionState; version: CreativeReferenceVersion; asset: CreativeReferenceAsset } {
  const versionNumber = nextVersionNumber(state, params.sequenceId);
  const assetId = versionedReferenceAssetId(params.sequenceId, versionNumber);
  const active = getActiveReferenceVersion(state, params.sequenceId);
  const versionId = randomUUID();
  const now = new Date().toISOString();

  const asset: CreativeReferenceAsset = {
    assetId,
    kind: 'REFERENCE_IMAGE',
    storagePath: params.storagePath ?? null,
    previewUrl: params.previewUrl,
    mimeType: 'image/jpeg',
    width: null,
    height: null,
    uploadedAt: now,
    notes: params.notes ?? null,
  };

  const version: CreativeReferenceVersion = {
    referenceVersionId: versionId,
    parentSequenceId: params.sequenceId,
    referenceAssetId: assetId,
    boardId: null,
    versionNumber,
    createdAt: now,
    createdBy: params.createdBy ?? 'founder',
    source: params.source,
    status: 'DRAFT',
    supersedesReferenceVersionId: active?.referenceVersionId ?? null,
    reason: params.reason ?? null,
    notes: params.notes ?? null,
  };

  const authority = state.activeReferenceAuthority.map((entry) =>
    entry.parentSequenceId === params.sequenceId
      ? { ...entry, draftReferenceVersionId: versionId, updatedAt: now }
      : entry,
  );

  const parentSequences = state.parentSequences.map((entry) =>
    entry.sequenceId === params.sequenceId
      ? { ...entry, referenceStatus: 'REFERENCE_REPLACED' as const, reconstructionStatus: 'IN_PROGRESS' as const }
      : entry,
  );

  return {
    state: {
      ...state,
      referenceAssets: [...state.referenceAssets, asset],
      referenceVersions: [...state.referenceVersions, version],
      activeReferenceAuthority: authority.length
        ? authority
        : [
            ...state.activeReferenceAuthority,
            {
              parentSequenceId: params.sequenceId,
              activeReferenceVersionId: active?.referenceVersionId ?? versionId,
              draftReferenceVersionId: versionId,
              updatedAt: now,
            },
          ],
      parentSequences,
      updatedAt: now,
    },
    version,
    asset,
  };
}

export function promoteDraftReferenceVersion(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  const auth = state.activeReferenceAuthority.find((entry) => entry.parentSequenceId === sequenceId);
  const draft = getDraftReferenceVersion(state, sequenceId);
  if (!auth || !draft) throw new Error('No draft reference to promote');

  const now = new Date().toISOString();
  const updatedVersions = state.referenceVersions.map((entry) => {
    if (entry.referenceVersionId === auth.activeReferenceVersionId) {
      return { ...entry, status: 'SUPERSEDED' as ReferenceVersionStatus };
    }
    if (entry.referenceVersionId === draft.referenceVersionId) {
      return { ...entry, status: 'ACTIVE' as ReferenceVersionStatus, boardId: draft.boardId };
    }
    return entry;
  });

  const parentSequences = state.parentSequences.map((entry) =>
    entry.sequenceId === sequenceId
      ? {
          ...entry,
          referenceStatus: 'CURRENT_AGAIN' as FounderCreativeParentSequence['referenceStatus'],
          reconstructionStatus: 'REVIEW' as const,
        }
      : entry,
  );

  return {
    ...state,
    referenceVersions: updatedVersions,
    activeReferenceAuthority: state.activeReferenceAuthority.map((entry) =>
      entry.parentSequenceId === sequenceId
        ? {
            ...entry,
            activeReferenceVersionId: draft.referenceVersionId,
            draftReferenceVersionId: null,
            updatedAt: now,
          }
        : entry,
    ),
    parentSequences,
    workflowStep: 'REVIEW',
    updatedAt: now,
  };
}

export function getArchiveForVersion(
  state: FounderCreativeIngestionState,
  referenceVersionId: string,
): ReferenceVersionArchive | null {
  return state.referenceVersionArchives.find((entry) => entry.referenceVersionId === referenceVersionId) ?? null;
}
