import { useCallback, useEffect, useState } from 'react';
import type {
  SixDirectionConsistencyDirection,
  SixDirectionConsistencyRun,
} from '../../../../shared/site00-brand-lore/sixDirectionConsistencyTypes';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

type SixDirectionConsistencyReviewProps = {
  projectSlug: string;
  replayId: string;
  consistency: SixDirectionConsistencyRun | null | undefined;
  onUpdate?: () => void;
};

function heroUrl(direction: SixDirectionConsistencyDirection): string {
  return direction.heroAsset?.storagePath ? site00StoragePublicUrl(direction.heroAsset.storagePath) : '';
}

export function SixDirectionConsistencyReview({
  projectSlug,
  replayId,
  consistency,
  onUpdate,
}: SixDirectionConsistencyReviewProps) {
  const [starting, setStarting] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [judging, setJudging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    if (!consistency || consistency.status === 'COMPLETE' || consistency.status === 'FAILED') return;
    const id = window.setInterval(() => {
      void poll();
    }, 5000);
    return () => window.clearInterval(id);
  }, [consistency, poll]);

  const startValidation = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      await site00ProjectsApi.personalityReplaySixDirectionExecute(projectSlug, replayId);
      await poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start six-direction validation');
    } finally {
      setStarting(false);
    }
  }, [poll, projectSlug, replayId]);

  const setJudgment = useCallback(
    async (comparisonIndex: number, judgment: SixDirectionConsistencyDirection['founderJudgment']) => {
      setJudging(comparisonIndex);
      try {
        await site00ProjectsApi.personalityReplaySixDirectionJudgment(
          projectSlug,
          replayId,
          comparisonIndex,
          judgment,
        );
        await poll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to save judgment');
      } finally {
        setJudging(null);
      }
    },
    [poll, projectSlug, replayId],
  );

  if (!consistency) {
    return (
      <section className="site00-six-dir-review" aria-label="Six-direction consistency validation">
        <h3 className="site00-six-dir-review__title">BLIND FORMATION CONSISTENCY VALIDATION</h3>
        <p className="site00-six-dir-review__meta site00-six-dir-review__experiment">
          EXPERIMENT A — blind personality → independent formation
        </p>
        <p className="site00-six-dir-review__meta">
          Test whether the blind replay methodology produces six strong, differentiated heroes — not five
          variations of direction #1.
        </p>
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={starting}
          onClick={() => void startValidation()}
        >
          {starting ? 'STARTING…' : 'RUN SIX-DIRECTION VALIDATION'}
        </button>
        {error ? (
          <p className="site00-six-dir-review__error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  const inProgress = !['COMPLETE', 'FAILED', 'NOT_STARTED'].includes(consistency.status);

  return (
    <section className="site00-six-dir-review" aria-label="Six-direction consistency validation">
      <h3 className="site00-six-dir-review__title">BLIND FORMATION CONSISTENCY VALIDATION</h3>
      <p className="site00-six-dir-review__meta site00-six-dir-review__experiment">
        EXPERIMENT A — blind personality → independent formation
      </p>
      <p className="site00-six-dir-review__meta">
        STATUS: {consistency.status.replace(/_/g, ' ')}
        {consistency.currentDirectionIndex ? ` · DIRECTION ${consistency.currentDirectionIndex}` : ''}
      </p>

      {consistency.consistencyVerdict ? (
        <p className="site00-six-dir-review__verdict">
          HIT RATE: {consistency.consistencyVerdict.hitRate} — {consistency.consistencyVerdict.verdict.replace(/_/g, ' ')}
        </p>
      ) : null}

      {inProgress ? (
        <p className="site00-six-dir-review__pending">GENERATING DIRECTIONS SEQUENTIALLY — REFRESH SAFE.</p>
      ) : null}

      {consistency.error ? (
        <p className="site00-six-dir-review__error" role="alert">
          {consistency.error}
        </p>
      ) : null}

      {error ? (
        <p className="site00-six-dir-review__error" role="alert">
          {error}
        </p>
      ) : null}

      {consistency.distinctivenessNotes?.length ? (
        <details className="site00-six-dir-review__audit" open={consistency.status === 'FAILED'}>
          <summary>DISTINCTIVENESS OBSERVATIONS</summary>
          {consistency.distinctivenessNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </details>
      ) : null}

      {consistency.status === 'FAILED' ? (
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={starting}
          onClick={() => void startValidation()}
        >
          {starting ? 'RETRYING…' : 'RETRY SIX-DIRECTION VALIDATION'}
        </button>
      ) : null}

      <div className="site00-six-dir-review__grid">
        {consistency.directions.map((direction) => {
          const url = heroUrl(direction);
          const isOpen = expanded === direction.comparisonIndex;
          return (
            <article key={direction.comparisonIndex} className="site00-six-dir-review__card">
              <header className="site00-six-dir-review__card-header">
                <span className="site00-six-dir-review__index">
                  {String(direction.comparisonIndex).padStart(2, '0')}
                </span>
                <div>
                  <h4>{direction.directionName}</h4>
                  <p className="site00-six-dir-review__format">{direction.nativeProofFormat.replace(/_/g, ' ')}</p>
                  <p className="site00-six-dir-review__status">{direction.firstPassStatus.replace(/_/g, ' ')}</p>
                </div>
              </header>

              {url ? (
                <figure className="site00-six-dir-review__hero">
                  <img src={url} alt={`${direction.directionName} hero`} loading="lazy" />
                </figure>
              ) : (
                <p className="site00-six-dir-review__pending">HERO PENDING…</p>
              )}

              <p className="site00-six-dir-review__idea">{direction.summary.centralThesis}</p>

              <div className="site00-six-dir-review__judgment">
                {(['LOVE_IT', 'PROMISING_REFINE', 'NOT_NDXBOOK'] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    className={[
                      'site00-six-dir-review__judgment-btn',
                      direction.founderJudgment === j ? 'site00-six-dir-review__judgment-btn--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={judging === direction.comparisonIndex}
                    onClick={() => void setJudgment(direction.comparisonIndex, j)}
                  >
                    {j.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="site00-six-dir-review__toggle"
                onClick={() => setExpanded(isOpen ? null : direction.comparisonIndex)}
              >
                {isOpen ? 'HIDE EVIDENCE' : 'VIEW CREATIVE LOGIC'}
              </button>

              {isOpen ? (
                <div className="site00-six-dir-review__evidence">
                  <p>
                    <strong>TYPOGRAPHY:</strong> {direction.typographyRationale ?? '—'}
                  </p>
                  <p>
                    <strong>COLOR:</strong> {direction.colorRationale ?? '—'}
                  </p>
                  <p>
                    <strong>FORMAT:</strong> {direction.nativeFormatRationale}
                  </p>
                  <p>
                    <strong>CONTAMINATION:</strong>{' '}
                    {direction.contaminationAudit?.passed ? 'PASS' : direction.contaminationAudit?.violations.join('; ') ?? '—'}
                  </p>
                  {direction.personalityTranslationReceipt.slice(0, 4).map((row) => (
                    <p key={row.domain}>
                      <strong>{row.domain}:</strong> {row.creativeTranslation}
                    </p>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {consistency.comparisonScorerAudit ? (
        <details className="site00-six-dir-review__audit">
          <summary>COMPARISON SCORER AUDIT (0/5 INVESTIGATION)</summary>
          <p>{consistency.comparisonScorerAudit.personalityScoreExplanation}</p>
          <p>{consistency.comparisonScorerAudit.creativeScoreExplanation}</p>
          <p>{consistency.comparisonScorerAudit.identityScoreExplanation}</p>
          <p>{consistency.comparisonScorerAudit.heroScoreExplanation}</p>
          <p>{consistency.comparisonScorerAudit.allDomainsDivergentExplanation}</p>
          {consistency.comparisonScorerAudit.fixRecommended ? (
            <p>
              <strong>FIX:</strong> {consistency.comparisonScorerAudit.fixRecommended}
            </p>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
