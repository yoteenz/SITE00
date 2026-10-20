import DigitalFoundationReviewGallerySection from './DigitalFoundationReviewGallerySection';
import { galleryEntriesFiltered } from './digitalFoundationReviewGallery';
import type { DfReviewGroupId } from './digitalFoundationReviewRegistry';

export default function DigitalFoundationReviewGallery({
  groupFilter = 'ALL',
}: {
  groupFilter?: DfReviewGroupId | 'ALL';
}) {
  const entries = galleryEntriesFiltered(groupFilter);

  return (
    <div className="df-review__strip" id="df-review-gallery" aria-label="Digital Foundation design review gallery">
      {entries.map((entry, index) => (
        <DigitalFoundationReviewGallerySection key={entry.reviewId} entry={entry} index={index} />
      ))}
    </div>
  );
}
