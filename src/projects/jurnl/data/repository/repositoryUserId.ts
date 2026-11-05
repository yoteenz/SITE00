/**
 * Which localStorage snapshot key backs the device repository for this viewer.
 * Design-preview can resume MONEY before unlock; pockets must still land on the remembered viewer's scope.
 */

export type RepositoryUserScope = {
  mode: 'design-preview' | 'production';
  /** Signed-in session email (design-preview auth or pre-Supabase). */
  sessionEmail?: string | null;
  /** First remembered account on this device (design-preview unlock list). */
  rememberedEmail?: string | null;
};

export function resolveRepositoryUserId(scope: RepositoryUserScope): string {
  const session = scope.sessionEmail?.trim().toUpperCase();
  if (session) return session;
  if (scope.mode === 'design-preview') {
    const remembered = scope.rememberedEmail?.trim().toUpperCase();
    if (remembered) return remembered;
  }
  return 'preview-guest';
}
