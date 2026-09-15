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
  SolProviderRequestError,
  buildSolBenchmarkInputReceipt,
  executeSolDesignAnalysis,
  type SolProviderResult,
} from './provider.js';

const ROOT = process.env.SOL_DESIGN_BENCH_STORE_DIR?.trim() ||
  join(tmpdir(), 'site00-sol-design-bench');
const runCache = new Map<string, SolDesignBenchRun>();
const activeJobs = new Set<string>();
const activeProofModes = new Set<'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS'>();

type SolExecutor = typeof executeSolDesignAnalysis;
let executor: SolExecutor = executeSolDesignAnalysis;

export class SolDesignBenchProviderBlockedError extends Error {
  constructor(public readonly receipt: SolDesignBenchProviderReadinessReceipt) {
    super(`SOL_PROVIDER_READINESS_BLOCKED:${receipt.blockingReasons.join(',')}`);
  }
}

export async function getSolDesignBenchProviderReadiness(input?: {
  referenceImageAvailable?: boolean;
  imageInputAttachmentPathValid?: boolean;
}): Promise<SolDesignBenchProviderReadinessReceipt> {
  const proof = await readStructuredOutputProof();
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
    tinyLiveSchemaSmokePassed: proof.tinyLiveSchemaSmokePassed,
    largeOutputStressPassed: proof.largeOutputStressPassed,
    structuredOutputPipelineProofPassed:
      proof.tinyLiveSchemaSmokePassed && proof.largeOutputStressPassed,
    blockingReasons: [],
  };
  if (!receipt.openAiCredentialPresentServerSide) receipt.blockingReasons.push('OPENAI_CREDENTIAL_MISSING');
  if (!receipt.exactModelIdConfigured) receipt.blockingReasons.push('EXACT_MODEL_ID_NOT_CONFIGURED');
  if (!receipt.highReasoningConfigured) receipt.blockingReasons.push('HIGH_REASONING_NOT_CONFIGURED');
  if (!receipt.referenceImageAvailable) receipt.blockingReasons.push('REFERENCE_IMAGE_UNAVAILABLE');
  if (!receipt.imageInputAttachmentPathValid) receipt.blockingReasons.push('IMAGE_INPUT_ATTACHMENT_PATH_INVALID');
  if (!receipt.noFallbackConfigured) receipt.blockingReasons.push('MODEL_FALLBACK_CONFIGURED');
  if (!receipt.webSearchDisabled) receipt.blockingReasons.push('WEB_SEARCH_ENABLED');
  if (!receipt.structuredOutputPipelineProofPassed) {
    receipt.blockingReasons.push('STRUCTURED_OUTPUT_PIPELINE_PROOF_REQUIRED');
  }
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
  SOL_OUTPUT_VALIDATION_FAILED: 'Sol output validation failed',
  SOL_OUTPUT_TRUNCATED: 'Sol output truncated',
};

function runPath(runId: string): string {
  return join(ROOT, `${runId}.json`);
}

function referencePath(runId: string, mime: string): string {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  return join(ROOT, `${runId}-reference.${ext}`);
}

function rawProviderResponsePath(runId: string): string {
  return join(ROOT, `${runId}-provider-output.txt`);
}

function visualPreviewPath(runId: string): string {
  return join(ROOT, `${runId}-visual-preview.svg`);
}

function historyPath(): string {
  return join(ROOT, 'history.json');
}

function structuredOutputProofPath(): string {
  return join(ROOT, 'structured-output-proof.json');
}

interface StructuredOutputProofState {
  tinyLiveSchemaSmokePassed: boolean;
  largeOutputStressPassed: boolean;
}

let structuredOutputProofOverride: StructuredOutputProofState | null = null;

