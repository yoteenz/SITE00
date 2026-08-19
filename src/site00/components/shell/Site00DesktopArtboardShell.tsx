import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT,
  SITE00_DESKTOP_ARTBOARD_WIDTH,
} from '../../config/desktop-artboard';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00EnterArtboardViewportBackground } from '../enter00/Site00EnterArtboardViewportBackground';
import { Site00DesktopArtboardProvider } from './Site00DesktopArtboardContext';
import { Site00EnterArtboardChromeProvider } from './Site00EnterArtboardChromeContext';
import '../../styles/site00-desktop-artboard.css';

type Site00DesktopArtboardShellProps = {
  children: ReactNode;
};

/**
 * Fixed-width SITE 00 desktop artboard scaled to device width.
 * Used by `/origin/desktop` so phone preview always shows the approved desktop composition.
 */
export function Site00DesktopArtboardShell({ children }: Site00DesktopArtboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const enterChromeHostRef = useRef<HTMLDivElement>(null);
  const [enterActive, setEnterActive] = useState(false);

  useLayoutEffect(
    () => installDesktopPreviewShellViewportLock({ background: '#f7f7f5' }),
    [],
  );

  useLayoutEffect(() => {
    const layoutStage = () => {
      const shell = shellRef.current;
      const scaler = scalerRef.current;
      const stage = stageRef.current;
      if (!shell || !scaler || !stage) return;

      const isEnterPage =
        stage.querySelector('.site00-enter-page') != null ||
        (typeof window !== 'undefined' && window.location.pathname === '/enter');
      const isOriginPage =
        stage.querySelector('.site00-origin-page') != null ||
        (typeof window !== 'undefined' &&
          (window.location.pathname === '/origin' ||
            window.location.pathname === '/' ||
            window.location.pathname === '/origin/desktop'));
      const isViewportLockedPage = isEnterPage || isOriginPage;
      const scaleW = shell.clientWidth / SITE00_DESKTOP_ARTBOARD_WIDTH;
      const scaleH = shell.clientHeight / SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT;
      // ENTER 00 — fill viewport width; crop vertically inside artboard (no side letterboxing).
      // Origin/other routes — fit artboard in viewport so bottom status strip stays visible.
      const scale = isEnterPage ? scaleW : Math.min(scaleW, scaleH);
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
      scaler.style.marginLeft = isEnterPage ? '0' : `${Math.max(0, (shell.clientWidth - scaledWidth) / 2)}px`;
      // ENTER — top-aligned artboard preserves welcome/directory placement on the bg comp
      scaler.style.marginTop = isEnterPage ? '0' : `${Math.max(0, (shell.clientHeight - scaledHeight) / 2)}px`;

      shell.classList.toggle('site00-desktop-artboard-shell--enter', isEnterPage);
      shell.classList.toggle('site00-desktop-artboard-shell--origin', isOriginPage);

      setEnterActive((prev) => (prev === isEnterPage ? prev : isEnterPage));
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
    <Site00DesktopArtboardProvider>
      <Site00EnterArtboardChromeProvider hostRef={enterChromeHostRef}>
        <div ref={shellRef} className="site00-desktop-artboard-shell">
          {enterActive ? <Site00EnterArtboardViewportBackground /> : null}
          <div ref={scalerRef} className="site00-desktop-artboard-shell__stage-scaler">
            <div ref={stageRef} className="site00-desktop-artboard">
              {children}
            </div>
          </div>
          <div ref={enterChromeHostRef} className="site00-desktop-artboard-shell__enter-chrome" />
        </div>
      </Site00EnterArtboardChromeProvider>
    </Site00DesktopArtboardProvider>
  );
}
