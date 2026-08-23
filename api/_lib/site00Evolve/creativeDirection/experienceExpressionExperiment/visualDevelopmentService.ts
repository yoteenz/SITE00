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
import * as store from './visualDevelopmentMemoryStore.js';

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
  return store.getVisualDevelopmentRun();
}

export async function refreshProjectWorkspaceVisualDevelopmentRun(
  projectId = 'ndxbook',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const existing = store.getVisualDevelopmentRun();
  if (existing) {
    existing.workspaceCanon = buildProjectWorkspaceCanon();
    existing.compiledAt = nowIso();
    return store.saveVisualDevelopmentRun(existing);
  }

  const profile = await getBrandLoreProfileForOrg(NDXBOOK_ORG_ID);
  const clientExpression = compileNdxbookClientExpressionProfile(profile);
  return store.saveVisualDevelopmentRun(initRun(projectId, clientExpression));
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
  return store.saveVisualDevelopmentRun(run);
}

async function generateProofInternal(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  let run = await compileVisualDevelopmentProofManifest(proofId);
  const proof = getProof(run, proofId);
  if (!proof.manifest) throw new Error('Manifest required');

  proof.lifecycle = 'GENERATING';
  proof.generationStarted = true;
  proof.generationError = null;
  setProof(run, proof);
  store.saveVisualDevelopmentRun(run);

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
    return store.saveVisualDevelopmentRun(run);
  }

  const composeStoragePath = `site00/visual-development/${proofId.toLowerCase()}/composed-desktop-proof.webp`;
  const composeResult = await composeDesignProofViaFal({
    proofId,
    storagePath: composeStoragePath,
    proofConcept: proof.concept,
    owner: proof.owner,
    artDirectionSummary: artSummary,
    functionalSummary,
    componentAssetDescriptions: generatedAssets.map((a) => `${a.assetRole}: ${a.storagePath}`),
  });

  if (!composeResult.ok) {
    proof.lifecycle = 'GENERATION_FAILED';
    proof.generationError = composeResult.error;
    proof.generatedAssets = generatedAssets;
    proof.generationReceipts = generationReceipts;
    run.accounting.falRequests = falRequests;
    run.accounting.estimatedCostUsd = estimatedCostUsd;
    setProof(run, proof);
    return store.saveVisualDevelopmentRun(run);
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

  const substantive = proof.qaResult.substantiveGate.passes;
  proof.lifecycle = substantive ? 'DESIGN_PROOF_READY' : 'FOUNDER_REVIEW';
  if (substantive) proof.lifecycle = 'FOUNDER_REVIEW';

  run.accounting.falRequests = falRequests;
  run.accounting.estimatedCostUsd = estimatedCostUsd;
  setProof(run, proof);
  return store.saveVisualDevelopmentRun(run);
}

export async function generateVisualDevelopmentDesignProof(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  return generateProofInternal(proofId);
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
  return store.saveVisualDevelopmentRun(run);
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
  return store.saveVisualDevelopmentRun(run);
}

export async function orchestrateVisualDevelopmentImplementation(
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME',
): Promise<{ run: ProjectWorkspaceVisualDevelopmentRun; orchestrationPackageId: string }> {
  const run = await refreshProjectWorkspaceVisualDevelopmentRun();
  const proof = getProof(run, proofId);

  if (proof.lifecycle !== 'IMPLEMENTATION_CONTRACT_READY' || !proof.implementationContract) {
    throw new Error('ORCHESTRATE requires valid implementation contract');
  }

  if (productionPresentationMutationBlocked(proof.lifecycle)) {
    throw new Error('Production presentation mutation blocked');
  }

  const packageId = `orch-${proof.proofRecordId}-${Date.now()}`;
  return { run: store.saveVisualDevelopmentRun(run), orchestrationPackageId: packageId };
}

export function resetVisualDevelopmentRunMemory(): void {
  store.resetVisualDevelopmentMemory();
}

export { EXPERIENCE_FAL_MODEL, EXPERIENCE_FAL_PROVIDER };
