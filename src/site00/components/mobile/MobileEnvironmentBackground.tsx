import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_LOCATIONS_BACKGROUND_PATH } from '../../config/locations-directory';
import { SITE00_LOCATIONS_COMPOSITION } from '../../config/locations-composition-map';

type MobileEnvironmentBackgroundProps = {
  className?: string;
};

/** Approved Screen 01 environment — edge-to-edge, no global white veil. */
export function MobileEnvironmentBackground({ className = '' }: MobileEnvironmentBackgroundProps) {
  const assetUrl = resolveSite00PublicAsset(SITE00_LOCATIONS_BACKGROUND_PATH);
  const { objectPosition } = SITE00_LOCATIONS_COMPOSITION;

  return (
    <div
      className={`site00-mobile-env ${className}`.trim()}
      aria-hidden="true"
      style={{
        backgroundImage: `url("${assetUrl.replace(/"/g, '\\"')}")`,
        backgroundSize: 'cover',
        backgroundPosition: objectPosition,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

export function useLocationsBackgroundUrl(): string {
  return resolveSite00PublicAsset(SITE00_LOCATIONS_BACKGROUND_PATH);
}
