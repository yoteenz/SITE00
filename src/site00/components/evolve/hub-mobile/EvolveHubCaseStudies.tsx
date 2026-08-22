import { EVOLVE_HUB_CASE_STUDIES_COPY } from '../../../config/evolve-hub-mobile';
import { EvolveHeroArtwork } from '../mobile/EvolveHeroArtwork';

export function EvolveHubCaseStudies() {
  return (
    <section className="site00-evolve-hub-cases" id="cases" aria-labelledby="evolve-hub-cases-heading">
      <h2 id="evolve-hub-cases-heading" className="site00-evolve-hub-cases__label">
        {EVOLVE_HUB_CASE_STUDIES_COPY.label}
      </h2>
      <div className="site00-evolve-hub-cases__panel">
        <div className="site00-evolve-hub-cases__copy">
          {EVOLVE_HUB_CASE_STUDIES_COPY.headlineLines.map((line) => (
            <p key={line} className="site00-evolve-hub-cases__headline">
              {line}
            </p>
          ))}
        </div>
        <EvolveHeroArtwork className="site00-evolve-hub-cases__art" />
      </div>
    </section>
  );
}
