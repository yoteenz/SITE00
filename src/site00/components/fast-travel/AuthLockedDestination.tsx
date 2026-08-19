import { Link } from 'react-router-dom';
import { site00AuthLockedAriaLabel } from '../../config/site00-copy';
import { Site00LockIcon } from '../mobile/Site00MobileIcons';

type AuthLockedDestinationProps = {
  href: string;
  label: string;
  description?: string;
  onNavigate?: () => void;
};

/** Signed-out treatment for auth-gated Fast Travel / Directory destinations. */
export function AuthLockedDestination({ href, label, description, onNavigate }: AuthLockedDestinationProps) {
  return (
    <Link
      to={href}
      className="site00-fast-travel__dest site00-fast-travel__dest--locked"
      onClick={onNavigate}
      aria-label={site00AuthLockedAriaLabel(label)}
    >
      <span className="site00-fast-travel__dest-copy">
        <span className="site00-fast-travel__dest-label">{label}</span>
        {description ? <span className="site00-fast-travel__dest-desc">{description}</span> : null}
        <span className="site00-fast-travel__dest-auth">
          <Site00LockIcon size={12} />
          <span className="site00-fast-travel__dest-auth-label">SIGN IN TO ENTER</span>
        </span>
      </span>
    </Link>
  );
}
