import { Link } from 'react-router-dom';
import type { RefObject } from 'react';
import { SITE00_ROUTES } from '../../config/routes';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';

type PublicTechnicalHeaderProps = {
  /** technical: `SITE 00 ◆ ———` + scan control. wordmark: `00` mark + links + SIGN IN (Origin / panel family). */
  variant?: 'technical' | 'wordmark' | 'directory';
  onFastTravelOpen: () => void;
  fastTravelExpanded?: boolean;
  fastTravelTriggerRef?: RefObject<HTMLButtonElement>;
};

/** Live-SVG scan control — same behavior as the fast-travel trigger, no remote image dependency. */
function ScanTrigger({
  onOpen,
  expanded,
  buttonRef,
}: {
  onOpen: () => void;
  expanded: boolean;
  buttonRef?: RefObject<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="s00pr-scan"
      aria-label="OPEN FAST TRAVEL"
      aria-expanded={expanded}
      aria-controls="site00-fast-travel-panel"
      onClick={onOpen}
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
        <path d="M3 11V3h8M29 11V3h-8M3 21v8h8M29 21v8h-8" />
        <circle cx="16" cy="16" r="1.8" fill="#e8192c" stroke="none" />
      </svg>
    </button>
  );
}

/** Primary destinations that exist today. CHARACTERS / WORLDS / LIBRARY from the authority art have no route. */
const WORDMARK_LINKS: { label: string; href: string }[] = [
  { label: 'EXPLORE', href: SITE00_ROUTES.locations },
  { label: 'BUILD', href: SITE00_ROUTES.bldrState },
  { label: 'EVOLVE', href: SITE00_ROUTES.evolveState },
  { label: 'ABOUT', href: SITE00_ROUTES.about },
];

export function PublicTechnicalHeader({
  variant = 'technical',
  onFastTravelOpen,
  fastTravelExpanded = false,
  fastTravelTriggerRef,
}: PublicTechnicalHeaderProps) {
  const [isSignedIn] = useSignedInFromStorage();

  if (variant === 'wordmark') {
    return (
      <header className="s00pr-header s00pr-header--wordmark">
        <Link to={SITE00_ROUTES.originAlias} className="s00pr-header__mark" aria-label="SITE 00 ORIGIN">
          00
        </Link>
        <nav className="s00pr-header__links" aria-label="PRIMARY">
          {WORDMARK_LINKS.map((link) => (
            <Link key={link.label} to={link.href} className="s00pr-header__link">
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="s00pr-header__divider" aria-hidden="true" />
        <ScanTrigger onOpen={onFastTravelOpen} expanded={fastTravelExpanded} buttonRef={fastTravelTriggerRef} />
        <Link
          to={isSignedIn ? SITE00_ROUTES.control : SITE00_ROUTES.signIn}
          className="s00pr-header__signin"
        >
          {isSignedIn ? 'CTRL ROOM' : 'SIGN IN'}
        </Link>
      </header>
    );
  }

  if (variant === 'directory') {
    return (
      <header className="s00pr-header s00pr-header--directory">
        <Link to={SITE00_ROUTES.originAlias} className="s00pr-header__wordmark" aria-label="SITE 00 ORIGIN">
          SITE 00
          <span className="s00pr-header__diamond" aria-hidden="true" />
        </Link>
        <Link to={SITE00_ROUTES.originAlias} className="s00pr-header__exit" aria-label="EXIT DIRECTORY AND RETURN TO ORIGIN">
          EXIT 00
        </Link>
      </header>
    );
  }

  return (
    <header className="s00pr-header s00pr-header--technical">
      <Link to={SITE00_ROUTES.originAlias} className="s00pr-header__wordmark" aria-label="SITE 00 ORIGIN">
        SITE 00
        <span className="s00pr-header__diamond" aria-hidden="true" />
      </Link>
      <span className="s00pr-header__rule" aria-hidden="true" />
      <ScanTrigger onOpen={onFastTravelOpen} expanded={fastTravelExpanded} buttonRef={fastTravelTriggerRef} />
    </header>
  );
}
