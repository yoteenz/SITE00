import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { foundationAdminApi, digitalFoundationClientIntakePath, type FoundationAdminListRow, type PipelineRow } from '../../../services/foundationAdminApi';
import { foundationReadinessApi } from '../../../services/foundationReadinessApi';
import { FOUNDER_WORKSPACE_SIDEBAR_NAV } from '../../config/navigation';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../../config/routes';
import { intentChip } from '../../data/emailIntents';
import { FOUNDATION_VIEWS, SORT_LABEL, toFoundationRows, type FoundationRow } from '../../data/foundationViews';
import { STAGES, stageIndex, type OpsTask } from '../../data/opsTasks';
import { useRegistryFilters, type RegistrySortKey } from '../../data/registryFilters';
import type { SystemModule } from '../../data/systemModules';
import { ClientInspector, ModuleInspector, TaskInspector } from '../../inspectors/Inspectors';
import { useFounderWorkspaceOverlay } from '../../overlay/OverlayContext';
import type { WorkspaceOverlayId } from '../../overlay/overlayRegistry';
import {
  WsActivity,
  WsBanner,
  WsButton,
  WsCheck,
  WsChip,
  WsChoice,
  WsChoiceGroup,
  WsCopyLink,
  WsField,
  WsIcon,
  WsInput,
  WsKbd,
  WsKv,
  WsLinkButton,
  WsPlate,
  WsTextarea,
} from '../../shell/wsKit';
import { OverlayFormShell } from './OverlayFormShell';
import { WorkspaceMenuRows } from './WorkspaceMenuRows';

type Props = {
  id: WorkspaceOverlayId;
  payload?: Record<string, unknown>;
  onClose: () => void;
  markDirty: (dirty: boolean) => void;
};

const money = (minor: unknown) => (typeof minor === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minor / 100) : '—');
const str = (v: unknown, fallback = '—') => (typeof v === 'string' && v.trim() ? v : fallback);

/** Blocker categories accepted by the runbook API (BlockerCategory). */
const BLOCKERS: Array<[string, string, string]> = [
  ['CLIENT_AUTH_REQUIRED', 'WAITING ON CLIENT · AUTHORIZATION', 'THE CLIENT MUST APPROVE OR GRANT ACCESS'],
  ['CLIENT_INFO_MISSING', 'WAITING ON CLIENT · INFORMATION', 'DETAILS ARE MISSING FROM THE CLIENT'],
  ['PROVIDER_PENDING', 'WAITING ON PROVIDER', 'EXTERNAL DEPENDENCY · REGISTRAR, EMAIL OR DNS HOST'],
  ['DNS_PROPAGATION', 'DNS PROPAGATION', 'RECORDS ARE SET · WAITING FOR PROPAGATION'],
  ['MANUAL_REVIEW', 'INTERNAL · MANUAL REVIEW', 'SITE 00 NEEDS TO ACT'],
];

/**
 * OL-02 … OL-20 bodies (OL-01 lives in CreateClientOverlay). Each family keeps its canonical id, trigger and API
 * contract; the host supplies the OPUS2 container. Success toasts fire only after the server resolves.
 */
