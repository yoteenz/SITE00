import { Link } from 'react-router-dom';
import type {
  LabCharacterPanelSummary,
  LabExperimentsPanelSummary,
} from '../../../../shared/site00-studio-world-production/founderWorkspace/labNavigation/index.js';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type LabHubOperateLayerProps = {
  experiments: LabExperimentsPanelSummary;
  character: LabCharacterPanelSummary;
};

export function LabHubOperateLayer({ experiments, character }: LabHubOperateLayerProps) {
  return (
    <div className="site00-lab-hub" data-visual-reconstruction="lab-hub">
      <header className="site00-lab-hub__header">
        <p className="site00-lab-hub__eyebrow">NDXBOOK · STUDIO WORLD</p>
        <h1 className="site00-lab-hub__title">LAB</h1>
        <p className="site00-lab-hub__subtitle">Experiments and character systems — one workspace door.</p>
      </header>

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
