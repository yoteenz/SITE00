/** Client-facing Digital Foundation URLs (personalized artifact link). */
export function digitalFoundationClientPath(publicToken: string): string {
  return `/foundation/${encodeURIComponent(publicToken)}`;
}

/** Deep-link to the intake form (skips prospect landing when intake is still open). */
export function digitalFoundationClientIntakePath(publicToken: string): string {
  return `${digitalFoundationClientPath(publicToken)}?step=intake`;
}
