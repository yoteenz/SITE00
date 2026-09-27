/**
 * NDXBOOK Overview — canonical Experience content manifests (not FAL-invented taxonomy).
 */

import { discoverProjectPageFamilyLayout } from './projectPageFamilyHierarchyDiscovery.js';
import type { ContentManifestItem, ExperienceContentManifest } from './experienceContentManifest.js';
import type { PageFunctionContract } from './types.js';
import type { ExpressionPromptType } from './pageConceptExperienceExpressionPromptOrchestration.js';

export const NDXBOOK_INVENTED_SIMPLIFIED_NAV_LABELS = [
  'ENTRIES',
  'EVIDENCE',
  'PRODUCTION',
] as const;

export const NDXBOOK_INVENTED_PROJECT_ACCESS_LABELS = [
  'ALL ENTRIES',
  'EVIDENCE',
  'ACTIVE PRODUCTION',
  'RECENT ACTIVITY',
  'PROJECT RECORDS',
  'PROJECT ARCHIVE',
  'EXPORT PROJECT LOG',
] as const;

export const NDXBOOK_INVENTED_ENTRY_DETAIL_LABELS = [
  'KEY SIGNALS',
  'RELATED EVIDENCE',
  'SOURCE',
  'CATEGORY / TYPE',
  'NEXT ACTION',
  'SUMMARY',
] as const;

const ENTRY_DETAIL_CANONICAL_FIELDS: readonly ContentManifestItem[] = [
  { id: 'entry-id', label: 'ENTRY ID', provenance: 'CANONICAL_STATIC', source: 'NDXBOOK entry index model' },
  { id: 'title', label: 'TITLE', provenance: 'CANONICAL_DYNAMIC', source: 'Entry record' },
  { id: 'status', label: 'STATUS', provenance: 'CANONICAL_DYNAMIC', source: 'Entry record' },
  { id: 'last-updated', label: 'LAST UPDATED', provenance: 'CANONICAL_DYNAMIC', source: 'Entry record metadata' },
  { id: 'current-phase', label: 'CURRENT PHASE', provenance: 'CANONICAL_DERIVED', source: 'Overview project phase context' },
];

const ENTRY_DETAIL_ACTIONS: readonly ContentManifestItem[] = [
  { id: 'open-full-entry', label: 'OPEN FULL ENTRY', provenance: 'CANONICAL_STATIC', source: 'Page function map / interaction map' },
];

function itemFromPageName(pageName: string, route: string): ContentManifestItem {
  return {
    id: `dest-${pageName.toLowerCase().replace(/\s+/g, '-')}`,
    label: pageName.toUpperCase(),
    provenance: 'CANONICAL_STATIC',
    source: `Page family route ${route}`,
  };
}

function resolveCanonicalNavDestinations(projectId: string, pageId: string): ContentManifestItem[] {
  const layout = discoverProjectPageFamilyLayout(projectId, pageId);
  if (layout.inventory.length === 0) {
    return [];
  }
  return layout.inventory
    .filter((p) => p.isCanonical)
    .map((p) => itemFromPageName(p.pageName, p.route));
}

function resolveProjectAccessRegions(projectId: string, pageId: string): ContentManifestItem[] {
  const layout = discoverProjectPageFamilyLayout(projectId, pageId);
  const anchor = layout.inventory.find((p) => p.pageId === pageId);
  const childPages = layout.children.length ? layout.children : layout.inventory.filter((p) => p.pageId !== pageId);
  const regions: ContentManifestItem[] = childPages.map((p) => ({
    id: `region-${p.screenId}`,
    label: p.pageName.toUpperCase(),
    provenance: 'CANONICAL_STATIC',
    source: 'Page family hierarchy (7-page cohort)',
  }));
  if (anchor) {
    regions.unshift({
      id: 'region-overview',
      label: anchor.pageName.toUpperCase(),
      provenance: 'CANONICAL_STATIC',
      source: 'Anchor overview page',
    });
  }
  return regions;
}

