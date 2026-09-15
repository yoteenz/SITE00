import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import {
  GROK_TWIN_TEST_A_MODEL,
  GROK_TWIN_TEST_A_PROVIDER,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { grokStageLabel, grokStageProgress, emptyGrokTiming, estimateRemainingMs } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import { validateGrokReferenceUpload } from '../../../shared/site00-design-bench/grokTwinTestA/uploadValidation.js';
import type {
  GrokDesignBenchReferenceAuthority,
  GrokDesignBenchRun,
} from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { auditGrokDesignBenchProvider, grokDesignBenchProviderModel } from './grokVisionProvider.js';
import { executeGrokDesignBenchJob, launchGrokDesignBenchJob } from './jobRunner.js';
import {
  getGrokDesignBenchRun,
  grokHistoricalAverageMs,
  latestGrokDesignBenchRun,
  putGrokDesignBenchRun,
  putGrokReferenceBytes,
} from './store.js';

export interface StartGrokDesignBenchInput {
  projectId: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  imageBase64: string;
  awaitCompletion?: boolean;
}

export function publicGrokDesignBenchRun(run: GrokDesignBenchRun): GrokDesignBenchRun {
  const elapsedMs = run.timing.queuedAt ? Date.now() - Date.parse(run.timing.queuedAt) : 0;
  return {
    ...run,
    estimatedRemainingMs: estimateRemainingMs({
      stage: run.stage,
      elapsedMs,
      historicalAverageMs: grokHistoricalAverageMs(),
    }),
    etaApproximate: true,
  };
}

export function getPublicGrokDesignBenchRun(runId: string): GrokDesignBenchRun | null {
  const run = getGrokDesignBenchRun(runId);
  return run ? publicGrokDesignBenchRun(run) : null;
}

export function getLatestPublicGrokDesignBenchRun(projectId: string): GrokDesignBenchRun | null {
  const run = latestGrokDesignBenchRun(projectId);
  return run ? publicGrokDesignBenchRun(run) : null;
}

export async function startGrokDesignBenchRun(input: StartGrokDesignBenchInput): Promise<GrokDesignBenchRun> {
  const validation = validateGrokReferenceUpload({
    filename: input.filename,
    mime: input.mime,
    byteLength: Math.ceil((input.imageBase64.length * 3) / 4),
  });
  if (!validation.ok || !validation.mime) {
    throw new Error(validation.reason ?? 'INVALID_REFERENCE');
  }
  if (!Number.isFinite(input.width) || !Number.isFinite(input.height) || input.width < 1 || input.height < 1) {
    throw new Error('REFERENCE_DIMENSIONS_REQUIRED');
  }

  const bytes = Buffer.from(input.imageBase64, 'base64');
  if (!bytes.length) throw new Error('EMPTY_REFERENCE');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const runId = randomUUID();
  const storageRef = `grok-twin-test-a://${runId}`;
  const uploadedAt = new Date().toISOString();

  putGrokReferenceBytes(storageRef, { mime: validation.mime, bytes, sha256 });

  const reference: GrokDesignBenchReferenceAuthority = {
    runId,
    imageUrl: `data:${validation.mime};base64,${input.imageBase64}`,
    storageRef,
    sha256,
    width: Math.round(input.width),
    height: Math.round(input.height),
    mime: validation.mime,
    filename: input.filename,
    byteLength: bytes.length,
    uploadedAt,
    immutableForRun: true,
  };

  const queuedAt = uploadedAt;
  const run: GrokDesignBenchRun = {
    runId,
    projectId: input.projectId.toLowerCase(),
    model: GROK_TWIN_TEST_A_MODEL,
    provider: GROK_TWIN_TEST_A_PROVIDER,
    providerModel: grokDesignBenchProviderModel(),
    stage: 'QUEUED',
    stageLabel: grokStageLabel('QUEUED'),
    progressPercent: grokStageProgress('QUEUED'),
    etaApproximate: true,
    estimatedRemainingMs: estimateRemainingMs({
      stage: 'QUEUED',
      elapsedMs: 0,
      historicalAverageMs: grokHistoricalAverageMs(),
    }),
    error: null,
    reference,
    package: null,
    timing: { ...emptyGrokTiming(), queuedAt },
    cost: {
      reported: false,
      currency: null,
      amount: null,
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      note: 'Pending provider',
    },
    composerInvoked: false,
    otherModelOutputAccessed: false,
    testBDataRead: false,
  };

  putGrokDesignBenchRun(run);

  if (input.awaitCompletion) {
    return publicGrokDesignBenchRun(await executeGrokDesignBenchJob(runId));
  }
  launchGrokDesignBenchJob(runId);
  return publicGrokDesignBenchRun(run);
}

export function grokDesignBenchAudit() {
  return {
    ...auditGrokDesignBenchProvider(),
    isolatedFromTwin: true,
    isolatedFromTwinV4: true,
    isolatedFromTestB: true,
    isolatedFromSol: true,
  };
}
