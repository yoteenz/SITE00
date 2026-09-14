import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import { rehydrateMobileTwinVisualArtifactsFromStore } from './rehydrateMobileTwinVisualArtifacts.js';
import type { MobileTwinPipelineState } from './types.js';

const SNAPSHOT_KEY = 'site00:mobile-twin-authority-images:v1';

export type MobileTwinAuthorityImageSnapshot = {
  projectId: string;
  actualRenderId: string | null;
  actualRenderUri: string | null;
  blueprintTwinId: string | null;
  blueprintTwinUri: string | null;
  activeRenderId: string | null;
  activeAtomicRunId: string | null;
  activeVisualPairId: string | null;
  savedAt: string;
};

function readStore(): Record<string, MobileTwinAuthorityImageSnapshot> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MobileTwinAuthorityImageSnapshot>) : {};
  } catch {
    return {};
  }
}

export function writeMobileTwinAuthorityImageSnapshot(projectId: string, pipeline: MobileTwinPipelineState): void {
  if (typeof localStorage === 'undefined') return;
  const hydrated = rehydrateMobileTwinVisualArtifactsFromStore(pipeline);
  const slots = resolveMobileTwinReviewSlots(hydrated);
  const snap: MobileTwinAuthorityImageSnapshot = {
    projectId: projectId.toLowerCase(),
    actualRenderId: slots.actualRender?.id ?? null,
    actualRenderUri: slots.actualRender?.renderImageUri ?? null,
    blueprintTwinId: slots.blueprintTwin?.id ?? null,
    blueprintTwinUri: slots.blueprintTwin?.twinImageUri ?? null,
    activeRenderId: hydrated.activeRenderId ?? slots.actualRender?.id ?? null,
    activeAtomicRunId: slots.atomicRunId ?? hydrated.activeAtomicRunId ?? null,
    activeVisualPairId: slots.visualPairId ?? hydrated.activeVisualPairId ?? null,
    savedAt: new Date().toISOString(),
  };
  if (!snap.actualRenderUri && !snap.blueprintTwinUri) return;
  try {
    const parsed = readStore();
    parsed[projectId.toLowerCase()] = snap;
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(parsed));
  } catch {
    /* quota */
  }
}

export function readMobileTwinAuthorityImageSnapshot(projectId: string): MobileTwinAuthorityImageSnapshot | null {
  return readStore()[projectId.toLowerCase()] ?? null;
}

/** Patch missing URIs / remount pointers after iOS reload or regressive session write. */
export function applyMobileTwinAuthorityImageSnapshot(
  pipeline: MobileTwinPipelineState,
  projectId: string,
): MobileTwinPipelineState {
  const snap = readMobileTwinAuthorityImageSnapshot(projectId);
  if (!snap) return pipeline;

  let next = rehydrateMobileTwinVisualArtifactsFromStore({ ...pipeline });
  const renders = [...next.renders];
  const blueprintTwins = [...next.blueprintTwins];

  if (snap.actualRenderId && snap.actualRenderUri) {
    const idx = renders.findIndex((r) => r.id === snap.actualRenderId);
    if (idx >= 0) {
      if (!renders[idx]!.renderImageUri) renders[idx] = { ...renders[idx]!, renderImageUri: snap.actualRenderUri };
    } else {
      renders.push({
        id: snap.actualRenderId,
        compositionStateId: next.activeCompositionStateId ?? 'snapshot-comp',
        compositionHash: 'snapshot',
        referenceAuthorityId: next.designReference?.id ?? 'snapshot-ref',
        renderImageUri: snap.actualRenderUri,
        renderImageHash: 'snapshot',
        widthPx: 390,
        heightPx: 844,
        provider: 'FAL',
        providerJobRef: `snapshot-${snap.actualRenderId}`,
        status: 'FOUNDER_REVIEW',
        createdAt: snap.savedAt,
      });
    }
  }

  if (snap.blueprintTwinId && snap.blueprintTwinUri) {
    const idx = blueprintTwins.findIndex((b) => b.id === snap.blueprintTwinId);
    if (idx >= 0) {
      if (!blueprintTwins[idx]!.twinImageUri) {
        blueprintTwins[idx] = { ...blueprintTwins[idx]!, twinImageUri: snap.blueprintTwinUri };
      }
      if (blueprintTwins[idx]!.blueprintVisualVariant === 'HISTORICAL_BLUEPRINT_VARIANT') {
        blueprintTwins[idx] = { ...blueprintTwins[idx]!, blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' };
      }
    } else {
      blueprintTwins.push({
        id: snap.blueprintTwinId,
        implementationRenderId: snap.actualRenderId ?? snap.activeRenderId ?? 'snapshot-actual',
        compositionStateId: next.activeCompositionStateId ?? 'snapshot-comp',
        compositionHash: 'snapshot',
        twinImageUri: snap.blueprintTwinUri,
        twinImageHash: 'snapshot',
        blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN',
        blueprintStyleStatus: 'PASS',
        styleContractId: 'mobile-light-technical-blueprint-v1',
        outputRepresentationMode: 'LIGHT_TECHNICAL_BLUEPRINT',
        provider: 'FAL',
        providerJobRef: `snapshot-${snap.blueprintTwinId}`,
        createdAt: snap.savedAt,
      });
    }
  }

  return {
    ...next,
    renders,
    blueprintTwins,
    activeRenderId: snap.activeRenderId ?? next.activeRenderId,
    activeAtomicRunId: snap.activeAtomicRunId ?? next.activeAtomicRunId,
    activeVisualPairId: snap.activeVisualPairId ?? next.activeVisualPairId,
  };
}
