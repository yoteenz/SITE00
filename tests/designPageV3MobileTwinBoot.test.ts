/**
 * Design page boot — mobile twin sync + blueprint env must not crash browser runtime.
 */

import { describe, expect, it, vi } from 'vitest';
import { evaluateBlueprintLightStyleRetry } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { resolveLightBlueprintStyleReferenceUrl } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/resolveLightBlueprintStyleReference.js';
import { syncFounderMobileTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  normalizeDesignPageAuthoritySession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

describe('Design page mobile twin boot hardening', () => {
  it('resolveLightBlueprintStyleReferenceUrl maps tunnel origin to public site00 asset', () => {
    expect(resolveLightBlueprintStyleReferenceUrl('http://localhost:5174')).toBe(
      'https://site00.com/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg',
    );
  });

  it('evaluateBlueprintLightStyleRetry returns retry strip for light-contract pair', () => {
    const view = evaluateBlueprintLightStyleRetry({
      actualRender: {
        id: 'r1',
        renderImageUri: 'https://example.com/a.png',
        renderImageHash: 'h',
        compositionStateId: 'c1',
        compositionHash: 'ch',
        provider: 'FAL',
        providerJobRef: 'job',
        providerStatus: 'COMPLETE',
        status: 'FOUNDER_REVIEW',
        renderMode: 'REAL_PROVIDER_RENDER',
        createdAt: new Date().toISOString(),
      },
      blueprintTwin: {
        id: 'b1',
        compositionStateId: 'c1',
        compositionHash: 'ch',
        implementationRenderId: 'r1',
        twinImageUri: 'https://example.com/b.png',
        twinImageHash: 'h2',
        provider: 'FAL',
        providerJobRef: 'job-b',
        outputRepresentationMode: 'LIGHT_TECHNICAL_BLUEPRINT',
        styleContractId: 'mobile-light-technical-blueprint-v1',
        createdAt: new Date().toISOString(),
      },
      artifactsById: {},
    });
    expect(view.showRetryStrip).toBe(true);
  });

  it('syncFounderMobileTwinSession does not throw on minimal ndxbook session', () => {
    let session = applyOneTimeFounderAuthorityInjection(
      createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }),
    );
    session = normalizeDesignPageAuthoritySession(session);
    expect(() => syncFounderMobileTwinSession(session, 'ndxbook')).not.toThrow();
  });
});
