/**
 * JURNL STRUCTURAL BLUEPRINT GENERATOR.
 *
 *   npx tsx scripts/jurnl/structural-blueprint/build.ts          # write docs/jurnl/structural-completion/
 *   npx tsx scripts/jurnl/structural-blueprint/build.ts --check  # exit 1 if the committed artifacts drift
 *
 * F01–F04 nodes come from the live family contracts and screen data. F05–F16, global systems, data domains,
 * primitives, icons, blockers and waves come from model.ts. Output is deterministic (no clock, no git calls).
 * Zero generation: nothing here calls a provider.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JURNL_F01_CONTRACT } from '../../../src/projects/jurnl/data/f01/contract';
import { JURNL_F02_CONTRACT } from '../../../src/projects/jurnl/data/f02/contract';
import { JURNL_F03_CONTRACT } from '../../../src/projects/jurnl/data/f03/contract';
import { JURNL_F04_CONTRACT } from '../../../src/projects/jurnl/data/f04/contract';
import { F01_STATES } from '../../../src/projects/jurnl/data/f01/screens';
import { F02_NEXT, F02_SCREENS } from '../../../src/projects/jurnl/data/f02/screens';
import { F02_OVERLAYS } from '../../../src/projects/jurnl/data/f02/interactionBindings';
import { PARENTS } from '../../../src/projects/jurnl/data/parents/catalog';
import { JURNL_PRODUCT_DISCOVERY_EDGES } from '../../../src/projects/jurnl/data/foundation/familyRegistry';
import { JURNL_CAPABILITIES } from '../../../src/projects/jurnl/data/monetization/capabilities';
import {
  AUTHORED_FAMILIES,
  BLOCKERS,
  DATA_DOMAINS,
  F01_F04_ADDITIONS,
  FAMILY_CANON,
  FOUNDER_FLAGS,
  GLOBAL_SYSTEMS,
  ICON_REQUIREMENTS,
  REUSABLE_CANDIDATES,
  ROLE_MAP,
  SHARED_PRIMITIVES,
  WAVE_TASKS,
  WAVE_TITLES,
  type GapClass,
  type IxStatus,
  type NodeType,
  type StructuralForm,
  type Wave,
} from './model';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
export const OUT_DIR = join(ROOT, 'docs/jurnl/structural-completion');
const SPRINT = 'P0.JURNL.COMPLETE-PRODUCT-BLUEPRINT-STRUCTURAL-COMPLETION-FORENSIC1';
const AUDITED_MAIN = '6692bdd4';
const AUDIT_DATE = '2026-10-05';

/* ───────────────────────── criteria ───────────────────────── */

const CRITERIA = [
  ['R', 'route_or_invocation', 'The node is reachable: a route mounts it, or a named interaction opens it.'],
  ['U', 'ui_shell', 'The intended layout and regions exist and bind data (a static spec counts half).'],
  ['D', 'data_contract', 'A typed contract with a working persistent adapter for the person’s own data. Device persistence counts; mock constants, memory and session-only storage count half.'],
  ['I', 'core_interaction', 'The node’s job can be done end to end. Provider-simulated flows count half.'],
  ['S', 'state_transitions', 'States are driven by real data or user action. Preview-forced (?state=) only counts half.'],
  ['V', 'validation', 'Inputs are validated before writes, with field-level feedback.'],
  ['E', 'error', 'A failure renders a recoverable error, never a dead end.'],
  ['M', 'empty', 'No data renders a purposeful empty state.'],
  ['L', 'loading', 'Pending reads render a loading state.'],
  ['P', 'responsive', 'Holds at 393×852, 834×1194 and 1440×900 under the global composition + containment rules.'],
  ['A', 'accessibility_semantics', 'Roles, labels, focus management and live regions are present.'],
  ['N', 'navigation_return_path', 'There is a way back to where the person came from.'],
] as const;
type CKey = (typeof CRITERIA)[number][0];
type CVal = 1 | 0.5 | 0 | null;
type Criteria = Record<CKey, CVal>;

function parseCriteria(spec: string): Criteria {
  const out = {} as Criteria;
  for (const [k] of CRITERIA) out[k] = null;
  const re = /([RUDISVEMLPAN])(1|h|0|-)/g;
  let m: RegExpExecArray | null;
  let seen = 0;
  while ((m = re.exec(spec))) {
    out[m[1] as CKey] = m[2] === '1' ? 1 : m[2] === 'h' ? 0.5 : m[2] === '0' ? 0 : null;
    seen++;
  }
  if (seen !== 12) throw new Error(`criteria must list 12 tokens: ${spec}`);
  return out;
}
const criteriaScore = (c: Criteria) => {
  const vals = Object.values(c).filter((v): v is 1 | 0.5 | 0 => v !== null);
  return vals.length ? vals.reduce((a: number, b) => a + b, 0) / vals.length : 1;
};
const fullCriteria = (c: Criteria): Criteria => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v === null ? null : 1])) as Criteria;
const zeroFor = (form: StructuralForm, type: NodeType): string => {
  if (type === 'MODAL') return 'R0 U0 D0 I0 S0 V- E0 M- L0 P0 A0 N0';
  if (form === 'EXPANDED_STATE' || form === 'INLINE_STATE') return 'R0 U0 D0 I0 S0 V- E- M0 L- P0 A0 N-';
  if (form === 'SHEET' || form === 'DRAWER' || type === 'SHEET' || type === 'DRAWER') return 'R0 U0 D0 I0 S0 V0 E0 M- L0 P0 A0 N0';
  return 'R0 U0 D0 I0 S0 V- E0 M0 L0 P0 A0 N0';
};

/* ───────────────────────── graph node ───────────────────────── */

type StateStatus = 'LIVE' | 'SIMULATED' | 'FORCED_ONLY' | 'MISSING';

export type GNode = {
  node_id: string;
  family_id: string;
  parent_id: string | null;
  node_type: NodeType;
  name: string;
  purpose: string;
  route: string | null;
  route_status: string;
  implementation_status: 'IMPLEMENTED' | 'PARTIAL' | 'PLACEHOLDER' | 'MISSING';
  functional_status: GapClass;
  visual_status: 'VISUALLY_IMPLEMENTED' | 'INVALID_EXPRESSION' | 'PARTIAL_EXPRESSION' | 'NOT_IMPLEMENTED' | 'NOT_APPLICABLE';
  approval_status: string;
  launch_status: string;
  data_dependencies: string[];
  interaction_dependencies: string[];
  auth_requirements: string;
  responsive_requirements: string;
  accessibility_requirements: string;
  analytics_events: string[];
  SEO_requirement: string;
  expression_status: string;
  reference_requirement: string;
  generation_requirement: {
    generation_required: boolean;
    required_for_functional: false;
    generation_class: string;
    reference_required: boolean;
    reference_source: string | null;
    authority_parent: string | null;
    sidekick_required: boolean;
    icon_generation_required: boolean;
    expected_generation_group: string | null;
  };
  plate_policy: string;
  icon_requirements: string[];
  reusable_capability_candidate: string | null;
  notes: string[];
  structural_form: StructuralForm | null;
  inheritance_class: string | null;
  progression: { structural: 'PLANNED' | 'STRUCTURED' | 'FUNCTIONAL'; visual: string; release: string };
  functional_criteria: Criteria | null;
  functional_score: number;
  target_wave: Wave | null;
  evidence: string[];
  opens: string | null;
  // internal (stripped from output)
  _ix?: IxStatus;
  _state?: StateStatus;
  _criteriaTarget?: Criteria | null;
  _visualScope: boolean;
  _functionalScope: boolean;
  _gapOverride?: GapClass;
  _reachedFrom: string[];
};

const RESP = 'RESP.JURNL — 393×852 / 834×1194 / 1440×900; left rail, open right plate, centered nav; 10px floor; 24×24 targets; 0 containment drift.';
const A11Y = 'A11Y.JURNL — landmark + h1; labelled controls; dialog / alertdialog with focus trap + Escape; role=alert errors; aria-live status; reduced motion.';

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const pct = (x: number) => Math.round(x * 1000) / 10;
const slug = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const famOf = (id: string) => (/^F\d\d/.exec(id)?.[0] ?? 'GLOBAL');

function base(p: Partial<GNode> & Pick<GNode, 'node_id' | 'node_type' | 'name' | 'purpose'>): GNode {
  const family = p.family_id ?? famOf(p.node_id);
  return {
    family_id: family,
    parent_id: null,
    route: null,
    route_status: 'NOT_A_ROUTE',
    implementation_status: 'MISSING',
    functional_status: 'MISSING',
    visual_status: 'NOT_APPLICABLE',
    approval_status: 'NOT_APPLICABLE',
    launch_status: 'NOT_LIVE — INTERNAL DESIGN-PREVIEW ONLY',
    data_dependencies: [],
    interaction_dependencies: [],
    auth_requirements: family === 'F01' ? 'PRE_AUTH (PUBLIC ENTRY)' : 'AUTHENTICATED, USER-SCOPED',
    responsive_requirements: RESP,
    accessibility_requirements: A11Y,
    analytics_events: [],
    SEO_requirement: 'AUTHENTICATED_NOINDEX',
    expression_status: 'NOT_APPLICABLE',
    reference_requirement: 'NONE',
    generation_requirement: {
      generation_required: false,
      required_for_functional: false,
      generation_class: 'NONE',
      reference_required: false,
      reference_source: null,
      authority_parent: null,
      sidekick_required: false,
      icon_generation_required: false,
      expected_generation_group: null,
    },
    plate_policy: 'NO_PLATE_REQUIRED',
    icon_requirements: [],
    reusable_capability_candidate: null,
    notes: [],
    structural_form: null,
    inheritance_class: null,
    progression: { structural: 'PLANNED', visual: 'NONE', release: 'NONE' },
    functional_criteria: null,
    functional_score: 0,
    target_wave: null,
    evidence: [],
    opens: null,
    _visualScope: false,
    _functionalScope: true,
    _reachedFrom: [],
    ...p,
  } as GNode;
}

/* ───────────────────────── repo truth readers ───────────────────────── */

type TreeNode = { node_id: string; node_type: string; expression_class?: string; environment_policy?: string; distinct_authority_required?: boolean; product_job?: string };
function readExpressionTrees(): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();
  for (const dir of readdirSync(join(ROOT, 'JURNL')).filter((d) => /^F\d\d_/.test(d))) {
    const fam = dir.slice(0, 3);
    const file = join(ROOT, 'JURNL', dir, 'MANIFEST', `${fam}_EXPRESSION_TREE.json`);
    if (!existsSync(file)) continue;
    const tree = JSON.parse(readFileSync(file, 'utf8')) as { nodes?: TreeNode[] };
    for (const n of tree.nodes ?? []) map.set(n.node_id, n);
  }
  return map;
}
function runtimeIconNames(): string[] {
  const src = readFileSync(join(ROOT, 'src/projects/jurnl/runtime/components/icons.tsx'), 'utf8');
  const block = /export type JurnlIconName =([\s\S]*?);/.exec(src)?.[1] ?? '';
  return [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!);
}

/* ───────────────────────── F01–F04 from contracts ───────────────────────── */

const F01_SCREEN_CRITERIA: Record<string, string> = {
  'F01.00': 'R1 U1 D- I1 S1 V- E- M- L- P1 A1 N-',
  'F01.01': 'R1 U1 Dh I1 S1 V1 E1 M- L1 P1 A1 N1',
  'F01.02': 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1',
  'F01.03': 'R1 U1 Dh I1 S1 V1 E1 M- L1 P1 A1 N1',
  'F01.04': 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1',
  'F01.05': 'R1 U1 Dh Ih S1 V1 E1 M- L1 P1 A1 N1',
  'F01.06': 'R1 U1 D- Ih S1 V- E1 M- L- P1 A1 N1',
  'F01.07': 'R1 U1 Dh Ih S1 V1 E1 M- L1 P1 A1 N1',
  'F01.08': 'R1 U1 D- I1 S- V- E- M- L- P1 A1 N1',
  'F01.09': 'R1 U1 D1 Ih S1 V- E1 M- L- P1 A1 N1',
  'F01.10': 'R1 U1 D1 I1 S1 V- E1 M- L- P1 A1 N1',
  'F01.11': 'R1 U1 D1 Ih S1 V- E- M- L- P1 A1 N1',
  'F01.12': 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1',
  'F01.13': 'R1 U1 D- I1 S- V- E- M- L- P1 A1 N1',
  'F01.14': 'R1 U1 D- I1 S- V- E- M- L- P1 A1 Nh',
  'F01.15': 'R1 U1 D- I1 S- V- E- M- L- P1 A1 Nh',
  'F01.16': 'R1 U1 D- I1 S- V- E- M- L- P1 A1 Nh',
};
const F01_SCREEN_NOTES: Record<string, string> = {
  'F01.14': 'ENTRY V2 PARENT 02 (AUTHORITY + PLATE). THE AUTHORITY HAS NO IN-PAGE BACK CONTROL; SYSTEM BACK RETURNS TO WELCOME.',
  'F01.15': 'ENTRY V2 PARENT 03 (AUTHORITY + PLATE). THE AUTHORITY HAS NO IN-PAGE BACK CONTROL; SYSTEM BACK RETURNS TO VALUE PROPOSITION.',
  'F01.16': 'ENTRY V2 PARENT 04 (AUTHORITY + PLATE). THE AUTHORITY HAS NO IN-PAGE BACK CONTROL; SYSTEM BACK RETURNS TO KEY BENEFITS.',
  'F01.01': 'ACCOUNT PERSISTENCE IS UNRESOLVED IN THE F01 CONTRACT (PREVIEW ADAPTER, DEVICE STORAGE).',
  'F01.02': 'NO EMAIL IS SENT; VERIFICATION LINK IS SIMULATED.',
  'F01.04': 'BIOMETRIC UNLOCK RUNS ON THE SIMULATED NATIVE BRIDGE.',
  'F01.05': 'RESET EMAIL IS SIMULATED.',
  'F01.06': 'RESET EMAIL IS SIMULATED.',
  'F01.07': 'RESET TOKEN IS SIMULATED.',
  'F01.09': 'BIOMETRIC PERMISSION RUNS ON THE SIMULATED NATIVE BRIDGE.',
  'F01.11': 'DATA EXPORT RECORDS A REQUEST FLAG ONLY. THESE CONTROLS HAVE NO POST-ENTRY HOME (GS.SETTINGS).',
  'F01.12': 'SESSIONS LIST IS A PREVIEW LIST. NO POST-ENTRY HOME (GS.SETTINGS).',
};
const F01_SIMULATED_STATES = new Set([
  'F01.02.RESENT',
  'F01.02.EXPIRED_LINK',
  'F01.02.VERIFICATION_SUCCESS',
  'F01.06.RESET_EMAIL_SENT',
  'F01.07.INVALID_RESET_LINK',
  'F01.09.BIOMETRIC_PROMPT',
  'F01.09.BIOMETRIC_ENABLED',
  'F01.09.BIOMETRIC_DECLINED',
  'F01.09.BIOMETRIC_UNAVAILABLE',
  'F01.10.DEVICE_VERIFY_REQUIRED',
  'F01.04.SESSION_EXPIRED',
  'F01.04.REAUTHENTICATION',
]);
const F01_PARTIAL_IX: Record<string, string> = {
  'F01.01.SOCIAL.APPLE': 'PROVIDER_NOT_CONFIGURED.',
  'F01.01.SOCIAL.GOOGLE': 'PROVIDER_NOT_CONFIGURED.',
  'F01.03.SOCIAL.APPLE': 'PROVIDER_NOT_CONFIGURED.',
  'F01.03.SOCIAL.GOOGLE': 'PROVIDER_NOT_CONFIGURED.',
  'F01.02.HANDOFF.MAIL': 'NO EMAIL IS SENT.',
  'F01.06.HANDOFF.MAIL': 'NO EMAIL IS SENT.',
  'F01.02.RESEND.SUCCESS': 'NO EMAIL IS SENT.',
  'F01.06.RESEND.TOAST': 'NO EMAIL IS SENT.',
  'F01.02.SUCCESS.VERIFY': 'VERIFICATION LINK IS SIMULATED.',
  'F01.02.ERROR.EXPIRED': 'LINK EXPIRY IS SIMULATED.',
  'F01.06.ERROR.EXPIRED': 'LINK EXPIRY IS SIMULATED.',
  'F01.02.CHANGE.EMAIL': 'CHANGE EMAIL UPDATES THE PREVIEW ACCOUNT ONLY.',
  'F01.04.HANDOFF.FACEID': 'SIMULATED NATIVE BRIDGE.',
  'F01.04.ERROR.FACEID': 'SIMULATED NATIVE BRIDGE.',
  'F01.09.HANDOFF.ENABLE': 'SIMULATED NATIVE BRIDGE.',
  'F01.09.SUCCESS.ENABLED': 'SIMULATED NATIVE BRIDGE.',
  'F01.09.DENIED.SHEET': 'SIMULATED NATIVE BRIDGE.',
  'F01.09.UNSUPPORTED.PANEL': 'SIMULATED NATIVE BRIDGE.',
  'F01.05.SUBMIT.LOADING': 'RESET EMAIL IS SIMULATED.',
  'F01.07.SUBMIT.LOADING': 'RESET TOKEN IS SIMULATED.',
  'F01.11.DRAWER.DATA_EXPORT': 'EXPORT RECORDS A FLAG; NOTHING IS EXPORTED.',
  'F01.12.SURFACE.SESSION_MANAGEMENT': 'PREVIEW SESSION LIST.',
};
const F01_SURFACE_CRITERIA: Record<string, string> = {
  CHANGE_EMAIL: 'R1 U1 Dh Ih S1 V1 E1 M- L1 P1 A1 N1',
  DATA_EXPORT: 'R1 U1 D1 Ih S1 V- E- M- L- P1 A1 N1',
  SESSION_MANAGEMENT: 'R1 U1 Dh Ih S1 V- E1 M- L1 P1 A1 N1',
  REMOVE_ACCESS: 'R1 U1 Dh Ih S1 V- E- M- L- P1 A1 N1',
  USE_PASSWORD: 'R1 U1 Dh I1 S1 V1 E1 M- L1 P1 A1 N1',
  PERMISSION_DENIED: 'R1 U1 D1 Ih S1 V- E- M- L- P1 A1 N1',
};
const SURFACE_DEFAULT_DONE = 'R1 U1 D- I1 S- V- E- M- L- P1 A1 N1';