async function readStructuredOutputProof(): Promise<StructuredOutputProofState> {
  if (structuredOutputProofOverride) return structuredClone(structuredOutputProofOverride);
  try {
    return JSON.parse(await readFile(structuredOutputProofPath(), 'utf8')) as StructuredOutputProofState;
  } catch {
    return { tinyLiveSchemaSmokePassed: false, largeOutputStressPassed: false };
  }
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
  if (['COMPLETE', 'FAILED', 'SOL_OUTPUT_VALIDATION_FAILED', 'SOL_OUTPUT_TRUNCATED'].includes(run.status)) {
    return run;
  }
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

function escapeSvg(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

async function persistVisualPreview(
  runId: string,
  result: SolDesignBenchRun['result'],
): Promise<string> {
  if (!result) throw new Error('SOL_PREVIEW_RESULT_MISSING');
  const frame = result.VISUAL_INTERFACE_PREVIEW;
  const nodes = result.COMPONENT_TREE.map((component) => {
    const style = component.style ?? {};
    const rect = `<rect x="${component.x}" y="${component.y}" width="${component.width}" height="${component.height}" rx="${style.borderRadius ?? 0}" fill="${escapeSvg(style.background ?? 'transparent')}" stroke="${escapeSvg(style.border?.match(/#[a-fA-F0-9]{3,8}/)?.[0] ?? 'transparent')}"/>`;
    const text = component.text
      ? `<text x="${component.x + 2}" y="${component.y + (style.fontSize ?? 16)}" fill="${escapeSvg(style.color ?? '#111')}" font-size="${style.fontSize ?? 16}" font-weight="${style.fontWeight ?? 400}">${escapeSvg(component.text.slice(0, 100))}</text>`
      : '';
    return `<g data-component-id="${escapeSvg(component.componentId)}">${rect}${text}</g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${frame.artboardWidth} ${frame.artboardHeight}" width="${frame.artboardWidth}" height="${frame.artboardHeight}"><rect width="100%" height="100%" fill="${escapeSvg(frame.background || '#fff')}"/>${nodes}</svg>`;
  await writeFile(visualPreviewPath(runId), svg, 'utf8');
  return `/api/site00/sol-design-bench?runId=${encodeURIComponent(runId)}&preview=1`;
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

    const providerResult = await executor({
      runId,
      authority: run.authority,
      dataUrl,
      proofMode: run.proofMode ?? undefined,
    });
    clearInterval(stageTimer);
    stageTimer = null;

    run = (await getSolDesignBenchRun(runId))!;
    run.timing.providerCompletedAt = new Date().toISOString();
    run.cost = providerResult.cost;
    run.providerDispatchReceipt = providerResult.dispatchReceipt;
    run.inputReceipt = providerResult.inputReceipt;
    await writeFile(rawProviderResponsePath(runId), providerResult.rawProviderResponse, {
      encoding: 'utf8',
      mode: 0o600,
    });
    run.rawProviderResponseRef = `sol-raw://${runId}`;
    run.structuredOutputRuntimeReceipt = providerResult.runtimeReceipt;
    run.structuredOutputValidationReceipt = {
      ...providerResult.validationReceipt,
      rawResponsePersistedSafely: true,
    };
    run.outputCompletenessReceipt = providerResult.completenessReceipt;
    run.proofPassed = run.proofMode === 'TINY_LIVE_SCHEMA_SMOKE'
      ? true
      : run.proofMode === 'LARGE_OUTPUT_STRESS'
        ? providerResult.completenessReceipt.outputCharacters >= 50_000
        : null;
    if (run.proofMode && run.proofPassed) {
      const proof = await readStructuredOutputProof();
      if (run.proofMode === 'TINY_LIVE_SCHEMA_SMOKE') proof.tinyLiveSchemaSmokePassed = true;
      if (run.proofMode === 'LARGE_OUTPUT_STRESS') proof.largeOutputStressPassed = true;
      if (structuredOutputProofOverride) structuredOutputProofOverride = structuredClone(proof);
      await writeFile(structuredOutputProofPath(), JSON.stringify(proof), 'utf8');
    }
    await saveRun(run);

    await updateStage(runId, 'RENDERING_INTERFACE_PREVIEW');
    const result = assertTranslationPackage(providerResult.package, run.authority);
    result.VISUAL_INTERFACE_PREVIEW.visualPreviewRef = await persistVisualPreview(runId, result);
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
      if (error instanceof SolProviderRequestError) {
        run.providerDispatchReceipt = error.dispatchReceipt;
        run.inputReceipt = error.inputReceipt;
        run.outputCompletenessReceipt = error.completenessReceipt;
        run.recoveredSections = error.recoveredSections;
        if (error.rawProviderResponse != null) {
          await writeFile(rawProviderResponsePath(runId), error.rawProviderResponse, {
            encoding: 'utf8',
            mode: 0o600,
          });
          run.rawProviderResponseRef = `sol-raw://${runId}`;
        }
        run.structuredOutputValidationReceipt = error.validationReceipt
          ? {
              ...error.validationReceipt,
              rawResponsePersistedSafely: error.rawProviderResponse != null,
            }
          : null;
      }
      const message = error instanceof Error ? error.message : String(error);
      run.status = message.startsWith('SOL_OUTPUT_TRUNCATED')
        ? 'SOL_OUTPUT_TRUNCATED'
        : message.startsWith('SOL_OUTPUT_VALIDATION_FAILED') ||
            message.startsWith('SOL_STRUCTURED_OUTPUT_PARSE_FAILED')
          ? 'SOL_OUTPUT_VALIDATION_FAILED'
          : 'FAILED';
      run.stageLabel = STAGE_LABELS[run.status];
      run.progress = 100;
      run.etaSeconds = 0;
      run.error = {
        code:
          message.startsWith('GPT_5_6_SOL_PROVIDER_BINDING_FAILED')
            ? 'GPT_5_6_SOL_PROVIDER_BINDING_FAILED'
            : message.startsWith('SOL_STRUCTURED_OUTPUT_REQUEST_INVALID')
              ? 'SOL_STRUCTURED_OUTPUT_REQUEST_INVALID'
              : message.startsWith('OPENAI_RESPONSES_REQUEST_INVALID')
                ? 'OPENAI_RESPONSES_REQUEST_INVALID'
                : message.startsWith('SOL_OUTPUT_TRUNCATED')
                  ? 'SOL_OUTPUT_TRUNCATED'
                  : message.startsWith('SOL_OUTPUT_VALIDATION_FAILED')
                    ? 'SOL_OUTPUT_VALIDATION_FAILED'
                    : message.startsWith('SOL_STRUCTURED_OUTPUT_PARSE_FAILED')
                      ? 'SOL_STRUCTURED_OUTPUT_PARSE_FAILED'
                      : 'SOL_RUN_FAILED',
        message,
      };
      if (run.timing.providerStartedAt && !run.timing.providerCompletedAt) {
        run.timing.providerCompletedAt = new Date().toISOString();
      }
      run.timing.completedAt = new Date().toISOString();
      deriveTiming(run);
      await saveRun(run);
    }
  } finally {
    const finalRun = await getSolDesignBenchRun(runId);
    if (finalRun?.proofMode) activeProofModes.delete(finalRun.proofMode);
    activeJobs.delete(runId);
  }
}

export async function startSolDesignBenchRun(
  request: StartSolDesignBenchRequest,
  options?: {
    retryOfRunId?: string;
    proofMode?: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS';
  },
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
  const readiness = await getSolDesignBenchProviderReadiness({
    referenceImageAvailable: bytes.length > 0,
    imageInputAttachmentPathValid:
      request.reference.dataUrl.startsWith(`data:${request.reference.mime};base64,`) &&
      sha256 === request.reference.sha256.toLowerCase(),
  });
  const effectiveBlockingReasons = options?.proofMode
    ? readiness.blockingReasons.filter(
        (reason) => reason !== 'STRUCTURED_OUTPUT_PIPELINE_PROOF_REQUIRED',
      )
    : readiness.blockingReasons;
  if (effectiveBlockingReasons.length) throw new SolDesignBenchProviderBlockedError(readiness);
  const effectiveReadiness: SolDesignBenchProviderReadinessReceipt = {
    ...readiness,
    state: 'READY',
    blockingReasons: [],
  };
  await ensureRoot();
  const storedFile = referencePath(runId, request.reference.mime);
  await writeFile(storedFile, bytes);
  const now = new Date().toISOString();
  const run: SolDesignBenchRun = {
    runId,
    proofMode: options?.proofMode ?? null,
    proofPassed: null,
    retryOfRunId: options?.retryOfRunId ?? null,
    retryRunIds: [],
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
    providerReadinessReceipt: effectiveReadiness,
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
    structuredOutputValidationReceipt: null,
    structuredOutputRuntimeReceipt: null,
    outputCompletenessReceipt: null,
    rawProviderResponseRef: null,
    recoveredSections: null,
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

export async function startSolStructuredOutputProof(
  proofMode: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS',
): Promise<SolDesignBenchRun> {
  const proof = await readStructuredOutputProof();
  if (
    (proofMode === 'TINY_LIVE_SCHEMA_SMOKE' && proof.tinyLiveSchemaSmokePassed) ||
    (proofMode === 'LARGE_OUTPUT_STRESS' && proof.largeOutputStressPassed)
  ) {
    throw new Error(`SOL_STRUCTURED_OUTPUT_PROOF_ALREADY_PASSED:${proofMode}`);
  }
  if (activeProofModes.has(proofMode)) {
    throw new Error(`SOL_STRUCTURED_OUTPUT_PROOF_ALREADY_RUNNING:${proofMode}`);
  }
  activeProofModes.add(proofMode);
  const bytes = await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: proofMode === 'LARGE_OUTPUT_STRESS' ? '#d7ff3f' : '#ffffff',
    },
  }).png().toBuffer();
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  try {
    return await startSolDesignBenchRun({
      action: 'START_SOL_TEST',
      reference: {
        filename: proofMode === 'LARGE_OUTPUT_STRESS'
          ? 'sol-large-output-stress.png'
          : 'sol-tiny-schema-smoke.png',
        mime: 'image/png',
        bytes: bytes.length,
        width: 32,
        height: 32,
        sha256,
        dataUrl: `data:image/png;base64,${bytes.toString('base64')}`,
      },
    }, { proofMode });
  } catch (error) {
    activeProofModes.delete(proofMode);
    throw error;
  }
}

export async function retrySolDesignBenchRun(sourceRunId: string): Promise<SolDesignBenchRun> {
  const source = await getSolDesignBenchRun(sourceRunId);
  if (!source) throw new Error('SOL_RETRY_SOURCE_RUN_NOT_FOUND');
  if (!['FAILED', 'SOL_OUTPUT_VALIDATION_FAILED', 'SOL_OUTPUT_TRUNCATED'].includes(source.status)) {
    throw new Error('SOL_RETRY_SOURCE_NOT_FAILED');
  }
  const bytes = await readFile(source.authority.storedFile);
  const retried = await startSolDesignBenchRun({
    action: 'START_SOL_TEST',
    reference: {
      filename: source.authority.filename,
      mime: source.authority.mime,
      bytes: source.authority.bytes,
      width: source.authority.width,
      height: source.authority.height,
      sha256: source.authority.sha256,
      dataUrl: `data:${source.authority.mime};base64,${bytes.toString('base64')}`,
    },
  }, { retryOfRunId: sourceRunId });
  source.retryRunIds = [...(source.retryRunIds ?? []), retried.runId];
  await saveRun(source);
  return retried;
}

export async function readSolDesignBenchPreview(runId: string): Promise<Buffer> {
  return readFile(visualPreviewPath(runId));
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

export function setSolStructuredOutputProofForTests(
  proof: StructuredOutputProofState | null,
): void {
  structuredOutputProofOverride = proof;
}

export async function resetSolDesignBenchForTests(): Promise<void> {
  runCache.clear();
  activeJobs.clear();
  activeProofModes.clear();
  structuredOutputProofOverride = null;
}
