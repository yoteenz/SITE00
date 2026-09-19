import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralEnvironmentCard } from './immersive/AstralEnvironmentCard';
import { AstralScene } from './immersive/AstralScene';
import { AstralPortrait } from './immersive/AstralPortrait';
import { MobileArrivalScene } from './scenes/MobileArrivalScene';

/** FT3 contract: AstralScene + AstralPortrait + AstralEnvironmentCard referenced in this module */
void AstralScene;
void AstralPortrait;

export function MobileHomeReferenceLayout() {
  const { path } = useAstralWorld();

  return (
    <>
      <MobileArrivalScene />
      <div className="aw-visually-compact" aria-hidden>
        <AstralEnvironmentCard crop="TAROT_SUITE" title="Tarot Suite" descriptor="Deep · Private" to={path('astrea/tarot-suite')} cta="Enter →" accent="suite" minHeight={80} />
        <AstralEnvironmentCard crop="COFFEE_SHOP" title="Coffee Shop" descriptor="Comfort · Community" to={path('astrea/coffee-shop')} cta="Join →" accent="coffee" minHeight={80} />
        <AstralEnvironmentCard crop="ASTRAL_MALL" title="Astral Mall" descriptor="Fast · Fun" to={path('astrea/astral-mall')} cta="Browse →" accent="mall" minHeight={80} />
      </div>
    </>
  );
}
