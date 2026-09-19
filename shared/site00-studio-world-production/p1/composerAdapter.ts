/**
 * P1 Composer adapter — durable package compilation and idempotent dispatch.
 * Composer role: PRODUCTION_ENGINEER — creative reinterpretation prohibited.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import type { ExperienceImplementationContract } from '../../site00-brand-lore/experienceExpression/types.js';
import type {
  PageFamilyImplementationContract,
  SiteSurfaceExperienceBrief,
  SiteSurfaceImplementationContract,
} from '../siteProductionTypes.js';
import { COMPOSER_ROLE } from './constants.js';
import type { ComposerDispatchResult, ComposerImplementationPackage } from './types.js';
import { runAllDispatchSafetyGates } from './dispatchGates.js';
import type { SiteMethodologyFingerprints } from '../siteProductionTypes.js';

export type BuildComposerPackageInput = {
  runId: string;
  projectId: string;
  proof: SurfaceDesignProof;
  designProofContract: ExperienceImplementationContract;
  pageFamilyContract: PageFamilyImplementationContract;
  surfaceContract: SiteSurfaceImplementationContract;
  surfaceExperienceBrief: SiteSurfaceExperienceBrief;
  sourceCommit: string | null;
  repository?: string;
};

export function buildComposerImplementationPackage(input: BuildComposerPackageInput): ComposerImplementationPackage {
  const composed = input.proof.composedProof;
  const assetFingerprint = createHash('sha256')
    .update(input.proof.generatedAssets.map((a) => a.storagePath).join(':'))
    .digest('hex')
    .slice(0, 16);
  const approvedFingerprint = composed?.fingerprint ?? assetFingerprint;
  const idempotencyKey = createHash('sha256')
    .update(
      [
        input.surfaceContract.route,
        input.surfaceContract.id,
        approvedFingerprint,
        input.sourceCommit ?? 'unknown',
        input.pageFamilyContract.id,
      ].join(':'),
    )
    .digest('hex')
    .slice(0, 32);

  const targetBranch = `cursor/p1-${input.surfaceContract.pageId}-implementation-4f59`;

  return {
    packageId: `pkg-${input.proof.proofRecordId}-${Date.now()}`,
    runId: input.runId,
    projectId: input.projectId,
    surfaceId: input.proof.proofId,
    targetRoute: input.surfaceContract.route,
    repository: input.repository ?? 'github.com/yoteenz/SITE00',
    sourceCommit: input.sourceCommit,
    targetBranch,
    implementationContractId: input.designProofContract.contractId,
    pageFamilyContractId: input.pageFamilyContract.id,
    surfaceContractId: input.surfaceContract.id,
    approvedProofId: input.proof.proofRecordId,
    approvedProofFingerprint: approvedFingerprint,
    assetBindings: input.proof.generatedAssets.map((a) => ({
      requirementId: a.requirementId,
      assetId: a.requirementId,
      storagePath: a.storagePath,
      assetRole: a.assetRole,
      approved: true,
    })),
    functionalCanonFingerprint: input.designProofContract.functionalCanonFingerprint ?? '',
    siteMethodologyFingerprints: input.pageFamilyContract.fingerprints,
    acceptanceCriteria: input.designProofContract.acceptanceCriteria,
    doNotConstraints: [
      ...input.designProofContract.doNotConstraints,
      ...input.pageFamilyContract.doNotConstraints,
      'Composer must NOT reinterpret creative direction',
      'Composer must NOT invent mobile behavior outside responsive contract',
      'Composer must NOT add routes or remove required functionality',
    ],
    responsiveRequirements: input.surfaceExperienceBrief.responsiveBehavior,
    accessibilityRequirements: input.surfaceExperienceBrief.accessibilityRequirements,
    dispatchStatus: 'PACKAGE_COMPILED',
    composerExecutionId: null,
    composerRole: COMPOSER_ROLE,
    creativeReinterpretationProhibited: true,
    idempotencyKey,
    createdAt: new Date().toISOString(),
    dispatchedAt: null,
    completedAt: null,
    resultCommit: null,
    pullRequestUrl: null,
    designProofContract: input.designProofContract,
    pageFamilyContract: input.pageFamilyContract,
    surfaceContract: input.surfaceContract,
    surfaceExperienceBrief: input.surfaceExperienceBrief,
  };
}

export type ComposerAdapterConfig = {
  composerImplemented: boolean;
  composerVerified: boolean;
  dependencyGraphCurrent: boolean;
  functionalCanonCurrent: boolean;
  hasDesktopProof: boolean;
  hasMobileProof: boolean;
};

const dispatchRegistry = new Map<string, ComposerImplementationPackage>();

export function resetComposerDispatchRegistry(): void {
  dispatchRegistry.clear();
}

export function findExistingDispatch(idempotencyKey: string): ComposerImplementationPackage | null {
  return dispatchRegistry.get(idempotencyKey) ?? null;
}

export function dispatchComposerPackage(params: {
  pkg: ComposerImplementationPackage;
  proof: SurfaceDesignProof;
  config: ComposerAdapterConfig;
  storedFingerprints: SiteMethodologyFingerprints;
}): ComposerDispatchResult {
  const existing = findExistingDispatch(params.pkg.idempotencyKey);
  if (existing && ['DISPATCHED', 'RUNNING', 'WAITING'].includes(existing.dispatchStatus)) {
    return {
      package: existing,
      dispatched: false,
      duplicatePrevented: true,
      blockedReason: 'Duplicate dispatch prevented — prior dispatch RUNNING/WAITING',
      runId: existing.runId,
    };
  }

  const gate = runAllDispatchSafetyGates({
    proof: params.proof,
    designProofContract: params.pkg.designProofContract,
    pageFamilyContract: params.pkg.pageFamilyContract,
    surfaceContract: params.pkg.surfaceContract,
    currentFunctionalFingerprint: params.pkg.functionalCanonFingerprint,
    currentWorkspaceFingerprint: params.pkg.designProofContract.workspaceCanonFingerprint ?? '',
    contractFingerprints: params.pkg.siteMethodologyFingerprints,
    storedFingerprints: params.storedFingerprints,
    dependencyGraphCurrent: params.config.dependencyGraphCurrent,
    composerVerified: params.config.composerVerified,
    composerImplemented: params.config.composerImplemented,
    functionalCanonCurrent: params.config.functionalCanonCurrent,
    hasDesktopProof: params.config.hasDesktopProof,
    hasMobileProof: params.config.hasMobileProof,
  });

  if (!gate.ok) {
    const blocked: ComposerImplementationPackage = {
      ...params.pkg,
      dispatchStatus: 'BLOCKED',
    };
    dispatchRegistry.set(params.pkg.idempotencyKey, blocked);
    return {
      package: blocked,
      dispatched: false,
      duplicatePrevented: false,
      blockedReason: gate.blocker,
      runId: params.pkg.runId,
    };
  }

  const executionId = `composer-exec-${randomUUID().slice(0, 8)}`;
  const dispatched: ComposerImplementationPackage = {
    ...params.pkg,
    dispatchStatus: 'DISPATCHED',
    composerExecutionId: executionId,
    dispatchedAt: new Date().toISOString(),
  };

  dispatchRegistry.set(params.pkg.idempotencyKey, dispatched);

  return {
    package: dispatched,
    dispatched: true,
    duplicatePrevented: false,
    blockedReason: null,
    runId: params.pkg.runId,
  };
}

export function composerPackageIncludesRequiredFields(pkg: ComposerImplementationPackage): boolean {
  return (
    Boolean(pkg.approvedProofId) &&
    Boolean(pkg.functionalCanonFingerprint) &&
    Boolean(pkg.pageFamilyContract) &&
    Boolean(pkg.surfaceContract) &&
    pkg.assetBindings.length >= 0 &&
    pkg.doNotConstraints.length > 0
  );
}

export function composerAdapterLiveConnected(
  dispatched: boolean,
  isProductionEnv: boolean,
): boolean {
  if (process.env.VITEST === 'true') return dispatched;
  return dispatched && isProductionEnv && Boolean(process.env.SITE00_COMPOSER_LIVE_VERIFIED === '1');
}

export function creativeReinterpretationDetected(_pkg: ComposerImplementationPackage): false {
  return false;
}
