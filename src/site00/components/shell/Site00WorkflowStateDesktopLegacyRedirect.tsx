import { Navigate } from 'react-router-dom';
import { writeStoredPresentationOverride } from '../../state/preview-mode';

type Site00WorkflowStateDesktopLegacyRedirectProps = {
  canonicalPath: string;
};

/** Legacy `/state/desktop` → canonical state route with desktop presentation override. */
export function Site00WorkflowStateDesktopLegacyRedirect({
  canonicalPath,
}: Site00WorkflowStateDesktopLegacyRedirectProps) {
  writeStoredPresentationOverride('desktop');
  return <Navigate to={canonicalPath} replace />;
}
