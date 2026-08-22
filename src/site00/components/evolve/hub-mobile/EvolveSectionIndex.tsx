import { useEffect, useState, type RefObject } from 'react';
import { EVOLVE_HUB_SECTIONS } from '../../../config/evolve-hub-mobile';

type EvolveSectionIndexProps = {
  rootRef: RefObject<HTMLElement | null>;
};

export function EvolveSectionIndex({ rootRef }: EvolveSectionIndexProps) {
  const [activeId, setActiveId] = useState<string>(EVOLVE_HUB_SECTIONS[0]?.id ?? 'overview');

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sections = EVOLVE_HUB_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [rootRef]);

  const handleClick = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className="site00-evolve-section-index" aria-label="EVOLVE sections">
      <ul className="site00-evolve-section-index__track">
        {EVOLVE_HUB_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={`site00-evolve-section-index__link ${activeId === section.id ? 'site00-evolve-section-index__link--active' : ''}`.trim()}
              onClick={() => handleClick(section.id)}
              aria-current={activeId === section.id ? 'true' : undefined}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
