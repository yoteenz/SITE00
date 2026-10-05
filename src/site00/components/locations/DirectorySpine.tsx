import { SITE00_LOCATIONS_COMPOSITION } from '../../config/locations-composition-map';
import { Site00DirectorySpineNodeIcon } from '../mobile/Site00MobileIcons';

type DirectorySpineProps = {
  cardCount: number;
};

/** Vertical directory spine with red node at first card anchor. */
export function DirectorySpine({ cardCount }: DirectorySpineProps) {
  const { layout } = SITE00_LOCATIONS_COMPOSITION;
  const spineHeight =
    cardCount * layout.cardMinHeightPx + Math.max(0, cardCount - 1) * layout.cardGapPx + 24;

  return (
    <div className="site00-directory-spine" aria-hidden="true" style={{ height: spineHeight }}>
      <svg className="site00-directory-spine__line" width="2" height="100%" preserveAspectRatio="none">
        <line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      <div className="site00-directory-spine__node">
        <Site00DirectorySpineNodeIcon size={10} />
      </div>
    </div>
  );
}
