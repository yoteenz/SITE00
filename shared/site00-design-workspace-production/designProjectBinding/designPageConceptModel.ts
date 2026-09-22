/**
 * P0.VR.DESIGN-PAGE-CONCEPT-MODEL1 — site pages vs campaigns vs page concepts (GPT2 contract).
 */

import type { PageViewportId } from './pageViewportAuthority.js';
import type { PageConceptPipelineLineageId } from '../pageConceptPipeline/pageConceptCanonicalPipeline.js';
import type { PageMobileConceptSlotId } from '../pageConceptPipeline/pageConceptViewportAuthorityFamily.js';

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

export type PageConceptCandidateArtifactStatus = 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';

export type PageConceptGalleryRunGroup = 'CURRENT' | 'HISTORY';

export type PageConceptGalleryFilterStatus = 'CANDIDATE' | 'SELECTED' | 'APPROVED' | 'HISTORICAL';

export type PageConceptArtifactRole =
  | 'MOBILE_CANDIDATE'
  | 'TABLET_INTERPRETATION'
  | 'DESKTOP_INTERPRETATION';

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
  mobileVisualReference?: string | null;
  desktopVisualReference?: string | null;
  gpt2AuthorityConceptId?: string | null;
  creativeInjectionId?: string | null;
  renditionSlot?: 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C';
  generatedBy: typeof CREATIVE_LAYER_MODEL;
  createdAt: string | null;
  lineage: PageConceptLineage;
  status: PageConceptCandidateStatus;
  viewportScope: PageViewportId;
  runId?: string | null;
  artifactId?: string | null;
  conceptSlot?: PageMobileConceptSlotId | null;
  pipelineId?: PageConceptPipelineLineageId | null;
  artifactStatus?: PageConceptCandidateArtifactStatus;
  runGroup?: PageConceptGalleryRunGroup;
  runLabel?: string | null;
  artifactRole?: PageConceptArtifactRole;
  galleryFilterStatus?: PageConceptGalleryFilterStatus;
};

