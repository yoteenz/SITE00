/**
 * INBOX — attention · communication · feedback · approval · decision (not email).
 * P0.STUDIOOS.PRODUCTION.INBOX-ACTIVITY.THREE-VIEWPORT-RECONSTRUCTION.OPUS1
 *
 * One route (/production/queue). The authority's children are LENSES over the same live data, held in the
 * query string (?view=priority|approvals|direct|system) and the approval detail grandchild is ?item=<id>.
 * Data is unchanged: hub attention items + device-held production requests + recorded activity + the
 * production graph. Decisions still go through `decideStoryboard` and stay gated by the founder gate.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import { productionExpressionPath, productionWorkspacePath } from '../../../../shared/site00-production-workspace/routes.js';
import { useProductionRequests } from '../../state/productionRequestStore';
import { buildActivityRows } from './ActivityBody';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { NODE_SUB } from './HubBody';
import { IaChip, IaEmpty, IaHero, IaIcon, IaLensBar, IaPanel, IaStats, type IaLens } from './iaKit';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { agoLabel, Thumb } from './primitives';

export type InboxLens = 'all' | 'priority' | 'approvals' | 'direct' | 'system';
export const INBOX_LENSES: readonly InboxLens[] = ['all', 'priority', 'approvals', 'direct', 'system'];
const LENS_LABEL: Record<InboxLens, string> = { all: 'ALL', priority: 'PRIORITY', approvals: 'APPROVALS', direct: 'DIRECT', system: 'SYSTEM' };
const INBOX = '/production/queue';
export const inboxHref = (lens: InboxLens, item?: string) => {
  const q = new URLSearchParams();
  if (lens !== 'all') q.set('view', lens);
  if (item) q.set('item', item);
  const s = q.toString();
  return s ? `${INBOX}?${s}` : INBOX;
};

/** One row in the inbox: a live attention item or a device-held production request. */
type InboxItem = {
  id: string;
  source: string;
  title: string;
  subtitle: string;
  why: string;
  state: string;
  priority: 'HIGH' | 'NORMAL';
  /** decision objects (attention items + requests awaiting approval) open the approval review */
  decision: boolean;
  nodeId: HubNodeId | null;
  slot: string | null;
  plate: string | null;
  href: string;
  at: string | null;
  testId: 'inbox-item' | 'queue-request';
};

const REQUEST_PLATE = (ws: string, sub: string | null) =>
  ws === 'DESIGN' ? AUTHORITY_ASSETS.boards.brand
  : sub === 'sets' ? AUTHORITY_ASSETS.expressionStage
  : sub === 'casting' ? AUTHORITY_ASSETS.boards.experience
  : AUTHORITY_ASSETS.boards.assets;

