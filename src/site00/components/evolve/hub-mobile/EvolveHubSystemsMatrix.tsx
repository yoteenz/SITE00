import { useState } from 'react';
import { getCapabilitiesByCategory } from '../../../config/capability-registry';
import {
  EVOLVE_HUB_SYSTEM_MODULES,
  EVOLVE_HUB_SYSTEMS_COPY,
} from '../../../config/evolve-hub-mobile';
import { EvolvePathIcon } from '../EvolvePathIcon';
import { ArrowIconSmall } from '../../icons/ArrowAction';

export function EvolveHubSystemsMatrix() {
  const capabilityGroups = getCapabilitiesByCategory('evolve');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="site00-evolve-hub-systems" id="systems" aria-labelledby="evolve-hub-systems-heading">
      <header className="site00-evolve-hub-section-header">
        <h2 id="evolve-hub-systems-heading" className="site00-evolve-hub-section-header__title">
          {EVOLVE_HUB_SYSTEMS_COPY.title}
        </h2>
        <p className="site00-evolve-hub-section-header__subtitle">{EVOLVE_HUB_SYSTEMS_COPY.subtitle}</p>
      </header>
      <div className="site00-evolve-hub-systems__scroll">
        {EVOLVE_HUB_SYSTEM_MODULES.map((module) => {
          const expanded = expandedId === module.category;
          const registryEntries = capabilityGroups[module.category] ?? [];

          return (
            <article key={module.category} className="site00-evolve-hub-system-module">
              <p className="site00-evolve-hub-system-module__num">
                {module.num} / {module.title}
              </p>
              <div className="site00-evolve-hub-system-module__icon">
                <EvolvePathIcon id={module.iconId} title={module.title} size={48} />
              </div>
              <ul className="site00-evolve-hub-system-module__list">
                {module.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {expanded && registryEntries.length > 0 ? (
                <ul
                  id={`evolve-system-${module.category}`}
                  className="site00-evolve-hub-system-module__detail"
                >
                  {registryEntries.map((entry) => (
                    <li key={entry.id}>
                      <span className="site00-evolve-hub-system-module__detail-name">{entry.name}</span>
                      <span className="site00-evolve-hub-system-module__detail-desc">{entry.description}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                className="site00-evolve-hub-system-module__explore"
                onClick={() => toggle(module.category)}
                aria-expanded={expanded}
                aria-controls={`evolve-system-${module.category}`}
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
