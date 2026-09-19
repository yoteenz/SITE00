import { describe, expect, it } from 'vitest';
import { createDesignPageAuthorityReviewSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  ensureNdxbookTwinImplementationReady,
  materializeNdxbookFounderApprovedPackage,
  writeLocalTwinCompileCacheFromApprovedPackage,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/ensureNdxbookTwinAutobuild.js';
import { readTwinImplementationCache } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/twinImplementationBrowserCache.js';
import { isProductionReadyImplementationDocument } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/implementationDocumentValidity.js';
import { resolveTwinImplementationPreview } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveTwinImplementationPreview.js';
import { evaluateMobileTwinFounderActionsStrip } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinFounderActionsStrip.js';

describe('NDXBOOK twin autobuild (gates open)', () => {
  it('materializes approved package and R8M1 cache without UI', async () => {
    const session = materializeNdxbookFounderApprovedPackage('ndxbook');
    expect(session?.mobileTwinPipeline?.packages.some((p) => p.status === 'APPROVED')).toBe(true);
    expect(writeLocalTwinCompileCacheFromApprovedPackage('ndxbook', session!)).toBe(true);
    const cache = readTwinImplementationCache('ndxbook');
    expect(cache).toBeTruthy();
    expect(isProductionReadyImplementationDocument(cache!.document)).toBe(true);
    expect(cache!.document.authoritiesLoaded?.blueprintRenderUri).toContain(
      'ndxbook-mobile-light-technical-blueprint-v1',
    );
  });

  it('ensureNdxbookTwinImplementationReady writes production-ready cache', async () => {
    await ensureNdxbookTwinImplementationReady('ndxbook');
    const cache = readTwinImplementationCache('ndxbook');
    expect(cache).toBeTruthy();
    expect(isProductionReadyImplementationDocument(cache!.document)).toBe(true);
  });

  it('hides manual founder actions strip while autobuild gates open', () => {
    const session = createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' });
    const view = evaluateMobileTwinFounderActionsStrip(session, 'ndxbook');
    expect(view.showStrip).toBe(false);
  });
});
