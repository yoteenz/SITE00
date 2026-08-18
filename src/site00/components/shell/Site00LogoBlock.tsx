import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

type Site00LogoBlockProps = {
  locationLabel?: string;
  showBracket?: boolean;
};

export function Site00LogoBlock({ locationLabel, showBracket = true }: Site00LogoBlockProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          to={SITE00_ROUTES.originAlias}
          className="site00-logo-mark site00-logo-mark-link"
          aria-label="Return to SITE 00 Origin"
        >
          SITE 00
        </Link>
        <span className="site00-diamond" aria-hidden="true" />
      </div>
      {locationLabel && showBracket ? (
        <div className="site00-bracket-label" style={{ marginTop: 8 }}>
          {locationLabel}
        </div>
      ) : null}
    </div>
  );
}
