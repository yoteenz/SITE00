import { SITE00_LOCATIONS_COMPOSITION } from '../../config/locations-composition-map';
import { Site00DirectorySpineNodeIcon } from '../mobile/Site00MobileIcons';

type DirectorySpineProps = {
  cardCount: number;
};

function directorySpineMetrics(cardCount: number) {
  const { layout } = SITE00_LOCATIONS_COMPOSITION;
  const stride = layout.cardMinHeightPx + layout.cardGapPx;

  if (cardCount <= 0) {
    return { spineHeight: 0, nodeOffsetsPx: [] as number[] };
  }

  const firstNodeTopPx = layout.cardMaxHeightPx / 2;
  const lastCardCenterPx = (cardCount - 1) * stride + layout.cardMaxHeightPx / 2;
  const nodeOffsetsPx =
    cardCount === 1 ? [firstNodeTopPx] : [firstNodeTopPx, lastCardCenterPx];
  const spineHeight = lastCardCenterPx + 5;

  return { spineHeight, nodeOffsetsPx };
}

/** Vertical directory spine — red nodes at first + last card anchors in the section. */
export function DirectorySpine({ cardCount }: DirectorySpineProps) {
  const { spineHeight, nodeOffsetsPx } = directorySpineMetrics(cardCount);

  if (spineHeight <= 0) {
    return null;
  }

  return (
    <div className="site00-directory-spine" aria-hidden="true" style={{ height: spineHeight }}>
      <svg className="site00-directory-spine__line" width="2" height="100%" preserveAspectRatio="none">
        <line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      {nodeOffsetsPx.map((topPx) => (
        <div
          key={topPx}
          className="site00-directory-spine__node"
          style={{ top: `${topPx}px` }}
        >
          <Site00DirectorySpineNodeIcon size={10} />
        </div>
      ))}
    </div>
  );
}
