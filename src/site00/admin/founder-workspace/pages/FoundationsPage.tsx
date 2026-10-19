import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  foundationAdminApi,
  type FoundationAdminListRow,
  type ReferralSourceRow,
} from '../../services/foundationAdminApi';
import { intakeColumnStatusKind, normalizeIntakeColumnLabel } from '../data/intakeColumn';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

export function FoundationsPage() {
  const navigate = useNavigate();
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [rows, setRows] = useState<FoundationAdminListRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await foundationAdminApi.list();
      setRows(json.artifacts ?? []);
      setSources(json.referral_sources ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sourceById = useMemo(() => new Map(sources.map((s) => [s.referral_source_id, s])), [sources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (stateFilter !== 'ALL' && r.state !== stateFilter) return false;
      if (!q) return true;
      const name = (r.business_name ?? '').toLowerCase();
      return name.includes(q) || r.artifact_id.includes(q) || r.public_token.includes(q);
    });
  }, [rows, query, stateFilter]);

  const selected = filtered.find((r) => r.artifact_id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (selected && !selectedId) setSelectedId(selected.artifact_id);
  }, [selected, selectedId]);

  return (
    <FounderWorkspacePageFrame destination="foundations">
      <div className="ifw-foundations">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <div className="ifw-foundations__toolbar">
          <label className="ifw-field ifw-field--inline">
            <span className="ifw-field__label">Search</span>
            <input className="ifw-field__input fw-data" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or id" />
          </label>
          <label className="ifw-field ifw-field--inline">
            <span className="ifw-field__label">State</span>
            <select className="ifw-field__input" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              <option value="ALL">All</option>
              {[...new Set(rows.map((r) => r.state))].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('OL-07')}>
            Filter
          </button>
          <button type="button" className="ifw-btn ifw-btn--primary" onClick={() => openOverlay('OL-01')}>
            Create client
          </button>
        </div>

        <div className="ifw-foundations__workbench">
          <div className="ifw-registry" role="region" aria-label="Client registry">
            {loading ? <p className="ifw-muted">Loading…</p> : null}
            {!loading && !filtered.length ? <p className="ifw-muted">No records match</p> : null}
            <ul className="ifw-registry__list">
              {filtered.map((r) => (
                <li key={r.artifact_id}>
                  <button
                    type="button"
                    className={`ifw-registry-row ${selected?.artifact_id === r.artifact_id ? 'ifw-registry-row--selected' : ''}`.trim()}
                    onClick={() => setSelectedId(r.artifact_id)}
                    onDoubleClick={() => openOverlay('OL-19', { ...r, artifact_id: r.artifact_id })}
                  >
                    <span className="ifw-registry-row__name">{r.business_name || 'Unnamed'}</span>
                    <span className={`ifw-status ifw-status--${intakeColumnStatusKind(r)}`}>{normalizeIntakeColumnLabel(r)}</span>
                    <span className="ifw-registry-row__meta">{r.state}</span>
                    <span className="ifw-registry-row__meta">{r.payment_state}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="ifw-inspector" aria-label="Record inspector">
            {selected ? (
              <>
                <h2 className="ifw-inspector__title">{selected.business_name || 'Client record'}</h2>
                <dl className="ifw-kv">
                  <dt>Artifact</dt>
                  <dd className="fw-data">{selected.artifact_id}</dd>
                  <dt>Intake (G-01)</dt>
                  <dd>{normalizeIntakeColumnLabel(selected)}</dd>
                  <dt>Lifecycle</dt>
                  <dd>{selected.state}</dd>
                  <dt>Payment</dt>
                  <dd>{selected.payment_state}</dd>
                  <dt>Referral</dt>
                  <dd>{sourceById.get(selected.referral_source_id ?? '')?.label ?? '—'}</dd>
                </dl>
                <div className="ifw-actions-row">
                  <button
                    type="button"
                    className="ifw-btn ifw-btn--ghost"
                    onClick={() =>
                      openOverlay('OL-06', {
                        artifact_id: selected.artifact_id,
                        public_token: selected.public_token,
                      })
                    }
                  >
                    Row actions
                  </button>
                  <button
                    type="button"
                    className="ifw-btn ifw-btn--primary"
                    onClick={() => navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(selected.artifact_id))}
                  >
                    Open full record
                  </button>
                </div>
              </>
            ) : (
              <p className="ifw-muted">Select a client</p>
            )}
          </aside>
        </div>
      </div>
    </FounderWorkspacePageFrame>
  );
}
