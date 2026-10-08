import type { IntakeDetail } from '../site00-intakes/types';
import { normalizeIntakeStatus } from '../site00-intakes/types';
import { isBuilderSpatialSubmittedPayload } from './types';

/** Production activation remains gated — this contract exposes linkage only. */
export type BuilderProjectActivationHint = {
  intakeId: string;
  projectId: string | null;
  reviewStatus: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ACTIVE_REVISION' | 'CONVERTED' | 'ARCHIVED';
  canActivateProduction: boolean;
  blockers: string[];
};

export function builderProjectActivationHint(intake: IntakeDetail): BuilderProjectActivationHint {
  const status = normalizeIntakeStatus(intake.status);
  const blockers: string[] = [];
  const submitted = isBuilderSpatialSubmittedPayload(intake.submittedPayload ?? undefined);

  if (!submitted) blockers.push('NO_BLUEPRINT_SUBMISSION');
  if (status !== 'CONVERTED') blockers.push('INTAKE_NOT_CONVERTED');
  if (!intake.projectId) blockers.push('NO_PROJECT_LINK');

  let reviewStatus: BuilderProjectActivationHint['reviewStatus'] = 'DRAFT';
  if (status === 'SUBMITTED') reviewStatus = 'SUBMITTED';
  if (status === 'IN_REVIEW') reviewStatus = 'IN_REVIEW';
  if (status === 'ACTIVE' && intake.draftPayload?.revisionOpen) reviewStatus = 'ACTIVE_REVISION';
  if (status === 'ACTIVE') reviewStatus = 'DRAFT';
  if (status === 'CONVERTED') reviewStatus = 'CONVERTED';
  if (status === 'ARCHIVED') reviewStatus = 'ARCHIVED';

  return {
    intakeId: intake.id,
    projectId: intake.projectId,
    reviewStatus,
    canActivateProduction: blockers.length === 0,
    blockers,
  };
}
