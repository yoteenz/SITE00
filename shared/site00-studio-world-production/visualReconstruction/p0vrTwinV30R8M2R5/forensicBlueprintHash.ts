import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

/** Browser-safe URL/content hash (no node:crypto). */
export function forensicBlueprintContentHash(material: string): string {
  return fnv1aHex(material);
}
