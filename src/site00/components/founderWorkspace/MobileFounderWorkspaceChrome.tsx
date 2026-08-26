/**
 * P0.VR.1D.A / P0.VR.1D.3 + P0.UI.3 + P0.VR.1D.9 — Mobile founder workspace chrome.
 * Sticky header + bottom nav; reference-driven visual shell variants per route.
 */

import type { CSSProperties, Ref } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  mobileVisualShellSpecToCssVars,
  resolveMobileVisualShellSpec as resolveCampaignLabVisualShellSpec,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr1d9/client.js';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../../config/ndxFounderWorkspaceMobileNav';
import type { MobileScreenVisualShellSpec as NdxMobileVisualShellSpec } from '../../config/ndxMobileVisualShellSpecs';
import {
  mobileVisualShellStyle,
  resolveMobileVisualShellSpec as resolveNdxMobileVisualShellSpec,
} from '../../config/ndxMobileVisualShellSpecs';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import { NDXIcon } from '../../icons/ndx';
import { Site00Diamond } from '../shell/Site00Diamond';
import { CURRENT_VISUAL_SHELL_VERSION } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr1d12/client.js';
import '../../styles/site00-founder-workspace.css';

type Props = {
  projectSlug: string;
  children: React.ReactNode;
  visualSpec?: NdxMobileVisualShellSpec | null;
  menuOpen?: boolean;
  notificationOpen?: boolean;
  unreadCount?: number;
  bellButtonRef?: Ref<HTMLButtonElement>;
  onToggleMenu?: () => void;
  onOpenNotifications?: () => void;
};

function resolveHeaderShellRegion(screenId: string): string {
  if (screenId === 'campaign-board') return NDX_VR_REGION.campaignHeaderShell;
  if (screenId === 'experiment-01') return NDX_VR_REGION.labHeaderShell;
  if (screenId === 'overview') return NDX_VR_REGION.overviewHeaderShell;
  if (screenId === 'content-ops') return NDX_VR_REGION.contentOpsHeaderShell;
  if (screenId === 'cultural-intelligence') return NDX_VR_REGION.intelligenceHeaderShell;
  if (screenId === 'character-lab') return NDX_VR_REGION.characterHeaderShell;
  return NDX_VR_REGION.header;
}

function resolveBottomNavShellRegion(screenId: string): string {
  if (screenId === 'campaign-board') return NDX_VR_REGION.campaignBottomNavShell;
  if (screenId === 'experiment-01') return NDX_VR_REGION.labBottomNavShell;
  if (screenId === 'overview') return NDX_VR_REGION.overviewBottomNavShell;
  if (screenId === 'content-ops') return NDX_VR_REGION.contentOpsBottomNavShell;
  if (screenId === 'cultural-intelligence') return NDX_VR_REGION.intelligenceBottomNavShell;
  if (screenId === 'character-lab') return NDX_VR_REGION.characterBottomNavShell;
  return NDX_VR_REGION.bottomNav;
}

function resolveScreenRegion(screenId: string): string | null {
  if (screenId === 'campaign-board') return NDX_VR_REGION.campaignScreen;
  if (screenId === 'experiment-01') return NDX_VR_REGION.labScreen;
  if (screenId === 'overview') return NDX_VR_REGION.overviewScreen;
  if (screenId === 'content-ops') return NDX_VR_REGION.contentOpsScreen;
  if (screenId === 'cultural-intelligence') return NDX_VR_REGION.intelligenceScreen;
  if (screenId === 'character-lab') return NDX_VR_REGION.characterScreen;
  return null;
}

