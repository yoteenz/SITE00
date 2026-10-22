import type { FoundationAdminListRow } from '../../services/foundationAdminApi';

/**
 * G-01 intake column: canonical field `artifact.intake_state` (NOT_STARTED | IN_PROGRESS | COMPLETE).
 * Normalized for registry display; does not invent persistence.
 */
export function normalizeIntakeColumnLabel(row: FoundationAdminListRow): string {
  const raw = row.intake_state ?? 'NOT_STARTED';
  switch (raw) {
    case 'COMPLETE':
      return 'Complete';
    case 'IN_PROGRESS':
      return 'In progress';
    case 'NOT_STARTED':
    default:
      return 'Not started';
  }
}

export function intakeColumnStatusKind(row: FoundationAdminListRow): 'ok' | 'warn' | 'muted' {
  const raw = row.intake_state ?? 'NOT_STARTED';
  if (raw === 'COMPLETE') return 'ok';
  if (raw === 'IN_PROGRESS') return 'warn';
  return 'muted';
}
