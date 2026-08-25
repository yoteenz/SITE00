import { useMemo, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectNotification } from '../../../../shared/site00-studio-world-production/projectNotifications/types.js';
import {
  formatNotificationRelativeTime,
  groupNotificationsByRecency,
  notificationActionLabel,
} from '../../../../shared/site00-studio-world-production/projectNotifications/format.js';
import { entityTypeLabel, resolveNotificationActionHref } from '../../../../shared/site00-studio-world-production/projectNotifications/deepLinks.js';
import { NOTIFICATION_CENTER_VISUAL_AUTHORITY } from '../../../../shared/site00-studio-world-ui/founderWorkspace/notificationCenterVisualAuthority.js';
import { site00ProjectNotificationsPath } from '../../config/routes';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';
import { FounderWorkspacePopoverSurface } from './FounderWorkspacePopoverSurface';

type TabId = 'notifications' | 'messages';

type ActiveProjectNotificationCenterProps = {
  open: boolean;
  onClose: () => void;
  projectSlug: string;
  projectLabel?: string;
  anchorRef?: RefObject<HTMLElement | null>;
  notifications: ProjectNotification[];
  unreadCount: number;
  messagesTransportBlocked: boolean;
  messagesTransportBlockReason: string | null;
  loading?: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

function NotificationRow({
  item,
  onNavigate,
  onMarkRead,
}: {
  item: ProjectNotification;
  onNavigate: () => void;
  onMarkRead: (id: string) => void;
}) {
  const href = item.actionTarget ?? resolveNotificationActionHref(item.projectId, item);
  const unread = item.status === 'UNREAD';
  const actionLabel = notificationActionLabel(item);

  const body = (
    <>
      <div className="site00-fws-notify__row-head">
        {unread ? <span className="site00-fws-notify__dot" aria-hidden="true" /> : null}
        <strong className={`site00-fws-notify__title${unread ? ' site00-fws-notify__title--unread' : ''}`}>{item.title}</strong>
      </div>
      <p className="site00-fws-notify__meta">
        {entityTypeLabel(item.sourceEntityType)} · {formatNotificationRelativeTime(item.createdAt)}
      </p>
      {href && item.actionType !== 'NONE' ? (
        <span className="site00-fws-notify__action">{actionLabel}</span>
      ) : null}
    </>
  );

  if (href && item.actionType !== 'NONE') {
    return (
      <Link
        to={href}
        className={`site00-fws-notify__row${unread ? ' site00-fws-notify__row--unread' : ''}`}
        {...vrRegionAttr(NDX_VR_REGION.notificationRow)}
        onClick={() => {
          if (unread) onMarkRead(item.id);
          onNavigate();
        }}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`site00-fws-notify__row site00-fws-notify__row--static${unread ? ' site00-fws-notify__row--unread' : ''}`}
      {...vrRegionAttr(NDX_VR_REGION.notificationRow)}
      onClick={() => {
        if (unread) onMarkRead(item.id);
      }}
    >
      {body}
    </button>
  );
}

export function ActiveProjectNotificationCenter({
  open,
  onClose,
  projectSlug,
  projectLabel = 'NDXBOOK',
  anchorRef,
  notifications,
  unreadCount,
  messagesTransportBlocked,
  messagesTransportBlockReason,
  loading = false,
  onMarkRead,
  onMarkAllRead,
}: ActiveProjectNotificationCenterProps) {
  const [tab, setTab] = useState<TabId>('notifications');
  const grouped = useMemo(() => groupNotificationsByRecency(notifications), [notifications]);
  const caughtUp = notifications.length === 0 && !loading;
  const visualAuthority = NOTIFICATION_CENTER_VISUAL_AUTHORITY;

  return (
    <FounderWorkspacePopoverSurface
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      placement="anchor-below-viewport-right"
      widthMode="notification"
      ariaRole="dialog"
      ariaLabel={`${projectLabel} notifications`}
      className="site00-fws-notify"
      backdropClassName="site00-fws-notify-backdrop"
      vrRegion={NDX_VR_REGION.notificationPanel}
    >
      <header className="site00-fws-notify__head" {...vrRegionAttr(NDX_VR_REGION.notificationHeader)}>
        <span className="site00-fws-notify__project">{projectLabel}</span>
        <div className="site00-fws-notify__tabs" role="tablist" aria-label="Notification center views" {...vrRegionAttr(NDX_VR_REGION.notificationTabs)}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'notifications'}
            className={`site00-fws-notify__tab${tab === 'notifications' ? ' site00-fws-notify__tab--active' : ''}`}
            onClick={() => setTab('notifications')}
          >
            NOTIFICATIONS{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'messages'}
            className={`site00-fws-notify__tab${tab === 'messages' ? ' site00-fws-notify__tab--active' : ''}`}
            onClick={() => setTab('messages')}
          >
            MESSAGES
          </button>
        </div>
      </header>

      {tab === 'notifications' ? (
        <div className="site00-fws-notify__body" role="tabpanel" {...vrRegionAttr(NDX_VR_REGION.notificationList)}>
          {loading ? <p className="site00-fws-notify__status">LOADING…</p> : null}
          {caughtUp ? (
            <p className="site00-fws-notify__empty">YOU&apos;RE CAUGHT UP.</p>
          ) : (
            <>
              {grouped.today.length > 0 ? (
                <section className="site00-fws-notify__section">
                  <h3 className="site00-fws-notify__section-label">TODAY</h3>
                  {grouped.today.map((item) => (
                    <NotificationRow key={item.id} item={item} onNavigate={onClose} onMarkRead={onMarkRead} />
                  ))}
                </section>
              ) : null}
              {grouped.earlier.length > 0 ? (
                <section className="site00-fws-notify__section">
                  <h3 className="site00-fws-notify__section-label">EARLIER</h3>
                  {grouped.earlier.map((item) => (
                    <NotificationRow key={item.id} item={item} onNavigate={onClose} onMarkRead={onMarkRead} />
                  ))}
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="site00-fws-notify__body" role="tabpanel" {...vrRegionAttr(NDX_VR_REGION.notificationList)}>
          <div className="site00-fws-notify__messages-empty">
            <p className="site00-fws-notify__empty">NO PROJECT MESSAGES YET.</p>
            {messagesTransportBlocked ? (
              <p className="site00-fws-notify__messages-note">
                {messagesTransportBlockReason ??
                  'Live project message transport is not wired yet. UI is ready; delivery remains future-wired.'}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <footer className="site00-fws-notify__foot" {...vrRegionAttr(NDX_VR_REGION.notificationFooter)}>
        {tab === 'notifications' && unreadCount > 0 ? (
          <button type="button" className="site00-fws-notify__foot-btn" onClick={() => void onMarkAllRead()}>
            MARK ALL READ
          </button>
        ) : null}
        <Link to={site00ProjectNotificationsPath(projectSlug)} className="site00-fws-notify__foot-link" onClick={onClose}>
          VIEW ALL NOTIFICATIONS
        </Link>
      </footer>
      <span hidden data-visual-authority-id={visualAuthority.referenceAssetId} />
    </FounderWorkspacePopoverSurface>
  );
}
