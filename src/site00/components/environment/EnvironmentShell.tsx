import type { ReactNode } from 'react';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import '../../styles/site00.css';

type EnvironmentShellProps = {
  environmentId: EnvironmentId;
  children: ReactNode;
  className?: string;
};

function resolveEnvironmentDesktopAsset(config: (typeof SITE00_ENVIRONMENTS)[EnvironmentId]): string | undefined {
  if (config.desktopAssetPath) return resolveSite00PublicAsset(config.desktopAssetPath);
  return config.asset;
}

/**
 * Reusable environmental rendering shell.
 * Separates ENVIRONMENT from INTERFACE — background does not reload on UI state changes
 * within the same environment family.
 */
export function EnvironmentShell({ environmentId, children, className = '' }: EnvironmentShellProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];
  const desktopAsset = resolveEnvironmentDesktopAsset(config);
  const mobileAsset = config.mobileAssetPath ? resolveSite00PublicAsset(config.mobileAssetPath) : undefined;
  const inDesktopArtboard = useSite00DesktopArtboardPreview();

  return (
    <div className={`site00-shell ${className}`.trim()} data-environment={environmentId}>
      <div
        className={`site00-env-layer ${config.fallbackClass} ${config.lightingClass} ${desktopAsset ? 'site00-env-layer--has-desktop-asset' : ''} ${mobileAsset ? 'site00-env-layer--has-mobile-asset' : ''}`.trim()}
        aria-hidden="true"
        style={{
          position: inDesktopArtboard ? 'absolute' : 'fixed',
          inset: 0,
          zIndex: 'var(--site-z-env)',
          ['--site00-env-desktop-position' as string]: config.desktopPosition,
          ['--site00-env-mobile-position' as string]: config.mobilePosition,
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
  );
}
