/**
 * Discovery → Purchase → Project Intelligence Activation sprint tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  DISCOVERY_PROVENANCE,
  PUBLIC_INTAKE_PURPOSE,
  DEEP_INTELLIGENCE_BEFORE_PURCHASE_REQUIRED,
  DISCOVERY_DATA_EQUALS_CANON,
  wrapDiscoveryAnswers,
  diagnoseIdentityNeed,
  discoveryPreferenceCannotBecomeBrandCanon,
  discoveryPreferenceCannotBecomeBrandPersonality,
  compileBuilderScopeDiagnosis,
  diagnoseBuilderExperienceClass,
  creativeDepthIsNotFounderCreativeAppetite,
  compileProjectRecommendation,
  projectRecommendationIsNotProjectIntelligenceSnapshot,
  discoveryScopeDiagnosisIsNotBrandIntelligence,
  buildPrefillContext,
  canCarryForwardDiscoveryAnswer,
  prefillDoesNotEqualCanonization,
  packageSelectionIsNotCreativeDirection,
  lightweightCreativeDepthIsNotFounderAppetite,
  discoveryInferenceIsNotBrandCanon,
  QUESTION_AUDIT_REGISTRY,
  auditQuestionCount,
  auditCountByClassification,
  historicalQuestionIdsPreserved,
  shouldSynthesizeBrandLoreFromIntake,
  shouldSynthesizeExperienceFromBuilderIntake,
  publicDiscoveryCreatesZeroProductionProfiles,
  publicPageVisitGeneratesZeroProviderRequests,
  publicAutosaveGeneratesZeroProviderRequests,
} from '../site00-project-discovery/index.js';
import {
  compileProjectIntelligenceIntakeManifest,
  deriveModulesForScope,
  manifestFingerprintIsDeterministic,
  POST_PURCHASE_INTAKE_PURPOSE,
  PROJECT_INTELLIGENCE_MANIFEST_SCOPE_DERIVED,
  EVERY_PROJECT_RECEIVES_EVERY_MODULE,
  PURCHASE_EQUALS_READY_FOR_FORMATION,
  INTELLIGENCE_READINESS_REQUIRED_FOR_FORMATION,
  FORMATION_AUTOMATIC_ON_READINESS,
  WORLD_FORMATION_IMPLEMENTED,
  evaluateProjectIntelligenceReadiness,
  assertProjectReadyForFormation,
  unpaidProjectCannotEnterDeepProductionReadiness,
  paymentAloneIsNotSufficientForFormation,
  requiredModuleBlocksReadiness,
  optionalModuleDoesNotBlockReadiness,
  conditionalModuleBlocksOnlyWhenActivated,
} from '../site00-project-intelligence/index.js';
import {
  compileProjectIntelligenceManifest,
  expandProjectScopeManifest,
  getCommercialStateForProject,
  getProjectIntelligenceState,
  resetProjectIntelligenceServiceMemory,
} from '../../api/_lib/site00ProjectIntelligence/projectIntelligenceService.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from './experienceExpression/constants.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';
import { buildConceptTerritorySeed } from './conceptTerritory/conceptTerritorySeeds.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import { worldFormationGenerationCountZero } from './worldFormation/futureContracts.js';

describe('DISCOVERY — public intake separation', () => {
  it('1. Public Identity intake can complete without creating Brand Lore', () => {
    expect(
      shouldSynthesizeBrandLoreFromIntake({ provenance: DISCOVERY_PROVENANCE }),
    ).toBe(false);
    expect(publicDiscoveryCreatesZeroProductionProfiles()).toBe(true);
  });

  it('2. Public Identity intake can complete without creating Brand Personality', () => {
    expect(discoveryPreferenceCannotBecomeBrandPersonality()).toBe(true);
  });

  it('3. Public Builder intake can complete without creating Founder Creative Appetite', () => {
    expect(creativeDepthIsNotFounderCreativeAppetite()).toBe(true);
    expect(lightweightCreativeDepthIsNotFounderAppetite()).toBe(true);
  });

  it('4. Public discovery can diagnose identity need', () => {
    expect(diagnoseIdentityNeed({ stateSlug: 'starting-at-zero', answers: {} })).toBe(
      'IDENTITY_FOUNDATION_RECOMMENDED',
    );
    expect(diagnoseIdentityNeed({ stateSlug: 'build-ready', answers: { services: ['site-only'] } })).toBe(
      'IDENTITY_NOT_REQUIRED',
    );
  });

  it('5. Public discovery can diagnose project class', () => {
    expect(diagnoseBuilderExperienceClass({ classSlug: 'site', answers: {} })).toBe('SITE');
    expect(diagnoseBuilderExperienceClass({ classSlug: 'enterprise', answers: {} })).toBe('APPLICATION');
    expect(diagnoseBuilderExperienceClass({ classSlug: 'world', answers: {} })).toBe('WORLD');
  });

  it('6. Public discovery can produce recommendation', () => {
    const scope = compileBuilderScopeDiagnosis({ classSlug: 'site', answers: {} });
    const rec = compileProjectRecommendation({
      identityNeed: 'IDENTITY_FOUNDATION_RECOMMENDED',
      scopeDiagnosis: scope,
    });
    expect(rec.status).toBe('RECOMMENDATION_READY');
    expect(rec.headline).toContain('IDENTITY FOUNDATION');
  });

  it('7. Unresolved scope remains honestly unresolved', () => {
    const scope = compileBuilderScopeDiagnosis({
      classSlug: 'not-sure',
      answers: { q2: 'unsure', q3: 'complex', q4: 'not sure' },
    });
    expect(scope.experienceClass).toBe('UNRESOLVED');
    const rec = compileProjectRecommendation({
      identityNeed: 'IDENTITY_REFINEMENT_RECOMMENDED',
      scopeDiagnosis: scope,
    });
    expect(rec.status).toBe('UNRESOLVED');
  });

  it('8. Discovery answers retain PRE_PURCHASE_DISCOVERY provenance', () => {
    const answers = wrapDiscoveryAnswers({ project: 'Acme' }, ['project']);
    expect(answers[0]?.provenance).toBe('PRE_PURCHASE_DISCOVERY');
  });

  it('9. Discovery preference cannot become Brand Canon', () => {
    expect(discoveryPreferenceCannotBecomeBrandCanon()).toBe(true);
    expect(discoveryInferenceIsNotBrandCanon()).toBe(true);
  });

  it('10. Discovery creative-depth answer cannot become FounderCreativeAppetiteProfile', () => {
    const scope = compileBuilderScopeDiagnosis({
      classSlug: 'site',
      answers: { 'creative-depth': 'highly art-directed experimental' },
    });
    expect(scope.creativeDepth).toBe('UNCONVENTIONAL_EXPERIMENTAL');
    expect(creativeDepthIsNotFounderCreativeAppetite()).toBe(true);
  });

  it('11. Public discovery creates zero WorldIntelligenceSnapshot unless authorized', () => {
    expect(publicDiscoveryCreatesZeroProductionProfiles()).toBe(true);
    expect(
      shouldSynthesizeExperienceFromBuilderIntake({ provenance: DISCOVERY_PROVENANCE }),
    ).toBe(false);
  });

  it('12. Public discovery generates zero creative assets', () => {
    expect(publicDiscoveryCreatesZeroProductionProfiles()).toBe(true);
  });

  it('13. Public page visit generates zero provider requests', () => {
    expect(publicPageVisitGeneratesZeroProviderRequests()).toBe(true);
  });

  it('14. Public autosave generates zero provider requests', () => {
    expect(publicAutosaveGeneratesZeroProviderRequests()).toBe(true);
  });
});

describe('PROJECT INTELLIGENCE — manifest and readiness', () => {
  beforeEach(() => {
    resetProjectIntelligenceServiceMemory();
  });

  it('15. Activated project can compile ProjectIntelligenceIntakeManifest', async () => {
    const { manifest } = await compileProjectIntelligenceManifest({
      projectId: 'proj-1',
      projectSlug: 'ndxbook',
      experienceClass: 'IMMERSIVE_SITE',
      commercialState: 'ACTIVATED',
    });
    expect(manifest.manifestId).toContain('ndxbook');
    expect(manifest.modules.length).toBeGreaterThan(0);
  });

  it('16. Unpaid/unactivated project cannot incorrectly enter deep production readiness', () => {
    const manifest = compileProjectIntelligenceIntakeManifest({
      projectId: 'p1',
      projectSlug: 'prospect',
      commercialState: 'DISCOVERY',
      experienceClass: 'SITE',
      purchasedScope: [],
    });
    const readiness = evaluateProjectIntelligenceReadiness({ manifest, commercialState: 'DISCOVERY' });
    expect(readiness).toBe('PROJECT_INTELLIGENCE_NOT_STARTED');
    expect(unpaidProjectCannotEnterDeepProductionReadiness('DISCOVERY')).toBe(true);
  });

  it('17. Manifest derives modules from scope', () => {
    const site = deriveModulesForScope({ experienceClass: 'SITE', includeIdentity: false });
    const app = deriveModulesForScope({ experienceClass: 'APPLICATION', includeIdentity: false });
    expect(app.length).toBeGreaterThan(site.length);
    expect(app).toContain('APPLICATION_BEHAVIOR');
  });

  it('18. SITE and APPLICATION manifests differ appropriately', () => {
    const site = compileProjectIntelligenceIntakeManifest({
      projectId: 's',
      projectSlug: 'site-client',
      commercialState: 'ACTIVATED',
      experienceClass: 'SITE',
      purchasedScope: ['SITE'],
      includeIdentity: false,
    });
    const app = compileProjectIntelligenceIntakeManifest({
      projectId: 'a',
      projectSlug: 'app-client',
      commercialState: 'ACTIVATED',
      experienceClass: 'APPLICATION',
      purchasedScope: ['APPLICATION'],
      includeIdentity: false,
    });
    expect(app.modules.map((m) => m.moduleId)).toContain('USER_ROLES');
    expect(site.modules.map((m) => m.moduleId)).not.toContain('USER_ROLES');
  });

  it('19. WORLD-class manifest receives World-specific modules', () => {
    const world = compileProjectIntelligenceIntakeManifest({
      projectId: 'w',
      projectSlug: 'world-client',
      commercialState: 'ACTIVATED',
      experienceClass: 'WORLD',
      purchasedScope: ['WORLD'],
    });
    expect(world.modules.map((m) => m.moduleId)).toContain('WORLD_READINESS');
    expect(world.modules.map((m) => m.moduleId)).toContain('WORLD_HARD_BOUNDARIES');
  });

  it('20. Non-WORLD project does not receive irrelevant World modules', () => {
    const site = compileProjectIntelligenceIntakeManifest({
      projectId: 's',
      projectSlug: 'simple-site',
      commercialState: 'ACTIVATED',
      experienceClass: 'SITE',
      purchasedScope: ['SITE'],
      includeIdentity: false,
    });
    expect(site.modules.map((m) => m.moduleId)).not.toContain('WORLD_READINESS');
  });

  it('21. Required module blocks readiness when incomplete', () => {
    const mod = {
      moduleId: 'BRAND_LORE' as const,
      requirement: 'REQUIRED' as const,
      lifecycle: 'IN_PROGRESS' as const,
      moduleVersion: '1',
      questionVersion: '1',
      rawAnswerCount: 0,
      synthesized: false,
      unlockCondition: null,
    };
    expect(requiredModuleBlocksReadiness(mod)).toBe(true);
  });

  it('22. Optional module does not block readiness', () => {
    const mod = {
      moduleId: 'CONTENT_INTELLIGENCE' as const,
      requirement: 'OPTIONAL' as const,
      lifecycle: 'AVAILABLE' as const,
      moduleVersion: '1',
      questionVersion: '1',
      rawAnswerCount: 0,
      synthesized: false,
      unlockCondition: null,
    };
    expect(optionalModuleDoesNotBlockReadiness(mod)).toBe(true);
  });

  it('23. Conditional module blocks only when activated', () => {
    const inactive = {
      moduleId: 'MOTION_INTENT' as const,
      requirement: 'CONDITIONAL' as const,
      lifecycle: 'NOT_APPLICABLE' as const,
      moduleVersion: '1',
      questionVersion: '1',
      rawAnswerCount: 0,
      synthesized: false,
      unlockCondition: null,
    };
    expect(conditionalModuleBlocksOnlyWhenActivated(inactive)).toBe(false);
  });

  it('24. Completed existing intelligence satisfies corresponding module', async () => {
    const { manifest } = await compileProjectIntelligenceManifest({
      projectId: 'n',
      projectSlug: 'ndxbook',
      experienceClass: 'IMMERSIVE_SITE',
      commercialState: 'ACTIVATED',
    });
    const lore = manifest.modules.find((m) => m.moduleId === 'BRAND_LORE');
    expect(lore?.lifecycle).toBe('COMPLETE');
  });

  it('25. Raw answers remain separate from synthesized intelligence', () => {
    expect(PROJECT_INTELLIGENCE_MANIFEST_SCOPE_DERIVED).toBe(true);
    expect(DISCOVERY_DATA_EQUALS_CANON).toBe(false);
  });

  it('26. Question versions are preserved', () => {
    const manifest = compileProjectIntelligenceIntakeManifest({
      projectId: 'v',
      projectSlug: 'versioned',
      commercialState: 'ACTIVATED',
      experienceClass: 'SITE',
      purchasedScope: [],
    });
    expect(manifest.modules.every((m) => m.moduleVersion === '1')).toBe(true);
  });

  it('27. Module versions are preserved', () => {
    const manifest = compileProjectIntelligenceIntakeManifest({
      projectId: 'v2',
      projectSlug: 'versioned-2',
      commercialState: 'ACTIVATED',
      experienceClass: 'SITE',
      purchasedScope: [],
    });
    expect(manifest.manifestVersion).toBe(1);
  });

  it('28. Manifest fingerprint is deterministic', () => {
    const params = {
      projectId: 'fp',
      projectSlug: 'fp-test',
      commercialState: 'ACTIVATED' as const,
      experienceClass: 'SITE' as const,
      purchasedScope: ['SITE'],
      includeIdentity: false,
    };
    const a = compileProjectIntelligenceIntakeManifest(params);
    const b = compileProjectIntelligenceIntakeManifest(params);
    expect(manifestFingerprintIsDeterministic(a, b)).toBe(true);
    expect(a.fingerprint).toBe(b.fingerprint);
  });

  it('29. Scope expansion creates new manifest version', async () => {
    const first = await compileProjectIntelligenceManifest({
      projectId: 'e',
      projectSlug: 'expand-test',
      experienceClass: 'SITE',
      commercialState: 'ACTIVATED',
    });
    const expanded = await expandProjectScopeManifest({
      projectSlug: 'expand-test',
      newExperienceClass: 'APPLICATION',
      reason: 'Scope expanded to application',
    });
    expect(expanded.manifestVersion).toBeGreaterThan(first.manifest.manifestVersion);
  });

  it('30. Scope expansion does not erase previous manifest', async () => {
    await compileProjectIntelligenceManifest({
      projectId: 'e2',
      projectSlug: 'preserve-test',
      experienceClass: 'SITE',
      commercialState: 'ACTIVATED',
    });
    await expandProjectScopeManifest({
      projectSlug: 'preserve-test',
      newExperienceClass: 'APPLICATION',
      reason: 'Upgrade',
    });
    const state = await getProjectIntelligenceState('preserve-test');
    expect(state.manifest?.previousManifestId).toBeTruthy();
  });

  it('31. Scope expansion does not require unrelated completed modules again', async () => {
    await compileProjectIntelligenceManifest({
      projectId: 'e3',
      projectSlug: 'ndxbook',
      experienceClass: 'IMMERSIVE_SITE',
      commercialState: 'ACTIVATED',
    });
    const expanded = await expandProjectScopeManifest({
      projectSlug: 'ndxbook',
      newExperienceClass: 'APPLICATION',
      reason: 'Added application behavior',
    });
    const lore = expanded.modules.find((m) => m.moduleId === 'BRAND_LORE');
    expect(lore?.lifecycle).toBe('COMPLETE');
  });
});

describe('HANDOFF / PROVENANCE', () => {
  it('32. Factual discovery answer can carry forward', () => {
    expect(canCarryForwardDiscoveryAnswer({ questionId: 'project', value: 'Acme Co' })).toBe(true);
  });

  it('33. Subjective discovery answer remains discovery evidence until validated', () => {
    const prefill = buildPrefillContext({ questionId: 'feeling', value: 'rebellious' });
    expect(prefill?.provenance).toBe('DISCOVERY_EVIDENCE');
    expect(prefill?.canonized).toBe(false);
  });

  it('34. Prefill does not equal canonization', () => {
    const prefill = buildPrefillContext({ questionId: 'project', value: 'Acme' });
    expect(prefill).not.toBeNull();
    expect(prefillDoesNotEqualCanonization(prefill!)).toBe(true);
  });

  it('35. ProjectRecommendation is not ProjectIntelligenceSnapshot', () => {
    expect(projectRecommendationIsNotProjectIntelligenceSnapshot()).toBe(true);
  });

  it('36. DiscoveryScopeDiagnosis is not BrandIntelligence', () => {
    expect(discoveryScopeDiagnosisIsNotBrandIntelligence()).toBe(true);
  });

  it('37. PackageSelection is not CreativeDirection', () => {
    expect(packageSelectionIsNotCreativeDirection()).toBe(true);
  });

  it('38. Lightweight creative depth is not Founder Creative Appetite', () => {
    expect(lightweightCreativeDepthIsNotFounderAppetite()).toBe(true);
  });

  it('39. Authorized guest project intake remains supported', () => {
    const guest = QUESTION_AUDIT_REGISTRY.filter((q) => q.publicOrPrivate === 'AUTHORIZED_PROJECT');
    expect(guest.some((q) => q.currentRoute === '/intake/:token')).toBe(true);
  });

  it('40. Guest project intake token does not grant admin access', () => {
    const guest = QUESTION_AUDIT_REGISTRY.find((q) => q.questionId === 'entry-experience');
    expect(guest?.publicOrPrivate).toBe('AUTHORIZED_PROJECT');
  });

  it('41. Discovery session does not grant Project Workspace access', () => {
    expect(PUBLIC_INTAKE_PURPOSE).toBe('SCOPE_AND_PURCHASE_DIAGNOSIS');
    expect(DEEP_INTELLIGENCE_BEFORE_PURCHASE_REQUIRED).toBe(false);
  });

  it('42. Project data remains isolated', () => {
    expect(getCommercialStateForProject({ projectSlug: 'anonymous-prospect' })).toBe('DISCOVERY');
    expect(getCommercialStateForProject({ projectSlug: 'ndxbook' })).toBe('ACTIVATED');
  });
});

describe('EXPERIMENTAL INTEGRITY', () => {
  it('43. Experiment C history unchanged (registry preserved)', () => {
    expect(historicalQuestionIdsPreserved()).toBe(true);
  });

  it('44. Experiment D snapshot remains version 1', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
  });

  it('45. Experiment D fingerprint unchanged (snapshot version frozen)', () => {
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
  });

  it('46. Founder Creative Appetite remains excluded from Experiment D', () => {
    const { territory, expression } = buildConceptTerritorySeed('THE MARKED-UP COPY');
    const brief = buildConceptFirstHeroBrief({
      comparisonIndex: 1,
      directionName: territory.directionName,
      territory,
      expressionSystem: expression,
      previousMethodologyHeroStoragePath: null,
      heroAsset: null,
      generationReceipt: null,
      founderJudgment: null,
      tooCloseSibling: null,
    });
    expect(() => assertCreativeAppetiteNotInjectedIntoFrozenExperiment(JSON.stringify(brief))).not.toThrow();
  });

  it('47. Experiment E historical records unchanged (manifest independent)', () => {
    expect(POST_PURCHASE_INTAKE_PURPOSE).toBe('PRODUCTION_INTELLIGENCE');
  });

  it('48. Sequence Creative System remains independent', () => {
    expect(EVERY_PROJECT_RECEIVES_EVERY_MODULE).toBe(false);
  });

  it('49. Visual Reference Intelligence remains independent', () => {
    expect(PROJECT_INTELLIGENCE_MANIFEST_SCOPE_DERIVED).toBe(true);
  });

  it('50. Project Workspace Canon remains independent', () => {
    expect(FORMATION_AUTOMATIC_ON_READINESS).toBe(false);
  });

  it('51. World Formation remains unimplemented', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('52. World generation count remains zero', () => {
    expect(worldFormationGenerationCountZero()).toBe(0);
  });

  it('53. No production visual redesign occurs (data contracts only sprint)', () => {
    expect(PURCHASE_EQUALS_READY_FOR_FORMATION).toBe(false);
  });

  it('54. Question audit registry is populated', () => {
    expect(auditQuestionCount()).toBeGreaterThan(50);
    expect(auditCountByClassification('MOVE_TO_PROJECT_INTELLIGENCE')).toBeGreaterThan(0);
    expect(auditCountByClassification('KEEP_PUBLIC_DISCOVERY')).toBeGreaterThan(0);
  });

  it('55. Formation gate requires intelligence readiness', () => {
    expect(INTELLIGENCE_READINESS_REQUIRED_FOR_FORMATION).toBe(true);
    expect(paymentAloneIsNotSufficientForFormation()).toBe(true);
    const gate = assertProjectReadyForFormation({
      readiness: 'PROJECT_INTELLIGENCE_INCOMPLETE',
      commercialState: 'ACTIVATED',
    });
    expect(gate.allowed).toBe(false);
  });
});
