/**
 * Project Workspace visual development service — design proofs before production implementation.
 */

import { createHash } from 'node:crypto';
import { buildProjectWorkspaceCanon } from '../../../../../shared/site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import {
  compileNdxbookClientExpressionProfile,
} from '../../../../../shared/site00-brand-lore/projectWorkspace/clientProjectExpressionProfile.js';
import {
  compileSite00ProjectsIndexProofManifest,
  compileNdxbookProjectHomeProofManifest,
} from '../../../../../shared/site00-brand-lore/experienceExpression/designProofManifest.js';
import {
  deriveProjectsIndexProofArtDirection,
  deriveNdxbookProjectHomeProofArtDirection,
  buildDesignProofArtDirectionContext,
} from '../../../../../shared/site00-brand-lore/experienceExpression/designProofArtDirection.js';
import {
  evaluateDesignProofQA,
  mapFounderJudgmentToLifecycle,
} from '../../../../../shared/site00-brand-lore/experienceExpression/designProofQA.js';
import type {
  ProjectWorkspaceVisualDevelopmentRun,
  SurfaceDesignProof,
} from '../../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';
import type { ExperienceSurfaceDesignLifecycleState } from '../../../../../shared/site00-brand-lore/experienceExpression/surfaceDesignLifecycle.js';
import {
  assertSurfaceApprovedForImplementation,
  productionPresentationMutationBlocked,
} from '../../../../../shared/site00-brand-lore/experienceExpression/surfaceDesignLifecycle.js';
import {
  composeDesignProofViaFal,
  generateDesignProofAssetViaFal,
  EXPERIENCE_FAL_MODEL,
  EXPERIENCE_FAL_PROVIDER,
} from '../../../../../shared/site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import { compileDesignProofImplementationContract } from '../../../../../shared/site00-brand-lore/experienceExpression/designProofImplementationContract.js';
import { extractSite00ProjectsIndexFunctionalCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/projectsIndexFunctionalCanon.js';
import { extractNdxbookFunctionalCanon } from '../../../../../shared/site00-brand-lore/experienceExpression/functionalCanon.js';
import { getBrandLoreProfileForOrg } from '../../../site00BrandLore/loreService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import {
  classifyExistingProofAsStructuralReference,
  compileReferencePackageForIntent,
  initializeVisualReferenceMemory,
  refreshVisualReferences,
  resetVisualReferenceServiceMemory,
  assertReferencePackageReadyForFal,
  quarantineAndPersistHostVisualMemory,
} from '../../../site00VisualReference/visualReferenceService.js';
import { hydrateVisualReferencePackage } from '../../../site00VisualReference/referenceUrlResolver.js';
import { evaluateReferenceAdherence } from '../../../../../shared/site00-visual-reference/referenceAdherenceQA.js';
import type { VisualReferencePackage } from '../../../../../shared/site00-visual-reference/types.js';
import {
  assertFullPageGenerationAllowed,
  assertReferencePipelineReady,
  buildVisualGenerationExecutionTrace,
  classifySurfaceGenerationMode,
  compileInterfaceAssetManifest,
  compilePurposeGatedInterfaceManifest,
  compilePurposeGatedSlotResolution,
  compileSurfaceVisualAuthorityPackage,
  evaluateReferencePipelineStatus,
  FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE,
  slotResolutionBlocksMethodologyGeneration,
  compileAssetPromptFromPurpose,
} from '../../../../../shared/site00-studio-world-production/p1/generationBoundary/index.js';
import {
  assertAuthenticatedProjectsReferencesReady,
  evaluateAuthenticatedReferenceForRoute,
} from '../../../../../shared/site00-visual-reference/authenticatedReferencePrecondition.js';
import { quarantineExistingInvalidReferences } from '../../../../../shared/site00-visual-reference/referenceQuarantine.js';
import { listCreativeAssets } from '../../creativeLineage/storeAdapter.js';
import * as store from './visualDevelopmentStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function proofRecordId(proofId: string, parentId: string | null): string {
  const base = proofId.toLowerCase().replace(/_/g, '-');
  if (parentId) return `${parentId}-rev-${Date.now()}`;
  return `${base}-v1`;
}

function initProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  clientExpression: ReturnType<typeof compileNdxbookClientExpressionProfile> | null,
): SurfaceDesignProof {
  const isProjects = proofId === 'SITE00_PROJECTS_INDEX';
  const artDirection = isProjects
    ? deriveProjectsIndexProofArtDirection()
    : deriveNdxbookProjectHomeProofArtDirection({ clientExpression: clientExpression! });

  const workspaceCanon = buildProjectWorkspaceCanon();

  return {
    proofId,
    proofRecordId: proofRecordId(proofId, null),
    parentProofRecordId: null,
    owner: isProjects ? 'SITE00' : 'SITE00_PLUS_NDXBOOK',
    concept: (artDirection as { proofConcept: string }).proofConcept,
    surface: isProjects ? '/projects' : '/projects/ndxbook',
    device: 'DESKTOP',
    lifecycle: 'BASELINE',
    artDirection,
    manifest: null,
    functionalCanon: isProjects ? extractSite00ProjectsIndexFunctionalCanon() : extractNdxbookFunctionalCanon(),
    workspaceCanonFingerprint: workspaceCanon.canonId,
    clientExpressionFingerprint: isProjects ? null : clientExpression?.fingerprint ?? null,
    clientExpression: isProjects ? null : clientExpression,
    generatedAssets: [],
    generationReceipts: [],
    composedProof: null,
    qaResult: null,
    founderJudgment: null,
    revisionNote: null,
    implementationContract: null,
    orchestrationPrepared: false,
    generationError: null,
    generationStarted: false,
    referencePackage: null,
    referenceConditioned: false,
    proofLabel: null,
    revisionReason: null,
    proofLineage: [],
    excludedReferenceIds: [],
    referenceAdherenceResult: null,
    surfaceGenerationMode: isProjects ? 'COMPOSED_INTERFACE' : 'VISUAL_PROOF',
    referencePipelineStatus: 'NOT_STARTED',
    surfaceVisualAuthorityPackage: null,
    interfaceAssetManifest: null,
    interfaceSlotResolution: null,
    authenticatedReferenceStatus: [],
    executionTraces: [],
  };
}

