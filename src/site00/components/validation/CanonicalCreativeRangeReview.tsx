import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  CanonicalCreativeRangeDirection,
  CanonicalCreativeRangeRun,
} from '../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { SITE00_ROUTES } from '../../config/routes';

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to start canonical range validation';
  if (/unknown action/i.test(raw)) {
    return 'API NOT UPDATED — redeploy api.site00.com from main on Railway, then retry.';
  }
  return raw;
}

type CanonicalCreativeRangeReviewProps = {
  projectSlug: string;
  run: CanonicalCreativeRangeRun | null | undefined;
  onUpdate?: () => void;
};

function heroUrl(direction: CanonicalCreativeRangeDirection): string {
  return direction.heroAsset?.storagePath ? site00StoragePublicUrl(direction.heroAsset.storagePath) : '';
}

export function CanonicalCreativeRangeReview({
  projectSlug,
  run,
  onUpdate,
}: CanonicalCreativeRangeReviewProps) {
  const [starting, setStarting] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [judging, setJudging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    if (!run || run.status === 'COMPLETE' || run.status === 'FAILED') return;
    const id = window.setInterval(() => {
      void poll();
    }, 5000);
    return () => window.clearInterval(id);
  }, [run, poll]);

  const startValidation = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      await site00ProjectsApi.canonicalCreativeRangeExecute(projectSlug);
      await poll();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }, [poll, projectSlug]);

  const setJudgment = useCallback(
    async (comparisonIndex: number, judgment: CanonicalCreativeRangeDirection['founderJudgment']) => {
      setJudging(comparisonIndex);
      try {
        await site00ProjectsApi.canonicalCreativeRangeJudgment(projectSlug, comparisonIndex, judgment);
        await poll();
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudging(null);
      }
    },
    [poll, projectSlug],
  );

  if (!run) {
    return (
      <section className="site00-six-dir-review" aria-label="Canonical creative range validation">
        <p className="site00-six-dir-review__meta site00-six-dir-review__experiment">
          EXPERIMENT B — CANONICAL CREATIVE RANGE VALIDATION
        </p>
        <h3 className="site00-six-dir-review__title">CANONICAL SIX-DIRECTION CREATIVE RANGE</h3>
        <p className="site00-six-dir-review__meta">
          Generate one first-pass hero for each established NDXBOOK direction: Marked-Up Copy, Countdown Room,
          Personal Archive, Annotated Copy, Room Where It Happens, Index.
        </p>
        <p className="site00-six-dir-review__meta">
          <Link to={SITE00_ROUTES.projectPersonalityReplayConsistency.replace(':projectSlug', projectSlug)}>
            Experiment A — blind formation consistency →
          </Link>
        </p>
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={starting}
          onClick={() => void startValidation()}
        >
          {starting ? 'STARTING…' : 'RUN CANONICAL RANGE VALIDATION'}
        </button>
        {error ? (
          <p className="site00-six-dir-review__error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  const inProgress = !['COMPLETE', 'FAILED', 'NOT_STARTED'].includes(run.status);

  return (
    <section className="site00-six-dir-review site00-six-dir-review--canonical" aria-label="Canonical creative range validation">
      <p className="site00-six-dir-review__meta site00-six-dir-review__experiment">
        EXPERIMENT B — CANONICAL CREATIVE RANGE VALIDATION
      </p>
      <h3 className="site00-six-dir-review__title">CANONICAL SIX-DIRECTION CREATIVE RANGE</h3>
      <p className="site00-six-dir-review__meta">
        STATUS: {run.status.replace(/_/g, ' ')}
        {run.currentDirectionIndex ? ` · DIRECTION ${String(run.currentDirectionIndex).padStart(2, '0')}` : ''}
      </p>
      <p className="site00-six-dir-review__meta">
        <Link to={SITE00_ROUTES.projectPersonalityReplayConsistency.replace(':projectSlug', projectSlug)}>
          Experiment A — blind formation (preserved separately) →
        </Link>
      </p>

      {inProgress ? (
        <p className="site00-six-dir-review__pending">GENERATING CANONICAL DIRECTIONS SEQUENTIALLY — REFRESH SAFE.</p>
      ) : null}

      {run.error ? (
        <p className="site00-six-dir-review__error" role="alert">
          {run.error}
        </p>
      ) : null}

      {error ? (
        <p className="site00-six-dir-review__error" role="alert">
          {error}
        </p>
      ) : null}

      {run.status === 'FAILED' ? (
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={starting}
          onClick={() => void startValidation()}
        >
          {starting ? 'RETRYING…' : 'RETRY CANONICAL RANGE VALIDATION'}
        </button>
      ) : null}

      <div className="site00-six-dir-review__grid site00-six-dir-review__grid--canonical">
        {run.directions.map((direction) => {
          const url = heroUrl(direction);
          const isOpen = expanded === direction.comparisonIndex;
          const dna = direction.dnaEnvelope;
          return (
            <article key={direction.comparisonIndex} className="site00-six-dir-review__card">
              <header className="site00-six-dir-review__card-header">
                <span className="site00-six-dir-review__index">
                  {String(direction.comparisonIndex).padStart(2, '0')}
                </span>
                <div>
                  <h4>{direction.canonicalName}</h4>
                  <p className="site00-six-dir-review__format">
                    {(direction.formatSelection?.nativeFormat ?? 'PENDING').replace(/_/g, ' ')}
                  </p>
                  <p className="site00-six-dir-review__status">
                    {direction.firstPassStatus.replace(/_/g, ' ')}
                    {direction.generationReceipt?.creativeAttemptCount === 1 ? ' · FIRST PASS' : ''}
                  </p>
                </div>
              </header>

              {url ? (
                <figure className="site00-six-dir-review__hero">
                  <img src={url} alt={`${direction.canonicalName} hero`} loading="lazy" />
                </figure>
              ) : (
                <p className="site00-six-dir-review__pending">HERO PENDING…</p>
              )}

              {dna ? <p className="site00-six-dir-review__idea">{dna.centralThesis}</p> : null}

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
                {isOpen ? 'HIDE CREATIVE LOGIC' : 'VIEW CREATIVE LOGIC'}
              </button>

              {isOpen && dna ? (
                <div className="site00-six-dir-review__evidence">
                  <p><strong>CENTRAL THESIS:</strong> {dna.centralThesis}</p>
                  <p><strong>CREATIVE PREMISE:</strong> {dna.creativePremise}</p>
                  <p><strong>WHY THIS FORMAT:</strong> {direction.formatSelection?.nativeFormatReason ?? '—'}</p>
                  <p><strong>FORMAT ALTERNATIVES:</strong> {direction.formatSelection?.alternativeFormatsConsidered.join(', ') ?? '—'}</p>
                  <p><strong>VISUAL WORLD:</strong> {dna.visualWorld}</p>
                  <p><strong>COMPOSITION LOGIC:</strong> {dna.compositionLogic}</p>
                  <p><strong>TYPOGRAPHIC ATTITUDE:</strong> {dna.typographicAttitude}</p>
                  <p><strong>TYPOGRAPHY SOURCE:</strong> {dna.typographySelectionSource}</p>
                  <p><strong>PALETTE:</strong> {dna.palette}</p>
                  <p><strong>COLOR HIERARCHY:</strong> {dna.colorHierarchy}</p>
                  <p><strong>SIGNATURE DEVICES:</strong> {dna.signatureDevices.join(', ') || '—'}</p>
                  <p><strong>PERSONALITY TRANSLATION:</strong> {dna.personalityTranslation}</p>
                  <p><strong>DIRECTION LINEAGE:</strong> {dna.directionLineage.join('; ') || '—'}</p>
                  <p><strong>GENERATION:</strong> {direction.generationReceipt?.firstGenerationResult ?? '—'} · attempts {direction.generationReceipt?.creativeAttemptCount ?? 0}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {run.audit ? (
        <details className="site00-six-dir-review__audit">
          <summary>VISUAL IDENTITY AUDIT (NON-MUTATING)</summary>
          <p>Typography identity: {run.audit.typographyIdentityStrength}</p>
          <p>Color identity: {run.audit.colorIdentityStrength}</p>
          <p>Cross-direction brand recognition: {run.audit.crossDirectionBrandRecognition}</p>
          <p>Visual Identity DNA layer needed: {String(run.audit.visualIdentityDnaLayerNeeded)}</p>
          {run.audit.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </details>
      ) : null}

      {run.status === 'COMPLETE' ? (
        <p className="site00-six-dir-review__meta">
          <Link to={SITE00_ROUTES.projectCanonicalCarouselExpansion.replace(':projectSlug', projectSlug)}>
            Experiment C — expand into same-topic carousels →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
