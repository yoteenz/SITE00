import DigitalFoundationReviewGallerySection from './DigitalFoundationReviewGallerySection';
import { galleryEntriesFilteredByZone } from './digitalFoundationReviewGallery';
import type { DfReviewZoneId } from './digitalFoundationReviewZones';

/** Vertical stack of every screen in the active zone (one zone mounted at a time). */
export default function DigitalFoundationReviewGallery({ zoneFilter }: { zoneFilter: DfReviewZoneId }) {
  const entries = galleryEntriesFilteredByZone(zoneFilter);

  return (
    <div
      className="df-review__strip df-review__strip--continuous"
      id="df-review-gallery"
      aria-label="Digital Foundation review gallery"
    >
      {entries.map((entry, index) => (
        <DigitalFoundationReviewGallerySection key={entry.reviewId} entry={entry} index={index} zone={zoneFilter} />
      ))}
    </div>
  );
}
