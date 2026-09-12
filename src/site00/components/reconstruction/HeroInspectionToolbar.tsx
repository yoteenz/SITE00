/**
 * P0.VR.REPLICATION.4R3 — Hero inspection toolbar (?blueprintDebug=hero).
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { stripHeroInspectionFromUrl } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/buildTwinHeroInspectionUrl.js';
import '../../styles/site00-hero-inspection-toolbar.css';

export type HeroInspectionLayerFlags = {
  authorityBoxes: boolean;
  renderedBoxes: boolean;
  deltas: boolean;
  collisions: boolean;
  labels: boolean;
  cropSources: boolean;
};

type Props = {
  layers: HeroInspectionLayerFlags;
  onLayersChange: (layers: HeroInspectionLayerFlags) => void;
};

export function HeroInspectionToolbar({ layers, onLayersChange }: Props) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const active = params.get('blueprintDebug') === 'hero';

  if (!active) return null;

  const toggle = (key: keyof HeroInspectionLayerFlags) => {
    onLayersChange({ ...layers, [key]: !layers[key] });
  };

  const exit = () => {
    const next = stripHeroInspectionFromUrl(`${window.location.pathname}${window.location.search}`);
    navigate(next, { replace: true });
  };

  return (
    <div className="site00-hero-insp">
      <p className="site00-hero-insp__title">HERO INSPECTION</p>
      <div className="site00-hero-insp__controls">
        <button type="button" className={layers.authorityBoxes ? 'is-on' : ''} onClick={() => toggle('authorityBoxes')}>
          AUTHORITY BOXES
        </button>
        <button type="button" className={layers.renderedBoxes ? 'is-on' : ''} onClick={() => toggle('renderedBoxes')}>
          RENDERED BOXES
        </button>
        <button type="button" className={layers.deltas ? 'is-on' : ''} onClick={() => toggle('deltas')}>
          DELTAS
        </button>
        <button type="button" className={layers.collisions ? 'is-on' : ''} onClick={() => toggle('collisions')}>
          COLLISIONS
        </button>
        <button type="button" className={layers.cropSources ? 'is-on' : ''} onClick={() => toggle('cropSources')}>
          CROP SOURCES
        </button>
        <button type="button" className={layers.labels ? 'is-on' : ''} onClick={() => toggle('labels')}>
          {layers.labels ? 'HIDE LABELS' : 'SHOW LABELS'}
        </button>
        <button type="button" className="site00-hero-insp__exit" onClick={exit}>
          EXIT INSPECTION
        </button>
      </div>
    </div>
  );
}
