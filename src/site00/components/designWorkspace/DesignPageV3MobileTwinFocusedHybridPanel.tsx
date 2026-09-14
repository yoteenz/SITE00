import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P3_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { recordFounderMobileTwinRenderStrategy } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderMobileTwinRenderStrategy.js';
import { hasFlowABaselineForBenchmark } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import type { FounderMobileTwinRenderStrategyDecision } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinFocusedHybridBenchmarkTypes.js';
import type { MobileTwinFalAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';

type CompareMode =
  | 'STRATEGY_CARDS'
  | 'ALL_ACTUALS'
  | 'ALL_BLUEPRINTS'
  | 'BLUEPRINT_GPT2_VS_NBP'
  | 'PAIR_GPT2_VS_HYBRID'
  | 'PAIR_GPT2_VS_NBP';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

const STRATEGY_CARDS: {
  key: 'GPT2_FULL_PAIR' | 'NBP_FULL_PAIR_CORRECTED' | 'GPT2_ACTUAL__NBP_BLUEPRINT';
  title: string;
  actualLabel: string;
  blueprintLabel: string;
  pick: FounderMobileTwinRenderStrategyDecision;
  retry?: MobileTwinFalAction;
}[] = [
  {
    key: 'GPT2_FULL_PAIR',
    title: 'GPT2 CONTROL PAIR',
    actualLabel: 'GPT2 Actual',
    blueprintLabel: 'GPT2 Blueprint',
    pick: 'GPT2_FULL_PAIR',
  },
  {
    key: 'NBP_FULL_PAIR_CORRECTED',
    title: 'NBP CORRECTED FULL PAIR',
    actualLabel: 'NBP Actual (page-only)',
    blueprintLabel: 'NBP Blueprint',
    pick: 'NBP_FULL_PAIR',
    retry: 'RETRY_FOCUSED_HYBRID_NBP_FULL',
  },
  {
    key: 'GPT2_ACTUAL__NBP_BLUEPRINT',
    title: 'HYBRID PAIR',
    actualLabel: 'GPT2 Actual',
    blueprintLabel: 'NBP Blueprint',
    pick: 'HYBRID_GPT2_ACTUAL__NBP_BLUEPRINT',
    retry: 'RETRY_FOCUSED_HYBRID_GPT2_NBP',
  },
];

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('vitest-fal:')) return uri;
  if (uri.startsWith('http')) return uri;
  const pathPart = uri.startsWith('/') ? uri : `/${uri}`;
  return `${window.location.origin}${pathPart}`;
}

