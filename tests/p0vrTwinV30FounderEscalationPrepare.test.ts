import { describe, expect, it } from 'vitest';
import { createDesignPageAuthorityReviewSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { ensureMobileDesignReferenceAuthority } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileDesignReferenceAuthority.js';
import { applyOneTimeFounderAuthorityInjection } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/founderAuthorityInjection.js';

describe('founder escalation session prepare', () => {
  it('injects authority when mobile reference missing', () => {
    const bare = createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' });
    expect(() => ensureMobileDesignReferenceAuthority(bare)).toThrow('MOBILE_REFERENCE_MISSING');
    const injected = applyOneTimeFounderAuthorityInjection(bare);
    const next = escalateFounderMobileTwinPackageFromCanonicalAssets(
      ensureMobileDesignReferenceAuthority(injected),
    );
    expect(next.mobileTwinPipeline?.packages.some((p) => p.status === 'APPROVED')).toBe(true);
  });
});
