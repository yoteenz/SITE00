/**
 * P0.VR.TWINV3.0 / TWINV3.0R1 — SITE 00 design page authority (host-first)
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
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  isDesignPageAuthorityFullyLocked,
  isDesignPageAuthorityViewportLocked,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV3.0R1 SITE 00 design page authority', () => {
  it('1–3 R1 skeleton: host frame first, client project open', () => {
    const sk = confirmDesignPageProductSkeleton({ projectId: 'ndxbook', buildRef: P0_VR_TWIN_V30_BUILD });
    expect(sk.hostProduct).toBe(DESIGN_PAGE_V3_HOST_PRODUCT_NAME);
    expect(sk.clientProjectOpen).toBe('NDXBOOK');
    expect(sk.areas[0]).toBe('SITE_00_PAGE_FRAME');
    expect(sk.areas).toEqual([...DESIGN_PAGE_V3_SKELETON_AREAS]);
    expect(sk.productRules.hostShellOwnsFrame).toBe(true);
    expect(sk.productRules.clientProjectNeverOwnsShell).toBe(true);
  });

  it('4–6 prompts enforce host/client firewall', () => {
    const mobile = buildMobileDesignPageAuthorityPrompt({
      clientProjectId: 'ndxbook',
      refineNotes: ['NDXBOOK must not own the shell'],
    });
    expect(mobile).toContain(DESIGN_PAGE_V3_HOST_PRODUCT_NAME);
    expect(mobile).toContain('HOST / CLIENT');
    expect(mobile).toContain('FAIL if it looks like a standalone NDXBOOK design application');
    expect(mobile).toContain('NDXBOOK must not own the shell');
    const desktop = buildDesktopDesignPageAuthorityPrompt({ clientProjectId: 'ndxbook' });
    expect(desktop).toContain(`${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} → PROJECT: NDXBOOK → PAGE: DESIGN`);
  });

  it('7–10 generation + host-first result fields', async () => {
    const session = createDesignPageAuthorityReviewSession();
    expect(session.pageLabel).toContain(DESIGN_PAGE_V3_HOST_PRODUCT_NAME);
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.hostProduct).toBe(DESIGN_PAGE_V3_HOST_PRODUCT_NAME);
    expect(result.clientProjectOpen).toBe('NDXBOOK');
    expect(result.site00PageFrameSummary).toContain('shell');
    expect(result.primaryWorkAreaSummary).toContain('focal');
    expect(result.classification).toBe('DESIGN_PAGE_AUTHORITY_PARTIAL');
  });

  it('11–14 per-viewport approve locks', () => {
    let session = createDesignPageAuthorityReviewSession();
    session = approveDesignPageAuthorityViewport(session, 'mobile');
    expect(isDesignPageAuthorityViewportLocked(session, 'mobile')).toBe(true);
    expect(session.founderReview.mobileLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE);
    expect(isDesignPageAuthorityFullyLocked(session)).toBe(false);
    session = approveDesignPageAuthorityViewport(session, 'desktop');
    expect(session.founderReview.desktopLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP);
    expect(isDesignPageAuthorityFullyLocked(session)).toBe(true);
  });

  it('15–18 prototypes + UI read as SITE 00 host', () => {
    const mobileSvg = read('public/site00/twin-v3-design-page-authority/mobile-authority-prototype.svg');
    expect(mobileSvg).toContain('SITE 00');
    expect(mobileSvg).toContain('PROJECT: NDXBOOK');
    expect(mobileSvg).toContain('PRIMARY WORK AREA');
    const panel = read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx');
    expect(panel).toContain(DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE);
    expect(panel).toContain('app brand');
    assertV1Isolation();
  });

  it('19 no implementation / compiler wiring in v30 module', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/runDesignPageAuthorityGeneration.ts')).not.toContain(
      'composeConceptDirectedTwinV2',
    );
    expect(read('api/site00/twin-v3-design-page-authority.ts')).toContain('TWINV3.0R1');
  });
});
