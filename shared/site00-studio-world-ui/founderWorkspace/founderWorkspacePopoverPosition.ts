/**
 * P0.UI.3C.2 — Shared founder workspace popover positioning + viewport containment.
 */

import { NOTIFICATION_CENTER_VISUAL_AUTHORITY } from './notificationCenterVisualAuthority.js';

export type PopoverViewportMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  safeAreaTop?: number;
  safeAreaRight?: number;
  safeAreaBottom?: number;
  safeAreaLeft?: number;
};

export type FounderWorkspacePopoverPlacement = 'anchor-below-viewport-right' | 'viewport-bottom-right';

export type FounderWorkspacePopoverWidthMode = 'notification' | 'menu';

export type FounderWorkspacePopoverPositionInput = {
  anchorRect: Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'> | null;
  viewport: PopoverViewportMetrics;
  placement: FounderWorkspacePopoverPlacement;
  widthMode: FounderWorkspacePopoverWidthMode;
  headerBottomFallback?: number;
  anchorGapPx?: number;
  bottomOffsetPx?: number;
};

export type FounderWorkspacePopoverPosition = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
};

const DEFAULT_HEADER_BOTTOM = 56;
const DEFAULT_ANCHOR_GAP = 8;
const DEFAULT_BOTTOM_OFFSET = 12;
const MAX_HEIGHT_TAIL = 24;

function resolveGutter(viewport: PopoverViewportMetrics): number {
  const left = viewport.safeAreaLeft ?? 0;
  const right = viewport.safeAreaRight ?? 0;
  return NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBounds.viewportGutterPx + Math.max(left, right);
}

export function computeFounderWorkspacePopoverWidth(
  viewportWidth: number,
  widthMode: FounderWorkspacePopoverWidthMode,
  gutterPx = NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBounds.viewportGutterPx,
): number {
  const safeGutter = gutterPx * 2;
  if (widthMode === 'menu') {
    return Math.min(320, Math.max(0, viewportWidth - safeGutter));
  }
  const { maxWidthPx, minReadableWidthPx } = NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBounds;
  const available = Math.max(0, viewportWidth - safeGutter);
  return Math.min(maxWidthPx, Math.max(minReadableWidthPx, available));
}

export function computeFounderWorkspacePopoverPosition(
  input: FounderWorkspacePopoverPositionInput,
): FounderWorkspacePopoverPosition {
  const gutter = resolveGutter(input.viewport);
  const width = computeFounderWorkspacePopoverWidth(input.viewport.viewportWidth, input.widthMode, gutter);
  const anchorGap = input.anchorGapPx ?? DEFAULT_ANCHOR_GAP;
  const headerBottom = input.headerBottomFallback ?? DEFAULT_HEADER_BOTTOM;

  if (input.placement === 'viewport-bottom-right') {
    const bottom = (input.bottomOffsetPx ?? DEFAULT_BOTTOM_OFFSET) + (input.viewport.safeAreaBottom ?? 0);
    const maxHeight = Math.max(
      160,
      input.viewport.viewportHeight - bottom - (input.viewport.safeAreaTop ?? 0) - MAX_HEIGHT_TAIL,
    );
    return {
      right: gutter,
      bottom,
      width,
      maxHeight: Math.min(maxHeight, input.viewport.viewportHeight * 0.7),
    };
  }

  const anchor = input.anchorRect;
  const anchorVisible = Boolean(anchor && anchor.width > 0 && anchor.height > 0 && anchor.right > gutter);
  const topBase = anchorVisible ? anchor!.bottom + anchorGap : headerBottom + anchorGap;
  const top = topBase + (input.viewport.safeAreaTop ?? 0);
  const left = Math.max(
    gutter + (input.viewport.safeAreaLeft ?? 0),
    input.viewport.viewportWidth - width - gutter - (input.viewport.safeAreaRight ?? 0),
  );
  const maxHeight = Math.max(
    160,
    input.viewport.viewportHeight - top - MAX_HEIGHT_TAIL - (input.viewport.safeAreaBottom ?? 0),
  );

  return {
    top,
    left,
    width,
    maxHeight,
  };
}

/** @deprecated Prefer computeFounderWorkspacePopoverPosition — kept for P0.UI.3C import stability */
export function computeNotificationPanelPosition(
  anchor: HTMLElement | null | undefined,
  viewportWidth: number,
  viewportHeight = 800,
): { top: number; left: number; width: number; maxHeight: number } {
  const rect = anchor?.getBoundingClientRect() ?? null;
  const position = computeFounderWorkspacePopoverPosition({
    anchorRect: rect,
    viewport: { viewportWidth, viewportHeight },
    placement: 'anchor-below-viewport-right',
    widthMode: 'notification',
  });
  return {
    top: position.top ?? DEFAULT_HEADER_BOTTOM + DEFAULT_ANCHOR_GAP,
    left: position.left ?? gutterFallback(viewportWidth, position.width),
    width: position.width,
    maxHeight: position.maxHeight,
  };
}

function gutterFallback(viewportWidth: number, width: number): number {
  const gutter = NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBounds.viewportGutterPx;
  return Math.max(gutter, viewportWidth - width - gutter);
}
