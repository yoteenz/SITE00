/**
 * B5.2 / B5.4 — Entry 001 package state (typed archive, ingestion, remove/restore).
 */

import { useCallback, useMemo, useState } from 'react';
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

const STORAGE_KEY = 'site00_entry001_archive_state_v2';

export type PendingClassificationItem = {
  assetId: string;
  file: File;
  previewUrl: string;
  suggestion: Entry001AssetClassificationSuggestion;
  assetType: Entry001AssetType;
  assetRole: Entry001ContentRole | null;
  accepted: boolean;
};

function loadState(): Entry001ArchiveStatePersisted {
  if (typeof window === 'undefined') {
    return { overrides: {}, removedAssetIds: [], archivedAssets: [], extraAssets: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { overrides: {}, removedAssetIds: [], archivedAssets: [], extraAssets: [] };
    return JSON.parse(raw) as Entry001ArchiveStatePersisted;
  } catch {
    return { overrides: {}, removedAssetIds: [], archivedAssets: [], extraAssets: [] };
  }
}

function persistState(state: Entry001ArchiveStatePersisted): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useEntry001PackageState() {
  const [persisted, setPersisted] = useState<Entry001ArchiveStatePersisted>(() => loadState());
  const [pendingQueue, setPendingQueue] = useState<PendingClassificationItem[]>([]);
  const [archiveFilter, setArchiveFilter] = useState<Entry001ArchiveFilter>('ALL');

  const activeArchive = useMemo(
    () => buildActiveArchive(persisted.overrides, persisted.removedAssetIds, persisted.extraAssets),
    [persisted],
  );

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

  const updatePersisted = useCallback((updater: (prev: Entry001ArchiveStatePersisted) => Entry001ArchiveStatePersisted) => {
    setPersisted((prev) => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, []);

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
    },
    [activeArchive, updatePersisted],
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
    },
    [updatePersisted],
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
      return assetId;
    },
    [updatePersisted],
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
  };
}
