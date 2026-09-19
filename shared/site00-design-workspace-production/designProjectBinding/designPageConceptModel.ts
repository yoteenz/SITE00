/**
 * P0.VR.DESIGN-PAGE-CONCEPT-MODEL1 — site pages vs campaigns vs page concepts (GPT2 contract).
 */

import type { PageViewportId } from './pageViewportAuthority.js';

export const CREATIVE_LAYER_MODEL = 'GPT2' as const;

/** Canonical site page identity (registry row — not a campaign). */
export type ProjectPage = {
  projectId: string;
  pageId: string;
  screenId: string;
  pageName: string;
  pageRole: string;
  route: string;
};

/** Campaign / content entry — informs pages; must not be used as pageId. */
export type CampaignEntry = {
  entryId: string;
  projectId: string;
  title: string;
  role: 'CAMPAIGN_CONTENT' | 'EDITORIAL_ENTRY' | 'ARCHIVE';
  /** Creative inputs only — not a navigable site page. */
  creativeUse: 'SOURCE_MATERIAL' | 'PROVENANCE' | 'VISUAL_LINEAGE';
};

export type PageConceptCandidateStatus = 'CANDIDATE' | 'SELECTED' | 'PROMOTED' | 'ARCHIVED';

export type PageConceptLineage = {
  informedByCampaignEntryIds?: readonly string[];
  brandIntelligence?: readonly string[];
  creativeTerritories?: readonly string[];
};

/** GPT2 creative-layer output — page-scoped concept territory (not implementation). */
export type PageConceptCandidate = {
  conceptId: string;
  projectId: string;
  pageId: string;
  conceptTitle: string;
  conceptTerritory: string;
  creativeRationale: string;
  visualReference: string | null;
  generatedBy: typeof CREATIVE_LAYER_MODEL;
  createdAt: string | null;
  lineage: PageConceptLineage;
  status: PageConceptCandidateStatus;
  viewportScope: PageViewportId;
};

export type PageDesignAuthority = {
  projectId: string;
  pageId: string;
  mobileAuthorityUrl: string | null;
  desktopAuthorityUrl: string | null;
  authorityLabel: string;
  reviewState: 'MISSING' | 'IN_REVIEW' | 'APPROVED' | 'REFERENCE_ONLY';
};

export type PageImplementation = {
  projectId: string;
  pageId: string;
  route: string;
  buildStatus: string;
};

/** Input contract for future GPT2 page-concept generation (no invoke in this sprint). */
export type Gpt2PageConceptGenerationInput = {
  projectIntelligence: string;
  pageRole: string;
  pageContentFunction: string;
  parentPageContext: string | null;
  childRelationships: readonly string[];
  projectExpression: string;
  founderCreativeAppetite: string | null;
  currentReferences: readonly string[];
  relevantCampaignContentInputs: readonly string[];
  mobileAuthorityReference: string | null;
  desktopAuthorityReference: string | null;
};

export type Gpt2PageConceptGenerationOutput = {
  creativeLayerModel: typeof CREATIVE_LAYER_MODEL;
  territories: readonly Pick<
    PageConceptCandidate,
    'conceptTitle' | 'conceptTerritory' | 'creativeRationale' | 'visualReference' | 'lineage'
  >[];
};

export const GPT2_PAGE_CONCEPT_GENERATION_CONTRACT = {
  creativeLayerModel: CREATIVE_LAYER_MODEL,
  inputFields: [
    'PROJECT_INTELLIGENCE',
    'PAGE_ROLE',
    'PAGE_CONTENT_FUNCTION',
    'PARENT_PAGE_CONTEXT',
    'CHILD_RELATIONSHIPS',
    'PROJECT_EXPRESSION',
    'FOUNDER_CREATIVE_APPETITE',
    'CURRENT_REFERENCES',
    'RELEVANT_CAMPAIGN_CONTENT_INPUTS',
    'MOBILE_AUTHORITY_REFERENCE',
    'DESKTOP_AUTHORITY_REFERENCE',
  ] as const,
  outputShape: 'MULTIPLE_PAGE_CONCEPT_TERRITORIES' as const,
} as const;

