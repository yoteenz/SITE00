/**
 * B5.6 — Entry 001 package state — Supabase-backed with B5.5 deliverable workspaces.
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
} from './campaignPackageBridge.js';
import {
  archiveDeliverable,
  deleteDeliverablePermanently,
  getDeliverableById,
  loadDeliverablesState,
  persistDeliverablesState,
  removeDeliverableFromPackage,
  replaceDeliverableFile,
  restoreDeliverableToPackage,
  reorderDeliverablesInFormat,
  syncDeliverablesFromAssets,
  updateDeliverableMetadata,
  createDeliverableFromAsset,
  assetTypeToFormatFamily,
} from './entry001DeliverableStore.js';
import { buildFormatWorkspaceSummaries } from './entry001FormatWorkspaces.js';
import { buildPackagePreviewComposition } from './entry001PackagePreview.js';
import type { Entry001DeliverableRecord, Entry001FormatFamily } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

const STORAGE_KEY = 'site00_entry001_archive_state_v2';

export type SaveState = 'idle' | 'loading' | 'saving' | 'saved' | 'failed';

function writeLegacyCache(state: Entry001ArchiveStatePersisted): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* optional write-through cache */
  }
}

export type PendingClassificationItem = {
  assetId: string;
  file: File;
  previewUrl: string;
  suggestion: Entry001AssetClassificationSuggestion;
  assetType: Entry001AssetType;
  assetRole: Entry001ContentRole | null;
  accepted: boolean;
};

function persistState(state: Entry001ArchiveStatePersisted): void {
  writeLegacyCache(state);
}

export type PostUploadSuccess = {
  deliverableId: string;
  title: string;
  formatFamily: Entry001FormatFamily;
};

