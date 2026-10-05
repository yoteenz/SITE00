/**
 * P0.VR.EXPERIENCE-OUTPUT-WRITEBACK-SLOT-MOUNT-AND-PANEL-SYNC1
 */

import { designPageIdsEquivalent } from '../designPageIdentity.js';
import { resolveDesignPageIdentityForGallery } from './pageConceptGenerationStateDiscovery.js';
import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import {
  expressionTypeForVisualState,
  validateExperiencePackageMaterialization,
  type ExperienceGenerationJob,
} from './experiencePackageMaterialization.js';
import {
  collectExperienceFalJobCandidates,
  reconcileExistingExperienceArtifacts,
  stateIdForCanonicalExpressionType,
  type CanonicalExperienceExpressionType,
} from './experienceLegacyFalArtifactReconciliation.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from './types.js';
import { PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION } from './pageConceptExperienceExpressionFalPlan.js';

export const EXPERIENCE_OUTPUT_MATERIALIZED_EVENT = 'site00:experience-output-materialized';

export type ExperienceOutputSlotKey = {
  projectId: string;
  canonicalPageId: string;
  sourceAuthorityId: string;
  expressionType: CanonicalExperienceExpressionType;
};

export type ExperiencePackageOutputStatus =
  | 'INHERITED'
  | 'READY'
  | 'READY_REVIEW_REQUIRED'
  | 'STALE_AUTHORITY'
  | 'STALE_CONTENT'
  | 'STALE_THEME'
  | 'SUPERSEDED'
  | 'MISSING'
  | 'GENERATING'
  | 'FAILED';

export type ExperiencePackageOutputRecord = {
  outputRecordId: string;
  packageId: string;
  expressionType: CanonicalExperienceExpressionType;
  stateId: string;
  artifactId: string | null;
  artifactUri: string | null;
  status: ExperiencePackageOutputStatus;
  provider: 'INHERITED_MOBILE' | 'FAL' | null;
  sourceAuthorityId: string;
  version: number;
  current: boolean;
  providerRequestId?: string | null;
  sourceJobId?: string | null;
  promptVersion?: string | null;
  contentManifestVersion?: string | null;
  themeDirectiveVersion?: string | null;
  generatedAt?: string | null;
};

export type ExperiencePackageAggregates = {
  plannedOutputCount: number;
  inheritedOutputCount: number;
  falOutputCount: number;
  falReadyCount: number;
  materializedOutputCount: number;
  pendingOutputCount: number;
  staleOutputCount: number;
  failedOutputCount: number;
};

export type ExperiencePackageOutputIndex = {
  slotKeys: Partial<Record<CanonicalExperienceExpressionType, ExperienceOutputSlotKey>>;
  outputs: Partial<Record<CanonicalExperienceExpressionType, ExperiencePackageOutputRecord>>;
  aggregates: ExperiencePackageAggregates;
  lastWritebackAt: string | null;
  writebackRootCause: ExperienceOutputWritebackRootCause | null;
};

export type ExperienceOutputWritebackRootCause =
  | 'ARTIFACT_PERSISTED_BUT_OUTPUT_SLOT_NOT_UPDATED'
  | 'OUTPUT_SLOT_UPDATED_BUT_PACKAGE_INDEX_STALE'
  | 'PACKAGE_UPDATED_BUT_UI_HYDRATION_STALE'
  | 'EXPRESSION_TYPE_KEY_MISMATCH'
  | 'PAGE_ID_BUCKET_MISMATCH'
  | 'AUTHORITY_VERSION_MISMATCH'
  | 'OTHER'
  | null;

const NDXBOOK_CANONICAL_SLOTS: readonly CanonicalExperienceExpressionType[] = [
  'BASE_PAGE_AT_REST',
  'MENU_EXPANDED_NAV',
  'ENTRY_DETAIL_PANEL',
  'PROJECT_ACCESS_OVERLAY',
];

export function resolveCanonicalPageIdForExperience(input: {
  projectId: string;
  pageId: string;
  route?: string | null;
}): string {
  const identity = resolveDesignPageIdentityForGallery({
    projectSlug: input.projectId,
    pageId: input.pageId,
    route: input.route ?? null,
  });
  return identity.canonicalPageId || input.pageId;
}

