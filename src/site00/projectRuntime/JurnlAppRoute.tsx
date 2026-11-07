/**
 * `/jurnl/app/*` — JURNL for real users. Same runtime as the design workspace, but mode="production": Supabase auth,
 * server-side persistence, real data mode (PRODUCTION, or PROVIDER_SANDBOX when the deployment says so), and no
 * inspection switches. When auth or persistence is not configured the runtime fails closed (service screen) instead
 * of silently falling back to preview data.
 */
import { Suspense, lazy } from 'react';

const Runtime = lazy(() => import('../../projects/jurnl/runtime/JurnlRuntimeRoot'));

export const JURNL_APP_BASE_PATH = '/jurnl/app';

export function JurnlAppRoute() {
  return (
    <Suspense fallback={<div data-testid="jurnl-app-loading" style={{ position: 'fixed', inset: 0, background: 'transparent' }} />}>
      <Runtime basePath={JURNL_APP_BASE_PATH} mode="production" />
    </Suspense>
  );
}

export default JurnlAppRoute;
