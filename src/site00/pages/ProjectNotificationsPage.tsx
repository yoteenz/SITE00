import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell, FounderWorkspacePanel, FounderEmptyState } from '../components/founderWorkspace/FounderWorkspaceShell';
import { useActiveProjectNotifications } from '../hooks/useActiveProjectNotifications';
import { resolveNotificationActionHref } from '../../../shared/site00-studio-world-production/projectNotifications/deepLinks.js';
import {
  formatNotificationRelativeTime,
  notificationActionLabel,
} from '../../../shared/site00-studio-world-production/projectNotifications/format.js';
import type { ProjectNotificationCategory } from '../../../shared/site00-studio-world-production/projectNotifications/types.js';
import { ndxFounderWorkspaceEnabled } from '../config/ndxFounderWorkspace';
import '../styles/site00-founder-workspace.css';

type FilterId = 'ALL' | 'UNREAD' | 'REVIEW' | 'SYSTEM' | 'MESSAGES';

const REVIEW_CATEGORIES = new Set<ProjectNotificationCategory>([
  'REVIEW_REQUIRED',
  'APPROVAL_REQUIRED',
  'FOUNDER_JUDGMENT_REQUIRED',
]);

const SYSTEM_CATEGORIES = new Set<ProjectNotificationCategory>([
  'SYSTEM_MESSAGE',
  'DEPLOYMENT_OR_PIPELINE_ALERT',
  'PERFORMANCE_SIGNAL',
]);

export default function ProjectNotificationsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const enabled = ndxFounderWorkspaceEnabled(projectSlug);
  const { state, loading, refreshAll, markRead, markAllRead } = useActiveProjectNotifications(projectSlug, {
    enabled,
    variant: 'full',
  });
  const [filter, setFilter] = useState<FilterId>('ALL');

  const filtered = useMemo(() => {
    const all = state.notifications;
    switch (filter) {
      case 'UNREAD':
        return all.filter((n) => n.status === 'UNREAD');
      case 'REVIEW':
        return all.filter((n) => REVIEW_CATEGORIES.has(n.category));
      case 'SYSTEM':
        return all.filter((n) => SYSTEM_CATEGORIES.has(n.category));
      case 'MESSAGES':
        return [];
      default:
        return all;
    }
  }, [filter, state.notifications]);

  const reload = useCallback(() => {
    void refreshAll();
  }, [refreshAll]);

  if (!enabled) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Notifications are available inside Studio World founder workspaces.</p>
      </EcosystemShell>
    );
  }

  const projectLabel = projectSlug.toUpperCase();

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="NOTIFICATIONS"
        subtitle={`${projectLabel} · ACTIVE PROJECT NOTIFICATION CENTER`}
        attentionBadge={state.unreadCount > 0 ? `${state.unreadCount} UNREAD` : undefined}
        operate={
          loading ? (
            <p>Loading notifications…</p>
          ) : (
            <>
              <div className="site00-fws-notify-page__filters" role="tablist" aria-label="Notification filters">
                {(['ALL', 'UNREAD', 'REVIEW', 'SYSTEM', 'MESSAGES'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={filter === id}
                    className={`site00-fws-notify-page__filter${filter === id ? ' site00-fws-notify-page__filter--active' : ''}`}
                    onClick={() => setFilter(id)}
                  >
                    {id}
                  </button>
                ))}
              </div>

              {filter === 'MESSAGES' ? (
                <FounderEmptyState
                  title="MESSAGES — BLOCKED"
                  body={
                    state.messagesTransportBlockReason ??
                    'Live project message transport is not wired yet. Notifications are active; messaging remains future-wired.'
                  }
                />
              ) : filtered.length === 0 ? (
                <FounderEmptyState title="YOU'RE CAUGHT UP." body="No notifications match this filter." />
              ) : (
                <FounderWorkspacePanel title={`${projectLabel} · ${filter}`}>
                  <ul className="site00-fws-notify-page__list">
                    {filtered.map((item) => {
                      const href = item.actionTarget ?? resolveNotificationActionHref(item.projectId, item);
                      const unread = item.status === 'UNREAD';
                      return (
                        <li key={item.id} className={`site00-fws-notify-page__item${unread ? ' site00-fws-notify-page__item--unread' : ''}`}>
                          <div className="site00-fws-notify-page__item-head">
                            {unread ? <span className="site00-fws-notify__dot" aria-hidden="true" /> : null}
                            <strong>{item.title}</strong>
                            <span className="site00-fws-notify-page__time">{formatNotificationRelativeTime(item.createdAt)}</span>
                          </div>
                          <p className="site00-fws-notify-page__message">{item.message}</p>
                          <div className="site00-fws-notify-page__actions">
                            {href && item.actionType !== 'NONE' ? (
                              <Link
                                to={href}
                                className="site00-fws-notify-page__link"
                                onClick={() => {
                                  if (unread) void markRead(item.id);
                                }}
                              >
                                {notificationActionLabel(item)}
                              </Link>
                            ) : null}
                            {unread ? (
                              <button type="button" className="site00-fws-notify-page__mark" onClick={() => void markRead(item.id)}>
                                MARK READ
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </FounderWorkspacePanel>
              )}

              <div className="site00-fws-notify-page__toolbar">
                {state.unreadCount > 0 ? (
                  <button type="button" className="site00-fws-notify-page__toolbar-btn" onClick={() => void markAllRead()}>
                    MARK ALL READ
                  </button>
                ) : null}
                <button type="button" className="site00-fws-notify-page__toolbar-btn" onClick={reload}>
                  REFRESH
                </button>
              </div>
            </>
          )
        }
      />
    </EcosystemShell>
  );
}
