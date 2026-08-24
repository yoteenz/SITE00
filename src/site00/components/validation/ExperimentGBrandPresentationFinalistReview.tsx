import { useCallback, useState } from 'react';
import type {
  BrandPresentationDirectionVisualBenchmark,
  BrandPresentationParentVisualFinalistSelection,
  BrandPresentationVisualFormulationRun,
} from '../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types';
import { DIRECTION_BENCHMARK_SUMMARIES } from '../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { VisualBenchmarkFormationStatusPanel } from './VisualBenchmarkFormationStatusPanel';

type DirectionBenchmarkJudgment = Exclude<BrandPresentationDirectionVisualBenchmark['founderJudgment'], null>;

const JUDGMENT_OPTIONS: DirectionBenchmarkJudgment[] = [
  'LOVE_THIS_DIRECTION',
  'PROMISING_REVISE',
  'NOT_THIS_DIRECTION',
  'MISREPRESENTS_THE_DIRECTION',
  'TOO_GENERIC',
  'TOO_LITERAL',
  'VISUAL_DOES_NOT_HELP_ME_JUDGE',
];

function formatLabel(j: string): string {
  return j.replace(/_/g, ' ');
}

function directionShortName(name: string): string {
  return name.replace(/^THE /i, '').replace(/ DIRECTION$/i, '');
}

type ExperimentGBrandPresentationFinalistReviewProps = {
  projectSlug: string;
  run: BrandPresentationVisualFormulationRun | null | undefined;
  lastRefreshedAt?: Date | null;
  onRefresh?: () => void;
  onUpdate?: (run?: BrandPresentationVisualFormulationRun) => void;
};

