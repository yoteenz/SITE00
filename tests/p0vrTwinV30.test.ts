/**
 * P0.VR.TWINV3.0 — Design page authority generation (no implementation sprint)
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  confirmDesignPageProductSkeleton,
  DESIGN_PAGE_V3_AUTHORITY_LOCK_ID,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
  approveDesignPageAuthorityPair,
  buildDesktopDesignPageAuthorityPrompt,
  buildMobileDesignPageAuthorityPrompt,
  createDesignPageAuthorityReviewSession,
  isDesignPageAuthorityLocked,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV3.0 design page authority', () => {
  it('1–3 product skeleton confirmation', () => {
    const sk = confirmDesignPageProductSkeleton({ projectId: 'ndxbook', buildRef: P0_VR_TWIN_V30_BUILD });
    expect(sk.areas).toEqual([...DESIGN_PAGE_V3_SKELETON_AREAS]);
    expect(sk.workflowPhases).toEqual([...DESIGN_PAGE_V3_WORKFLOW_PHASES]);
    expect(sk.productRules.oneTaskOneDecisionOnePrimaryAction).toBe(true);
  });

  it('4–6 prompts include skeleton + refine', () => {
    const mobile = buildMobileDesignPageAuthorityPrompt({
      projectLabel: 'NDXBOOK',
      refineNotes: ['make master preview larger'],
    });
    expect(mobile).toContain('MASTER CONCEPT');
    expect(mobile).toContain('make master preview larger');
    const desktop = buildDesktopDesignPageAuthorityPrompt({ projectLabel: 'NDXBOOK' });
    expect(desktop.toLowerCase()).toContain('right drawer');
  });

  it('7–10 generation pair + UX summaries', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.mobile.viewport).toBe('mobile');
    expect(result.desktop.viewport).toBe('desktop');
    expect(result.mobile.storageUrl).toContain('mobile-authority-prototype');
    expect(result.desktop.storageUrl).toContain('desktop-authority-prototype');
    expect(result.skeletonConfirmed.length).toBe(DESIGN_PAGE_V3_SKELETON_AREAS.length);
    expect(result.classification).toBe('DESIGN_PAGE_AUTHORITY_PARTIAL');
    expect(result.hostShellPreserved).toBe(true);
  });

  it('11–14 approve locks DESIGN_PAGE_V3_AUTHORITY_V1', () => {
    let session = createDesignPageAuthorityReviewSession();
    session = approveDesignPageAuthorityPair(session);
    expect(isDesignPageAuthorityLocked(session)).toBe(true);
    expect(session.founderReview.lockId).toBe(DESIGN_PAGE_V3_AUTHORITY_LOCK_ID);
  });

  it('15–18 API + routes + UI wiring; V1 untouched', () => {
    expect(read('api/site00/twin-v3-design-page-authority.ts')).toContain('runDesignPageAuthorityGeneration');
    expect(read('server/routes.ts')).toContain('twin-v3-design-page-authority');
    expect(read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx')).toContain(
      'GENERATE AUTHORITY PAIR',
    );
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain(
      'DesignPageV3AuthorityReviewPanel',
    );
    expect(read('public/site00/twin-v3-design-page-authority/mobile-authority-prototype.svg')).toContain(
      'MASTER CONCEPT',
    );
    assertV1Isolation();
  });

  it('19 no build route / twin v2 page implementation in v30 module', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/runDesignPageAuthorityGeneration.ts')).not.toContain(
      'composeConceptDirectedTwinV2',
    );
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).not.toContain(
      'PageConceptDirectedTwinV2Experience',
    );
  });
});
