/**
 * P0.VR.DESIGN-WORKSPACE-LIST-GRID-SYNC-AND-GALLERY-THUMBNAIL-REFINEMENT1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO,
  PAGE_CONCEPT_HEADER_THUMBNAIL_CROP,
  pageConceptHeaderThumbnailUriFromArtifact,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';
import { mapPageConceptToGalleryCard } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import { PAGE_CONCEPT_HEADER_THUMB_ASPECT_RATIO } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';
import type { PageConceptCandidate } from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';

const ROOT = join(process.cwd(), 'src/site00/components/designBench/opusDirect');

function readOpusFile(name: string): string {
  return readFileSync(join(ROOT, name), 'utf8');
}

function mobileCandidate(conceptId: string, slot: PageConceptCandidate['conceptSlot']): PageConceptCandidate {
  return {
    conceptId,
    projectId: 'ndxbook',
    pageId: 'ndxbook:overview',
    conceptTitle: 'Overview',
    conceptTerritory: 'TERRITORY',
    pipelineId: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
    conceptSlot: slot,
    renditionSlot: null,
    viewportScope: 'MOBILE',
    artifactId: `art-${conceptId}`,
    runId: 'run-1',
    runLabel: 'RUN 1',
    runGroup: 'CURRENT',
    galleryFilterStatus: 'CANDIDATE',
    artifactStatus: 'READY',
    artifactRole: 'MOBILE_CANDIDATE',
    status: 'CANDIDATE',
    visualReference: `https://cdn.test/${conceptId}.png`,
    mobileVisualReference: `https://cdn.test/${conceptId}.png`,
    desktopVisualReference: null,
    createdAt: '2026-09-24T12:00:00.000Z',
  };
}

describe('P0.VR design workspace list/grid sync + gallery thumbnails', () => {
  it('maps header thumbnail metadata from full artifact (no duplicate URI)', () => {
    const card = mapPageConceptToGalleryCard(mobileCandidate('mc-a', 'MOBILE_CONCEPT_A'), 'mc-b');
    expect(card.previewSrc).toContain('mc-a.png');
    expect(card.headerThumbnailUri).toBe(card.previewSrc);
    expect(card.headerThumbnailCrop).toEqual(PAGE_CONCEPT_HEADER_THUMBNAIL_CROP);
    expect(pageConceptHeaderThumbnailUriFromArtifact(card.previewSrc)).toBe(card.previewSrc);
  });

  it('uses 16:9 landscape header thumb aspect everywhere', () => {
    expect(PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO).toBe('16 / 9');
    expect(PAGE_CONCEPT_HEADER_THUMB_ASPECT_RATIO).toBe('16 / 9');
    const css = readFileSync(
      join(process.cwd(), 'src/site00/styles/site00-page-concept-generator.css'),
      'utf8',
    );
    expect(css).toContain("[data-contain-size='headerThumb']");
    expect(css).toContain('aspect-ratio: 16 / 9');
  });

  it('grid and list render the shared candidate gallery rail', () => {
    const canonical = readOpusFile('TwinOpusDirectCanonicalView.tsx');
    const list = readOpusFile('TwinOpusDirectListView.tsx');
    expect(canonical).toContain('DesignConceptCandidateGalleryRail');
    expect(list).toContain('DesignConceptCandidateGalleryRail');
    expect(canonical).not.toContain('TodGalleryCandidateCard');
    expect(list).not.toContain('LvCandidateSurface');
    expect(list).not.toContain('data.candidates.map');
  });

  it('shared gallery card uses headerThumb size (not full portrait thumb)', () => {
    const card = readOpusFile('DesignConceptCandidateGalleryCard.tsx');
    expect(card).toContain('size="headerThumb"');
    expect(card).toContain('objectFit="cover"');
    expect(card).not.toContain('size="mobile"');
  });

  it('CSS distributes three candidates in equal grid columns', () => {
    const gridCss = readFileSync(join(process.cwd(), 'src/site00/styles/site00-twin-opus-direct.css'), 'utf8');
    const listCss = readFileSync(join(process.cwd(), 'src/site00/styles/site00-twin-opus-list.css'), 'utf8');
    expect(gridCss).toContain('.s00-design-concept-gallery-grid');
    expect(gridCss).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(listCss).toContain('.s00-design-concept-gallery-grid');
    expect(listCss).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
  });

  it('list defers to canonical viewport-family rail when GPT2 pipeline active', () => {
    const list = readOpusFile('TwinOpusDirectListView.tsx');
    expect(list).toContain('data.canonicalGpt2ViewportFamilyActive');
    expect(list).toContain('viewport-family-authority-rail');
    expect(list).toContain('tod-lv-pair');
  });

  it('workspace exposes single candidateSections for both views', () => {
    const workspace = readFileSync(join(ROOT, 'twinOpusDirectWorkspace.ts'), 'utf8');
    expect(workspace).toContain('candidateSections:');
    expect(workspace).toContain('headerThumbnailUri: card.headerThumbnailUri');
    const rail = readOpusFile('DesignConceptCandidateGalleryRail.tsx');
    expect(rail).toContain('data.candidateSections.current');
    expect(rail).toContain('data.candidateSections.history');
  });
});
