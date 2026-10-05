/**
 * Compiled Project Bible — current project truth view (P0.D/P0.E)
 */

import { resolveCanonicalProject } from '../canonicalProject.js';
import { listClientTruthForProject } from '../clientTruthService.js';
import { getLatestOriginSummary } from '../originIngestionService.js';
import { getLatestIdentityBrief } from './identityBriefService.js';
import { listIdentityTerritories } from './identityPhaseService.js';
import { listWorldHierarchy } from './worldHierarchyService.js';
import {
  countCanonRecordsFromOrigin,
  listActiveCanonFields,
  evaluateProjectIdentityGate,
} from './canonPromotionService.js';
import {
  getIdentityReviewState,
  listFieldJudgments,
  listRevisionTargets,
  listRejectedTerritories,
} from './identityJudgmentService.js';
import type { CompiledProjectBible, ProjectBibleSection } from '../../../../shared/site00-identity/types.js';

export async function compileProjectBible(projectIdOrSlug: string): Promise<CompiledProjectBible> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const sections: ProjectBibleSection[] = [];
  const reviewState = await getIdentityReviewState(resolved.project.slug);

  const clientTruth = await listClientTruthForProject(resolved.project.slug);
  sections.push({
    id: 'origin',
    title: 'ORIGIN',
    truthLayer: 'CLIENT_FOUNDER_TRUTH',
    content: { status: resolved.project.status, recordCount: clientTruth.length },
  });

  sections.push({
    id: 'client_truth',
    title: 'CLIENT TRUTH',
    truthLayer: 'CLIENT_FOUNDER_TRUTH',
    content: clientTruth.map((r) => ({
      id: r.id,
      title: r.title,
      category: (r.payload as Record<string, unknown>).category,
      status: r.status,
    })),
  });

  const originSummary = await getLatestOriginSummary(resolved.project.slug);
  if (originSummary) {
    sections.push({
      id: 'origin_summary',
      title: 'ORIGIN SUMMARY (DERIVED)',
      truthLayer: 'CLIENT_FOUNDER_TRUTH',
      content: { note: 'Derived — non-canonical', summary: originSummary.summary },
    });
  }

  const brief = await getLatestIdentityBrief(resolved.project.slug);
  if (brief) {
    sections.push({
      id: 'identity_brief',
      title: 'IDENTITY BRIEF (DERIVED)',
      truthLayer: 'CLIENT_FOUNDER_TRUTH',
      content: brief.brief,
    });
  }

  const activeCanon = await listActiveCanonFields(resolved.project.slug);
  const identityCanon = activeCanon.filter((c) => c.canon_type === 'IDENTITY');
  const structureCanon = activeCanon.filter((c) => c.canon_type === 'WORLD_STRUCTURE');

  sections.push({
    id: 'identity_canon',
    title: 'APPROVED IDENTITY CANON',
    truthLayer: identityCanon.length > 0 ? 'APPROVED_CANON' : 'UNRESOLVED',
    content: identityCanon.map((c) => ({
      fieldKey: c.field_key,
      scope: c.hierarchy_scope,
      value: c.field_value,
      version: c.canon_version,
      approver: c.approver,
    })),
  });

  sections.push({
    id: 'world_structure_canon',
    title: 'WORLD STRUCTURE CANON',
    truthLayer: structureCanon.length > 0 ? 'APPROVED_CANON' : 'UNRESOLVED',
    content: structureCanon.map((c) => ({
      fieldKey: c.field_key,
      value: c.field_value,
      note: 'Structural only — world formation NOT FORMED',
    })),
  });

  const territories = await listIdentityTerritories(resolved.project.slug);
  const explorationTerritories = territories.filter((t) => !['PROMOTED', 'PROMOTED_PARTIAL'].includes(t.status));
  sections.push({
    id: 'identity_exploration',
    title: 'IDENTITY TERRITORIES (CREATIVE EXPLORATION)',
    truthLayer: 'CREATIVE_EXPLORATION',
    content: explorationTerritories.map((t) => ({
      key: t.territory_key,
      label: t.working_label,
      status: t.status,
      premise: t.strategic_premise,
    })),
  });

  const rejected = await listRejectedTerritories(resolved.project.slug);
  if (rejected.length) {
    sections.push({
      id: 'rejected_exploration',
      title: 'REJECTED EXPLORATION (PRESERVED)',
      truthLayer: 'CREATIVE_EXPLORATION',
      content: rejected.map((t) => ({
        key: t.territory_key,
        label: t.working_label,
        status: 'REJECTED',
        note: 'Preserved for lineage — excluded from canon',
      })),
    });
  }

  const hierarchy = await listWorldHierarchy(resolved.project.slug);
  sections.push({
    id: 'world_hierarchy',
    title: 'WORLD HIERARCHY',
    truthLayer: structureCanon.length > 0 ? 'APPROVED_CANON' : 'CLIENT_FOUNDER_TRUTH',
    content: hierarchy.map((n) => ({
      type: n.node_type,
      slug: n.slug,
      name: n.display_name,
      parentId: n.parent_id,
      isCanonical: n.is_canonical,
      truthLayer: n.truth_layer,
    })),
  });

  const fieldJudgments = await listFieldJudgments(resolved.project.slug);
  const revisions = await listRevisionTargets(resolved.project.slug);
  sections.push({
    id: 'decision_history',
    title: 'DECISION HISTORY',
    truthLayer: 'CLIENT_FOUNDER_TRUTH',
    content: {
      fieldJudgments: fieldJudgments.map((j) => ({
        fieldKey: j.field_key,
        judgment: j.judgment,
        territoryId: j.territory_id,
        approver: j.approver,
        at: j.created_at,
      })),
      revisionTargets: revisions.map((r) => ({
        fieldKey: r.field_key,
        status: r.status,
        critique: r.founder_critique,
      })),
      structuralConfirmations: reviewState.structuralConfirmations,
    },
  });

  const unresolved = clientTruth.filter((r) => (r.payload as Record<string, unknown>).category === 'UNRESOLVED_DECISIONS');
  sections.push({
    id: 'unresolved',
    title: 'UNRESOLVED DECISIONS',
    truthLayer: 'UNRESOLVED',
    content: unresolved.map((r) => ({ title: r.title, detail: (r.payload as Record<string, unknown>).content })),
  });

  const gate = await evaluateProjectIdentityGate(resolved.project.slug);

  return {
    projectSlug: resolved.project.slug,
    compiledAt: new Date().toISOString(),
    sections,
    worldFormationState: 'NOT_FORMED',
    identityCanonGate: { satisfied: gate.satisfied, requiredMissing: gate.requiredMissing },
    founderJudgmentState: reviewState.founderJudgmentState,
  };
}
