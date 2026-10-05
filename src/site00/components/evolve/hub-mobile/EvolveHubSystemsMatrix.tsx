import { useState } from 'react';
import { EVOLVE_SERVICE_AREAS } from '../../../../../shared/site00-evolve-service/serviceConfig.js';
import { EvolveServiceIcon } from '../service/EvolveServiceIcon';
import { ArrowIconSmall } from '../../icons/ArrowAction';

const SERVICE_AREAS_COPY = {
  title: 'SERVICE AREAS ─',
  subtitle: 'CAPABILITIES FOR YOUR EVOLUTION',
} as const;

export function EvolveHubSystemsMatrix() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="site00-evolve-hub-systems" id="systems" aria-labelledby="evolve-hub-systems-heading">
      <header className="site00-evolve-hub-section-header">
        <h2 id="evolve-hub-systems-heading" className="site00-evolve-hub-section-header__title">
          {SERVICE_AREAS_COPY.title}
        </h2>
        <p className="site00-evolve-hub-section-header__subtitle">{SERVICE_AREAS_COPY.subtitle}</p>
      </header>
      <div className="site00-evolve-hub-systems__scroll">
        {EVOLVE_SERVICE_AREAS.map((area) => {
          const expanded = expandedId === area.id;

          return (
            <article key={area.id} className="site00-evolve-hub-system-module">
              <p className="site00-evolve-hub-system-module__num">
                {area.num} / {area.title}
              </p>
              <div className="site00-evolve-hub-system-module__icon">
                <EvolveServiceIcon id={area.iconId} title={area.title} size={48} />
              </div>
              <ul className="site00-evolve-hub-system-module__list">
                {area.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {expanded ? (
                <p id={`evolve-system-${area.id}`} className="site00-evolve-hub-system-module__detail">
                  {area.capabilities.join(' · ')}
                </p>
              ) : null}
              <button
                type="button"
                className="site00-evolve-hub-system-module__explore"
                onClick={() => toggle(area.id)}
                aria-expanded={expanded}
                aria-controls={`evolve-system-${area.id}`}
              >
                {expanded ? 'CLOSE' : 'EXPLORE'}
                <ArrowIconSmall />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
