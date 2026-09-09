/**
 * Design workspace top-right project selector — drives activeDesignProjectId.
 */

import { useEffect, useRef, useState } from 'react';
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="site00-dw-project-selector" ref={rootRef} data-open={open ? 'true' : 'false'}>
      <button
        type="button"
        className="site00-dw-shell__project-context-badge site00-dw-project-selector__trigger"
        data-project-accent={projectAccent}
        aria-label={`Active design project ${activeProjectLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="site00-dw-shell__project-context-label">PROJECT</span>
        <span className="site00-dw-shell__project-context-name">{activeProjectLabel.replace(/^PROJECT\s+/i, '')}</span>
        <span className="site00-dw-shell__project-context-chev" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul className="site00-dw-project-selector__menu" role="listbox" aria-label="Select design project">
          {projects.map((p) => (
            <li key={p.projectId} role="option" aria-selected={p.projectId === activeProjectId}>
              <button
                type="button"
                className={`site00-dw-project-selector__option${p.projectId === activeProjectId ? ' is-active' : ''}`}
                onClick={() => {
                  onSelectProject(p.projectId);
                  setOpen(false);
                }}
              >
                PROJECT {p.displayName.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
