import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  SITE00_MOBILE_ARTBOARD_HEIGHT,
  SITE00_MOBILE_ARTBOARD_WIDTH,
} from '../../config/mobile-artboard';
import type { EnvironmentId } from '../../config/environments';
import { installDesktopPreviewShellViewportLock } from '../../../utils/desktopPreview';
import { Site00EnvironmentViewportBackground } from '../environment/Site00EnvironmentViewportBackground';
import { detectSite00ViewportEnvironment } from '../environment/detectSite00ViewportEnvironment';
import { Site00MobileArtboardProvider } from './Site00MobileArtboardContext';
import { Site00MobilePresentationProvider } from './Site00MobilePresentationContext';
import '../../styles/site00-mobile-artboard.css';

type Site00MobileArtboardShellProps = {
  children: ReactNode;
};

/**
 * Fixed 390×844 mobile artboard scaled to laptop width — true phone preview on Desktop composer.
 * Environment bg inside scaled stage so phone/laptop preview matches artboard (not full-viewport bleed).
 */
export function Site00MobileArtboardShell({ children }: Site00MobileArtboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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

      const scaleW = shell.clientWidth / SITE00_MOBILE_ARTBOARD_WIDTH;
      const scale = scaleW;
      const scaledWidth = SITE00_MOBILE_ARTBOARD_WIDTH * scale;
      const contentHeight = SITE00_MOBILE_ARTBOARD_HEIGHT;

      stage.style.width = `${SITE00_MOBILE_ARTBOARD_WIDTH}px`;
      stage.style.height = `${contentHeight}px`;
      stage.style.minHeight = `${contentHeight}px`;
      stage.style.setProperty('--site00-mobile-artboard-height', `${contentHeight}px`);
      stage.style.transformOrigin = 'top left';
      stage.style.transform = `scale(${scale})`;

      const scaledHeight = contentHeight * scale;
      scaler.style.width = `${scaledWidth}px`;
      scaler.style.height = `${scaledHeight}px`;
      scaler.style.marginLeft = '0';
      scaler.style.marginTop = '0';

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
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layoutStage()) : undefined;
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

  const viewportAssetKind =
    viewportEnvironmentId === 'ORIGIN_ENVIRONMENT' || viewportEnvironmentId === 'IDNTY_ASSESSMENT_ENVIRONMENT'
      ? 'mobile'
      : 'desktop';

  return (
    <Site00MobilePresentationProvider kind="scaled">
      <Site00MobileArtboardProvider>
        <div ref={shellRef} className="site00-mobile-artboard-shell">
          <div ref={scalerRef} className="site00-mobile-artboard-shell__stage-scaler">
            <div ref={stageRef} className="site00-mobile-artboard">
              {viewportEnvironmentId ? (
                <Site00EnvironmentViewportBackground
                  environmentId={viewportEnvironmentId}
                  assetKind={viewportAssetKind}
                />
              ) : null}
              {children}
            </div>
          </div>
        </div>
      </Site00MobileArtboardProvider>
    </Site00MobilePresentationProvider>
  );
}
