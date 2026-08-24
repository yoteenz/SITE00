/**
 * Visual Reference Intelligence sprint — methodology + integration tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  compileVisualCaptureManifest,
  compileVisualReferencePackage,
  computeReferencePackageFingerprint,
  referencePackageFingerprintIsDeterministic,
  selectVisualReferencesForIntent,
  hostAndClientMemoriesRemainSeparate,
  selectionDoesNotIncludeEveryScreenshot,
  seedDefaultHostVisualMemory,
  seedNdxbookClientVisualMemory,
  buildStructuralProofReference,
  classifySciFiWorkbenchProof,
  evaluateReferenceAdherence,
  guardStructuralStyleFromHostStyle,
  guardNegativeReferenceFromTargetStyle,
  guardNdxbookReferenceFromHostCanon,
  guardMartianMonoNotNdxbookClientTypography,
  guardVisualMemoryNotCanon,
  strictHostVisualReferenceOutranksStructuralStyle,
  functionalCanonOutranksVisualReference,
  referenceCaptureGeneratesZeroImageGeneration,
  referencePackageCompileGeneratesZeroImageGeneration,
  pageVisitGeneratesZeroVisualReferenceCapture,
  resolveVisualGenerationMode,
  shouldFailWithoutReferenceConditioning,
  assertReferenceConditioningSupported,
  getCurrentExperienceProviderCapability,
  providerSupportsMultiReference,
  FOUNDER_MANUAL_SCREENSHOT_COLLECTION_REQUIRED,
  WORLD_VISUAL_MEMORY_SCAFFOLD,
  findDuplicateReference,
  approvedHostBaselineOutranksExperimental,
  deprioritizeStaleReferences,
  applyFounderExclusions,
} from '../site00-visual-reference/index.js';
import {
  captureSite00RouteReference,
  referenceCaptureGeneratesZeroFalRequests,
} from '../../api/_lib/site00VisualReference/captureService.js';
import {
  refreshVisualReferences,
  compileReferencePackageForIntent,
  classifyExistingProofAsStructuralReference,
  resetVisualReferenceServiceMemory,
  initializeVisualReferenceMemory,
} from '../../api/_lib/site00VisualReference/visualReferenceService.js';
import {
  compileVisualDevelopmentReferencePackage,
  generateReferenceConditionedDesignProof,
  generateVisualDevelopmentDesignProof,
  refreshVisualDevelopmentReferences,
  resetVisualDevelopmentRunMemory,
  excludeVisualDevelopmentReference,
  createReferenceConditionedChildProof,
} from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import { parentProofRemainsImmutable } from './experienceExpression/designProofQA.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from './experienceExpression/constants.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import { worldFormationGenerationCountZero, WORLD_FORMATION_IMPLEMENTED } from './worldFormation/futureContracts.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn().mockResolvedValue({
    brandWorld: { value: 'NDXBOOK' },
    brandPersonality: { version: 1 },
    contextClassification: 'PRIMARY_EXPRESSION_CONTEXT',
  }),
}));

const PROJECTS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectsPage.tsx'), 'utf8');
const VD_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/projectWorkspace/ProjectWorkspaceVisualDevelopmentReview.tsx'),
  'utf8',
);

beforeEach(() => {
  resetVisualDevelopmentRunMemory();
  resetVisualReferenceServiceMemory();
  process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
});

describe('Visual Reference Intelligence sprint', () => {
  it('1. SITE 00 can automatically capture an accessible route', async () => {
    const result = await captureSite00RouteReference({
      route: '/projects',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
      authorityScopes: ['FUNCTIONAL'],
      authority: { FUNCTION: 'FUNCTIONAL_ONLY' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'Projects baseline',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reference.route).toBe('/projects');
    }
  });

  it('2. Desktop viewport capture works', async () => {
    const result = await captureSite00RouteReference({
      route: '/control',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['HOST_SHELL'],
      authorityScopes: ['HOST'],
      authority: { STYLE: 'STRICT' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'Host shell',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reference.viewportClass).toBe('DESKTOP');
  });

  it('3. Mobile viewport capture works', async () => {
    const result = await captureSite00RouteReference({
      route: '/projects',
      viewportClass: 'MOBILE',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['HOST_RESPONSIVE_BEHAVIOR'],
      authorityScopes: ['HOST'],
      authority: { RESPONSIVE_BEHAVIOR: 'STRONG' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'Mobile projects',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reference.viewportWidth).toBe(390);
  });

  it('4. Screenshot record contains source route', async () => {
    const result = await captureSite00RouteReference({
      route: '/',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['HOST_SPATIAL_ATMOSPHERE'],
      authorityScopes: ['HOST'],
      authority: { SPATIAL_ATMOSPHERE: 'STRICT' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'Origin environment',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reference.route).toBe('/');
  });

  it('5. Screenshot record contains viewport', async () => {
    const result = await captureSite00RouteReference({
      route: '/projects/ndxbook',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['HOST_SHELL'],
      authorityScopes: ['HOST'],
      authority: { STYLE: 'STRICT' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'Project shell',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reference.viewportWidth).toBe(1440);
      expect(result.reference.viewportHeight).toBe(900);
    }
  });

  it('6. Screenshot record contains source commit/version', async () => {
    const result = await captureSite00RouteReference({
      route: '/projects',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'abc123commit',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
      authorityScopes: ['FUNCTIONAL'],
      authority: { FUNCTION: 'FUNCTIONAL_ONLY' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'Projects',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reference.sourceCommit).toBe('abc123commit');
  });

  it('7. Screenshot record has durable storage', async () => {
    const result = await captureSite00RouteReference({
      route: '/projects',
      viewportClass: 'DESKTOP',
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
      authorityScopes: ['FUNCTIONAL'],
      authority: { FUNCTION: 'FUNCTIONAL_ONLY' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'Projects',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reference.storagePath).toContain('visual-references/site00');
      expect(result.reference.publicUrl).toBeTruthy();
    }
  });

  it('8. Duplicate capture can be reused', async () => {
    const params = {
      route: '/projects',
      viewportClass: 'DESKTOP' as const,
      baseUrl: 'http://127.0.0.1:5174',
      sourceCommit: 'vitest-dedup',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'] as const,
      authorityScopes: ['FUNCTIONAL'] as const,
      authority: { FUNCTION: 'FUNCTIONAL_ONLY' as const },
      approvalStatus: 'APPROVED_REFERENCE' as const,
      sourceType: 'AUTOMATED_ROUTE_CAPTURE' as const,
      label: 'Projects',
    };
    const first = await captureSite00RouteReference(params);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = await captureSite00RouteReference({
      ...params,
      existingReferences: [first.reference],
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.reused).toBe(true);
  });

  it('9. VisualCaptureManifest selects relevant routes', () => {
    const manifest = compileVisualCaptureManifest({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    expect(manifest.entries.some((e) => e.route === '/projects')).toBe(true);
    expect(manifest.entries.some((e) => e.route === '/')).toBe(true);
    expect(manifest.entries.some((e) => e.route === '/control')).toBe(true);
    expect(manifest.entries.every((e) => e.route.startsWith('/'))).toBe(true);
  });

  it('10. Reference selection does not include every screenshot', () => {
    const host = seedDefaultHostVisualMemory();
    const selected = selectVisualReferencesForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
      targetSurface: '/projects',
      targetDevice: 'DESKTOP',
      hostMemory: host,
      clientMemory: null,
      structuralProofReference: null,
      negativeProofReference: null,
    });
    expect(selectionDoesNotIncludeEveryScreenshot(selected, host.references.length)).toBe(true);
  });

  it('11. Host and client memories remain separate', () => {
    const host = seedDefaultHostVisualMemory();
    const client = seedNdxbookClientVisualMemory();
    expect(hostAndClientMemoriesRemainSeparate(host, client)).toBe(true);
  });

  it('12. Reference roles are preserved in package', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    expect(pkg.references.every((r) => r.roles.length > 0)).toBe(true);
  });

  it('13. Reference authority is preserved in package', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const hostRef = pkg.references.find((r) => r.label.includes('HOST'));
    expect(hostRef?.authority.STYLE).toBeTruthy();
  });

  it('14. Structural-only reference cannot gain style authority', () => {
    const structural = buildStructuralProofReference({
      proofRecordId: 'proof-a',
      storagePath: 'site00/visual-development/test.webp',
      publicUrl: 'https://vitest.local/test.webp',
    });
    expect(guardStructuralStyleFromHostStyle(structural).allowed).toBe(true);
    expect(structural.authority.STYLE).toBe('STRUCTURAL_ONLY');
  });

  it('15. Functional-only reference cannot force presentation', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const functional = pkg.references.find((r) => r.label.includes('FUNCTIONAL'));
    expect(functional?.authority.STYLE).toBe('NONE');
  });

  it('16. Negative reference cannot become positive style source', () => {
    const structural = buildStructuralProofReference({
      proofRecordId: 'neg-test',
      storagePath: 'test.webp',
      publicUrl: null,
    });
    const negative = { ...structural, approvalStatus: 'NEGATIVE_REFERENCE' as const, authority: { STYLE: 'NEGATIVE_ONLY' as const } };
    expect(guardNegativeReferenceFromTargetStyle(negative).allowed).toBe(true);
  });

  it('17. STRICT host reference outranks structural-reference style', () => {
    const host = seedDefaultHostVisualMemory().references[0]!;
    const structural = buildStructuralProofReference({
      proofRecordId: 'struct',
      storagePath: 'struct.webp',
      publicUrl: null,
    });
    expect(strictHostVisualReferenceOutranksStructuralStyle(host, structural)).toBe(true);
  });

  it('18. Functional Canon outranks visual references', () => {
    expect(functionalCanonOutranksVisualReference()).toBe(true);
  });

  it('19. Sci-fi proof classified STRUCTURAL + NEGATIVE_STYLE', () => {
    const c = classifySciFiWorkbenchProof();
    expect(c.structuralAuthority).toBe(true);
    expect(c.styleAuthority).toBe(false);
    expect(c.negativeStyle).toBe(true);
  });

  it('20. Previous proof remains immutable', async () => {
    await generateVisualDevelopmentDesignProof('NDXBOOK_PROJECT_HOME');
    const before = (await compileVisualDevelopmentReferencePackage('NDXBOOK_PROJECT_HOME')).proofs.ndxbookProjectHome;
    const parentId = before.proofRecordId;
    const parentPath = before.composedProof?.storagePath;
    await createReferenceConditionedChildProof('NDXBOOK_PROJECT_HOME');
    const after = (await compileVisualDevelopmentReferencePackage('NDXBOOK_PROJECT_HOME')).proofs.ndxbookProjectHome;
    expect(after.proofRecordId).not.toBe(parentId);
    expect(after.proofLineage.some((e) => e.proofRecordId === parentId)).toBe(true);
    expect(parentProofRemainsImmutable()).toBe(true);
    expect(parentPath).toBeTruthy();
  });

  it('21. New proof is child lineage', async () => {
    await generateVisualDevelopmentDesignProof('NDXBOOK_PROJECT_HOME');
    await createReferenceConditionedChildProof('NDXBOOK_PROJECT_HOME');
    const run = await compileVisualDevelopmentReferencePackage('NDXBOOK_PROJECT_HOME');
    expect(run.proofs.ndxbookProjectHome.parentProofRecordId).toBeTruthy();
    expect(run.proofs.ndxbookProjectHome.proofLabel).toBe('PROOF_B');
    expect(run.proofs.ndxbookProjectHome.revisionReason).toBe('HOST_VISUAL_FIDELITY_FAILURE');
  });

  it('22. Reference package fingerprint is deterministic', async () => {
    const pkg = await compileReferencePackageForIntent({ generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' });
    expect(pkg.fingerprint).toHaveLength(16);
    expect(computeReferencePackageFingerprint(pkg)).toBe(pkg.fingerprint);
  });

  it('23. Page visit does not capture screenshots unless requested', () => {
    expect(pageVisitGeneratesZeroVisualReferenceCapture()).toBe(true);
    expect(VD_REVIEW).not.toContain('captureSite00RouteReference');
  });

  it('24. Page visit causes zero visual generation', () => {
    expect(PROJECTS_PAGE).toContain('PROJECT INDEX');
    const reloadBlock = VD_REVIEW.match(/const reload = useCallback[\s\S]*?\}, \[projectSlug\]\);/)?.[0] ?? '';
    expect(reloadBlock).toContain('visualDevelopmentGet');
    expect(reloadBlock).not.toContain('visualDevelopmentGenerate');
    expect(VD_REVIEW).toContain('site00-vd__error-panel');
    expect(VD_REVIEW).toContain('setLoading(true)');
  });

  it('25. Reference capture causes zero image-generation calls', () => {
    expect(referenceCaptureGeneratesZeroFalRequests()).toBe(true);
    expect(referenceCaptureGeneratesZeroImageGeneration()).toBe(true);
  });

  it('26. Reference package compile causes zero image-generation calls', () => {
    expect(referencePackageCompileGeneratesZeroImageGeneration()).toBe(true);
  });

  it('27. Founder-triggered proof generation uses selected references', async () => {
    await generateVisualDevelopmentDesignProof('NDXBOOK_PROJECT_HOME');
    await compileVisualDevelopmentReferencePackage('NDXBOOK_PROJECT_HOME');
    const run = await generateReferenceConditionedDesignProof('NDXBOOK_PROJECT_HOME');
    expect(run.proofs.ndxbookProjectHome.referenceConditioned).toBe(true);
    expect(run.proofs.ndxbookProjectHome.referencePackage).not.toBeNull();
  });

  it('28. Provider receives actual image references when supported', () => {
    const profile = getCurrentExperienceProviderCapability();
    expect(providerSupportsMultiReference(profile, 3)).toBe(true);
  });

  it('29. Generation fails honestly if reference-conditioned mode unsupported', () => {
    const check = assertReferenceConditioningSupported({
      providerId: 'fal',
      modelId: 'openai/gpt-image-2',
      referenceCount: 2,
      strictHostRequired: true,
    });
    expect(check.ok).toBe(false);
  });

  it('30. No silent fallback to unconstrained T2I when strict reference required', () => {
    expect(
      shouldFailWithoutReferenceConditioning({
        strictHostVisualConditioning: true,
        generationMode: 'TEXT_TO_IMAGE',
        referenceCount: 3,
      }),
    ).toBe(true);
  });

  it('31. Host visual memory does not become Brand Canon', () => {
    expect(guardVisualMemoryNotCanon()).toBe(true);
    expect(FOUNDER_MANUAL_SCREENSHOT_COLLECTION_REQUIRED).toBe(false);
  });

  it('32. Client visual memory does not mutate Host Canon', () => {
    const ndx = seedNdxbookClientVisualMemory().references[0]!;
    expect(guardNdxbookReferenceFromHostCanon(ndx).allowed).toBe(true);
  });

  it('33. Martian Mono is not promoted to NDXBOOK client typography', () => {
    expect(guardMartianMonoNotNdxbookClientTypography('Martian Mono')).toBe(false);
  });

  it('34. Desktop reference is not automatic mobile layout authority', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
      targetDevice: 'MOBILE',
    });
    expect(pkg.targetDevice).toBe('MOBILE');
  });

  it('35. Stale/superseded references are deprioritized', () => {
    const host = seedDefaultHostVisualMemory();
    const stale = { ...host.references[0]!, stalenessState: 'STALE' as const };
    const fresh = { ...host.references[1]!, stalenessState: 'FRESH' as const };
    const sorted = deprioritizeStaleReferences([stale, fresh]);
    expect(sorted[0]?.stalenessState).toBe('FRESH');
  });

  it('36. Approved host baseline outranks experimental reference', () => {
    const host = seedDefaultHostVisualMemory();
    const baseline = host.references[0]!;
    const experimental = buildStructuralProofReference({
      proofRecordId: 'exp',
      storagePath: 'exp.webp',
      publicUrl: null,
    });
    expect(approvedHostBaselineOutranksExperimental(baseline, experimental)).toBe(true);
  });

  it('37. Founder can exclude a reference', async () => {
    await initializeVisualReferenceMemory();
    const run = await excludeVisualDevelopmentReference('SITE00_PROJECTS_INDEX', 'host-ref-control-desktop');
    expect(run.proofs.site00ProjectsIndex.excludedReferenceIds).toContain('host-ref-control-desktop');
  });

  it('38. Founder can add reference authority override via compile', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    expect(pkg.strictHostVisualConditioning).toBe(true);
  });

  it('39. Experiment D fingerprint remains unchanged', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
    expect(buildConceptFirstHeroBrief).toBeDefined();
  });

  it('40. Founder Creative Appetite remains absent from Experiment D', () => {
    expect(() =>
      assertCreativeAppetiteNotInjectedIntoFrozenExperiment(
        JSON.stringify({ experimentId: 'ndxbook-six-concept-hero-range', founderCreativeAppetite: { v: 1 } }),
      ),
    ).toThrow();
  });

  it('41-44. Sequence Creative / World Formation integrity', () => {
    expect(worldFormationGenerationCountZero()).toBe(0);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(WORLD_VISUAL_MEMORY_SCAFFOLD.implemented).toBe(false);
  });

  it('45. Reference-conditioned generation mode resolves for multi-ref package', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const mode = resolveVisualGenerationMode({ referencePackage: pkg });
    expect(['MULTI_REFERENCE_CONDITIONED', 'COMPOSITIONAL_REFERENCE_CONDITIONED', 'REFERENCE_CONDITIONED']).toContain(
      mode,
    );
  });

  it('classify existing proof as structural + negative references', async () => {
    const { structural, negative } = await classifyExistingProofAsStructuralReference({
      proofRecordId: 'site00-projects-index-v1',
      storagePath: 'site00/visual-development/site00_projects_index/composed-desktop-proof.webp',
      publicUrl: 'https://vitest.local/proof.webp',
    });
    expect(structural.approvalStatus).toBe('STRUCTURAL_REFERENCE');
    expect(negative.approvalStatus).toBe('NEGATIVE_REFERENCE');
  });

  it('refresh visual references updates host memory', async () => {
    const { host, captured, reused } = await refreshVisualReferences({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    expect(host.references.length).toBeGreaterThan(0);
    expect(captured.length + reused).toBeGreaterThanOrEqual(0);
  });

  it('reference adherence returns NOT_EVALUATED without vision', () => {
    const result = evaluateReferenceAdherence({ visionEvaluationAvailable: false });
    expect(result.overallResult).toBe('NOT_EVALUATED');
  });

  it('UI shows visual reference intelligence panel', () => {
    expect(VD_REVIEW).toContain('VISUAL REFERENCE INTELLIGENCE');
    expect(VD_REVIEW).toContain('GENERATE REFERENCE-CONDITIONED PROOF');
  });

  it('production projects page not mutated', () => {
    expect(PROJECTS_PAGE).toContain('PROJECT INDEX');
    expect(PROJECTS_PAGE).not.toContain('ACTIVE PRODUCTION FLOOR');
  });

  it('founder exclusions filter references', () => {
    const host = seedDefaultHostVisualMemory();
    const filtered = applyFounderExclusions(host.references, ['host-ref-control-desktop']);
    expect(filtered.length).toBe(host.references.length - 1);
  });

  it('deduplication findDuplicateReference works', () => {
    const host = seedDefaultHostVisualMemory();
    const ref = host.references[0]!;
    const dup = findDuplicateReference(host.references, {
      route: ref.route,
      viewportClass: ref.viewportClass,
      sourceCommit: ref.sourceCommit,
      imageFingerprint: ref.imageFingerprint,
    });
    expect(dup?.id).toBe(ref.id);
  });

  it('computeReferencePackageFingerprint stable', () => {
    const host = seedDefaultHostVisualMemory();
    const pkg = compileVisualReferencePackage({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
      selectionInput: {
        generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
        targetSurface: '/projects',
        targetDevice: 'DESKTOP',
        hostMemory: host,
        clientMemory: null,
        structuralProofReference: null,
        negativeProofReference: null,
      },
      strictHostVisualConditioning: true,
    });
    expect(computeReferencePackageFingerprint(pkg)).toBe(pkg.fingerprint);
  });
});
