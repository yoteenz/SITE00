/** Cross-family navigation links (W1.2). */

import { resolveFamilyRoute } from './familyRegistry';

export type FamilyLinkRelationship =
  | 'VIEW_DETAILS'
  | 'MANAGE'
  | 'SEE_ACTIVITY'
  | 'DISCOVERY'
  | 'SETTINGS';

export type FamilyLink = {
  link_id: string;
  source_family_id: string;
  destination_family_id: string;
  destination_node_id: string;
  relationship_type: FamilyLinkRelationship;
  label: string;
  requires_setup: boolean;
};

export const JURNL_FAMILY_LINKS: readonly FamilyLink[] = [
  { link_id: 'F03.TO.F04', source_family_id: 'F03', destination_family_id: 'F04', destination_node_id: 'F04.00', relationship_type: 'SEE_ACTIVITY', label: 'ACTIVITY', requires_setup: true },
  { link_id: 'F03.TO.F07', source_family_id: 'F03', destination_family_id: 'F07', destination_node_id: 'F07.00', relationship_type: 'DISCOVERY', label: 'UPCOMING', requires_setup: true },
  { link_id: 'F03.TO.F09', source_family_id: 'F03', destination_family_id: 'F09', destination_node_id: 'F09.00', relationship_type: 'DISCOVERY', label: 'SAFE TO SPEND', requires_setup: true },
  { link_id: 'F03.TO.SETTINGS', source_family_id: 'F03', destination_family_id: 'GLOBAL', destination_node_id: 'GS.SETTINGS', relationship_type: 'SETTINGS', label: 'ACCOUNT', requires_setup: false },
];

export function resolveFamilyLinkTarget(link: FamilyLink): string {
  if (link.destination_node_id === 'GS.SETTINGS') return 'account';
  return resolveFamilyRoute(link.destination_family_id);
}

export function linksFromFamily(familyId: string): FamilyLink[] {
  return JURNL_FAMILY_LINKS.filter((l) => l.source_family_id === familyId);
}
