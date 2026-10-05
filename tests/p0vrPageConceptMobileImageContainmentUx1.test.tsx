/**
 * P0.VR.PAGE-CONCEPT-MOBILE-IMAGE-CONTAINMENT-UX1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS,
  PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS,
  PAGE_CONCEPT_DESKTOP_PREVIEW_MAX_HEIGHT,
  PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT,
  PAGE_CONCEPT_PREVIEW_OBJECT_FIT,
  PAGE_CONCEPT_TABLET_PREVIEW_MAX_HEIGHT,
  PAGE_CONCEPT_THUMBNAIL_PREVIEW_MAX_HEIGHT,
  pageConceptPreviewHeightForSize,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptImageContainment.js';

const CSS = readFileSync(resolve('src/site00/styles/site00-page-concept-generator.css'), 'utf8');

describe('P0.VR.PAGE-CONCEPT-MOBILE-IMAGE-CONTAINMENT-UX1', () => {
  it('mobile preview max height and object-fit contain are defined', () => {
    expect(pageConceptPreviewHeightForSize('mobile')).toBe(PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT);
    expect(PAGE_CONCEPT_PREVIEW_OBJECT_FIT).toBe('contain');
    expect(CSS).toContain(PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT);
    expect(CSS).toContain(`.${PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS}`);
    expect(CSS).toContain('object-fit: contain');
  });

  it('preview frame uses fixed height not natural 844px document flow', () => {
    expect(CSS).toMatch(/\.s00-pcg__containPreview[\s\S]*height: var\(--pcg-contain-h\)/);
    expect(CSS).toMatch(/min-height: var\(--pcg-contain-h\)/);
    expect(CSS).toMatch(/max-height: var\(--pcg-contain-h\)/);
    expect(CSS).not.toMatch(/\.s00-pcg__mobileReviewThumb img[\s\S]*height:\s*844px/);
  });

  it('fullscreen is explicit via secAction not unbounded hero img only', () => {
    expect(CSS).toContain('.s00-pcg__secAction');
    expect(CSS).toContain(`.${PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS}`);
  });

  it('selected state highlights card without expand modifier', () => {
    expect(CSS).toContain('.s00-pcg__mobileReviewCard[data-selected');
    expect(CSS).not.toMatch(/data-selected[\s\S]*height:\s*844px/);
  });

  it('sticky header and footer remain on generator shell', () => {
    expect(CSS).toMatch(/\.s00-pcg__head[\s\S]*position:\s*sticky/);
    expect(CSS).toMatch(/\.s00-pcg__foot[\s\S]*position:\s*sticky/);
  });

  it('three-concept mobile review stacks in column by default', () => {
    expect(CSS).toMatch(/\.s00-pcg__mobileReview[\s\S]*flex-direction:\s*column/);
  });

  it('loading skeleton uses same frame height container', () => {
    expect(CSS).toContain('.s00-pcg__containPreviewSkeleton');
    expect(CSS).toContain('.s00-pcg__containPreviewEmpty');
  });

  it('tablet and desktop bounded preview heights', () => {
    expect(pageConceptPreviewHeightForSize('tablet')).toBe(PAGE_CONCEPT_TABLET_PREVIEW_MAX_HEIGHT);
    expect(pageConceptPreviewHeightForSize('desktop')).toBe(PAGE_CONCEPT_DESKTOP_PREVIEW_MAX_HEIGHT);
    expect(CSS).toContain(PAGE_CONCEPT_TABLET_PREVIEW_MAX_HEIGHT);
    expect(CSS).toContain(PAGE_CONCEPT_DESKTOP_PREVIEW_MAX_HEIGHT);
  });

  it('thumbnail level uses 76px frame', () => {
    expect(pageConceptPreviewHeightForSize('thumb')).toBe(PAGE_CONCEPT_THUMBNAIL_PREVIEW_MAX_HEIGHT);
    expect(CSS).toContain(PAGE_CONCEPT_THUMBNAIL_PREVIEW_MAX_HEIGHT);
  });

  it('twin comparison cards reference contained preview sizing', () => {
    expect(CSS).toContain('.s00-pcg__dualCard .s00-pcg__containPreview');
  });

  it('layer scroll body prevents nested document blowout', () => {
    expect(CSS).toContain('.s00-pcg-layer__scrollBody');
    expect(CSS).toMatch(/\.s00-pcg-layer__scrollBody[\s\S]*overflow-y:\s*auto/);
  });
});
