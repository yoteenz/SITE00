import type { ConceptTerritoryArtifact } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { FounderJudgmentAction } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

const TERRITORY_ACTIONS: { action: FounderJudgmentAction; label: string }[] = [
  { action: 'LOVE_IT', label: 'LOVE IT' },
  { action: 'PROMISING', label: 'PROMISING' },
  { action: 'TOO_CLOSE', label: 'TOO CLOSE' },
  { action: 'WRONG_DIRECTION', label: 'WRONG DIRECTION' },
  { action: 'PUSH_FURTHER', label: 'PUSH FURTHER' },
  { action: 'COMBINE_WITH', label: 'COMBINE WITH' },
  { action: 'REGENERATE', label: 'REGENERATE' },
];

type Props = {
  territory: ConceptTerritoryArtifact;
  compact?: boolean;
  onJudgment: (action: FounderJudgmentAction, territoryId: string) => void;
  disabled?: boolean;
};

export function TerritoryBoard({ territory, compact, onJudgment, disabled }: Props) {
  return (
    <article className={`ec-cw-territory${compact ? ' ec-cw-territory--compact' : ''}`} data-territory-id={territory.territory_id}>
      <header className="ec-cw-territory__hero">
        <p className="ec-cw-territory__id">{territory.territory_id}</p>
        <h3 className="ec-cw-territory__name">{territory.name}</h3>
        <p className="ec-cw-territory__core">{territory.core_idea}</p>
      </header>

      <section className="ec-cw-territory__strip" aria-label="Material world strip">
        <span className="ec-cw-territory__strip-label">SPATIAL METAPHOR</span>
        <p>{territory.spatial_metaphor}</p>
      </section>

      <div className="ec-cw-territory__grid">
        <div className="ec-cw-territory__block">
          <h4>Experience moments</h4>
          <p><strong>Emotional</strong> {territory.emotional_objective}</p>
          <p><strong>Logic</strong> {territory.experience_logic}</p>
          <p><strong>Information rhythm</strong> {territory.information_architecture}</p>
          <p><strong>Interaction</strong> {territory.interaction_language}</p>
        </div>
        <div className="ec-cw-territory__block">
          <h4>Visual language</h4>
          <p>{territory.visual_language}</p>
          <h4>Surface miniatures</h4>
          <ul className="ec-cw-territory__surfaces">
            <li><span>Mobile</span>{territory.mobile_expression}</li>
            <li><span>Tablet</span>{territory.tablet_expression}</li>
            <li><span>Desktop</span>{territory.desktop_expression}</li>
            <li><span>App</span>{territory.app_expression}</li>
          </ul>
        </div>
        <div className="ec-cw-territory__block">
          <h4>Authority & live-code needs</h4>
          <p>{territory.image_authority_needs?.join(' · ') || '—'}</p>
          <p>{territory.live_code_needs?.join(' · ') || '—'}</p>
          <h4>Risks</h4>
          <p>{territory.risks?.join(' · ') || '—'}</p>
          <h4>Why this fits the brand</h4>
          <p>{territory.project_alignment}</p>
        </div>
      </div>

      <div className="ec-cw-territory__actions" role="group" aria-label={`Judgment actions for ${territory.name}`}>
        {TERRITORY_ACTIONS.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            className="ec-cw-btn ec-cw-btn--ghost"
            disabled={disabled}
            onClick={() => onJudgment(action, territory.territory_id)}
          >
            {label}
          </button>
        ))}
      </div>
    </article>
  );
}
