/**
 * P0.VR.TWINV3.0R5F2 — founder authority injection + derivation unblock
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  assertFounderAssetViewportMatch,
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID,
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_STATUS,
  computePairChecksum,
  createDesignPageAuthorityReviewSession,
  deriveDesignWorkspacePackage,
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30R5F2_LINEAGE,
  registerFounderAttachedAuthorityAsset,
  runDesignAuthorityPairReadinessGate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { PROJECT_CREATIVE_CONTEXT_VERSION } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/projectCreativeGrounding/types.js';

const MOBILE_JPG = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
const DESKTOP_JPG = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/desktop-master.jpg';

describe('P0.VR.TWINV3.0R5F2 founder authority injection', () => {
  it('1–2 registers Mobile and Desktop founder authorities', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    expect(session.authorityPipeline?.mobileMaster?.viewport).toBe('MOBILE');
    expect(session.authorityPipeline?.desktopMaster?.viewport).toBe('DESKTOP');
  });

  it('3 Mobile attachment cannot populate Desktop viewport', () => {
    expect(() =>
      assertFounderAssetViewportMatch('DESKTOP', 'MOBILE'),
    ).toThrow(/FOUNDER_AUTHORITY_VIEWPORT_MISMATCH/);
  });

  it('4 Desktop attachment cannot populate Mobile viewport', () => {
    expect(() =>
      assertFounderAssetViewportMatch('MOBILE', 'DESKTOP'),
    ).toThrow(/FOUNDER_AUTHORITY_VIEWPORT_MISMATCH/);
  });

  it('5 authority image hashes preserved from founder file SHA256', () => {
    const mobileAsset = registerFounderAttachedAuthorityAsset({
      projectId: 'ndxbook',
      viewport: 'MOBILE',
      spec: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
    });
    expect(mobileAsset.originalFileHashSha256).toBe(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    expect(session.authorityPipeline?.mobileMaster?.authorityImageHash).toContain(
      FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256,
    );
  });

  it('6 promotion/injection does not modify authority file bytes on disk', () => {
    const beforeMobile = createHash('sha256').update(readFileSync(MOBILE_JPG)).digest('hex');
    const beforeDesktop = createHash('sha256').update(readFileSync(DESKTOP_JPG)).digest('hex');
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const afterMobile = createHash('sha256').update(readFileSync(MOBILE_JPG)).digest('hex');
    const afterDesktop = createHash('sha256').update(readFileSync(DESKTOP_JPG)).digest('hex');
    expect(afterMobile).toBe(beforeMobile);
    expect(afterDesktop).toBe(beforeDesktop);
  });

  it('7–8 feature manifest + project context attach to both authorities', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const m = session.authorityPipeline?.mobileMaster;
    const d = session.authorityPipeline?.desktopMaster;
    expect(m?.designWorkspaceFeatureManifestVersion).toBe(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
    expect(d?.designWorkspaceFeatureManifestVersion).toBe(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
    expect(m?.projectCreativeContextVersion).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
    expect(d?.projectCreativeContextVersion).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
  });

  it('9 FounderAuthorityInjectionReceipt is created', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const receipt = session.authorityPipeline?.founderAuthorityInjectionReceipt;
    expect(receipt?.status).toBe('PASS');
    expect(receipt?.reason).toBe('AUTHORITY_IMAGE_DISPLAY_BROKEN_IN_DESIGN_WORKSPACE');
  });

  it('10 pair uses exact injected authority IDs', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const pair = session.authorityPipeline?.authorityPair;
    expect(pair?.mobileAuthorityId).toBe(session.authorityPipeline?.mobileMaster?.id);
    expect(pair?.desktopAuthorityId).toBe(session.authorityPipeline?.desktopMaster?.id);
  });

  it('11 pair checksum is deterministic', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const mm = session.authorityPipeline!.mobileMaster!;
    const dm = session.authorityPipeline!.desktopMaster!;
    const pv = session.authorityPipeline!.authorityPair!.pairVersion;
    expect(session.authorityPipeline?.authorityPair?.pairChecksum).toBe(computePairChecksum(mm, dm, pv));
    const again = applyOneTimeFounderAuthorityInjection(session);
    expect(again.authorityPipeline?.authorityPair?.pairChecksum).toBe(session.authorityPipeline?.authorityPair?.pairChecksum);
  });

  it('12–15 pair locked via recovery; TRANSLATION + NONE; no regen', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    expect(session.authorityPipeline?.authorityPair?.status).toBe('PAIR_LOCKED');
    expect(session.authorityPipeline?.authorityPair?.lockedBy).toBe('FOUNDER_AUTHORIZED_RECOVERY');
    expect(session.authorityPipeline?.executionIntent).toBe('TRANSLATION');
    expect(session.authorityPipeline?.inventionBudget).toBe('NONE');
    expect(session.authorityPipeline?.mobileMaster?.sourceType).toBe('FOUNDER_ATTACHED_AUTHORITY');
  });

  it('16 PAIR_LOCKED + gates → DERIVATION_READY (derivationStatus READY)', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const gate = runDesignAuthorityPairReadinessGate(session, { requireLocked: true });
    expect(gate.pass).toBe(true);
    expect(session.authorityPipeline?.authorityPair?.derivationStatus).toBe('READY');
  });

  it('17 missing authority asset blocks derivation', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const broken = {
      ...session,
      authorityPipeline: {
        ...session.authorityPipeline!,
        mobileMaster: {
          ...session.authorityPipeline!.mobileMaster!,
          authorityAssetRecordId: null,
        },
      },
    };
    const gate = runDesignAuthorityPairReadinessGate(broken, { requireLocked: true });
    expect(gate.pass).toBe(false);
  });

  it('18 feature-stale authority blocks derivation', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const stale = {
      ...session,
      authorityPipeline: {
        ...session.authorityPipeline!,
        mobileMaster: {
          ...session.authorityPipeline!.mobileMaster!,
          designWorkspaceFeatureManifestVersion: 'design-workspace-feature-manifest-stale',
        },
      },
    };
    const gate = runDesignAuthorityPairReadinessGate(stale, { requireLocked: true });
    expect(gate.pass).toBe(false);
    expect(gate.errors).toContain('DESIGN_AUTHORITY_FEATURE_STALE');
  });

  it('19 broken-image issue remains tracked OPEN', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const issue = session.authorityPipeline?.authorityImageDisplayIssue;
    expect(issue?.issueId).toBe(AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID);
    expect(issue?.status).toBe('OPEN');
    expect(AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_STATUS).toBe('OPEN');
  });

  it('20 recovery source visible in pipeline events / lineage', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    expect(session.authorityPipeline?.mobileMaster?.lineageId).toBe(P0_VR_TWIN_V30R5F2_LINEAGE);
    expect(session.authorityPipeline?.events.some((e) => e.type === 'FOUNDER_AUTHORITY_INJECTION')).toBe(true);
    expect(session.authorityPipeline?.authorityPair?.sourceType).toBe('FOUNDER_AUTHORITY_INJECTION');
  });

  it('deriveDesignWorkspacePackage entrypoint accepts locked pair', () => {
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
    const pairId = session.authorityPipeline!.authorityPair!.id;
    const plan = deriveDesignWorkspacePackage({ session, authorityPairId: pairId });
    expect(plan.dispatchAllowed).toBe(false);
    expect(plan.mobileAuthorityUri).toContain('mobile-master.jpg');
    expect(plan.desktopAuthorityUri).toContain('desktop-master.jpg');
    expect(plan.expectedArtifacts.length).toBeGreaterThanOrEqual(10);
  });
});
