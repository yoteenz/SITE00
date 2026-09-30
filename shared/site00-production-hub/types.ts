/**
 * P0.PRODUCTION-HUB.AUTHORITY-RECONSTRUCTION-AND-HANDOFF1
 * Production Hub machine model. Pure types — no React, no I/O.
 *
 * ACTIVE OBJECT → ACTIVE OPERATION → RESULT.
 * Everything visible in the chamber is derived from these types; nothing is authored in the UI.
 */

export const HUB_NODE_ORDER = ['narrative', 'cast', 'look', 'performance', 'set', 'storyboard', 'keyframes'] as const;
export type HubNodeId = (typeof HUB_NODE_ORDER)[number];

export type HubNodeStatus =
  | 'COMPLETE'
  | 'ACTIVE'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED'
  | 'LOCKED'
  | 'NOT_STARTED';

export type HubMode = 'LIVE' | 'FLOW' | 'DEPENDENCIES';

export type HubDepartment = 'NARRATIVE' | 'CASTING' | 'WARDROBE' | 'PERFORMANCE' | 'SETS' | 'STORYBOARD' | 'KEYFRAMES' | 'PROJECT' | 'ATMOSPHERE';

/** A canonical scene of the selected production (Entry 002: the reel beat sequence). */
export type HubScene = {
  sceneId: string;
  order: number;
  label: string;
  purpose: string;
  durationRange: string | null;
  tensionStage: string | null;
};

export type HubStoryboardFrame = {
  frameId: string;
  number: number;
  /** Canonical public path when the storyboard pipeline has produced the panel; null → asset slot. */
  canonicalUrl: string | null;
};

export type HubNode = {
  id: HubNodeId;
  order: number;
  label: string;
  status: HubNodeStatus;
  /** One line explaining WHY the node has this status — from canonical facts only. */
  statusDetail: string;
  dependsOn: readonly HubNodeId[];
  /** Nodes that cannot leave LOCKED/NOT_STARTED until this one is COMPLETE. */
  unlocks: readonly HubNodeId[];
  quickActions: readonly HubNodeAction[];
  /** Asset slot that renders the node's artwork. */
  assetSlotId: string;
};

export type HubNodeActionKind = 'INSPECT_TAB' | 'DEEP_LINK';
export type HubNodeAction = {
  id: string;
  label: string;
  kind: HubNodeActionKind;
  /** Inspector tab id for INSPECT_TAB; workspace target for DEEP_LINK. */
  target: string;
};

export type HubFounderGate = {
  open: boolean;
  nodeId: HubNodeId | null;
  headline: string;
  detail: string;
  actionLabel: string;
  /** Whether the gate can be decided from the Hub with an existing production action. */
  decidableInHub: boolean;
};

export type HubOperation = {
  nodeId: HubNodeId | null;
  label: string;
  detail: string;
};

export type HubAttentionKind = 'FOUNDER_APPROVAL' | 'CASTING' | 'SET' | 'NARRATIVE' | 'WARDROBE' | 'REQUEST';
export type HubAttentionItem = {
  id: string;
  kind: HubAttentionKind;
  title: string;
  subtitle: string;
  stateLabel: string;
  actionLabel: string;
  priority: 'HIGH' | 'NORMAL';
  nodeId: HubNodeId | null;
  sceneId: string | null;
  assetSlotId: string | null;
  /** Deterministic reason string surfaced when the item is expanded. */
  why: string;
};

export type HubActivityCategory = 'APPROVAL' | 'RENDER' | 'ASSET' | 'REQUEST' | 'OTHER';
export type HubActivityItem = {
  id: string;
  category: HubActivityCategory;
  title: string;
  detail: string;
  at: string;
  actor: string | null;
  assetSlotId: string | null;
};

