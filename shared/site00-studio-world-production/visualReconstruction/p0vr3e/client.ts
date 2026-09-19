/** Browser-safe P0.VR.3E exports (read-only registry + coverage). */
export {
  P0_VR_3E_LINEAGE,
  IMPLEMENTATION_SNAPSHOT_STORAGE_ROOT,
  P0_VR_3E_FAILURE_CODES,
} from './constants.js';
export {
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
  getImplementationSnapshot,
  listImplementationSnapshotBatches,
  getImplementationSnapshotBatch,
} from './implementationSnapshotRegistry.js';
export {
  buildImplementationSnapshotCoverage,
  listScreensWithSnapshots,
} from './implementationSnapshotCoverage.js';
export { detectPossibleFamilyOutliers } from './familyOutlierDetection.js';
export { buildImplementationSnapshotStoragePath } from './implementationSnapshotStoragePaths.js';
export { isMissingImplementationRoute, resolveRepresentativeRoute } from './routeRepresentativeResolver.js';
export type {
  ImplementationSnapshotRecord,
  ImplementationSnapshotBatch,
  ImplementationSnapshotCoverage,
  ImplementationSnapshotStatus,
  FamilyOutlierSignal,
} from './types.js';
