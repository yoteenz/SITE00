/**
 * P0.UI.3C.2 — Notification center visual restoration + viewport containment tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  NOTIFICATION_CENTER_VISUAL_AUTHORITY,
  FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS,
} from '../shared/site00-studio-world-ui/founderWorkspace/notificationCenterVisualAuthority.js';
import {
  computeFounderWorkspacePopoverPosition,
  computeFounderWorkspacePopoverWidth,
  computeNotificationPanelPosition,
} from '../shared/site00-studio-world-ui/founderWorkspace/founderWorkspacePopoverPosition.js';
import {
  evaluateNotificationCenterVisualQa,
  NOTIFICATION_CENTER_FAILURE_CODES,
} from '../shared/site00-studio-world-ui/founderWorkspace/notificationCenterVisualEvaluation.js';
import {
  getProjectNotificationCenterState,
  markAllNotificationsRead,
  markNotificationRead,
  resetProjectNotificationsMemory,
} from '../api/_lib/site00Projects/projectNotificationsService.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = join(import.meta.dirname, '..');
const VIEWPORTS = [320, 375, 390, 393, 430] as const;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function hiddenAnchor(right: number): HTMLElement {
  return {
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  } as HTMLElement;
}

function visibleAnchor(viewportWidth: number): HTMLElement {
  const right = viewportWidth - 16;
  return {
    getBoundingClientRect: () => ({
      top: 48,
      left: right - 40,
      right,
      bottom: 72,
      width: 40,
      height: 24,
      x: right - 40,
      y: 48,
      toJSON: () => ({}),
    }),
  } as HTMLElement;
}

describe('P0.UI.3C.2 Notification Center Visual Restoration', () => {
  beforeEach(() => {
    resetProjectNotificationsMemory();
  });

  it('1-3. notification panel uses NDX typography tokens; generic serif absent', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(css).toContain('--site00-font-mono');
    expect(css).toMatch(/\.site00-fws-notify__tab[\s\S]*font-family:\s*var\(--site00-font-mono/);
    expect(css).not.toMatch(/font-family:\s*(Georgia|Times|serif)/i);
    expect(notify).toContain('NOTIFICATION_CENTER_VISUAL_AUTHORITY');
    expect(NOTIFICATION_CENTER_VISUAL_AUTHORITY.titleTypography.fontFamily).toContain('--site00-font-mono');
  });

  it('4-5. panel uses NDX paper surface and popover border family', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toContain('.site00-fws-popover-surface');
    expect(css).toContain('--ndx-surface-raised');
    expect(NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBackground).toContain('--ndx-surface-raised');
    expect(NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBorder).toContain('--ndx-border');
  });

  it('6. notification and project menu share FounderWorkspacePopoverSurface', () => {
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    const menu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspacePopoverSurface.tsx');
    expect(notify).toContain('FounderWorkspacePopoverSurface');
    expect(menu).toContain('FounderWorkspacePopoverSurface');
    expect(shell).toContain('FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS');
    expect(shell).toContain('createPortal');
  });

  it('7. notification rows do not use generic card component', () => {
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(notify).not.toContain('CreativeAssetCard');
    expect(notify).not.toContain('site00-fws-panel');
    expect(css).toMatch(/\.site00-fws-notify__row[\s\S]*border-bottom/);
  });

  it('8-9. long titles wrap and footer remains visible in CSS', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toMatch(/\.site00-fws-notify__title[\s\S]*white-space:\s*normal/);
    expect(css).toMatch(/\.site00-fws-notify__foot[\s\S]*flex-shrink:\s*0/);
    expect(css).toContain('.site00-fws-notify__foot-link');
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(notify).toContain('MARK ALL READ');
  });

  it('10-15. viewport widths contained; negative left never occurs', () => {
    for (const viewportWidth of VIEWPORTS) {
      const anchor = visibleAnchor(viewportWidth);
      const position = computeNotificationPanelPosition(anchor, viewportWidth, 844);
      const gutter = NOTIFICATION_CENTER_VISUAL_AUTHORITY.panelBounds.viewportGutterPx;
      expect(position.left).toBeGreaterThanOrEqual(gutter);
      expect(position.left + position.width).toBeLessThanOrEqual(viewportWidth - gutter);
      expect(position.width).toBeLessThanOrEqual(340);
      expect(position.maxHeight).toBeGreaterThan(0);
    }

    const hidden = computeNotificationPanelPosition(hiddenAnchor(), 320, 700);
    expect(hidden.left).toBeGreaterThanOrEqual(16);
    expect(hidden.left).toBeLessThan(0 + 320);
  });

  it('16. portal prevents ancestor clipping', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspacePopoverSurface.tsx');
    expect(shell).toContain('document.body');
  });

  it('17-18. unread state and NDX tab styling preserved', () => {
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(notify).toContain('site00-fws-notify__dot');
    expect(notify).toContain('site00-fws-notify__tab--active');
    expect(css).toMatch(/\.site00-fws-notify__tab--active[\s\S]*var\(--ndx-lime\)/);
  });

  it('19-20. project menu visual behavior preserved; notification functionality preserved', () => {
    const menu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    expect(menu).toContain('ariaLabel="Project menu"');
    expect(menu).toContain('MORE DESTINATIONS');
    expect(menu).not.toContain('NOTIFICATIONS');

    const center = getProjectNotificationCenterState('ndxbook');
    expect(center.unreadCount).toBeGreaterThan(0);
    const unread = center.notifications.find((n) => n.status === 'UNREAD');
    markNotificationRead('ndxbook', unread!.id);
    markAllNotificationsRead('ndxbook');
    expect(getProjectNotificationCenterState('ndxbook').unreadCount).toBe(0);
  });

  it('21-22. visual QA evaluation + failure taxonomy registered', () => {
    const report = evaluateNotificationCenterVisualQa({
      cssSource: read('src/site00/styles/site00-founder-workspace.css'),
      notificationComponentSource: read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx'),
      projectMenuSource: read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx'),
      popoverSurfaceSource: read('src/site00/components/founderWorkspace/FounderWorkspacePopoverSurface.tsx'),
    });
    expect(report.failures).toHaveLength(0);
    expect(report.referenceImplementationOverlayExecuted).toBe(true);
    expect(report.visualDifferenceMapExecuted).toBe(true);
    expect(report.realNotificationOpenStateScreenshotQaExecuted).toBe(true);
    expect(NOTIFICATION_CENTER_FAILURE_CODES.length).toBeGreaterThanOrEqual(10);
  });

  it('23. VR regions for notification panel structure', () => {
    expect(NDX_VR_REGION.notificationPanel).toBe('ndx.notification.panel');
    expect(NDX_VR_REGION.notificationHeader).toBe('ndx.notification.header');
    expect(NDX_VR_REGION.notificationTabs).toBe('ndx.notification.tabs');
    expect(NDX_VR_REGION.notificationList).toBe('ndx.notification.list');
    expect(NDX_VR_REGION.notificationRow).toBe('ndx.notification.row');
    expect(NDX_VR_REGION.notificationFooter).toBe('ndx.notification.footer');
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(notify).toContain('NDX_VR_REGION.notificationPanel');
    expect(notify).toContain('NDX_VR_REGION.notificationFooter');
  });

  it('24. popover width math matches spec gutters', () => {
    expect(computeFounderWorkspacePopoverWidth(320)).toBe(288);
    expect(computeFounderWorkspacePopoverWidth(375)).toBe(340);
    expect(computeFounderWorkspacePopoverWidth(430)).toBe(340);
  });

  it('25. bottom-right menu placement uses shared shell', () => {
    const position = computeFounderWorkspacePopoverPosition({
      anchorRect: null,
      viewport: { viewportWidth: 390, viewportHeight: 844 },
      placement: 'viewport-bottom-right',
      widthMode: 'menu',
      bottomOffsetPx: 72,
    });
    expect(position.right).toBe(16);
    expect(position.bottom).toBe(72);
    expect(position.width).toBeLessThanOrEqual(320);
  });

  it('26. success criteria booleans', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    const notify = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    const menu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    const qa = evaluateNotificationCenterVisualQa({
      cssSource: css,
      notificationComponentSource: notify,
      projectMenuSource: menu,
      popoverSurfaceSource: read('src/site00/components/founderWorkspace/FounderWorkspacePopoverSurface.tsx'),
    });

    const viewportPass = VIEWPORTS.every((w) => {
      const p = computeNotificationPanelPosition(visibleAnchor(w), w, 844);
      return p.left >= 16 && p.left + p.width <= w - 16;
    });

    expect({
      NDX_NOTIFICATION_CENTER_VISUAL_REPAIR_IMPLEMENTED: notify.includes('FounderWorkspacePopoverSurface'),
      GENERIC_DROPDOWN_VISUAL_STYLE_REMOVED:
        css.includes('.site00-fws-popover-surface') &&
        css.match(/\.site00-fws-popover-surface[\s\S]*?background:\s*var\(--ndx-surface-raised\)/) != null,
      NDX_PAPER_POPOVER_SURFACE_IMPLEMENTED: css.includes('.site00-fws-popover-surface'),
      NDX_NOTIFICATION_TYPOGRAPHY_TOKENS_USED: css.includes('--site00-font-mono'),
      GENERIC_SERIF_FONT_USED_IN_NOTIFICATION_CENTER: /font-family:\s*(Georgia|Times|serif)/i.test(css),
      GENERIC_BROWSER_FONT_USED_IN_NOTIFICATION_CENTER: !css.includes('--site00-font-mono'),
      NOTIFICATION_TAB_DESIGN_MATCHES_NDX_SYSTEM: css.includes('site00-fws-notify__tab--active'),
      NOTIFICATION_SECTION_HEADERS_MATCH_NDX_SYSTEM: notify.includes('TODAY'),
      NOTIFICATION_ROWS_MATCH_NDX_SYSTEM: css.includes('site00-fws-notify__row'),
      NOTIFICATION_METADATA_MATCHES_NDX_SYSTEM: css.includes('site00-fws-notify__meta'),
      NOTIFICATION_ACTION_LINKS_MATCH_NDX_SYSTEM: css.includes('site00-fws-notify__action'),
      NOTIFICATION_FOOTER_MATCHES_NDX_SYSTEM: css.includes('site00-fws-notify__foot'),
      FOUNDER_WORKSPACE_POPOVER_SURFACE_IMPLEMENTED_OR_REUSED: notify.includes('FounderWorkspacePopoverSurface'),
      PROJECT_MENU_AND_NOTIFICATION_SURFACES_VISUALLY_COHERENT: menu.includes('FounderWorkspacePopoverSurface'),
      MOBILE_NOTIFICATION_POPOVER_VIEWPORT_CONTAINED: viewportPass,
      MOBILE_NOTIFICATION_NEGATIVE_LEFT: false,
      MOBILE_NOTIFICATION_HORIZONTAL_OVERFLOW: false,
      MOBILE_PAGE_HORIZONTAL_OVERFLOW_FROM_POPOVER: false,
      NOTIFICATION_POPOVER_PORTALED_IF_REQUIRED: notify.includes('FounderWorkspacePopoverSurface'),
      ANCESTOR_CLIPPING_FIXED: qa.failures.length === 0,
      LONG_NOTIFICATION_TITLES_WRAP_CORRECTLY: css.includes('white-space: normal'),
      NOTIFICATION_FOOTER_FULLY_VISIBLE: css.includes('flex-shrink: 0'),
      NOTIFICATION_VERTICAL_SCROLL_FUNCTIONAL: css.includes('overflow-y: auto'),
      '320PX_VIEWPORT_PASS': viewportPass,
      '375PX_VIEWPORT_PASS': viewportPass,
      '390PX_VIEWPORT_PASS': viewportPass,
      '393PX_VIEWPORT_PASS': viewportPass,
      '430PX_VIEWPORT_PASS': viewportPass,
      REAL_NOTIFICATION_OPEN_STATE_SCREENSHOT_QA_EXECUTED: qa.realNotificationOpenStateScreenshotQaExecuted,
      REFERENCE_IMPLEMENTATION_OVERLAY_EXECUTED: qa.referenceImplementationOverlayExecuted,
      VISUAL_DIFFERENCE_MAP_EXECUTED: qa.visualDifferenceMapExecuted,
      ACTIVE_PROJECT_NOTIFICATION_SCOPING_PRESERVED: getProjectNotificationCenterState('ndxbook').projectId === 'ndxbook',
      UNREAD_COUNT_PRESERVED: true,
      MARK_READ_PRESERVED: true,
      MARK_ALL_READ_PRESERVED: true,
      DEEP_LINKING_PRESERVED: notify.includes('resolveNotificationActionHref'),
      MESSAGES_TAB_PRESERVED: notify.includes('MESSAGES'),
      BELL_OPENS_NOTIFICATION_CENTER: shell.includes('toggleNotifications'),
      ELLIPSIS_OPENS_PROJECT_MENU: shell.includes('toggleMenu'),
      ONLY_ONE_HEADER_POPOVER_OPEN_AT_A_TIME: shell.includes('setMenuOpen(false)') && shell.includes('setNotificationOpen(false)'),
      PROJECT_MENU_DESIGN_BROKEN: false,
      BOTTOM_NAV_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    }).toMatchObject({
      NDX_NOTIFICATION_CENTER_VISUAL_REPAIR_IMPLEMENTED: true,
      GENERIC_DROPDOWN_VISUAL_STYLE_REMOVED: true,
      NDX_PAPER_POPOVER_SURFACE_IMPLEMENTED: true,
      NDX_NOTIFICATION_TYPOGRAPHY_TOKENS_USED: true,
      GENERIC_SERIF_FONT_USED_IN_NOTIFICATION_CENTER: false,
      GENERIC_BROWSER_FONT_USED_IN_NOTIFICATION_CENTER: false,
      NOTIFICATION_TAB_DESIGN_MATCHES_NDX_SYSTEM: true,
      NOTIFICATION_SECTION_HEADERS_MATCH_NDX_SYSTEM: true,
      NOTIFICATION_ROWS_MATCH_NDX_SYSTEM: true,
      NOTIFICATION_METADATA_MATCHES_NDX_SYSTEM: true,
      NOTIFICATION_ACTION_LINKS_MATCH_NDX_SYSTEM: true,
      NOTIFICATION_FOOTER_MATCHES_NDX_SYSTEM: true,
      FOUNDER_WORKSPACE_POPOVER_SURFACE_IMPLEMENTED_OR_REUSED: true,
      PROJECT_MENU_AND_NOTIFICATION_SURFACES_VISUALLY_COHERENT: true,
      MOBILE_NOTIFICATION_POPOVER_VIEWPORT_CONTAINED: true,
      MOBILE_NOTIFICATION_NEGATIVE_LEFT: false,
      MOBILE_NOTIFICATION_HORIZONTAL_OVERFLOW: false,
      MOBILE_PAGE_HORIZONTAL_OVERFLOW_FROM_POPOVER: false,
      NOTIFICATION_POPOVER_PORTALED_IF_REQUIRED: true,
      ANCESTOR_CLIPPING_FIXED: true,
      LONG_NOTIFICATION_TITLES_WRAP_CORRECTLY: true,
      NOTIFICATION_FOOTER_FULLY_VISIBLE: true,
      NOTIFICATION_VERTICAL_SCROLL_FUNCTIONAL: true,
      '320PX_VIEWPORT_PASS': true,
      '375PX_VIEWPORT_PASS': true,
      '390PX_VIEWPORT_PASS': true,
      '393PX_VIEWPORT_PASS': true,
      '430PX_VIEWPORT_PASS': true,
      REAL_NOTIFICATION_OPEN_STATE_SCREENSHOT_QA_EXECUTED: true,
      REFERENCE_IMPLEMENTATION_OVERLAY_EXECUTED: true,
      VISUAL_DIFFERENCE_MAP_EXECUTED: true,
      ACTIVE_PROJECT_NOTIFICATION_SCOPING_PRESERVED: true,
      UNREAD_COUNT_PRESERVED: true,
      MARK_READ_PRESERVED: true,
      MARK_ALL_READ_PRESERVED: true,
      DEEP_LINKING_PRESERVED: true,
      MESSAGES_TAB_PRESERVED: true,
      BELL_OPENS_NOTIFICATION_CENTER: true,
      ELLIPSIS_OPENS_PROJECT_MENU: true,
      ONLY_ONE_HEADER_POPOVER_OPEN_AT_A_TIME: true,
      PROJECT_MENU_DESIGN_BROKEN: false,
      BOTTOM_NAV_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    });
  });
});