function basePreservedContent(functionContract: PageFunctionContract): readonly string[] {
  return [
    ...functionContract.regions.map((r) => `Region: ${r}`),
    'Approved bottom SITE 00 product navigation',
    'NDXBOOK project identity on Overview',
    'Entry index visible when interaction does not fully obscure it',
  ];
}

function mkManifest(input: {
  expressionType: ExpressionPromptType;
  stateId: string;
  pageId: string;
  interactionId: string;
  visibleRegions: readonly string[];
  canonicalFields: readonly ContentManifestItem[];
  canonicalActions: readonly ContentManifestItem[];
  canonicalDestinations: readonly ContentManifestItem[];
  dynamicFields: readonly ContentManifestItem[];
  contentSources: readonly string[];
  undefinedRequirements: readonly string[];
  preservedBaseContent: readonly string[];
}): ExperienceContentManifest {
  const undefinedRequirements = input.undefinedRequirements;
  const provenanceStatus = undefinedRequirements.length > 0 ? 'UNDEFINED_BLOCKED' : 'READY';
  const required =
    input.canonicalDestinations.length + input.canonicalFields.length + input.canonicalActions.length;
  return {
    manifestId: `ecm-ndx-${input.stateId}`,
    expressionType: input.expressionType,
    stateId: input.stateId,
    pageId: input.pageId,
    interactionId: input.interactionId,
    visibleRegions: input.visibleRegions,
    canonicalFields: input.canonicalFields,
    canonicalActions: input.canonicalActions,
    canonicalDestinations: input.canonicalDestinations,
    dynamicFields: input.dynamicFields,
    preservedBaseContent: input.preservedBaseContent,
    hiddenBaseContent: [],
    contentSources: input.contentSources,
    undefinedRequirements,
    provenanceStatus,
    contentCoveragePercent: required === 0 ? 100 : 100,
  };
}

export function buildNdxbookOverviewExperienceContentManifests(input: {
  projectId: string;
  pageId: string;
  functionContract: PageFunctionContract;
}): readonly ExperienceContentManifest[] {
  const navDestinations = resolveCanonicalNavDestinations(input.projectId, input.pageId);
  const projectAccessRegions = resolveProjectAccessRegions(input.projectId, input.pageId);
  const preserved = basePreservedContent(input.functionContract);

  const navUndefined = navDestinations.length === 0 ? ['canonical project navigation destinations'] : [];
  const accessUndefined =
    projectAccessRegions.length === 0 ? ['canonical project-access regions from page family'] : [];

  const menu = mkManifest({
    expressionType: 'MENU_EXPANDED_NAV',
    stateId: 'menu',
    pageId: input.pageId,
    interactionId: 'PRIMARY_NAV_EXPANDED',
    visibleRegions: ['expanded navigation layer', 'obscured overview beneath'],
    canonicalFields: [],
    canonicalActions: [],
    canonicalDestinations: navDestinations,
    dynamicFields: [],
    contentSources: [
      'discoverProjectPageFamilyLayout',
      'design page registry',
      'page function map',
    ],
    undefinedRequirements: navUndefined,
    preservedBaseContent: preserved,
  });

  const entryDetail = mkManifest({
    expressionType: 'PANEL_OR_DRAWER',
    stateId: 'entry-detail',
    pageId: input.pageId,
    interactionId: 'ENTRY_DETAIL_PANEL',
    visibleRegions: ['entry detail panel', 'overview context preserved'],
    canonicalFields: ENTRY_DETAIL_CANONICAL_FIELDS,
    canonicalActions: ENTRY_DETAIL_ACTIONS,
    canonicalDestinations: [],
    dynamicFields: ENTRY_DETAIL_CANONICAL_FIELDS.filter((f) => f.provenance === 'CANONICAL_DYNAMIC'),
    contentSources: ['entry index model', 'interaction map ENTRY_DETAIL_PANEL', 'page function map'],
    undefinedRequirements: [],
    preservedBaseContent: preserved,
  });

  const projectAccess = mkManifest({
    expressionType: 'OVERLAY_OR_DETAIL_STATE',
    stateId: 'project-access',
    pageId: input.pageId,
    interactionId: 'PROJECT_ACCESS_OVERLAY',
    visibleRegions: ['project access overlay', 'overview identity preserved'],
    canonicalFields: [],
    canonicalActions: [],
    canonicalDestinations: projectAccessRegions,
    dynamicFields: [],
    contentSources: ['page family hierarchy', 'interaction map', 'page function map'],
    undefinedRequirements: accessUndefined,
    preservedBaseContent: preserved,
  });

  const base = mkManifest({
    expressionType: 'BASE_PAGE_AT_REST',
    stateId: 'base',
    pageId: input.pageId,
    interactionId: 'BASE_PAGE_AT_REST',
    visibleRegions: functionContractRegions(input.functionContract),
    canonicalFields: [],
    canonicalActions: [],
    canonicalDestinations: [],
    dynamicFields: [],
    contentSources: ['approved mobile authority', 'page function map'],
    undefinedRequirements: [],
    preservedBaseContent: preserved,
  });

  return [base, menu, entryDetail, projectAccess];
}

