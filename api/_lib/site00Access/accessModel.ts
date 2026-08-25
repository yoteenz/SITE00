/** SITE 00 access model — platform role, project membership, authorization (server authoritative) */

import { isAdminEmail, FOUNDER_PRIVILEGED_ADMIN_EMAIL } from '../adminAuth.js';
import { isFounderProjectSlug } from '../site00Projects/projectRegistry.js';
import { isClientRegisteredProjectSlug } from '../site00Projects/clientProjectResolver.js';
import { clientOwnsProject } from '../site00Production/clientStudio.js';
import type { Site00ExperienceContext, Site00PlatformRole } from '../../../shared/site00-access/types.js';

export { FOUNDER_PRIVILEGED_ADMIN_EMAIL };

export function resolvePlatformRole(email: string | null | undefined): Site00PlatformRole {
  return isAdminEmail(email) ? 'ADMIN' : 'STANDARD';
}

export function isFounderPrivilegedAccount(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === FOUNDER_PRIVILEGED_ADMIN_EMAIL;
}

/** Founder project index — platform admins with legitimate SITE 00 operator access */
export function canAccessFounderProjectIndex(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/** Client-facing project owner access for founder org slugs */
export function canAccessFounderProjectAsOwner(email: string | null | undefined, slug: string): boolean {
  if (!isFounderProjectSlug(slug) && !isClientRegisteredProjectSlug(slug)) return false;
  return canAccessFounderProjectIndex(email);
}

/** Project owner authorization — founder projects via admin role; studio projects via ownership */
export function canAccessProjectAsOwner(
  email: string | null | undefined,
  slug: string,
  userId?: string | null,
  studioProject?: { client_email?: string | null; client_user_id?: string | null } | null,
): boolean {
  if (isFounderProjectSlug(slug)) {
    return canAccessFounderProjectAsOwner(email, slug);
  }
  if (studioProject && email) {
    return clientOwnsProject(studioProject as Parameters<typeof clientOwnsProject>[0], email, userId ?? undefined);
  }
  return false;
}

/** Admin Control Center — requires platform admin role regardless of active UX context */
export function canAccessAdminControlCenter(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/** Active context is UX-only — never used for authorization decisions on the server */
export function isExperienceContextAuthoritative(_context: Site00ExperienceContext): false {
  return false;
}

export function assertFounderProjectAccess(email: string | null | undefined, slug: string): void {
  if (!canAccessFounderProjectAsOwner(email, slug)) {
    throw new Error('Project access denied');
  }
}
