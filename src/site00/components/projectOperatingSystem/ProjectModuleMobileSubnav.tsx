import { useState } from 'react';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { getModuleSubnav, PROJECT_MODULE_CONFIGS } from '../../../../shared/site00-projects/projectModules.js';

type ProjectModuleMobileSubnavProps = {
  moduleId: ProjectModuleId;
  activeSubnav: string;
  onSubnavChange: (subnavId: string) => void;
  subnavOverride?: import('../../../../shared/site00-projects/projectModules.js').ProjectModuleSubnavItem[];
  subnavOverflowOverride?: import('../../../../shared/site00-projects/projectModules.js').ProjectModuleSubnavItem[];
};

export function ProjectModuleMobileSubnav({
  moduleId,
  activeSubnav,
  onSubnavChange,
  subnavOverride,
  subnavOverflowOverride,
}: ProjectModuleMobileSubnavProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const subnav = subnavOverride ?? getModuleSubnav(moduleId);
  const overflow = subnavOverflowOverride ?? PROJECT_MODULE_CONFIGS[moduleId].mobileSubnavOverflow ?? [];
  const moreItem = subnav.find((s) => s.id === 'MORE');

  return (
    <>
      <nav className="site00-pos-mobile-subnav" aria-label={`${moduleId} sub navigation`}>
        <ul className="site00-pos-mobile-subnav__list">
          {subnav.map((item) => {
            if (item.id === 'MORE' && overflow.length > 0) {
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`site00-pos-mobile-subnav__link${overflowOpen ? ' is-active' : ''}`}
                    onClick={() => setOverflowOpen((v) => !v)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            }
            const isActive = item.id === activeSubnav;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`site00-pos-mobile-subnav__link${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    onSubnavChange(item.id);
                    setOverflowOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {overflowOpen && moreItem ? (
        <div className="site00-pos-mobile-subnav-overflow">
          <ul>
            {overflow.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="site00-pos-mobile-subnav-overflow__link"
                  onClick={() => {
                    onSubnavChange(item.id);
                    setOverflowOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
