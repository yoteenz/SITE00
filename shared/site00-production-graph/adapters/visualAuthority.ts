/**
 * Adapter: VISUAL AUTHORITY DEVELOPMENT GATE (shared/studioos-visual-authority) → project graph (DESIGN domain).
 *
 * Source of truth: a project's locked PAGE_FAMILY_AUTHORITY records, founder verdicts, open decisions and the
 * authority gate result. Today: AIO IFTA (client parent authority + derived founder/staff and public modes).
 *
 * Open decisions are real founder questions (INBOX · NEEDS YOU) that block the page-tree confirmation — the 8th
 * durable condition (PAGE_TREE_CONFIRMED). Decided ones are RESOLVED items. Founder verdicts carry a date and are
 * events. Experience contracts are an input to DESIGN (step 02), not an EXPERIENCE (world) domain.
 */
import type { PageFamilyAuthority, ReferenceAuthority, FounderAuthorityDecision } from '../../studioos-visual-authority/schema.js';
import type { AuthorityGateResult } from '../../studioos-visual-authority/gate.js';
import type { OpenDecision } from '../../studioos-visual-authority/tree.js';
import type { ArtifactRecord, DecisionItem, DecisionKind, ProductionBlocker, ProductionEvent, ProductionNode, SourceTruthRef } from '../types.js';
import { publicUrl } from './familyContracts.js';

export type VisualAuthorityFeatureInput = {
  /** Feature id (e.g. `AIO.IFTA`) and the human label the workspace shows. */
  featureId: string;
  label: string;
  authorities: Record<string, PageFamilyAuthority>;
  gates: Record<string, AuthorityGateResult>;
  founderDecisions: Record<string, FounderAuthorityDecision>;
  references: readonly ReferenceAuthority[];
  decisions: readonly OpenDecision[];
  assets: readonly { asset_id: string; asset_class: string; name: string; runtime: string; source_refs: readonly string[]; usage: string }[];
  /** Parent actor whose authority the other actor modes derive from. */
  parentActor: string;
  experienceContractId: string;
  bundlePath: string;
};

export type VisualAuthorityGraphPart = {
  sources: SourceTruthRef[];
  nodes: ProductionNode[];
  artifacts: ArtifactRecord[];
  decisions: DecisionItem[];
  events: ProductionEvent[];
};

