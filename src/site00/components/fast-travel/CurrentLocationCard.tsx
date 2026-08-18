import type { FastTravelLocation } from '../../config/fast-travel';

type CurrentLocationCardProps = {
  location: FastTravelLocation;
};

export function CurrentLocationCard({ location }: CurrentLocationCardProps) {
  return (
    <div className="site00-fast-travel__current" aria-label="Current location">
      <span className="site00-fast-travel__current-label">CURRENT LOCATION</span>
      <div className="site00-fast-travel__current-body">
        {location.index ? (
          <span className="site00-fast-travel__current-index">{location.index}</span>
        ) : null}
        <span className="site00-fast-travel__current-title">{location.title}</span>
        <span className="site00-fast-travel__current-descriptor">{location.descriptor}</span>
      </div>
    </div>
  );
}
