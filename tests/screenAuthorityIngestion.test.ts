/**
 * Screen Authority Ingestion UX — routing + registration + implementation tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { routeReferenceJob, assetSourceRoutesToAssetPipeline, screenAuthorityMustNotRouteToAssetPipeline } from '../shared/site00-brand-lore/projectSkin/brandFamily/referenceJobRouter.js';
import { buildScreenAuthorityPrefill } from '../shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.js';
import {
  buildContractPreview,
  deriveVisualConvergenceRequired,
  getAuthorityCardPayload,
  implementScreenAuthority,
  registerScreenAuthority,
  simulateExecutionCompleteForAuthority,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/screenAuthorityIngestion.js';
import {
  clearScreenAuthoritiesForTest,
  getSkinScreenAuthority,
  listScreenAuthoritiesForFamily,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/screenAuthority.js';
import { clearImplementationJobsForTest, getSkinScreenImplementationJob } from '../shared/site00-brand-lore/projectSkin/brandFamily/implementationJob.js';
import { clearSkinPacksForTest } from '../shared/site00-brand-lore/projectSkin/brandFamily/skinPack.js';
import { clearBrandFamilyBindingsForTest } from '../shared/site00-brand-lore/projectSkin/brandFamily/projectBinding.js';
import { BRAND_FAMILY_KEYS } from '../shared/site00-brand-lore/projectSkin/brandFamily/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Screen Authority Ingestion UX', () => {
  beforeEach(() => {
    clearScreenAuthoritiesForTest();
    clearImplementationJobsForTest();
    clearSkinPacksForTest();
    clearBrandFamilyBindingsForTest();
  });

  it('1. Experience Skin shows screen pack', () => {
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('BRAND FAMILY SCREEN PACK');
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('PROJECT OVERVIEW');
  });

  it('2. empty screen slot shows Add Authority', () => {
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('ADD AUTHORITY');
  });

  it('3. Add Authority opens authority ingestion', () => {
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('SkinScreenAuthorityIngestion');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).toContain('ADD SCREEN AUTHORITY');
  });

  it('4. brand family prefilled', () => {
    const prefill = buildScreenAuthorityPrefill(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECT_OVERVIEW');
    expect(prefill.brandFamilySkinId).toBe('NDXBOOK');
  });

  it('5. module prefilled', () => {
    const prefill = buildScreenAuthorityPrefill(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECT_OVERVIEW');
    expect(prefill.moduleId).toBe('PROJECTS');
  });

  it('6. screen type prefilled', () => {
    const prefill = buildScreenAuthorityPrefill(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECT_OVERVIEW');
    expect(prefill.screenType).toBe('OVERVIEW');
  });

  it('7. viewport selectable', () => {
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).toContain('MOBILE');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).toContain('DESKTOP');
  });

  it('8. Design Authority default', () => {
    const preview = buildContractPreview();
    expect(preview.rebuildLook).toBe(true);
  });

  it('9. Exact default', () => {
    expect(deriveVisualConvergenceRequired('DESIGN_AUTHORITY', 'EXACT')).toBe(true);
  });

  it('10. convergence automatically required', () => {
    const preview = buildContractPreview('DESIGN_AUTHORITY', 'EXACT');
    expect(preview.visualConvergenceRequired).toBe(true);
  });

  it('11. reference purpose stored as SCREEN_AUTHORITY', () => {
    const result = registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-overview-mobile',
      projectId: 'ndxbook',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.referencePurpose).toBe('SCREEN_AUTHORITY');
      expect(result.jobType).toBe('SCREEN_AUTHORITY');
    }
  });

  it('12. SCREEN_AUTHORITY does not route to asset pipeline', () => {
    expect(screenAuthorityMustNotRouteToAssetPipeline('SCREEN_AUTHORITY')).toBe(true);
    expect(routeReferenceJob('SCREEN_AUTHORITY').pipeline).toBe('SCREEN_AUTHORITY');
  });

  it('13. ASSET_SOURCE still routes to asset pipeline', () => {
    expect(assetSourceRoutesToAssetPipeline('ASSET_SOURCE')).toBe(true);
    expect(routeReferenceJob('ASSET_SOURCE').pipeline).toBe('ASSET_RECONSTRUCTION');
  });

  it('14. direct References upload can choose Screen Design', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferencesTab.tsx')).toContain('SCREEN DESIGN');
    expect(read('src/site00/components/designWorkspace/DesignReferencesTab.tsx')).toContain('WHAT IS THIS REFERENCE FOR?');
  });

  it('15. SkinScreenAuthority created', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-1',
      projectId: 'ndxbook',
    });
    const authority = getSkinScreenAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    expect(authority?.status).toBe('APPROVED');
    expect(authority?.jobType).toBe('SCREEN_AUTHORITY');
  });

  it('16. authority card updates', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-2',
      projectId: 'ndxbook',
    });
    const card = getAuthorityCardPayload(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    expect(card?.status).toBe('APPROVED');
    expect(card?.implementationStatus).toBe('NOT_STARTED');
  });

  it('17. implementation job can be created', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-3',
      projectId: 'ndxbook',
    });
    const impl = implementScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      moduleId: 'PROJECTS',
      screenType: 'OVERVIEW',
      viewport: 'MOBILE',
      projectId: 'ndxbook',
    });
    expect(impl.ok).toBe(true);
    expect(impl.job).toBeTruthy();
  });

  it('18. implementation job has fidelity envelope', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-4',
      projectId: 'ndxbook',
    });
    implementScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      moduleId: 'PROJECTS',
      screenType: 'OVERVIEW',
      viewport: 'MOBILE',
      projectId: 'ndxbook',
    });
    const job = getSkinScreenImplementationJob(`skin-job-${BRAND_FAMILY_KEYS.NDXBOOK}:PROJECTS:OVERVIEW:MOBILE`);
    expect(job?.fidelityEnvelope.visualConvergenceRequired).toBe(true);
    expect(job?.fidelityEnvelope.authorityMode).toBe('DESIGN_AUTHORITY');
  });

  it('19. execution completion enters visual QA', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-ndx-5',
      projectId: 'ndxbook',
    });
    implementScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      moduleId: 'PROJECTS',
      screenType: 'OVERVIEW',
      viewport: 'MOBILE',
      projectId: 'ndxbook',
    });
    const result = simulateExecutionCompleteForAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    const authority = getSkinScreenAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    expect(result).toBeTruthy();
    expect(authority?.implementationStatus).toBe('VISUAL_QA');
  });

  it('20. mobile / desktop authorities stay separate', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-mobile',
      projectId: 'ndxbook',
    });
    const mobile = getSkinScreenAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    const desktop = getSkinScreenAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'DESKTOP');
    expect(mobile).toBeTruthy();
    expect(desktop).toBeNull();
    expect(listScreenAuthoritiesForFamily(BRAND_FAMILY_KEYS.NDXBOOK)).toHaveLength(1);
  });

  it('21. replacing authority creates version', () => {
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-v1',
      projectId: 'ndxbook',
    });
    registerScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.NDXBOOK,
      packScreenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-v2',
      projectId: 'ndxbook',
    });
    const authority = getSkinScreenAuthority(BRAND_FAMILY_KEYS.NDXBOOK, 'PROJECTS', 'OVERVIEW', 'MOBILE');
    expect(authority?.version).toBe('2.0');
    expect(authority?.referenceAssetId).toBe('ref-v2');
  });

  it('22. build passes — ingestion not asset pipeline', () => {
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).not.toContain('ISOLATE ICON');
    expect(read('src/site00/components/brandFamilySkin/SkinScreenAuthorityIngestion.tsx')).not.toContain('DETECT ASSETS');
    expect(read('api/site00/brand-family-skin.ts')).toContain('register_authority');
    expect(read('api/site00/brand-family-skin.ts')).toContain('implement_authority');
  });
});
