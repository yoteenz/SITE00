import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { DfaCta, DfaIcon, DfaNote, DfaShell, DfaStatus, type DfaGlyph } from '../../../foundation-authority/DfAuthority';
import { foundationAdminApi } from '../../services/foundationAdminApi';
import { foundationOpsMenu, opsLabel } from './foundationOpsMenu';
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
const DONE = new Set(['COMPLETE', 'VERIFIED']);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 'S'}`;

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
  const openActions = actions.filter((a) => a.status === 'OPEN');
  const approvals = snap?.approvals ?? [];
  const approvedCount = approvals.filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED').length;
  const openApprovals = approvals.length - approvedCount;
  const blockers = snap?.blockers?.length ?? 0;
  const complete = tasks.filter((t) => DONE.has(t.status)).length;
  const currentStage = stages.find((s) => !DONE.has(s.status)) ?? stages[stages.length - 1];
  const workbench = SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', encodeURIComponent(id));
  const artifact = SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', encodeURIComponent(id));

  const rows: { icon: DfaGlyph; label: string; value: string; to: string }[] = snap ? [
    { icon: 'gear', label: 'CURRENT STAGE', value: currentStage ? opsLabel(currentStage.stage_code) : 'NOT YET STARTED', to: workbench },
    { icon: 'card', label: 'PAYMENT', value: opsLabel(snap.artifact?.payment_state), to: artifact },
    { icon: 'document', label: 'RUNBOOK', value: snap.runbook ? `${plural(tasks.length, 'TASK')} · ${complete} COMPLETE` : 'NOT YET CREATED', to: workbench },
    { icon: 'user', label: 'NEEDS YOU', value: blockers ? `${plural(blockers, 'BLOCKER')}` : 'NONE ACTIVE', to: `${workbench}?queue=blocked` },
    { icon: 'checkCircle', label: 'APPROVALS', value: approvals.length ? `${approvedCount} COMPLETE${openApprovals ? ` · ${openApprovals} OPEN` : ''}` : 'NONE REQUESTED', to: artifact },
  ] : [];

  return (
    <DfaShell code="14" kicker="PROJECT COMMAND" title={['PROJECT COMMAND']} plate="d02" footCode="D02" authority="desktop"
      menu={foundationOpsMenu('command', id)}>
      <div className="dfo dfo--command">
        {loading && <DfaStatus kind="loading">LOADING PROJECT COMMAND…</DfaStatus>}
        {error && <DfaStatus kind="error">{error}</DfaStatus>}
        {!loading && !error && snap && (
          <>
            <div className="dfo-client">
              <span className="dfo-client__icon"><DfaIcon name="cube" /></span>
              <div className="dfo-client__name">
                <small>CLIENT</small>
                <strong>{snap.lead?.business_name?.trim() ? snap.lead.business_name.toUpperCase() : 'UNNAMED FOUNDATION'}</strong>
              </div>
              <button type="button" className="dfo-textbtn" onClick={() => setRefresh((n) => n + 1)}>REFRESH</button>
            </div>
            <div className="dfa-rows dfa-rows--ruled dfo-command-rows">
              {rows.map((r) => (
                <Link key={r.label} className="dfa-row" to={r.to}>
                  <span className="dfa-row__icon"><DfaIcon name={r.icon} className="dfa-ico" /></span>
                  <span className="dfa-row__main dfo-kv"><small>{r.label}</small><strong>{r.value}</strong></span>
                  <span />
                  <span className="dfa-row__chev"><DfaIcon name="chevron" className="dfa-chev" /></span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="dfo-cta dfo-cta--full">
        <DfaCta to={id ? workbench : undefined} disabled={!id}>OPEN EXECUTION WORKBENCH</DfaCta>
      </div>
      <DfaNote>READ FROM THE CURRENT PROJECT SNAPSHOT. NO COMPLETION CLAIMS ARE INFERRED.</DfaNote>
      {!loading && !error && snap && (
        <details className="dfo-more">
          <summary>
            <span>PROJECT RECORD</span>
            <small>{plural(stages.length, 'STAGE')} · {plural(openActions.length, 'OPEN CLIENT ACTION')}</small>
          </summary>
          <div className="dfo-more__grid">
            <section aria-label="Project stages">
              <h2>STAGES</h2>
              {stages.length === 0 && <p>STAGES WILL APPEAR WHEN THE PROJECT RUNBOOK IS READY.</p>}
              <ol>{stages.map((s) => <li key={s.stage_code}><span>{opsLabel(s.stage_code)}</span><b>{opsLabel(s.status)}</b></li>)}</ol>
            </section>
            <section aria-label="Project record">
              <h2>RECORD</h2>
              <dl>
                <div><dt>ARTIFACT STATE</dt><dd>{opsLabel(snap.artifact?.state)}</dd></div>
                <div><dt>COMPLETION</dt><dd>{opsLabel(snap.artifact?.completion_state)}</dd></div>
                <div><dt>VERIFICATION RECORDS</dt><dd>{snap.verification_results?.length ?? 0}</dd></div>
                <div><dt>OWNERSHIP RECORD</dt><dd>{snap.ownership_record ? 'ON RECORD' : 'NOT YET AVAILABLE'}</dd></div>
                <div><dt>PROJECTED COMPLETION</dt><dd>{snap.forecast?.projected_completion?.toUpperCase() ?? '—'}</dd></div>
              </dl>
              {openActions.length > 0 && (
                <>
                  <h2>CLIENT ACTION QUEUE</h2>
                  <ul>{openActions.map((a) => <li key={a.request_id}><span>{a.title.toUpperCase()}</span><b>OPEN</b></li>)}</ul>
                </>
              )}
            </section>
          </div>
        </details>
      )}
    </DfaShell>
  );
}
