import { Link } from 'react-router-dom';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';
import { useSite00ProjectsIndex } from '../../hooks/useSite00Projects';
import { SITE00_ROUTES } from '../../config/routes';

export function ProjectIndexViewStrip() {
  const { viewMode, canToggle, toggleViewAsClient } = useProjectViewMode();
  const { clientProjects } = useSite00ProjectsIndex();
  if (!canToggle) return null;

  const founderActive = viewMode === 'FOUNDER';

  const enterClientView = () => {
    const primaryClient = clientProjects?.[0] ?? null;
    toggleViewAsClient({ clientProjectSlug: primaryClient?.slug ?? null });
  };

  const enterFounderView = () => {
    toggleViewAsClient();
  };

  return (
    <div className="site00-pidx-view-strip" role="group" aria-label="VIEW MODE">
      <button
        type="button"
        className={`site00-pidx-view-strip__segment site00-pidx-view-strip__segment--founder${founderActive ? ' is-active' : ''}`}
        onClick={() => !founderActive && enterFounderView()}
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
        className={`site00-pidx-view-strip__segment site00-pidx-view-strip__segment--client${!founderActive ? ' is-active' : ''}`}
        onClick={() => founderActive && enterClientView()}
        aria-pressed={!founderActive}
      >
        <span className="site00-pidx-view-strip__icon site00-pidx-view-strip__icon--client" aria-hidden="true" />
        <span className="site00-pidx-view-strip__text">
          <span className="site00-pidx-view-strip__label">CLIENT VIEW</span>
          <span className="site00-pidx-view-strip__access">LIMITED ACCESS</span>
        </span>
      </button>

      <Link to={SITE00_ROUTES.adminDashboard} className="site00-pidx-view-strip__admin">
        ADMIN CONTROL CENTER →
      </Link>
    </div>
  );
}
