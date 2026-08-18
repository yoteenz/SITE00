import type { BldrBuildClassIconId } from './bldr-build-class-icons';
import type { BldrAssessmentStateId } from './bldr-assessment';

export const BLDR_BUILD_CLASS_TO_ASSESSMENT: Record<BldrBuildClassIconId, BldrAssessmentStateId> = {
  site: 'site',
  world: 'world',
  enterprise: 'enterprise',
  'not-sure': 'not-sure',
};

export function buildClassToAssessmentSlug(classId: string): BldrAssessmentStateId | null {
  if (classId in BLDR_BUILD_CLASS_TO_ASSESSMENT) {
    return BLDR_BUILD_CLASS_TO_ASSESSMENT[classId as BldrBuildClassIconId];
  }
  return null;
}
