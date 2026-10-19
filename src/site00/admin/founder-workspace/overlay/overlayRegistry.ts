/** Canonical overlay registry — Opus1/2 (OL-*) and Opus3 (RO-*). */

export type OverlayPlacementTier = 'mobile' | 'tablet' | 'desktop';
export type OverlayGeometry = 'sheet-bottom' | 'sheet-right' | 'dialog' | 'full' | 'popover';

export type OverlayMeta = {
  title: string;
  family: 'workspace' | 'referral';
  /** Default geometry at desktop; host adjusts at breakpoints. */
  geometry: OverlayGeometry;
  /** Primary trigger location (documentation + tests). */
  trigger: string;
  blockedByPolicy?: boolean;
  blockedByBackend?: boolean;
};

export const WORKSPACE_OVERLAY_IDS = [
  'OL-01',
  'OL-02',
  'OL-03',
  'OL-04',
  'OL-05',
  'OL-06',
  'OL-07',
  'OL-08',
  'OL-09',
  'OL-10',
  'OL-11',
  'OL-12',
  'OL-13',
  'OL-14',
  'OL-15',
  'OL-16',
  'OL-17',
  'OL-18',
  'OL-19',
  'OL-20',
] as const;

export const REFERRAL_OVERLAY_IDS = [
  'RO-01',
  'RO-02',
  'RO-03',
  'RO-04',
  'RO-05',
  'RO-06',
  'RO-07',
  'RO-08',
  'RO-09',
  'RO-10',
  'RO-11',
  'RO-12',
  'RO-13',
  'RO-14',
  'RO-15',
  'RO-16',
  'RO-17',
  'RO-18',
  'RO-19',
  'RO-20',
] as const;

export type WorkspaceOverlayId = (typeof WORKSPACE_OVERLAY_IDS)[number];
export type ReferralOverlayId = (typeof REFERRAL_OVERLAY_IDS)[number];
export type RegisteredOverlayId = WorkspaceOverlayId | ReferralOverlayId;

/** @deprecated use OL-01 */
export type LegacyCreateOverlayId = 'CREATE_CLIENT';

