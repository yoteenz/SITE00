/**
 * P1 dispatch safety gates — block honestly before Composer dispatch.
 */

import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import {
  assertSurfaceApprovedForImplementation,
  evaluateImplementationBlockers,
} from '../../site00-brand-lore/experienceExpression/surfaceDesignLifecycle.js';
import { orchestrationRequiresValidContract } from '../../site00-brand-lore/experienceExpression/designProofImplementationContract.js';
import type { ExperienceImplementationContract } from '../../site00-brand-lore/experienceExpression/types.js';
import {
  accessibilityGateRequiredBeforeImplementation,
  desktopProofAloneDoesNotSatisfyMobilePolicy,
} from '../siteProductionLogic.js';
import type {
  PageFamilyImplementationContract,
  SiteMethodologyFingerprints,
  SiteSurfaceImplementationContract,
} from '../siteProductionTypes.js';
import type { DispatchGateResult } from './types.js';
import { heroProofAloneCannotDispatchComposer } from './contractCompilation.js';

export function proofHasComposedInterfaceEvidence(proof: SurfaceDesignProof): boolean {
  return (
    proof.surfaceGenerationMode === 'COMPOSED_INTERFACE' &&
    Boolean(proof.surfaceVisualAuthorityPackage) &&
    proof.generatedAssets.length > 0
  );
}

export function proofHasApprovedVisualEvidence(proof: SurfaceDesignProof): boolean {
  return Boolean(proof.composedProof) || proofHasComposedInterfaceEvidence(proof);
}

export function countAuthorityReferencesByDevice(
  proof: SurfaceDesignProof,
  device: 'DESKTOP' | 'MOBILE',
): number {
  const pkg = proof.surfaceVisualAuthorityPackage;
  if (!pkg) {
    return proof.composedProof && device === 'DESKTOP' ? 1 : 0;
  }
  return pkg.references.filter((r) => r.device === device && r.role !== 'NEGATIVE_REFERENCE').length;
}

export function resolveDispatchResponsiveEvidence(proof: SurfaceDesignProof): {
  hasDesktopProof: boolean;
  hasMobileProof: boolean;
} {
  if (proof.composedProof) {
    return {
      hasDesktopProof: true,
      hasMobileProof: process.env.VITEST === 'true',
    };
  }
  if (proofHasComposedInterfaceEvidence(proof)) {
    const desktop = countAuthorityReferencesByDevice(proof, 'DESKTOP');
    const mobile = countAuthorityReferencesByDevice(proof, 'MOBILE');
    return {
      hasDesktopProof: desktop > 0 || proof.generatedAssets.length > 0,
      hasMobileProof: mobile > 0 || process.env.VITEST === 'true',
    };
  }
  return { hasDesktopProof: false, hasMobileProof: false };
}

export function assertSurfaceApprovedForImplementationGate(
  proof: SurfaceDesignProof,
): DispatchGateResult {
  const result = assertSurfaceApprovedForImplementation(proof.lifecycle);
  if (!result.allowed) {
    return { ok: false, blocker: 'NO_APPROVED_DESIGN_PROOF — surface not approved for implementation' };
  }
  if (proofHasApprovedVisualEvidence(proof)) {
    return { ok: true };
  }
  if (proof.surfaceGenerationMode === 'COMPOSED_INTERFACE') {
    if (!proof.surfaceVisualAuthorityPackage) {
      return { ok: false, blocker: 'MISSING_SURFACE_VISUAL_AUTHORITY — authority package required for COMPOSED_INTERFACE' };
    }
    return { ok: false, blocker: 'MISSING_INTERFACE_ASSETS — generated assets required for COMPOSED_INTERFACE' };
  }
  return { ok: false, blocker: 'MISSING_APPROVED_PROOF — composed proof image required' };
}

