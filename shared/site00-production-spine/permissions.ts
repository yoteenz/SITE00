import { PROJECT_ROLES, SpineError, type Actor, type ActorRole, type ProjectRole } from './types.js';

/**
 * Who may do what on a spine project. One table, enforced in three places: the API (before any work), the runner
 * (before any record changes) and the database (approval-event checks and triggers). Spend, budget, reference and take
 * approval belong to the founder alone; nothing here lets another role authorize or dispatch paid generation.
 */

export const PERMISSIONS = [
  'VIEW',
  'READ_MEDIA',
  'PREPARE_JOB',
  'AUTHORIZE_SPEND',
  'DISPATCH',
  'CANCEL_JOB',
  'RECONCILE',
  'RECAPTURE',
  'APPROVE_REFERENCE',
  'TAKE_APPROVE',
  'TAKE_REJECT',
  'TAKE_HOLD',
  'SELECT_FOR_EDIT',
  'REVIEW_CONTINUITY',
  'EXTRACT_FRAME',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const VIEWING: Permission[] = ['VIEW', 'READ_MEDIA'];

export const ROLE_PERMISSIONS: Readonly<Record<ProjectRole, readonly Permission[]>> = {
  FOUNDER: PERMISSIONS,
  PRODUCTION_ADMIN: [...VIEWING, 'PREPARE_JOB', 'CANCEL_JOB', 'RECONCILE', 'RECAPTURE', 'TAKE_HOLD', 'REVIEW_CONTINUITY', 'EXTRACT_FRAME'],
  AUTHORIZED_EDITOR: [...VIEWING, 'PREPARE_JOB', 'TAKE_HOLD', 'SELECT_FOR_EDIT', 'REVIEW_CONTINUITY', 'EXTRACT_FRAME'],
  REVIEWER: [...VIEWING, 'TAKE_HOLD', 'REVIEW_CONTINUITY'],
  READ_ONLY: VIEWING,
};

/** Permissions only the founder holds. A test asserts no other role ever gains one. */
export const FOUNDER_ONLY: readonly Permission[] = ['AUTHORIZE_SPEND', 'DISPATCH', 'APPROVE_REFERENCE', 'TAKE_APPROVE', 'TAKE_REJECT'];

export const isProjectRole = (r: unknown): r is ProjectRole => typeof r === 'string' && (PROJECT_ROLES as readonly string[]).includes(r);

export function can(role: ActorRole, p: Permission): boolean {
  return role !== 'SYSTEM' && ROLE_PERMISSIONS[role].includes(p);
}

export function requirePermission(actor: Actor, p: Permission, what: string): void {
  if (!can(actor.role, p)) throw new SpineError('FORBIDDEN', `${what} needs ${p}; ${actor.id} is ${actor.role}`);
}

export const permissionsOf = (role: ActorRole): Permission[] => (role === 'SYSTEM' ? [] : [...ROLE_PERMISSIONS[role]]);
