import { EVOLVE_CLOSING_COPY } from '../../../config/evolve-diagnostic';
import { EvolveHeroArtwork } from './EvolveHeroArtwork';
import { ArrowIconSmall } from '../../icons/ArrowAction';

type EvolveClosingModuleProps = {
  hasSelectedPath: boolean;
  onBeginAssessment: () => void;
};

export function EvolveClosingModule({ hasSelectedPath, onBeginAssessment }: EvolveClosingModuleProps) {
  return (
    <section className="site00-evolve-mobile-closing" aria-label="EVOLVE HANDOFF">
      <div className="site00-evolve-mobile-closing__copy">
        {hasSelectedPath ? (
          <>
            <p className="site00-evolve-mobile-closing__path-set">{EVOLVE_CLOSING_COPY.pathSetLine1}</p>
            <p className="site00-evolve-mobile-closing__path-set">{EVOLVE_CLOSING_COPY.pathSetLine2}</p>
          </>
        ) : (
          <>
            <h2 className="site00-evolve-mobile-closing__headline">
              {EVOLVE_CLOSING_COPY.headlineLine1}
              <br />
              {EVOLVE_CLOSING_COPY.headlineLine2}
            </h2>
            <p className="site00-evolve-mobile-closing__subhead">{EVOLVE_CLOSING_COPY.subhead}</p>
          </>
        )}
        <button type="button" className="site00-evolve-mobile-closing__cta" onClick={onBeginAssessment}>
          {hasSelectedPath ? EVOLVE_CLOSING_COPY.ctaAssessment.replace(' →', '') : EVOLVE_CLOSING_COPY.ctaDefault.replace(' →', '')}
          <ArrowIconSmall />
        </button>
      </div>
      <EvolveHeroArtwork className="site00-evolve-mobile-closing__art" />
    </section>
  );
}
