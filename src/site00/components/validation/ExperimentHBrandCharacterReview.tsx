import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  BrandCharacterFormationRun,
  BrandCharacterTerritory,
} from '../../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import { BRAND_CHARACTER_JUDGMENTS } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/constants';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectExperimentGPath } from '../../config/routes';
import { CharacterFormationStatusPanel } from './CharacterFormationStatusPanel';

type FounderCharacterJudgment = Exclude<BrandCharacterTerritory['founderJudgment'], 'REFORM_SET' | null>;

const FOUNDER_JUDGMENT_OPTIONS = BRAND_CHARACTER_JUDGMENTS.filter(
  (j): j is FounderCharacterJudgment => j !== 'REFORM_SET',
);

function formatLabel(j: FounderCharacterJudgment): string {
  return j.replace(/_/g, ' ');
}

type ExperimentHBrandCharacterReviewProps = {
  projectSlug: string;
  run: BrandCharacterFormationRun | null | undefined;
  lastRefreshedAt?: Date | null;
  onRefresh?: () => void;
  onUpdate?: (run?: BrandCharacterFormationRun) => void;
};

function text(value: string | null | undefined, fallback = '—'): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || fallback;
}

function list(value: string[] | null | undefined): string {
  if (!Array.isArray(value) || value.length === 0) return '—';
  return value.join(' · ');
}

