/** Shown when JURNL production data plane is not configured (fail closed — no demo fallback). */
import { resolveJurnlProductionConfig } from '../../data/production/productionConfig';

export function JurnlProductionServiceScreen() {
  const cfg = resolveJurnlProductionConfig('production');
  return (
    <div className="jrn" data-jurnl-screen="F01.SERVICE" data-jurnl-data-plane="UNCONFIGURED" lang="en">
      <main className="jrn-screen jrn-entry" role="main">
        <h1 className="jrn-h1">JURNL SERVICE UNAVAILABLE</h1>
        <p className="jrn-body">Production persistence is not configured for this environment.</p>
        <ul className="jrn-body">
          <li>Supabase: {cfg.supabaseConfigured ? 'OK' : 'MISSING'}</li>
          <li>API base: {cfg.apiBase ? 'OK' : 'MISSING'}</li>
          <li>Server persistence flag: {cfg.serverPersistenceConfigured ? 'ON' : 'OFF'}</li>
        </ul>
        <p className="jrn-caption">Contact support if this persists. Your device data is not synced until service is enabled.</p>
      </main>
    </div>
  );
}
