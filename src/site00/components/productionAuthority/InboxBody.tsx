/**
 * INBOX — the Production attention + judgment + follow-up system.
 * P0.STUDIOOS.PRODUCTION.INBOX.AUTHORITY-FAMILY-CONVERGENCE.OPUS2 (supersedes the OPUS1 lens reconstruction).
 *
 * One route (/production/queue), one shell, one visual family:
 *   ROOT          NEEDS YOU (default)                               ?view= (none)
 *   CHILDREN      WATCHING · RESOLVED · ALL INBOX · MESSAGES · SYSTEM ?view=watching|resolved|all|messages|system
 *   GRANDCHILDREN DECISION DETAIL ?item= · MESSAGE THREAD ?thread= · SYSTEM NOTICE DETAIL ?notice=
 *   TEMPORARY     REQUEST REVISION · APPROVAL CONFIRMATION · FILTER / SORT · ATTACHMENT PREVIEW (contained overlays)
 * Lifecycle (NEEDS YOU / WATCHING / RESOLVED) is a STATE; DECISION / MESSAGE / SYSTEM is a TYPE (inboxModel.ts).
 * Every surface fits between the host top and bottom nav; only intrinsic panes (lists, threads, tab panels) scroll.
 * Data is unchanged: attention + requests + recorded activity + production graph; decisions still go through
 * `decideStoryboard` behind the founder gate.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HubNode, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionExpressionPath, productionWorkspacePath } from '../../../../shared/site00-production-workspace/routes.js';
import { useProductionRequests } from '../../state/productionRequestStore';
import '../../styles/site00-production-inbox-family.css';
import { NODE_SUB } from './HubBody';
import { IaIcon, type IaIconName } from './iaKit';
import { buildInboxObjects, STATE_LABEL, STATUS_LABEL, type InboxObject, type InboxState, type InboxStatus, type InboxType } from './inboxModel';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { agoLabel, pad2, Thumb } from './primitives';

/* ── routes (same-route query states; no new routes) ─────────────────────────────────────────────── */
export type InboxLens = 'needs' | 'watching' | 'resolved' | 'all' | 'messages' | 'system';
export const INBOX_LENSES: readonly InboxLens[] = ['needs', 'watching', 'resolved', 'all', 'messages', 'system'];
/** links written by earlier builds (Activity, bookmarks) keep working */
const LEGACY: Record<string, InboxLens> = { priority: 'needs', approvals: 'needs', direct: 'messages' };
const INBOX = '/production/queue';
export const inboxHref = (lens: InboxLens, extra?: Record<string, string | undefined> | string) => {
  const q = new URLSearchParams();
  if (lens !== 'needs') q.set('view', lens);
  const ex = typeof extra === 'string' ? { item: extra } : (extra ?? {});
  for (const [k, v] of Object.entries(ex)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${INBOX}?${s}` : INBOX;
};
const LIFECYCLE: { id: InboxLens; state: InboxState }[] = [
  { id: 'needs', state: 'NEEDS_YOU' },
  { id: 'watching', state: 'WATCHING' },
  { id: 'resolved', state: 'RESOLVED' },
];
const TYPE_ICON: Record<InboxType, IaIconName> = { DECISION: 'check', MESSAGE: 'chat', SYSTEM: 'system' };
const STATUS_TONE: Record<InboxStatus, string> = {
  AWAITING_RESPONSE: 'amber',
  IN_PROGRESS: 'green',
  AT_RISK: 'red',
  APPROVED: 'green',
  REVISED: 'orange',
  COMPLETE: 'green',
  NEEDS_REVIEW: 'red',
};
const STATE_TONE: Record<InboxState, string> = { NEEDS_YOU: 'red', WATCHING: 'blue', RESOLVED: 'green' };

function detailHref(o: InboxObject): string | null {
  if (o.type === 'SYSTEM' && o.nodeId) return inboxHref('system', { notice: o.id });
  if (o.type === 'DECISION' && o.source !== 'ACTIVITY') return inboxHref('needs', { item: o.id });
  if (o.type === 'MESSAGE') return inboxHref('messages', { thread: o.id });
  return o.workspaceHref;
}

/* ── small shared pieces ─────────────────────────────────────────────────────────────────────────── */
function Art({ o, url, className = '' }: { o: Pick<InboxObject, 'slot' | 'title'>; url: (slot: string | null) => string | null; className?: string }) {
  return <Thumb slotId={o.slot} url={url(o.slot)} label="" className={`ibx-art ${className}`} />;
}
const Chip = ({ tone, children, testId }: { tone: string; children: ReactNode; testId?: string }) => (
  <span className={`ibx-chip ibx-chip--${tone}`} data-testid={testId}>
    {children}
  </span>
);
const StateBadge = ({ s }: { s: InboxState }) => (
  <Chip tone={STATE_TONE[s]} testId="inbox-state">
    {STATE_LABEL[s]}
  </Chip>
);
function Facts({ rows, className = '' }: { rows: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={`ibx-facts ${className}`}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
function Head({ title, extra, children }: { title: ReactNode; extra?: ReactNode; children?: ReactNode }) {
  return (
    <header className="ibx-head">
      <h2>{title}</h2>
      {children}
      {extra}
    </header>
  );
}
function Empty({ title, body, unmounted = false, testId }: { title: string; body?: string; unmounted?: boolean; testId?: string }) {
  return (
    <div className={`ibx-empty${unmounted ? ' is-unmounted' : ''}`} data-state={unmounted ? 'UNMOUNTED' : 'EMPTY'} data-testid={testId}>
      <b>{title}</b>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

/** Custom Production dropdown (filter / sort temporary surface). Esc and an outside press close it. */
function Menu<T extends string>({ label, value, options, onChange, testId }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; testId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const down = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', down);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', down);
    };
  }, [open]);
  const cur = options.find((o) => o.id === value);
  return (
    <div className="ibx-menu" ref={ref}>
      <button type="button" className={`ibx-menu__btn${open ? ' is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-testid={testId}>
        <span>{cur && cur.id !== ('ALL' as T) ? cur.label : label}</span>
        <IaIcon name="next" className="ibx-menu__chev" />
      </button>
      {open ?
        <ul className="ibx-menu__list" role="listbox" data-testid={`${testId}-list`}>
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={o.id === value}
                className={o.id === value ? 'is-active' : undefined}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      : null}
    </div>
  );
}

/** Contained overlay for temporary surfaces — stays inside the Inbox workspace, never a new page. */
function Sheet({ title, onClose, children, testId, wide = false }: { title: string; onClose: () => void; children: ReactNode; testId: string; wide?: boolean }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);
  return (
    <div className="ibx-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className={`ibx-sheet${wide ? ' ibx-sheet--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} data-testid={testId}>
        <header>
          <i aria-hidden />
          <b>{title}</b>
          <button type="button" aria-label="Close" onClick={onClose} data-testid={`${testId}-close`}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

/* ── body ────────────────────────────────────────────────────────────────────────────────────────── */
export function InboxBody() {
  const data = useProductionAuthorityData();
  const requests = useProductionRequests();
  const [params] = useSearchParams();
  const raw = params.get('view') ?? '';
  const lens: InboxLens = (INBOX_LENSES as readonly string[]).includes(raw) ? (raw as InboxLens) : (LEGACY[raw] ?? 'needs');
  const itemId = params.get('item');
  const threadId = params.get('thread');
  const noticeId = params.get('notice');

  const slug = data?.project.projectId ?? 'ndxbook';
  const objects = useMemo(
    () =>
      buildInboxObjects(
        data,
        requests,
        (id) => (id ? productionExpressionPath(slug, NODE_SUB[id]) : null),
        (r) => (r.targetWorkspace === 'GENERAL' ? `/production/${r.projectSlug}` : productionWorkspacePath(r.projectSlug, r.targetWorkspace, r.targetSubWorkspace ?? '')),
      ),
    [data, requests, slug],
  );
  const url = (slot: string | null) => (slot && data ? data.assetUrl(slot) : null);

  /* decisions — unchanged action, unchanged gate */
  const gate = data?.graph.founderGate;
  const canDecide = (o: InboxObject | null) => !!o && !!gate?.open && !!gate.decidableInHub && o.nodeId === gate.nodeId;
  const [note, setNote] = useState<string | null>(null);
  const [revise, setRevise] = useState<InboxObject | null>(null);
  const [confirm, setConfirm] = useState<InboxObject | null>(null);
  const decide = async (decision: 'APPROVE' | 'REVISE', text: string) => {
    if (!data) return;
    const res = await data.decideStoryboard(decision, text);
    setNote(res.ok ? (decision === 'APPROVE' ? 'APPROVED — recorded in activity.' : 'REVISION REQUESTED — queued for production.') : res.error);
  };
  const actions = {
    canDecide,
    deciding: !!data?.deciding,
    approve: (o: InboxObject) => setConfirm(o),
    requestRevision: (o: InboxObject) => setRevise(o),
    gateReason: gate?.open ? (gate.decidableInHub ? '' : 'DECIDE IN WORKSPACE — this judgment is made where the work lives.') : 'NO FOUNDER GATE IS OPEN.',
  };

  const route = itemId ? 'decision-detail' : threadId ? 'message-thread' : noticeId ? 'system-notice-detail' : lens;
  const tabState: InboxState = lens === 'watching' ? 'WATCHING' : lens === 'resolved' ? 'RESOLVED' : 'NEEDS_YOU';

  let view: ReactNode;
  if (itemId) view = <DecisionDetail o={objects.find((o) => o.id === itemId) ?? null} data={data} url={url} actions={actions} />;
  else if (threadId) view = <MessageThread id={threadId} />;
  else if (noticeId) view = <NoticeDetail o={objects.find((o) => o.id === noticeId) ?? null} data={data} url={url} />;
  else if (lens === 'watching') view = <Watching objects={objects} url={url} />;
  else if (lens === 'resolved') view = <Resolved objects={objects} url={url} />;
  else if (lens === 'all') view = <AllInbox objects={objects} url={url} />;
  else if (lens === 'messages') view = <Messages objects={objects} data={data} />;
  else if (lens === 'system') view = <SystemView objects={objects} data={data} url={url} />;
  else view = <NeedsYou objects={objects} data={data} url={url} actions={actions} />;

  const detail = !!(itemId || threadId || noticeId);
  return (
    <div className="ibx" data-testid="production-queue" data-lens={lens} data-route={route} data-family-root="inbox">
      {detail ? null : (
        <nav className="ibx-tabs" aria-label="Inbox lifecycle" data-testid="inbox-tabs">
          {LIFECYCLE.map((t) => (
            <Link key={t.id} to={inboxHref(t.id)} replace className={t.state === tabState ? 'is-active' : undefined} aria-current={t.state === tabState ? 'page' : undefined} data-testid={`inbox-tab-${t.id}`}>
              {STATE_LABEL[t.state]}
            </Link>
          ))}
        </nav>
      )}
      <div className="ibx-work" data-testid="inbox-workspace">
        {view}
      </div>
      {note ?
        <p className="ibx-note" role="status" data-testid="inbox-decision-note">
          {note}
          <button type="button" aria-label="Dismiss" onClick={() => setNote(null)}>
            ×
          </button>
        </p>
      : null}
      {revise ?
        <Sheet title="REQUEST REVISION" onClose={() => setRevise(null)} testId="inbox-revision-sheet">
          <RevisionForm
            o={revise}
            allowed={canDecide(revise)}
            reason={actions.gateReason}
            deciding={actions.deciding}
            onSend={async (t) => {
              await decide('REVISE', t);
              setRevise(null);
            }}
            onCancel={() => setRevise(null)}
          />
        </Sheet>
      : null}
      {confirm ?
        <Sheet title="CONFIRM APPROVAL" onClose={() => setConfirm(null)} testId="inbox-approve-confirm">
          <div className="ibx-confirm">
            <p>
              Approve <b>{confirm.title}</b> for {confirm.entry}? This records the founder judgment and unlocks{' '}
              {confirm.blocks.length ? confirm.blocks.join(', ') : 'the next stage'}.
            </p>
            <div className="ibx-actions">
              <button type="button" className="ibx-btn" onClick={() => setConfirm(null)}>
                CANCEL
              </button>
              <button
                type="button"
                className="ibx-btn ibx-btn--red"
                disabled={!canDecide(confirm) || actions.deciding}
                onClick={async () => {
                  await decide('APPROVE', '');
                  setConfirm(null);
                }}
                data-testid="inbox-approve-confirm-go"
              >
                APPROVE
              </button>
            </div>
          </div>
        </Sheet>
      : null}
    </div>
  );
}

type Url = (slot: string | null) => string | null;
type Data = ReturnType<typeof useProductionAuthorityData>;
type Actions = {
  canDecide: (o: InboxObject | null) => boolean;
  deciding: boolean;
  approve: (o: InboxObject) => void;
  requestRevision: (o: InboxObject) => void;
  gateReason: string;
};

function RevisionForm({ o, allowed, reason, deciding, onSend, onCancel }: { o: InboxObject; allowed: boolean; reason: string; deciding: boolean; onSend: (t: string) => void; onCancel: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className="ibx-revise">
      <p className="ibx-revise__obj">
        <span>{o.entry}</span>
        <b>{o.title}</b>
      </p>
      <label>
        <span>WHAT NEEDS TO CHANGE</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Describe the revision…" data-testid="inbox-revision-note" />
      </label>
      {!allowed ? <p className="ibx-hint">{reason}</p> : null}
      <div className="ibx-actions">
        <button type="button" className="ibx-btn" onClick={onCancel}>
          CANCEL
        </button>
        <button type="button" className="ibx-btn ibx-btn--red" disabled={!allowed || deciding || !text.trim()} onClick={() => onSend(text.trim())} data-testid="inbox-revision-send">
          SEND REVISION
        </button>
      </div>
    </div>
  );
}

/* ── shared modules: ATTENTION + RECENTLY RESOLVED (root DNA reused by children) ─────────────────── */
function Attention({ objects, data }: { objects: InboxObject[]; data: Data }) {
  const tiles: { icon: IaIconName; n: number; label: string; to: string; id: string }[] = [
    { id: 'blockers', icon: 'alert', n: data?.graph.blockers.length ?? 0, label: 'BLOCKERS', to: '/production/activity?view=blockers' },
    { id: 'approvals', icon: 'layers', n: objects.filter((o) => o.type === 'DECISION' && o.state === 'NEEDS_YOU').length, label: 'APPROVALS', to: inboxHref('all', { type: 'DECISION', state: 'NEEDS_YOU' }) },
    { id: 'messages', icon: 'chat', n: objects.filter((o) => o.type === 'MESSAGE' && o.state !== 'RESOLVED').length, label: 'MESSAGES', to: inboxHref('messages') },
    { id: 'system', icon: 'system', n: objects.filter((o) => o.type === 'SYSTEM' && o.state !== 'RESOLVED').length, label: 'SYSTEM', to: inboxHref('system') },
  ];
  return (
    <section className="ibx-attn" data-testid="inbox-attention">
      <Head title="ATTENTION" />
      <div className="ibx-attn__grid">
        {tiles.map((t) => (
          <Link key={t.id} to={t.to} data-testid={`inbox-attention-${t.id}`}>
            <IaIcon name={t.icon} />
            <b>{pad2(t.n)}</b>
            <span>{t.label}</span>
            <IaIcon name="next" className="ibx-chev" />
          </Link>
        ))}
      </div>
    </section>
  );
}
function RecentlyResolved({ objects, url, strip = false }: { objects: InboxObject[]; url: Url; strip?: boolean }) {
  const done = objects.filter((o) => o.state === 'RESOLVED').slice(0, 8);
  return (
    <section className="ibx-recent" data-testid="inbox-resolved-rail">
      <Head
        title="RECENTLY RESOLVED"
        extra={
          <Link to={inboxHref('resolved')} className="ibx-viewall">
            VIEW ALL <IaIcon name="next" />
          </Link>
        }
      />
      {done.length ?
        <div className="ibx-recent__rail">
          {done.map((o) => (
            <Link key={o.id} to={detailHref(o) ?? inboxHref('resolved')} title={o.title}>
              <Art o={o} url={url} />
              <i className="ibx-ok" aria-hidden>
                <IaIcon name="check" />
              </i>
            </Link>
          ))}
        </div>
      : strip ?
        <div className="ibx-recent__rail ibx-recent__rail--empty" data-testid="inbox-resolved-empty">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="ibx-slot" aria-hidden />
          ))}
          <p>NOTHING RESOLVED YET · APPROVALS, REVISIONS AND COMPLETED STAGES LAND HERE</p>
        </div>
      : <Empty title="NOTHING RESOLVED YET" body="Approvals, revisions and completed stages land here." />}
    </section>
  );
}
function TypeRail({ active }: { active: 'all' | 'messages' | 'system' }) {
  return (
    <nav className="ibx-typerail" aria-label="Inbox views" data-testid="inbox-type-rail">
      {(['all', 'messages', 'system'] as const).map((t) => (
        <Link key={t} to={inboxHref(t)} replace className={t === active ? 'is-active' : undefined} aria-current={t === active ? 'page' : undefined} data-testid={`inbox-type-${t}`}>
          {t === 'all' ? 'ALL INBOX' : t.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
function Search({ value, onChange, placeholder, testId }: { value: string; onChange: (v: string) => void; placeholder: string; testId: string }) {
  return (
    <label className="ibx-search">
      <IaIcon name="search" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} data-testid={testId} />
    </label>
  );
}
const match = (q: string, o: InboxObject) => !q.trim() || `${o.entry} ${o.title} ${o.area} ${o.why} ${o.blocks.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase());

/* ── ROOT · NEEDS YOU ────────────────────────────────────────────────────────────────────────────────
 * INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2 composition (PARENT_3VIEW 01_INBOX): selected decision surface across
 * the top (art · facts + urgency · REVIEW / APPROVE / REQUEST REVISION) → INCOMING DECISION OBJECTS beside
 * BLOCKERS & APPROVALS → RECENTLY RESOLVED strip. Same objects, same gate, same handlers as OPUS2. */
function NeedsYou({ objects, data, url, actions }: { objects: InboxObject[]; data: Data; url: Url; actions: Actions }) {
  const needs = objects.filter((o) => o.state === 'NEEDS_YOU');
  const focus = needs.find((o) => o.type === 'DECISION') ?? needs[0] ?? null;
  const incoming = needs.filter((o) => o !== focus);
  return (
    <div className="ibx-view ibx-root" data-testid="inbox-needs-you">
      {focus ?
        <FocusCard o={focus} url={url} actions={actions} />
      : <Empty title="NOTHING NEEDS YOU" body="Open decisions, messages and system notices that need your judgment appear here." testId="queue-empty" />}
      <section className="ibx-incoming" data-testid="inbox-incoming">
        <Head
          title="INCOMING DECISION OBJECTS"
          extra={
            <Link to={inboxHref('all')} className="ibx-viewall" data-testid="inbox-open-all">
              ALL INBOX <IaIcon name="next" />
            </Link>
          }
        />
        <div className="ibx-incoming__rail">
          {incoming.map((o) => (
            <Link key={o.id} to={detailHref(o) ?? inboxHref('all')} className="ibx-card" data-testid={o.source === 'REQUEST' ? 'queue-request' : 'inbox-item'} data-type={o.type}>
              <Art o={o} url={url} />
              <b>
                {o.type === 'SYSTEM' ? 'SYSTEM' : o.entry} – {o.title}
              </b>
              <small className="ibx-card__status">{STATUS_LABEL[o.status]}</small>
            </Link>
          ))}
          {incoming.length === 0 ? <Empty title="NOTHING ELSE INCOMING" /> : null}
        </div>
      </section>
      <BlockersApprovals objects={objects} data={data} />
      <RecentlyResolved objects={objects} url={url} strip />
    </div>
  );
}

/** Root attention module: the two counts the authority surfaces (blockers · approvals waiting on you). */
function BlockersApprovals({ objects, data }: { objects: InboxObject[]; data: Data }) {
  const rows = [
    { id: 'blockers', n: data?.graph.blockers.length ?? 0, label: 'BLOCKERS', to: '/production/activity?view=blockers' },
    { id: 'approvals', n: objects.filter((o) => o.type === 'DECISION' && o.state === 'NEEDS_YOU').length, label: 'APPROVALS', to: inboxHref('all', { type: 'DECISION', state: 'NEEDS_YOU' }) },
  ];
  return (
    <section className="ibx-attn ibx-ba" data-testid="inbox-attention">
      <Head title="BLOCKERS & APPROVALS" />
      <div className="ibx-ba__list">
        {rows.map((r) => (
          <Link key={r.id} to={r.to} data-testid={`inbox-attention-${r.id}`}>
            <b>{pad2(r.n)}</b>
            <span>{r.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FocusCard({ o, url, actions }: { o: InboxObject; url: Url; actions: Actions }) {
  const ok = actions.canDecide(o);
  return (
    <article className="ibx-focus" data-testid="inbox-focus" data-type={o.type} data-state={o.state}>
      <Art o={o} url={url} className="ibx-focus__art" />
      <div className="ibx-focus__body">
        <Facts
          className="ibx-focus__facts"
          rows={[
            ['SOURCE', o.entry],
            ['AREA', o.area],
            ['REQUEST', o.title],
            ['BLOCKS', o.blocks.slice(0, 2).join(' + ') || '—'],
            ['BY', o.by],
          ]}
        />
        <Chip tone={o.urgency === 'HIGH' ? 'red' : 'ink'} testId="inbox-focus-urgency">
          URGENCY: {o.urgency}
        </Chip>
      </div>
      <div className="ibx-focus__actions ibx-actions">
        <Link to={inboxHref('needs', { item: o.id })} className="ibx-btn" data-testid="inbox-review">
          REVIEW
        </Link>
        <button type="button" className="ibx-btn ibx-btn--red" disabled={!ok || actions.deciding} onClick={() => actions.approve(o)} title={ok ? undefined : actions.gateReason} data-testid="inbox-approve">
          APPROVE
        </button>
        <button type="button" className="ibx-btn" onClick={() => actions.requestRevision(o)} data-testid="inbox-revise">
          REQUEST REVISION
        </button>
      </div>
      {!ok ? <p className="ibx-focus__gate" data-testid="inbox-focus-gate">{actions.gateReason}</p> : null}
    </article>
  );
}

/* ── CHILD · WATCHING ────────────────────────────────────────────────────────────────────────────── */
function Watching({ objects, url }: { objects: InboxObject[]; url: Url }) {
  const all = objects.filter((o) => o.state === 'WATCHING');
  const [q, setQ] = useState('');
  const [area, setArea] = useState('ALL');
  const [status, setStatus] = useState<'ALL' | InboxStatus>('ALL');
  const areas = [...new Set(all.map((o) => o.area))];
  const shown = all.filter((o) => match(q, o) && (area === 'ALL' || o.area === area) && (status === 'ALL' || o.status === status));
  const n = (s: InboxStatus) => all.filter((o) => o.status === s).length;
  return (
    <div className="ibx-view ibx-list-view" data-testid="inbox-watching">
      <Stats
        testId="inbox-watching-stats"
        stats={[
          [all.length, 'WATCHING'],
          [n('AWAITING_RESPONSE'), 'AWAITING RESPONSE'],
          [n('IN_PROGRESS'), 'IN PROGRESS'],
          [n('AT_RISK'), 'AT RISK'],
        ]}
      />
      <div className="ibx-filters">
        <Search value={q} onChange={setQ} placeholder="Search watched items…" testId="inbox-watching-search" />
        <Menu label="ALL AREAS" value={area} onChange={setArea} options={[{ id: 'ALL', label: 'ALL AREAS' }, ...areas.map((a) => ({ id: a, label: a }))]} testId="inbox-watching-area" />
        <Menu
          label="ALL STATUS"
          value={status}
          onChange={setStatus}
          options={[{ id: 'ALL' as const, label: 'ALL STATUS' }, ...(['AWAITING_RESPONSE', 'IN_PROGRESS', 'AT_RISK'] as const).map((s) => ({ id: s, label: STATUS_LABEL[s] }))]}
          testId="inbox-watching-status"
        />
      </div>
      <div className="ibx-pane ibx-rows ibx-rows--watch" data-scroll="internal" data-testid="inbox-watching-list">
        {shown.map((o) => (
          <article key={o.id} className="ibx-row ibx-row--watch" data-testid="inbox-watch-row" data-type={o.type}>
            <Art o={o} url={url} />
            <div className="ibx-row__main">
              <small>{o.entry}</small>
              <b>{o.title}</b>
              <Facts
                className="ibx-facts--tight"
                rows={[
                  ['AREA', o.area],
                  ['WATCHING', STATUS_LABEL[o.status]],
                  ['NOTE', o.why],
                ]}
              />
            </div>
            <div className="ibx-row__side">
              <Chip tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Chip>
              <Link to={detailHref(o) ?? INBOX} className="ibx-btn ibx-btn--red" data-testid="inbox-watch-open">
                OPEN
              </Link>
              <button type="button" className="ibx-btn" disabled title="Watch preferences are not connected to Production yet." data-testid="inbox-stop-watching">
                STOP WATCHING
              </button>
            </div>
          </article>
        ))}
        {shown.length === 0 ? <Empty title={all.length ? 'NO WATCHED ITEMS MATCH' : 'NOTHING IS BEING WATCHED'} /> : null}
      </div>
    </div>
  );
}

function Stats({ stats, testId }: { stats: [number, string, boolean?][]; testId: string }) {
  return (
    <div className="ibx-stats" data-testid={testId}>
      {stats.map(([v, l, hot]) => (
        <div key={l} className={hot ? 'is-hot' : undefined}>
          <b>{pad2(v)}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ── CHILD · RESOLVED ────────────────────────────────────────────────────────────────────────────── */
function Resolved({ objects, url }: { objects: InboxObject[]; url: Url }) {
  const all = objects.filter((o) => o.state === 'RESOLVED');
  const [area, setArea] = useState('ALL');
  const [outcome, setOutcome] = useState<'ALL' | InboxStatus>('ALL');
  const [sort, setSort] = useState<'LATEST' | 'OLDEST'>('LATEST');
  const areas = [...new Set(all.map((o) => o.area).filter(Boolean))];
  const shown = all
    .filter((o) => (area === 'ALL' || o.area === area) && (outcome === 'ALL' || o.status === outcome))
    .sort((a, b) => (sort === 'LATEST' ? 1 : -1) * (b.at ?? '').localeCompare(a.at ?? ''));
  const n = (s: InboxStatus) => all.filter((o) => o.status === s).length;
  return (
    <div className="ibx-view ibx-list-view" data-testid="inbox-resolved">
      <Stats
        testId="inbox-resolved-stats"
        stats={[
          [all.length, 'RESOLVED', true],
          [n('APPROVED'), 'APPROVED'],
          [n('REVISED'), 'REVISED'],
          [0, 'ARCHIVED'],
        ]}
      />
      <div className="ibx-filters ibx-filters--menus">
        <Menu label="ALL AREAS" value={area} onChange={setArea} options={[{ id: 'ALL', label: 'ALL AREAS' }, ...areas.map((a) => ({ id: a, label: a }))]} testId="inbox-resolved-area" />
        <Menu
          label="ALL OUTCOMES"
          value={outcome}
          onChange={setOutcome}
          options={[{ id: 'ALL' as const, label: 'ALL OUTCOMES' }, ...(['APPROVED', 'REVISED', 'COMPLETE'] as const).map((s) => ({ id: s, label: STATUS_LABEL[s] }))]}
          testId="inbox-resolved-outcome"
        />
        <Menu
          label="LATEST"
          value={sort}
          onChange={setSort}
          options={[
            { id: 'LATEST', label: 'LATEST' },
            { id: 'OLDEST', label: 'OLDEST' },
          ]}
          testId="inbox-resolved-sort"
        />
      </div>
      <div className="ibx-pane ibx-rows" data-scroll="internal" data-testid="inbox-resolved-list">
        {shown.map((o) => {
          const to = detailHref(o);
          const body = (
            <>
              <Art o={o} url={url} />
              <div className="ibx-row__main">
                <small>{o.entry}</small>
                <b>{o.title}</b>
                <Facts
                  className="ibx-facts--tight"
                  rows={[
                    ['TYPE', o.type],
                    ['AREA', o.area],
                  ]}
                />
              </div>
              <div className="ibx-row__side ibx-row__side--meta">
                <Chip tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Chip>
                <span>
                  BY <b>{o.by ?? (o.source === 'GRAPH' ? 'PRODUCTION GRAPH' : '—')}</b>
                </span>
                <small>{o.at ? agoLabel(o.at) : 'CURRENT STATE'}</small>
              </div>
              {to ? <IaIcon name="next" className="ibx-chev" /> : null}
            </>
          );
          return to ?
              <Link key={o.id} to={to} className="ibx-row" data-testid="inbox-resolved-row">
                {body}
              </Link>
            : <article key={o.id} className="ibx-row" data-testid="inbox-resolved-row">
                {body}
              </article>;
        })}
        {shown.length === 0 ? <Empty title={all.length ? 'NO RESOLVED ITEMS MATCH' : 'NOTHING RESOLVED YET'} body="Recorded approvals, revisions and completed stages appear here." /> : null}
      </div>
    </div>
  );
}

/* ── CHILD · ALL INBOX ───────────────────────────────────────────────────────────────────────────── */
type Dim = 'STATE' | 'TYPE' | 'AREA' | 'ENTRY' | 'URGENCY' | 'PERSON' | 'DATE';
const DIMS: Dim[] = ['STATE', 'TYPE', 'AREA', 'ENTRY', 'URGENCY', 'PERSON', 'DATE'];
const dimValue = (o: InboxObject, d: Dim): string =>
  d === 'STATE' ? o.state
  : d === 'TYPE' ? o.type
  : d === 'AREA' ? o.area
  : d === 'ENTRY' ? o.entry
  : d === 'URGENCY' ? o.urgency
  : d === 'PERSON' ? (o.by ?? 'UNASSIGNED')
  : o.at ? (Date.now() - new Date(o.at).getTime() < 86400000 ? 'TODAY' : 'EARLIER')
  : 'CURRENT';
const dimLabel = (d: Dim, v: string) => (d === 'STATE' ? STATE_LABEL[v as InboxState] : v);

function AllInbox({ objects, url }: { objects: InboxObject[]; url: Url }) {
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Partial<Record<Dim, string>>>(() => {
    const init: Partial<Record<Dim, string>> = {};
    const t = params.get('type');
    const s = params.get('state');
    if (t) init.TYPE = t;
    if (s) init.STATE = s;
    return init;
  });
  const [sheet, setSheet] = useState(false);
  const shown = objects.filter((o) => match(q, o) && DIMS.every((d) => !f[d] || dimValue(o, d) === f[d]));
  const opts = (d: Dim) => [{ id: 'ALL', label: d }, ...[...new Set(objects.map((o) => dimValue(o, d)))].map((v) => ({ id: v, label: dimLabel(d, v) }))];
  const set = (d: Dim, v: string) => setF((p) => ({ ...p, [d]: v === 'ALL' ? undefined : v }));
  const active = DIMS.filter((d) => f[d]).length;
  return (
    <div className="ibx-view ibx-list-view ibx-all" data-testid="inbox-all">
      <TypeRail active="all" />
      <header className="ibx-title">
        <h1>ALL INBOX</h1>
        <p>
          {f.TYPE ? `${f.TYPE}S` : 'ALL TYPES'} · {f.STATE ? STATE_LABEL[f.STATE as InboxState] : 'ALL STATES'} · {pad2(shown.length)} ITEMS
        </p>
      </header>
      <div className="ibx-filters">
        <Search value={q} onChange={setQ} placeholder="Search inbox…" testId="inbox-all-search" />
        <button type="button" className={`ibx-iconbtn${active ? ' is-on' : ''}`} aria-label="Filters" onClick={() => setSheet(true)} data-testid="inbox-all-filter">
          <IaIcon name="filter" />
          {active ? <em>{active}</em> : null}
        </button>
      </div>
      <div className="ibx-dims" data-testid="inbox-all-dims">
        {DIMS.map((d) => (
          <Menu key={d} label={d} value={f[d] ?? 'ALL'} onChange={(v) => set(d, v)} options={opts(d)} testId={`inbox-dim-${d.toLowerCase()}`} />
        ))}
      </div>
      <div className="ibx-pane ibx-rows ibx-table" data-scroll="internal" data-testid="inbox-all-list">
        <div className="ibx-table__head" aria-hidden>
          <span />
          <span>OBJECT</span>
          <span>TYPE</span>
          <span>STATE</span>
          <span>URGENCY</span>
          <span>AREA</span>
          <span />
        </div>
        {shown.map((o) => (
          <Link key={o.id} to={detailHref(o) ?? INBOX} className="ibx-row ibx-row--all" data-testid="inbox-all-row" data-type={o.type} data-state={o.state}>
            <Art o={o} url={url} />
            <div className="ibx-row__main">
              <small>{o.type === 'SYSTEM' ? 'SYSTEM' : o.entry}</small>
              <b>{o.title}</b>
              <em>{[...o.blocks.slice(0, 1), o.area].filter(Boolean).join(' · ')}</em>
            </div>
            <span className="ibx-row__type">
              <IaIcon name={TYPE_ICON[o.type]} />
              {o.type}
            </span>
            <span className="ibx-row__state">
              <StateBadge s={o.state} />
            </span>
            <span className="ibx-row__urg">{o.urgency === 'HIGH' ? <Chip tone="red">HIGH</Chip> : <small>NORMAL</small>}</span>
            <span className="ibx-row__area">{o.area}</span>
            <IaIcon name="next" className="ibx-chev" />
          </Link>
        ))}
        {shown.length === 0 ? <Empty title="NO ITEMS MATCH" body="Clear a filter or search to see more." /> : null}
      </div>
      {sheet ?
        <Sheet title="FILTER / SORT" onClose={() => setSheet(false)} testId="inbox-filter-sheet" wide>
          <div className="ibx-filtersheet">
            {DIMS.map((d) => (
              <fieldset key={d}>
                <legend>{d}</legend>
                {opts(d).map((o) => (
                  <button key={o.id} type="button" className={(f[d] ?? 'ALL') === o.id ? 'is-active' : undefined} onClick={() => set(d, o.id)}>
                    {o.id === 'ALL' ? 'ALL' : o.label}
                  </button>
                ))}
              </fieldset>
            ))}
            <div className="ibx-actions">
              <button type="button" className="ibx-btn" onClick={() => setF({})} data-testid="inbox-filter-clear">
                CLEAR ALL
              </button>
              <button type="button" className="ibx-btn ibx-btn--red" onClick={() => setSheet(false)}>
                SHOW {pad2(shown.length)} ITEMS
              </button>
            </div>
          </div>
        </Sheet>
      : null}
    </div>
  );
}

/* ── CHILD · MESSAGES (no messaging service yet → honest unmounted panes; project context is live) ─ */
function ProjectContext({ objects, data, testId }: { objects: InboxObject[]; data: Data; testId: string }) {
  const open = objects.filter((o) => o.type === 'DECISION' && o.state === 'NEEDS_YOU');
  const gateNode = data?.graph.founderGate.open ? data.graph.byId[data.graph.founderGate.nodeId as HubNodeId] : null;
  return (
    <aside className="ibx-context" data-testid={testId}>
      <Head title="PROJECT CONTEXT" />
      <Facts
        rows={[
          ['PROJECT', data?.project.name?.toUpperCase() ?? data?.project.projectId?.toUpperCase()],
          ['ENTRY', data?.production?.label],
          ['STAGE', gateNode?.label ?? data?.graph.operation?.label],
          ['DECISIONS', `${pad2(open.length)} OPEN`],
          ['AFFECTS', gateNode ? gateNode.unlocks.map((u) => data?.graph.byId[u]?.label ?? u).join(' + ') : ''],
        ]}
      />
      {open[0] ?
        <Link to={inboxHref('needs', { item: open[0].id })} className="ibx-linked" data-testid="inbox-context-decision">
          <small>OPEN DECISION</small>
          <b>{open[0].title}</b>
          <em>NEEDS YOU</em>
        </Link>
      : null}
    </aside>
  );
}
function Composer({ testId }: { testId: string }) {
  return (
    <div className="ibx-composer" data-testid={testId}>
      <button type="button" className="ibx-iconbtn" disabled aria-label="Attach">
        <IaIcon name="link" />
      </button>
      <input type="text" disabled placeholder="Messaging is not connected to Production yet." aria-label="Write a message" />
      <button type="button" className="ibx-iconbtn ibx-iconbtn--red" disabled aria-label="Send">
        <IaIcon name="next" />
      </button>
    </div>
  );
}
function Messages({ objects, data }: { objects: InboxObject[]; data: Data }) {
  const msgs = objects.filter((o) => o.type === 'MESSAGE');
  return (
    <div className="ibx-view ibx-msgs" data-testid="inbox-messages">
      <TypeRail active="messages" />
      <header className="ibx-title ibx-title--inline">
        <h1>MESSAGES</h1>
        <span className="ibx-red">/ {pad2(msgs.filter((m) => m.state === 'NEEDS_YOU').length)} NEED YOU</span>
      </header>
      <div className="ibx-msgs__grid">
        <section className="ibx-convos" data-testid="inbox-conversations">
          <Head title="CONVERSATIONS" />
          <div className="ibx-pane" data-scroll="internal">
            <Empty title="NO CONVERSATIONS" body="Project-linked conversations appear here once messaging is connected." unmounted testId="inbox-messages-unmounted" />
          </div>
        </section>
        <section className="ibx-thread ibx-thread--empty" data-testid="inbox-active-thread">
          <div className="ibx-pane ibx-thread__pane" data-scroll="internal" data-testid="inbox-thread-pane">
            <Empty title="MESSAGING IS NOT CONNECTED" body="Threads tie people to entries, decisions and files. Production records decisions today — see NEEDS YOU." unmounted />
          </div>
          <Composer testId="inbox-composer" />
        </section>
        <ProjectContext objects={objects} data={data} testId="inbox-message-context" />
      </div>
    </div>
  );
}

/* ── CHILD · SYSTEM ──────────────────────────────────────────────────────────────────────────────── */
function SystemView({ objects, data, url }: { objects: InboxObject[]; data: Data; url: Url }) {
  const sys = objects.filter((o) => o.type === 'SYSTEM');
  const nodes = data?.graph.nodes ?? [];
  const complete = nodes.filter((n) => n.status === 'COMPLETE').length;
  return (
    <div className="ibx-view ibx-sys" data-testid="inbox-system">
      <TypeRail active="system" />
      <div className="ibx-metrics" data-testid="inbox-system-metrics">
        <div>
          <span>PIPELINE</span>
          <b>
            {complete}/{nodes.length}
          </b>
        </div>
        <div>
          <span>FRAMES</span>
          <b>{pad2(data?.frames.length ?? 0)}</b>
        </div>
        <div>
          <span>BLOCKERS</span>
          <b>{pad2(data?.graph.blockers.length ?? 0)}</b>
        </div>
        <div>
          <span>NOTICES</span>
          <b>{pad2(sys.filter((o) => o.state !== 'RESOLVED').length)}</b>
        </div>
      </div>
      <div className="ibx-sys__grid">
        <div className="ibx-pane ibx-rows ibx-rows--sys" data-scroll="internal" data-testid="inbox-system-notices">
          {sys.map((o) => (
            <article key={o.id} className="ibx-row ibx-row--sys" data-testid="inbox-system-row" data-state={o.state}>
              <Art o={o} url={url} />
              <div className="ibx-row__main">
                <b>{o.title}</b>
                <em>{o.why}</em>
                <small>{o.at ? agoLabel(o.at) : 'LIVE STATE'}</small>
              </div>
              <Chip tone={o.state === 'NEEDS_YOU' ? 'red' : STATUS_TONE[o.status]}>{o.state === 'NEEDS_YOU' ? 'NEEDS YOU' : STATUS_LABEL[o.status]}</Chip>
              <Link to={inboxHref('system', { notice: o.id })} className={`ibx-btn${o.state === 'NEEDS_YOU' ? ' ibx-btn--red' : ''}`} data-testid="inbox-system-inspect">
                {o.state === 'NEEDS_YOU' ? 'REVIEW' : 'INSPECT'}
              </Link>
            </article>
          ))}
          {sys.length === 0 ? <Empty title="NO SYSTEM NOTICES" testId="inbox-system-empty" /> : null}
        </div>
        <div className="ibx-sys__side">
          <Attention objects={objects} data={data} />
          <RecentlyResolved objects={objects} url={url} />
        </div>
      </div>
    </div>
  );
}

/* ── GRANDCHILD · DECISION DETAIL ────────────────────────────────────────────────────────────────── */
function Tabs<T extends string>({ tabs, value, onChange, testId }: { tabs: T[]; value: T; onChange: (t: T) => void; testId: string }) {
  return (
    <div className="ibx-dtabs" role="tablist" data-testid={testId}>
      {tabs.map((t) => (
        <button key={t} type="button" role="tab" aria-selected={t === value} className={t === value ? 'is-active' : undefined} onClick={() => onChange(t)} data-testid={`${testId}-${t.toLowerCase()}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
const neighbours = (n: HubNode | undefined, data: Data) =>
  n ? [...n.dependsOn, ...n.unlocks].map((id) => data?.graph.byId[id]).filter((x): x is HubNode => !!x) : [];

function Attachments({ nodes, url, onOpen, testId }: { nodes: HubNode[]; url: Url; onOpen: (n: HubNode) => void; testId: string }) {
  return (
    <section className="ibx-attach" data-testid={testId}>
      <Head
        title={
          <>
            RELATED MATERIALS <em>({nodes.length})</em>
          </>
        }
      />
      <div className="ibx-attach__rail">
        {nodes.map((n) => (
          <button key={n.id} type="button" onClick={() => onOpen(n)} data-testid={`${testId}-item`}>
            <Thumb slotId={n.assetSlotId} url={url(n.assetSlotId)} label="" className="ibx-art" />
            <span>
              <b>{n.label}</b>
              <small>{n.status.replace(/_/g, ' ')}</small>
            </span>
          </button>
        ))}
        {nodes.length === 0 ? <Empty title="NO RELATED MATERIALS" /> : null}
      </div>
    </section>
  );
}
function Preview({ node, url, onClose }: { node: HubNode; url: Url; onClose: () => void }) {
  return (
    <Sheet title={node.label} onClose={onClose} testId="inbox-attachment-preview" wide>
      <div className="ibx-preview">
        <Thumb slotId={node.assetSlotId} url={url(node.assetSlotId)} label="" className="ibx-preview__art" />
        <Facts
          rows={[
            ['STAGE', node.label],
            ['STATUS', node.status.replace(/_/g, ' ')],
            ['DETAIL', node.statusDetail],
            ['ASSET', node.assetSlotId],
          ]}
        />
      </div>
    </Sheet>
  );
}
function Crumb({ to, parts, testId }: { to: string; parts: string[]; testId?: string }) {
  return (
    <nav className="ibx-crumb" aria-label="Breadcrumb">
      <Link to={to} data-testid={testId}>
        <IaIcon name="back" />
        {parts.slice(0, -1).map((p) => (
          <span key={p}>
            {p} <i>/</i>
          </span>
        ))}
        <b>{parts[parts.length - 1]}</b>
      </Link>
    </nav>
  );
}

function DecisionDetail({ o, data, url, actions }: { o: InboxObject | null; data: Data; url: Url; actions: Actions }) {
  const [tab, setTab] = useState<'DETAILS' | 'DISCUSSION' | 'VERSIONS' | 'DEPENDENCIES' | 'HISTORY'>('DETAILS');
  const [preview, setPreview] = useState<HubNode | null>(null);
  if (!o)
    return (
      <div className="ibx-view ibx-detail" data-testid="inbox-decision-detail">
        <Crumb to={INBOX} parts={['INBOX', 'NEEDS YOU']} testId="inbox-detail-back" />
        <Empty title="THIS DECISION IS NO LONGER OPEN" body="It may have been resolved. Recently resolved items are under RESOLVED." testId="inbox-detail-missing" />
      </div>
    );
  const node = o.nodeId ? data?.graph.byId[o.nodeId] : undefined;
  const rel = neighbours(node, data);
  const ok = actions.canDecide(o);
  const history = (data?.activity ?? []).filter((a) => node && a.detail.toUpperCase().includes(node.label.toUpperCase()));
  return (
    <div className="ibx-view ibx-detail" data-testid="inbox-decision-detail" data-object={o.id}>
      <Crumb to={inboxHref(o.state === 'NEEDS_YOU' ? 'needs' : o.state === 'WATCHING' ? 'watching' : 'resolved')} parts={['INBOX', STATE_LABEL[o.state]]} testId="inbox-detail-back" />
      <header className="ibx-dtitle">
        <h1>
          {o.entry} — {o.title}
        </h1>
        <span>
          {o.urgency === 'HIGH' ? <Chip tone="red">URGENT</Chip> : null}
          <Chip tone="grey">{STATUS_LABEL[o.status]}</Chip>
        </span>
      </header>
      <div className="ibx-dgrid">
        <section className="ibx-dcard" data-testid="inbox-detail-card">
          <Art o={o} url={url} className="ibx-dcard__art" />
          <Facts
            rows={[
              ['SOURCE', o.entry],
              ['AREA', o.area],
              ['REQUEST', o.title],
              ['BLOCKS', o.blocks.join(' + ')],
              ['BY', o.by],
              ['DUE', null],
            ]}
          />
          <div className="ibx-dside">
            <div>
              <span>AFFECTS</span>
              <b>{o.blocks.join(' + ') || '—'}</b>
            </div>
            <div>
              <span>DEPENDENCIES</span>
              <b>{pad2(node?.dependsOn.length ?? 0)}</b>
            </div>
            <div>
              <span>REVIEWERS</span>
              <b>—</b>
            </div>
          </div>
        </section>
        <section className="ibx-dtabpanel">
          <Tabs tabs={['DETAILS', 'DISCUSSION', 'VERSIONS', 'DEPENDENCIES', 'HISTORY']} value={tab} onChange={setTab} testId="inbox-detail-tab" />
          <div className="ibx-pane ibx-dtab" data-scroll="internal" data-testid={`inbox-detail-${tab.toLowerCase()}`}>
            {tab === 'DETAILS' ?
              <>
                <h3>OVERVIEW</h3>
                <p>{o.why || node?.statusDetail || '—'}</p>
                {node && node.statusDetail !== o.why ? <p className="ibx-muted">{node.statusDetail}</p> : null}
                {o.workspaceHref ?
                  <Link to={o.workspaceHref} className="ibx-viewall" data-testid="inbox-detail-workspace">
                    REVIEW IN WORKSPACE <IaIcon name="next" />
                  </Link>
                : null}
              </>
            : tab === 'DEPENDENCIES' ?
              node ?
                <ul className="ibx-deps">
                  {node.dependsOn.map((id) => (
                    <li key={`d-${id}`}>
                      <span>DEPENDS ON</span>
                      <b>{data?.graph.byId[id]?.label ?? id}</b>
                      <Chip tone="grey">{data?.graph.byId[id]?.status.replace(/_/g, ' ') ?? '—'}</Chip>
                    </li>
                  ))}
                  {node.unlocks.map((id) => (
                    <li key={`u-${id}`}>
                      <span>UNLOCKS</span>
                      <b>{data?.graph.byId[id]?.label ?? id}</b>
                      <Chip tone="grey">{data?.graph.byId[id]?.status.replace(/_/g, ' ') ?? '—'}</Chip>
                    </li>
                  ))}
                </ul>
              : <Empty title="NO DEPENDENCIES RECORDED" />
            : tab === 'HISTORY' ?
              history.length ?
                <ul className="ibx-deps">
                  {history.map((a) => (
                    <li key={a.id}>
                      <span>{agoLabel(a.at)}</span>
                      <b>{a.title}</b>
                    </li>
                  ))}
                </ul>
              : <Empty title="NO HISTORY RECORDED" body={`Current state: ${STATUS_LABEL[o.status]}.`} />
            : <Empty title={`${tab} IS NOT CONNECTED`} body="Reviewers, versions and discussion threads are not connected to Production yet." unmounted />}
          </div>
        </section>
        <Attachments nodes={rel} url={url} onOpen={setPreview} testId="inbox-detail-attachments" />
      </div>
      <footer className="ibx-dactions ibx-actions" data-testid="inbox-detail-actions">
        <button type="button" className="ibx-btn ibx-btn--red" disabled={!ok || actions.deciding} onClick={() => actions.approve(o)} title={ok ? undefined : actions.gateReason} data-testid="inbox-approve">
          APPROVE
        </button>
        <button type="button" className="ibx-btn ibx-btn--soft" onClick={() => actions.requestRevision(o)} data-testid="inbox-revise">
          REQUEST REVISION
        </button>
        {!ok ? <p className="ibx-hint">{actions.gateReason}</p> : null}
      </footer>
      {preview ? <Preview node={preview} url={url} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}

/* ── GRANDCHILD · MESSAGE THREAD (no messaging source → honest shell) ────────────────────────────── */
function MessageThread({ id }: { id: string }) {
  return (
    <div className="ibx-view ibx-threadview" data-testid="inbox-message-thread" data-thread={id}>
      <Crumb to={inboxHref('messages')} parts={['MESSAGES', 'THREAD']} testId="inbox-thread-back" />
      <header className="ibx-thead">
        <span className="ibx-avatar" aria-hidden>
          <IaIcon name="user" />
        </span>
        <div>
          <b>CONVERSATION NOT FOUND</b>
          <small>No conversation is stored for this link.</small>
        </div>
        <Facts
          className="ibx-facts--tight"
          rows={[
            ['PARTICIPANTS', '—'],
            ['FILES', '—'],
            ['DECISIONS', '—'],
            ['AFFECTS', '—'],
          ]}
        />
      </header>
      <div className="ibx-linked ibx-linked--none" data-testid="inbox-thread-linked">
        <small>LINKED DECISION</small>
        <b>NONE</b>
      </div>
      <div className="ibx-pane ibx-thread__pane" data-scroll="internal" data-testid="inbox-thread-pane">
        <Empty title="MESSAGING IS NOT CONNECTED" body="Messages, attachments and reactions appear here once a messaging service is connected." unmounted />
      </div>
      <div className="ibx-thread__compose">
        <Composer testId="inbox-thread-composer" />
        <button type="button" className="ibx-btn ibx-btn--outline-red" disabled data-testid="inbox-create-decision">
          CREATE DECISION
        </button>
      </div>
    </div>
  );
}

/* ── GRANDCHILD · SYSTEM NOTICE DETAIL ───────────────────────────────────────────────────────────── */
function NoticeDetail({ o, data, url }: { o: InboxObject | null; data: Data; url: Url }) {
  const [tab, setTab] = useState<'DETAILS' | 'ATTEMPTS' | 'DEPENDENCIES' | 'HISTORY'>('DETAILS');
  const [preview, setPreview] = useState<HubNode | null>(null);
  if (!o)
    return (
      <div className="ibx-view ibx-detail" data-testid="inbox-system-notice">
        <Crumb to={inboxHref('system')} parts={['SYSTEM']} testId="inbox-notice-back" />
        <Empty title="NOTICE NOT FOUND" testId="inbox-notice-missing" />
      </div>
    );
  const node = o.nodeId ? data?.graph.byId[o.nodeId] : undefined;
  const chain = node ? [...node.dependsOn.map((id) => data?.graph.byId[id]), node, ...node.unlocks.slice(0, 1).map((id) => data?.graph.byId[id])].filter((x): x is HubNode => !!x) : [];
  const ICON: Partial<Record<HubNode['status'], IaIconName>> = { COMPLETE: 'check', BLOCKED: 'alert', REVIEW_REQUIRED: 'alert', ACTIVE: 'clock' };
  return (
    <div className="ibx-view ibx-detail ibx-notice" data-testid="inbox-system-notice" data-object={o.id}>
      <Crumb to={inboxHref('system')} parts={['SYSTEM']} testId="inbox-notice-back" />
      <header className="ibx-dtitle ibx-dtitle--stack">
        <h1>{o.title}</h1>
        <p>
          <span className={o.urgency === 'HIGH' ? 'ibx-red' : undefined}>{o.urgency}</span> <i>•</i> {STATUS_LABEL[o.status]}
        </p>
      </header>
      <div className="ibx-dgrid ibx-dgrid--notice">
        <section className="ibx-dcard" data-testid="inbox-notice-card">
          <Art o={o} url={url} className="ibx-dcard__art" />
          <Facts
            rows={[
              ['STATUS', <span className={node?.status === 'BLOCKED' ? 'ibx-red' : undefined}>{node?.status.replace(/_/g, ' ')}</span>],
              ['TIME', o.at ? agoLabel(o.at) : 'LIVE STATE'],
              ['TRIGGERED BY', 'PRODUCTION GRAPH'],
              ['PROJECT', data?.project.name?.toUpperCase()],
              ['AFFECTS', data?.production?.label],
              ['AREA', o.area],
              ['REASON', o.why],
              ['ATTEMPTS', null],
            ]}
          />
        </section>
        <section className="ibx-chain" data-testid="inbox-notice-chain">
          <Head title="DEPENDENCY CHAIN" />
          <ol>
            {chain.map((n) => (
              <li key={n.id} className={n.id === node?.id ? 'is-self' : undefined} data-status={n.status}>
                <Thumb slotId={n.assetSlotId} url={url(n.assetSlotId)} label="" className="ibx-art" />
                <span>
                  <small>{n.label}</small>
                  <b>{n.status.replace(/_/g, ' ')}</b>
                </span>
                <IaIcon name={ICON[n.status] ?? 'more'} className="ibx-chain__ic" />
              </li>
            ))}
          </ol>
        </section>
        <Attachments nodes={neighbours(node, data)} url={url} onOpen={setPreview} testId="inbox-notice-assets" />
        <section className="ibx-dtabpanel">
          <Tabs tabs={['DETAILS', 'ATTEMPTS', 'DEPENDENCIES', 'HISTORY']} value={tab} onChange={setTab} testId="inbox-notice-tab" />
          <div className="ibx-pane ibx-dtab" data-scroll="internal" data-testid={`inbox-notice-${tab.toLowerCase()}`}>
            {tab === 'DETAILS' ?
              <pre className="ibx-mono">{[o.why, node ? `${node.label} unlocks: ${node.unlocks.map((u) => data?.graph.byId[u]?.label ?? u).join(', ') || '—'}` : ''].filter(Boolean).join('\n')}</pre>
            : tab === 'DEPENDENCIES' ?
              <ul className="ibx-deps">
                {chain.map((n) => (
                  <li key={n.id}>
                    <span>{n.id === node?.id ? 'THIS STAGE' : node?.dependsOn.includes(n.id) ? 'DEPENDS ON' : 'UNLOCKS'}</span>
                    <b>{n.label}</b>
                    <Chip tone="grey">{n.status.replace(/_/g, ' ')}</Chip>
                  </li>
                ))}
              </ul>
            : tab === 'HISTORY' ?
              <Empty title="NO HISTORY RECORDED" body={`Current state: ${STATUS_LABEL[o.status]}.`} />
            : <Empty title="ATTEMPTS ARE NOT CONNECTED" body="Render attempts are not reported to Production yet." unmounted />}
          </div>
        </section>
      </div>
      <footer className="ibx-dactions ibx-dactions--four ibx-actions" data-testid="inbox-notice-actions">
        {['RETRY', 'ASSIGN', 'ESCALATE', 'ACKNOWLEDGE'].map((a, i) => (
          <button key={a} type="button" className={`ibx-btn${i === 0 ? ' ibx-btn--red' : ''}`} disabled title="System actions are not connected to Production yet." data-testid={`inbox-notice-${a.toLowerCase()}`}>
            {a}
          </button>
        ))}
        {o.workspaceHref ?
          <Link to={o.workspaceHref} className="ibx-viewall" data-testid="inbox-notice-workspace">
            OPEN IN WORKSPACE <IaIcon name="next" />
          </Link>
        : null}
      </footer>
      {preview ? <Preview node={preview} url={url} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}
