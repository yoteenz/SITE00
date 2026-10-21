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

/**
 * OPUS2 / OPUS3 container modes per tier (ws-overlays.js `ov({ m, t, d, w })`, rf data/overlay-modes.json):
 * data-m (phone < 768) · data-t (tablet 768–1279) · data-d (desktop ≥ 1280). `none` in the authority (the surface is
 * inline at that tier) maps to the nearest live container so a trigger can never open nothing.
 * kind: panel · menu (menu rows, no body padding) · palette (search) · insp (inspector chrome).
 */
export type OverlayModes = {
  m: 'full' | 'sheet' | 'drawer' | 'action';
  t: 'dialog' | 'sheet-r' | 'drawer' | 'popover' | 'palette';
  d: 'dialog' | 'sheet-r' | 'drawer' | 'popover' | 'palette';
  w: number;
  kind: 'panel' | 'menu' | 'palette' | 'insp';
  /** Authority headline (display face, red period). Menus and the palette carry an aria-label instead. */
  head?: string;
  /** Financial / destructive confirmations never close on a scrim click (Escape and CLOSE still work). */
  scrimLocked?: boolean;
  /** Popover placement relative to the trigger. */
  place?: 'below-end' | 'above-start';
};

export const OVERLAY_MODES: Record<RegisteredOverlayId, OverlayModes> = {
  'OL-01': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'CREATE A FOUNDATION' },
  'OL-02': { m: 'full', t: 'dialog', d: 'dialog', w: 560, kind: 'panel', head: 'LINK READY' },
  'OL-03': { m: 'drawer', t: 'drawer', d: 'drawer', w: 320, kind: 'menu', head: 'MENU' },
  'OL-04': { m: 'full', t: 'palette', d: 'palette', w: 680, kind: 'palette' },
  'OL-05': { m: 'sheet', t: 'popover', d: 'popover', w: 400, kind: 'panel', head: 'NOTIFICATIONS', place: 'below-end' },
  'OL-06': { m: 'action', t: 'popover', d: 'popover', w: 280, kind: 'menu', place: 'below-end' },
  'OL-07': { m: 'sheet', t: 'popover', d: 'popover', w: 380, kind: 'panel', head: 'FILTER + SORT', place: 'below-end' },
  'OL-08': { m: 'sheet', t: 'dialog', d: 'dialog', w: 500, kind: 'panel', head: 'APPROVE THIS QUOTE?', scrimLocked: true },
  'OL-09': { m: 'full', t: 'dialog', d: 'dialog', w: 640, kind: 'panel', head: 'REVISE QUOTE', scrimLocked: true },
  'OL-10': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'MARK FOUNDATION COMPLETE', scrimLocked: true },
  'OL-11': { m: 'sheet', t: 'dialog', d: 'dialog', w: 520, kind: 'panel', head: 'REQUEST REVISION' },
  'OL-12': { m: 'sheet', t: 'sheet-r', d: 'sheet-r', w: 420, kind: 'insp' },
  'OL-13': { m: 'sheet', t: 'dialog', d: 'dialog', w: 520, kind: 'panel', head: 'SET BLOCKER' },
  'OL-14': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'COMPOSE MESSAGE' },
  'OL-15': { m: 'sheet', t: 'dialog', d: 'dialog', w: 540, kind: 'panel', head: 'SEND TEST EMAIL', scrimLocked: true },
  'OL-16': { m: 'sheet', t: 'sheet-r', d: 'sheet-r', w: 420, kind: 'insp' },
  'OL-17': { m: 'sheet', t: 'dialog', d: 'dialog', w: 500, kind: 'panel', head: 'RESET TEST DATA?', scrimLocked: true },
  'OL-18': { m: 'drawer', t: 'popover', d: 'popover', w: 280, kind: 'menu', place: 'above-start' },
  'OL-19': { m: 'sheet', t: 'sheet-r', d: 'sheet-r', w: 420, kind: 'insp' },
  'OL-20': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'TECHNICAL DETAIL' },
  'RO-01': { m: 'full', t: 'dialog', d: 'dialog', w: 640, kind: 'panel', head: 'CREATE PARTNER' },
  'RO-02': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'EDIT PARTNER' },
  'RO-03': { m: 'sheet', t: 'dialog', d: 'dialog', w: 540, kind: 'panel', head: 'INVITE PARTNER' },
  'RO-04': { m: 'sheet', t: 'dialog', d: 'dialog', w: 540, kind: 'panel', head: 'CHANGE PARTNER STATUS', scrimLocked: true },
  'RO-05': { m: 'full', t: 'dialog', d: 'dialog', w: 720, kind: 'panel', head: 'COMMISSION TERMS', scrimLocked: true },
  'RO-06': { m: 'sheet', t: 'popover', d: 'popover', w: 380, kind: 'panel', head: 'REFERRAL LINK', place: 'below-end' },
  'RO-07': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'QR VALIDATION' },
  'RO-08': { m: 'sheet', t: 'popover', d: 'popover', w: 360, kind: 'panel', head: 'SHARE CARD', place: 'below-end' },
  'RO-09': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'EXPORT CARD' },
  'RO-10': { m: 'full', t: 'dialog', d: 'dialog', w: 860, kind: 'panel', head: 'PRINT PROOF' },
  'RO-11': { m: 'sheet', t: 'sheet-r', d: 'sheet-r', w: 420, kind: 'insp' },
  'RO-12': { m: 'sheet', t: 'dialog', d: 'dialog', w: 520, kind: 'panel', head: 'APPROVE COMMISSION?', scrimLocked: true },
  'RO-13': { m: 'full', t: 'dialog', d: 'dialog', w: 560, kind: 'panel', head: 'ADJUST COMMISSION', scrimLocked: true },
  'RO-14': { m: 'sheet', t: 'sheet-r', d: 'sheet-r', w: 420, kind: 'insp' },
  'RO-15': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'RECORD PAYMENT', scrimLocked: true },
  'RO-16': { m: 'sheet', t: 'dialog', d: 'dialog', w: 520, kind: 'panel', head: 'CONFIRM PAYMENT', scrimLocked: true },
  'RO-17': { m: 'full', t: 'dialog', d: 'dialog', w: 560, kind: 'panel', head: 'PAYOUT REVERSAL', scrimLocked: true },
  'RO-18': { m: 'full', t: 'dialog', d: 'dialog', w: 640, kind: 'panel', head: 'ATTRIBUTION EXCEPTION' },
  'RO-19': { m: 'full', t: 'dialog', d: 'dialog', w: 600, kind: 'panel', head: 'MANUAL ATTRIBUTION CORRECTION', scrimLocked: true },
  'RO-20': { m: 'sheet', t: 'dialog', d: 'dialog', w: 540, kind: 'panel', head: 'REVOKE PARTNER ACCESS', scrimLocked: true },
};
