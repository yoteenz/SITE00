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
} from '../../../site00VisualReference/visualReferenceService.js';
import { evaluateReferenceAdherence } from '../../../../../shared/site00-visual-reference/referenceAdherenceQA.js';
import type { VisualReferencePackage } from '../../../../../shared/site00-visual-reference/types.js';
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

export async function getProjectWorkspaceVisualDevelopmentRun(
  projectId = 'ndxbook',
): Promise<ProjectWorkspaceVisualDevelopmentRun | null> {
  return await store.getVisualDevelopmentRun();
}

export async function refreshProjectWorkspaceVisualDevelopmentRun(
  projectId = 'ndxbook',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const existing = await store.getVisualDevelopmentRun();
  if (existing) {
    existing.workspaceCanon = buildProjectWorkspaceCanon();
    existing.compiledAt = nowIso();
    return await store.saveVisualDevelopmentRun(existing);
  }

  await initializeVisualReferenceMemory();
  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const clientExpression = compileNdxbookClientExpressionProfile(profile);
  return await store.saveVisualDevelopmentRun(initRun(projectId, clientExpression));
}

export async function refreshVisualDevelopmentReferences(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const intent =
    proofId === 'SITE00_PROJECTS_INDEX' ? 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' : 'NDXBOOK_PROJECT_HOME_DESIGN_PROOF';
  await refreshVisualReferences({ generationIntent: intent, targetDevice: 'DESKTOP' });
  return run;
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

  proof.referencePackage = referencePackage;
  proof.lifecycle = 'GENERATION_READY';
  setProof(run, proof);
  return await store.saveVisualDevelopmentRun(run);
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
        lineageKey: req.idempotencyKey,
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
  return generateProofInternal(proofId, options);
}

export async function generateReferenceConditionedDesignProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);
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
  if (!approval.allowed || !proof.composedProof) {
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
  orchestrationStatus: 'ORCHESTRATION_NOT_CONNECTED';
  orchestrationDispatched: false;
}> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);

  if (proof.lifecycle !== 'IMPLEMENTATION_CONTRACT_READY' || !proof.implementationContract) {
    throw new Error('ORCHESTRATE requires valid implementation contract');
  }

  if (productionPresentationMutationBlocked(proof.lifecycle)) {
    throw new Error('Production presentation mutation blocked');
  }

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

export function resetVisualDevelopmentRunMemory(): void {
  store.resetVisualDevelopmentMemory();
  resetVisualReferenceServiceMemory();
}

export { EXPERIENCE_FAL_MODEL, EXPERIENCE_FAL_PROVIDER };
