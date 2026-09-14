import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P2_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { recordFounderProviderBenchmarkDecision } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderProviderBenchmarkDecision.js';
import { ensureMobileTwinPipelineDefaults } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import type { FounderProviderBenchmarkDecision } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinProviderBenchmarkTypes.js';
import type { MobileTwinFalAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';

type CompareMode = 'PROVIDERS' | 'ALL_ACTUALS' | 'ALL_BLUEPRINTS' | 'TWIN_PAIR';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('vitest-fal://')) return uri;
  if (uri.startsWith('http')) return uri;
  const pathPart = uri.startsWith('/') ? uri : `/${uri}`;
  return `${window.location.origin}${pathPart}`;
}

const PROVIDER_ROWS: {
  key: 'GPT2_BASELINE' | 'NBPRO' | 'FLUX2MAX' | 'KONTEXTMAX';
  label: string;
  decision: FounderProviderBenchmarkDecision;
  retryAction?: MobileTwinFalAction;
}[] = [
  { key: 'GPT2_BASELINE', label: 'GPT IMAGE 2 — BASELINE', decision: 'GPT_IMAGE_2' },
  {
    key: 'NBPRO',
    label: 'NANO BANANA PRO',
    decision: 'NANO_BANANA_PRO',
    retryAction: 'RETRY_PROVIDER_BENCHMARK_NBPRO',
  },
  {
    key: 'FLUX2MAX',
    label: 'FLUX.2 MAX',
    decision: 'FLUX_2_MAX',
    retryAction: 'RETRY_PROVIDER_BENCHMARK_FLUX2MAX',
  },
  {
    key: 'KONTEXTMAX',
    label: 'FLUX.1 KONTEXT MAX',
    decision: 'FLUX_1_KONTEXT_MAX',
    retryAction: 'RETRY_PROVIDER_BENCHMARK_KONTEXTMAX',
  },
];

