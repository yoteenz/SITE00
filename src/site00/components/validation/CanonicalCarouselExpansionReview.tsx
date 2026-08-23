import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  CanonicalCarouselExpansionRun,
  CarouselDirectionCarousel,
  CarouselExecuteMode,
  CarouselSlideRecord,
} from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { SITE00_ROUTES } from '../../config/routes';

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run carousel expansion';
  if (/unknown action/i.test(raw)) {
    return 'API NOT UPDATED — redeploy api.site00.com from main on Railway, then retry.';
  }
  return raw;
}

type ViewMode = 'DIRECTIONS' | 'CAROUSEL' | 'COMPARE';

type CanonicalCarouselExpansionReviewProps = {
  projectSlug: string;
  run: CanonicalCarouselExpansionRun | null | undefined;
  onUpdate?: () => void;
};

function slideUrl(slide: CarouselSlideRecord): string {
  return slide.asset?.storagePath ? site00StoragePublicUrl(slide.asset.storagePath) : '';
}

function judgmentLineageHint(judgment: CarouselSlideRecord['founderJudgment']): string | null {
  if (judgment === 'NOT_FOR_ME') {
    return 'Excluded from NDXBOOK brand lineage — storage preserved for cross-brand reuse';
  }
  if (judgment === 'LOVE_IT') {
    return 'Production candidate — added to brand lineage for reuse (winner not required)';
  }
  if (judgment === 'PROMISING_REFINE') {
    return 'Marked for revision — detailed notes and regeneration wired in a future sprint';
  }
  return null;
}

