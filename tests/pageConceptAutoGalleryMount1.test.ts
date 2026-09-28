import { describe, expect, it } from 'vitest';

import { designPageMobileConceptGalleryIsEmpty } from '../src/site00/services/pageConceptAutoGalleryMount.js';

describe('designPageMobileConceptGalleryIsEmpty', () => {
  it('returns true when no candidates and no persisted mobile artifacts', () => {
    expect(
      designPageMobileConceptGalleryIsEmpty({
        projectSlug: 'vitest-empty-gallery',
        pageId: 'vitest:page:empty',
        screenId: 'overview',
      }),
    ).toBe(true);
  });
});
