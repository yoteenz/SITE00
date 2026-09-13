/** NDXBOOK overview mobile Twin V2 page ids that should share one concept gallery scope. */
export function isTwinV2OverviewPageScope(projectId: string, pageId: string): boolean {
  if (projectId !== 'ndxbook') return false;
  const p = pageId.toLowerCase();
  return (
    p.includes('ndxbook') ||
    p.includes('overview') ||
    p === 'overview' ||
    p.endsWith('/projects/ndxbook')
  );
}

export function twinV2SessionStorageKeyMatchesProject(storageKey: string, projectId: string): boolean {
  return storageKey.includes(`${projectId}:`);
}
