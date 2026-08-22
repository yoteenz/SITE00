import type { IntakeRecord } from './types.js';

export class IntakeAccessDeniedError extends Error {
  constructor(message = 'ACCESS DENIED') {
    super(message);
    this.name = 'IntakeAccessDeniedError';
  }
}

export type IntakeAccessContext =
  | { kind: 'AUTHENTICATED'; userId: string }
  | { kind: 'GUEST'; tokenIntakeType: 'IDENTITY' | 'BUILDER'; tokenIntakeId: string }
  /**
   * A guest operating in the SAME browser session that created this exact, still-unowned,
   * unguessable (UUID) intake — before a secure token has ever been issued (e.g. the very first
   * few autosave ticks, before the "where should we keep this?" email boundary is reached). This
   * is intentionally narrower than a blanket "no auth required" default: the API layer only ever
   * constructs this variant when the caller already supplied the exact intake id for a specific
   * intake action, never as a fallback that would let one guest enumerate another guest's
   * intakes. The emailed secure-access GUEST token above remains the only mechanism for
   * cross-device/cross-session resume, expiry, revocation, and replay protection (VII).
   */
  | { kind: 'ANONYMOUS_DIRECT' }
  | { kind: 'NONE' };

/**
 * Server-authoritative ownership check. Experience context (client vs admin UI) never grants
 * access — only true ownership (matching user_id), a resolved non-expired non-revoked guest
 * token scoped to this exact intake id, or same-session anonymous direct access to a still
 * unowned draft does.
 */
export function assertIntakeAccess(intake: IntakeRecord, ctx: IntakeAccessContext): void {
  if (ctx.kind === 'AUTHENTICATED' && intake.userId && intake.userId === ctx.userId) return;
  if (
    ctx.kind === 'GUEST' &&
    !intake.userId &&
    ctx.tokenIntakeType === intake.intakeType &&
    ctx.tokenIntakeId === intake.id
  ) {
    return;
  }
  if (ctx.kind === 'ANONYMOUS_DIRECT' && !intake.userId) return;
  throw new IntakeAccessDeniedError();
}

export function hasIntakeAccess(intake: IntakeRecord, ctx: IntakeAccessContext): boolean {
  try {
    assertIntakeAccess(intake, ctx);
    return true;
  } catch {
    return false;
  }
}
