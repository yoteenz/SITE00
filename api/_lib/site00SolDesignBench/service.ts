import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  COMPOSER_INVOKED_DURING_TEST,
  SOL_DESIGN_BENCH_MODEL,
  SOL_DESIGN_BENCH_PROVIDER,
  SolDesignBenchEtaEstimator,
  assertTranslationPackage,
  stageProgress,
  validateReferenceInput,
  type SolDesignBenchHistoryEntry,
  type SolDesignBenchRun,
  type SolDesignBenchStage,
  type StartSolDesignBenchRequest,
} from '../../../shared/site00-sol-design-bench/contracts.js';
import {
  SolDesignBenchModelContract,
  type SolDesignBenchProviderReadinessReceipt,
} from '../../../shared/site00-sol-design-bench/modelContract.js';
import {
  SOL_PROVIDER_MODEL_ID,
  SOL_PROMPT_HASH,
  SOL_PROMPT_VERSION,
  buildSolBenchmarkInputReceipt,
  executeSolDesignAnalysis,
  type SolProviderResult,
} from './provider.js';

const ROOT = process.env.SOL_DESIGN_BENCH_STORE_DIR?.trim() ||
  join(tmpdir(), 'site00-sol-design-bench');
const runCache = new Map<string, SolDesignBenchRun>();
const activeJobs = new Set<string>();

type SolExecutor = typeof executeSolDesignAnalysis;
let executor: SolExecutor = executeSolDesignAnalysis;

export class SolDesignBenchProviderBlockedError extends Error {
  constructor(public readonly receipt: SolDesignBenchProviderReadinessReceipt) {
    super(`SOL_PROVIDER_READINESS_BLOCKED:${receipt.blockingReasons.join(',')}`);
  }
}

export function getSolDesignBenchProviderReadiness(input?: {
  referenceImageAvailable?: boolean;
  imageInputAttachmentPathValid?: boolean;
}): SolDesignBenchProviderReadinessReceipt {
  const receipt: SolDesignBenchProviderReadinessReceipt = {
    receiptType: 'SolDesignBenchProviderReadinessReceipt',
    state: 'READY',
    checkedAt: new Date().toISOString(),
    openAiCredentialPresentServerSide: Boolean(process.env.OPENAI_API_KEY?.trim()),
    exactModelIdConfigured: SOL_PROVIDER_MODEL_ID === SolDesignBenchModelContract.modelId,
    highReasoningConfigured: SolDesignBenchModelContract.reasoningEffort === 'high',
    referenceImageAvailable: input?.referenceImageAvailable ?? false,
    imageInputAttachmentPathValid: input?.imageInputAttachmentPathValid ?? false,
    noFallbackConfigured: SolDesignBenchModelContract.fallbackAllowed === false,
    webSearchDisabled: SolDesignBenchModelContract.webSearchAllowed === false,
    blockingReasons: [],
  };
  if (!receipt.openAiCredentialPresentServerSide) receipt.blockingReasons.push('OPENAI_CREDENTIAL_MISSING');
  if (!receipt.exactModelIdConfigured) receipt.blockingReasons.push('EXACT_MODEL_ID_NOT_CONFIGURED');
  if (!receipt.highReasoningConfigured) receipt.blockingReasons.push('HIGH_REASONING_NOT_CONFIGURED');
  if (!receipt.referenceImageAvailable) receipt.blockingReasons.push('REFERENCE_IMAGE_UNAVAILABLE');
  if (!receipt.imageInputAttachmentPathValid) receipt.blockingReasons.push('IMAGE_INPUT_ATTACHMENT_PATH_INVALID');
  if (!receipt.noFallbackConfigured) receipt.blockingReasons.push('MODEL_FALLBACK_CONFIGURED');
  if (!receipt.webSearchDisabled) receipt.blockingReasons.push('WEB_SEARCH_ENABLED');
  receipt.state = receipt.blockingReasons.length ? 'BLOCKED' : 'READY';
  return receipt;
}

const STAGE_LABELS: Record<SolDesignBenchStage, string> = {
  IDLE: 'Waiting for reference',
  UPLOADING: 'Uploading reference…',
  QUEUED: 'Queued for Sol…',
  INGESTING_REFERENCE: 'Ingesting reference…',
  ANALYZING_VISUAL: 'Analyzing visual system…',
  MEASURING_COMPOSITION: 'Measuring composition…',
  DERIVING_DESIGN_SYSTEM: 'Deriving design system…',
  DERIVING_COMPONENT_TREE: 'Deriving component tree…',
  RENDERING_INTERFACE_PREVIEW: 'Rendering interface preview…',
  BUILDING_IMPLEMENTATION_HANDOFF: 'Building implementation handoff…',
  FINALIZING: 'Finalizing package…',
  COMPLETE: 'Translation complete',
  FAILED: 'Sol run failed',
};

function runPath(runId: string): string {
  return join(ROOT, `${runId}.json`);
}