const DECISION_KIND: Record<OpenDecision['kind'], DecisionKind> = {
  AUTHORITY: 'AUTHORITY_VERDICT',
  BRAND_TOKEN: 'DECISION',
  CONTENT_TRUTH: 'AMBIGUITY',
  DATA: 'DECISION',
  SCOPE: 'DECISION',
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const titleOf = (decisionId: string) => decisionId.replace(/^D-/, '').replace(/-/g, ' ');

export function buildVisualAuthorityGraphPart(projectId: string, f: VisualAuthorityFeatureInput, designRoute: string): VisualAuthorityGraphPart {
  const sources: SourceTruthRef[] = [
    { source_id: `${projectId}.va.${slug(f.featureId)}`, kind: 'VISUAL_AUTHORITY_GATE', path: f.bundlePath, label: `${f.label} authority bundle + gate` },
    { source_id: `${projectId}.ec.${slug(f.featureId)}`, kind: 'EXPERIENCE_CONTRACT', path: 'shared/studioos-experience-brain', label: `${f.label} experience contract (${f.experienceContractId})` },
  ];
  const vaSource = sources[0]!.source_id;
  const familyNode = `${projectId}.design.${slug(f.featureId)}`;
  const treeNode = `${familyNode}.page-tree`;
  const open = f.decisions.filter((d) => d.status === 'OPEN');
  const nodes: ProductionNode[] = [];
  const artifacts: ArtifactRecord[] = [];
  const decisions: DecisionItem[] = [];
  const events: ProductionEvent[] = [];

  const base = {
    project_id: projectId,
    family_id: f.featureId,
    domain: 'DESIGN' as const,
    workspace_domains: ['HUB', 'INBOX', 'DESIGN', 'LIBRARY', 'ACTIVITY'] as const,
    live_status: 'NOT_LIVE' as const,
    route: designRoute,
  };

  /* ── actor-mode authorities (parent first, derived modes after) ── */
  const actors = Object.keys(f.authorities).sort((a, b) => (a === f.parentActor ? -1 : b === f.parentActor ? 1 : a.localeCompare(b)));
  const actorNodeIds: string[] = [];
  for (const actor of actors) {
    const a = f.authorities[actor]!;
    const g = f.gates[actor];
    const decision = f.founderDecisions[actor];
    const nodeId = `${familyNode}.${slug(actor)}`;
    actorNodeIds.push(nodeId);
    const artifactIds: string[] = [];
    a.reference_paths.forEach((p, i) => {
      const id = `${projectId}.authority.${slug(a.authority_id)}.${i + 1}`;
      artifactIds.push(id);
      artifacts.push({
        artifact_id: id,
        project_id: projectId,
        source_node_id: nodeId,
        artifact_type: 'PAGE_FAMILY_AUTHORITY',
        label: p.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/i, ''),
        status: a.founder_status === 'APPROVED' ? 'CANONICAL' : a.founder_status === 'REVISE' ? 'REVISE' : 'IN_REVIEW',
        authority_status: a.founder_status === 'APPROVED' ? 'LOCKED' : 'IN_REVIEW',
        created_by: 'FOUNDER + STUDIO',
        derived_from: actor === f.parentActor ? (a.lineage?.territory_lineage ?? []) : [`${f.featureId} ${f.parentActor} authority`],
        supersedes: a.supersedes ? [a.supersedes] : [],
        superseded_by: a.lineage?.superseded_by ?? null,
        used_by: [`${a.feature_id} · ${actor} mode`],
        viewport: a.viewports.join(' / '),
        actor_mode: actor,
        url: publicUrl(p),
        source_truth_id: vaSource,
      });
    });
    const approved = a.founder_status === 'APPROVED';
    nodes.push({
      ...base,
      node_id: nodeId,
      node_type: 'PAGE_FAMILY_AUTHORITY',
      label: `${f.label} · ${actor.replace(/_/g, ' / ')} MODE`,
      parent_id: familyNode,
      current_stage: approved ? 'AUTHORITY_READY' : 'STRUCTURED',
      pipeline_step: actor === f.parentActor ? 'FOUNDER_VERDICT' : 'ACTOR_MODE_DERIVATION',
      status: approved ? 'COMPLETE' : 'REVIEW_REQUIRED',
      status_detail: approved ? `Founder ${decision?.verdict ?? 'APPROVED'}${decision?.decided_at ? ` · ${decision.decided_at}` : ''}${actor === f.parentActor ? ' · parent authority' : ` · derived from ${f.parentActor}`}` : `Authority ${a.founder_status.toLowerCase()}`,
      authority_status: approved ? 'LOCKED' : 'IN_REVIEW',
      approval_status: approved ? 'APPROVED' : 'PENDING',
      implementation_status: 'NOT_STARTED',
      qa_status: 'NOT_RUN',
      dependencies: actor === f.parentActor ? [] : [`${familyNode}.${slug(f.parentActor)}`],
      blockers: [],
      upstream_nodes: actor === f.parentActor ? [] : [`${familyNode}.${slug(f.parentActor)}`],
      downstream_nodes: [treeNode],
      actor_scope: [actor],
      viewport_scope: a.viewports,
      artifact_ids: artifactIds,
      source_truth_ids: [vaSource],
      last_event: decision?.decided_at ? `${projectId}.event.${slug(a.authority_id)}.verdict` : null,
      next_required_action: approved ? null : 'Founder verdict on the actor-mode authority',
      preview_artifact_id: artifactIds[0] ?? null,
    });
    if (decision?.decided_at) {
      events.push({
        event_id: `${projectId}.event.${slug(a.authority_id)}.verdict`,
        project_id: projectId,
        node_id: nodeId,
        event_type: approved ? 'APPROVED' : 'REVISED',
        actor: 'FOUNDER',
        timestamp: decision.decided_at,
        prior_state: 'IN_REVIEW',
        new_state: approved ? 'LOCKED' : 'REVISE',
        artifact_id: artifactIds[0] ?? null,
        workspace_domain: 'DESIGN',
        source_action: 'FOUNDER_VERDICT',
        title: `${f.label} ${actor.replace(/_/g, ' / ')} AUTHORITY ${approved ? 'APPROVED' : 'SENT BACK'}`,
        detail: `${decision.verdict}${decision.notes ? ` — ${decision.notes.split('. ')[0]}` : ''}`,
        origin: 'SOURCE_TRUTH',
      });
    }
    void g;
  }

  /* ── page tree (8th durable condition) — gated by the open decisions ── */
  const guard = Object.values(f.gates)[0]?.guard ?? null;
  const treeConfirmed = guard !== 'PAGE_TREE_CONFIRMATION_REQUIRED' && Object.values(f.gates).every((g) => g.implementation_ready);
  const blockers: ProductionBlocker[] =
    open.length && !treeConfirmed ?
      [
        {
          blocker_id: `${treeNode}.open-decisions`,
          node_id: treeNode,
          reason: `${open.length} open founder decision${open.length === 1 ? '' : 's'} (${open.map((d) => titleOf(d.decision_id)).join(' · ')})`,
          upstream: null,
          severity: 'HIGH',
          owner: 'FOUNDER',
          required_action: 'Decide the open questions in INBOX, then confirm the page tree',
          downstream_effect: 'No IFTA page may become IMPLEMENTATION_READY (PAGE_TREE_CONFIRMATION_REQUIRED)',
        },
      ]
    : [];
  nodes.push({
    ...base,
    node_id: treeNode,
    node_type: 'PAGE_TREE',
    label: `${f.label} · PAGE / TAB / STATE TREE`,
    parent_id: familyNode,
    current_stage: treeConfirmed ? 'AUTHORITY_READY' : 'STRUCTURED',
    pipeline_step: 'AUTHORITY_PACKAGE',
    status: treeConfirmed ? 'COMPLETE' : blockers.length ? 'BLOCKED' : 'REVIEW_REQUIRED',
    status_detail: treeConfirmed ? 'Page tree confirmed' : `Page tree awaiting founder confirmation${blockers.length ? ` · ${open.length} open decisions` : ''}`,
    authority_status: 'APPROVED',
    approval_status: treeConfirmed ? 'APPROVED' : 'PENDING',
    implementation_status: 'NOT_STARTED',
    qa_status: 'NOT_RUN',
    dependencies: actorNodeIds,
    blockers,
    upstream_nodes: actorNodeIds,
    downstream_nodes: [],
    actor_scope: actors,
    viewport_scope: ['MOBILE', 'TABLET', 'DESKTOP'],
    artifact_ids: [],
    source_truth_ids: [vaSource],
    last_event: null,
    next_required_action: treeConfirmed ? 'Implement against the locked authorities' : open.length ? `Resolve ${open.length} open decisions, then confirm the page tree` : 'Founder confirms the page tree',
    preview_artifact_id: null,
  });

  /* ── the feature itself (page family) ── */
  const done = nodes.filter((n) => n.status === 'COMPLETE').length;
  nodes.unshift({
    ...base,
    node_id: familyNode,
    node_type: 'PAGE_FAMILY',
    label: f.label,
    parent_id: null,
    current_stage: treeConfirmed ? 'AUTHORITY_READY' : 'STRUCTURED',
    pipeline_step: treeConfirmed ? 'IMPLEMENTATION' : 'AUTHORITY_PACKAGE',
    status: treeConfirmed ? 'ACTIVE' : blockers.length ? 'BLOCKED' : 'REVIEW_REQUIRED',
    status_detail: `${done} of ${nodes.length} authority conditions complete · implementation ${treeConfirmed ? 'unblocked' : 'gated by page-tree confirmation'}`,
    authority_status: 'APPROVED',
    approval_status: 'PENDING',
    implementation_status: 'NOT_STARTED',
    qa_status: 'NOT_RUN',
    dependencies: [],
    blockers: [],
    upstream_nodes: [],
    downstream_nodes: [...actorNodeIds, treeNode],
    actor_scope: actors,
    viewport_scope: ['MOBILE', 'TABLET', 'DESKTOP'],
    artifact_ids: [],
    source_truth_ids: sources.map((s) => s.source_id),
    last_event: null,
    next_required_action: nodes.find((n) => n.node_id === treeNode)?.next_required_action ?? null,
    preview_artifact_id: artifacts[0]?.artifact_id ?? null,
  });

  /* ── decisions ── */
  for (const d of f.decisions) {
    decisions.push({
      item_id: `${projectId}.decision.${slug(d.decision_id)}`,
      project_id: projectId,
      node_id: treeNode,
      kind: DECISION_KIND[d.kind],
      title: `${f.label} · ${titleOf(d.decision_id)}`,
      detail: d.question,
      state: d.status === 'OPEN' ? 'NEEDS_YOU' : 'RESOLVED',
      domain: 'DESIGN',
      owner: 'FOUNDER',
      priority: d.kind === 'AUTHORITY' || d.kind === 'CONTENT_TRUTH' ? 'HIGH' : 'MED',
      actions: d.status === 'OPEN' ? ['RESOLVE', 'OPEN'] : ['OPEN'],
      route: designRoute,
      created_at: null,
      resolved_at: null,
      source_truth_id: vaSource,
    });
  }
  if (!treeConfirmed) {
    decisions.push({
      item_id: `${treeNode}.confirm`,
      project_id: projectId,
      node_id: treeNode,
      kind: 'FOUNDER_APPROVAL',
      title: `CONFIRM ${f.label} PAGE TREE`,
      detail: open.length ? `Waiting on ${open.length} open decision${open.length === 1 ? '' : 's'} before it can be confirmed` : 'Every decision is settled — the page tree can be confirmed',
      state: open.length ? 'WATCHING' : 'NEEDS_YOU',
      domain: 'DESIGN',
      owner: 'FOUNDER',
      priority: 'HIGH',
      actions: open.length ? ['OPEN'] : ['APPROVE', 'REQUEST_REVISION', 'OPEN'],
      route: designRoute,
      created_at: null,
      resolved_at: null,
      source_truth_id: vaSource,
    });
  }

  /* ── asset contracts (runtime availability) ── */
  for (const a of f.assets) {
    artifacts.push({
      artifact_id: `${projectId}.asset.${slug(a.asset_id)}`,
      project_id: projectId,
      source_node_id: familyNode,
      artifact_type: a.asset_class === 'BRAND_MARK' ? 'BRAND_MARK' : /ICON/.test(a.asset_class) ? 'ICON' : 'UI_ASSET',
      label: a.name,
      status: a.runtime === 'RUNTIME_ASSET_MISSING' ? 'MISSING' : 'REFERENCE',
      authority_status: 'APPROVED',
      created_by: 'AUTHORITY BUNDLE',
      derived_from: [...a.source_refs],
      supersedes: [],
      superseded_by: null,
      used_by: [a.usage],
      viewport: null,
      actor_mode: null,
      url: null,
      source_truth_id: vaSource,
    });
  }

  return { sources, nodes, artifacts, decisions, events };
}
