import { describe, expect, it } from 'vitest';

import { pageConceptServerRunHasReadyMobileGallery } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';

describe('gallery restore success signal', () => {
  it('treats READY GPT2 mobile jobs as restorable gallery', () => {
    expect(
      pageConceptServerRunHasReadyMobileGallery({
        jobs: [
          { provider: 'GPT2_MOBILE', status: 'READY', artifactId: 'a' },
          { provider: 'GPT2_MOBILE', status: 'READY', artifactId: 'b' },
        ],
        pipelineSet: null,
      }),
    ).toBe(true);
  });
});
