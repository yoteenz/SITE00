import { Link } from 'react-router-dom';
import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import { CtrlRoomCommandHeroArtwork } from './CtrlRoomCommandHeroArtwork';

type CtrlRoomClosingModuleProps = {
  projectsHref: string;
  buildHref: string;
};

export function CtrlRoomClosingModule({ projectsHref, buildHref }: CtrlRoomClosingModuleProps) {
  const copy = CTRL_ROOM_MOBILE_COPY.closing;

  return (
    <section className="site00-ctrl-room-closing" aria-label="COMMAND HANDOFF">
      <CtrlRoomCommandHeroArtwork className="site00-ctrl-room-closing__art" />
      <div className="site00-ctrl-room-closing__copy">
        <h2 className="site00-ctrl-room-closing__headline">
          {copy.headlineLine1}
          <br />
          {copy.headlineLine2}
        </h2>
        <p className="site00-ctrl-room-closing__body">{copy.body}</p>
      </div>
      <div className="site00-ctrl-room-closing__actions">
        <Link to={projectsHref} className="site00-ctrl-room-closing__cta">
          {copy.projectsCta}
        </Link>
        <Link to={buildHref} className="site00-ctrl-room-closing__cta">
          {copy.buildCta}
        </Link>
      </div>
    </section>
  );
}