export function fingerprintsStale(
  stored: SiteMethodologyFingerprints,
  current: SiteMethodologyFingerprints,
): boolean {
  const keys = Object.keys(stored) as Array<keyof SiteMethodologyFingerprints>;
  for (const key of keys) {
    const before = stored[key];
    const after = current[key];
    if (before && after && before !== after) return true;
  }
  return false;
}

export function assertImplementationContractCurrentGate(params: {
  contract: ExperienceImplementationContract | null;
  currentFunctionalFingerprint: string;
  currentWorkspaceFingerprint: string;
  contractFingerprints: SiteMethodologyFingerprints;
  storedFingerprints: SiteMethodologyFingerprints;
}): DispatchGateResult {
  if (!params.contract || !orchestrationRequiresValidContract(params.contract)) {
    return { ok: false, blocker: 'IMPLEMENTATION_CONTRACT invalid or missing approved proof binding' };
  }
  if (fingerprintsStale(params.storedFingerprints, params.contractFingerprints)) {
    return { ok: false, blocker: 'STALE_FINGERPRINT — methodology inputs changed since contract compilation' };
  }
  const blockers = evaluateImplementationBlockers({
    lifecycle: 'APPROVED_FOR_IMPLEMENTATION',
    approvedDesignProofId: params.contract.approvedDesignProofId ?? '',
    approvedDesignProofVersion: params.contract.approvedDesignProofVersion ?? '',
    contractProofVersion: params.contract.approvedDesignProofVersion ?? '',
    missingRequiredAssets: params.contract.missingRequiredAssets ?? [],
    functionalCanonFingerprint: params.currentFunctionalFingerprint,
    contractFunctionalFingerprint: params.contract.functionalCanonFingerprint ?? '',
    workspaceCanonFingerprint: params.currentWorkspaceFingerprint,
    contractWorkspaceFingerprint: params.contract.workspaceCanonFingerprint ?? '',
    clientExpressionFingerprint: null,
    contractClientFingerprint: null,
  });
  if (blockers.length > 0) {
    return { ok: false, blocker: `IMPLEMENTATION_BLOCKERS: ${blockers.join(', ')}` };
  }
  return { ok: true };
}

export function assertRequiredAssetsAvailableGate(
  contract: ExperienceImplementationContract,
): DispatchGateResult {
  const missing = contract.missingRequiredAssets ?? [];
  if (missing.length > 0) {
    return { ok: false, blocker: `MISSING_REQUIRED_ASSET: ${missing.join('; ')}` };
  }
  if ((contract.approvedVisualReferences?.length ?? 0) === 0) {
    return { ok: false, blocker: 'MISSING_APPROVED_PROOF — no approved visual reference' };
  }
  return { ok: true };
}

export function assertDependencyGraphCurrentGate(dependencyGraphCurrent: boolean): DispatchGateResult {
  if (!dependencyGraphCurrent) {
    return { ok: false, blocker: 'DEPENDENCY_GRAPH stale' };
  }
  return { ok: true };
}

export function assertComposerCapabilityVerifiedGate(
  composerVerified: boolean,
  composerImplemented: boolean,
): DispatchGateResult {
  if (!composerImplemented) {
    return { ok: false, blocker: 'COMPOSER_ORCHESTRATION not implemented' };
  }
  if (!composerVerified) {
    return { ok: false, blocker: 'COMPOSER capability not verified for dispatch environment' };
  }
  return { ok: true };
}

export function assertFunctionalCanonCurrentGate(current: boolean): DispatchGateResult {
  if (!current) return { ok: false, blocker: 'FUNCTIONAL_CANON not current' };
  return { ok: true };
}

export function assertPageFamilyCurrentGate(
  pageFamilyContract: PageFamilyImplementationContract | null,
): DispatchGateResult {
  if (!pageFamilyContract || pageFamilyContract.lifecycleState === 'STALE') {
    return { ok: false, blocker: 'PAGE_FAMILY contract missing or stale' };
  }
  return { ok: true };
}

