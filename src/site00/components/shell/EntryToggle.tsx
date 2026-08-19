import { Link, useLocation } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { Site00FastTravelIcon } from '../fast-travel/Site00FastTravelIcon';

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
        <Site00FastTravelIcon className="site00-entry-toggle__icon" size={16} />
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
      <Site00FastTravelIcon className="site00-entry-toggle__icon" size={16} />
    </Link>
  );
}
