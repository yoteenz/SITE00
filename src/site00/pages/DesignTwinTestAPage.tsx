import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GrokTwinTestAArtboard } from '../components/designBench/GrokTwinTestAArtboard.js';
import {
  GROK_ACTIVE_STAGES,
  GROK_DESIGN_BENCH_POLL_INTERVAL_MS,
  GROK_DESIGN_BENCH_STALL_MS,
  GROK_TERMINAL_STAGES,
  P0_VR_DESIGNBENCH_GROK1_BUILD,
  GROK_TWIN_TEST_A_HEADER,
  GROK_TWIN_TEST_A_MODEL_LABEL,
  GROK_TWIN_TEST_A_PROVIDER_LABEL,
  GROK_TWIN_TEST_A_SUBHEADER,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_4_6_PROVIDER_BINDING_FAILED, GROK_DESIGN_BENCH_MODEL_ID } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import type {
  GrokDesignBenchHostDiagnostic,
  GrokDesignBenchProviderReadinessReceipt,
} from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  clearPersistedGrokTwinTestARun,
  archiveGrokTwinTestAIncident,
  markGrokTwinTestAServerLost,
  persistGrokTwinTestARun,
  readPersistedGrokTwinTestARun,
  readGrokTwinTestAIncidents,
  historicalGrokTwinTestAAverageMs,
} from '../../../shared/site00-design-bench/grokTwinTestA/persist.js';
import { sha256HexFromBytes } from '../../../shared/site00-design-bench/grokTwinTestA/sha256.js';
import { evaluateGrokEta, formatDurationMmSs } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import { formatAspectRatio, validateGrokReferenceUpload } from '../../../shared/site00-design-bench/grokTwinTestA/uploadValidation.js';
import type { GrokDesignBenchResultTab, GrokDesignBenchRun } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import {
  cancelGrokTwinTestARun,
  fetchGrokTwinTestAReadiness,
  fetchGrokTwinTestARuntimeHealth,
  pollGrokTwinTestARun,
  startGrokTwinTestARun,
} from '../services/grokTwinTestAClient.js';
import '../styles/site00-twin-test-a.css';

type LocalReference = {
  file: File;
  objectUrl: string;
  dataUrl: string;
  sha256: string;
  width: number;
  height: number;
  mime: string;
};

const TABS: GrokDesignBenchResultTab[] = [
  'VISUAL_DESIGN',
  'FIGMA_SPEC',
  'COMPONENTS',
  'TOKENS',
  'ASSETS',
  'HIERARCHY',
  'IMPLEMENTATION_HANDOFF',
  'RUN_METRICS',
];

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
    img.src = url;
  });
}

