export const BLUEPRINT_RETRY_ACTUAL_REGENERATION_VIOLATION =
  'BLUEPRINT_RETRY_ACTUAL_REGENERATION_VIOLATION' as const;

export function assertBlueprintOnlyRetryJobCounts(input: { actualJobs: number; blueprintJobs: number }): void {
  if (input.actualJobs !== 0) {
    throw new Error(BLUEPRINT_RETRY_ACTUAL_REGENERATION_VIOLATION);
  }
  if (input.blueprintJobs !== 1) {
    throw new Error('MOBILE_BLUEPRINT_RETRY_JOB_COUNT_VIOLATION');
  }
}