export function DesignPageV3MobileTwinFocusedHybridPanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline;
  const hybrid = pipeline?.focusedHybridBenchmark;
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('STRATEGY_CARDS');
  const [fullscreen, setFullscreen] = useState<{ label: string; src: string } | null>(null);

  if (!session.authorityPipeline?.mobileMaster) return null;

  const methodALocked = pipeline?.mobileTwinVisualGenerationStrategy === 'ATOMIC_SIBLING_FROM_COMPOSITION';
  const flowAReady = pipeline ? hasFlowABaselineForBenchmark(pipeline) : false;
  const canRun = methodALocked && flowAReady;

  const resolvePair = (actualId: string | null, blueprintId: string | null) => {
    const actual = actualId ? pipeline?.renders.find((r) => r.id === actualId) : null;
    const blueprint = blueprintId ? pipeline?.blueprintTwins.find((b) => b.id === blueprintId) : null;
    return { actual, blueprint };
  };

  const cards = useMemo(
    () =>
      STRATEGY_CARDS.map((card) => {
        const row = hybrid?.strategies[card.key];
        const pair = resolvePair(row?.actualRenderId ?? null, row?.blueprintRenderId ?? null);
        return { ...card, row, ...pair };
      }),
    [hybrid, pipeline?.renders, pipeline?.blueprintTwins],
  );

  const runAction = async (action: MobileTwinFalAction, label?: string) => {
    setBusy(true);
    setBusyLabel(label ?? 'Running FAL on Railway — keep tab open (~60–90s)…');
    setErr(null);
    try {
      let next = await requestMobileTwinFal({ session, action, founderConfirmedSpend: true });
      onSessionUpdate(next);
      return next;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  };

  const runFullBenchmark = async () => {
    setBusy(true);
    setErr(null);
    try {
      let next = session;
      setBusyLabel('Step 1/2 — NBP corrected pair (~60–90s)…');
      next = await requestMobileTwinFal({
        session: next,
        action: 'RETRY_FOCUSED_HYBRID_NBP_FULL',
        founderConfirmedSpend: true,
      });
      onSessionUpdate(next);
      setBusyLabel('Step 2/2 — Hybrid GPT2+NBP pair (~60–90s)…');
      next = await requestMobileTwinFal({
        session: next,
        action: 'RETRY_FOCUSED_HYBRID_GPT2_NBP',
        founderConfirmedSpend: true,
      });
      onSessionUpdate(next);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  };

  const pick = (decision: FounderMobileTwinRenderStrategyDecision) => {
    setErr(null);
    try {
      onSessionUpdate(recordFounderMobileTwinRenderStrategy(session, decision));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const panels = useMemo(() => {
    if (compareMode === 'STRATEGY_CARDS') return [];
    const out: { testId: string; label: string; src: string | null }[] = [];
    for (const c of cards) {
      const actualSrc = c.actual?.renderImageUri ? resolveImageSrc(c.actual.renderImageUri) : null;
      const bpSrc = c.blueprint?.twinImageUri ? resolveImageSrc(c.blueprint.twinImageUri) : null;
      if (compareMode === 'ALL_ACTUALS' && actualSrc) {
        out.push({ testId: `v3-fh-actual-${c.key}`, label: `${c.title} · Actual`, src: actualSrc });
      }
      if (compareMode === 'ALL_BLUEPRINTS' && bpSrc) {
        out.push({ testId: `v3-fh-blueprint-${c.key}`, label: `${c.title} · Blueprint`, src: bpSrc });
      }
      if (compareMode === 'BLUEPRINT_GPT2_VS_NBP') {
        if (c.key === 'GPT2_FULL_PAIR' && bpSrc) out.push({ testId: 'v3-fh-bp-gpt2', label: 'GPT2 Blueprint', src: bpSrc });
        if (c.key === 'NBP_FULL_PAIR_CORRECTED' && bpSrc) {
          out.push({ testId: 'v3-fh-bp-nbp', label: 'NBP Blueprint', src: bpSrc });
        }
      }
    }
    if (compareMode === 'PAIR_GPT2_VS_HYBRID') {
      for (const key of ['GPT2_FULL_PAIR', 'GPT2_ACTUAL__NBP_BLUEPRINT'] as const) {
        const c = cards.find((x) => x.key === key);
        if (!c?.actual?.renderImageUri) continue;
        out.push({
          testId: `v3-fh-pair-${key}`,
          label: `${c.title} · side-by-side`,
          src: resolveImageSrc(c.actual.renderImageUri),
        });
      }
    }
    return out;
  }, [cards, compareMode]);

  return (
    <section
      id="v3-mobile-twin-focused-hybrid"
      className="site00-dw-v3-mobile-twin-focused-hybrid"
      data-testid="v3-mobile-twin-focused-hybrid"
      data-lineage={P0_VR_TWIN_V30R7MF3P3_LINEAGE}
    >
      <header>
        <strong>GPT2 / NBP FOCUSED HYBRID TWIN TEST</strong>
        <span>R7MF3P3 · GPT2 + Nano Banana Pro only · no FLUX</span>
      </header>
      {!canRun ?
        <p className="site00-dw-v3-mobile-twin-focused-hybrid__gate" role="status">
          LOCKED — Method A + Flow A baseline required (same as provider benchmark).
        </p>
      : null}
      <ul>
        <li>SNAPSHOT · {hybrid?.snapshot.id ?? '—'} · {hybrid?.status ?? 'NOT RUN'}</li>
        <li>PROMPT CONTRACT · {hybrid?.snapshot.promptContractVersion ?? '—'}</li>
        <li>RENDER STRATEGY · {pipeline?.mobileTwinRenderStrategy?.strategy ?? 'UNRESOLVED'}</li>
      </ul>
      <div className="site00-dw-v3-mobile-twin-focused-hybrid__actions">
        <button
          type="button"
          data-testid="v3-run-focused-hybrid-benchmark"
          disabled={busy || !canRun}
          onClick={() => void runFullBenchmark()}
        >
          {busy ? 'RUNNING…' : 'RUN FOCUSED HYBRID BENCHMARK'}
        </button>
      </div>
      {busyLabel ?
        <p className="site00-dw-v3-mobile-twin-focused-hybrid__running" role="status" data-testid="v3-fh-running">
          {busyLabel}
        </p>
      : null}
      <div className="site00-dw-v3-mobile-twin-focused-hybrid__compare-tabs">
        {(
          [
            ['STRATEGY_CARDS', 'STRATEGY CARDS'],
            ['ALL_ACTUALS', 'ALL ACTUALS'],
            ['ALL_BLUEPRINTS', 'ALL BLUEPRINTS'],
            ['BLUEPRINT_GPT2_VS_NBP', 'GPT2 vs NBP BLUEPRINT'],
            ['PAIR_GPT2_VS_HYBRID', 'GPT2 vs HYBRID PAIR'],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            className={compareMode === mode ? 'is-active' : undefined}
            onClick={() => setCompareMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="site00-dw-v3-mobile-twin-focused-hybrid__strategy-cards">
        {cards.map((c) => (
          <article key={c.key} data-testid={`v3-fh-strategy-${c.key}`}>
            <h4>{c.title}</h4>
            <p>
              {c.actualLabel} + {c.blueprintLabel} · {c.row?.status ?? (hybrid ? 'NOT_RUN' : 'NOT STARTED')}
              {c.row?.presentationFirewallPass === false ? ' · PRESENTATION REVIEW' : ''}
              {c.row?.providerErrorState ? ` · ${c.row.providerErrorState}` : ''}
            </p>
            <div className="site00-dw-v3-mobile-twin-focused-hybrid__card-previews">
              {c.actual?.renderImageUri ?
                <figure>
                  <figcaption>{c.actualLabel}</figcaption>
                  <button
                    type="button"
                    onClick={() =>
                      setFullscreen({ label: c.actualLabel, src: resolveImageSrc(c.actual!.renderImageUri) })
                    }
                  >
                    <img src={resolveImageSrc(c.actual.renderImageUri)} alt={c.actualLabel} loading="lazy" />
                  </button>
                </figure>
              : null}
              {c.blueprint?.twinImageUri ?
                <figure>
                  <figcaption>{c.blueprintLabel}</figcaption>
                  <button
                    type="button"
                    onClick={() =>
                      setFullscreen({ label: c.blueprintLabel, src: resolveImageSrc(c.blueprint!.twinImageUri) })
                    }
                  >
                    <img src={resolveImageSrc(c.blueprint.twinImageUri)} alt={c.blueprintLabel} loading="lazy" />
                  </button>
                </figure>
              : null}
            </div>
            <div className="site00-dw-v3-mobile-twin-focused-hybrid__card-actions">
              <button type="button" data-testid={`v3-fh-pick-${c.key}`} onClick={() => pick(c.pick)}>
                SELECT STRATEGY
              </button>
              {c.retry ?
                <button
                  type="button"
                  data-testid={`v3-fh-retry-${c.key}`}
                  disabled={busy || !canRun}
                  onClick={() =>
                    void runAction(c.retry!, `${c.title} — keep tab open (~60–90s)…`)
                  }
                >
                  {busy ? '…' : 'RETRY'}
                </button>
              : null}
            </div>
          </article>
        ))}
        <button type="button" data-testid="v3-fh-pick-unresolved" onClick={() => pick('UNRESOLVED')}>
          UNRESOLVED
        </button>
      </div>
      {panels.length ?
        <div className="site00-dw-v3-mobile-twin-focused-hybrid__grid">
          {panels.map((p) => (
            <figure key={p.testId} data-testid={p.testId}>
              <figcaption>{p.label}</figcaption>
              {p.src ?
                <button type="button" onClick={() => setFullscreen({ label: p.label, src: p.src! })}>
                  <img src={p.src} alt={p.label} loading="lazy" />
                </button>
              : null}
            </figure>
          ))}
        </div>
      : null}
      {fullscreen ?
        <div className="site00-dw-v3-bench-fullscreen" data-testid="v3-fh-fullscreen" role="dialog">
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
