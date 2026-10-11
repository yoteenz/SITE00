import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi } from '../../services/foundationAdminApi';
import './foundationOperations.css';

type ProjectSnapshot = {
  artifact?: { state?: string; payment_state?: string; completion_state?: string };
  lead?: { business_name?: string; contact_name?: string };
  runbook?: { status?: string } | null;
  tasks?: Array<{ task_id: string; status: string; title: string }>;
  stages?: Array<{ stage_code: string; status: string }>;
  client_actions?: Array<{ request_id: string; status: string; title: string }>;
  approvals?: Array<{ status: string }>;
  blockers?: Array<unknown>;
  verification_results?: Array<{ status?: string; outcome?: string }>;
  ownership_record?: unknown;
  forecast?: { projected_completion?: string } | null;
};
const fmt = (s: string | undefined) => s?.replace(/_/g, ' ').toUpperCase() || '—';
export default function FoundationProjectCommandPage() {
  const { id = '' } = useParams();
  const [snap, setSnap] = useState<ProjectSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    if (!id) { setError('PROJECT IDENTIFIER IS MISSING.'); setLoading(false); return; }
    setLoading(true); setError(null);
    foundationAdminApi.projectCommand(id)
      .then((data) => { if (active) setSnap(data as ProjectSnapshot); })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, refresh]);
  const tasks = snap?.tasks ?? [];
  const stages = snap?.stages ?? [];
  const actions = snap?.client_actions ?? [];
  const complete = tasks.filter((t) => t.status === 'COMPLETE' || t.status === 'VERIFIED').length;
  return <main className="df-ops">
    <div className="df-ops__breadcrumb"><Link to={SITE00_ROUTES.digitalFoundationPipeline}>FOUNDATION / PIPELINE</Link><span>/</span><span>PROJECT COMMAND</span></div>
    <header className="df-ops__hero"><div>
      <span className="df-ops__eyebrow">SITE 00 / DIGITAL FOUNDATION / PROJECT AUTHORITY</span>
      <h1>PROJECT<br />COMMAND<span className="df-ops__red">.</span></h1>
      <p className="df-ops__lede">A SINGLE READ-ONLY VIEW OF THE FOUNDATION, EXECUTION STATUS, REQUIRED CLIENT INPUT AND VERIFICATION.</p>
    </div><div className="df-ops__progress"><span className="df-ops__eyebrow">EXECUTION STATUS</span><strong>{tasks.length ? Math.round(complete / tasks.length * 100) : 0}<small>%</small></strong><span>{complete} / {tasks.length} TASKS COMPLETE</span><div className="df-ops__meter"><span style={{width: `${tasks.length ? complete / tasks.length * 100 : 0}%`}} /></div></div></header>
    <div className="df-ops__toolbar"><Link to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', id)}>OPEN EXECUTION WORKBENCH ↗</Link><Link to={SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', id)}>OPEN ARTIFACT ↗</Link><button type="button" onClick={() => setRefresh(n => n + 1)}>REFRESH ↗</button></div>
    {loading && <p className="df-ops__notice" role="status">LOADING PROJECT COMMAND…</p>}
    {error && <p className="df-ops__notice df-ops__notice--error" role="alert">{error}</p>}
    {!loading && !error && snap && <>
      <div className="df-ops__metric-grid">
        <article><small>PROJECT</small><strong>{snap.lead?.business_name || 'UNNAMED FOUNDATION'}</strong><span>{fmt(snap.artifact?.state)}</span></article>
        <article><small>PAYMENT</small><strong>{fmt(snap.artifact?.payment_state)}</strong><span>RECORDED TRANSACTION STATE</span></article>
        <article><small>CLIENT ACTIONS</small><strong>{actions.filter(a => a.status === 'OPEN').length}</strong><span>OPEN REQUESTS</span></article>
        <article><small>BLOCKERS</small><strong>{snap.blockers?.length ?? 0}</strong><span>EXECUTION ATTENTION</span></article>
      </div>
      <div className="df-ops__layout">
        <section className="df-ops__list"><div className="df-ops__section-head"><div><span className="df-ops__eyebrow">EXECUTION MAP</span><h2>PROJECT STAGES</h2></div><span>{stages.length} STAGES</span></div>
          {stages.length === 0 && <p className="df-ops__empty">STAGES WILL APPEAR WHEN THE PROJECT RUNBOOK IS READY.</p>}
          {stages.map((stage, i) => <div className="df-ops__command-stage" key={stage.stage_code}><span className="df-ops__task-index">{String(i + 1).padStart(2, '0')}</span><strong>{fmt(stage.stage_code)}</strong><span>{fmt(stage.status)}</span></div>)}
        </section>
        <aside className="df-ops__inspector"><span className="df-ops__eyebrow">PROJECT RECORD</span><h2>WHAT'S NEXT.</h2>
          <dl><div><dt>RUNBOOK</dt><dd>{snap.runbook ? fmt(snap.runbook.status) : 'NOT YET CREATED'}</dd></div>
          <div><dt>VERIFICATION RECORDS</dt><dd>{snap.verification_results?.length ?? 0}</dd></div>
          <div><dt>OWNERSHIP RECORD</dt><dd>{snap.ownership_record ? 'ON RECORD' : 'NOT YET AVAILABLE'}</dd></div>
          <div><dt>OPEN APPROVALS</dt><dd>{(snap.approvals ?? []).filter(a => a.status !== 'APPROVED' && a.status !== 'COMPLETED').length}</dd></div></dl>
          <Link className="df-ops__inspector-link" to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', id)}>REVIEW TASKS AND DEPENDENCIES ↗</Link>
          <p className="df-ops__footnote">ALL INFORMATION IS READ FROM THE CURRENT PROJECT SNAPSHOT. NO COMPLETION CLAIMS ARE INFERRED.</p>
        </aside>
      </div>
      {actions.filter(a => a.status === 'OPEN').length > 0 && <section className="df-ops__attention"><span className="df-ops__eyebrow">CLIENT ACTION QUEUE</span>{actions.filter(a => a.status === 'OPEN').map(a => <p key={a.request_id}>{a.title}</p>)}</section>}
    </>}
  </main>;
}