export function InboxBody() {
  const data = useProductionAuthorityData();
  const requests = useProductionRequests();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const viewParam = params.get('view') as InboxLens | null;
  const lens: InboxLens = viewParam && INBOX_LENSES.includes(viewParam) ? viewParam : 'all';
  const itemId = params.get('item');

  const slug = data?.project.projectId ?? 'ndxbook';
  const attention = data?.attention;
  const productionLabel = data?.production?.label ?? 'PRODUCTION';

  const items: InboxItem[] = useMemo(() => {
    const nodeHref = (nodeId: HubNodeId | null) => (nodeId ? productionExpressionPath(slug, NODE_SUB[nodeId]) : productionExpressionPath(slug));
    const fromAttention: InboxItem[] = (attention ?? []).map((a) => ({
      id: a.id,
      source: productionLabel,
      title: a.title,
      subtitle: a.subtitle,
      why: a.why,
      state: a.stateLabel,
      priority: a.priority,
      decision: true,
      nodeId: a.nodeId,
      slot: a.assetSlotId,
      plate: null,
      href: nodeHref(a.nodeId),
      at: null,
      testId: 'inbox-item',
    }));
    const fromRequests: InboxItem[] = requests
      .filter((r) => r.status === 'QUEUED' || r.status === 'AWAITING_APPROVAL')
      .map((r) => ({
        id: r.id,
        source: r.projectSlug.toUpperCase(),
        title: productionRequestTitle(r.kind),
        subtitle: productionRequestScope(r.kind),
        why: `${r.projectSlug.toUpperCase()} · ${productionRequestScope(r.kind)}`,
        state: r.status.replace(/_/g, ' '),
        priority: 'NORMAL' as const,
        decision: r.status === 'AWAITING_APPROVAL',
        nodeId: null,
        slot: null,
        plate: REQUEST_PLATE(r.targetWorkspace, r.targetSubWorkspace ?? null),
        href: r.targetWorkspace === 'GENERAL' ? `/production/${r.projectSlug}` : productionWorkspacePath(r.projectSlug, r.targetWorkspace, r.targetSubWorkspace ?? ''),
        at: r.createdAt,
        testId: 'queue-request',
      }));
    return [...fromAttention, ...fromRequests];
  }, [attention, requests, productionLabel, slug]);

  const q = search.trim().toLowerCase();
  const match = (s: string) => !q || s.toLowerCase().includes(q);
  const shown = items.filter((i) => match(`${i.title} ${i.subtitle} ${i.why} ${i.source}`));
  const decisions = shown.filter((i) => i.decision);
  const urgent = shown.filter((i) => i.priority === 'HIGH');
  const watching = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'AWAITING_APPROVAL');
  const resolved = (data?.activity ?? []).filter((a) => a.category === 'APPROVAL' || a.category === 'ASSET');
  const systemRows = buildActivityRows(data).filter((r) => r.actor === 'SYSTEM' || r.category === 'RENDER' || r.category === 'ASSET');
  const blockers = data?.graph.blockers ?? [];

  const gate = data?.graph.founderGate;
  const canDecideFor = (it: InboxItem | null) => !!it && !!gate?.open && gate.decidableInHub && it.nodeId === gate.nodeId;
  const decide = async (decision: 'APPROVE' | 'REVISE') => {
    if (!data) return;
    const res = await data.decideStoryboard(decision, '');
    setNote(res.ok ? (decision === 'APPROVE' ? 'APPROVED — recorded in activity.' : 'REVISION REQUESTED — queued.') : res.error);
  };

  const lenses: IaLens[] = INBOX_LENSES.map((id) => ({
    id,
    label: LENS_LABEL[id],
    to: inboxHref(id),
    count: id === 'priority' ? items.filter((i) => i.priority === 'HIGH').length : id === 'approvals' ? items.filter((i) => i.decision).length : undefined,
  }));

  const plates = AUTHORITY_ASSETS.hubHero;
  const hero =
    lens === 'priority' ? <IaHero testId="inbox-hero" kicker="COMMUNICATIONS" title="INBOX / PRIORITY" lines={['CRITICAL CONVERSATIONS.', 'YOUR ATTENTION. MOVE CREATIVE FORWARD.']} plates={plates} />
    : lens === 'approvals' ? <IaHero testId="inbox-hero" kicker="COMMUNICATIONS / INBOX" title="APPROVALS" lines={['REVIEW. APPROVE. REQUEST CHANGES.', 'KEEP PRODUCTION MOVING.']} plates={plates} />
    : <IaHero testId="inbox-hero" kicker="COMMUNICATIONS" title="INBOX" lines={['IDEAS. FEEDBACK. DECISIONS.', 'ALL IN ONE PLACE.']} plates={plates} />;

  const footnote = (
    <p className="iax-footnote">
      Requests are held on this device until the queue service is connected. {items.length ? `${String(items.length).padStart(2, '0')} OPEN.` : ''}
    </p>
  );

  if (itemId) {
    const list = items.filter((i) => i.decision);
    const idx = list.findIndex((i) => i.id === itemId);
    const it = idx >= 0 ? list[idx]! : null;
    return (
      <div className="iax iax--inbox iax--detail" data-testid="production-queue" data-lens="approval-detail">
        <ApprovalDetail
          item={it}
          prev={idx > 0 ? list[idx - 1]! : null}
          next={idx >= 0 && idx < list.length - 1 ? list[idx + 1]! : null}
          canDecide={canDecideFor(it)}
          deciding={!!data?.deciding}
          note={note}
          onDecide={decide}
          gateDetail={gate?.open ? gate.detail : null}
        />
      </div>
    );
  }

  const thumbFor = (i: InboxItem, className = '') =>
    i.plate ? <span className={`pxa-thumb ${className}`} style={{ backgroundImage: `url(${i.plate})` }} aria-hidden /> : <Thumb slotId={i.slot} url={data?.assetUrl(i.slot) ?? null} label="" className={className} />;

  const row = (i: InboxItem) => (
    <li key={i.id}>
      <Link to={i.decision ? inboxHref('approvals', i.id) : i.href} className="iax-msg" data-testid={i.testId}>
        <i className={`iax-msg__dot${i.priority === 'HIGH' ? ' is-hot' : ''}`} aria-hidden />
        {thumbFor(i, 'iax-av')}
        <span className="iax-msg__who">
          <b>{i.source}</b>
          <strong>{i.title}</strong>
        </span>
        <span className="iax-msg__body">
          <small>{i.why}</small>
        </span>
        <time>{i.at ? agoLabel(i.at) : 'NOW'}</time>
        <IaChip tone={i.priority === 'HIGH' ? 'red' : i.decision ? 'amber' : 'ink'}>{i.priority === 'HIGH' ? 'URGENT' : i.decision ? 'DECISION' : i.state}</IaChip>
      </Link>
    </li>
  );

  const approvalCard = (i: InboxItem) => (
    <li key={i.id} className="iax-acard">
      {thumbFor(i)}
      <span className="iax-acard__meta">
        <b>{i.title}</b>
        <small>
          {i.subtitle} · {i.state}
        </small>
      </span>
      <IaChip tone={i.priority === 'HIGH' ? 'red' : 'amber'}>{i.priority === 'HIGH' ? 'HIGH' : 'MED'}</IaChip>
      <span className="iax-acard__actions">
        <Link to={inboxHref('approvals', i.id)} className="iax-btn iax-btn--line" data-testid="inbox-review-open">
          REVIEW
        </Link>
        <Link to={i.href} className="iax-btn iax-btn--ghost">
          OPEN
        </Link>
      </span>
    </li>
  );

  const bar = (placeholder: string) => <IaLensBar testId="inbox-tabs" lenses={lenses} active={lens} search={search} onSearch={setSearch} placeholder={placeholder} />;

  /* ── DIRECT: no person-to-person messaging data exists in Production — honest, authored empty shell ── */
  if (lens === 'direct') {
    return (
      <div className="iax iax--inbox" data-testid="production-queue" data-lens="direct">
        {hero}
        {bar('SEARCH MESSAGES, PEOPLE, OR PROJECTS…')}
        <div className="iax-direct">
          <IaPanel title="DIRECT MESSAGES" className="iax-direct__list" testId="inbox-direct-list">
            <IaEmpty unmounted title="NO CONVERSATIONS" body="Direct messaging is not connected to Production yet." />
          </IaPanel>
          <section className="iax-panel iax-direct__thread" data-testid="inbox-direct-thread">
            <IaEmpty
              unmounted
              testId="inbox-direct-unmounted"
              title="DIRECT MESSAGING IS NOT CONNECTED"
              body="Person-to-person conversation will appear here, tied to project work. Decisions that need you are under PRIORITY and APPROVALS."
            />
          </section>
          <aside className="iax-panel iax-direct__context" data-testid="inbox-direct-context">
            <header className="iax-panel__head">
              <h2>
                <i aria-hidden />
                PROJECT CONTEXT
              </h2>
            </header>
            <dl className="iax-kv">
              <div>
                <dt>PROJECT</dt>
                <dd>{(data?.project.name ?? 'NDXBOOK').toUpperCase()}</dd>
              </div>
              <div>
                <dt>ENTRY</dt>
                <dd>{data?.production?.label ?? '—'}</dd>
              </div>
              <div>
                <dt>DECISIONS OPEN</dt>
                <dd>{String(items.filter((i) => i.decision).length).padStart(2, '0')}</dd>
              </div>
            </dl>
            <Link to={inboxHref('approvals')} className="iax-btn iax-btn--line">
              OPEN APPROVALS <span aria-hidden>→</span>
            </Link>
          </aside>
        </div>
        {footnote}
      </div>
    );
  }

  /* ── SYSTEM: system-originated notices (graph state, renders, assets) ── */
  if (lens === 'system') {
    return (
      <InboxSystem
        hero={hero}
        bar={bar('SEARCH SYSTEM MESSAGES, RELEASES…')}
        rows={systemRows}
        search={search}
        watching={watching.length}
        blockers={blockers.length}
        frames={data?.frames.length ?? 0}
        nodes={data?.graph.nodes.length ?? 0}
        complete={data?.graph.completeCount ?? 0}
        footnote={footnote}
      />
    );
  }

  /* ── PRIORITY: attention lens over the same data ── */
  if (lens === 'priority') {
    const focus = items.find((i) => i.priority === 'HIGH') ?? items[0] ?? null;
    return (
      <div className="iax iax--inbox" data-testid="production-queue" data-lens="priority">
        {hero}
        {bar('SEARCH MESSAGES, PEOPLE, OR PROJECTS…')}
        <IaStats
          testId="inbox-stats"
          stats={[
            { icon: 'alert', value: urgent.length, label: 'URGENT', sub: 'NEEDS ATTENTION NOW' },
            { icon: 'lock', value: blockers.length, label: 'BLOCKERS', sub: 'HOLDING THE PIPELINE' },
            { icon: 'up', value: gate?.open ? 1 : 0, label: 'FOUNDER GATE', sub: gate?.open ? 'OPEN · DECISION NEEDED' : 'CLEAR' },
            { icon: 'clock', value: items.length, label: 'WAITING ON YOU', sub: 'REQUESTS & DECISIONS' },
          ]}
        />
        <div className="iax-grid iax-grid--split">
          <IaPanel title="URGENT" action={{ to: inboxHref('all') }} testId="inbox-urgent">
            {urgent.length ? <ul className="iax-msgs">{urgent.map(row)}</ul> : <IaEmpty testId="queue-empty" title="NOTHING URGENT" body="No high-priority decisions are waiting." />}
            {blockers.length ?
              <ul className="iax-blocklist" data-testid="inbox-blockers">
                {blockers.map((b) => (
                  <li key={b}>
                    <IaIcon name="lock" />
                    <span>{b}</span>
                    <IaChip tone="red">BLOCKER</IaChip>
                  </li>
                ))}
              </ul>
            : null}
          </IaPanel>
          <div className="iax-col">
            <IaPanel title="PRIORITY DECISION QUEUE" action={{ to: inboxHref('approvals') }} testId="inbox-decisions">
              {decisions.length ? <ul className="iax-acards">{decisions.map(approvalCard)}</ul> : <IaEmpty title="QUEUE CLEAR" body="Nothing needs your decision right now." />}
            </IaPanel>
            <IaPanel title="FAST ACTIONS" testId="inbox-fast-actions">
              <div className="iax-fast">
                <button
                  type="button"
                  disabled={!canDecideFor(focus) || data?.deciding}
                  onClick={() => void decide('APPROVE')}
                  data-testid="inbox-approve"
                  title={canDecideFor(focus) ? undefined : 'Approval opens once the storyboard gate is decidable here.'}
                >
                  <IaIcon name="check" />
                  <b>APPROVE</b>
                  <small>{focus ? focus.title : 'NO ITEM'}</small>
                </button>
                <button type="button" disabled={!canDecideFor(focus) || data?.deciding} onClick={() => void decide('REVISE')} data-testid="inbox-revise">
                  <IaIcon name="chat" />
                  <b>REQUEST REVISION</b>
                  <small>SEND BACK</small>
                </button>
                <Link to={focus ? focus.href : productionExpressionPath(slug)} data-testid="inbox-review">
                  <IaIcon name="clock" />
                  <b>REVIEW</b>
                  <small>OPEN WORKSPACE</small>
                </Link>
                <Link to="/production/activity?view=blockers">
                  <IaIcon name="up" />
                  <b>BLOCKERS</b>
                  <small>SEE WHAT IS HELD</small>
                </Link>
              </div>
              {note ?
                <p className="iax-note" role="status" data-testid="inbox-decision-note">
                  {note}
                </p>
              : null}
            </IaPanel>
          </div>
        </div>
        {footnote}
      </div>
    );
  }

  /* ── APPROVALS: actionable review queue + preview of the first open decision ── */
  if (lens === 'approvals') {
    const sel = decisions[0] ?? null;
    return (
      <div className="iax iax--inbox" data-testid="production-queue" data-lens="approvals">
        {hero}
        {bar('SEARCH APPROVALS, ASSETS, PEOPLE…')}
        <IaStats
          testId="inbox-stats"
          stats={[
            { icon: 'clock', value: decisions.length, label: 'PENDING REVIEW', sub: 'AWAITING YOUR DECISION' },
            { icon: 'alert', value: decisions.filter((d) => d.priority === 'HIGH').length, label: 'HIGH RISK', sub: 'NEEDS ATTENTION' },
            { icon: 'check', value: resolved.filter((r) => r.category === 'APPROVAL').length, label: 'APPROVED', sub: 'RECORDED DECISIONS', tone: 'green' },
            { icon: 'lock', value: blockers.length, label: 'BLOCKED', sub: 'WAITING ON DECISIONS' },
          ]}
        />
        <div className="iax-grid iax-grid--review">
          <IaPanel title="APPROVALS" testId="inbox-approvals">
            {decisions.length ?
              <ul className="iax-review">
                {decisions.map((i) => (
                  <li key={i.id} className={i.id === sel?.id ? 'is-selected' : undefined}>
                    <Link to={inboxHref('approvals', i.id)} data-testid={i.testId}>
                      {thumbFor(i)}
                      <span>
                        <b>{i.title}</b>
                        <small>
                          {i.subtitle} · {i.state}
                        </small>
                        <em>
                          <IaIcon name="clock" /> {i.why}
                        </em>
                      </span>
                      <IaChip tone={i.priority === 'HIGH' ? 'red' : 'amber'}>{i.priority === 'HIGH' ? 'HIGH' : 'MED'}</IaChip>
                      <IaIcon name="next" className="iax-chev" />
                    </Link>
                  </li>
                ))}
              </ul>
            : <IaEmpty testId="queue-empty" title="QUEUE CLEAR" body="Nothing is waiting for your review." />}
          </IaPanel>
          {sel ?
            <aside className="iax-panel iax-preview" data-testid="inbox-primary" data-urgency={sel.priority}>
              {thumbFor(sel, 'iax-preview__media')}
              <header>
                <b>{sel.title}</b>
                <IaChip tone={sel.priority === 'HIGH' ? 'red' : 'amber'}>{sel.priority === 'HIGH' ? 'HIGH' : 'MED'}</IaChip>
              </header>
              <small>
                {sel.subtitle} · {sel.state}
              </small>
              <p>{sel.why}</p>
              <div className="iax-preview__actions">
                <Link to={inboxHref('approvals', sel.id)} className="iax-btn iax-btn--red">
                  REVIEW
                </Link>
                <button type="button" className="iax-btn iax-btn--line" disabled={!canDecideFor(sel) || data?.deciding} onClick={() => void decide('APPROVE')} data-testid="inbox-approve">
                  APPROVE
                </button>
                <button type="button" className="iax-btn iax-btn--line" disabled={!canDecideFor(sel) || data?.deciding} onClick={() => void decide('REVISE')} data-testid="inbox-revise">
                  REQUEST CHANGES
                </button>
              </div>
              {!canDecideFor(sel) ? <p className="iax-hint">{gate?.open ? gate.detail : 'No decision gate is open.'} Decide in the workspace.</p> : null}
              {note ?
                <p className="iax-note" role="status" data-testid="inbox-decision-note">
                  {note}
                </p>
              : null}
            </aside>
          : null}
        </div>
        {footnote}
      </div>
    );
  }

  /* ── ALL (root) ── */
  return (
    <div className="iax iax--inbox" data-testid="production-queue" data-lens="all">
      {hero}
      {bar('SEARCH MESSAGES, PEOPLE, OR PROJECTS…')}
      <IaStats
        testId="inbox-stats"
        stats={[
          { icon: 'mail', value: items.length, label: 'OPEN', sub: 'NEEDS YOU' },
          { icon: 'alert', value: urgent.length, label: 'URGENT', sub: 'NEEDS ATTENTION' },
          { icon: 'check', value: decisions.length, label: 'AWAITING APPROVAL', sub: 'PENDING YOUR REVIEW' },
          { icon: 'clock', value: watching.length, label: 'WATCHING', sub: 'REQUESTS IN FLIGHT' },
        ]}
      />
      <div className="iax-grid iax-grid--split">
        <IaPanel title="NEEDS YOU" action={{ to: inboxHref('priority') }} testId="inbox-incoming">
          {shown.length ? <ul className="iax-msgs">{shown.map(row)}</ul> : <IaEmpty testId="queue-empty" title="QUEUE CLEAR" body="Nothing needs you right now. Requests from projects appear here." />}
        </IaPanel>
        <div className="iax-col">
          <IaPanel title="AWAITING YOUR APPROVAL" action={{ to: inboxHref('approvals') }} testId="inbox-awaiting">
            {decisions.length ? <ul className="iax-acards">{decisions.map(approvalCard)}</ul> : <IaEmpty title="NOTHING AWAITING APPROVAL" />}
          </IaPanel>
          <IaPanel title="WATCHING" testId="inbox-watching">
            {watching.length ?
              <ul className="iax-lines">
                {watching.map((r) => (
                  <li key={r.id}>
                    <b>{productionRequestTitle(r.kind)}</b>
                    <small>
                      {r.projectSlug.toUpperCase()} · {productionRequestScope(r.kind)}
                    </small>
                    <IaChip tone="ink">{r.status.replace(/_/g, ' ')}</IaChip>
                  </li>
                ))}
              </ul>
            : <IaEmpty title="NOTHING IS BEING WATCHED" />}
          </IaPanel>
          <IaPanel title="RECENTLY RESOLVED" action={{ to: '/production/activity?view=approvals' }} testId="inbox-resolved">
            {resolved.length ?
              <ul className="iax-lines">
                {resolved.slice(0, 6).map((a) => (
                  <li key={a.id}>
                    <b>{a.title}</b>
                    <small>{agoLabel(a.at)}</small>
                    <IaChip tone="green">✓</IaChip>
                  </li>
                ))}
              </ul>
            : <IaEmpty title="NOTHING HAS BEEN RESOLVED YET" />}
          </IaPanel>
        </div>
      </div>
      {footnote}
    </div>
  );
}