function BenchmarkVisualCard({
  benchmark,
  onJudgment,
  onRevise,
  judging,
}: {
  benchmark: BrandPresentationDirectionVisualBenchmark;
  onJudgment: (judgment: DirectionBenchmarkJudgment) => void;
  onRevise: () => void;
  judging: boolean;
}) {
  const saved = benchmark.founderJudgment;
  const summary = DIRECTION_BENCHMARK_SUMMARIES[benchmark.directionName] ?? benchmark.benchmarkThesis;

  return (
    <article className="site00-experiment-g-vf__expression site00-experiment-g-vf__benchmark">
      <h5 className="site00-experiment-g-vf__expression-name">{directionShortName(benchmark.directionName)}</h5>
      <p className="site00-experiment-g-vf__summary">{summary}</p>
      {benchmark.assetPublicUrl ? (
        <a href={benchmark.assetPublicUrl} target="_blank" rel="noreferrer" className="site00-experiment-g-vf__image-link">
          <img
            src={benchmark.assetPublicUrl}
            alt={`${benchmark.directionName} direction benchmark`}
            className="site00-experiment-g-vf__image site00-experiment-g-vf__image--large"
            loading="lazy"
          />
        </a>
      ) : (
        <p className="site00-experiment-g-vf__pending">Visual not yet generated</p>
      )}
      <details className="site00-experiment-g-vf__details">
        <summary>VIEW BENCHMARK CONTRACT</summary>
        <dl className="site00-experiment-g-vf__dl">
          <div><dt>THESIS</dt><dd>{benchmark.benchmarkThesis}</dd></div>
          <div><dt>COMPOSITION</dt><dd>{benchmark.compositionBehavior}</dd></div>
          <div><dt>TYPOGRAPHY</dt><dd>{benchmark.typographyBehavior}</dd></div>
          <div><dt>SOCIAL BEHAVIOR</dt><dd>{benchmark.socialNativeBehavior}</dd></div>
          {benchmark.siblingDistinctivenessEval ? (
            <div><dt>SIBLING DISTINCTIVENESS</dt><dd>{benchmark.siblingDistinctivenessEval.result.replace(/_/g, ' ')}</dd></div>
          ) : null}
        </dl>
      </details>
      {saved ? (
        <p className="site00-experiment-g-vf__judgment-saved" role="status">
          YOUR VISUAL JUDGMENT: {formatLabel(saved)} — saved (independent from conceptual direction judgment)
        </p>
      ) : null}
      {benchmark.assetPublicUrl ? (
        <>
          <div className="site00-experiment-g-vf__judgment">
            {JUDGMENT_OPTIONS.map((j) => (
              <button
                key={j}
                type="button"
                className={saved === j ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                disabled={judging}
                aria-pressed={saved === j}
                onClick={() => onJudgment(j)}
              >
                {formatLabel(j)}
              </button>
            ))}
          </div>
          {saved === 'PROMISING_REVISE' ? (
            <button type="button" className="site00-btn" disabled={judging} onClick={onRevise}>
              GENERATE REVISION (SINGLE BENCHMARK)
            </button>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

function ParentFinalistSection({
  parentFinalist,
  benchmarks,
  judgingId,
  onJudgment,
  onRevise,
}: {
  parentFinalist: BrandPresentationParentVisualFinalistSelection;
  benchmarks: BrandPresentationDirectionVisualBenchmark[];
  judgingId: string | null;
  onJudgment: (benchmarkId: string, judgment: DirectionBenchmarkJudgment) => void;
  onRevise: (benchmarkId: string) => void;
}) {
  const siblingBenchmarks = benchmarks
    .filter((b) => b.parentConceptId === parentFinalist.parentConceptId && b.revisionNumber === 0)
    .sort((a, b) => a.directionName.localeCompare(b.directionName));

  return (
    <section className="site00-experiment-g-vf__finalist">
      <header className="site00-experiment-g-vf__finalist-header">
        <h3>{parentFinalist.parentConceptName}</h3>
      </header>
      <div className="site00-experiment-g-vf__benchmark-grid">
        {siblingBenchmarks.map((benchmark) => (
          <BenchmarkVisualCard
            key={benchmark.benchmarkId}
            benchmark={benchmark}
            judging={judgingId === benchmark.benchmarkId}
            onJudgment={(j) => onJudgment(benchmark.benchmarkId, j)}
            onRevise={() => onRevise(benchmark.benchmarkId)}
          />
        ))}
      </div>
    </section>
  );
}

export function ExperimentGBrandPresentationFinalistReview({
  projectSlug,
  run,
  lastRefreshedAt = null,
  onRefresh,
  onUpdate,
}: ExperimentGBrandPresentationFinalistReviewProps) {
  const [formulating, setFormulating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFormulatingOnServer =
    run?.status === 'FORMULATING_BENCHMARKS' || run?.status === 'FORMULATING_EXPRESSIONS';

  const activeParentFinalists = (run?.parentFinalists ?? [])
    .filter((f) => f.status === 'SELECTED')
    .sort((a, b) => a.selectionOrder - b.selectionOrder);
  const benchmarks = run?.directionBenchmarks ?? [];
  const hasBenchmarks = benchmarks.filter((b) => b.revisionNumber === 0).length >= 6;
  const hasVisuals = benchmarks.some((b) => b.assetPublicUrl);
  const deferred = run?.deferredParents ?? [];
  const pipelineReady =
    activeParentFinalists.length >= 2 ||
    run?.status === 'FINALISTS_READY' ||
    run?.status === 'BENCHMARKS_READY' ||
    run?.status === 'VISUALS_READY' ||
    run?.status === 'FOUNDER_REVIEW';
  const showFormulateButton = !hasBenchmarks && !hasVisuals && !isFormulatingOnServer;
  const showGenerateButton = hasBenchmarks && !hasVisuals;

  const startFormulation = useCallback(
    async (forceRetry = false) => {
      setFormulating(true);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualFormulate(projectSlug, { forceRetry });
        onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Formulation failed');
      } finally {
        setFormulating(false);
      }
    },
    [onUpdate, projectSlug],
  );

  const formulate = useCallback(() => startFormulation(false), [startFormulation]);
  const retryFormulation = useCallback(() => startFormulation(true), [startFormulation]);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.experimentGVisualGenerate(projectSlug);
      onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }, [onUpdate, projectSlug]);

  const setJudgment = useCallback(
    async (benchmarkId: string, judgment: DirectionBenchmarkJudgment) => {
      setJudgingId(benchmarkId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualJudgment(projectSlug, { benchmarkId, judgment });
        onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Judgment failed');
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const revise = useCallback(
    async (benchmarkId: string) => {
      setJudgingId(benchmarkId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualRevise(projectSlug, {
          benchmarkId,
          preserve: ['Direction behavior and recognition mechanism'],
          change: ['Composition density and hierarchy emphasis'],
          doNotBecome: ['New direction', 'Generic moodboard'],
        });
        onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Revision failed');
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const costPreview = {
    parentFinalists: 2,
    directions: 6,
    totalVisuals: 6,
    anthropicRequests: 6,
    falRequests: 6,
    estimatedCost: '$0.48',
  };

  return (
    <div className="site00-experiment-g-vf">
      <p className="site00-experiment-g-vf__experiment">EXPERIMENT G — PARENT FINALIST DIRECTION VISUALIZATION</p>
      <h2 className="site00-experiment-g-vf__title">NDXBOOK Brand Presentation — Parent Finalist Visual Review</h2>
      <p className="site00-experiment-g-vf__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · 2 parent finalists · 6 direction benchmarks · 1
        visual each
      </p>
      {deferred.length > 0 ? (
        <p className="site00-experiment-g-vf__audit">
          Deferred: {deferred.map((d) => d.parentConceptName).join(', ')} — preserved, salvage eligible
        </p>
      ) : null}
      {run?.siblingCollapseEval ? (
        <p className="site00-experiment-g-vf__audit">
          Sibling distinctiveness — Room: {run.siblingCollapseEval.room.result.replace(/_/g, ' ')} · Noticing:{' '}
          {run.siblingCollapseEval.noticing.result.replace(/_/g, ' ')}
        </p>
      ) : null}
      {error ? <p className="site00-experiment-g-vf__error" role="alert">{error}</p> : null}

      <VisualBenchmarkFormationStatusPanel
        run={run}
        forming={formulating}
        lastRefreshedAt={lastRefreshedAt}
        onRetry={() => void retryFormulation()}
        onRefresh={() => onRefresh?.()}
      />

      {!pipelineReady && showFormulateButton ? (
        <p className="site00-experiment-g-vf__pending">
          Parent finalists not loaded yet — tap FORMULATE below to initialize Room + Noticing (Collector stays
          deferred). If this fails, redeploy api.site00.com on Railway from latest main.
        </p>
      ) : null}
      <div className="site00-experiment-g-vf__controls">
        {showFormulateButton ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={formulating} onClick={() => void formulate()}>
            {formulating ? 'STARTING BACKGROUND FORMULATION…' : 'FORMULATE SIX DIRECTION VISUALS'}
          </button>
        ) : null}
        {isFormulatingOnServer ? (
          <p className="site00-experiment-g-vf__pending">
            Formulation runs on the server — safe to leave this page. Status refreshes every 5 seconds.
          </p>
        ) : null}
        {showGenerateButton ? (
          <>
            <div className="site00-experiment-g-vf__cost-preview">
              <p>PARENT FINALISTS: {costPreview.parentFinalists}</p>
              <p>DIRECTIONS: {costPreview.directions}</p>
              <p>INITIAL VISUAL ASSETS: {costPreview.totalVisuals}</p>
              <p>ANTHROPIC REQUESTS: {costPreview.anthropicRequests}</p>
              <p>FAL REQUESTS: {costPreview.falRequests}</p>
              <p>ESTIMATED TOTAL COST: {costPreview.estimatedCost}</p>
            </div>
            <button type="button" className="site00-btn site00-btn--primary" disabled={generating} onClick={() => void generate()}>
              {generating ? 'GENERATING SIX DIRECTION VISUALS…' : 'GENERATE SIX DIRECTION VISUALS'}
            </button>
          </>
        ) : null}
      </div>
      {pipelineReady && activeParentFinalists.length >= 2 ? (
        <p className="site00-experiment-g-vf__meta">
          Parent finalists: {activeParentFinalists.map((p) => p.parentConceptName).join(' · ')}
        </p>
      ) : null}
      {(pipelineReady ? activeParentFinalists : []).map((parentFinalist) => (
        <ParentFinalistSection
          key={parentFinalist.selectionId}
          parentFinalist={parentFinalist}
          benchmarks={benchmarks}
          judgingId={judgingId}
          onJudgment={(id, j) => void setJudgment(id, j)}
          onRevise={(id) => void revise(id)}
        />
      ))}
      {hasVisuals ? (
        <p className="site00-experiment-g-vf__meta">
          Compare sibling directions side-by-side. Visual judgment is evidence — it does not rewrite conceptual records.
          No automatic winner.
        </p>
      ) : null}
    </div>
  );
}
