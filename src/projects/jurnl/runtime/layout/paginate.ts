/**
 * Atomic panel pagination for the JURNL mobile composition frame.
 * Panels are never split. A panel that does not fit the remaining height moves whole to the next screen.
 * A panel taller than an entire screen is OVERSIZE: it gets a screen of its own and the stack lets it scroll internally.
 */

export type PanelMeasure = { id: string; height: number };

export type PaginationScreen = { panelIds: string[]; oversize: string[] };

export type PaginationResult = {
  screens: PaginationScreen[];
  /** Height available to panels on screen 1 and on continuation screens (which carry a short caption). */
  firstAvailable: number;
  nextAvailable: number;
};

/** Sub-pixel tolerance so a panel that fits by rounding is not pushed to the next screen. */
const EPSILON = 0.5;

export function paginatePanels(panels: PanelMeasure[], firstAvailable: number, gap: number, nextAvailable: number = firstAvailable): PaginationResult {
  const screens: PaginationScreen[] = [];
  let current: PaginationScreen = { panelIds: [], oversize: [] };
  let used = 0;
  const limit = () => (screens.length === 0 ? firstAvailable : nextAvailable);
  const close = () => {
    if (current.panelIds.length) screens.push(current);
    current = { panelIds: [], oversize: [] };
    used = 0;
  };
  for (const panel of panels) {
    // A zero-height slot (a sheet that renders into the overlay host, an empty conditional) takes no space or gap.
    if (panel.height <= 0) {
      current.panelIds.push(panel.id);
      continue;
    }
    const occupied = current.panelIds.length > 0 && used > 0;
    const need = occupied ? used + gap + panel.height : panel.height;
    if (need <= limit() + EPSILON) {
      current.panelIds.push(panel.id);
      used = need;
      continue;
    }
    if (occupied) close();
    current.panelIds.push(panel.id);
    used = panel.height;
    if (panel.height > limit() + EPSILON) {
      current.oversize.push(panel.id);
      close();
    }
  }
  close();
  if (!screens.length) screens.push({ panelIds: [], oversize: [] });
  return { screens, firstAvailable, nextAvailable };
}

/** Screen index after re-pagination: keep the screen that holds the panel the person was looking at. */
export function clampScreen(previous: PaginationResult | null, next: PaginationResult, index: number): number {
  if (!previous) return Math.min(index, next.screens.length - 1);
  const anchor = previous.screens[index]?.panelIds[0];
  if (anchor) {
    const found = next.screens.findIndex((s) => s.panelIds.includes(anchor));
    if (found >= 0) return found;
  }
  return Math.max(0, Math.min(index, next.screens.length - 1));
}