export type HubGraph = {
  nodes: readonly HubNode[];
  byId: Readonly<Record<HubNodeId, HubNode>>;
  activeNodeId: HubNodeId | null;
  operation: HubOperation;
  founderGate: HubFounderGate;
  blockers: readonly string[];
  /** Node that becomes available once the active/gated node completes. */
  nextStage: HubNodeId | null;
  completeCount: number;
  progressPercent: number;
};

/** Canonical facts the graph is derived from. Assembled from existing SITE 00 state, never authored. */
export type HubGraphInput = {
  /** True when a production exists for the selected project. */
  hasProduction: boolean;
  /** Storyboard/keyframe pipeline state is only known when the API answered. */
  pipelineAvailable: boolean;
  narrativeStatus: string | null;
  cast: {
    allRequiredLocked: boolean;
    requiredCount: number;
    lockedCount: number;
    missingAuthorities: readonly string[];
  } | null;
  looksLocked: boolean | null;
  lookCount: number;
  performanceDefined: boolean | null;
  setDefined: boolean;
  storyboard: {
    status: string | null;
    approved: boolean;
    panelCount: number;
  } | null;
  keyframeEligibility: string | null;
  keyframesApproved: boolean;
};

/* ── UI state machine ─────────────────────────────────────────────────── */

export type HubExpandedSurface = 'NONE' | 'ARTIFACT' | 'STORYBOARD' | 'TABLE' | 'ACTIVITY';
export type HubOverlay = 'NONE' | 'SCENE_SELECTOR' | 'LIGHTBOX' | 'DECISION' | 'PROJECT_SELECTOR' | 'ATTENTION' | 'MENU';

export type HubNodePanelFace = 'SUMMARY' | 'DETAIL';

export type HubUiState = {
  selectedProjectId: string;
  selectedProductionId: string | null;
  selectedSceneId: string | null;
  selectedNodeId: HubNodeId | null;
  /** Fixed-size suspended panel: detail swaps inside the shell; it does not resize the module. */
  selectedNodePanelFace: HubNodePanelFace;
  selectedArtifactId: string | null;
  selectedStoryboardFrameId: string | null;
  currentMode: HubMode;
  /** Node inspector open? (02 = node selected, 03 = inspector open). */
  inspectionState: { open: boolean; tab: string };
  expandedSurface: HubExpandedSurface;
  overlay: HubOverlay;
  compareOpen: boolean;
  expandedAttentionId: string | null;
  activityFilter: 'ALL' | 'APPROVALS' | 'RENDERS' | 'ASSETS';
};

/* ── Asset slot system ────────────────────────────────────────────────── */

export type HubAssetType =
  | 'ACTOR_PORTRAIT'
  | 'WARDROBE_LOOK'
  | 'PERFORMANCE_STILL'
  | 'SET_PLATE'
  | 'NARRATIVE_EVIDENCE'
  | 'SCENE_REFERENCE'
  | 'KEYFRAME_PLATE'
  | 'PROJECT_COVER'
  | 'STORYBOARD_FRAME'
  | 'CHAMBER_ATMOSPHERE';

export type HubAssetSlotStatus = 'MISSING' | 'FULFILLED' | 'CANONICAL_RUNTIME';

export type HubAssetSlot = {
  slotId: string;
  projectId: string;
  productionId: string | null;
  sceneId: string | null;
  department: HubDepartment;
  assetType: HubAssetType;
  purpose: string;
  aspectRatio: string;
  minimumResolution: string;
  visualContext: string;
  continuityRequirements: string;
  sourceAuthority: string;
  status: HubAssetSlotStatus;
  /** Set when an approved asset already exists (runtime canonical or a Grok receipt). */
  canonicalAssetId: string | null;
  grokRequired: boolean;
  grokPromptBrief: string;
  destinationPath: string;
  usedBy: readonly string[];
};

export type HubAssetReceipt = {
  slotId: string;
  canonicalAssetId: string;
  url: string;
  source: 'GROK' | 'CANONICAL_PIPELINE';
  receivedAt: string;
};
