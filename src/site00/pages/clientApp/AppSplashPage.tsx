import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAppPath } from '../../../../shared/site00-client-app/client.js';
import { ClientAppDiamondIcon } from '../../icons/ClientAppNavIcons';

export default function AppSplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate(clientAppPath(undefined), { replace: true });
    }, 1800);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <div className="site00-app-splash" style={{ ['--site00-app-accent' as string]: '#e8192c' }}>
      <div className="site00-app-splash__logo">
        SITE 00 <ClientAppDiamondIcon className="site00-app-accent" size={10} />
      </div>
      <p className="site00-app-splash__tagline">Your project, built with purpose.</p>
      <div className="site00-app-splash__line" aria-hidden="true" />
    </div>
  );
}