type ContractIx = { id: string; type: string; sourceScreen: string; trigger: string; navigationResult?: string; sharing?: string };
type ContractScreen = { id: string; name: string; role: string; runtimeRoute: string; approvalStatus: string };
type ContractState = { id: string; screenId: string; label?: string };

function contractIxOpens(ix: ContractIx): string | null {
  const nav = ix.navigationResult ?? '';
  if (/FAMILY_02/.test(nav)) return 'F02.00';
  const m = /F0\d\.\d\d/.exec(nav);
  return m ? m[0] : null;
}

/* ───────────────────────── build ───────────────────────── */

export function buildBlueprint() {
  const trees = readExpressionTrees();
  const nodes: GNode[] = [];
  const add = (n: GNode) => {
    if (nodes.some((x) => x.node_id === n.node_id)) throw new Error(`duplicate node ${n.node_id}`);
    nodes.push(n);
    return n;
  };
  const treeInfo = (id: string) => {
    const t = trees.get(id);
    return t
      ? {
          inheritance_class: ['DIRECT_INHERITANCE', 'MODULATED_INHERITANCE', 'DISTINCT_SUB_EXPRESSION'].includes(t.expression_class ?? '') ? t.expression_class! : t.node_type === 'PARENT' ? 'FAMILY_PARENT' : t.expression_class ?? null,
          plate_policy: t.environment_policy ?? 'NO_PLATE_REQUIRED',
          expression_status: 'DEFINED_IN_EXPRESSION_TREE',
          distinct: !!t.distinct_authority_required,
        }
      : null;
  };
  const capsFor = (fam: string) => JURNL_CAPABILITIES.filter((c) => c.families.includes(fam));

  /* —— F01 —— */
  const c1 = JURNL_F01_CONTRACT as unknown as { screens: ContractScreen[]; interactions: ContractIx[] };
  for (const s of c1.screens) {
    const isParent = s.role === 'PARENT';
    const t = treeInfo(s.id);
    add(
      base({
        node_id: s.id,
        family_id: 'F01',
        parent_id: isParent ? null : 'F01.00',
        node_type: isParent ? 'FAMILY_PARENT' : 'CHILD_PAGE',
        name: s.name,
        purpose: trees.get(s.id)?.product_job?.toUpperCase() ?? s.name,
        route: s.runtimeRoute,
        route_status: 'LIVE',
        implementation_status: 'IMPLEMENTED',
        visual_status: 'VISUALLY_IMPLEMENTED',
        approval_status: s.approvalStatus,
        expression_status: t?.expression_status ?? 'DEFINED',
        reference_requirement: isParent ? 'OWN_AUTHORITY (FOUNDER-APPROVED)' : 'F01.00 PARENT AUTHORITY',
        plate_policy: t?.plate_policy ?? 'MODULATE_PARENT_PLATE',
        inheritance_class: t?.inheritance_class ?? null,
        structural_form: 'ROUTE',
        functional_criteria: parseCriteria(F01_SCREEN_CRITERIA[s.id]!),
        target_wave: 5,
        evidence: ['src/projects/jurnl/data/f01/contract.ts', 'src/projects/jurnl/runtime/screens/{Entry,Recovery,Security}Screens.tsx'],
        notes: F01_SCREEN_NOTES[s.id] ? [F01_SCREEN_NOTES[s.id]!] : [],
        data_dependencies: isParent ? [] : ['DD.IDENTITY', 'DD.SESSION_DEVICE'],
        _visualScope: true,
        _reachedFrom: isParent ? [] : [],
      }),
    );
  }
  for (const st of F01_STATES as unknown as ContractState[]) {
    const simulated = F01_SIMULATED_STATES.has(st.id);
    add(
      base({
        node_id: st.id,
        family_id: 'F01',
        parent_id: st.screenId,
        node_type: 'STATE',
        name: st.id.split('.').slice(2).join(' ').replace(/_/g, ' '),
        purpose: `STATE OF ${st.screenId}.`,
        implementation_status: 'IMPLEMENTED',
        expression_status: 'DEFINED_IN_EXPRESSION_TREE',
        target_wave: simulated ? 5 : null,
        evidence: ['src/projects/jurnl/data/f01/screens.ts F01_STATES'],
        notes: simulated ? ['PROVIDER-SIMULATED (EMAIL / NATIVE / SESSION).'] : [],
        _state: simulated ? 'SIMULATED' : 'LIVE',
      }),
    );
  }
  const f01Surfaces = new Map<string, string>();
  for (const ix of c1.interactions) {
    const global = ix.sourceScreen === 'GLOBAL';
    const partial = F01_PARTIAL_IX[ix.id];
    const surfaceType: NodeType | null = global ? null : ix.type === 'bottom_drawer' ? 'DRAWER' : ix.type === 'full_screen_sheet' ? 'SHEET' : ix.type === 'modal' ? 'MODAL' : null;
    let opens = contractIxOpens(ix);
    if (surfaceType) {
      const tag = surfaceType === 'DRAWER' ? 'DR' : surfaceType === 'SHEET' ? 'SH' : 'MD';
      const sid = `${ix.sourceScreen}.${tag}.${slug(ix.trigger)}`;
      const key = slug(ix.trigger);
      const crit = F01_SURFACE_CRITERIA[key] ?? (key === 'SIGN_OUT' || key === 'SWITCH_ACCOUNT' ? 'R1 U1 D1 I1 S1 V- E- M- L- P1 A1 N1' : SURFACE_DEFAULT_DONE);
      const critParsed = parseCriteria(crit);
      add(
        base({
          node_id: sid,
          family_id: 'F01',
          parent_id: ix.sourceScreen,
          node_type: surfaceType,
          name: ix.trigger,
          purpose: `${ix.trigger} — ${ix.sharing === 'shared_shell_distinct_content' ? 'SHARED DRAWER SHELL, DISTINCT CONTENT' : 'F01 SURFACE'}.`,
          implementation_status: 'IMPLEMENTED',
          visual_status: 'VISUALLY_IMPLEMENTED',
          approval_status: 'IMPLEMENTATION_READY',
          expression_status: 'DEFINED (F01 INTERACTION MANIFEST)',
          inheritance_class: 'DIRECT_INHERITANCE',
          structural_form: surfaceType === 'MODAL' ? 'MODAL' : surfaceType === 'SHEET' ? 'SHEET' : 'DRAWER',
          functional_criteria: critParsed,
          target_wave: criteriaScore(critParsed) < 1 ? 5 : null,
          evidence: ['JURNL/F01_ENTRY/MANIFEST/F01_INTERACTION_MANIFEST.json', `contract interaction ${ix.id}`],
          _visualScope: true,
          _reachedFrom: [ix.sourceScreen],
        }),
      );
      f01Surfaces.set(ix.id, sid);
      opens = sid;
    }
    add(
      base({
        node_id: ix.id,
        family_id: 'F01',
        parent_id: global ? 'F01.00' : ix.sourceScreen,
        node_type: 'INTERACTION',
        name: ix.trigger,
        purpose: `${ix.type.toUpperCase()} → ${ix.navigationResult ?? 'contextual'}`,
        implementation_status: 'IMPLEMENTED',
        target_wave: partial ? 5 : null,
        evidence: ['src/projects/jurnl/data/f01/contract.ts interactions'],
        notes: [...(global ? ['GLOBAL PRIMITIVE BEHAVIOUR DECLARED BY THE F01 CONTRACT.'] : []), ...(partial ? [partial] : [])],
        opens,
        analytics_events: ['trackActivity:jurnl_interaction'],
        _ix: partial ? 'PARTIAL' : 'WORKING',
      }),
    );
  }

  /* —— F02 —— */
  const c2 = JURNL_F02_CONTRACT as unknown as { screens: ContractScreen[]; states: ContractState[]; interactions: ContractIx[] };
  const f02Back = new Map(F02_SCREENS.map((s) => [s.id, s.back]));
  for (const s of c2.screens) {
    const role = s.role;
    const t = treeInfo(s.id);
    const inputs = ['F02.02.1', 'F02.03', 'F02.04', 'F02.05.1', 'F02.06'].includes(s.id);
    const crit = s.id === 'F02.02' ? 'R1 U1 Dh Ih S1 V- E1 M- L- P1 A1 N1' : inputs ? 'R1 U1 Dh I1 S1 V1 E1 M- L- P1 A1 N1' : 'R1 U1 Dh I1 S1 V- E- M- L- P1 A1 N1';
    add(
      base({
        node_id: s.id,
        family_id: 'F02',
        parent_id: role === 'PARENT' ? null : role === 'GRANDCHILD' ? f02Back.get(s.id) ?? 'F02.00' : 'F02.00',
        node_type: role === 'PARENT' ? 'FAMILY_PARENT' : role === 'GRANDCHILD' ? 'GRANDCHILD_PAGE' : 'CHILD_PAGE',
        name: s.name,
        purpose: trees.get(s.id)?.product_job?.toUpperCase() ?? s.name,
        route: s.runtimeRoute,
        route_status: s.id === 'F02.02' ? 'PARTIAL' : 'LIVE',
        implementation_status: 'IMPLEMENTED',
        visual_status: 'VISUALLY_IMPLEMENTED',
        approval_status: s.approvalStatus,
        expression_status: t?.expression_status ?? 'DEFINED',
        reference_requirement: role === 'PARENT' ? 'OWN_AUTHORITY' : 'OWN CHILD AUTHORITY (EXISTING)',
        plate_policy: t?.plate_policy ?? 'REUSE_PARENT_PLATE',
        inheritance_class: t?.inheritance_class ?? null,
        structural_form: 'ROUTE',
        functional_criteria: parseCriteria(crit),
        target_wave: s.id === 'F02.02' ? 1 : 0,
        data_dependencies: ['DD.SETUP_PROFILE'],
        evidence: ['src/projects/jurnl/data/f02/contract.ts', 'src/projects/jurnl/runtime/screens/SetupScreens.tsx'],
        notes: s.id === 'F02.02' ? ['CONNECT PATCHES THE DRAFT TO CONNECTED; NO AGGREGATOR EXISTS (B12).'] : ['SETUP DRAFT IS SESSION-ONLY (B01).'],
        _visualScope: true,
      }),
    );
  }
  for (const st of c2.states) {
    const sim = st.id === 'F02.02.CONNECTED';
    add(base({ node_id: st.id, family_id: 'F02', parent_id: st.screenId, node_type: 'STATE', name: st.id.split('.').pop()!, purpose: `STATE OF ${st.screenId}.`, implementation_status: 'IMPLEMENTED', expression_status: 'DEFINED_IN_EXPRESSION_TREE', target_wave: sim ? 1 : null, evidence: ['src/projects/jurnl/data/f02/contract.ts states'], notes: sim ? ['SIMULATED CONNECTION.'] : [], _state: sim ? 'SIMULATED' : 'LIVE' }));
  }
  const f02DrawerIds = [...new Set(Object.values(F02_OVERLAYS).flat())];
  const f02DrawerHosts = (o: string) => Object.entries(F02_OVERLAYS).filter(([, v]) => v.includes(o)).map(([k]) => k);
  for (const o of f02DrawerIds) {
    const crit = o === 'permission' ? 'R1 U1 D- Ih S1 V- E- M- L- P1 A1 N1' : o === 'add' ? 'R1 U1 Dh I1 S1 V1 E1 M- L- P1 A1 N1' : SURFACE_DEFAULT_DONE;
    const pc = parseCriteria(crit);
    add(base({ node_id: `F02.DR.${slug(o)}`, family_id: 'F02', parent_id: f02DrawerHosts(o)[0]!, node_type: 'DRAWER', name: o.toUpperCase(), purpose: `F02 ${o.toUpperCase()} DRAWER (HOSTS: ${f02DrawerHosts(o).join(', ')}).`, implementation_status: 'IMPLEMENTED', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'DIRECT_INHERITANCE', structural_form: 'DRAWER', functional_criteria: pc, target_wave: criteriaScore(pc) < 1 ? (o === 'permission' ? 1 : 0) : null, evidence: ['src/projects/jurnl/data/f02/interactionBindings.ts F02_OVERLAYS'], _visualScope: true, _reachedFrom: f02DrawerHosts(o) }));
  }
  const f02IxOpens: Record<string, string> = { 'F02.IN.PERMISSION': 'F02.DR.PERMISSION', 'F02.IN.ADD': 'F02.DR.ADD', 'F02.IN.SKIP': 'F02.DR.SKIP' };
  for (const ix of c2.interactions) {
    const partial = ix.id === 'F02.IN.PERMISSION';
    add(base({ node_id: ix.id, family_id: 'F02', parent_id: ix.sourceScreen, node_type: 'INTERACTION', name: ix.trigger, purpose: `${ix.type.toUpperCase()} → ${ix.navigationResult ?? ''}`, implementation_status: 'IMPLEMENTED', target_wave: partial ? 1 : null, opens: f02IxOpens[ix.id] ?? null, evidence: ['src/projects/jurnl/data/f02/contract.ts interactions'], notes: partial ? ['PERMISSION LEADS TO A SIMULATED CONNECTION.'] : [], analytics_events: ['trackActivity:jurnl_interaction'], _ix: partial ? 'PARTIAL' : 'WORKING' }));
  }

  /* —— F03 —— */
  const c3 = JURNL_F03_CONTRACT as unknown as { states: ContractState[]; interactions: ContractIx[] };
  add(
    base({
      node_id: 'F03.00', family_id: 'F03', node_type: 'FAMILY_PARENT', name: 'TODAY', purpose: 'THE DAILY HOME. ONE COMPUTED SIGNAL, THEN WHAT IS COMING AND WHAT JUST MOVED.', route: 'today', route_status: 'PARTIAL', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', reference_requirement: 'OWN_AUTHORITY (AUTHORITY-FIRST, UNREVIEWED)', plate_policy: 'NEW_PLATE_WITHIN_FAMILY', inheritance_class: 'FAMILY_PARENT', structural_form: 'ROUTE',
      functional_criteria: parseCriteria('R1 U1 Dh Ih Sh V- Eh Mh Lh P1 A1 N1'), target_wave: 3,
      data_dependencies: ['DD.SAFE_TO_SPEND', 'DD.OBLIGATIONS', 'DD.TRANSACTIONS', 'DD.SETUP_PROFILE', 'DD.CURRENCY'],
      evidence: ['src/projects/jurnl/runtime/screens/HomeScreens.tsx TodayScreen', 'src/projects/jurnl/data/home/money.ts'],
      notes: ['CASH = MOCK_CASH 8420; MOVEMENTS MOCK + IN-MEMORY; SAFE TO SPEND IGNORES SETUP OBLIGATIONS (B04).', 'DOC CONFLICT: CORE.md:295 SAYS THE F03 PLATE SHOULD BE REPLACED; EXPRESSION + REUSE MATRICES SAY PASS (B29).'],
      analytics_events: ['postToHost:route (design chamber)', 'trackActivity:jurnl_screen_view'], _visualScope: true,
    }),
  );
  add(base({ node_id: 'F03.SEE_WHY', family_id: 'F03', parent_id: 'F03.00', node_type: 'DRAWER', name: 'SEE WHY', purpose: 'EXPLAIN THE SAFE-TO-SPEND FACTORS. NOT A MODEL TRANSCRIPT.', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'MODULATED_INHERITANCE', plate_policy: 'MODULATE_PARENT_PLATE', structural_form: 'DRAWER', functional_criteria: parseCriteria('R1 U1 Dh Ih S- V- E- M- L- P1 A1 N1'), target_wave: 3, data_dependencies: ['DD.SAFE_TO_SPEND'], evidence: ['HomeScreens.tsx SeeWhySheet'], notes: ['ROWS ARE FAITHFUL TO THE FORMULA; THE FORMULA IS WRONG FOR SETUP OBLIGATIONS (B04).'], _visualScope: true, _reachedFrom: ['F03.00'] }));
  add(base({ node_id: 'F03.UPCOMING_DETAIL', family_id: 'F03', parent_id: 'F03.00', node_type: 'STATE', name: 'COMING (EXPANDED)', purpose: 'LOOK AHEAD AT WHAT IS COMING, ON THE PARENT.', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'MODULATED_INHERITANCE', plate_policy: 'NO_PLATE_REQUIRED', structural_form: 'EXPANDED_STATE', functional_criteria: parseCriteria('R1 U1 Dh I1 S1 V- E- Mh L- P1 A1 N1'), target_wave: 2, data_dependencies: ['DD.OBLIGATIONS'], evidence: ['HomeScreens.tsx COMING MORE/LESS'], _visualScope: true, _reachedFrom: ['F03.00'] }));
  for (const st of c3.states) {
    const live = /CONNECTED|PARTIAL/.test(st.id);
    add(base({ node_id: st.id, family_id: 'F03', parent_id: 'F03.00', node_type: 'STATE', name: st.label ?? st.id, purpose: 'STATE OF F03.00.', implementation_status: 'IMPLEMENTED', expression_status: 'DEFINED_IN_EXPRESSION_TREE', target_wave: live ? null : 0, evidence: ['src/projects/jurnl/data/f03/contract.ts', 'money.ts todayModeFromQuery'], notes: live ? [] : ['REACHABLE ONLY THROUGH ?state= (B10).'], _state: live ? 'LIVE' : 'FORCED_ONLY' }));
  }
  const F03_OPENS: Record<string, string> = { 'F03.IN.SEE_WHY': 'F03.SEE_WHY', 'F03.IN.QUICK_ADD': 'GLOBAL.SH.QUICK_ADD', 'F03.IN.ASK': 'GLOBAL.SH.ASK', 'F03.IN.UPCOMING': 'F03.UPCOMING_DETAIL', 'F03.IN.ACTIVITY': 'F04.00', 'F03.NAV.BACK': 'F02.08' };
  for (const ix of c3.interactions) {
    add(base({ node_id: ix.id, family_id: 'F03', parent_id: 'F03.00', node_type: 'INTERACTION', name: ix.trigger, purpose: ix.navigationResult ?? '', implementation_status: 'IMPLEMENTED', opens: F03_OPENS[ix.id] ?? null, evidence: ['src/projects/jurnl/data/f03/contract.ts'], notes: ix.id === 'F03.NAV.BACK' ? ['DAILY HOME BACK RETURNS TO SETUP (B17).'] : [], analytics_events: ['trackActivity:jurnl_interaction'], target_wave: ix.id === 'F03.NAV.BACK' ? 1 : null, _ix: 'WORKING' }));
  }

  /* —— F04 —— */
  const c4 = JURNL_F04_CONTRACT as unknown as { states: ContractState[]; interactions: ContractIx[] };
  add(
    base({
      node_id: 'F04.00', family_id: 'F04', node_type: 'FAMILY_PARENT', name: 'ACTIVITY', purpose: 'A CALM SEARCHABLE LEDGER OF MONEY MOVEMENT.', route: 'activity', route_status: 'PARTIAL', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', reference_requirement: 'OWN_AUTHORITY (UNREVIEWED)', plate_policy: 'NEW_PLATE_WITHIN_FAMILY', inheritance_class: 'FAMILY_PARENT', structural_form: 'ROUTE',
      functional_criteria: parseCriteria('R1 U1 Dh I1 S1 V- Eh Mh Lh P1 A1 N1'), target_wave: 1, data_dependencies: ['DD.TRANSACTIONS', 'DD.ACCOUNTS', 'DD.CATEGORIES'],
      evidence: ['HomeScreens.tsx ActivityScreen'], notes: ['LEDGER = MOCK_ENTRIES + IN-MEMORY ADDS; NO DATES; NO EDIT / DELETE.'], analytics_events: ['postToHost:route (design chamber)', 'trackActivity:jurnl_screen_view'], _visualScope: true,
    }),
  );
  add(base({ node_id: 'F04.SEARCH', family_id: 'F04', parent_id: 'F04.00', node_type: 'STATE', name: 'SEARCH', purpose: 'FIND A MOVEMENT.', implementation_status: 'IMPLEMENTED', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'MODULATED_INHERITANCE', plate_policy: 'MODULATE_PARENT_PLATE', structural_form: 'INLINE_STATE', functional_criteria: parseCriteria('R1 U1 Dh I1 S1 V- E- M1 L- P1 A1 N1'), target_wave: 0, data_dependencies: ['DD.TRANSACTIONS'], evidence: ['HomeScreens.tsx 160ms debounce'], _visualScope: true, _reachedFrom: ['F04.00'] }));
  add(base({ node_id: 'F04.DETAIL', family_id: 'F04', parent_id: 'F04.00', node_type: 'DRAWER', name: 'DETAIL', purpose: 'READ ONE MOVEMENT CLOSELY.', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'DISTINCT_SUB_EXPRESSION', plate_policy: 'NO_PLATE_REQUIRED', structural_form: 'DRAWER', functional_criteria: parseCriteria('R1 U1 Dh Ih S- V- E- M- L- P1 A1 N1'), target_wave: 1, data_dependencies: ['DD.TRANSACTIONS'], evidence: ['HomeScreens.tsx DetailSheet (read-only)'], _visualScope: true, _reachedFrom: ['F04.00'] }));
  add(base({ node_id: 'F04.DR.FILTER', family_id: 'F04', parent_id: 'F04.00', node_type: 'DRAWER', name: 'FILTER', purpose: 'ORGANIZE THE LEDGER: ACCOUNT, DIRECTION, STATUS, WHEN.', implementation_status: 'PARTIAL', visual_status: 'VISUALLY_IMPLEMENTED', approval_status: 'IN_REVIEW', expression_status: 'DEFINED_IN_EXPRESSION_TREE', inheritance_class: 'DIRECT_INHERITANCE', structural_form: 'DRAWER', functional_criteria: parseCriteria('R1 U1 Dh I1 S1 V- E- M- L- P1 A1 N1'), target_wave: 1, data_dependencies: ['DD.ACCOUNTS'], evidence: ['HomeScreens.tsx FilterSheet (hard-coded options)'], _visualScope: true, _reachedFrom: ['F04.00'] }));
  for (const st of c4.states) {
    const live = /FILTERED|NO_RESULTS/.test(st.id);
    add(base({ node_id: st.id, family_id: 'F04', parent_id: 'F04.00', node_type: 'STATE', name: st.id.split('.').pop()!, purpose: 'STATE OF F04.00.', implementation_status: 'IMPLEMENTED', expression_status: 'DEFINED_IN_EXPRESSION_TREE', target_wave: live ? null : 0, evidence: ['src/projects/jurnl/data/f04/contract.ts'], notes: live ? [] : ['REACHABLE ONLY THROUGH ?state= (B10).'], _state: live ? 'LIVE' : 'FORCED_ONLY' }));
  }
  const F04_OPENS: Record<string, string> = { 'F04.IN.SEARCH': 'F04.SEARCH', 'F04.IN.FILTER': 'F04.DR.FILTER', 'F04.IN.DETAIL': 'F04.DETAIL', 'F04.NAV.BACK': 'F03.00', 'F04.IN.QUICK_ADD': 'GLOBAL.SH.QUICK_ADD', 'F04.IN.ASK': 'GLOBAL.SH.ASK' };
  for (const ix of c4.interactions) {
    const partial = ix.id === 'F04.IN.FILTER';
    add(base({ node_id: ix.id, family_id: 'F04', parent_id: 'F04.00', node_type: 'INTERACTION', name: ix.trigger, purpose: ix.navigationResult ?? '', implementation_status: 'IMPLEMENTED', opens: F04_OPENS[ix.id] ?? null, target_wave: partial ? 1 : null, evidence: ['src/projects/jurnl/data/f04/contract.ts'], notes: partial ? ['OPTIONS ARE HARD-CODED (ACCOUNTS + WEEKDAYS).'] : [], analytics_events: ['trackActivity:jurnl_interaction'], _ix: partial ? 'PARTIAL' : 'WORKING' }));
  }

  /* —— F01–F04 additions —— */
  for (const group of F01_F04_ADDITIONS) {
    for (const a of group.nodes) {
      const isIx = a.type === 'INTERACTION';
      const crit = a.criteria ? parseCriteria(a.criteria) : isIx ? null : parseCriteria(zeroFor(a.form, a.type));
      const host = a.id.split('.').slice(0, 2).join('.');
      const parentId = /^F0\d\.\d\d$/.test(host) ? host : `${group.family}.00`;
      add(
        base({
          node_id: a.id, family_id: group.family, parent_id: parentId, node_type: a.type, name: a.name, purpose: a.purpose,
          implementation_status: a.current === 'IMPLEMENTED' ? (crit && criteriaScore(crit) < 1 ? 'PARTIAL' : 'IMPLEMENTED') : 'MISSING',
          visual_status: isIx ? 'NOT_APPLICABLE' : a.current === 'IMPLEMENTED' ? 'VISUALLY_IMPLEMENTED' : 'NOT_IMPLEMENTED',
          approval_status: isIx ? 'NOT_APPLICABLE' : a.current === 'IMPLEMENTED' ? 'IMPLEMENTATION_READY' : 'NOT_SUBMITTED',
          expression_status: isIx ? 'NOT_APPLICABLE' : 'INHERITED (GLOBAL JURNL PRIMITIVES)',
          inheritance_class: isIx ? null : 'DIRECT_INHERITANCE',
          structural_form: isIx ? null : a.form,
          functional_criteria: crit, target_wave: a.wave, opens: a.opens ?? null, evidence: [a.evidence],
          analytics_events: isIx ? ['trackActivity:jurnl_interaction'] : [],
          _ix: isIx ? a.status : undefined, _visualScope: !isIx, _reachedFrom: isIx ? [] : [parentId],
        }),
      );
    }
  }

  /* —— F05–F16 —— */
  for (const fam of AUTHORED_FAMILIES) {
    const spec = PARENTS.find((p) => p.id === fam.id)!;
    const pid = `${fam.id}.00`;
    const fail = spec.interference === 'FAIL';
    add(
      base({
        node_id: pid, family_id: fam.id, node_type: 'FAMILY_PARENT', name: spec.name, purpose: fam.productJob, route: spec.route, route_status: 'PLACEHOLDER', implementation_status: 'PLACEHOLDER',
        visual_status: fail ? 'INVALID_EXPRESSION' : 'VISUALLY_IMPLEMENTED', approval_status: 'READY_FOR_FOUNDER_REVIEW (UNREVIEWED)', expression_status: 'DEFINED_IN_EXPRESSION_TREE',
        reference_requirement: `OWN_AUTHORITY (${spec.plateOrigin})`, plate_policy: 'NEW_PLATE_WITHIN_FAMILY', inheritance_class: 'FAMILY_PARENT', structural_form: 'ROUTE',
        functional_criteria: parseCriteria('R1 Uh D0 I0 S0 V- E0 M0 L0 P1 A1 N1'), target_wave: fam.wave, data_dependencies: [...fam.owns, ...fam.reads],
        interaction_dependencies: fam.globalSystems,
        evidence: ['src/projects/jurnl/data/parents/catalog.ts', 'src/projects/jurnl/runtime/screens/ParentScreens.tsx', `JURNL/${fam.id}_*/MANIFEST/${fam.id}_EXPRESSION_TREE.json`],
        notes: [`STATIC PREVIEW SPEC: "${spec.question}" · SIGNAL "${spec.signal}" · CTA "${spec.cta}" DISABLED (NOT OPEN YET).`, `PLATE INTERFERENCE ${spec.interference}; ${spec.credits} CREDITS SPENT ON THE PARENT AUTHORITY.`],
        generation_requirement: { generation_required: fail, required_for_functional: false, generation_class: fail ? 'PARENT_AUTHORITY_REGEN' : 'NONE (AWAITS FOUNDER REVIEW)', reference_required: fail, reference_source: fail ? 'CURRENT PARENT AUTHORITY + FAMILY EXPRESSION BRIEF' : null, authority_parent: null, sidekick_required: false, icon_generation_required: false, expected_generation_group: fail ? 'VISUAL_TRACK.PARENT_REAUTHORITY' : null },
        analytics_events: ['postToHost:route (design chamber)', 'trackActivity:jurnl_screen_view'],
        _visualScope: true, _gapOverride: 'PLACEHOLDER',
      }),
    );
    for (const ch of fam.children) {
      const t = treeInfo(ch.id);
      const type: NodeType = ch.form === 'ROUTE' ? 'CHILD_PAGE' : ch.form === 'SHEET' ? 'SHEET' : ch.form === 'DRAWER' ? 'DRAWER' : 'STATE';
      const parentId = ch.parentId ?? pid;
      add(
        base({
          node_id: ch.id, family_id: fam.id, parent_id: parentId, node_type: type, name: ch.id.split('.')[1]!.replace(/_/g, ' '), purpose: ch.purpose, route: ch.route ?? null, route_status: ch.route ? 'MISSING' : 'NOT_A_ROUTE',
          implementation_status: 'MISSING', visual_status: 'NOT_IMPLEMENTED', approval_status: 'NOT_SUBMITTED', expression_status: t ? t.expression_status : 'NOT_DEFINED',
          reference_requirement: `${pid} PARENT AUTHORITY`, plate_policy: t?.plate_policy ?? 'REUSE_PARENT_PLATE', inheritance_class: t?.inheritance_class ?? 'MODULATED_INHERITANCE', structural_form: ch.form,
          functional_criteria: parseCriteria(zeroFor(ch.form, type)), target_wave: ch.wave, data_dependencies: [...fam.owns, ...fam.reads],
          evidence: [`JURNL expression tree node ${ch.id}: ${t ? `${t.inheritance_class} / ${t.plate_policy}` : 'not in tree'}`],
          generation_requirement: { generation_required: false, required_for_functional: false, generation_class: t?.plate_policy === 'MODULATE_PARENT_PLATE' ? 'OPTIONAL_PLATE_MODULATION' : 'NONE', reference_required: true, reference_source: `${pid} parent authority + ${fam.id} family expression brief`, authority_parent: pid, sidekick_required: false, icon_generation_required: false, expected_generation_group: t?.plate_policy === 'MODULATE_PARENT_PLATE' ? `VISUAL_TRACK.${fam.id}.MODULATION` : null },
          analytics_events: ch.route ? ['trackActivity:jurnl_screen_view'] : [],
          _visualScope: true, _reachedFrom: ch.reachedFrom,
        }),
      );
    }
    for (const s of fam.surfaces) {
      const host = fam.children.some((c) => c.id === s.openedBy) ? s.openedBy : pid;
      const readOnly = !s.writes?.length;
      const crit = s.type === 'MODAL' ? 'R0 U0 D0 I0 S0 V- E0 M- L0 P0 A0 N0' : readOnly ? 'R0 U0 D0 I0 S- V- E0 M0 L0 P0 A0 N0' : 'R0 U0 D0 I0 S0 V0 E0 M- L0 P0 A0 N0';
      add(base({ node_id: s.id, family_id: fam.id, parent_id: host, node_type: s.type, name: s.name, purpose: s.purpose, implementation_status: 'MISSING', visual_status: 'NOT_IMPLEMENTED', approval_status: 'NOT_SUBMITTED', expression_status: 'INHERITED (GLOBAL JURNL DRAWER / SHEET / MODAL)', inheritance_class: 'DIRECT_INHERITANCE', plate_policy: 'NO_PLATE_REQUIRED', structural_form: s.type, functional_criteria: parseCriteria(crit), target_wave: s.wave, data_dependencies: s.writes ?? fam.owns, reference_requirement: 'GLOBAL PRIMITIVE', evidence: ['AUTHORED: blueprint (CRUD / expression-tree interaction surface)'], _visualScope: true, _reachedFrom: [host] }));
    }
    for (const st of fam.states) {
      add(base({ node_id: st.id, family_id: fam.id, parent_id: pid, node_type: 'STATE', name: st.name, purpose: st.purpose, implementation_status: 'MISSING', expression_status: trees.has(st.id) ? 'DEFINED_IN_EXPRESSION_TREE' : 'INHERITED', target_wave: st.wave, evidence: [trees.has(st.id) ? `expression tree ${st.id}` : 'AUTHORED: standard family state'], _state: 'MISSING' }));
    }
    for (const ix of fam.interactions) {
      const parentId = ix.id.endsWith('.IN.OPEN_PLACE') ? 'F05.ACCOUNTS' : pid;
      add(base({ node_id: ix.id, family_id: fam.id, parent_id: parentId, node_type: 'INTERACTION', name: ix.name, purpose: ix.purpose, implementation_status: ix.status === 'WORKING' || ix.status === 'LEGACY' ? 'IMPLEMENTED' : ix.status === 'NO_OP' ? 'PLACEHOLDER' : 'MISSING', opens: ix.opens ?? null, target_wave: ix.status === 'WORKING' ? null : ix.wave, evidence: ix.evidence ? [ix.evidence] : ['AUTHORED: blueprint'], analytics_events: ['trackActivity:jurnl_interaction'], _ix: ix.status, _gapOverride: ix.status === 'LEGACY' ? 'LEGACY' : undefined, _functionalScope: ix.status !== 'LEGACY' }));
    }
  }

  /* —— global systems —— */
  for (const g of GLOBAL_SYSTEMS) {
    const crit = parseCriteria(g.criteria);
    const sc = criteriaScore(crit);
    add(
      base({
        node_id: g.id, family_id: 'GLOBAL', node_type: g.type, name: g.name, purpose: g.required, route: g.route ?? null, route_status: g.route ? (g.current === 'MISSING' ? 'MISSING' : 'LIVE') : 'NOT_A_ROUTE',
        implementation_status: g.current === 'MISSING' ? 'MISSING' : g.current === 'PARTIAL' || sc < 1 ? 'PARTIAL' : 'IMPLEMENTED',
        visual_status: g.type === 'GLOBAL_NAV' ? 'PARTIAL_EXPRESSION' : 'NOT_APPLICABLE', approval_status: g.type === 'GLOBAL_NAV' ? 'IN_REVIEW' : 'NOT_APPLICABLE',
        expression_status: g.type === 'GLOBAL_NAV' ? 'DEFINED (CENTERED DOCK; NAV ICON AUTHORITY MISSING)' : 'NOT_APPLICABLE',
        functional_criteria: crit, target_wave: sc < 1 ? g.wave : null, evidence: [g.evidence], interaction_dependencies: g.consumers,
        notes: [`SCOPE: ${g.scope}${g.ownerFamily ? ` (OWNER ${g.ownerFamily})` : ''}.`],
        icon_requirements: g.id === 'GS.BOTTOM_NAV' ? ['ICON.NAV_HOME', 'ICON.NAV_MONEY', 'ICON.NAV_ADD', 'ICON.NAV_PLAN', 'ICON.NAV_CREDIT'] : [],
        _visualScope: g.type === 'GLOBAL_NAV', _gapOverride: g.gapOverride, _reachedFrom: g.id === 'GS.BOTTOM_NAV' ? ['F03.00', 'F04.00', ...AUTHORED_FAMILIES.map((f) => `${f.id}.00`)] : g.id === 'GS.SETTINGS' ? ['F03.IN.ACCOUNT'] : [],
      }),
    );
    for (const s of g.surfaces ?? []) {
      const sc2 = parseCriteria(s.criteria);
      add(base({ node_id: s.id, family_id: 'GLOBAL', parent_id: g.id, node_type: s.type, name: s.name, purpose: `${g.name}: ${s.name}`, implementation_status: s.current === 'MISSING' ? 'MISSING' : criteriaScore(sc2) < 1 ? 'PARTIAL' : 'IMPLEMENTED', visual_status: s.current === 'MISSING' ? 'NOT_IMPLEMENTED' : 'VISUALLY_IMPLEMENTED', approval_status: s.current === 'MISSING' ? 'NOT_SUBMITTED' : 'IN_REVIEW', expression_status: 'INHERITED (GLOBAL JURNL SHEET / DRAWER)', inheritance_class: 'DIRECT_INHERITANCE', structural_form: s.type, functional_criteria: sc2, target_wave: criteriaScore(sc2) < 1 ? s.wave : null, evidence: [s.evidence], _visualScope: true, _reachedFrom: [g.id] }));
    }
    for (const ix of g.interactions ?? []) {
      add(base({ node_id: ix.id, family_id: 'GLOBAL', parent_id: g.id, node_type: 'INTERACTION', name: ix.name, purpose: `${g.name}: ${ix.name}`, implementation_status: ix.status === 'MISSING' ? 'MISSING' : ix.status === 'WORKING' ? 'IMPLEMENTED' : 'PARTIAL', opens: ix.opens ?? null, target_wave: ix.status === 'WORKING' ? null : ix.wave, evidence: [ix.evidence], analytics_events: ['trackActivity:jurnl_interaction'], _ix: ix.status }));
    }
  }

  /* —— data domains + shared components —— */
  for (const d of DATA_DOMAINS) {
    const crit = parseCriteria(d.criteria);
    add(base({ node_id: d.id, family_id: d.owner.startsWith('F') ? d.owner : 'GLOBAL', node_type: 'DATA_DOMAIN', name: d.name, purpose: `OWNER ${d.owner}. TARGET: ${d.targetPersistence}.`, implementation_status: d.currentPersistence === 'NONE' && !d.derived ? 'MISSING' : criteriaScore(crit) < 1 ? 'PARTIAL' : 'IMPLEMENTED', functional_criteria: crit, target_wave: criteriaScore(crit) < 1 ? d.wave : null, auth_requirements: 'USER-SCOPED; NEVER LEAVES THE DEVICE UNTIL THE SERVER ADAPTER + RLS EXIST', SEO_requirement: 'NOT_APPLICABLE', evidence: [d.currentSource], notes: d.conflicts, _gapOverride: d.id === 'DD.CONSENT' ? 'DUPLICATED' : undefined }));
  }
  for (const p of SHARED_PRIMITIVES) {
    add(base({ node_id: `SC.${p.id}`, family_id: 'GLOBAL', node_type: 'SHARED_COMPONENT', name: p.id, purpose: p.role, implementation_status: p.status === 'EXISTING' ? 'IMPLEMENTED' : p.status === 'EXTRACT' ? 'PARTIAL' : 'MISSING', target_wave: p.status === 'EXISTING' ? null : p.wave, evidence: p.file ? [p.file] : ['PROPOSED'], notes: p.notes ? [p.notes] : [], SEO_requirement: 'NOT_APPLICABLE', _functionalScope: false }));
  }

  /* —— derive scores, gap classes, progression —— */
  const ixScore: Record<IxStatus, number> = { WORKING: 1, PARTIAL: 0.5, NO_OP: 0, VISUAL_ONLY: 0, MISSING: 0, BROKEN: 0, LEGACY: 0 };
  const stScore: Record<StateStatus, number> = { LIVE: 1, SIMULATED: 0.5, FORCED_ONLY: 0.5, MISSING: 0 };
  for (const n of nodes) {
    if (n.functional_criteria) {
      n.functional_score = criteriaScore(n.functional_criteria);
      n._criteriaTarget = fullCriteria(n.functional_criteria);
    } else if (n._ix) n.functional_score = ixScore[n._ix];
    else if (n._state) n.functional_score = stScore[n._state];
    else if (n.node_type === 'SHARED_COMPONENT') n.functional_score = n.implementation_status === 'IMPLEMENTED' ? 1 : n.implementation_status === 'PARTIAL' ? 0.5 : 0;
    n.functional_score = Math.round(n.functional_score * 1000) / 1000;
    let gap: GapClass;
    if (n._gapOverride) gap = n._gapOverride;
    else if (n._ix) gap = n._ix === 'WORKING' ? 'COMPLETE_FUNCTIONAL' : n._ix === 'PARTIAL' ? 'PARTIAL_FUNCTIONAL' : n._ix === 'NO_OP' ? 'PLACEHOLDER' : n._ix === 'VISUAL_ONLY' ? 'VISUAL_ONLY' : n._ix === 'BROKEN' ? 'PARTIAL_FUNCTIONAL' : 'MISSING';
    else if (n._state) gap = n._state === 'LIVE' ? 'COMPLETE_FUNCTIONAL' : n._state === 'MISSING' ? 'MISSING' : 'PARTIAL_FUNCTIONAL';
    else if (n.functional_score >= 1) gap = 'COMPLETE_FUNCTIONAL';
    else if (n.functional_score === 0) gap = 'MISSING';
    else if (n.functional_criteria && n.functional_criteria.R === 1 && (n.functional_criteria.U ?? 0) >= 0.5 && !n.functional_criteria.D && !n.functional_criteria.I) gap = 'STRUCTURE_ONLY';
    else gap = 'PARTIAL_FUNCTIONAL';
    n.functional_status = gap;
    const structural = n.functional_score >= 1 ? 'FUNCTIONAL' : n.implementation_status === 'MISSING' ? 'PLANNED' : 'STRUCTURED';
    const visual = !n._visualScope ? 'NOT_APPLICABLE' : n.visual_status === 'VISUALLY_IMPLEMENTED' ? 'VISUALLY_IMPLEMENTED' : n.visual_status === 'INVALID_EXPRESSION' ? 'EXPRESSION_READY (AUTHORITY INVALID: INTERFERENCE FAIL)' : n.expression_status.startsWith('DEFINED') || n.expression_status.startsWith('INHERITED') ? 'EXPRESSION_READY' : 'NONE';
    const release = n.approval_status === 'FOUNDER_APPROVED' ? 'APPROVED' : n._visualScope && n.implementation_status !== 'MISSING' && n.family_id !== 'GLOBAL' && ['F01', 'F02', 'F03', 'F04'].includes(n.family_id) ? 'QA_READY' : 'NONE';
    n.progression = { structural, visual, release };
    if (n._visualScope && n.implementation_status === 'MISSING' && n.generation_requirement.generation_class === 'NONE') n.generation_requirement = { ...n.generation_requirement, reference_required: true, reference_source: n.generation_requirement.reference_source ?? `${n.family_id}.00 parent authority`, authority_parent: n.generation_requirement.authority_parent ?? (n.family_id === 'GLOBAL' ? null : `${n.family_id}.00`) };
  }

  /* —— icon bindings onto nodes —— */
  const iconFor: Record<string, string[]> = {};
  const expand = (f: string) => {
    const m = /^F(\d\d)–F(\d\d)$/.exec(f);
    if (!m) return [f];
    const out: string[] = [];
    for (let i = Number(m[1]); i <= Number(m[2]); i++) out.push(`F${String(i).padStart(2, '0')}`);
    return out;
  };
  for (const ic of ICON_REQUIREMENTS) for (const f of ic.families.flatMap(expand)) (iconFor[f] ??= []).push(ic.id);
  for (const n of nodes) if (n.node_type === 'FAMILY_PARENT') n.icon_requirements = [...new Set([...(iconFor[n.family_id] ?? []), 'ICON.BACK', 'ICON.INFO'])].sort();

  /* —— reusable candidate binding —— */
  const rcFor: Record<string, string> = { F01: 'RC.BP.ENTRY_TRUST', F02: 'RC.BP.GUIDED_SETUP', F03: 'RC.BP.DAILY_SIGNAL_HOME', F04: 'RC.BP.LEDGER', 'GS.CURRENCY': 'RC.SYS.CURRENCY', 'GS.QUICK_ADD': 'RC.SYS.QUICK_ADD', 'GS.AUTH': 'RC.SYS.AUTH_ADAPTER', 'GS.ENTITLEMENTS': 'RC.SYS.ENTITLEMENTS', 'GS.PERSISTENCE': 'RC.SYS.REPOSITORY', 'GS.BOTTOM_NAV': 'RC.PR.NAV_DOCK' };
  for (const n of nodes) {
    if (n.node_type === 'FAMILY_PARENT' && rcFor[n.family_id]) n.reusable_capability_candidate = rcFor[n.family_id]!;
    if (rcFor[n.node_id]) n.reusable_capability_candidate = rcFor[n.node_id]!;
  }

  /* ───────────────────────── edges + validation ───────────────────────── */

  const byId = new Map(nodes.map((n) => [n.node_id, n]));
  type Edge = { from: string; to: string; current: boolean; via: string };
  const edges: Edge[] = [];
  const isLiveIx = (n: GNode) => n._ix === 'WORKING' || n._ix === 'PARTIAL';
  const implemented = (id: string) => (byId.get(id)?.implementation_status ?? 'MISSING') !== 'MISSING';
  for (const n of nodes) {
    if (n.parent_id && ['CHILD_PAGE', 'GRANDCHILD_PAGE', 'DRAWER', 'SHEET', 'MODAL', 'OVERLAY', 'STATE'].includes(n.node_type) && n._visualScope) {
      edges.push({ from: n.parent_id, to: n.node_id, current: implemented(n.node_id) && n.family_id !== 'F01' && n.family_id !== 'F02' ? true : false, via: 'PARENT' });
    }
    for (const r of n._reachedFrom) edges.push({ from: r, to: n.node_id, current: implemented(n.node_id) && implemented(r), via: 'REACHED_FROM' });
    if (n.node_type === 'INTERACTION' && n.opens && n.parent_id) edges.push({ from: n.parent_id, to: n.opens, current: isLiveIx(n) && implemented(n.opens), via: n.node_id });
    if (n.node_type === 'INTERACTION' && n.opens && n.parent_id === 'GS.BOTTOM_NAV') edges.push({ from: 'GS.BOTTOM_NAV', to: n.opens, current: isLiveIx(n), via: n.node_id });
  }
  for (const ix of c1.interactions) {
    if (ix.sourceScreen === 'GLOBAL') continue;
    for (const m of (ix.navigationResult ?? '').matchAll(/F01\.\d\d/g)) edges.push({ from: ix.sourceScreen, to: m[0], current: true, via: ix.id });
  }
  edges.push({ from: 'F01.10', to: 'F01.11', current: true, via: 'F01.10.TRUST.CONFIRM (continue)' });
  edges.push({ from: 'F01.00', to: 'F01.04', current: true, via: 'EntryIndex: remembered device → entry/unlock' });
  edges.push({ from: 'F01.06', to: 'F01.07', current: true, via: 'reset link from the email (simulated in preview)' });
  for (const [from, to] of [['F01.00', 'F01.14'], ['F01.14', 'F01.15'], ['F01.15', 'F01.16'], ['F01.16', 'F01.01'], ['F01.16', 'F01.03']]) edges.push({ from: from!, to: to!, current: true, via: 'ENTRY v2 parents (EntryScreens.tsx)' });
  for (const [from, to] of [['F01.01', 'F01.02'], ['F01.03', 'F01.02'], ['F01.03', 'F01.09'], ['F01.03', 'F01.10'], ['F01.03', 'F01.13']]) edges.push({ from: from!, to: to!, current: true, via: 'EntryScreens.tsx usePostAuthRoute' });
  for (const [from, to] of Object.entries(F02_NEXT)) edges.push({ from, to, current: true, via: 'F02_NEXT' });
  for (const s of F02_SCREENS) if (s.back) edges.push({ from: s.back, to: s.id, current: true, via: 'F02 back-link parent' });
  edges.push({ from: 'F02.08', to: 'F03.00', current: true, via: 'F02 → F03 hand-off' });
  for (const { from, to } of JURNL_PRODUCT_DISCOVERY_EDGES) {
    edges.push({ from, to, current: true, via: 'GS.FAMILY_DISCOVERY' });
  }
  for (const s of c1.screens) if (s.role !== 'PARENT') edges.push({ from: 'F01.00', to: s.id, current: false, via: 'F01 family tree (target)' });

  const reach = (current: boolean) => {
    const seen = new Set<string>(['F01.00']);
    const q = ['F01.00'];
    while (q.length) {
      const id = q.shift()!;
      for (const e of edges) if (e.from === id && (!current || e.current) && !seen.has(e.to) && byId.has(e.to)) {
        seen.add(e.to);
        q.push(e.to);
      }
    }
    return seen;
  };
  const curReach = reach(true);
  const tgtReach = reach(false);
  const routeNodes = nodes.filter((n) => ['FAMILY_PARENT', 'CHILD_PAGE', 'GRANDCHILD_PAGE'].includes(n.node_type) || (n.route && n.node_type === 'GLOBAL_SYSTEM'));
  const familyParentsUnreachableNow = nodes.filter((n) => n.node_type === 'FAMILY_PARENT' && !curReach.has(n.node_id)).map((n) => n.node_id);
  const targetUnreachable = routeNodes.filter((n) => !tgtReach.has(n.node_id)).map((n) => n.node_id);
  const orphans = nodes.filter((n) => n.parent_id && !byId.has(n.parent_id)).map((n) => n.node_id);
  const danglingOpens = nodes.filter((n) => n.opens && !byId.has(n.opens)).map((n) => `${n.node_id} → ${n.opens}`);
  const deadEndsNow = routeNodes.filter((n) => n.implementation_status !== 'MISSING' && n.functional_criteria && n.functional_criteria.N === 0).map((n) => n.node_id);
  const missingReturnTarget = routeNodes.filter((n) => n.node_type !== 'FAMILY_PARENT' && n.functional_criteria && n.functional_criteria.N === null).map((n) => n.node_id);
  for (const id of familyParentsUnreachableNow) byId.get(id)!.notes.push('NOT REACHABLE FROM THE PRODUCT TODAY (REVIEW BOARD OR TYPED URL ONLY).');

  const competingOwnership = DATA_DOMAINS.filter((d) => d.conflicts.length).map((d) => ({ domain: d.id, owner: d.owner, conflicts: d.conflicts }));
  const fakeCompletion = [
    { claim: 'F02.02 CONNECTED state + "connected" draft', reality: 'No aggregator exists; the connection is simulated.', node: 'F02.02.CONNECTED' },
    { claim: 'Quick add note "JURNL STORES THE USD EQUIVALENT"', reality: 'The row lives in memory and is lost on reload.', node: 'GS.QA.SAVE' },
    { claim: 'Today REFRESH (stale state)', reality: "go('F03') re-renders; nothing is fetched.", node: 'GS.DATA_REFRESH' },
    { claim: 'F01.11 DATA EXPORT "requested"', reality: 'A device flag is set; nothing is exported.', node: 'F01.11.DRAWER.DATA_EXPORT' },
    { claim: 'jurnlProject.ts families = F01–F04', reality: 'Runtime mounts F05–F16 parents; registry under-reports the tree.', node: 'B11' },
    { claim: 'productTree.ts F02–F16 NOT_STARTED', reality: 'F02–F04 are implemented and QA-passed (stale under-claim).', node: 'B11' },
    { claim: 'F03 / F04 contracts LIVE_QA_PASSED', reality: 'QA covered UI and states; data is MOCK + in-memory. Not a functional claim.', node: 'F03.00' },
  ];

  /* ───────────────────────── metrics ───────────────────────── */

  const F = nodes.filter((n) => n._functionalScope && n.node_type !== 'SHARED_COMPONENT');
  const V = nodes.filter((n) => n._visualScope);
  /* Headline metrics are UNIT-BALANCED: F01–F16 + GLOBAL each count once. F01's contract enumerates every primitive
     behaviour (142 nodes) while F05–F16 are authored at family grain, so plain node weighting would reward contract
     verbosity. Node-weighted and strict values are reported alongside. */
  const UNITS = [...FAMILY_CANON.map(([id]) => id), 'GLOBAL'] as string[];
  const balanced = (scope: GNode[], score: (n: GNode) => number) => {
    const per = UNITS.map((u) => scope.filter((n) => n.family_id === u)).filter((g) => g.length);
    return sum(per.map((g) => sum(g.map(score)) / g.length)) / per.length;
  };
  const functionalNodeWeighted = sum(F.map((n) => n.functional_score)) / F.length;
  const functionalBalanced = balanced(F, (n) => n.functional_score);
  const functionalStrict = balanced(F, (n) => (n.functional_score >= 1 ? 1 : 0));
  const famScores = UNITS.map((id) => {
    const fn = F.filter((n) => n.family_id === id);
    return { family: id, nodes: fn.length, score: fn.length ? sum(fn.map((n) => n.functional_score)) / fn.length : 0, strict: fn.length ? fn.filter((n) => n.functional_score >= 1).length / fn.length : 0 };
  });
  const familyMean = sum(famScores.filter((f) => f.family !== 'GLOBAL').map((f) => f.score)) / FAMILY_CANON.length;
  const visual = balanced(V, (n) => (n.visual_status === 'VISUALLY_IMPLEMENTED' ? 1 : 0));
  const visualNodeWeighted = V.filter((n) => n.visual_status === 'VISUALLY_IMPLEMENTED').length / V.length;
  const approval = balanced(V, (n) => (n.approval_status === 'FOUNDER_APPROVED' ? 1 : 0));
  const approvalNodeWeighted = V.filter((n) => n.approval_status === 'FOUNDER_APPROVED').length / V.length;
  const responsiveCovered = V.filter((n) => n.functional_criteria?.P === 1).length / V.length;
  const gates = [
    { id: 'G01', gate: 'FUNCTIONAL_COMPLETION = 100%', score: functionalBalanced, evidence: 'Progress metric (unit-balanced).' },
    { id: 'G02', gate: 'PRODUCTION AUTH PROVIDER', score: 0, evidence: 'B18.' },
    { id: 'G03', gate: 'SERVER PERSISTENCE + RLS', score: 0, evidence: 'B19.' },
    { id: 'G04', gate: 'SECURITY REVIEW WITH TEST EVIDENCE', score: 0, evidence: 'No JURNL security tests exist. Production security is NOT claimed.' },
    { id: 'G05', gate: 'VISUAL_IMPLEMENTATION = 100%', score: visual, evidence: 'Progress metric.' },
    { id: 'G06', gate: 'FOUNDER APPROVAL = 100%', score: approval, evidence: 'Progress metric.' },
    { id: 'G07', gate: 'ACCESSIBILITY AUDIT', score: 0, evidence: 'Semantics exist; no audit (B23).' },
    { id: 'G08', gate: 'RESPONSIVE QA ON EVERY VISUAL NODE', score: responsiveCovered, evidence: 'Share of visual nodes with P=1 evidence (viewport + containment QA).' },
    { id: 'G09', gate: 'NOINDEX', score: 0, evidence: 'B21.' },
    { id: 'G10', gate: 'ANALYTICS ON EXISTING INFRA', score: 0, evidence: 'B22.' },
    { id: 'G11', gate: 'TEST SUITE GREEN ON MAIN', score: 0, evidence: 'Pre-existing red on main (B25 + 67 failing files repo-wide).' },
    { id: 'G12', gate: 'PRODUCTION DELIVERY PATH FOR END USERS', score: 0, evidence: 'JURNL mounts only at /production/jurnl/runtime behind the internal production guard.' },
  ];
  const launch = sum(gates.map((g) => g.score)) / gates.length;

  const simulation = ([0, 1, 2, 3, 4, 5] as Wave[]).map((w) => {
    const at = (n: GNode) => (n.functional_score >= 1 ? 1 : n.target_wave !== null && n.target_wave <= w ? 1 : n.functional_score);
    const completedThisWave = F.filter((n) => n.functional_score < 1 && n.target_wave === w).length;
    return { after_wave: w, functional_completion: pct(balanced(F, at)), node_weighted: pct(sum(F.map(at)) / F.length), nodes_completed_in_wave: completedThisWave, strict: pct(balanced(F, (n) => (at(n) >= 1 ? 1 : 0))) };
  });
  const unwavedIncomplete = F.filter((n) => n.functional_score < 1 && n.target_wave === null).map((n) => n.node_id);

  /* ───────────────────────── counts ───────────────────────── */

  const countBy = <T extends string>(arr: GNode[], key: (n: GNode) => T) => arr.reduce<Record<string, number>>((acc, n) => ((acc[key(n)] = (acc[key(n)] ?? 0) + 1), acc), {});
  const typeCounts = countBy(nodes, (n) => n.node_type);
  const gapCounts = countBy(nodes.filter((n) => n.node_type !== 'SHARED_COMPONENT'), (n) => n.functional_status);
  const interactions = nodes.filter((n) => n.node_type === 'INTERACTION');
  const ixCounts = countBy(interactions, (n) => n._ix ?? 'MISSING');

  /* routes */
  const routeRows = [
    ...routeNodes.filter((n) => n.route).map((n) => ({
      route: `/production/jurnl/runtime/${n.route}`,
      node_id: n.node_id,
      family_id: n.family_id,
      status: n.route_status,
      reachable_in_product_today: n.implementation_status === 'MISSING' ? false : curReach.has(n.node_id),
      reached_from_target: [...new Set(edges.filter((e) => e.to === n.node_id).map((e) => e.from))].sort(),
      backend_dependency: n.family_id === 'F01' ? 'AUTH PROVIDER (PREVIEW ADAPTER TODAY)' : n.family_id === 'GLOBAL' ? 'REPOSITORY' : 'REPOSITORY (W0.3)',
      wave: n.target_wave,
    })),
  ];
  const nonProductRoutes = [
    { route: '/production/jurnl/runtime/', node_id: 'EntryIndex', status: 'LIVE', note: 'Routes to entry / unlock / complete by session state.' },
    { route: '/production/jurnl/runtime/parents', node_id: 'F05_F16.BOARD', status: 'LEGACY', note: 'Parent review board. Review tooling, not product. Keep in design-preview only (B24).' },
    { route: '/production/jurnl/runtime/*', node_id: 'EntryIndex', status: 'LIVE', note: 'Fallback to EntryIndex.' },
  ];
  const routeCounts = routeRows.reduce<Record<string, number>>((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
  const unreachableRoutesNow = routeRows.filter((r) => r.status !== 'MISSING' && !r.reachable_in_product_today).map((r) => r.node_id);

  /* icons */
  const iconNames = runtimeIconNames();
  const iconCounts = ICON_REQUIREMENTS.reduce<Record<string, number>>((acc, i) => ((acc[i.status] = (acc[i.status] ?? 0) + 1), acc), {});

  /* data */
  const persistenceGaps = DATA_DOMAINS.filter((d) => !d.derived && ['NONE', 'MOCK', 'MEMORY', 'SESSION', 'DEVICE_PREVIEW'].includes(d.currentPersistence));
  const famEdges = new Map<string, Set<string>>();
  for (const fam of [...AUTHORED_FAMILIES.map((f) => ({ id: f.id, reads: [...f.reads, ...f.writes] }))]) {
    for (const dd of fam.reads) {
      const owner = DATA_DOMAINS.find((d) => d.id === dd)?.owner;
      if (owner && owner !== fam.id && owner.startsWith('F')) (famEdges.get(fam.id) ?? famEdges.set(fam.id, new Set()).get(fam.id)!).add(owner);
    }
  }
  const f0104Reads: Record<string, string[]> = { F02: ['F05', 'F06', 'F07', 'F08', 'F09', 'F14'], F03: ['F04', 'F07', 'F09', 'F02'], F04: ['F05', 'F07'] };
  for (const [f, owners] of Object.entries(f0104Reads)) for (const o of owners) (famEdges.get(f) ?? famEdges.set(f, new Set()).get(f)!).add(o);
  const depEdges = [...famEdges.entries()].flatMap(([from, tos]) => [...tos].sort().map((to) => ({ from, to, kind: from === 'F02' ? 'SEEDS' : 'READS' }))).sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to));

  /* generation */
  const unbuiltVisual = V.filter((n) => n.implementation_status === 'MISSING');
  const generation = {
    FAMILIES_REQUIRING_PARENT_AUTHORITY: PARENTS.filter((p) => p.interference === 'FAIL').map((p) => p.id),
    FAMILIES_AWAITING_REVIEW_OF_EXISTING_AUTHORITY: [...PARENTS.filter((p) => p.interference === 'PASS').map((p) => p.id), 'F02', 'F03', 'F04'].sort(),
    MATERIAL_CHILD_AUTHORITIES: unbuiltVisual.filter((n) => trees.get(n.node_id)?.distinct_authority_required).map((n) => n.node_id),
    DISTINCT_SUB_EXPRESSIONS_UNBUILT: unbuiltVisual.filter((n) => n.inheritance_class === 'DISTINCT_SUB_EXPRESSION').map((n) => n.node_id),
    NEW_PLATES_EXPECTED: { with_parent_reauthority: PARENTS.filter((p) => p.interference === 'FAIL').length, children: unbuiltVisual.filter((n) => n.plate_policy === 'NEW_PLATE_WITHIN_FAMILY').length },
    PARENT_PLATE_REUSE_EXPECTED: unbuiltVisual.filter((n) => n.plate_policy === 'REUSE_PARENT_PLATE' || n.plate_policy === 'MODULATE_PARENT_PLATE').map((n) => n.node_id),
    NO_PLATE_NODES: unbuiltVisual.filter((n) => n.plate_policy === 'NO_PLATE_REQUIRED').length,
    GENERATION_REQUIRED_TO_REACH_100_PERCENT_FUNCTIONAL: nodes.some((n) => n.generation_requirement.required_for_functional) ? 'YES' : 'NO',
    NEW_PAID_GENERATIONS: 0,
    CREDITS_SPENT: 0,
  };

  const summary = {
    sprint: SPRINT,
    audited_main: AUDITED_MAIN,
    totals: {
      TOTAL_FAMILIES: FAMILY_CANON.length,
      TOTAL_MATERIAL_NODES: nodes.length,
      FUNCTIONAL_SCOPE_NODES: F.length,
      VISUAL_SCOPE_NODES: V.length,
      PARENTS: typeCounts.FAMILY_PARENT ?? 0,
      CHILD_PAGES: typeCounts.CHILD_PAGE ?? 0,
      GRANDCHILD_PAGES: typeCounts.GRANDCHILD_PAGE ?? 0,
      DRAWERS: typeCounts.DRAWER ?? 0,
      SHEETS: typeCounts.SHEET ?? 0,
      MODALS: typeCounts.MODAL ?? 0,
      OVERLAYS: typeCounts.OVERLAY ?? 0,
      STATES: typeCounts.STATE ?? 0,
      INTERACTIONS: typeCounts.INTERACTION ?? 0,
      GLOBAL_SYSTEMS: GLOBAL_SYSTEMS.length,
      DATA_DOMAINS: DATA_DOMAINS.length,
      SHARED_PRIMITIVES: SHARED_PRIMITIVES.length,
      by_type: typeCounts,
    },
    completion: {
      FUNCTIONAL: pct(functionalBalanced),
      FUNCTIONAL_NODE_WEIGHTED: pct(functionalNodeWeighted),
      FUNCTIONAL_STRICT: pct(functionalStrict),
      FUNCTIONAL_FAMILY_MEAN: pct(familyMean),
      FUNCTIONAL_COMPLETION_CONFIDENCE: 'MEDIUM',
      VISUAL: pct(visual),
      VISUAL_NODE_WEIGHTED: pct(visualNodeWeighted),
      APPROVAL: pct(approval),
      APPROVAL_NODE_WEIGHTED: pct(approvalNodeWeighted),
      LAUNCH: pct(launch),
    },
    gap_counts: gapCounts,
    interaction_counts: ixCounts,
    routes: { total_product_routes: routeRows.length, by_status: routeCounts, unreachable_in_product_today: unreachableRoutesNow, non_product: nonProductRoutes.length },
    icons: { total: ICON_REQUIREMENTS.length, by_status: iconCounts, runtime_icon_names: iconNames.length },
    data: { domains: DATA_DOMAINS.length, ownership_conflicts: competingOwnership.length, persistence_gaps: persistenceGaps.length, cross_family_dependencies: depEdges.length },
    blockers: BLOCKERS.reduce<Record<string, number>>((acc, b) => ((acc[b.severity] = (acc[b.severity] ?? 0) + 1), acc), {}),
    generation,
    validation: { orphans, dangling_opens: danglingOpens, family_parents_unreachable_today: familyParentsUnreachableNow, target_unreachable: targetUnreachable, dead_ends_today: deadEndsNow, missing_return_paths_target: missingReturnTarget, competing_ownership: competingOwnership.length, fake_completion: fakeCompletion.length, incomplete_nodes_without_wave: unwavedIncomplete },
    simulation,
  };

  return { nodes, edges, summary, famScores, gates, simulation, competingOwnership, fakeCompletion, routeRows, nonProductRoutes, depEdges, persistenceGaps, iconNames, generation, trees, capsFor, F, V };
}

