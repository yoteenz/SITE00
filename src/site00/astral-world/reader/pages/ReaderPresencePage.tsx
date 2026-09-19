import type { DestinationSlug } from '../../../../../shared/site00-astral-world/types.js';
import { checkInReaderAtDestination } from '../../../../../shared/site00-astral-world/readerAccount/readerPresenceModel.js';
import { useReaderAccount } from '../../hooks/useReaderAccount';

const DESTINATIONS: DestinationSlug[] = ['tarot-suite', 'astral-mall', 'coffee-shop'];

export default function ReaderPresencePage() {
  const { profile, saveProfile } = useReaderAccount();

  return (
    <div className="aw-reader-page">
      <h1 className="aw-display aw-display--section">World Presence</h1>
      <p className="aw-muted">One canonical destination state for Find My Reader, Who&apos;s Here, and alerts.</p>
      <div className="aw-reader-chip-grid">
        {DESTINATIONS.map((d) => (
          <button
            key={d}
            type="button"
            className={`aw-reader-chip${profile.currentDestination === d ? ' aw-reader-chip--active' : ''}`}
            onClick={() => saveProfile(checkInReaderAtDestination(profile, d))}
          >
            Check in · {d}
          </button>
        ))}
      </div>
    </div>
  );
}
