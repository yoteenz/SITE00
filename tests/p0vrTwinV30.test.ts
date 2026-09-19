/**
 * P0.VR.TWINV3.0R3/R4 — host shell + project-grounded workspace expression
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  applyDesignPageAuthorityGeneration,
  seedDesignPageAuthorityPrototypeGallery,
  normalizeDesignPageAuthorityVisualUrl,
  approveDesignPageAuthorityViewport,
  mergeDesignPageAuthorityApiResponse,
  syncGalleryFromLastResult,
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
  P0_VR_TWIN_V30R4_LINEAGE,
  P0_VR_TWIN_V30R5F1_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
  runDesignPageAuthorityR3SelfCheck,
  runDesignPageAuthoritySelfCheck,
  selectDesignPageAuthorityTerritory,
  rewritePrototypeGalleryUrls,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS,
  resolveDesignPageAuthorityImageSrc,
} from '../src/site00/components/designWorkspace/designPageAuthorityR3PrototypeUrls.js';

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
    expect(combined).toContain(P0_VR_TWIN_V30R4_LINEAGE);
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

  it('7–9 parallel batch + single-territory dispatch', async () => {
    const { dispatchDesignPageAuthorityTerritoryVisuals } = await import(
      '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/dispatchDesignPageAuthorityTerritoryVisuals.js'
    );
    const all = await dispatchDesignPageAuthorityTerritoryVisuals({
      authoritySessionId: 'parallel-test',
      clientProjectId: 'ndxbook',
    });
    expect(all.providerTrace.some((line) => line.includes('FAL_PARALLEL') || line.includes('parallel FAL'))).toBe(true);
    expect(all.territories.length).toBe(3);
    const bOnly = await dispatchDesignPageAuthorityTerritoryVisuals({
      authoritySessionId: 'b-only',
      clientProjectId: 'ndxbook',
      territoryIds: ['B'],
    });
    expect(bOnly.territories.length).toBe(1);
    expect(bOnly.territories[0]!.territoryId).toBe('B');
  });

  it('10 generation yields 3 territories × 2 viewports', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const result = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(result.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
    expect(result.lineage).toBe(P0_VR_TWIN_V30R5F1_LINEAGE);
    expect(result.territories.length).toBe(3);
    expect(result.r3SelfCheck.pass).toBe(true);
    expect(result.mobile.storageUrl).toContain('mobile-territory-a-r3.svg');
    expect(result.expressionContract.projectId).toBe('ndxbook');
  });

  it('10a normalizeDesignPageAuthorityVisualUrl for nested SPA routes', () => {
    const origin = 'https://example.test';
    const rel = 'assets/specimen-a.svg';
    expect(normalizeDesignPageAuthorityVisualUrl(rel, origin)).toBe(`${origin}/assets/specimen-a.svg`);
    expect(normalizeDesignPageAuthorityVisualUrl('/assets/specimen-a.svg', origin)).toBe(`${origin}/assets/specimen-a.svg`);
    expect(normalizeDesignPageAuthorityVisualUrl('https://cdn.example/img.webp')).toContain('cdn.example');
  });

  it('10b prototype seed fills empty gallery without API', () => {
    const session = createDesignPageAuthorityReviewSession();
    expect(session.territoryGallery.A.length).toBe(0);
    const seeded = seedDesignPageAuthorityPrototypeGallery(session);
    expect(seeded.territoryGallery.A.length).toBe(1);
    expect(seeded.territoryGallery.B.length).toBe(1);
    expect(seeded.territoryGallery.C.length).toBe(1);
    expect(seeded.territoryGallery.A[0]!.mobile.storageUrl).toContain('mobile-territory-a-r3.svg');
  });

  it('10c resolve maps canonical /site00 R3 paths to bundled assets', () => {
    expect(resolveDesignPageAuthorityImageSrc('/site00/twin-v3-design-page-authority/mobile-territory-a-r3.svg')).toBe(
      DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS.A.mobile,
    );
    const mangled = 'https://preview.example.test/data:image/svg+xml;base64,PHN2Zy8+';
    expect(resolveDesignPageAuthorityImageSrc(mangled)).toBe('data:image/svg+xml;base64,PHN2Zy8+');
  });

  it('11 merge API response appends FAL territories to prior session', async () => {
    let session = createDesignPageAuthorityReviewSession();
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    session = mergeDesignPageAuthorityApiResponse(session, { result: batch }, 'GENERATE');
    expect(session.territoryGallery.A.length).toBe(1);
    expect(session.lastResult?.territories.length).toBe(3);
  });

  it('12 syncGalleryFromLastResult when gallery empty but lastResult set', async () => {
    let session = createDesignPageAuthorityReviewSession();
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    session = {
      ...session,
      lastResult: batch,
      territoryGallery: { A: [], B: [], C: [] },
      candidateGeneration: 1,
    };
    session = syncGalleryFromLastResult(session);
    expect(session.territoryGallery.B.length).toBe(1);
  });

  it('13–16 REGENERATE_TERRITORY replaces prior candidate in that territory only', async () => {
    let session = createDesignPageAuthorityReviewSession();
    const batch1 = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    session = applyDesignPageAuthorityGeneration(session, batch1, 'GENERATE');
    expect(session.territoryGallery.A.length).toBe(1);
    expect(session.territoryGallery.B.length).toBe(1);
    const firstBCandidateId = session.territoryGallery.B[0]!.candidateId;
    const batchB = await runDesignPageAuthorityGeneration({
      session,
      action: 'REGENERATE_TERRITORY',
      territoryScope: 'B',
    });
    session = applyDesignPageAuthorityGeneration(session, batchB, 'REGENERATE_TERRITORY');
    expect(session.territoryGallery.A.length).toBe(1);
    expect(session.territoryGallery.B.length).toBe(1);
    expect(session.territoryGallery.B[0]!.candidateId).not.toBe(firstBCandidateId);
    expect(session.territoryGallery.C.length).toBe(1);
  });

  it('15–17 viewport locks require territory selection + gallery candidate', async () => {
    let session = createDesignPageAuthorityReviewSession();
    expect(() => approveDesignPageAuthorityViewport(session, 'mobile')).toThrow(/TERRITORY_REQUIRED/);
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    session = applyDesignPageAuthorityGeneration(session, batch, 'GENERATE');
    session = selectDesignPageAuthorityTerritory(session, 'B');
    session = approveDesignPageAuthorityViewport(session, 'mobile');
    session = approveDesignPageAuthorityViewport(session, 'desktop');
    expect(isDesignPageAuthorityFullyLocked(session)).toBe(true);
    expect(session.founderReview.mobileLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE);
    expect(session.founderReview.desktopLockId).toBe(DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP);
  });

  it('18–20 R3 SVG assets + panel + API', () => {
    for (const id of ['A', 'B', 'C'] as const) {
      const mobile = read(`public/site00/twin-v3-design-page-authority/mobile-territory-${id.toLowerCase()}-r3.svg`);
      expect(mobile).toContain('SITE 00');
      expect(mobile).toContain('NDXBOOK');
      expect(mobile).toContain('#c6f135');
      expect(mobile.toLowerCase()).toContain(`territory ${id.toLowerCase()}`);
    }
    expect(read('api/site00/twin-v3-design-page-authority.ts')).toContain('territoryScope');
    expect(read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx')).toContain(
      'territoryGallery',
    );
    expect(read('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx')).toContain(
      'v3-project-grounding-qa',
    );
    assertV1Isolation();
  });

  it('21 authority-only — no compiler / build wiring', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/runDesignPageAuthorityGeneration.ts')).not.toContain(
      'composeConceptDirectedTwinV2',
    );
    expect(DESIGN_PAGE_V3_HOST_PRODUCT_NAME).toBe('SITE 00');
  });
});
