/**
 * Canonical JURNL family / route registry (W0.7).
 */

export type FamilyNavSlot = 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT' | null;

export type JurnlFamilyRegistration = {
  family_id: string;
  name: string;
  route: string;
  parent_component: 'ParentAuthorityScreen' | 'TodayScreen' | 'ActivityScreen' | 'EntryScreens';
  status: 'LIVE' | 'PLACEHOLDER' | 'STRUCTURE_ONLY';
  enabled: boolean;
  navigation_visibility: FamilyNavSlot;
  requires_setup: boolean;
  requires_auth: boolean;
  dependencies: string[];
  expression_status: 'FROZEN' | 'PASS' | 'UNREVIEWED';
  visual_status: 'PARENT_PLACEHOLDER' | 'LIVE';
  functional_status: 'PLACEHOLDER' | 'PARTIAL' | 'LIVE';
  approval_status: 'UNREVIEWED' | 'IN_REVIEW';
  launch_status: 'NOT_READY';
};

export const JURNL_FAMILY_REGISTRY: readonly JurnlFamilyRegistration[] = [
  { family_id: 'F01', name: 'ENTRY', route: 'entry', parent_component: 'EntryScreens', status: 'LIVE', enabled: true, navigation_visibility: null, requires_setup: false, requires_auth: false, dependencies: [], expression_status: 'PASS', visual_status: 'LIVE', functional_status: 'PARTIAL', approval_status: 'IN_REVIEW', launch_status: 'NOT_READY' },
  { family_id: 'F02', name: 'SETUP', route: 'setup', parent_component: 'EntryScreens', status: 'LIVE', enabled: true, navigation_visibility: null, requires_setup: false, requires_auth: true, dependencies: ['F01'], expression_status: 'FROZEN', visual_status: 'LIVE', functional_status: 'PARTIAL', approval_status: 'IN_REVIEW', launch_status: 'NOT_READY' },
  { family_id: 'F03', name: 'TODAY', route: 'today', parent_component: 'TodayScreen', status: 'LIVE', enabled: true, navigation_visibility: 'HOME', requires_setup: true, requires_auth: true, dependencies: ['F02'], expression_status: 'FROZEN', visual_status: 'LIVE', functional_status: 'PARTIAL', approval_status: 'IN_REVIEW', launch_status: 'NOT_READY' },
  { family_id: 'F04', name: 'ACTIVITY', route: 'activity', parent_component: 'ActivityScreen', status: 'LIVE', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F03'], expression_status: 'FROZEN', visual_status: 'LIVE', functional_status: 'PARTIAL', approval_status: 'IN_REVIEW', launch_status: 'NOT_READY' },
  { family_id: 'F05', name: 'MONEY', route: 'money', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: 'MONEY', requires_setup: true, requires_auth: true, dependencies: ['F02'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F06', name: 'INCOME', route: 'income', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F05'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F07', name: 'UPCOMING', route: 'upcoming', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F02'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F08', name: 'PLAN', route: 'plan', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: 'PLAN', requires_setup: true, requires_auth: true, dependencies: ['F06', 'F07'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F09', name: 'SAFE TO SPEND', route: 'safe', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F05', 'F07'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F10', name: 'PURCHASES', route: 'purchases', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F09'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F11', name: 'TRIPS', route: 'trips', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F08'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F12', name: 'CREDIT', route: 'credit', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: 'CREDIT', requires_setup: true, requires_auth: true, dependencies: ['F05'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F13', name: 'PAYDOWN', route: 'paydown', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F12'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F14', name: 'GOALS', route: 'goals', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F08'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F15', name: 'AHEAD', route: 'ahead', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F06', 'F14'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
  { family_id: 'F16', name: 'RECORDS', route: 'records', parent_component: 'ParentAuthorityScreen', status: 'PLACEHOLDER', enabled: true, navigation_visibility: null, requires_setup: true, requires_auth: true, dependencies: ['F05'], expression_status: 'PASS', visual_status: 'PARENT_PLACEHOLDER', functional_status: 'PLACEHOLDER', approval_status: 'UNREVIEWED', launch_status: 'NOT_READY' },
] as const;

/** Product navigation discovery hubs (not review board). */
export const JURNL_FAMILY_DISCOVERY: Record<string, { label: string; targetFamily: string }[]> = {
  F03: [
    { label: 'UPCOMING', targetFamily: 'F07' },
    { label: 'SAFE TO SPEND', targetFamily: 'F09' },
  ],
  F05: [
    { label: 'INCOME', targetFamily: 'F06' },
    { label: 'RECORDS', targetFamily: 'F16' },
  ],
  F08: [
    { label: 'SAFE TO SPEND', targetFamily: 'F09' },
    { label: 'PURCHASES', targetFamily: 'F10' },
    { label: 'TRIPS', targetFamily: 'F11' },
    { label: 'GOALS', targetFamily: 'F14' },
    { label: 'AHEAD', targetFamily: 'F15' },
  ],
  F12: [{ label: 'PAYDOWN', targetFamily: 'F13' }],
};

/** Edges for structural blueprint reachability validation. */
export const JURNL_PRODUCT_DISCOVERY_EDGES: { from: string; to: string }[] = [
  { from: 'F03.00', to: 'F04.00' },
  ...JURNL_FAMILY_DISCOVERY.F03!.map((l) => ({ from: 'F03.00', to: `${l.targetFamily}.00` })),
  ...JURNL_FAMILY_DISCOVERY.F05!.map((l) => ({ from: 'F05.00', to: `${l.targetFamily}.00` })),
  ...JURNL_FAMILY_DISCOVERY.F08!.map((l) => ({ from: 'F08.00', to: `${l.targetFamily}.00` })),
  ...JURNL_FAMILY_DISCOVERY.F12!.map((l) => ({ from: 'F12.00', to: `${l.targetFamily}.00` })),
];

export function resolveFamilyRoute(familyId: string): string {
  const row = JURNL_FAMILY_REGISTRY.find((f) => f.family_id === familyId);
  if (!row) return familyId.replace(/^\/+/, '');
  return row.route;
}
