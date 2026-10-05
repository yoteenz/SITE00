/**
 * Deterministic Production Graph derivation. Pure: (canonical facts) → (node statuses, gate, operation).
 * The same input always yields the same graph; UI never stores or overrides these statuses.
 */

import {
  HUB_NODE_ORDER,
  type HubFounderGate,
  type HubGraph,
  type HubGraphInput,
  type HubNode,
  type HubNodeAction,
  type HubNodeId,
  type HubNodeStatus,
  type HubOperation,
} from './types.js';

export const HUB_NODE_LABEL: Record<HubNodeId, string> = {
  narrative: 'NARRATIVE',
  cast: 'CAST',
  look: 'LOOK',
  performance: 'PERFORMANCE',
  set: 'SET',
  storyboard: 'STORYBOARD',
  keyframes: 'KEYFRAMES',
};

/** Real production dependencies. Storyboard assembles every upstream department; Keyframes need Storyboard. */
export const HUB_NODE_DEPENDS_ON: Record<HubNodeId, readonly HubNodeId[]> = {
  narrative: [],
  cast: ['narrative'],
  look: ['cast'],
  performance: ['cast'],
  set: ['narrative'],
  storyboard: ['narrative', 'cast', 'look', 'performance', 'set'],
  keyframes: ['storyboard'],
};

const q = (a: string, l: string, k: HubNodeAction['kind'], t: string): HubNodeAction => ({ id: a, label: l, kind: k, target: t });

/** Contextual quick actions per node TYPE (02) — never one universal interface. */
export const HUB_NODE_QUICK_ACTIONS: Record<HubNodeId, readonly HubNodeAction[]> = {
  narrative: [
    q('story', 'STORY', 'INSPECT_TAB', 'story'),
    q('beats', 'BEATS', 'INSPECT_TAB', 'beats'),
    q('proof', 'PROOF', 'INSPECT_TAB', 'proof'),
    q('open', 'OPEN NARRATIVE', 'DEEP_LINK', 'narrative'),
  ],
  cast: [
    q('profile', 'PROFILE', 'INSPECT_TAB', 'profile'),
    q('looks', 'LOOKS', 'INSPECT_TAB', 'looks'),
    q('continuity', 'CONTINUITY', 'INSPECT_TAB', 'continuity'),
    q('performance', 'PERFORMANCE', 'INSPECT_TAB', 'performance'),
    q('open', 'OPEN CASTING', 'DEEP_LINK', 'casting'),
  ],
  look: [
    q('looks', 'LOOKS', 'INSPECT_TAB', 'looks'),
    q('hair', 'HAIR', 'INSPECT_TAB', 'hair'),
    q('makeup', 'MAKEUP', 'INSPECT_TAB', 'makeup'),
    q('open', 'OPEN WARDROBE', 'DEEP_LINK', 'wardrobe'),
  ],
  performance: [
    q('behavior', 'BEHAVIOR', 'INSPECT_TAB', 'behavior'),
    q('movement', 'MOVEMENT', 'INSPECT_TAB', 'movement'),
    q('voice', 'VOICE', 'INSPECT_TAB', 'voice'),
    q('open', 'OPEN PERFORMANCE', 'DEEP_LINK', 'performance'),
  ],
  set: [
    q('zones', 'ZONES', 'INSPECT_TAB', 'zones'),
    q('props', 'PROPS', 'INSPECT_TAB', 'props'),
    q('cameras', 'CAMERAS', 'INSPECT_TAB', 'cameras'),
    q('graphics', 'GRAPHICS', 'INSPECT_TAB', 'graphics'),
    q('open', 'OPEN SET', 'DEEP_LINK', 'sets'),
  ],
  storyboard: [
    q('frames', 'FRAMES', 'INSPECT_TAB', 'frames'),
    q('sequence', 'SEQUENCE', 'INSPECT_TAB', 'sequence'),
    q('authorities', 'AUTHORITIES', 'INSPECT_TAB', 'authorities'),
    q('compare', 'COMPARE', 'INSPECT_TAB', 'compare'),
    q('review', 'REVIEW', 'INSPECT_TAB', 'review'),
  ],
  keyframes: [
    q('status', 'STATUS', 'INSPECT_TAB', 'status'),
    q('open', 'OPEN STORYBOARD', 'DEEP_LINK', 'storyboard'),
  ],
};

