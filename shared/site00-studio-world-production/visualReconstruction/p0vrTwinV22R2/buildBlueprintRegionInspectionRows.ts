import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import type { GeneratedHostArtifact, HostShellContract } from './types.js';
import { isHostOwnedBlueprintLabel } from './isHostOwnedBlueprintLabel.js';

export type BlueprintRegionInspectionRow = {
  regionId: string;
  label: string;
  bounds: { y: number; h: number };
  ownership: 'CLIENT_OWNED_CREATIVE' | 'HOST_OWNED_LOCKED' | 'GENERATED_HOST_ARTIFACT';
  executionStatus: 'INCLUDED_IN_CLIENT_BUILD' | 'EXCLUDED_FROM_CLIENT_BUILD' | 'RUNTIME_HOST_COMPONENT';
  runtimeSource: string | null;
  generatedSource: string | null;
};

export function buildBlueprintRegionInspectionRows(input: {
  originalBlueprint: ConceptBlueprint;
  executionBlueprint: ConceptBlueprint;
  generatedHostArtifacts: GeneratedHostArtifact[];
  hostShellContract: HostShellContract | null;
}): BlueprintRegionInspectionRow[] {
  const artifactObjectIds = new Set(input.generatedHostArtifacts.map((a) => a.objectId));
  const rows: BlueprintRegionInspectionRow[] = [];

  for (const sec of input.originalBlueprint.sections) {
    const hostBand = isHostOwnedBlueprintLabel(sec.label);
    const matchingArtifact = input.generatedHostArtifacts.find(
      (a) => a.artifactType === 'INVENTED_BOTTOM_NAV' && sec.label.toLowerCase().includes('host bottom'),
    );
    if (hostBand || matchingArtifact) {
      rows.push({
        regionId: sec.id,
        label: sec.label.toUpperCase(),
        bounds: { y: sec.bounds.y, h: sec.bounds.h },
        ownership: 'HOST_OWNED_LOCKED',
        executionStatus: 'EXCLUDED_FROM_CLIENT_BUILD',
        runtimeSource: input.hostShellContract?.hostBottomNavComponent ?? 'TwinSite00HostBottomNav',
        generatedSource: 'GENERATED_HOST_ARTIFACT',
      });
      continue;
    }
    const inExecution = input.executionBlueprint.sections.some((s) => s.id === sec.id);
    rows.push({
      regionId: sec.id,
      label: sec.label,
      bounds: { y: sec.bounds.y, h: sec.bounds.h },
      ownership: 'CLIENT_OWNED_CREATIVE',
      executionStatus: inExecution ? 'INCLUDED_IN_CLIENT_BUILD' : 'EXCLUDED_FROM_CLIENT_BUILD',
      runtimeSource: null,
      generatedSource: null,
    });
  }

  for (const obj of input.originalBlueprint.objects) {
    if (!artifactObjectIds.has(obj.objectId) && !obj.isGeneratedHostArtifact) continue;
    if (rows.some((r) => r.regionId === obj.objectId)) continue;
    rows.push({
      regionId: obj.objectId,
      label: obj.role,
      bounds: { y: obj.bounds.y, h: obj.bounds.h },
      ownership: 'GENERATED_HOST_ARTIFACT',
      executionStatus: 'EXCLUDED_FROM_CLIENT_BUILD',
      runtimeSource: input.hostShellContract?.hostBottomNavComponent ?? 'TwinSite00HostBottomNav',
      generatedSource: 'GENERATED_HOST_ARTIFACT',
    });
  }

  return rows;
}
