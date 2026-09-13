/**
 * Twin V3 — persistence loops (lastResult sync, merge duplicates)
 */

import { describe, expect, it } from 'vitest';
import {
  createDesignPageAuthorityReviewSession,
  normalizeDesignPageAuthoritySession,
  seedDesignPageAuthorityPrototypeGallery,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildTerritoryPrototypeBundles } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/buildTerritoryPrototypeBundles.js';
import { appendTerritoryBundlesToGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityTerritoryGallery.js';

describe('Twin V3 gallery loop fixes', () => {
  it('normalize does not re-append lastResult when territory gallery already has candidates', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const staleFal = buildTerritoryPrototypeBundles({ authoritySessionId: session.authoritySessionId });
    staleFal[0]!.mobile.storageUrl = 'https://cdn.example.test/dead-fal.png';
    session = {
      ...session,
      lastResult: {
        ...(session.lastResult as NonNullable<typeof session.lastResult>),
        territories: staleFal,
      },
    };
    const normalized = normalizeDesignPageAuthoritySession(session);
    expect(normalized.territoryGallery.A.length).toBe(1);
    expect(normalized.territoryGallery.A[0]!.mobile.storageUrl).toContain('/site00/twin-v3-design-page-authority/');
  });

  it('normalize keeps one candidate per territory after duplicate batch-1 merge', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const dup = appendTerritoryBundlesToGallery({
      gallery: session.territoryGallery,
      bundles: buildTerritoryPrototypeBundles({ authoritySessionId: session.authoritySessionId }),
      batchGeneration: 1,
    });
    session = { ...session, territoryGallery: dup };
    const normalized = normalizeDesignPageAuthoritySession(session);
    expect(normalized.territoryGallery.A.length).toBe(1);
    expect(normalized.territoryGallery.B.length).toBe(1);
    expect(normalized.territoryGallery.C.length).toBe(1);
  });
});
