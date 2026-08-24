import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  BrandPresentationDirectionCandidate,
  BrandPresentationDirectionFormationRun,
  BrandPresentationDirectionParentGroup,
} from '../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types';
import type { BrandPresentationVisualFormulationRun } from '../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types';
import { ELIGIBLE_PARENT_CONCEPT_NAMES } from '../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectExperimentGPath, site00ProjectExperimentGFinalistsPath } from '../../config/routes';

type ExperimentGBrandPresentationDirectionReviewProps = {
  projectSlug: string;
  run: BrandPresentationDirectionFormationRun | null | undefined;
  visualRun?: BrandPresentationVisualFormulationRun | null;
  onUpdate?: (run?: BrandPresentationDirectionFormationRun) => void;
  onVisualUpdate?: (run?: BrandPresentationVisualFormulationRun) => void;
};

type FounderDirectionJudgment = Exclude<
  BrandPresentationDirectionCandidate['founderJudgment'],
  null
>;

const JUDGMENT_OPTIONS: FounderDirectionJudgment[] = [
  'LOVE_THE_DIRECTION',
  'PROMISING_DEVELOP',
  'TOO_CLOSE_TO_SIBLING',
  'DRIFTS_FROM_CONCEPT',
  'TOO_CONTENT_SPECIFIC',
  'TOO_FORMAT_SPECIFIC',
  'TOO_STYLE_DEPENDENT',
  'NOT_NDXBOOK',
];

function formatJudgmentLabel(j: FounderDirectionJudgment): string {
  return j.replace(/_/g, ' ');
}

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run direction development';
  if (/unknown action/i.test(raw)) {
    return 'API NOT UPDATED — redeploy api.site00.com from main on Railway, then retry.';
  }
  return raw;
}

