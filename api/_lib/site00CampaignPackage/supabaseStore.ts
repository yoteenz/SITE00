/**
 * B5.6R1 — Supabase-backed campaign package store (production canonical).
 */

import { getSupabaseAdmin } from '../supabase.js';
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

type PackageRow = Record<string, unknown>;

async function resolvePackageUuid(packageKey: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_campaign_packages')
    .select('id')
    .eq('package_key', packageKey)
    .maybeSingle();
  if (error) throw error;
  return data ? String(data.id) : null;
}

function mapPackageRow(row: PackageRow): CampaignPackageRecord {
  const metadata = (row.metadata as Record<string, unknown>) ?? {};
  return {
    packageId: String(metadata.packageId ?? row.id),
    packageKey: String(row.package_key),
    projectId: String(row.project_id),
    brandId: String(row.brand_id),
    entryId: String(row.entry_id),
    packageType: String(row.package_type),
    status: row.status as CampaignPackageRecord['status'],
    previewReadiness: String(row.preview_readiness),
    campaignBoardEligibility: Boolean(row.campaign_board_eligibility),
    migrationVersion: Number(row.migration_version ?? 0),
    migrationComplete: Boolean(row.migration_complete),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    metadata,
  };
}

function mapAssetRow(row: PackageRow, packageId: string): CampaignAssetRecord {
  return {
    assetId: String(row.asset_key),
    packageId,
    entryId: String(row.entry_id),
    assetType: String(row.asset_type),
    assetRole: (row.asset_role as string | null) ?? null,
    formatFamily: (row.format_family as CampaignAssetRecord['formatFamily']) ?? null,
    platform: (row.platform as string | null) ?? null,
    title: String(row.title),
    filePath: String(row.file_path),
    format: row.format as CampaignAssetRecord['format'],
    legacyRole: String(row.legacy_role),
    source: row.source as CampaignAssetRecord['source'],
    storageSource: row.storage_source as CampaignAssetRecord['storageSource'],
    status: String(row.status),
    founderJudgment: (row.founder_judgment as string | null) ?? null,
    approved: Boolean(row.approved),
    sequenceIndex: (row.sequence_index as number | null) ?? null,
    parentAssetId: (row.parent_asset_key as string | null) ?? null,
    packageMembershipId: (row.package_membership_id as string | null) ?? null,
    removedFromActiveArchive: Boolean(row.removed_from_active_archive),
    archivedAt: (row.archived_at as string | null) ?? null,
    caption: (row.caption as string | null) ?? null,
    versionLabel: String(row.version_label ?? 'v001'),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    lineage: (row.lineage as Record<string, unknown>) ?? {},
    classificationHistory: (row.classification_history as Array<Record<string, unknown>>) ?? [],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function assetToRow(asset: CampaignAssetRecord, packageUuid: string): Record<string, unknown> {
  return {
    package_id: packageUuid,
    asset_key: asset.assetId,
    entry_id: asset.entryId,
    asset_type: asset.assetType,
    asset_role: asset.assetRole,
    format_family: asset.formatFamily,
    platform: asset.platform,
    title: asset.title,
    file_path: asset.filePath,
    format: asset.format,
    legacy_role: asset.legacyRole,
    source: asset.source,
    storage_source: asset.storageSource,
    status: asset.status,
    founder_judgment: asset.founderJudgment,
    approved: asset.approved,
    sequence_index: asset.sequenceIndex,
    parent_asset_key: asset.parentAssetId,
    package_membership_id: asset.packageMembershipId,
    removed_from_active_archive: asset.removedFromActiveArchive,
    archived_at: asset.archivedAt,
    caption: asset.caption,
    version_label: asset.versionLabel,
    metadata: asset.metadata,
    lineage: asset.lineage,
    classification_history: asset.classificationHistory,
    updated_at: asset.updatedAt,
  };
}

function mapDeliverableRow(row: PackageRow, packageId: string): CampaignDeliverableRecord {
  return {
    deliverableId: String(row.deliverable_key),
    packageId,
    assetId: row.asset_id ? String(row.asset_id) : null,
    formatFamily: String(row.format_family),
    platform: String(row.platform),
    deliverableType: String(row.deliverable_type),
    status: String(row.status),
    currentVersionId: row.current_version_id ? String(row.current_version_id) : null,
    removedFromPackage: Boolean(row.removed_from_package),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    lineage: (row.lineage as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVersionRow(row: PackageRow): CampaignDeliverableVersionRecord {
  return {
    versionId: String(row.id),
    deliverableId: String(row.deliverable_id),
    versionNumber: Number(row.version_number),
    filePath: String(row.file_path),
    caption: (row.caption as string | null) ?? null,
    title: String(row.title),
    assetType: String(row.asset_type),
    assetRole: (row.asset_role as string | null) ?? null,
    sequenceIndex: (row.sequence_index as number | null) ?? null,
    source: row.source as CampaignDeliverableVersionRecord['source'],
    storageSource: row.storage_source as CampaignDeliverableVersionRecord['storageSource'],
    createdAt: String(row.created_at),
    createdBy: (row.created_by as string | null) ?? null,
    supersededAt: (row.superseded_at as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

function mapSequenceRow(row: PackageRow, packageId: string): CampaignFormatSequenceRecord {
  return {
    sequenceId: String(row.id),
    packageId,
    formatFamily: row.format_family as CampaignFormatSequenceRecord['formatFamily'],
    platform: String(row.platform),
    orderedAssetIds: (row.ordered_asset_keys as string[]) ?? [],
    versionNumber: Number(row.version_number),
    isCurrent: Boolean(row.is_current),
    sequenceChangedAt: (row.sequence_changed_at as string | null) ?? null,
    updatedAt: String(row.updated_at),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

export async function campaignPackageSchemaExists(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from('site00_campaign_packages').select('id').limit(1);
  return !error;
}

export async function getCampaignPackageSnapshotFromSupabase(
  packageKey: string,
): Promise<CampaignPackageSnapshot | null> {
  const { data: pkgRow, error: pkgErr } = await getSupabaseAdmin()
    .from('site00_campaign_packages')
    .select('*')
    .eq('package_key', packageKey)
    .maybeSingle();
  if (pkgErr) throw pkgErr;
  if (!pkgRow) return null;

  const packageUuid = String(pkgRow.id);
  const pkg = mapPackageRow(pkgRow);

  const [assetsRes, deliverablesRes, sequencesRes, migrationsRes, auditRes] = await Promise.all([
    getSupabaseAdmin().from('site00_campaign_package_assets').select('*').eq('package_id', packageUuid),
    getSupabaseAdmin().from('site00_campaign_deliverables').select('*').eq('package_id', packageUuid),
    getSupabaseAdmin().from('site00_campaign_format_sequences').select('*').eq('package_id', packageUuid),
    getSupabaseAdmin().from('site00_campaign_package_migrations').select('*').eq('package_id', packageUuid),
    getSupabaseAdmin().from('site00_campaign_package_audit_events').select('*').eq('package_id', packageUuid),
  ]);

  if (assetsRes.error) throw assetsRes.error;
  if (deliverablesRes.error) throw deliverablesRes.error;
  if (sequencesRes.error) throw sequencesRes.error;
  if (migrationsRes.error) throw migrationsRes.error;
  if (auditRes.error) throw auditRes.error;

  const deliverableRows = deliverablesRes.data ?? [];
  const deliverableUuids = deliverableRows.map((d) => String(d.id));

  let versions: CampaignDeliverableVersionRecord[] = [];
  if (deliverableUuids.length) {
    const { data: versionRows, error: versionErr } = await getSupabaseAdmin()
      .from('site00_campaign_deliverable_versions')
      .select('*')
      .in('deliverable_id', deliverableUuids);
    if (versionErr) throw versionErr;
    versions = (versionRows ?? []).map(mapVersionRow);
  }

  const tombstones = new Set(
    ((pkg.metadata?.deletedAssetTombstones as string[] | undefined) ?? []).map(String),
  );

  return {
    package: pkg,
    assets: (assetsRes.data ?? [])
      .map((r) => mapAssetRow(r, pkg.packageId))
      .filter((a) => !tombstones.has(a.assetId)),
    deliverables: deliverableRows.map((r) => mapDeliverableRow(r, pkg.packageId)),
    versions,
    sequences: (sequencesRes.data ?? []).map((r) => mapSequenceRow(r, pkg.packageId)),
    migrationReceipts: (migrationsRes.data ?? []).map(
      (r): CampaignPackageMigrationReceipt => ({
        migrationId: String(r.id),
        packageId: pkg.packageId,
        source: r.source as CampaignPackageMigrationReceipt['source'],
        recordsExamined: Number(r.records_examined ?? 0),
        recordsCreated: Number(r.records_created ?? 0),
        recordsUpdated: Number(r.records_updated ?? 0),
        recordsSkipped: Number(r.records_skipped ?? 0),
        errors: (r.errors as string[]) ?? [],
        completedAt: String(r.completed_at),
        legacyBackup: (r.legacy_backup as Record<string, unknown> | undefined) ?? undefined,
      }),
    ),
    auditEvents: (auditRes.data ?? []).map(
      (r): CampaignPackageAuditEvent => ({
        eventId: String(r.id),
        packageId: pkg.packageId,
        entryId: String(r.entry_id),
        actor: (r.actor as string | null) ?? null,
        eventType: r.event_type as CampaignPackageAuditEvent['eventType'],
        targetId: String(r.target_id),
        before: (r.before_state as Record<string, unknown> | null) ?? null,
        after: (r.after_state as Record<string, unknown> | null) ?? null,
        createdAt: String(r.created_at),
      }),
    ),
  };
}

export async function upsertCampaignPackageSnapshotToSupabase(
  snapshot: CampaignPackageSnapshot,
): Promise<CampaignPackageSnapshot> {
  const pkg = snapshot.package;
  const metadata = {
    ...(pkg.metadata ?? {}),
    packageId: pkg.packageId,
    deletedAssetTombstones: (pkg.metadata?.deletedAssetTombstones as string[] | undefined) ?? [],
    deletedDeliverableTombstones: (pkg.metadata?.deletedDeliverableTombstones as string[] | undefined) ?? [],
  };

  const { data: upsertedPkg, error: pkgErr } = await getSupabaseAdmin()
    .from('site00_campaign_packages')
    .upsert(
      {
        package_key: pkg.packageKey,
        project_id: pkg.projectId,
        brand_id: pkg.brandId,
        entry_id: pkg.entryId,
        package_type: pkg.packageType,
        status: pkg.status,
        preview_readiness: pkg.previewReadiness,
        campaign_board_eligibility: pkg.campaignBoardEligibility,
        migration_version: pkg.migrationVersion,
        migration_complete: pkg.migrationComplete,
        metadata,
        updated_at: pkg.updatedAt,
      },
      { onConflict: 'package_key' },
    )
    .select('*')
    .single();
  if (pkgErr || !upsertedPkg) throw pkgErr ?? new Error('Failed to upsert package');

  const packageUuid = String(upsertedPkg.id);

  for (const asset of snapshot.assets) {
    const { error } = await getSupabaseAdmin()
      .from('site00_campaign_package_assets')
      .upsert(assetToRow(asset, packageUuid), { onConflict: 'package_id,asset_key' });
    if (error) throw error;
  }

  for (const seq of snapshot.sequences) {
    const { error } = await getSupabaseAdmin().from('site00_campaign_format_sequences').upsert(
      {
        id: seq.sequenceId.includes('-') ? undefined : seq.sequenceId,
        package_id: packageUuid,
        format_family: seq.formatFamily,
        platform: seq.platform,
        ordered_asset_keys: seq.orderedAssetIds,
        version_number: seq.versionNumber,
        is_current: seq.isCurrent,
        sequence_changed_at: seq.sequenceChangedAt,
        metadata: seq.metadata,
        updated_at: seq.updatedAt,
      },
      { onConflict: seq.sequenceId.includes('-') ? undefined : 'id' },
    );
    if (error && !String(error.message).includes('duplicate')) throw error;
  }

  return snapshot;
}

export async function appendAuditEventToSupabase(event: CampaignPackageAuditEvent): Promise<void> {
  const packageUuid = await resolvePackageUuid(
    event.packageId.includes(':') ? event.packageId : `ndxbook:entry-001:main`,
  );
  if (!packageUuid) return;
  await getSupabaseAdmin().from('site00_campaign_package_audit_events').insert({
    package_id: packageUuid,
    entry_id: event.entryId,
    actor: event.actor,
    event_type: event.eventType,
    target_id: event.targetId,
    before_state: event.before,
    after_state: event.after,
  });
}
