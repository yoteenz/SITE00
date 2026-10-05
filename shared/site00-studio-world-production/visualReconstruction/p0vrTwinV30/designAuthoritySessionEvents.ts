export const DESIGN_AUTHORITY_SESSION_CHANGED = 'site00:design-authority-session-changed';

export function notifyDesignAuthoritySessionChanged(projectId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(DESIGN_AUTHORITY_SESSION_CHANGED, { detail: { projectId: projectId.toLowerCase() } }),
  );
}
