import { Link } from 'react-router-dom';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';
import { ClientSimulationSelector } from './ClientSimulationSelector';
import { SITE00_ROUTES } from '../../config/routes';

export function ProjectIndexViewStrip() {
  const {
    viewMode,
    canToggle,
    enterClientView,
    returnToFounderView,
    openClientSelector,
    activeSimulatedClientId,
  } = useProjectViewMode();

  if (!canToggle) return null;

  const founderActive = viewMode === 'FOUNDER';
  const clientActive = !founderActive;

  const onClientSegmentClick = () => {
    if (founderActive) {
      enterClientView();
      return;
    }
    openClientSelector();
  };

  return (
    <div className="site00-pidx-view-strip-wrap">
      <div className="site00-pidx-view-strip" role="group" aria-label="VIEW MODE" data-dynamic-region="toggle-active-state">
        <button
          type="button"
          className={`site00-pidx-view-strip__segment site00-pidx-view-strip__segment--founder${founderActive ? ' is-active' : ''}`}
          onClick={() => !founderActive && returnToFounderView()}
          aria-pressed={founderActive}
        >
          <span className="site00-pidx-view-strip__icon site00-pidx-view-strip__icon--founder" aria-hidden="true" />
          <span className="site00-pidx-view-strip__text">
            <span className="site00-pidx-view-strip__label">FOUNDER VIEW</span>
            <span className="site00-pidx-view-strip__access">FULL ACCESS</span>
          </span>
        </button>

        <button
          type="button"
          className={`site00-pidx-view-strip__segment site00-pidx-view-strip__segment--client${clientActive ? ' is-active' : ''}`}
          onClick={onClientSegmentClick}
          aria-pressed={clientActive}
          aria-expanded={clientActive}
          aria-haspopup="dialog"
        >
          <span className="site00-pidx-view-strip__icon site00-pidx-view-strip__icon--client" aria-hidden="true" />
          <span className="site00-pidx-view-strip__text">
            <span className="site00-pidx-view-strip__label">
              CLIENT VIEW
              <span className="site00-pidx-view-strip__chevron" aria-hidden="true">
                ▾
              </span>
            </span>
            <span className="site00-pidx-view-strip__access">
              {activeSimulatedClientId ? 'CLIENT CONTEXT ACTIVE' : 'SELECT CLIENT'}
            </span>
          </span>
        </button>

        <Link to={SITE00_ROUTES.adminDashboard} className="site00-pidx-view-strip__admin">
          ADMIN CONTROL CENTER →
        </Link>
      </div>

      <ClientSimulationSelector />
    </div>
  );
}
