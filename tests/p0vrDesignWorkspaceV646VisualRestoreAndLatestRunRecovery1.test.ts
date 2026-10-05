/**
 * P0.VR.DESIGN-WORKSPACE-V646-VISUAL-RESTORE-AND-LATEST-RUN-RECOVERY1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { PAGE_CONCEPT_FIT_FULL_SCREEN, PAGE_CONCEPT_FIT_HEADER_CROP } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptArtifactFitModes.js';
import { PAGE_CONCEPT_HEADER_THUMBNAIL_CROP } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
import { buildPageConceptGallerySections } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
import {
  reconcileLatestMobileSlotArtifactsFromCandidates,
  resolvePageConceptLatestGenerationDiagnostics,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLatestGenerationRun.js';
import { savePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';
const PAGE = 'page-overview';
const root = join(process.cwd());

function readSrc(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function gpt2Job(artifactId: string, slot: 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C', createdAt: string) {
  return {
    artifactId,
    projectId: PROJECT,
    pageId: PAGE,
    renditionSlot: slot,
    viewport: 'MOBILE' as const,
    captureSetId: 'cap',
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractId: 'fc',
    creativeInjectionId: 'inj',
    gpt2AuthorityConceptId: `pg2-${artifactId}`,
    renditionId: `pg2-${artifactId}`,
    provider: 'GPT2_MOBILE' as const,
    model: 'm',
    providerJobId: `fal-${artifactId}`,
    promptVersion: 'v7',
    createdAt,
    status: 'READY' as const,
    artifactPath: null,
    imageUri: `https://cdn.test/${artifactId}.png`,
    width: 768,
    height: 1376,
  };
}

function baseState(activeRunId: string, jobs: ReturnType<typeof gpt2Job>[]): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId: PAGE,
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: `ps-${activeRunId}`,
      projectId: PROJECT,
      pageId: PAGE,
      targetType: 'PAGE',
      captureSetId: 'cap',
      functionContractId: 'fc',
      creativeInjection: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [],
      webExpressionTerritorySet: {
        territorySetId: 'wet-v647',
        territories: [
          { territorySlot: 'A', name: 'Territory A', territoryId: 't-a' },
          { territorySlot: 'B', name: 'Territory B', territoryId: 't-b' },
          { territorySlot: 'C', name: 'Territory C', territoryId: 't-c' },
        ],
      },
      createdAt: jobs[0]?.createdAt ?? new Date().toISOString(),
    },
    generationJobs: jobs,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    lastFailure: null,
    history: [],
    activeGenerationRunId: activeRunId,
    activeGenerationRunStartedAt: jobs[jobs.length - 1]?.createdAt ?? null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}

describe('P0.VR design workspace v646 visual restore + latest run recovery', () => {
  beforeEach(() => {
    resetPageConceptCandidatesForTests(PROJECT, PAGE);
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    });
  });

  it('v645 hero fit CSS + pane flex chain preserved', () => {
    const hero = readSrc('src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx');
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    const listCss = readSrc('src/site00/styles/site00-twin-opus-list.css');
    expect(hero).toContain('size="heroReview"');
    expect(readSrc('src/site00/styles/site00-page-concept-generator.css')).toContain("data-contain-size='heroReview'");
    expect(css).toContain('min-height: 0');
    expect(listCss).toContain('tod-lv-gallery__rail:not(.s00-design-concept-gallery-grid)');
    expect(PAGE_CONCEPT_FIT_FULL_SCREEN).toBe('FIT_FULL_SCREEN');
  });

  it('v645 gallery grid geometry preserved (no flex cluster on current grid)', () => {
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('repeat(3, minmax(0, 1fr))');
    expect(css).toContain('.tod-gallery__rail:not(.s00-design-concept-gallery-grid) .tod-card--concept');
    expect(css).toContain('.tod-gallery__body:has(.s00-design-concept-gallery-grid)');
    expect(css).toContain('.tod-card:not(.tod-card--concept)');
    expect(css).not.toMatch(
      /\.tod-gallery \.tod-card--concept\s*\{[^}]*flex:\s*0\s+0\s+92px/s,
    );
  });

  it('gallery header crop — softer zoom (56% viewport height)', () => {
    expect(PAGE_CONCEPT_FIT_HEADER_CROP).toBe('HEADER_CROP');
    expect(PAGE_CONCEPT_HEADER_THUMBNAIL_CROP.heightFraction).toBe(0.56);
  });

  it('hero workflow rail restores lime/ghost button fills', () => {
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('.tod-rail--heroWorkflow .tod-rail__action--lime');
    expect(css).toMatch(/\.tod-rail--heroWorkflow[\s\S]*background:\s*var\(--tod-lime\)/);
    const listCss = readSrc('src/site00/styles/site00-twin-opus-list.css');
    expect(listCss).toContain('.tod-lv-rail--heroWorkflow .tod-lv-rail__action--ghost');
  });

  it('hero compare fills artifact with capture-matched framing', () => {
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    const pcg = readSrc('src/site00/styles/site00-page-concept-generator.css');
    const hero = readSrc('src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx');
    expect(pcg).toContain("data-contain-size='heroReview'");
    expect(css).toContain('.tod-hero-compare__artifact .s00-pcg__containPreview[data-contain-size=\'heroReview\']');
    expect(css).toMatch(/heroReview[\s\S]*position:\s*absolute/);
    expect(pcg).toContain("data-hero-capture-framed='true'");
    expect(pcg).toMatch(/hero-capture-framed[\s\S]*object-fit:\s*cover/);
    expect(hero).toContain('heroCaptureDimensions');
    expect(readSrc('shared/site00-design-workspace-production/designHeroComparePresentation.ts')).toContain(
      'resolveHeroCompareConceptPreviewSrc',
    );
  });

  it('canonical gallery grid stretches concept cards full panel width', () => {
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('.s00-design-concept-gallery-grid.tod-gallery__rail--current');
    expect(css).toMatch(/s00-design-concept-gallery-grid\.tod-gallery__rail--current[\s\S]*width:\s*100%/);
    expect(css).toContain('justify-self: stretch');
  });

  it('v646 full vertical hero rail component preserved', () => {
    const canonical = readSrc('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('DesignViewportFamilyHeroRail');
    expect(canonical).toContain('tod-rail--heroWorkflow');
    const rail = readSrc('src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx');
    expect(rail).toContain('data-rail-layout="full-vertical"');
  });

  it('resolves latest generation from renditionSlot jobs without MOBILE_CONCEPT_* artifact ids', () => {
    const run = 'run-rendition-slots';
    const state = baseState(run, [
      gpt2Job('fal-art-a', 'RENDITION_A', '2026-09-24T10:00:00.000Z'),
      gpt2Job('fal-art-b', 'RENDITION_B', '2026-09-24T10:01:00.000Z'),
      gpt2Job('fal-art-c', 'RENDITION_C', '2026-09-24T10:02:00.000Z'),
    ]);
    syncPageConceptGalleryFromGenerationState(state);
    savePageConceptGenerationState(state);

    const diagnostics = resolvePageConceptLatestGenerationDiagnostics(state, {
      candidates: listPageConceptCandidates(PROJECT, PAGE),
    });
    expect(diagnostics.latestGenerationResolution).toBe('LATEST_RUN_READY');
    expect(diagnostics.slotArtifactIds.A).toBe('fal-art-a');
    expect(diagnostics.slotArtifactIds.B).toBe('fal-art-b');
    expect(diagnostics.slotArtifactIds.C).toBe('fal-art-c');

    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.currentGenerationUnresolvedMessage).toBeNull();
    expect(sections.current).toHaveLength(3);
  });

  it('v647 web expression territory metadata does not break gallery resolution', () => {
    const run = 'run-v647';
    const state = baseState(run, [
      gpt2Job('fal-v647-a', 'RENDITION_A', '2026-09-24T11:00:00.000Z'),
      gpt2Job('fal-v647-b', 'RENDITION_B', '2026-09-24T11:01:00.000Z'),
      gpt2Job('fal-v647-c', 'RENDITION_C', '2026-09-24T11:02:00.000Z'),
    ]);
    syncPageConceptGalleryFromGenerationState(state);
    savePageConceptGenerationState(state);
    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.current.some((c) => c.territoryLabel.includes('Territory'))).toBe(true);
    expect(sections.currentGenerationUnresolvedMessage).toBeNull();
  });

  it('newest slot version wins on partial regen', () => {
    syncPageConceptGalleryFromGenerationState(
      baseState('run-b-v2', [
        gpt2Job('art-a-v1', 'RENDITION_A', '2026-09-21T10:00:00.000Z'),
        gpt2Job('art-b-v1', 'RENDITION_B', '2026-09-21T10:01:00.000Z'),
        gpt2Job('art-c-v1', 'RENDITION_C', '2026-09-21T10:02:00.000Z'),
        gpt2Job('art-b-v2', 'RENDITION_B', '2026-09-21T11:00:00.000Z'),
      ]),
    );
    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.current.find((c) => c.slotLabel === 'B')?.artifactId).toBe('art-b-v2');
    expect(sections.latestGenerationDiagnostics?.slotVersions.B).toBe(2);
  });

  it('does not silently promote stale HISTORY as current when newer CURRENT exists', () => {
    syncPageConceptGalleryFromGenerationState(
      baseState('run-new', [
        gpt2Job('art-a-new', 'RENDITION_A', '2026-09-24T12:00:00.000Z'),
        gpt2Job('art-b-new', 'RENDITION_B', '2026-09-24T12:01:00.000Z'),
        gpt2Job('art-c-new', 'RENDITION_C', '2026-09-24T12:02:00.000Z'),
      ]),
    );
    syncPageConceptGalleryFromGenerationState(
      baseState('run-old', [
        gpt2Job('art-a-old', 'RENDITION_A', '2026-09-20T12:00:00.000Z'),
      ]),
      { archivedHistorical: true, upsertActiveRunId: 'run-new' },
    );
    const candidates = listPageConceptCandidates(PROJECT, PAGE);
    const reconciled = reconcileLatestMobileSlotArtifactsFromCandidates(candidates, 'MOBILE');
    expect(reconciled.slotArtifactIds.A).toBe('art-a-new');
    expect(reconciled.slotArtifactIds.A).not.toBe('art-a-old');
  });

  it('recovers linkage from durable candidates when run row is incomplete', () => {
    const run = 'run-damaged';
    const state: PageConceptGenerationState = {
      ...baseState(run, []),
      activeGenerationRunId: null,
      activeReviewRunId: null,
      generationJobs: [],
      pipelineSet: {
        ...baseState(run, [])!.pipelineSet!,
        mobileConcepts: [
          {
            slot: 'MOBILE_CONCEPT_A',
            conceptId: 'mc-a',
            artifactId: 'orphan-a',
            status: 'READY',
            imageUri: 'https://cdn.test/orphan-a.png',
            createdAt: '2026-09-24T13:00:00.000Z',
            territoryLabel: 'Territory A',
            gpt2MobileDebug: null,
          },
          {
            slot: 'MOBILE_CONCEPT_B',
            conceptId: 'mc-b',
            artifactId: 'orphan-b',
            status: 'READY',
            imageUri: 'https://cdn.test/orphan-b.png',
            createdAt: '2026-09-24T13:01:00.000Z',
            territoryLabel: 'Territory B',
            gpt2MobileDebug: null,
          },
          {
            slot: 'MOBILE_CONCEPT_C',
            conceptId: 'mc-c',
            artifactId: 'orphan-c',
            status: 'READY',
            imageUri: 'https://cdn.test/orphan-c.png',
            createdAt: '2026-09-24T13:02:00.000Z',
            territoryLabel: 'Territory C',
            gpt2MobileDebug: null,
          },
        ],
      },
    };
    syncPageConceptGalleryFromGenerationState(state);
    savePageConceptGenerationState(state);

    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.currentGenerationUnresolvedMessage).toBeNull();
    expect(sections.currentGenerationGroupLabel).toBe('RECOVERED CURRENT GENERATION');
    expect(sections.current).toHaveLength(3);
  });

  it('grid/list share buildPageConceptGallerySections + group label wiring', () => {
    const workspace = readSrc('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('gallerySections.currentGenerationGroupLabel');
    expect(workspace).toContain('buildPageConceptGallerySections');
  });
});