function initRun(projectId: string, clientExpression: ReturnType<typeof compileNdxbookClientExpressionProfile>): ProjectWorkspaceVisualDevelopmentRun {
  return {
    runId: 'project-workspace-visual-development',
    projectId,
    workspaceCanon: buildProjectWorkspaceCanon(),
    proofs: {
      site00ProjectsIndex: initProof('SITE00_PROJECTS_INDEX', null),
      ndxbookProjectHome: initProof('NDXBOOK_PROJECT_HOME', clientExpression),
    },
    accounting: {
      falRequests: 0,
      estimatedCostUsd: 0,
      anthropicRequests: 0,
      anthropicTokens: 0,
      anthropicCostUsd: 0,
      gptImageRequests: 0,
      worldGenerationRequests: 0,
    },
    compiledAt: nowIso(),
  };
}

function getProof(run: ProjectWorkspaceVisualDevelopmentRun, proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME'): SurfaceDesignProof {
  return proofId === 'SITE00_PROJECTS_INDEX' ? run.proofs.site00ProjectsIndex : run.proofs.ndxbookProjectHome;
}

function setProof(run: ProjectWorkspaceVisualDevelopmentRun, proof: SurfaceDesignProof): void {
  if (proof.proofId === 'SITE00_PROJECTS_INDEX') run.proofs.site00ProjectsIndex = proof;
  else run.proofs.ndxbookProjectHome = proof;
}

function refreshProofManifestFromGeneratedAssets(
  run: ProjectWorkspaceVisualDevelopmentRun,
  proof: SurfaceDesignProof,
): void {
  const reusableIds = proof.generatedAssets.map((a) => a.requirementId);
  const ctx = buildDesignProofArtDirectionContext(proof.proofId, proof.clientExpression);

  if (proof.proofId === 'SITE00_PROJECTS_INDEX') {
    proof.manifest = compileSite00ProjectsIndexProofManifest({
      artDirection: proof.artDirection,
      workspaceCanon: run.workspaceCanon,
      existingReusableAssetIds: reusableIds,
    });
  } else {
    if (!proof.clientExpression) throw new Error('clientExpression required for NDXBOOK manifest refresh');
    proof.manifest = compileNdxbookProjectHomeProofManifest({
      artDirection: proof.artDirection,
      workspaceCanon: run.workspaceCanon,
      clientExpression: proof.clientExpression,
      existingReusableAssetIds: reusableIds,
    });
  }

  proof.functionalCanon = ctx.functionalCanon;
  if (proof.manifest) {
    if (proof.surfaceGenerationMode === 'COMPOSED_INTERFACE') {
      const slotResolution = compilePurposeGatedSlotResolution({
        projectSlug: run.projectId,
        existingGeneratedAssets: proof.generatedAssets.map((a) => ({
          requirementId: a.requirementId,
          storagePath: a.storagePath,
          publicUrl: a.publicUrl,
          assetRole: a.assetRole,
        })),
      });
      proof.interfaceSlotResolution = slotResolution;
      proof.interfaceAssetManifest = compilePurposeGatedInterfaceManifest({
        surfaceId: proof.proofId,
        slotResolution,
        designProofManifest: proof.manifest,
      });
    } else {
      proof.interfaceAssetManifest = compileInterfaceAssetManifest({
        surfaceId: proof.proofId,
        designProofManifest: proof.manifest,
      });
    }
  }
}

/** Backfill P1 fields on persisted proofs saved before generation-boundary correction. */
export function hydrateSurfaceDesignProof(proof: SurfaceDesignProof): SurfaceDesignProof {
  const defaults = initProof(
    proof.proofId,
    proof.proofId === 'NDXBOOK_PROJECT_HOME' ? proof.clientExpression : null,
  );
  const merged: SurfaceDesignProof = {
    ...defaults,
    ...proof,
    proofLineage: proof.proofLineage ?? [],
    excludedReferenceIds: proof.excludedReferenceIds ?? [],
    executionTraces: proof.executionTraces ?? [],
    generatedAssets: proof.generatedAssets ?? [],
    generationReceipts: proof.generationReceipts ?? [],
    surfaceVisualAuthorityPackage: proof.surfaceVisualAuthorityPackage ?? null,
    interfaceAssetManifest: proof.interfaceAssetManifest ?? null,
    interfaceSlotResolution: proof.interfaceSlotResolution ?? null,
    authenticatedReferenceStatus: proof.authenticatedReferenceStatus ?? [],
    referencePipelineStatus: proof.referencePipelineStatus ?? 'NOT_STARTED',
    surfaceGenerationMode:
      proof.surfaceGenerationMode ??
      (proof.proofId === 'SITE00_PROJECTS_INDEX' ? 'COMPOSED_INTERFACE' : 'VISUAL_PROOF'),
  };
  refreshSurfaceClassification(merged);
  return merged;
}

