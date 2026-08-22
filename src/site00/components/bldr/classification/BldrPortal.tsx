import { resolveSite00PublicAsset } from '../../loader/site00LoaderConfig';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { Site00BuildDirectionArrowIcon } from '../../mobile/Site00MobileIcons';
import type { BldrImmersivePortal } from '../../../config/bldr-classification';

type BldrPortalProps = {
  portal: BldrImmersivePortal;
  onSelect: () => void;
};

export function BldrPortal({ portal, onSelect }: BldrPortalProps) {
  const hasImage = Boolean(portal.imagePath);
  const imageUrl = portal.imagePath ? resolveSite00PublicAsset(portal.imagePath) : null;

  return (
    <article className={`site00-bldr-portal site00-bldr-portal--${portal.id}`}>
      <button
        type="button"
        className="site00-bldr-portal__hit"
        onClick={onSelect}
        aria-label={portal.ariaLabel}
      >
        {hasImage && imageUrl ? (
          <img
            className="site00-bldr-portal__image"
            src={imageUrl}
            alt=""
            decoding="async"
            draggable={false}
            style={{ objectPosition: portal.imageObjectPosition }}
          />
        ) : (
          <span className="site00-bldr-portal__asset-slot" aria-hidden="true" />
        )}
        <span className="site00-bldr-portal__scrim" aria-hidden="true" />
        <Site00ThreeCornerMark className="site00-bldr-portal__mark" />
        <span className="site00-bldr-portal__copy">
          <span className="site00-bldr-portal__label">
            {portal.num} / {portal.scaleLabel}
          </span>
          <span className="site00-bldr-portal__title">{portal.title}</span>
          <span className="site00-bldr-portal__descriptor">
            {portal.descriptorLines.map((line) => (
              <span key={line} className="site00-bldr-portal__descriptor-line">
                {line}
              </span>
            ))}
          </span>
          <span className="site00-bldr-portal__rule" aria-hidden="true" />
          <span className="site00-bldr-portal__capabilities">{portal.capabilities}</span>
          <span className="site00-bldr-portal__price">{portal.price}</span>
        </span>
        <span className="site00-bldr-portal__cta">
          <span className="site00-bldr-portal__cta-label">{portal.ctaLabel}</span>
          <span className="site00-bldr-portal__cta-arrow" aria-hidden="true">
            <Site00BuildDirectionArrowIcon size={16} />
          </span>
        </span>
      </button>
    </article>
  );
}
