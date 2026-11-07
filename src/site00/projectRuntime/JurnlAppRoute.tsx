/**
 * `/jurnl/app/*` — JURNL for real users. Same runtime as the design workspace, loaded through the project runtime
 * registry (host / project firewall), but mode="production": Supabase auth, server-side persistence, real data mode
 * (PRODUCTION, or PROVIDER_SANDBOX when the deployment says so), and no inspection switches. When auth or persistence
 * is not configured the runtime fails closed (service screen) instead of silently falling back to preview data.
 */
import { Suspense, lazy, useMemo } from 'react';
import { getProjectRuntime } from './projectRuntimeRegistry';

export const JURNL_APP_BASE_PATH = '/jurnl/app';

export function JurnlAppRoute() {
  const entry = getProjectRuntime('jurnl');
  const Runtime = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);
  if (!Runtime) return null;
  return (
    <Suspense fallback={<div data-testid="jurnl-app-loading" style={{ position: 'fixed', inset: 0, background: 'transparent' }} />}>
      <Runtime basePath={JURNL_APP_BASE_PATH} mode="production" />
    </Suspense>
  );
}

export default JurnlAppRoute;
