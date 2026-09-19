import { Link } from 'react-router-dom';
import { ASTRAL_READER_ROUTE_BASE } from '../../../../../shared/site00-astral-world/readerAccount/readerRoutes.js';
import { useReaderAccount } from '../../hooks/useReaderAccount';
import { destinationLabel } from '../../../../../shared/site00-astral-world/readerAccount/readerPresenceModel.js';
import { AstralPortrait } from '../../components/immersive/AstralPortrait';

export default function ReaderHomePage() {
  const { profile } = useReaderAccount();

  if (!profile.onboardingComplete) {
    return (
      <div className="aw-reader-page">
        <p className="aw-muted">Complete onboarding to access Reader Home.</p>
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/onboarding`} className="aw-btn-primary">Continue onboarding</Link>
      </div>
    );
  }

  return (
    <div className="aw-reader-page">
      <header className="aw-reader-page__header">
        <AstralPortrait personId={profile.readerId} avatarId={profile.avatarId} name={profile.displayName} size={64} showPresence variant="reader" />
        <div>
          <h1 className="aw-display">{profile.displayName}</h1>
          <p className="aw-muted">{profile.presence.replace(/_/g, ' ')} · {destinationLabel(profile.currentDestination ?? profile.primaryDestination)}</p>
        </div>
      </header>
      <nav className="aw-reader-dash-nav">
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/profile`}>Profile</Link>
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/presence`}>Presence</Link>
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/alerts`}>Alerts</Link>
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/avatar`}>Avatar</Link>
      </nav>
    </div>
  );
}