const NDXBOOK_CAMPAIGN_ENTRIES: readonly CampaignEntry[] = [
  {
    entryId: 'entry-001',
    projectId: 'ndxbook',
    title: 'Entry 001',
    role: 'EDITORIAL_ENTRY',
    creativeUse: 'SOURCE_MATERIAL',
  },
  {
    entryId: 'entry-002',
    projectId: 'ndxbook',
    title: 'Entry 002',
    role: 'EDITORIAL_ENTRY',
    creativeUse: 'SOURCE_MATERIAL',
  },
  {
    entryId: 'entry-003',
    projectId: 'ndxbook',
    title: 'Entry 003',
    role: 'EDITORIAL_ENTRY',
    creativeUse: 'PROVENANCE',
  },
];

/**
 * Historical page-concept sets keyed by projectId + pageId.
 * Do not fabricate candidates — empty until GPT2 generation is run.
 */
const PAGE_CONCEPT_STORE: Partial<Record<string, readonly PageConceptCandidate[]>> = {};

function conceptStoreKey(projectId: string, pageId: string): string {
  return `${projectId}::${pageId}`;
}

export function listCampaignEntriesForProject(projectId: string): readonly CampaignEntry[] {
  if (projectId === 'ndxbook') return NDXBOOK_CAMPAIGN_ENTRIES;
  return [];
}

export function listPageConceptCandidates(projectId: string, pageId: string): readonly PageConceptCandidate[] {
  return PAGE_CONCEPT_STORE[conceptStoreKey(projectId, pageId)] ?? [];
}

export function pageConceptGalleryEmptyMessage(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): string | null {
  const scoped = listPageConceptCandidates(projectId, pageId).filter((c) => c.viewportScope === viewport);
  if (scoped.length > 0) return null;
  const anyForPage = listPageConceptCandidates(projectId, pageId);
  if (anyForPage.length === 0) return 'NO PAGE CONCEPT SET YET';
  if (viewport === 'DESKTOP') return 'NO DESKTOP PAGE CONCEPTS YET';
  if (viewport === 'TABLET') return 'NO TABLET PAGE CONCEPTS YET';
  return 'NO PAGE CONCEPTS FOR THIS VIEWPORT';
}

export type DesignPageProvenancePresentation = {
  activePageLabel: string;
  pageRoleLabel: string;
  informedBy: readonly string[];
  creativeLayer: typeof CREATIVE_LAYER_MODEL;
};

export function buildDesignPageProvenancePresentation(
  projectId: string,
  _pageId: string,
  pageName: string,
  pageRole: string,
): DesignPageProvenancePresentation {
  const campaigns = listCampaignEntriesForProject(projectId).map((e) => e.entryId.toUpperCase().replace(/-/g, ' '));
  return {
    activePageLabel: pageName.toUpperCase(),
    pageRoleLabel: pageRole.replace(/_/g, ' '),
    informedBy: [
      ...campaigns.slice(0, 3),
      'brand intelligence',
      'creative territories',
    ],
    creativeLayer: CREATIVE_LAYER_MODEL,
  };
}

export function mapPageConceptToGalleryCandidate(concept: PageConceptCandidate): {
  id: string;
  version: string;
  surface: 'plate' | 'grain' | 'collage' | 'archive';
  versionTag: 'chip' | 'plain' | 'none';
  viewportScope: PageViewportId;
} {
  const idx = concept.conceptId.length % 4;
  const surfaces = ['plate', 'grain', 'collage', 'archive'] as const;
  return {
    id: concept.conceptId,
    version: concept.conceptTitle.slice(0, 12).toUpperCase(),
    surface: surfaces[idx] ?? 'plate',
    versionTag: concept.status === 'SELECTED' ? 'chip' : 'plain',
    viewportScope: concept.viewportScope,
  };
}
