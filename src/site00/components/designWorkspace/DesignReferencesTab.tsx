/**
 * P0.VR.6 — References library tab (visual cards, search, filters).
 */

import { useMemo, useState } from 'react';
import {
  listCanonicalReferences,
  promoteReferenceToCanonical,
  type CanonicalVisualReference,
  type DesignViewportClass,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import {
  REFERENCE_FILTER_CHIPS,
  type ReferenceFilterChip,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';

type Props = {
  projectId: string;
  viewportClass: DesignViewportClass;
  selectedScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onUploadClick: () => void;
  activeReferenceUrl: string | null;
};

function refStatusLabel(ref: CanonicalVisualReference): string {
  if (ref.status === 'ACTIVE_CANONICAL') return 'CANONICAL';
  if (ref.status === 'DRAFT') return 'STAGED';
  return ref.status.replace(/_/g, ' ');
}

function refDisplayName(ref: CanonicalVisualReference): string {
  return `${ref.screenId.replace(/_/g, ' ')} (${ref.viewportClass.toUpperCase()})`;
}

export function DesignReferencesTab({
  projectId,
  viewportClass,
  selectedScreenId,
  onSelectScreen,
  onUploadClick,
  activeReferenceUrl: _activeReferenceUrl,
}: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ReferenceFilterChip>('ALL');

  const references = useMemo(() => listCanonicalReferences(projectId), [projectId]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return references.filter((ref) => {
      if (filter === 'CANONICAL' && ref.status !== 'ACTIVE_CANONICAL') return false;
      if (filter === 'RECENT') {
        const age = Date.now() - new Date(ref.createdAt).getTime();
        if (age > 7 * 86400_000) return false;
      }
      if (filter === 'MOBILE' && ref.viewportClass !== 'mobile') return false;
      if (filter === 'DESKTOP' && ref.viewportClass !== 'desktop') return false;
      if (!q) return true;
      const hay = `${ref.screenId} ${ref.route} ${ref.scope} ${ref.status}`.toUpperCase();
      return hay.includes(q);
    });
  }, [references, search, filter]);

  return (
    <section className="site00-dw-v3-refs" data-design-tab="references">
      <div className="site00-dw-v3-refs__search-row">
        <label className="site00-dw-v3-search">
          <span className="site00-dw-v3-search__icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="SEARCH REFERENCES..."
            aria-label="Search references"
          />
        </label>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline">
          FILTER
        </button>
      </div>

      <div className="site00-dw-v3-chip-row" role="group" aria-label="Reference filters">
        {REFERENCE_FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-active' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <header className="site00-dw-v3-refs__head">
        <div>
          <h2>REFERENCE LIBRARY</h2>
          <p>
            {filtered.length} REFERENCE{filtered.length === 1 ? '' : 'S'} · COLLECT AND MANAGE DESIGN REFERENCES FOR
            ASSET RECONSTRUCTION.
          </p>
        </div>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onUploadClick}>
          ↑ UPLOAD REFERENCE
        </button>
      </header>

      <div className="site00-dw-v3-refs__grid">
        {filtered.map((ref) => (
          <article
            key={ref.referenceId}
            className={`site00-dw-v3-ref-card${ref.status === 'ACTIVE_CANONICAL' ? ' is-canonical' : ''}${ref.screenId === selectedScreenId && ref.viewportClass === viewportClass ? ' is-selected' : ''}`}
          >
            <span className={`site00-dw-v3-ref-card__badge is-${refStatusLabel(ref).toLowerCase()}`}>
              {refStatusLabel(ref)}
            </span>
            <button type="button" className="site00-dw-v3-ref-card__star" aria-label="Favorite">
              ☆
            </button>
            <button
              type="button"
              className="site00-dw-v3-ref-card__body"
              onClick={() => onSelectScreen(ref.screenId)}
            >
              {ref.storagePath ? (
                <img src={ref.storagePath} alt="" className="site00-dw-v3-ref-card__thumb" />
              ) : (
                <div className="site00-dw-v3-ref-card__thumb site00-dw-v3-ref-card__thumb--empty" />
              )}
              <strong>{refDisplayName(ref).toUpperCase()}</strong>
              <span>{ref.route.toUpperCase()}</span>
              <time>{new Date(ref.createdAt).toLocaleDateString()}</time>
            </button>
            {ref.status === 'DRAFT' ? (
              <button
                type="button"
                className="site00-dw-v3-ref-card__action"
                onClick={() => promoteReferenceToCanonical(ref.referenceId)}
              >
                MAKE CANONICAL
              </button>
            ) : null}
          </article>
        ))}

        <button type="button" className="site00-dw-v3-ref-card site00-dw-v3-ref-card--add" onClick={onUploadClick}>
          <span className="site00-dw-v3-ref-card__plus">+</span>
          <strong>ADD REFERENCE</strong>
          <span>DRAG IMAGE HERE OR TAP TO BROWSE</span>
        </button>
      </div>

      <button type="button" className="site00-dw-v3-preset-strip">
        <span aria-hidden>📄</span>
        <div>
          <strong>INSTRUCTION PRESETS</strong>
          <span>QUICK START WITH SAVED INSTRUCTIONS</span>
        </div>
        <div className="site00-dw-v3-chip-row" style={{ margin: 0, flex: 1, justifyContent: 'flex-end' }}>
          {['ISOLATE LAYOUT', 'EXTRACT STYLES', 'MAP COMPONENTS'].map((chip) => (
            <span key={chip} className="site00-dw-v3-chip" style={{ padding: '3px 6px', fontSize: 6 }}>
              {chip}
            </span>
          ))}
        </div>
        <span className="site00-dw-v3-preset-strip__chev">›</span>
      </button>
    </section>
  );
}
