/**
 * P0.CJ.2V — Client-showable trailer (no internal engine chrome).
 */

import { summarizeLine } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import { ConceptHeroVisual } from './ConceptHeroVisual.js';

type Props = {
  panel: ConceptPanel;
  onExit?: () => void;
};

export function ConceptTrailerMode({ panel, onExit }: Props) {
  const isSavor = panel.isRealBrandDemo;
  const expressionLine = panel.primaryChannels
    .slice(0, 4)
    .map((c) => c.split('-')[0]?.toUpperCase())
    .join(' · ');

  return (
    <div className={`site00-cj-trailer${isSavor ? ' site00-cj-trailer--savor' : ''}`}>
      {onExit ? (
        <button type="button" className="site00-cj-trailer__exit" onClick={onExit}>EXIT</button>
      ) : null}

      <header className="site00-cj-trailer__mark">SITE 00</header>

      <p className="site00-cj-trailer__brand">{panel.brandName}</p>
      {isSavor ? <p className="site00-cj-trailer__evolution">CREATIVE EVOLUTION</p> : null}

      <ConceptHeroVisual panel={panel} size="trailer" />

      <h1>{panel.conceptTitle}</h1>

      <p className="site00-cj-trailer__premise">
        {isSavor
          ? 'SOME ROOMS YOU REMEMBER BEFORE YOU\'VE ENTERED THEM.'
          : summarizeLine(panel.oneLinePremise, 120)}
      </p>

      <ul className="site00-cj-trailer__beats">
        <li><span>TENSION</span>{summarizeLine(panel.centralTension, 88)}</li>
        <li><span>WORLD</span>{summarizeLine(panel.world, 72)}</li>
        <li><span>HERO MOVE</span>{summarizeLine(panel.heroMove, 88)}</li>
        {panel.interjection ? (
          <li><span>INTERJECTION</span>{summarizeLine(panel.interjection, 88)}</li>
        ) : null}
      </ul>

      {expressionLine ? (
        <p className="site00-cj-trailer__expression">EXPRESSION · {expressionLine}</p>
      ) : null}

      <footer className="site00-cj-trailer__end">
        {isSavor ? <span>REAL BRAND CASE</span> : null}
        <span>A SITE 00 CONCEPT STUDY</span>
      </footer>
    </div>
  );
}
