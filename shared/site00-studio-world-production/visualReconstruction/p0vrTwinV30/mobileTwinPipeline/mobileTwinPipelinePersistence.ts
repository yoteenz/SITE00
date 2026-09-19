import {
  mergeMobileTwinPipelineRich,
  reconcileMobileTwinPipelineState,
} from './reconcileMobileTwinPipelineState.js';
import { writeMobileTwinAuthorityImageSnapshot } from './mobileTwinAuthorityImageSnapshot.js';
import { rehydrateMobileTwinVisualArtifactsFromStore } from './rehydrateMobileTwinVisualArtifacts.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { mobileTwinPipelineDataScore } from './mobileTwinPipelineDataScore.js';
import type { MobileTwinPipelineState } from './types.js';
import { emptyMobileTwinPipelineState } from './types.js';
import type { MobileTwinPackage } from './types.js';

const BACKUP_STORAGE_KEY = 'site00:mobile-twin-pipeline:backup:v1';

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

function packageArtifactIds(pkg: MobileTwinPackage): string[] {
  return [
    pkg.compositionStateId,
    pkg.surgicalBlueprintId,
    pkg.objectMapId,
    pkg.canonicalAssetManifestId,
    pkg.functionBindingMapId,
    pkg.hostProjectOwnershipMapId,
    pkg.implementationPrimitiveContractId,
    pkg.reverseTraceabilityMapId,
    pkg.reconciliationReceiptId,
    pkg.referenceTranslationFidelityReceiptId,
    pkg.twinFidelityReceiptId,
    pkg.implementationRenderId,
    pkg.blueprintTwinVisualId,
    pkg.implementationVisualAuthorityId ?? '',
  ].filter(Boolean);
}

function readBackupStore(): Record<string, MobileTwinPipelineState> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MobileTwinPipelineState>) : {};
  } catch {
    return {};
  }
}

function writeBackupSnapshot(projectId: string, state: MobileTwinPipelineState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const key = projectId.toLowerCase();
    const parsed = readBackupStore();
    const existing = parsed[key];
    if (existing && mobileTwinPipelineDataScore(state) <= mobileTwinPipelineDataScore(existing)) return;
    parsed[key] = state;
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* quota */
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
  for (const bp of state.blueprintTwins) {
    if (bp.twinImageUri) artifactsById[bp.id] = bp;
  }
  for (const run of state.atomicRuns ?? []) {
    artifactsById[run.id] = run;
  }
  if (state.implementationVisualAuthority) {
    artifactsById[state.implementationVisualAuthority.id] = state.implementationVisualAuthority;
  }
  for (const comp of compositionStates) {
    if (comp.id === activeCompId) artifactsById[comp.id] = comp;
  }
  const activePkg =
    (state.latestPackageId ? state.packages.find((p) => p.id === state.latestPackageId) : null) ??
    state.packages.at(-1) ??
    null;
  if (activePkg) {
    for (const id of packageArtifactIds(activePkg)) {
      if (state.artifactsById[id]) artifactsById[id] = state.artifactsById[id];
    }
    artifactsById[activePkg.id] = activePkg;
  }
  for (const pair of state.visualPairs ?? []) {
    artifactsById[pair.id] = pair;
  }
  return {
    ...state,
    compositionStates,
    artifactsById: { ...state.artifactsById, ...artifactsById },
    providerCostRecords: state.providerCostRecords?.slice(-8) ?? [],
    mobileTwinImplementation: state.mobileTwinImplementation,
  };
}

export function readMobileTwinPipelineFromBrowser(projectId: string): MobileTwinPipelineState | null {
  const key = projectId.toLowerCase();
  const row = readStore()[key];
  return row ?? null;
}

