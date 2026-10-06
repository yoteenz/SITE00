/**
 * Adapter: FAMILY PRODUCTION CONTRACTS → project graph (DESIGN domain).
 *
 * Source of truth: `FamilyProductionContract` records (shared/site00-product-families) — today JURNL F01–F16
 * (src/projects/families.ts). A family is a PAGE_FAMILY of the project's site / app: DESIGN owns it. Nothing is
 * authored here: statuses, authority files, assets, lineage and supersession are read from the contract.
 *
 * Decisions are only the founder's real ones: a family whose authority is IN_REVIEW asks for an authority verdict,
 * a family that is implemented + QA-passed but not founder-approved asks for implementation acceptance. Families
 * without a visual authority are BLOCKED on studio authority development — that is a blocker, not an inbox item.
 */
import type { FamilyAssetRequirement, FamilyProductionContract } from '../../site00-product-families/familyProductionContract.js';
import type {
  ArtifactRecord,
  ArtifactStatus,
  ArtifactType,
  AuthorityStatus,
  DecisionItem,
  ImplementationStatus,
  NodeStage,
  NodeStatus,
  PipelineStep,
  ProductionBlocker,
  ProductionNode,
  QaStatus,
  SourceTruthRef,
} from '../types.js';

export type FamilyContractInput = {
  contract: FamilyProductionContract;
  /** Family gate result (implementationReady / familyComplete) — evaluated by the host with the runtime coverage. */
  gate: { implementationReady: boolean; familyComplete: boolean };
};

export type FamilyGraphPart = {
  sources: SourceTruthRef[];
  nodes: ProductionNode[];
  artifacts: ArtifactRecord[];
  decisions: DecisionItem[];
};

/** `public/…` files are served from the site root; anything else is a repo reference (recorded, not mounted). */
export function publicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('public/')) return `/${path.slice('public/'.length)}`;
  if (path.startsWith('/')) return path;
  return null;
}

const ASSET_TYPE: Record<string, ArtifactType> = {
  BRAND_MARK: 'BRAND_MARK',
  LOGO: 'BRAND_MARK',
  ICON: 'ICON',
  ICON_SET: 'ICON',
  FAMILY_BACKGROUND: 'ILLUSTRATION',
  ENVIRONMENT_PLATE: 'ILLUSTRATION',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  ILLUSTRATION: 'ILLUSTRATION',
};

function assetStatus(a: FamilyAssetRequirement): ArtifactStatus {
  switch (a.status) {
    case 'CANONICAL':
      return 'CANONICAL';
    case 'REFERENCE_ONLY':
      return 'REFERENCE';
    case 'MISSING':
      return 'MISSING';
    case 'NOT_CANONICAL':
      return 'ARCHIVE';
    default:
      return 'REFERENCE';
  }
}

function authorityOf(c: FamilyProductionContract, hasAuthorityFiles: boolean): AuthorityStatus {
  switch (c.approvalStatus) {
    case 'CANONICAL':
    case 'FOUNDER_APPROVED':
      return 'LOCKED';
    case 'IMPLEMENTATION_READY':
      return 'APPROVED';
    case 'IN_REVIEW':
      return 'IN_REVIEW';
    case 'GENERATED':
      return 'IN_DEVELOPMENT';
    case 'SUPERSEDED':
      return 'SUPERSEDED';
    case 'REJECTED':
      return 'REQUIRED';
    default:
      return hasAuthorityFiles ? 'IN_DEVELOPMENT' : 'REQUIRED';
  }
}

const IMPL: Record<FamilyProductionContract['implementationStatus'], ImplementationStatus> = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  IMPLEMENTED: 'IMPLEMENTED',
  LIVE_QA_PASSED: 'IMPLEMENTED',
  FOUNDER_APPROVED: 'IMPLEMENTED',
};

const QA: Record<FamilyProductionContract['qaStatus'], QaStatus> = { NOT_RUN: 'NOT_RUN', UNIT_PASS: 'PASS', LIVE_PASS: 'PASS', FAIL: 'FAIL' };

/** Canonical stage from the contract's own facts (granular source states map onto it). */
function stageOf(c: FamilyProductionContract, authority: AuthorityStatus, impl: ImplementationStatus, qa: QaStatus): NodeStage {
  if (c.founderApproval.approved && impl === 'IMPLEMENTED' && qa === 'PASS') return 'APPROVED';
  if (impl === 'IMPLEMENTED' && qa === 'PASS') return 'QA_READY';
  if (impl === 'IMPLEMENTED') return 'VISUALLY_IMPLEMENTED';
  if (authority === 'APPROVED' || authority === 'LOCKED') return 'AUTHORITY_READY';
  if (c.screens.length > 0) return 'STRUCTURED';
  return 'PLANNED';
}

export function familyNodeId(projectId: string, familyId: string): string {
  return `${projectId}.design.family.${familyId.toLowerCase()}`;
}

