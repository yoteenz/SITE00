import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import {
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageMobileConceptSlotId,
} from './pageConceptViewportAuthorityFamily.js';
import {
  listPageConceptCandidatesHydrated,
  type PageConceptGalleryHydrationScope,
} from './pageConceptGalleryHydration.js';
import { loadPageConceptGenerationStateForDesignPage } from './pageConceptGenerationStateDiscovery.js';
import {
  filterPageConceptGalleryCurrentCandidates,
  pageConceptCurrentGenerationGroupLabel,
  pageConceptCurrentGenerationUnresolvedMessage,
  resolvePageConceptLatestGenerationDiagnostics,
  type PageConceptLatestGenerationDiagnostics,
} from './pageConceptLatestGenerationRun.js';
import { normalizePageConceptGenerationStateForGallery } from './pageConceptGalleryHydration.js';
import {
  pageConceptCandidateMatchesViewportGallery,
  resolvePageConceptViewportGalleryTitle,
} from './pageConceptViewportGalleryScope.js';
import { resolvePageConceptArtifactDisplayUrl } from './pageConceptArtifactDisplayUrl.js';
import {
  pageConceptHeaderThumbnailUriFromArtifact,
  PAGE_CONCEPT_HEADER_THUMBNAIL_CROP,
  type PageConceptHeaderThumbnailCrop,
} from './pageConceptConceptHeaderThumbnail.js';

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
  /** Same URI as previewSrc; gallery renders header band via CSS crop. */
  headerThumbnailUri: string | null;
  headerThumbnailCrop: PageConceptHeaderThumbnailCrop;
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
  currentGenerationUnresolvedMessage: string | null;
  currentGenerationGroupLabel: string;
  latestGenerationDiagnostics: PageConceptLatestGenerationDiagnostics | null;
};

export type PageConceptGalleryViewportFilter = PageViewportId;
export type PageConceptGalleryStatusFilter = 'CANDIDATE' | 'SELECTED' | 'APPROVED' | 'HISTORICAL' | 'ALL';

function slotLabelFromGalleryCard(card: PageConceptGalleryCard): 'A' | 'B' | 'C' | null {
  if (card.slotLabel === 'A' || card.slotLabel === 'B' || card.slotLabel === 'C') return card.slotLabel;
  if (card.conceptSlot === 'MOBILE_CONCEPT_A') return 'A';
  if (card.conceptSlot === 'MOBILE_CONCEPT_B') return 'B';
  if (card.conceptSlot === 'MOBILE_CONCEPT_C') return 'C';
  return null;
}

function galleryCardIdentity(card: PageConceptGalleryCard): string {
  return card.artifactId ?? card.id;
}

function cardPickScore(card: PageConceptGalleryCard, inCurrent: boolean): number {
  let score = 0;
  if (inCurrent) score += 100;
  if (card.runGroup !== 'HISTORY') score += 40;
  if (card.artifactStatus === 'READY') score += 20;
  if (card.previewSrc) score += 10;
  return score;
}

/**
 * Keep MOBILE A/B/C in one horizontal row — do not split missing slots into the history rail.
 */
export function coalesceMobileConceptGalleryAbcRow(input: {
  viewport: PageViewportId;
  current: readonly PageConceptGalleryCard[];
  history: readonly PageConceptGalleryCard[];
}): { current: readonly PageConceptGalleryCard[]; history: readonly PageConceptGalleryCard[] } {
  if (input.viewport !== 'MOBILE') return input;
  const currentIds = new Set(input.current.map((c) => c.id));
  const pool = [...input.current, ...input.history].filter(
    (c) => c.artifactRole === 'MOBILE_CANDIDATE' || c.conceptSlot,
  );
  if (pool.length === 0) return input;

  const pickedBySlot = new Map<PageMobileConceptSlotId, PageConceptGalleryCard>();
  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const letter =
      slot === 'MOBILE_CONCEPT_A' ? 'A'
      : slot === 'MOBILE_CONCEPT_B' ? 'B'
      : 'C';
    const matches = pool.filter((c) => {
      if (c.conceptSlot === slot) return true;
      return slotLabelFromGalleryCard(c) === letter;
    });
    if (matches.length === 0) continue;
    const best = matches.reduce((a, b) =>
      cardPickScore(b, currentIds.has(b.id)) > cardPickScore(a, currentIds.has(a.id)) ? b : a,
    );
    pickedBySlot.set(slot, best);
  }

  if (pickedBySlot.size === 0) return input;

  const mergedCurrent = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => pickedBySlot.get(slot)).filter(
    (c): c is PageConceptGalleryCard => Boolean(c),
  );
  const mergedKeys = new Set(mergedCurrent.map(galleryCardIdentity));
  const history = input.history.filter((c) => !mergedKeys.has(galleryCardIdentity(c)));
  return { current: mergedCurrent, history };
}

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
    previewSrc: (() => {
      const full = resolvePageConceptArtifactDisplayUrl(
        concept.artifactRole === 'DESKTOP_INTERPRETATION' ?
          concept.desktopVisualReference ?? concept.visualReference
        : concept.artifactRole === 'TABLET_INTERPRETATION' ?
          concept.visualReference
        : concept.mobileVisualReference ?? concept.visualReference,
      );
      return full;
    })(),
    headerThumbnailUri: pageConceptHeaderThumbnailUriFromArtifact(
      resolvePageConceptArtifactDisplayUrl(
        concept.artifactRole === 'DESKTOP_INTERPRETATION' ?
          concept.desktopVisualReference ?? concept.visualReference
        : concept.artifactRole === 'TABLET_INTERPRETATION' ?
          concept.visualReference
        : concept.mobileVisualReference ?? concept.visualReference,
      ),
    ),
    headerThumbnailCrop: PAGE_CONCEPT_HEADER_THUMBNAIL_CROP,
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
  const generationState = normalizePageConceptGenerationStateForGallery(
    loadPageConceptGenerationStateForDesignPage({
      projectSlug: input.projectId,
      pageId: input.pageId,
      screenId: input.galleryScope?.screenId,
      route: input.galleryScope?.route ?? null,
    }),
  );
  const latestGenerationDiagnostics = resolvePageConceptLatestGenerationDiagnostics(generationState, {
    candidates: all,
  });
  const currentRunId = latestGenerationDiagnostics.activeGenerationRunId;
  const currentGenerationUnresolvedMessage = pageConceptCurrentGenerationUnresolvedMessage(latestGenerationDiagnostics);
  const galleryLabels = resolvePageConceptViewportGalleryTitle(input.viewport);
  const currentGenerationGroupLabel = pageConceptCurrentGenerationGroupLabel(
    latestGenerationDiagnostics,
    galleryLabels.currentGroupLabel,
  );

  const currentConcepts = filterPageConceptGalleryCurrentCandidates({
    candidates: all,
    viewport: input.viewport,
    state: generationState,
  });
  const currentIds = new Set(currentConcepts.map((c) => c.artifactId ?? c.conceptId));
  let current = cards.filter((c) => currentIds.has(c.artifactId ?? c.id));
  let history = cards.filter((c) => !currentIds.has(c.artifactId ?? c.id));
  const coalesced = coalesceMobileConceptGalleryAbcRow({
    viewport: input.viewport,
    current,
    history,
  });
  current = [...coalesced.current];
  history = [...coalesced.history];
  return {
    currentRunId,
    current,
    history,
    currentGenerationUnresolvedMessage,
    currentGenerationGroupLabel,
    latestGenerationDiagnostics,
  };
}