export function CanonicalCarouselExpansionReview({
  projectSlug,
  run,
  onUpdate,
}: CanonicalCarouselExpansionReviewProps) {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('DIRECTIONS');
  const [activeDirection, setActiveDirection] = useState<number>(1);
  const [compareSlide, setCompareSlide] = useState(2);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [judging, setJudging] = useState<string | null>(null);

  const poll = useCallback(async () => {
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    if (!run || run.status === 'COMPLETE' || run.status === 'FAILED' || run.status === 'BLOCKED_MISSING_COVERS') {
      return;
    }
    const id = window.setInterval(() => void poll(), 5000);
    return () => window.clearInterval(id);
  }, [run, poll]);

  const execute = useCallback(
    async (mode: CarouselExecuteMode) => {
      setExecuting(true);
      setError(null);
      try {
        await site00ProjectsApi.canonicalCarouselExpansionExecute(projectSlug, mode);
        await poll();
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setExecuting(false);
      }
    },
    [poll, projectSlug],
  );

  const direction = useMemo(
    () => run?.directions.find((d) => d.comparisonIndex === activeDirection) ?? null,
    [run, activeDirection],
  );

  const setSlideJudgment = useCallback(
    async (comparisonIndex: number, slideNumber: number, judgment: CarouselSlideRecord['founderJudgment']) => {
      const key = `${comparisonIndex}-${slideNumber}`;
      setJudging(key);
      try {
        await site00ProjectsApi.canonicalCarouselExpansionSlideJudgment(
          projectSlug,
          comparisonIndex,
          slideNumber,
          judgment,
        );
        await poll();
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudging(null);
      }
    },
    [poll, projectSlug],
  );

  const setDirectionVerdict = useCallback(
    async (comparisonIndex: number, verdict: CarouselDirectionCarousel['founderVerdict']) => {
      setJudging(`verdict-${comparisonIndex}`);
      try {
        await site00ProjectsApi.canonicalCarouselExpansionDirectionVerdict(projectSlug, comparisonIndex, verdict);
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
      <section className="site00-carousel-expansion" aria-label="Canonical carousel expansion">
        <p className="site00-carousel-expansion__experiment">EXPERIMENT C — SAME-TOPIC CAROUSEL WORLD EXPANSION</p>
        <h3 className="site00-carousel-expansion__title">CANONICAL SIX · CREDIT UTILIZATION CAROUSELS</h3>
        <p className="site00-carousel-expansion__meta">
          Expand each canonical direction into a 6-slide carousel. Experiment B heroes become Slide 01 — preserved,
          never regenerated.
        </p>
        <p className="site00-carousel-expansion__meta">
          <Link to={SITE00_ROUTES.projectCanonicalCreativeRange.replace(':projectSlug', projectSlug)}>
            Experiment B — canonical heroes →
          </Link>
        </p>
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={executing}
          onClick={() => void execute('INITIALIZE')}
        >
          {executing ? 'INITIALIZING…' : 'INITIALIZE CAROUSEL WORLDS'}
        </button>
        {error ? (
          <p className="site00-carousel-expansion__error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  const inProgress = ['GENERATING_SLIDE', 'BUILDING_WORLD_BIBLES', 'LOADING_COVERS'].includes(run.status);

  return (
    <section className="site00-carousel-expansion" aria-label="Canonical carousel expansion">
      <p className="site00-carousel-expansion__experiment">EXPERIMENT C — SAME-TOPIC CAROUSEL WORLD EXPANSION</p>
      <h3 className="site00-carousel-expansion__title">CANONICAL SIX · CREDIT UTILIZATION CAROUSELS</h3>
      <p className="site00-carousel-expansion__meta">
        TOPIC: {run.sharedTopic?.topicName ?? 'CREDIT UTILIZATION'} · STATUS: {run.status.replace(/_/g, ' ')}
        {run.currentDirectionIndex
          ? ` · WORLD ${String(run.currentDirectionIndex).padStart(2, '0')} / 06`
          : ''}
        {run.currentSlideNumber ? ` · SLIDE ${String(run.currentSlideNumber).padStart(2, '0')} / 06` : ''}
      </p>
      <p className="site00-carousel-expansion__meta">
        <Link to={SITE00_ROUTES.projectCanonicalCreativeRange.replace(':projectSlug', projectSlug)}>
          Experiment B — preserved covers →
        </Link>
      </p>

      {run.status === 'BLOCKED_MISSING_COVERS' ? (
        <p className="site00-carousel-expansion__error" role="alert">
          {run.error ?? '6/6 Experiment B covers required before carousel expansion.'}
        </p>
      ) : null}

      {run.status === 'FAILED' && run.error ? (
        <p className="site00-carousel-expansion__error" role="alert">
          GENERATION FAILED: {run.error}
        </p>
      ) : null}

      {inProgress ? (
        <p className="site00-carousel-expansion__pending">GENERATING SEQUENTIALLY — REFRESH SAFE · SAVED AFTER EACH SLIDE</p>
      ) : null}

      {error ? (
        <p className="site00-carousel-expansion__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="site00-carousel-expansion__controls">
        <button type="button" className="site00-btn" disabled={executing} onClick={() => void execute('NEXT_SLIDE')}>
          RUN NEXT SLIDE
        </button>
        <button
          type="button"
          className="site00-btn"
          disabled={executing}
          onClick={() => void execute('REST_OF_CAROUSEL')}
        >
          RUN REST OF THIS CAROUSEL
        </button>
        <button type="button" className="site00-btn" disabled={executing} onClick={() => void execute('NEXT_CAROUSEL')}>
          RUN NEXT CAROUSEL
        </button>
        <button type="button" className="site00-btn site00-btn--primary" disabled={executing} onClick={() => void execute('ALL_REMAINING')}>
          RUN ALL REMAINING
        </button>
      </div>

      <div className="site00-carousel-expansion__tabs">
        {(['DIRECTIONS', 'CAROUSEL', 'COMPARE'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={['site00-carousel-expansion__tab', view === tab ? 'site00-carousel-expansion__tab--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setView(tab)}
          >
            {tab === 'DIRECTIONS' ? 'SIX WORLDS' : tab === 'CAROUSEL' ? 'ENTER CAROUSEL WORLD' : 'SAME SLIDE ACROSS WORLDS'}
          </button>
        ))}
      </div>

      {view === 'DIRECTIONS' ? (
        <div className="site00-carousel-expansion__grid">
          {run.directions.map((dir) => {
            const slidesDone = dir.slides.filter((s) => s.asset).length;
            return (
              <article key={dir.comparisonIndex} className="site00-carousel-expansion__card">
                <header>
                  <span>{String(dir.comparisonIndex).padStart(2, '0')}</span>
                  <h4>{dir.directionName}</h4>
                  <p>{slidesDone}/6 slides · {dir.compositionModesUsed.length} composition modes</p>
                </header>
                {dir.slides[0]?.asset ? (
                  <figure>
                    <img src={slideUrl(dir.slides[0]!)} alt={`${dir.directionName} cover`} loading="lazy" />
                  </figure>
                ) : null}
                <button
                  type="button"
                  className="site00-btn"
                  onClick={() => {
                    setActiveDirection(dir.comparisonIndex);
                    setView('CAROUSEL');
                    setPreviewIndex(0);
                  }}
                >
                  ENTER CAROUSEL WORLD
                </button>
              </article>
            );
          })}
        </div>
      ) : null}

      {view === 'CAROUSEL' && direction ? (
        <div className="site00-carousel-expansion__carousel-view">
          <header className="site00-carousel-expansion__carousel-header">
            <p>
              DIRECTION {String(direction.comparisonIndex).padStart(2, '0')} / 06 — {direction.directionName}
            </p>
            <p>{run.sharedTopic?.topicName}</p>
          </header>

          <div className="site00-carousel-expansion__direction-picker">
            {run.directions.map((d) => (
              <button
                key={d.comparisonIndex}
                type="button"
                className={
                  d.comparisonIndex === activeDirection ? 'site00-carousel-expansion__dir-btn--active' : ''
                }
                onClick={() => {
                  setActiveDirection(d.comparisonIndex);
                  setPreviewIndex(0);
                }}
              >
                {String(d.comparisonIndex).padStart(2, '0')}
              </button>
            ))}
          </div>

          <div className="site00-carousel-expansion__vertical-slides">
            {direction.slides.map((slide) => {
              const url = slideUrl(slide);
              return (
                <article key={slide.slideNumber} className="site00-carousel-expansion__slide-card">
                  <p className="site00-carousel-expansion__slide-label">
                    SLIDE {String(slide.slideNumber).padStart(2, '0')}
                    {slide.preserved ? ' · PRESERVED COVER' : ''}
                  </p>
                  {url ? (
                    <figure className="site00-carousel-expansion__slide-figure">
                      <img src={url} alt={`Slide ${slide.slideNumber}`} loading="lazy" />
                    </figure>
                  ) : (
                    <p className="site00-carousel-expansion__pending">SLIDE PENDING…</p>
                  )}
                  <dl className="site00-carousel-expansion__slide-meta">
                    <div>
                      <dt>SLIDE ROLE</dt>
                      <dd>{slide.slideRole.replace(/_/g, ' ')}</dd>
                    </div>
                    <div>
                      <dt>WHAT THIS SLIDE DOES</dt>
                      <dd>{slide.slidePurpose}</dd>
                    </div>
                    <div>
                      <dt>WHY IT LOOKS THIS WAY</dt>
                      <dd>{slide.whyThisSlideExists}</dd>
                    </div>
                    <div>
                      <dt>COPY LOGIC</dt>
                      <dd>{slide.copy.copyPurpose}</dd>
                    </div>
                    <div>
                      <dt>TYPOGRAPHY LOGIC</dt>
                      <dd>{slide.typography.whyThisTypographyHere}</dd>
                    </div>
                    <div>
                      <dt>COLOR LOGIC</dt>
                      <dd>{slide.colorLogic}</dd>
                    </div>
                    <div>
                      <dt>COMPOSITION MODE</dt>
                      <dd>{slide.compositionMode.replace(/_/g, ' ')}</dd>
                    </div>
                    <div>
                      <dt>WORLD SIGNALS</dt>
                      <dd>{slide.worldSignals.join(' · ') || '—'}</dd>
                    </div>
                  </dl>
                  <div className="site00-carousel-expansion__judgment">
                    {(['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'] as const).map((j) => (
                      <button
                        key={j}
                        type="button"
                        className={
                          slide.founderJudgment === j ? 'site00-carousel-expansion__judgment-btn--active' : ''
                        }
                        disabled={judging === `${direction.comparisonIndex}-${slide.slideNumber}`}
                        onClick={() =>
                          void setSlideJudgment(direction.comparisonIndex, slide.slideNumber, j)
                        }
                      >
                        {j.replace(/_/g, ' ')}
                      </button>
                    ))}
                    {slide.founderJudgment === 'PROMISING_REFINE' ? (
                      <p className="site00-carousel-expansion__meta">
                        REVISION NOTES (typography, color, composition, asset exchange) — wired in a future sprint
                      </p>
                    ) : null}
                    {judgmentLineageHint(slide.founderJudgment) ? (
                      <p className="site00-carousel-expansion__meta">{judgmentLineageHint(slide.founderJudgment)}</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="site00-carousel-expansion__preview">
            <p>CAROUSEL PREVIEW</p>
            <div className="site00-carousel-expansion__preview-frame">
              {direction.slides[previewIndex]?.asset ? (
                <img
                  src={slideUrl(direction.slides[previewIndex]!)}
                  alt={`Preview slide ${previewIndex + 1}`}
                />
              ) : (
                <p>PENDING</p>
              )}
            </div>
            <div className="site00-carousel-expansion__preview-controls">
              <button
                type="button"
                disabled={previewIndex <= 0}
                onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
              >
                PREVIOUS
              </button>
              <span>
                {previewIndex + 1} / {direction.slides.length}
              </span>
              <button
                type="button"
                disabled={previewIndex >= direction.slides.length - 1}
                onClick={() => setPreviewIndex((i) => Math.min(direction.slides.length - 1, i + 1))}
              >
                NEXT
              </button>
            </div>
          </div>

          <div className="site00-carousel-expansion__direction-verdict">
            <p>DIRECTION VERDICT</p>
            {(
              [
                'LOVE_THIS_DIRECTION',
                'KEEP_IN_CONTENTION',
                'BEAUTIFUL_BUT_TOO_NARROW',
                'TOO_REPETITIVE',
                'NOT_NDXBOOK',
              ] as const
            ).map((v) => (
              <button
                key={v}
                type="button"
                className={direction.founderVerdict === v ? 'site00-carousel-expansion__judgment-btn--active' : ''}
                disabled={judging === `verdict-${direction.comparisonIndex}`}
                onClick={() => void setDirectionVerdict(direction.comparisonIndex, v)}
              >
                {v.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {view === 'COMPARE' ? (
        <div className="site00-carousel-expansion__compare">
          <header>
            <p>SAME TOPIC. SIX DIRECTIONS.</p>
            <p>SLIDE {String(compareSlide).padStart(2, '0')} ACROSS WORLDS</p>
          </header>
          <div className="site00-carousel-expansion__compare-controls">
            <button type="button" disabled={compareSlide <= 1} onClick={() => setCompareSlide((s) => s - 1)}>
              PREVIOUS SLIDE
            </button>
            <span>SLIDE {compareSlide}</span>
            <button type="button" disabled={compareSlide >= 6} onClick={() => setCompareSlide((s) => s + 1)}>
              NEXT SLIDE
            </button>
          </div>
          <div className="site00-carousel-expansion__compare-grid">
            {run.directions.map((dir) => {
              const slide = dir.slides.find((s) => s.slideNumber === compareSlide);
              const url = slide ? slideUrl(slide) : '';
              return (
                <article key={dir.comparisonIndex}>
                  <h4>{dir.directionName}</h4>
                  <p>{slide?.slideRole.replace(/_/g, ' ') ?? '—'}</p>
                  {url ? <img src={url} alt={dir.directionName} loading="lazy" /> : <p>PENDING</p>}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {run.emergentDna ? (
        <details className="site00-carousel-expansion__analysis">
          <summary>EMERGENT NDXBOOK DNA · CROSS-DIRECTION ANALYSIS</summary>
          <p>Typography: {run.emergentDna.typographyDna}</p>
          <p>Color: {run.emergentDna.colorDna}</p>
          <p>Lime status: {run.emergentDna.limeStatus}</p>
          <p>Font system: {run.emergentDna.fontSystemStatus}</p>
          <p>Pairs analyzed: {run.crossDirectionPairs.length}</p>
        </details>
      ) : null}
    </section>
  );
}
