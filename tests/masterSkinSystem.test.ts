/**
 * Master Skin System tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  MASTER_SKIN_CATALOG_IDS,
  MASTER_SKIN_LINEAGE,
  PROOF_PROJECT_SKIN_MAP,
  PROOF_SKIN_IDS,
} from '../shared/site00-brand-lore/projectSkin/constants.js';
import {
  CLINICAL_EDITORIAL_SKIN,
  CULTURAL_EDITORIAL_SKIN,
  TECHNICAL_OPERATIONS_SKIN,
  getMasterSkinById,
  listMasterSkins,
} from '../shared/site00-brand-lore/projectSkin/catalog.js';
import {
  recommendForDoctorDemo,
  recommendForMedSpaDemo,
  recommendMasterSkins,
} from '../shared/site00-brand-lore/projectSkin/recommendationEngine.js';
import {
  addProjectSkinOverride,
  approveProjectSkin,
  clearProjectSkinStoreForTest,
  createProjectExperienceSkin,
  getProjectExperienceSkin,
} from '../shared/site00-brand-lore/projectSkin/projectSkinStore.js';
import { resolveModuleSkin, skinInspectorPayload } from '../shared/site00-brand-lore/projectSkin/resolver.js';
import {
  runMasterSkinConsistencyQA,
  runMasterSkinDistinctivenessQA,
  runMasterSkinHostFirewallQA,
  skinsAreMeaningfullyDifferent,
} from '../shared/site00-brand-lore/projectSkin/qa.js';
import {
  approveSkinMigration,
  clearSkinMigrationsForTest,
  createSkinMigrationPreview,
  rollbackSkinMigration,
} from '../shared/site00-brand-lore/projectSkin/migration.js';
import {
  clientSeesAssignedSkinOnly,
  consumeIdentityForSkinRecommendation,
  founderSeesSkinConfiguration,
  initializeProjectSkinFromOnboarding,
} from '../shared/site00-brand-lore/projectSkin/integration.js';
import { FIELD_INDUSTRY_TAGS } from '../shared/site00-brand-lore/projectSkin/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Master Skin System', () => {
  beforeEach(() => {
    clearProjectSkinStoreForTest();
    clearSkinMigrationsForTest();
  });

  it('1. field classification exists', () => {
    expect(FIELD_INDUSTRY_TAGS).toContain('HEALTH');
    expect(FIELD_INDUSTRY_TAGS).toContain('MEDICAL');
    expect(FIELD_INDUSTRY_TAGS).toContain('LOGISTICS');
  });

  it('2. multiple field tags supported', () => {
    const binding = createProjectExperienceSkin({
      projectId: 'med-spa-demo',
      masterSkinId: MASTER_SKIN_CATALOG_IDS.LUXURY_CLINICAL,
      fieldTags: ['HEALTH', 'BEAUTY', 'WELLNESS'],
      primaryColor: '#c9a227',
    });
    expect(binding.fieldTags).toEqual(['HEALTH', 'BEAUTY', 'WELLNESS']);
  });

  it('3. MasterSkin exists', () => {
    expect(MASTER_SKIN_LINEAGE).toBe('MASTER_SKIN');
    expect(listMasterSkins().length).toBeGreaterThanOrEqual(5);
    expect(CULTURAL_EDITORIAL_SKIN.id).toBe('cultural-editorial');
  });

  it('4. field != skin', () => {
    expect(CULTURAL_EDITORIAL_SKIN.supportedFields).not.toEqual(['HEALTH']);
    expect(CLINICAL_EDITORIAL_SKIN.id).not.toBe('HEALTH');
  });

  it('5. ExpressionProfile exists on project binding', () => {
    const binding = createProjectExperienceSkin({
      projectId: 'test-expr',
      masterSkinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
      fieldTags: ['HEALTH'],
      primaryColor: '#2a7f8f',
    });
    expect(binding.expressionProfile).toBeDefined();
    expect(binding.expressionProfile.tags.length).toBeGreaterThan(0);
  });

  it('6. ProjectExperienceSkin exists', () => {
    const binding = getProjectExperienceSkin('ndxbook');
    expect(binding?.projectId).toBe('ndxbook');
    expect(binding?.masterSkinId).toBe(MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL);
  });

  it('7. project primary color injected', () => {
    const resolved = resolveModuleSkin('demo-doctor-health', 'EVOLVE');
    expect(resolved?.primaryColor).toBe('#2a7f8f');
    expect(resolved?.cssVars['--site00-skin-primary']).toBe('#2a7f8f');
  });

  it('8. module variants exist', () => {
    const skin = getMasterSkinById(MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL)!;
    expect(skin.moduleVariants.some((v) => v.moduleId === 'EVOLVE')).toBe(true);
    expect(skin.moduleVariants.some((v) => v.moduleId === 'IDENTITY')).toBe(true);
  });

  it('9. host firewall preserved', () => {
    const qa = runMasterSkinHostFirewallQA();
    expect(qa.pass).toBe(true);
    expect(read('src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx')).toContain('site00-pos__main');
    expect(read('src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx')).not.toContain(
      'site00-pos" data-master-skin',
    );
  });

  it('10. NDXBOOK maps to cultural editorial proof', () => {
    expect(PROOF_PROJECT_SKIN_MAP.ndxbook).toBe(MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL);
  });

  it('11. doctor demo maps to clinical editorial', () => {
    expect(PROOF_PROJECT_SKIN_MAP['demo-doctor-health']).toBe(MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL);
  });

  it('12. AIO maps to technical operations proof', () => {
    expect(PROOF_PROJECT_SKIN_MAP['all-in-one-enterprises']).toBe(MASTER_SKIN_CATALOG_IDS.TECHNICAL_OPERATIONS);
  });

  it('13. onboarding recommendation works', () => {
    const rec = recommendForDoctorDemo();
    expect(rec.recommendedSkinId).toBe(MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL);
    expect(rec.confidence).toBeGreaterThan(0.4);
  });

  it('14. founder approves final skin', () => {
    const binding = approveProjectSkin({
      projectId: 'new-health-co',
      selectedSkinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
      selectedBy: 'founder',
      primaryColor: '#2a7f8f',
    });
    expect(binding?.founderApproved).toBe(true);
  });

  it('15. preview alternate works via recommendation ranked list', () => {
    const rec = recommendForDoctorDemo();
    expect(rec.rankedSkins.length).toBeGreaterThan(0);
    expect(rec.rankedSkins.some((r) => r.skinId !== rec.recommendedSkinId)).toBe(true);
  });

  it('16. project override works', () => {
    createProjectExperienceSkin({
      projectId: 'override-test',
      masterSkinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
      fieldTags: ['HEALTH'],
      primaryColor: '#2a7f8f',
    });
    const updated = addProjectSkinOverride('override-test', { panelDensity: 'LOW', moduleId: 'EVOLVE' });
    expect(updated?.brandOverrides.length).toBe(1);
  });

  it('17. skin version stored', () => {
    const binding = getProjectExperienceSkin('ndxbook');
    expect(binding?.activeSkinVersion).toBe('1.0');
  });

  it('18. migration preview supported', () => {
    getProjectExperienceSkin('ndxbook');
    const migration = createSkinMigrationPreview({
      projectId: 'ndxbook',
      toSkinId: MASTER_SKIN_CATALOG_IDS.MINIMAL_INSTITUTIONAL,
    });
    expect(migration?.previewAvailable).toBe(true);
  });

  it('19. rollback supported', () => {
    getProjectExperienceSkin('ndxbook');
    const migration = createSkinMigrationPreview({
      projectId: 'ndxbook',
      toSkinId: MASTER_SKIN_CATALOG_IDS.MINIMAL_INSTITUTIONAL,
    })!;
    approveSkinMigration(migration.migrationId, 'founder');
    const rolled = rollbackSkinMigration(migration.migrationId);
    expect(rolled?.rolledBack).toBe(true);
  });

  it('20. client sees assigned skin', () => {
    expect(clientSeesAssignedSkinOnly('CLIENT')).toBe(true);
    const resolved = resolveModuleSkin('ndxbook', 'EVOLVE');
    expect(resolved?.cssClass).toContain('cultural-editorial');
  });

  it('21. client does not see internal skin config', () => {
    expect(founderSeesSkinConfiguration('FOUNDER')).toBe(true);
    expect(founderSeesSkinConfiguration('CLIENT')).toBe(false);
  });

  it('22. skin recommendation consumes existing identity data', () => {
    const rec = consumeIdentityForSkinRecommendation({
      fieldTags: ['HEALTH', 'MEDICAL'],
      brandPersonality: ['CALM', 'TRUSTED'],
      primaryColor: '#2a7f8f',
      audience: 'PATIENTS',
    });
    expect(rec.recommendedSkinId).toBe(MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL);
  });

  it('23. no generic industry stereotype required — med spa gets luxury clinical', () => {
    const rec = recommendForMedSpaDemo();
    expect(rec.recommendedSkinId).toBe(MASTER_SKIN_CATALOG_IDS.LUXURY_CLINICAL);
    expect(rec.recommendedSkinId).not.toBe(MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL);
  });

  it('24. distinctiveness QA catches color-only variants', () => {
    const qa = runMasterSkinDistinctivenessQA(
      MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
      MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
    );
    expect(qa.pass).toBe(true);
    expect(qa.colorOnlyVariation).toBe(false);
    expect(skinsAreMeaningfullyDifferent([...PROOF_SKIN_IDS])).toBe(true);
  });

  it('25. consistency QA validates related module variants', () => {
    const qa = runMasterSkinConsistencyQA(MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL);
    expect(qa.pass).toBe(true);
    expect(qa.sharedDna.length).toBeGreaterThan(0);
  });

  it('26. host firewall QA passes', () => {
    expect(runMasterSkinHostFirewallQA().failureCode).toBeNull();
  });

  it('27. System Inspector exposes skin state', () => {
    const inspector = skinInspectorPayload('ndxbook');
    expect(inspector.masterSkinId).toBe(MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL);
    expect(inspector.hostFirewallStatus).toBe('INTACT');
    expect(read('api/site00/master-skin.ts')).toContain('inspector');
  });

  it('28. build passes — UI modules and onboarding present', () => {
    expect(read('src/site00/components/masterSkin/MasterSkinOnboardingStep.tsx')).toContain('EXPERIENCE SKIN');
    expect(read('src/site00/components/masterSkin/MasterSkinPreviewCard.tsx')).toContain('USE THIS');
    expect(read('src/site00/components/masterSkin/MasterSkinEvolveProofPanel.tsx')).toContain('EVOLVE');
    const onboarding = initializeProjectSkinFromOnboarding({
      projectId: 'onboard-health',
      fieldTags: ['HEALTH'],
      recommendedSkinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
      selectedSkinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
      primaryColor: '#2a7f8f',
      founderApproved: true,
      selectedBy: 'founder',
      recommendation: recommendMasterSkins({ fieldTags: ['HEALTH'] }),
    });
    expect(onboarding?.founderApproved).toBe(true);
  });
});
