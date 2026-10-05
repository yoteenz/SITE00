import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { FastTravelUpNextRegistrationMark } from '../../fast-travel/FastTravelUpNextRegistrationMark';
import { BldrActivationNodeArtwork } from './BldrActivationNodeArtwork';

export function BldrActivationCTA() {
  return (
    <section className="site00-bldr-mobile-cta" aria-labelledby="bldr-mobile-cta-heading">
      <FastTravelUpNextRegistrationMark className="site00-bldr-mobile-cta__mark" />
      <BldrActivationNodeArtwork />
      <div className="site00-bldr-mobile-cta__copy">
        <p id="bldr-mobile-cta-heading" className="site00-bldr-mobile-cta__heading">
          READY TO BEGIN?
        </p>
        <p className="site00-bldr-mobile-cta__desc">
          START YOUR BUILD INTAKE AND ENTER THE SITE 00 BUILD FLOW.
        </p>
        <Link to={SITE00_ROUTES.bldrStart} className="site00-bldr-mobile-cta__action">
          <span className="site00-bldr-mobile-cta__action-text">START BUILDING</span>
          <span className="site00-bldr-mobile-cta__action-arrow" aria-hidden="true">
            →
          </span>
          <span className="site00-bldr-mobile-cta__action-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
