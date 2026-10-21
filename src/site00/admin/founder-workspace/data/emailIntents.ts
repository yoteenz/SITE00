import type { WsChipKind } from '../shell/wsKit';

const human = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ').toUpperCase() : '—');

/** Send-intent status → chip. Only a provider-confirmed status reads as delivered; DRY RUN is a policy state, never "sent". */
export function intentChip(status: string | undefined): [WsChipKind, string] {
  switch (status) {
    case 'DRY_RUN':
      return ['policy', 'DRY RUN'];
    case 'QUEUED':
      return ['unver', 'QUEUED · NOT SENT'];
    case 'ACCEPTED':
      return ['unver', 'ACCEPTED BY PROVIDER'];
    case 'DELIVERED':
      return ['ok', 'DELIVERED'];
    case 'BOUNCED':
      return ['fail', 'BOUNCED'];
    case 'FAILED':
      return ['fail', 'FAILED'];
    case 'BLOCKED':
      return ['policy', 'BLOCKED BY POLICY'];
    default:
      return ['muted', human(status)];
  }
}