export function WorkspaceOverlayBody({ id, payload, onClose, markDirty }: Props) {
  const navigate = useNavigate();
  const { pushToast, openOverlay } = useFounderWorkspaceOverlay();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const artifactId = String(payload?.artifact_id ?? payload?.artifactId ?? '');

  useEffect(() => {
    markDirty(false);
  }, [id, markDirty]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Action failed';
      setError(msg);
      pushToast(`NOT SAVED · ${msg}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, what = 'LINK') =>
    void navigator.clipboard.writeText(text).then(
      () => pushToast(`${what} COPIED`, 'success'),
      () => pushToast('COPY FAILED · THE BROWSER BLOCKED CLIPBOARD ACCESS', 'error'),
    );

  switch (id) {
    case 'OL-02': {
      const link = str(payload?.link, '');
      return (
        <OverlayFormShell
          id={id}
          secondaryLabel="Close"
          primaryLabel={artifactId ? 'Open foundation' : 'Copy link'}
          primaryArrow={Boolean(artifactId)}
          primaryDisabled={!link && !artifactId}
          onPrimary={() => {
            if (artifactId) {
              onClose();
              navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId));
            } else if (link) copy(link);
          }}
          extra={
            link ? (
              <WsLinkButton tone="out" icon="external" to={link} external>
                CLIENT VIEW
              </WsLinkButton>
            ) : null
          }
          onClose={onClose}
        >
          <div className="ws-label">PERSONAL LINK · NEVER EXPIRES</div>
          <WsCopyLink value={link || '—'} onCopy={link ? () => copy(link) : undefined} />
          <WsKv rows={[['STATE', 'INVITED · WAITING FOR THE CLIENT'], ['CONFIRMED', 'SAVED BY THE SERVER']]} />
          <WsBanner tone="policy" icon="lock">
            NO EMAIL WAS SENT. SHARE THE LINK, OR SEND THE INVITATION FROM CORRESPONDENCE.
          </WsBanner>
        </OverlayFormShell>
      );
    }

    case 'OL-03':
      // Workspace menu (OPUS1/OPUS2 drawer; OPUS3 adds 06 REFERRALS). Phones reach REFERRALS only here.
      return (
        <>
          <div className="ws-ov__b" data-overlay-body={id}>
            <WorkspaceMenuRows onNavigate={onClose} onAccount={() => openOverlay('OL-18', { email: payload?.email })} />
          </div>
          <div className="ws-ov__f">
            <WsButton tone="out" size="sm" onClick={onClose}>
              CLOSE
            </WsButton>
          </div>
        </>
      );

    case 'OL-04':
      return <CommandPalette onClose={onClose} />;

    case 'OL-05':
      return <Notifications onClose={onClose} />;

    case 'OL-06': {
      const token = str(payload?.public_token, '');
      const intakePath = token ? digitalFoundationClientIntakePath(token) : '';
      const intake = intakePath ? `${window.location.origin}${intakePath}` : '';
      const go = (fn: () => void) => () => {
        onClose();
        fn();
      };
      return (
        <div className="ws-ov__b" data-overlay-body={id}>
          <button type="button" role="menuitem" className="ws-menu__i ws-menu__i--act" disabled={!artifactId} onClick={go(() => navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId)))}>
            <WsIcon name="external" />
            <span>OPEN FOUNDATION</span>
            <span className="ws-meta">↵</span>
          </button>
          <button type="button" role="menuitem" className="ws-menu__i" disabled={!intake} onClick={() => intake && copy(intake, 'PERSONAL LINK')}>
            <WsIcon name="link" />
            <span>COPY PERSONAL LINK</span>
            <span className="ws-meta">C</span>
          </button>
          {intakePath ? (
            <a role="menuitem" className="ws-menu__i" href={intakePath} target="_blank" rel="noreferrer" onClick={onClose}>
              <WsIcon name="view" />
              <span>CLIENT VIEW</span>
              <span className="ws-meta">↗</span>
            </a>
          ) : null}
          <button type="button" role="menuitem" className="ws-menu__i" disabled={!artifactId} onClick={() => openOverlay('OL-14', { artifact_id: artifactId, business_name: payload?.business_name })}>
            <WsIcon name="message" />
            <span>MESSAGE CLIENT</span>
            <span className="ws-meta" />
          </button>
          <div className="ws-menu__sep" role="separator" />
          <button type="button" role="menuitem" className="ws-menu__i ws-menu__i--off" disabled aria-disabled="true">
            <WsIcon name="send" />
            <span>RESEND INVITATION</span>
            <span className="ws-meta">N/A · G-05</span>
          </button>
          <button type="button" role="menuitem" className="ws-menu__i ws-menu__i--off" disabled aria-disabled="true">
            <WsIcon name="lock" />
            <span>REVOKE LINK</span>
            <span className="ws-meta">N/A · G-06</span>
          </button>
        </div>
      );
    }

    case 'OL-07':
      return <Ol07RegistryFilters id={id} onClose={onClose} payload={payload} markDirty={markDirty} />;

    case 'OL-08':
      return (
        <OverlayFormShell
          id={id}
          primaryLabel={busy ? 'Approving…' : 'Approve quote'}
          primaryArrow
          busy={busy}
          primaryDisabled={!artifactId}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.quoteCommercialReady(artifactId);
              pushToast('QUOTE MARKED COMMERCIALLY READY · CONFIRMED BY THE SERVER', 'success');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <WsKv
            rows={[
              ['QUOTE', payload?.quote_version ? `V${String(payload.quote_version)}` : '—'],
              ['SUBTOTAL', money(payload?.subtotal_minor)],
            ]}
          />
          <p className="ws-meta" style={{ lineHeight: 1.5 }}>
            APPROVAL MARKS THE QUOTE COMMERCIALLY READY. AMOUNTS ARE NOT RECALCULATED. THE CLIENT SEES IT IN THEIR PORTAL; NO EMAIL IS SENT WHILE SENDING IS OFF.
          </p>
        </OverlayFormShell>
      );

    case 'OL-09':
      return <Ol09Adjust id={id} artifactId={artifactId} payload={payload} onClose={onClose} markDirty={markDirty} />;

    case 'OL-10':
      return <Ol10Complete id={id} artifactId={artifactId} payload={payload} onClose={onClose} markDirty={markDirty} />;

    case 'OL-11':
      return <Ol11Revision id={id} artifactId={artifactId} payload={payload} onClose={onClose} markDirty={markDirty} />;

    case 'OL-12': {
      const task = (payload?.task ?? {}) as OpsTask;
      const taskId = String(payload?.task_id ?? task.task_id ?? '');
      const st = String(task.status ?? '');
      return (
        <div className="ifw-insp-ov" data-overlay-body={id}>
          {error ? (
            <div style={{ padding: '12px 20px 0' }}>
              <WsBanner tone="red" icon="warning">
                NOT STARTED — THE SERVER DID NOT CONFIRM. <span className="ws-data">{error}</span>
              </WsBanner>
            </div>
          ) : null}
          <TaskInspector
            task={{ ...task, task_id: taskId }}
            stage={STAGES[stageIndex(task.project_stage)] ?? String(task.project_stage ?? 'TASK').replace(/_/g, ' ')}
            onClose={onClose}
            onStart={() =>
              void run(async () => {
                if (st !== 'READY') throw new Error(`TASK IS ${st.replace(/_/g, ' ') || 'NOT READY'} · ONLY READY TASKS CAN START`);
                await foundationAdminApi.startTask(artifactId, taskId);
                pushToast('TASK STARTED · CONFIRMED BY THE SERVER · PROVIDER WORK IS NOT EXECUTED FROM HERE', 'success');
                onClose();
              })
            }
            onBlock={() => openOverlay('OL-13', { artifact_id: artifactId, task_id: taskId, task_title: task.title, category: 'CLIENT_AUTH_REQUIRED' })}
          />
        </div>
      );
    }

    case 'OL-13':
      return <Ol13Blocker id={id} artifactId={artifactId} payload={payload} onClose={onClose} markDirty={markDirty} />;

    case 'OL-14':
      return <Ol14Compose id={id} artifactId={artifactId} onClose={onClose} markDirty={markDirty} />;

    case 'OL-15':
      return <Ol15GatedSend id={id} payload={payload} onClose={onClose} />;

    case 'OL-16': {
      const chip = (payload?.chip as SystemModule['chip']) ?? ['unver', 'UNVERIFIED'];
      const m: SystemModule = {
        id: str(payload?.module_id, 'module'),
        icon: 'server',
        title: str(payload?.module, 'MODULE').toUpperCase(),
        area: 'STACK',
        chip,
        detail: str(payload?.summary, 'NO SUMMARY IN THE REPORT'),
        checks: (payload?.checks as SystemModule['checks']) ?? [],
        envNames: (payload?.env_names as string[]) ?? [],
      };
      return (
        <div className="ifw-insp-ov" data-overlay-body={id}>
          <ModuleInspector m={m} onClose={onClose} />
          {payload?.detail ? (
            <div className="ws-insp__foot">
              <span className="ws-meta">
                OVERALL {str((payload.detail as Record<string, unknown>).overall)} · PERSISTENCE {str((payload.detail as Record<string, unknown>).persistence)} · STRIPE {str((payload.detail as Record<string, unknown>).stripe)}
              </span>
            </div>
          ) : null}
        </div>
      );
    }

    case 'OL-17':
      return <Ol17Reset id={id} onClose={onClose} markDirty={markDirty} />;

    case 'OL-18':
      return (
        <div className="ws-ov__b" data-overlay-body={id}>
          <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--ws-hair)' }} className="ws-who">
            <b className="ws-data" style={{ textTransform: 'none' }}>
              {str(payload?.email, 'FOUNDER')}
            </b>
            <span>ADMIN · SIGNED IN</span>
          </div>
          <div className="ws-menu__i" role="menuitem" aria-disabled="true">
            <WsIcon name="server" />
            <span>ENVIRONMENT · {window.location.hostname.includes('staging') ? 'STAGING' : window.location.hostname === 'site00.com' ? 'LIVE' : 'PREVIEW'}</span>
            <span className="ws-meta" />
          </div>
          <button type="button" role="menuitem" className="ws-menu__i" onClick={() => openOverlay('OL-04')}>
            <WsIcon name="search" />
            <span>SEARCH + COMMANDS</span>
            <span className="ws-meta">⌘K</span>
          </button>
          <div className="ws-menu__sep" role="separator" />
          <Link to="/origin/sign-out" role="menuitem" className="ws-menu__i ws-menu__i--danger" onClick={onClose}>
            <WsIcon name="back" />
            <span>SIGN OUT</span>
            <span className="ws-meta" />
          </Link>
        </div>
      );

    case 'OL-19': {
      const row = previewRow(payload);
      return (
        <div className="ifw-insp-ov" data-overlay-body={id}>
          <ClientInspector
            row={row}
            referral={typeof payload?.referral === 'string' ? payload.referral : null}
            onClose={onClose}
            onOpen={() => {
              if (!artifactId) return;
              onClose();
              navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId));
            }}
            onCopy={() => copy(`${window.location.origin}${digitalFoundationClientIntakePath(row.public_token)}`, 'PERSONAL LINK')}
            onMore={() => openOverlay('OL-06', { artifact_id: artifactId, public_token: row.public_token, business_name: row.name })}
          />
        </div>
      );
    }

    case 'OL-20': {
      const message = str(payload?.message, error ?? 'NO DETAIL WAS PROVIDED');
      return (
        <OverlayFormShell id={id} secondaryLabel="Close" primaryLabel="Copy detail" onPrimary={() => copy(`${str(payload?.action, 'action')} · ${message}`, 'DETAIL')} onClose={onClose}>
          <WsKv
            rows={[
              ['ACTION', str(payload?.action), true],
              ['STATUS', str(payload?.status)],
              ['MESSAGE', message, true],
              ['AT', new Date().toLocaleString()],
            ]}
          />
          <p className="ws-meta">COPY THIS DETAIL INTO A SUPPORT NOTE. NO SECRET VALUES OR TOKENS ARE EVER SHOWN.</p>
        </OverlayFormShell>
      );
    }

    default:
      return <OverlayFormShell id={id} blockedReason={`UNKNOWN OVERLAY ${id}`} onClose={onClose} />;
  }
}

function previewRow(payload?: Record<string, unknown>): FoundationRow {
  const a: FoundationAdminListRow = {
    artifact_id: String(payload?.artifact_id ?? ''),
    public_token: String(payload?.public_token ?? ''),
    state: String(payload?.state ?? 'UNKNOWN'),
    payment_state: String(payload?.payment_state ?? 'NONE'),
    intake_state: typeof payload?.intake_state === 'string' ? payload.intake_state : undefined,
    business_name: typeof payload?.business_name === 'string' ? payload.business_name : null,
    created_at: String(payload?.created_at ?? new Date().toISOString()),
    last_activity_at: typeof payload?.last_activity_at === 'string' ? payload.last_activity_at : undefined,
  };
  return toFoundationRows([a], [])[0];
}

/* ─── OL-04 · command palette ─────────────────────────────────────────────── */
function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<FoundationRow[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void foundationAdminApi
      .list()
      .then((j) => setRows(toFoundationRows(j.artifacts ?? [], [])))
      .catch((e) => {
        setRows([]);
        setFailed(e instanceof Error ? e.message : 'Search unavailable');
      });
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();
  const clients = q.length >= 1 ? (rows ?? []).filter((r) => r.name.toLowerCase().includes(q) || r.artifact_id.includes(q) || r.public_token.includes(q)).slice(0, 6) : [];
  const commands = [
    { key: 'new', label: 'NEW FOUNDATION', sub: 'OPENS THE CREATE DIALOG', icon: 'add', kbd: 'N', run: () => openOverlay('OL-01') },
    ...FOUNDER_WORKSPACE_SIDEBAR_NAV.map((n) => ({ key: n.id, label: `GO TO ${n.label.toUpperCase()}`, sub: n.ordinal, icon: 'next', kbd: n.ordinal.slice(-1), run: () => (onClose(), navigate(n.href)) })),
  ].filter((c) => !q || c.label.toLowerCase().includes(q));
  const items = [...clients.map((c) => ({ key: c.artifact_id, run: () => (onClose(), navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(c.artifact_id))) })), ...commands.map((c) => ({ key: c.key, run: c.run }))];

  useEffect(() => setActive(0), [query]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[active]?.run();
    }
  };

  let idx = -1;
  return (
    <>
      <div className="ws-ov__b" data-overlay-body="OL-04">
        <label className="ws-search ws-search--focus" style={{ height: 48 }}>
          <WsIcon name="search" />
          <input ref={inputRef} className="ifw-search__input ws-data" style={{ fontSize: 16 }} value={query} placeholder="CLIENT NAME, ARTIFACT OR COMMAND" aria-label="SEARCH AND COMMANDS" onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} />
          <WsKbd>ESC</WsKbd>
        </label>
        {failed ? (
          <WsBanner tone="red" icon="warning">
            CLIENT SEARCH IS UNAVAILABLE · <span className="ws-data">{failed}</span>
          </WsBanner>
        ) : null}
        <div role="listbox" aria-label="RESULTS">
          {q && clients.length ? (
            <>
              <div className="ws-label" style={{ padding: '4px 0 6px' }}>
                CLIENTS
              </div>
              {clients.map((c) => {
                idx += 1;
                const i = idx;
                return (
                  <button key={c.artifact_id} type="button" role="option" aria-selected={i === active} className={`pal__i ${i === active ? 'pal__i--act' : ''}`.trim()} onMouseEnter={() => setActive(i)} onClick={() => items[i].run()}>
                    <WsPlate name={c.name} size="xs" attn={c.life.kind === 'founder'} />
                    <span className="ws-who">
                      <b>{c.name}</b>
                      <span>{c.life.label}</span>
                    </span>
                    {i === active ? <WsKbd>↵</WsKbd> : <span />}
                  </button>
                );
              })}
            </>
          ) : null}
          {q && rows && !clients.length && !commands.length ? (
            <div className="ws-empty" style={{ padding: 18 }}>
              <span className="ws-label">
                NO RESULTS FOR “<span className="ws-data">{query}</span>”
              </span>
              <span className="ws-meta">SEARCH COVERS CLIENT NAME, ARTIFACT ID, LINK TOKEN AND COMMANDS</span>
            </div>
          ) : null}
          {commands.length ? (
            <>
              <div className="ws-label" style={{ padding: '12px 0 6px' }}>
                COMMANDS
              </div>
              {commands.map((c) => {
                idx += 1;
                const i = idx;
                return (
                  <button key={c.key} type="button" role="option" aria-selected={i === active} className={`pal__i ${i === active ? 'pal__i--act' : ''}`.trim()} onMouseEnter={() => setActive(i)} onClick={() => c.run()}>
                    <WsIcon name={c.icon} />
                    <span className="ws-who">
                      <b>{c.label}</b>
                      <span>{c.sub}</span>
                    </span>
                    <WsKbd>{c.kbd}</WsKbd>
                  </button>
                );
              })}
            </>
          ) : null}
        </div>
      </div>
      <div className="ws-ov__f">
        <span className="ws-meta" style={{ marginRight: 'auto' }}>
          <WsKbd>↑</WsKbd> <WsKbd>↓</WsKbd> MOVE · <WsKbd>↵</WsKbd> OPEN · <WsKbd>ESC</WsKbd> CLOSE
        </span>
      </div>
    </>
  );
}

/* ─── OL-05 · notification center (derived from pipeline · founder decisions first) ───────────── */
function Notifications({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Array<{ row: FoundationRow; pipe?: PipelineRow }> | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    void Promise.all([foundationAdminApi.list(), foundationAdminApi.pipeline()])
      .then(([l, p]) => {
        const rows = toFoundationRows(l.artifacts ?? [], p.rows ?? []);
        const byId = new Map((p.rows ?? []).map((r) => [r.artifact_id, r]));
        setItems(
          rows
            .filter((r) => r.life.kind === 'founder' || r.life.kind === 'blocked' || byId.get(r.artifact_id)?.blocker)
            .sort((a, b) => Date.parse(b.lastIso) - Date.parse(a.lastIso))
            .slice(0, 8)
            .map((row) => ({ row, pipe: byId.get(row.artifact_id) })),
        );
      })
      .catch((e) => {
        setItems([]);
        setFailed(e instanceof Error ? e.message : 'Notifications unavailable');
      });
  }, []);
  return (
    <>
      <div className="ws-ov__b" data-overlay-body="OL-05">
        <span className="ws-label">DERIVED FROM THE PIPELINE · FOUNDER DECISIONS + BLOCKERS</span>
        {failed ? (
          <WsBanner tone="red" icon="warning">
            NOTIFICATIONS COULD NOT LOAD · <span className="ws-data">{failed}</span>
          </WsBanner>
        ) : null}
        {items === null ? <span className="ws-skel" style={{ width: '70%' }} /> : null}
        {items?.map(({ row }) => (
          <Link key={row.artifact_id} to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(row.artifact_id)} onClick={onClose} style={{ display: 'block' }}>
            <WsActivity time={row.last} kind={row.life.kind} title={row.name} sub={`${row.life.label} · ${row.life.action}`} />
          </Link>
        ))}
        {items && !items.length && !failed ? <p className="ws-meta">NOTHING NEEDS YOU · NO FOUNDER DECISION OR BLOCKER IN THE PIPELINE.</p> : null}
      </div>
      <div className="ws-ov__f ws-ov__f--split">
        <WsButton tone="ghost" size="sm" onClick={onClose}>
          CLOSE
        </WsButton>
        <WsButton
          size="sm"
          arrow
          onClick={() => {
            onClose();
            navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews);
          }}
        >
          OPEN REVIEWS
        </WsButton>
      </div>
    </>
  );
}

type Sub = { id: WorkspaceOverlayId; onClose: () => void; markDirty: (d: boolean) => void; payload?: Record<string, unknown>; artifactId?: string };

/* ─── OL-07 · filter + sort (shared with the Foundations toolbar) ─────────────────────────── */
function Ol07RegistryFilters({ id, onClose, payload, markDirty }: Sub) {
  const { query, stateFilter, sortKey, applyDraft, resetFilters } = useRegistryFilters();
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftState, setDraftState] = useState(stateFilter);
  const [draftSort, setDraftSort] = useState<RegistrySortKey>(sortKey);

  const lifecycleStates = Array.isArray(payload?.lifecycle_states) ? (payload.lifecycle_states as string[]) : [];

  useEffect(() => {
    setDraftQuery(query);
    setDraftState(stateFilter);
    setDraftSort(sortKey);
    markDirty(false);
  }, [query, stateFilter, sortKey, markDirty]);

  const dirty = draftQuery !== query || draftState !== stateFilter || draftSort !== sortKey;
  useEffect(() => {
    markDirty(dirty);
  }, [dirty, markDirty]);

  return (
    <OverlayFormShell
      id={id}
      primaryLabel="Apply"
      onPrimary={() => {
        applyDraft({ query: draftQuery, stateFilter: draftState, sortKey: draftSort });
        markDirty(false);
        onClose();
      }}
      secondaryLabel="Reset"
      onSecondary={() => {
        resetFilters();
        markDirty(false);
        onClose();
      }}
      onClose={onClose}
    >
      <WsField label="SEARCH" opt>
        <WsInput value={draftQuery} onChange={setDraftQuery} placeholder="NAME, ARTIFACT OR LINK TOKEN" ariaLabel="SEARCH" />
      </WsField>
      <div>
        <div className="ws-label">STATUS VIEW</div>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {FOUNDATION_VIEWS.map((v) => (
            <WsCheck key={v.id} on={draftState === v.id} onToggle={() => setDraftState(v.id)}>
              {v.label}
            </WsCheck>
          ))}
        </div>
      </div>
      {lifecycleStates.length ? (
        <div>
          <div className="ws-label">EXACT LIFECYCLE STATE</div>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {lifecycleStates.map((s) => (
              <WsCheck key={s} on={draftState === s} onToggle={(on) => setDraftState(on ? s : 'ALL')}>
                {s.replace(/_/g, ' ')}
              </WsCheck>
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <div className="ws-label">SORT</div>
        <WsChoiceGroup label="SORT">
          {(['lifecycle', 'activity', 'name'] as RegistrySortKey[]).map((k) => (
            <WsChoice key={k} on={draftSort === k} title={SORT_LABEL[k]} desc={k === 'activity' ? 'NEWEST FIRST' : k === 'name' ? 'A → Z' : 'FOUNDER DECISIONS LEAD'} onSelect={() => setDraftSort(k)} />
          ))}
        </WsChoiceGroup>
      </div>
    </OverlayFormShell>
  );
}

/* ─── OL-09 · revise quote / manual adjustment ──────────────────────────────────────────── */
function Ol09Adjust({ id, onClose, markDirty, payload, artifactId = '' }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = Number(amount.replace(/[$,\s]/g, ''));
  const valid = amount.trim() !== '' && Number.isFinite(parsed) && parsed !== 0;
  const minor = valid ? Math.round(parsed * 100) : 0;
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Saving…' : 'Record adjustment'}
      busy={busy}
      primaryDisabled={!artifactId || !valid}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationAdminApi
          .manualQuoteAdjustment(artifactId, minor)
          .then(() => {
            markDirty(false);
            pushToast('ADJUSTMENT RECORDED · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Adjustment failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      <WsKv rows={[['QUOTE', payload?.quote_version ? `V${String(payload.quote_version)}` : '—']]} />
      <WsField label="MANUAL ADJUSTMENT (USD)" req err={amount && !valid ? 'ENTER A NON-ZERO AMOUNT, E.G. -50.00' : null} hint={valid ? `RECORDED AS ${minor} CENTS (manual-adjustment) · THE BASE PRICE IS NOT CHANGED` : 'NEGATIVE REDUCES THE QUOTE · INTEGER CENTS ARE STORED'}>
        <WsInput
          value={amount}
          inputMode="decimal"
          placeholder="-50.00"
          ariaLabel="MANUAL ADJUSTMENT"
          err={Boolean(amount) && !valid}
          onChange={(v) => {
            setAmount(v);
            markDirty(v.trim() !== '');
          }}
        />
      </WsField>
    </OverlayFormShell>
  );
}

/* ─── OL-10 · mark foundation complete (no hard-coded ownership defaults) ────────────────── */
function Ol10Complete({ id, onClose, markDirty, payload, artifactId = '' }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const gate = (payload?.gate ?? null) as { ok?: boolean; reasons?: string[] } | null;
  const [f, setF] = useState({ business: '', domain: '', registrar: '', email_provider: '', primary_mailbox: '', owner: '' });
  const [dns, setDns] = useState<'CONFIGURED' | 'PENDING'>('PENDING');
  const [sec, setSec] = useState<'PROTECTED' | 'PENDING'>('PENDING');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    void foundationAdminApi
      .detail(artifactId)
      .then((d) => {
        const i = (d as { artifact?: { intake?: Record<string, string> } }).artifact?.intake ?? {};
        setF((cur) => ({
          business: cur.business || i.business_name || '',
          domain: cur.domain || i.existing_domain || '',
          registrar: cur.registrar || i.existing_registrar || '',
          email_provider: cur.email_provider || i.existing_email_provider || '',
          primary_mailbox: cur.primary_mailbox || i.current_email || '',
          owner: cur.owner || i.contact_name || '',
        }));
      })
      .catch(() => undefined);
  }, [artifactId]);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((cur) => ({ ...cur, [k]: v }));
    markDirty(true);
  };
  const missing = (['business', 'domain', 'registrar', 'email_provider', 'owner'] as const).filter((k) => !f[k].trim());
  const gateOpen = gate?.ok === true;

  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Saving…' : 'Mark complete'}
      busy={busy}
      primaryDisabled={!artifactId || !gateOpen || missing.length > 0}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationAdminApi
          .markComplete(artifactId, {
            business: f.business.trim(),
            domain: f.domain.trim(),
            registrar: f.registrar.trim(),
            email_provider: f.email_provider.trim(),
            primary_mailbox: f.primary_mailbox.trim() || null,
            aliases: [],
            dns_status: dns,
            security_status: sec,
            owner: f.owner.trim(),
            administrative_access_model: 'Client-owned',
          })
          .then(() => {
            markDirty(false);
            pushToast('FOUNDATION MARKED COMPLETE · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Mark complete failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      {!gate ? (
        <WsBanner icon="info">THE COMPLETION GATE WAS NOT PASSED TO THIS DIALOG · OPEN IT FROM THE RECORD’S RECORDS SECTION.</WsBanner>
      ) : gateOpen ? (
        <WsBanner icon="info">THE COMPLETION GATE IS CLEAR. RECORD WHO OWNS WHAT — NOTHING IS PRE-FILLED WITH PLACEHOLDERS.</WsBanner>
      ) : (
        <WsBanner tone="red" icon="blocked">
          THE COMPLETION GATE IS OPEN · {gate.reasons?.length ?? 0} REASONS ({(gate.reasons ?? []).join(' · ')}). MARK COMPLETE STAYS DISABLED UNTIL EVERY REASON CLEARS.
        </WsBanner>
      )}
      <div className="ifw-grid2">
        <WsField label="BUSINESS" req>
          <WsInput value={f.business} onChange={set('business')} ariaLabel="BUSINESS" />
        </WsField>
        <WsField label="DOMAIN" req>
          <WsInput value={f.domain} onChange={set('domain')} ariaLabel="DOMAIN" placeholder="ENTER DOMAIN" />
        </WsField>
        <WsField label="REGISTRAR ACCOUNT" req>
          <WsInput value={f.registrar} onChange={set('registrar')} ariaLabel="REGISTRAR" placeholder="ENTER REGISTRAR" />
        </WsField>
        <WsField label="EMAIL PROVIDER" req>
          <WsInput value={f.email_provider} onChange={set('email_provider')} ariaLabel="EMAIL PROVIDER" placeholder="ENTER PROVIDER" />
        </WsField>
        <WsField label="DOMAIN OWNER" req>
          <WsInput value={f.owner} onChange={set('owner')} ariaLabel="DOMAIN OWNER" placeholder="ENTER OWNER" />
        </WsField>
        <WsField label="PRIMARY MAILBOX" opt>
          <WsInput value={f.primary_mailbox} onChange={set('primary_mailbox')} ariaLabel="PRIMARY MAILBOX" />
        </WsField>
      </div>
      <div className="ifw-grid2">
        <WsChoiceGroup label="DNS STATUS">
          <WsChoice on={dns === 'CONFIGURED'} title="DNS CONFIGURED" desc="RECORDS VERIFIED" onSelect={() => setDns('CONFIGURED')} />
          <WsChoice on={dns === 'PENDING'} title="DNS PENDING" desc="NOT YET VERIFIED" onSelect={() => setDns('PENDING')} />
        </WsChoiceGroup>
        <WsChoiceGroup label="SECURITY STATUS">
          <WsChoice on={sec === 'PROTECTED'} title="PROTECTED" desc="SPF · DKIM · DMARC VERIFIED" onSelect={() => setSec('PROTECTED')} />
          <WsChoice on={sec === 'PENDING'} title="PENDING" desc="NOT YET VERIFIED" onSelect={() => setSec('PENDING')} />
        </WsChoiceGroup>
      </div>
      {missing.length ? <span className="ws-hint">REQUIRED: {missing.map((m) => m.replace(/_/g, ' ').toUpperCase()).join(' · ')}</span> : null}
    </OverlayFormShell>
  );
}

/* ─── OL-11 · request revision ─────────────────────────────────────────────────────────── */
function Ol11Revision({ id, onClose, markDirty, payload, artifactId = '' }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const approvalId = typeof payload?.approval_id === 'string' ? payload.approval_id : '';
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Sending…' : 'Send request'}
      primaryArrow
      busy={busy}
      primaryDisabled={!artifactId || !approvalId || !note.trim()}
      blockedReason={approvalId ? undefined : 'NO OPEN APPROVAL RECORD WAS SELECTED · CHOOSE A REVIEW ITEM WITH AN APPROVAL REQUEST'}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationAdminApi
          .approvalResolve(artifactId, approvalId, 'REVISION_REQUESTED', note.trim())
          .then(() => {
            markDirty(false);
            pushToast('REVISION REQUEST RECORDED · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Request failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      {payload?.subject ? <WsKv rows={[['SUBJECT', String(payload.subject).toUpperCase()]]} /> : null}
      <WsField label="NOTE TO CLIENT" req>
        <WsTextarea
          value={note}
          rows={4}
          placeholder="WHAT SHOULD THE CLIENT CHANGE?"
          ariaLabel="NOTE TO CLIENT"
          onChange={(v) => {
            setNote(v);
            markDirty(v.trim() !== '');
          }}
        />
      </WsField>
    </OverlayFormShell>
  );
}

/* ─── OL-13 · set blocker ───────────────────────────────────────────────────────────────── */
function Ol13Blocker({ id, onClose, markDirty, payload, artifactId = '' }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const initial = BLOCKERS.some((b) => b[0] === payload?.category) ? String(payload?.category) : 'CLIENT_AUTH_REQUIRED';
  const [category, setCategory] = useState(initial);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taskId = typeof payload?.task_id === 'string' ? payload.task_id : '';
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Saving…' : 'Set blocker'}
      primaryTone="danger"
      busy={busy}
      primaryDisabled={!artifactId || !taskId || !reason.trim()}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationAdminApi
          .setBlocker(artifactId, taskId, category, reason.trim())
          .then(() => {
            markDirty(false);
            pushToast('BLOCKER RECORDED · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Set blocker failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      <WsChoiceGroup label="BLOCKER CATEGORY">
        {BLOCKERS.map(([k, t, d]) => (
          <WsChoice
            key={k}
            on={category === k}
            title={t}
            desc={d}
            onSelect={() => {
              setCategory(k);
              markDirty(true);
            }}
          />
        ))}
      </WsChoiceGroup>
      <WsField label="NOTE" req>
        <WsTextarea
          value={reason}
          rows={3}
          placeholder="WHAT IS BLOCKING THIS TASK?"
          ariaLabel="BLOCKER NOTE"
          onChange={(v) => {
            setReason(v);
            markDirty(v.trim() !== '');
          }}
        />
      </WsField>
    </OverlayFormShell>
  );
}

/* ─── OL-14 · compose portal message ──────────────────────────────────────────────────── */
function Ol14Compose({ id, onClose, markDirty, artifactId = '' }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Posting…' : 'Post message'}
      primaryArrow
      busy={busy}
      primaryDisabled={!artifactId || !body.trim() || body.length > 8000}
      footNote={`${body.length} / 8000`}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationAdminApi
          .sendMessage(artifactId, body.trim())
          .then(() => {
            markDirty(false);
            pushToast('MESSAGE POSTED TO THE CLIENT PORTAL · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Post failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      {!artifactId ? <WsBanner icon="info">SELECT A FOUNDATION FIRST · OPEN A THREAD IN CORRESPONDENCE OR A CLIENT RECORD.</WsBanner> : null}
      <WsBanner tone="policy" icon="lock">
        POSTS TO THE CLIENT’S PORTAL THREAD ONLY. LIFECYCLE EMAIL IS NOT TRIGGERED FROM HERE.
      </WsBanner>
      <WsField label="MESSAGE" req>
        <WsTextarea
          value={body}
          rows={6}
          placeholder="WRITE A MESSAGE"
          ariaLabel="MESSAGE"
          onChange={(v) => {
            setBody(v);
            markDirty(v.trim() !== '');
          }}
        />
      </WsField>
    </OverlayFormShell>
  );
}

/* ─── OL-15 · gated test send (one approval tick per send) ────────────────────────────── */
function Ol15GatedSend({ id, payload, onClose }: Omit<Sub, 'markDirty'>) {
  const navigate = useNavigate();
  const { pushToast } = useFounderWorkspaceOverlay();
  const intentId = typeof payload?.intent_id === 'string' ? payload.intent_id : '';
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status?: string; blocked?: string } | null>(null);
  const [k, l] = intentChip(result?.status ?? (payload?.status as string | undefined));
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Sending…' : 'Send test'}
      busy={busy}
      primaryDisabled={!intentId || !approved || Boolean(result)}
      footNote={intentId ? 'SYNTHETIC CLIENT ONLY' : undefined}
      extra={
        !intentId ? (
          <WsButton
            tone="ghost"
            onClick={() => {
              onClose();
              navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.system);
            }}
          >
            OPEN TEST LAB
          </WsButton>
        ) : null
      }
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationReadinessApi
          .dispatchTestEmail(intentId, true)
          .then((res) => {
            const status = res.intent?.status;
            setResult({ status, blocked: res.blocked });
            setApproved(false);
            if (res.blocked) pushToast(`SEND BLOCKED · ${res.blocked}`, 'blocked');
            else if (status === 'DRY_RUN') pushToast('RECORDED AS DRY RUN · NOTHING WAS SENT', 'info');
            else pushToast(`SERVER STATUS · ${String(status ?? 'UNKNOWN').replace(/_/g, ' ')} · DELIVERY NOT CONFIRMED`, 'info');
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Send failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      {intentId ? (
        <>
          <WsKv
            rows={[
              ['TEMPLATE', String(payload?.template_id ?? '—').replace(/-/g, ' ').toUpperCase()],
              ['TO', String(payload?.recipient ?? '—'), true],
              ['INTENT', intentId, true],
            ]}
          />
          <div>
            <WsChip kind={k}>{l}</WsChip>
          </div>
          {result?.blocked ? (
            <WsBanner tone="policy" icon="lock">
              {result.blocked.toUpperCase()}
            </WsBanner>
          ) : null}
          <WsCheck on={approved} onToggle={setApproved} disabled={Boolean(result)} hint="EACH SEND NEEDS ITS OWN APPROVAL (FD-W16). REAL CLIENTS CAN NEVER BE SELECTED HERE. THE SERVER STILL ENFORCES THE SEND FLAG AND ALLOWLIST.">
            I APPROVE THIS ONE SEND
          </WsCheck>
        </>
      ) : (
        <>
          <WsBanner tone="policy" icon="lock">
            NO TEST EMAIL IS SELECTED. SENDS ARE ONLY ALLOWED FOR SYNTHETIC CLIENTS FROM 07 SYSTEM → TEST LAB, ONE APPROVAL AT A TIME. STAGING TRANSACTIONAL EMAIL IS NOT ENABLED FROM THE WORKSPACE.
          </WsBanner>
          {payload?.business_name ? <WsKv rows={[['FOUNDATION', String(payload.business_name)]]} /> : null}
        </>
      )}
    </OverlayFormShell>
  );
}

/* ─── OL-17 · reset synthetic test data ──────────────────────────────────────────────── */
function Ol17Reset({ id, onClose, markDirty }: Sub) {
  const { pushToast } = useFounderWorkspaceOverlay();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <OverlayFormShell
      id={id}
      primaryLabel={busy ? 'Resetting…' : 'Reset test data'}
      primaryTone="danger"
      busy={busy}
      primaryDisabled={typed !== 'RESET'}
      onPrimary={() => {
        setBusy(true);
        setError(null);
        void foundationReadinessApi
          .resetTestData()
          .then(() => {
            markDirty(false);
            pushToast('TEST DATA RESET · CONFIRMED BY THE SERVER', 'success');
            onClose();
          })
          .catch((e) => setError(e instanceof Error ? e.message : 'Reset failed'))
          .finally(() => setBusy(false));
      }}
      onClose={onClose}
      error={error}
    >
      <p className="ws-meta" style={{ lineHeight: 1.5, color: 'var(--ws-ink-2)' }}>
        CLEARS THE IN-MEMORY TEST STORE ON THE STAGING API (FOUNDER TEST MODE ONLY) AND RE-SYNCS PERSISTED ARTIFACTS. THIS CANNOT BE UNDONE.
      </p>
      <WsField label="TYPE RESET TO CONFIRM" req>
        <WsInput
          value={typed}
          ariaLabel="TYPE RESET TO CONFIRM"
          onChange={(v) => {
            setTyped(v.toUpperCase());
            markDirty(v.trim() !== '');
          }}
        />
      </WsField>
    </OverlayFormShell>
  );
}

