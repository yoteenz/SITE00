import { Link } from 'react-router-dom';
import { useExperienceContext } from '../../state/experienceContext';

type ExperienceContextBarProps = {
  variant: 'client' | 'admin';
};

export function ExperienceContextBar({ variant }: ExperienceContextBarProps) {
  const {
    isDualContextUser,
    clientQaMode,
    setClientQaMode,
    adminDashboardHref,
    clientExperienceHref,
  } = useExperienceContext();

  if (!isDualContextUser) return null;

  if (variant === 'client') {
    return (
      <div className="site00-experience-context" role="region" aria-label="Experience context">
        <div className="site00-experience-context__inner">
          <span className="site00-experience-context__label">VIEWING AS · PROJECT OWNER</span>
          <div className="site00-experience-context__actions">
            <button
              type="button"
              className={`site00-experience-context__qa ${clientQaMode ? 'site00-experience-context__qa--active' : ''}`.trim()}
              onClick={() => setClientQaMode(!clientQaMode)}
              aria-pressed={clientQaMode}
            >
              {clientQaMode ? 'CLIENT QA · ON' : 'CLIENT QA · OFF'}
            </button>
            <Link to={adminDashboardHref} className="site00-experience-context__link">
              ADMIN CONTROL CENTER →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site00-experience-context site00-experience-context--admin" role="region" aria-label="Experience context">
      <div className="site00-experience-context__inner">
        <span className="site00-experience-context__label">ADMIN CONTROL CENTER</span>
        <Link to={clientExperienceHref} className="site00-experience-context__link">
          OPEN CLIENT EXPERIENCE →
        </Link>
      </div>
    </div>
  );
}
