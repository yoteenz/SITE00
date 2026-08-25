/**
 * Compiled Project Bible — current project truth view (not a separate SoR).
 */

import { resolveCanonicalProject } from '../canonicalProject.js';
import { listClientTruthForProject } from '../clientTruthService.js';
import { getLatestOriginSummary } from '../originIngestionService.js';
import { getLatestIdentityBrief } from './identityBriefService.js';
import { listIdentityTerritories } from './identityPhaseService.js';
import { listWorldHierarchy } from './worldHierarchyService.js';
import { countCanonRecordsFromOrigin } from './canonPromotionService.js';
import type { CompiledProjectBible, ProjectBibleSection } from '../../../../shared/site00-identity/types.js';

export async function compileProjectBible(projectIdOrSlug: string): Promise<CompiledProjectBible> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const sections: ProjectBibleSection[] = [];

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

  const territories = await listIdentityTerritories(resolved.project.slug);
  sections.push({
    id: 'identity_exploration',
    title: 'IDENTITY TERRITORIES (CREATIVE EXPLORATION)',
    truthLayer: 'CREATIVE_EXPLORATION',
    content: territories.map((t) => ({
      key: t.territory_key,
      label: t.working_label,
      status: t.status,
      premise: t.strategic_premise,
    })),
  });

  const canonCount = await countCanonRecordsFromOrigin(resolved.project.slug);
  sections.push({
    id: 'identity_canon',
    title: 'IDENTITY CANON',
    truthLayer: canonCount > 0 ? 'APPROVED_CANON' : 'UNRESOLVED',
    content: { approvedRecordCount: canonCount },
  });

  const hierarchy = await listWorldHierarchy(resolved.project.slug);
  sections.push({
    id: 'world_hierarchy',
    title: 'WORLD HIERARCHY',
    truthLayer: 'CLIENT_FOUNDER_TRUTH',
    content: hierarchy.map((n) => ({
      type: n.node_type,
      slug: n.slug,
      name: n.display_name,
      parentId: n.parent_id,
      isCanonical: n.is_canonical,
    })),
  });

  const unresolved = clientTruth.filter((r) => (r.payload as Record<string, unknown>).category === 'UNRESOLVED_DECISIONS');
  sections.push({
    id: 'unresolved',
    title: 'UNRESOLVED DECISIONS',
    truthLayer: 'UNRESOLVED',
    content: unresolved.map((r) => ({ title: r.title, detail: (r.payload as Record<string, unknown>).content })),
  });

  return {
    projectSlug: resolved.project.slug,
    compiledAt: new Date().toISOString(),
    sections,
    worldFormationState: 'NOT_FORMED',
  };
}