export function normalizeVisualDevelopmentRun(
  run: ProjectWorkspaceVisualDevelopmentRun,
): ProjectWorkspaceVisualDevelopmentRun {
  return {
    ...run,
    proofs: {
      site00ProjectsIndex: hydrateSurfaceDesignProof(run.proofs.site00ProjectsIndex),
      ndxbookProjectHome: hydrateSurfaceDesignProof(run.proofs.ndxbookProjectHome),
    },
  };
}

export async function getProjectWorkspaceVisualDevelopmentRun(
  projectId = 'ndxbook',
): Promise<ProjectWorkspaceVisualDevelopmentRun | null> {
  const run = await store.getVisualDevelopmentRun();
  if (!run) return null;
  return hydrateVisualDevelopmentRunReferences(normalizeVisualDevelopmentRun(run));
}

async function hydrateProofReferencePackage(proof: SurfaceDesignProof): Promise<SurfaceDesignProof> {
  if (!proof.referencePackage) return proof;
  const referencePackage = await hydrateVisualReferencePackage(proof.referencePackage);
  if (referencePackage === proof.referencePackage) return proof;
  const updated = { ...proof, referencePackage };
  refreshSurfaceClassification(updated);
  return updated;
}

async function hydrateVisualDevelopmentRunReferences(
  run: ProjectWorkspaceVisualDevelopmentRun,
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const site00ProjectsIndex = await hydrateProofReferencePackage(run.proofs.site00ProjectsIndex);
  const ndxbookProjectHome = await hydrateProofReferencePackage(run.proofs.ndxbookProjectHome);
  const changed =
    site00ProjectsIndex !== run.proofs.site00ProjectsIndex ||
    ndxbookProjectHome !== run.proofs.ndxbookProjectHome;
  if (!changed) return run;
  const next = {
    ...run,
    proofs: { site00ProjectsIndex, ndxbookProjectHome },
    compiledAt: nowIso(),
  };
  return store.saveVisualDevelopmentRun(next);
}

export async function refreshProjectWorkspaceVisualDevelopmentRun(
  projectId = 'ndxbook',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const existing = await store.getVisualDevelopmentRun();
  if (existing) {
    const normalized = normalizeVisualDevelopmentRun(existing);
    normalized.workspaceCanon = buildProjectWorkspaceCanon();
    normalized.compiledAt = nowIso();
    return await store.saveVisualDevelopmentRun(normalized);
  }

  await initializeVisualReferenceMemory();
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const clientExpression = compileNdxbookClientExpressionProfile(profile);
  return await store.saveVisualDevelopmentRun(initRun(projectId, clientExpression));
}

async function refreshHostReferencesForProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<void> {
  const intent =
    proofId === 'SITE00_PROJECTS_INDEX' ? 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' : 'NDXBOOK_PROJECT_HOME_DESIGN_PROOF';
  await refreshVisualReferences({ generationIntent: intent, targetDevice: 'DESKTOP' });
  await refreshVisualReferences({ generationIntent: intent, targetDevice: 'MOBILE' });
}

export async function refreshVisualDevelopmentReferences(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  await refreshHostReferencesForProof(proofId);
  return compileVisualDevelopmentReferencePackage(proofId);
}

function refreshSurfaceClassification(proof: SurfaceDesignProof, hostReferencesValid?: boolean): void {
  proof.surfaceGenerationMode = classifySurfaceGenerationMode({
    proofId: proof.proofId,
    hasHostVisualAuthority: Boolean(proof.referencePackage?.references.length),
    visualDirectionUnresolved: proof.proofId === 'NDXBOOK_PROJECT_HOME',
  });
  proof.referencePipelineStatus = evaluateReferencePipelineStatus({
    referencePackage: proof.referencePackage,
    requireStrictHost: proof.proofId === 'SITE00_PROJECTS_INDEX',
    requireMobileEvidence: false,
    mobileReferenceCount: proof.referencePackage?.references.filter((r) =>
      r.roles.includes('HOST_RESPONSIVE_BEHAVIOR'),
    ).length ?? 0,
    authenticatedProjectsReferenceValid: hostReferencesValid,
  });
}

async function refreshAuthenticatedReferenceStatus(proof: SurfaceDesignProof): Promise<void> {
  const { host } = await quarantineAndPersistHostVisualMemory();
  proof.authenticatedReferenceStatus = [
    evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'DESKTOP'),
    evaluateAuthenticatedReferenceForRoute(host.references, '/projects', 'MOBILE'),
  ];
}

