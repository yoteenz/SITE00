/**
 * B5.6 — In-memory campaign package store (tests + dev fallback).
 */

import type {
  CampaignAssetRecord,
  CampaignDeliverableRecord,
  CampaignDeliverableVersionRecord,
  CampaignFormatSequenceRecord,
  CampaignPackageAuditEvent,
  CampaignPackageMigrationReceipt,
  CampaignPackageRecord,
  CampaignPackageSnapshot,
} from '../../../shared/site00-campaign-package/types.js';

const packages = new Map<string, CampaignPackageRecord>();
const assetsByPackage = new Map<string, CampaignAssetRecord[]>();
const deliverablesByPackage = new Map<string, CampaignDeliverableRecord[]>();
const versionsByPackage = new Map<string, CampaignDeliverableVersionRecord[]>();
const sequencesByPackage = new Map<string, CampaignFormatSequenceRecord[]>();
const migrationsByPackage = new Map<string, CampaignPackageMigrationReceipt[]>();
const auditByPackage = new Map<string, CampaignPackageAuditEvent[]>();

export function resetCampaignPackageMemoryStore(): void {
  packages.clear();
  assetsByPackage.clear();
  deliverablesByPackage.clear();
  versionsByPackage.clear();
  sequencesByPackage.clear();
  migrationsByPackage.clear();
  auditByPackage.clear();
}

function list<T>(map: Map<string, T[]>, packageId: string): T[] {
  return map.get(packageId) ?? [];
}

export function getCampaignPackageSnapshot(packageKey: string): CampaignPackageSnapshot | null {
  const pkg = [...packages.values()].find((p) => p.packageKey === packageKey);
  if (!pkg) return null;
  return {
    package: pkg,
    assets: list(assetsByPackage, pkg.packageId),
    deliverables: list(deliverablesByPackage, pkg.packageId),
    versions: list(versionsByPackage, pkg.packageId),
    sequences: list(sequencesByPackage, pkg.packageId),
    migrationReceipts: list(migrationsByPackage, pkg.packageId),
    auditEvents: list(auditByPackage, pkg.packageId),
  };
}

export function upsertCampaignPackageSnapshot(snapshot: CampaignPackageSnapshot): CampaignPackageSnapshot {
  packages.set(snapshot.package.packageId, snapshot.package);
  assetsByPackage.set(snapshot.package.packageId, snapshot.assets);
  deliverablesByPackage.set(snapshot.package.packageId, snapshot.deliverables);
  versionsByPackage.set(snapshot.package.packageId, snapshot.versions);
  sequencesByPackage.set(snapshot.package.packageId, snapshot.sequences);
  migrationsByPackage.set(snapshot.package.packageId, snapshot.migrationReceipts);
  auditByPackage.set(snapshot.package.packageId, snapshot.auditEvents);
  return snapshot;
}

export function appendAuditEvent(event: CampaignPackageAuditEvent): void {
  const events = list(auditByPackage, event.packageId);
  auditByPackage.set(event.packageId, [...events, event]);
}

export function appendMigrationReceipt(receipt: CampaignPackageMigrationReceipt): void {
  const receipts = list(migrationsByPackage, receipt.packageId);
  migrationsByPackage.set(receipt.packageId, [...receipts, receipt]);
}

export function getCampaignPackageByKey(packageKey: string): CampaignPackageRecord | null {
  return [...packages.values()].find((p) => p.packageKey === packageKey) ?? null;
}
