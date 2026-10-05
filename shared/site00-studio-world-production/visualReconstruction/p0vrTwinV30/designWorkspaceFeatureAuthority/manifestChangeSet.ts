import { computeFeatureManifestChecksum } from './designWorkspaceFeatureManifestV1.js';
import { getWorkspaceFeatureDefinition } from './designWorkspaceFeatureManifestV1.js';
import type { DesignWorkspaceFeatureManifest, WorkspaceFeatureChangeSet, WorkspaceFeatureDefinition } from './types.js';

export function applyWorkspaceFeatureChangeSet(
  base: DesignWorkspaceFeatureManifest,
  changeSet: WorkspaceFeatureChangeSet,
  definitions: WorkspaceFeatureDefinition[],
  now = new Date().toISOString(),
): DesignWorkspaceFeatureManifest {
  let required = [...base.requiredFeatureIds];
  let featureIds = [...base.featureIds];
  let removed = [...base.removedFeatureIds];
  const replacementMap = { ...base.replacementMap };

  if (changeSet.changeType === 'ADD_FEATURE') {
    for (const id of changeSet.addedFeatures) {
      if (!featureIds.includes(id)) featureIds.push(id);
      const def = definitions.find((d) => d.featureId === id) ?? getWorkspaceFeatureDefinition(id);
      if (def?.required && !required.includes(id)) required.push(id);
    }
  }
  if (changeSet.changeType === 'REMOVE_FEATURE') {
    for (const id of changeSet.removedFeatures) {
      required = required.filter((r) => r !== id);
      featureIds = featureIds.filter((f) => f !== id);
      if (!removed.includes(id)) removed.push(id);
    }
  }
  if (changeSet.changeType === 'REPLACE_FEATURE') {
    for (const pair of changeSet.replacementPairs) {
      required = required.map((r) => (r === pair.from ? pair.to : r));
      featureIds = featureIds.map((f) => (f === pair.from ? pair.to : f));
      replacementMap[pair.from] = pair.to;
      if (!removed.includes(pair.from)) removed.push(pair.from);
    }
  }

  const next: DesignWorkspaceFeatureManifest = {
    ...base,
    version: changeSet.resultingManifestVersion,
    featureIds,
    requiredFeatureIds: required,
    removedFeatureIds: removed,
    replacementMap,
    parentManifestVersion: base.version,
    changeSetIds: [...base.changeSetIds, changeSet.id],
    updatedAt: now,
    status: 'ACTIVE',
    checksum: '',
  };
  next.checksum = computeFeatureManifestChecksum(next);
  return next;
}
