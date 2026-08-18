import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Site00MobileShell } from '../components/mobile/Site00MobileShell';
import { LocationsDirectory } from '../components/locations/LocationsDirectory';
import { usePresentationMode } from '../presentation';
import { SITE00_ROUTES } from '../config/routes';

/** Canonical /origin/locations — dedicated MobileLocations presentation. */
export default function LocationsPage() {
  const { state } = useLocation();
  const { isMobilePresentation } = usePresentationMode();
  const [enterClass, setEnterClass] = useState('site00-locations-page--enter');

  useEffect(() => {
    const fromSwipe = (state as { fromSwipe?: boolean } | null)?.fromSwipe;
    if (!fromSwipe) {
      setEnterClass('');
      return;
    }
    const timer = window.setTimeout(() => setEnterClass(''), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (!isMobilePresentation) {
    return <Navigate to={SITE00_ROUTES.originAlias} replace />;
  }

  return (
    <div className={`site00-locations-page ${enterClass}`.trim()}>
      <Site00MobileShell activeNav="locations" headerVariant="directory" enterClassName={enterClass ? 'site00-locations-page--enter' : ''}>
        <LocationsDirectory />
      </Site00MobileShell>
    </div>
  );
}
