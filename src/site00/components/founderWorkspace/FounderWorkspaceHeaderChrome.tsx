import type { Ref } from 'react';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';

type FounderWorkspaceHeaderChromeProps = {
  onOpenMenu: () => void;
  onOpenNotifications?: () => void;
  bellButtonRef?: Ref<HTMLButtonElement>;
  notificationOpen?: boolean;
  unreadCount?: number;
};

export function FounderWorkspaceHeaderChrome({
  onOpenMenu,
  onOpenNotifications,
  bellButtonRef,
  notificationOpen = false,
  unreadCount = 0,
}: FounderWorkspaceHeaderChromeProps) {
  const bellState = notificationOpen ? 'active' : unreadCount > 0 ? 'active' : 'inactive';

  return (
    <div className="site00-fws-header-chrome">
      <button
        ref={bellButtonRef}
        type="button"
        className={`site00-fws-header-chrome__btn site00-fws-header-chrome__btn--bell${notificationOpen ? ' site00-fws-header-chrome__btn--bell-open' : ''}${unreadCount > 0 ? ' site00-fws-header-chrome__btn--bell-unread' : ''}`}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={notificationOpen}
        onClick={onOpenNotifications}
      >
        <NDXIcon name="notifications" size={NDX_ICON_CONTEXT_SIZE.header} state={bellState} decorative />
        {unreadCount > 0 ? (
          <span className="site00-fws-header-chrome__badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
      <button type="button" className="site00-fws-header-chrome__btn" aria-label="Open project menu" aria-haspopup="menu" onClick={onOpenMenu}>
        <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} state="inactive" decorative />
      </button>
    </div>
  );
}
