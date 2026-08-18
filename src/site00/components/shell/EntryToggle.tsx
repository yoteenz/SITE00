import { Link, useLocation } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

type EntryToggleProps = {
  className?: string;
};

/** ENTER 00 on origin routes; EXIT 00 on /enter */
export function EntryToggle({ className }: EntryToggleProps) {
  const { pathname } = useLocation();
  const isEnterRoute = pathname === SITE00_ROUTES.enter;

  if (isEnterRoute) {
    return (
      <Link
        to={SITE00_ROUTES.originAlias}
        className={`site00-btn-ghost ${className ?? ''}`.trim()}
        aria-label="Exit SITE 00 interior"
      >
        EXIT 00
        <CrosshairIcon />
      </Link>
    );
  }

  return (
    <Link
      to={SITE00_ROUTES.enter}
      className={`site00-btn-ghost ${className ?? ''}`.trim()}
      aria-label="Enter SITE 00 interior directory"
    >
      ENTER 00
      <CrosshairIcon />
    </Link>
  );
}

function CrosshairIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="var(--site-red)" strokeWidth="1" />
      <circle cx="7" cy="7" r="1.5" fill="var(--site-red)" />
      <line x1="7" y1="0" x2="7" y2="3" stroke="var(--site-red)" strokeWidth="1" />
      <line x1="7" y1="11" x2="7" y2="14" stroke="var(--site-red)" strokeWidth="1" />
      <line x1="0" y1="7" x2="3" y2="7" stroke="var(--site-red)" strokeWidth="1" />
      <line x1="11" y1="7" x2="14" y2="7" stroke="var(--site-red)" strokeWidth="1" />
    </svg>
  );
}
