import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import {
  listPageConceptCandidatesHydrated,
  type PageConceptGalleryHydrationScope,
} from './pageConceptGalleryHydration.js';
import { pageConceptCandidateMatchesViewportGallery } from './pageConceptViewportGalleryScope.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptArtifactDisplayUrl.js';

export type PageConceptGalleryCard = {
  id: string;
  artifactId: string | null;
  runId: string | null;
  conceptSlot: PageConceptCandidate['conceptSlot'];
  pipelineId: PageConceptCandidate['pipelineId'];
  version: string;
  surface: 'plate' | 'grain' | 'collage' | 'archive';
  versionTag: 'chip' | 'plain' | 'none';
  viewportScope: PageViewportId;
  previewSrc: string | null;
  slotLabel: string | null;
  pipelineLabel: string;
  territoryLabel: string;
  pageLabel: string;
  runLabel: string | null;
  createdAtLabel: string | null;
  artifactStatus: PageConceptCandidate['artifactStatus'];
  galleryFilterStatus: PageConceptCandidate['galleryFilterStatus'];
  runGroup: PageConceptCandidate['runGroup'];
  selectedMobileAuthority: boolean;
  artifactRole: PageConceptCandidate['artifactRole'];
};

export type PageConceptGallerySections = {
  currentRunId: string | null;
  current: readonly PageConceptGalleryCard[];
  history: readonly PageConceptGalleryCard[];
};

export type PageConceptGalleryViewportFilter = PageViewportId;
export type PageConceptGalleryStatusFilter = 'CANDIDATE' | 'SELECTED' | 'APPROVED' | 'HISTORICAL' | 'ALL';

function slotLabelFromConcept(concept: PageConceptCandidate): string | null {
  if (concept.conceptSlot === 'MOBILE_CONCEPT_A') return 'A';
  if (concept.conceptSlot === 'MOBILE_CONCEPT_B') return 'B';
  if (concept.conceptSlot === 'MOBILE_CONCEPT_C') return 'C';
  if (concept.renditionSlot === 'RENDITION_A') return 'A';
  if (concept.renditionSlot === 'RENDITION_B') return 'B';
  if (concept.renditionSlot === 'RENDITION_C') return 'C';
  return null;
}

function formatCreatedAt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return null;
  }
}

export function mapPageConceptToGalleryCard(
  concept: PageConceptCandidate,
  selectedMobileConceptId: string | null,
): PageConceptGalleryCard {
  const slotLabel = slotLabelFromConcept(concept);
  const selectedMobileAuthority =
    Boolean(selectedMobileConceptId && concept.conceptId === selectedMobileConceptId) ||
    concept.status === 'SELECTED';
  const idx = (concept.artifactId ?? concept.conceptId).length % 4;
  const surfaces = ['plate', 'grain', 'collage', 'archive'] as const;
  return {
    id: concept.conceptId,
    artifactId: concept.artifactId ?? null,
    runId: concept.runId ?? null,
    conceptSlot: concept.conceptSlot ?? null,
    pipelineId: concept.pipelineId ?? null,
    version:
      concept.artifactRole === 'TABLET_INTERPRETATION' || concept.artifactRole === 'DESKTOP_INTERPRETATION' ?
        concept.runLabel ?? concept.conceptTitle.slice(0, 20).toUpperCase()
      : slotLabel ? `CONCEPT ${slotLabel}`
      : concept.conceptTitle.slice(0, 16).toUpperCase(),
    surface: surfaces[idx] ?? 'plate',
    versionTag: selectedMobileAuthority ? 'chip' : concept.runGroup === 'HISTORY' ? 'none' : 'plain',
    viewportScope: concept.viewportScope,
    previewSrc: resolvePageConceptArtifactDisplayUrl(
      concept.artifactRole === 'DESKTOP_INTERPRETATION' ?
        concept.desktopVisualReference ?? concept.visualReference
      : concept.artifactRole === 'TABLET_INTERPRETATION' ?
        concept.visualReference
      : concept.mobileVisualReference ?? concept.visualReference,
    ),
    slotLabel,
    pipelineLabel:
      concept.artifactRole === 'TABLET_INTERPRETATION' ? 'TABLET INTERP'
      : concept.artifactRole === 'DESKTOP_INTERPRETATION' ? 'DESKTOP INTERP'
      : concept.pipelineId === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' || concept.artifactRole === 'MOBILE_CANDIDATE' ?
        'GPT2 MOBILE'
      : 'LEGACY',
    territoryLabel: concept.conceptTerritory,
    pageLabel: concept.pageId,
    runLabel: concept.runLabel ?? null,
    createdAtLabel: formatCreatedAt(concept.createdAt),
    artifactStatus: concept.artifactStatus ?? 'PENDING',
    galleryFilterStatus: concept.galleryFilterStatus ?? 'CANDIDATE',
    runGroup: concept.runGroup ?? 'CURRENT',
    selectedMobileAuthority,
    artifactRole: concept.artifactRole ?? 'MOBILE_CANDIDATE',
  };
}

function matchesStatusFilter(concept: PageConceptCandidate, filter: PageConceptGalleryStatusFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'HISTORICAL') return concept.runGroup === 'HISTORY' || concept.status === 'ARCHIVED';
  if (filter === 'SELECTED') return concept.status === 'SELECTED' || concept.galleryFilterStatus === 'SELECTED';
  if (filter === 'APPROVED') return concept.status === 'PROMOTED';
  return concept.galleryFilterStatus === 'CANDIDATE' || concept.status === 'CANDIDATE';
}

export function buildPageConceptGallerySections(input: {
  projectId: string;
  pageId: string;
  viewport: PageConceptGalleryViewportFilter;
  statusFilter?: PageConceptGalleryStatusFilter;
  selectedMobileConceptId?: string | null;
  galleryScope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>;
}): PageConceptGallerySections {
  const statusFilter = input.statusFilter ?? 'ALL';
  const all = listPageConceptCandidatesHydrated(input.projectId, input.pageId, input.galleryScope).filter((c) =>
    pageConceptCandidateMatchesViewportGallery(c, input.viewport),
  );
  const filtered = all.filter((c) => matchesStatusFilter(c, statusFilter));
  const selectedMobileConceptId = input.selectedMobileConceptId ?? null;
  const cards = filtered.map((c) => mapPageConceptToGalleryCard(c, selectedMobileConceptId));
  const currentRunId =
    cards.find((c) => c.runGroup === 'CURRENT' && c.runId)?.runId ??
    cards.find((c) => c.runId)?.runId ??
    null;
  const current = cards.filter((c) => c.runGroup !== 'HISTORY' && c.artifactStatus !== 'FAILED');
  const history = cards.filter((c) => c.runGroup === 'HISTORY' || c.galleryFilterStatus === 'HISTORICAL');
  return { currentRunId, current, history };
}