/* ───────────────────────── emit ───────────────────────── */

const critString = (c: Criteria) => CRITERIA.map(([k]) => `${k}${c[k] === null ? '-' : c[k] === 0.5 ? 'h' : c[k]}`).join(' ');
const strip = (n: GNode) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(n)) if (!k.startsWith('_')) out[k] = v;
  if (n.functional_criteria) out.functional_criteria = critString(n.functional_criteria);
  out.responsive_requirements = 'RESP.JURNL';
  out.accessibility_requirements = 'A11Y.JURNL';
  if (n._ix) out.interaction_status = n._ix;
  if (n._state) out.state_status = n._state;
  return out;
};
const j = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
/** Pretty header, one line per row for large arrays (diff-friendly, ~half the size). */
const jRows = (head: Record<string, unknown>, rows: Record<string, unknown[]>) => {
  const top = JSON.stringify(head, null, 2).replace(/\n}$/, '');
  const arrays = Object.entries(rows).map(([k, arr]) => `  ${JSON.stringify(k)}: [\n${arr.map((r) => `    ${JSON.stringify(r)}`).join(',\n')}\n  ]`);
  return `${top},\n${arrays.join(',\n')}\n}\n`;
};

export function renderArtifacts(): Record<string, string> {
  const B = buildBlueprint();
  const { nodes, summary } = B;
  const files: Record<string, string> = {};
  const header = { sprint: SPRINT, audited_main: AUDITED_MAIN, audit_date: AUDIT_DATE, generator: 'scripts/jurnl/structural-blueprint/build.ts', generation: 'ZERO — no provider calls' };
  const famName = (id: string) => FAMILY_CANON.find(([f]) => f === id)?.[1] ?? id;
  const famNodes = (id: string) => nodes.filter((n) => n.family_id === id);

  files['JURNL_CANONICAL_PRODUCT_GRAPH.json'] = jRows({
    ...header,
    legend: {
      functional_criteria: 'R U D I S V E M L P A N = route/invocation, UI shell, data contract, core interaction, state transitions, validation, error, empty, loading, responsive, accessibility semantics, navigation return path. 1 met · h half · 0 missing · - not applicable. Definitions: JURNL_FUNCTIONAL_COMPLETION_CONTRACT.json.',
      'RESP.JURNL': RESP,
      'A11Y.JURNL': A11Y,
      target_wave: 'Wave in which the node reaches FUNCTIONAL (null = already functional, or out of functional scope).',
    },
    node_fields: Object.keys(strip(nodes[0]!)),
    summary: summary.totals,
  }, { nodes: nodes.map(strip), edges: B.edges });

  files['JURNL_FAMILY_TREE_F01_F16.json'] = j({
    ...header,
    canon: 'F01–F16 FIXED. NOTHING ADDED, REMOVED, MERGED OR RENAMED.',
    orphan_product_capabilities: [
      { capability: 'ACCOUNT / SETTINGS', classification: 'GLOBAL_SYSTEM', node: 'GS.SETTINGS' },
      { capability: 'BUSINESS / TAX (RECEIPTS, MILEAGE, P&L, TAX PREP, ACCOUNTANT EXPORT)', classification: 'GLOBAL_SYSTEM → JURNL BUSINESS EXTENSION ANCHORED IN F16', node: 'RC.EXT.BUSINESS' },
      { capability: 'NOTIFICATIONS', classification: 'GLOBAL_SYSTEM (UNSCOPED)', node: 'GS.NOTIFICATIONS' },
      { capability: 'BANK AGGREGATION', classification: 'GLOBAL_SYSTEM (FOUNDER DECISION)', node: 'GS.BANK_CONNECTION' },
    ],
    family_reconciliation_required: [{ topic: 'F05.ACCOUNTS vs F12.ACCOUNTS', resolution: 'ONE REGISTRY (F05) + CREDIT ATTRIBUTES (F12). NO NEW FAMILY.' }, { topic: 'F03 SEE WHY vs F09 WHY', resolution: 'ONE FORMULA OWNED BY F09; FOUNDER FLAG FF.SEE_WHY_VS_F09.' }],
    families: FAMILY_CANON.map(([id, name]) => {
      const fn = famNodes(id);
      const parent = fn.find((n) => n.node_type === 'FAMILY_PARENT')!;
      const pick = (types: NodeType[]) => fn.filter((n) => types.includes(n.node_type)).map((n) => n.node_id);
      const notChild = (t: NodeType) => fn.filter((n) => n.node_type === t && !isChild(B, n)).map((n) => n.node_id);
      return { family_id: id, name, parent: parent.node_id, route: parent.route, children: fn.filter((n) => isChild(B, n)).map((n) => ({ id: n.node_id, form: n.structural_form })), grandchildren: pick(['GRANDCHILD_PAGE']), drawers: notChild('DRAWER'), sheets: notChild('SHEET'), modals: pick(['MODAL']), overlays: pick(['OVERLAY']), states: notChild('STATE'), interactions: pick(['INTERACTION']) };
    }),
  });

  files['JURNL_ROUTE_COMPLETION_MATRIX.json'] = j({ ...header, statuses: ['LIVE', 'PARTIAL', 'STUB', 'PLACEHOLDER', 'MISSING', 'LEGACY', 'DUPLICATED', 'UNREACHABLE'], rule: 'route_status describes the mounted surface. reachable_in_product_today is separate: a LIVE or PLACEHOLDER route can still be unreachable without the review board.', counts: summary.routes, product_routes: B.routeRows, non_product_routes: B.nonProductRoutes });

  const ixRows = nodes.filter((n) => n.node_type === 'INTERACTION').map((n) => ({ id: n.node_id, family_id: n.family_id, host: n.parent_id, name: n.name, status: n._ix, opens: n.opens, wave: n.target_wave, notes: n.notes }));
  files['JURNL_INTERACTION_COMPLETION_MATRIX.json'] = j({ ...header, statuses: ['WORKING', 'PARTIAL', 'NO_OP', 'VISUAL_ONLY', 'MISSING', 'BROKEN', 'LEGACY'], rule: 'Per-family invocations of shared sheets (QUICK ADD, ASK) count WORKING when they open the sheet; the sheet’s own behaviour is scored once on the global system (GS.QA.SAVE, GS.ASK.EXPLAIN).', counts: summary.interaction_counts, interactions: ixRows });

  files['JURNL_DATA_OWNERSHIP_MAP.json'] = j({ ...header, rule: 'ONE OWNER PER DOMAIN. SETUP (F02) SEEDS; THE OWNER FAMILY TAKES OVER ON SETUP COMPLETE. DERIVED VALUES ARE COMPUTED BY THEIR OWNER, NEVER STORED BY READERS.', domains: DATA_DOMAINS, ownership_conflicts: B.competingOwnership, persistence_gaps: B.persistenceGaps.map((d) => ({ id: d.id, current: d.currentPersistence, target: d.targetPersistence })), persistence_keys_today: { localStorage: ['jurnl.runtime.v1.device', 'jurnl.runtime.v1.preview-accounts', 'jurnl.currency', 'jurnl.exchangeRate'], sessionStorage: ['jurnl.runtime.v1.session (+ localStorage when keep signed in)', 'jurnl.runtime.v1.setup', 'jurnl.parentReview'], memory: ['money.ts added[] (quick add)'] } });

  files['JURNL_CROSS_FAMILY_DEPENDENCY_GRAPH.json'] = j({ ...header, rule: 'A → B when family A reads (or F02 seeds) a domain owned by family B.', edges: B.depEdges, global_system_consumers: GLOBAL_SYSTEMS.map((g) => ({ system: g.id, consumers: g.consumers })), build_order_implied: ['F05 · F06 · F07 (sources)', 'F08 · F09 · F12 · F14 (derived + planning)', 'F10 · F11 · F13 · F15 · F16 (decisions + projection + archive)'] });

  files['JURNL_GLOBAL_SYSTEMS_MAP.json'] = j({ ...header, classification: ['GLOBAL', 'FAMILY_OWNED', 'DUPLICATED'], nav_mapping: { HOME: 'F03', MONEY: 'F05', '+': 'QUICK ADD (GLOBAL)', PLAN: 'F08', CREDIT: 'F12', non_nav_discovery_proposed: { HOME: ['F04', 'F07', 'F09'], MONEY: ['F06', 'F16'], PLAN: ['F09', 'F10', 'F11', 'F14', 'F15'], CREDIT: ['F13'] } }, ask_jurnl: { entry_points_today: ['F03 top chrome info', 'F04 top chrome info'], context: 'NONE (STATIC LINE)', permissions: 'AI ACCESS PREFERENCE DEFAULTS OFF', read_write: 'READ-ONLY', actions: 'NONE', required: 'EVERY FAMILY, FAMILY CONTEXT FROM DERIVED VALUES, READ-ONLY, NO ACTIONS. NO LLM WITHOUT A FOUNDER DECISION.' }, quick_add: { types: ['EXPENSE', 'INCOME'], required_additions: ['DATE', 'CATEGORY', 'ACCOUNT FROM REGISTRY', 'PERSISTENCE', 'EDIT + DELETE (VIA F04 DETAIL)'], not_required: ['RECURRENCE (AN F07 OBLIGATION)', 'MEMO ON ENTRY (EDITABLE IN DETAIL)', 'TRANSFER (F05 MOVE)'] }, currency: { status: 'CLASSIFIED ONLY — NO CHANGE', base: 'USD', display: 'USER PREFERENCE', rules: ['BASE ≠ DISPLAY', 'NO SYMBOL SWAP', 'NO CHAIN CONVERSION', 'THREE VISIBLE OPTIONS'], move_selector_to: 'GS.SETTINGS' }, systems: GLOBAL_SYSTEMS.map((g) => ({ ...g, functional_score: Math.round(criteriaScore(parseCriteria(g.criteria)) * 1000) / 1000 })) });

  files['JURNL_FUNCTIONAL_COMPLETION_CONTRACT.json'] = j({
    ...header,
    definition: 'A node is FUNCTIONAL when every applicable criterion is met. A static placeholder is never FUNCTIONAL. A neutral structural presentation can be FUNCTIONAL; it is not VISUALLY_IMPLEMENTED.',
    criteria: CRITERIA.map(([key, id, rule]) => ({ key, id, rule })),
    scoring: { met: 1, partial: 0.5, missing: 0, not_applicable: 'excluded from the node denominator' },
    applicability: {
      ROUTE_PAGE: 'R U D I S E M L P A N (+V when the page takes input)',
      SHEET_FORM: 'R U D I S V E L P A N',
      MODAL: 'R U D I S E L P A N',
      EXPANDED_OR_INLINE_STATE: 'R U D I S M P A',
      INTERACTION: 'STATUS: WORKING 1 · PARTIAL 0.5 · NO_OP / VISUAL_ONLY / MISSING / BROKEN 0 · LEGACY excluded',
      STATE: 'STATUS: LIVE 1 · SIMULATED / FORCED_ONLY 0.5 · MISSING 0',
      GLOBAL_SYSTEM_AND_DATA_DOMAIN: 'APPLICABLE SUBSET LISTED PER NODE',
    },
    persistence_rule: 'FUNCTIONAL needs a working persistent adapter for the person’s own data. Device persistence satisfies FUNCTIONAL for financial data. Identity is the exception: sign-up, verification, reset, sessions and social sign-in need the auth / email provider (B18, B20), so F01 reaches 100% only in wave 5. Server persistence and RLS are LAUNCH gates (G03).',
    responsive_standard: RESP,
    accessibility_standard: A11Y,
    seo_rule: 'Every JURNL route is authenticated → NOINDEX. No public or shareable route is evidenced.',
    analytics_rule: 'Map to existing infrastructure only: trackActivity (src/utils/activity.ts) for jurnl_screen_view / jurnl_interaction with no financial payload; buildMonetizationEvent for gate + upgrade events; postToHost route events remain design-chamber only.',
    security_rule: 'Production security is NOT claimed. Required before launch: provider-backed auth, server persistence with RLS + isolation tests, no preview-account storage in production builds, FX proxy, no financial data in analytics.',
    pass_evidence: ['Unit tests for data + derived values', 'Runtime route + overlay smoke at 393 / 834 / 1440', 'interactive-text-qa.mjs 0 drift', 'Graph validation: target_unreachable = 0, dangling_opens = 0'],
  });

  files['JURNL_PROGRESS_METRIC_MODEL.json'] = j({
    ...header,
    axes: {
      FUNCTIONAL_COMPLETION: { formula: 'mean over the 17 units (F01–F16 + GLOBAL) of [Σ functional_score(n) / |N_F ∩ unit|]. N_F = every material node except SHARED_COMPONENT and LEGACY interactions. functional_score = applicable criteria met / applicable criteria (1, 0.5, 0); interactions and states use their status scores.', value: summary.completion.FUNCTIONAL, why_balanced: 'F01’s contract enumerates every primitive behaviour (142 nodes); F05–F16 are authored at family grain. Node weighting would reward contract verbosity.', node_weighted: { formula: 'Σ functional_score(n) / |N_F|', value: summary.completion.FUNCTIONAL_NODE_WEIGHTED }, strict: { formula: 'unit-balanced share of nodes with score = 1', value: summary.completion.FUNCTIONAL_STRICT }, family_mean: { formula: 'mean over F01–F16 only (GLOBAL excluded)', value: summary.completion.FUNCTIONAL_FAMILY_MEAN }, confidence: 'MEDIUM', status: 'ESTIMATED', missing_evidence: ['Criteria were scored from code reading + existing QA artifacts, not re-run per criterion in this sprint.', 'No accessibility audit; responsive evidence is from earlier F01–F04 + parent captures.', 'Provider-dependent F01 flows were not exercised against a provider (none exists).'] },
      VISUAL_IMPLEMENTATION: { formula: 'unit-balanced share of N_V with a valid expression mounted. N_V = parents, child / grandchild pages, drawers, sheets, modals, overlays, expanded/inline children, global nav. Interference-FAIL parents, neutral shells and placeholder nav icons do not count.', value: summary.completion.VISUAL, node_weighted: summary.completion.VISUAL_NODE_WEIGHTED, confidence: 'HIGH' },
      APPROVAL_COMPLETION: { formula: 'unit-balanced share of N_V that is FOUNDER_APPROVED', value: summary.completion.APPROVAL, node_weighted: summary.completion.APPROVAL_NODE_WEIGHTED, confidence: 'HIGH', note: 'Only F01.00 is founder-approved. Nothing is marked approved automatically.' },
      LAUNCH_READINESS: { formula: 'mean of 12 launch gates scored 0..1 with evidence', value: summary.completion.LAUNCH, confidence: 'MEDIUM', gates: B.gates },
    },
    report_format: `${summary.completion.FUNCTIONAL}% FUNCTIONAL / ${summary.completion.VISUAL}% VISUALLY IMPLEMENTED / ${summary.completion.APPROVAL}% APPROVED / ${summary.completion.LAUNCH}% LAUNCH READY`,
    node_progression: ['PLANNED', 'STRUCTURED', 'FUNCTIONAL', 'EXPRESSION_READY', 'AUTHORITY_READY', 'VISUALLY_IMPLEMENTED', 'QA_READY', 'APPROVED', 'LIVE'],
    progression_rule: 'Each node carries three independent tracks: structural (PLANNED → STRUCTURED → FUNCTIONAL), visual (EXPRESSION_READY → AUTHORITY_READY → VISUALLY_IMPLEMENTED) and release (QA_READY → APPROVED → LIVE). A node can be FUNCTIONAL without being VISUALLY_IMPLEMENTED.',
    per_unit: B.famScores.map((f) => ({ unit: f.family, name: f.family === 'GLOBAL' ? 'GLOBAL SYSTEMS + DATA' : famName(f.family), nodes: f.nodes, functional: pct(f.score), strict: pct(f.strict) })),
    completion_simulation: B.simulation,
    gap_counts: summary.gap_counts,
  });

  files['JURNL_STRUCTURAL_BLOCKERS.json'] = j({ ...header, severities: ['CRITICAL_PATH', 'HIGH', 'MEDIUM', 'LOW'], counts: summary.blockers, top_critical: BLOCKERS.filter((b) => b.severity === 'CRITICAL_PATH').map((b) => `${b.id} ${b.title}`), blockers: BLOCKERS, founder_flags: FOUNDER_FLAGS, graph_validation: summary.validation, fake_completion: B.fakeCompletion });

  const tasksByWave = ([0, 1, 2, 3, 4, 5] as Wave[]).map((w) => ({ wave: w, title: WAVE_TITLES[w], tasks: WAVE_TASKS.filter((t) => t.wave === w), nodes_completed: B.F.filter((n) => n.functional_score < 1 && n.target_wave === w).length }));
  files['JURNL_IMPLEMENTATION_WAVES.json'] = j({ ...header, rule: 'Waves follow data dependencies: shared primitives + contracts first, source families before derived ones, providers last. No wave depends on generation.', waves: tasksByWave, parallelizable: { W2: ['F05', 'F06', 'F07'], W3: ['F08', 'F12', 'F14 (F09 waits for F05 / F06 / F07)'], W4: ['F10', 'F11', 'F13', 'F15', 'F16'] }, simulation: B.simulation });

  files['JURNL_SHARED_PRIMITIVES.json'] = j({ ...header, primitives: SHARED_PRIMITIVES, role_map: ROLE_MAP });

  files['JURNL_ICON_REQUIREMENTS_CATALOG.json'] = j({
    ...header,
    classes: ['GLOBAL_NAV', 'GLOBAL_UTILITY', 'FINANCIAL_CATEGORY', 'FAMILY_SPECIFIC', 'DATA_STATUS', 'ACTION', 'OTHER'],
    runtime_icon_names: B.iconNames,
    source_sheet: 'JURNL/F01_ENTRY/ICONS/F01_ICON_PACK_SHEET.png (single sheet; F02 inherits 12, adds 0)',
    counts: summary.icons.by_status,
    recommendation: {
      GLOBAL_ICON_SYSTEM_RECOMMENDED: 'YES',
      why: 'The F01 sheet covers entry + trust only. Nav (home, money, plan, credit), every category, account kinds, data status and family marks are placeholders or missing; three glyphs carry two meanings each (clock, document, download).',
      structure: { 'JURNL.ICON.GLOBAL': 'NAV + UTILITY + ACTION + DATA_STATUS (one sheet, all families)', 'JURNL.ICON.CATEGORY': 'CLOSED CATEGORY + ACCOUNT KIND SET (after FF.CATEGORY_SET)', 'JURNL.ICON.FAMILY.Fxx': 'ONE MARK PER FAMILY JOB WHERE A ROW NEEDS IT (F06, F07, F09–F16)' },
      functional_fallback: 'Placeholders stay mounted with ICON_AUTHORITY_MISSING recorded; no icon is invented or generated for functional completion.',
    },
    icons: ICON_REQUIREMENTS,
  });

  files['JURNL_GENERATION_REQUIREMENTS_MAP.json'] = j({ ...header, rule: 'Generation is a VISUAL-track input only. No functional node requires it. NEW_PAID_GENERATIONS 0, CREDITS_SPENT 0 this sprint.', summary: B.generation, nodes: B.V.map((n) => ({ node_id: n.node_id, family_id: n.family_id, node_type: n.node_type, visual_status: n.visual_status, plate_policy: n.plate_policy, inheritance_class: n.inheritance_class, ...n.generation_requirement })) });

  const byKind = (k: string) => REUSABLE_CANDIDATES.filter((r) => r.kind === k);
  files['JURNL_REUSABLE_CAPABILITY_CANDIDATES.json'] = j({ ...header, ontology_status: 'EMERGING — IDENTIFIED ONLY. NOT FORMALIZED IN CODE. NOTHING EXTRACTED OR BRAND-NEUTRALIZED.', kinds: { BLUEPRINT: 'A whole product or family shape (tree + contracts).', SYSTEM: 'A cross-family capability with its own contract.', EXTENSION: 'An optional, separately-entitled capability set.', PRIMITIVE: 'A reusable component or behaviour.' }, counts: { BLUEPRINT: byKind('BLUEPRINT').length, SYSTEM: byKind('SYSTEM').length, EXTENSION: byKind('EXTENSION').length, PRIMITIVE: byKind('PRIMITIVE').length }, candidates: REUSABLE_CANDIDATES });

  files['JURNL_STRUCTURAL_COST_INPUT_MODEL.json'] = j({
    ...header,
    pricing_status: 'NOT_PRICED — inputs only. No prices are calculated.',
    formula_shape: 'cost(family) = Σ implementation inputs × founder-confirmed rate + Σ visual-track generations × current provider credit price. Both rates are unset.',
    observed_credit_evidence: { parent_authority_text_to_image_kept: 315, parent_authority_reference_guided_reframe: 639, f03_authority_first_full_page_plus_plate: 644, source: 'catalog.ts credits + F03_AUTHORITY_FIRST_PLATE_DERIVATION_QA.json' },
    families: FAMILY_CANON.map(([id]) => {
      const fn = famNodes(id);
      const todo = fn.filter((n) => n._functionalScope && n.functional_score < 1);
      const spec = PARENTS.find((p) => p.id === id);
      const tasks = WAVE_TASKS.filter((t) => t.id.endsWith(id));
      return {
        family_id: id,
        implementation_inputs: { nodes_to_complete: todo.length, new_routes: todo.filter((n) => n.route && n.implementation_status === 'MISSING').length, new_sheets_drawers_modals: todo.filter((n) => ['SHEET', 'DRAWER', 'MODAL'].includes(n.node_type) && n.implementation_status === 'MISSING').length, states_to_wire: todo.filter((n) => n.node_type === 'STATE').length, interactions_to_wire: todo.filter((n) => n.node_type === 'INTERACTION').length, owned_domains: DATA_DOMAINS.filter((d) => d.owner === id).map((d) => d.id), complexity: tasks[0]?.complexity ?? (id <= 'F04' ? 'S–M (completion only)' : null) },
        visual_track_inputs: { parent_reauthority: spec?.interference === 'FAIL', optional_plate_modulations: fn.filter((n) => n.implementation_status === 'MISSING' && n.plate_policy === 'MODULATE_PARENT_PLATE').length, child_authorities_required: 0, icons_missing_or_placeholder: ICON_REQUIREMENTS.filter((i) => i.families.includes(id) && i.status !== 'EXISTING_CANONICAL').length },
      };
    }),
  });

  files['JURNL_PREGENERATION_FAMILY_BLUEPRINTS.json'] = j({ ...header, zero_generation_rule: 'Every node reaches FUNCTIONAL on a neutral structural presentation: existing JURNL primitives, live data, the global composition + containment rules, the family parent plate where it is valid (REUSE / MODULATE policies), or the bone field (JurnlScreen field="bone") for NO_PLATE nodes and interference-FAIL families. Neutral is a holding state, not the final design; no generic-SaaS components, colors or type are introduced.', families: FAMILY_CANON.map(([id]) => familyBlueprint(B, id)) });

  for (const [id, name] of FAMILY_CANON) files[`${id}_${slug(name)}_STRUCTURAL_BLUEPRINT.json`] = j({ ...header, ...familyFile(B, id) });

  files['JURNL_COMPLETE_PRODUCT_BLUEPRINT.md'] = renderBlueprintMd(B);
  files['JURNL_100_PERCENT_FUNCTIONAL_PLAN.md'] = renderPlanMd(B);
  return files;
}

