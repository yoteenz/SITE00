import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_CTRL_ROOM_DESKTOP_BG_FILE } from '../../config/site00-auth-assets';

type StudioProjectHeaderProps = {
  projectNumber: string;
  projectName: string;
  studioStatus: string;
};

const headerBg = resolveSite00PublicAsset(SITE00_CTRL_ROOM_DESKTOP_BG_FILE);

export function StudioProjectHeader({ projectNumber, projectName, studioStatus }: StudioProjectHeaderProps) {
  return (
    <header className="site00-studio-header">
      <div
        className="site00-studio-header__env"
        style={headerBg ? { backgroundImage: `url(${headerBg})` } : undefined}
        aria-hidden="true"
      >
        <div className="site00-studio-header__reticle" aria-hidden="true" />
      </div>
      <div className="site00-studio-header__content">
        <div className="site00-studio-header__brand">
          <span className="site00-studio-header__site">SITE 00</span>
          <span className="site00-studio-header__diamond" aria-hidden="true">◆</span>
        </div>
        <p className="site00-studio-header__kicker">STUDIO / ACTIVE PROJECT</p>
        <p className="site00-studio-header__number">PROJECT {projectNumber}</p>
        <h1 className="site00-studio-header__name">{projectName}</h1>
        <p className="site00-studio-header__statement">
          WE ARE BUILDING YOUR DIGITAL PROPERTY.
          FOLLOW THE PRODUCTION.
          PROVIDE INPUT.
          REVIEW.
          APPROVE.
          LAUNCH.
        </p>
        <div className="site00-studio-header__status-row">
          <span className="site00-studio-header__status">{studioStatus}</span>
          <span className="site00-studio-header__status-mark" aria-hidden="true">◆</span>
        </div>
      </div>
    </header>
  );
}
