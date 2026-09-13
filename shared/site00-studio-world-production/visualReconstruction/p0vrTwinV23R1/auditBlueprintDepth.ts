import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import type { BlueprintDepthAudit } from './types.js';

export function auditBlueprintDepth(blueprint: ConceptBlueprint): BlueprintDepthAudit {
  const objectsPerSection: Record<string, number> = {};
  for (const sec of blueprint.sections) {
    objectsPerSection[sec.id] = blueprint.objects.filter((o) => o.parentId === sec.id).length;
  }
  const maxDepth = blueprint.objects.some((o) => o.parentId) ? 2 : 1;
  const topLevelSectionCount = blueprint.sections.length;
  const totalObjectCount = blueprint.objects.length;
  const shallow =
    topLevelSectionCount <= 10 &&
    totalObjectCount <= topLevelSectionCount * 2 + 3 &&
    maxDepth <= 2;

  return {
    topLevelSectionCount,
    totalObjectCount,
    maxDepth,
    objectsPerSection,
    shallow,
  };
}
