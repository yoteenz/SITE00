/**
 * P0.CJ.2 — Side-by-side concept comparison (desktop 2-up / 3-up).
 */

import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panels: ConceptPanel[];
  onPickWinner?: (id: string) => void;
};

export function ConceptCompareView({ panels, onPickWinner }: Props) {
  if (panels.length < 2) {
    return <p className="site00-cj-compare__empty">Select at least two concepts to compare.</p>;
  }

  return (
    <div className={`site00-cj-compare site00-cj-compare--${Math.min(panels.length, 3)}up`}>
      {panels.slice(0, 3).map((p) => (
        <article key={p.id} className="site00-cj-compare__col">
          <header>
            <h4>{p.conceptTitle}</h4>
            <span>{p.brandName}</span>
          </header>
          <dl>
            <div><dt>PREMISE</dt><dd>{p.oneLinePremise}</dd></div>
            <div><dt>TENSION</dt><dd>{p.centralTension}</dd></div>
            <div><dt>MECHANISM</dt><dd>{p.mechanism}</dd></div>
            <div><dt>WORLD</dt><dd>{p.world}</dd></div>
            <div><dt>INTERJECTION</dt><dd>{p.interjection}</dd></div>
            <div><dt>SCORE</dt><dd>{p.score}</dd></div>
          </dl>
          {onPickWinner ? (
            <button type="button" onClick={() => onPickWinner(p.id)}>SELECT WINNER</button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
