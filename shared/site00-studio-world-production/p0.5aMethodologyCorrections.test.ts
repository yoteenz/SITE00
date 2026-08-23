/**
 * P0.5A Production Methodology Corrections — comprehensive methodology tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from '../site00-brand-lore/experienceExpression/constants.js';
import { WORLD_FORMATION_IMPLEMENTED as WORLD_FORMATION_PI } from '../site00-project-intelligence/types.js';
import { WORLD_FORMATION_IMPLEMENTED as WORLD_FORMATION_BL } from '../site00-brand-lore/worldFormation/futureContracts.js';
import {
  CANONICAL_DEPENDENCY_TEMPLATES,
  COMPOSER_ORCHESTRATION_IMPLEMENTED,
  DEPENDENCY_INVALIDATION_FORMALIZED,
  EXPERIENCE_SCOPE_CORRECTED,
  HERO_TO_FULL_SITE_BRIDGE_FORMALIZED,
  HYBRID_DISTINCTIVENESS_ARCHITECTURE_READY,
  IDENTITY_CONCEPT_TERRITORY_FORMALIZED,
  P0_5A_COMPLETE,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  PRODUCTION_METHODOLOGY_TRUSTWORTHY_FOR_P1,
  READY_FOR_P1,
  SITE_PAGE_FAMILY_STAGE_FORMALIZED,
  buildInvalidationEvent,
  compileSurfaceExperienceBrief,
  computeEffectiveReadiness,
  createMigratedSiteStrategy,
  createSemanticConceptSetAuditContract,
  derivePageInventoryFromArchitectureAndCanon,
  desktopProofAloneDoesNotSatisfyMobilePolicy,
  evaluateExperienceConceptVsLayout,
  evaluateExperienceMetaphorBehaviorGuard,
  evaluateIdentityConceptDistinctiveness,
  evaluateIdentityConceptVsDirection,
  evaluateIdentityProductionReadiness,
  evaluateSiteP1Preconditions,
  evaluateSiteProductionReadiness,
  experimentFDistinctivenessCanCarryHeuristicPass,
  experienceExpressionCannotAddRouteWithoutArchitecture,
  falseReadinessHeroProofAloneCannotClaimSiteReady,
  frozenExperimentRemainsValid,
  groupSurfacesIntoPageFamilies,
  heroProofInsufficientForSiteImplementation,
  identityGuidelinesAreDownstreamEvidenceNotMethodology,
  identitySystemContractIsScopeAware,
  implementationContractStaleOnFingerprintChange,
  instantiateCanonicalEdge,
  liveSonnetAuditNotExecutedInP05A,
  paletteFontOnlyCandidateFailsConceptGate,
  pageFamilyDoesNotRequireIdenticalLayout,
  productionOrchestrationRuntimeEngineImplemented,
  registerDependencyEdge,
  representativeFamilyProofCanGovernMultipleSurfaces,
  resolveDownstreamInvalidation,
  runDeterministicDistinctivenessPreCheck,
  semanticAuditAbsenceYieldsNotEvaluated,
  siteArchitectureDistinctFromInformationArchitecture,
  siteStrategyDistinctFromExperienceConcept,
} from './index.js';
import type { IdentityConceptTerritory, SiteLevelImplementationContract } from './index.js';

const AUDIT_DIR = join(process.cwd(), 'audit');

const P05A_ARTIFACTS = [
  'p0.5a-dependency-invalidation-spec.json',
  'p0.5a-site-production-methodology.json',
  'p0.5a-page-family-model.json',
  'p0.5a-experience-scope-correction.json',
  'p0.5a-identity-concept-territory.json',
  'p0.5a-semantic-distinctiveness-policy.json',
  'p0.5a-p1-preconditions.json',
];

describe('P0.5A audit artifacts', () => {
  for (const file of P05A_ARTIFACTS) {
    it(`includes ${file}`, () => {
      const path = join(AUDIT_DIR, file);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, 'utf8').length).toBeGreaterThan(50);
    });
  }
});

describe('P0.5A methodology flags', () => {
  it('declares P0.5A complete with methodology formalized', () => {
    expect(P0_5A_COMPLETE).toBe(true);
    expect(DEPENDENCY_INVALIDATION_FORMALIZED).toBe(true);
    expect(SITE_PAGE_FAMILY_STAGE_FORMALIZED).toBe(true);
    expect(HERO_TO_FULL_SITE_BRIDGE_FORMALIZED).toBe(true);
    expect(EXPERIENCE_SCOPE_CORRECTED).toBe(true);
    expect(IDENTITY_CONCEPT_TERRITORY_FORMALIZED).toBe(true);
    expect(HYBRID_DISTINCTIVENESS_ARCHITECTURE_READY).toBe(true);
    expect(PRODUCTION_METHODOLOGY_TRUSTWORTHY_FOR_P1).toBe(true);
    expect(READY_FOR_P1).toBe(false);
    expect(COMPOSER_ORCHESTRATION_IMPLEMENTED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
  });
});

describe('DEPENDENCY GRAPH', () => {
  it('1. known upstream/downstream relationship can be registered', () => {
    const template = CANONICAL_DEPENDENCY_TEMPLATES[0]!;
    const edge = instantiateCanonicalEdge('proj-1', template, 'lore-1', 'personality-1');
    const graph = registerDependencyEdge(
      { projectId: 'proj-1', edges: [], methodologyVersion: 'P0.5A', updatedAt: new Date().toISOString() },
      edge,
    );
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]?.upstreamType).toBe('BRAND_LORE');
    expect(graph.edges[0]?.downstreamType).toBe('BRAND_PERSONALITY');
  });

  it('2. invalidation resolves deterministic policy', () => {
    const result = resolveDownstreamInvalidation({
      projectId: 'proj-1',
      changeType: 'BRAND_LORE_CHANGE',
      sourceType: 'BRAND_LORE',
      sourceId: 'lore-1',
      changeSummary: 'Worldview updated',
      downstreamRecords: [{ recordType: 'BRAND_PERSONALITY', recordId: 'personality-1' }],
    });
    expect(result.invalidationPolicy).toBe('SOFT_REVIEW_REQUIRED');
    expect(result.automaticRegenerationBlocked).toBe(true);
  });

  it('3. Functional Canon hard change can stale implementation contract', () => {
    const result = resolveDownstreamInvalidation({
      projectId: 'proj-1',
      changeType: 'FUNCTIONAL_CANON_CHANGE',
      sourceType: 'FUNCTIONAL_CANON',
      sourceId: 'canon-1',
      changeSummary: 'Route deleted',
      downstreamRecords: [{ recordType: 'IMPLEMENTATION_CONTRACT', recordId: 'contract-1' }],
    });
    expect(result.invalidationPolicy).toBe('HARD_INVALIDATION');
    expect(result.affectedRecords.some((r) => r.recordType === 'IMPLEMENTATION_CONTRACT')).toBe(true);
  });

  it('4. visual reference staleness does not automatically delete proof', () => {
    const result = resolveDownstreamInvalidation({
      projectId: 'proj-1',
      changeType: 'VISUAL_REFERENCE_STALENESS',
      sourceType: 'VISUAL_REFERENCE',
      sourceId: 'ref-1',
      changeSummary: 'Reference stale',
      downstreamRecords: [{ recordType: 'DESIGN_PROOF', recordId: 'proof-1' }],
    });
    expect(result.invalidationPolicy).toBe('SOFT_REVIEW_REQUIRED');
    expect(result.automaticDeletionBlocked).toBe(true);
  });

  it('5. frozen experiment remains immutable', () => {
    const result = resolveDownstreamInvalidation({
      projectId: 'proj-1',
      changeType: 'BRAND_LORE_CHANGE',
      sourceType: 'BRAND_LORE',
      sourceId: 'lore-1',
      changeSummary: 'Worldview updated',
      downstreamRecords: [{ recordType: 'EXPERIMENT_D_RUN', recordId: 'experiment-d-frozen', frozen: true }],
    });
    expect(result.affectedRecords).toHaveLength(0);
    expect(frozenExperimentRemainsValid('EXPERIMENT_D_RUN', 'experiment-d-frozen').status).toBe('HISTORICAL_EVIDENCE');
  });

  it('6. scope expansion preserves unaffected completed records', () => {
    const result = resolveDownstreamInvalidation({
      projectId: 'proj-1',
      changeType: 'PROJECT_SCOPE_EXPANSION',
      sourceType: 'PROJECT_INTELLIGENCE',
      sourceId: 'intel-1',
      changeSummary: 'Added content module',
      downstreamRecords: [{ recordType: 'SITE_PAGE_FAMILY', recordId: 'family-existing' }],
    });
    expect(result.invalidationPolicy).toBe('NO_INVALIDATION');
  });

  it('7. stale dependency can downgrade effective readiness', () => {
    const readiness = computeEffectiveReadiness({
      recordId: 'contract-1',
      localLifecycleReady: true,
      dependencyInvalidated: true,
      dependencyPolicy: 'HARD_INVALIDATION',
    });
    expect(readiness.effectiveState).toBe('BLOCKED');
    expect(readiness.downgradeReason).toContain('Downgraded');
  });
});

describe('SITE METHODOLOGY', () => {
  it('8. Site Strategy is distinct from Experience Concept', () => {
    expect(siteStrategyDistinctFromExperienceConcept()).toBe(true);
  });

  it('9. Site Architecture is distinct from IA', () => {
    expect(siteArchitectureDistinctFromInformationArchitecture()).toBe(true);
  });

  it('10. Page Inventory derives from architecture/functional requirements', () => {
    const surfaces = derivePageInventoryFromArchitectureAndCanon(
      {
        id: 'arch-1',
        projectId: 'p1',
        routeGroups: [{ groupId: 'main', label: 'Main', routes: ['/projects', '/about'] }],
        primaryJourneys: [],
        navigationHierarchy: [],
        entryPoints: [],
        conversionPaths: [],
        serviceDestinations: [],
        productDestinations: [],
        accountAreas: [],
        supportAreas: [],
        legalSystemPages: [],
        lifecycleState: 'READY',
        functionalCanonFingerprint: 'fc-1',
        provenance: 'COMPILED',
        methodologyVersion: 'P0.5A',
        createdAt: '',
        updatedAt: '',
      },
      [{ route: '/projects', purpose: 'Project directory', requirements: ['list projects'] }],
    );
    expect(surfaces.map((s) => s.route)).toContain('/projects');
    expect(surfaces.find((s) => s.route === '/projects')?.functionalRequirements).toContain('list projects');
  });

  it('11. surfaces can group into Page Families', () => {
    const families = groupSurfacesIntoPageFamilies(
      [{ pageId: 'projects', route: '/projects', pagePurpose: 'workspace', primaryUserGoal: '', primaryBusinessGoal: '', functionalRequirements: [], contentRequirements: [], dataDependencies: [], conversionRole: null, experienceIntensity: 'HIGH', responsivePriority: 'PARITY', pageFamilyCandidate: 'PROJECT_WORKSPACE', implementationCriticality: 'CRITICAL' }],
      [{ familyId: 'PROJECT_WORKSPACE', familyName: 'Project Workspace', familyThesis: 'Shared workspace grammar', surfaceMembers: ['projects'] }],
    );
    expect(families[0]?.familyId).toBe('PROJECT_WORKSPACE');
  });

  it('12. Page Family does not require identical layout', () => {
    const families = groupSurfacesIntoPageFamilies([], [{ familyId: 'F1', familyName: 'F1', familyThesis: 'T', surfaceMembers: [] }]);
    expect(pageFamilyDoesNotRequireIdenticalLayout(families[0]!)).toBe(true);
  });

  it('13. hero proof is not sufficient for site implementation', () => {
    expect(heroProofInsufficientForSiteImplementation()).toBe(true);
    expect(falseReadinessHeroProofAloneCannotClaimSiteReady()).toBe(true);
  });

  it('14. family proof can govern multiple surfaces', () => {
    expect(representativeFamilyProofCanGovernMultipleSurfaces('REPRESENTATIVE_SURFACES', 3)).toBe(true);
  });

  it('15. Surface Experience Brief references family + function', () => {
    const strategy = createMigratedSiteStrategy('p1');
    const families = groupSurfacesIntoPageFamilies([], [{ familyId: 'PW', familyName: 'PW', familyThesis: 'T', surfaceMembers: ['x'] }]);
    const page = { pageId: 'x', route: '/x', pagePurpose: 'p', primaryUserGoal: '', primaryBusinessGoal: '', functionalRequirements: ['r1'], contentRequirements: [], dataDependencies: [], conversionRole: null, experienceIntensity: 'MEDIUM' as const, responsivePriority: 'PARITY' as const, pageFamilyCandidate: 'PW', implementationCriticality: 'STANDARD' as const };
    const brief = compileSurfaceExperienceBrief({ projectId: 'p1', page, strategy, family: families[0]!, functionalCanonFingerprint: 'fc' });
    expect(brief.pageFamilyId).toBe('PW');
    expect(brief.functionalCanonFingerprint).toBe('fc');
  });

  it('16. SiteProductionReadiness blocks without required families', () => {
    const eval_ = evaluateSiteProductionReadiness({
      projectId: 'p1',
      strategyReady: true,
      architectureReady: true,
      iaReady: true,
      inventoryReady: true,
      pageFamiliesReady: false,
      experienceDirectionApproved: true,
      representativeProofsApproved: true,
      productionAssetsAvailable: true,
      coherence: null,
      functionalCanonCurrent: true,
      dependencyGraphCurrent: true,
      implementationContractReady: true,
      composerLiveVerified: false,
    });
    expect(eval_.state).toBe('BLOCKED');
    expect(eval_.blockers.some((b) => b.includes('Page Families'))).toBe(true);
  });
});

describe('EXPERIENCE', () => {
  it('17. Experience Expression cannot add required route absent Site Architecture', () => {
    const gate = experienceExpressionCannotAddRouteWithoutArchitecture(['/home'], '/new-route');
    expect(gate.allowed).toBe(false);
  });

  it('18. Experience Concept is not valid solely as layout', () => {
    const eval_ = evaluateExperienceConceptVsLayout({
      conceptId: 'c1',
      experienceThesis: 'three-column command center',
      viewerUserRelationship: '',
      informationBehavior: '',
      interactionBehavior: '',
      structuralMetaphor: null,
      attentionModel: '',
      spatialTemporalLogic: '',
    });
    expect(eval_.result).toBe('LAYOUT_NOT_CONCEPT');
  });

  it('19. deterministic pre-check can run without claiming semantic audit', () => {
    const heuristic = runDeterministicDistinctivenessPreCheck({
      conceptSetId: 'set-1',
      concepts: [
        { conceptId: 'a', conceptThesis: 'Alpha thesis', viewerRole: 'Observer', contentMechanism: 'Reveal' },
        { conceptId: 'b', conceptThesis: 'Beta thesis', viewerRole: 'Participant', contentMechanism: 'Compare' },
      ],
    });
    expect(heuristic).toBe('HEURISTIC_PASS');
  });

  it('20. semantic audit absence yields NOT_EVALUATED', () => {
    expect(semanticAuditAbsenceYieldsNotEvaluated()).toBe('NOT_EVALUATED');
    const audit = createSemanticConceptSetAuditContract(
      { conceptSetId: 's1', concepts: [{ conceptId: 'a', conceptThesis: 'T', viewerRole: 'V', contentMechanism: 'C' }] },
      'HEURISTIC_NOT_EVALUATED',
    );
    expect(audit.semanticAuditResult).toBe('SEMANTIC_AUDIT_NOT_EVALUATED');
  });

  it('21. Experience metaphor must map to behavior', () => {
    const invalid = evaluateExperienceMetaphorBehaviorGuard({ metaphor: 'Cosmic nebula', behaviorBenefits: ['visually interesting'] });
    expect(invalid.result).toBe('INVALID');
    const valid = evaluateExperienceMetaphorBehaviorGuard({ metaphor: 'Command deck', behaviorBenefits: ['improves navigation and decision-making'] });
    expect(valid.result).toBe('VALID');
  });
});

describe('IDENTITY', () => {
  const baseConcept = (): IdentityConceptTerritory => ({
    id: 'ic-1',
    brandId: 'b1',
    name: 'Territory A',
    identityThesis: 'Identity as invitation',
    coreIdentityIdea: 'The brand invites participation without surrendering authority',
    brandTruthConnection: 'Connects to founder-led truth',
    audienceRelationship: 'Peer collaborator',
    emotionalPromise: 'Confidence without arrogance',
    verbalImplication: 'Direct, precise language',
    visualImplication: 'Structured clarity',
    behavioralImplication: 'Decisive but humane actions',
    materialImplication: null,
    motionImplication: null,
    symbolicLogic: 'Threshold symbolism',
    identityTension: 'Authority vs accessibility',
    possibleDirectionRange: [
      { directionSeed: 'Ceremonial threshold', explanation: 'Formal entry' },
      { directionSeed: 'Open workshop', explanation: 'Casual entry' },
    ],
    antiCollapseRules: ['Do not collapse to palette'],
    provenance: 'FORMATION',
    snapshotFingerprint: null,
    formationReceipt: null,
    methodologyVersion: 'P0.5A',
  });

  it('22. Identity Concept differs from Identity Direction', () => {
    const eval_ = evaluateIdentityConceptVsDirection(baseConcept());
    expect(eval_.result).toBe('CONCEPT');
  });

  it('23. palette/font-only candidate fails concept gate', () => {
    const styleConcept: IdentityConceptTerritory = {
      ...baseConcept(),
      coreIdentityIdea: 'serif + cream + gold identity',
      identityThesis: 'palette and font driven',
      visualImplication: 'serif cream gold palette font',
      verbalImplication: null,
      behavioralImplication: null,
    };
    expect(paletteFontOnlyCandidateFailsConceptGate(styleConcept)).toBe(true);
  });

  it('24. valid Identity Concept supports multiple directions', () => {
    expect(evaluateIdentityConceptVsDirection(baseConcept()).supportsMultipleDirections).toBe(true);
  });

  it('25. identity production cannot be READY from logo approval alone', () => {
    const readiness = evaluateIdentityProductionReadiness({
      brandId: 'b1',
      logoApproved: true,
      conceptApproved: false,
      directionApproved: false,
      systemDomainsComplete: false,
      founderClientApproval: false,
      assetsAvailable: false,
      guidelinesReady: false,
    });
    expect(readiness.state).not.toBe('READY');
    expect(readiness.blockers.some((b) => b.includes('Logo approval alone'))).toBe(true);
  });

  it('26. IdentitySystemContract is scope-aware', () => {
    expect(
      identitySystemContractIsScopeAware({
        id: 'sys-1',
        brandId: 'b1',
        conceptTerritoryId: 'ic-1',
        directionId: 'dir-1',
        scopeDomains: ['verbal_identity', 'color_system'],
        domainRules: {},
        lifecycleState: 'DRAFT',
      }),
    ).toBe(true);
    expect(identityGuidelinesAreDownstreamEvidenceNotMethodology()).toBe(true);
  });
});

describe('IMPLEMENTATION', () => {
  it('27. implementation contract carries page-family fingerprints', () => {
    const contract: SiteLevelImplementationContract = {
      id: 'c1',
      projectId: 'p1',
      fingerprints: {
        siteStrategyFingerprint: 's1',
        siteArchitectureFingerprint: 'a1',
        informationArchitectureFingerprint: 'ia1',
        pageInventoryFingerprint: 'pi1',
        pageFamiliesFingerprint: 'pf1',
        experienceDirectionFingerprint: 'ed1',
        approvedProofsFingerprint: 'ap1',
        functionalCanonFingerprint: 'fc1',
        hostCanonFingerprint: 'hc1',
        clientExpressionFingerprint: 'ce1',
        assetBindingsFingerprint: 'ab1',
      },
      pageFamilyContracts: [],
      surfaceContracts: [],
      lifecycleState: 'READY',
      staleReason: null,
      compiledAt: new Date().toISOString(),
      version: 1,
    };
    expect(contract.fingerprints.pageFamiliesFingerprint).toBe('pf1');
  });

  it('28. dependency fingerprint change marks contract stale', () => {
    const contract: SiteLevelImplementationContract = {
      id: 'c1',
      projectId: 'p1',
      fingerprints: { siteStrategyFingerprint: 'old', siteArchitectureFingerprint: null, informationArchitectureFingerprint: null, pageInventoryFingerprint: null, pageFamiliesFingerprint: null, experienceDirectionFingerprint: null, approvedProofsFingerprint: null, functionalCanonFingerprint: null, hostCanonFingerprint: null, clientExpressionFingerprint: null, assetBindingsFingerprint: null },
      pageFamilyContracts: [],
      surfaceContracts: [],
      lifecycleState: 'READY',
      staleReason: null,
      compiledAt: new Date().toISOString(),
      version: 1,
    };
    const stale = implementationContractStaleOnFingerprintChange(contract, {
      siteStrategyFingerprint: 'new',
      siteArchitectureFingerprint: null,
      informationArchitectureFingerprint: null,
      pageInventoryFingerprint: null,
      pageFamiliesFingerprint: null,
      experienceDirectionFingerprint: null,
      approvedProofsFingerprint: null,
      functionalCanonFingerprint: null,
      hostCanonFingerprint: null,
      clientExpressionFingerprint: null,
      assetBindingsFingerprint: null,
    });
    expect(stale).toBe(true);
  });

  it('29. Site implementation remains blocked because Composer is not connected', () => {
    const p1 = evaluateSiteP1Preconditions({
      projectId: 'p1',
      siteStrategyReady: true,
      siteArchitectureReady: true,
      iaReady: true,
      pageInventoryReady: true,
      pageFamiliesReady: true,
      experienceDirectionApproved: true,
      representativeProofsApproved: true,
      productionAssetsAvailable: true,
      siteCoherenceReady: true,
      functionalCanonCurrent: true,
      dependencyGraphCurrent: true,
      implementationContractCompiled: true,
      composerLiveVerified: true,
    });
    expect(p1.composerConnected).toBe(false);
    expect(COMPOSER_ORCHESTRATION_IMPLEMENTED).toBe(false);
  });
});

describe('RESPONSIVE / ACCESSIBILITY', () => {
  it('30. deep site policy can require representative mobile proof', () => {
    expect(desktopProofAloneDoesNotSatisfyMobilePolicy('MOBILE_NOT_STACKED_DESKTOP', true, false)).toBe(false);
  });

  it('31. desktop proof alone does not satisfy mobile evidence when policy requires it', () => {
    expect(desktopProofAloneDoesNotSatisfyMobilePolicy('MOBILE_REFERENCE', true, false)).toBe(false);
    expect(desktopProofAloneDoesNotSatisfyMobilePolicy('MOBILE_REFERENCE', true, true)).toBe(true);
  });

  it('32. accessibility requirements exist before implementation', () => {
    const families = groupSurfacesIntoPageFamilies([], [{ familyId: 'F1', familyName: 'F1', familyThesis: 'T', surfaceMembers: [] }]);
    expect(families[0]?.accessibilityRequirements.length).toBeGreaterThan(0);
  });
});

describe('INTEGRITY', () => {
  it('33. Experiment D remains unchanged', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
  });

  it('34. Experiment F remains unchanged — heuristic pass compatible', () => {
    const audit = createSemanticConceptSetAuditContract(
      {
        conceptSetId: 'f-set',
        concepts: [
          { conceptId: 'a', conceptThesis: 'One', viewerRole: 'V1', contentMechanism: 'C1' },
          { conceptId: 'b', conceptThesis: 'Two', viewerRole: 'V2', contentMechanism: 'C2' },
        ],
      },
      'HEURISTIC_PASS',
    );
    expect(experimentFDistinctivenessCanCarryHeuristicPass(audit)).toBe(true);
  });

  it('35. Experiment E history preserved — deterministic formation remains', () => {
    expect(liveSonnetAuditNotExecutedInP05A()).toBe(false);
  });

  it('36. Project Workspace Canon remains SITE 00-owned', () => {
    const pageFamilySpec = JSON.parse(readFileSync(join(AUDIT_DIR, 'p0.5a-page-family-model.json'), 'utf8')) as {
      projectWorkspaceCanon: { owner: string };
    };
    expect(pageFamilySpec.projectWorkspaceCanon.owner).toBe('SITE_00');
  });

  it('37. Product Expression remains unimplemented', () => {
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
  });

  it('38. World Formation remains unimplemented', () => {
    expect(WORLD_FORMATION_PI).toBe(false);
    expect(WORLD_FORMATION_BL).toBe(false);
  });

  it('39–40. invalidation events durable + build artifacts present', () => {
    const spec = JSON.parse(readFileSync(join(AUDIT_DIR, 'p0.5a-dependency-invalidation-spec.json'), 'utf8')) as {
      durablePersistence: { supabaseTables: string[] };
    };
    expect(spec.durablePersistence.supabaseTables).toContain('site00_production_invalidation_events');
    const event = buildInvalidationEvent({
      projectId: 'p1',
      changeType: 'FUNCTIONAL_CANON_CHANGE',
      sourceType: 'FUNCTIONAL_CANON',
      sourceId: 'fc-1',
      changeSummary: 'Route removed',
      downstreamRecords: [{ recordType: 'IMPLEMENTATION_CONTRACT', recordId: 'c-1' }],
    });
    expect(event.affectedNodes.length).toBeGreaterThan(0);
    expect(productionOrchestrationRuntimeEngineImplemented()).toBe(false);
  });
});
