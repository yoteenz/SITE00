/**
 * P0.VR.1D.3 — NDXBOOK project escape menu (three-dot popover).
 * Overlays without layout shift; anchored to header ellipsis trigger.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
  SITE00_ROUTES,
  site00ProjectExperimentsPath,
  site00ProjectPath,
  site00ProjectSetupPath,
} from '../../config/routes';

type Props = {
  projectSlug: string;
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function ProjectEscapeMenu({ projectSlug, open, onClose, triggerRef }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  const overviewPath = site00ProjectPath(projectSlug);
  const settingsPath = site00ProjectSetupPath(projectSlug);
  const inspectPath = site00ProjectExperimentsPath(projectSlug);

  return (
    <>
      <div className="site00-fws-project-menu-backdrop" aria-hidden onClick={onClose} />
      <div
        ref={menuRef}
        className="site00-fws-project-menu"
        data-vr-region="ndx-project-menu"
        role="menu"
        aria-label="NDXBOOK project menu"
      >
        <span className="site00-fws-project-menu__brand" role="presentation">
          NDXBOOK
        </span>

        <Link to={overviewPath} className="site00-fws-project-menu__item" role="menuitem" onClick={onClose}>
          PROJECT OVERVIEW
        </Link>
        <Link to={settingsPath} className="site00-fws-project-menu__item" role="menuitem" onClick={onClose}>
          PROJECT SETTINGS
        </Link>

        <hr className="site00-fws-project-menu__rule" />

        <Link
          to={SITE00_ROUTES.projects}
          className="site00-fws-project-menu__item site00-fws-project-menu__item--emphasis"
          role="menuitem"
          onClick={onClose}
        >
          <span>BACK TO PROJECTS</span>
          <span className="site00-fws-project-menu__icon" aria-hidden>
            ⎘
          </span>
        </Link>
        <Link
          to={SITE00_ROUTES.origin}
          className="site00-fws-project-menu__item"
          role="menuitem"
          onClick={onClose}
        >
          <span>RETURN TO ORIGIN</span>
          <span className="site00-fws-project-menu__icon" aria-hidden>
            ◎
          </span>
        </Link>

        <hr className="site00-fws-project-menu__rule" />

        <Link to={inspectPath} className="site00-fws-project-menu__item" role="menuitem" onClick={onClose}>
          <span>INSPECT</span>
          <span className="site00-fws-project-menu__icon" aria-hidden>
            ⌕
          </span>
        </Link>
        <button
          type="button"
          className="site00-fws-project-menu__item site00-fws-project-menu__item--pending"
          role="menuitem"
          aria-disabled="true"
          title="Dedicated help route not yet available"
        >
          <span>HELP</span>
          <span className="site00-fws-project-menu__icon" aria-hidden>
            ?
          </span>
        </button>
      </div>
    </>
  );
}