export function useEntry001PackageState() {
  const [persisted, setPersisted] = useState<Entry001ArchiveStatePersisted>({
    overrides: {},
    removedAssetIds: [],
    archivedAssets: [],
    extraAssets: [],
  });
  const [deliverablePersisted, setDeliverablePersisted] = useState(() => loadDeliverablesState());
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
  const [postUploadSuccess, setPostUploadSuccess] = useState<PostUploadSuccess | null>(null);

  const applyApiResponse = useCallback((body: CampaignPackageApiResponse) => {
    if (body.legacy) {
      setPersisted(body.legacy);
      writeLegacyCache(body.legacy);
    }
    const snap = body.snapshot as {
      package?: { packageId?: string };
      sequences?: Array<{ formatFamily: string; versionNumber: number; orderedAssetIds: string[]; isCurrent: boolean }>;
    } | null;
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
      setOrderedCarouselIds((body.carouselAssets as Array<{ assetId: string }>).map((a) => a.assetId));
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
        const migrated = await migrateCampaignPackage(
          legacy as import('../../../../../shared/site00-campaign-package/types.js').LegacyEntry001LocalState,
        );
        applyApiResponse(migrated);
        markLocalMigrationComplete();
      } else if (!isLocalMigrationComplete() && legacy) {
        setPersisted(legacy);
      } else {
        const body = await fetchCampaignPackage();
        applyApiResponse(body);
      }
      setSaveState('saved');
      setSyncRequired(false);
    } catch {
      const legacy = readLegacyLocalStorage();
      if (legacy) {
        setPersisted(legacy);
        setSaveState('idle');
      } else {
        setSaveState('failed');
      }
      setSaveError('PACKAGE SYNC REQUIRED');
      setSyncRequired(true);
    }
  }, [applyApiResponse]);

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
    const frames = activeArchive.filter((a) => a.assetType === 'STORY_FRAME' || a.assetType === 'CTA_FRAME');
    if (!orderedStoryIds.length) return frames.sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0));
    return orderedStoryIds
      .map((id) => frames.find((f) => f.assetId === id))
      .filter(Boolean) as Entry001CampaignAsset[];
  }, [activeArchive, orderedStoryIds]);

  const deliverables = useMemo(
    () =>
      syncDeliverablesFromAssets(
        activeArchive,
        persisted.extraAssets,
        deliverablePersisted.deliverables,
      ),
    [activeArchive, persisted.extraAssets, deliverablePersisted.deliverables],
  );

  const formatSummaries = useMemo(() => buildFormatWorkspaceSummaries(deliverables), [deliverables]);

  const filteredArchive = useMemo(
    () => filterArchiveAssets(activeArchive, archiveFilter),
    [activeArchive, archiveFilter],
  );

  const archiveGroups = useMemo(() => groupAssetsByType(filteredArchive), [filteredArchive]);

  const readiness = useMemo(
    () => buildEntry001PackageReadiness(activeArchive, persisted.extraAssets, deliverables),
    [activeArchive, persisted.extraAssets, deliverables],
  );

  const packagePreview = useMemo(
    () => buildPackagePreviewComposition(deliverables, readiness),
    [deliverables, readiness],
  );

  const intelligence = useMemo(() => buildEntry001ArchiveIntelligence(activeArchive), [activeArchive]);

  const parentPackages = useMemo(() => buildParentPackages(activeArchive), [activeArchive]);

  const missingDeliverables = useMemo(() => {
    const activeDeliverables = deliverables.filter((d) => !d.removedFromPackage && d.status !== 'DELETED');
    const filled = new Set(
      activeDeliverables.filter((d) => d.approved && d.filePath).map((d) => d.assetType),
    );
    const allSlots = [
      ...buildEntry001MissingDeliverablePlaceholders(new Set()),
      ...buildEntry001MissingDeliverablePlaceholders(filled),
    ];
    const uniqueTypes = [...new Set(allSlots.map((s) => s.assetType))];
    return uniqueTypes.map((assetType) => {
      const placeholder = buildEntry001MissingDeliverablePlaceholders(new Set()).find((p) => p.assetType === assetType)!;
      const resolved = activeDeliverables.find(
        (d) => d.assetType === assetType && d.filePath,
      );
      if (resolved) {
        return {
          ...placeholder,
          assetId: resolved.assetId,
          filePath: resolved.filePath,
          title: resolved.title,
          status: resolved.approved ? ('APPROVED' as const) : ('AWAITING_FOUNDER_APPROVAL' as const),
          approved: resolved.approved,
        };
      }
      return placeholder;
    });
  }, [deliverables]);

  const updateDeliverables = useCallback(
    (updater: (prev: Entry001DeliverableRecord[]) => Entry001DeliverableRecord[]) => {
      setDeliverablePersisted((prev) => {
        const next = { deliverables: updater(prev.deliverables) };
        persistDeliverablesState(next);
        return next;
      });
    },
    [],
  );

  const syncDeliverablesAfterAssetChange = useCallback(
    (nextExtraAssets: Entry001CampaignAsset[]) => {
      const nextActive = buildActiveArchive(persisted.overrides, persisted.removedAssetIds, nextExtraAssets);
      const synced = syncDeliverablesFromAssets(nextActive, nextExtraAssets, deliverablePersisted.deliverables);
      persistDeliverablesState({ deliverables: synced });
      setDeliverablePersisted({ deliverables: synced });
    },
    [persisted.overrides, persisted.removedAssetIds, deliverablePersisted.deliverables],
  );

  const updatePersisted = useCallback((updater: (prev: Entry001ArchiveStatePersisted) => Entry001ArchiveStatePersisted) => {
    setPersisted((prev) => {
      const next = updater(prev);
      persistState(next);
      syncDeliverablesAfterAssetChange(next.extraAssets);
      return next;
    });
  }, [syncDeliverablesAfterAssetChange]);

  const removeFromArchive = useCallback(
    (assetId: string) => {
      updatePersisted((prev) => {
        const asset =
          activeArchive.find((a) => a.assetId === assetId) ??
          prev.extraAssets.find((a) => a.assetId === assetId);
        if (!asset) return prev;
        const archivedCopy: Entry001CampaignAsset = {
          ...asset,
          status: 'ARCHIVED',
          removedFromActiveArchive: true,
          archivedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          removedAssetIds: [...new Set([...prev.removedAssetIds, assetId])],
          archivedAssets: [...prev.archivedAssets.filter((a) => a.assetId !== assetId), archivedCopy],
          extraAssets: prev.extraAssets.filter((a) => a.assetId !== assetId),
        };
      });
      setSaveState('saving');
      void removeCampaignAssetApi(assetId)
        .then(applyApiResponse)
        .then(() => setSaveState('saved'))
        .catch(() => {
          setSaveState('failed');
          setSaveError('SAVE FAILED — Your change could not be saved.');
          void hydrate();
        });
    },
    [activeArchive, updatePersisted, applyApiResponse, hydrate],
  );

  const restoreToArchive = useCallback(
    (assetId: string) => {
      updatePersisted((prev) => {
        const archived = prev.archivedAssets.find((a) => a.assetId === assetId);
        if (!archived) return prev;
        const restored: Entry001CampaignAsset = {
          ...archived,
          status: 'APPROVED',
          removedFromActiveArchive: false,
          archivedAt: null,
        };
        const isExtra = archived.filePath.startsWith('blob:');
        return {
          ...prev,
          removedAssetIds: prev.removedAssetIds.filter((id) => id !== assetId),
          archivedAssets: prev.archivedAssets.filter((a) => a.assetId !== assetId),
          extraAssets: isExtra
            ? [...prev.extraAssets.filter((a) => a.assetId !== assetId), restored]
            : prev.extraAssets,
          overrides: isExtra
            ? prev.overrides
            : {
                ...prev.overrides,
                [assetId]: {
                  status: 'APPROVED',
                  removedFromActiveArchive: false,
                  archivedAt: null,
                },
              },
        };
      });
      setSaveState('saving');
      void restoreCampaignAssetApi(assetId)
        .then(applyApiResponse)
        .then(() => setSaveState('saved'))
        .catch(() => {
          setSaveState('failed');
          setSaveError('SAVE FAILED — Your change could not be saved.');
          void hydrate();
        });
    },
    [updatePersisted, applyApiResponse, hydrate],
  );

  const reclassifyAsset = useCallback(
    (assetId: string, assetType: Entry001AssetType, assetRole: Entry001ContentRole | null) => {
      updatePersisted((prev) => {
        const existing =
          activeArchive.find((a) => a.assetId === assetId) ??
          prev.extraAssets.find((a) => a.assetId === assetId);
        const prevType = existing?.assetType;
        const prevRole = existing?.assetRole;
        const patch: Partial<Entry001CampaignAsset> = {
          assetType,
          assetRole,
          role: assetTypeToLegacyRole(assetType),
          updatedAt: new Date().toISOString(),
          classificationHistory: [
            ...(existing?.classificationHistory ?? []),
            {
              at: new Date().toISOString(),
              previousAssetType: prevType,
              previousAssetRole: prevRole ?? null,
              newAssetType: assetType,
              newAssetRole: assetRole,
              reason: 'FOUNDER_EDIT' as const,
            },
          ],
        };
        const isExtra = prev.extraAssets.some((a) => a.assetId === assetId);
        if (isExtra) {
          return {
            ...prev,
            extraAssets: prev.extraAssets.map((a) =>
              a.assetId === assetId ? enrichAssetWithTaxonomy({ ...a, ...patch }) : a,
            ),
          };
        }
        return {
          ...prev,
          overrides: { ...prev.overrides, [assetId]: { ...prev.overrides[assetId], ...patch } },
        };
      });
    },
    [activeArchive, updatePersisted],
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
      updatePersisted((prev) => {
        const newAssets: Entry001CampaignAsset[] = items.map((p, index) => ({
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          classificationHistory: [
            {
              at: new Date().toISOString(),
              newAssetType: p.assetType,
              newAssetRole: p.assetRole,
              reason: 'INGESTION',
            },
          ],
          notes: `AI suggested ${p.suggestion.confidence}: ${p.suggestion.rationale}`,
        }));
        const last = newAssets[newAssets.length - 1];
        if (last) {
          const record = createDeliverableFromAsset(last);
          setPostUploadSuccess({
            deliverableId: record.deliverableId,
            title: record.title,
            formatFamily: assetTypeToFormatFamily(last.assetType),
          });
        }
        return { ...prev, extraAssets: [...prev.extraAssets, ...newAssets.map(enrichAssetWithTaxonomy)] };
      });
    },
    [updatePersisted],
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

  const dismissPendingQueue = useCallback(() => {
    setPendingQueue([]);
  }, []);

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
      updatePersisted((prev) => ({
        ...prev,
        extraAssets: [...prev.extraAssets.filter((a) => a.role !== role), asset],
      }));
      const record = createDeliverableFromAsset(asset);
      setPostUploadSuccess({
        deliverableId: record.deliverableId,
        title: record.title,
        formatFamily: assetTypeToFormatFamily(assetType),
      });
      return assetId;
    },
    [updatePersisted],
  );

  const removeDeliverableFromPackageAction = useCallback(
    (deliverableId: string) => {
      updateDeliverables((prev) => removeDeliverableFromPackage(prev, deliverableId));
      const d = getDeliverableById(deliverables, deliverableId);
      if (d) {
        updatePersisted((prev) => ({
          ...prev,
          extraAssets: prev.extraAssets.filter((a) => a.assetId !== d.assetId),
        }));
      }
    },
    [updateDeliverables, deliverables, updatePersisted],
  );

  const archiveDeliverableAction = useCallback(
    (deliverableId: string) => {
      updateDeliverables((prev) => archiveDeliverable(prev, deliverableId));
      const d = getDeliverableById(deliverables, deliverableId);
      if (d) removeFromArchive(d.assetId);
    },
    [updateDeliverables, deliverables, removeFromArchive],
  );

  const restoreDeliverableAction = useCallback(
    (deliverableId: string) => {
      updateDeliverables((prev) => restoreDeliverableToPackage(prev, deliverableId));
      const d = getDeliverableById(deliverables, deliverableId);
      if (d) restoreToArchive(d.assetId);
    },
    [updateDeliverables, deliverables, restoreToArchive],
  );

  const deleteDeliverablePermanentlyAction = useCallback(
    (deliverableId: string) => {
      updateDeliverables((prev) => deleteDeliverablePermanently(prev, deliverableId));
    },
    [updateDeliverables],
  );

  const replaceDeliverableFileAction = useCallback(
    (deliverableId: string, file: File) => {
      const url = URL.createObjectURL(file);
      updateDeliverables((prev) =>
        replaceDeliverableFile(prev, deliverableId, url, file.name.replace(/\.[^.]+$/, '').toUpperCase()),
      );
      const d = getDeliverableById(deliverables, deliverableId);
      if (d) {
        updatePersisted((prev) => ({
          ...prev,
          extraAssets: prev.extraAssets.map((a) =>
            a.assetId === d.assetId ? { ...a, filePath: url, title: file.name.replace(/\.[^.]+$/, '').toUpperCase() } : a,
          ),
        }));
      }
    },
    [updateDeliverables, deliverables, updatePersisted],
  );

  const editDeliverableMetadata = useCallback(
    (
      deliverableId: string,
      patch: Parameters<typeof updateDeliverableMetadata>[2],
    ) => {
      updateDeliverables((prev) => updateDeliverableMetadata(prev, deliverableId, patch));
      const d = getDeliverableById(deliverables, deliverableId);
      if (d && (patch.title || patch.assetType || patch.assetRole)) {
        updatePersisted((prev) => ({
          ...prev,
          extraAssets: prev.extraAssets.map((a) =>
            a.assetId === d.assetId
              ? enrichAssetWithTaxonomy({
                  ...a,
                  title: patch.title ?? a.title,
                  assetType: patch.assetType ?? a.assetType,
                  assetRole: patch.assetRole ?? a.assetRole,
                  role: patch.assetType ? assetTypeToLegacyRole(patch.assetType) : a.role,
                })
              : a,
          ),
        }));
      }
    },
    [updateDeliverables, deliverables, updatePersisted],
  );

  const reorderFormatDeliverables = useCallback(
    (formatFamily: Entry001FormatFamily, orderedIds: string[]) => {
      updateDeliverables((prev) => reorderDeliverablesInFormat(prev, formatFamily, orderedIds));
    },
    [updateDeliverables],
  );

  const reorderFormatSequence = useCallback(
    async (formatFamily: 'CAROUSEL' | 'STORY', orderedAssetIds: string[]) => {
      const expectedVersion =
        formatFamily === 'CAROUSEL' ? (backendMeta.carouselVersion ?? 1) : (backendMeta.storyVersion ?? 1);
      if (formatFamily === 'CAROUSEL') setOrderedCarouselIds(orderedAssetIds);
      else setOrderedStoryIds(orderedAssetIds);
      updateDeliverables((prev) => {
        const deliverableIds = orderedAssetIds
          .map((assetId) => prev.find((d) => d.assetId === assetId)?.deliverableId)
          .filter(Boolean) as string[];
        return reorderDeliverablesInFormat(prev, formatFamily, deliverableIds);
      });
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
    [backendMeta, applyApiResponse, hydrate, updateDeliverables],
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

  const dismissPostUploadSuccess = useCallback(() => setPostUploadSuccess(null), []);

  const getDeliverable = useCallback(
    (deliverableId: string) => getDeliverableById(deliverables, deliverableId),
    [deliverables],
  );

  const approveUploadedAsset = useCallback((_assetId: string) => {
    applyPendingClassifications();
  }, [applyPendingClassifications]);

  const batchAddAssets = useCallback(
    (files: FileList | File[]) => {
      queueFilesForClassification(files);
    },
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
    archiveFilter,
    setArchiveFilter,
    pendingQueue,
    updatePendingClassification,
    applyPendingClassifications,
    acceptAllPendingAndApply,
    dismissPendingQueue,
    setPendingAccepted: (assetId: string, accepted: boolean) =>
      setPendingQueue((prev) => prev.map((p) => (p.assetId === assetId ? { ...p, accepted } : p))),
    removeFromArchive,
    restoreToArchive,
    reclassifyAsset,
    addAssetForRole,
    approveUploadedAsset,
    batchAddAssets,
    approvedArchiveCount: readiness.activeArchiveCount,
    deliverables,
    formatSummaries,
    packagePreview,
    postUploadSuccess,
    dismissPostUploadSuccess,
    getDeliverable,
    removeDeliverableFromPackage: removeDeliverableFromPackageAction,
    archiveDeliverable: archiveDeliverableAction,
    restoreDeliverable: restoreDeliverableAction,
    deleteDeliverablePermanently: deleteDeliverablePermanentlyAction,
    replaceDeliverableFile: replaceDeliverableFileAction,
    editDeliverableMetadata,
    reorderFormatDeliverables,
    reorderFormatSequence,
    moveSequenceItem,
    carouselSlides,
    storyFrames,
    orderedCarouselIds,
    orderedStoryIds,
    saveState,
    saveError,
    syncRequired,
    retrySync: hydrate,
    backendMeta,
  };
}
