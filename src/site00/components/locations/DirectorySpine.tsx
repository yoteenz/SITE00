import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Site00DirectorySpineNodeIcon } from '../mobile/Site00MobileIcons';

type DirectorySpineProps = {
  cardsContainerRef: RefObject<HTMLDivElement | null>;
};

type SpineMetrics = {
  spineHeight: number;
  nodeOffsetsPx: number[];
};

function measureSpineMetrics(
  spineEl: HTMLElement,
  cardsContainer: HTMLElement,
): SpineMetrics {
  const cardWraps = cardsContainer.querySelectorAll<HTMLElement>(
    '.site00-locations-directory__card-wrap',
  );

  if (cardWraps.length === 0) {
    return { spineHeight: 0, nodeOffsetsPx: [] };
  }

  const spineTop = spineEl.getBoundingClientRect().top;
  const cardCenterOffset = (card: DOMRect) => card.top + card.height / 2 - spineTop;
  const firstCenter = cardCenterOffset(cardWraps[0].getBoundingClientRect());
  const nodeOffsetsPx =
    cardWraps.length === 1
      ? [firstCenter]
      : [firstCenter, cardCenterOffset(cardWraps[cardWraps.length - 1].getBoundingClientRect())];

  const lastCenter = nodeOffsetsPx[nodeOffsetsPx.length - 1] ?? 0;

  return {
    spineHeight: Math.max(lastCenter + 5, 0),
    nodeOffsetsPx,
  };
}

/** Vertical directory spine — red nodes at first + last card anchors in the section. */
export function DirectorySpine({ cardsContainerRef }: DirectorySpineProps) {
  const spineRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<SpineMetrics>({ spineHeight: 0, nodeOffsetsPx: [] });

  useLayoutEffect(() => {
    const spineEl = spineRef.current;
    const cardsContainer = cardsContainerRef.current;
    if (!spineEl || !cardsContainer) {
      return;
    }

    const updateMetrics = () => {
      setMetrics(measureSpineMetrics(spineEl, cardsContainer));
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(cardsContainer);
    cardsContainer.querySelectorAll('.site00-locations-directory__card-wrap').forEach((card) => {
      resizeObserver.observe(card);
    });

    return () => resizeObserver.disconnect();
  }, [cardsContainerRef]);

  const { spineHeight, nodeOffsetsPx } = metrics;

  if (spineHeight <= 0) {
    return <div ref={spineRef} className="site00-directory-spine" aria-hidden="true" />;
  }

  return (
    <div
      ref={spineRef}
      className="site00-directory-spine"
      aria-hidden="true"
      style={{ height: spineHeight }}
    >
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
