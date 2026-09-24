/**
 * P0.VR.DESIGN-WORKSPACE-PREVIEW-FIT-LATEST-RUN-AND-HERO-RAIL-RESTORE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listPageConceptCandidates,
  resetPageConceptCandidatesForTests,
} from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  buildGpt2ViewportFamilyAuthorityRailActions,
  buildGpt2ViewportFamilyAuthorityRail,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { PAGE_CONCEPT_FIT_FULL_SCREEN, PAGE_CONCEPT_FIT_HEADER_CROP } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptArtifactFitModes.js';
import {
  PAGE_CONCEPT_HEADER_THUMBNAIL_CROP,
  PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
import { buildPageConceptGallerySections } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import { syncPageConceptGalleryFromGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGallerySync.js';
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
    promptVersion: 'v1',
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

describe('P0.VR design workspace preview fit + latest run + hero rail restore', () => {
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

  it('keeps gallery grid geometry CSS unchanged', () => {
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('s00-design-concept-gallery-grid');
    expect(css).toContain('repeat(3, minmax(0, 1fr))');
    expect(PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO).toBe('16 / 9');
  });

  it('uses softer header thumbnail crop than 0.32 zoom band', () => {
    expect(PAGE_CONCEPT_HEADER_THUMBNAIL_CROP.heightFraction).toBeGreaterThan(0.32);
    expect(PAGE_CONCEPT_HEADER_THUMBNAIL_CROP.scale).toBeLessThan(1 / 0.32);
    const css = readSrc('src/site00/styles/site00-page-concept-generator.css');
    expect(css).toContain('--pcg-header-scale');
    expect(css).not.toContain('scale(calc(1 / var(--pcg-header-crop, 0.32)))');
  });

  it('resolves latest run for CURRENT GENERATION and keeps older run in history', () => {
    const run1 = 'run-hist';
    const run2 = 'run-latest';
    syncPageConceptGalleryFromGenerationState(
      baseState(run1, [
        gpt2Job('art-a-r1', 'RENDITION_A', '2026-09-20T10:00:00.000Z'),
        gpt2Job('art-b-r1', 'RENDITION_B', '2026-09-20T10:01:00.000Z'),
        gpt2Job('art-c-r1', 'RENDITION_C', '2026-09-20T10:02:00.000Z'),
      ]),
    );
    const liveState = baseState(run2, [gpt2Job('art-a-r2', 'RENDITION_A', '2026-09-23T12:00:00.000Z')]);
    syncPageConceptGalleryFromGenerationState(liveState);
    savePageConceptGenerationState(liveState);

    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.currentRunId).toBe(run2);
    expect(sections.currentGenerationUnresolvedMessage).toBeNull();
    expect(sections.current.some((c) => c.artifactId === 'art-a-r2')).toBe(true);
    expect(sections.current.some((c) => c.artifactId === 'art-b-r1')).toBe(false);
    expect(sections.history.some((c) => c.artifactId === 'art-b-r1')).toBe(true);
  });

  it('selects newest artifact version per slot on partial regen', () => {
    const run1 = 'run-slot-b';
    syncPageConceptGalleryFromGenerationState(
      baseState(run1, [
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
    expect(sections.history.some((c) => c.artifactId === 'art-b-v1')).toBe(true);
  });

  it('does not resurrect archived run artifacts as CURRENT when hydrating', () => {
    const archivedRun = 'run-archived';
    const latestRun = 'run-live';
    const state: PageConceptGenerationState = {
      ...baseState(latestRun, [gpt2Job('art-a-live', 'RENDITION_A', '2026-09-24T12:00:00.000Z')]),
      archivedRuns: [
        {
          archiveId: 'arch-1',
          runId: archivedRun,
          pipelineSetId: `ps-${archivedRun}`,
          archivedAt: '2026-09-22T12:00:00.000Z',
          label: 'prev',
          reason: 'new gen',
          generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
          pipelineSet: baseState(archivedRun, [
            gpt2Job('art-a-old', 'RENDITION_A', '2026-09-20T12:00:00.000Z'),
          ]).pipelineSet!,
          generationJobs: [gpt2Job('art-a-old', 'RENDITION_A', '2026-09-20T12:00:00.000Z')],
        },
      ],
    };
    syncPageConceptGalleryFromGenerationState(state);
    savePageConceptGenerationState(state);
    for (const archived of state.archivedRuns ?? []) {
      syncPageConceptGalleryFromGenerationState(
        {
          ...state,
          pipelineSet: archived.pipelineSet,
          generationJobs: archived.generationJobs,
          activeGenerationRunId: archived.runId,
          activeReviewRunId: archived.runId,
        },
        { archivedHistorical: true, upsertActiveRunId: latestRun },
      );
    }
    const sections = buildPageConceptGallerySections({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
    });
    expect(sections.current.every((c) => c.artifactId !== 'art-a-old')).toBe(true);
    expect(listPageConceptCandidates(PROJECT, PAGE).some((c) => c.artifactId === 'art-a-old' && c.runGroup === 'HISTORY')).toBe(
      true,
    );
  });

  it('hero concept uses FIT_FULL_SCREEN parity (no conceptFill cover)', () => {
    const hero = readSrc('src/site00/components/designBench/opusDirect/DesignHeroComparePanel.tsx');
    expect(hero).not.toContain('conceptFill');
    expect(readSrc('src/site00/styles/site00-twin-opus-direct.css')).not.toContain('conceptFill');
    expect(PAGE_CONCEPT_FIT_FULL_SCREEN).toBe('FIT_FULL_SCREEN');
    expect(PAGE_CONCEPT_FIT_HEADER_CROP).toBe('HEADER_CROP');
  });

  it('restores viewport-family workflow rail actions without legacy authority pair labels', () => {
    const canonical = readSrc('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('DesignViewportFamilyHeroRail');
    expect(canonical).toContain('onViewportFamilyRailAction');
    const actions = buildGpt2ViewportFamilyAuthorityRailActions({
      pipelineSet: null,
      selectedMobileConceptId: null,
      selectedGalleryCandidateId: 'mc-a',
      generating: false,
      activeViewport: 'MOBILE',
    });
    expect(actions.some((a) => a.label === 'SELECT MOBILE CONCEPT')).toBe(true);
    expect(actions.some((a) => a.label.includes('AUTHORITY PAIR'))).toBe(false);
    const rows = buildGpt2ViewportFamilyAuthorityRail({
      pipelineSet: null,
      selectedMobileConceptLabel: null,
      activeViewport: 'MOBILE',
    });
    expect(rows).toHaveLength(5);
    expect(rows.some((r) => r.label === 'MOBILE AUTHORITY')).toBe(true);
    expect(rows.some((r) => r.label === 'VIEWPORT FAMILY')).toBe(true);
  });

  it('grid and list share latest-run resolver via workspace buildPageConceptGallerySections', () => {
    const workspace = readSrc('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('buildPageConceptGallerySections');
    expect(workspace).toContain('viewportFamilyHeroRailStages');
    expect(workspace).toContain('latestGenerationDiagnostics');
  });
});