export function hubNodeAssetSlotId(projectId: string, productionId: string | null, nodeId: HubNodeId): string {
  return `production.${projectId}.${productionId ?? 'none'}.node.${nodeId}.primary`;
}

/* ── Raw (own-facts) status per node ──────────────────────────────────── */

type Raw = { status: HubNodeStatus; detail: string };

function rawNarrative(i: HubGraphInput): Raw {
  switch (i.narrativeStatus) {
    case 'APPROVED':
      return { status: 'COMPLETE', detail: 'Narrative approved' };
    case 'NEEDS_REVISION':
      return { status: 'REVIEW_REQUIRED', detail: 'Narrative needs revision' };
    case 'FOUNDER_REVIEW':
      return { status: 'REVIEW_REQUIRED', detail: 'Narrative awaiting founder approval' };
    case 'GENERATED':
    case 'DRAFT':
      return { status: 'ACTIVE', detail: 'Narrative generated — in review' };
    case null:
    case undefined:
      return { status: 'NOT_STARTED', detail: 'No narrative plan' };
    default:
      return { status: 'ACTIVE', detail: `Narrative ${String(i.narrativeStatus).replace(/_/g, ' ').toLowerCase()}` };
  }
}

function rawCast(i: HubGraphInput): Raw {
  if (!i.cast) return { status: 'NOT_STARTED', detail: 'No casting state' };
  if (i.cast.allRequiredLocked) return { status: 'COMPLETE', detail: `${i.cast.lockedCount} of ${i.cast.requiredCount} required roles locked` };
  return {
    status: 'REVIEW_REQUIRED',
    detail: `${i.cast.requiredCount - i.cast.lockedCount} required role${i.cast.requiredCount - i.cast.lockedCount === 1 ? '' : 's'} not locked`,
  };
}

function rawLook(i: HubGraphInput): Raw {
  if (i.looksLocked === null) return { status: 'NOT_STARTED', detail: 'No look state' };
  if (i.looksLocked) return { status: 'COMPLETE', detail: `${i.lookCount} look${i.lookCount === 1 ? '' : 's'} locked` };
  return { status: 'ACTIVE', detail: 'Looks in progress' };
}

function rawPerformance(i: HubGraphInput): Raw {
  if (i.performanceDefined === null) return { status: 'NOT_STARTED', detail: 'No performance state' };
  if (i.performanceDefined) return { status: 'COMPLETE', detail: 'Performance direction set for all cast' };
  return { status: 'ACTIVE', detail: 'Performance direction incomplete' };
}

function rawSet(i: HubGraphInput): Raw {
  return i.setDefined
    ? { status: 'COMPLETE', detail: 'Set defined' }
    : { status: 'NOT_STARTED', detail: 'No environment or set assigned' };
}