type Built = ReturnType<typeof buildBlueprint>;

function familyBlueprint(B: Built, id: string) {
  const fn = B.nodes.filter((n) => n.family_id === id);
  const parent = fn.find((n) => n.node_type === 'FAMILY_PARENT')!;
  const authored = AUTHORED_FAMILIES.find((f) => f.id === id);
  const spec = PARENTS.find((p) => p.id === id);
  const plate = spec ? (spec.interference === 'PASS' ? `EXISTING ${id} PLATE (INTERFERENCE PASS)` : `BONE FIELD OR EXISTING PLATE WITH LEFT-RAIL CONTAINMENT (INTERFERENCE FAIL; PLATE NOT CHANGED)`) : 'EXISTING FAMILY PLATES (IMPLEMENTED)';
  return {
    family_id: id,
    parent_contract: {
      question: spec?.question ?? parent.purpose,
      primary_action: authored?.parentContract.primaryAction ?? null,
      secondary_action: authored?.parentContract.secondaryAction ?? null,
      data: parent.data_dependencies,
      links: authored?.parentContract.links ?? [],
      states: fn.filter((n) => n.node_type === 'STATE' && !isChild(B, n)).map((n) => n.node_id),
      drawers_sheets_modals: fn.filter((n) => ['DRAWER', 'SHEET', 'MODAL'].includes(n.node_type) && !isChild(B, n)).map((n) => n.node_id),
      children: fn.filter((n) => isChild(B, n)).map((n) => n.node_id),
      global_systems: authored?.globalSystems ?? parent.interaction_dependencies,
    },
    child_classification: fn.filter((n) => n._visualScope && n.node_type !== 'FAMILY_PARENT').map((n) => ({ node_id: n.node_id, structural_form: n.structural_form, inheritance_class: n.inheritance_class, plate_policy: n.plate_policy })),
    zero_generation_fallback: { presentation: 'NEUTRAL_STRUCTURAL', plate: plate, live_data: true, generic_saas_drift: 'FORBIDDEN' },
    visual_track_after_functional: { parent: parent.generation_requirement, unbuilt_visual_nodes: fn.filter((n) => n._visualScope && n.implementation_status === 'MISSING').length },
  };
}

