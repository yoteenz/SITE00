import type { PlatformActor, PlatformActorRole } from './types';

const INTERNAL: PlatformActorRole[] = ['SITE00_FOUNDER', 'SITE00_AUTHORIZED_FINANCE'];
const CLIENT: PlatformActorRole[] = ['CLIENT_OWNER', 'CLIENT_AUTHORIZED_FINANCE'];

export function canReadClientOrg(actor: PlatformActor, clientOrgId: string): boolean {
  if (INTERNAL.includes(actor.role)) return true;
  if (CLIENT.includes(actor.role)) return actor.clientOrgId === clientOrgId;
  return false;
}

export function canAdminister(actor: PlatformActor): boolean {
  return INTERNAL.includes(actor.role);
}
