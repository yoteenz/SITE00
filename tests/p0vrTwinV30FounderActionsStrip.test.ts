/**
 * Mobile twin founder actions strip — always show GENERATE on empty NDXBOOK session
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  evaluateMobileTwinFounderActionsStrip,
  shouldShowMobileTwinFounderActionsStrip,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinFounderActionsStrip.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('Mobile twin founder actions strip', () => {
  it('authority + package inspector mount founder actions strip', () => {
    const authority = readFileSync('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx', 'utf8');
    const inspector = readFileSync('src/site00/components/designWorkspace/DesignPageV3MobileTwinPackageInspector.tsx', 'utf8');
    expect(authority).toContain('DesignPageV3MobileTwinFounderActionsStrip');
    expect(authority).toContain('DesignPageV3MobileTwinPipelineRecoveryStrip');
    const ws = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(ws).toContain('DesignPageV3MobileTwinGlobalRecoveryStrip');
    const globalRecovery = readFileSync(
      'src/site00/components/designWorkspace/DesignPageV3MobileTwinGlobalRecoveryStrip.tsx',
      'utf8',
    );
    expect(globalRecovery).toContain('MOBILE_TWIN_NDXBOOK_AUTOBUILD_NO_MANUAL_GATES_V1');
    expect(inspector).toContain('DesignPageV3MobileTwinFounderActionsStrip');
  });

  it('hides founder strip when NDXBOOK autobuild gates are open', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: emptyMobileTwinPipelineState(),
    });
    expect(shouldShowMobileTwinFounderActionsStrip(session, 'ndxbook')).toBe(false);
    const view = evaluateMobileTwinFounderActionsStrip(session, 'ndxbook');
    expect(view.showStrip).toBe(false);
  });

  it('does not surface restore CTA in founder strip while autobuild gates are open', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: { ...emptyMobileTwinPipelineState(), falJobsDispatched: 2, packages: [] },
    });
    const view = evaluateMobileTwinFounderActionsStrip(session, 'ndxbook');
    expect(view.showStrip).toBe(false);
  });
});