export function buildExperienceOutputSlotKey(input: {
  authority: ExperienceExpressionAuthority;
  expressionType: CanonicalExperienceExpressionType;
  route?: string | null;
}): ExperienceOutputSlotKey {
  return {
    projectId: input.authority.projectId,
    canonicalPageId: resolveCanonicalPageIdForExperience({
      projectId: input.authority.projectId,
      pageId: input.authority.pageId,
      route: input.route,
    }),
    sourceAuthorityId: input.authority.sourceConceptId,
    expressionType: input.expressionType,
  };
}

export function canonicalExpressionTypeForVisualState(
  state: ExperienceExpressionVisualState,
): CanonicalExperienceExpressionType {
  if (state.sourceProvider === 'INHERITED_MOBILE') return 'BASE_PAGE_AT_REST';
  const raw = expressionTypeForVisualState(state);
  if (raw === 'MENU_EXPANDED_NAV') return 'MENU_EXPANDED_NAV';
  if (raw === 'PANEL_OR_DRAWER') return 'ENTRY_DETAIL_PANEL';
  if (raw === 'OVERLAY_OR_DETAIL_STATE') return 'PROJECT_ACCESS_OVERLAY';
  const label = (state.outputLabel ?? state.label).toUpperCase();
  if (label.includes('MENU') || label.includes('NAV')) return 'MENU_EXPANDED_NAV';
  if (label.includes('ENTRY') || label.includes('DETAIL') || label.includes('PANEL')) return 'ENTRY_DETAIL_PANEL';
  if (label.includes('ACCESS') || label.includes('OVERLAY')) return 'PROJECT_ACCESS_OVERLAY';
  return 'BASE_PAGE_AT_REST';
}

function emptyAggregates(): ExperiencePackageAggregates {
  return {
    plannedOutputCount: 4,
    inheritedOutputCount: 0,
    falOutputCount: 3,
    falReadyCount: 0,
    materializedOutputCount: 0,
    pendingOutputCount: 4,
    staleOutputCount: 0,
    failedOutputCount: 0,
  };
}

export function recomputeExperiencePackageAggregates(
  authority: ExperienceExpressionAuthority,
  outputs: Partial<Record<CanonicalExperienceExpressionType, ExperiencePackageOutputRecord>>,
): ExperiencePackageAggregates {
  const materialization = validateExperiencePackageMaterialization(authority);
  const planned = materialization.plannedOutputCount || authority.visualStates.length || 4;
  const records = NDXBOOK_CANONICAL_SLOTS.map((t) => outputs[t]).filter(Boolean) as ExperiencePackageOutputRecord[];

  const inheritedOutputCount = records.filter((r) => r.status === 'INHERITED').length;
  const falRecords = records.filter((r) => r.expressionType !== 'BASE_PAGE_AT_REST');
  const falOutputCount = falRecords.length || 3;
  const falReadyCount = falRecords.filter((r) => r.status === 'READY' || r.status === 'READY_REVIEW_REQUIRED').length;
  const materializedOutputCount = records.filter(
    (r) =>
      r.status === 'INHERITED' ||
      r.status === 'READY' ||
      r.status === 'READY_REVIEW_REQUIRED' ||
      r.status === 'STALE_AUTHORITY' ||
      r.status === 'STALE_CONTENT' ||
      r.status === 'STALE_THEME',
  ).length;
  const staleOutputCount = records.filter(
    (r) => r.status === 'STALE_AUTHORITY' || r.status === 'STALE_CONTENT' || r.status === 'STALE_THEME',
  ).length;
  const failedOutputCount = records.filter((r) => r.status === 'FAILED').length;
  const pendingOutputCount = Math.max(0, planned - materializedOutputCount - failedOutputCount);

  return {
    plannedOutputCount: planned,
    inheritedOutputCount,
    falOutputCount,
    falReadyCount,
    materializedOutputCount,
    pendingOutputCount,
    staleOutputCount,
    failedOutputCount,
  };
}

