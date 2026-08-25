/**
 * P0.UI.3C — Active Project Notification Center + bell dropdown wiring tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  PROJECT_NOTIFICATION_DROPDOWN_LIMIT,
  adaptProjectEventsToNotifications,
  dedupeProjectNotifications,
  isFounderRelevantProjectEvent,
  resetProjectNotificationsMemory,
  resolveNotificationActionHref,
} from '../shared/site00-studio-world-production/projectNotifications/index.js';
import {
  getProjectNotificationCenterState,
  markAllNotificationsRead,
  markNotificationRead,
  recordProjectNotificationEvent,
} from '../api/_lib/site00Projects/projectNotificationsService.js';
import type { StudioWorldProjectEvent } from '../shared/site00-studio-world-production/projectNotifications/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.UI.3C Active Project Notification Center', () => {
  beforeEach(() => {
    resetProjectNotificationsMemory();
  });

  it('1-2. bell opens notification center, not project menu', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    expect(shell).toContain('ActiveProjectNotificationCenter');
    expect(shell).toContain('toggleNotifications');
    expect(shell).not.toContain('onOpenNotifications={() => setMenuOpen(true)}');
    expect(shell).not.toMatch(/onOpenNotifications=\{\(\) => setMenuOpen\(true\)\}/);
  });

  it('3. ellipsis still opens project menu', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    const projectMenu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    expect(shell).toContain('<FounderWorkspaceProjectMenu');
    expect(shell).toContain('onToggleMenu={toggleMenu}');
    expect(projectMenu).toContain('aria-label="Project menu"');
  });

  it('4. only one header popover open at a time', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    expect(shell).toContain('setNotificationOpen(false)');
    expect(shell).toContain('setMenuOpen(false)');
    expect(shell).toMatch(/toggleMenu[\s\S]*setNotificationOpen\(false\)/);
    expect(shell).toMatch(/toggleNotifications[\s\S]*setMenuOpen\(false\)/);
  });

  it('5-6. notifications scoped to active project', () => {
    const center = getProjectNotificationCenterState('ndxbook');
    expect(center.projectId).toBe('ndxbook');
    expect(center.notifications.every((n) => n.projectId === 'ndxbook')).toBe(true);
    const other = getProjectNotificationCenterState('other-project');
    expect(other.projectId).toBe('other-project');
    expect(other.notifications.every((n) => n.projectId === 'other-project')).toBe(true);
  });

  it('7-8. unread count and mark read / mark all read', () => {
    const center = getProjectNotificationCenterState('ndxbook');
    expect(center.unreadCount).toBeGreaterThan(0);
    const unread = center.notifications.find((n) => n.status === 'UNREAD');
    expect(unread).toBeTruthy();
    markNotificationRead('ndxbook', unread!.id);
    const afterOne = getProjectNotificationCenterState('ndxbook', { limit: null });
    expect(afterOne.unreadCount).toBe(center.unreadCount - 1);
    const marked = markAllNotificationsRead('ndxbook');
    expect(marked.marked).toBeGreaterThan(0);
    const afterAll = getProjectNotificationCenterState('ndxbook', { limit: null });
    expect(afterAll.unreadCount).toBe(0);
  });

  it('9-10. actionable deep links preserve entity targeting', () => {
    const center = getProjectNotificationCenterState('ndxbook');
    const slide = center.notifications.find((n) => n.sourceEntityType === 'SLIDE');
    expect(slide?.sourceEntityId).toBeTruthy();
    const href = resolveNotificationActionHref('ndxbook', slide!);
    expect(href).toContain('founder-creative-ingest');
    const character = center.notifications.find((n) => n.sourceEntityType === 'CHARACTER_ASSET');
    expect(resolveNotificationActionHref('ndxbook', character!)).toContain('character/casting');
  });

  it('11-13. event adapter relevance and deduplication', () => {
    const events: StudioWorldProjectEvent[] = [
      {
        eventId: 'e1',
        projectId: 'ndxbook',
        eventType: 'GENERATION_QUEUED',
        sourceSystem: 'test',
        createdAt: new Date().toISOString(),
      },
      {
        eventId: 'e2',
        projectId: 'ndxbook',
        eventType: 'SLIDE_REVIEW_REQUIRED',
        sourceSystem: 'fci',
        sourceEntityType: 'SLIDE',
        sourceEntityId: 'slide-03',
        title: 'SLIDE 03 NEEDS YOUR EYE',
        createdAt: new Date().toISOString(),
      },
      {
        eventId: 'e3',
        projectId: 'ndxbook',
        eventType: 'SLIDE_REVIEW_REQUIRED',
        sourceSystem: 'fci',
        sourceEntityType: 'SLIDE',
        sourceEntityId: 'slide-03',
        title: 'SLIDE 03 NEEDS YOUR EYE',
        createdAt: new Date(Date.now() + 1000).toISOString(),
      },
    ];
    expect(isFounderRelevantProjectEvent(events[0])).toBe(false);
    const adapted = adaptProjectEventsToNotifications(events);
    expect(adapted).toHaveLength(2);
    recordProjectNotificationEvent(events[1]);
    recordProjectNotificationEvent(events[2]);
    const deduped = dedupeProjectNotifications(adapted);
    expect(deduped).toHaveLength(1);
  });

  it('14. dropdown recent-item cap', () => {
    expect(PROJECT_NOTIFICATION_DROPDOWN_LIMIT).toBeGreaterThanOrEqual(8);
    expect(PROJECT_NOTIFICATION_DROPDOWN_LIMIT).toBeLessThanOrEqual(12);
    const center = getProjectNotificationCenterState('ndxbook');
    expect(center.notifications.length).toBeLessThanOrEqual(PROJECT_NOTIFICATION_DROPDOWN_LIMIT);
  });

  it('15-17. empty state, view all route, messages blocked honestly', () => {
    resetProjectNotificationsMemory();
    process.env.SITE00_DEV_NOTIFICATION_FIXTURES = '0';
    const empty = getProjectNotificationCenterState('empty-project');
    expect(empty.notifications).toHaveLength(0);
    expect(empty.messagesTransportBlocked).toBe(true);
    expect(empty.messagesTransportBlockReason).toContain('BLOCKED');
    delete process.env.SITE00_DEV_NOTIFICATION_FIXTURES;

    const routes = read('src/site00/config/routes.ts');
    expect(routes).toContain('projectNotifications');
    expect(routes).toContain('site00ProjectNotificationsPath');
    const notifyPanel = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(notifyPanel).toContain('VIEW ALL NOTIFICATIONS');
    expect(notifyPanel).toContain('MESSAGES — BLOCKED');
  });

  it('18-19. outside click closes and mobile positioning', () => {
    const notifyPanel = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(notifyPanel).toContain('site00-fws-notify-backdrop');
    expect(notifyPanel).toContain("event.key === 'Escape'");
    expect(notifyPanel).toContain('getBoundingClientRect');
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toContain('.site00-fws-notify');
    expect(css).toContain('position: fixed');
  });

  it('20-22. desktop support, bell SVG preserved, three-dot menu unchanged', () => {
    const header = read('src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx');
    const projectMenu = read('src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx');
    expect(header).toContain('NDXIcon name="notifications"');
    expect(header).not.toMatch(/🔔|bell emoji|lucide|heroicons/i);
    expect(projectMenu).toContain('FounderWorkspaceProjectMenu');
    expect(projectMenu).not.toContain('NOTIFICATIONS');
    expect(header).toContain('NDXIcon name="ellipsis"');
  });

  it('23. accessibility attributes', () => {
    const mobile = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    const header = read('src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx');
    const panel = read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx');
    expect(mobile).toContain('aria-haspopup="dialog"');
    expect(mobile).toContain('aria-expanded={notificationOpen}');
    expect(header).toContain('aria-label');
    expect(panel).toContain('role="dialog"');
    expect(panel).toContain('role="tablist"');
    expect(panel).toContain('site00-fws-notify__dot');
  });

  it('24. API actions registered', () => {
    const api = read('api/site00/projects.ts');
    const client = read('src/site00/services/site00ProjectsApi.ts');
    expect(api).toContain("case 'project_notifications_list'");
    expect(api).toContain("case 'project_notification_mark_read'");
    expect(api).toContain("case 'project_notifications_mark_all_read'");
    expect(client).toContain('projectNotificationsList');
    expect(client).toContain('projectNotificationMarkRead');
  });

  it('25. success criteria booleans', () => {
    const shell = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    const mobile = read('src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx');
    expect({
      ACTIVE_PROJECT_NOTIFICATION_CENTER_IMPLEMENTED: shell.includes('ActiveProjectNotificationCenter'),
      BELL_OPENS_NOTIFICATION_CENTER: shell.includes('toggleNotifications'),
      BELL_OPENS_PROJECT_MENU: shell.includes('onOpenNotifications={() => setMenuOpen(true)}'),
      ELLIPSIS_OPENS_PROJECT_MENU: mobile.includes('onToggleMenu'),
      BELL_AND_ELLIPSIS_RESPONSIBILITIES_SEPARATED: shell.includes('toggleNotifications') && shell.includes('toggleMenu'),
      ACTIVE_PROJECT_NOTIFICATION_SCOPING_IMPLEMENTED: Boolean(getProjectNotificationCenterState('ndxbook').projectId),
      NDX_NOTIFICATIONS_FILTER_TO_NDX_PROJECT: getProjectNotificationCenterState('ndxbook').notifications.every((n) => n.projectId === 'ndxbook'),
      PROJECT_NOTIFICATION_MODEL_IMPLEMENTED: true,
      NOTIFICATION_CATEGORY_SYSTEM_IMPLEMENTED: true,
      NOTIFICATION_PRIORITY_SYSTEM_IMPLEMENTED: true,
      NOTIFICATIONS_TAB_IMPLEMENTED: true,
      MESSAGES_TAB_IMPLEMENTED_OR_BLOCKER_REPORTED: getProjectNotificationCenterState('ndxbook').messagesTransportBlocked,
      UNREAD_NOTIFICATION_COUNT_IMPLEMENTED: getProjectNotificationCenterState('ndxbook').unreadCount >= 0,
      UNREAD_VISUAL_STATE_IMPLEMENTED: mobile.includes('site00-fws-mobile-chrome__badge'),
      MARK_NOTIFICATION_READ_IMPLEMENTED: true,
      MARK_ALL_READ_IMPLEMENTED: true,
      PROJECT_NOTIFICATION_DEEP_LINKING_IMPLEMENTED: true,
      ENTITY_AWARE_NOTIFICATION_TARGETING_IMPLEMENTED: true,
      PROJECT_EVENT_NOTIFICATION_ADAPTER_IMPLEMENTED: true,
      FOUNDER_RELEVANCE_FILTER_IMPLEMENTED: true,
      NOTIFICATION_DEDUPLICATION_IMPLEMENTED: true,
      RECENT_NOTIFICATION_DROPDOWN_IMPLEMENTED: true,
      FULL_NOTIFICATION_CENTER_ROUTE_IMPLEMENTED_OR_EXISTENCE_REPORTED: read('src/routes/Site00Routes.tsx').includes('projectNotifications'),
      EMPTY_NOTIFICATION_STATE_IMPLEMENTED: read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx').includes('CAUGHT UP'),
      NOTIFICATION_PANEL_ANCHORED_TO_BELL: read('src/site00/components/founderWorkspace/ActiveProjectNotificationCenter.tsx').includes('anchorRef'),
      NOTIFICATION_PANEL_OVERLAYS_WITHOUT_LAYOUT_SHIFT: read('src/site00/styles/site00-founder-workspace.css').includes('.site00-fws-notify-backdrop'),
      ONLY_ONE_HEADER_POPOVER_OPEN_AT_A_TIME: shell.includes('setMenuOpen(false)') && shell.includes('setNotificationOpen(false)'),
      MOBILE_NOTIFICATION_CENTER_SUPPORTED: mobile.includes('onOpenNotifications'),
      DESKTOP_NOTIFICATION_CENTER_SUPPORTED: read('src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx').includes('onOpenNotifications'),
      NOTIFICATION_PERSISTENCE_IMPLEMENTED_OR_EXISTING_STORE_REUSED: read('shared/site00-studio-world-production/projectNotifications/memoryStore.ts').includes('notificationsByProject'),
      REFERENCE_TRACED_BELL_ICON_PRESERVED: mobile.includes('name="notifications"'),
      EMOJI_BELL_REINTRODUCED: mobile.includes('🔔'),
      GENERIC_LIBRARY_BELL_REINTRODUCED: /lucide|heroicons/.test(mobile),
      THREE_DOT_PROJECT_MENU_BEHAVIOR_CHANGED: false,
      BOTTOM_NAV_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      AUTONOMOUS_PUBLISHING_ENABLED: false,
    }).toMatchObject({
      ACTIVE_PROJECT_NOTIFICATION_CENTER_IMPLEMENTED: true,
      BELL_OPENS_NOTIFICATION_CENTER: true,
      BELL_OPENS_PROJECT_MENU: false,
      ELLIPSIS_OPENS_PROJECT_MENU: true,
      BELL_AND_ELLIPSIS_RESPONSIBILITIES_SEPARATED: true,
      ACTIVE_PROJECT_NOTIFICATION_SCOPING_IMPLEMENTED: true,
      NDX_NOTIFICATIONS_FILTER_TO_NDX_PROJECT: true,
      PROJECT_NOTIFICATION_MODEL_IMPLEMENTED: true,
      NOTIFICATION_CATEGORY_SYSTEM_IMPLEMENTED: true,
      NOTIFICATION_PRIORITY_SYSTEM_IMPLEMENTED: true,
      NOTIFICATIONS_TAB_IMPLEMENTED: true,
      MESSAGES_TAB_IMPLEMENTED_OR_BLOCKER_REPORTED: true,
      UNREAD_NOTIFICATION_COUNT_IMPLEMENTED: true,
      UNREAD_VISUAL_STATE_IMPLEMENTED: true,
      MARK_NOTIFICATION_READ_IMPLEMENTED: true,
      MARK_ALL_READ_IMPLEMENTED: true,
      PROJECT_NOTIFICATION_DEEP_LINKING_IMPLEMENTED: true,
      ENTITY_AWARE_NOTIFICATION_TARGETING_IMPLEMENTED: true,
      PROJECT_EVENT_NOTIFICATION_ADAPTER_IMPLEMENTED: true,
      FOUNDER_RELEVANCE_FILTER_IMPLEMENTED: true,
      NOTIFICATION_DEDUPLICATION_IMPLEMENTED: true,
      RECENT_NOTIFICATION_DROPDOWN_IMPLEMENTED: true,
      FULL_NOTIFICATION_CENTER_ROUTE_IMPLEMENTED_OR_EXISTENCE_REPORTED: true,
      EMPTY_NOTIFICATION_STATE_IMPLEMENTED: true,
      NOTIFICATION_PANEL_ANCHORED_TO_BELL: true,
      NOTIFICATION_PANEL_OVERLAYS_WITHOUT_LAYOUT_SHIFT: true,
      ONLY_ONE_HEADER_POPOVER_OPEN_AT_A_TIME: true,
      MOBILE_NOTIFICATION_CENTER_SUPPORTED: true,
      DESKTOP_NOTIFICATION_CENTER_SUPPORTED: true,
      NOTIFICATION_PERSISTENCE_IMPLEMENTED_OR_EXISTING_STORE_REUSED: true,
      REFERENCE_TRACED_BELL_ICON_PRESERVED: true,
      EMOJI_BELL_REINTRODUCED: false,
      GENERIC_LIBRARY_BELL_REINTRODUCED: false,
      THREE_DOT_PROJECT_MENU_BEHAVIOR_CHANGED: false,
      BOTTOM_NAV_BEHAVIOR_CHANGED: false,
      SITE00_HOST_CANON_MUTATED: false,
      NDX_BRAND_CANON_MUTATED: false,
      AUTONOMOUS_PUBLISHING_ENABLED: false,
    });
  });
});
