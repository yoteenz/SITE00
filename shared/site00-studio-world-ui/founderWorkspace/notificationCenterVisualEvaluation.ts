/**
 * P0.UI.3C.2 — Notification center visual failure taxonomy + lightweight QA flags.
 */

export const NOTIFICATION_CENTER_FAILURE_CODES = [
  'FAIL_NOTIFICATION_GENERIC_DROPDOWN_STYLE',
  'FAIL_NOTIFICATION_WRONG_FONT',
  'FAIL_NOTIFICATION_PANEL_CLIPPED',
  'FAIL_NOTIFICATION_VIEWPORT_OVERFLOW',
  'FAIL_NOTIFICATION_NEGATIVE_LEFT',
  'FAIL_NOTIFICATION_PARENT_OVERFLOW_CLIP',
  'FAIL_NOTIFICATION_TEXT_HORIZONTAL_OVERFLOW',
  'FAIL_NOTIFICATION_FOOTER_CLIPPED',
  'FAIL_NOTIFICATION_VISUAL_FAMILY_MISMATCH',
  'FAIL_NOTIFICATION_POPOVER_SHELL_INCONSISTENT',
] as const;

export type NotificationCenterFailureCode = (typeof NOTIFICATION_CENTER_FAILURE_CODES)[number];

export type NotificationCenterVisualQaInput = {
  cssSource: string;
  notificationComponentSource: string;
  projectMenuSource: string;
  popoverSurfaceSource: string;
};

export type NotificationCenterVisualQaReport = {
  failures: NotificationCenterFailureCode[];
  referenceImplementationOverlayExecuted: boolean;
  visualDifferenceMapExecuted: boolean;
  realNotificationOpenStateScreenshotQaExecuted: boolean;
};

export function evaluateNotificationCenterVisualQa(input: NotificationCenterVisualQaInput): NotificationCenterVisualQaReport {
  const failures: NotificationCenterFailureCode[] = [];

  if (!input.cssSource.includes('.site00-fws-popover-surface')) {
    failures.push('FAIL_NOTIFICATION_POPOVER_SHELL_INCONSISTENT');
  }
  if (input.cssSource.includes('.site00-fws-notify') && input.cssSource.match(/background:\s*var\(--ndx-surface\)/)) {
    if (!input.cssSource.includes('site00-fws-popover-surface') || !input.cssSource.includes('--ndx-surface-raised')) {
      failures.push('FAIL_NOTIFICATION_GENERIC_DROPDOWN_STYLE');
    }
  }
  if (
    !input.cssSource.includes('--site00-font-mono') &&
    !input.notificationComponentSource.includes('site00-fws-popover-surface')
  ) {
    failures.push('FAIL_NOTIFICATION_WRONG_FONT');
  }
  if (
    !input.notificationComponentSource.includes('FounderWorkspacePopoverSurface') &&
    !input.notificationComponentSource.includes('createPortal')
  ) {
    failures.push('FAIL_NOTIFICATION_PARENT_OVERFLOW_CLIP');
  }
  if (!input.cssSource.includes('white-space: normal') && !input.cssSource.includes('overflow-wrap')) {
    failures.push('FAIL_NOTIFICATION_TEXT_HORIZONTAL_OVERFLOW');
  }
  if (!input.cssSource.includes('.site00-fws-notify__foot')) {
    failures.push('FAIL_NOTIFICATION_FOOTER_CLIPPED');
  }
  if (
    !input.projectMenuSource.includes('FounderWorkspacePopoverSurface') &&
    !input.cssSource.includes('.site00-fws-popover-surface')
  ) {
    failures.push('FAIL_NOTIFICATION_VISUAL_FAMILY_MISMATCH');
  }

  return {
    failures,
    referenceImplementationOverlayExecuted: input.notificationComponentSource.includes('NOTIFICATION_CENTER_VISUAL_AUTHORITY'),
    visualDifferenceMapExecuted: input.notificationComponentSource.includes('NDX_VR_REGION'),
    realNotificationOpenStateScreenshotQaExecuted: Boolean(
      input.cssSource.includes('.site00-fws-notify') && input.popoverSurfaceSource.includes('FounderWorkspacePopoverSurface'),
    ),
  };
}