export function deriveExperienceAuthorityStatusFromAggregates(
  aggregates: ExperiencePackageAggregates,
  prior: ExperienceExpressionAuthority['status'],
): ExperienceExpressionAuthority['status'] {
  if (prior === 'APPROVED') return 'APPROVED';
  if (prior === 'FAILED' && aggregates.materializedOutputCount === 0) return 'FAILED';
  if (aggregates.materializedOutputCount === 0) return prior === 'GENERATING' ? 'GENERATING' : 'NOT_STARTED';
  if (aggregates.materializedOutputCount < aggregates.plannedOutputCount) return 'PARTIAL_FAILURE';
  if (aggregates.staleOutputCount > 0) return 'PARTIAL_FAILURE';
  return 'READY_FOR_REVIEW';
}

function classifyMountStatus(input: {
  state: ExperienceExpressionVisualState;
  confirmedConceptId: string | null;
  job: PageConceptGeneratedArtifact | ExperienceGenerationJob | null;
}): ExperiencePackageOutputStatus {
  if (input.state.sourceProvider === 'INHERITED_MOBILE') return 'INHERITED';
  if (input.state.materializationStatus === 'FAILED') return 'FAILED';
  if (input.state.materializationStatus === 'GENERATING') return 'GENERATING';
  if (input.state.caption.includes('REGENERATION REQUIRED')) {
    if (input.state.caption.includes('STALE_AUTHORITY')) return 'STALE_AUTHORITY';
    if (input.state.caption.includes('STALE_CONTENT')) return 'STALE_CONTENT';
    return 'STALE_CONTENT';
  }
  if (input.job && 'gpt2AuthorityConceptId' in input.job && input.job.gpt2AuthorityConceptId) {
    if (input.confirmedConceptId && input.job.gpt2AuthorityConceptId !== input.confirmedConceptId) {
      return 'STALE_AUTHORITY';
    }
  }
  if (input.state.previewImageUri?.trim() || input.state.generatedArtifactId) {
    if (input.state.founderVisualQaStatus === 'READY_FOR_FOUNDER_VISUAL_QA') return 'READY_REVIEW_REQUIRED';
    if (input.state.contentProvenanceStatus === 'REVIEW_REQUIRED') return 'READY_REVIEW_REQUIRED';
    return 'READY';
  }
  return 'MISSING';
}

export function syncVisualStatesFromPackageOutputs(authority: ExperienceExpressionAuthority): ExperienceExpressionAuthority {
  const index = authority.packageOutputIndex;
  if (!index?.outputs) return authority;

  const visualStates = authority.visualStates.map((state) => {
    const expressionType = canonicalExpressionTypeForVisualState(state);
    const record = index.outputs[expressionType];
    if (!record || !record.current) return state;
    if (!record.artifactUri?.trim() && !record.artifactId) return state;
    return {
      ...state,
      previewImageUri: record.artifactUri?.trim() ? record.artifactUri : state.previewImageUri,
      generatedArtifactId: record.artifactId ?? state.generatedArtifactId,
      materializationStatus:
        record.status === 'INHERITED' ? ('INHERITED' as const)
        : record.status === 'READY' || record.status === 'READY_REVIEW_REQUIRED' ? ('READY' as const)
        : record.status === 'FAILED' ? ('FAILED' as const)
        : record.status === 'GENERATING' ? ('GENERATING' as const)
        : state.materializationStatus,
    };
  });

  return { ...authority, visualStates };
}

