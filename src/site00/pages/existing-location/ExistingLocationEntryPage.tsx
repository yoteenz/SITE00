import { useNavigate } from 'react-router-dom';
import { Site00MobileShell } from '../../components/mobile/Site00MobileShell';
import { ExistingLocationTrustPanel } from '../../components/existing-location/ExistingLocationTrustPanel';
import { EXISTING_LOCATION_PUBLIC_LABEL } from '../../../../shared/site00-existing-location/types';
import { EXISTING_LOCATION_REQUEST_TYPES } from '../../../../shared/site00-existing-location/platforms';
import { useExistingLocationCase } from '../../hooks/useExistingLocationCase';
import { site00ExistingLocationCasePath } from '../../config/routes';

export default function ExistingLocationEntryPage() {
  const navigate = useNavigate();
  const { startCase, updateIntake, loading, error } = useExistingLocationCase();

  async function onSelectRequest(request_type: string) {
    const { case: record } = await startCase();
    await updateIntake(record.id, { request_type });
    navigate(site00ExistingLocationCasePath(record.id));
  }

  return (
    <Site00MobileShell showEnvironmentBackground={false} shellClassName="site00-existing-location-shell">
      <div className="site00-existing-location-page">
        <header className="site00-existing-location-page__header">
          <p className="site00-existing-location-page__eyebrow">SITE 00 SERVICE</p>
          <h1 className="site00-existing-location-page__title">{EXISTING_LOCATION_PUBLIC_LABEL}</h1>
          <p className="site00-existing-location-page__lead">
            ALREADY HAVE A WEBSITE, STORE, OR APP? SITE 00 CAN DIAGNOSE, REPAIR, ENHANCE, OR INSTALL ON YOUR EXISTING
            DIGITAL LOCATION — WITHOUT A FULL REBUILD.
          </p>
        </header>

        <section className="site00-existing-location-page__section">
          <h2 className="site00-existing-location-page__question">WHAT DO YOU NEED SITE 00 TO DO?</h2>
          <div className="site00-existing-location-page__options">
            {EXISTING_LOCATION_REQUEST_TYPES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="site00-existing-location-option"
                disabled={loading}
                onClick={() => onSelectRequest(opt.id)}
              >
                <span className="site00-existing-location-option__label">{opt.label}</span>
                <span className="site00-existing-location-option__desc">{opt.description}</span>
              </button>
            ))}
          </div>
          {error ? <p className="site00-existing-location-page__error">{error}</p> : null}
        </section>

        <ExistingLocationTrustPanel />
      </div>
    </Site00MobileShell>
  );
}
