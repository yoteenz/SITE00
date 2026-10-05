import { useEffect, useRef } from 'react';
import { EvolveHubHero } from './EvolveHubHero';
import { EvolveDiagnosticStrip } from './EvolveDiagnosticStrip';
import { EvolveSectionIndex } from './EvolveSectionIndex';
import { EvolveHubPaths } from './EvolveHubPaths';
import { EvolveHubProcess } from './EvolveHubProcess';
import { EvolveHubSystemsMatrix } from './EvolveHubSystemsMatrix';
import { EvolveHubCaseStudies } from './EvolveHubCaseStudies';
import { EvolveHubFAQ } from './EvolveHubFAQ';
import { EvolveHubFinalCTA } from './EvolveHubFinalCTA';
import { EVOLVE_HOMEPAGE_EXPANDED } from '../../../config/evolve';

export function EvolveHubMobileExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      root.classList.add('site00-evolve-hub-mobile--revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          root.classList.add('site00-evolve-hub-mobile--revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.06 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="site00-evolve-hub-mobile">
      <EvolveHubHero />
      <EvolveDiagnosticStrip />
      <EvolveSectionIndex rootRef={rootRef} />
      <section className="site00-evolve-hub-overview" aria-label="Overview">
        <p className="site00-evolve-hub-overview__body">{EVOLVE_HOMEPAGE_EXPANDED.overview}</p>
      </section>
      <EvolveHubPaths />
      <EvolveHubProcess />
      <EvolveHubSystemsMatrix />
      <EvolveHubCaseStudies />
      <EvolveHubFAQ />
      <EvolveHubFinalCTA />
    </div>
  );
}
