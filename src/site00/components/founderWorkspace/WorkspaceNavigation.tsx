import { Link } from 'react-router-dom';
import type { WorkspaceNavItem } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type WorkspaceNavigationProps = {
  items: WorkspaceNavItem[];
  currentPath: string;
};

export function WorkspaceNavigation({ items, currentPath }: WorkspaceNavigationProps) {
  return (
    <nav className="site00-fws__nav" aria-label="Workspace sections">
      <ul className="site00-fws__nav-list">
        {items.map((item) => {
          const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          return (
            <li key={item.id}>
              <Link
                to={item.href}
                className={active ? 'site00-fws__nav-link site00-fws__nav-link--active' : 'site00-fws__nav-link'}
              >
                {item.label}
                {item.badge != null && item.badge > 0 ? (
                  <span className="site00-fws__nav-badge">{item.badge}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