export function buildFamilyGraphPart(projectId: string, families: readonly FamilyContractInput[], designRoute: (familyId: string) => string): FamilyGraphPart {
  const sources: SourceTruthRef[] = [];
  const nodes: ProductionNode[] = [];
  const artifacts: ArtifactRecord[] = [];
  const decisions: DecisionItem[] = [];

  for (const { contract: c, gate } of families) {
    if (c.projectId.toLowerCase() !== projectId) continue; // a project renders only its own truth
    const sourceId = `${projectId}.contract.${c.familyId}`;
    sources.push({ source_id: sourceId, kind: 'FAMILY_CONTRACT', path: `src/projects/${projectId}/data (${c.familyId} contract)`, label: `${c.familyId} ${c.familyName} family production contract` });

    const nodeId = familyNodeId(projectId, c.familyId);
    const authorityScreens = c.screens.filter((s) => s.authorityFile);
    const authority = authorityOf(c, authorityScreens.length > 0);
    const impl = IMPL[c.implementationStatus];
    const qa = QA[c.qaStatus];
    const stage = stageOf(c, authority, impl, qa);
    const route = designRoute(c.familyId);

    /* ── artifacts: visual authorities (one per screen sheet) + family assets ── */
    const artifactIds: string[] = [];
    const authorityArtifactStatus: ArtifactStatus =
      authority === 'LOCKED' || authority === 'APPROVED' ? 'CANONICAL'
      : authority === 'SUPERSEDED' ? 'SUPERSEDED'
      : 'IN_REVIEW';
    for (const s of authorityScreens) {
      const id = `${projectId}.authority.${c.familyId}.${s.id}`;
      artifactIds.push(id);
      artifacts.push({
        artifact_id: id,
        project_id: projectId,
        source_node_id: nodeId,
        artifact_type: 'VISUAL_AUTHORITY',
        label: `${s.id} ${s.name}`,
        status: authorityArtifactStatus,
        authority_status: authority,
        created_by: 'STUDIO',
        derived_from: s.parentId ? [`${projectId}.authority.${c.familyId}.${s.parentId}`] : [c.lineage.parentAuthority].filter(Boolean),
        supersedes: [],
        superseded_by: null,
        used_by: [`${c.familyId} runtime · ${s.runtimeRoute || 'root'}`],
        viewport: 'MOBILE',
        actor_mode: null,
        url: publicUrl(s.authorityFile),
        source_truth_id: sourceId,
      });
    }
    for (const a of [...c.globalAssets, ...c.familyAssets]) {
      if (a.status === 'CODE_CONSTRUCTED' || !a.filePath) continue; // only real files belong in the archive
      const id = `${projectId}.asset.${a.id}`;
      if (artifacts.some((x) => x.artifact_id === id)) {
        // a global asset inherited by several families: one artifact, many consumers
        const existing = artifacts.find((x) => x.artifact_id === id)!;
        (existing.used_by as string[]).push(`${c.familyId} ${c.familyName}`);
        continue;
      }
      artifactIds.push(id);
      artifacts.push({
        artifact_id: id,
        project_id: projectId,
        source_node_id: nodeId,
        artifact_type: ASSET_TYPE[a.assetClass] ?? 'UI_ASSET',
        label: a.id,
        status: assetStatus(a),
        authority_status: a.status === 'CANONICAL' ? 'APPROVED' : 'NOT_REQUIRED',
        created_by: a.providerGenerationId ? 'PROVIDER' : 'STUDIO',
        derived_from: [a.source].filter(Boolean),
        supersedes: [],
        superseded_by: null,
        used_by: [`${c.familyId} ${c.familyName}`, ...(a.routes ?? [])],
        viewport: null,
        actor_mode: null,
        url: publicUrl(a.filePath),
        source_truth_id: sourceId,
      });
    }

    /* ── status, blockers, next action ── */
    const blockers: ProductionBlocker[] = [];
    let status: NodeStatus;
    let detail: string;
    let step: PipelineStep;
    let next: string | null;
    if (authority === 'REQUIRED') {
      status = 'BLOCKED';
      step = 'VISUAL_AUTHORITY_DEVELOPMENT';
      detail = 'No visual authority — page-family authority required before implementation';
      next = 'Develop composition territories and a reference authority for founder verdict';
      blockers.push({
        blocker_id: `${nodeId}.authority`,
        node_id: nodeId,
        reason: 'VISUAL_AUTHORITY_REQUIRED — the family has a contract but no visual authority',
        upstream: null,
        severity: impl === 'IN_PROGRESS' ? 'HIGH' : 'MEDIUM',
        owner: 'STUDIO',
        required_action: 'Develop 3 composition territories → reference authority → founder verdict',
        downstream_effect: 'Implementation cannot become IMPLEMENTATION_READY; responsive derivation and QA wait',
      });
    } else if (authority === 'IN_REVIEW' || authority === 'IN_DEVELOPMENT') {
      status = 'REVIEW_REQUIRED';
      step = 'FOUNDER_VERDICT';
      detail = `Authority ${authority === 'IN_REVIEW' ? 'in founder review' : 'in development'}${impl === 'IMPLEMENTED' ? ` · implemented${qa === 'PASS' ? ', live QA passed' : ''}` : ''}`;
      next = 'Founder verdict on the family authority';
    } else if (stage === 'APPROVED') {
      status = 'COMPLETE';
      step = 'FOUNDER_APPROVAL';
      detail = 'Founder approved · implemented · QA passed';
      next = null;
    } else if (impl === 'IMPLEMENTED' && qa === 'PASS') {
      status = 'REVIEW_REQUIRED';
      step = 'FOUNDER_APPROVAL';
      detail = 'Implemented and live QA passed — awaiting founder acceptance';
      next = 'Founder accepts the implementation';
    } else if (impl === 'IMPLEMENTED') {
      status = 'ACTIVE';
      step = 'QA';
      detail = 'Implemented — QA not run';
      next = 'Run live QA';
    } else {
      status = 'ACTIVE';
      step = 'IMPLEMENTATION';
      detail = 'Authority approved — implementation in progress';
      next = 'Implement against the locked authority';
    }

    nodes.push({
      project_id: projectId,
      node_id: nodeId,
      node_type: 'PAGE_FAMILY',
      label: `${c.familyId} ${c.familyName}`,
      parent_id: null,
      family_id: c.familyId,
      domain: 'DESIGN',
      workspace_domains: ['HUB', 'INBOX', 'DESIGN', 'LIBRARY', 'ACTIVITY'],
      current_stage: stage,
      pipeline_step: step,
      status,
      status_detail: detail,
      authority_status: authority,
      approval_status: c.founderApproval.approved ? 'APPROVED' : c.approvalStatus === 'REJECTED' ? 'REJECTED' : status === 'REVIEW_REQUIRED' ? 'PENDING' : 'NOT_REQUESTED',
      implementation_status: impl,
      qa_status: qa,
      live_status: 'NOT_LIVE',
      dependencies: [],
      blockers,
      upstream_nodes: [],
      downstream_nodes: [],
      actor_scope: [],
      viewport_scope: c.responsive.map((r) => String((r as { target?: string; viewport?: string }).target ?? (r as { viewport?: string }).viewport ?? r)).slice(0, 3),
      artifact_ids: artifactIds,
      source_truth_ids: [sourceId],
      last_event: null,
      next_required_action: next,
      route,
      preview_artifact_id: artifactIds.find((id) => id.includes('.authority.')) ?? artifactIds[0] ?? null,
    });

    /* ── founder decisions (real, resolvable) ── */
    if (status === 'REVIEW_REQUIRED') {
      const acceptance = step === 'FOUNDER_APPROVAL';
      decisions.push({
        item_id: `${nodeId}.${acceptance ? 'acceptance' : 'verdict'}`,
        project_id: projectId,
        node_id: nodeId,
        kind: acceptance ? 'IMPLEMENTATION_ACCEPTANCE' : 'AUTHORITY_VERDICT',
        title: acceptance ? `ACCEPT ${c.familyId} ${c.familyName} IMPLEMENTATION` : `${c.familyId} ${c.familyName} AUTHORITY VERDICT`,
        detail: acceptance ?
          `${c.screens.length} screens implemented · live QA passed · founder approval missing (family not complete)`
        : `${authorityScreens.length} authority sheet${authorityScreens.length === 1 ? '' : 's'} in review${impl === 'IMPLEMENTED' ? ' · already implemented against them' : ''}`,
        state: 'NEEDS_YOU',
        domain: 'DESIGN',
        owner: 'FOUNDER',
        priority: acceptance ? 'MED' : 'HIGH',
        actions: ['APPROVE', 'REQUEST_REVISION', 'OPEN'],
        route,
        created_at: null,
        resolved_at: null,
        source_truth_id: sourceId,
      });
    } else if (stage === 'APPROVED') {
      decisions.push({
        item_id: `${nodeId}.acceptance`,
        project_id: projectId,
        node_id: nodeId,
        kind: 'IMPLEMENTATION_ACCEPTANCE',
        title: `ACCEPT ${c.familyId} ${c.familyName} IMPLEMENTATION`,
        detail: `Founder approved${c.founderApproval.note ? ` — ${c.founderApproval.note}` : ''}`,
        state: 'RESOLVED',
        domain: 'DESIGN',
        owner: 'FOUNDER',
        priority: 'MED',
        actions: ['OPEN'],
        route,
        created_at: null,
        resolved_at: c.founderApproval.approvedAt,
        source_truth_id: sourceId,
      });
    }
    void gate;
  }
  return { sources, nodes, artifacts, decisions };
}
