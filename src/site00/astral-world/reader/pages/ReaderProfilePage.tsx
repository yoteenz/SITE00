import { useReaderAccount } from '../../hooks/useReaderAccount';
import { specialtyLabels } from '../../../../../shared/site00-astral-world/readerAccount/readerSpecialties.js';
import { AstralPortrait } from '../../components/immersive/AstralPortrait';

export default function ReaderProfilePage() {
  const { profile } = useReaderAccount();

  return (
    <div className="aw-reader-page">
      <h1 className="aw-display aw-display--section">Reader Profile</h1>
      <div className="aw-reader-profile-preview">
        <AstralPortrait personId={profile.readerId} avatarId={profile.avatarId} name={profile.displayName} size={72} variant="reader" />
        <p className="aw-display">{profile.displayName}</p>
        <p className="aw-muted">{profile.introduction}</p>
        <p className="aw-muted">{specialtyLabels(profile.specialties)}</p>
        <p className="aw-muted">Primary: {profile.primaryDestination}</p>
      </div>
    </div>
  );
}