export type PageConceptRenditionRegistration = {
  conceptId: string;
  projectId: string;
  pageId: string;
  conceptTitle: string;
  conceptTerritory: string;
  creativeRationale: string;
  mobileVisualReference: string | null;
  desktopVisualReference: string | null;
  gpt2AuthorityConceptId: string;
  creativeInjectionId: string | null;
  renditionSlot: 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C';
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
  outputShape: 'SINGLE_AUTHORITY_MULTI_RENDITION' as const,
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

function computeRunLabels(candidates: readonly PageConceptCandidate[]): Map<string, string> {
  const runFirstAt = new Map<string, string>();
  for (const c of candidates) {
    if (!c.runId) continue;
    const at = c.createdAt ?? '';
    const prev = runFirstAt.get(c.runId);
    if (!prev || (at && at < prev)) runFirstAt.set(c.runId, at);
  }
  const ordered = [...runFirstAt.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const labels = new Map<string, string>();
  ordered.forEach(([runId], index) => {
    labels.set(runId, `RUN ${String(index + 1).padStart(2, '0')}`);
  });
  return labels;
}

function applyRunLabels(candidates: PageConceptCandidate[]): PageConceptCandidate[] {
  const labels = computeRunLabels(candidates);
  return candidates.map((c) => ({
    ...c,
    runLabel: c.runId ? labels.get(c.runId) ?? c.runLabel ?? null : c.runLabel ?? null,
  }));
}

export function upsertPageConceptCandidates(
  projectId: string,
  pageId: string,
  incoming: readonly PageConceptCandidate[],
  options?: { activeRunId?: string | null; selectedMobileConceptId?: string | null },
): void {
  const key = conceptStoreKey(projectId, pageId);
  const existing = [...(PAGE_CONCEPT_STORE[key] ?? [])];
  const activeRunId = options?.activeRunId ?? null;
  const selectedMobileConceptId = options?.selectedMobileConceptId ?? null;

  for (const row of incoming) {
    const artifactKey = row.artifactId ?? `${row.conceptId}::${row.runId ?? 'unknown'}`;
    const sameSlotCurrentRun = existing.filter(
      (e) =>
        e.conceptSlot &&
        row.conceptSlot &&
        e.conceptSlot === row.conceptSlot &&
        e.runId === activeRunId &&
        e.artifactId !== row.artifactId,
    );
    for (const prior of sameSlotCurrentRun) {
      const idx = existing.findIndex((e) => e.artifactId === prior.artifactId);
      if (idx >= 0) {
        existing[idx] = {
          ...existing[idx]!,
          runGroup: 'HISTORY',
          status: 'ARCHIVED',
          galleryFilterStatus: 'HISTORICAL',
        };
      }
    }

    const foundIdx = existing.findIndex((e) => (e.artifactId ?? '') === artifactKey || e.artifactId === row.artifactId);
    const merged: PageConceptCandidate = {
      ...(foundIdx >= 0 ? existing[foundIdx]! : {}),
      ...row,
      runGroup: row.runId && activeRunId && row.runId !== activeRunId ? 'HISTORY' : row.runGroup ?? 'CURRENT',
    };
    if (selectedMobileConceptId && merged.conceptId === selectedMobileConceptId) {
      merged.status = 'SELECTED';
      merged.galleryFilterStatus = 'SELECTED';
    }
    if (foundIdx >= 0) existing[foundIdx] = merged;
    else existing.push(merged);
  }

  if (activeRunId) {
    for (let i = 0; i < existing.length; i++) {
      const c = existing[i]!;
      if (c.runId && c.runId !== activeRunId && c.runGroup !== 'HISTORY') {
        existing[i] = {
          ...c,
          runGroup: 'HISTORY',
          galleryFilterStatus: c.status === 'SELECTED' ? 'SELECTED' : 'HISTORICAL',
          status: c.status === 'SELECTED' ? 'SELECTED' : 'ARCHIVED',
        };
      }
    }
  }

  if (selectedMobileConceptId) {
    for (let i = 0; i < existing.length; i++) {
      const c = existing[i]!;
      if (c.conceptId === selectedMobileConceptId) {
        existing[i] = { ...c, status: 'SELECTED', galleryFilterStatus: 'SELECTED' };
      } else if (c.status === 'SELECTED' && c.conceptId !== selectedMobileConceptId) {
        existing[i] = {
          ...c,
          status: c.runGroup === 'HISTORY' ? 'ARCHIVED' : 'CANDIDATE',
          galleryFilterStatus: c.runGroup === 'HISTORY' ? 'HISTORICAL' : 'CANDIDATE',
        };
      }
    }
  }

  PAGE_CONCEPT_STORE[key] = applyRunLabels(existing);
}

export function registerPageConceptRenditions(
  projectId: string,
  pageId: string,
  rows: readonly PageConceptRenditionRegistration[],
): void {
  const now = new Date().toISOString();
  const candidates: PageConceptCandidate[] = rows.map((row) => ({
    conceptId: row.gpt2AuthorityConceptId || row.conceptId,
    projectId: row.projectId,
    pageId: row.pageId,
    conceptTitle: row.conceptTitle,
    conceptTerritory: row.conceptTerritory,
    creativeRationale: row.creativeRationale,
    visualReference: row.mobileVisualReference ?? row.desktopVisualReference,
    mobileVisualReference: row.mobileVisualReference,
    desktopVisualReference: row.desktopVisualReference,
    gpt2AuthorityConceptId: row.gpt2AuthorityConceptId,
    creativeInjectionId: row.creativeInjectionId,
    renditionSlot: row.renditionSlot,
    generatedBy: CREATIVE_LAYER_MODEL,
    createdAt: now,
    lineage: {
      brandIntelligence: ['project-intelligence', 'page-intelligence'],
      creativeTerritories: [row.renditionSlot],
    },
    status: 'CANDIDATE',
    viewportScope: 'MOBILE',
    artifactId: null,
    runGroup: 'CURRENT',
    artifactStatus: row.mobileVisualReference ? 'READY' : 'PENDING',
    artifactRole: 'MOBILE_CANDIDATE',
    galleryFilterStatus: 'CANDIDATE',
  }));
  upsertPageConceptCandidates(projectId, pageId, candidates);
}

export function resetPageConceptCandidatesForTests(projectId: string, pageId: string): void {
  delete PAGE_CONCEPT_STORE[conceptStoreKey(projectId, pageId)];
}

export function pageConceptUsesRenditionModel(projectId: string, pageId: string): boolean {
  return listPageConceptCandidates(projectId, pageId).some((c) => Boolean(c.renditionSlot));
}

export function pageConceptGalleryEmptyMessage(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): string | null {
  const all = listPageConceptCandidates(projectId, pageId);
  if (all.some((c) => c.artifactStatus === 'READY' || c.mobileVisualReference || c.visualReference)) {
    return null;
  }
  if (pageConceptUsesRenditionModel(projectId, pageId)) {
    if (all.length > 0) return null;
  } else {
    const scoped = all.filter((c) => c.viewportScope === viewport);
    if (scoped.length > 0) return null;
  }
  const anyForPage = listPageConceptCandidates(projectId, pageId);
  if (anyForPage.length === 0) return 'NO PAGE CONCEPTS YET';
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
  const slot =
    concept.conceptSlot === 'MOBILE_CONCEPT_A' || concept.renditionSlot === 'RENDITION_A' ? 'A'
    : concept.conceptSlot === 'MOBILE_CONCEPT_B' || concept.renditionSlot === 'RENDITION_B' ? 'B'
    : concept.conceptSlot === 'MOBILE_CONCEPT_C' || concept.renditionSlot === 'RENDITION_C' ? 'C'
    : null;
  const idx = (concept.artifactId ?? concept.conceptId).length % 4;
  const surfaces = ['plate', 'grain', 'collage', 'archive'] as const;
  return {
    id: concept.conceptId,
    version: slot ? `CONCEPT ${slot}` : concept.conceptTitle.slice(0, 12).toUpperCase(),
    surface: surfaces[idx] ?? 'plate',
    versionTag: concept.status === 'SELECTED' ? 'chip' : 'plain',
    viewportScope: concept.viewportScope,
  };
}