/** An expression-tree CHILD (whatever its structural form) or a routed child page. */
const isChild = (B: Built, n: GNode) => n.node_type === 'CHILD_PAGE' || B.trees.get(n.node_id)?.node_type === 'CHILD' || AUTHORED_FAMILIES.some((f) => f.children.some((c) => c.id === n.node_id));

/** True when a blocker's `affects` entry covers the family: exact id, a node of the family, a range (F05–F16), ALL or every domain. */
function affectsFamily(a: string, id: string) {
  if (a === 'ALL' || a === 'DD.*' || a === id || a.startsWith(`${id}.`)) return true;
  const m = /^F(\d\d)–F(\d\d)$/.exec(a);
  return !!m && Number(id.slice(1)) >= Number(m[1]) && Number(id.slice(1)) <= Number(m[2]);
}

function familyFile(B: Built, id: string) {
  const fn = B.nodes.filter((n) => n.family_id === id);
  const parent = fn.find((n) => n.node_type === 'FAMILY_PARENT')!;
  const authored = AUTHORED_FAMILIES.find((f) => f.id === id);
  const pick = (t: NodeType[]) => fn.filter((n) => t.includes(n.node_type)).map((n) => n.node_id);
  const owned = DATA_DOMAINS.filter((d) => d.owner === id).map((d) => d.id);
  const reads = authored?.reads ?? [...new Set(fn.flatMap((n) => n.data_dependencies))].filter((d) => !owned.includes(d));
  const fs = B.famScores.find((f) => f.family === id)!;
  const vis = fn.filter((n) => n._visualScope);
  const caps = B.capsFor(id).map((c) => `${c.id} (${c.domain}${c.surfaceStatus === 'DISABLED' ? ', DISABLED' : ''})`);
  return {
    family_id: id,
    name: FAMILY_CANON.find(([f]) => f === id)![1],
    purpose: parent.purpose,
    product_job: authored?.productJob ?? parent.purpose,
    parent: strip(parent),
    children: fn.filter((n) => isChild(B, n)).map((n) => ({ id: n.node_id, form: n.structural_form, inheritance: n.inheritance_class, route: n.route, status: n.functional_status })),
    grandchildren: pick(['GRANDCHILD_PAGE']),
    drawers: fn.filter((n) => n.node_type === 'DRAWER' && !isChild(B, n)).map((n) => n.node_id),
    sheets: fn.filter((n) => n.node_type === 'SHEET' && !isChild(B, n)).map((n) => n.node_id),
    modals: pick(['MODAL', 'OVERLAY']),
    states: fn.filter((n) => n.node_type === 'STATE' && !isChild(B, n)).map((n) => ({ id: n.node_id, status: n._state })),
    interactions: fn.filter((n) => n.node_type === 'INTERACTION').map((n) => ({ id: n.node_id, status: n._ix, opens: n.opens })),
    routes: fn.filter((n) => n.route).map((n) => ({ node_id: n.node_id, route: n.route, status: n.route_status })),
    global_dependencies: authored?.globalSystems ?? parent.interaction_dependencies,
    data_dependencies: [...new Set([...owned, ...reads])],
    owned_data: owned,
    read_data: reads,
    write_data: authored ? [...new Set([...authored.owns, ...authored.writes])] : owned,
    shared_primitives: SHARED_PRIMITIVES.filter((p) => p.consumers.some((c) => c === 'ALL' || c === id || (c.includes('–') && c.startsWith('F') && id >= c.slice(0, 3) && id <= c.slice(-3)))).map((p) => p.id),
    responsive_contract: RESP,
    accessibility_contract: A11Y,
    analytics_hooks: ['trackActivity:jurnl_screen_view {screenId}', 'trackActivity:jurnl_interaction {interactionId}', ...(B.capsFor(id).some((c) => c.enforcement === 'SERVER_ENFORCED') ? ['buildMonetizationEvent:feature_gate_seen {familyId, capability}'] : [])],
    security_requirements: ['USER-SCOPED DATA; NO FINANCIAL VALUES IN ANALYTICS', 'DESTRUCTIVE ACTIONS BEHIND A CONFIRM', ...(id === 'F01' ? ['NO PREVIEW-ACCOUNT STORAGE IN PRODUCTION BUILDS', 'PROVIDER-BACKED AUTH BEFORE LAUNCH'] : []), ...(id === 'F16' ? ['PRIVATE FILE STORAGE; EXPORT IS A SAFETY FLOOR'] : []), 'PRODUCTION SECURITY NOT CLAIMED (NO TEST EVIDENCE)'],
    capabilities: caps,
    functional_status: { score: Math.round(fs.score * 1000) / 10, strict: Math.round(fs.strict * 1000) / 10, gap_counts: fn.reduce<Record<string, number>>((a, n) => ((a[n.functional_status] = (a[n.functional_status] ?? 0) + 1), a), {}) },
    visual_status: { visual_nodes: vis.length, visually_implemented: vis.filter((n) => n.visual_status === 'VISUALLY_IMPLEMENTED').length, parent: parent.visual_status },
    expression_status: parent.expression_status,
    plate_policy: Object.fromEntries(vis.map((n) => [n.node_id, n.plate_policy])),
    icon_requirements: parent.icon_requirements,
    reference_requirements: parent.reference_requirement,
    generation_requirements: { parent: parent.generation_requirement, required_for_functional: false },
    approval_requirements: { parent: parent.approval_status, rule: 'FOUNDER MARKS LOVE_IT; NEVER SET AUTOMATICALLY. CHILD VISUALS FOLLOW PARENT APPROVAL.' },
    functional_blockers: BLOCKERS.filter((b) => b.blocks === 'FUNCTIONAL' && b.affects.some((a) => affectsFamily(a, id))).map((b) => `${b.id} ${b.title}`),
    launch_blockers: BLOCKERS.filter((b) => b.blocks === 'LAUNCH' && b.affects.some((a) => affectsFamily(a, id))).map((b) => `${b.id} ${b.title}`),
    implementation_dependencies: ({ F01: ['W5.1', 'W5.5'], F02: ['W0.3', 'W0.4', 'W1.5', 'W1.6'], F03: ['W0.3', 'W0.5', 'W0.6', 'W1.3', 'W2.F07', 'W3.F09'], F04: ['W0.1', 'W0.2', 'W0.3', 'W0.4', 'W0.5', 'W1.4'] } as Record<string, string[]>)[id] ?? WAVE_TASKS.filter((t) => t.id.endsWith(id)).flatMap((t) => t.dependsOn),
    boundaries: authored?.boundaries ?? [],
    extension: authored?.extension ?? null,
    founder_flags: authored?.founderFlags ?? [],
    reusable_capability_candidates: REUSABLE_CANDIDATES.filter((r) => r.source.some((s) => s.includes(`/f0${id.slice(2)}`) || s.includes(`${id}_`)) || parent.reusable_capability_candidate === r.id).map((r) => r.id),
  };
}

