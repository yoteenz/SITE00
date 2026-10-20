import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  digitalFoundationClientIntakePath,
  foundationAdminApi,
  type FoundationAdminListRow,
  type PipelineRow,
  type ReferralSourceRow,
} from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { FOUNDATION_VIEWS, SORT_LABEL, inView, needsFounder, sortFoundationRows, toFoundationRows, viewLabel, type FoundationRow } from '../data/foundationViews';
import { useRegistryFilters } from '../data/registryFilters';
import { FoundationsRegistry } from '../foundations/FoundationsRegistry';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useInspectorDocked } from '../shell/useWorkspaceTier';
import { ClientInspector } from '../inspectors/Inspectors';
import {
  WsBanner,
  WsButton,
  WsEmpty,
  WsIcon,
  WsKbd,
  WsSearch,
  WsTabs,
  WsTechDetail,
} from '../shell/wsKit';

/**
 * 02 FOUNDATIONS — OPUS2 D-03 / TP-03 / TL-03 / C-05: toolbar (search · status views · filter/sort),
 * registry, client inspector (docked ≥ 1100, right sheet / phone sheet below), registry foot.
 * Data: admin list (+ referral sources) and pipeline. Triggers kept: OL-01 create · OL-06 row actions · OL-07 filter/sort.
 */
