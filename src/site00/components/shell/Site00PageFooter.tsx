import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

export function Site00PageFooter() {
  return (
    <footer className="site00-page-footer">
      <p className="site00-page-footer__copy">© SITE 00™ — CONTROL EVERYTHING.</p>
      <nav className="site00-page-footer__links" aria-label="Legal">
        <Link to="/brand/privacy">PRIVACY</Link>
        <Link to="/brand/terms">TERMS</Link>
        <Link to={SITE00_ROUTES.support}>SUPPORT</Link>
      </nav>
    </footer>
  );
}
