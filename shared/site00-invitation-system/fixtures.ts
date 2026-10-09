import { aioOfficeInvitationCodeValue } from './campaigns/aioInvitation001.js';

export const FIXTURE_INVITATION_CODES = {
  AIO_OFFICE_SHARED: aioOfficeInvitationCodeValue(),
  UNKNOWN: 'unknown-invitation-code',
  EXPIRED: 'expired-invitation-fixture',
  REVOKED: 'revoked-invitation-fixture',
} as const;