/* ── SYSTEM lens ───────────────────────────────────────────────────────────────────────────────────── */
type SysType = 'ALL' | 'GRAPH' | 'RENDER' | 'ASSET';
function InboxSystem({
  hero,
  bar,
  rows,
  search,
  watching,
  blockers,
  frames,
  nodes,
  complete,
  footnote,
}: {
  hero: ReactNode;
  bar: ReactNode;
  rows: ReturnType<typeof buildActivityRows>;
  search: string;
  watching: number;
  blockers: number;
  frames: number;
  nodes: number;
  complete: number;
  footnote: ReactNode;
}) {
  const [type, setType] = useState<SysType>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const q = search.trim().toLowerCase();
  const typeOf = (r: (typeof rows)[number]): SysType => (r.category === 'RENDER' ? 'RENDER' : r.category === 'ASSET' ? 'ASSET' : 'GRAPH');
  const statuses = [...new Set(rows.map((r) => r.badge))];
  const shown = rows.filter((r) => (type === 'ALL' || typeOf(r) === type) && (status === 'ALL' || r.badge === status) && (!q || `${r.title} ${r.detail}`.toLowerCase().includes(q)));
  return (
    <div className="iax iax--inbox" data-testid="production-queue" data-lens="system">
      {hero}
      {bar}
      <IaStats
        testId="inbox-stats"
        stats={[
          { icon: 'pulse', value: `${complete}/${nodes}`, label: 'PIPELINE', sub: 'NODES COMPLETE', tone: 'green' },
          { icon: 'film', value: frames, label: 'STORYBOARD FRAMES', sub: 'MOUNTED' },
          { icon: 'lock', value: blockers, label: 'BLOCKERS', sub: 'SYSTEM HELD' },
          { icon: 'clock', value: watching, label: 'REQUESTS', sub: 'IN FLIGHT' },
        ]}
      />
      <div className="iax-sysfilters" data-testid="inbox-system-filters">
        <label>
          <small>NOTICE TYPE</small>
          <select value={type} onChange={(e) => setType(e.target.value as SysType)}>
            <option value="ALL">ALL SYSTEM NOTICES</option>
            <option value="GRAPH">PRODUCTION GRAPH</option>
            <option value="RENDER">RENDERS</option>
            <option value="ASSET">ASSETS</option>
          </select>
        </label>
        <label>
          <small>STATUS</small>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">ALL STATUSES</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <IaPanel title="SYSTEM NOTICES" count={shown.length} testId="inbox-system-notices">
        {shown.length ?
          <ul className="iax-notices">
            {shown.map((r) => (
              <li key={r.id}>
                <span className={`iax-notice__ic iax-notice__ic--${typeOf(r).toLowerCase()}`}>
                  <IaIcon name={typeOf(r) === 'RENDER' ? 'film' : typeOf(r) === 'ASSET' ? 'cube' : 'graph'} />
                </span>
                <span>
                  <b>{r.title}</b>
                  <small>{r.detail}</small>
                </span>
                <time>{r.at ? agoLabel(r.at) : 'NOW'}</time>
                <IaChip tone={r.badge === 'COMPLETE' ? 'green' : r.badge === 'BLOCKED' ? 'red' : r.badge === 'REVIEW' ? 'amber' : 'ink'}>{r.badge}</IaChip>
              </li>
            ))}
          </ul>
        : <IaEmpty testId="inbox-system-empty" title="NO SYSTEM NOTICES IN THIS VIEW" />}
      </IaPanel>
      {footnote}
    </div>
  );
}

