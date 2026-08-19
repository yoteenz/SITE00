import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT,
  SITE00_DESKTOP_ARTBOARD_WIDTH,
} from '../../config/desktop-artboard';
import type { EnvironmentId } from '../../config/environments';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00EnvironmentViewportBackground } from '../environment/Site00EnvironmentViewportBackground';
import { detectSite00ViewportEnvironment } from '../environment/detectSite00ViewportEnvironment';
import { Site00DesktopArtboardProvider } from './Site00DesktopArtboardContext';
import { Site00EnterArtboardChromeProvider } from './Site00EnterArtboardChromeContext';
import { Site00DesktopPresentationProvider } from './Site00DesktopPresentationContext';
import '../../styles/site00-desktop-artboard.css';

type Site00DesktopArtboardShellProps = {
  children: ReactNode;
};

/**
 * Fixed-width SITE 00 desktop artboard scaled to device width.
 * Environment pages: viewport cover bg inside scaled stage (bg + UI scale together).
 */
export function Site00DesktopArtboardShell({ children }: Site00DesktopArtboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const enterChromeHostRef = useRef<HTMLDivElement>(null);
  const [viewportEnvironmentId, setViewportEnvironmentId] = useState<EnvironmentId | null>(null);

  useLayoutEffect(
    () => installDesktopPreviewShellViewportLock({ background: '#f5f5f3' }),
    [],
  );

  useLayoutEffect(() => {
    const layoutStage = () => {
      const shell = shellRef.current;
      const scaler = scalerRef.current;
      const stage = stageRef.current;
      if (!shell || !scaler || !stage) return;

      const enterPage =
        stage.querySelector('.site00-enter-page') != null ||
        (typeof window !== 'undefined' && window.location.pathname === '/enter');
      const originPage =
        stage.querySelector('.site00-origin-page') != null ||
        (typeof window !== 'undefined' &&
          (window.location.pathname === '/origin' ||
            window.location.pathname === '/' ||
            window.location.pathname === '/origin/desktop'));
      const isViewportLockedPage = enterPage || originPage;
      const scaleW = shell.clientWidth / SITE00_DESKTOP_ARTBOARD_WIDTH;
      const scale = scaleW;
      const scaledWidth = SITE00_DESKTOP_ARTBOARD_WIDTH * scale;
      const viewportArtboardHeight = isViewportLockedPage
        ? SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT
        : Math.max(
            SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT,
            Math.ceil(shell.clientHeight / Math.max(scale, 0.01)),
          );
      const contentHeight = viewportArtboardHeight;

      stage.style.width = `${SITE00_DESKTOP_ARTBOARD_WIDTH}px`;
      stage.style.height = `${contentHeight}px`;
      stage.style.minHeight = `${contentHeight}px`;
      stage.style.setProperty('--site00-desktop-artboard-height', `${SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT}px`);
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      const scaledHeight = contentHeight * scale;
      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${scaledHeight}px`;
      scaler.style.marginLeft = '0';
      scaler.style.marginTop = '0';

      shell.classList.toggle('site00-desktop-artboard-shell--enter', enterPage);
      shell.classList.toggle('site00-desktop-artboard-shell--origin', originPage);

      const envId = detectSite00ViewportEnvironment(stage);
      setViewportEnvironmentId((prev) => (prev === envId ? prev : envId));
    };

    layoutStage();

    const onOrientation = () => {
      window.setTimeout(layoutStage, 150);
    };
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', layoutStage);

    const shellEl = shellRef.current;
    const stageEl = stageRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => layoutStage())
        : undefined;
    if (shellEl) resizeObserver?.observe(shellEl);
    if (stageEl) resizeObserver?.observe(stageEl);

    const mutationObserver =
      typeof MutationObserver !== 'undefined' && stageEl
        ? new MutationObserver(() => layoutStage())
        : undefined;
    if (stageEl) {
      mutationObserver?.observe(stageEl, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', layoutStage);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  return (
    <Site00DesktopPresentationProvider kind="scaled">
      <Site00DesktopArtboardProvider>
        <Site00EnterArtboardChromeProvider hostRef={enterChromeHostRef}>
          <div ref={shellRef} className="site00-desktop-artboard-shell">
            <div ref={scalerRef} className="site00-desktop-artboard-shell__stage-scaler">
              <div ref={stageRef} className="site00-desktop-artboard">
                {viewportEnvironmentId ? (
                  <Site00EnvironmentViewportBackground environmentId={viewportEnvironmentId} />
                ) : null}
                {children}
              </div>
            </div>
            <div ref={enterChromeHostRef} className="site00-desktop-artboard-shell__enter-chrome" />
          </div>
        </Site00EnterArtboardChromeProvider>
      </Site00DesktopArtboardProvider>
    </Site00DesktopPresentationProvider>
  );
}
