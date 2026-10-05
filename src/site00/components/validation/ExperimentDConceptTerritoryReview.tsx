import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SixConceptHeroRangeRun } from '../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes';
import type { CanonicalNdxbookDirectionName } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants';
import { buildCrossWorldComparisonMatrix } from '../../../../shared/site00-brand-lore/conceptTerritory/crossWorldComparisonMatrix';
import { getExperimentDMethodologyOverlay } from '../../../../shared/site00-brand-lore/conceptTerritoryV2/experimentDInterpretation';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { SITE00_ROUTES, site00ProjectExperimentFPath } from '../../config/routes';

type ExperimentDConceptTerritoryReviewProps = {
  projectSlug: string;
  run: SixConceptHeroRangeRun | null | undefined;
  onUpdate?: () => void;
};

function founderApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Unable to run Experiment D';
  if (/unknown action/i.test(raw)) {
    return 'API NOT UPDATED — redeploy api.site00.com from main on Railway, then retry.';
  }
  return raw;
}

export function ExperimentDConceptTerritoryReview({
  projectSlug,
  run,
  onUpdate,
}: ExperimentDConceptTerritoryReviewProps) {
  const [forming, setForming] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [judging, setJudging] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);

  const poll = useCallback(async () => {
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    if (!run || run.status === 'COMPLETE' || run.status === 'FAILED') return;
    const id = window.setInterval(() => void poll(), 5000);
    return () => window.clearInterval(id);
  }, [run, poll]);

  const formTerritories = useCallback(async () => {
    setForming(true);
    setError(null);
    try {
      await site00ProjectsApi.experimentDFormTerritories(projectSlug);
      await poll();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setForming(false);
    }
  }, [poll, projectSlug]);

  const runHeroes = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      await site00ProjectsApi.experimentDExecuteHeroes(projectSlug);
      await poll();
    } catch (err) {
      setError(founderApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }, [poll, projectSlug]);

  const setJudgment = useCallback(
    async (
      comparisonIndex: number,
      judgment: 'LOVE_THE_CONCEPT' | 'PROMISING_REFINE' | 'TOO_CLOSE_TO_ANOTHER' | 'NOT_NDXBOOK' | null,
      tooCloseSibling?: CanonicalNdxbookDirectionName | null,
    ) => {
      setJudging(comparisonIndex);
      try {
        await site00ProjectsApi.experimentDHeroJudgment(projectSlug, comparisonIndex, judgment, tooCloseSibling);
        await poll();
      } catch (err) {
        setError(founderApiErrorMessage(err));
      } finally {
        setJudging(null);
      }
    },
    [poll, projectSlug],
  );

  const matrix = useMemo(() => {
    if (!run?.territories.length || !run.expressionSystems.length) return null;
    return buildCrossWorldComparisonMatrix(run.territories, run.expressionSystems);
  }, [run]);

  const methodologyOverlay = useMemo(() => getExperimentDMethodologyOverlay(), []);

  const activeHero = run?.heroes.find((h) => h.comparisonIndex === activeIndex) ?? null;

  if (!run) {
    return (
      <section className="site00-experiment-d" aria-label="Experiment D concept territory">
        <p className="site00-experiment-d__experiment">EXPERIMENT D — SIX-CONCEPT HERO RANGE</p>
        <h3 className="site00-experiment-d__title">CREDIT UTILIZATION · CONCEPT TERRITORY V1</h3>
        <p className="site00-experiment-d__meta">
          Form six independent Creative Concept Territories before any hero generation. No provider spend until
          founder trigger.
        </p>
        <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={() => void formTerritories()}>
          {forming ? 'FORMING TERRITORIES…' : 'FORM SIX CONCEPT TERRITORIES'}
        </button>
        {error ? <p className="site00-experiment-d__error" role="alert">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="site00-experiment-d" aria-label="Experiment D concept territory">
      <p className="site00-experiment-d__experiment">EXPERIMENT D — SIX-CONCEPT HERO RANGE</p>
      <h3 className="site00-experiment-d__title">CREDIT UTILIZATION · {run.methodologyVersion.replace(/_/g, ' ')}</h3>
      <p className="site00-experiment-d__meta">
        STATUS: {run.status.replace(/_/g, ' ')} · GENERATION READY: {run.generationReady ? 'YES' : 'NO'} · STARTED:{' '}
        {run.generationStarted ? 'YES' : 'NO'}
      </p>
      <p className="site00-experiment-d__meta">
        <Link to={SITE00_ROUTES.projectCanonicalCarouselExpansion.replace(':projectSlug', projectSlug)}>
          Experiment C — superseded partial carousels →
        </Link>
        {' · '}
        <Link to={SITE00_ROUTES.projectCanonicalCreativeRange.replace(':projectSlug', projectSlug)}>
          Experiment B — previous methodology heroes →
        </Link>
        {' · '}
        <Link to={site00ProjectExperimentFPath(projectSlug)}>
          Experiment F — Six-Concept Reformation →
        </Link>
      </p>

      {run.conceptOrthogonality ? (
        <p className="site00-experiment-d__meta">
          CONCEPT GATE: {run.conceptOrthogonality.result.replace(/_/g, ' ')} · VISUAL GATE:{' '}
          {run.visualOrthogonality?.blocksGeneration ? 'CLONE RISK BLOCK' : run.visualOrthogonality?.passed ? 'PASS' : 'REVIEW'}
        </p>
      ) : null}

      <p className="site00-experiment-d__meta site00-experiment-d__interpretation">
        LATER METHODOLOGY INTERPRETATION: {methodologyOverlay.laterMethodologyInterpretation.replace(/_/g, ' ')} ·{' '}
        FOUNDER CONCLUSION: {methodologyOverlay.founderConclusion.replace(/_/g, ' ')} ·{' '}
        DISTINCTIVENESS AT CONCEPT LEVEL: {methodologyOverlay.experimentDistinctiveness.replace(/_/g, ' ')}
      </p>

      {error ? <p className="site00-experiment-d__error" role="alert">{error}</p> : null}

      <div className="site00-experiment-d__controls">
        <button type="button" className="site00-btn" disabled={forming} onClick={() => void formTerritories()}>
          REFRESH TERRITORIES
        </button>
        {run.generationReady && !run.visualOrthogonality?.blocksGeneration ? (
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={generating || run.status === 'COMPLETE'}
            onClick={() => void runHeroes()}
          >
            {generating ? 'GENERATING…' : 'RUN SIX CONCEPT TERRITORY HEROES'}
          </button>
        ) : null}
        <button type="button" className="site00-btn" onClick={() => setShowMatrix((v) => !v)}>
          {showMatrix ? 'HIDE COMPARISON MATRIX' : 'SHOW COMPARISON MATRIX'}
        </button>
      </div>

      {showMatrix && matrix ? (
        <div className="site00-experiment-d__matrix-wrap">
          <table className="site00-experiment-d__matrix">
            <thead>
              <tr>
                <th scope="col">DIMENSION</th>
                {matrix.directions.map((name, i) => (
                  <th key={name} scope="col">{String(i + 1).padStart(2, '0')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.dimensions.map((dimension) => (
                <tr key={dimension}>
                  <th scope="row">{dimension}</th>
                  {matrix.directions.map((name) => (
                    <td key={`${dimension}-${name}`}>{matrix.cells[dimension][name]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="site00-experiment-d__direction-tabs">
        {run.heroes.map((hero) => (
          <button
            key={hero.comparisonIndex}
            type="button"
            className={hero.comparisonIndex === activeIndex ? 'site00-experiment-d__dir-btn--active' : ''}
            onClick={() => setActiveIndex(hero.comparisonIndex)}
          >
            {String(hero.comparisonIndex).padStart(2, '0')}
          </button>
        ))}
      </div>

      {activeHero ? (
        <article className="site00-experiment-d__card">
          <header>
            <p>DIRECTION {String(activeHero.comparisonIndex).padStart(2, '0')} — {activeHero.directionName}</p>
            <h4>{activeHero.territory.name}</h4>
          </header>

          <dl className="site00-experiment-d__concept">
            <div><dt>CREATIVE CONCEPT TERRITORY</dt><dd>{activeHero.territory.name}</dd></div>
            <div><dt>BIG CREATIVE IDEA</dt><dd>{activeHero.territory.bigCreativeIdea}</dd></div>
            <div><dt>WORLD PREMISE</dt><dd>{activeHero.territory.worldPremise}</dd></div>
            <div><dt>CENTRAL METAPHOR</dt><dd>{activeHero.territory.conceptualMetaphor}</dd></div>
            <div><dt>VIEWER ROLE</dt><dd>{activeHero.territory.viewerRole}</dd></div>
            <div><dt>WHY DISTINCT</dt><dd>{activeHero.territory.whatMakesThisAWorld}</dd></div>
            <div><dt>TYPOGRAPHY</dt><dd>{activeHero.expressionSystem.typographySystem}</dd></div>
            <div><dt>PALETTE</dt><dd>{activeHero.expressionSystem.paletteSystem}</dd></div>
            <div><dt>MATERIAL</dt><dd>{activeHero.expressionSystem.materialSystem}</dd></div>
            <div><dt>IMAGERY</dt><dd>{activeHero.expressionSystem.imagerySystem}</dd></div>
            <div><dt>COMPOSITION</dt><dd>{activeHero.expressionSystem.compositionSystem}</dd></div>
            <div><dt>GRAPHIC GRAMMAR</dt><dd>{activeHero.expressionSystem.graphicGrammar}</dd></div>
            <div><dt>ARTIFACT</dt><dd>{activeHero.expressionSystem.artifactSystem}</dd></div>
            <div><dt>MOTION</dt><dd>{activeHero.expressionSystem.motionSystem}</dd></div>
            <div><dt>NATIVE FORMAT</dt><dd>{activeHero.expressionSystem.nativeProofFormat}</dd></div>
          </dl>

          <div className="site00-experiment-d__heroes">
            {activeHero.previousMethodologyHeroStoragePath ? (
              <figure>
                <figcaption>PREVIOUS METHODOLOGY HERO</figcaption>
                <img src={site00StoragePublicUrl(activeHero.previousMethodologyHeroStoragePath)} alt="Previous hero" loading="lazy" />
              </figure>
            ) : null}
            {activeHero.heroAsset?.storagePath ? (
              <figure>
                <figcaption>NEW CONCEPT TERRITORY HERO</figcaption>
                <img src={site00StoragePublicUrl(activeHero.heroAsset.storagePath)} alt="Concept territory hero" loading="lazy" />
              </figure>
            ) : (
              <p className="site00-experiment-d__meta">Hero not generated — founder trigger required.</p>
            )}
          </div>

          <div className="site00-experiment-d__judgment">
            {(['LOVE_THE_CONCEPT', 'PROMISING_REFINE', 'TOO_CLOSE_TO_ANOTHER', 'NOT_NDXBOOK'] as const).map((j) => (
              <button
                key={j}
                type="button"
                className={activeHero.founderJudgment === j ? 'site00-btn site00-btn--primary' : 'site00-btn'}
                disabled={judging === activeHero.comparisonIndex}
                onClick={() => void setJudgment(activeHero.comparisonIndex, j)}
              >
                {j.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
