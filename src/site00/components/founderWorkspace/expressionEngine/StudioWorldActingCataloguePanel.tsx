/**
 * Studio World Acting Company — immersive roster (not a spreadsheet).
 */

import { useMemo, useState } from 'react';
import {
  castingCreativeSearch,
  getStudioWorldActorCatalogue,
} from '../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import '../../../styles/site00-cast-stage.css';

type Props = {
  onClose?: () => void;
};

export function StudioWorldActingCataloguePanel({ onClose }: Props) {
  const catalogue = getStudioWorldActorCatalogue();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return catalogue.actors;
    return castingCreativeSearch(query, catalogue);
  }, [catalogue, query]);

  return (
    <section data-testid="studio-world-acting-catalogue">
      <header className="site00-cast-stage__masthead">
        <div>
          <h2 className="site00-cast-stage__title">Studio World Acting Company</h2>
          <p className="site00-expr-engine-panel__meta">Available talent · Recently used · New faces</p>
        </div>
        {onClose ?
          <button type="button" className="site00-cast-slot__btn" onClick={onClose}>
            Close
          </button>
        : null}
      </header>

      <label className="site00-expr-engine-panel__meta">
        Creative search
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="warm but intimidating woman in her 40s"
          data-testid="acting-catalogue-search"
          style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
        />
      </label>

      <div className="site00-cast-catalogue__grid">
        {filtered.map((actor) => (
          <article key={actor.actorId} className="site00-cast-actor-card" data-testid={`actor-card-${actor.catalogueNumber}`}>
            <div className="site00-cast-actor-card__headshot">CONTACT SHEET</div>
            <p className="site00-cast-actor-card__id">{actor.catalogueNumber}</p>
            <p className="site00-cast-actor-card__name">{actor.stageName}</p>
            <p className="site00-cast-actor-card__tags">
              {actor.ageRange} · {actor.presentation} · {actor.performanceProfile.slice(0, 2).join(' / ')}
            </p>
            <p className="site00-cast-actor-card__tags">{actor.roleArchetypes.slice(0, 3).join(' · ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
