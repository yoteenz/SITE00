import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_ACCESS_RETICLE_PATH, SITE00_ACCESS_RETICLE_VERSION } from '../../config/access-credentials';

export const accessReticleUrl = `${resolveSite00PublicAsset(SITE00_ACCESS_RETICLE_PATH)}?v=${SITE00_ACCESS_RETICLE_VERSION}`;

type AccessReticleProps = {
  className?: string;
  size?: 'desktop' | 'mobile' | 'compact';
  active?: boolean;
  muted?: boolean;
};

/** Approved SITE 00 geometric access icon — production PNG, transparent background. */
export function AccessReticle({ className = '', size = 'desktop', active = true, muted = false }: AccessReticleProps) {
  return (
    <div
      className={[
        'site00-access-reticle',
        `site00-access-reticle--${size}`,
        active ? 'site00-access-reticle--active' : '',
        muted ? 'site00-access-reticle--muted' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <img
        src={accessReticleUrl}
        alt=""
        className="site00-access-reticle__img"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
    </div>
  );
}
