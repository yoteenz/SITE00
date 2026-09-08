/**
 * B5.3 — Visual authorities gallery (accordion expanded, reference-fidelity).
 */

import { useState } from 'react';
import type { PreStoryboardAuthority } from './types';

const AUTHORITY_SHORT_NAMES: Record<number, string> = {
  1: 'NDX PRESENCE',
  2: 'SUBJECT WOMAN',
  3: 'NDX HANDS',
  4: 'FASHION CONTINUITY',
  5: 'PHONE / GLITCH',
};

type Props = {
  authorities: PreStoryboardAuthority[];
  approvedCount: number;
  requiredCount: number;
  /** When true, renders section header (standalone). When false, gallery only for accordion body. */
  showHeader?: boolean;
};

export function ReferenceVisualAuthorities({
  authorities,
  approvedCount,
  requiredCount,
  showHeader = true,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const allApproved = approvedCount >= requiredCount && requiredCount > 0;

  return (
    <>
      <section className={`site00-ee-ref-authorities${showHeader ? '' : ' site00-ee-ref-authorities--embedded'}`}>
        {showHeader ? (
          <header className="site00-ee-ref-authorities__head">
            <h3>VISUAL AUTHORITIES</h3>
            <span className="site00-ee-ref-authorities__approved">
              {approvedCount} / {requiredCount} APPROVED
              {allApproved ? <span aria-hidden> ✓</span> : null}
            </span>
          </header>
        ) : null}
        <div className="site00-ee-ref-authorities__scroll">
          {authorities.map((board) => (
            <figure key={board.boardId} className="site00-ee-ref-authorities__item">
              <button
                type="button"
                className="site00-ee-ref-authorities__thumb-btn"
                disabled={!board.previewUrl}
                onClick={() => board.previewUrl && setPreviewUrl(board.previewUrl)}
                aria-label={`Preview ${AUTHORITY_SHORT_NAMES[board.boardNumber] ?? board.boardTitle}`}
              >
                {board.previewUrl ? (
                  <img src={board.previewUrl} alt="" loading="lazy" />
                ) : (
                  <span className="site00-ee-ref-authorities__placeholder">{String(board.boardNumber).padStart(2, '0')}</span>
                )}
              </button>
              <figcaption>
                <span className="site00-ee-ref-authorities__index">{String(board.boardNumber).padStart(2, '0')}</span>
                <span className="site00-ee-ref-authorities__name">
                  {AUTHORITY_SHORT_NAMES[board.boardNumber] ?? board.boardTitle}
                </span>
                <span className="site00-ee-ref-authorities__judgment">
                  {board.founderJudgment === 'LOVE_IT' ? 'LOVE_IT ✓' : board.founderJudgment}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {previewUrl ? (
        <div className="site00-ee-ref-authorities__modal" role="dialog" aria-modal="true" aria-label="Authority preview">
          <button type="button" className="site00-ee-ref-authorities__modal-close" onClick={() => setPreviewUrl(null)}>
            CLOSE
          </button>
          <img src={previewUrl} alt="Visual authority preview" />
        </div>
      ) : null}
    </>
  );
}
