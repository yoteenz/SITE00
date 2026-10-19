import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  foundationAdminApi,
  type FoundationAdminListRow,
  type ReferralSourceRow,
} from '../../services/foundationAdminApi';
import { normalizeIntakeColumnLabel } from '../data/intakeColumn';
import { useRegistryFilters } from '../data/registryFilters';
import { FoundationsRegistry } from '../foundations/FoundationsRegistry';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

function sortRows(rows: FoundationAdminListRow[], sortKey: 'name' | 'activity' | 'lifecycle'): FoundationAdminListRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sortKey === 'name') {
      return (a.business_name ?? '').localeCompare(b.business_name ?? '', undefined, { sensitivity: 'base' });
    }
    if (sortKey === 'lifecycle') {
      return a.state.localeCompare(b.state);
    }
    const ta = Date.parse(a.last_activity_at ?? a.created_at);
    const tb = Date.parse(b.last_activity_at ?? b.created_at);
    return tb - ta;
  });
  return copy;
}

export function FoundationsPage() {
  const navigate = useNavigate();
  const { openOverlay } = useFounderWorkspaceOverlay();
  const { query, stateFilter, sortKey, setQuery, setStateFilter } = useRegistryFilters();
  const [rows, setRows] = useState<FoundationAdminListRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
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
    const base = rows.filter((r) => {
      if (stateFilter !== 'ALL' && r.state !== stateFilter) return false;
      if (!q) return true;
      const name = (r.business_name ?? '').toLowerCase();
      return name.includes(q) || r.artifact_id.includes(q) || r.public_token.includes(q);
    });
    return sortRows(base, sortKey);
  }, [rows, query, stateFilter, sortKey]);

  const selected = filtered.find((r) => r.artifact_id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (selected && !selectedId) setSelectedId(selected.artifact_id);
  }, [selected, selectedId]);

  const stateOptions = useMemo(() => [...new Set(rows.map((r) => r.state))], [rows]);

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
            <input
              className="ifw-field__input fw-data"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or id"
            />
          </label>
          <label className="ifw-field ifw-field--inline">
            <span className="ifw-field__label">State</span>
            <select className="ifw-field__input" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              <option value="ALL">All</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
          <button
            type="button"
            className="ifw-btn ifw-btn--ghost"
            onClick={() =>
              openOverlay('OL-07', {
                lifecycle_states: stateOptions,
              })
            }
          >
            Filter & sort
          </button>
          <button type="button" className="ifw-btn ifw-btn--primary" onClick={() => openOverlay('OL-01')}>
            Create client
          </button>
        </div>

        <div className="ifw-foundations__workbench">
          <FoundationsRegistry
            rows={filtered}
            selectedId={selectedId}
            loading={loading}
            onSelect={setSelectedId}
            onRowActions={(r) =>
              openOverlay('OL-06', {
                artifact_id: r.artifact_id,
                public_token: r.public_token,
              })
            }
          />

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
