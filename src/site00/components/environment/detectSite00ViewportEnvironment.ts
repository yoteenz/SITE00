import type { EnvironmentId } from '../../config/environments';

/** Detect environment page inside scaled artboard stage for viewport bg layer. */
export function detectSite00ViewportEnvironment(stage: ParentNode): EnvironmentId | null {
  if (stage.querySelector('.site00-enter-page') != null) {
    return 'ENTER_00_WAITING_ROOM';
  }
  if (stage.querySelector('.site00-origin-page') != null) {
    return 'ORIGIN_ENVIRONMENT';
  }
  if (stage.querySelector('.site00-state-page') != null) {
    return 'WORKFLOW_ENVIRONMENT';
  }
  if (stage.querySelector('.site00-idnty-assessment') != null) {
    return 'IDNTY_ASSESSMENT_ENVIRONMENT';
  }
  return null;
}
