import { useCallback, useState } from 'react';
import type {
  BrandPresentationVisualExpressionCandidate,
  BrandPresentationVisualFormulationRun,
  BrandPresentationVisualFinalistSelection,
} from '../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

type VisualExpressionJudgment = Exclude<BrandPresentationVisualExpressionCandidate['founderJudgment'], null>;

const JUDGMENT_OPTIONS: VisualExpressionJudgment[] = [
  'LOVE_THIS_EXPRESSION',
  'PROMISING_REVISE',
  'NOT_THIS_EXPRESSION',
  'MISREPRESENTS_DIRECTION',
  'TOO_GENERIC',
  'TOO_LITERAL',
  'TOO_STYLE_DEPENDENT',
];

function formatLabel(j: string): string {
  return j.replace(/_/g, ' ');
}

type ExperimentGBrandPresentationFinalistReviewProps = {
  projectSlug: string;
  run: BrandPresentationVisualFormulationRun | null | undefined;
  onUpdate?: (run?: BrandPresentationVisualFormulationRun) => void;
};

function ExpressionVisualCard({
  expression,
  onJudgment,
  onWinner,
  onRevise,
  judging,
  winnerSelected,
}: {
  expression: BrandPresentationVisualExpressionCandidate;
  onJudgment: (judgment: VisualExpressionJudgment) => void;
  onWinner: () => void;
  onRevise: () => void;
  judging: boolean;
  winnerSelected: boolean;
}) {
  const saved = expression.founderJudgment;

  return (
    <article className="site00-experiment-g-vf__expression">
      <h5 className="site00-experiment-g-vf__expression-name">
        Expression {expression.expressionLabel}: {expression.expressionName}
      </h5>
      <p className="site00-experiment-g-vf__thesis">{expression.expressionThesis}</p>
      {expression.assetPublicUrl ? (
        <a href={expression.assetPublicUrl} target="_blank" rel="noreferrer" className="site00-experiment-g-vf__image-link">
          <img
            src={expression.assetPublicUrl}
            alt={`${expression.expressionName} visual benchmark`}
            className="site00-experiment-g-vf__image"
            loading="lazy"
          />
        </a>
      ) : (
        <p className="site00-experiment-g-vf__pending">Visual not yet generated</p>
      )}
      <details className="site00-experiment-g-vf__details">
        <summary>VIEW EXPRESSION CONTRACT</summary>
        <dl className="site00-experiment-g-vf__dl">
          <div><dt>COMPOSITION</dt><dd>{expression.compositionBehavior}</dd></div>
          <div><dt>TYPOGRAPHY</dt><dd>{expression.typographyBehavior}</dd></div>
          <div><dt>IMAGERY</dt><dd>{expression.imageryBehavior}</dd></div>
          <div><dt>INFORMATION</dt><dd>{expression.informationBehavior}</dd></div>
          <div><dt>RECURRENCE</dt><dd>{expression.recurrenceBehavior}</dd></div>
          {expression.siblingDistinctivenessEval ? (
            <div><dt>DISTINCTIVENESS</dt><dd>{expression.siblingDistinctivenessEval.result.replace(/_/g, ' ')}</dd></div>
          ) : null}
          {expression.directionDriftEval ? (
            <div><dt>DIRECTION FIDELITY</dt><dd>{expression.directionDriftEval.result.replace(/_/g, ' ')}</dd></div>
          ) : null}
        </dl>
      </details>
      {saved ? (
        <p className="site00-experiment-g-vf__judgment-saved" role="status">
          YOUR JUDGMENT: {formatLabel(saved)} — saved
        </p>
      ) : null}
      {expression.assetPublicUrl && !winnerSelected ? (
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
              GENERATE REVISION (SURGICAL)
            </button>
          ) : null}
          <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={onWinner}>
            SELECT BRAND PRESENTATION WINNER
          </button>
        </>
      ) : null}
    </article>
  );
}

