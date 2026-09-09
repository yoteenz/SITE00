/**
 * Design workspace top-right project selector — drives activeDesignProjectId.
 * Light SITE 00 host popover (no dark theme).
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  formatDesignProjectOptionLabel,
  resolveDesignProjectSelectorAccent,
  resolveDesignProjectSelectorStatus,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/designProjectSelectorVisuals.js';
import type { ManagedProjectContextAccent } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/types.js';

export type DesignProjectOption = {
  projectId: string;
  displayName: string;
};

type Props = {
  activeProjectId: string;
  activeProjectLabel: string;
  projectAccent?: ManagedProjectContextAccent;
  projects: DesignProjectOption[];
  onSelectProject: (projectId: string) => void;
  disabled?: boolean;
};

export function DesignProjectSelector({
  activeProjectId,
  activeProjectLabel,
  projectAccent = 'NEUTRAL',
  projects,
  onSelectProject,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const selectProject = useCallback(
    (projectId: string) => {
      onSelectProject(projectId);
      close();
    },
    [close, onSelectProject],
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const activeIdx = projects.findIndex((p) => p.projectId === activeProjectId);
    setFocusIndex(activeIdx >= 0 ? activeIdx : 0);
  }, [activeProjectId, open, projects]);

  useEffect(() => {
    if (!open || focusIndex < 0) return;
    optionRefs.current[focusIndex]?.focus();
  }, [focusIndex, open]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, projects.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setFocusIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setFocusIndex(projects.length - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const project = projects[focusIndex];
      if (project) selectProject(project.projectId);
    }
  };

  const displayName = activeProjectLabel.replace(/^PROJECT\s+/i, '');

  return (
    <div
      className="site00-dw-project-selector"
      ref={rootRef}
      data-open={open ? 'true' : 'false'}
      data-theme="light"
    >
      <button
        type="button"
        className="site00-dw-shell__project-context-badge site00-dw-project-selector__trigger"
        data-project-accent={projectAccent}
        aria-label={`Active design project ${activeProjectLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="site00-dw-project-selector-menu"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="site00-dw-shell__project-context-label">PROJECT</span>
        <span className="site00-dw-shell__project-context-name">{displayName}</span>
        <span className="site00-dw-shell__project-context-chev" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id="site00-dw-project-selector-menu"
          className="site00-dw-project-selector__menu"
          role="listbox"
          aria-label="Select design project"
          aria-activedescendant={
            focusIndex >= 0 ? `site00-dw-project-option-${projects[focusIndex]?.projectId}` : undefined
          }
          onKeyDown={onMenuKeyDown}
        >
          {projects.map((p, index) => {
            const isActive = p.projectId === activeProjectId;
            const accent = resolveDesignProjectSelectorAccent(p.projectId);
            const status = resolveDesignProjectSelectorStatus(p.projectId);
            return (
              <li key={p.projectId} role="presentation">
                <button
                  id={`site00-dw-project-option-${p.projectId}`}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`site00-dw-project-selector__option${isActive ? ' is-active' : ''}`}
                  onClick={() => selectProject(p.projectId)}
                  onMouseEnter={() => setFocusIndex(index)}
                >
                  <span
                    className="site00-dw-project-selector__accent-dot"
                    style={{ backgroundColor: accent.dotColor }}
                    aria-hidden
                  />
                  <span className="site00-dw-project-selector__option-label">
                    {formatDesignProjectOptionLabel(p.displayName)}
                  </span>
                  {isActive ? (
                    <span className="site00-dw-project-selector__current-tag">CURRENT</span>
                  ) : status ? (
                    <span className="site00-dw-project-selector__status">{status}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
