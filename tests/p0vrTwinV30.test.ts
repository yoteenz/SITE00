/**
 * P0.VR.TWINV3.0R2 — SITE 00 design page authority lock
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  approveDesignPageAuthorityViewport,
  buildDesktopDesignPageAuthorityPrompt,
  buildMobileDesignPageAuthorityPrompt,
  confirmDesignPageProductSkeleton,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  isDesignPageAuthorityFullyLocked,
  P0_VR_TWIN_V30R2_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
  runDesignPageAuthoritySelfCheck,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV3.0R2 design page authority lock', () => {
  it('1–3 R2 skeleton A–G + canonical path', () => {
    const sk = confirmDesignPageProductSkeleton({ projectId: 'ndxbook', buildRef: P0_VR_TWIN_V30_BUILD });
    expect(sk.lineage).toBe(P0_VR_TWIN_V30R2_LINEAGE);
    expect(sk.canonicalPath).toBe(DESIGN_PAGE_V3_CANONICAL_PATH);
    expect(sk.areas.length).toBe(7);
    expect(sk.areas[0]).toBe('HOST_HEADER_PAGE_FRAME');
    expect(sk.areas).toEqual([...DESIGN_PAGE_V3_SKELETON_AREAS]);
    expect(sk.productRules.workspaceOrganizesVisuallyNotNarrates).toBe(true);
  });

  it('4–6 prompts + R2 self-check pass', () => {
    const mobile = buildMobileDesignPageAuthorityPrompt({ clientProjectId: 'ndxbook' });
    const desktop = buildDesktopDesignPageAuthorityPrompt({ clientProjectId: 'ndxbook' });
    expect(mobile).toContain('HOST HEADER');
    expect(mobile).toContain(P0_VR_TWIN_V30R2_LINEAGE);
    const check = runDesignPageAuthoritySelfCheck({
      promptOrArtifactText: `${mobile}\n${desktop}`,
      zoneCount: 7,
    });
    expect(check.pass).toBe(true);
  });

  it('7–10 generation uses R2 prototypes + zone summaries', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(result.lineage).toBe(P0_VR_TWIN_V30R2_LINEAGE);
    expect(result.r2SelfCheck.pass).toBe(true);
    expect(result.mobile.storageUrl).toContain('mobile-authority-r2.svg');
    expect(result.zoneSummaries.PRIMARY_WORKSPACE_PANEL).toContain('Dominant');
  });

  it('11–14 viewport locks unchanged', () => {
    let session = createDesignPageAuthorityReviewSession();
    session = approveDesignPageAuthorityViewport(session, 'mobile');
    session = approveDesignPageAuthorityViewport(session, 'desktop');
    expect(isDesignPageAuthorityFullyLocked(session)).toBe(true);
    expect(session.founderReview.mobileLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE);
    expect(session.founderReview.desktopLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP);
  });

  it('15–18 R2 SVG + panel + API', () => {
    const mobile = read('public/site00/twin-v3-design-page-authority/mobile-authority-r2.svg');
    expect(mobile).toContain('SITE 00');
    expect(mobile).toContain('PROJECT: NDXBOOK');
    expect(mobile).toContain('PRIMARY WORKSPACE');
    expect(read('api/site00/twin-v3-design-page-authority.ts')).toContain('TWINV3.0R2');
    expect(read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx')).toContain(
      P0_VR_TWIN_V30R2_LINEAGE,
    );
    assertV1Isolation();
  });

  it('19 authority-only — no compiler / build wiring', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/runDesignPageAuthorityGeneration.ts')).not.toContain(
      'composeConceptDirectedTwinV2',
    );
    expect(DESIGN_PAGE_V3_HOST_PRODUCT_NAME).toBe('SITE 00');
  });
});
