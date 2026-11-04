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

  useEffect(() => {
    if (import.meta.env.PROD) return;
    const buildId = String(import.meta.env.VITE_APP_BUILD_ID ?? 'dev-local');
    const previewMode = String(import.meta.env.VITE_SITE00_CLOUD_PREVIEW ?? '0');
    document.documentElement.dataset.site00PreviewBuild = buildId;
    document.documentElement.dataset.site00PreviewMode = previewMode === '1' ? 'cloud-dev' : 'local-dev';
    return () => {
      delete document.documentElement.dataset.site00PreviewBuild;
      delete document.documentElement.dataset.site00PreviewMode;
    };
  }, []);

  return null;
}