export function MobileFounderWorkspaceChrome({
  projectSlug,
  children,
  visualSpec: visualSpecProp = null,
  menuOpen = false,
  notificationOpen = false,
  unreadCount = 0,
  bellButtonRef,
  onToggleMenu,
  onOpenNotifications,
}: Props) {
  const location = useLocation();
  const screenId = resolveMobileScreenIdFromPath(location.pathname, projectSlug);
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);
  const ndxVisualSpec = visualSpecProp ?? resolveNdxMobileVisualShellSpec(screenId);
  const campaignLabVisualSpec = resolveCampaignLabVisualShellSpec(screenId);
  const shellStyle = ndxVisualSpec
    ? (mobileVisualShellStyle(ndxVisualSpec) as CSSProperties)
    : campaignLabVisualSpec
      ? (mobileVisualShellSpecToCssVars(campaignLabVisualSpec) as CSSProperties)
      : undefined;
  const hasVisualSpec = !!(ndxVisualSpec || campaignLabVisualSpec);
  const screenRegion = resolveScreenRegion(screenId);

  return (
    <div
      className={`site00-fws-mobile-chrome site00-fws-mobile-chrome--${screenId}${hasVisualSpec ? ' site00-fws-mobile-chrome--visual-spec' : ''}${ndxVisualSpec ? ` site00-fws-mobile-chrome--shell-${ndxVisualSpec.screenId}` : ''}${menuOpen ? ' site00-fws-mobile-chrome--menu-open' : ''}${notificationOpen ? ' site00-fws-mobile-chrome--notify-open' : ''}`}
      data-visual-reconstruction={`mobile-${screenId}`}
      data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}
      style={shellStyle}
      {...(screenRegion ? vrRegionAttr(screenRegion) : {})}
    >
      <header
        className="site00-fws-mobile-chrome__header"
        {...vrRegionAttr(resolveHeaderShellRegion(screenId))}
      >
        <div className="site00-fws-mobile-chrome__brand">
          <span className="site00-fws-mobile-chrome__title">NDXBOOK</span>
          <span className="site00-fws-mobile-chrome__diamond" aria-hidden="true">
            <Site00Diamond mode="PROJECT_CONTEXT" projectSlug={projectSlug} />
          </span>
        </div>
        <div className="site00-fws-mobile-chrome__actions">
          <button
            ref={bellButtonRef}
            type="button"
            className={`site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--bell${notificationOpen ? ' site00-fws-mobile-chrome__icon--bell-open' : ''}${unreadCount > 0 ? ' site00-fws-mobile-chrome__icon--bell-unread' : ''}`}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-haspopup="dialog"
            aria-expanded={notificationOpen}
            onClick={onOpenNotifications}
          >
            <NDXIcon
              name="notifications"
              size={NDX_ICON_CONTEXT_SIZE.header}
              state={notificationOpen || unreadCount > 0 ? 'active' : 'inactive'}
              decorative
            />
            {unreadCount > 0 ? (
              <span className="site00-fws-mobile-chrome__badge" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className={`site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--menu${menuOpen ? ' site00-fws-mobile-chrome__icon--menu-open' : ''}`}
            aria-label="Project menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} state={menuOpen ? 'active' : 'inactive'} decorative />
          </button>
        </div>
      </header>

      <div className="site00-fws-mobile-chrome__body site00-fws-mobile-chrome__scroll-container">{children}</div>

      <nav
        className="site00-fws-mobile-chrome__nav"
        aria-label="NDXBOOK mobile navigation"
        {...vrRegionAttr(resolveBottomNavShellRegion(screenId))}
      >
        {nav.map((item) => {
          const labFamilyActive = screenId === 'experiment-01' || screenId === 'character-lab';
          const active =
            item.id === 'more'
              ? menuOpen
              : item.id === 'lab'
                ? labFamilyActive
                : item.screenId === screenId;

          if (item.id === 'more') {
            return (
              <button
                key={item.id}
                type="button"
                className={`site00-fws-mobile-chrome__nav-item${active ? ' site00-fws-mobile-chrome__nav-item--active' : ''}`}
                aria-label="More workspace destinations"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={onToggleMenu}
              >
                <span className="site00-fws-mobile-chrome__nav-icon" aria-hidden="true">
                  <NDXIcon
                    name={item.icon}
                    size={NDX_ICON_CONTEXT_SIZE.bottomNav}
                    state={active ? 'active' : 'inactive'}
                    decorative
                  />
                </span>
                <span className="site00-fws-mobile-chrome__nav-label">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`site00-fws-mobile-chrome__nav-item${active ? ' site00-fws-mobile-chrome__nav-item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="site00-fws-mobile-chrome__nav-icon" aria-hidden="true">
                <NDXIcon
                  name={item.icon}
                  size={NDX_ICON_CONTEXT_SIZE.bottomNav}
                  state={active ? 'active' : 'inactive'}
                  decorative
                />
              </span>
              <span className="site00-fws-mobile-chrome__nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