/* ───────────────────────── markdown ───────────────────────── */

function table(head: string[], rows: (string | number)[][]) {
  return [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

function renderBlueprintMd(B: Built) {
  const s = B.summary;
  const famRows = FAMILY_CANON.map(([id, name]) => {
    const fn = B.nodes.filter((n) => n.family_id === id);
    const parent = fn.find((n) => n.node_type === 'FAMILY_PARENT')!;
    const f = B.famScores.find((x) => x.family === id)!;
    return [id, name, parent.route ?? '', parent.functional_status, `${Math.round(f.score * 1000) / 10}%`, fn.filter((n) => n.node_type === 'CHILD_PAGE').length, fn.filter((n) => ['DRAWER', 'SHEET', 'MODAL', 'OVERLAY'].includes(n.node_type)).length, fn.filter((n) => n.node_type === 'STATE').length, fn.filter((n) => n.node_type === 'INTERACTION').length, parent.visual_status === 'VISUALLY_IMPLEMENTED' ? 'YES' : parent.visual_status === 'INVALID_EXPRESSION' ? 'FAIL' : 'NO'];
  });
  return `# JURNL — COMPLETE PRODUCT BLUEPRINT

Sprint \`${SPRINT}\` · audited main \`${AUDITED_MAIN}\` · ${AUDIT_DATE} · zero generation.

Generated by \`scripts/jurnl/structural-blueprint/build.ts\` from the live F01–F04 contracts, the parent catalog, the
JURNL expression trees and \`model.ts\`. Regenerate with \`npx tsx scripts/jurnl/structural-blueprint/build.ts\`;
\`--check\` fails when the committed artifacts drift. The canonical graph is \`JURNL_CANONICAL_PRODUCT_GRAPH.json\`.

## Doctrine

Structural completion and visual completion are separate tracks:
FULL PRODUCT TREE → COMPLETE FUNCTIONAL SHELL → 100% FUNCTIONAL → VISUAL TRANSFORMATION BY FAMILY → APPROVAL → LAUNCH.
Paid generation is not on the structural critical path. Each node carries three tracks (structural, visual, release).

## Where JURNL stands

**${s.completion.FUNCTIONAL}% FUNCTIONAL / ${s.completion.VISUAL}% VISUALLY IMPLEMENTED / ${s.completion.APPROVAL}% APPROVED / ${s.completion.LAUNCH}% LAUNCH READY**

- Functional is ESTIMATED, confidence MEDIUM. It is unit-balanced (F01–F16 + GLOBAL count once each); node-weighted ${s.completion.FUNCTIONAL_NODE_WEIGHTED}%, strict ${s.completion.FUNCTIONAL_STRICT}%. Formulas: \`JURNL_PROGRESS_METRIC_MODEL.json\`.
- ${s.totals.TOTAL_MATERIAL_NODES} material nodes: ${s.totals.PARENTS} parents, ${s.totals.CHILD_PAGES} child pages, ${s.totals.GRANDCHILD_PAGES} grandchild pages, ${s.totals.DRAWERS} drawers, ${s.totals.SHEETS} sheets, ${s.totals.MODALS} modals, ${s.totals.OVERLAYS} overlays, ${s.totals.STATES} states, ${s.totals.INTERACTIONS} interactions, ${s.totals.GLOBAL_SYSTEMS} global systems, ${s.totals.DATA_DOMAINS} data domains, ${s.totals.SHARED_PRIMITIVES} shared primitives.
- F01 and F02 are implemented and QA-passed but depend on simulated providers and session-only data. F03 and F04 run on mock data. F05–F16 are parent placeholders with disabled CTAs; their children do not exist.
- Nine families (${s.validation.family_parents_unreachable_today.join(', ')}) can only be reached through the review board or a typed URL.

## Families

${table(['ID', 'NAME', 'ROUTE', 'PARENT STATUS', 'FUNCTIONAL', 'CHILD PAGES', 'OVERLAYS', 'STATES', 'INTERACTIONS', 'PARENT VISUAL'], famRows)}

Per-family detail: \`F01_ENTRY_STRUCTURAL_BLUEPRINT.json\` … \`F16_RECORDS_STRUCTURAL_BLUEPRINT.json\`.

## Ownership decisions encoded

${AUTHORED_FAMILIES.map((f) => `- **${f.id}** — ${f.boundaries[0]}`).join('\n')}
- **F05 vs F12 accounts** — one registry in F05; F12 owns credit attributes on card / loan places.
- **F03 vs F09** — one safe-to-spend formula owned by F09; F03 reads it.
- **Business / tax** — JURNL BUSINESS EXTENSION anchored in F16, server-enforced, outside core functional scope.

## Global systems

${table(['SYSTEM', 'SCOPE', 'NOW', 'WAVE'], GLOBAL_SYSTEMS.map((g) => [g.name, g.scope, g.current, g.wave]))}

## Blockers (critical path)

${BLOCKERS.filter((b) => b.severity === 'CRITICAL_PATH').map((b) => `- **${b.id} ${b.title}** (${b.blocks}) — ${b.resolution}`).join('\n')}

All ${BLOCKERS.length} blockers: \`JURNL_STRUCTURAL_BLOCKERS.json\`.

## Graph validation

- Orphans: ${s.validation.orphans.length} · dangling opens: ${s.validation.dangling_opens.length} · target-unreachable: ${s.validation.target_unreachable.length}
- Family parents unreachable today: ${s.validation.family_parents_unreachable_today.length}
- Dead ends today: ${s.validation.dead_ends_today.length} · competing ownership: ${s.validation.competing_ownership} domains · fake-completion claims: ${s.validation.fake_completion}

## Founder decisions (real product judgment only)

${FOUNDER_FLAGS.map((f) => `- **${f.id}** — ${f.question} Default: ${f.default}`).join('\n')}

## Generation

Generation required to reach 100% functional: **${s.generation.GENERATION_REQUIRED_TO_REACH_100_PERCENT_FUNCTIONAL}**. New paid generations: 0. Credits spent: 0.
Visual track afterwards: ${s.generation.FAMILIES_REQUIRING_PARENT_AUTHORITY.length} parent re-authorities (${s.generation.FAMILIES_REQUIRING_PARENT_AUTHORITY.join(', ')}), ${s.generation.MATERIAL_CHILD_AUTHORITIES.length} required child authorities, ${s.generation.DISTINCT_SUB_EXPRESSIONS_UNBUILT.length} distinct sub-expressions to build, and ${s.generation.NO_PLATE_NODES} unbuilt no-plate nodes. Plate reuse or modulation is expected on ${s.generation.PARENT_PLATE_REUSE_EXPECTED.length} nodes.
`;
}

function renderPlanMd(B: Built) {
  const sim = B.simulation;
  return `# JURNL — 100% FUNCTIONAL PLAN

Target: every F01–F16 node FUNCTIONAL on a neutral structural presentation, with **no new visual generation**.
Visual transformation runs afterwards, family by family, then founder approval, then launch.

## Completion simulation

${table(['AFTER WAVE', 'FUNCTIONAL (BALANCED)', 'NODE-WEIGHTED', 'STRICT', 'NODES COMPLETED IN WAVE'], sim.map((r) => [`W${r.after_wave}`, `${r.functional_completion}%`, `${r.node_weighted}%`, `${r.strict}%`, r.nodes_completed_in_wave]))}

Each node's \`target_wave\` in the canonical graph says when it reaches 12/12. Waves 0–4 make F02–F16 and the global systems
functional on device persistence. Wave 5 brings the identity providers (auth, email, social, native bridge) that F01 needs to
reach 100% — a founder decision (FF.AUTH_PROVIDER), not a generation — and closes the launch gates (server persistence, RLS,
noindex, analytics, accessibility audit).

## Zero-generation rule

New nodes use existing JURNL primitives and live data. They mount on the family's parent plate where the plate is valid
(REUSE / MODULATE policy), or on the bone field (\`JurnlScreen field="bone"\`) for NO_PLATE nodes and interference-FAIL families.
Neutral is a holding state. No generic-SaaS components, colours or type are added. Plates are not changed.

## Waves (composer-ready)

${([0, 1, 2, 3, 4, 5] as Wave[]).map((w) => `### WAVE ${w} — ${WAVE_TITLES[w]}

${WAVE_TASKS.filter((t) => t.wave === w).map((t) => `**${t.id} ${t.title}** · complexity ${t.complexity} · collision ${t.collisionRisk} · group ${t.parallelGroup}
- Scope: ${t.scope}
- Depends on: ${t.dependsOn.length ? t.dependsOn.join(', ') : 'nothing'}
- Files: ${t.files.map((f) => `\`${f}\``).join(', ')}
- Pass: ${t.pass.join(' ')}`).join('\n\n')}`).join('\n\n')}

## Parallelization

- W0: A-group tasks (W0.1, W0.2, W0.6, W0.7, W0.9) run in parallel; W0.3 and W0.8 are high-collision — one owner each.
- W2: F05, F06 and F07 in parallel.
- W3: F08, F12 and F14 in parallel; F09 waits for W2.
- W4: F10, F11, F13, F15 and F16 in parallel.

## Pass conditions for "100% FUNCTIONAL"

- Every node in \`JURNL_CANONICAL_PRODUCT_GRAPH.json\` scores 12/12 on its applicable criteria (\`JURNL_FUNCTIONAL_COMPLETION_CONTRACT.json\`).
- Graph validation: 0 orphans, 0 dangling opens, 0 target-unreachable, 0 families reachable only through the review board.
- \`interactive-text-qa.mjs\` at 0 drift on every new route and overlay at 393 / 834 / 1440.
- No generation call anywhere in waves 0–4.
`;
}

/* ───────────────────────── main ───────────────────────── */

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = renderArtifacts();
  const check = process.argv.includes('--check');
  let drift = 0;
  if (!check) mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    const path = join(OUT_DIR, name);
    if (check) {
      if (!existsSync(path) || readFileSync(path, 'utf8') !== body) {
        drift++;
        console.error(`DRIFT ${name}`);
      }
    } else writeFileSync(path, body);
  }
  const s = buildBlueprint().summary;
  console.log(JSON.stringify({ files: Object.keys(files).length, completion: s.completion, totals: { ...s.totals, by_type: undefined }, validation: { ...s.validation, competing_ownership: s.validation.competing_ownership } }, null, 2));
  if (check && drift) process.exit(1);
}