function DirectionCard({
  direction,
  onJudgment,
  onFinalist,
  judging,
  finalistActive,
  finalistLoading,
}: {
  direction: BrandPresentationDirectionCandidate;
  onJudgment: (judgment: FounderDirectionJudgment) => void;
  onFinalist: (selected: boolean) => void;
  judging: boolean;
  finalistActive: boolean;
  finalistLoading: boolean;
}) {
  const saved = direction.founderJudgment;

  return (
    <article className="site00-experiment-g-dir__card">
      <h5 className="site00-experiment-g-dir__direction-name">{direction.directionName}</h5>
      <p className="site00-experiment-g-dir__thesis">{direction.directionThesis}</p>
      <dl className="site00-experiment-g-dir__dl">
        <div><dt>HOW NDXBOOK BEHAVES</dt><dd>{direction.brandBehavior}</dd></div>
        <div><dt>AUDIENCE EXPERIENCE</dt><dd>{direction.audienceRelationship}</dd></div>
        <div><dt>PUBLISHING</dt><dd>{direction.publishingBehavior}</dd></div>
        <div><dt>KNOWLEDGE MOVES</dt><dd>{direction.knowledgeBehavior}</dd></div>
        <div><dt>RECURRENCE</dt><dd>{direction.recurrenceBehavior}</dd></div>
        <div><dt>DIFFERS FROM SIBLINGS</dt><dd>{direction.directionInterpretation}</dd></div>
        <div><dt>COULD EVENTUALLY FEEL LIKE</dt><dd>{direction.visualImplications}</dd></div>
        <div><dt>MUST NOT BECOME</dt><dd>{direction.notThis.join(' · ')}</dd></div>
        {direction.topicIndependenceEval ? (
          <div><dt>TOPIC INDEPENDENCE</dt><dd>{direction.topicIndependenceEval.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
        {direction.parentConceptFidelity ? (
          <div><dt>PARENT FIDELITY</dt><dd>{direction.parentConceptFidelity.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
        {direction.siblingDistinctiveness ? (
          <div><dt>DISTINCTIVENESS</dt><dd>{direction.siblingDistinctiveness.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
      </dl>
      <details className="site00-experiment-g-dir__details">
        <summary>VIEW METHODOLOGY DETAIL</summary>
        <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
          {JSON.stringify(
            {
              expressionSeeds: direction.possibleExpressionSeeds,
              antiCollapse: direction.antiCollapseRules,
              recurrence: direction.recurrenceEval?.result,
            },
            null,
            2,
          )}
        </pre>
      </details>
      {saved ? (
        <p
          className={`site00-experiment-g-dir__judgment-saved${saved === 'LOVE_THE_DIRECTION' ? ' site00-experiment-g-dir__judgment-saved--love' : ''}`}
          role="status"
        >
          {saved === 'LOVE_THE_DIRECTION' ? '✓ ' : ''}
          YOUR SELECTION: {formatJudgmentLabel(saved)} — saved
        </p>
      ) : null}
      <div className="site00-experiment-g-dir__finalist-row">
        <button
          type="button"
          className={
            finalistActive
              ? 'site00-btn site00-btn--primary site00-experiment-g-dir__finalist-btn--active'
              : 'site00-btn'
          }
          disabled={finalistLoading || judging}
          aria-pressed={finalistActive}
          onClick={() => onFinalist(!finalistActive)}
        >
          {finalistActive ? '✓ VISUAL FINALIST' : 'SELECT AS VISUAL FINALIST'}
        </button>
      </div>
      <div className="site00-experiment-g-dir__judgment">
        {JUDGMENT_OPTIONS.map((j) => (
          <button
            key={j}
            type="button"
            className={
              saved === j
                ? 'site00-btn site00-btn--primary site00-experiment-g-dir__judgment-btn--active'
                : 'site00-btn'
            }
            disabled={judging}
            aria-pressed={saved === j}
            onClick={() => onJudgment(j)}
          >
            {formatJudgmentLabel(j)}
          </button>
        ))}
      </div>
    </article>
  );
}

function ParentSection({
  group,
  directions,
  judgingId,
  finalistIds,
  finalistLoadingId,
  onJudgment,
  onFinalist,
}: {
  group: BrandPresentationDirectionParentGroup;
  directions: BrandPresentationDirectionCandidate[];
  judgingId: string | null;
  finalistIds: Set<string>;
  finalistLoadingId: string | null;
  onJudgment: (directionId: string, judgment: FounderDirectionJudgment) => void;
  onFinalist: (directionId: string, selected: boolean) => void;
}) {
  const siblings = directions.filter((d) => group.directionIds.includes(d.directionId));

  return (
    <section className="site00-experiment-g-dir__parent">
      <header className="site00-experiment-g-dir__parent-header">
        <h3>{group.parentConceptName}</h3>
        <p className="site00-experiment-g-dir__parent-thesis">{group.parentSnapshot.conceptThesis}</p>
        <p className="site00-experiment-g-dir__parent-meta">
          Sibling distinctiveness: {group.siblingDistinctiveness.result.replace(/_/g, ' ')} · Parent fidelity:{' '}
          {group.parentFidelitySummary.passCount}/{siblings.length} pass
        </p>
      </header>
      <div className="site00-experiment-g-dir__grid">
        {siblings.map((direction) => (
          <DirectionCard
            key={direction.directionId}
            direction={direction}
            judging={judgingId === direction.directionId}
            finalistActive={finalistIds.has(direction.directionId)}
            finalistLoading={finalistLoadingId === direction.directionId}
            onJudgment={(judgment) => onJudgment(direction.directionId, judgment)}
            onFinalist={(selected) => onFinalist(direction.directionId, selected)}
          />
        ))}
      </div>
    </section>
  );
}

export function ExperimentGBrandPresentationDirectionReview({
  projectSlug,
  run,
  visualRun,
  onUpdate,
  onVisualUpdate,
}: ExperimentGBrandPresentationDirectionReviewProps) {
  const [forming, setForming] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [finalistLoadingId, setFinalistLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formDirections = useCallback(async (options?: { forceRetry?: boolean }) => {
    setForming(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.experimentGDirectionForm(projectSlug, options);
      onUpdate?.(result.run as BrandPresentationDirectionFormationRun);
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setForming(false);
    }
  }, [onUpdate, projectSlug]);

  const setJudgment = useCallback(
    async (directionId: string, judgment: FounderDirectionJudgment) => {
      setJudgingId(directionId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGDirectionJudgment(projectSlug, directionId, judgment);
        onUpdate?.(result.run as BrandPresentationDirectionFormationRun);
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const toggleFinalist = useCallback(
    async (directionId: string, selected: boolean) => {
      setFinalistLoadingId(directionId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGVisualFinalist(projectSlug, directionId, selected);
        onVisualUpdate?.(result.run as BrandPresentationVisualFormulationRun);
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setFinalistLoadingId(null);
      }
    },
    [onVisualUpdate, projectSlug],
  );

  const directions = run?.directions ?? [];
  const activeFinalists = (visualRun?.finalists ?? []).filter((f) => f.status === 'SELECTED');
  const finalistIds = new Set(activeFinalists.map((f) => f.directionId));
  const formationBlocked = forming || run?.status === 'FORMING';
  const canForm =
    !formationBlocked &&
    (!run || run.status === 'NOT_STARTED' || run.status === 'PARENTS_READY' || run.status === 'FAILED');
  const hasDirections = directions.length > 0;

  return (
    <div className="site00-experiment-g-dir">
      <p className="site00-experiment-g-dir__experiment">EXPERIMENT G — TOP-3 CONCEPT DEVELOPMENT</p>
      <h2 className="site00-experiment-g-dir__title">Brand Presentation Direction Development</h2>
      <p className="site00-experiment-g-dir__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · 3 parent concepts · 9 directions · Visual
        finalists: {activeFinalists.length}/2
      </p>
      {activeFinalists.length === 2 ? (
        <p className="site00-experiment-g-dir__finalist-count">
          <Link to={site00ProjectExperimentGFinalistsPath(projectSlug)}>→ FINALIST VISUAL FORMULATION (6 visuals)</Link>
        </p>
      ) : null}
      <div className="site00-experiment-g-dir__banner">
        Select exactly 2 directions as visual finalists — independent from LOVE THE DIRECTION. Visual evidence comes
        before final winner selection.{' '}
        <Link to={site00ProjectExperimentGPath(projectSlug)}>← Brand presentation concepts</Link>
      </div>
      <ul className="site00-experiment-g-dir__parents-list">
        {ELIGIBLE_PARENT_CONCEPT_NAMES.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      {run?.error ? (
        <p className="site00-experiment-g-dir__error" role="alert">
          Last formation error: {run.error}
        </p>
      ) : null}
      {error ? <p className="site00-experiment-g-dir__error" role="alert">{error}</p> : null}
      <div className="site00-experiment-g-dir__controls">
        {canForm ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={formationBlocked} onClick={() => void formDirections()}>
            {forming ? 'FORMING DIRECTIONS…' : 'DEVELOP TOP 3 DIRECTIONS (9 TOTAL)'}
          </button>
        ) : null}
        {run?.status === 'FAILED' ? (
          <button type="button" className="site00-btn" disabled={forming} onClick={() => void formDirections({ forceRetry: true })}>
            RETRY DIRECTION FORMATION
          </button>
        ) : null}
      </div>
      {canForm && !hasDirections ? (
        <div className="site00-experiment-g-dir__cost-preview">
          <p>PARENT CONCEPTS: 3</p>
          <p>DIRECTIONS EXPECTED: 9</p>
          <p>ANTHROPIC REQUESTS: ~3 (one per parent concept)</p>
          <p>FAL REQUESTS: 0 · IMAGE COST: $0</p>
        </div>
      ) : null}
      {run?.status === 'FORMING' ? (
        <p className="site00-experiment-g-dir__pending">
          Direction formation running on the server (usually 2–5 minutes). Status refreshes automatically.
        </p>
      ) : null}
      {run?.crossParentAudit ? (
        <p className="site00-experiment-g-dir__audit">
          Cross-parent audit: {run.crossParentAudit.result.replace(/_/g, ' ')}
          {run.crossParentAudit.semanticAuditResult === 'SEMANTIC_AUDIT_NOT_EVALUATED'
            ? ' · semantic audit not evaluated'
            : ''}
        </p>
      ) : null}
      {hasDirections
        ? run!.parentGroups.map((group) => (
            <ParentSection
              key={group.parentConceptId}
              group={group}
              directions={directions}
              judgingId={judgingId}
              finalistIds={finalistIds}
              finalistLoadingId={finalistLoadingId}
              onJudgment={(id, j) => void setJudgment(id, j)}
              onFinalist={(id, sel) => void toggleFinalist(id, sel)}
            />
          ))
        : !formationBlocked && run?.status !== 'FORMING' ? (
            <p className="site00-experiment-g-dir__pending">Founder-triggered direction formation required.</p>
          ) : null}
    </div>
  );
}
