import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  SixConceptReformationRun,
  CreativeConceptTerritoryV2,
  HistoricalConceptComparison,
  DirectionSeed,
} from '../../../../shared/site00-brand-lore/conceptTerritoryV2/types';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectExperimentDPath, site00ProjectExperimentGPath } from '../../config/routes';

type ExperimentFSixConceptReformationReviewProps = {
  projectSlug: string;
  run: SixConceptReformationRun | null | undefined;
  onUpdate?: () => void;
};

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run Experiment F';
  if (/unknown action/i.test(raw)) {
    return 'API NOT UPDATED — redeploy api.site00.com from main on Railway, then retry.';
  }
  return raw;
}

function ConceptCard({
  concept,
  onJudgment,
  judging,
}: {
  concept: CreativeConceptTerritoryV2;
  onJudgment: (judgment: 'LOVE_THE_CONCEPT' | 'PROMISING_DEVELOP' | 'TOO_CLOSE' | 'NOT_NDXBOOK') => void;
  judging: boolean;
}) {
  const gate = concept.conceptVsDirection;
  return (
    <article className="site00-experiment-f__card">
      <h4 className="site00-experiment-f__card-title">{concept.conceptName}</h4>
      <p className="site00-experiment-f__thesis">{concept.conceptThesis}</p>
      <dl className="site00-experiment-f__dl">
        <div><dt>CORE IDEA</dt><dd>{concept.coreCreativeIdea}</dd></div>
        <div><dt>VIEWER ROLE</dt><dd>{concept.viewerRole}</dd></div>
        <div><dt>WHAT HAPPENS</dt><dd>{concept.participationLogic}</dd></div>
        <div><dt>WHY NDXBOOK</dt><dd>{concept.whyThisIsNdxbook}</dd></div>
        <div><dt>DIRECTION RANGE</dt><dd>{concept.possibleDirectionRange.map((d: DirectionSeed) => d.directionSeed).join(' · ')}</dd></div>
        {gate ? (
          <div><dt>CONCEPT VS DIRECTION</dt><dd>{gate.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
      </dl>
      <div className="site00-experiment-f__judgment">
        <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={() => onJudgment('LOVE_THE_CONCEPT')}>LOVE THE CONCEPT</button>
        <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('PROMISING_DEVELOP')}>PROMISING — DEVELOP</button>
        <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_CLOSE')}>TOO CLOSE</button>
        <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('NOT_NDXBOOK')}>NOT NDXBOOK</button>
      </div>
    </article>
  );
}

export function ExperimentFSixConceptReformationReview({
  projectSlug,
  run,
  onUpdate,
}: ExperimentFSixConceptReformationReviewProps) {
  const [forming, setForming] = useState(false);
  const [reforming, setReforming] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const reload = useCallback(async () => {
    onUpdate?.();
  }, [onUpdate]);

  const formConcepts = useCallback(async () => {
    setForming(true);
    setError(null);
    try {
      await site00ProjectsApi.experimentFPrepareSnapshot(projectSlug);
      await site00ProjectsApi.experimentFFormConcepts(projectSlug);
      await reload();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setForming(false);
    }
  }, [projectSlug, reload]);

  const reformSet = useCallback(async () => {
    setReforming(true);
    setError(null);
    try {
      await site00ProjectsApi.experimentFReformSet(projectSlug);
      await reload();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setReforming(false);
    }
  }, [projectSlug, reload]);

  const setJudgment = useCallback(
    async (conceptId: string, judgment: 'LOVE_THE_CONCEPT' | 'PROMISING_DEVELOP' | 'TOO_CLOSE' | 'NOT_NDXBOOK') => {
      setJudgingId(conceptId);
      try {
        await site00ProjectsApi.experimentFConceptJudgment(projectSlug, conceptId, judgment);
        await reload();
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudgingId(null);
      }
    },
    [projectSlug, reload],
  );

  if (!run) {
    return (
      <section className="site00-experiment-f" aria-label="Experiment F six-concept reformation">
        <p className="site00-experiment-f__experiment">EXPERIMENT F — SIX-CONCEPT REFORMATION</p>
        <h3 className="site00-experiment-f__title">CREDIT UTILIZATION · CONCEPT TERRITORY V2</h3>
        <p className="site00-experiment-f__meta">CURRENT STAGE: CONCEPT FORMATION · READY TO FORM SIX CONCEPTS</p>
        <p className="site00-experiment-f__meta">
          Concept before direction. No visual generation. Experiment D historical six quarantined from formation.
        </p>
        <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={() => void formConcepts()}>
          {forming ? 'FORMING…' : 'FORM SIX CONCEPTS'}
        </button>
        {error ? <p className="site00-experiment-f__error" role="alert">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="site00-experiment-f" aria-label="Experiment F six-concept reformation">
      <p className="site00-experiment-f__experiment">EXPERIMENT F — SIX-CONCEPT REFORMATION</p>
      <h3 className="site00-experiment-f__title">CREDIT UTILIZATION · {run.methodologyVersion.replace(/_/g, ' ')}</h3>
      <p className="site00-experiment-f__meta">
        CURRENT STAGE: {run.currentStage.replace(/_/g, ' ')} · STATUS: {run.status.replace(/_/g, ' ')} · FORMATION v{run.formationVersion}
      </p>
      <p className="site00-experiment-f__meta">
        DISTINCTIVENESS: {run.orthogonality?.setResult?.replace(/_/g, ' ') ?? 'NOT EVALUATED'} · VISUAL GENERATION: BLOCKED
      </p>
      <p className="site00-experiment-f__meta">
        Historical record — reinterpreted as CONTENT CONCEPT TERRITORY (credit utilization topic). Preserved for downstream research.{' '}
        <Link to={site00ProjectExperimentGPath(projectSlug)}>Successor: Experiment G Brand Presentation →</Link>
      </p>
      <p className="site00-experiment-f__meta">
        <Link to={site00ProjectExperimentDPath(projectSlug)}>Experiment D — historical evidence (preserved) →</Link>
      </p>

      {error ? <p className="site00-experiment-f__error" role="alert">{error}</p> : null}

      <div className="site00-experiment-f__controls">
        {run.concepts.length === 0 ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={() => void formConcepts()}>
            {forming ? 'FORMING…' : 'FORM SIX CONCEPTS'}
          </button>
        ) : (
          <>
            <button type="button" className="site00-btn" disabled={forming} onClick={() => void formConcepts()}>
              REFRESH FORMATION (IDEMPOTENT)
            </button>
            <button type="button" className="site00-btn" disabled={reforming} onClick={() => void reformSet()}>
              {reforming ? 'REFORMING…' : 'RE-FORM SET'}
            </button>
          </>
        )}
        {run.historicalComparisonAvailable ? (
          <button type="button" className="site00-btn" onClick={() => setShowComparison((v) => !v)}>
            {showComparison ? 'HIDE EXPERIMENT D COMPARISON' : 'COMPARE WITH EXPERIMENT D'}
          </button>
        ) : null}
      </div>

      <div className="site00-experiment-f__grid">
        {run.concepts.map((concept: CreativeConceptTerritoryV2) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            judging={judgingId === concept.id}
            onJudgment={(j) => void setJudgment(concept.id, j)}
          />
        ))}
      </div>

      {showComparison && run.historicalComparison ? (
        <div className="site00-experiment-f__comparison">
          <h4>POST-FORMATION EXPERIMENT D COMPARISON</h4>
          <ul>
            {run.historicalComparison.slice(0, 12).map((row: HistoricalConceptComparison, i: number) => (
              <li key={`${row.newConceptId}-${row.oldDirectionName}-${i}`}>
                {row.newConceptName} ↔ {row.oldDirectionName}: {row.relation.replace(/_/g, ' ')}
                {row.salvageCandidate ? ' · SALVAGE CANDIDATE' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
