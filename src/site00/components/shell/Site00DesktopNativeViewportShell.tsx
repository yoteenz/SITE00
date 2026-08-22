import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
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
          {children}
        </div>
      </Site00DesktopArtboardProvider>
    </Site00DesktopPresentationProvider>
  );
}
