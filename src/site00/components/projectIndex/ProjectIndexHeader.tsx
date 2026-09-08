import { Link } from 'react-router-dom';
import { BracketHeading } from '../pages/Site00PagePrimitives';
import { ViewAsClientToggle } from '../projectOperatingSystem/ViewAsClientControls';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';
import { SITE00_ROUTES } from '../../config/routes';

type ProjectIndexHeaderDesktopProps = {
  clientView: boolean;
};

export function ProjectIndexHeaderDesktop({ clientView }: ProjectIndexHeaderDesktopProps) {
  const { canToggle } = useProjectViewMode();

  return (
    <header className="site00-pidx-header site00-pidx-header--desktop">
      <div className="site00-pidx-header__top">
        <p className="site00-pidx-header__crumb">PROJECT INDEX</p>
        {canToggle ? <ViewAsClientToggle /> : null}
      </div>
      <div className="site00-pidx-header__main">
        <div className="site00-pidx-header__title-block">
          <BracketHeading as="h1">PROJECTS</BracketHeading>
          <p className="site00-pidx-header__sub">
            {clientView
              ? 'YOUR PROJECTS. ONE SYSTEM.'
              : 'REAL SITE 00 PROJECT TRUTH — ALL IN ONE PLACE.'}
          </p>
        </div>
        {!clientView ? (
          <Link to={SITE00_ROUTES.bldrState} className="site00-pidx-header__new-btn">
            + NEW PROJECT
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function ProjectIndexHeaderMobile({ clientView }: { clientView: boolean }) {
  const { viewMode, canToggle, toggleViewAsClient } = useProjectViewMode();

  return (
    <header className="site00-pidx-header site00-pidx-header--mobile">
      {canToggle ? (
        <div className="site00-pidx-header__view-row">
          <button
            type="button"
            className={`site00-pidx-header__view-btn${viewMode === 'FOUNDER' ? ' is-active' : ''}`}
            onClick={() => viewMode !== 'FOUNDER' && toggleViewAsClient()}
          >
            FOUNDER VIEW
          </button>
          <button
            type="button"
            className={`site00-pidx-header__view-btn${viewMode === 'CLIENT' ? ' is-active' : ''}`}
            onClick={() => viewMode !== 'CLIENT' && toggleViewAsClient()}
          >
            CLIENT VIEW
          </button>
        </div>
      ) : null}
      <BracketHeading as="h1">PROJECTS</BracketHeading>
      <p className="site00-pidx-header__sub">
        {clientView ? 'YOUR PROJECTS. ONE SYSTEM.' : 'ALL PROJECTS. ONE SYSTEM.'}
      </p>
    </header>
  );
}

export function ProjectIndexFooterCta() {
  return (
    <footer className="site00-pidx-footer-cta">
      <div className="site00-pidx-footer-cta__inner">
        <p className="site00-pidx-footer-cta__title">
          <span className="site00-pidx-footer-cta__bracket">[</span> BUILD WHAT&apos;S NEXT.{' '}
          <span className="site00-pidx-footer-cta__bracket">]</span>
        </p>
        <p className="site00-pidx-footer-cta__sub">NEW PROJECT. NEW POSSIBILITY.</p>
        <Link to={SITE00_ROUTES.bldrState} className="site00-pidx-footer-cta__btn">
          + CREATE PROJECT
        </Link>
      </div>
    </footer>
  );
}

export function ProjectIndexClientSimulationBanner() {
  const { isSimulatingClient, canToggle, resetToFounderView } = useProjectViewMode();
  if (!canToggle || !isSimulatingClient) return null;

  return (
    <div className="site00-pidx-client-banner" role="status">
      <span className="site00-pidx-client-banner__label">CLIENT VIEW</span>
      <button type="button" className="site00-pidx-client-banner__return" onClick={resetToFounderView}>
        RETURN TO FOUNDER VIEW
      </button>
    </div>
  );
}
