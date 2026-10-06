/**
 * JURNL production data plane (Wave 5). Fail closed — no silent demo fallback in production mode.
 */

export type JurnlDataPlane = 'DEVICE' | 'SERVER_SYNC' | 'UNCONFIGURED';

export type JurnlProductionConfig = {
  dataPlane: JurnlDataPlane;
  authConfigured: boolean;
  serverPersistenceConfigured: boolean;
  supabaseConfigured: boolean;
  apiBase: string;
};

function envFlag(name: string): boolean {
  const v = (import.meta as unknown as { env?: Record<string, string> }).env?.[name];
  return v === '1' || v === 'true' || v === 'TRUE';
}

export function resolveJurnlProductionConfig(mode: 'design-preview' | 'production'): JurnlProductionConfig {
  const supabaseUrl = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  const supabaseAnon = (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY;
  const apiBase = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnon);
  const serverPersistenceConfigured = envFlag('VITE_JURNL_SERVER_PERSISTENCE');
  const authConfigured = supabaseConfigured;

  if (mode === 'design-preview') {
    return {
      dataPlane: 'DEVICE',
      authConfigured: true,
      serverPersistenceConfigured: false,
      supabaseConfigured,
      apiBase,
    };
  }

  if (serverPersistenceConfigured && supabaseConfigured && apiBase) {
    return {
      dataPlane: 'SERVER_SYNC',
      authConfigured,
      serverPersistenceConfigured: true,
      supabaseConfigured,
      apiBase: apiBase.replace(/\/$/, ''),
    };
  }

  return {
    dataPlane: 'UNCONFIGURED',
    authConfigured,
    serverPersistenceConfigured,
    supabaseConfigured,
    apiBase,
  };
}

export function jurnlProductionFailClosed(mode: 'design-preview' | 'production'): boolean {
  return mode === 'production' && resolveJurnlProductionConfig(mode).dataPlane === 'UNCONFIGURED';
}
