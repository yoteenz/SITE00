import { IDNTY_CONTROL_CENTER_HERO } from '../../../config/idnty-control-center';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { IdntyControlCenterHeroArtwork } from './IdntyControlCenterHeroArtwork';

export function IdntyControlCenterHero() {
  return (
    <header className="site00-idnty-control-hero">
      <div className="site00-idnty-control-hero__meta">
        <Site00ThreeCornerMark className="site00-idnty-control-hero__mark" />
        <p className="site00-idnty-control-hero__kicker">{IDNTY_CONTROL_CENTER_HERO.kicker}</p>
      </div>
      <div className="site00-idnty-control-hero__grid">
        <div className="site00-idnty-control-hero__copy">
          <h1 className="site00-idnty-control-hero__headline">
            {IDNTY_CONTROL_CENTER_HERO.headlineLine1}
            <br />
            {IDNTY_CONTROL_CENTER_HERO.headlineLine2}
          </h1>
          <span className="site00-idnty-control-hero__rule" aria-hidden="true" />
          <p className="site00-idnty-control-hero__subhead">{IDNTY_CONTROL_CENTER_HERO.subhead}</p>
        </div>
        <IdntyControlCenterHeroArtwork />
      </div>
    </header>
  );
}
