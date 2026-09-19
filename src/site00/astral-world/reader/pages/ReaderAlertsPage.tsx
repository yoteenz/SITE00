import { useReaderAccount } from '../../hooks/useReaderAccount';

export default function ReaderAlertsPage() {
  const { profile, saveProfile } = useReaderAccount();

  return (
    <div className="aw-reader-page">
      <h1 className="aw-display aw-display--section">Alert Preferences</h1>
      <p className="aw-muted">Seeker privacy settings always override these alerts.</p>
      {Object.entries(profile.alertPreferences).map(([key, enabled]) => (
        <label key={key} className="aw-reader-check">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              saveProfile({
                alertPreferences: { ...profile.alertPreferences, [key]: e.target.checked },
              })
            }
          />
          {key.replace(/_/g, ' ')}
        </label>
      ))}
    </div>
  );
}
