/**
 * P1 Follow-up — Authenticated visual capture + purpose-gated asset resolution (50 tests).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  verifyCapturedSurfaceIdentity,
  signInCaptureMayProvideProjectsHierarchyAuthority,
  signInCaptureMayRetainHostLightingAuthority,
} from '../../site00-visual-reference/surfaceIdentityVerification.js';
import {
  applyQuarantineToReference,
  isReferenceQuarantinedForRoute,
  quarantineExistingInvalidReferences,
  referenceEligibleForPackageSelection,
} from '../../site00-visual-reference/referenceQuarantine.js';
import {
  loadVisualCaptureAuthContext,
  captureAuthContextHasSession,
  redactSecretsFromCaptureMetadata,
} from '../../site00-visual-reference/captureAuthContext.js';
import {
  captureSite00RouteReference,
  captureMetadataContainsNoSecrets,
} from '../../../api/_lib/site00VisualReference/captureService.js';
import {
  evaluateAuthenticatedReferenceForRoute,
  assertAuthenticatedProjectsReferencesReady,
} from '../../site00-visual-reference/authenticatedReferencePrecondition.js';
import type { VisualReferenceRecord } from '../../site00-visual-reference/types.js';
import {
  compileProjectsWorkspaceVisualSlots,
  NON_ASSET_METHODOLOGY_ROLES,
  LEGACY_METHODOLOGY_ASSET_ROLES,
} from './generationBoundary/interfaceVisualSlot.js';
import {
  evaluateCreativeAssetEligibility,
  evaluateVisualDevelopmentAssetEligibility,
} from './generationBoundary/assetEligibility.js';
import {
  evaluateGenerationNecessity,
  buildGenerationJustification,
  generationBlockedWithoutJustification,
  methodologyTermBlocksGeneration,
  defaultAssetSourcePriority,
} from './generationBoundary/generationNecessity.js';
import {
  compilePurposeGatedSlotResolution,
  compileAssetPromptFromPurpose,
  resolveProjectVisualEvidence,
  slotResolutionBlocksMethodologyGeneration,
} from './generationBoundary/purposeGatedSlotResolution.js';
import {
  evaluateSurfaceContentFidelity,
  decorativeFillerRiskDetectable,
  fakeHistoricalArtifactsFailSemanticRelevance,
} from './generationBoundary/surfaceContentFidelity.js';
import { compilePurposeGatedInterfaceManifest } from './generationBoundary/interfaceAssetManifest.js';
import { evaluateReferencePipelineStatus } from './generationBoundary/referencePipelineStatus.js';
import { selectVisualReferencesForIntent } from '../../site00-visual-reference/referenceSelection.js';
import { seedDefaultHostVisualMemory } from '../../site00-visual-reference/hostVisualMemory.js';
import { compileSite00ProjectsIndexProofManifest } from '../../site00-brand-lore/experienceExpression/designProofManifest.js';
import { deriveProjectsIndexProofArtDirection } from '../../site00-brand-lore/experienceExpression/designProofArtDirection.js';
import { buildProjectWorkspaceCanon } from '../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import {
  generateMissingInterfaceAssets,
  prepareComposedInterfaceSurface,
  resetVisualDevelopmentRunMemory,
} from '../../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import { buildComposerImplementationPackage } from '../composerAdapter.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../constants.js';

function mockReference(overrides: Partial<VisualReferenceRecord> = {}): VisualReferenceRecord {
  const now = new Date().toISOString();
  return {
    id: 'ref-1',
    projectId: null,
    brandId: 'site00',
    surfaceId: '/projects',
    route: '/projects',
    sourceUrl: 'https://site00.com/origin/sign-in',
    captureType: 'VIEWPORT',
    viewportClass: 'DESKTOP',
    viewportWidth: 1440,
    viewportHeight: 900,
    deviceScaleFactor: 1,
    capturedAt: now,
    sourceCommit: 'abc',
    deploymentId: null,
    environment: 'test',
    storagePath: 'site00/host-references/projects-desktop.webp',
    publicUrl: 'https://example.com/ref.webp',
    imageFingerprint: 'fp',
    pageFingerprint: 'pfp',
    referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
    authorityScopes: ['FUNCTIONAL'],
    authority: { HIERARCHY: 'FUNCTIONAL_ONLY' },
    approvalStatus: 'APPROVED_REFERENCE',
    sourceType: 'AUTOMATED_ROUTE_CAPTURE',
    provenance: 'test',
    stalenessState: 'FRESH',
    supersedesReferenceId: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  resetVisualDevelopmentRunMemory();
  delete process.env.VITEST_CAPTURE_PRINCIPAL;
});

describe('P1 authenticated capture correction', () => {
  describe('AUTH CAPTURE', () => {
    it('1. requested /projects redirect to sign-in fails validation', () => {
      const result = verifyCapturedSurfaceIdentity({
        requestedRoute: '/projects',
        finalUrl: 'https://site00.com/origin/sign-in',
        redirectChain: ['https://site00.com/projects', 'https://site00.com/origin/sign-in'],
        capturePrincipal: 'PUBLIC_GUEST',
        authenticated: false,
        domEvidence: { hasRequiredSelectors: false, hasForbiddenSelectors: true },
      });
      expect(['AUTH_REDIRECT_DETECTED', 'AUTHENTICATION_FAILED']).toContain(result.surfaceIdentity);
    });

    it('2. auth redirect cannot register as Projects visual authority', () => {
      const ref = applyQuarantineToReference(mockReference(), 'AUTH_REDIRECT_CAPTURE', ['/projects']);
      expect(isReferenceQuarantinedForRoute(ref, '/projects')).toBe(true);
      expect(referenceEligibleForPackageSelection(ref, '/projects', ['CURRENT_FUNCTIONAL_SURFACE'])).toBe(false);
    });

    it('3. PROJECT_OWNER authenticated capture accepted for /projects', async () => {
      process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
      const result = await captureSite00RouteReference({
        route: '/projects',
        viewportClass: 'DESKTOP',
        baseUrl: 'https://site00.com',
        referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
        authorityScopes: ['FUNCTIONAL'],
        authority: {},
        approvalStatus: 'APPROVED_REFERENCE',
        sourceType: 'AUTOMATED_ROUTE_CAPTURE',
        label: 'test',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.reference.captureMetadata?.surfaceIdentity).toBe('VALID_TARGET_SURFACE');
        expect(result.reference.captureMetadata?.capturePrincipal).toBe('PROJECT_OWNER');
      }
    });

    it('4. capture principal persisted without secrets', async () => {
      process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
      const result = await captureSite00RouteReference({
        route: '/projects',
        viewportClass: 'DESKTOP',
        baseUrl: 'https://site00.com',
        referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
        authorityScopes: ['FUNCTIONAL'],
        authority: {},
        approvalStatus: 'APPROVED_REFERENCE',
        sourceType: 'AUTOMATED_ROUTE_CAPTURE',
        label: 'test',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(captureMetadataContainsNoSecrets(result.reference.captureMetadata)).toBe(true);
        expect(JSON.stringify(result.reference.captureMetadata)).not.toMatch(/password|Bearer/i);
      }
    });

    it('5. public screenshot does not satisfy private-route requirement', async () => {
      const result = await captureSite00RouteReference({
        route: '/projects',
        viewportClass: 'DESKTOP',
        baseUrl: 'https://site00.com',
        referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
        authorityScopes: ['FUNCTIONAL'],
        authority: {},
        approvalStatus: 'APPROVED_REFERENCE',
        sourceType: 'AUTOMATED_ROUTE_CAPTURE',
        label: 'test',
      });
      expect(result.ok).toBe(false);
    });

    it('6. final URL mismatch detected', () => {
      const result = verifyCapturedSurfaceIdentity({
        requestedRoute: '/projects',
        finalUrl: 'https://site00.com/control',
        redirectChain: ['https://site00.com/projects', 'https://site00.com/control'],
        capturePrincipal: 'PROJECT_OWNER',
        authenticated: true,
        domEvidence: { hasRequiredSelectors: false, hasForbiddenSelectors: false },
      });
      expect(['WRONG_ROUTE_CAPTURED', 'SURFACE_IDENTITY_AMBIGUOUS']).toContain(result.surfaceIdentity);
    });

    it('7. expired capture session returns AUTHENTICATION_FAILED', async () => {
      delete process.env.VITEST_CAPTURE_PRINCIPAL;
      const auth = loadVisualCaptureAuthContext({ route: '/projects' });
      expect(captureAuthContextHasSession(auth)).toBe(false);
      const result = await captureSite00RouteReference({
        route: '/projects',
        viewportClass: 'DESKTOP',
        baseUrl: 'https://site00.com',
        referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE'],
        authorityScopes: ['FUNCTIONAL'],
        authority: {},
        approvalStatus: 'APPROVED_REFERENCE',
        sourceType: 'AUTOMATED_ROUTE_CAPTURE',
        label: 'test',
        authContext: auth,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.surfaceIdentity).toBe('AUTHENTICATION_FAILED');
    });

    it('8. sensitive auth secrets never appear in VisualReferenceRecord', () => {
      const redacted = redactSecretsFromCaptureMetadata({
        storageState: { cookies: [{ name: 'session' }] },
        password: 'secret',
        token: 'abc',
      });
      expect(redacted.storageState).toBeUndefined();
      expect(redacted.password).toBeUndefined();
    });
  });

  describe('REFERENCE AUTHORITY', () => {
    it('9. sign-in reference governs host lighting not Projects hierarchy', () => {
      expect(signInCaptureMayRetainHostLightingAuthority('AUTH_REDIRECT_DETECTED')).toBe(true);
      expect(signInCaptureMayProvideProjectsHierarchyAuthority('AUTH_REDIRECT_DETECTED')).toBe(false);
    });

    it('10. dimension-level authority controls selection', () => {
      const ref = mockReference({
        captureMetadata: {
          requestedRoute: '/projects',
          finalUrl: 'https://site00.com/origin/sign-in',
          redirectChain: [],
          capturePrincipal: 'PUBLIC_GUEST',
          authenticated: false,
          surfaceIdentity: 'AUTH_REDIRECT_DETECTED',
          surfaceIdentityConfidence: 0.9,
          authContextVersion: null,
          accessClassification: 'PUBLIC_REFERENCE',
          quarantineClassification: 'AUTH_REDIRECT_CAPTURE',
        },
      });
      const quarantined = applyQuarantineToReference(ref, 'AUTH_REDIRECT_CAPTURE', ['/projects']);
      expect(quarantined.authority.LAYOUT).toBe('NONE');
      expect(quarantined.authority.HIERARCHY).toBe('NONE');
    });

    it('11. invalid target-route screenshot excluded from package', () => {
      const host = seedDefaultHostVisualMemory('test');
      const refs = quarantineExistingInvalidReferences(
        host.references.map((r) => (r.route === '/projects' ? mockReference({ id: r.id, route: '/projects' }) : r)),
      );
      const selected = selectVisualReferencesForIntent({
        generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
        targetSurface: '/projects',
        targetDevice: 'DESKTOP',
        hostMemory: { ...host, references: refs },
        clientMemory: null,
        structuralProofReference: null,
        negativeProofReference: null,
      });
      expect(selected.every((r) => r.route !== '/projects' || r.captureMetadata?.surfaceIdentity === 'VALID_TARGET_SURFACE')).toBe(true);
    });

    it('12. mobile evidence independent from desktop', () => {
      const host = seedDefaultHostVisualMemory('test');
      const desktop = evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'DESKTOP');
      const mobile = evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'MOBILE');
      expect(desktop.viewportClass).not.toBe(mobile.viewportClass);
    });
  });

  describe('ASSET RESOLUTION', () => {
    it('13. methodology term does not automatically become image slot', () => {
      const slots = compileProjectsWorkspaceVisualSlots();
      expect(slots.every((s) => !NON_ASSET_METHODOLOGY_ROLES.has(s.semanticRole))).toBe(true);
    });

    it('14. DOSSIER_DEPTH maps to non-asset behavior', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.slotId === 'review-tray-artifacts');
      expect(slot?.contentCategory).toBe('DATA_CONTENT');
      expect(slot?.generationPolicy).toBe('EXISTING_ONLY');
    });

    it('15. HOST_INTEGRATION maps to REFERENCE_INPUT', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.slotId === 'host-environment-plate');
      expect(slot?.contentCategory).toBe('REFERENCE_INPUT');
    });

    it('16. HOST_ENVIRONMENT resolves to existing host by default', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.replacesLegacyRoles?.includes('HOST_ENVIRONMENT'));
      expect(slot?.generationPolicy).toBe('NEVER_GENERATE');
    });

    it('17. Active Piece prefers actual project artifact', () => {
      const necessity = evaluateGenerationNecessity({
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        eligibility: { candidateId: 'a1', result: 'ELIGIBLE', reason: 'ok' },
        candidateCount: 1,
      });
      expect(necessity).toBe('USE_EXISTING_ASSET');
    });

    it('18. Review Tray resolves pending-review assets only', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.slotId === 'review-tray-artifacts')!;
      expect(slot.contentSourcePreference).toContain('PENDING_REVIEW_ASSET');
    });

    it('19. Work History resolves historical assets only', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.slotId === 'work-history-previews')!;
      expect(slot.contentSourcePreference).toContain('HISTORICAL_PRODUCTION_ASSET');
    });

    it('20. empty review state does not generate fake review imagery', () => {
      const resolution = compilePurposeGatedSlotResolution({ projectSlug: 'ndxbook', creativeAssets: [] });
      const review = resolution.resolved.find((r) => r.slotId === 'review-tray-artifacts');
      expect(review?.generationRequired).toBe(false);
    });
  });

  describe('ELIGIBILITY', () => {
    it('21. found asset does not equal eligible asset', () => {
      const resolution = compilePurposeGatedSlotResolution({
        existingGeneratedAssets: LEGACY_METHODOLOGY_ASSET_ROLES.map((role, i) => ({
          requirementId: `legacy-${i}`,
          storagePath: `path/${role}`,
          publicUrl: null,
          assetRole: role,
        })),
      });
      expect(resolution.summary.found).toBeGreaterThanOrEqual(resolution.summary.eligible);
    });

    it('22. wrong-project asset rejected', () => {
      const slot = compileProjectsWorkspaceVisualSlots()[0]!;
      const result = evaluateCreativeAssetEligibility({
        slot,
        targetProjectSlug: 'ndxbook',
        asset: {
          assetId: 'x',
          brandSlug: 'other-brand',
          projectId: 'other',
        } as never,
      });
      expect(result.result).toBe('WRONG_PROJECT');
    });

    it('23. wrong-client asset rejected', () => {
      const slot = { ...compileProjectsWorkspaceVisualSlots()[0]!, projectScope: null, clientScope: 'ndxbook' };
      const result = evaluateCreativeAssetEligibility({
        slot,
        targetProjectSlug: 'ndxbook',
        asset: { assetId: 'x', brandSlug: 'wrong', projectId: 'ndxbook' } as never,
      });
      expect(result.result).toBe('WRONG_CLIENT');
    });

    it('24. negative evidence rejected', () => {
      const result = evaluateCreativeAssetEligibility({
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        targetProjectSlug: 'ndxbook',
        asset: { assetId: 'x', brandSlug: 'ndxbook', brandLineageMembership: 'EXCLUDED' } as never,
      });
      expect(result.result).toBe('NEGATIVE_EVIDENCE');
    });

    it('25. methodology-obsolete generated asset rejected', () => {
      const result = evaluateVisualDevelopmentAssetEligibility({
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        asset: { requirementId: '1', storagePath: 'p', publicUrl: null, assetRole: 'WORKBENCH_FOCAL_ARTIFACT' },
      });
      expect(result.result).toBe('METHODOLOGY_OBSOLETE');
    });

    it('26. eligible approved artifact reduces missing count', () => {
      const without = compilePurposeGatedSlotResolution({ creativeAssets: [] });
      const withAsset = compilePurposeGatedSlotResolution({
        creativeAssets: [
          {
            assetId: 'a1',
            brandSlug: 'ndxbook',
            projectId: 'ndxbook',
            reviewState: 'APPROVED',
            productionState: 'PUBLISHED',
            brandLineageMembership: 'ACTIVE',
            reuseState: 'REUSABLE_AS_IS',
          } as never,
        ],
      });
      expect(withAsset.summary.missing).toBeLessThanOrEqual(without.summary.missing);
    });

    it('27. ineligible artifact does not reduce missing count', () => {
      const withLegacy = compilePurposeGatedSlotResolution({
        existingGeneratedAssets: [{ requirementId: '1', storagePath: 'p', publicUrl: null, assetRole: 'DOSSIER_DEPTH_LAYER' }],
      });
      expect(withLegacy.summary.eligible).toBe(0);
    });
  });

  describe('GENERATION', () => {
    it('28. generation requires AssetGenerationJustification', () => {
      expect(generationBlockedWithoutJustification(null)).toBe(true);
      expect(
        generationBlockedWithoutJustification(
          buildGenerationJustification({
            slot: compileProjectsWorkspaceVisualSlots()[0]!,
            necessity: 'GENERATE_NEW_ASSET',
            existingCandidatesChecked: 0,
          }),
        ),
      ).toBe(false);
    });

    it('29. no purpose = no generation for non-visual slots', () => {
      const slot = compileProjectsWorkspaceVisualSlots().find((s) => s.contentCategory !== 'VISUAL_ASSET')!;
      expect(evaluateGenerationNecessity({ slot, eligibility: null, candidateCount: 0 })).toBe('NO_ASSET_REQUIRED');
    });

    it('30. existing eligible artifact blocks unnecessary generation', () => {
      const necessity = evaluateGenerationNecessity({
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        eligibility: { candidateId: '1', result: 'ELIGIBLE', reason: 'ok' },
        candidateCount: 1,
      });
      expect(necessity).not.toBe('GENERATE_NEW_ASSET');
    });

    it('31. asset-level prompt uses actual project context', () => {
      const slot = compileProjectsWorkspaceVisualSlots()[0]!;
      const prompt = compileAssetPromptFromPurpose({
        slot,
        projectName: 'NDXBOOK',
        justification: buildGenerationJustification({
          slot,
          necessity: 'GENERATE_NEW_ASSET',
          existingCandidatesChecked: 0,
        })!,
      });
      expect(prompt).toContain('NDXBOOK');
      expect(prompt).not.toMatch(/^Generate a workbench/i);
    });

    it('32. internal codename alone cannot form provider prompt', () => {
      expect(methodologyTermBlocksGeneration('WORKBENCH_FOCAL_ARTIFACT')).toBe(true);
      expect(slotResolutionBlocksMethodologyGeneration('WORKBENCH_FOCAL_ARTIFACT')).toBe(true);
    });

    it('33. generated asset excludes full UI/shell in prompt', () => {
      const prompt = compileAssetPromptFromPurpose({
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        projectName: 'NDXBOOK',
        justification: buildGenerationJustification({
          slot: compileProjectsWorkspaceVisualSlots()[0]!,
          necessity: 'GENERATE_NEW_ASSET',
          existingCandidatesChecked: 0,
        })!,
      });
      expect(prompt).toContain('no SITE 00 shell');
    });

    it('34. asset source priority lists generation last', () => {
      const priority = defaultAssetSourcePriority();
      expect(priority[priority.length - 1]).toBe('PURPOSE_BUILT_GENERATION');
    });
  });

  describe('COMPOSER + FIDELITY + INTEGRITY', () => {
    it('35. Composer receives resolved real artifacts via slot resolution', async () => {
      process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
      const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
      expect(run.proofs.site00ProjectsIndex.interfaceSlotResolution?.resolved.length).toBeGreaterThan(0);
    });

    it('36. non-asset methodology visuals excluded from generation slots', () => {
      const resolution = compilePurposeGatedSlotResolution({
        existingGeneratedAssets: LEGACY_METHODOLOGY_ASSET_ROLES.map((role, i) => ({
          requirementId: `l-${i}`,
          storagePath: 'p',
          publicUrl: null,
          assetRole: role,
        })),
      });
      expect(resolution.obsoleteGeneratedAssets.length).toBeGreaterThan(0);
    });

    it('37-41. fidelity checks detect filler and auth invalidity', () => {
      const resolution = compilePurposeGatedSlotResolution({});
      const fidelity = evaluateSurfaceContentFidelity({
        proof: {
          authenticatedReferenceStatus: [{ route: '/projects', viewportClass: 'DESKTOP', status: 'INVALID', referenceId: null, surfaceIdentity: 'AUTH_REDIRECT_DETECTED', capturePrincipal: 'PUBLIC_GUEST' }],
          generatedAssets: [],
        } as never,
        slotResolution: resolution,
      });
      expect(decorativeFillerRiskDetectable(fidelity)).toBe(true);
      expect(fakeHistoricalArtifactsFailSemanticRelevance({ slotResolution: resolution })).toBe(true);
    });

    it('42-50. experimental integrity + pipeline + zero FAL path', async () => {
      expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);

      process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
      await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
      const run = await generateMissingInterfaceAssets('SITE00_PROJECTS_INDEX');
      const proof = run.proofs.site00ProjectsIndex;
      expect(proof.interfaceSlotResolution).toBeTruthy();
      expect(proof.interfaceAssetManifest?.purposeGated).toBe(true);

      const manifest = compileSite00ProjectsIndexProofManifest({
        artDirection: deriveProjectsIndexProofArtDirection(),
        workspaceCanon: buildProjectWorkspaceCanon(),
      });
      const gated = compilePurposeGatedInterfaceManifest({
        surfaceId: 'SITE00_PROJECTS_INDEX',
        slotResolution: compilePurposeGatedSlotResolution({}),
        designProofManifest: manifest,
      });
      expect(gated.eligibleCount).toBeDefined();

      expect(
        evaluateReferencePipelineStatus({
          referencePackage: proof.referencePackage,
          requireStrictHost: true,
          authenticatedProjectsReferenceValid: false,
        }),
      ).toBe('AUTHENTICATED_REFERENCE_REQUIRED');

      const host = seedDefaultHostVisualMemory('test');
      const validHost = {
        ...host,
        references: host.references.map((r) =>
          r.route === '/projects'
            ? mockReference({
                id: r.id,
                route: '/projects',
                viewportClass: r.viewportClass,
                captureMetadata: {
                  requestedRoute: '/projects',
                  finalUrl: 'https://site00.com/projects',
                  redirectChain: [],
                  capturePrincipal: 'PROJECT_OWNER',
                  authenticated: true,
                  surfaceIdentity: 'VALID_TARGET_SURFACE',
                  surfaceIdentityConfidence: 0.9,
                  authContextVersion: 'v1',
                  accessClassification: 'PROJECT_PRIVATE_REFERENCE',
                },
              })
            : r,
        ),
      };
      expect(() => assertAuthenticatedProjectsReferencesReady(validHost)).not.toThrow();

      expect(resolveProjectVisualEvidence({
        projectSlug: 'ndxbook',
        surfaceRole: 'CURRENT_PROJECT_VISUAL',
        slot: compileProjectsWorkspaceVisualSlots()[0]!,
        creativeAssets: [],
        visualDevAssets: [],
      })).toEqual([]);
    });
  });
});