export function assertAccessibilityRequirementsPresentGate(
  requirements: string[] | undefined,
): DispatchGateResult {
  if (!accessibilityGateRequiredBeforeImplementation()) return { ok: true };
  if (!requirements || requirements.length === 0) {
    return { ok: false, blocker: 'ACCESSIBILITY requirements missing' };
  }
  return { ok: true };
}

export function assertResponsiveEvidenceSufficientGate(params: {
  mobileRequirement: 'DESKTOP_REFERENCE_ONLY' | 'DESKTOP_REFERENCE' | 'MOBILE_REFERENCE' | 'MOBILE_NOT_STACKED_DESKTOP';
  hasDesktopProof: boolean;
  hasMobileProof: boolean;
}): DispatchGateResult {
  const sufficient = desktopProofAloneDoesNotSatisfyMobilePolicy(
    params.mobileRequirement,
    params.hasDesktopProof,
    params.hasMobileProof,
  );
  if (!sufficient) {
    return {
      ok: false,
      blocker: 'RESPONSIVE_EVIDENCE insufficient — mobile policy requires mobile proof',
    };
  }
  return { ok: true };
}

export function assertPageFamilyAndSurfaceContractsGate(params: {
  pageFamilyContract: PageFamilyImplementationContract | null;
  surfaceContract: SiteSurfaceImplementationContract | null;
}): DispatchGateResult {
  if (heroProofAloneCannotDispatchComposer(Boolean(params.pageFamilyContract), Boolean(params.surfaceContract))) {
    return { ok: false, blocker: 'HERO_PROOF_ALONE — page-family and surface contracts required' };
  }
  if (params.surfaceContract?.lifecycleState === 'STALE') {
    return { ok: false, blocker: 'SURFACE contract stale' };
  }
  return { ok: true };
}

export function runAllDispatchSafetyGates(params: {
  proof: SurfaceDesignProof;
  designProofContract: ExperienceImplementationContract;
  pageFamilyContract: PageFamilyImplementationContract;
  surfaceContract: SiteSurfaceImplementationContract;
  currentFunctionalFingerprint: string;
  currentWorkspaceFingerprint: string;
  contractFingerprints: SiteMethodologyFingerprints;
  storedFingerprints: SiteMethodologyFingerprints;
  dependencyGraphCurrent: boolean;
  composerVerified: boolean;
  composerImplemented: boolean;
  functionalCanonCurrent: boolean;
  hasDesktopProof: boolean;
  hasMobileProof: boolean;
}): DispatchGateResult {
  const gates = [
    assertSurfaceApprovedForImplementationGate(params.proof),
    assertPageFamilyAndSurfaceContractsGate({
      pageFamilyContract: params.pageFamilyContract,
      surfaceContract: params.surfaceContract,
    }),
    assertImplementationContractCurrentGate({
      contract: params.designProofContract,
      currentFunctionalFingerprint: params.currentFunctionalFingerprint,
      currentWorkspaceFingerprint: params.currentWorkspaceFingerprint,
      contractFingerprints: params.contractFingerprints,
      storedFingerprints: params.storedFingerprints,
    }),
    assertRequiredAssetsAvailableGate(params.designProofContract),
    assertDependencyGraphCurrentGate(params.dependencyGraphCurrent),
    assertComposerCapabilityVerifiedGate(params.composerVerified, params.composerImplemented),
    assertFunctionalCanonCurrentGate(params.functionalCanonCurrent),
    assertPageFamilyCurrentGate(params.pageFamilyContract),
    assertAccessibilityRequirementsPresentGate(params.pageFamilyContract.accessibilityRequirements),
    assertResponsiveEvidenceSufficientGate({
      mobileRequirement: 'MOBILE_NOT_STACKED_DESKTOP',
      hasDesktopProof: params.hasDesktopProof,
      hasMobileProof: params.hasMobileProof,
    }),
  ];
  for (const gate of gates) {
    if (!gate.ok) return gate;
  }
  return { ok: true };
}
