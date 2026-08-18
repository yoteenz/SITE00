import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT,
  SITE00_DESKTOP_ARTBOARD_WIDTH,
} from '../../config/desktop-artboard';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00DesktopArtboardProvider } from './Site00DesktopArtboardContext';
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
      const scaleW = shell.clientWidth / SITE00_DESKTOP_ARTBOARD_WIDTH;
      const scaleH = shell.clientHeight / SITE00_DESKTOP_ARTBOARD_MIN_HEIGHT;
      const scale = isEnterPage ? Math.min(scaleW, scaleH) : scaleW;
      const scaledWidth = SITE00_DESKTOP_ARTBOARD_WIDTH * scale;
      const viewportArtboardHeight = isEnterPage
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

      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${contentHeight * scale}px`;
      scaler.style.marginLeft = isEnterPage ? `${Math.max(0, (shell.clientWidth - scaledWidth) / 2)}px` : '0';
      scaler.style.marginTop = isEnterPage ? `${Math.max(0, (shell.clientHeight - contentHeight * scale) / 2)}px` : '0';

      if (isEnterPage) {
        shell.classList.add('site00-desktop-artboard-shell--enter');
      } else {
        shell.classList.remove('site00-desktop-artboard-shell--enter');
      }
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
      <div ref={shellRef} className="site00-desktop-artboard-shell">
        <div ref={scalerRef} style={{ position: 'relative' }}>
          <div ref={stageRef} className="site00-desktop-artboard">
            {children}
          </div>
        </div>
      </div>
    </Site00DesktopArtboardProvider>
  );
}
