import { useNavigate } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { useSite00 } from '../../state/Site00Context';
import type { BldrBuildDirection } from '../../config/bldr-entry';
import { Site00BuildDirectionArrowIcon } from '../mobile/Site00MobileIcons';

type BuildDirectionCardProps = {
  direction: BldrBuildDirection;
};

/** Reusable immersive build-direction portal card (SITE / WORLD). */
export function BuildDirectionCard({ direction }: BuildDirectionCardProps) {
  const navigate = useNavigate();
  const { selectBuildClass } = useSite00();
  const imageUrl = resolveSite00PublicAsset(direction.imagePath);
  const ariaLabel = `${direction.title} — ${direction.descriptionLines.join(' ')} — ${direction.price}`;

  const handleSelect = () => {
    selectBuildClass(direction.buildClassId);
    navigate(direction.href, { state: { fromBldrEntry: true, buildClassId: direction.buildClassId } });
  };

  return (
    <article className={`site00-build-direction-card site00-build-direction-card--${direction.id}`}>
      <button
        type="button"
        className="site00-build-direction-card__hit"
        onClick={handleSelect}
        aria-label={ariaLabel}
      >
        <img
          className="site00-build-direction-card__image"
          src={imageUrl}
          alt=""
          decoding="async"
          draggable={false}
          style={{ objectPosition: direction.imageObjectPosition }}
        />
        <span className="site00-build-direction-card__scrim" aria-hidden="true" />
        <span className="site00-build-direction-card__copy">
          <span className="site00-build-direction-card__title">{direction.title}</span>
          <span className="site00-build-direction-card__description">
            {direction.descriptionLines.map((line) => (
              <span key={line} className="site00-build-direction-card__description-line">
                {line}
              </span>
            ))}
          </span>
          <span className="site00-build-direction-card__price">{direction.price}</span>
        </span>
        <span className="site00-build-direction-card__action" aria-hidden="true">
          <Site00BuildDirectionArrowIcon size={16} />
        </span>
      </button>
    </article>
  );
}
