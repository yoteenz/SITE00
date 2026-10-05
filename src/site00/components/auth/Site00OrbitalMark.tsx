import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_SIGNIN_ICON_PATH, SITE00_SIGNIN_ICON_VERSION } from '../../config/site00-auth-assets';

type Site00OrbitalMarkProps = {
  className?: string;
  reducedMotion?: boolean;
};

const signInIconUrl = `${resolveSite00PublicAsset(SITE00_SIGNIN_ICON_PATH)}?v=${SITE00_SIGNIN_ICON_VERSION}`;

/** Sign-in brand mark — approved Supabase NAV PNG (mobile intro + desktop brand panel). */
export function Site00OrbitalMark({ className = '' }: Site00OrbitalMarkProps) {
  return (
    <div className={`site00-orbital-mark ${className}`.trim()} aria-hidden="true">
      <img
        src={signInIconUrl}
        alt=""
        className="site00-orbital-mark__img"
        width={1024}
        height={1536}
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
