import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { Site00Diamond } from './Site00Diamond';
import type { Site00DiamondMode } from './Site00Diamond';

type Site00LogoBlockProps = {
  locationLabel?: string;
  showBracket?: boolean;
  /** HOST_DEFAULT on global/account surfaces; PROJECT_CONTEXT inside active project workspace. */
  diamondMode?: Site00DiamondMode;
  projectSlug?: string | null;
};

export function Site00LogoBlock({
  locationLabel,
  showBracket = true,
  diamondMode = 'PROJECT_CONTEXT',
  projectSlug,
}: Site00LogoBlockProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          to={SITE00_ROUTES.originAlias}
          className="site00-logo-mark site00-logo-mark-link"
          aria-label="RETURN TO SITE 00 ORIGIN"
        >
          SITE 00
        </Link>
        <Site00Diamond mode={diamondMode} projectSlug={projectSlug} />
      </div>
      {locationLabel && showBracket ? (
        <div className="site00-bracket-label" style={{ marginTop: 8 }}>
          {locationLabel}
        </div>
      ) : null}
    </div>
  );
}
