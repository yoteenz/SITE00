import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

/** EXIT 00 — closes the directory and returns to Origin (not another menu). */
export function DirectoryExitButton() {
  return (
    <Link
      to={SITE00_ROUTES.originAlias}
      className="site00-directory-exit"
      aria-label="Exit Directory and return to Origin"
    >
      <span className="site00-directory-exit__label">EXIT 00</span>
      <span className="site00-directory-exit__icon" aria-hidden="true">
        ×
      </span>
    </Link>
  );
}
