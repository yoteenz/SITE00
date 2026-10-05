/**
 * Canonical-data → Hub model adapters. Pure. Every visible name/status/count comes through here.
 */

import type { NarrativeMomentumPlan } from '../site00-expression-engine/narrative-momentum/types.js';
import { buildEntry002FinalCinematicStoryboardPanelPublicPath } from '../site00-expression-engine/finalCinematicStoryboardIds.js';
import type { ProductionCastState } from '../site00-studio-world/acting-catalogue/types.js';
import { evaluateCastGate } from '../site00-studio-world/acting-catalogue/castGate.js';
import { productionWorkspacePath } from '../site00-production-workspace/routes.js';
import { HUB_NODE_LABEL } from './graph.js';
import { hubFrameAssetSlotId, hubSceneAssetSlotId, HUB_ENTRY002, HUB_STORYBOARD_FRAME_TARGET } from './assets.js';
import type {
  HubActivityCategory,
  HubActivityItem,
  HubAttentionItem,
  HubGraph,
  HubGraphInput,
  HubNodeId,
  HubScene,
  HubStoryboardFrame,
} from './types.js';

/** Canonical scenes of Entry 002 = the reel beat sequence of the Narrative Momentum reel adaptation. */
export function buildHubScenes(plan: NarrativeMomentumPlan): HubScene[] {
  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL')?.reelDetail?.beatSequence ?? [];
  return plan.beats.map((b) => {
    const shot = reel.find((r) => r.sourceNarrativeBeatId === b.beatId);
    return {
      sceneId: b.beatId,
      order: b.order,
      label: b.label,
      purpose: b.whatChangesInThisBeat,
      durationRange: shot?.estimatedDurationRange ?? null,
      tensionStage: b.tensionStage,
    };
  });
}

/**
 * Frames come from the storyboard pipeline. `count` is the canonical panelCount (0 when no storyboard
 * exists → no frames, the Hub shows empty frame slots, never fabricated ones).
 */
export function buildHubFrames(args: { storyboardId: string | null; version: string | null; count: number }): HubStoryboardFrame[] {
  return Array.from({ length: Math.max(0, args.count) }, (_, i) => ({
    frameId: `frame-${String(i + 1).padStart(2, '0')}`,
    number: i + 1,
    canonicalUrl:
      args.storyboardId ? buildEntry002FinalCinematicStoryboardPanelPublicPath(args.storyboardId, i + 1, args.version ?? '001') : null,
  }));
}

export function frameSlotId(frame: HubStoryboardFrame): string {
  return hubFrameAssetSlotId(HUB_ENTRY002.projectId, HUB_ENTRY002.productionId, frame.number);
}

export function buildCastSummary(cast: ProductionCastState) {
  const gate = evaluateCastGate(cast);
  const required = cast.characters.filter((c) => c.screenImportance !== 'ENSEMBLE');
  const locked = required.filter((c) => c.status === 'LOCKED');
  return {
    gate,
    summary: {
      allRequiredLocked: gate.allRequiredCharactersLocked,
      requiredCount: required.length,
      lockedCount: locked.length,
      missingAuthorities: gate.missingCharacterAuthorities,
    },
    looksLocked: required.length > 0 && required.every((c) => c.campaignLookId && c.status === 'LOCKED'),
    lookCount: cast.looks.length,
    performanceDefined: required.length > 0 && required.every((c) => c.performanceDirection.trim().length > 0),
  };
}

export type PipelineFacts = {
  available: boolean;
  storyboardStatus: string | null;
  storyboardApproved: boolean;
  panelCount: number;
  keyframeEligibility: string | null;
  keyframesApproved: boolean;
};

export function buildHubGraphInput(args: {
  hasProduction: boolean;
  narrativeStatus: string | null;
  cast: ProductionCastState | null;
  pipeline: PipelineFacts;
}): HubGraphInput {
  const c = args.cast ? buildCastSummary(args.cast) : null;
  return {
    hasProduction: args.hasProduction,
    pipelineAvailable: args.pipeline.available,
    narrativeStatus: args.narrativeStatus,
    cast: c?.summary ?? null,
    looksLocked: c ? c.looksLocked : null,
    lookCount: c?.lookCount ?? 0,
    performanceDefined: c ? c.performanceDefined : null,
    setDefined: false, // No set/environment authority exists in canonical state yet.
    storyboard: args.pipeline.available
      ? { status: args.pipeline.storyboardStatus, approved: args.pipeline.storyboardApproved, panelCount: args.pipeline.panelCount }
      : null,
    keyframeEligibility: args.pipeline.available ? args.pipeline.keyframeEligibility : null,
    keyframesApproved: args.pipeline.keyframesApproved,
  };
}

/* ── Deep links (context preserved via ?from=hub&scene=&frame=&node=) ─────────────── */

export type HubDeepTarget =
  | 'casting'
  | 'wardrobe'
  | 'performance'
  | 'sets'
  | 'narrative'
  | 'storyboard'
  | 'review'
  | 'design'
  | 'experience'
  | 'queue'
  | 'libraries';

