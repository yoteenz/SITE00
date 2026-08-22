import { BracketHeading } from '../../pages/Site00PagePrimitives';
import { BldrHeroArtwork } from './BldrHeroArtwork';

export function BldrMobileHero() {
  return (
    <header className="site00-bldr-mobile-hero">
      <div className="site00-bldr-mobile-hero__copy">
        <BracketHeading className="site00-bldr-mobile-hero__title">BLDR</BracketHeading>
        <p className="site00-bldr-mobile-hero__subtitle">
          START YOUR BUILD.
          <br />
          WE&apos;LL GUIDE YOU FROM
          <br />
          IDEA TO LAUNCH.
        </p>
      </div>
      <BldrHeroArtwork />
    </header>
  );
}
