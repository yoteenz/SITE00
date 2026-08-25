import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';

type FounderWorkspaceHeaderChromeProps = {
  onOpenMenu: () => void;
  onOpenNotifications?: () => void;
};

export function FounderWorkspaceHeaderChrome({ onOpenMenu, onOpenNotifications }: FounderWorkspaceHeaderChromeProps) {
  return (
    <div className="site00-fws-header-chrome">
      <button
        type="button"
        className="site00-fws-header-chrome__btn"
        aria-label="Notifications"
        onClick={onOpenNotifications}
      >
        <NDXIcon name="notifications" size={NDX_ICON_CONTEXT_SIZE.header} state="inactive" decorative />
      </button>
      <button type="button" className="site00-fws-header-chrome__btn" aria-label="Open project menu" onClick={onOpenMenu}>
        <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} state="inactive" decorative />
      </button>
    </div>
  );
}