function rawStoryboard(i: HubGraphInput): Raw {
  if (!i.pipelineAvailable) return { status: 'NOT_STARTED', detail: 'Pipeline state unavailable' };
  const sb = i.storyboard;
  if (!sb || !sb.status) return { status: 'NOT_STARTED', detail: 'Storyboard not generated' };
  if (sb.approved) return { status: 'COMPLETE', detail: 'Storyboard authority approved' };
  const s = sb.status;
  if (s === 'AWAITING_FOUNDER_APPROVAL' || s === 'STORYBOARD_REQUIRES_FOUNDER_DECISION')
    return { status: 'REVIEW_REQUIRED', detail: 'Founder approval required' };
  if (s === 'REVISION_REQUIRED') return { status: 'REVIEW_REQUIRED', detail: 'Revision requested' };
  if (s.startsWith('FAILED') || s === 'GENERATION_FAILED') return { status: 'BLOCKED', detail: s.replace(/_/g, ' ').toLowerCase() };
  if (s === 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL')
    return { status: 'BLOCKED', detail: 'Pre-storyboard authorities not approved' };
  if (s === 'READY_FOR_GENERATION') return { status: 'NOT_STARTED', detail: 'Ready for generation' };
  return { status: 'ACTIVE', detail: s.replace(/_/g, ' ').toLowerCase() };
}

function rawKeyframes(i: HubGraphInput): Raw {
  if (i.keyframesApproved) return { status: 'COMPLETE', detail: 'Keyframes approved' };
  const e = i.keyframeEligibility;
  if (!e || e === 'BLOCKED') return { status: 'NOT_STARTED', detail: 'Keyframes not started' };
  return { status: 'ACTIVE', detail: e.replace(/_/g, ' ').toLowerCase() };
}

const RAW: Record<HubNodeId, (i: HubGraphInput) => Raw> = {
  narrative: rawNarrative,
  cast: rawCast,
  look: rawLook,
  performance: rawPerformance,
  set: rawSet,
  storyboard: rawStoryboard,
  keyframes: rawKeyframes,
};

const isDone = (s: HubNodeStatus) => s === 'COMPLETE';

/**
 * Status semantics (deterministic, evaluated in chain order so upstream is always final first):
 * - No production → every node NOT_STARTED.
 * - own COMPLETE but an upstream dependency is not COMPLETE → REVIEW_REQUIRED (upstream changed; stale).
 * - own NOT_STARTED with an incomplete dependency → LOCKED.
 * - own ACTIVE/BLOCKED with an incomplete dependency stays as-is (work has begun).
 */
export function deriveHubGraph(input: HubGraphInput, ctx: { projectId: string; productionId: string | null }): HubGraph {
  const resolved = new Map<HubNodeId, { status: HubNodeStatus; detail: string }>();

  for (const id of HUB_NODE_ORDER) {
    if (!input.hasProduction) {
      resolved.set(id, { status: 'NOT_STARTED', detail: 'No production selected' });
      continue;
    }
    const raw = RAW[id](input);
    const deps = HUB_NODE_DEPENDS_ON[id];
    const unmet = deps.filter((d) => !isDone(resolved.get(d)!.status));
    let { status, detail } = raw;
    if (status === 'COMPLETE' && unmet.length) {
      status = 'REVIEW_REQUIRED';
      detail = `Upstream ${unmet.map((u) => HUB_NODE_LABEL[u].toLowerCase()).join(', ')} not complete`;
    } else if (status === 'NOT_STARTED' && unmet.length) {
      status = 'LOCKED';
      detail = `Waiting on ${unmet.map((u) => HUB_NODE_LABEL[u].toLowerCase()).join(', ')}`;
    }
    resolved.set(id, { status, detail });
  }

  const nodes: HubNode[] = HUB_NODE_ORDER.map((id, idx) => ({
    id,
    order: idx + 1,
    label: HUB_NODE_LABEL[id],
    status: resolved.get(id)!.status,
    statusDetail: resolved.get(id)!.detail,
    dependsOn: HUB_NODE_DEPENDS_ON[id],
    unlocks: HUB_NODE_ORDER.filter((o) => HUB_NODE_DEPENDS_ON[o].includes(id)),
    quickActions: HUB_NODE_QUICK_ACTIONS[id],
    assetSlotId: hubNodeAssetSlotId(ctx.projectId, ctx.productionId, id),
  }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<HubNodeId, HubNode>;

  // The founder-gated node (if any) IS the active operation: the Hub orchestrates what needs a decision.
  // Otherwise the first node in motion (needs work or review) is the active operation.
  const gateNodeId = pickGateNode(byId);
  const inMotion = nodes.find((n) => n.status === 'REVIEW_REQUIRED' || n.status === 'BLOCKED' || n.status === 'ACTIVE') ?? null;
  const activeNodeId: HubNodeId | null = gateNodeId ?? inMotion?.id ?? null;

  const blockers = nodes
    .filter((n) => n.status === 'BLOCKED' || n.status === 'REVIEW_REQUIRED' || (n.status === 'LOCKED' && n.id !== 'keyframes'))
    .map((n) => `${n.label}: ${n.statusDetail}`);

  const nextStage: HubNodeId | null = activeNodeId
    ? (HUB_NODE_ORDER.find((o) => HUB_NODE_DEPENDS_ON[o].includes(activeNodeId) && byId[o].status !== 'COMPLETE') ?? null)
    : null;

  const founderGate = deriveFounderGate(byId, gateNodeId, nextStage);
  const operation = deriveOperation(byId, activeNodeId);

  const completeCount = nodes.filter((n) => n.status === 'COMPLETE').length;
  return {
    nodes,
    byId,
    activeNodeId,
    operation,
    founderGate,
    blockers,
    nextStage,
    completeCount,
    progressPercent: Math.round((completeCount / nodes.length) * 100),
  };
}

function pickGateNode(byId: Record<HubNodeId, HubNode>): HubNodeId | null {
  if (byId.storyboard.status === 'REVIEW_REQUIRED') return 'storyboard';
  if (byId.narrative.status === 'REVIEW_REQUIRED') return 'narrative';
  if (byId.cast.status === 'REVIEW_REQUIRED') return 'cast';
  return null;
}

function deriveFounderGate(byId: Record<HubNodeId, HubNode>, gateNodeId: HubNodeId | null, nextStage: HubNodeId | null): HubFounderGate {
  const none: HubFounderGate = { open: false, nodeId: null, headline: '', detail: '', actionLabel: '', decidableInHub: false };
  if (!gateNodeId) return none;
  const n = byId[gateNodeId];
  const unlock = nextStage ? HUB_NODE_LABEL[nextStage].toLowerCase() : 'the next stage';
  if (gateNodeId === 'storyboard')
    return { open: true, nodeId: 'storyboard', headline: 'FOUNDER APPROVAL REQUIRED', detail: `Review storyboard to unlock ${unlock}.`, actionLabel: 'REVIEW', decidableInHub: true };
  if (gateNodeId === 'narrative')
    return { open: true, nodeId: 'narrative', headline: 'FOUNDER APPROVAL REQUIRED', detail: `${n.statusDetail}. Approving unlocks ${unlock}.`, actionLabel: 'REVIEW', decidableInHub: false };
  return { open: true, nodeId: 'cast', headline: 'CASTING DECISION REQUIRED', detail: `${n.statusDetail}.`, actionLabel: 'CHOOSE', decidableInHub: false };
}

function deriveOperation(byId: Record<HubNodeId, HubNode>, activeNodeId: HubNodeId | null): HubOperation {
  if (!activeNodeId) {
    const allDone = HUB_NODE_ORDER.every((id) => byId[id].status === 'COMPLETE');
    return allDone
      ? { nodeId: null, label: 'PRODUCTION CHAIN COMPLETE', detail: 'All stages approved.' }
      : { nodeId: null, label: 'NO ACTIVE OPERATION', detail: 'Nothing is in progress.' };
  }
  const n = byId[activeNodeId];
  const verb =
    n.status === 'REVIEW_REQUIRED' ? 'REVIEW'
    : n.status === 'BLOCKED' ? 'BLOCKED'
    : 'ASSEMBLY';
  return { nodeId: activeNodeId, label: `${n.label} ${verb}`, detail: n.statusDetail + '.' };
}

/** FLOW / DEPENDENCIES legend semantics for a status. */
export const HUB_STATUS_LABEL: Record<HubNodeStatus, string> = {
  COMPLETE: 'COMPLETE',
  ACTIVE: 'IN PROGRESS',
  REVIEW_REQUIRED: 'REVIEW REQUIRED',
  BLOCKED: 'BLOCKED',
  LOCKED: 'LOCKED',
  NOT_STARTED: 'NOT STARTED',
};
