import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import {
  SITE00_IDNTY_GATEWAY_CREATE_ICON_PATH,
  SITE00_IDNTY_GATEWAY_ICON_VERSION,
  SITE00_IDNTY_GATEWAY_SIGNIN_ICON_PATH,
} from '../../config/idnty-gateway-assets';

type IdntyGatewayHubIconProps = {
  variant: 'sign-in' | 'create-idnty';
};

/** Approved PNG for IDNTY gateway hub cards only — not the hero header mark. */
export function IdntyGatewayHubIcon({ variant }: IdntyGatewayHubIconProps) {
  const path =
    variant === 'sign-in' ? SITE00_IDNTY_GATEWAY_SIGNIN_ICON_PATH : SITE00_IDNTY_GATEWAY_CREATE_ICON_PATH;
  const src = `${resolveSite00PublicAsset(path)}?v=${SITE00_IDNTY_GATEWAY_ICON_VERSION}`;

  return (
    <img
      src={src}
      alt=""
      className="site00-idnty-gateway__hub-icon"
      width={48}
      height={48}
      loading="eager"
      decoding="async"
    />
  );
}