export function FoundationsPage() {
  const navigate = useNavigate();
  const docked = useInspectorDocked();
  const { openOverlay, pushToast } = useFounderWorkspaceOverlay();
  const { query, stateFilter, sortKey, setQuery, setStateFilter } = useRegistryFilters();
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[] | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [sources, setSources] = useState<ReferralSourceRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, pipe] = await Promise.allSettled([foundationAdminApi.list(), foundationAdminApi.pipeline()]);
      if (list.status === 'rejected') throw list.reason;
      setArtifacts(list.value.artifacts ?? []);
      setSources(list.value.referral_sources ?? []);
      setPipeline(pipe.status === 'fulfilled' ? (pipe.value.rows ?? []) : []);
      setLoadedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => toFoundationRows(artifacts ?? [], pipeline), [artifacts, pipeline]);
  const sourceById = useMemo(() => new Map(sources.map((s) => [s.referral_source_id, s])), [sources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = rows.filter((r) => {
      if (!inView(r, stateFilter)) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.artifact_id.includes(q) || r.public_token.includes(q);
    });
    return sortFoundationRows(base, sortKey);
  }, [rows, query, stateFilter, sortKey]);

  const selected: FoundationRow | null = filtered.find((r) => r.artifact_id === selectedId) ?? (docked ? filtered[0] : null) ?? null;
  const stateOptions = useMemo(() => [...new Set(rows.map((r) => r.state))], [rows]);
  const counts = useMemo(() => Object.fromEntries(FOUNDATION_VIEWS.map((v) => [v.id, rows.filter((r) => inView(r, v.id)).length])), [rows]);
  const active = rows.filter((r) => r.life.kind !== 'done' && r.life.kind !== 'idle').length;
  const needs = rows.filter(needsFounder).length;
  const isRawState = !FOUNDATION_VIEWS.some((v) => v.id === stateFilter);

  const select = (id: string) => {
    setSelectedId(id);
    // Below the dock width the preview is the OL-19 client preview sheet (right sheet on tablet, bottom sheet on phone).
    if (!docked) {
      const r = rows.find((x) => x.artifact_id === id);
      if (r)
        openOverlay('OL-19', {
          artifact_id: r.artifact_id,
          public_token: r.public_token,
          business_name: r.business_name,
          state: r.state,
          payment_state: r.payment_state,
          intake_state: r.intake_state,
          created_at: r.created_at,
          last_activity_at: r.last_activity_at,
          referral: sourceById.get(r.referral_source_id ?? '')?.label ?? null,
        });
    }
  };
  const open = (id: string) => navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(id));

  // Keyboard grammar from the authority foot: J / K move · ↵ open · / search.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (document.querySelector('[data-ifw-overlay]')) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key !== 'j' && e.key !== 'k') return;
      if (!filtered.length) return;
      const i = Math.max(0, filtered.findIndex((r) => r.artifact_id === selected?.artifact_id));
      const next = filtered[Math.min(filtered.length - 1, Math.max(0, i + (e.key === 'j' ? 1 : -1)))];
      setSelectedId(next.artifact_id);
      document.querySelector<HTMLElement>(`[data-artifact-id="${next.artifact_id}"]`)?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, selected]);

  const copyLink = (r: FoundationRow) => {
    const link = `${window.location.origin}${digitalFoundationClientIntakePath(r.public_token)}`;
    void navigator.clipboard.writeText(link).then(
      () => pushToast('PERSONAL LINK COPIED', 'ok'),
      () => pushToast('COPY FAILED · THE BROWSER BLOCKED CLIPBOARD ACCESS', 'error'),
    );
  };

  const subtitle = loading && !artifacts ? 'LOADING FOUNDATIONS…' : error && !artifacts ? 'THE REGISTRY COULD NOT LOAD' : `${rows.length} FOUNDATIONS · ${active} ACTIVE · ${needs} NEED YOU`;

  const inspector =
    selected && docked ? (
      <ClientInspector
        row={selected}
        referral={sourceById.get(selected.referral_source_id ?? '')?.label ?? null}
        onClose={undefined}
        onOpen={() => open(selected.artifact_id)}
        onCopy={() => copyLink(selected)}
        onMore={() => openOverlay('OL-06', { artifact_id: selected.artifact_id, public_token: selected.public_token, business_name: selected.name })}
      />
    ) : null;

  let body;
  if (error && !artifacts) {
    body = (
      <>
        <WsBanner tone="red" icon="warning">
          THE REGISTRY COULD NOT LOAD · THE FOUNDATION LIST REQUEST FAILED. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={() => void load()}>
            RETRY
          </WsButton>
        </div>
        <WsTechDetail action="list · pipeline" message={error} open onOpen={() => openOverlay('OL-20', { action: 'list · pipeline', message: error, status: 'REQUEST FAILED' })} />
      </>
    );
  } else if (!loading && rows.length === 0) {
    body = (
      <WsEmpty
        label="NO FOUNDATIONS YET"
        title="CREATE THE FIRST FOUNDATION"
        action={
          <WsButton tone="red" icon="add" onClick={() => openOverlay('OL-01')}>
            NEW FOUNDATION
          </WsButton>
        }
      >
        A FOUNDATION CREATES THE CLIENT ARTIFACT AND A PERSONAL LINK. NOTHING IS EMAILED UNTIL YOU SEND IT.
      </WsEmpty>
    );
  } else if (!loading && filtered.length === 0) {
    body = (
      <WsEmpty
        label="NO MATCHES"
        title={
          query ? (
            <>
              NO FOUNDATION MATCHES “<span className="ws-data">{query}</span>”
            </>
          ) : (
            `NO FOUNDATION IN ${viewLabel(stateFilter)}`
          )
        }
        action={
          <WsButton
            tone="out"
            size="sm"
            onClick={() => {
              setQuery('');
              setStateFilter('ALL');
            }}
          >
            CLEAR SEARCH + VIEW
          </WsButton>
        }
      >
        SEARCH LOOKS AT CLIENT NAME, ARTIFACT ID AND PERSONAL LINK TOKEN. CLEAR THE SEARCH OR THE STATUS VIEW.
      </WsEmpty>
    );
  } else {
    body = (
      <>
        {error ? (
          <div style={{ marginBottom: 12 }}>
            <WsBanner tone="red" icon="warning">
              THE REGISTRY COULD NOT REFRESH · SHOWING THE LIST FROM {loadedAt ? new Date(loadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'THE LAST LOAD'}. NOTHING WAS CHANGED.
            </WsBanner>
          </div>
        ) : null}
        <FoundationsRegistry
          rows={filtered}
          selectedId={selected?.artifact_id ?? null}
          loading={loading}
          onSelect={select}
          onOpen={open}
          sortLabel={SORT_LABEL[sortKey]}
          onRowActions={(r) => openOverlay('OL-06', { artifact_id: r.artifact_id, public_token: r.public_token, business_name: r.name })}
        />
      </>
    );
  }

  return (
    <FounderWorkspacePageFrame
      destination="foundations"
      subtitle={subtitle}
      hideActionsOnPhone
      inspector={inspector}
      actions={
        <>
          <WsButton tone="out" size="sm" icon="retry" busy={loading && Boolean(artifacts)} onClick={() => void load()}>
            REFRESH
          </WsButton>
          <WsButton tone="red" size="sm" icon="add" onClick={() => openOverlay('OL-01')}>
            NEW FOUNDATION
          </WsButton>
        </>
      }
    >
      <div className="reg-toolbar">
        <WsSearch value={query} onChange={setQuery} placeholder="NAME, ARTIFACT OR LINK TOKEN" inputRef={searchRef} ariaLabel="SEARCH FOUNDATIONS" />
        <WsTabs
          label="STATUS VIEWS"
          value={isRawState ? 'ALL' : stateFilter}
          onChange={setStateFilter}
          items={FOUNDATION_VIEWS.map((v) => ({ id: v.id as string, label: v.label, count: v.id === 'ALL' || v.id === 'VIEW:NEEDS_YOU' ? counts[v.id] : counts[v.id] || '' }))}
        />
        <span className="reg-toolbar__tools">
          <span data-anchor="filter">
            <button type="button" className="ws-btn ws-btn--out ws-btn--sm" onClick={() => openOverlay('OL-07', { lifecycle_states: stateOptions })} aria-label="FILTER">
              <WsIcon name="filter" />
              <span className="lbl">{isRawState ? `FILTER · ${stateFilter.replace(/_/g, ' ')}` : 'FILTER'}</span>
            </button>
          </span>
          <span data-anchor="sort">
            <button type="button" className="ws-btn ws-btn--out ws-btn--sm" onClick={() => openOverlay('OL-07', { lifecycle_states: stateOptions, focus: 'sort' })} aria-label={`SORT · ${SORT_LABEL[sortKey]}`}>
              <svg className="ws-ic" viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16 }}>
                <path d="m7 10 5-5 5 5M7 14l5 5 5-5" />
              </svg>
              <span className="lbl">SORT · {SORT_LABEL[sortKey]}</span>
            </button>
          </span>
        </span>
      </div>
      <div className="reg-box">{body}</div>
      {rows.length ? (
        <div className="reg-foot">
          <span className="ws-meta">
            {filtered.length} OF {rows.length}
            {stateFilter !== 'ALL' ? ` · ${viewLabel(stateFilter)}` : ''}
            {query ? ' · SEARCH ON' : ''}
          </span>
          <span className="ws-meta">
            <WsKbd>J</WsKbd> <WsKbd>K</WsKbd> MOVE · <WsKbd>↵</WsKbd> OPEN · <WsKbd>/</WsKbd> SEARCH
          </span>
        </div>
      ) : null}
    </FounderWorkspacePageFrame>
  );
}

