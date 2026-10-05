import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { CtrlRoomCommandHeroArtwork } from './CtrlRoomCommandHeroArtwork';

export function CtrlRoomCommandHero() {
  const copy = CTRL_ROOM_MOBILE_COPY.hero;

  return (
    <header className="site00-ctrl-room-hero">
      <div className="site00-ctrl-room-hero__meta">
        <Site00ThreeCornerMark className="site00-ctrl-room-hero__mark" />
        <p className="site00-ctrl-room-hero__kicker">{copy.kicker}</p>
      </div>
      <div className="site00-ctrl-room-hero__grid">
        <div className="site00-ctrl-room-hero__copy">
          <h1 className="site00-ctrl-room-hero__headline">
            {copy.headlineLine1}
            <br />
            {copy.headlineLine2}
            <span className="site00-ctrl-room-hero__headline-mark" aria-hidden="true">
              ■
            </span>
          </h1>
          <span className="site00-ctrl-room-hero__rule" aria-hidden="true" />
          <p className="site00-ctrl-room-hero__subhead">{copy.subhead}</p>
        </div>
        <CtrlRoomCommandHeroArtwork />
      </div>
    </header>
  );
}
