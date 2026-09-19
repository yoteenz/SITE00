/**
 * P0.UI.3C / P0.UI.3C.2 — Notification panel positioning (re-export shared popover math).
 */

export type NotificationPanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export {
  computeNotificationPanelPosition,
  computeFounderWorkspacePopoverPosition,
  computeFounderWorkspacePopoverWidth,
} from '../../site00-studio-world-ui/founderWorkspace/founderWorkspacePopoverPosition.js';

export type {
  FounderWorkspacePopoverPlacement,
  FounderWorkspacePopoverPosition,
  FounderWorkspacePopoverPositionInput,
  FounderWorkspacePopoverWidthMode,
  PopoverViewportMetrics,
} from '../../site00-studio-world-ui/founderWorkspace/founderWorkspacePopoverPosition.js';