function CharacterCard({
  character,
  onJudgment,
  judging,
}: {
  character: BrandCharacterTerritory;
  onJudgment: (judgment: FounderCharacterJudgment) => void;
  judging: boolean;
}) {
  const saved = character.founderJudgment && character.founderJudgment !== 'REFORM_SET'
    ? character.founderJudgment
    : null;

  return (
    <article className="site00-experiment-g__card">
      <h4 className="site00-experiment-g__card-title">{text(character.name, 'UNNAMED CHARACTER')}</h4>
      <p className="site00-experiment-g__thesis">{text(character.core?.characterThesis)}</p>
      <dl className="site00-experiment-g__dl">
        <div><dt>CHARACTER</dt><dd>{text(character.core?.characterEssence)}</dd></div>
        <div><dt>HOW DOES IT THINK?</dt><dd>{text(character.intellectual?.intelligenceStyle)}</dd></div>
        <div><dt>HOW DOES IT BEHAVE?</dt><dd>{text(character.social?.conversationalBehavior)}</dd></div>
        <div><dt>WHAT IS FUNNY TO IT?</dt><dd>{text(character.humorWit?.humorLogic)}</dd></div>
        <div><dt>HOW DOES IT RELATE TO CULTURE?</dt><dd>{text(character.culturalIntelligence?.culturalPosition)}</dd></div>
        <div><dt>AUDIENCE RELATIONSHIP</dt><dd>{text(character.social?.audienceRelationship)}</dd></div>
        <div><dt>TASTE</dt><dd>{text(character.taste?.tasteLogic)}</dd></div>
        <div><dt>LEAVES ITS MARK</dt><dd>{text(character.artifactRelationship?.makerPresence)}</dd></div>
        <div><dt>WHY NDXBOOK?</dt><dd>{text(character.whyItIsNdxbook)}</dd></div>
        <div><dt>MUST NEVER BECOME</dt><dd>{list(character.whatItMustNeverBecome)}</dd></div>
        {character.abstractionEval?.result ? (
          <div><dt>ABSTRACTION GATE</dt><dd>{character.abstractionEval.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
      </dl>
      <details className="site00-experiment-g__details">
        <summary>METHODOLOGY DETAIL</summary>
        <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
          {JSON.stringify(
            {
              emotionalRange: character.emotional?.emotionalRange ?? null,
              language: character.language?.verbalCadence ?? null,
              expressiveBehavior: character.expressiveBehavior?.expressiveGestures ?? null,
              notThis: character.notThis ?? [],
            },
            null,
            2,
          )}
        </pre>
      </details>
      {saved ? (
        <p className="site00-experiment-g__judgment-saved" role="status">
          YOUR JUDGMENT: {formatLabel(saved)} — saved (LOVE does not equal Brand Canon)
        </p>
      ) : null}
      <div className="site00-experiment-g__judgment">
        {FOUNDER_JUDGMENT_OPTIONS.map((j) => (
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
    </article>
  );
}

export function ExperimentHBrandCharacterReview({
  projectSlug,
  run,
  lastRefreshedAt = null,
  onRefresh,
  onUpdate,
}: ExperimentHBrandCharacterReviewProps) {
  const [forming, setForming] = useState(false);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isForming = run?.status === 'FORMING';
  const hasCharacters = (run?.characters?.length ?? 0) >= 6;
  const showFormButton = !hasCharacters && !isForming;

  const startFormation = useCallback(
    async (forceRetry = false) => {
      setForming(true);
      setError(null);
      try {
        if (!run?.intelligenceSnapshot) {
          await site00ProjectsApi.experimentHPrepareSnapshot(projectSlug);
        }
        const result = await site00ProjectsApi.experimentHFormCharacters(projectSlug, { forceRetry });
        onUpdate?.(result.run as BrandCharacterFormationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Formation failed');
      } finally {
        setForming(false);
      }
    },
    [onUpdate, projectSlug, run?.intelligenceSnapshot],
  );

  const setJudgment = useCallback(
    async (characterId: string, judgment: FounderCharacterJudgment) => {
      setJudgingId(characterId);
      setError(null);
      try {
        const result = await site00ProjectsApi.experimentHCharacterJudgment(projectSlug, characterId, judgment);
        onUpdate?.(result.run as BrandCharacterFormationRun);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Judgment failed');
      } finally {
        setJudgingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  return (
    <div className="site00-experiment-g">
      <p className="site00-experiment-g__experiment">P0.5B — BRAND CHARACTER FORMATION</p>
      <h2 className="site00-experiment-g__title">NDXBOOK — Brand Character Territories</h2>
      <p className="site00-experiment-g__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · WHO layer · topic-blind · no visuals
      </p>
      <p className="site00-experiment-g__audit">
        Prior Experiment G visual benchmarks classified as UPSTREAM_CHARACTER_LAYER_MISSING — historical evidence preserved.
        {' '}
        <Link to={site00ProjectExperimentGPath(projectSlug)}>Experiment G presentation work →</Link>
      </p>
      {run?.setDistinctiveness ? (
        <p className="site00-experiment-g__audit">
          Set distinctiveness: {run.setDistinctiveness.result.replace(/_/g, ' ')}
          {run.setDistinctiveness.semanticAuditRequired ? ' · semantic audit recommended' : ''}
        </p>
      ) : null}
      {error ? <p className="site00-experiment-g__error" role="alert">{error}</p> : null}

      <CharacterFormationStatusPanel
        run={run}
        forming={forming}
        lastRefreshedAt={lastRefreshedAt}
        onRetry={() => void startFormation(true)}
        onRefresh={() => onRefresh?.()}
      />

      <div className="site00-experiment-g__controls">
        {showFormButton ? (
          <button type="button" className="site00-btn site00-btn--primary" disabled={forming} onClick={() => void startFormation(false)}>
            {forming ? 'STARTING BACKGROUND FORMATION…' : 'FORM SIX CHARACTER TERRITORIES'}
          </button>
        ) : null}
        {hasCharacters ? (
          <button type="button" className="site00-btn" disabled={forming} onClick={() => void startFormation(true)}>
            RE-FORM SET
          </button>
        ) : null}
      </div>

      {run?.characters?.filter(Boolean).map((character) => (
        <CharacterCard
          key={character.id ?? character.name}
          character={character}
          judging={judgingId === character.id}
          onJudgment={(j) => void setJudgment(character.id ?? character.name, j)}
        />
      ))}
    </div>
  );
}
