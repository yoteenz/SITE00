import { useEffect, useRef, type RefObject } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  isSite00CtrlRoomActive,
  isSite00MobileDirectoryItemActive,
  SITE00_CTRL_ROOM_PATH,
  SITE00_MOBILE_DIRECTORY_PRIMARY,
} from '../../config/mobile-directory-nav';
import { site00MobileBuildNavHref, SITE00_ROUTES, site00MobileEvolveNavHref } from '../../config/routes';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { trackActivity } from '../../../utils/activity';

type Site00MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement>;
};

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/** Global SITE 00 mobile navigation — opened from header hamburger. */
export function Site00MobileMenuDrawer({ open, onClose, returnFocusRef }: Site00MobileMenuDrawerProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSignedIn] = useSignedInFromStorage();
  const drawerRef = useRef<HTMLElement>(null);
  const bldrHref = site00MobileBuildNavHref(pathname);
  const evolveHref = site00MobileEvolveNavHref(pathname);
  const ctrlRoomHref = isSignedIn
    ? SITE00_CTRL_ROOM_PATH
    : site00SignInHrefWithReturnTo({ pathname: SITE00_CTRL_ROOM_PATH, search: '' });

  const onLogout = async () => {
    onClose();
    trackActivity('sign_out');
    await signOutAppAndSupabaseSession();
    navigate(SITE00_ROUTES.originAlias, { replace: true });
  };

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusables = focusableElements(drawer);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    drawer.addEventListener('keydown', onKeyDown);
    return () => drawer.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open || !returnFocusRef?.current) return;
    returnFocusRef.current.focus();
  }, [open, returnFocusRef]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="site00-mobile-menu__backdrop" aria-label="Close menu" onClick={onClose} />
      <aside
        ref={drawerRef}
        id="site00-mobile-menu"
        className="site00-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="SITE 00 navigation"
      >
        <div className="site00-mobile-menu__header">
          <span className="site00-label">SITE 00</span>
          <button type="button" className="site00-mobile-menu__close" onClick={onClose} aria-label="Close menu">
            ×
          </button>
        </div>
        <nav aria-label="Global SITE 00 links">
          <ul className="site00-mobile-menu__list">
            {SITE00_MOBILE_DIRECTORY_PRIMARY.map((item) => {
              const href =
                item.id === 'bldr' ? bldrHref : item.id === 'evolve' ? evolveHref : item.href;
              const active = isSite00MobileDirectoryItemActive(pathname, item);

              if (!item.enabled) {
                return (
                  <li key={item.id}>
                    <span className="site00-mobile-menu__disabled">{item.label}</span>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Link
                    to={href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    aria-label={item.ariaLabel}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="site00-mobile-menu__utility">
            <Link
              to={ctrlRoomHref}
              onClick={onClose}
              className="site00-mobile-menu__ctrl-room"
              aria-current={isSite00CtrlRoomActive(pathname) ? 'page' : undefined}
            >
              <span className="site00-mobile-menu__ctrl-room-label">CTRL ROOM</span>
              <span className="site00-mobile-menu__ctrl-room-state" aria-hidden="true">
                {isSignedIn ? 'ENTER →' : 'LOG IN →'}
              </span>
            </Link>
            {isSignedIn ? (
              <button type="button" className="site00-mobile-menu__logout" onClick={() => void onLogout()}>
                LOG OUT
              </button>
            ) : null}
          </div>
        </nav>
      </aside>
    </>
  );
}
