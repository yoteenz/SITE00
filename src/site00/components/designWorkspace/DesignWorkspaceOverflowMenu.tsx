/**
 * P0.VR.3M.1 — Design workspace overflow menu (real actions only).
 */

import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import { FounderWorkspacePopoverSurface } from '../founderWorkspace/FounderWorkspacePopoverSurface';
import type { DesignWorkspaceOverflowAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  actions: DesignWorkspaceOverflowAction[];
  onAction: (actionId: DesignWorkspaceOverflowAction['id']) => void;
  projectLabel: string;
};

export function DesignWorkspaceOverflowMenu({ open, onClose, anchorRef, actions, onAction, projectLabel }: Props) {
  return (
    <FounderWorkspacePopoverSurface
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      placement="anchor-below-viewport-right"
      widthMode="menu"
      ariaRole="menu"
      ariaLabel={`${projectLabel} design workspace menu`}
      className="site00-dw-host-menu site00-dw-host-menu--overflow"
      backdropClassName="site00-dw-host-menu-backdrop"
    >
      <header className="site00-dw-host-menu__header">
        <strong>DESIGN WORKSPACE</strong>
        <span>{projectLabel}</span>
      </header>
      <ul className="site00-dw-host-menu__list" role="none">
        {actions.map((action) => {
          if (!action.enabled && action.disabledReason) {
            return (
              <li key={action.id} role="none">
                <button type="button" className="site00-dw-host-menu__item is-disabled" disabled title={action.disabledReason}>
                  {action.label}
                </button>
              </li>
            );
          }

          if (action.externalHref && action.enabled) {
            return (
              <li key={action.id} role="none">
                <a
                  href={action.externalHref}
                  className="site00-dw-host-menu__item"
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  onClick={onClose}
                >
                  {action.label}
                </a>
              </li>
            );
          }

          return (
            <li key={action.id} role="none">
              <button
                type="button"
                className="site00-dw-host-menu__item"
                role="menuitem"
                disabled={!action.enabled}
                onClick={() => {
                  if (!action.enabled) return;
                  onAction(action.id);
                  onClose();
                }}
              >
                {action.label}
              </button>
            </li>
          );
        })}
      </ul>
      <footer className="site00-dw-host-menu__footer">
        <Link to="/control/settings#notifications" className="site00-dw-host-menu__footer-link" onClick={onClose}>
          NOTIFICATION SETTINGS
        </Link>
      </footer>
    </FounderWorkspacePopoverSurface>
  );
}
