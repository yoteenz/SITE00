/**
 * B5.6 — Entry 001 package state — Supabase-backed with optimistic UI.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Entry001ArchiveFilter,
  Entry001AssetClassificationSuggestion,
  Entry001AssetType,
  Entry001CampaignAsset,
  Entry001ContentRole,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  buildEntry001MissingDeliverablePlaceholders,
  ENTRY001_HERO_ASSET,
} from '../../../config/entry001CampaignAssets.js';
import {
  buildActiveArchive,
  buildEntry001ArchiveIntelligence,
  buildParentPackages,
  type Entry001ArchiveStatePersisted,
} from './entry001ArchiveIntelligence.js';
import {
  assetTypeToLegacyRole,
  enrichAssetWithTaxonomy,
  filterArchiveAssets,
  groupAssetsByType,
  legacyRoleToAssetType,
} from './entry001AssetTaxonomy.js';
import { suggestAssetClassification } from './entry001AssetClassification.js';
import { buildEntry001PackageReadiness } from './entry001PackageReadiness.js';
import {
  fetchCampaignPackage,
  migrateCampaignPackage,
  reclassifyCampaignAssetApi,
  removeCampaignAssetApi,
  reorderCampaignSequence,
  restoreCampaignAssetApi,
  type CampaignPackageApiResponse,
} from './campaignPackageApi.js';
import {
  backupLegacyLocalStorage,
  isLocalMigrationComplete,
  markLocalMigrationComplete,
  readLegacyLocalStorage,
  snapshotToEntry001Persisted,
} from './campaignPackageBridge.js';

const LEGACY_STORAGE_KEY = 'site00_entry001_archive_state_v2';

export type PendingClassificationItem = {
  assetId: string;
  file: File;
  previewUrl: string;
  suggestion: Entry001AssetClassificationSuggestion;
  assetType: Entry001AssetType;
  assetRole: Entry001ContentRole | null;
  accepted: boolean;
};

export type SaveState = 'idle' | 'loading' | 'saving' | 'saved' | 'failed';

function writeLegacyCache(state: Entry001ArchiveStatePersisted): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* optional write-through cache */
  }
}

