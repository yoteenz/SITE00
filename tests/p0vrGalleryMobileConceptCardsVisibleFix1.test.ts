/**
 * P0.VR.GALLERY-MOBILE-CONCEPT-CARDS-VISIBLE-FIX1
 * Regression: group label flex-basis 100% inside horizontal rail hid Fal concept cards.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  buildPageConceptGallerySections,
  mapPageConceptToGalleryCard,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryPresentation.js';
import type { PageConceptCandidate } from '../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';

describe('P0.VR.GALLERY-MOBILE-CONCEPT-CARDS-VISIBLE-FIX1', () => {
  it('gallery CSS keeps labels outside the horizontal card rail', () => {
    const css = readFileSync('src/site00/styles/site00-twin-opus-direct.css', 'utf8');
    expect(css).toContain('.tod-gallery__filled');
    expect(css).not.toMatch(/\.tod-gallery__groupLabel\s*\{[^}]*flex:\s*0\s+0\s+100%/s);
    expect(css).toMatch(/\.tod-gallery__rail\s*\{[^}]*overflow-x:\s*auto/s);
  });

  it('gallery cards expose preview URLs when jobs are READY', () => {
    const candidate: PageConceptCandidate = {
      conceptId: 'pg2m-a',
      projectId: 'ndxbook',
      pageId: 'overview-page',
      conceptTitle: 'CONCEPT A',
      conceptTerritory: 'ARCHIVAL',
      creativeRationale: 'test',
      visualReference: 'https://site00.com/api/page-concept-artifacts/ndxbook/a.png',
      mobileVisualReference: 'https://site00.com/api/page-concept-artifacts/ndxbook/a.png',
      desktopVisualReference: null,
      generatedBy: 'GPT2',
      createdAt: '2026-09-23T12:00:00.000Z',
      lineage: {},
      status: 'CANDIDATE',
      viewportScope: 'MOBILE',
      runId: 'run-1',
      artifactId: 'art-a',
      conceptSlot: 'MOBILE_CONCEPT_A',
      pipelineId: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      artifactStatus: 'READY',
      runGroup: 'CURRENT',
      artifactRole: 'MOBILE_CANDIDATE',
      galleryFilterStatus: 'CANDIDATE',
    };
    void buildPageConceptGallerySections;
    const card = mapPageConceptToGalleryCard(candidate, null);
    expect(card.previewSrc).toContain('page-concept-artifacts');
    expect(card.previewSrc).toContain('artifact=art-a');
  });
});