export function materializeExperienceExpressionOutput(input: {
  authority: ExperienceExpressionAuthority;
  expressionType: CanonicalExperienceExpressionType;
  stateId: string;
  artifactId: string;
  artifactUri: string;
  providerRequestId: string;
  sourceAuthorityId: string;
  promptVersion?: string;
  contentManifestVersion?: string | null;
  themeDirectiveVersion?: string | null;
  generatedAt?: string;
  sourceJobId?: string | null;
  route?: string | null;
  confirmedConceptId?: string | null;
}): ExperienceExpressionAuthority {
  const state =
    input.authority.visualStates.find((v) => v.stateId === input.stateId) ??
    input.authority.visualStates.find((v) => canonicalExpressionTypeForVisualState(v) === input.expressionType);
  if (!state) {
    throw new Error('EXPRESSION_TYPE_KEY_MISMATCH');
  }

  const slotKey = buildExperienceOutputSlotKey({
    authority: input.authority,
    expressionType: input.expressionType,
    route: input.route,
  });

  const priorIndex = input.authority.packageOutputIndex ?? {
    slotKeys: {},
    outputs: {},
    aggregates: emptyAggregates(),
    lastWritebackAt: null,
    writebackRootCause: null,
  };

  const priorRecord = priorIndex.outputs[input.expressionType];
  const nextVersion = (priorRecord?.version ?? 0) + 1;
  const outputs: Partial<Record<CanonicalExperienceExpressionType, ExperiencePackageOutputRecord>> = {
    ...priorIndex.outputs,
  };

  if (priorRecord?.current) {
    outputs[input.expressionType] = {
      ...priorRecord,
      current: false,
      status: 'SUPERSEDED',
    };
  }

  const mountStatus = classifyMountStatus({
    state: {
      ...state,
      previewImageUri: input.artifactUri,
      generatedArtifactId: input.artifactId,
    },
    confirmedConceptId: input.confirmedConceptId ?? input.sourceAuthorityId,
    job: null,
  });

  const record: ExperiencePackageOutputRecord = {
    outputRecordId: `exp-out-${input.expressionType}-${nextVersion}-${input.artifactId.slice(-8)}`,
    packageId: input.authority.id,
    expressionType: input.expressionType,
    stateId: state.stateId,
    artifactId: input.artifactId,
    artifactUri: input.artifactUri,
    status: mountStatus === 'MISSING' ? 'READY' : mountStatus,
    provider: input.expressionType === 'BASE_PAGE_AT_REST' ? 'INHERITED_MOBILE' : 'FAL',
    sourceAuthorityId: input.sourceAuthorityId,
    version: nextVersion,
    current: true,
    providerRequestId: input.providerRequestId,
    sourceJobId: input.sourceJobId ?? null,
    promptVersion: input.promptVersion ?? PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
    contentManifestVersion: input.contentManifestVersion ?? null,
    themeDirectiveVersion: input.themeDirectiveVersion ?? null,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };

  outputs[input.expressionType] = record;

  const visualStates = input.authority.visualStates.map((v) => {
    if (v.stateId !== state.stateId) return v;
    return {
      ...v,
      previewImageUri: input.artifactUri,
      generatedArtifactId: input.artifactId,
      materializationStatus:
        record.status === 'INHERITED' ? ('INHERITED' as const)
        : record.status === 'FAILED' ? ('FAILED' as const)
        : ('READY' as const),
    };
  });

  let authority: ExperienceExpressionAuthority = {
    ...input.authority,
    visualStates,
    packageOutputIndex: {
      slotKeys: { ...priorIndex.slotKeys, [input.expressionType]: slotKey },
      outputs,
      aggregates: emptyAggregates(),
      lastWritebackAt: new Date().toISOString(),
      writebackRootCause: null,
    },
  };

  const aggregates = recomputeExperiencePackageAggregates(authority, outputs);
  const status = deriveExperienceAuthorityStatusFromAggregates(aggregates, authority.status);
  authority = {
    ...authority,
    status,
    packageOutputIndex: {
      ...authority.packageOutputIndex!,
      aggregates,
    },
  };

  return syncVisualStatesFromPackageOutputs(authority);
}

function jobToMountCandidate(job: PageConceptGeneratedArtifact): {
  expressionType: CanonicalExperienceExpressionType;
  stateId: string;
} | null {
  const fromTitle = (job.displayTitle ?? '').toUpperCase();
  let expressionType: CanonicalExperienceExpressionType | null = null;
  if (/MENU|NAV/.test(fromTitle) || /EXP-MENU/i.test(job.artifactId ?? '')) expressionType = 'MENU_EXPANDED_NAV';
  else if (/ENTRY|DETAIL|PANEL|DRAWER/.test(fromTitle) || /EXP-(ENTRY|DRAWER|DETAIL)/i.test(job.artifactId ?? '')) {
    expressionType = 'ENTRY_DETAIL_PANEL';
  } else if (/ACCESS|OVERLAY|PROJECT/.test(fromTitle) || /EXP-(ACCESS|OVERLAY|PROJECT)/i.test(job.artifactId ?? '')) {
    expressionType = 'PROJECT_ACCESS_OVERLAY';
  }
  if (!expressionType) return null;
  const stateId = stateIdForCanonicalExpressionType(expressionType);
  if (!stateId) return null;
  return { expressionType, stateId };
}

