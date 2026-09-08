import { useState } from 'react';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { PROJECT_MODULE_CONFIGS } from '../../../../shared/site00-projects/projectModules.js';

type ProjectModuleSwitcherProps = {
  projectSlug: string;
  currentModule: ProjectModuleId;
  enabledModules: ProjectModuleId[];
  onSelect: (moduleId: ProjectModuleId) => void;
};

export function ProjectModuleSwitcher({
  currentModule,
  enabledModules,
  onSelect,
}: ProjectModuleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const current = PROJECT_MODULE_CONFIGS[currentModule];

  return (
    <div className="site00-pos-module-switcher">
      <button
        type="button"
        className="site00-pos-module-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="site00-pos-module-switcher__current">{current.label}</span>
        <span className="site00-pos-module-switcher__chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="site00-pos-module-switcher__backdrop"
            aria-label="Close module switcher"
            onClick={() => setOpen(false)}
          />
          <div className="site00-pos-module-switcher__panel" role="listbox">
            <p className="site00-pos-module-switcher__panel-title">PROJECT MODULES</p>
            <ul className="site00-pos-module-switcher__list">
              {enabledModules
                .filter((m) => m !== 'MORE')
                .map((moduleId) => {
                  const config = PROJECT_MODULE_CONFIGS[moduleId];
                  const isActive = moduleId === currentModule;
                  return (
                    <li key={moduleId}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`site00-pos-module-switcher__item${isActive ? ' is-active' : ''}`}
                        onClick={() => {
                          onSelect(moduleId);
                          setOpen(false);
                        }}
                      >
                        <span className="site00-pos-module-switcher__item-label">{config.label}</span>
                        <span className="site00-pos-module-switcher__item-desc">{config.description}</span>
                        {isActive ? <span className="site00-pos-module-switcher__check">✓</span> : null}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
