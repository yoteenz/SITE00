export type OverlayPlacement = 'dialog' | 'sheet' | 'full';

export type OverlayDefinition = {
  id: string;
  title: string;
  placement: OverlayPlacement;
  family: 'workspace' | 'referral';
};

/** Original workspace overlay families (Opus1/2). */
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

/** Referral overlay families RO-01 … RO-20 (Opus3). */
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
export type RegisteredOverlayId = WorkspaceOverlayId | ReferralOverlayId | 'CREATE_CLIENT';

const TITLES: Record<string, string> = {
  CREATE_CLIENT: 'Create client',
  'OL-01': 'Global search',
  'OL-02': 'Notifications',
  'OL-03': 'Workspace menu',
  'OL-04': 'Account',
  'OL-05': 'Create client',
  'OL-06': 'Client actions',
  'OL-07': 'Quote decision',
  'OL-08': 'Review decision',
  'OL-09': 'Task start',
  'OL-10': 'Task complete',
  'OL-11': 'Verification',
  'OL-12': 'Provider config',
  'OL-13': 'Filter registry',
  'OL-14': 'Compose message',
  'OL-15': 'Send (gated)',
  'OL-16': 'Confirm discard',
  'OL-17': 'Inspector detail',
  'OL-18': 'Density',
  'OL-19': 'Keyboard shortcuts',
  'OL-20': 'Status detail',
  'RO-01': 'Partner create',
  'RO-02': 'Partner terms',
  'RO-03': 'Partner status',
  'RO-04': 'Commission detail',
  'RO-05': 'Commission review',
  'RO-06': 'Commission approval',
  'RO-07': 'Payout detail',
  'RO-08': 'Record payment',
  'RO-09': 'Referral link validation',
  'RO-10': 'QR validation',
  'RO-11': 'Print preview',
  'RO-12': 'Attribution exception',
  'RO-13': 'Attribution correction',
  'RO-14': 'Card variant',
  'RO-15': 'Partner assign',
  'RO-16': 'Link status',
  'RO-17': 'Proof status',
  'RO-18': 'Partner activity',
  'RO-19': 'Policy gate',
  'RO-20': 'Referral confirm',
};

export function overlayTitle(id: RegisteredOverlayId): string {
  return TITLES[id] ?? id;
}

export function isReferralOverlay(id: string): id is ReferralOverlayId {
  return id.startsWith('RO-');
}
