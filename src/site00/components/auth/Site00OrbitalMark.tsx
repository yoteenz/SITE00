import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_SIGNIN_ICON_PATH } from '../../config/site00-auth-assets';

type Site00OrbitalMarkProps = {
  className?: string;
  reducedMotion?: boolean;
};

const signInIconUrl = resolveSite00PublicAsset(SITE00_SIGNIN_ICON_PATH);

/** Sign-in brand mark — Supabase NAV asset (desktop panel + mobile intro). */
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