export function DesignTwinTestAPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localRef, setLocalRef] = useState<LocalReference | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [run, setRun] = useState<GrokDesignBenchRun | null>(() => readPersistedGrokTwinTestARun());
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<GrokDesignBenchResultTab>('VISUAL_DESIGN');
  const [zoom, setZoom] = useState<'FIT' | '100%' | 'ZOOM'>('FIT');
  const [sideBySide, setSideBySide] = useState(true);
  const [starting, setStarting] = useState(false);
  const [readiness, setReadiness] = useState<GrokDesignBenchProviderReadinessReceipt | null>(null);
  const [hostDiagnostic, setHostDiagnostic] = useState<GrokDesignBenchHostDiagnostic | null>(null);
  const [failureOpen, setFailureOpen] = useState(false);
  const [runtimeHealth, setRuntimeHealth] = useState<{
    founderRunReady: boolean;
    modelAccess: string;
    imageInput: string;
    providerTimingProbe: string;
    polling: string;
    stallWatchdog: string;
    timeout: string;
    timingProbe?: { providerLatencyMs: number | null; totalLatencyMs: number | null; pass: boolean };
  } | null>(null);
  const [lastPollAt, setLastPollAt] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [incidentCount] = useState(() => readGrokTwinTestAIncidents().length);

  const active = Boolean(run && GROK_ACTIVE_STAGES.includes(run.stage as (typeof GROK_ACTIVE_STAGES)[number]));
  const frozen = Boolean(run?.reference?.immutableForRun && active);
  const providerReady = readiness?.state === 'READY' && readiness.benchmarkReady === true;
  const founderRunReady = runtimeHealth?.founderRunReady === true;
  const startDisabled = !localRef || frozen || starting || active || !providerReady || !founderRunReady;

  useEffect(() => {
    let cancelled = false;
    void fetchGrokTwinTestAReadiness()
      .then((next) => {
        if (!cancelled) {
          setReadiness(next.readiness);
          setHostDiagnostic(next.hostDiagnostic);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setHostDiagnostic(null);
          setReadiness({
            state: 'BLOCKED',
            reason: err instanceof Error ? err.message : 'Readiness check failed',
            provider: 'xai',
            modelId: GROK_DESIGN_BENCH_MODEL_ID,
            xaiApiKeyPresent: false,
            grok46Access: 'UNKNOWN',
            liveModelSmoke: 'SKIPPED',
            benchmarkReady: false,
            availableLanguageModels: [],
            requestEndpoint: 'https://api.x.ai/v1/responses',
            requestMethod: 'POST',
            modelField: GROK_DESIGN_BENCH_MODEL_ID,
            modelHardBound: true,
            fallbackAllowed: false,
            webSearchAllowed: false,
            visionInputRequired: true,
            imageInputCanAttach: Boolean(localRef),
            competitorAccessAllowed: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [localRef]);

  useEffect(() => {
    const persisted = readPersistedGrokTwinTestARun();
    if (!persisted?.timing.queuedAt) return;
    const elapsed = Date.now() - Date.parse(persisted.timing.queuedAt);
    if (
      GROK_ACTIVE_STAGES.includes(persisted.stage as (typeof GROK_ACTIVE_STAGES)[number]) &&
      elapsed >= GROK_DESIGN_BENCH_STALL_MS
    ) {
      archiveGrokTwinTestAIncident(persisted);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchGrokTwinTestARuntimeHealth()
      .then((next) => {
        if (!cancelled) setRuntimeHealth(next);
      })
      .catch(() => {
        if (!cancelled) {
          setRuntimeHealth({
            founderRunReady: false,
            modelAccess: 'FAIL',
            imageInput: 'FAIL',
            providerTimingProbe: 'FAIL',
            polling: 'FAIL',
            stallWatchdog: 'FAIL',
            timeout: 'FAIL',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!run || GROK_TERMINAL_STAGES.includes(run.stage as (typeof GROK_TERMINAL_STAGES)[number])) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [run?.stage, run?.runId]);

  useEffect(() => {
    if (!run?.runId) return;
    persistGrokTwinTestARun(run);
  }, [run]);

  useEffect(() => {
    if (readiness?.state !== 'READY' || run?.stage !== 'FAILED') return;
    const text = `${run.error ?? ''}`;
    if (!/missing on the API host/i.test(text) && !/Railway API service/i.test(text)) return;
    clearPersistedGrokTwinTestARun();
    setRun(null);
  }, [readiness?.state, run]);

  useEffect(() => {
    if (!run?.runId || GROK_TERMINAL_STAGES.includes(run.stage as (typeof GROK_TERMINAL_STAGES)[number])) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await pollGrokTwinTestARun(run.runId);
        if (!cancelled) {
          setLastPollAt(new Date().toISOString());
          setRun(next);
        }
      } catch (err) {
        if (!cancelled && err instanceof Error && err.message === 'RUN_NOT_FOUND') {
          setRun(markGrokTwinTestAServerLost(run));
        }
      }
    };
    const id = window.setInterval(() => void tick(), GROK_DESIGN_BENCH_POLL_INTERVAL_MS);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [run?.runId, run?.stage]);

  const elapsedMs = useMemo(() => {
    if (!run?.timing.queuedAt) return 0;
    const end = run.timing.completedAt ? Date.parse(run.timing.completedAt) : now;
    return Math.max(end - Date.parse(run.timing.queuedAt), 0);
  }, [run, now]);

  const eta = useMemo(() => {
    if (!run) return null;
    return evaluateGrokEta({
      stage: run.stage,
      elapsedMs,
      historicalAverageMs: historicalGrokTwinTestAAverageMs(),
      lastStateChangeAt:
        run.lastStateChangeAt ?? run.timing.providerStartedAt ?? run.timing.startedAt ?? run.timing.queuedAt,
    });
  }, [run, elapsedMs]);

  async function onFiles(files: FileList | null) {
    const file = files?.[0];
    setUploadError(null);
    if (!file) return;
    const check = validateGrokReferenceUpload({ filename: file.name, mime: file.type, byteLength: file.size });
    if (!check.ok || !check.mime) {
      setUploadError(check.reason ?? 'Invalid file');
      return;
    }
    const bytes = await file.arrayBuffer();
    const sha256 = await sha256HexFromBytes(bytes);
    const objectUrl = URL.createObjectURL(file);
    try {
      const size = await readImageSize(objectUrl);
      const dataUrl = await fileToDataUrl(file);
      if (localRef?.objectUrl) URL.revokeObjectURL(localRef.objectUrl);
      setLocalRef({
        file,
        objectUrl,
        dataUrl,
        sha256,
        width: size.width,
        height: size.height,
        mime: check.mime,
      });
    } catch {
      URL.revokeObjectURL(objectUrl);
      setUploadError('Could not read image');
    }
  }

  function removeReference() {
    if (frozen) return;
    if (localRef?.objectUrl) URL.revokeObjectURL(localRef.objectUrl);
    setLocalRef(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function startTest() {
    if (!localRef || startDisabled) return;
    setStarting(true);
    setUploadError(null);
    try {
      const next = await startGrokTwinTestARun({
        projectId,
        filename: localRef.file.name,
        mime: localRef.mime,
        width: localRef.width,
        height: localRef.height,
        imageBase64: localRef.dataUrl,
      });
      setRun(next);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'START_FAILED');
    } finally {
      setStarting(false);
    }
  }

  async function cancelTest() {
    if (!run?.runId || !active || cancelling) return;
    setCancelling(true);
    try {
      const next = await cancelGrokTwinTestARun(run.runId);
      setRun(next);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'CANCEL_FAILED');
    } finally {
      setCancelling(false);
    }
  }

  const previewSrc = localRef?.objectUrl ?? run?.reference?.imageUrl ?? '';
  const previewMeta = localRef
    ? {
        filename: localRef.file.name,
        width: localRef.width,
        height: localRef.height,
        size: localRef.file.size,
        sha256: localRef.sha256,
      }
    : run?.reference
      ? {
          filename: run.reference.filename,
          width: run.reference.width,
          height: run.reference.height,
          size: run.reference.byteLength,
          sha256: run.reference.sha256,
        }
      : null;

  const fitScale = run?.package?.visualInterfacePreview
    ? Math.min(1, 390 / run.package.visualInterfacePreview.frameWidth)
    : 1;
  const artboardScale = zoom === '100%' ? 1 : zoom === 'ZOOM' ? 1.5 : fitScale;

  return (
    <div className="site00-page twin-test-a" data-testid="twin-test-a-page">
      <header className="twin-test-a__header" data-testid="twin-test-a-header">
        <div>
          <h1 className="twin-test-a__title">{GROK_TWIN_TEST_A_HEADER}</h1>
          <p className="twin-test-a__sub" data-testid="twin-test-a-model-label">
            {GROK_TWIN_TEST_A_SUBHEADER}
          </p>
          <p className="twin-test-a__model-id" data-testid="twin-test-a-model-id">
            {GROK_TWIN_TEST_A_MODEL_LABEL}
          </p>
        </div>
        <div className="twin-test-a__build">{P0_VR_DESIGNBENCH_GROK1_BUILD}</div>
      </header>

      <main className="twin-test-a__main">
        {starting || (run && GROK_ACTIVE_STAGES.includes(run.stage as (typeof GROK_ACTIVE_STAGES)[number])) ? (
          <section className="twin-test-a__progress" data-testid="twin-test-a-progress">
            <h2>GROK IS TRANSLATING YOUR INTERFACE</h2>
            <div className="twin-test-a__bar" data-testid="twin-test-a-progress-bar">
              <span style={{ width: `${run?.progressPercent ?? 4}%` }} />
            </div>
            <div className="twin-test-a__progress-meta">
              <div data-testid="twin-test-a-stage">
                CURRENT STAGE:
                <br />
                {run?.stageLabel ?? 'Queued for Grok…'}
              </div>
              <div data-testid="twin-test-a-elapsed">
                ELAPSED:
                <br />
                {formatDurationMmSs(elapsedMs)}
              </div>
              <div data-testid="twin-test-a-eta">
                ESTIMATED REMAINING:
                <br />
                <span data-testid="twin-test-a-eta-label">
                  {eta?.kind === 'POSSIBLE_STALL'
                    ? 'POSSIBLE STALL'
                    : eta?.kind === 'TAKING_LONGER'
                      ? 'TAKING LONGER THAN EXPECTED'
                      : eta?.label ?? '—'}
                </span>
                <div className="twin-test-a__eta-note" data-testid="twin-test-a-eta-approximate">
                  {eta?.kind === 'POSSIBLE_STALL'
                    ? 'STATUS: POSSIBLE STALL · no stage change for 5+ minutes'
                    : eta?.kind === 'TAKING_LONGER'
                      ? 'ETA is approximate · taking longer than expected'
                      : 'ETA is approximate · stage-based'}
                </div>
              </div>
            </div>
            {run?.stall?.stalled ? (
              <p className="twin-test-a__stall" data-testid="twin-test-a-stalled">
                RUN_STALLED · {run.stall.stalledStage} · PROVIDER {run.stall.providerRequestStatus}
              </p>
            ) : null}
            <div className="twin-test-a__actions">
              <button
                type="button"
                className="twin-test-a__cancel"
                data-testid="twin-test-a-cancel"
                disabled={cancelling || run?.cancelStatus === 'CANCEL_REQUESTED'}
                onClick={() => void cancelTest()}
              >
                {run?.cancelStatus === 'CANCEL_REQUESTED' ? 'CANCEL REQUESTED' : 'CANCEL TEST'}
              </button>
            </div>
          </section>
        ) : null}

        {run?.stage === 'COMPLETE' ? (
          <p className="twin-test-a__complete-banner" data-testid="twin-test-a-complete">
            GROK COMPLETED IN
            <strong>{formatDurationMmSs(run.timing.totalDurationMs)}</strong>
          </p>
        ) : null}

        {run?.stage === 'CANCELLED' ? (
          <p className="twin-test-a__complete-banner" data-testid="twin-test-a-cancelled">
            GROK TEST CANCELLED
            <strong>{formatDurationMmSs(run.timing.totalDurationMs)}</strong>
          </p>
        ) : null}

        {run?.stage === 'FAILED' ? (
          <div className="twin-test-a__error-block" data-testid="twin-test-a-failed">
            <p className="twin-test-a__error">
              {run.providerFailure?.code === GROK_4_6_PROVIDER_BINDING_FAILED
                ? GROK_4_6_PROVIDER_BINDING_FAILED
                : run.error}
            </p>
            {run.error === 'SERVER_RUN_LOST' || run.error === 'GROK_PROVIDER_TIMEOUT' || run.stall?.stalled ? (
              <dl className="twin-test-a__metrics" data-testid="twin-test-a-incident-timing">
                <dt>STALLED STAGE</dt>
                <dd>{run.stall?.stalledStage ?? run.stage}</dd>
                <dt>ELAPSED</dt>
                <dd>{formatDurationMmSs(run.timing.totalDurationMs ?? elapsedMs)}</dd>
                <dt>PROVIDER REQUEST</dt>
                <dd>{run.providerRequestStatus ?? run.stall?.providerRequestStatus ?? 'UNKNOWN'}</dd>
                <dt>LAST STATE CHANGE</dt>
                <dd>{run.lastStateChangeAt ?? run.stall?.lastStateChange ?? '—'}</dd>
                <dt>PRESERVED</dt>
                <dd>YES</dd>
              </dl>
            ) : null}
            {run.providerFailure ? (
              <details
                className="twin-test-a__failure-details"
                data-testid="twin-test-a-binding-failure"
                open={failureOpen}
                onToggle={(e) => setFailureOpen((e.target as HTMLDetailsElement).open)}
              >
                <summary>TECHNICAL DETAILS</summary>
                <dl>
                  <dt>PROVIDER RESPONSE CODE</dt>
                  <dd>{run.providerFailure.providerResponseCode ?? '—'}</dd>
                  <dt>CLASSIFICATION</dt>
                  <dd>{run.providerFailure.classification}</dd>
                  <dt>RUN ID</dt>
                  <dd>{run.providerFailure.runId}</dd>
                  <dt>MODEL</dt>
                  <dd>{GROK_DESIGN_BENCH_MODEL_ID}</dd>
                </dl>
              </details>
            ) : null}
          </div>
        ) : null}

        {readiness ? (
          <section className="twin-test-a__readiness" data-testid="twin-test-a-readiness">
            <h2 className="twin-test-a__section-label">PROVIDER READINESS</h2>
            <p data-testid="twin-test-a-readiness-state">
              {readiness.state}
              {readiness.reason ? ` · ${readiness.reason}` : ''}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-bound-model">
              {GROK_TWIN_TEST_A_PROVIDER_LABEL} · {GROK_DESIGN_BENCH_MODEL_ID}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-key-present">
              XAI KEY: {readiness.xaiApiKeyPresent ? 'PRESENT' : 'MISSING'}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-grok-access">
              GROK 4.6 ACCESS: {readiness.grok46Access}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-model-smoke">
              LIVE MODEL SMOKE: {readiness.liveModelSmoke}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-benchmark-ready">
              BENCHMARK READY: {readiness.benchmarkReady ? 'YES' : 'NO'}
            </p>
            {readiness.grok46Access === 'UNAVAILABLE' && readiness.availableLanguageModels.length ? (
              <p className="twin-test-a__hint" data-testid="twin-test-a-available-models">
                AVAILABLE GROK MODELS: {readiness.availableLanguageModels.filter((id) => id.toLowerCase().includes('grok')).join(', ') || 'none'}
              </p>
            ) : null}
            {hostDiagnostic ? (
              <dl className="twin-test-a__host-diagnostic" data-testid="twin-test-a-host-diagnostic">
                <div>
                  <dt>RUNTIME</dt>
                  <dd data-testid="twin-test-a-diag-runtime">{hostDiagnostic.runtime}</dd>
                </div>
                <div>
                  <dt>HOST</dt>
                  <dd data-testid="twin-test-a-diag-host">{hostDiagnostic.host}</dd>
                </div>
                <div>
                  <dt>ENVIRONMENT</dt>
                  <dd data-testid="twin-test-a-diag-environment">{hostDiagnostic.environment}</dd>
                </div>
                <div>
                  <dt>XAI KEY PRESENT</dt>
                  <dd data-testid="twin-test-a-diag-key">{hostDiagnostic.xaiKeyPresent ? 'YES' : 'NO'}</dd>
                </div>
                <div>
                  <dt>MODEL</dt>
                  <dd data-testid="twin-test-a-diag-model">{hostDiagnostic.modelId}</dd>
                </div>
              </dl>
            ) : null}
          </section>
        ) : null}

        {runtimeHealth ? (
          <section className="twin-test-a__readiness" data-testid="twin-test-a-runtime-health">
            <h2 className="twin-test-a__section-label">GROK_RUNTIME_HEALTH</h2>
            <p data-testid="twin-test-a-founder-run-ready">
              FOUNDER_RUN_READY: {runtimeHealth.founderRunReady ? 'YES' : 'NO'}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-model-access">
              MODEL_ACCESS: {runtimeHealth.modelAccess}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-image-input">
              IMAGE_INPUT: {runtimeHealth.imageInput}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-timing-probe">
              PROVIDER_TIMING_PROBE: {runtimeHealth.providerTimingProbe}
              {runtimeHealth.timingProbe?.providerLatencyMs != null
                ? ` · ${runtimeHealth.timingProbe.providerLatencyMs}ms`
                : ''}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-polling">
              POLLING: {runtimeHealth.polling}
              {lastPollAt ? ` · LAST ${lastPollAt}` : ''}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-watchdog">
              STALL_WATCHDOG: {runtimeHealth.stallWatchdog}
            </p>
            <p className="twin-test-a__hint" data-testid="twin-test-a-health-timeout">
              TIMEOUT: {runtimeHealth.timeout}
            </p>
            {incidentCount > 0 ? (
              <p className="twin-test-a__hint" data-testid="twin-test-a-incident-preserved">
                PRIOR LONG RUN PRESERVED: YES · {incidentCount} incident{incidentCount === 1 ? '' : 's'}
              </p>
            ) : null}
          </section>
        ) : null}

        {run?.stage !== 'COMPLETE' ? (
          <section data-testid="twin-test-a-reference">
            <h2 className="twin-test-a__section-label">REFERENCE IMAGE</h2>
            {!previewMeta ? (
              <label className="twin-test-a__picker" data-testid="twin-test-a-file-picker">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => void onFiles(e.target.files)}
                />
                <span className="twin-test-a__picker-title">LARGE FILE PICKER</span>
                <p className="twin-test-a__hint">
                  UPLOAD THE GOLDEN INTERFACE REFERENCE GROK SHOULD TRANSLATE.
                </p>
                <p className="twin-test-a__hint">Accepted: PNG JPG JPEG WEBP</p>
              </label>
            ) : (
              <div className="twin-test-a__preview-wrap" data-testid="twin-test-a-preview">
                <img src={previewSrc} alt="" data-testid="twin-test-a-preview-image" />
                <dl className="twin-test-a__meta">
                  <div>
                    <dt>FILENAME</dt>
                    <strong data-testid="twin-test-a-filename">{previewMeta.filename}</strong>
                  </div>
                  <div>
                    <dt>SIZE</dt>
                    <strong data-testid="twin-test-a-dims">
                      {previewMeta.width} × {previewMeta.height}
                    </strong>
                  </div>
                  <div>
                    <dt>ASPECT</dt>
                    <strong data-testid="twin-test-a-aspect">
                      {formatAspectRatio(previewMeta.width, previewMeta.height)}
                    </strong>
                  </div>
                  <div>
                    <dt>FILE SIZE</dt>
                    <strong data-testid="twin-test-a-bytes">{previewMeta.size} bytes</strong>
                  </div>
                  <div>
                    <dt>SHA256</dt>
                    <strong data-testid="twin-test-a-sha256">{previewMeta.sha256}</strong>
                  </div>
                </dl>
                <div className="twin-test-a__actions">
                  <button
                    type="button"
                    disabled={frozen}
                    data-testid="twin-test-a-replace"
                    onClick={() => inputRef.current?.click()}
                  >
                    REPLACE
                  </button>
                  <button type="button" disabled={frozen} data-testid="twin-test-a-remove" onClick={removeReference}>
                    REMOVE
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                    hidden
                    onChange={(e) => void onFiles(e.target.files)}
                  />
                </div>
              </div>
            )}
            {uploadError ? (
              <p className="twin-test-a__error" data-testid="twin-test-a-upload-error">
                {uploadError}
              </p>
            ) : null}
            <div className="twin-test-a__actions">
              <button
                type="button"
                className="twin-test-a__start"
                data-testid="twin-test-a-start"
                disabled={startDisabled}
                onClick={() => void startTest()}
              >
                START GROK TEST
              </button>
            </div>
            {!founderRunReady ? (
              <p className="twin-test-a__hint" data-testid="twin-test-a-start-blocked">
                START blocked until GROK_RUNTIME_HEALTH passes. Founder golden is not retried automatically.
              </p>
            ) : null}
          </section>
        ) : null}

        {run?.stage === 'COMPLETE' && run.package ? (
          <section data-testid="twin-test-a-results">
            <div className="twin-test-a__tabs" data-testid="twin-test-a-tabs">
              {TABS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={tab === id ? 'is-on' : ''}
                  data-testid={`twin-test-a-tab-${id}`}
                  onClick={() => setTab(id)}
                >
                  {id.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {tab === 'VISUAL_DESIGN' ? (
              <div data-testid="twin-test-a-visual-design">
                <div className="twin-test-a__zoom">
                  <button type="button" className={zoom === 'FIT' ? 'is-on' : ''} onClick={() => setZoom('FIT')}>
                    FIT
                  </button>
                  <button type="button" className={zoom === '100%' ? 'is-on' : ''} onClick={() => setZoom('100%')}>
                    100%
                  </button>
                  <button type="button" className={zoom === 'ZOOM' ? 'is-on' : ''} onClick={() => setZoom('ZOOM')}>
                    ZOOM
                  </button>
                  <button
                    type="button"
                    className={sideBySide ? 'is-on' : ''}
                    data-testid="twin-test-a-side-by-side"
                    onClick={() => setSideBySide((v) => !v)}
                  >
                    SIDE BY SIDE
                  </button>
                </div>
                <div className={`twin-test-a__compare${sideBySide ? ' is-side' : ''}`}>
                  <div className="twin-test-a__compare-pane">
                    <h3>REFERENCE</h3>
                    <div className="twin-test-a__scroll">
                      <img src={previewSrc} alt="Reference" />
                    </div>
                  </div>
                  <div className="twin-test-a__compare-pane">
                    <h3>GROK TRANSLATION</h3>
                    <div className="twin-test-a__scroll">
                      <GrokTwinTestAArtboard preview={run.package.visualInterfacePreview} scale={artboardScale} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'FIGMA_SPEC' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-figma-spec">
                {JSON.stringify({ pageFrameSpec: run.package.pageFrameSpec, sectionTree: run.package.sectionTree, layoutGeometrySpec: run.package.layoutGeometrySpec }, null, 2)}
              </pre>
            ) : null}
            {tab === 'COMPONENTS' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-components">
                {JSON.stringify(run.package.componentTree, null, 2)}
              </pre>
            ) : null}
            {tab === 'TOKENS' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-tokens">
                {JSON.stringify(
                  {
                    typographySystem: run.package.typographySystem,
                    colorSystem: run.package.colorSystem,
                    spacingSystem: run.package.spacingSystem,
                    borderRadiusSurfaceSystem: run.package.borderRadiusSurfaceSystem,
                  },
                  null,
                  2,
                )}
              </pre>
            ) : null}
            {tab === 'ASSETS' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-assets">
                {JSON.stringify(run.package.assetPlacementMap, null, 2)}
              </pre>
            ) : null}
            {tab === 'HIERARCHY' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-hierarchy">
                {JSON.stringify(run.package.visualHierarchyMap, null, 2)}
              </pre>
            ) : null}
            {tab === 'IMPLEMENTATION_HANDOFF' ? (
              <pre className="twin-test-a__spec" data-testid="twin-test-a-handoff">
                {JSON.stringify({ implementationHandoff: run.package.implementationHandoff, doNotChangeRules: run.package.doNotChangeRules }, null, 2)}
              </pre>
            ) : null}
            {tab === 'RUN_METRICS' ? (
              <dl className="twin-test-a__metrics" data-testid="twin-test-a-metrics">
                <dt>PROVIDER</dt>
                <dd data-testid="twin-test-a-metrics-provider">{GROK_TWIN_TEST_A_PROVIDER_LABEL}</dd>
                <dt>MODEL</dt>
                <dd data-testid="twin-test-a-metrics-model">{run.modelId ?? GROK_DESIGN_BENCH_MODEL_ID}</dd>
                <dt>RUN ID</dt>
                <dd>{run.runId}</dd>
                <dt>REFERENCE SHA256</dt>
                <dd>{run.reference?.sha256}</dd>
                <dt>QUEUE</dt>
                <dd data-testid="twin-test-a-queue-time">{formatDurationMmSs(run.timing.queueDurationMs)}</dd>
                <dt>UPLOAD</dt>
                <dd data-testid="twin-test-a-upload-time">{formatDurationMmSs(run.timing.uploadDurationMs)}</dd>
                <dt>PROVIDER</dt>
                <dd data-testid="twin-test-a-provider-time">{formatDurationMmSs(run.timing.modelDurationMs)}</dd>
                <dt>POST PROCESS</dt>
                <dd data-testid="twin-test-a-post-process-time">{formatDurationMmSs(run.timing.postProcessingDurationMs)}</dd>
                <dt>TOTAL</dt>
                <dd data-testid="twin-test-a-total-time">{formatDurationMmSs(run.timing.totalDurationMs)}</dd>
                <dt>OUTPUT TOKENS</dt>
                <dd data-testid="twin-test-a-output-tokens">{run.cost.completionTokens ?? '—'}</dd>
                <dt>OUTPUT SIZE</dt>
                <dd data-testid="twin-test-a-output-size">{run.outputBytes ?? '—'}</dd>
                <dt>TRUNCATED</dt>
                <dd data-testid="twin-test-a-truncated">{run.responseTruncated ? 'YES' : 'NO'}</dd>
                <dt>COST</dt>
                <dd>
                  {run.cost.reported && run.cost.amount != null
                    ? `${run.cost.currency ?? 'USD'} ${run.cost.amount}`
                    : run.cost.note}
                  {run.cost.totalTokens != null ? ` · ${run.cost.totalTokens} tokens` : ''}
                </dd>
              </dl>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
