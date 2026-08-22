import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_FAST_TRAVEL_ICON_PATH } from '../../config/locations-directory';

export function site00FastTravelIconUrl(): string {
  return resolveSite00PublicAsset(SITE00_FAST_TRAVEL_ICON_PATH);
}

type Site00FastTravelIconProps = {
  className?: string;
  size?: number;
};

/** Shared Fast Travel mark — mobile header trigger and desktop ENTER/EXIT control. */
export function Site00FastTravelIcon({ className, size = 22 }: Site00FastTravelIconProps) {
  return (
    <img
      src={site00FastTravelIconUrl()}
      alt=""
      className={className}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
