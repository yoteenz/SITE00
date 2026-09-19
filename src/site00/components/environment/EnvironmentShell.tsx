import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { resolveOriginPanelBackgroundPresentation } from '../../config/origin-panel-state';
import { useSite00Optional } from '../../state/Site00Context';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import { useSite00DesktopViewportBackgroundActive } from '../shell/Site00DesktopPresentationContext';
import { useSite00MobileArtboardPreview } from '../shell/Site00MobileArtboardContext';
import { useSite00MobileViewportBackgroundActive } from '../shell/Site00MobilePresentationContext';
import { Site00EnvironmentViewportBackground } from './Site00EnvironmentViewportBackground';
import '../../styles/site00.css';

type EnvironmentShellProps = {
  environmentId: EnvironmentId;
  children: ReactNode;
  className?: string;
};

function resolveEnvironmentDesktopAsset(
  environmentId: EnvironmentId,
  config: (typeof SITE00_ENVIRONMENTS)[EnvironmentId],
  homeMode: 'origin' | 'idnty-expanded' | 'bldr-expanded' | 'evolve-expanded',
): string | undefined {
  if (environmentId === 'ORIGIN_ENVIRONMENT') {
    return resolveOriginPanelBackgroundPresentation(homeMode, 'desktop').url;
  }
  if (config.desktopAssetPath) return resolveSite00PublicAsset(config.desktopAssetPath);
  return config.asset;
}

function resolveEnvironmentMobileAsset(
  environmentId: EnvironmentId,
  config: (typeof SITE00_ENVIRONMENTS)[EnvironmentId],
  homeMode: 'origin' | 'idnty-expanded' | 'bldr-expanded' | 'evolve-expanded',
): string | undefined {
  if (environmentId === 'ORIGIN_ENVIRONMENT') {
    return resolveOriginPanelBackgroundPresentation(homeMode, 'mobile').url;
  }
  if (config.mobileAssetPath) return resolveSite00PublicAsset(config.mobileAssetPath);
  return undefined;
}

/**
 * Reusable environmental rendering shell.
 * Separates ENVIRONMENT from INTERFACE — background does not reload on UI state changes
 * within the same environment family.
 */
export function EnvironmentShell({ environmentId, children, className = '' }: EnvironmentShellProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const site00 = useSite00Optional();
  const homeMode = site00?.state.homeMode ?? 'origin';
  const desktopAsset = resolveEnvironmentDesktopAsset(environmentId, config, homeMode);
  const mobileAsset = resolveEnvironmentMobileAsset(environmentId, config, homeMode);
  const inDesktopArtboard = useSite00DesktopArtboardPreview();
  const inMobileArtboard = useSite00MobileArtboardPreview();
  const inScaledArtboard = inDesktopArtboard || inMobileArtboard;
  const viewportBackgroundActive = useSite00DesktopViewportBackgroundActive();
  const mobileViewportBackgroundActive = useSite00MobileViewportBackgroundActive();
  /** Enter desktop bg always on /enter — not gated on Mobile/Desktop toggle (refresh-safe). */
  const showEnterDesktopViewportBg =
    environmentId === 'ENTER_00_WAITING_ROOM' &&
    Boolean(desktopAsset) &&
    !viewportBackgroundActive &&
    !mobileViewportBackgroundActive;
  const suppressEnvForViewportBg =
    showEnterDesktopViewportBg ||
    (inDesktopArtboard && viewportBackgroundActive && Boolean(desktopAsset)) ||
    (inMobileArtboard && mobileViewportBackgroundActive && Boolean(desktopAsset || mobileAsset));

  const originDesktopPresentation =
    environmentId === 'ORIGIN_ENVIRONMENT'
      ? resolveOriginPanelBackgroundPresentation(homeMode, 'desktop')
      : null;
  const originMobilePresentation =
    environmentId === 'ORIGIN_ENVIRONMENT'
      ? resolveOriginPanelBackgroundPresentation(homeMode, 'mobile')
      : null;

  return (
    <Fragment>
      {showEnterDesktopViewportBg ? (
        <Site00EnvironmentViewportBackground
          environmentId="ENTER_00_WAITING_ROOM"
          rootClassName="site00-environment-viewport-bg--viewport-fixed"
        />
      ) : null}
      <div className={`site00-shell ${className}`.trim()} data-environment={environmentId}>
      <div
        className={`site00-env-layer ${config.fallbackClass} ${config.lightingClass} ${desktopAsset ? 'site00-env-layer--has-desktop-asset' : ''} ${mobileAsset ? 'site00-env-layer--has-mobile-asset' : ''} ${suppressEnvForViewportBg ? 'site00-env-layer--viewport-bg-suppressed' : ''}`.trim()}
        aria-hidden="true"
        style={{
          position: inScaledArtboard ? 'absolute' : 'fixed',
          inset: 0,
          zIndex: 'var(--site-z-env)',
          ['--site00-env-desktop-position' as string]:
            originDesktopPresentation?.position ?? config.desktopPosition,
          ['--site00-env-mobile-position' as string]:
            originMobilePresentation?.position ?? config.mobilePosition,
          ['--site00-env-desktop-scale' as string]: String(config.desktopScale),
          ['--site00-env-mobile-scale' as string]: String(config.mobileScale),
          ...(desktopAsset
            ? {
                ['--site00-env-desktop-image' as string]: `url("${desktopAsset.replace(/"/g, '\\"')}")`,
              }
            : {}),
          ...(mobileAsset
            ? {
                ['--site00-env-mobile-image' as string]: `url("${mobileAsset.replace(/"/g, '\\"')}")`,
              }
            : {}),
          ...(config.asset && !config.desktopAssetPath
            ? {
                backgroundImage: `url(${config.asset})`,
              }
            : {}),
        }}
      />
      <div className="site00-ui-layer" style={{ position: 'relative', zIndex: 'var(--site-z-ui)', minHeight: '100dvh' }}>
        {children}
      </div>
    </div>
    </Fragment>
  );
}
