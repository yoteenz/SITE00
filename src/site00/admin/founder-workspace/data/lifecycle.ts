/**
 * Maps real Digital Foundation artifact state onto the approved workspace grammar (OPUS1/OPUS2):
 * eight-step lifecycle INVITED → COMPLETE, a status kind (who holds the next move) and the next action.
 * Pure functions — no data is invented; unknown states fall back to a neutral reading.
 */
import type { FoundationAdminListRow, PipelineRow } from '../../services/foundationAdminApi';
import type { WsKind } from '../shell/wsKit';

export const LIFECYCLE_PHASES = ['INVITED', 'INTAKE', 'RECOMMEND', 'QUOTE', 'PAYMENT', 'SETUP', 'VERIFY', 'COMPLETE'] as const;

export type LifecycleReading = {
  phase: number;
  kind: WsKind;
  /** Status label shown beside the mark. */
  label: string;
  /** Who holds the next move: FOUNDER · CLIENT · SITE 00 · — */
  owner: 'FOUNDER' | 'CLIENT' | 'SITE 00' | '—';
  action: string;
  /** One-line statement for the overview focus card (founder decisions only). */
  statement?: string;
};

const BY_STATE: Record<string, LifecycleReading> = {
  INVITED: { phase: 0, kind: 'client', label: 'INVITED', owner: 'CLIENT', action: 'OPEN PERSONAL LINK' },
  OPENED: { phase: 0, kind: 'client', label: 'LINK OPENED', owner: 'CLIENT', action: 'START INTAKE' },
  INTAKE_IN_PROGRESS: { phase: 1, kind: 'client', label: 'INTAKE IN PROGRESS', owner: 'CLIENT', action: 'FINISH INTAKE' },
  INTAKE_COMPLETE: { phase: 1, kind: 'founder', label: 'INTAKE COMPLETE', owner: 'FOUNDER', action: 'REVIEW INTAKE', statement: 'INTAKE COMPLETE — READY FOR YOUR REVIEW' },
  RECOMMENDATION_READY: { phase: 2, kind: 'founder', label: 'RECOMMENDATION READY', owner: 'FOUNDER', action: 'PREPARE QUOTE', statement: 'RECOMMENDATION READY — PREPARE THE QUOTE' },
  QUOTE_READY: { phase: 3, kind: 'founder', label: 'QUOTE READY', owner: 'FOUNDER', action: 'APPROVE QUOTE', statement: 'QUOTE READY FOR YOUR APPROVAL' },
  AWAITING_ACCEPTANCE: { phase: 3, kind: 'client', label: 'AWAITING ACCEPTANCE', owner: 'CLIENT', action: 'ACCEPT QUOTE' },
  AWAITING_PAYMENT: { phase: 4, kind: 'client', label: 'AWAITING PAYMENT', owner: 'CLIENT', action: 'COMPLETE PAYMENT' },
  PAID: { phase: 5, kind: 'work', label: 'PAID', owner: 'SITE 00', action: 'START SETUP' },
  PROJECT_ACTIVE: { phase: 5, kind: 'work', label: 'SETUP ACTIVE', owner: 'SITE 00', action: 'CONTINUE SETUP' },
  IN_PROGRESS: { phase: 5, kind: 'work', label: 'SETUP IN PROGRESS', owner: 'SITE 00', action: 'CONTINUE SETUP' },
  WAITING_ON_CLIENT: { phase: 5, kind: 'client', label: 'WAITING ON CLIENT', owner: 'CLIENT', action: 'CLIENT ACTION' },
  WAITING_ON_PROVIDER: { phase: 5, kind: 'blocked', label: 'WAITING ON PROVIDER', owner: 'SITE 00', action: 'FOLLOW UP PROVIDER' },
  FINAL_VERIFICATION: { phase: 6, kind: 'work', label: 'FINAL VERIFICATION', owner: 'SITE 00', action: 'VERIFY RECORDS' },
  COMPLETE: { phase: 7, kind: 'done', label: 'COMPLETE', owner: '—', action: 'NO ACTION' },
  BUILD_OPPORTUNITY: { phase: 7, kind: 'founder', label: 'BUILD OPPORTUNITY', owner: 'FOUNDER', action: 'REVIEW BUILD INTEREST', statement: 'FOUNDATION COMPLETE — BUILD INTEREST TO REVIEW' },
  ARCHIVED: { phase: 7, kind: 'idle', label: 'ARCHIVED', owner: '—', action: 'NO ACTION' },
};

const PAYMENT_EXCEPTION: Record<string, string> = { FAILED: 'PAYMENT FAILED', REFUNDED: 'REFUNDED', DISPUTED: 'PAYMENT DISPUTED' };

export function readLifecycle(row: Pick<FoundationAdminListRow, 'state' | 'payment_state'>, pipe?: PipelineRow): LifecycleReading {
  const base = BY_STATE[row.state] ?? { phase: 0, kind: 'idle' as const, label: row.state.replace(/_/g, ' '), owner: '—' as const, action: 'OPEN RECORD' };
  const exception = PAYMENT_EXCEPTION[row.payment_state];
  if (exception) return { ...base, kind: 'blocked', label: exception, owner: 'FOUNDER', action: 'RESOLVE PAYMENT', statement: `${exception} — RESOLVE BEFORE SETUP CONTINUES` };
  if (pipe?.blocker) return { ...base, kind: 'blocked', label: 'BLOCKED', action: pipe.blocker.toUpperCase() };
  if (pipe?.next_action && base.kind !== 'done' && base.kind !== 'idle') return { ...base, action: pipe.next_action.toUpperCase() };
  return base;
}

/** Compact relative age (40M · 3H · 2D · OCT 12). */
export function age(iso: string | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 60) return `${m}M`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}H`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}D`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
}