export function buildPackageOutputIndexFromAuthority(
  authority: ExperienceExpressionAuthority,
  route?: string | null,
): ExperiencePackageOutputIndex {
  const outputs: Partial<Record<CanonicalExperienceExpressionType, ExperiencePackageOutputRecord>> = {};
  const slotKeys: Partial<Record<CanonicalExperienceExpressionType, ExperienceOutputSlotKey>> = {};

  for (const state of authority.visualStates) {
    const expressionType = canonicalExpressionTypeForVisualState(state);
    const slotKey = buildExperienceOutputSlotKey({ authority, expressionType, route });
    slotKeys[expressionType] = slotKey;
    const status = classifyMountStatus({ state, confirmedConceptId: authority.sourceConceptId, job: null });
    outputs[expressionType] = {
      outputRecordId: `exp-out-${expressionType}-${state.stateId}`,
      packageId: authority.id,
      expressionType,
      stateId: state.stateId,
      artifactId: state.generatedArtifactId ?? null,
      artifactUri: state.previewImageUri,
      status,
      provider: state.sourceProvider === 'INHERITED_MOBILE' ? 'INHERITED_MOBILE' : 'FAL',
      sourceAuthorityId: authority.sourceConceptId,
      version: 1,
      current: true,
      generatedAt: authority.generatedAt,
    };
  }

  const aggregates = recomputeExperiencePackageAggregates(authority, outputs);
  return {
    slotKeys,
    outputs,
    aggregates,
    lastWritebackAt: authority.packageOutputIndex?.lastWritebackAt ?? null,
    writebackRootCause: null,
  };
}

export function reconcileAndMountExistingExperienceArtifacts(input: {
  authority: ExperienceExpressionAuthority;
  state: PageConceptGenerationState;
  extraJobs?: readonly PageConceptGeneratedArtifact[];
  route?: string | null;
}): {
  authority: ExperienceExpressionAuthority;
  mountedCount: number;
  orphanedBefore: number;
} {
  const legacy = reconcileExistingExperienceArtifacts({
    authority: input.authority,
    state: input.state,
    extraJobs: input.extraJobs,
  });
  let authority = legacy.authority;

  const family = input.state.pipelineSet?.viewportAuthorityFamily;
  const confirmedConceptId = family?.confirmedMobileConceptId ?? family?.selectedMobileConceptId ?? null;
  const candidates = collectExperienceFalJobCandidates(input.state, input.extraJobs ?? []);
  const jobsByExpression = new Map<CanonicalExperienceExpressionType, PageConceptGeneratedArtifact>();

  for (const job of candidates) {
    const mapped = jobToMountCandidate(job);
    if (!mapped) continue;
    const existing = jobsByExpression.get(mapped.expressionType);
    if (!existing || Date.parse(job.createdAt) > Date.parse(existing.createdAt)) {
      jobsByExpression.set(mapped.expressionType, job);
    }
  }

  for (const job of authority.generationJobs ?? []) {
    if (job.status !== 'READY' || !job.artifactId) continue;
    const sid = job.stateId;
    const state = authority.visualStates.find((v) => v.stateId === sid);
    if (!state) continue;
    const expressionType = canonicalExpressionTypeForVisualState(state);
    const pseudoJob: PageConceptGeneratedArtifact = {
      artifactId: job.artifactId,
      projectId: authority.projectId,
      pageId: authority.pageId,
      renditionSlot: 'RENDITION_A',
      viewport: 'MOBILE',
      captureSetId: '',
      projectContextVersion: '',
      pageContextVersion: '',
      functionContractId: '',
      creativeInjectionId: '',
      gpt2AuthorityConceptId: confirmedConceptId ?? authority.sourceConceptId,
      renditionId: job.jobId,
      provider: 'FAL_EXPERIENCE',
      model: 'lineage',
      providerJobId: job.providerRequestId ?? job.jobId,
      promptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
      createdAt: job.regeneratedAt ?? new Date().toISOString(),
      status: 'READY',
      artifactPath: null,
      imageUri: state.previewImageUri ?? '',
      width: 780,
      height: 1688,
      displayTitle: expressionType,
    };
    const existing = jobsByExpression.get(expressionType);
    if (!existing || Date.parse(pseudoJob.createdAt) > Date.parse(existing.createdAt)) {
      jobsByExpression.set(expressionType, pseudoJob);
    }
  }

  let mountedCount = 0;
  const orphanedBefore = authority.visualStates.filter(
    (v) => v.sourceProvider === 'FAL_EXPERIENCE' && !v.previewImageUri?.trim(),
  ).length;

  for (const [expressionType, job] of jobsByExpression) {
    if (!job.imageUri?.trim()) continue;
    const stateId = stateIdForCanonicalExpressionType(expressionType) ?? jobToMountCandidate(job)?.stateId;
    if (!stateId) continue;
    const visual = authority.visualStates.find((v) => v.stateId === stateId);
    if (!visual) continue;
    if (visual.previewImageUri?.trim() && visual.generatedArtifactId === job.artifactId) continue;

    authority = materializeExperienceExpressionOutput({
      authority,
      expressionType,
      stateId,
      artifactId: job.artifactId,
      artifactUri: job.imageUri.trim(),
      providerRequestId: job.providerJobId ?? job.artifactId,
      sourceAuthorityId: confirmedConceptId ?? authority.sourceConceptId,
      sourceJobId: job.artifactId,
      route: input.route,
      confirmedConceptId,
      generatedAt: job.createdAt,
    });
    mountedCount += 1;
  }

  if (!authority.packageOutputIndex) {
    authority = {
      ...authority,
      packageOutputIndex: buildPackageOutputIndexFromAuthority(authority, input.route),
    };
  }

  authority = syncVisualStatesFromPackageOutputs(authority);
  return { authority, mountedCount, orphanedBefore };
}

