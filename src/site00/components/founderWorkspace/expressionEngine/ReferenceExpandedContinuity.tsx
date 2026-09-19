/**
 * B5.3 — Continuity expanded accordion (visual chain, not prose dump).
 */

import type { PreStoryboardAuthority } from './types';

const CHAIN_ROLES: Array<{
  boardNumber: number;
  title: string;
  functionLabel: string;
}> = [
  { boardNumber: 1, title: 'NDX PRESENCE', functionLabel: 'Observer continuity' },
  { boardNumber: 2, title: 'SUBJECT WOMAN', functionLabel: 'Same woman / dual-era identity' },
  { boardNumber: 5, title: 'PHONE / ARCHIVE PORTAL', functionLabel: 'Archive portal / evidence device' },
  { boardNumber: 4, title: 'FASHION CONTINUITY', functionLabel: 'Same style / different cultural label' },
  { boardNumber: 5, title: 'INTERJECTION / GLITCH LOGIC', functionLabel: 'Narrative payoff / snap-back logic' },
];

type Props = {
  authorities: PreStoryboardAuthority[];
};

export function ReferenceExpandedContinuity({ authorities }: Props) {
  const byBoard = new Map(authorities.map((a) => [a.boardNumber, a]));

  return (
    <section className="site00-ee-ref-continuity" aria-label="Continuity chain">
      <div className="site00-ee-ref-continuity__scroll">
        {CHAIN_ROLES.map((node, index) => {
          const authority = byBoard.get(node.boardNumber);
          return (
            <div key={`${node.boardNumber}-${index}`} className="site00-ee-ref-continuity__node-wrap">
              {index > 0 ? <span className="site00-ee-ref-continuity__arrow" aria-hidden>→</span> : null}
              <article className="site00-ee-ref-continuity__node">
                <span className="site00-ee-ref-continuity__index">{String(index + 1).padStart(2, '0')}</span>
                <figure className="site00-ee-ref-continuity__thumb">
                  {authority?.previewUrl ? (
                    <img src={authority.previewUrl} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden />
                  )}
                </figure>
                <h5>{node.title}</h5>
                <p>{node.functionLabel}</p>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
