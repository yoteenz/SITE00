import { Link } from 'react-router-dom';
import {
  BLDR_CLASSIFICATION_COPY,
  BLDR_IMMERSIVE_PORTALS,
} from '../../../config/bldr-classification';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { BuildScaleRail } from './BuildScaleRail';
import { BldrPortal } from './BldrPortal';
import { BldrRouteSpine } from './BldrRouteSpine';
import { BldrDiscoveryPanel } from './BldrDiscoveryPanel';
import type { BldrBuildClassIconId } from '../../../config/bldr-build-class-icons';

type BldrImmersiveSelectionProps = {
  onSelectClass: (classId: BldrBuildClassIconId) => void;
  resumeHref?: string | null;
  resumeLabel?: string;
};

const SPINE_LABELS = ['02', '03', '?'] as const;

export function BldrImmersiveSelection({ onSelectClass, resumeHref, resumeLabel }: BldrImmersiveSelectionProps) {
  return (
    <div className="site00-bldr-immersive-selection">
      <header className="site00-bldr-immersive-selection__hero">
        <div className="site00-bldr-immersive-selection__hero-mark-wrap">
          <Site00ThreeCornerMark className="site00-bldr-immersive-selection__hero-mark" />
          <p className="site00-bldr-immersive-selection__eyebrow">{BLDR_CLASSIFICATION_COPY.location}</p>
        </div>
        <h1 className="site00-bldr-immersive-selection__headline">
          {BLDR_CLASSIFICATION_COPY.headlineLine1}
          <br />
          {BLDR_CLASSIFICATION_COPY.headlineLine2}
        </h1>
        <span className="site00-bldr-immersive-selection__rule" aria-hidden="true" />
        <p className="site00-bldr-immersive-selection__subhead">
          {BLDR_CLASSIFICATION_COPY.subhead}
          <br />
          {BLDR_CLASSIFICATION_COPY.subheadAccent}
        </p>
      </header>

      {resumeHref ? (
        <div className="site00-bldr-immersive-selection__resume">
          <p className="site00-bldr-immersive-selection__resume-label">
            {resumeLabel ?? BLDR_CLASSIFICATION_COPY.resumeLabel}
          </p>
          <Link to={resumeHref} className="site00-bldr-immersive-selection__resume-link">
            CONTINUE →
          </Link>
        </div>
      ) : null}

      <BuildScaleRail />

      <div className="site00-bldr-immersive-selection__portals">
        {BLDR_IMMERSIVE_PORTALS.map((portal, index) => (
          <div key={portal.id} className="site00-bldr-immersive-selection__portal-group">
            <BldrPortal portal={portal} onSelect={() => onSelectClass(portal.id)} />
            {index < BLDR_IMMERSIVE_PORTALS.length - 1 ? (
              <BldrRouteSpine nextLabel={SPINE_LABELS[index] ?? ''} />
            ) : (
              <BldrRouteSpine nextLabel="?" />
            )}
          </div>
        ))}
      </div>

      <BldrDiscoveryPanel onSelect={() => onSelectClass('not-sure')} />
    </div>
  );
}
