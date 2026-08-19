import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00EnvironmentViewportBackground } from '../environment/Site00EnvironmentViewportBackground';
import { Site00DesktopArtboardProvider } from './Site00DesktopArtboardContext';
import { Site00DesktopPresentationProvider } from './Site00DesktopPresentationContext';
import '../../styles/site00-desktop-artboard.css';

type Site00DesktopNativeViewportShellProps = {
  children: ReactNode;
};

/**
 * Full-viewport desktop presentation on laptop/tablet — reuses `.site00-desktop-artboard`
 * composition rules without the scaled 1440×900 preview shell.
 */
export function Site00DesktopNativeViewportShell({ children }: Site00DesktopNativeViewportShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [enterPageActive, setEnterPageActive] = useState(false);

  useLayoutEffect(
    () => installDesktopPreviewShellViewportLock({ background: '#f5f5f3' }),
    [],
  );

  useLayoutEffect(() => {
    const syncViewportHeight = () => {
      const root = rootRef.current;
      if (!root) return;
      const heightPx = Math.round(window.innerHeight);
      root.style.setProperty('--site00-desktop-artboard-height', `${heightPx}px`);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', syncViewportHeight);

    return () => {
      window.removeEventListener('resize', syncViewportHeight);
      window.removeEventListener('orientationchange', syncViewportHeight);
    };
  }, []);

  useLayoutEffect(() => {
    const syncEnterPage = () => {
      const root = rootRef.current;
      const active =
        root?.querySelector('.site00-enter-page') != null ||
        (typeof window !== 'undefined' && window.location.pathname === '/enter');
      setEnterPageActive((prev) => (prev === active ? prev : active));
    };

    syncEnterPage();

    const root = rootRef.current;
    const mutationObserver =
      typeof MutationObserver !== 'undefined' && root
        ? new MutationObserver(syncEnterPage)
        : undefined;
    if (root) {
      mutationObserver?.observe(root, { childList: true, subtree: true });
    }

    return () => mutationObserver?.disconnect();
  }, []);

  return (
    <Site00DesktopPresentationProvider kind="native">
      <Site00DesktopArtboardProvider>
        <div ref={rootRef} className="site00-desktop-artboard site00-desktop-artboard--native-viewport">
          {enterPageActive ? (
            <Site00EnvironmentViewportBackground environmentId="ENTER_00_WAITING_ROOM" />
          ) : null}
          {children}
        </div>
      </Site00DesktopArtboardProvider>
    </Site00DesktopPresentationProvider>
  );
}