export function useEntry001PackageState() {
  const [persisted, setPersisted] = useState<Entry001ArchiveStatePersisted>({
    overrides: {},
    removedAssetIds: [],
    archivedAssets: [],
    extraAssets: [],
  });
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [syncRequired, setSyncRequired] = useState(false);
  const [backendMeta, setBackendMeta] = useState<{
    packageId?: string;
    carouselVersion?: number;
    storyVersion?: number;
  }>({});
  const [orderedCarouselIds, setOrderedCarouselIds] = useState<string[]>([]);
  const [orderedStoryIds, setOrderedStoryIds] = useState<string[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PendingClassificationItem[]>([]);
  const [archiveFilter, setArchiveFilter] = useState<Entry001ArchiveFilter>('ALL');

  const applyApiResponse = useCallback((body: CampaignPackageApiResponse) => {
    if (body.legacy) {
      setPersisted(body.legacy);
      writeLegacyCache(body.legacy);
    }
    const snap = body.snapshot as { package?: { packageId?: string }; sequences?: Array<{ formatFamily: string; versionNumber: number; orderedAssetIds: string[]; isCurrent: boolean }> } | null;
    if (snap?.package?.packageId) {
      const carousel = snap.sequences?.find((s) => s.formatFamily === 'CAROUSEL' && s.isCurrent);
      const story = snap.sequences?.find((s) => s.formatFamily === 'STORY' && s.isCurrent);
      setBackendMeta({
        packageId: snap.package.packageId,
        carouselVersion: carousel?.versionNumber,
        storyVersion: story?.versionNumber,
      });
      if (carousel) setOrderedCarouselIds(carousel.orderedAssetIds);
      if (story) setOrderedStoryIds(story.orderedAssetIds);
    }
    if (body.carouselAssets && Array.isArray(body.carouselAssets)) {
      setOrderedCarouselIds(
        (body.carouselAssets as Array<{ assetId: string }>).map((a) => a.assetId),
      );
    }
    if (body.storyAssets && Array.isArray(body.storyAssets)) {
      setOrderedStoryIds((body.storyAssets as Array<{ assetId: string }>).map((a) => a.assetId));
    }
  }, []);

  const hydrate = useCallback(async () => {
    setSaveState('loading');
    setSaveError(null);
    try {
      const legacy = readLegacyLocalStorage();
      if (legacy && !isLocalMigrationComplete()) {
        backupLegacyLocalStorage();
        const migrated = await migrateCampaignPackage(legacy as import('../../../../../shared/site00-campaign-package/types.js').LegacyEntry001LocalState);
        applyApiResponse(migrated);
        markLocalMigrationComplete();
      } else {
        const body = await fetchCampaignPackage();
        applyApiResponse(body);
      }
      setSaveState('saved');
      setSyncRequired(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'PACKAGE SYNC REQUIRED');
      setSyncRequired(true);
      if (legacyFallback()) setSaveState('idle');
      else setSaveState('failed');
    }
  }, [applyApiResponse]);

  function legacyFallback(): boolean {
    const legacy = readLegacyLocalStorage();
    if (legacy) {
      setPersisted(legacy);
      return true;
    }
    return false;
  }

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const activeArchive = useMemo(
    () => buildActiveArchive(persisted.overrides, persisted.removedAssetIds, persisted.extraAssets),
    [persisted],
  );

  const carouselSlides = useMemo(() => {
    const slides = activeArchive.filter((a) => a.assetType === 'CAROUSEL_SLIDE');
    if (!orderedCarouselIds.length) return slides.sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0));
    return orderedCarouselIds
      .map((id) => slides.find((s) => s.assetId === id))
      .filter(Boolean) as Entry001CampaignAsset[];
  }, [activeArchive, orderedCarouselIds]);

  const storyFrames = useMemo(() => {
    const frames = activeArchive.filter(
      (a) => a.assetType === 'STORY_FRAME' || a.assetType === 'CTA_FRAME',
    );
    if (!orderedStoryIds.length) return frames.sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0));
    return orderedStoryIds
      .map((id) => frames.find((f) => f.assetId === id))
      .filter(Boolean) as Entry001CampaignAsset[];
  }, [activeArchive, orderedStoryIds]);

  const filteredArchive = useMemo(
    () => filterArchiveAssets(activeArchive, archiveFilter),
    [activeArchive, archiveFilter],
  );

  const archiveGroups = useMemo(() => groupAssetsByType(filteredArchive), [filteredArchive]);

  const readiness = useMemo(
    () => buildEntry001PackageReadiness(activeArchive, persisted.extraAssets),
    [activeArchive, persisted.extraAssets],
  );

  const intelligence = useMemo(() => buildEntry001ArchiveIntelligence(activeArchive), [activeArchive]);

  const parentPackages = useMemo(() => buildParentPackages(activeArchive), [activeArchive]);

  const missingDeliverables = useMemo(() => {
    const filled = new Set(
      persisted.extraAssets
        .filter((a) => a.approved && a.filePath)
        .map((a) => a.assetType ?? a.role),
    );
    return buildEntry001MissingDeliverablePlaceholders(filled).map((placeholder) => {
      const resolved = persisted.extraAssets.find(
        (a) =>
          (a.assetType ?? a.role) === (placeholder.assetType ?? placeholder.role) &&
          a.approved &&
          a.filePath,
      );
      return resolved ?? placeholder;
    });
  }, [persisted.extraAssets]);

  const mutateWithRollback = useCallback(
    async (optimistic: Entry001ArchiveStatePersisted, action: () => Promise<CampaignPackageApiResponse>) => {
      const previous = persisted;
      setPersisted(optimistic);
      writeLegacyCache(optimistic);
      setSaveState('saving');
      setSaveError(null);
      try {
        const body = await action();
        applyApiResponse(body);
        setSaveState('saved');
      } catch {
        setPersisted(previous);
        writeLegacyCache(previous);
        setSaveState('failed');
        setSaveError('SAVE FAILED — Your change could not be saved.');
      }
    },
    [persisted, applyApiResponse],
  );

  const removeFromArchive = useCallback(
    (assetId: string) => {
      const optimistic: Entry001ArchiveStatePersisted = {
        ...persisted,
        removedAssetIds: [...new Set([...persisted.removedAssetIds, assetId])],
        archivedAssets: [
          ...persisted.archivedAssets.filter((a) => a.assetId !== assetId),
          {
            ...(activeArchive.find((a) => a.assetId === assetId) ?? persisted.extraAssets.find((a) => a.assetId === assetId)!),
            status: 'ARCHIVED',
            removedFromActiveArchive: true,
            archivedAt: new Date().toISOString(),
          },
        ],
        extraAssets: persisted.extraAssets.filter((a) => a.assetId !== assetId),
      };
      void mutateWithRollback(optimistic, () => removeCampaignAssetApi(assetId));
    },
    [persisted, activeArchive, mutateWithRollback],
  );

  const restoreToArchive = useCallback(
    (assetId: string) => {
      const archived = persisted.archivedAssets.find((a) => a.assetId === assetId);
      if (!archived) return;
      const restored = { ...archived, status: 'APPROVED' as const, removedFromActiveArchive: false, archivedAt: null };
      const optimistic: Entry001ArchiveStatePersisted = {
        ...persisted,
        removedAssetIds: persisted.removedAssetIds.filter((id) => id !== assetId),
        archivedAssets: persisted.archivedAssets.filter((a) => a.assetId !== assetId),
        extraAssets: archived.filePath.startsWith('blob:')
          ? [...persisted.extraAssets.filter((a) => a.assetId !== assetId), restored]
          : persisted.extraAssets,
        overrides: archived.filePath.startsWith('blob:')
          ? persisted.overrides
          : {
              ...persisted.overrides,
              [assetId]: { status: 'APPROVED', removedFromActiveArchive: false, archivedAt: null },
            },
      };
      void mutateWithRollback(optimistic, () => restoreCampaignAssetApi(assetId));
    },
    [persisted, mutateWithRollback],
  );

  const reclassifyAsset = useCallback(
    (assetId: string, assetType: Entry001AssetType, assetRole: Entry001ContentRole | null) => {
      const patch = { assetType, assetRole, role: assetTypeToLegacyRole(assetType) };
      const optimistic = { ...persisted };
      const isExtra = persisted.extraAssets.some((a) => a.assetId === assetId);
      if (isExtra) {
        optimistic.extraAssets = persisted.extraAssets.map((a) =>
          a.assetId === assetId ? enrichAssetWithTaxonomy({ ...a, ...patch }) : a,
        );
      } else {
        optimistic.overrides = {
          ...persisted.overrides,
          [assetId]: { ...persisted.overrides[assetId], ...patch },
        };
      }
      void mutateWithRollback(optimistic, () => reclassifyCampaignAssetApi(assetId, patch));
    },
    [persisted, mutateWithRollback],
  );

  const reorderFormatSequence = useCallback(
    async (formatFamily: 'CAROUSEL' | 'STORY', orderedAssetIds: string[]) => {
      const expectedVersion =
        formatFamily === 'CAROUSEL' ? (backendMeta.carouselVersion ?? 1) : (backendMeta.storyVersion ?? 1);
      if (formatFamily === 'CAROUSEL') setOrderedCarouselIds(orderedAssetIds);
      else setOrderedStoryIds(orderedAssetIds);
      setSaveState('saving');
      try {
        const body = await reorderCampaignSequence({ formatFamily, orderedAssetIds, expectedVersion });
        if (body.conflict) {
          setSaveError('SEQUENCE UPDATED ELSEWHERE — Reload latest order.');
          await hydrate();
          return;
        }
        applyApiResponse(body);
        setSaveState('saved');
      } catch {
        setSaveError('SAVE FAILED');
        setSaveState('failed');
        await hydrate();
      }
    },
    [backendMeta, applyApiResponse, hydrate],
  );

  const moveSequenceItem = useCallback(
    (formatFamily: 'CAROUSEL' | 'STORY', assetId: string, direction: 'left' | 'right') => {
      const ids = formatFamily === 'CAROUSEL' ? [...orderedCarouselIds] : [...orderedStoryIds];
      const idx = ids.indexOf(assetId);
      if (idx < 0) return;
      const swap = direction === 'left' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= ids.length) return;
      [ids[idx], ids[swap]] = [ids[swap]!, ids[idx]!];
      void reorderFormatSequence(formatFamily, ids);
    },
    [orderedCarouselIds, orderedStoryIds, reorderFormatSequence],
  );

  const queueFilesForClassification = useCallback((files: FileList | File[]) => {
    const items: PendingClassificationItem[] = Array.from(files).map((file, index) => {
      const assetId = `entry001-pending-${Date.now()}-${index}`;
      const suggestion = suggestAssetClassification(assetId, file.name);
      return {
        assetId,
        file,
        previewUrl: URL.createObjectURL(file),
        suggestion,
        assetType: suggestion.suggestedAssetType,
        assetRole: suggestion.suggestedAssetRole,
        accepted: suggestion.confidence === 'HIGH',
      };
    });
    setPendingQueue((prev) => [...prev, ...items]);
  }, []);

  const updatePendingClassification = useCallback(
    (assetId: string, assetType: Entry001AssetType, assetRole: Entry001ContentRole | null) => {
      setPendingQueue((prev) =>
        prev.map((p) => (p.assetId === assetId ? { ...p, assetType, assetRole, accepted: true } : p)),
      );
    },
    [],
  );

  const commitPendingAssets = useCallback(
    (items: PendingClassificationItem[]) => {
      if (!items.length) return;
      const optimistic: Entry001ArchiveStatePersisted = {
        ...persisted,
        extraAssets: [
          ...persisted.extraAssets,
          ...items.map((p, index) =>
            enrichAssetWithTaxonomy({
              assetId: p.assetId,
              entryId: 'entry-001',
              filePath: p.previewUrl,
              title: p.file.name.replace(/\.[^.]+$/, '').toUpperCase(),
              format: p.file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
              role: assetTypeToLegacyRole(p.assetType),
              assetType: p.assetType,
              assetRole: p.assetRole,
              status: 'APPROVED',
              source: 'FOUNDER_SUPPLIED',
              approved: true,
              version: 'upload-v002',
              sequenceIndex:
                p.assetType === 'CAROUSEL_SLIDE' || p.assetType === 'STORY_FRAME' ? index + 1 : null,
              removedFromActiveArchive: false,
              notes: `AI suggested ${p.suggestion.confidence}`,
            }),
          ),
        ],
      };
      setPersisted(optimistic);
      writeLegacyCache(optimistic);
      void migrateCampaignPackage(optimistic as import('../../../../../shared/site00-campaign-package/types.js').LegacyEntry001LocalState).then(applyApiResponse);
    },
    [persisted, applyApiResponse],
  );

  const applyPendingClassifications = useCallback(() => {
    const approved = pendingQueue.filter((p) => p.accepted);
    if (!approved.length) return;
    commitPendingAssets(approved);
    setPendingQueue((prev) => prev.filter((p) => !p.accepted));
  }, [pendingQueue, commitPendingAssets]);

  const acceptAllPendingAndApply = useCallback(() => {
    if (!pendingQueue.length) return;
    commitPendingAssets(pendingQueue.map((p) => ({ ...p, accepted: true })));
    setPendingQueue([]);
  }, [pendingQueue, commitPendingAssets]);

  const dismissPendingQueue = useCallback(() => setPendingQueue([]), []);

  const addAssetForRole = useCallback(
    (role: Entry001CampaignAsset['role'], file: File, autoApprove = false) => {
      const assetType = legacyRoleToAssetType(role);
      const assetId = `entry001-upload-${role.toLowerCase()}-${Date.now()}`;
      const objectUrl = URL.createObjectURL(file);
      const asset = enrichAssetWithTaxonomy({
        assetId,
        entryId: 'entry-001',
        filePath: objectUrl,
        title: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
        format: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        role,
        assetType,
        assetRole: assetType === 'REEL_COVER' ? 'COVER' : null,
        status: autoApprove ? 'APPROVED' : 'AWAITING_FOUNDER_APPROVAL',
        source: 'FOUNDER_SUPPLIED',
        approved: autoApprove,
        version: 'upload-v002',
        removedFromActiveArchive: false,
        notes: autoApprove ? 'Founder upload — approved' : 'Founder upload — pending approval',
      });
      const optimistic = {
        ...persisted,
        extraAssets: [...persisted.extraAssets.filter((a) => a.role !== role), asset],
      };
      setPersisted(optimistic);
      writeLegacyCache(optimistic);
      void migrateCampaignPackage(optimistic as import('../../../../../shared/site00-campaign-package/types.js').LegacyEntry001LocalState).then(applyApiResponse);
      return assetId;
    },
    [persisted, applyApiResponse],
  );

  const approveUploadedAsset = useCallback(() => applyPendingClassifications(), [applyPendingClassifications]);

  const batchAddAssets = useCallback(
    (files: FileList | File[]) => queueFilesForClassification(files),
    [queueFilesForClassification],
  );

  return {
    heroAsset: ENTRY001_HERO_ASSET,
    activeArchive,
    filteredArchive,
    archiveGroups,
    archivedAssets: persisted.archivedAssets,
    approvedArchive: activeArchive,
    missingDeliverables,
    extraAssets: persisted.extraAssets,
    readiness,
    intelligence,
    parentPackages,
    carouselSlides,
    storyFrames,
    orderedCarouselIds,
    orderedStoryIds,
    archiveFilter,
    setArchiveFilter,
    pendingQueue,
    saveState,
    saveError,
    syncRequired,
    backendMeta,
    retrySync: hydrate,
    updatePendingClassification,
    applyPendingClassifications,
    acceptAllPendingAndApply,
    dismissPendingQueue,
    setPendingAccepted: (assetId: string, accepted: boolean) =>
      setPendingQueue((prev) => prev.map((p) => (p.assetId === assetId ? { ...p, accepted } : p))),
    removeFromArchive,
    restoreToArchive,
    reclassifyAsset,
    reorderFormatSequence,
    moveSequenceItem,
    addAssetForRole,
    approveUploadedAsset,
    batchAddAssets,
    approvedArchiveCount: readiness.activeArchiveCount,
  };
}

export { snapshotToEntry001Persisted };
