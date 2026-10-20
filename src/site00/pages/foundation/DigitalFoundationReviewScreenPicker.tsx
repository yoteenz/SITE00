import { galleryEntriesFilteredByZone } from './digitalFoundationReviewGallery';
import { REVIEW_ZONE_LABELS, type DfReviewZoneId } from './digitalFoundationReviewZones';
import { navigateToReviewAnchor } from './reviewLinks';
import { previewStatusForEntry, previewStatusLabel } from './reviewPreviewStatus';

type Props = {
  zone: DfReviewZoneId;
  activeAnchor: string;
  onSelect: (anchorId: string) => void;
};

export default function DigitalFoundationReviewScreenPicker({ zone, activeAnchor, onSelect }: Props) {
  const entries = galleryEntriesFilteredByZone(zone);

  return (
    <div className="df-review__screen-picker">
      <p className="df-review__zone-meta">
        {REVIEW_ZONE_LABELS[zone].toUpperCase()} · {entries.length} SCREENS · ONE AT A TIME
      </p>
      <div className="df-review__screen-pills" role="listbox" aria-label={`Screens in ${REVIEW_ZONE_LABELS[zone]}`}>
        {entries.map((entry) => {
          const on = entry.anchorId === activeAnchor;
          const short = entry.pageName.length > 28 ? `${entry.pageName.slice(0, 26)}…` : entry.pageName;
          return (
            <button
              key={entry.reviewId}
              type="button"
              role="option"
              aria-selected={on}
              className={`df-review__screen-pill${on ? ' df-review__screen-pill--on' : ''}`}
              title={`${entry.pageName} · ${previewStatusLabel(previewStatusForEntry(entry))}`}
              onClick={() => {
                onSelect(entry.anchorId);
                navigateToReviewAnchor(entry.anchorId);
              }}
            >
              {short.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
