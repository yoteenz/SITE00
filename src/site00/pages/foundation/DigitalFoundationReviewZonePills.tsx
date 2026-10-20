import {
  REVIEW_ZONE_LABELS,
  REVIEW_ZONE_ORDER,
  galleryEntriesForZone,
  type DfReviewZoneId,
} from './digitalFoundationReviewZones';

type Props = {
  zone: DfReviewZoneId;
  onZoneChange: (z: DfReviewZoneId) => void;
};

export default function DigitalFoundationReviewZonePills({ zone, onZoneChange }: Props) {
  return (
    <div className="df-review__zone-bar" role="tablist" aria-label="Review zones">
      {REVIEW_ZONE_ORDER.map((id) => {
        const count = galleryEntriesForZone(id).length;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={zone === id}
            className={`df-review__zone-pill${zone === id ? ' df-review__zone-pill--on' : ''}`}
            onClick={() => onZoneChange(id)}
          >
            {REVIEW_ZONE_LABELS[id].toUpperCase()}
            <span className="df-review__zone-pill-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
