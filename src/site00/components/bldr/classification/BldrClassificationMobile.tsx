import { Link } from 'react-router-dom';
import { BLDR_CLASSIFICATION_COPY } from '../../../config/bldr-classification';
import { BldrHeroArtwork } from '../mobile/BldrHeroArtwork';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { BuildScaleRail } from './BuildScaleRail';
import { BuildClassCard } from './BuildClassCard';
import { BuildScaleComparison } from './BuildScaleComparison';
import { BLDR_CLASSIFICATION_CARDS } from '../../../config/bldr-classification';
import type { BldrBuildClassIconId } from '../../../config/bldr-build-class-icons';

type BldrClassificationMobileProps = {
  onSelectClass: (classId: BldrBuildClassIconId) => void;
  resumeHref?: string | null;
  resumeLabel?: string;
};

export function BldrClassificationMobile({ onSelectClass, resumeHref, resumeLabel }: BldrClassificationMobileProps) {
  return (
    <div className="site00-bldr-classification">
      <header className="site00-bldr-classification__hero">
        <div className="site00-bldr-classification__hero-mark-wrap">
          <Site00ThreeCornerMark className="site00-bldr-classification__hero-mark" />
          <p className="site00-bldr-classification__location">{BLDR_CLASSIFICATION_COPY.location}</p>
        </div>
        <div className="site00-bldr-classification__hero-grid">
          <div className="site00-bldr-classification__hero-copy">
            <h1 className="site00-bldr-classification__headline">{BLDR_CLASSIFICATION_COPY.headline}</h1>
            <p className="site00-bldr-classification__subhead">
              <span className="site00-bldr-classification__subhead-accent">{BLDR_CLASSIFICATION_COPY.subhead}</span>
              <br />
              {BLDR_CLASSIFICATION_COPY.subheadAccent}
            </p>
          </div>
          <BldrHeroArtwork className="site00-bldr-classification__hero-art" />
        </div>
      </header>

      {resumeHref ? (
        <div className="site00-bldr-classification__resume">
          <p className="site00-bldr-classification__resume-label">{resumeLabel ?? BLDR_CLASSIFICATION_COPY.resumeLabel}</p>
          <Link to={resumeHref} className="site00-bldr-classification__resume-link">
            CONTINUE →
          </Link>
        </div>
      ) : null}

      <BuildScaleRail />

      <div className="site00-bldr-classification__cards">
        {BLDR_CLASSIFICATION_CARDS.map((card) => (
          <BuildClassCard key={card.id} card={card} onSelect={() => onSelectClass(card.id)} />
        ))}
      </div>

      <BuildScaleComparison />
    </div>
  );
}
