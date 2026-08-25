export type NotificationPanelPosition = {
  top: number;
  left: number;
  width: number;
};

export function computeNotificationPanelPosition(
  anchor: HTMLElement | null | undefined,
  viewportWidth: number,
): NotificationPanelPosition {
  const margin = 12;
  const width = Math.min(340, Math.max(280, viewportWidth - margin * 2));
  const fallbackTop = 56;
  const fallbackLeft = Math.max(margin, viewportWidth - width - margin);

  if (!anchor) {
    return { top: fallbackTop, left: fallbackLeft, width };
  }

  const rect = anchor.getBoundingClientRect();
  const anchorVisible = rect.width > 0 && rect.height > 0 && rect.right > margin;
  if (!anchorVisible) {
    return { top: fallbackTop, left: fallbackLeft, width };
  }

  const top = rect.bottom + 8;
  let left = rect.right - width;
  left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

  return { top, left, width };
}