export async function prepareComposedInterfaceSurface(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  if (proofId !== 'SITE00_PROJECTS_INDEX') {
    throw new Error('prepareComposedInterfaceSurface is scoped to SITE00_PROJECTS_INDEX in P1 correction');
  }

  await refreshHostReferencesForProof('SITE00_PROJECTS_INDEX');

  const { host } = await quarantineAndPersistHostVisualMemory();
  assertAuthenticatedProjectsReferencesReady(host);

  let run = await compileVisualDevelopmentReferencePackage(proofId);
  run = await compileVisualDevelopmentProofManifest(proofId);
  const proof = getProof(run, proofId);

  if (!proof.referencePackage) {
    throw new Error('REFERENCE_PACKAGE_INCOMPLETE');
  }

  proof.surfaceVisualAuthorityPackage = compileSurfaceVisualAuthorityPackage({
    surfaceId: proofId,
    referencePackage: proof.referencePackage,
  });

  const creativeAssets = await listCreativeAssets('ndxbook').catch(() => []);
  const slotResolution = compilePurposeGatedSlotResolution({
    projectSlug: 'ndxbook',
    creativeAssets,
    existingGeneratedAssets: proof.generatedAssets.map((a) => ({
      requirementId: a.requirementId,
      storagePath: a.storagePath,
      publicUrl: a.publicUrl,
      assetRole: a.assetRole,
    })),
  });

  proof.interfaceSlotResolution = slotResolution;

  if (!proof.manifest) throw new Error('Manifest required');
  proof.interfaceAssetManifest = compilePurposeGatedInterfaceManifest({
    surfaceId: proofId,
    slotResolution,
    designProofManifest: proof.manifest,
  });

  await refreshAuthenticatedReferenceStatus(proof);
  const projectsDesktopValid = proof.authenticatedReferenceStatus.find(
    (s) => s.viewportClass === 'DESKTOP',
  )?.status === 'VALID';

  refreshSurfaceClassification(proof, projectsDesktopValid);
  assertReferencePipelineReady(proof.referencePipelineStatus);
  proof.lifecycle = 'GENERATION_READY';
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function generateMissingInterfaceAssets(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  let run = await refreshProjectWorkspaceVisualDevelopmentRun();
  let proof = getProof(run, proofId);

  if (!proof.interfaceAssetManifest || !proof.surfaceVisualAuthorityPackage) {
    run = await prepareComposedInterfaceSurface(proofId);
    proof = getProof(run, proofId);
  }

  refreshSurfaceClassification(proof);
  if (proof.referencePipelineStatus !== 'READY_FOR_REFERENCE_CONDITIONED_GENERATION') {
    throw new Error(`REFERENCE_PIPELINE_BLOCKED: ${proof.referencePipelineStatus}`);
  }

  if (!proof.manifest) throw new Error('Manifest required');

  proof.lifecycle = 'GENERATING';
  proof.generationStarted = true;
  proof.generationError = null;
  proof.generationReceipts = proof.generationReceipts.filter((r) => r.status !== 'FAILED');
  setProof(run, proof);
  await store.saveVisualDevelopmentRun(run);

  const ctx = buildDesignProofArtDirectionContext(proofId, proof.clientExpression);
  const artSummary = [
    proof.artDirection.dominantVisualBehavior,
    proof.artDirection.compositionalHierarchy.join(' > '),
  ].join('. ');
  const functionalSummary = proof.functionalCanon.items
    .filter((i) => i.classification !== 'LEGACY_PRESENTATION')
    .map((i) => i.label)
    .slice(0, 6)
    .join(', ');

  const creativeAssets = await listCreativeAssets('ndxbook').catch(() => []);
  const slotResolution =
    proof.interfaceSlotResolution ??
    compilePurposeGatedSlotResolution({
      projectSlug: 'ndxbook',
      creativeAssets,
      existingGeneratedAssets: proof.generatedAssets.map((a) => ({
        requirementId: a.requirementId,
        storagePath: a.storagePath,
        publicUrl: a.publicUrl,
        assetRole: a.assetRole,
      })),
    });
  proof.interfaceSlotResolution = slotResolution;

  const generationSlots = slotResolution.resolved.filter(
    (r) => r.generationRequired && r.generationJustification && r.status === 'MISSING',
  );

  let generatedAssets = [...proof.generatedAssets];
  let generationReceipts = [...proof.generationReceipts];
  let executionTraces = [...proof.executionTraces];
  let falRequests = run.accounting.falRequests;
  let estimatedCostUsd = run.accounting.estimatedCostUsd;
  let anyFailed = false;

  if (generationSlots.length === 0) {
    proof.interfaceAssetManifest = compilePurposeGatedInterfaceManifest({
      surfaceId: proofId,
      slotResolution,
      designProofManifest: proof.manifest,
    });
    proof.lifecycle = 'FOUNDER_REVIEW';
    proof.generationError = null;
    setProof(run, proof);
    return await store.saveVisualDevelopmentRun(run);
  }

  for (const slotMaterial of generationSlots) {
    const slot = slotResolution.slots.find((s) => s.slotId === slotMaterial.slotId);
    if (!slot || slotResolutionBlocksMethodologyGeneration(slot.replacesLegacyRoles?.[0] ?? slot.semanticRole)) {
      continue;
    }

    const justification = slotMaterial.generationJustification;
    if (!justification) continue;

    const promptText = compileAssetPromptFromPurpose({
      slot,
      projectName: 'NDXBOOK',
      justification,
    });

    const pseudoReq = {
      id: slot.slotId,
      proofId,
      category: 'PRIMARY_ARTWORK' as const,
      assetRole: slot.semanticRole,
      purpose: promptText,
      deviceClass: 'DESKTOP' as const,
      reusable: false,
      reusableAssetId: null,
      missing: true,
      generationAllowed: true,
      idempotencyKey: `${proofId}-${slot.slotId}`,
      estimatedCostUsd: 0.05,
    };

    const storagePath = `site00/visual-development/${proofId.toLowerCase()}/${slot.slotId}-desktop.webp`;
    const result = await generateDesignProofAssetViaFal({
      requirement: pseudoReq,
      storagePath,
      artDirectionSummary: artSummary,
      proofConcept: proof.concept,
      owner: proof.owner,
      functionalSummary,
      antiDirection: ctx.antiDirection,
      compositionalHierarchy: proof.artDirection.compositionalHierarchy,
      referencePackage: proof.referencePackage,
    });

    const refUrls = proof.referencePackage?.references.map((r) => r.publicUrl).filter(Boolean) ?? [];
    executionTraces.push(
      buildVisualGenerationExecutionTrace({
        surfaceId: proofId,
        projectId: run.projectId,
        generationIntent: `${proofId}_INTERFACE_ASSET`,
        surfaceGenerationMode: proof.surfaceGenerationMode,
        generationMode: result.generationMode ?? 'TEXT_TO_IMAGE',
        referencePackageId: proof.referencePackage?.fingerprint ?? null,
        referenceCount: refUrls.length,
        selectedReferenceIds: proof.referencePackage?.references.map((r) => r.referenceId) ?? [],
        authoritySummary: proof.surfaceVisualAuthorityPackage?.fingerprint ?? '',
        provider: result.ok ? result.provider : EXPERIENCE_FAL_PROVIDER,
        model: result.ok ? result.model : EXPERIENCE_FAL_MODEL,
        providerRequestId: result.ok ? result.requestId : null,
        promptHash: result.ok ? result.promptHash : '',
        inputFingerprintSeed: `${pseudoReq.id}:${proof.referencePackage?.fingerprint ?? 'none'}`,
        outputAssetIds: result.ok ? [pseudoReq.id] : [],
        fallbackAttempted: false,
        fallbackBlocked: proof.referencePackage?.strictHostVisualConditioning ?? false,
        failureReason: result.ok ? null : result.error,
        blocked: !result.ok,
      }),
    );

    if (!result.ok) {
      anyFailed = true;
      generationReceipts.push({
        receiptId: `rcpt-fail-${pseudoReq.id}`,
        requirementId: pseudoReq.id,
        proofId,
        provider: EXPERIENCE_FAL_PROVIDER,
        model: EXPERIENCE_FAL_MODEL,
        requestId: null,
        promptHash: '',
        storagePath,
        publicUrl: null,
        costUsd: 0,
        lineageKey: pseudoReq.idempotencyKey,
        parentLineageKey: proof.parentProofRecordId,
        status: 'FAILED',
        generatedAt: nowIso(),
        error: result.error,
      });
      continue;
    }

    falRequests += 1;
    estimatedCostUsd += result.costUsd;
    generationReceipts.push({
      receiptId: `rcpt-${pseudoReq.idempotencyKey}`,
      requirementId: pseudoReq.id,
      proofId,
      provider: result.provider,
      model: result.model,
      requestId: result.requestId,
      promptHash: result.promptHash,
      storagePath: result.storagePath,
      publicUrl: result.publicUrl,
      costUsd: result.costUsd,
      lineageKey: pseudoReq.idempotencyKey,
      parentLineageKey: proof.parentProofRecordId,
      status: 'GENERATED',
      generatedAt: nowIso(),
      error: null,
    });
    generatedAssets = generatedAssets.filter((a) => a.requirementId !== pseudoReq.id);
    generatedAssets.push({
      requirementId: pseudoReq.id,
      storagePath: result.storagePath,
      publicUrl: result.publicUrl,
      assetRole: slot.semanticRole,
      category: pseudoReq.category,
      productionState: 'VISUAL_DEVELOPMENT',
    });
  }

  proof.interfaceAssetManifest = compilePurposeGatedInterfaceManifest({
    surfaceId: proofId,
    slotResolution: compilePurposeGatedSlotResolution({
      projectSlug: 'ndxbook',
      creativeAssets,
      existingGeneratedAssets: generatedAssets.map((a) => ({
        requirementId: a.requirementId,
        storagePath: a.storagePath,
        publicUrl: a.publicUrl,
        assetRole: a.assetRole,
      })),
    }),
    designProofManifest: proof.manifest,
  });

  proof.generatedAssets = generatedAssets;
  proof.generationReceipts = generationReceipts;
  proof.executionTraces = executionTraces;
  run.accounting.falRequests = falRequests;
  run.accounting.estimatedCostUsd = estimatedCostUsd;

  if (anyFailed) {
    const failedReceipts = generationReceipts.filter((r) => r.status === 'FAILED');
    const detail = failedReceipts
      .map((r) => r.error)
      .filter(Boolean)
      .slice(0, 2)
      .join(' · ');
    proof.lifecycle = 'GENERATION_FAILED';
    proof.generationError = detail
      ? `One or more interface asset generations failed — ${detail}`
      : 'One or more interface asset generations failed';
    setProof(run, proof);
    return await store.saveVisualDevelopmentRun(run);
  }

  refreshProofManifestFromGeneratedAssets(run, proof);
  proof.qaResult = evaluateDesignProofQA({
    visionEvaluationAvailable: false,
    generatedAssetCount: generatedAssets.length,
    composedImagePresent: false,
    generationFailed: false,
    proofId,
    composedInterfaceMode: true,
  });
  proof.lifecycle = 'FOUNDER_REVIEW';
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function compileVisualDevelopmentReferencePackage(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  options?: { excludedReferenceIds?: string[] },
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
  const intent =
    proofId === 'SITE00_PROJECTS_INDEX' ? 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' : 'NDXBOOK_PROJECT_HOME_DESIGN_PROOF';

  let structuralRef = null;
  let negativeRef = null;
  if (proof.composedProof && proof.proofLabel === 'PROOF_A') {
    const classified = await classifyExistingProofAsStructuralReference({
      proofRecordId: proof.proofRecordId,
      storagePath: proof.composedProof.storagePath,
      publicUrl: proof.composedProof.publicUrl,
    });
    structuralRef = classified.structural;
    negativeRef = classified.negative;
  } else if (proof.proofLineage.length > 0) {
    const parentEntry = proof.proofLineage.find((e) => e.proofLabel === 'PROOF_A');
    if (parentEntry?.composedProofStoragePath) {
      const classified = await classifyExistingProofAsStructuralReference({
        proofRecordId: parentEntry.proofRecordId,
        storagePath: parentEntry.composedProofStoragePath,
        publicUrl: null,
      });
      structuralRef = classified.structural;
      negativeRef = classified.negative;
    }
  }

  const referencePackage = await compileReferencePackageForIntent({
    generationIntent: intent,
    targetDevice: 'DESKTOP',
    structuralProofReference: structuralRef,
    negativeProofReference: negativeRef,
    excludedReferenceIds: options?.excludedReferenceIds ?? proof.excludedReferenceIds,
  });
  await assertReferencePackageReadyForFal(referencePackage);

  proof.referencePackage = referencePackage;
  refreshSurfaceClassification(proof);
  proof.lifecycle = 'GENERATION_READY';
  setProof(run, proof);
  const saved = await store.saveVisualDevelopmentRun(run);
  return hydrateVisualDevelopmentRunReferences(saved);
}

export async function createReferenceConditionedChildProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const parent = getProof(run, proofId);

  if (!parent.composedProof) {
    throw new Error('Parent proof required before creating reference-conditioned child proof');
  }

  const parentLineageEntry = {
    proofRecordId: parent.proofRecordId,
    parentProofRecordId: parent.parentProofRecordId,
    revisionReason: null,
    proofLabel: parent.proofLabel ?? ('PROOF_A' as const),
    referencePackageFingerprint: parent.referencePackage?.fingerprint ?? null,
    referenceConditioned: parent.referenceConditioned,
    composedProofStoragePath: parent.composedProof.storagePath,
    classification: {
      structuralAuthority: true,
      styleAuthority: false,
      negativeStyle: true,
      approvalStatus: 'STRUCTURAL_REFERENCE' as const,
    },
    createdAt: parent.composedProof.composedAt,
  };

  const child: SurfaceDesignProof = {
    ...parent,
    proofRecordId: proofRecordId(proofId, parent.proofRecordId),
    parentProofRecordId: parent.proofRecordId,
    lifecycle: 'BASELINE',
    proofLabel: 'PROOF_B',
    revisionReason: 'HOST_VISUAL_FIDELITY_FAILURE',
    referenceConditioned: true,
    referencePackage: null,
    composedProof: null,
    generatedAssets: [],
    generationReceipts: [],
    qaResult: null,
    founderJudgment: null,
    revisionNote: null,
    implementationContract: null,
    orchestrationPrepared: false,
    generationError: null,
    generationStarted: false,
    referenceAdherenceResult: null,
    proofLineage: [...parent.proofLineage, parentLineageEntry],
  };

  setProof(run, child);
  return await store.saveVisualDevelopmentRun(run);
}

export async function compileVisualDevelopmentProofManifest(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
  const workspaceCanon = run.workspaceCanon;
  const ctx = buildDesignProofArtDirectionContext(proofId, proof.clientExpression);

  if (proofId === 'SITE00_PROJECTS_INDEX') {
    proof.manifest = compileSite00ProjectsIndexProofManifest({
      artDirection: proof.artDirection,
      workspaceCanon,
      existingReusableAssetIds: proof.generatedAssets.map((a) => a.requirementId),
    });
  } else {
    proof.manifest = compileNdxbookProjectHomeProofManifest({
      artDirection: proof.artDirection,
      workspaceCanon,
      clientExpression: proof.clientExpression!,
      existingReusableAssetIds: proof.generatedAssets.map((a) => a.requirementId),
    });
  }

  proof.lifecycle = 'GENERATION_READY';
  proof.functionalCanon = ctx.functionalCanon;
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

async function generateProofInternal(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  options?: { referenceConditioned?: boolean },
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  let run = await compileVisualDevelopmentProofManifest(proofId);

  const initialProof = getProof(run, proofId);
  if (initialProof.surfaceGenerationMode === 'COMPOSED_INTERFACE') {
    throw new Error(FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE);
  }

  const useReferenceConditioning =
    options?.referenceConditioned ??
    initialProof.referenceConditioned ??
    (proofId === 'SITE00_PROJECTS_INDEX' && initialProof.proofLabel === 'PROOF_B');

  if (useReferenceConditioning) {
    run = await compileVisualDevelopmentReferencePackage(proofId);
  }

  let proof = getProof(run, proofId);
  if (!proof.manifest) throw new Error('Manifest required');

  proof.lifecycle = 'GENERATING';
  proof.generationStarted = true;
  proof.generationError = null;
  if (useReferenceConditioning) {
    proof.referenceConditioned = true;
    if (!proof.proofLabel) proof.proofLabel = 'PROOF_B';
  } else if (!proof.proofLabel && proofId === 'SITE00_PROJECTS_INDEX') {
    proof.proofLabel = 'PROOF_A';
  }
  setProof(run, proof);
  await store.saveVisualDevelopmentRun(run);

  const ctx = buildDesignProofArtDirectionContext(proofId, proof.clientExpression);
  const artSummary = [
    proof.artDirection.dominantVisualBehavior,
    proof.artDirection.compositionalHierarchy.join(' > '),
  ].join('. ');
  const functionalSummary = proof.functionalCanon.items
    .filter((i) => i.classification !== 'LEGACY_PRESENTATION')
    .map((i) => i.label)
    .slice(0, 6)
    .join(', ');

  const missingReqs = proof.manifest.requirements.filter((r) => r.missing && r.generationAllowed);
  let generatedAssets = [...proof.generatedAssets];
  let generationReceipts = [...proof.generationReceipts];
  let falRequests = run.accounting.falRequests;
  let estimatedCostUsd = run.accounting.estimatedCostUsd;
  let anyFailed = false;

  for (const req of missingReqs) {
    const storagePath = `site00/visual-development/${proofId.toLowerCase()}/${req.assetRole.toLowerCase()}-desktop.webp`;
    const result = await generateDesignProofAssetViaFal({
      requirement: req,
      storagePath,
      artDirectionSummary: artSummary,
      proofConcept: proof.concept,
      owner: proof.owner,
      functionalSummary,
      antiDirection: ctx.antiDirection,
    });

    if (!result.ok) {
      anyFailed = true;
      generationReceipts.push({
        receiptId: `rcpt-fail-${req.id}`,
        requirementId: req.id,
        proofId,
        provider: EXPERIENCE_FAL_PROVIDER,
        model: EXPERIENCE_FAL_MODEL,
        requestId: null,
        promptHash: '',
        storagePath,
        publicUrl: null,
        costUsd: 0,
        lineageKey: pseudoReq.idempotencyKey,
        parentLineageKey: proof.parentProofRecordId,
        status: 'FAILED',
        generatedAt: nowIso(),
        error: result.error,
      });
      continue;
    }

    falRequests += 1;
    estimatedCostUsd += result.costUsd;
    generationReceipts.push({
      receiptId: `rcpt-${req.idempotencyKey}`,
      requirementId: req.id,
      proofId,
      provider: result.provider,
      model: result.model,
      requestId: result.requestId,
      promptHash: result.promptHash,
      storagePath: result.storagePath,
      publicUrl: result.publicUrl,
      costUsd: result.costUsd,
      lineageKey: req.idempotencyKey,
      parentLineageKey: proof.parentProofRecordId,
      status: 'GENERATED',
      generatedAt: nowIso(),
      error: null,
    });
    generatedAssets = generatedAssets.filter((a) => a.requirementId !== req.id);
    generatedAssets.push({
      requirementId: req.id,
      storagePath: result.storagePath,
      publicUrl: result.publicUrl,
      assetRole: req.assetRole,
      category: req.category,
      productionState: 'VISUAL_DEVELOPMENT',
    });
  }

  if (anyFailed) {
    proof.lifecycle = 'GENERATION_FAILED';
    proof.generationError = 'One or more FAL asset generations failed';
    proof.generatedAssets = generatedAssets;
    proof.generationReceipts = generationReceipts;
    run.accounting.falRequests = falRequests;
    run.accounting.estimatedCostUsd = estimatedCostUsd;
    setProof(run, proof);
    return await store.saveVisualDevelopmentRun(run);
  }

  const composeStoragePath = `site00/visual-development/${proofId.toLowerCase()}/${proof.proofRecordId}/composed-desktop-proof.webp`;
  const composeResult = await composeDesignProofViaFal({
    proofId,
    storagePath: composeStoragePath,
    proofConcept: proof.concept,
    owner: proof.owner,
    artDirectionSummary: artSummary,
    functionalSummary,
    componentAssetDescriptions: generatedAssets.map((a) => `${a.assetRole}: ${a.storagePath}`),
    referencePackage: useReferenceConditioning ? proof.referencePackage : null,
    surfaceGenerationMode: proof.surfaceGenerationMode,
  });

  if (!composeResult.ok) {
    proof.lifecycle = 'GENERATION_FAILED';
    proof.generationError = composeResult.error;
    proof.generatedAssets = generatedAssets;
    proof.generationReceipts = generationReceipts;
    run.accounting.falRequests = falRequests;
    run.accounting.estimatedCostUsd = estimatedCostUsd;
    setProof(run, proof);
    return await store.saveVisualDevelopmentRun(run);
  }

  falRequests += 1;
  estimatedCostUsd += composeResult.costUsd;

  const fingerprint = createHash('sha256')
    .update(`${composeResult.storagePath}:${composeResult.promptHash}`)
    .digest('hex')
    .slice(0, 16);

  proof.composedProof = {
    proofId,
    proofVersion: proof.proofRecordId,
    storagePath: composeResult.storagePath,
    publicUrl: composeResult.publicUrl,
    fingerprint,
    componentAssetIds: generatedAssets.map((a) => a.requirementId),
    composedAt: nowIso(),
    receiptId: composeResult.requestId,
  };
  proof.generatedAssets = generatedAssets;
  proof.generationReceipts = [
    ...generationReceipts,
    {
      receiptId: `rcpt-compose-${proofId}`,
      requirementId: composeResult.requirementId,
      proofId,
      provider: composeResult.provider,
      model: composeResult.model,
      requestId: composeResult.requestId,
      promptHash: composeResult.promptHash,
      storagePath: composeResult.storagePath,
      publicUrl: composeResult.publicUrl,
      costUsd: composeResult.costUsd,
      lineageKey: `compose-${proofId}`,
      parentLineageKey: proof.parentProofRecordId,
      status: 'GENERATED',
      generatedAt: nowIso(),
      error: null,
    },
  ];

  proof.qaResult = evaluateDesignProofQA({
    visionEvaluationAvailable: false,
    generatedAssetCount: generatedAssets.length,
    composedImagePresent: true,
    generationFailed: false,
    proofId,
  });

  if (useReferenceConditioning) {
    const adherence = evaluateReferenceAdherence({ visionEvaluationAvailable: false });
    proof.referenceAdherenceResult = adherence.overallResult;
  }

  if (!useReferenceConditioning && proofId === 'SITE00_PROJECTS_INDEX' && proof.composedProof) {
    await classifyExistingProofAsStructuralReference({
      proofRecordId: proof.proofRecordId,
      storagePath: proof.composedProof.storagePath,
      publicUrl: proof.composedProof.publicUrl,
    });
  }

  const substantive = proof.qaResult.substantiveGate.passes;
  proof.lifecycle = substantive ? 'DESIGN_PROOF_READY' : 'FOUNDER_REVIEW';
  if (substantive) proof.lifecycle = 'FOUNDER_REVIEW';

  run.accounting.falRequests = falRequests;
  run.accounting.estimatedCostUsd = estimatedCostUsd;
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function generateVisualDevelopmentDesignProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  options?: { referenceConditioned?: boolean },
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
  refreshSurfaceClassification(proof);
  if (proof.surfaceGenerationMode === 'COMPOSED_INTERFACE') {
    throw new Error(FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE);
  }
  return generateProofInternal(proofId, options);
}

export async function generateReferenceConditionedDesignProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
  if (proof.surfaceGenerationMode === 'COMPOSED_INTERFACE') {
    throw new Error(FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE);
  }
  if (proof.proofLabel === 'PROOF_A' && proof.composedProof) {
    await createReferenceConditionedChildProof(proofId);
  }
  return generateProofInternal(proofId, { referenceConditioned: true });
}

export async function excludeVisualDevelopmentReference(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
  referenceId: string,
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
  if (!proof.excludedReferenceIds.includes(referenceId)) {
    proof.excludedReferenceIds = [...proof.excludedReferenceIds, referenceId];
  }
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function setVisualDevelopmentProofJudgment(params: {
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  judgment: 'LOVE_THE_DIRECTION' | 'PROMISING_REVISE' | 'NOT_THE_DIRECTION' | null;
  revisionNote?: string | null;
}): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, params.proofId);

  proof.founderJudgment = params.judgment;
  if (params.judgment) {
    proof.lifecycle = mapFounderJudgmentToLifecycle(params.judgment) as ExperienceSurfaceDesignLifecycleState;
  }

  if (params.judgment === 'PROMISING_REVISE') {
    proof.revisionNote = params.revisionNote ?? null;
  }

  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function prepareVisualDevelopmentImplementation(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);

  const approval = assertSurfaceApprovedForImplementation(proof.lifecycle);
  const composedInterface = proof.surfaceGenerationMode === 'COMPOSED_INTERFACE';

  if (!approval.allowed) {
    throw new Error('PREPARE_IMPLEMENTATION requires approved surface lifecycle');
  }

  if (composedInterface) {
    if (!proof.surfaceVisualAuthorityPackage) {
      throw new Error('PREPARE_IMPLEMENTATION requires SurfaceVisualAuthorityPackage');
    }
    const hasResolvedMaterial =
      Boolean(proof.interfaceSlotResolution) ||
      proof.generatedAssets.length > 0 ||
      Boolean(proof.interfaceAssetManifest?.purposeGated);
    if (!hasResolvedMaterial) {
      throw new Error('PREPARE_IMPLEMENTATION requires resolved visual material for COMPOSED_INTERFACE');
    }
  } else if (!proof.composedProof) {
    throw new Error('PREPARE_IMPLEMENTATION requires approved proof with composed image');
  }

  proof.implementationContract = compileDesignProofImplementationContract({
    proof,
    workspaceCanon: run.workspaceCanon,
  });
  proof.lifecycle = 'IMPLEMENTATION_CONTRACT_READY';
  proof.orchestrationPrepared = true;
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
}

