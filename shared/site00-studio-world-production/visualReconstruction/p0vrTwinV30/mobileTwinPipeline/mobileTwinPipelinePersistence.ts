import type { MobileTwinPipelineState } from './types.js';
import { emptyMobileTwinPipelineState } from './types.js';

const STORAGE_KEY = 'site00:mobile-twin-pipeline:v1';

function readStore(): Record<string, MobileTwinPipelineState> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MobileTwinPipelineState>;
  } catch {
    return {};
  }
}

function writeStore(parsed: Record<string, MobileTwinPipelineState>): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

/** Drop heavy composition geometry from non-active states; keep all render URLs for review. */
export function slimMobileTwinPipelineForStorage(state: MobileTwinPipelineState): MobileTwinPipelineState {
  const activeCompId = state.activeCompositionStateId;
  const compositionStates = state.compositionStates.map((c) => {
    if (c.id === activeCompId) return c;
    return {
      ...c,
      objectDefinitions: [],
      regionDefinitions: [],
      relationships: [],
      zOrder: [],
    };
  });
  const artifactsById: Record<string, unknown> = {};
  for (const render of state.renders) {
    artifactsById[render.id] = render;
  }
  if (state.implementationVisualAuthority) {
    artifactsById[state.implementationVisualAuthority.id] = state.implementationVisualAuthority;
  }
  for (const comp of compositionStates) {
    if (comp.id === activeCompId) artifactsById[comp.id] = comp;
  }
  return {
    ...state,
    compositionStates,
    artifactsById: { ...state.artifactsById, ...artifactsById },
    providerCostRecords: state.providerCostRecords?.slice(-8) ?? [],
  };
}

export function readMobileTwinPipelineFromBrowser(projectId: string): MobileTwinPipelineState | null {
  const key = projectId.toLowerCase();
  const row = readStore()[key];
  return row ?? null;
}

export function writeMobileTwinPipelineToBrowser(projectId: string, state: MobileTwinPipelineState): boolean {
  const key = projectId.toLowerCase();
  const parsed = readStore();
  parsed[key] = slimMobileTwinPipelineForStorage(state);
  return writeStore(parsed);
}

export function mergeMobileTwinPipelinePreferRenders(
  primary?: MobileTwinPipelineState,
  secondary?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  if (!primary && !secondary) return undefined;
  if (!primary) return secondary;
  if (!secondary) return primary;
  const pick = secondary.renders.length >= primary.renders.length ? secondary : primary;
  const other = pick === secondary ? primary : secondary;
  return {
    ...pick,
    designReference: pick.designReference ?? other.designReference,
    desktopStatus: 'DEFERRED',
    r6f2ForensicRole: pick.r6f2ForensicRole ?? other.r6f2ForensicRole,
    falJobsDispatched: Math.max(pick.falJobsDispatched ?? 0, other.falJobsDispatched ?? 0),
    totalProviderCostUsd: Math.max(pick.totalProviderCostUsd ?? 0, other.totalProviderCostUsd ?? 0),
  };
}

export function attachMobileTwinPipelineFromBrowserStore(
  projectId: string,
  sessionPipeline?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  const merged = mergeMobileTwinPipelinePreferRenders(sessionPipeline, stored ?? undefined);
  return merged ?? sessionPipeline ?? stored ?? undefined;
}

export function ensureMobileTwinPipelineDefaults(state: MobileTwinPipelineState): MobileTwinPipelineState {
  const base = {
    ...emptyMobileTwinPipelineState(),
    ...state,
    atomicRuns: state.atomicRuns ?? [],
    visualPairs: state.visualPairs ?? [],
  };
  if (base.renders.length && !base.activeRenderId) {
    base.activeRenderId = base.renders.at(-1)!.id;
  }
  if (base.renders.length && base.renderGate === 'GENERATED') {
    const active = base.renders.find((r) => r.id === base.activeRenderId);
    if (active?.status === 'FOUNDER_REVIEW') base.renderGate = 'FOUNDER_REVIEW';
  }
  return base;
}
