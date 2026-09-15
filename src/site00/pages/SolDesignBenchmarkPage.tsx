import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { site00ApiUrl } from '../../utils/site00ApiBase';
import type {
  FigmaStyleInterfaceTranslationPackage,
  SolBenchComponentSpec,
  SolDesignBenchRun,
  StartSolDesignBenchRequest,
} from '../../../shared/site00-sol-design-bench/contracts';
import '../styles/site00-sol-design-benchmark.css';

const ACCEPTED_MIMES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const LAST_RUN_KEY = 'site00:sol-design-bench:last-run:v1';
const RESULT_TABS = [
  'VISUAL DESIGN',
  'FIGMA SPEC',
  'COMPONENTS',
  'TOKENS',
  'ASSETS',
  'HIERARCHY',
  'IMPLEMENTATION HANDOFF',
  'RUN METRICS',
] as const;
type ResultTab = (typeof RESULT_TABS)[number];
type CompareMode = 'REFERENCE' | 'TRANSLATION' | 'SIDE BY SIDE';
type ZoomMode = 'FIT' | '100%';

interface LocalReference {
  file: File;
  dataUrl: string;
  objectUrl: string;
  width: number;
  height: number;
  sha256: string;
}

interface SolProviderStatus {
  provider: 'OpenAI';
  modelId: 'gpt-5.6-sol';
  reasoningEffort: 'high';
  fallbackAllowed: false;
  webSearchEnabled: false;
  providerReadiness: {
    state: 'READY' | 'BLOCKED';
    openAiCredentialPresentServerSide: boolean;
    blockingReasons: string[];
  };
  promptVersion: string;
  promptHash: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—';
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatRecord(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(formatRecord).join(' · ');
  return Object.entries(value as Record<string, unknown>)
    .map(([key, row]) => `${key}: ${formatRecord(row)}`)
    .join(' · ');
}

async function inspectFile(file: File): Promise<LocalReference> {
  if (!ACCEPTED_MIMES.includes(file.type as (typeof ACCEPTED_MIMES)[number])) {
    throw new Error('Use a PNG, JPEG, or WebP image.');
  }
  const bytes = await file.arrayBuffer();
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('The selected file is not a readable image.'));
    image.src = dataUrl;
  });
  return {
    file,
    dataUrl,
    objectUrl: URL.createObjectURL(file),
    sha256,
    ...dimensions,
  };
}

function ReferenceMetadata({ reference }: { reference: LocalReference }) {
  return (
    <dl className="sol-bench-meta" data-testid="sol-reference-metadata">
      <div><dt>Filename</dt><dd>{reference.file.name}</dd></div>
      <div><dt>MIME</dt><dd>{reference.file.type}</dd></div>
      <div><dt>Bytes</dt><dd>{reference.file.size} · {formatBytes(reference.file.size)}</dd></div>
      <div><dt>Intrinsic</dt><dd>{reference.width} × {reference.height}</dd></div>
      <div><dt>Aspect ratio</dt><dd>{(reference.width / reference.height).toFixed(4)} : 1</dd></div>
      <div className="sol-bench-meta__hash"><dt>SHA256</dt><dd>{reference.sha256}</dd></div>
    </dl>
  );
}