function referencePath(runId: string, mime: string): string {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  return join(ROOT, `${runId}-reference.${ext}`);
}

function historyPath(): string {
  return join(ROOT, 'history.json');
}

async function ensureRoot(): Promise<void> {
  await mkdir(ROOT, { recursive: true });
}

async function readHistory(): Promise<SolDesignBenchHistoryEntry[]> {
  try {
    return JSON.parse(await readFile(historyPath(), 'utf8')) as SolDesignBenchHistoryEntry[];
  } catch {
    return [];
  }
}

async function saveRun(run: SolDesignBenchRun): Promise<void> {
  runCache.set(run.runId, structuredClone(run));
  await ensureRoot();
  await writeFile(runPath(run.runId), JSON.stringify(run), 'utf8');
}

async function updateStage(runId: string, status: SolDesignBenchStage): Promise<SolDesignBenchRun> {
  const run = await getSolDesignBenchRun(runId);
  if (!run) throw new Error('SOL_RUN_NOT_FOUND');
  if (run.status === 'COMPLETE' || run.status === 'FAILED') return run;
  run.status = status;
  run.stageLabel = STAGE_LABELS[status];
  run.progress = stageProgress(status);
  const anchor = run.timing.startedAt || run.timing.queuedAt;
  run.etaSeconds = new SolDesignBenchEtaEstimator(await readHistory()).estimate(
    status,
    Math.max(0, (Date.now() - Date.parse(anchor)) / 1000),
  ).remainingSeconds;
  await saveRun(run);
  return run;
}

function deriveTiming(run: SolDesignBenchRun): void {
  const t = run.timing;
  t.queueDuration = t.startedAt ? Date.parse(t.startedAt) - Date.parse(t.queuedAt) : null;
  t.modelDuration = t.providerStartedAt && t.providerCompletedAt
    ? Date.parse(t.providerCompletedAt) - Date.parse(t.providerStartedAt)
    : null;
  t.postProcessingDuration = t.providerCompletedAt && t.completedAt
    ? Date.parse(t.completedAt) - Date.parse(t.providerCompletedAt)
    : null;
  t.totalDuration = t.completedAt ? Date.parse(t.completedAt) - Date.parse(t.queuedAt) : null;
}

async function runJob(runId: string): Promise<void> {
  if (activeJobs.has(runId)) return;
  activeJobs.add(runId);
  let stageTimer: ReturnType<typeof setInterval> | null = null;
  try {
    let run = await updateStage(runId, 'INGESTING_REFERENCE');
    run.timing.startedAt = new Date().toISOString();
    await saveRun(run);

    const bytes = await readFile(run.authority.storedFile);
    const dataUrl = `data:${run.authority.mime};base64,${bytes.toString('base64')}`;
    await updateStage(runId, 'ANALYZING_VISUAL');

    run = (await getSolDesignBenchRun(runId))!;
    run.timing.providerStartedAt = new Date().toISOString();
    await saveRun(run);

    const providerStages: SolDesignBenchStage[] = [
      'ANALYZING_VISUAL',
      'MEASURING_COMPOSITION',
      'DERIVING_DESIGN_SYSTEM',
      'DERIVING_COMPONENT_TREE',
    ];
    let providerStageIndex = 0;
    stageTimer = setInterval(() => {
      providerStageIndex = Math.min(providerStageIndex + 1, providerStages.length - 1);
      void updateStage(runId, providerStages[providerStageIndex]);
    }, 25_000);

    const providerResult = await executor({ runId, authority: run.authority, dataUrl });
    clearInterval(stageTimer);
    stageTimer = null;

    run = (await getSolDesignBenchRun(runId))!;
    run.timing.providerCompletedAt = new Date().toISOString();
    run.cost = providerResult.cost;
    run.providerDispatchReceipt = providerResult.dispatchReceipt;
    run.inputReceipt = providerResult.inputReceipt;
    await saveRun(run);

    await updateStage(runId, 'RENDERING_INTERFACE_PREVIEW');
    const result = assertTranslationPackage(providerResult.package, run.authority);
    await updateStage(runId, 'BUILDING_IMPLEMENTATION_HANDOFF');
    await updateStage(runId, 'FINALIZING');

    run = (await getSolDesignBenchRun(runId))!;
    run.result = result;
    run.status = 'COMPLETE';
    run.stageLabel = STAGE_LABELS.COMPLETE;
    run.progress = 100;
    run.etaSeconds = 0;
    run.timing.completedAt = new Date().toISOString();
    deriveTiming(run);
    await saveRun(run);

    const history = await readHistory();
    if (run.timing.totalDuration) {
      history.push({
        model: SOL_DESIGN_BENCH_MODEL,
        totalDuration: run.timing.totalDuration,
        completedAt: run.timing.completedAt,
      });
      await writeFile(historyPath(), JSON.stringify(history.slice(-50)), 'utf8');
    }
  } catch (error) {
    if (stageTimer) clearInterval(stageTimer);
    const run = await getSolDesignBenchRun(runId);
    if (run) {
      run.status = 'FAILED';
      run.stageLabel = STAGE_LABELS.FAILED;
      run.progress = 100;
      run.etaSeconds = 0;
      run.error = {
        code: error instanceof Error && error.message.startsWith('GPT_5_6_SOL_PROVIDER_BINDING_FAILED')
          ? 'GPT_5_6_SOL_PROVIDER_BINDING_FAILED'
          : 'SOL_RUN_FAILED',
        message: error instanceof Error ? error.message : String(error),
      };
      run.timing.completedAt = new Date().toISOString();
      deriveTiming(run);
      await saveRun(run);
    }
  } finally {
    activeJobs.delete(runId);
  }
}