/* ── APPROVAL DETAIL (grandchild) ──────────────────────────────────────────────────────────────────── */
type DetailTab = 'details' | 'dependencies' | 'history';
function ApprovalDetail({
  item,
  prev,
  next,
  canDecide,
  deciding,
  note,
  onDecide,
  gateDetail,
}: {
  item: InboxItem | null;
  prev: InboxItem | null;
  next: InboxItem | null;
  canDecide: boolean;
  deciding: boolean;
  note: string | null;
  onDecide: (d: 'APPROVE' | 'REVISE') => Promise<void>;
  gateDetail: string | null;
}) {
  const data = useProductionAuthorityData();
  const [tab, setTab] = useState<DetailTab>('details');
  const back = (
    <nav className="iax-crumbs" aria-label="Approval navigation">
      <Link to={inboxHref('approvals')} className="iax-back" data-testid="inbox-detail-back">
        <IaIcon name="back" /> BACK TO APPROVALS
      </Link>
      <span className="iax-pager">
        {prev ?
          <Link to={inboxHref('approvals', prev.id)} data-testid="inbox-detail-prev">
            <IaIcon name="back" /> PREV
          </Link>
        : <span className="is-off" aria-disabled="true" data-testid="inbox-detail-prev">
            <IaIcon name="back" /> PREV
          </span>
        }
        {next ?
          <Link to={inboxHref('approvals', next.id)} data-testid="inbox-detail-next">
            NEXT <IaIcon name="next" />
          </Link>
        : <span className="is-off" aria-disabled="true" data-testid="inbox-detail-next">
            NEXT <IaIcon name="next" />
          </span>
        }
      </span>
    </nav>
  );
  if (!item)
    return (
      <>
        {back}
        <IaEmpty testId="inbox-detail-missing" title="THIS DECISION IS NO LONGER OPEN" body="It may have been resolved. Return to Approvals for the current queue." />
      </>
    );
  const graph = data?.graph;
  const node = item.nodeId && graph ? graph.byId[item.nodeId] : null;
  const depends = node && graph ? node.dependsOn.map((id) => graph.byId[id]).filter(Boolean) : [];
  const unlocks = node && graph ? node.unlocks.map((id) => graph.byId[id]).filter(Boolean) : [];
  const history = node ? [{ label: node.label, status: node.status, detail: node.statusDetail }] : [];
  const media =
    item.plate ? <span className="pxa-thumb iax-media" style={{ backgroundImage: `url(${item.plate})` }} aria-hidden /> : <Thumb slotId={item.slot} url={data?.assetUrl(item.slot) ?? null} label={item.title} className="iax-media" />;
  const strip = node ? [node, ...depends, ...unlocks] : [];
  const tone = (s: string) => (s === 'COMPLETE' ? 'green' : s === 'LOCKED' ? 'ink' : 'amber');
  return (
    <div className="iax-detail" data-testid="inbox-approval-detail">
      {back}
      <div className="iax-detail__grid">
        <div className="iax-detail__media">
          {media}
          {strip.length ?
            <div className="iax-strip" data-testid="inbox-detail-strip">
              {strip.map((n) => (
                <Thumb key={n.id} slotId={n.assetSlotId} url={data?.assetUrl(n.assetSlotId) ?? null} label={n.label} className={n.id === node?.id ? 'is-current' : undefined} />
              ))}
            </div>
          : null}
        </div>
        <div className="iax-detail__head">
          <small className="iax-detail__meta">
            {[...new Set([item.subtitle, item.source].filter(Boolean))].join(' · ')} · {item.nodeId ? item.nodeId.toUpperCase() : 'REQUEST'}
          </small>
          <h1>
            {item.title}
            <IaChip tone={item.priority === 'HIGH' ? 'red' : 'amber'}>{item.priority === 'HIGH' ? 'HIGH' : 'MED'}</IaChip>
          </h1>
          <p>{item.why}</p>
          <div className="iax-statusbox">
            <div>
              <small>STATUS</small>
              <span>
                <IaIcon name="alert" />
                <b>{item.state}</b>
              </span>
              <em>PENDING YOUR REVIEW</em>
            </div>
            <div>
              <small>GATE</small>
              <span>
                <IaIcon name="lock" />
                <b>{canDecide ? 'DECIDABLE HERE' : 'DECIDE IN WORKSPACE'}</b>
              </span>
              <em>{gateDetail ?? '—'}</em>
            </div>
          </div>
          <div className="iax-detail__actions">
            <button type="button" className="iax-btn iax-btn--red" disabled={!canDecide || deciding} onClick={() => void onDecide('APPROVE')} data-testid="inbox-approve">
              <IaIcon name="check" /> APPROVE
            </button>
            <button type="button" className="iax-btn iax-btn--line" disabled={!canDecide || deciding} onClick={() => void onDecide('REVISE')} data-testid="inbox-revise">
              <IaIcon name="alert" /> REQUEST CHANGES
            </button>
            <Link to={item.href} className="iax-btn iax-btn--ghost iax-btn--wide" data-testid="inbox-review">
              <IaIcon name="chat" /> REVIEW IN WORKSPACE
            </Link>
          </div>
          {note ?
            <p className="iax-note" role="status" data-testid="inbox-decision-note">
              {note}
            </p>
          : null}
        </div>
      </div>
      <nav className="iax-tabs" aria-label="Approval sections">
        {(
          [
            ['details', 'DETAILS'],
            ['dependencies', `DEPENDENCIES (${depends.length + unlocks.length})`],
            ['history', `STATUS HISTORY (${history.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'is-active' : undefined} aria-pressed={tab === id} onClick={() => setTab(id)} data-testid={`inbox-detail-tab-${id}`}>
            {label}
          </button>
        ))}
      </nav>
      <div className="iax-detail__panels" data-tab={tab}>
        <IaPanel title="DETAILS" className="iax-tabpanel" testId="inbox-detail-details">
          <dl className="iax-kv">
            <div>
              <dt>REQUEST</dt>
              <dd>{item.title}</dd>
            </div>
            <div>
              <dt>SOURCE</dt>
              <dd>{item.source}</dd>
            </div>
            <div>
              <dt>AREA</dt>
              <dd>{item.nodeId ? item.nodeId.toUpperCase() : item.subtitle}</dd>
            </div>
            <div>
              <dt>STATE</dt>
              <dd>{item.state}</dd>
            </div>
            <div>
              <dt>WHY</dt>
              <dd>{item.why}</dd>
            </div>
          </dl>
        </IaPanel>
        <IaPanel title="DEPENDENCIES" count={depends.length + unlocks.length} className="iax-tabpanel" testId="inbox-detail-dependencies">
          {depends.length + unlocks.length ?
            <ul className="iax-deps">
              {depends.map((n) => (
                <li key={`d-${n.id}`}>
                  <small>DEPENDS ON</small>
                  <b>{n.label}</b>
                  <IaChip tone={tone(n.status)}>{n.status.replace(/_/g, ' ')}</IaChip>
                </li>
              ))}
              {unlocks.map((n) => (
                <li key={`u-${n.id}`}>
                  <small>UNLOCKS</small>
                  <b>{n.label}</b>
                  <IaChip tone={tone(n.status)}>{n.status.replace(/_/g, ' ')}</IaChip>
                </li>
              ))}
            </ul>
          : <IaEmpty title="NO LINKED DEPENDENCIES" />}
        </IaPanel>
        <IaPanel title="STATUS HISTORY" className="iax-tabpanel" testId="inbox-detail-history">
          {history.length ?
            <ol className="iax-history">
              {history.map((h) => (
                <li key={h.label}>
                  <i aria-hidden />
                  <b>{h.status.replace(/_/g, ' ')}</b>
                  <small>{h.detail}</small>
                </li>
              ))}
            </ol>
          : <IaEmpty title="NO HISTORY RECORDED" />}
          <p className="iax-hint">Reviewers, versions and comment threads are not connected to Production yet.</p>
        </IaPanel>
      </div>
    </div>
  );
}
