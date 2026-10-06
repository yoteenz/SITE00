import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveJurnlProductionConfig } from '../../data/production/productionConfig';
import { trackJurnlEvent } from '../../data/analytics/jurnlAnalytics';
import { useJurnl } from '../state/store';

/** Production indexing + analytics hooks (no visual change). */
export function JurnlRuntimeChrome() {
  const { mode, auth } = useJurnl();
  const location = useLocation();
  const cfg = resolveJurnlProductionConfig(mode);

  useEffect(() => {
    if (mode !== 'production') return;
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, [mode]);

  useEffect(() => {
    const rel = location.pathname.replace(/^\/+/, '');
    trackJurnlEvent('jurnl_route_viewed', { route: rel.slice(0, 80), mode, authKind: auth.kind, dataPlane: cfg.dataPlane });
  }, [location.pathname, mode, auth.kind, cfg.dataPlane]);

  return null;
}
