/**
 * Hub panels beneath the chamber: OperationPanel, FounderGate, AuthorityPanel, NodeInspector,
 * ComparisonWorkspace, attention (ON YOUR TABLE) and activity (RECENT ACTIVITY).
 */

import { HUB_STATUS_LABEL } from '../../../../shared/site00-production-hub/graph.js';
import { activityFilterMatches } from '../../../../shared/site00-production-hub/model.js';
import type {
  HubActivityItem,
  HubAttentionItem,
  HubFounderGate,
  HubGraph,
  HubNode,
  HubOperation,
  HubScene,
  HubStoryboardFrame,
  HubUiState,
} from '../../../../shared/site00-production-hub/types.js';
import { HUB_MEDIA, HubImage } from './HubImage';
import type { InspectorView } from './inspectorContent';
import { IcArrowR, IcChevD, IcChevR, IcClose, IcCompare, IcCube, IcExpand, IcLock, IcMenu, IcPlus, IcSwap, IcWarn } from './icons';

const pad = (n: number) => String(n).padStart(2, '0');

/* ── OperationPanel + FounderGate ─────────────────────────────────────── */

export function OperationPanel({
  scene,
  sceneCount,
  graph,
  onOpenScenes,
  onOpenOperation,
  onGate,
  onMore,
  nextStageLabel,
  formatLabel,
  pipelineOffline,
}: {
  scene: HubScene | null;
  sceneCount: number;
  graph: HubGraph;
  onOpenScenes: () => void;
  onOpenOperation: () => void;
  onGate: () => void;
  onMore: () => void;
  nextStageLabel: string;
  formatLabel: string;
  pipelineOffline: boolean;
}) {
  const gate: HubFounderGate = graph.founderGate;
  const op: HubOperation = graph.operation;
  return (
    <section className="ph-op" aria-label="Current operation" data-testid="hub-operation">
      <div className="ph-op__top">
        <button type="button" className="ph-op__scene" onClick={onOpenScenes} data-testid="hub-open-scenes" aria-label="Choose scene">
          <small>{scene ? `SCENE ${pad(scene.order)}` : 'NO SCENE'}</small>
          <b>{scene?.label ?? 'NO PRODUCTION'}</b>
          <span className="ph-bar" role="progressbar" aria-label="Production chain progress" aria-valuenow={graph.progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${graph.progressPercent}%` }} />
            <em title={`${graph.completeCount} / ${graph.nodes.length} stages`}>{graph.progressPercent}%</em>
          </span>
        </button>
        <button type="button" className="ph-op__operation" onClick={onOpenOperation} disabled={!op.nodeId} data-testid="hub-current-operation">
          <span className="ph-op__ring" aria-hidden />
          <span>
            <small>CURRENT OPERATION</small>
            <b>{op.label}</b>
            <span>{op.detail}</span>
          </span>
          <IcChevR width={16} height={16} />
        </button>
      </div>

      {gate.open ? (
        <div className="ph-gate" role="alert" data-testid="hub-founder-gate">
          <IcWarn width={26} height={26} />
          <span>
            <b>{gate.headline}</b>
            <small>{gate.detail}</small>
          </span>
          <button type="button" className="ph-btn ph-btn--ink" onClick={onGate} data-testid="hub-gate-review">
            {gate.actionLabel} <IcArrowR width={14} height={14} />
          </button>
        </div>
      ) : pipelineOffline ? (
        <div className="ph-gate ph-gate--quiet" data-testid="hub-pipeline-offline">
          <IcWarn width={20} height={20} />
          <span>
            <b>PIPELINE STATE UNAVAILABLE</b>
            <small>Storyboard and keyframe status could not be loaded. Nothing is assumed.</small>
          </span>
        </div>
      ) : null}

      <dl className="ph-meta" data-testid="hub-meta">
        <div>
          <dt>SCENE</dt>
          <dd>{scene ? `${pad(scene.order)} / ${pad(sceneCount)}` : '– / –'}</dd>
        </div>
        <div>
          <dt>DURATION</dt>
          <dd>{scene?.durationRange ?? '–'}</dd>
        </div>
        <div>
          <dt>FORMAT</dt>
          <dd>{formatLabel}</dd>
        </div>
        <div>
          <dt>{graph.nextStage ? <IcLock width={11} height={11} /> : null} NEXT STAGE</dt>
          <dd>{nextStageLabel}</dd>
        </div>
        <button type="button" className="ph-meta__more" onClick={onMore} aria-label="More" data-testid="hub-more">
          <IcMenu width={16} height={16} />
        </button>
      </dl>
    </section>
  );
}

/* ── AuthorityPanel (Storyboard Authority) ────────────────────────────── */

export function AuthorityPanel({
  expanded,
  scene,
  frame,
  frames,
  frameUrl,
  frameSlotId,
  status,
  version,
  gate,
  storyboardNode,
  canDecide,
  onStep,
  onFullscreen,
  onReview,
  onApprove,
  onRevise,
  onCompare,
  onOpenExpression,
}: {
  expanded: boolean;
  scene: HubScene | null;
  frame: HubStoryboardFrame | null;
  frames: readonly HubStoryboardFrame[];
  frameUrl: string | null;
  frameSlotId: string;
  status: string | null;
  version: string | null;
  gate: HubFounderGate;
  storyboardNode: HubNode;
  canDecide: boolean;
  onStep: (d: 1 | -1) => void;
  onFullscreen: () => void;
  onReview: () => void;
  onApprove: () => void;
  onRevise: () => void;
  onCompare: () => void;
  onOpenExpression: () => void;
}) {
  const disabledWhy = canDecide ? undefined : 'Available when the storyboard is awaiting a founder decision';
  return (
    <section className={`ph-auth${expanded ? ' is-expanded' : ''}`} aria-label="Storyboard authority" data-testid="hub-authority">
      <h2 className="ph-h2">STORYBOARD AUTHORITY</h2>
      <div className="ph-auth__body">
        <div className="ph-auth__view">
          <button type="button" className="ph-round ph-round--pale" onClick={() => onStep(-1)} disabled={!frames.length} aria-label="Previous frame" data-testid="authority-prev">
            <IcChevR style={{ transform: 'scaleX(-1)' }} width={16} height={16} />
          </button>
          <button type="button" className="ph-auth__frame" onClick={onFullscreen} aria-label="Open frame fullscreen" disabled={!frames.length}>
            <HubImage slotId={frameSlotId} url={frameUrl} label={frames.length ? 'STORYBOARD FRAME' : 'NO STORYBOARD YET'} className="ph-auth__img" {...HUB_MEDIA.frameCard} />
          </button>
          <button type="button" className="ph-round ph-round--pale" onClick={() => onStep(1)} disabled={!frames.length} aria-label="Next frame" data-testid="authority-next">
            <IcChevR width={16} height={16} />
          </button>
          <span className="ph-auth__idx">{frames.length && frame ? `${pad(frame.number)} / ${pad(frames.length)}` : '– / –'}</span>
        </div>
        <div className="ph-auth__side">
          <div className="ph-auth__cap">
            <small>{scene ? `SCENE ${pad(scene.order)}` : 'NO SCENE'}</small>
            <b>{scene?.label ?? '—'}</b>
            {scene ? <p>{scene.purpose}</p> : null}
          </div>
          <button type="button" className="ph-btn ph-btn--line" onClick={onFullscreen} disabled={!frames.length} data-testid="authority-fullscreen">
            OPEN FULLSCREEN <IcExpand width={14} height={14} />
          </button>
        </div>
      </div>

      {expanded ? (
        <dl className="ph-auth__facts" data-testid="authority-facts">
          <div><dt>STORYBOARD STATUS</dt><dd>{status ? status.replace(/_/g, ' ') : 'NOT GENERATED'}</dd></div>
          <div><dt>NODE STATUS</dt><dd>{HUB_STATUS_LABEL[storyboardNode.status]}</dd></div>
          <div><dt>VERSION</dt><dd>{version ?? 'NOT AVAILABLE'}</dd></div>
          <div><dt>FRAMES</dt><dd>{frames.length}</dd></div>
          <div><dt>SCENE DURATION</dt><dd>{scene?.durationRange ?? 'NOT AVAILABLE'}</dd></div>
          <div><dt>FORMAT</dt><dd>REEL (9:16)</dd></div>
        </dl>
      ) : null}

      <div className="ph-auth__actions" role="group" aria-label="Storyboard actions">
        <button type="button" className={`ph-act${expanded ? ' is-on' : ''}`} onClick={onReview} data-testid="authority-review">
          REVIEW <IcArrowR width={14} height={14} />
        </button>
        <button type="button" className="ph-act" onClick={onApprove} disabled={!canDecide} title={disabledWhy} data-testid="authority-approve">
          APPROVE <IcArrowR width={14} height={14} />
        </button>
        <button type="button" className="ph-act" onClick={onRevise} disabled={!canDecide} title={disabledWhy} data-testid="authority-revise">
          REQUEST REVISION <IcArrowR width={14} height={14} />
        </button>
        <button type="button" className="ph-act" onClick={onCompare} disabled={!frames.length} data-testid="authority-compare">
          COMPARE <IcCompare width={14} height={14} />
        </button>
        <button type="button" className="ph-act" onClick={onOpenExpression} data-testid="authority-open-expression">
          OPEN IN EXPRESSION <IcCube width={14} height={14} />
        </button>
      </div>
      {gate.open && gate.nodeId === 'storyboard' && expanded ? (
        <div className="ph-gate ph-gate--inline" role="note">
          <IcWarn width={20} height={20} />
          <span>
            <b>{gate.headline}</b>
            <small>{gate.detail}</small>
          </span>
        </div>
      ) : null}
    </section>
  );
}

/* ── NodeInspector ─────────────────────────────────────────────────────── */

export function NodeInspector({
  node,
  view,
  tab,
  imageUrl,
  slotLabel,
  deepLabel,
  onTab,
  onClose,
  onDeepLink,
}: {
  node: HubNode;
  view: InspectorView;
  tab: string;
  imageUrl: string | null;
  slotLabel: string;
  deepLabel: string | null;
  onTab: (t: string) => void;
  onClose: () => void;
  onDeepLink: () => void;
}) {
  const active = view.tabs.some((t) => t.id === tab) ? tab : (view.tabs[0]?.id ?? '');
  return (
    <section className="ph-insp" aria-label={`${node.label} inspector`} data-testid="hub-node-inspector">
      <header className="ph-insp__head">
        <span>
          <small>NODE INSPECTOR</small>
          <h2>{node.label}</h2>
        </span>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close inspector" data-testid="inspector-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      <div className="ph-insp__body">
        <div className="ph-insp__left">
          <HubImage slotId={node.assetSlotId} url={imageUrl} label={slotLabel} className="ph-insp__img" {...HUB_MEDIA.nodeCard} />
          <div className="ph-insp__subject">
            <small>{view.subject.eyebrow}</small>
            <b>{view.subject.title}</b>
            {view.subject.chip ? <em>{view.subject.chip}</em> : null}
          </div>
          <dl className="ph-kv">
            {view.meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="ph-insp__right">
          {view.tabs.length ? (
            <div className="ph-tabs" role="tablist">
              {view.tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={active === t.id} className={active === t.id ? 'is-active' : ''} onClick={() => onTab(t.id)} data-testid={`inspector-tab-${t.id}`}>
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
          <dl className="ph-kv ph-kv--wide" data-testid="inspector-rows">
            {view.rows.map((r, i) => (
              <div key={`${r.k}-${i}`}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {deepLabel ? (
        <button type="button" className="ph-btn ph-btn--ink ph-btn--full" onClick={onDeepLink} data-testid="inspector-open">
          {deepLabel} <IcArrowR width={14} height={14} />
        </button>
      ) : null}
    </section>
  );
}

/* ── ComparisonWorkspace ──────────────────────────────────────────────── */

export type CompareTarget = { id: string; label: string; slotId: string; url: string | null; source: string; status: string };

export function ComparisonWorkspace({
  scene,
  left,
  targets,
  targetId,
  swapped,
  onTarget,
  onSwap,
  onClose,
  onRevise,
  onOpenExpression,
  canRevise,
}: {
  scene: HubScene | null;
  left: { slotId: string; url: string | null; frameLabel: string; status: string };
  targets: readonly CompareTarget[];
  targetId: string;
  swapped: boolean;
  onTarget: (id: string) => void;
  onSwap: () => void;
  onClose: () => void;
  onRevise: () => void;
  onOpenExpression: () => void;
  canRevise: boolean;
}) {
  const right = targets.find((t) => t.id === targetId) ?? targets[0]!;
  const A = { title: 'STORYBOARD FRAME', slotId: left.slotId, url: left.url, tag: left.frameLabel, rows: [['SOURCE', 'STORYBOARD'], ['SCENE', scene ? pad(scene.order) : '–'], ['STATUS', left.status]] as [string, string][] };
  const B = { title: right.label, slotId: right.slotId, url: right.url, tag: '', rows: [['SOURCE', right.source], ['SCENE', scene ? pad(scene.order) : '–'], ['STATUS', right.status]] as [string, string][] };
  const [L, R] = swapped ? [B, A] : [A, B];
  const card = (c: typeof A, k: string) => (
    <article className="ph-cmp__card" key={k}>
      <header>
        <b>{c.title}</b>
        {c.tag ? <em>{c.tag}</em> : null}
      </header>
      <HubImage slotId={c.slotId} url={c.url} label={c.title} className="ph-cmp__img" {...(c === A ? HUB_MEDIA.frameCard : HUB_MEDIA.nodeCard)} />
      <dl>
        {c.rows.map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
  return (
    <section className="ph-cmp" aria-label="Compare authorities" data-testid="hub-compare">
      <header className="ph-cmp__head">
        <span>
          <small>CURRENT OPERATION</small>
          <h2>COMPARE AUTHORITIES</h2>
          <p>Inspect visual continuity between real production authorities.</p>
        </span>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close compare" data-testid="compare-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      <label className="ph-cmp__pick">
        <span>COMPARE WITH</span>
        <select value={targetId} onChange={(e) => onTarget(e.target.value)} data-testid="compare-target">
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div className="ph-cmp__pair">
        {card(L, 'l')}
        <button type="button" className="ph-round ph-cmp__swap" onClick={onSwap} aria-label="Swap sides" data-testid="compare-swap">
          <IcSwap width={16} height={16} />
        </button>
        {card(R, 'r')}
      </div>
      <div className="ph-cmp__tools" aria-label="Difference overlay">
        <span>VISUAL DIFFERENCE OVERLAY</span>
        <div role="group">
          <button type="button" className="is-on">OFF</button>
          <button type="button" disabled title="No comparison algorithm is connected">DIFFERENCES</button>
          <button type="button" disabled title="No comparison algorithm is connected">CONTINUITY</button>
        </div>
      </div>
      <div className="ph-cmp__find" data-testid="compare-findings">
        <div>
          <b>KEY FINDINGS</b>
          <p>No analysis available. Findings appear here once a comparison capability is connected.</p>
        </div>
        <div className="ph-cmp__score">
          <b>CONTINUITY SCORE</b>
          <strong>UNAVAILABLE</strong>
          <small>No canonical comparison algorithm exists yet.</small>
        </div>
      </div>
      <div className="ph-cmp__actions">
        <button type="button" className="ph-btn ph-btn--line" onClick={onRevise} disabled={!canRevise} title={canRevise ? undefined : 'Available when the storyboard is awaiting a founder decision'} data-testid="compare-revise">
          REQUEST REVISION <IcArrowR width={14} height={14} />
        </button>
        <button type="button" className="ph-btn ph-btn--line" onClick={onOpenExpression} data-testid="compare-open-expression">
          OPEN IN EXPRESSION <IcArrowR width={14} height={14} />
        </button>
      </div>
    </section>
  );
}

/* ── ON YOUR TABLE ─────────────────────────────────────────────────────── */

export function AttentionTable({
  items,
  expanded,
  expandedId,
  urlFor,
  onToggleExpanded,
  onExpandItem,
  onAct,
}: {
  items: readonly HubAttentionItem[];
  expanded: boolean;
  expandedId: string | null;
  urlFor: (slotId: string | null) => string | null;
  onToggleExpanded: () => void;
  onExpandItem: (id: string) => void;
  onAct: (i: HubAttentionItem) => void;
}) {
  const lead = items.find((i) => i.id === expandedId) ?? items[0] ?? null;
  return (
    <section className={`ph-table${expanded ? ' is-expanded' : ''}`} aria-label="On your table" data-testid="hub-table">
      <header className="ph-sec">
        <span>
          <h2 className="ph-h2">ON YOUR TABLE</h2>
          <small>ITEMS THAT NEED YOUR ATTENTION</small>
        </span>
        <button type="button" className="ph-link" onClick={onToggleExpanded} aria-expanded={expanded} data-testid="table-view-all">
          {expanded ? 'COLLAPSE' : 'VIEW ALL'} {expanded ? <IcChevD width={14} height={14} style={{ transform: 'rotate(180deg)' }} /> : <IcArrowR width={14} height={14} />}
        </button>
      </header>
      {items.length === 0 ? (
        <div className="ph-empty" data-testid="table-empty">
          <b>NOTHING NEEDS YOU</b>
          <span>No approvals, decisions or requests are waiting.</span>
        </div>
      ) : expanded && lead ? (
        <div className="ph-table__open">
          <article className="ph-table__lead" data-testid="table-lead">
            <HubImage slotId={lead.assetSlotId} url={urlFor(lead.assetSlotId)} label={lead.title} className="ph-table__leadimg" {...HUB_MEDIA.nodeCard} />
            <div className="ph-table__leadbody">
              <b>{lead.title}</b>
              <small>{lead.subtitle}</small>
              <em className={lead.priority === 'HIGH' ? 'is-high' : ''}>
                {lead.priority === 'HIGH' ? 'HIGH PRIORITY / ' : ''}
                {lead.stateLabel}
              </em>
              <h3>WHY YOUR ATTENTION IS NEEDED</h3>
              <p>{lead.why}</p>
            </div>
            <div className="ph-table__acts">
              <small>ACTIONS</small>
              <button type="button" className="ph-btn ph-btn--ink" onClick={() => onAct(lead)} data-testid="table-lead-act">
                {lead.actionLabel} <IcArrowR width={14} height={14} />
              </button>
            </div>
          </article>
          <ul className="ph-table__rows">
            {items.filter((i) => i.id !== lead.id).map((i) => (
              <li key={i.id}>
                <button type="button" className="ph-table__row" onClick={() => onExpandItem(i.id)}>
                  <HubImage slotId={i.assetSlotId} url={urlFor(i.assetSlotId)} label="" className="ph-table__rowimg" {...HUB_MEDIA.nodeChip} />
                  <span>
                    <b>{i.title}</b>
                    <small>{i.subtitle}</small>
                  </span>
                  <em>{i.actionLabel}</em>
                  <IcArrowR width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="ph-cards" data-testid="table-cards">
          {items.map((i) => (
            <li key={i.id} className="ph-card">
              <button type="button" className="ph-card__thumb" onClick={() => onExpandItem(i.id)} aria-label={`Expand ${i.title}`}>
                <HubImage slotId={i.assetSlotId} url={urlFor(i.assetSlotId)} label="" className="ph-card__img" {...HUB_MEDIA.nodeChip} />
                <i className={i.priority === 'HIGH' ? 'is-high' : ''} aria-hidden />
              </button>
              <b>{i.title}</b>
              <small>{i.subtitle}</small>
              <button type="button" className="ph-btn ph-btn--outline" onClick={() => onAct(i)} data-testid={`table-act-${i.id}`}>
                {i.actionLabel} <IcArrowR width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── RECENT ACTIVITY ───────────────────────────────────────────────────── */

const agoLabel = (iso: string): string => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'JUST NOW';
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}H AGO` : `${Math.round(h / 24)}D AGO`;
};

export function ActivityStrip({
  items,
  expanded,
  filter,
  urlFor,
  onToggle,
  onFilter,
}: {
  items: readonly HubActivityItem[];
  expanded: boolean;
  filter: HubUiState['activityFilter'];
  urlFor: (slotId: string | null) => string | null;
  onToggle: () => void;
  onFilter: (f: HubUiState['activityFilter']) => void;
}) {
  const shown = items.filter((i) => activityFilterMatches(filter, i.category));
  return (
    <section className={`ph-act-sec${expanded ? ' is-expanded' : ''}`} aria-label="Recent activity" data-testid="hub-activity">
      <header className="ph-sec">
        <span>
          <h2 className="ph-h2">RECENT ACTIVITY</h2>
          <small>LATEST UPDATES ACROSS PRODUCTION</small>
        </span>
        {expanded ? (
          <div className="ph-tabs ph-tabs--inline" role="tablist">
            {(['ALL', 'APPROVALS', 'RENDERS', 'ASSETS'] as const).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'is-active' : ''} onClick={() => onFilter(f)} data-testid={`activity-filter-${f.toLowerCase()}`}>
                {f}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="ph-link" onClick={onToggle} aria-expanded={expanded} data-testid="activity-view-all">
          {expanded ? 'COLLAPSE' : 'VIEW ALL'} <IcArrowR width={14} height={14} />
        </button>
      </header>
      {shown.length === 0 ? (
        <div className="ph-empty" data-testid="activity-empty">
          <b>NO ACTIVITY RECORDED YET</b>
          <span>Approvals, revisions and requests appear here as they happen.</span>
        </div>
      ) : expanded ? (
        <ul className="ph-actlist" data-testid="activity-list">
          {shown.map((i) => (
            <li key={i.id}>
              <HubImage slotId={i.assetSlotId} url={urlFor(i.assetSlotId)} label="" className="ph-actlist__img" {...HUB_MEDIA.nodeChip} />
              <span>
                <b>{i.title}</b>
                <small>{i.detail}</small>
              </span>
              <em>{i.category}</em>
              <time>{agoLabel(i.at)}</time>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="ph-actrow" data-testid="activity-row">
          {shown.slice(0, 5).map((i) => (
            <li key={i.id}>
              <HubImage slotId={i.assetSlotId} url={urlFor(i.assetSlotId)} label="" className="ph-actrow__img" {...HUB_MEDIA.nodeChip} />
              <span>
                <b>{i.title}</b>
                <small>{agoLabel(i.at)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { IcPlus };
