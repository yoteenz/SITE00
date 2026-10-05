import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  SITE00_MOBILE_ARTBOARD_HEIGHT,
  SITE00_MOBILE_ARTBOARD_WIDTH,
  measureSite00MobileDevicePreviewScaleBox,
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
 * Laptop Mobile tab — centered phone device frame with 390×844 artboard inside the screen.
 * Content renders at true mobile 1:1; only the phone hardware frame scales to fit the viewport.
 */
export function Site00MobileArtboardShell({ children }: Site00MobileArtboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const deviceScaleSlotRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [viewportEnvironmentId, setViewportEnvironmentId] = useState<EnvironmentId | null>(null);

  useLayoutEffect(
    () => installDesktopPreviewShellViewportLock({ background: '#e8e8e6' }),
    [],
  );

  useLayoutEffect(() => {
    const layoutStage = () => {
      const shell = shellRef.current;
      const deviceScaleSlot = deviceScaleSlotRef.current;
      const device = deviceRef.current;
      const scaler = scalerRef.current;
      const stage = stageRef.current;
      if (!shell || !deviceScaleSlot || !device || !scaler || !stage) return;

      const box = measureSite00MobileDevicePreviewScaleBox(shell.clientWidth, shell.clientHeight);
      const scale = box.scale;

      deviceScaleSlot.style.width = `${box.scaledFrameWidth}px`;
      deviceScaleSlot.style.height = `${box.scaledFrameHeight}px`;

      device.style.width = `${box.frameWidth}px`;
      device.style.height = `${box.frameHeight}px`;
      device.style.transform = `scale(${scale})`;
      device.style.transformOrigin = 'top left';

      stage.style.width = `${SITE00_MOBILE_ARTBOARD_WIDTH}px`;
      stage.style.height = `${SITE00_MOBILE_ARTBOARD_HEIGHT}px`;
      stage.style.minHeight = `${SITE00_MOBILE_ARTBOARD_HEIGHT}px`;
      stage.style.setProperty('--site00-mobile-artboard-height', `${SITE00_MOBILE_ARTBOARD_HEIGHT}px`);
      stage.style.transform = 'none';

      scaler.style.width = `${box.screenWidth}px`;
      scaler.style.height = `${box.screenHeight}px`;

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
          <div className="site00-mobile-artboard-shell__center">
            <div ref={deviceScaleSlotRef} className="site00-mobile-device-scale">
              <div ref={deviceRef} className="site00-mobile-device" aria-label="MOBILE PHONE PREVIEW">
                <div className="site00-mobile-device__bezel">
                  <div className="site00-mobile-device__screen">
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
                </div>
                <div className="site00-mobile-device__home-indicator" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </Site00MobileArtboardProvider>
    </Site00MobilePresentationProvider>
  );
}
