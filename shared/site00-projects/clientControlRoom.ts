/**
 * B5.9R1 — Client Control Room section definitions (distinct from founder CTRL ROOM).
 */

export const CLIENT_CONTROL_ROOM_SECTIONS = [
  { id: 'OVERVIEW', label: 'OVERVIEW' },
  { id: 'SITE_HEALTH', label: 'SITE HEALTH' },
  { id: 'CONNECTIONS', label: 'CONNECTIONS' },
  { id: 'ANALYTICS', label: 'ANALYTICS' },
  { id: 'ACCOUNT', label: 'ACCOUNT' },
] as const;

export type ClientControlRoomSectionId = (typeof CLIENT_CONTROL_ROOM_SECTIONS)[number]['id'];

/** Data fields clients must never see in control room surfaces */
export const CLIENT_CONTROL_ROOM_FIREWALL = [
  'PROVIDER_SPEND',
  'HIDDEN_PROMPTS',
  'FOUNDER_NOTES',
  'STUDIO_WORLD_INTELLIGENCE',
  'INTERNAL_QA',
  'SYSTEM_INSPECTOR',
  'OTHER_CLIENTS',
  'OTHER_PROJECTS',
] as const;

export function isClientControlRoomBlockedField(field: string): boolean {
  const upper = field.toUpperCase();
  return CLIENT_CONTROL_ROOM_FIREWALL.some((token) => upper.includes(token.replace(/_/g, ' ')) || upper.includes(token));
}

export const FOUNDER_CONTROL_ROOM_SECTIONS = [
  { id: 'PORTFOLIO', label: 'PORTFOLIO' },
  { id: 'DIAGNOSTICS', label: 'DIAGNOSTICS' },
  { id: 'PROVIDERS', label: 'PROVIDERS' },
  { id: 'DEPLOYMENTS', label: 'DEPLOYMENTS' },
  { id: 'CLIENTS', label: 'CLIENTS' },
  { id: 'QA', label: 'QA' },
] as const;
