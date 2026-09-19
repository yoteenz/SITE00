/**
 * BUILD TWIN DESIGN ROUTE visibility (R8M UX) — sticky strip + package inspector
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { approveMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import { applyMobileTwinPackageApprovalConfirmation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/confirmMobileTwinPackageApproval.js';
import { shouldShowBuildTwinDesignRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/shouldShowBuildTwinDesignRoute.js';

async function approvedPackageSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  session = applyFounderNbpMobileTwinPromotion(session);
  session = await runMobileAtomicTwinGeneration({ session });
  session = approveMobileTwinPackage(session);
  return applyMobileTwinPackageApprovalConfirmation(session);
}

describe('BUILD twin design route UX visibility', () => {
  it('authority panel mounts founder actions strip (includes BUILD) after blueprint retry strip', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinFounderActionsStrip');
    expect(src.indexOf('DesignPageV3MobileTwinBlueprintRetryStrip')).toBeLessThan(
      src.indexOf('DesignPageV3MobileTwinFounderActionsStrip'),
    );
  });

  it('package inspector embeds build block when package approved', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3MobileTwinPackageInspector.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinBuildRouteBlock');
    expect(src).toContain('shouldShowBuildTwinDesignRoute');
  });

  it('shouldShowBuildTwinDesignRoute true after founder approves package', async () => {
    const session = await approvedPackageSession();
    expect(shouldShowBuildTwinDesignRoute(session)).toBe(true);
  });

  it('shouldShowBuildTwinDesignRoute true when pkg APPROVED even if implementation slice missing', async () => {
    const session = await approvedPackageSession();
    const pipeline = session.mobileTwinPipeline!;
    const stripped = {
      ...session,
      mobileTwinPipeline: {
        ...pipeline,
        mobileTwinImplementation: undefined,
      },
    };
    expect(shouldShowBuildTwinDesignRoute(stripped)).toBe(true);
  });
});