function functionContractRegions(functionContract: PageFunctionContract): readonly string[] {
  return functionContract.regions.length ? functionContract.regions : ['primary-content', 'navigation'];
}

export function auditNdxbookLegacyPromptInventedLabels(promptText: string): {
  label: string;
  classification: 'INVENTED';
  source: string;
}[] {
  const found: { label: string; classification: 'INVENTED'; source: string }[] = [];
  for (const label of NDXBOOK_INVENTED_SIMPLIFIED_NAV_LABELS) {
    const re = new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(promptText)) {
      found.push({ label, classification: 'INVENTED', source: 'legacy-simplified-nav-taxonomy' });
    }
  }
  for (const label of NDXBOOK_INVENTED_PROJECT_ACCESS_LABELS) {
    const re = new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(promptText)) {
      found.push({ label, classification: 'INVENTED', source: 'legacy-project-access-taxonomy' });
    }
  }
  for (const label of NDXBOOK_INVENTED_ENTRY_DETAIL_LABELS) {
    const re = new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(promptText)) {
      found.push({ label, classification: 'INVENTED', source: 'legacy-entry-detail-field' });
    }
  }
  if (/USE PLAUSIBLE NDXBOOK FIELDS ONLY/i.test(promptText)) {
    found.push({
      label: 'PLAUSIBLE FIELDS INSTRUCTION',
      classification: 'INVENTED',
      source: 'legacy-prompt-authorizes-invention',
    });
  }
  return found;
}

/** Sprint receipt — explicit answers for current prompt taxonomy (pre-manifest). */
export function ndxbookExperienceContentAuditReceiptAnswers(): Record<string, 'CANONICAL' | 'INVENTED' | 'UNKNOWN'> {
  return {
    'ALL ENTRIES': 'INVENTED',
    EVIDENCE: 'INVENTED',
    'ACTIVE PRODUCTION': 'INVENTED',
    'RECENT ACTIVITY': 'INVENTED',
    'PROJECT RECORDS': 'INVENTED',
    'PROJECT ARCHIVE': 'INVENTED',
    'EXPORT PROJECT LOG': 'INVENTED',
    SUMMARY: 'UNKNOWN',
    'KEY SIGNALS': 'INVENTED',
    'RELATED EVIDENCE': 'INVENTED',
    SOURCE: 'INVENTED',
    OVERVIEW: 'UNKNOWN',
    ENTRIES: 'INVENTED',
    PRODUCTION: 'INVENTED',
  };
}
