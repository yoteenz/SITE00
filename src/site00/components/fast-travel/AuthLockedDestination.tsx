import { Link } from 'react-router-dom';
import { hasFastTravelDestinationArt } from '../../config/fast-travel-assets';
import { site00AuthLockedAriaLabel } from '../../config/site00-copy';
import { SITE00_FAST_TRAVEL_ARROW_SIZE } from '../../config/fast-travel';
import { Site00DirectoryArrowIcon, Site00LockIcon } from '../mobile/Site00MobileIcons';
import { FastTravelDestinationArt } from './FastTravelDestinationArt';
import { FastTravelUpNextCardChrome } from './FastTravelUpNextCardChrome';

type AuthLockedDestinationProps = {
  href: string;
  label: string;
  description?: string;
  onNavigate?: () => void;
  showArrow?: boolean;
  /** When set on primary UP NEXT cards, show approved destination artwork above copy. */
  destinationId?: string;
  /** Visible position within the current UP NEXT set — enables card shell chrome. */
  upNextCardIndex?: number;
};

/** Signed-out treatment for auth-gated Fast Travel / Directory destinations. */
export function AuthLockedDestination({
  href,
  label,
  description,
  onNavigate,
  showArrow = false,
  destinationId,
  upNextCardIndex,
}: AuthLockedDestinationProps) {
  const showArt = Boolean(destinationId && hasFastTravelDestinationArt(destinationId));
  const isUpNext = upNextCardIndex !== undefined;

  return (
    <Link
      to={href}
      className={`site00-fast-travel__dest site00-fast-travel__dest--locked ${showArrow ? 'site00-fast-travel__dest--list' : ''}${isUpNext ? ' site00-fast-travel__dest--up-next site00-fast-travel__dest--primary' : ''}${showArt ? ' site00-fast-travel__dest--has-art site00-fast-travel__dest--has-mark' : ''}`.trim()}
      onClick={onNavigate}
      aria-label={site00AuthLockedAriaLabel(label)}
    >
      {isUpNext ? <FastTravelUpNextCardChrome cardIndex={upNextCardIndex} /> : null}
      {showArt && destinationId ? <FastTravelDestinationArt destinationId={destinationId} /> : null}
      <span className="site00-fast-travel__dest-copy">
        <span className="site00-fast-travel__dest-label">{label}</span>
        {description ? <span className="site00-fast-travel__dest-desc">{description}</span> : null}
        <span className="site00-fast-travel__dest-auth">
          <Site00LockIcon size={12} />
          <span className="site00-fast-travel__dest-auth-label">SIGN IN TO ENTER</span>
        </span>
      </span>
      {showArrow ? (
        <span className="site00-fast-travel__dest-arrow" aria-hidden="true">
          <Site00DirectoryArrowIcon size={SITE00_FAST_TRAVEL_ARROW_SIZE} className="site00-fast-travel__dest-arrow-svg" />
        </span>
      ) : null}
    </Link>
  );
}
