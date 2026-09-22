/**
 * P0.VR.DESIGN-WORKSPACE-VIEWPORT-GALLERIES-CORRECTION1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { buildPageConceptGallerySections } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import {
  pageConceptCandidateMatchesViewportGallery,
  resolvePageConceptViewportGalleryTitle,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportGalleryScope.js';
import { resolvePageConceptViewportGalleryActions } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportGalleryActions.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';
const PAGE = 'ndxbook:overview';

function fullState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId: PAGE,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'ps-vp',
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [
        {
          conceptId: 'mc-a',
          slot: 'MOBILE_CONCEPT_A',
          artifactId: 'art-m-a',
          imageUri: 'https://cdn.test/ma.png',
          status: 'READY',
          createdAt: '2026-09-22T10:00:00.000Z',
        },
        {
          conceptId: 'mc-b',
          slot: 'MOBILE_CONCEPT_B',
          artifactId: 'art-m-b',
          imageUri: 'https://cdn.test/mb.png',
          status: 'READY',
          createdAt: '2026-09-22T10:01:00.000Z',
        },
        {
          conceptId: 'mc-c',
          slot: 'MOBILE_CONCEPT_C',
          artifactId: 'art-m-c',
          imageUri: 'https://cdn.test/mc.png',
          status: 'READY',
          createdAt: '2026-09-22T10:02:00.000Z',
        },
      ],
      viewportAuthorityFamily: {
        familyId: 'fam-1',
        cgptBriefId: 'b',
        cgptBriefVersion: '1',
        selectedMobileConceptId: 'mc-b',
        selectedMobileVersion: 'B',
        mobileArtifactId: 'art-m-b',
        tabletInterpretationId: 'ti-1',
        tabletArtifactId: 'art-t-1',
        tabletVersion: 'V1',
        desktopInterpretationId: 'di-1',
        desktopArtifactId: 'art-d-1',
        desktopVersion: 'V1',
        experienceExpressionContractId: 'ee-1',
        experienceExpressionVersion: '1',
        skinContractVersion: '1',
        skinContractId: 's',
        status: 'AWAITING_FOUNDER_FAMILY_REVIEW',
        viewportFamilyApprovalId: null,
        familyLockId: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T11:00:00.000Z',
      },
    },
    generationJobs: [
      {
        artifactId: 'art-m-a',
        projectId: PROJECT,
        pageId: PAGE,
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-a',
        renditionId: 'art-m-a',
        provider: 'GPT2_MOBILE',
        model: 'gpt2',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/ma.png',
        artifactPath: null,
        createdAt: '2026-09-22T10:00:00.000Z',
      },
      {
        artifactId: 'art-t-1',
        projectId: PROJECT,
        pageId: PAGE,
        renditionSlot: 'RENDITION_A',
        viewport: 'TABLET',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-b',
        renditionId: 'ti-1',
        provider: 'GPT2_TABLET',
        model: 'gpt2-tablet',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/t1.png',
        artifactPath: null,
        createdAt: '2026-09-22T11:00:00.000Z',
      },
      {
        artifactId: 'art-d-1',
        projectId: PROJECT,
        pageId: PAGE,
        renditionSlot: 'RENDITION_A',
        viewport: 'DESKTOP',
        captureSetId: 'c',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'f',
        creativeInjectionId: 'i',
        gpt2AuthorityConceptId: 'mc-b',
        renditionId: 'di-1',
        provider: 'GPT2_DESKTOP',
        model: 'gpt2-desktop',
        providerJobId: null,
        status: 'READY',
        imageUri: 'https://cdn.test/d1.png',
        artifactPath: null,
        createdAt: '2026-09-22T11:30:00.000Z',
      },
    ],
    generationStatus: 'VIEWPORT_FAMILY_REVIEW',
    lastFailure: null,
    history: [],
    activeReviewRunId: null,
    archivedRuns: [],
    activeGenerationRunId: 'run-vp',
    activeGenerationRunStartedAt: '2026-09-22T10:00:00.000Z',
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('P0.VR.DESIGN-WORKSPACE-VIEWPORT-GALLERIES-CORRECTION1', () => {
  beforeEach(() => {
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
      length: 0,
    });
    syncPageConceptGalleryFromGenerationState(fullState());
  });

  it('preserves distinct gallery titles per viewport', () => {
    expect(resolvePageConceptViewportGalleryTitle('MOBILE').title).toBe('CONCEPT CANDIDATE GALLERY');
    expect(resolvePageConceptViewportGalleryTitle('TABLET').title).toBe('TABLET INTERPRETATIONS');
    expect(resolvePageConceptViewportGalleryTitle('DESKTOP').title).toBe('DESKTOP INTERPRETATIONS');
  });

  it('scopes mobile gallery to A/B/C only', () => {
    const mobile = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(mobile.current.map((c) => c.slotLabel)).toEqual(['A', 'B', 'C']);
    expect(mobile.current.every((c) => c.artifactRole === 'MOBILE_CANDIDATE')).toBe(true);
  });

  it('scopes tablet gallery to tablet interpretations only', () => {
    const tablet = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'TABLET',
    });
    expect(tablet.current.length).toBe(1);
    expect(tablet.current[0]?.artifactRole).toBe('TABLET_INTERPRETATION');
    expect(tablet.current.some((c) => c.slotLabel === 'A')).toBe(false);
  });

  it('scopes desktop gallery to desktop interpretations only', () => {
    const desktop = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'DESKTOP',
    });
    expect(desktop.current.length).toBe(1);
    expect(desktop.current[0]?.artifactRole).toBe('DESKTOP_INTERPRETATION');
  });

  it('never mixes mobile candidates into tablet/desktop galleries', () => {
    const all = listPageConceptCandidates(PROJECT, PAGE);
    const tabletScoped = all.filter((c) => pageConceptCandidateMatchesViewportGallery(c, 'TABLET'));
    const desktopScoped = all.filter((c) => pageConceptCandidateMatchesViewportGallery(c, 'DESKTOP'));
    expect(tabletScoped.every((c) => c.artifactRole === 'TABLET_INTERPRETATION')).toBe(true);
    expect(desktopScoped.every((c) => c.artifactRole === 'DESKTOP_INTERPRETATION')).toBe(true);
    expect(tabletScoped.some((c) => c.conceptSlot?.startsWith('MOBILE'))).toBe(false);
  });

  it('exposes viewport-specific gallery actions for canonical GPT2', () => {
    expect(resolvePageConceptViewportGalleryActions({ viewport: 'MOBILE', canonicalGpt2: true }).some((a) => a.id === 'select-mobile')).toBe(true);
    expect(resolvePageConceptViewportGalleryActions({ viewport: 'TABLET', canonicalGpt2: true }).some((a) => a.id === 'use-tablet')).toBe(true);
    expect(resolvePageConceptViewportGalleryActions({ viewport: 'DESKTOP', canonicalGpt2: true }).some((a) => a.id === 'use-desktop')).toBe(true);
  });

  it('keeps viewport toggles in workspace source', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const src = readFileSync(
      join(import.meta.dirname, '..', 'src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx'),
      'utf8',
    );
    expect(src).toContain('data.viewports.map');
  });
});
