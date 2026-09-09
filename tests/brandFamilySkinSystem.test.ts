/**
 * Brand Family Skin System — 32 acceptance tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  BRAND_FAMILY_KEYS,
  BRAND_FAMILY_SKIN_LINEAGE,
  STANDARD_SCREEN_PACK,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/types.js';
import {
  BRAND_FAMILY_PROJECT_MAP,
  HOST_SKIN_FIREWALL,
  TYPOGRAPHY_FIREWALL,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';
import {
  AIO_BRAND_FAMILY,
  ASTRAL_WORLD_BRAND_FAMILY,
  FRONTAL_SLAYER_BRAND_FAMILY,
  NDXBOOK_BRAND_FAMILY,
  STUDIO_WORLD_BRAND_FAMILY,
  getBrandFamilySkinByKey,
  listBrandFamilySkins,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/registry.js';
import {
  approveBrandFamilyAssignment,
  clearBrandFamilyBindingsForTest,
  createBrandFamilyProjectBinding,
  fieldIsNotSkin,
  getProjectBrandFamilyBinding,
  suggestBrandFamilyForProject,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/projectBinding.js';
import {
  approveSkinScreenAuthority,
  clearScreenAuthoritiesForTest,
  createSkinScreenAuthority,
  getScreenAuthorityStatus,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/screenAuthority.js';
import {
  getDefaultFirstAuthorityScreen,
  getOrCreateSkinPack,
  getStandardScreenPackStatus,
  supportsPartialSkinPack,
  clearSkinPacksForTest,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/skinPack.js';
import {
  getModuleFunctionalContract,
  moduleLogicSurvivesSkinChange,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/functionalContract.js';
import {
  getTypographyFirewallSpec,
  validateTypographyFirewall,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/typographyFirewall.js';
import { buildBrandSkinColorBinding, colorIsSeparateFromSkinGrammar } from '../shared/site00-brand-lore/projectSkin/brandFamily/colorBinding.js';
import {
  brandFamilyInspectorPayload,
  resolveBrandFamilySkin,
  shouldBlockAutoSkinDesign,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/resolver.js';
import {
  aioAndStudioWorldAreDistinct,
  compareAllCanonicalFamiliesDistinct,
  runBrandFamilySkinConsistencyQA,
  runBrandFamilySkinDistinctivenessQA,
  runBrandFamilyHostFirewallQA,
  runSkinStructuralDistinctivenessQA,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/qa.js';
import {
  approveBrandFamilySkinMigration,
  clearBrandFamilyMigrationsForTest,
  createBrandFamilySkinMigrationPreview,
  rollbackBrandFamilySkinMigration,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/migration.js';
import {
  clientSeesBrandFamilySkinOnly,
  founderSeesBrandFamilySkinConfig,
  initializeBrandFamilyFromOnboarding,
  processFirstApprovedAuthority,
  SCREEN_BY_SCREEN_WORKFLOW,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/integration.js';
import {
  buildFidelityContractInputFromAuthority,
  clearImplementationJobsForTest,
  createSkinScreenImplementationJob,
} from '../shared/site00-brand-lore/projectSkin/brandFamily/implementationJob.js';
import { getProjectExperienceSkin } from '../shared/site00-brand-lore/projectSkin/projectSkinStore.js';
import { clearProjectSkinStoreForTest } from '../shared/site00-brand-lore/projectSkin/projectSkinStore.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Brand Family Skin System', () => {
  beforeEach(() => {
    clearBrandFamilyBindingsForTest();
    clearScreenAuthoritiesForTest();
    clearSkinPacksForTest();
    clearBrandFamilyMigrationsForTest();
    clearImplementationJobsForTest();
    clearProjectSkinStoreForTest();
  });

  it('1. BrandFamilySkin model exists', () => {
    expect(BRAND_FAMILY_SKIN_LINEAGE).toBe('BRAND_FAMILY_SKIN');
    expect(getBrandFamilySkinByKey('NDXBOOK')).toBeTruthy();
  });

  it('2. initial five families registered', () => {
    expect(listBrandFamilySkins()).toHaveLength(5);
    expect(listBrandFamilySkins().map((s) => s.brandKey)).toEqual([
      BRAND_FAMILY_KEYS.NDXBOOK,
      BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      BRAND_FAMILY_KEYS.AIO,
      BRAND_FAMILY_KEYS.ASTRAL_WORLD,
      BRAND_FAMILY_KEYS.STUDIO_WORLD,
    ]);
  });

  it('3. project can bind to family skin', () => {
    const binding = createBrandFamilyProjectBinding({
      projectId: 'frontal-slayer',
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      founderApproved: true,
    });
    expect(binding.brandFamilySkinId).toBe(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);
  });

  it('4. field != final skin', () => {
    expect(fieldIsNotSkin(['LOGISTICS'], BRAND_FAMILY_KEYS.AIO)).toBe(true);
    expect(AIO_BRAND_FAMILY.fieldTags).toContain('LOGISTICS');
    expect(AIO_BRAND_FAMILY.skinIntent).toBe('OPERATIONAL_COMMAND');
  });

  it('5. primary color stored separately from skin grammar', () => {
    const aioColor = buildBrandSkinColorBinding(BRAND_FAMILY_KEYS.AIO)!;
    const studioColor = buildBrandSkinColorBinding(BRAND_FAMILY_KEYS.STUDIO_WORLD)!;
    expect(colorIsSeparateFromSkinGrammar(aioColor, studioColor, 'AIO', 'STUDIO_WORLD')).toBe(true);
    expect(AIO_BRAND_FAMILY.primaryColorFamily).toBe('GOLD');
    expect(STUDIO_WORLD_BRAND_FAMILY.primaryColorFamily).toBe('GOLD');
    expect(AIO_BRAND_FAMILY.id).not.toBe(STUDIO_WORLD_BRAND_FAMILY.id);
  });

  it('6. Martian Mono typography firewall exists', () => {
    const spec = getTypographyFirewallSpec();
    expect(spec.requiredFontFamily).toBe('MARTIAN MONO');
    expect(validateTypographyFirewall('Serif Display').pass).toBe(false);
    expect(validateTypographyFirewall('Martian Mono').pass).toBe(true);
  });

  it('7. uppercase UI rule preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.uiCaseRule).toBe('UPPERCASE');
  });

  it('8. screen authority model exists', () => {
    const authority = createSkinScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      moduleId: 'OVERVIEW',
      screenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-fs-overview-mobile',
    });
    expect(authority.authorityMode).toBe('DESIGN_AUTHORITY');
    expect(authority.fidelityMode).toBe('EXACT');
  });

  it('9. one screen = one authority supported', () => {
    const a = createSkinScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      moduleId: 'OVERVIEW',
      screenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-1',
      approvedByFounder: true,
    });
    expect(a.id).toContain('FRONTAL_SLAYER');
    expect(a.visualConvergenceRequired).toBe(true);
  });

  it('10. partial skin pack supported', () => {
    createSkinScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      moduleId: 'OVERVIEW',
      screenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-1',
      approvedByFounder: true,
    });
    const pack = getOrCreateSkinPack(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);
    expect(pack.completionStatus).toBe('PARTIAL');
    expect(supportsPartialSkinPack(BRAND_FAMILY_KEYS.FRONTAL_SLAYER)).toBe(true);
  });

  it('11. Project Overview is default first authority', () => {
    expect(getDefaultFirstAuthorityScreen()).toBe('PROJECT_OVERVIEW');
    expect(STANDARD_SCREEN_PACK[0]).toBe('PROJECT_OVERVIEW');
  });

  it('12. ModuleFunctionalContract exists', () => {
    const contract = getModuleFunctionalContract('PROJECT_OVERVIEW');
    expect(contract.mustPreserve).toContain('PROJECT_IDENTITY');
    expect(contract.canVary).toContain('REGION_ORDER');
  });

  it('13. structural freedom supported', () => {
    const contract = getModuleFunctionalContract('EVOLVE');
    expect(contract.moduleSpecificFreedom).toContain('skinCompositionFreedom=HIGH');
    expect(NDXBOOK_BRAND_FAMILY.skinCompositionFreedom).toBe('HIGH');
  });

  it('14. current module logic survives skin changes', () => {
    const contract = getModuleFunctionalContract('EVOLVE');
    expect(moduleLogicSurvivesSkinChange(contract)).toBe(true);
    expect(contract.mustPreserve).toContain('EVOLVE_PIPELINE');
  });

  it('15. no final visual auto-generation without authority', () => {
    createBrandFamilyProjectBinding({
      projectId: 'frontal-slayer',
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
    });
    expect(shouldBlockAutoSkinDesign('frontal-slayer', 'PROJECT_OVERVIEW')).toBe(true);
    const resolved = resolveBrandFamilySkin('frontal-slayer', 'OVERVIEW', 'PROJECT_OVERVIEW');
    expect(resolved?.renderMode).toBe('GENERIC_FALLBACK');
    expect(resolved?.failureCode).toBe('SKIN_SCREEN_AUTHORITY_REQUIRED');
  });

  it('16. generic fallback works when authority missing', () => {
    const resolved = resolveBrandFamilySkin('astral-world', 'OVERVIEW', 'PROJECT_OVERVIEW');
    expect(resolved?.cssClass).toBeNull();
    expect(resolved?.renderMode).toBe('GENERIC_FALLBACK');
  });

  it('17. NDX existing implementation preserved', () => {
    expect(NDXBOOK_BRAND_FAMILY.status).toBe('EXISTING_SKIN_TO_REFINE');
    const resolved = resolveBrandFamilySkin('ndxbook', 'EVOLVE', 'EVOLVE');
    expect(resolved?.renderMode).toBe('EXISTING_IMPLEMENTATION');
    expect(NDXBOOK_BRAND_FAMILY.legacyMasterSkinId).toBe('cultural-editorial');
  });

  it('18. FS family record created', () => {
    expect(FRONTAL_SLAYER_BRAND_FAMILY.primaryColor).toBe('#EB1C24');
    expect(FRONTAL_SLAYER_BRAND_FAMILY.skinIntent).toBe('LUXURY_BEAUTY_EDITORIAL');
    expect(getScreenAuthorityStatus(BRAND_FAMILY_KEYS.FRONTAL_SLAYER, 'PROJECT_OVERVIEW')).toBe('NOT_STARTED');
  });

  it('19. AIO family record created', () => {
    expect(AIO_BRAND_FAMILY.skinIntent).toBe('OPERATIONAL_COMMAND');
    expect(AIO_BRAND_FAMILY.primaryColorFamily).toBe('GOLD');
  });

  it('20. Astral World family record created', () => {
    expect(ASTRAL_WORLD_BRAND_FAMILY.skinIntent).toBe('ETHEREAL_PORTAL');
    expect(ASTRAL_WORLD_BRAND_FAMILY.primaryColorFamily).toBe('PURPLE');
  });

  it('21. Studio World family record created', () => {
    expect(STUDIO_WORLD_BRAND_FAMILY.skinIntent).toBe('CREATIVE_COMMAND');
    expect(STUDIO_WORLD_BRAND_FAMILY.primaryColorFamily).toBe('GOLD');
  });

  it('22. skin versioning works', () => {
    expect(NDXBOOK_BRAND_FAMILY.version).toBe('2.0');
    expect(FRONTAL_SLAYER_BRAND_FAMILY.version).toBe('1.0');
    const binding = getProjectBrandFamilyBinding('ndxbook');
    expect(binding?.skinVersion).toBe('2.0');
  });

  it('23. migration preview works', () => {
    getProjectBrandFamilyBinding('all-in-one-enterprises');
    const migration = createBrandFamilySkinMigrationPreview({
      projectId: 'all-in-one-enterprises',
      toBrandFamilySkinId: BRAND_FAMILY_KEYS.STUDIO_WORLD,
    });
    expect(migration?.previewAvailable).toBe(true);
  });

  it('24. rollback works', () => {
    getProjectBrandFamilyBinding('all-in-one-enterprises');
    const migration = createBrandFamilySkinMigrationPreview({
      projectId: 'all-in-one-enterprises',
      toBrandFamilySkinId: BRAND_FAMILY_KEYS.STUDIO_WORLD,
    })!;
    approveBrandFamilySkinMigration(migration.migrationId, 'founder');
    const rolled = rollbackBrandFamilySkinMigration(migration.migrationId);
    expect(rolled?.rolledBack).toBe(true);
  });

  it('25. founder sees skin management UI', () => {
    expect(founderSeesBrandFamilySkinConfig('FOUNDER')).toBe(true);
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('EXPERIENCE SKIN');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('ExperienceSkinManagementPanel');
  });

  it('26. client does not see internal skin config', () => {
    expect(clientSeesBrandFamilySkinOnly('CLIENT')).toBe(true);
    expect(founderSeesBrandFamilySkinConfig('CLIENT')).toBe(false);
    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain("viewMode === 'CLIENT'");
  });

  it('27. P0.VR.6 fidelity contract attaches to authorities', () => {
    const { authority, fidelityInput } = processFirstApprovedAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      moduleId: 'OVERVIEW',
      screenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-fs-approved',
      projectId: 'frontal-slayer',
    });
    expect(authority.status).toBe('APPROVED');
    expect(fidelityInput.authorityMode).toBe('DESIGN_AUTHORITY');
    expect(fidelityInput.fidelityMode).toBe('EXACT');
    expect(buildFidelityContractInputFromAuthority(authority, 'frontal-slayer').authorityMode).toBe('DESIGN_AUTHORITY');
  });

  it('28. P0.VR.6R2 convergence required for exact authorities', () => {
    const authority = createSkinScreenAuthority({
      brandFamilySkinId: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
      moduleId: 'OVERVIEW',
      screenType: 'PROJECT_OVERVIEW',
      viewport: 'MOBILE',
      referenceAssetId: 'ref-convergence',
      approvedByFounder: true,
    });
    approveSkinScreenAuthority(authority.id);
    const job = createSkinScreenImplementationJob(authority);
    expect(job?.fidelityEnvelope.visualConvergenceRequired).toBe(true);
  });

  it('29. distinctiveness QA exists', () => {
    expect(aioAndStudioWorldAreDistinct()).toBe(true);
    const qa = runBrandFamilySkinDistinctivenessQA('AIO', 'STUDIO_WORLD');
    expect(qa.pass).toBe(true);
    expect(compareAllCanonicalFamiliesDistinct()).toBe(true);
  });

  it('30. consistency QA exists', () => {
    const qa = runBrandFamilySkinConsistencyQA(BRAND_FAMILY_KEYS.NDXBOOK);
    expect(qa.pass).toBe(true);
    expect(runSkinStructuralDistinctivenessQA(AIO_BRAND_FAMILY, STUDIO_WORLD_BRAND_FAMILY).pass).toBe(true);
  });

  it('31. System Inspector exposes skin state', () => {
    getProjectBrandFamilyBinding('frontal-slayer');
    const inspector = brandFamilyInspectorPayload('frontal-slayer');
    expect(inspector.brandFamilySkinId).toBe(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);
    expect(inspector.hostFirewallStatus).toBe('INTACT');
    expect(read('api/site00/brand-family-skin.ts')).toContain('inspector');
  });

  it('32. build passes — acceptance scenarios + onboarding + host firewall', () => {
    expect(SCREEN_BY_SCREEN_WORKFLOW).toContain('LOCK_SCREEN_AUTHORITY');
    expect(HOST_SKIN_FIREWALL.hostControls).toContain('MARTIAN_MONO_TYPOGRAPHY');
    expect(runBrandFamilyHostFirewallQA().pass).toBe(true);

    expect(BRAND_FAMILY_PROJECT_MAP['frontal-slayer']).toBe(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);
    expect(suggestBrandFamilyForProject('Frontal Slayer')).toBe(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);

    const fsStatus = getStandardScreenPackStatus(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);
    expect(fsStatus.PROJECT_OVERVIEW).toBe('NOT_STARTED');

    initializeBrandFamilyFromOnboarding({
      projectId: 'new-fs',
      projectName: 'Frontal Slayer',
      fieldTags: ['BEAUTY'],
      founderApproved: true,
      selectedBy: 'founder',
    });
    expect(getProjectBrandFamilyBinding('new-fs')?.brandFamilySkinId).toBe(BRAND_FAMILY_KEYS.FRONTAL_SLAYER);

    const ndxBinding = getProjectExperienceSkin('ndxbook');
    expect(ndxBinding?.brandFamilySkinId).toBe(BRAND_FAMILY_KEYS.NDXBOOK);

    expect(read('src/site00/components/brandFamilySkin/ExperienceSkinManagementPanel.tsx')).toContain('BRAND FAMILY REGISTRY');
  });
});