function FinalistSection({
  finalist,
  expressions,
  judgingId,
  onJudgment,
  onWinner,
  onRevise,
  winnerSelected,
}: {
  finalist: BrandPresentationVisualFinalistSelection;
  expressions: BrandPresentationVisualExpressionCandidate[];
  judgingId: string | null;
  onJudgment: (expressionId: string, judgment: VisualExpressionJudgment) => void;
  onWinner: (expressionId: string) => void;
  onRevise: (expressionId: string) => void;
  winnerSelected: boolean;
}) {
  const siblingExpressions = expressions
    .filter((e) => e.parentDirectionId === finalist.directionId && e.revisionNumber === 0)
    .sort((a, b) => a.expressionIndex - b.expressionIndex);

  const revisions = expressions.filter(
    (e) => e.parentDirectionId === finalist.directionId && e.revisionNumber > 0,
  );

  return (
    <section className="site00-experiment-g-vf__finalist">
      <header className="site00-experiment-g-vf__finalist-header">
        <h3>
          FINALIST {finalist.selectionOrder}: {finalist.parentConceptName}
        </h3>
        <p className="site00-experiment-g-vf__direction">{finalist.directionName}</p>
      </header>
      <div className="site00-experiment-g-vf__expression-grid">
        {siblingExpressions.map((expr) => (
          <ExpressionVisualCard
            key={expr.expressionId}
            expression={expr}
            judging={judgingId === expr.expressionId}
            winnerSelected={winnerSelected}
            onJudgment={(j) => onJudgment(expr.expressionId, j)}
            onWinner={() => onWinner(expr.expressionId)}
            onRevise={() => onRevise(expr.expressionId)}
          />
        ))}
      </div>
      {revisions.length > 0 ? (
        <div className="site00-experiment-g-vf__revisions">
          <h4>REVISIONS</h4>
          {revisions.map((rev) => (
            <ExpressionVisualCard
              key={rev.expressionId}
              expression={rev}
              judging={judgingId === rev.expressionId}
              winnerSelected={winnerSelected}
              onJudgment={(j) => onJudgment(rev.expressionId, j)}
              onWinner={() => onWinner(rev.expressionId)}
              onRevise={() => onRevise(rev.expressionId)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ExperimentGBrandPresentationFinalistReview({
  projectSlug,
  run,
  onUpdate,
}: ExperimentGBrandPresentationFinalistReviewProps) {
  const [formulating, setFormulating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeFinalists = (run?.finalists ?? []).filter((f) => f.status === 'SELECTED').sort((a, b) => a.selectionOrder - b.selectionOrder);
  const expressions = run?.expressions ?? [];
  const hasExpressions = expressions.filter((e) => e.revisionNumber === 0).length >= 6;
  const hasVisuals = expressions.some((e) => e.assetPublicUrl);
  const winnerSelected = Boolean(run?.winner);

  const formulate = useCallback(async () => {
    setFormulating(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.experimentGVisualFormulate(projectSlug);
      onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formulation failed');
    } finally {
      setFormulating(false);
    }
  }, [onUpdate, projectSlug]);

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
    async (expressionId: string, judgment: VisualExpressionJudgment) => {
      setJudgingId(expressionId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualJudgment(projectSlug, expressionId, judgment);
        onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Judgment failed');
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const selectWinner = useCallback(
    async (expressionId: string) => {
      setJudgingId(expressionId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualWinner(projectSlug, expressionId);
        onUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Winner selection failed');
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const revise = useCallback(
    async (expressionId: string) => {
      setJudgingId(expressionId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualRevise(projectSlug, expressionId, {
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

  const costPreview = run?.explorationPolicy
    ? {
        finalists: 2,
        expressionsPerFinalist: 3,
        totalVisuals: 6,
        falRequests: 6,
        estimatedCost: '$0.48',
      }
    : null;

  return (
    <div className="site00-experiment-g-vf">
      <p className="site00-experiment-g-vf__experiment">EXPERIMENT G — FINALIST VISUAL FORMULATION</p>
      <h2 className="site00-experiment-g-vf__title">NDXBOOK Brand Presentation Finalists</h2>
      <p className="site00-experiment-g-vf__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · 2 finalists · 3 expressions each · 6 visuals
      </p>
      {run?.crossFinalistCollapseEval ? (
        <p className="site00-experiment-g-vf__audit">
          Cross-finalist: {run.crossFinalistCollapseEval.result.replace(/_/g, ' ')}
        </p>
      ) : null}
      {error ? <p className="site00-experiment-g-vf__error" role="alert">{error}</p> : null}
      {run?.winner ? (
        <div className="site00-experiment-g-vf__winner-banner" role="status">
          ✓ WINNER SELECTED: {run.winner.parentConceptName} → {run.winner.directionName} → Expression{' '}
          {run.winner.expressionLabel}. Eligible for expression system development. Brand Canon NOT mutated.
        </div>
      ) : null}
      <div className="site00-experiment-g-vf__controls">
        {activeFinalists.length === 2 && !hasExpressions ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={formulating} onClick={() => void formulate()}>
            {formulating ? 'FORMULATING EXPRESSIONS…' : 'FORMULATE VISUAL EXPRESSIONS (6 CONTRACTS)'}
          </button>
        ) : null}
        {hasExpressions && !hasVisuals ? (
          <>
            {costPreview ? (
              <div className="site00-experiment-g-vf__cost-preview">
                <p>FINALISTS: {costPreview.finalists}</p>
                <p>EXPRESSIONS PER FINALIST: {costPreview.expressionsPerFinalist}</p>
                <p>TOTAL VISUALS: {costPreview.totalVisuals}</p>
                <p>FAL REQUESTS: {costPreview.falRequests}</p>
                <p>ESTIMATED COST: {costPreview.estimatedCost}</p>
                <p>REFERENCE-CONDITIONED: no (per expression)</p>
              </div>
            ) : null}
            <button type="button" className="site00-btn site00-btn--primary" disabled={generating} onClick={() => void generate()}>
              {generating ? 'GENERATING FINALIST VISUALS…' : 'GENERATE FINALIST VISUALS'}
            </button>
          </>
        ) : null}
      </div>
      {activeFinalists.length < 2 ? (
        <p className="site00-experiment-g-vf__pending">
          Select exactly 2 visual finalists on the Direction Review page before formulation.
        </p>
      ) : null}
      {activeFinalists.map((finalist) => (
        <FinalistSection
          key={finalist.selectionId}
          finalist={finalist}
          expressions={expressions}
          judgingId={judgingId}
          onJudgment={(id, j) => void setJudgment(id, j)}
          onWinner={(id) => void selectWinner(id)}
          onRevise={(id) => void revise(id)}
          winnerSelected={winnerSelected}
        />
      ))}
    </div>
  );
}
