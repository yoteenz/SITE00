/**
 * Resolve Playwright wait selectors for founder workspace capture.
 * Must match live DOM markers (data-visual-reconstruction / data-vr-region), not legacy region ids.
 */

export const CAPTURE_WAIT_SELECTORS_BY_SCREEN: Record<string, string> = {
  overview: '[data-visual-reconstruction="mobile-overview"]',
  'content-ops': '[data-visual-reconstruction="mobile-content-ops"]',
  'cultural-intelligence': '[data-visual-reconstruction="mobile-cultural-intelligence"]',
  'character-lab': '[data-visual-reconstruction="mobile-character-lab"]',
  'campaign-board': '[data-visual-reconstruction="mobile-campaign-board-v1d13"]',
  'experiment-01': '[data-visual-reconstruction="mobile-lab-experiment-01"]',
  'expression-engine': '[data-visual-reconstruction="mobile-expression-engine"]',
};

function normalizeRoutePath(route: string): string {
  return (route.split('?')[0] ?? route).replace(/\/+$/, '') || '/';
}

function resolveScreenIdFromRoute(path: string): string | null {
  const match = path.match(/^\/projects\/[^/]+(?:\/(.*))?$/);
  if (!match) return null;
  const tail = match[1] ?? '';
  if (!tail) return 'overview';
  if (tail === 'overview') return 'overview';
  if (tail.startsWith('cultural-intelligence')) return 'cultural-intelligence';
  if (tail.startsWith('character/')) return 'character-lab';
  if (tail.includes('content-operations/campaign-board')) return 'campaign-board';
  if (tail.includes('marketing-expression/experiment-01')) return 'experiment-01';
  if (tail.includes('content-operations/expression-engine')) return 'expression-engine';
  if (tail.startsWith('content-operations')) return 'content-ops';
  return null;
}

export function resolveCaptureWaitSelector(input: {
  route: string;
  screenId?: string | null;
  previewDeviceMode?: 'mobile' | 'desktop';
  selector?: string | null;
}): string | null {
  if (input.selector?.trim()) return input.selector.trim();

  const path = normalizeRoutePath(input.route);
  const screenId = input.screenId?.trim() || resolveScreenIdFromRoute(path);

  if (screenId && CAPTURE_WAIT_SELECTORS_BY_SCREEN[screenId]) {
    return CAPTURE_WAIT_SELECTORS_BY_SCREEN[screenId];
  }

  if (input.previewDeviceMode === 'mobile' && path.startsWith('/projects/')) {
    return '[data-vr-region]';
  }

  if (path.includes('/projects/')) {
    return '[data-vr-region]';
  }

  return input.selector ?? null;
}