export const OVERLAY_META: Record<RegisteredOverlayId, OverlayMeta> = {
  'OL-01': { title: 'Create foundation', family: 'workspace', geometry: 'sheet-bottom', trigger: 'shell.create' },
  'OL-02': { title: 'Link ready', family: 'workspace', geometry: 'dialog', trigger: 'create.success' },
  'OL-03': { title: 'Workspace menu', family: 'workspace', geometry: 'sheet-right', trigger: 'shell.menu' },
  'OL-04': { title: 'Search / command palette', family: 'workspace', geometry: 'full', trigger: 'shell.search' },
  'OL-05': { title: 'Notification center', family: 'workspace', geometry: 'sheet-right', trigger: 'shell.notifications' },
  'OL-06': { title: 'Row action menu', family: 'workspace', geometry: 'sheet-bottom', trigger: 'foundations.row' },
  'OL-07': { title: 'Filter / sort', family: 'workspace', geometry: 'sheet-right', trigger: 'foundations.filter' },
  'OL-08': { title: 'Approve quote confirmation', family: 'workspace', geometry: 'dialog', trigger: 'client.quote' },
  'OL-09': { title: 'Revise quote / manual adjustment', family: 'workspace', geometry: 'dialog', trigger: 'client.quote' },
  'OL-10': { title: 'Mark foundation complete', family: 'workspace', geometry: 'dialog', trigger: 'client.records' },
  'OL-11': { title: 'Request changes / add note', family: 'workspace', geometry: 'dialog', trigger: 'reviews.decision' },
  'OL-12': { title: 'Task detail', family: 'workspace', geometry: 'sheet-right', trigger: 'operations.task' },
  'OL-13': { title: 'Set blocker', family: 'workspace', geometry: 'dialog', trigger: 'operations.blocker' },
  'OL-14': { title: 'Compose message', family: 'workspace', geometry: 'sheet-bottom', trigger: 'correspondence.compose' },
  'OL-15': { title: 'Send (gated, approval tick)', family: 'workspace', geometry: 'dialog', trigger: 'correspondence.send' },
  'OL-16': { title: 'System module detail', family: 'workspace', geometry: 'sheet-right', trigger: 'system.module' },
  'OL-17': { title: 'Reset test data confirmation', family: 'workspace', geometry: 'dialog', trigger: 'system.testlab' },
  'OL-18': { title: 'Account menu', family: 'workspace', geometry: 'popover', trigger: 'shell.account' },
  'OL-19': { title: 'Client preview', family: 'workspace', geometry: 'sheet-right', trigger: 'foundations.inspector' },
  'OL-20': { title: 'Technical error detail', family: 'workspace', geometry: 'dialog', trigger: 'global.error' },
  'RO-01': { title: 'Create partner', family: 'referral', geometry: 'dialog', trigger: 'referrals.partners', blockedByBackend: true },
  'RO-02': { title: 'Edit partner', family: 'referral', geometry: 'dialog', trigger: 'referrals.partners', blockedByBackend: true },
  'RO-03': { title: 'Invite partner', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.partners', blockedByPolicy: true },
  'RO-04': { title: 'Partner status change', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.partners', blockedByBackend: true },
  'RO-05': { title: 'Commission terms editor', family: 'referral', geometry: 'dialog', trigger: 'referrals.commissions', blockedByPolicy: true },
  'RO-06': { title: 'Referral link preview', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.card' },
  'RO-07': { title: 'QR validation result', family: 'referral', geometry: 'dialog', trigger: 'referrals.card', blockedByPolicy: true },
  'RO-08': { title: 'Card share sheet', family: 'referral', geometry: 'sheet-bottom', trigger: 'referrals.card' },
  'RO-09': { title: 'Card export dialog', family: 'referral', geometry: 'dialog', trigger: 'referrals.card' },
  'RO-10': { title: 'Print proof', family: 'referral', geometry: 'dialog', trigger: 'referrals.card', blockedByPolicy: true },
  'RO-11': { title: 'Commission detail', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.commissions', blockedByBackend: true },
  'RO-12': { title: 'Commission approval', family: 'referral', geometry: 'dialog', trigger: 'referrals.commissions', blockedByPolicy: true },
  'RO-13': { title: 'Commission adjustment', family: 'referral', geometry: 'dialog', trigger: 'referrals.commissions', blockedByPolicy: true },
  'RO-14': { title: 'Payout detail', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.payouts', blockedByBackend: true },
  'RO-15': { title: 'Record payment', family: 'referral', geometry: 'dialog', trigger: 'referrals.payouts', blockedByPolicy: true },
  'RO-16': { title: 'Confirm payment', family: 'referral', geometry: 'dialog', trigger: 'referrals.payouts', blockedByPolicy: true },
  'RO-17': { title: 'Payout reversal', family: 'referral', geometry: 'dialog', trigger: 'referrals.payouts', blockedByPolicy: true },
  'RO-18': { title: 'Attribution exception', family: 'referral', geometry: 'dialog', trigger: 'referrals.attribution', blockedByBackend: true },
  'RO-19': { title: 'Manual attribution correction', family: 'referral', geometry: 'dialog', trigger: 'referrals.attribution', blockedByPolicy: true },
  'RO-20': { title: 'Partner access revocation', family: 'referral', geometry: 'sheet-right', trigger: 'referrals.partners', blockedByPolicy: true },
};

export function normalizeOverlayId(id: string): RegisteredOverlayId | null {
  if (id === 'CREATE_CLIENT') return 'OL-01';
  if (id in OVERLAY_META) return id as RegisteredOverlayId;
  return null;
}

export function overlayTitle(id: RegisteredOverlayId): string {
  return OVERLAY_META[id]?.title ?? id;
}

export function isReferralOverlay(id: string): id is ReferralOverlayId {
  return id.startsWith('RO-');
}

export function overlayGeometryForViewport(id: RegisteredOverlayId, width: number): OverlayGeometry {
  const base = OVERLAY_META[id].geometry;
  if (width < 768) {
    if (base === 'popover' || base === 'sheet-right') return 'sheet-bottom';
    return base === 'dialog' ? 'sheet-bottom' : base;
  }
  if (width < 1024 && base === 'full') return 'dialog';
  return base;
}
