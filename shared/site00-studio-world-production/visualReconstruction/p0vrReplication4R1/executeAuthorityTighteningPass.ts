import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { P0_VR_REPLICATION_4R1_BUILD } from './constants.js';
import { buildAuthorityTighteningCssPatch, buildAuthorityTighteningDriftSummary } from './authorityTighteningGeometry.js';
import type { ForensicBlueprintExecutionReport } from '../p0vrReplication4/types.js';

export type AuthorityTighteningReport = {
  buildRef: typeof P0_VR_REPLICATION_4R1_BUILD;
  mode: 'AUTHORITY_LOCKED_TIGHTENING';
  driftSummary: ReturnType<typeof buildAuthorityTighteningDriftSummary>;
  heroSubregionIsolation: boolean;
  notes: string;
};

export function executeAuthorityTighteningPass(input: {
  session: ReconstructionTwinSession;
  forensicReport: ForensicBlueprintExecutionReport | null;
}): { report: AuthorityTighteningReport; sessionPatch: Partial<ReconstructionTwinSession> } {
  const cssPatch = {
    ...(input.session.twinForensicCssPatch ?? {}),
    ...buildAuthorityTighteningCssPatch(),
  };

  const report: AuthorityTighteningReport = {
    buildRef: P0_VR_REPLICATION_4R1_BUILD,
    mode: 'AUTHORITY_LOCKED_TIGHTENING',
    driftSummary: buildAuthorityTighteningDriftSummary(),
    heroSubregionIsolation: true,
    notes:
      '4R1 parent geometry locked; hero uses cropped authority field + left scrim to eliminate duplicate/ghost text from full-page asset.',
  };

  return {
    report,
    sessionPatch: {
      twinForensicCssPatch: cssPatch,
      authorityTighteningReport: report,
      forensicBlueprintReport: input.forensicReport
        ? { ...input.forensicReport, buildRef: input.forensicReport.buildRef }
        : input.session.forensicBlueprintReport ?? null,
    },
  };
}
