/**
 * Hub UI state machine. selectedSceneId and selectedStoryboardFrameId are INDEPENDENT:
 * - SELECT_SCENE rehydrates the chamber (scene-derived views) and never touches the frame.
 * - STEP_FRAME / SELECT_FRAME move only the frame/artifact view and never touch the scene.
 * Every overlay closes back to the exact prior surface state (overlays never mutate it).
 */

import type { HubExpandedSurface, HubMode, HubNodeId, HubOverlay, HubUiState } from './types.js';

export type HubAction =
  | { type: 'SET_MODE'; mode: HubMode }
  | { type: 'SELECT_PROJECT'; projectId: string; productionId: string | null; sceneId: string | null }
  | { type: 'SELECT_SCENE'; sceneId: string }
  | { type: 'SELECT_FRAME'; frameId: string | null }
  /** Idempotent hydration: keep a valid selection (e.g. one just restored), otherwise default to the first. */
  | { type: 'ENSURE_SCENE'; sceneIds: readonly string[] }
  | { type: 'ENSURE_FRAME'; frameIds: readonly string[] }
  | { type: 'STEP_FRAME'; delta: 1 | -1; frameIds: readonly string[] }
  | { type: 'SELECT_NODE'; nodeId: HubNodeId | null }
  | { type: 'OPEN_INSPECTOR'; nodeId: HubNodeId; tab: string }
  | { type: 'SET_INSPECTOR_TAB'; tab: string }
  | { type: 'CLOSE_INSPECTOR' }
  | { type: 'SET_EXPANDED'; surface: HubExpandedSurface }
  | { type: 'OPEN_OVERLAY'; overlay: Exclude<HubOverlay, 'NONE'> }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'SET_COMPARE'; open: boolean }
  | { type: 'EXPAND_ATTENTION'; id: string | null }
  | { type: 'SET_ACTIVITY_FILTER'; filter: HubUiState['activityFilter'] }
  | { type: 'RESTORE'; state: Partial<HubUiState> };

export function initialHubState(projectId: string): HubUiState {
  return {
    selectedProjectId: projectId,
    selectedProductionId: null,
    selectedSceneId: null,
    selectedNodeId: null,
    selectedArtifactId: null,
    selectedStoryboardFrameId: null,
    currentMode: 'LIVE',
    inspectionState: { open: false, tab: '' },
    expandedSurface: 'NONE',
    overlay: 'NONE',
    compareOpen: false,
    expandedAttentionId: null,
    activityFilter: 'ALL',
  };
}

export function hubReducer(s: HubUiState, a: HubAction): HubUiState {
  switch (a.type) {
    case 'SET_MODE':
      // Mode reconfigures the chamber; selection and frames are preserved.
      return { ...s, currentMode: a.mode, overlay: 'NONE' };
    case 'SELECT_PROJECT':
      return {
        ...initialHubState(a.projectId),
        selectedProductionId: a.productionId,
        selectedSceneId: a.sceneId,
      };
    case 'SELECT_SCENE':
      return { ...s, selectedSceneId: a.sceneId, overlay: s.overlay === 'SCENE_SELECTOR' ? 'NONE' : s.overlay };
    case 'ENSURE_SCENE': {
      if (!a.sceneIds.length) return s;
      if (s.selectedSceneId && a.sceneIds.includes(s.selectedSceneId)) return s;
      return { ...s, selectedSceneId: a.sceneIds[0]! };
    }
    case 'ENSURE_FRAME': {
      if (!a.frameIds.length) return s.selectedStoryboardFrameId === null ? s : { ...s, selectedStoryboardFrameId: null, selectedArtifactId: null };
      if (s.selectedStoryboardFrameId && a.frameIds.includes(s.selectedStoryboardFrameId)) return s;
      // Authority centerpiece is storyboard frame 03 (the pencil), not the first pipeline panel.
      const preferred = a.frameIds.includes('frame-03') ? 'frame-03' : a.frameIds[0]!;
      return { ...s, selectedStoryboardFrameId: preferred, selectedArtifactId: preferred };
    }
    case 'SELECT_FRAME':
      return { ...s, selectedStoryboardFrameId: a.frameId, selectedArtifactId: a.frameId };
    case 'STEP_FRAME': {
      if (!a.frameIds.length) return s;
      const cur = s.selectedStoryboardFrameId ? a.frameIds.indexOf(s.selectedStoryboardFrameId) : -1;
      const next = a.frameIds[(cur + a.delta + a.frameIds.length) % a.frameIds.length]!;
      return { ...s, selectedStoryboardFrameId: next, selectedArtifactId: next };
    }
    case 'SELECT_NODE':
      return { ...s, selectedNodeId: s.selectedNodeId === a.nodeId ? null : a.nodeId, inspectionState: { open: false, tab: '' } };
    case 'OPEN_INSPECTOR':
      return { ...s, selectedNodeId: a.nodeId, inspectionState: { open: true, tab: a.tab }, compareOpen: false };
    case 'SET_INSPECTOR_TAB':
      return { ...s, inspectionState: { open: s.inspectionState.open, tab: a.tab } };
    case 'CLOSE_INSPECTOR':
      return { ...s, inspectionState: { open: false, tab: '' } };
    case 'SET_EXPANDED':
      return { ...s, expandedSurface: s.expandedSurface === a.surface ? 'NONE' : a.surface };
    case 'OPEN_OVERLAY':
      return { ...s, overlay: a.overlay };
    case 'CLOSE_OVERLAY':
      return { ...s, overlay: 'NONE' };
    case 'SET_COMPARE':
      return { ...s, compareOpen: a.open, inspectionState: a.open ? { open: false, tab: '' } : s.inspectionState };
    case 'EXPAND_ATTENTION':
      return { ...s, expandedAttentionId: s.expandedAttentionId === a.id ? null : a.id };
    case 'SET_ACTIVITY_FILTER':
      return { ...s, activityFilter: a.filter };
    case 'RESTORE':
      // Overlays are never restored — only durable selection/inspection context.
      return { ...s, ...a.state, overlay: 'NONE' };
    default:
      return s;
  }
}

/** Durable context persisted across deep links (OPEN CASTING → return). */
export function serializableHubContext(s: HubUiState): Partial<HubUiState> {
  return {
    selectedProjectId: s.selectedProjectId,
    selectedProductionId: s.selectedProductionId,
    selectedSceneId: s.selectedSceneId,
    selectedNodeId: s.selectedNodeId,
    selectedStoryboardFrameId: s.selectedStoryboardFrameId,
    currentMode: s.currentMode,
    inspectionState: s.inspectionState,
    expandedSurface: s.expandedSurface,
    compareOpen: s.compareOpen,
  };
}
