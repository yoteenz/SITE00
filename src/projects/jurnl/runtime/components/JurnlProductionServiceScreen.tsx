/** Shown when JURNL production data plane is not configured (fail closed — no demo fallback). */
import { resolveJurnlProductionConfig } from '../../data/production/productionConfig';

export function JurnlProductionServiceScreen() {
  const cfg = resolveJurnlProductionConfig('production');
  return (
    <div className="jrn" data-jurnl-screen="F01.SERVICE" data-jurnl-data-plane="UNCONFIGURED" lang="en">
      <main className="jrn-screen jrn-entry" role="main">
        <h1 className="jrn-h1">JURNL SERVICE UNAVAILABLE</h1>
        <p className="jrn-body">PRODUCTION PERSISTENCE IS NOT CONFIGURED FOR THIS ENVIRONMENT.</p>
        <ul className="jrn-body">
          <li>SUPABASE: {cfg.supabaseConfigured ? 'OK' : 'MISSING'}</li>
          <li>API BASE: {cfg.apiBase ? 'OK' : 'MISSING'}</li>
          <li>SERVER PERSISTENCE FLAG: {cfg.serverPersistenceConfigured ? 'ON' : 'OFF'}</li>
        </ul>
        <p className="jrn-caption">CONTACT SUPPORT IF THIS PERSISTS. YOUR DEVICE DATA IS NOT SYNCED UNTIL SERVICE IS ENABLED.</p>
      </main>
    </div>
  );
}
