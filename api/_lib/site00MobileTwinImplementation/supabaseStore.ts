import { getSupabaseAdmin } from '../supabase.js';
import type {
  CompiledMobileTwinImplementationDocument,
  ImplementationStructuralFidelityReceipt,
  ImplementationVisualFidelityReceipt,
  MobileTwinImplementationBuildRecord,
  MobileTwinPackageApprovalRecord,
  MobileTwinPromotionReadinessReceipt,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import type { MobileTwinImplementationStateRow, PersistPackageApprovalInput } from './types.js';

export async function mobileTwinImplementationTablesExist(): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('site00_mobile_twin_package_approvals').select('id').limit(1);
  return !error;
}

export async function persistPackageApprovalSupabase(input: PersistPackageApprovalInput): Promise<MobileTwinPackageApprovalRecord> {
  const sb = getSupabaseAdmin();
  const row = {
    id: input.record.id,
    project_id: input.record.projectId,
    workspace_type: input.record.workspaceType,
    viewport: input.record.viewport,
    package_id: input.record.packageId,
    package_checksum: input.record.packageChecksum,
    composition_state_id: input.record.compositionStateId,
    composition_hash: input.record.compositionHash,
    actual_render_id: input.record.actualRenderId,
    actual_render_hash: input.record.actualRenderHash,
    blueprint_render_id: input.record.blueprintRenderId,
    blueprint_render_hash: input.record.blueprintRenderHash,
    implementation_visual_authority_id: input.record.implementationVisualAuthorityId,
    provider_strategy: input.record.providerStrategy,
    feature_manifest_version: input.record.featureManifestVersion,
    project_context_version: input.record.projectContextVersion,
    approved_at: input.record.approvedAt,
    approved_by: input.record.approvedBy,
    approval_version: input.record.approvalVersion,
    status: input.record.status,
    source: input.record.source,
    approval_payload: { record: input.record, sessionSnapshot: input.sessionSnapshot },
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from('site00_mobile_twin_package_approvals').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  await sb.from('site00_mobile_twin_implementation_state').upsert({
    project_id: input.projectId.toLowerCase(),
    status: 'READY_TO_COMPILE',
    latest_package_approval_id: input.record.id,
    latest_build_id: null,
    implementation_payload: { sessionSnapshot: input.sessionSnapshot },
    updated_at: new Date().toISOString(),
  });
  return input.record;
}

export async function getImplementationStateSupabase(projectId: string): Promise<MobileTwinImplementationStateRow | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('site00_mobile_twin_implementation_state')
    .select('*')
    .eq('project_id', projectId.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    projectId: data.project_id,
    status: data.status,
    latestPackageApprovalId: data.latest_package_approval_id,
    latestBuildId: data.latest_build_id,
    implementationPayload: (data.implementation_payload as Record<string, unknown>) ?? {},
    updatedAt: data.updated_at,
  };
}

export async function saveBuildSupabase(input: {
  projectId: string;
  build: MobileTwinImplementationBuildRecord;
  document: CompiledMobileTwinImplementationDocument;
  visual: ImplementationVisualFidelityReceipt;
  structural: ImplementationStructuralFidelityReceipt;
  promotion: MobileTwinPromotionReadinessReceipt;
  status: string;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error: buildErr } = await sb.from('site00_mobile_twin_implementation_builds').insert({
    id: input.build.id,
    project_id: input.projectId.toLowerCase(),
    package_approval_id: input.build.packageApprovalId,
    package_id: input.build.packageId,
    package_checksum: input.build.packageChecksum,
    composition_hash: input.build.compositionHash,
    implementation_version: input.build.implementationVersion,
    preview_route: input.build.previewRoute,
    compiled_at: input.build.compiledAt,
    build_status: input.build.buildStatus,
    compiled_document: input.document,
    visual_fidelity_receipt: input.visual,
    structural_fidelity_receipt: input.structural,
    functional_qa: { pass: input.promotion.noCriticalFunctionalFailures },
    founder_status: input.build.founderStatus,
    promotion_status: input.build.promotionStatus,
    history: input.build.implementationVersion,
    updated_at: new Date().toISOString(),
  });
  if (buildErr) throw new Error(buildErr.message);
  await sb.from('site00_mobile_twin_implementation_state').upsert({
    project_id: input.projectId.toLowerCase(),
    status: input.status,
    latest_package_approval_id: input.build.packageApprovalId,
    latest_build_id: input.build.id,
    implementation_payload: {
      latestBuild: input.build,
      visualFidelity: input.visual,
      structuralFidelity: input.structural,
      promotion: input.promotion,
    },
    updated_at: new Date().toISOString(),
  });
}

export async function getBuildSupabase(buildId: string): Promise<{
  build: MobileTwinImplementationBuildRecord;
  document: CompiledMobileTwinImplementationDocument;
  visual: ImplementationVisualFidelityReceipt | null;
  structural: ImplementationStructuralFidelityReceipt | null;
} | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('site00_mobile_twin_implementation_builds').select('*').eq('id', buildId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const build: MobileTwinImplementationBuildRecord = {
    id: data.id,
    packageApprovalId: data.package_approval_id,
    packageId: data.package_id,
    packageChecksum: data.package_checksum,
    compositionHash: data.composition_hash,
    implementationVersion: data.implementation_version,
    previewRoute: data.preview_route,
    compiledAt: data.compiled_at,
    buildStatus: data.build_status,
    compiledDocument: data.compiled_document as CompiledMobileTwinImplementationDocument,
    visualFidelityReceiptId: (data.visual_fidelity_receipt as ImplementationVisualFidelityReceipt | null)?.id ?? null,
    structuralFidelityReceiptId: (data.structural_fidelity_receipt as ImplementationStructuralFidelityReceipt | null)?.id ?? null,
    founderStatus: data.founder_status,
    promotionStatus: data.promotion_status,
  };
  return {
    build,
    document: data.compiled_document as CompiledMobileTwinImplementationDocument,
    visual: data.visual_fidelity_receipt as ImplementationVisualFidelityReceipt | null,
    structural: data.structural_fidelity_receipt as ImplementationStructuralFidelityReceipt | null,
  };
}

export async function updateBuildFounderStatusSupabase(input: {
  projectId: string;
  buildId: string;
  founderStatus: MobileTwinImplementationBuildRecord['founderStatus'];
  promotion: MobileTwinPromotionReadinessReceipt;
  status: string;
}): Promise<MobileTwinImplementationBuildRecord | null> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from('site00_mobile_twin_implementation_builds')
    .update({
      founder_status: input.founderStatus,
      promotion_status: input.promotion.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.buildId);
  if (error) throw new Error(error.message);
  await sb.from('site00_mobile_twin_implementation_state').upsert({
    project_id: input.projectId.toLowerCase(),
    status: input.status,
    latest_build_id: input.buildId,
    implementation_payload: { promotion: input.promotion },
    updated_at: new Date().toISOString(),
  });
  const loaded = await getBuildSupabase(input.buildId);
  return loaded?.build ?? null;
}
