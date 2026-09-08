import { Link } from 'react-router-dom';
import type {
  LabCharacterPanelSummary,
  LabExperimentsPanelSummary,
} from '../../../../shared/site00-studio-world-production/founderWorkspace/labNavigation/index.js';
import type { ProjectLabSystemCard } from '../../../../shared/site00-brand-lore/founderWorkspace/projectOperatingState/types.js';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type LabHubOperateLayerProps = {
  experiments: LabExperimentsPanelSummary;
  character: LabCharacterPanelSummary;
  labSystems?: ProjectLabSystemCard[];
  chapterTitle?: string;
};

const CATEGORY_LABELS: Record<ProjectLabSystemCard['category'], string> = {
  CREATIVE_BRAIN: 'CREATIVE BRAIN',
  CHARACTER: 'CHARACTER',
  CONTINUITY: 'CONTINUITY',
  CAMPAIGN_SYSTEMS: 'CAMPAIGN SYSTEMS',
  EXPERIMENTS: 'EXPERIMENTS',
};

function systemStatusClass(status: ProjectLabSystemCard['status']): string {
  if (status === 'BLOCKED' || status === 'STALE') return 'site00-fws-hub-status--warn';
  if (status === 'VISUAL_AUTHORITY_NEEDED' || status === 'CANON_PARTIAL' || status === 'PARTIAL') {
    return 'site00-fws-hub-status--partial';
  }
  return '';
}

export function LabHubOperateLayer({ experiments, character, labSystems = [], chapterTitle }: LabHubOperateLayerProps) {
  const grouped = labSystems.reduce<Record<string, ProjectLabSystemCard[]>>((acc, card) => {
    const key = card.category;
    acc[key] = acc[key] ?? [];
    acc[key].push(card);
    return acc;
  }, {});

  return (
    <div className="site00-lab-hub" data-visual-reconstruction="lab-hub">
      <header className="site00-lab-hub__header">
        <p className="site00-lab-hub__eyebrow">NDXBOOK · STUDIO WORLD</p>
        <h1 className="site00-lab-hub__title">LAB</h1>
        <p className="site00-lab-hub__subtitle">
          Active creative systems{chapterTitle ? ` · ${chapterTitle}` : ''} — one workspace door.
        </p>
      </header>

      {Object.entries(grouped).map(([category, cards]) => (
        <section key={category} className="site00-lab-hub__systems">
          <p className="site00-lab-hub__panel-label">{CATEGORY_LABELS[cards[0]!.category] ?? category}</p>
          <div className="site00-lab-hub__system-grid">
            {cards.map((card) => (
              <article key={card.systemId} className="site00-lab-hub__system-card">
                <p className="site00-lab-hub__system-name">{card.label}</p>
                <span className={`site00-fws-hub-status ${systemStatusClass(card.status)}`}>{card.statusLabel}</span>
                {card.href ? (
                  <Link to={card.href} className="site00-lab-hub__panel-cta">
                    OPEN →
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}

      <div className="site00-lab-hub__destinations">
        <article className="site00-lab-hub__panel" {...vrRegionAttr(NDX_VR_REGION.experimentGrid)}>
          <p className="site00-lab-hub__panel-label">{experiments.title}</p>
          <p className="site00-lab-hub__panel-desc">Test ideas, visual directions, creative systems.</p>
          <div className="site00-lab-hub__panel-body">
            <p className="site00-lab-hub__panel-headline">{experiments.headline}</p>
            <span className="site00-fws-hub-status">{experiments.statusLabel}</span>
            {experiments.progressLabel ? (
              <p className="site00-lab-hub__panel-meta">{experiments.progressLabel}</p>
            ) : null}
          </div>
          <Link to={experiments.destinationHref} className="site00-lab-hub__panel-cta">
            OPEN EXPERIMENTS →
          </Link>
        </article>

        <article className="site00-lab-hub__panel" {...vrRegionAttr(NDX_VR_REGION.characterProfile)}>
          <p className="site00-lab-hub__panel-label">{character.title}</p>
          <p className="site00-lab-hub__panel-desc">Build and maintain the NDX character.</p>
          <ul className="site00-lab-hub__status-list">
            <li>
              <span>Visual Identity</span>
              <strong>{character.visualIdentityLabel}</strong>
            </li>
            <li>
              <span>Character Bible</span>
              <strong>{character.characterBibleLabel}</strong>
            </li>
            <li>
              <span>Continuity</span>
              <strong>{character.continuityLabel}</strong>
            </li>
          </ul>
          <Link to={character.destinationHref} className="site00-lab-hub__panel-cta">
            OPEN CHARACTER LAB →
          </Link>
        </article>
      </div>
    </div>
  );
}
