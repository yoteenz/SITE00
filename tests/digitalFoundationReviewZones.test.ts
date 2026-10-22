import { describe, expect, it } from 'vitest';
import { galleryEntriesForZone } from '../src/site00/pages/foundation/digitalFoundationReviewZones';
import { intakeConfiguratorAnchorIds } from '../src/site00/pages/foundation/digitalFoundationBuilderManifest';

describe('digital foundation review zones', () => {
  it('keeps P03 configure under intake and hybrid studio under builder', () => {
    const intake = galleryEntriesForZone('INTAKE').map((e) => e.anchorId);
    const builder = galleryEntriesForZone('BUILDER').map((e) => e.anchorId);

    for (const anchor of intakeConfiguratorAnchorIds()) {
      expect(intake).toContain(anchor);
      expect(builder).not.toContain(anchor);
    }

    for (const room of ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT']) {
      const anchor = `df-r-bldr-${room}`;
      expect(builder).toContain(anchor);
      expect(intake).not.toContain(anchor);
    }
  });

  it('separates pre-activation queue from living portal and completion zones', () => {
    const queue = galleryEntriesForZone('CLIENT_QUEUE').map((e) => e.anchorId);
    const portal = galleryEntriesForZone('CLIENT_PORTAL').map((e) => e.anchorId);
    const completion = galleryEntriesForZone('CLIENT_COMPLETION').map((e) => e.anchorId);
    expect(queue).toContain('df-r-post-intake-submitted');
    expect(portal).toContain('df-r-OVERVIEW');
    expect(completion).toContain('df-r-complete');
    expect(portal).not.toContain('df-r-complete');
  });
});
