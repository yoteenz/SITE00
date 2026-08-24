import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  BrandPresentationConceptFormationRun,
  BrandPresentationConceptTerritory,
} from '../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types';
import { EXPERIMENT_G_CONCEPT_JUDGMENTS } from '../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/constants';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectExperimentFPath, site00ProjectExperimentGDirectionsPath } from '../../config/routes';
import { canDevelopTop3Directions } from '../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/parentConceptSelection';

type ExperimentGBrandPresentationConceptReviewProps = {
  projectSlug: string;
  run: BrandPresentationConceptFormationRun | null | undefined;
  onUpdate?: (run?: BrandPresentationConceptFormationRun) => void;
};

type FounderConceptJudgment = Exclude<
  BrandPresentationConceptTerritory['founderJudgment'],
  'REFORM_SET' | null
>;

const FOUNDER_JUDGMENT_OPTIONS = EXPERIMENT_G_CONCEPT_JUDGMENTS.filter(
  (j): j is FounderConceptJudgment => j !== 'REFORM_SET',
);

function formatFounderJudgmentLabel(judgment: FounderConceptJudgment): string {
  switch (judgment) {
    case 'LOVE_THE_CONCEPT':
      return 'LOVE THE CONCEPT';
    case 'PROMISING_DEVELOP':
      return 'PROMISING — DEVELOP';
    case 'TOO_CLOSE_TO_ANOTHER':
      return 'TOO CLOSE TO ANOTHER';
    case 'TOO_CONTENT_SPECIFIC':
      return 'TOO CONTENT-SPECIFIC';
    case 'NOT_NDXBOOK':
      return 'NOT NDXBOOK';
    default: {
      const exhaustive: never = judgment;
      return String(exhaustive).replace(/_/g, ' ');
    }
  }
}