function PreviewArtboard({
  package: pkg,
  referenceUrl,
  zoom,
}: {
  package: FigmaStyleInterfaceTranslationPackage;
  referenceUrl: string;
  zoom: ZoomMode;
}) {
  const frame = pkg.VISUAL_INTERFACE_PREVIEW;
  const components = pkg.COMPONENT_TREE;
  return (
    <div className={`sol-bench-artboard-wrap sol-bench-artboard-wrap--${zoom.toLowerCase()}`}>
      <svg
        className="sol-bench-artboard"
        viewBox={`0 0 ${frame.artboardWidth} ${frame.artboardHeight}`}
        width={zoom === '100%' ? frame.artboardWidth : undefined}
        height={zoom === '100%' ? frame.artboardHeight : undefined}
        role="img"
        aria-label="Sol visual translation artboard"
        data-testid="sol-visual-translation"
      >
        <defs>
          {components.filter((row) => row.assetId).map((row) => (
            <clipPath id={`clip-${row.componentId.replace(/[^a-zA-Z0-9_-]/g, '')}`} key={row.componentId}>
              <rect x={row.x} y={row.y} width={row.width} height={row.height} rx={row.style?.borderRadius ?? 0} />
            </clipPath>
          ))}
        </defs>
        <rect width={frame.artboardWidth} height={frame.artboardHeight} fill={frame.background || '#fff'} />
        {components.map((component) => {
          if (component.width <= 0 || component.height <= 0) return null;
          const clipId = `clip-${component.componentId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
          return (
            <g key={component.componentId} data-component-id={component.componentId}>
              <rect
                x={component.x}
                y={component.y}
                width={component.width}
                height={component.height}
                rx={component.style?.borderRadius ?? 0}
                fill={component.style?.background || 'transparent'}
                stroke={component.style?.border?.match(/#[a-fA-F0-9]{3,8}/)?.[0] || 'transparent'}
              />
              {component.assetId ? (
                <image
                  href={referenceUrl}
                  x={component.x}
                  y={component.y}
                  width={component.width}
                  height={component.height}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${clipId})`}
                />
              ) : null}
              {component.text ? (
                <text
                  x={component.x + Math.max(2, Number(component.padding) || 0)}
                  y={component.y + (component.style?.fontSize || 16)}
                  fill={component.style?.color || '#111'}
                  fontSize={component.style?.fontSize || 16}
                  fontWeight={component.style?.fontWeight || 400}
                >
                  {component.text.slice(0, 100)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HumanSpecSection({ title, value }: { title: string; value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <section className="sol-bench-spec-section">
        <h3>{title}</h3>
        {value.map((row, index) => (
          <div className="sol-bench-spec-row" key={`${title}-${index}`}>{formatRecord(row)}</div>
        ))}
      </section>
    );
  }
  return (
    <section className="sol-bench-spec-section">
      <h3>{title}</h3>
      {Object.entries((value || {}) as Record<string, unknown>).map(([key, row]) => (
        <div className="sol-bench-spec-row" key={key}><strong>{key}</strong><span>{formatRecord(row)}</span></div>
      ))}
    </section>
  );
}

function ComponentInspector({ components }: { components: SolBenchComponentSpec[] }) {
  const [selected, setSelected] = useState(components[0]?.componentId || '');
  const active = components.find((row) => row.componentId === selected) || components[0];
  return (
    <div className="sol-bench-components">
      <div className="sol-bench-tree">
        {components.map((row) => {
          let depth = 0;
          let parentId = row.parentId;
          const seen = new Set<string>();
          while (parentId && depth < 8 && !seen.has(parentId)) {
            seen.add(parentId);
            depth += 1;
            parentId = components.find((candidate) => candidate.componentId === parentId)?.parentId || null;
          }
          return (
            <button
              className={row.componentId === active?.componentId ? 'is-active' : ''}
              key={row.componentId}
              onClick={() => setSelected(row.componentId)}
              style={{ paddingLeft: 14 + depth * 16 }}
            >
              <span>{row.label}</span><small>{row.visualPriority}</small>
            </button>
          );
        })}
      </div>
      {active ? (
        <div className="sol-bench-inspector">
          <h3>{active.label}</h3>
          <dl>
            <div><dt>Parent</dt><dd>{active.parentId || 'PAGE'}</dd></div>
            <div><dt>Semantic role</dt><dd>{active.semanticRole}</dd></div>
            <div><dt>Visual role</dt><dd>{active.visualRole}</dd></div>
            <div><dt>Bounds</dt><dd>{active.x}, {active.y} · {active.width} × {active.height}</dd></div>
            <div><dt>Layout</dt><dd>{active.layoutMode} · {active.alignment}</dd></div>
            <div><dt>Styling</dt><dd>{formatRecord(active.style)}</dd></div>
            <div><dt>Asset</dt><dd>{active.assetId || 'None'}</dd></div>
            <div><dt>State</dt><dd>{active.state || 'Neutral / not evidenced'}</dd></div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function ResultsWorkspace({
  run,
  referenceUrl,
}: {
  run: SolDesignBenchRun;
  referenceUrl: string;
}) {
  const [tab, setTab] = useState<ResultTab>('VISUAL DESIGN');
  const [compare, setCompare] = useState<CompareMode>('SIDE BY SIDE');
  const [zoom, setZoom] = useState<ZoomMode>('FIT');
  const pkg = run.result!;
  const showReference = compare !== 'TRANSLATION';
  const showTranslation = compare !== 'REFERENCE';

  return (
    <section className="sol-bench-results" data-testid="sol-result-workspace">
      <div className="sol-bench-tabs" role="tablist">
        {RESULT_TABS.map((value) => (
          <button role="tab" aria-selected={tab === value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)} key={value}>
            {value}
          </button>
        ))}
      </div>
      <div className="sol-bench-result-panel">
        {tab === 'VISUAL DESIGN' ? (
          <>
            <div className="sol-bench-review-controls">
              {(['REFERENCE', 'TRANSLATION', 'SIDE BY SIDE'] as const).map((value) => (
                <button className={compare === value ? 'is-active' : ''} onClick={() => setCompare(value)} key={value}>{value}</button>
              ))}
              <span />
              {(['FIT', '100%'] as const).map((value) => (
                <button className={zoom === value ? 'is-active' : ''} onClick={() => setZoom(value)} key={value}>{value}</button>
              ))}
            </div>
            <div className={`sol-bench-compare sol-bench-compare--${compare.toLowerCase().replace(/ /g, '-')}`}>
              {showReference ? <figure><figcaption>GOLDEN REFERENCE</figcaption><div className="sol-bench-image-stage"><img src={referenceUrl} alt="Golden reference" /></div></figure> : null}
              {showTranslation ? <figure><figcaption>SOL TRANSLATION</figcaption><PreviewArtboard package={pkg} referenceUrl={referenceUrl} zoom={zoom} /></figure> : null}
            </div>
          </>
        ) : null}
        {tab === 'FIGMA SPEC' ? (
          <div className="sol-bench-spec-grid">
            <HumanSpecSection title="FRAME" value={pkg.PAGE_FRAME_SPEC.frame} />
            <HumanSpecSection title="GRID" value={{
              grid: pkg.PAGE_FRAME_SPEC.grid,
              columns: pkg.PAGE_FRAME_SPEC.columns,
              gutters: pkg.PAGE_FRAME_SPEC.gutters,
            }} />
            <HumanSpecSection title="SECTIONS" value={pkg.SECTION_TREE} />
            <HumanSpecSection title="GEOMETRY" value={pkg.LAYOUT_GEOMETRY_SPEC} />
            <HumanSpecSection title="TYPOGRAPHY" value={pkg.TYPOGRAPHY_SYSTEM} />
            <HumanSpecSection title="COLOR" value={pkg.COLOR_SYSTEM} />
            <HumanSpecSection title="SPACING" value={pkg.SPACING_SYSTEM} />
            <HumanSpecSection title="SURFACES" value={pkg.BORDER_RADIUS_SURFACE_SYSTEM} />
          </div>
        ) : null}
        {tab === 'COMPONENTS' ? <ComponentInspector components={pkg.COMPONENT_TREE} /> : null}
        {tab === 'TOKENS' ? (
          <div className="sol-bench-spec-grid">
            <HumanSpecSection title="TYPE" value={pkg.TYPOGRAPHY_SYSTEM} />
            <HumanSpecSection title="COLOR" value={pkg.COLOR_SYSTEM} />
            <HumanSpecSection title="SPACING" value={pkg.SPACING_SYSTEM} />
            <HumanSpecSection title="BORDERS" value={(pkg.BORDER_RADIUS_SURFACE_SYSTEM as Record<string, unknown>).borders} />
            <HumanSpecSection title="RADII" value={(pkg.BORDER_RADIUS_SURFACE_SYSTEM as Record<string, unknown>).radii} />
            <HumanSpecSection title="SIZING" value={pkg.LAYOUT_GEOMETRY_SPEC} />
          </div>
        ) : null}
        {tab === 'ASSETS' ? <HumanSpecSection title="ASSET PLACEMENT MAP" value={pkg.ASSET_PLACEMENT_MAP} /> : null}
        {tab === 'HIERARCHY' ? (
          <div className="sol-bench-hierarchy">
            {(['DOMINANT', 'SECONDARY', 'TERTIARY'] as const).map((priority) => (
              <HumanSpecSection title={priority} key={priority} value={pkg.VISUAL_HIERARCHY_MAP.filter((row) => String(row.visualWeight || row.priority || '').toUpperCase().includes(priority))} />
            ))}
            <HumanSpecSection title="VISUAL WEIGHT SYSTEM" value={pkg.VISUAL_HIERARCHY_MAP} />
          </div>
        ) : null}
        {tab === 'IMPLEMENTATION HANDOFF' ? (
          <section>
            <h3>SolComposerImplementationHandoff</h3>
            <p>This artifact is displayed only. It has not been sent to Composer.</p>
            <pre className="sol-bench-handoff">{JSON.stringify(pkg.IMPLEMENTATION_HANDOFF, null, 2)}</pre>
            <HumanSpecSection title="DO NOT CHANGE" value={pkg.DO_NOT_CHANGE_RULES} />
          </section>
        ) : null}
        {tab === 'RUN METRICS' ? (
          <dl className="sol-bench-run-metrics">
            <div><dt>PROVIDER</dt><dd>{run.provider}</dd></div>
            <div><dt>MODEL</dt><dd>{run.providerModelId}</dd></div>
            <div><dt>REASONING</dt><dd>{run.requestedReasoningEffort.toUpperCase()}</dd></div>
            <div><dt>RUN ID</dt><dd>{run.runId}</dd></div>
            <div><dt>REFERENCE SHA256</dt><dd>{run.authority.sha256}</dd></div>
            <div><dt>QUEUE</dt><dd>{formatDuration(run.timing.queueDuration)}</dd></div>
            <div><dt>MODEL EXECUTION</dt><dd>{formatDuration(run.timing.modelDuration)}</dd></div>
            <div><dt>POST PROCESS</dt><dd>{formatDuration(run.timing.postProcessingDuration)}</dd></div>
            <div><dt>TOTAL</dt><dd>{formatDuration(run.timing.totalDuration)}</dd></div>
            <div><dt>COST</dt><dd>{run.cost ? `${run.cost.currency} ${run.cost.amount.toFixed(4)}` : 'Not available'}</dd></div>
            <div><dt>PROMPT VERSION</dt><dd>{run.solPromptVersion}</dd></div>
            <div><dt>PROMPT SHA256</dt><dd>{run.solPromptHash}</dd></div>
            <div><dt>FALLBACK ALLOWED</dt><dd>FALSE</dd></div>
            <div><dt>WEB SEARCH ENABLED</dt><dd>FALSE</dd></div>
            <div><dt>COMPOSER_INVOKED_DURING_TEST</dt><dd>FALSE</dd></div>
            <div><dt>GROK_OUTPUT_ACCESSED</dt><dd>FALSE</dd></div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}

export function SolDesignBenchmarkPage() {
  const [reference, setReference] = useState<LocalReference | null>(null);
  const [run, setRun] = useState<SolDesignBenchRun | null>(null);
  const [error, setError] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<SolProviderStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pickerRef = useRef<HTMLInputElement>(null);

  const referenceUrl = reference?.objectUrl || (run ? site00ApiUrl(`/api/site00/sol-design-bench?runId=${encodeURIComponent(run.runId)}&reference=1`) : '');
  const isRunning = Boolean(run && !['COMPLETE', 'FAILED'].includes(run.status));

  const loadRun = useCallback(async (runId: string) => {
    const response = await fetch(site00ApiUrl(`/api/site00/sol-design-bench?runId=${encodeURIComponent(runId)}`), { credentials: 'omit', cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load Sol run (${response.status}).`);
    const body = await response.json() as { run: SolDesignBenchRun };
    setRun(body.run);
    return body.run;
  }, []);

  useEffect(() => {
    const previous = localStorage.getItem(LAST_RUN_KEY);
    if (previous) void loadRun(previous).catch(() => localStorage.removeItem(LAST_RUN_KEY));
    void fetch(site00ApiUrl('/api/site00/sol-design-bench'), {
      credentials: 'omit',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Provider readiness unavailable (${response.status}).`);
        setProviderStatus(await response.json() as SolProviderStatus);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [loadRun]);

  useEffect(() => {
    if (!isRunning || !run) return;
    const poll = window.setInterval(() => void loadRun(run.runId).catch((reason) => setError(String(reason))), 2000);
    return () => window.clearInterval(poll);
  }, [isRunning, loadRun, run?.runId]);

  useEffect(() => {
    if (!run) return;
    const tick = () => setElapsed(Date.now() - Date.parse(run.timing.startedAt || run.timing.queuedAt));
    tick();
    if (!isRunning) return;
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, run?.runId, run?.timing.startedAt]);

  useEffect(() => () => {
    if (reference?.objectUrl) URL.revokeObjectURL(reference.objectUrl);
  }, [reference?.objectUrl]);

  const selectFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setIsInspecting(true);
    try {
      const next = await inspectFile(file);
      setReference((current) => {
        if (current) URL.revokeObjectURL(current.objectUrl);
        return next;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setIsInspecting(false);
    }
  };

  const start = async () => {
    if (!reference) return;
    setError('');
    const request: StartSolDesignBenchRequest = {
      action: 'START_SOL_TEST',
      reference: {
        filename: reference.file.name,
        mime: reference.file.type as StartSolDesignBenchRequest['reference']['mime'],
        bytes: reference.file.size,
        width: reference.width,
        height: reference.height,
        sha256: reference.sha256,
        dataUrl: reference.dataUrl,
      },
    };
    try {
      setIsUploading(true);
      const response = await fetch(site00ApiUrl('/api/site00/sol-design-bench'), {
        method: 'POST',
        credentials: 'omit',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      });
      const body = await response.json() as { run?: SolDesignBenchRun; error?: string };
      if (!response.ok || !body.run) throw new Error(body.error || `Could not start Sol test (${response.status}).`);
      setRun(body.run);
      localStorage.setItem(LAST_RUN_KEY, body.run.runId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setIsUploading(false);
    }
  };

  const retry = async () => {
    if (!run || run.status !== 'FAILED') return;
    setError('');
    setIsUploading(true);
    try {
      const response = await fetch(site00ApiUrl('/api/site00/sol-design-bench'), {
        method: 'POST',
        credentials: 'omit',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'RETRY_SOL_TEST', sourceRunId: run.runId }),
      });
      const body = await response.json() as { run?: SolDesignBenchRun; error?: string };
      if (!response.ok || !body.run) throw new Error(body.error || `Could not retry Sol test (${response.status}).`);
      setRun(body.run);
      localStorage.setItem(LAST_RUN_KEY, body.run.runId);
      setElapsed(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setIsUploading(false);
    }
  };

  const frozen = run?.authority;
  const progressLabel = useMemo(() => run?.stageLabel || 'Waiting for reference', [run?.stageLabel]);

  return (
    <main className="sol-bench" data-testid="sol-design-benchmark">
      <header className="sol-bench-header">
        <div><span>SITE 00 · DESIGN INTELLIGENCE LAB</span><h1>TWIN DESIGN BENCHMARK</h1></div>
        <strong>TEST B · SOL</strong>
      </header>
      <div className="sol-bench-model-contract" data-testid="sol-model-contract">
        <div><small>PROVIDER</small><strong>OpenAI</strong></div>
        <div><small>MODEL</small><strong>GPT-5.6 SOL</strong><code>gpt-5.6-sol</code></div>
        <div><small>REASONING</small><strong>HIGH</strong></div>
        <div><small>FALLBACK</small><strong>OFF</strong></div>
        <div><small>WEB SEARCH</small><strong>OFF</strong></div>
        <div>
          <small>PROVIDER READINESS</small>
          <strong className={providerStatus?.providerReadiness.openAiCredentialPresentServerSide ? 'is-ready' : 'is-blocked'}>
            {providerStatus
              ? providerStatus.providerReadiness.openAiCredentialPresentServerSide
                ? 'CREDENTIAL READY'
                : 'BLOCKED · OPENAI CREDENTIAL'
              : 'CHECKING…'}
          </strong>
        </div>
      </div>

      <section className="sol-bench-reference">
        <div className="sol-bench-section-heading"><span>01</span><h2>REFERENCE IMAGE</h2></div>
        {!reference && !run ? (
          <label className="sol-bench-dropzone">
            <input
              ref={pickerRef}
              type="file"
              accept={ACCEPTED_MIMES.join(',')}
              onChange={(event) => void selectFile(event.target.files?.[0])}
              data-testid="sol-reference-input"
            />
            <strong>{isInspecting ? 'INSPECTING IMAGE…' : 'CHOOSE GOLDEN REFERENCE'}</strong>
            <span>PNG · JPEG · WEBP</span>
          </label>
        ) : null}

        {reference ? (
          <div className="sol-bench-reference-grid">
            <div className="sol-bench-source-preview"><img src={reference.objectUrl} alt="Selected golden reference" data-testid="sol-reference-preview" /></div>
            <div>
              <ReferenceMetadata reference={reference} />
              {!isRunning ? (
                <div className="sol-bench-reference-actions">
                  <button onClick={() => { setReference(null); if (pickerRef.current) pickerRef.current.value = ''; }}>REMOVE</button>
                  <label>REPLACE<input type="file" accept={ACCEPTED_MIMES.join(',')} onChange={(event) => void selectFile(event.target.files?.[0])} /></label>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {frozen ? (
          <div className="sol-bench-authority" data-testid="sol-reference-authority">
            <strong>REFERENCE AUTHORITY FROZEN</strong>
            <span>{frozen.runId}</span><span>{frozen.width} × {frozen.height}</span><code>{frozen.sha256}</code>
          </div>
        ) : null}

        {!run ? <button className="sol-bench-start" disabled={!reference || isInspecting || isUploading || !providerStatus?.providerReadiness.openAiCredentialPresentServerSide} onClick={() => void start()}>{isUploading ? 'UPLOADING…' : 'START SOL TEST'}</button> : null}
        {!run && providerStatus && !providerStatus.providerReadiness.openAiCredentialPresentServerSide ? (
          <p className="sol-bench-readiness-blocked">START BLOCKED · Railway must provide the server-side OpenAI credential for exact gpt-5.6-sol dispatch.</p>
        ) : null}
        {error ? <p className="sol-bench-error" role="alert">{error}</p> : null}
      </section>

      {run && run.status !== 'COMPLETE' ? (
        <section className={`sol-bench-progress ${run.status === 'FAILED' ? 'is-failed' : ''}`} data-testid="sol-progress">
          <span className="sol-bench-progress__eyebrow">{run.status === 'FAILED' ? run.error?.code || 'SOL_RUN_FAILED' : 'SOL IS TRANSLATING YOUR INTERFACE'}</span>
          <div className="sol-bench-progress__bar"><i style={{ width: `${run.progress}%` }} /></div>
          <div className="sol-bench-progress__metrics">
            <div><small>STAGE</small><strong>{progressLabel}</strong></div>
            <div><small>ELAPSED</small><strong>{formatDuration(elapsed)}</strong></div>
            <div><small>ESTIMATED REMAINING</small><strong>{run.etaSeconds == null ? 'Estimating…' : `~${formatDuration(run.etaSeconds * 1000)}`}</strong><em>Stage-derived estimate</em></div>
          </div>
          {run.error ? <p className="sol-bench-error">{run.error.code}: {run.error.message}</p> : null}
          {run.status === 'FAILED' ? (
            <button className="sol-bench-retry" disabled={isUploading} onClick={() => void retry()}>
              {isUploading ? 'CREATING RETRY RUN…' : 'RETRY SOL TEST'}
            </button>
          ) : null}
        </section>
      ) : null}
      {isUploading ? (
        <section className="sol-bench-progress" data-testid="sol-progress">
          <span className="sol-bench-progress__eyebrow">SOL IS TRANSLATING YOUR INTERFACE</span>
          <div className="sol-bench-progress__bar"><i style={{ width: '2%' }} /></div>
          <div className="sol-bench-progress__metrics"><div><small>STAGE</small><strong>Uploading reference…</strong></div></div>
        </section>
      ) : null}

      {run?.status === 'COMPLETE' && run.result ? (
        <>
          <div className="sol-bench-complete"><span>SOL COMPLETED IN</span><strong>{formatDuration(run.timing.totalDuration)}</strong></div>
          <ResultsWorkspace run={run} referenceUrl={referenceUrl} />
        </>
      ) : null}
    </main>
  );
}

export default SolDesignBenchmarkPage;
