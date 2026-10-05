/**
 * B5.0 — Pre-storyboard authority gallery (artifact-first).
 */

import { useState } from 'react';
import type { PreStoryboardAuthority } from './types';

type Props = {
  authorities: PreStoryboardAuthority[];
  approvedCount: number;
  requiredCount: number;
  gateSatisfied: boolean;
  gateStatus: string;
};

export function AuthorityGalleryWorkspace({
  authorities,
  approvedCount,
  requiredCount,
  gateSatisfied,
  gateStatus,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = authorities[activeIndex];

  return (
    <section className="site00-ee-workspace site00-ee-authority">
      <div className="site00-ee-authority__summary">
        <div className="site00-ee-authority__summary-stat">
          <span className="site00-ee-authority__summary-label">VISUAL AUTHORITIES</span>
          <span className="site00-ee-authority__summary-value">
            {approvedCount} / {requiredCount} APPROVED
          </span>
        </div>
        <div className={`site00-ee-authority__gate site00-ee-authority__gate--${gateSatisfied ? 'satisfied' : 'pending'}`}>
          <span>GATE</span>
          <strong>{gateStatus}</strong>
        </div>
      </div>

      {active ? (
        <figure className="site00-ee-authority__hero">
          {active.previewUrl ? (
            <img src={active.previewUrl} alt={`Authority ${active.boardNumber} — ${active.boardTitle}`} />
          ) : (
            <div className="site00-ee-authority__placeholder">Authority {String(active.boardNumber).padStart(2, '0')}</div>
          )}
          <figcaption>
            <span className="site00-ee-authority__hero-num">{String(active.boardNumber).padStart(2, '0')}</span>
            <span className="site00-ee-authority__hero-name">{active.boardTitle}</span>
            <span className={`site00-ee-authority__judgment site00-ee-authority__judgment--${active.founderJudgment.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
              {active.founderJudgment}
            </span>
            {active.record?.version ? <span className="site00-ee-authority__version">v{active.record.version}</span> : null}
          </figcaption>
        </figure>
      ) : null}

      <div className="site00-ee-authority__carousel" role="tablist" aria-label="Authority gallery">
        {authorities.map((board, i) => (
          <button
            key={board.boardId}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={`site00-ee-authority__card${i === activeIndex ? ' site00-ee-authority__card--active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            {board.previewUrl ? (
              <img src={board.previewUrl} alt="" loading="lazy" />
            ) : (
              <span className="site00-ee-authority__card-placeholder">{String(board.boardNumber).padStart(2, '0')}</span>
            )}
            <span className="site00-ee-authority__card-label">{board.boardTitle}</span>
            <span className="site00-ee-authority__card-status">{board.founderJudgment}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
