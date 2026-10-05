/**
 * Gallery tap = local preview only (no authority API snap-back).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const workspace = readFileSync(
  join(process.cwd(), 'src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts'),
  'utf8',
);
const production = readFileSync(
  join(process.cwd(), 'src/site00/components/designBench/opusDirect/useTwinOpusDirectProduction.ts'),
  'utf8',
);
const galleryCard = readFileSync(
  join(process.cwd(), 'src/site00/components/designBench/opusDirect/DesignConceptCandidateGalleryCard.tsx'),
  'utf8',
);

describe('P0.VR — gallery selection preview responsiveness', () => {
  it('selectCandidate does not dispatch viewport-family selectMobile (preview-only tap)', () => {
    const fn = workspace.slice(workspace.indexOf('selectCandidate: (id: string) =>'));
    const block = fn.slice(0, fn.indexOf('toggleAuthorityPair'));
    expect(block).not.toContain('viewportFamilyHandlers.selectMobile');
  });

  it('does not snap candidateId to mobile authority while selection is a valid gallery row', () => {
    expect(workspace).toContain('galleryIds.includes(candidateId)');
    expect(workspace).not.toContain('selectedMobileConceptId === candidateId) return');
  });

  it('optimistically updates production session on gallery select', () => {
    expect(production).toContain('applyLocalState(transitionSelectGalleryCandidate');
  });

  it('uses one shared header crop in gallery cards (no per-tap scale jump)', () => {
    expect(galleryCard).toContain('headerThumbnailCrop={PAGE_CONCEPT_HEADER_THUMBNAIL_CROP}');
    expect(galleryCard).not.toContain('candidate.headerThumbnailCrop');
  });
});