export async function orchestrateVisualDevelopmentImplementation(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<{
  run: ProjectWorkspaceVisualDevelopmentRun;
  orchestrationPackageId: string;
  orchestrationStatus: 'DISPATCHED' | 'BLOCKED' | 'ORCHESTRATION_NOT_CONNECTED' | 'DUPLICATE_PREVENTED';
  orchestrationDispatched: boolean;
  p1RunId?: string;
}> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);

  if (proof.lifecycle !== 'IMPLEMENTATION_CONTRACT_READY' || !proof.implementationContract) {
    throw new Error('ORCHESTRATE requires valid implementation contract');
  }

  if (productionPresentationMutationBlocked(proof.lifecycle)) {
    throw new Error('Production presentation mutation blocked');
  }

  if (proofId !== 'SITE00_PROJECTS_INDEX') {
    const packageId = `orch-${proof.proofRecordId}-${Date.now()}`;
    proof.orchestrationStatus = 'ORCHESTRATION_NOT_CONNECTED';
    setProof(run, proof);
    const saved = await store.saveVisualDevelopmentRun(run);
    return {
      run: saved,
      orchestrationPackageId: packageId,
      orchestrationStatus: 'ORCHESTRATION_NOT_CONNECTED',
      orchestrationDispatched: false,
    };
  }

  const { dispatchP1ComposerImplementation, resetP1OrchestrationState } = await import(
    '../../../../../shared/site00-studio-world-production/p1/p1OrchestrationService.js'
  );
  resetP1OrchestrationState();

  const p1Run = await dispatchP1ComposerImplementation({
    proof,
    projectId: 'site00',
    composerVerified: process.env.VITEST === 'true',
  });

  const pkg = p1Run.composerPackage!;
  proof.orchestrationStatus = pkg.dispatchStatus === 'DISPATCHED' ? 'DISPATCHED' : pkg.dispatchStatus;
  setProof(run, proof);
  const saved = await store.saveVisualDevelopmentRun(run);

  return {
    run: saved,
    orchestrationPackageId: pkg.packageId,
    orchestrationStatus:
      pkg.dispatchStatus === 'DISPATCHED'
        ? 'DISPATCHED'
        : pkg.dispatchStatus === 'DUPLICATE_PREVENTED'
          ? 'DUPLICATE_PREVENTED'
          : 'BLOCKED',
    orchestrationDispatched: pkg.dispatchStatus === 'DISPATCHED',
    p1RunId: p1Run.runId,
  };
}

export function resetVisualDevelopmentRunMemory(): void {
  store.resetVisualDevelopmentMemory();
  resetVisualReferenceServiceMemory();
}

export { EXPERIENCE_FAL_MODEL, EXPERIENCE_FAL_PROVIDER };
