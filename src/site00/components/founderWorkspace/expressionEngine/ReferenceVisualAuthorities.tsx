/**
 * Reference-fidelity — visual authorities horizontal row.
 */

import type { PreStoryboardAuthority } from './types';

const AUTHORITY_SHORT_NAMES: Record<number, string> = {
  1: 'NDX Presence',
  2: 'Subject Woman',
  3: 'NDX Hands',
  4: 'Fashion Continuity',
  5: 'Phone / Glitch',
};

type Props = {
  authorities: PreStoryboardAuthority[];
  allApproved: boolean;
};

export function ReferenceVisualAuthorities({ authorities, allApproved }: Props) {
  return (
    <section className="site00-ee-ref-authorities">
      <header className="site00-ee-ref-authorities__head">
        <h3>VISUAL AUTHORITIES</h3>
        {allApproved ? (
          <span className="site00-ee-ref-authorities__approved">
            ALL APPROVED <span aria-hidden>✓</span>
          </span>
        ) : null}
      </header>
      <div className="site00-ee-ref-authorities__scroll">
        {authorities.map((board) => (
          <figure key={board.boardId} className="site00-ee-ref-authorities__item">
            {board.previewUrl ? (
              <img src={board.previewUrl} alt="" loading="lazy" />
            ) : (
              <span className="site00-ee-ref-authorities__placeholder">{String(board.boardNumber).padStart(2, '0')}</span>
            )}
            <figcaption>
              <span className="site00-ee-ref-authorities__name">
                {AUTHORITY_SHORT_NAMES[board.boardNumber] ?? board.boardTitle}
              </span>
              <span className="site00-ee-ref-authorities__judgment">
                {board.founderJudgment}
                {board.founderJudgment === 'LOVE_IT' ? ' ✓' : ''}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