export function hubDeepLink(args: {
  projectId: string;
  target: HubDeepTarget;
  sceneId?: string | null;
  frameId?: string | null;
  nodeId?: HubNodeId | null;
}): string {
  const p = new URLSearchParams({ from: 'hub', entry: '002' });
  if (args.sceneId) p.set('scene', args.sceneId);
  if (args.frameId) p.set('frame', args.frameId);
  if (args.nodeId) p.set('node', args.nodeId);
  const pid = args.projectId;
  switch (args.target) {
    case 'design':
      return `${productionWorkspacePath(pid, 'DESIGN')}?${p}`;
    case 'experience':
      return `${productionWorkspacePath(pid, 'EXPERIENCE', 'world')}?${p}`;
    case 'queue':
      return '/production/queue';
    case 'libraries':
      return '/production/libraries';
    default:
      return `${productionWorkspacePath(pid, 'EXPRESSION', args.target)}?${p}`;
  }
}

/* ── Attention (ON YOUR TABLE / 04 ITEMS NEED YOU) — derived, never authored ─────── */

export function buildHubAttention(args: {
  graph: HubGraph;
  projectId: string;
  productionId: string | null;
  selectedSceneId: string | null;
  scenes: readonly HubScene[];
  pendingRequests: readonly { id: string; title: string; scope: string; projectSlug: string }[];
  castUnresolved: readonly string[];
}): HubAttentionItem[] {
  const { graph, productionId } = args;
  const out: HubAttentionItem[] = [];
  const slot = (n: HubNodeId) => graph.byId[n].assetSlotId;
  const label = productionId ? `ENTRY ${productionId.replace(/^entry-/, '')}` : 'NO PRODUCTION';

  if (graph.byId.storyboard.status === 'REVIEW_REQUIRED')
    out.push({
      id: 'attn.storyboard',
      kind: 'FOUNDER_APPROVAL',
      title: 'STORYBOARD AUTHORITY',
      subtitle: label,
      stateLabel: 'REVIEW REQUIRED',
      actionLabel: 'REVIEW',
      priority: 'HIGH',
      nodeId: 'storyboard',
      sceneId: args.selectedSceneId,
      assetSlotId: slot('storyboard'),
      why: `${graph.byId.storyboard.statusDetail}. Final approval unlocks keyframes and downstream tasks.`,
    });
  if (graph.byId.narrative.status === 'REVIEW_REQUIRED')
    out.push({
      id: 'attn.narrative',
      kind: 'NARRATIVE',
      title: 'NARRATIVE APPROVAL',
      subtitle: label,
      stateLabel: 'AWAITING DECISION',
      actionLabel: 'REVIEW',
      priority: 'HIGH',
      nodeId: 'narrative',
      sceneId: null,
      assetSlotId: slot('narrative'),
      why: graph.byId.narrative.statusDetail + '.',
    });
  if (graph.byId.cast.status === 'REVIEW_REQUIRED')
    out.push({
      id: 'attn.cast',
      kind: 'CASTING',
      title: 'CASTING DECISION',
      subtitle: args.castUnresolved.length ? args.castUnresolved.join(' · ') : label,
      stateLabel: 'AWAITING DECISION',
      actionLabel: 'CHOOSE',
      priority: 'NORMAL',
      nodeId: 'cast',
      sceneId: null,
      assetSlotId: slot('cast'),
      why: graph.byId.cast.statusDetail + '.',
    });
  if (graph.byId.look.status === 'ACTIVE')
    out.push({
      id: 'attn.look',
      kind: 'WARDROBE',
      title: 'WARDROBE FITTING',
      subtitle: label,
      stateLabel: 'FITTING PENDING',
      actionLabel: 'REVIEW',
      priority: 'NORMAL',
      nodeId: 'look',
      sceneId: null,
      assetSlotId: slot('look'),
      why: graph.byId.look.statusDetail + '.',
    });
  if (graph.byId.set.status === 'NOT_STARTED' && graph.nodes.some((n) => n.status !== 'NOT_STARTED'))
    out.push({
      id: 'attn.set',
      kind: 'SET',
      title: 'SET REQUIRED',
      subtitle: label,
      stateLabel: 'NOT DEFINED',
      actionLabel: 'OPEN SET',
      priority: 'NORMAL',
      nodeId: 'set',
      sceneId: null,
      assetSlotId: slot('set'),
      why: `${graph.byId.set.statusDetail}. Storyboard needs an approved set before it can complete.`,
    });
  for (const r of args.pendingRequests)
    out.push({
      id: `attn.req.${r.id}`,
      kind: 'REQUEST',
      title: r.title.toUpperCase(),
      subtitle: `${r.projectSlug.toUpperCase()} · ${r.scope}`,
      stateLabel: 'QUEUED',
      actionLabel: 'OPEN INBOX',
      priority: 'NORMAL',
      nodeId: null,
      sceneId: null,
      assetSlotId: null,
      why: 'A project request is waiting in the Production queue.',
    });
  return out;
}

/* ── Activity (canonical + recorded) ───────────────────────────────────── */

export function activityFilterMatches(filter: 'ALL' | 'APPROVALS' | 'RENDERS' | 'ASSETS', c: HubActivityCategory): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'APPROVALS') return c === 'APPROVAL';
  if (filter === 'RENDERS') return c === 'RENDER';
  return c === 'ASSET';
}

export function hubSceneSlotId(sceneId: string): string {
  return hubSceneAssetSlotId(HUB_ENTRY002.projectId, HUB_ENTRY002.productionId, sceneId);
}

export function sortActivity(items: readonly HubActivityItem[]): HubActivityItem[] {
  return [...items].sort((a, b) => b.at.localeCompare(a.at));
}

export const HUB_FRAME_TARGET = HUB_STORYBOARD_FRAME_TARGET;
export const nodeLabel = (id: HubNodeId): string => HUB_NODE_LABEL[id];
