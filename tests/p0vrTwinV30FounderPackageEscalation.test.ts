import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/ndxbookLightBlueprintMount.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('founder package escalation', () => {
  it('builds approved package from canonical blueprint JPG and compiles twin', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: emptyMobileTwinPipelineState(),
    });
    const next = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
    const pipe = next.mobileTwinPipeline!;
    expect(pipe.packages.some((p) => p.status === 'APPROVED')).toBe(true);
    expect(pipe.blueprintTwins.some((b) => b.twinImageUri === NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT)).toBe(true);
    const pkgId = pipe.latestPackageId!;
    const doc = compileApprovedMobileTwinPackage({ pipeline: pipe, packageId: pkgId });
    expect(doc.renderTree.sections.length).toBeGreaterThan(0);
  });
});
