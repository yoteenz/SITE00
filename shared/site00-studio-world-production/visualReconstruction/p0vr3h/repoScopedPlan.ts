/**
 * P0.VR.3H — Repo-scoped missing page completion plan builder.
 */

import { buildSite00MissingRoutes, buildSite00DiscoveredRoutes } from '../p0vr3a/site00RouteForensics.js';
import { getExperiencePageDefinition } from '../p0vr3g/experiencePageRegistry.js';
import { classifyMissingPageCompletionMode, isComplexCompletionMode, isSimpleCompletionMode } from './classifier.js';
import { buildNdxbookMissingRoutes } from './ndxbookMissingRoutes.js';
import { listExternalSkippedProjects } from './ownershipFilter.js';
import { P0_VR_3H_LINEAGE, COMPOSER_PAGE_AUTHORSHIP } from './constants.js';
import type {
  MissingPagePlanEntry,
  ProjectCompletionSummary,
  RepoScopedMissingPageCompletionPlan,
} from './types.js';

function inferContentProvenance(screenId: string, mode: MissingPagePlanEntry['completionMode']): MissingPagePlanEntry['contentProvenance'] {
  if (mode === 'BLOCKED_EXISTING_IMPLEMENTATION') return ['SOURCE_EXISTING_ROUTE'];
  if (screenId.includes('forgot') || screenId.includes('reset')) return ['SOURCE_EXISTING_ROUTE', 'COMPOSER_INFERRED'];
  if (isComplexCompletionMode(mode)) return ['CONTENT_REQUIRED'];
  return ['SOURCE_PROJECT_DOC', 'COMPOSER_INFERRED'];
}

function inferReviewDimensions(mode: MissingPagePlanEntry['completionMode']): MissingPagePlanEntry['reviewDimensions'] {
  if (mode === 'FAMILY_DERIVED_SIMPLE') return ['VISUAL', 'CONTENT'];
  if (mode === 'FUNCTIONAL_COMPLEX') return ['FUNCTION', 'VISUAL'];
  if (mode === 'CREATIVE_COMPLEX') return ['VISUAL', 'CONTENT', 'FUNCTION'];
  return ['VISUAL', 'CONTENT', 'FUNCTION'];
}

function buildSite00PlanEntries(): MissingPagePlanEntry[] {
  const draftRoutes = buildSite00DiscoveredRoutes().filter((r) => r.dependencyClosure === 'IMPLEMENTED_DRAFT');
  const remainingMissing = buildSite00MissingRoutes();

  const draftEntries: MissingPagePlanEntry[] = draftRoutes.map((route) => {
    const pageId = route.screenId;
    const experience = getExperiencePageDefinition(pageId);
    const mode = classifyMissingPageCompletionMode({
      projectId: 'SITE00',
      screenId: `missing-${pageId}`,
      route: route.resolvedRoute,
      parentFlowId: route.parentScreenId,
    });

    return {
      entryId: `site00:${route.screenId}`,
      projectId: 'SITE00',
      sourceRepo: 'SITE00_REPO',
      screenId: route.screenId.startsWith('missing-') ? route.screenId : `missing-${pageId}`,
      displayName: route.displayName,
      route: route.resolvedRoute,
      family: experience?.family ?? (route.routeFamily === 'ACCOUNT' ? 'AUTH' : route.routeFamily === 'INFORMATION' ? 'INFORMATION' : 'OTHER'),
      completionMode: mode,
      authorType: COMPOSER_PAGE_AUTHORSHIP.authorType,
      createdBySprint: P0_VR_3H_LINEAGE,
      reviewStatus: COMPOSER_PAGE_AUTHORSHIP.reviewStatus,
      publishStatus: COMPOSER_PAGE_AUTHORSHIP.publishStatus,
      contentProvenance: inferContentProvenance(route.screenId, mode),
      implementationStatus: 'IMPLEMENTED_DRAFT',
      reviewDimensions: inferReviewDimensions(mode),
      creativeDirectionRequired: mode === 'CREATIVE_COMPLEX',
      functionalReviewRequired: mode === 'FUNCTIONAL_COMPLEX' || mode === 'STRUCTURAL_COMPLEX',
      sourceEvidence: route.sourceEvidence ?? [],
    };
  });

  const missingEntries: MissingPagePlanEntry[] = remainingMissing.map((missing) => {
    const pageId = missing.screenId.replace(/^missing-/, '');
    const experience = getExperiencePageDefinition(pageId);
    const mode = classifyMissingPageCompletionMode({
      projectId: 'SITE00',
      screenId: missing.screenId,
      route: missing.suggestedRoute,
      recordKind: missing.recordKind,
      parentFlowId: missing.parentFlowId,
    });

    return {
      entryId: `site00:${missing.screenId}`,
      projectId: 'SITE00',
      sourceRepo: 'SITE00_REPO',
      screenId: missing.screenId,
      displayName: missing.displayName,
      route: missing.suggestedRoute,
      family: experience?.family ?? 'OTHER',
      completionMode: mode,
      authorType: COMPOSER_PAGE_AUTHORSHIP.authorType,
      createdBySprint: P0_VR_3H_LINEAGE,
      reviewStatus: COMPOSER_PAGE_AUTHORSHIP.reviewStatus,
      publishStatus: COMPOSER_PAGE_AUTHORSHIP.publishStatus,
      contentProvenance: inferContentProvenance(missing.screenId, mode),
      implementationStatus: 'MISSING',
      reviewDimensions: inferReviewDimensions(mode),
      creativeDirectionRequired: mode === 'CREATIVE_COMPLEX',
      functionalReviewRequired: mode === 'FUNCTIONAL_COMPLEX' || mode === 'STRUCTURAL_COMPLEX',
      sourceEvidence: missing.sourceEvidence,
    };
  });

  return [...draftEntries, ...missingEntries];
}

