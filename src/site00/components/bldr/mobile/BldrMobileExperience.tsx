import { useEffect, useRef } from 'react';
import { BldrMobileHero } from './BldrMobileHero';
import { BldrSequenceIndicator } from './BldrSequenceIndicator';
import { BldrBuildSystem } from './BldrBuildSystem';
import { BldrActivationCTA } from './BldrActivationCTA';

export function BldrMobileExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      root.classList.add('site00-bldr-mobile--revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          root.classList.add('site00-bldr-mobile--revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="site00-bldr-mobile">
      <div className="site00-bldr-mobile__texture" aria-hidden="true" />
      <BldrMobileHero />
      <BldrSequenceIndicator />
      <BldrBuildSystem />
      <BldrActivationCTA />
    </div>
  );
}
