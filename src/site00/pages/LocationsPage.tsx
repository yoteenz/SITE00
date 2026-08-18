import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Site00MobileShell } from '../components/mobile/Site00MobileShell';
import { LocationsDirectory } from '../components/locations/LocationsDirectory';
import { SITE00_ROUTES } from '../config/routes';

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return mobile;
}

export default function LocationsPage() {
  const { state } = useLocation();
  const isMobile = useIsMobileViewport();
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

  if (!isMobile) {
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