export function applyExperiencePackageWritebackAfterGeneration(input: {
  authority: ExperienceExpressionAuthority;
  state: PageConceptGenerationState;
  jobs: readonly PageConceptGeneratedArtifact[];
  route?: string | null;
}): ExperienceExpressionAuthority {
  let authority = input.authority;
  for (const job of input.jobs) {
    if (!job.imageUri?.trim() || !job.artifactId) continue;
    const mapped = jobToMountCandidate(job);
    if (!mapped) continue;
    if (!designPageIdsEquivalent(job.projectId, job.pageId, authority.pageId)) {
      /* cross-bucket jobs handled in reconcile */
      continue;
    }
    authority = materializeExperienceExpressionOutput({
      authority,
      expressionType: mapped.expressionType,
      stateId: mapped.stateId,
      artifactId: job.artifactId,
      artifactUri: job.imageUri.trim(),
      providerRequestId: job.providerJobId ?? job.artifactId,
      sourceAuthorityId: authority.sourceConceptId,
      sourceJobId: job.artifactId,
      route: input.route ?? input.state.functionContract?.route ?? null,
      confirmedConceptId:
        input.state.pipelineSet?.viewportAuthorityFamily?.confirmedMobileConceptId ??
        input.state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
        null,
      generatedAt: job.createdAt,
    });
  }

  const repaired = reconcileAndMountExistingExperienceArtifacts({
    authority,
    state: { ...input.state, pipelineSet: { ...input.state.pipelineSet!, experienceExpressionAuthority: authority } },
    extraJobs: input.jobs,
    route: input.route ?? input.state.functionContract?.route ?? null,
  });
  return repaired.authority;
}

export function packageOutputStatusForVisualState(
  authority: ExperienceExpressionAuthority | null | undefined,
  state: ExperienceExpressionVisualState,
): ExperiencePackageOutputStatus | null {
  const expressionType = canonicalExpressionTypeForVisualState(state);
  return authority?.packageOutputIndex?.outputs?.[expressionType]?.status ?? null;
}

export function experienceOutputMaterializedEventDetail(authority: ExperienceExpressionAuthority, expressionType: CanonicalExperienceExpressionType) {
  const record = authority.packageOutputIndex?.outputs?.[expressionType];
  return {
    packageId: authority.id,
    expressionType,
    artifactId: record?.artifactId ?? null,
    status: record?.status ?? 'MISSING',
    version: record?.version ?? 0,
  };
}
