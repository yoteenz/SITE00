import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

export function ProjectIndexNewProjectCard() {
  return (
    <li className="site00-pidx-new-card">
      <Link to={SITE00_ROUTES.bldrState} className="site00-pidx-new-card__link">
        <div className="site00-pidx-new-card__visual" aria-hidden="true">
          <span className="site00-pidx-new-card__plus">+</span>
        </div>
        <h3 className="site00-pidx-new-card__name">NEW PROJECT</h3>
        <p className="site00-pidx-new-card__tagline">ANOTHER IDEA.</p>
        <p className="site00-pidx-new-card__tagline">ANOTHER WORLD.</p>
        <p className="site00-pidx-new-card__tagline">LET&apos;S BUILD.</p>
        <span className="site00-pidx-new-card__cta">CREATE PROJECT →</span>
      </Link>
    </li>
  );
}
