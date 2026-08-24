import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  BrandCharacterFormationRun,
  BrandCharacterTerritory,
} from '../../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import { BRAND_CHARACTER_JUDGMENTS, PROMISING_DEVELOP_JUDGMENTS } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/constants';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { site00ProjectBrandCharacterDevelopmentPath, site00ProjectExperimentGPath } from '../../config/routes';
import { CharacterFormationStatusPanel } from './CharacterFormationStatusPanel';
import { CharacterComparisonView } from './CharacterComparisonView';
import { resolveTerritoryFieldDisplay, renderFieldValue } from './characterFieldDisplay';
import '../../styles/site00-character-compare.css';

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

function list(value: string[] | null | undefined): string {
  if (!Array.isArray(value) || value.length === 0) return 'Not specified';
  return value.join(' · ');
}

function FieldRow({
  character,
  label,
  fieldPath,
}: {
  character: BrandCharacterTerritory;
  label: string;
  fieldPath: string;
}) {
  const display = resolveTerritoryFieldDisplay(character, label, fieldPath);
  const text = renderFieldValue(display);
  const className =
    display.state === 'NOT_FORMED_AT_TERRITORY_STAGE'
      ? 'site00-character-field--development'
      : display.state === 'MISSING_PROVIDER_OUTPUT'
        ? 'site00-character-field--missing'
        : display.state === 'RECOVERABLE_PROVIDER_OUTPUT'
          ? 'site00-character-field--recovered'
          : undefined;

  return (
    <div>
      <dt>{label}</dt>
      <dd className={className}>{text}</dd>
    </div>
  );
}

function CharacterCard({
  character,
  onJudgment,
  onDevelop,
  judging,
  developing,
  hasDevelopment,
}: {
  character: BrandCharacterTerritory;
  onJudgment: (judgment: FounderCharacterJudgment) => void;
  onDevelop: () => void;
  judging: boolean;
  developing: boolean;
  hasDevelopment: boolean;
}) {
  const saved = character.founderJudgment && character.founderJudgment !== 'REFORM_SET'
    ? character.founderJudgment
    : null;
  const canDevelop =
    saved !== null && (PROMISING_DEVELOP_JUDGMENTS as readonly string[]).includes(saved);

  return (
    <article className="site00-experiment-g__card">
      <h4 className="site00-experiment-g__card-title">{character.name || 'UNNAMED CHARACTER'}</h4>
      <dl className="site00-experiment-g__dl">
        <FieldRow character={character} label="CHARACTER" fieldPath="core.characterEssence" />
        <FieldRow character={character} label="WHO / WHAT IS THIS?" fieldPath="core.characterThesis" />
        <FieldRow character={character} label="CORE CONTRADICTION" fieldPath="core.characterThesis" />
        <FieldRow character={character} label="HOW DOES IT MOVE THROUGH THE WORLD?" fieldPath="social.conversationalBehavior" />
        <FieldRow character={character} label="WHAT KIND OF INTELLIGENCE?" fieldPath="intellectual.intelligenceStyle" />
        <FieldRow character={character} label="WHAT KIND OF SOCIAL PRESENCE?" fieldPath="social.audienceRelationship" />
        <FieldRow character={character} label="WHAT COULD BE INTERESTING ABOUT ITS HUMOR?" fieldPath="humorWit.humorLogic" />
        <FieldRow character={character} label="WHAT IS ITS CULTURAL POSITION?" fieldPath="culturalIntelligence.culturalPosition" />
        <FieldRow character={character} label="WHAT COULD ITS TASTE BECOME?" fieldPath="taste.tasteLogic" />
        <FieldRow character={character} label="WHAT KIND OF TRACE COULD IT LEAVE?" fieldPath="artifactRelationship.makerPresence" />
        <FieldRow character={character} label="WHY NDXBOOK?" fieldPath="whyItIsNdxbook" />
        <div><dt>MUST NEVER BECOME</dt><dd>{list(character.whatItMustNeverBecome)}</dd></div>
        {character.abstractionEval?.result ? (
          <div><dt>ABSTRACTION GATE</dt><dd>{character.abstractionEval.result.replace(/_/g, ' ')}</dd></div>
        ) : null}
      </dl>
      {saved ? (
        <p className="site00-experiment-g__judgment-saved" role="status">
          YOUR JUDGMENT: {formatLabel(saved)} — saved (LOVE does not equal Brand Canon)
        </p>
      ) : null}
      {canDevelop ? (
        <div className="site00-experiment-g__judgment">
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={developing || hasDevelopment}
            onClick={onDevelop}
          >
            {hasDevelopment ? 'DEVELOPMENT CREATED' : developing ? 'STARTING DEVELOPMENT…' : 'DEVELOP CHARACTER'}
          </button>
        </div>
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
  const [developingId, setDevelopingId] = useState<string | null>(null);
  const [compareIndex, setCompareIndex] = useState(0);
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

  const developCharacter = useCallback(
    async (territoryId: string) => {
      setDevelopingId(territoryId);
      setError(null);
      try {
        await site00ProjectsApi.experimentHDevelopCharacter(projectSlug, territoryId);
        onUpdate?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Development failed');
      } finally {
        setDevelopingId(null);
      }
    },
    [onUpdate, projectSlug],
  );

  const developmentIds = new Set((run?.developments ?? []).map((d) => d.parentTerritoryId));

  return (
    <div className="site00-experiment-g">
      <p className="site00-experiment-g__experiment">P0.5B.1 — BRAND CHARACTER TERRITORY FORMATION</p>
      <h2 className="site00-experiment-g__title">NDXBOOK — Brand Character Territories</h2>
      <p className="site00-experiment-g__meta">
        Status: {run?.status?.replace(/_/g, ' ') ?? 'NOT STARTED'} · Territory level · development separate · no visuals
      </p>
      {run?.forensicAudit ? (
        <p className="site00-experiment-g__audit">
          Forensic audit: {run.forensicAudit.blankFieldRootCause.replace(/_/g, ' ')} ·{' '}
          {run.forensicAudit.historicalRecoveryPerformed ? 'recoverable provider fields detected' : 'see audit detail'} ·{' '}
          historical records preserved
        </p>
      ) : null}
      <p className="site00-experiment-g__audit">
        Prior Experiment G visual benchmarks classified as UPSTREAM_CHARACTER_LAYER_MISSING — historical evidence preserved.
        {' '}
        <Link to={site00ProjectExperimentGPath(projectSlug)}>Experiment G presentation work →</Link>
        {' · '}
        <Link to={site00ProjectBrandCharacterDevelopmentPath(projectSlug)}>Character Development review →</Link>
      </p>
      {run?.semanticSetAudit ? (
        <p className="site00-experiment-g__audit">
          Semantic set audit: {run.semanticSetAudit.genericBrandProbability} generic-brand probability · founder decides
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

      {hasCharacters ? (
        <CharacterComparisonView
          characters={run!.characters}
          assurance={run?.territoryAssurance}
          activeIndex={compareIndex}
          onSelectIndex={setCompareIndex}
        />
      ) : null}

      {run?.characters?.filter(Boolean).map((character) => (
        <CharacterCard
          key={character.id ?? character.name}
          character={character}
          judging={judgingId === character.id}
          developing={developingId === character.id}
          hasDevelopment={developmentIds.has(character.id)}
          onDevelop={() => void developCharacter(character.id)}
          onJudgment={(j) => void setJudgment(character.id ?? character.name, j)}
        />
      ))}
    </div>
  );
}
