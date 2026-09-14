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
    expect(inspector).toContain('DesignPageV3MobileTwinFounderActionsStrip');
  });

  it('shows GENERATE when NDXBOOK has reference but empty pipeline', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: emptyMobileTwinPipelineState(),
    });
    expect(shouldShowMobileTwinFounderActionsStrip(session, 'ndxbook')).toBe(true);
    const view = evaluateMobileTwinFounderActionsStrip(session, 'ndxbook');
    expect(view.showStrip).toBe(true);
    expect(view.showGenerate).toBe(true);
    expect(view.showEmptyBackupMessage).toBe(true);
    expect(view.canGenerate).toBe(true);
  });
});
