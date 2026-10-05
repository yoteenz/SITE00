/**
 * P0.VR.1D.5 — Single-screen micro-fidelity convergence.
 */

export * from './types.js';
export { buildReferenceDetailAudit } from './referenceDetailAudit.js';
export type { BuildReferenceDetailAuditInput } from './referenceDetailAudit.js';
export {
  resolveProductionCardArtwork,
  existingPipelinePreferredOverNewGeneration,
} from './resolveProductionCardArtwork.js';
export type { ResolveProductionCardArtworkInput } from './resolveProductionCardArtwork.js';
export {
  runNdxOverviewMicroFidelityPass,
} from './runNdxOverviewMicroFidelityPass.js';
export type { RunNdxOverviewMicroFidelityPassInput } from './runNdxOverviewMicroFidelityPass.js';

export const P0_VR_1D5_LINEAGE = 'P0.VR.1D.5' as const;
