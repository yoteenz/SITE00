import { useEffect, useRef, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveFastTravel, type FastTravelContext } from '../../config/fast-travel';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { CurrentLocationCard } from './CurrentLocationCard';
import { FastTravelSection } from './FastTravelSection';

type FastTravelPanelProps = {
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

/** Contextual mobile navigation overlay — selective shortcuts from the active route. */
export function FastTravelPanel({ open, onClose, returnFocusRef }: FastTravelPanelProps) {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const panelRef = useRef<HTMLElement>(null);
  const pushedHistoryRef = useRef(false);

  const ctx: FastTravelContext = { pathname, isSignedIn };
  const { location, sections } = resolveFastTravel(pathname, isSignedIn);

  const closePanel = () => {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
      return;
    }
    onClose();
  };

  const navigateAndClose = () => {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      // Drop the overlay history entry without navigating away from the Link target.
      if (window.history.state?.site00Overlay === 'fast-travel') {
        window.history.replaceState(null, '');
      }
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('site00-fast-travel-open');
    window.history.pushState({ site00Overlay: 'fast-travel' }, '');
    pushedHistoryRef.current = true;

    const onPopState = () => {
      pushedHistoryRef.current = false;
      onClose();
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      document.body.classList.remove('site00-fast-travel-open');
      window.removeEventListener('popstate', onPopState);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = focusableElements(panel);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
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

    panel.addEventListener('keydown', onKeyDown);
    return () => panel.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open || !returnFocusRef?.current) return;
    returnFocusRef.current.focus();
  }, [open, returnFocusRef]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="site00-fast-travel__backdrop" aria-label="Close Fast Travel" onClick={closePanel} />
      <aside
        ref={panelRef}
        id="site00-fast-travel-panel"
        className="site00-fast-travel"
        role="dialog"
        aria-modal="true"
        aria-label="Fast Travel"
      >
        <header className="site00-fast-travel__header">
          <div className="site00-fast-travel__brand">
            <span className="site00-fast-travel__brand-mark">SITE 00</span>
            <span className="site00-diamond" aria-hidden="true" />
          </div>
          <button type="button" className="site00-fast-travel__close" onClick={closePanel} aria-label="Close Fast Travel">
            ×
          </button>
        </header>

        <div className="site00-fast-travel__hero">
          <h2 className="site00-fast-travel__title">FAST TRAVEL</h2>
          <p className="site00-fast-travel__subtitle">
            GET THERE.
            <br />
            FASTER.
          </p>
        </div>

        <CurrentLocationCard location={location} />

        <nav className="site00-fast-travel__nav" aria-label="Fast Travel destinations">
          {sections.map((section) => (
            <FastTravelSection key={section.id} section={section} ctx={ctx} onNavigate={navigateAndClose} />
          ))}
        </nav>
      </aside>
    </>
  );
}
