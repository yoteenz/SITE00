import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { DfaCta, DfaIcon, DfaNote, DfaPill, DfaShell, DfaStatus, type DfaGlyph, type DfaTone } from '../../../foundation-authority/DfAuthority';
import { foundationAdminApi, type PipelineAttentionKey, type PipelineRow } from '../../services/foundationAdminApi';
import { foundationOpsMenu, opsLabel } from './foundationOpsMenu';
import './foundationOperations.css';

const ROW_GLYPHS: DfaGlyph[] = ['cube', 'layers', 'document'];
const RECENT_LIMIT = 3;
type Attention = Partial<Record<PipelineAttentionKey, PipelineRow[]>>;

function rowStatus(row: PipelineRow, waitingClient: Set<string>): { tone: DfaTone; text: string } {
  if (row.blocker) return { tone: 'alert', text: 'BLOCKED' };
  if (waitingClient.has(row.artifact_id)) return { tone: 'alert', text: 'NEEDS CLIENT' };
  return { tone: 'ok', text: opsLabel(row.current_stage ?? row.artifact_state) };
}

export default function FoundationPipelinePage() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [attentionMap, setAttentionMap] = useState<Attention>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attention, setAttention] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    foundationAdminApi.pipeline()
      .then((data) => { if (active) { setRows(data.rows ?? []); setAttentionMap(data.attention ?? {}); } })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  const flagged = rows.filter((row) => Boolean(row.blocker || row.next_action)).length;
  const waitingClient = useMemo(() => new Set((attentionMap.waiting_clients ?? []).map((r) => r.artifact_id)), [attentionMap]);
  const visible = useMemo(() => rows.filter((row) => {
    if (attention && !(row.blocker || row.next_action)) return false;
    const s = [row.business_name, row.payment_state, row.current_stage, row.next_action, row.blocker].join(' ').toLowerCase();
    return s.includes(search.trim().toLowerCase());
  }), [rows, attention, search]);
  const ready = !loading && !error;
  const stats = [
    { label: 'OPENED', value: rows.length },
    { label: 'QUOTED', value: rows.filter((r) => r.quote_amount_minor != null).length },
    { label: 'ACTIVE', value: rows.filter((r) => r.payment_state === 'PAID').length, red: true },
    { label: 'NEEDS YOU', value: attentionMap.needs_founder?.length ?? 0, red: true },
  ];
  const lead = visible[0];
  const filtered = attention || search.trim() !== '';
  const shown = showAll || filtered ? visible : visible.slice(0, RECENT_LIMIT);
  const hiddenCount = visible.length - shown.length;

  return (
    <DfaShell code="13" kicker="FOUNDATION PIPELINE" title={['FOUNDATION PIPELINE']}
      lede="PORTFOLIO VISIBILITY FOR ACTIVE FOUNDATIONS." plate="d01" footCode="D01" authority="desktop"
      menu={foundationOpsMenu('pipeline')}>
      <div className="dfo dfo--pipeline">
        <dl className="dfo-stats" aria-label="Pipeline totals" aria-busy={loading}>
          {stats.map((s) => (
            <div key={s.label} className={s.red ? 'is-red' : undefined}>
              <dd>{ready ? s.value : '—'}</dd><dt>{s.label}</dt>
            </div>
          ))}
        </dl>
        <div className="dfo-head">
          <p className="dfa-label">PROJECTS <small>(RECENT ACTIVITY)</small></p>
          <div className="dfo-tools">
            <label className="dfo-search">
              <DfaIcon name="search" />
              <span className="dfo-sr">Search projects</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH" />
            </label>
            <button type="button" className={attention ? 'is-active' : ''} aria-pressed={attention} onClick={() => setAttention(!attention)}>
              <span className="dfo-tools__long">NEEDS </span>ATTENTION · {flagged}
            </button>
            {rows.length > RECENT_LIMIT && (
              <button type="button" className={showAll ? 'is-active' : ''} aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>
                <span className="dfo-tools__long">SHOW </span>ALL · {rows.length}
              </button>
            )}
            <button type="button" onClick={() => setRefresh((n) => n + 1)} aria-label="Refresh pipeline">REFRESH</button>
          </div>
        </div>
        {loading && <DfaStatus kind="loading">LOADING THE LIVE PIPELINE…</DfaStatus>}
        {error && <DfaStatus kind="error">{error}</DfaStatus>}
        {ready && visible.length === 0 && (
          <DfaStatus kind="empty">{rows.length === 0 ? 'NO FOUNDATION PROJECTS HAVE BEEN OPENED YET.' : 'NO PROJECTS MATCH THIS VIEW.'}</DfaStatus>
        )}
        {ready && visible.length > 0 && (
          <div className="dfa-rows dfa-rows--box dfo-pipeline-rows" aria-label="Digital Foundation projects">
            {shown.map((row, i) => {
              const status = rowStatus(row, waitingClient);
              return (
                <Link key={row.artifact_id} className="dfa-row" to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', row.artifact_id)}>
                  <span className="dfa-row__icon"><DfaIcon name={ROW_GLYPHS[i % ROW_GLYPHS.length]} className="dfa-ico" /></span>
                  <span className="dfa-row__main">
                    <strong>{row.business_name?.trim() ? row.business_name.toUpperCase() : 'UNNAMED FOUNDATION'}</strong>
                    {(row.next_action || row.blocker) && (
                      <small>{row.blocker ? `BLOCKER · ${opsLabel(row.blocker)}` : `NEXT · ${row.next_action!.toUpperCase()}`}</small>
                    )}
                  </span>
                  <span className="dfa-row__side"><DfaPill tone={status.tone}>{status.text}</DfaPill></span>
                  <span className="dfa-row__chev"><DfaIcon name="chevron" className="dfa-chev" /></span>
                </Link>
              );
            })}
          </div>
        )}
        {ready && hiddenCount > 0 && <p className="dfo-sr" aria-live="polite">{hiddenCount} more projects hidden. Use SHOW ALL to list every project.</p>}
        <div className="dfo-cta">
          <DfaCta to={lead ? SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', lead.artifact_id) : undefined} disabled={!lead}>
            VIEW PROJECT COMMAND
          </DfaCta>
        </div>
        <DfaNote>PORTFOLIO DATA IS READ FROM THE LIVE PIPELINE.</DfaNote>
      </div>
    </DfaShell>
  );
}