export function DesignPageV3MobileTwinProviderBenchmarkPanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline ? ensureMobileTwinPipelineDefaults(session.mobileTwinPipeline) : undefined;
  const bench = pipeline?.providerBenchmark;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('PROVIDERS');
  const [fullscreen, setFullscreen] = useState<{ label: string; src: string } | null>(null);

  if (!session.authorityPipeline?.mobileMaster) return null;
  if (pipeline?.mobileTwinVisualGenerationStrategy !== 'ATOMIC_SIBLING_FROM_COMPOSITION') return null;

  const resolvePair = (actualId: string | null, blueprintId: string | null) => {
    const actual = actualId ? pipeline?.renders.find((r) => r.id === actualId) : null;
    const blueprint = blueprintId ? pipeline?.blueprintTwins.find((b) => b.id === blueprintId) : null;
    return { actual, blueprint };
  };

  const rows = PROVIDER_ROWS.map((row) => {
    const run = bench?.runs[row.key];
    const ids =
      row.key === 'GPT2_BASELINE' ?
        { actualId: bench?.baselineActualRenderId ?? null, blueprintId: bench?.baselineBlueprintRenderId ?? null }
      : { actualId: run?.actualRenderId ?? null, blueprintId: run?.blueprintRenderId ?? null };
    const pair = resolvePair(ids.actualId, ids.blueprintId);
    return { ...row, run, ...pair };
  });

  const panels = useMemo(() => {
    if (compareMode === 'ALL_ACTUALS') {
      return rows.map((r) => ({
        label: `${r.label} · ACTUAL`,
        src: r.actual ? resolveImageSrc(r.actual.renderImageUri) : null,
        testId: `v3-bench-actual-${r.key}`,
      }));
    }
    if (compareMode === 'ALL_BLUEPRINTS') {
      return rows.map((r) => ({
        label: `${r.label} · BLUEPRINT`,
        src: r.blueprint ? resolveImageSrc(r.blueprint.twinImageUri) : null,
        testId: `v3-bench-blueprint-${r.key}`,
      }));
    }
    if (compareMode === 'TWIN_PAIR') {
      return rows.flatMap((r) => [
        {
          label: `${r.label} · ACTUAL`,
          src: r.actual ? resolveImageSrc(r.actual.renderImageUri) : null,
          testId: `v3-bench-pair-actual-${r.key}`,
        },
        {
          label: `${r.label} · BLUEPRINT`,
          src: r.blueprint ? resolveImageSrc(r.blueprint.twinImageUri) : null,
          testId: `v3-bench-pair-blueprint-${r.key}`,
        },
      ]);
    }
    return rows.flatMap((r) => [
      {
        label: `${r.label} · ACTUAL`,
        src: r.actual ? resolveImageSrc(r.actual.renderImageUri) : null,
        testId: `v3-bench-actual-${r.key}`,
      },
      {
        label: `${r.label} · BLUEPRINT`,
        src: r.blueprint ? resolveImageSrc(r.blueprint.twinImageUri) : null,
        testId: `v3-bench-blueprint-${r.key}`,
      },
    ]);
  }, [compareMode, rows]);

  const runAction = (action: MobileTwinFalAction) => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action, founderConfirmedSpend: true })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const pick = (decision: FounderProviderBenchmarkDecision) => {
    setErr(null);
    try {
      onSessionUpdate(recordFounderProviderBenchmarkDecision(session, decision));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-provider-benchmark"
      data-testid="v3-mobile-twin-provider-benchmark"
      data-lineage={P0_VR_TWIN_V30R7MF3P2_LINEAGE}
    >
      <header>
        <strong>MOBILE TWIN PROVIDER BENCHMARK</strong>
        <span>Method A locked · same frozen composition · 6 new FAL jobs max</span>
      </header>
      <ul>
        <li>SNAPSHOT · {bench?.snapshot.id ?? '—'} · {bench?.status ?? 'NOT RUN'}</li>
        <li>METHOD · {bench?.methodLocked ?? 'ATOMIC_SIBLING_FROM_COMPOSITION'}</li>
        <li>PROMPT CONTRACT · {bench?.snapshot.promptContractVersion ?? '—'}</li>
        <li>PROVIDER STRATEGY · {pipeline?.mobileTwinProviderStrategy?.status ?? 'UNRESOLVED'}</li>
      </ul>
      <div className="site00-dw-v3-mobile-twin-provider-benchmark__actions">
        <button
          type="button"
          data-testid="v3-run-provider-benchmark"
          disabled={busy || !pipeline?.twinCapabilityTest?.flowABlueprintId}
          onClick={() => runAction('RUN_MOBILE_TWIN_PROVIDER_BENCHMARK')}
        >
          RUN PROVIDER BENCHMARK
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-provider-benchmark__compare-tabs">
        <button type="button" className={compareMode === 'PROVIDERS' ? 'is-active' : undefined} onClick={() => setCompareMode('PROVIDERS')}>
          COMPARE PROVIDERS
        </button>
        <button type="button" className={compareMode === 'ALL_ACTUALS' ? 'is-active' : undefined} onClick={() => setCompareMode('ALL_ACTUALS')}>
          ALL ACTUALS
        </button>
        <button type="button" className={compareMode === 'ALL_BLUEPRINTS' ? 'is-active' : undefined} onClick={() => setCompareMode('ALL_BLUEPRINTS')}>
          ALL BLUEPRINTS
        </button>
        <button type="button" className={compareMode === 'TWIN_PAIR' ? 'is-active' : undefined} onClick={() => setCompareMode('TWIN_PAIR')}>
          ALL TWIN PAIRS
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-provider-benchmark__provider-cards">
        {rows.map((r) => (
          <article key={r.key} data-testid={`v3-bench-card-${r.key}`}>
            <h4>{r.label}</h4>
            <p>{r.run?.status ?? (r.key === 'GPT2_BASELINE' ? 'BASELINE' : 'NOT_RUN')}</p>
            <div className="site00-dw-v3-mobile-twin-provider-benchmark__card-actions">
              <button type="button" data-testid={`v3-pick-${r.key}`} onClick={() => pick(r.decision)}>
                SELECT
              </button>
              {r.retryAction ?
                <button type="button" disabled={busy} onClick={() => runAction(r.retryAction!)}>
                  RETRY
                </button>
              : null}
            </div>
          </article>
        ))}
        <button type="button" data-testid="v3-pick-none" onClick={() => pick('NONE')}>
          NONE
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-provider-benchmark__grid">
        {panels.map((p) => (
          <figure key={p.testId} data-testid={p.testId}>
            <figcaption>{p.label}</figcaption>
            {p.src ?
              <button type="button" className="site00-dw-v3-bench-fullscreen-trigger" onClick={() => setFullscreen({ label: p.label, src: p.src! })}>
                <img src={p.src} alt={p.label} loading="lazy" />
              </button>
            : <p>Not generated yet</p>}
          </figure>
        ))}
      </div>
      {fullscreen ?
        <div className="site00-dw-v3-bench-fullscreen" data-testid="v3-bench-fullscreen" role="dialog">
          <header>
            <strong>{fullscreen.label}</strong>
            <button type="button" onClick={() => setFullscreen(null)}>
              CLOSE
            </button>
          </header>
          <img src={fullscreen.src} alt={fullscreen.label} />
        </div>
      : null}
      {err ?
        <p role="alert">{err}</p>
      : null}
    </section>
  );
}