function founderJudgmentSavedMessage(judgment: FounderConceptJudgment): string {
  if (judgment === 'LOVE_THE_CONCEPT') {
    return 'YOU LOVED THIS CONCEPT — selection saved';
  }
  return `YOUR SELECTION: ${formatFounderJudgmentLabel(judgment)} — saved`;
}

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run Experiment G';
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
  concept: BrandPresentationConceptTerritory;
  onJudgment: (judgment: FounderConceptJudgment) => void;
  judging: boolean;
}) {
  const savedJudgment =
    concept.founderJudgment && concept.founderJudgment !== 'REFORM_SET'
      ? concept.founderJudgment
      : null;

  return (
    <article className="site00-experiment-g__card">
      <h4 className="site00-experiment-g__card-title">{concept.name}</h4>
      <p className="site00-experiment-g__thesis">{concept.conceptThesis}</p>
      <dl className="site00-experiment-g__dl">
        <div><dt>WHAT NDXBOOK BECOMES</dt><dd>{concept.brandExistenceModel}</dd></div>
        <div><dt>AUDIENCE RELATIONSHIP</dt><dd>{concept.audienceRelationship}</dd></div>
        <div><dt>RECURRING BRAND BEHAVIOR</dt><dd>{concept.brandBehavior}</dd></div>
        <div><dt>KNOWLEDGE / AUTHORITY</dt><dd>{concept.knowledgeBehavior} · {concept.authorityModel}</dd></div>
        <div><dt>RECURRENCE ENGINE</dt><dd>{concept.recurrenceEngine}</dd></div>
        <div><dt>TOPIC INDEPENDENCE</dt><dd>{concept.topicIndependence}</dd></div>
        <div><dt>DIRECTION RANGE</dt><dd>{concept.possibleDirectionRange.map((d) => d.directionSeed).join(' · ')}</dd></div>
        {concept.brandPresentationLevel ? (
          <div><dt>BRAND-PRESENTATION GATE</dt><dd>{concept.brandPresentationLevel.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
        {concept.topicIndependenceEval ? (
          <div><dt>TOPIC SUBSTITUTION</dt><dd>{concept.topicIndependenceEval.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
      </dl>
      <details className="site00-experiment-g__details">
        <summary>METHODOLOGY DETAIL</summary>
        <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
          {JSON.stringify(
            {
              recurrence: concept.recurrenceEval?.result,
              conceptVsDirection: concept.conceptVsDirection?.result,
              notThis: concept.notThis,
            },
            null,
            2,
          )}
        </pre>
      </details>
      {savedJudgment ? (
        <p
          className={`site00-experiment-g__judgment-saved${savedJudgment === 'LOVE_THE_CONCEPT' ? ' site00-experiment-g__judgment-saved--love' : ''}`}
          role="status"
          aria-live="polite"
        >
          {savedJudgment === 'LOVE_THE_CONCEPT' ? '✓ ' : ''}
          {founderJudgmentSavedMessage(savedJudgment)}
        </p>
      ) : null}
      <div className="site00-experiment-g__judgment">
        {FOUNDER_JUDGMENT_OPTIONS.map((judgment) => (
          <button
            key={judgment}
            type="button"
            className={
              savedJudgment === judgment
                ? 'site00-btn site00-btn--primary site00-experiment-g__judgment-btn--active'
                : 'site00-btn'
            }
            disabled={judging}
            aria-pressed={savedJudgment === judgment}
            onClick={() => onJudgment(judgment)}
          >
            {formatFounderJudgmentLabel(judgment)}
          </button>
        ))}
      </div>
    </article>
  );
}

export function ExperimentGBrandPresentationConceptReview({
  projectSlug,
  run,
  onUpdate,
}: ExperimentGBrandPresentationConceptReviewProps) {
  const [forming, setForming] = useState(false);
  const [reforming, setReforming] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formConcepts = useCallback(async (options?: { forceRetry?: boolean }) => {
    setForming(true);
    setError(null);
    try {
      // Snapshot prep runs server-side when missing. Avoid clobbering FORMING by re-preparing here.
      if (!run?.intelligenceSnapshot) {
        await site00ProjectsApi.experimentGPrepareSnapshot(projectSlug);
      }
      await site00ProjectsApi.experimentGFormConcepts(projectSlug, options);
      onUpdate?.();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setForming(false);
    }
  }, [onUpdate, projectSlug, run?.intelligenceSnapshot]);

  const reformSet = useCallback(async () => {
    setReforming(true);
    setError(null);
    try {
      await site00ProjectsApi.experimentGReformSet(projectSlug);
      onUpdate?.();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setReforming(false);
    }
  }, [onUpdate, projectSlug]);

  const setJudgment = useCallback(
    async (conceptId: string, judgment: FounderConceptJudgment) => {
      setJudgingId(conceptId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentGConceptJudgment(projectSlug, conceptId, judgment);
        onUpdate?.(result.run as BrandPresentationConceptFormationRun);
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const concepts = run?.concepts ?? [];
  const formationBlocked = forming || reforming || run?.status === 'FORMING';
  const canFormConcepts =
    !formationBlocked &&
    (concepts.length === 0 ||
      run?.status === 'NOT_STARTED' ||
      run?.status === 'SNAPSHOT_READY' ||
      run?.status === 'FAILED' ||
      !run);
  const canRetryStalledFormation = !forming && !reforming && run?.status === 'FORMING';
  const canReformSet = !formationBlocked && concepts.length > 0;
  const formButtonLabel =
    run?.status === 'FAILED'
      ? forming
        ? 'RETRYING…'
        : 'RETRY FORMATION'
      : forming
        ? 'FORMING…'
        : 'FORM SIX BRAND PRESENTATION CONCEPTS';

  return (
    <div className="site00-experiment-g">
      <p className="site00-experiment-g__experiment">EXPERIMENT G — BRAND PRESENTATION CONCEPT FORMATION</p>
      <h2 className="site00-experiment-g__title">Six Brand Presentation Concepts</h2>
      <p className="site00-experiment-g__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · Topic-blind · No images · No directions yet
      </p>
      <div className="site00-experiment-g__banner">
        Corrected upstream formation — how NDXBOOK exists as a persistent social brand, not how to explain one topic.
        Experiment F preserved as downstream content-concept research.{' '}
        <Link to={site00ProjectExperimentFPath(projectSlug)}>View Experiment F history</Link>
      </div>
      {run?.error ? (
        <p className="site00-experiment-g__error" role="alert">
          Last formation error: {run.error}
        </p>
      ) : null}
      {error ? <p className="site00-experiment-g__error" role="alert">{error}</p> : null}
      <div className="site00-experiment-g__controls">
        {canFormConcepts ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={formationBlocked} onClick={() => void formConcepts()}>
            {formButtonLabel}
          </button>
        ) : null}
        {canRetryStalledFormation ? (
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={forming || reforming}
            onClick={() => void formConcepts({ forceRetry: true })}
          >
            {forming ? 'RETRYING…' : 'RETRY STALLED FORMATION'}
          </button>
        ) : null}
        {canReformSet ? (
          <>
            <button type="button" className="site00-btn" disabled={formationBlocked} onClick={() => void formConcepts()}>
              {forming ? 'REFRESHING…' : 'REFRESH FORMATION (IDEMPOTENT)'}
            </button>
            <button type="button" className="site00-btn" disabled={formationBlocked} onClick={() => void reformSet()}>
              {reforming ? 'REFORMING…' : 'RE-FORM SET'}
            </button>
          </>
        ) : null}
      </div>
      {concepts.length > 0 ? (
        <p className="site00-experiment-g__regen-help">
          To regenerate: tap <strong>RE-FORM SET</strong> for a fresh six-concept pass (keeps history). Use{' '}
          <strong>REFRESH FORMATION</strong> only to re-run the same snapshot idempotently. Formation runs on the API
          (2–5 min) — leave the page if needed; status polls automatically.
        </p>
      ) : null}
      {canDevelopTop3Directions(run) ? (
        <div className="site00-experiment-g__direction-cta">
          <p className="site00-experiment-g__direction-cta-copy">
            Three concepts loved — ready for direction development (3 × 3 = 9 directions, no visual generation).
          </p>
          <Link to={site00ProjectExperimentGDirectionsPath(projectSlug)} className="site00-btn site00-btn--primary">
            DEVELOP TOP 3 DIRECTIONS →
          </Link>
        </div>
      ) : null}
      {run?.status === 'FORMING' ? (
        <p className="site00-experiment-g__pending">
          Formation running as a background job on the server (usually 2–5 minutes). You can leave this page —
          status refreshes every few seconds. If it stays stuck more than 15 minutes, refresh or tap RETRY STALLED
          FORMATION.
        </p>
      ) : concepts.length === 0 ? (
        <p className="site00-experiment-g__pending">
          {run?.status === 'FAILED'
            ? 'Formation failed. Use RETRY FORMATION above to run again.'
            : 'No concepts formed yet. Founder-triggered formation required.'}
        </p>
      ) : (
        <div className="site00-experiment-g__grid">
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              judging={judgingId === concept.id}
              onJudgment={(judgment) => void setJudgment(concept.id, judgment)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
