/** Whether a saved calibration step should end the client session and return to the caller. */
export function shouldFinishProjectLoreCalibration(params: {
  isLastStep: boolean;
  saveSucceeded: boolean;
  readinessBlocked: boolean;
}): boolean {
  if (!params.saveSucceeded) return false;
  if (params.isLastStep) return true;
  return !params.readinessBlocked;
}

export const PROJECT_LORE_CALIBRATION_COMPLETE_REDIRECT_MS = 1400;
