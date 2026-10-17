import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import './foundationOperations.css';

const label = (v: string | null | undefined) => v?.replace(/_/g, ' ').toUpperCase() || '—';
export default function FoundationPipelinePage() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attention, setAttention] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    foundationAdminApi.pipeline()
      .then((data) => { if (active) setRows(data.rows ?? []); })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  const flagged = rows.filter((row) => Boolean(row.blocker || row.next_action)).length;
  const visible = useMemo(() => rows.filter((row) => {
    if (attention && !(row.blocker || row.next_action)) return false;
    const s = [row.business_name, row.payment_state, row.current_stage, row.next_action, row.blocker].join(' ').toLowerCase();
    return s.includes(search.trim().toLowerCase());
  }), [rows, attention, search]);

  return <main className="df-ops">
    <div className="df-ops__breadcrumb"><Link to={SITE00_ROUTES.digitalFoundationAdmin}>FOUNDATION / ALL ARTIFACTS</Link><span>/</span><span>PIPELINE</span></div>
    <header className="df-ops__hero"><div>
      <span className="df-ops__eyebrow">SITE 00 / DIGITAL FOUNDATION / FOUNDER OPERATIONS</span>
      <h1>PROJECT<br />PIPELINE<span className="df-ops__red">.</span></h1>
      <p className="df-ops__lede">YOUR LIVE FOUNDATION PROJECTS, ORGANIZED BY THE NEXT DECISION THAT NEEDS ATTENTION.</p>
    </div><div className="df-ops__progress"><span className="df-ops__eyebrow">PROJECTS IN VIEW</span><strong>{rows.length}</strong><span>{flagged} WITH NEXT ACTIONS OR BLOCKERS</span></div></header>
    <div className="df-ops__toolbar">
      <label className="df-ops__search">SEARCH PROJECTS <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="BUSINESS, STAGE OR STATUS" /></label>
      <button type="button" className={attention ? 'is-active' : ''} aria-pressed={attention} onClick={() => setAttention(!attention)}>NEEDS ATTENTION · {flagged}</button>
      <button type="button" onClick={() => setRefresh((n) => n + 1)}>REFRESH ↗</button>
    </div>
    {loading && <p className="df-ops__notice" role="status">LOADING THE LIVE PIPELINE…</p>}
    {error && <p className="df-ops__notice df-ops__notice--error" role="alert">{error}</p>}
    {!loading && !error && <section className="df-ops__list" aria-label="Digital Foundation projects">
      <div className="df-ops__section-head"><div><span className="df-ops__eyebrow">LIVE PROJECT INDEX</span><h2>FOUNDATIONS / {visible.length}</h2></div><span>FOUNDER WORKSPACE</span></div>
      {visible.length === 0 && <p className="df-ops__empty">NO PROJECTS MATCH THIS VIEW.</p>}
      {visible.map((row, idx) => <article key={row.artifact_id} className="df-ops__pipeline-row">
        <span className="df-ops__task-index">{String(idx + 1).padStart(2, '0')}</span>
        <div className="df-ops__pipeline-main"><h3>{label(row.business_name) === '—' ? 'UNNAMED FOUNDATION' : row.business_name}</h3><span>{label(row.current_stage)} · {label(row.payment_state)}</span></div>
        <div className="df-ops__pipeline-next"><small>NEXT ACTION</small><strong>{label(row.next_action)}</strong>{row.blocker && <span className="df-ops__blocker">BLOCKER · {label(row.blocker)}</span>}</div>
        <div className="df-ops__pipeline-links"><Link to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', row.artifact_id)}>PROJECT COMMAND ↗</Link><Link to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', row.artifact_id)}>WORKBENCH ↗</Link></div>
      </article>)}
    </section>}
  </main>;
}