export async function startSolDesignBenchRun(
  request: StartSolDesignBenchRequest,
): Promise<SolDesignBenchRun> {
  const errors = validateReferenceInput(request.reference);
  if (errors.length) throw new Error(`SOL_REFERENCE_INVALID:${errors.join(',')}`);

  const base64 = request.reference.dataUrl.slice(request.reference.dataUrl.indexOf(',') + 1);
  const bytes = Buffer.from(base64, 'base64');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const metadata = await sharp(bytes).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (
    sha256 !== request.reference.sha256.toLowerCase() ||
    bytes.length !== request.reference.bytes ||
    width !== request.reference.width ||
    height !== request.reference.height
  ) {
    throw new Error('SOL_REFERENCE_AUTHORITY_MISMATCH');
  }

  const runId = `sol_${randomUUID()}`;
  const readiness = getSolDesignBenchProviderReadiness({
    referenceImageAvailable: bytes.length > 0,
    imageInputAttachmentPathValid:
      request.reference.dataUrl.startsWith(`data:${request.reference.mime};base64,`) &&
      sha256 === request.reference.sha256.toLowerCase(),
  });
  if (readiness.state !== 'READY') throw new SolDesignBenchProviderBlockedError(readiness);
  await ensureRoot();
  const storedFile = referencePath(runId, request.reference.mime);
  await writeFile(storedFile, bytes);
  const now = new Date().toISOString();
  const run: SolDesignBenchRun = {
    runId,
    status: 'QUEUED',
    stageLabel: STAGE_LABELS.QUEUED,
    progress: stageProgress('QUEUED'),
    authority: {
      authorityType: 'SolDesignBenchReferenceAuthority',
      runId,
      storedFile,
      filename: request.reference.filename,
      sha256,
      width,
      height,
      bytes: bytes.length,
      mime: request.reference.mime,
      timestamp: now,
    },
    model: SOL_DESIGN_BENCH_MODEL,
    provider: SOL_DESIGN_BENCH_PROVIDER,
    providerModelId: SOL_PROVIDER_MODEL_ID,
    requestedReasoningEffort: SolDesignBenchModelContract.reasoningEffort,
    providerReadinessReceipt: readiness,
    providerDispatchReceipt: null,
    inputReceipt: buildSolBenchmarkInputReceipt({
      runId,
      authority: {
        authorityType: 'SolDesignBenchReferenceAuthority',
        runId,
        storedFile,
        filename: request.reference.filename,
        sha256,
        width,
        height,
        bytes: bytes.length,
        mime: request.reference.mime,
        timestamp: now,
      },
    }),
    solPromptVersion: SOL_PROMPT_VERSION,
    solPromptHash: SOL_PROMPT_HASH,
    timing: {
      queuedAt: now,
      startedAt: null,
      providerStartedAt: null,
      providerCompletedAt: null,
      completedAt: null,
      queueDuration: null,
      modelDuration: null,
      postProcessingDuration: null,
      totalDuration: null,
    },
    etaSeconds: new SolDesignBenchEtaEstimator().estimate('QUEUED', 0).remainingSeconds,
    etaIsEstimate: true,
    result: null,
    error: null,
    cost: null,
    composerInvokedDuringTest: COMPOSER_INVOKED_DURING_TEST,
    grokOutputAccessed: false,
  };
  await saveRun(run);
  setTimeout(() => void runJob(runId), 0);
  return run;
}

export async function getSolDesignBenchRun(runId: string): Promise<SolDesignBenchRun | null> {
  const cached = runCache.get(runId);
  if (cached) return structuredClone(cached);
  try {
    const run = JSON.parse(await readFile(runPath(runId), 'utf8')) as SolDesignBenchRun;
    runCache.set(runId, run);
    return structuredClone(run);
  } catch {
    return null;
  }
}

export function setSolDesignBenchExecutorForTests(next: SolExecutor | null): void {
  executor = next ?? executeSolDesignAnalysis;
}

export async function resetSolDesignBenchForTests(): Promise<void> {
  runCache.clear();
  activeJobs.clear();
}