function buildNdxbookPlanEntries(): MissingPagePlanEntry[] {
  return buildNdxbookMissingRoutes().map((entry) => ({
    ...entry,
    entryId: `ndxbook:${entry.screenId}`,
  }));
}

function summarizeProject(entries: MissingPagePlanEntry[], reviewSets: string[]): ProjectCompletionSummary {
  return {
    missing: entries.filter((e) => e.implementationStatus === 'MISSING').length,
    simple: entries.filter((e) => isSimpleCompletionMode(e.completionMode)).length,
    complex: entries.filter((e) => isComplexCompletionMode(e.completionMode)).length,
    built: entries.filter((e) => e.implementationStatus === 'IMPLEMENTED_DRAFT' && isSimpleCompletionMode(e.completionMode)).length,
    shellOnly: entries.filter((e) => e.implementationStatus === 'IMPLEMENTED_DRAFT' && isComplexCompletionMode(e.completionMode)).length,
    blocked: entries.filter((e) => e.implementationStatus === 'BLOCKED' || e.completionMode === 'BLOCKED_EXISTING_IMPLEMENTATION').length,
    reviewSets,
  };
}

export function buildRepoScopedMissingPageCompletionPlan(): RepoScopedMissingPageCompletionPlan {
  const site00Entries = buildSite00PlanEntries();
  const ndxbookEntries = buildNdxbookPlanEntries();

  return {
    planId: `repo-scoped-missing-page-plan:${Date.now()}`,
    lineage: P0_VR_3H_LINEAGE,
    compiledAt: new Date().toISOString(),
    sourceRepo: 'SITE00_REPO',
    ownedProjects: ['SITE00', 'NDXBOOK'],
    entries: [...site00Entries, ...ndxbookEntries],
    externalSkipped: listExternalSkippedProjects(),
    summary: {
      site00: summarizeProject(site00Entries, ['SITE 00 INFORMATION PAGES', 'SITE 00 AUTH UTILITIES']),
      ndxbook: summarizeProject(ndxbookEntries, ndxbookEntries.length ? ['NDXBOOK DESIGN PILOT GAPS'] : []),
    },
  };
}

let cachedPlan: RepoScopedMissingPageCompletionPlan | null = null;

export function getActiveMissingPageCompletionPlan(): RepoScopedMissingPageCompletionPlan {
  if (!cachedPlan) cachedPlan = buildRepoScopedMissingPageCompletionPlan();
  return cachedPlan;
}

export function clearMissingPageCompletionPlanCacheForTest(): void {
  cachedPlan = null;
}
