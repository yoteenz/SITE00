import { Navigate, useLocation } from 'react-router-dom';
import { writeStoredPreviewDeviceMode } from '../../state/preview-mode';

/** Legacy `/foo/desktop` workflow routes → semantic base path with desktop preview mode. */
export function Site00WorkflowDesktopLegacyRedirect() {
  const { pathname, search, hash } = useLocation();

  writeStoredPreviewDeviceMode('desktop');

  const mobilePath = pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '') || '/';
  const nextSearch = search.startsWith('?') ? search : search ? `?${search}` : '';

  return <Navigate to={`${mobilePath}${nextSearch}${hash}`} replace />;
}
