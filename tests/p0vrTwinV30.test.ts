/**
 * P0.VR.TWINV3.0R3 — host shell + project-reactive workspace expression
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  approveDesignPageAuthorityViewport,
  buildAllTerritoryPrompts,
  confirmDesignPageProductSkeleton,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  getNdxbookPilotExpressionContract,
  HOST_PROJECT_EXPRESSION_CORE_RULE,
  isDesignPageAuthorityFullyLocked,
  P0_VR_TWIN_V30R3_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
  runDesignPageAuthorityR3SelfCheck,
  runDesignPageAuthoritySelfCheck,
  selectDesignPageAuthorityTerritory,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV3.0R3 design page authority territories', () => {
  it('1–3 skeleton + NDXBOOK expression contract', () => {
    const sk = confirmDesignPageProductSkeleton({ projectId: 'ndxbook', buildRef: P0_VR_TWIN_V30_BUILD });
    expect(sk.canonicalPath).toBe(DESIGN_PAGE_V3_CANONICAL_PATH);
    expect(sk.areas.length).toBe(7);
    expect(sk.areas).toEqual([...DESIGN_PAGE_V3_SKELETON_AREAS]);
    const contract = getNdxbookPilotExpressionContract();
    expect(contract.accentPalette[0]).toBe('#c6f135');
    expect(contract.hostOverrideRestrictions.length).toBeGreaterThan(3);
    expect(HOST_PROJECT_EXPRESSION_CORE_RULE).toContain('architecture');
  });

  it('4–6 territory prompts + R2/R3 self-check pass', () => {
    const all = buildAllTerritoryPrompts({ clientProjectId: 'ndxbook' });
    const combined = Object.values(all)
      .flatMap((p) => [p.mobile, p.desktop])
      .join('\n');
    expect(combined).toContain('HOST HEADER');
    expect(combined).toContain(P0_VR_TWIN_V30R3_LINEAGE);
    expect(combined).toContain('Martian Mono');
    expect(combined).toContain('lime');
    const r2 = runDesignPageAuthoritySelfCheck({ promptOrArtifactText: combined, zoneCount: 7 });
    expect(r2.pass).toBe(true);
    const r3 = runDesignPageAuthorityR3SelfCheck({
      promptOrArtifactText: combined,
      territoryPrompts: { A: all.A.mobile, B: all.B.mobile, C: all.C.mobile },
    });
    expect(r3.pass).toBe(true);
  });

  it('7–9 R3 dispatch runs 6 FAL jobs in parallel', async () => {
    const { dispatchDesignPageAuthorityTerritoryVisuals } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/dispatchDesignPageAuthorityTerritoryVisuals.js'
    );
    let inFlight = 0;
    let maxInFlight = 0;
    const originalAll = Promise.all.bind(Promise);
    const spy = vi.spyOn(Promise, 'all').mockImplementation((values) => {
      if (Array.isArray(values) && values.length === 6) {
        return originalAll(
          values.map((p) => {
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            return Promise.resolve(p).finally(() => {
              inFlight -= 1;
            });
          }),
        ) as ReturnType<typeof Promise.all>;
      }
      return originalAll(values);
    });
    try {
      const out = await dispatchDesignPageAuthorityTerritoryVisuals({
        authoritySessionId: 'parallel-test',
        clientProjectId: 'ndxbook',
      });
      expect(out.providerTrace[0]).toContain('parallel FAL batch');
      expect(out.territories.length).toBe(3);
      expect(maxInFlight).toBe(6);
    } finally {
      spy.mockRestore();
    }
  });

  it('10 generation yields 3 territories × 2 viewports', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(result.lineage).toBe(P0_VR_TWIN_V30R3_LINEAGE);
    expect(result.territories.length).toBe(3);
    expect(result.r3SelfCheck.pass).toBe(true);
    expect(result.mobile.storageUrl).toContain('mobile-territory-a-r3.svg');
    expect(result.expressionContract.projectId).toBe('ndxbook');
  });

  it('11–14 viewport locks require territory selection', () => {
    let session = createDesignPageAuthorityReviewSession();
    expect(() => approveDesignPageAuthorityViewport(session, 'mobile')).toThrow(/TERRITORY_REQUIRED/);
    session = selectDesignPageAuthorityTerritory(session, 'B');
    session = approveDesignPageAuthorityViewport(session, 'mobile');
    session = approveDesignPageAuthorityViewport(session, 'desktop');
    expect(isDesignPageAuthorityFullyLocked(session)).toBe(true);
    expect(session.founderReview.mobileLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE);
    expect(session.founderReview.desktopLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP);
  });

  it('15–18 R3 SVG assets + panel + API', () => {
    for (const id of ['A', 'B', 'C'] as const) {
      const mobile = read(`public/site00/twin-v3-design-page-authority/mobile-territory-${id.toLowerCase()}-r3.svg`);
      expect(mobile).toContain('SITE 00');
      expect(mobile).toContain('NDXBOOK');
      expect(mobile).toContain('#c6f135');
      expect(mobile.toLowerCase()).toContain(`territory ${id.toLowerCase()}`);
    }
    expect(read('api/site00/twin-v3-design-page-authority.ts')).toContain('TWINV3.0R3');
    expect(read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx')).toContain(
      P0_VR_TWIN_V30R3_LINEAGE,
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
