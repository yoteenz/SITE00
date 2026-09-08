/**
 * B5.2 — Entry 001 package local state (uploads + placeholder resolution).
 */

import { useCallback, useMemo, useState } from 'react';
import type { Entry001CampaignAsset } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_HERO_ASSET,
  buildEntry001MissingDeliverablePlaceholders,
} from '../../../config/entry001CampaignAssets.js';
import { buildEntry001PackageReadiness } from './entry001PackageReadiness.js';

const STORAGE_KEY = 'site00_entry001_package_extra_v1';

function loadExtra(): Entry001CampaignAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Entry001CampaignAsset[];
  } catch {
    return [];
  }
}

function persistExtra(assets: Entry001CampaignAsset[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function useEntry001PackageState() {
  const [extraAssets, setExtraAssets] = useState<Entry001CampaignAsset[]>(() => loadExtra());

  const readiness = useMemo(() => buildEntry001PackageReadiness(extraAssets), [extraAssets]);

  const approvedArchive = useMemo(
    () => [...ENTRY001_APPROVED_ARCHIVE],
    [],
  );

  const missingDeliverables = useMemo(() => {
    const filled = new Set(
      extraAssets.filter((a) => a.approved && a.filePath).map((a) => a.role),
    );
    return buildEntry001MissingDeliverablePlaceholders(filled);
  }, [extraAssets]);

  const resolvedDeliverables = useMemo(() => {
    return missingDeliverables.map((placeholder) => {
      const resolved = extraAssets.find(
        (a) => a.role === placeholder.role && a.approved && a.filePath,
      );
      return resolved ?? placeholder;
    });
  }, [extraAssets, missingDeliverables]);

  const addAssetForRole = useCallback(
    (role: Entry001CampaignAsset['role'], file: File, autoApprove = false) => {
      const objectUrl = URL.createObjectURL(file);
      const assetId = `entry001-upload-${role.toLowerCase()}-${Date.now()}`;
      const asset: Entry001CampaignAsset = {
        assetId,
        entryId: 'entry-001',
        filePath: objectUrl,
        title: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
        format: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        role,
        status: autoApprove ? 'APPROVED' : 'AWAITING_FOUNDER_APPROVAL',
        source: 'FOUNDER_SUPPLIED',
        approved: autoApprove,
        version: 'upload-v001',
        notes: autoApprove ? 'Founder upload — approved' : 'Founder upload — pending approval',
      };
      setExtraAssets((prev) => {
        const next = [...prev.filter((a) => a.role !== role), asset];
        persistExtra(next);
        return next;
      });
      return assetId;
    },
    [],
  );

  const approveUploadedAsset = useCallback((assetId: string) => {
    setExtraAssets((prev) => {
      const next = prev.map((a) =>
        a.assetId === assetId
          ? { ...a, approved: true, status: 'APPROVED' as const, notes: 'Founder approved upload' }
          : a,
      );
      persistExtra(next);
      return next;
    });
  }, []);

  const batchAddAssets = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    list.forEach((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const asset: Entry001CampaignAsset = {
        assetId: `entry001-batch-${Date.now()}-${index}`,
        entryId: 'entry-001',
        filePath: objectUrl,
        title: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
        format: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        role: 'CAMPAIGN_PACKAGE_ASSET',
        status: 'AWAITING_FOUNDER_APPROVAL',
        source: 'FOUNDER_SUPPLIED',
        approved: false,
        version: 'batch-v001',
      };
      setExtraAssets((prev) => {
        const next = [...prev, asset];
        persistExtra(next);
        return next;
      });
    });
  }, []);

  return {
    heroAsset: ENTRY001_HERO_ASSET,
    approvedArchive,
    missingDeliverables: resolvedDeliverables,
    extraAssets,
    readiness,
    addAssetForRole,
    approveUploadedAsset,
    batchAddAssets,
    approvedArchiveCount: approvedArchive.length,
  };
}