export function writeMobileTwinPipelineToBrowser(projectId: string, state: MobileTwinPipelineState): boolean {
  const key = projectId.toLowerCase();
  const existing = readStore()[key];
  let merged = state;
  if (existing) {
    merged = mergeMobileTwinPipelineRich(state, existing) ?? state;
    if (mobileTwinPipelineDataScore(merged) < mobileTwinPipelineDataScore(existing)) {
      return false;
    }
  }
  const rehydrated = rehydrateMobileTwinVisualArtifactsFromStore(merged);
  const slim = slimMobileTwinPipelineForStorage(rehydrated);
  writeBackupSnapshot(key, rehydrated);
  writeMobileTwinAuthorityImageSnapshot(key, rehydrated);
  const parsed = readStore();
  parsed[key] = slim;
  return writeStore(parsed);
}

export function mergeMobileTwinPipelinePreferRenders(
  primary?: MobileTwinPipelineState,
  secondary?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  return mergeMobileTwinPipelineRich(primary, secondary);
}

export function attachMobileTwinPipelineFromBrowserStore(
  projectId: string,
  sessionPipeline?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  const key = projectId.toLowerCase();
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  const backup = readBackupStore()[key];
  const richestStored =
    stored && backup ?
      (mobileTwinPipelineDataScore(stored) >= mobileTwinPipelineDataScore(backup) ? stored : backup)
    : stored ?? backup ?? undefined;
  if (!richestStored) return sessionPipeline;
  if (!sessionPipeline) {
    return hydrateMobileTwinReviewState(reconcileMobileTwinPipelineState(richestStored, key));
  }
  const merged = mergeMobileTwinPipelinePreferRenders(sessionPipeline, richestStored);
  return merged ?
      hydrateMobileTwinReviewState(reconcileMobileTwinPipelineState(merged, key))
    : sessionPipeline ?? richestStored;
}

/** Force session pipeline from dedicated LS (+ backup) when in-memory state regressed. */
export function restoreMobileTwinPipelineFromBrowserStore(
  projectId: string,
  sessionPipeline?: MobileTwinPipelineState,
): MobileTwinPipelineState | undefined {
  const key = projectId.toLowerCase();
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  const backup = readBackupStore()[key];
  const richest =
    stored && backup ?
      (mobileTwinPipelineDataScore(stored) >= mobileTwinPipelineDataScore(backup) ? stored : backup)
    : stored ?? backup ?? undefined;
  if (!richest) return sessionPipeline;
  const merged =
    sessionPipeline ? (mergeMobileTwinPipelineRich(richest, sessionPipeline) ?? richest) : richest;
  return hydrateMobileTwinReviewState(reconcileMobileTwinPipelineState(merged, key));
}

export function ensureMobileTwinPipelineDefaults(state: MobileTwinPipelineState): MobileTwinPipelineState {
  const base = {
    ...emptyMobileTwinPipelineState(),
    ...state,
    atomicRuns: state.atomicRuns ?? [],
    visualPairs: state.visualPairs ?? [],
    twinCapabilityTest: state.twinCapabilityTest ?? null,
    mobileTwinVisualGenerationStrategy: state.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
    providerBenchmark: state.providerBenchmark ?? null,
    mobileTwinProviderStrategy: state.mobileTwinProviderStrategy ?? null,
    focusedHybridBenchmark: state.focusedHybridBenchmark ?? null,
    mobileTwinRenderStrategy: state.mobileTwinRenderStrategy ?? null,
    mobileTwinProviderLock: state.mobileTwinProviderLock ?? null,
    founderTwinProviderPromotionReceiptId: state.founderTwinProviderPromotionReceiptId ?? null,
    founderManualTwinPathUnlock: state.founderManualTwinPathUnlock ?? false,
  };
  if (base.renders.length && !base.activeRenderId) {
    base.activeRenderId = base.renders.at(-1)!.id;
  }
  if (base.renders.length && base.renderGate === 'GENERATED') {
    const active = base.renders.find((r) => r.id === base.activeRenderId);
    if (active?.status === 'FOUNDER_REVIEW') base.renderGate = 'FOUNDER_REVIEW';
  }
  return reconcileMobileTwinPipelineState(base);
}
