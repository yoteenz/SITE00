import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { SITE00_ROUTES } from '../../config/routes';
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
  const { pathname } = useLocation();
  const enterPageActive = pathname === SITE00_ROUTES.enter;

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
