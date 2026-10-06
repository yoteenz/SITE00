/**
 * AIO IFTA — gate steps 04–07B as data, from the authority bundle.
 *
 * CLIENT is the PARENT: three composition territories (CLIENT_3_TERRITORIES) → founder LOVE_IT on 03 THE ANALYTICS
 * COMMAND rendered LIGHT (theme is a cosmetic lever, not a structural one) → locked PAGE_FAMILY_AUTHORITY.
 * FOUNDER_STAFF and PUBLIC DERIVE from the locked client parent (founder decision: parent authority precedes actor /
 * viewport derivation) with their own reference authorities, approval and lock.
 * The page / tab / state tree is PRODUCED by this sprint and awaits founder confirmation (step 07B).
 */
import { aio } from '../../../../studioos-experience-brain/index.js';
import type { ExperienceActor, Viewport } from '../../../../studioos-experience-brain/schema.js';
import type {
  AuthorityDerivation,
  CompositionTerritory,
  FlexibleImplementationArea,
  FounderAuthorityDecision,
  PageFamilyAuthority,
  PageTreeConfirmation,
  ReferenceAuthority,
  ReferenceAuthorityFormat,
} from '../../../schema.js';
import { REFERENCE_AUTHORITY_MUST_SHOW } from '../../../schema.js';
import { AIO_BRAND_CONTEXT_ID, AIO_IFTA_INGESTED_AT, bundleFile, type BundleRefId } from './bundle.js';

const c = aio.AIO_IFTA_CONTRACT;
const EXPERIENCE_CONTRACT_ID = `${c.feature_id}@${c.schema_version}`;
const base = { project_id: 'AIO', family_id: c.family_id, feature_id: c.feature_id };

export const T01 = 'AIO.IFTA.CLIENT.T01_EXECUTIVE_DOSSIER';
export const T02 = 'AIO.IFTA.CLIENT.T02_SPATIAL_WORKROOM';
export const T03 = 'AIO.IFTA.CLIENT.T03_ANALYTICS_COMMAND';

/* ─────────────────────────────── 04 territories (CLIENT_3_TERRITORIES) ─────────────────────────────── */

const NOT_SELECTED = 'NOT SELECTED — retained as lineage (founder LOVE_IT went to T03 rendered LIGHT).';

export const AIO_IFTA_CLIENT_TERRITORIES: CompositionTerritory[] = [
  {
    ...base, territory_id: T01, actor: 'CLIENT', name: '01 THE EXECUTIVE DOSSIER',
    concept: 'CINEMATIC · PREMIUM · STRUCTURED — a polished, editorial experience that treats the quarter like a formal dossier.',
    core_idea: 'The quarter is a bound filing packet the client reviews line by line.',
    metaphor: 'EXECUTIVE DOSSIER — a bound quarter filing packet',
    primary_object: 'THE QUARTER as a physical filing packet (binder object)',
    page_logic: 'Cinematic office hero with a quarter-overview card → horizontal four-step stepper → the packet object beside a six-line checklist → recent uploads + jurisdiction breakdown → next-action bar + help.',
    major_zones: ['cinematic office hero + quarter overview card', 'horizontal 4-step stepper', 'filing packet object + checklist', 'recent uploads + jurisdiction breakdown', 'next-action bar + help'],
    structure: {
      spatial_logic: 'editorial dossier — packet object and checklist side by side under a horizontal stepper',
      primary_zone: 'the filing packet binder object',
      visual_hierarchy: 'object first (the packet), then the checklist, then data',
      interaction_emphasis: 'open a checklist line from the packet',
      information_density: 'balanced',
      media_relationship: 'cinematic office interior as hero backdrop; the packet rendered as a physical object',
    },
    composition_logic: 'One hero object (the packet) anchors the page; the checklist is its table of contents.',
    actor_fit: 'Clients who want a high-trust, formal feel.', state_fit: 'Strong for review / approval; weaker for high-volume collection.',
    mobile_logic: 'Stacked: hero card → stepper → packet → checklist → panels → next action.', desktop_logic: 'Not shown in the selection board.',
    visual_language: 'Dark cinematic, gold accents, marble + leather materials.', risks: ['Object metaphor can hide data density', 'Copy overstated automation'],
    brand_fit: 'Executive industrial; operational luxury.', experience_fit: 'Matches the packet-builder archetype of the experience contract.',
    status: 'IN_REVIEW', founder_decision: NOT_SELECTED,
  },
  {
    ...base, territory_id: T02, actor: 'CLIENT', name: '02 THE SPATIAL WORKROOM',
    concept: 'IMMERSIVE · INTERACTIVE · OPERATIONAL — an environment-driven experience where the quarter becomes a physical workroom.',
    core_idea: 'The quarter is a room; each part of the filing is a glass cube you step into.',
    metaphor: 'SPATIAL WORKROOM — six glass cubes on a round platform',
    primary_object: 'THE QUARTER as an immersive room of six step cubes',
    page_logic: 'Immersive glass-room hero with a metrics column → circular four-step stepper → six glass cubes (one per checklist line) on a platform → jurisdiction map + recent uploads → continue bar + help.',
    major_zones: ['immersive hero + metrics column', 'circular 4-step stepper', 'six-cube platform', 'jurisdiction map + recent uploads', 'continue bar + help'],
    structure: {
      spatial_logic: 'immersive 3D room — six glass cubes arranged on a round platform',
      primary_zone: 'the cube platform (one cube per filing step)',
      visual_hierarchy: 'environment and current step first',
      interaction_emphasis: 'enter a cube / step',
      information_density: 'sparse',
      media_relationship: 'immersive environment wraps the whole page',
    },
    composition_logic: 'Spatial navigation replaces lists: the room is the interface.',
    actor_fit: 'Clients who prefer a visual, guided experience.', state_fit: 'Strong for progress; weak for record-level work (receipts, mileage tables).',
    mobile_logic: 'Hero → stepper → 2×3 cube grid → panels → continue.', desktop_logic: 'Not shown in the selection board.',
    visual_language: 'Dark glass, glow, gold rim light.', risks: ['3D cubes are costly to build and to make accessible', 'Low information density for long sessions'],
    brand_fit: 'Modern infrastructure; cinematic.', experience_fit: 'Expresses the six-step quarter; weak on compartments-as-data.',
    status: 'IN_REVIEW', founder_decision: NOT_SELECTED,
  },
  {
    ...base, territory_id: T03, actor: 'CLIENT', name: '03 THE ANALYTICS COMMAND',
    concept: 'DATA-RICH · MODERN · HIGH-CONTROL — a focused, analytical experience centred on live data, maps and actionable insights.',
    core_idea: 'The quarter is a live business object: identity + live metrics + a tab family of its compartments + process status + insights.',
    metaphor: 'ANALYTICS COMMAND — the quarter as a live command view',
    primary_object: 'THE QUARTER (Q3 2026) — high-visibility quarter identity with live metrics',
    page_logic: 'Cinematic perimeter hero with quarter identity + state chip → metrics rail → tab family (PROGRESS · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS) → process status + actionable panels (map, uploads, insights, activity) → strong next-action rail → full lower brand band.',
    major_zones: ['perimeter hero + quarter identity + state chip', 'metrics rail', 'tab bar', 'process status (filing workflow + preparation checklist)', 'actionable panels (map / data viz · recent uploads · AIO insights · recent activity)', 'next-action rail + help', 'lower brand band'],
    structure: {
      spatial_logic: 'command dashboard — metrics rail and a tab family over a modular panel grid',
      primary_zone: 'metrics rail + tab bar + process status panel',
      visual_hierarchy: 'live data first (metrics), then process status, then insights',
      interaction_emphasis: 'switch tabs and drill into data panels',
      information_density: 'dense',
      media_relationship: 'cinematic highway hero as a perimeter band above a clean operational body',
    },
    composition_logic: 'Hero perimeter → data → tabs → panels → one next action; tabs are compartments of one quarter.',
    actor_fit: 'Clients who want full transparency and quick access to details; scales to staff density.', state_fit: 'Every state expressed by the state chip, workflow, checklist and next-action rail.',
    mobile_logic: 'Single column: hero → metrics rail → scrollable tab bar → stacked panels → next-action rail → lower band.', desktop_logic: 'Three-column panel grid under hero + metrics + tabs (CLIENT_TABLET_DESKTOP).',
    visual_language: 'Approved LIGHT: clean light operational body; cinematic perimeter; gold accents; dark next-action rail.', risks: ['Can drift to a generic dashboard if the quarter identity and next action weaken'],
    brand_fit: 'Executive industrial × modern infrastructure × operational luxury.', experience_fit: 'Desktop behaviour of the contract already models compartments as tabs of one packet.',
    cosmetic: { color: 'selection board DARK → approved LIGHT_PRIMARY for client mode' },
    status: 'SELECTED', founder_decision: 'LOVE_IT — approved as LIGHT ANALYTICS COMMAND (client parent authority).',
  },
];

/* ─────────────────────────────── 05 reference authorities ─────────────────────────────── */

const SHOWS = [...REFERENCE_AUTHORITY_MUST_SHOW];
const ref = (reference_id: string, territory_id: string, file: BundleRefId, viewport: Viewport, states_shown: string[], format: ReferenceAuthorityFormat = 'GENERATED_FULL_PAGE_REFERENCE'): ReferenceAuthority => ({
  reference_id, territory_id, format, reference_paths: [bundleFile(file).path], viewport, states_shown, shows: [...SHOWS], role: 'PAGE_LOGIC_COMPOSITION_DIRECTION_CONTRACT', paid_generation: false,
});

/** Territory references (one per territory, from the selection board). */
export const AIO_IFTA_TERRITORY_REFERENCES: ReferenceAuthority[] = [
  ref('REF.CLIENT.T01.SELECTION_BOARD', T01, 'CLIENT_3_TERRITORIES', 'MOBILE', ['AIO_REVIEW'], 'COMPOSED_BOARD'),
  ref('REF.CLIENT.T02.SELECTION_BOARD', T02, 'CLIENT_3_TERRITORIES', 'MOBILE', ['AIO_REVIEW'], 'COMPOSED_BOARD'),
  ref('REF.CLIENT.T03.SELECTION_BOARD', T03, 'CLIENT_3_TERRITORIES', 'MOBILE', ['AIO_REVIEW'], 'COMPOSED_BOARD'),
];

/** The approved client parent + its child proof + viewport derivations (all trace to T03). */
export const AIO_IFTA_CLIENT_REFERENCES: ReferenceAuthority[] = [
  ...AIO_IFTA_TERRITORY_REFERENCES,
  ref('REF.CLIENT.PARENT.MOBILE', T03, 'CLIENT_MOBILE_PARENT_AUTHORITY', 'MOBILE', ['AIO_REVIEW']),
  ref('REF.CLIENT.FUEL_PURCHASES.MOBILE', T03, 'FUEL_PURCHASES_CHILD_PROOF', 'MOBILE', ['COLLECTING', 'NEEDS_CLIENT']),
  ref('REF.CLIENT.TABLET', T03, 'CLIENT_TABLET_DESKTOP', 'TABLET', ['AIO_REVIEW']),
  ref('REF.CLIENT.DESKTOP', T03, 'CLIENT_TABLET_DESKTOP', 'DESKTOP', ['AIO_REVIEW']),
];

export const AIO_IFTA_STAFF_REFERENCES: ReferenceAuthority[] = [
  ref('REF.STAFF.MOBILE', T03, 'ACTOR_MODES_MOBILE', 'MOBILE', ['AIO_REVIEW', 'RECONCILING']),
  ref('REF.STAFF.TABLET', T03, 'FOUNDER_STAFF_TABLET_DESKTOP', 'TABLET', ['AIO_REVIEW', 'RECONCILING']),
  ref('REF.STAFF.DESKTOP', T03, 'FOUNDER_STAFF_TABLET_DESKTOP', 'DESKTOP', ['AIO_REVIEW', 'RECONCILING']),
];

export const AIO_IFTA_PUBLIC_REFERENCES: ReferenceAuthority[] = [
  ref('REF.PUBLIC.MOBILE', T03, 'ACTOR_MODES_MOBILE', 'MOBILE', ['NOT_ENROLLED']),
  ref('REF.PUBLIC.TABLET', T03, 'PUBLIC_TABLET_DESKTOP', 'TABLET', ['NOT_ENROLLED']),
  ref('REF.PUBLIC.DESKTOP', T03, 'PUBLIC_TABLET_DESKTOP', 'DESKTOP', ['NOT_ENROLLED']),
];

/* ─────────────────────────────── 06 founder decisions ─────────────────────────────── */

export const AIO_IFTA_FOUNDER_DECISIONS: Record<'CLIENT' | 'FOUNDER_STAFF' | 'PUBLIC', FounderAuthorityDecision> = {
  CLIENT: { verdict: 'LOVE_IT', territory_ids: [T03], notes: 'Approved client parent authority: LIGHT ANALYTICS COMMAND (T03 structure; LIGHT_PRIMARY theme per actor theme authority). FUEL PURCHASES child derivation cohesion approved. Source: founder manual authority test (sprint §6–7) + bundle 02_CLIENT_MODE.', decided_at: AIO_IFTA_INGESTED_AT },
  FOUNDER_STAFF: { verdict: 'LOVE_IT', territory_ids: [T03], notes: 'Founder / staff mode derived from the client parent (pipeline steps 02–03) and locked in the authority package: LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS, denser. Source: bundle 01 ACTOR_MODES_MOBILE + 03_FOUNDER_STAFF_MODE.', decided_at: AIO_IFTA_INGESTED_AT },
  PUBLIC: { verdict: 'LOVE_IT', territory_ids: [T03], notes: 'Public / customer mode derived from the same family DNA (pipeline steps 02–03) and locked in the authority package: DARK_PRIMARY cinematic service experience. Source: bundle 01 ACTOR_MODES_MOBILE + 04_PUBLIC_CUSTOMER_MODE.', decided_at: AIO_IFTA_INGESTED_AT },
};

/* ─────────────────────────────── 07 locked page-family authorities ─────────────────────────────── */

/** Sprint §28 — implementation may improve these without destroying the authority. */
const FLEX: FlexibleImplementationArea[] = ['SPACING', 'MARGINS', 'MICRO_SPACING', 'BREAKPOINTS', 'RESPONSIVE_BEHAVIOR', 'ACCESSIBILITY', 'MICRO_INTERACTIONS', 'MOTION', 'TRANSITIONS', 'MATERIAL_REALISM', 'MATERIAL_DEPTH', 'DENSITY', 'STATE_CLARITY', 'TYPOGRAPHIC_OPTICS', 'IMAGE_TREATMENT', 'MEDIA_FRAMING'];
const statesFor = (actor: ExperienceActor) => c.states.filter((s) => s.meaning[actor] !== undefined).map((s) => s.id);
const paths = (...ids: BundleRefId[]) => ids.map((id) => bundleFile(id).path);

export const AIO_IFTA_CLIENT_AUTHORITY: PageFamilyAuthority = {
  ...base, authority_id: 'AIO.IFTA.CLIENT.PFA.v1', actor: 'CLIENT', viewports: ['MOBILE', 'TABLET', 'DESKTOP'],
  state_coverage: statesFor('CLIENT'), territory_source: [T03], founder_status: 'APPROVED', authority_level: 'PAGE_FAMILY_AUTHORITY',
  core_logic_locks: [
    { kind: 'PRIMARY_OBJECT', value: 'THE QUARTER (Q{n} {YYYY}) — high-visibility quarter identity with state chip in the hero' },
    { kind: 'PRIMARY_COMPOSITION', value: 'cinematic perimeter hero → metrics rail → tab family → process status + actionable panels on a clean light operational body → next-action rail → full lower brand band' },
    { kind: 'MAJOR_ZONES', value: 'hero · metrics rail · tab bar · process status (filing workflow + checklist) · actionable panels (map / data viz · recent uploads · AIO insights · recent activity) · next-action rail + help · lower brand band' },
    { kind: 'CORE_HIERARCHY', value: 'quarter identity + state → live metrics → active tab → process status / blockers → supporting panels' },
    { kind: 'CTA_HIERARCHY', value: 'exactly one dark next-action rail per tab × state (the single next thing); help rail (message your AIO team) secondary' },
    { kind: 'SPATIAL_LOGIC', value: 'tabs are compartments of one quarter — shared shell, own logic' },
    { kind: 'MEDIA_RELATIONSHIP', value: 'cinematic trucking perimeter above the body, never behind operational data' },
    { kind: 'METAPHOR', value: 'QUARTERLY FILING ROOM rendered as LIGHT ANALYTICS COMMAND' },
    { kind: 'STATE_TRANSITION_LOGIC', value: 'DATA COLLECTION → AIO PREPARATION → CLIENT REVIEW → FILE & CONFIRM over the contract state machine' },
    { kind: 'ACTOR_INTENT', value: 'I know exactly what AIO needs from me — and that the quarter is under control.' },
    { kind: 'APPROVED_TERRITORY', value: 'T03 THE ANALYTICS COMMAND (LIGHT)' },
  ],
  flexible_implementation_areas: FLEX,
  reference_paths: paths('CLIENT_MOBILE_PARENT_AUTHORITY', 'FUEL_PURCHASES_CHILD_PROOF', 'CLIENT_TABLET_DESKTOP', 'CLIENT_3_TERRITORIES'),
  brand_context_id: AIO_BRAND_CONTEXT_ID, experience_contract_id: EXPERIENCE_CONTRACT_ID, supersedes: null,
  lineage: {
    created: AIO_IFTA_INGESTED_AT, territory_lineage: [T01, T02, T03],
    founder_decisions: ['LOVE_IT T03 THE ANALYTICS COMMAND rendered LIGHT_PRIMARY (client parent authority)', 'FUEL PURCHASES child derivation cohesion approved', 'Authority package locked (pipeline step 07)'],
    superseded_by: null,
    reason: 'First page-family authority for AIO IFTA. The earlier quarter-jacket concept (fsbw docs/aio/experience-driven/ifta, sprint P0.AIO.EXPERIENCE-DRIVEN-PAGE-REFINEMENT1) was a concept for founder review, never an authority; it is superseded by this package.',
  },
};

export const AIO_IFTA_FOUNDER_STAFF_AUTHORITY: PageFamilyAuthority = {
  ...base, authority_id: 'AIO.IFTA.FOUNDER_STAFF.PFA.v1', actor: 'FOUNDER_STAFF', viewports: ['MOBILE', 'TABLET', 'DESKTOP'],
  state_coverage: statesFor('FOUNDER_STAFF'), territory_source: [T03], founder_status: 'APPROVED', authority_level: 'PAGE_FAMILY_AUTHORITY',
  core_logic_locks: [
    { kind: 'PRIMARY_OBJECT', value: 'THE CLIENT-QUARTER CASE — one client’s Q{n} {YYYY} with client identity, account and CLIENT HEALTH' },
    { kind: 'PRIMARY_COMPOSITION', value: 'same family shell as the client parent; hero carries client identity + dark CLIENT HEALTH panel; metrics with prior-quarter deltas; tab family (OVERVIEW first) + EXPORT REPORT; denser operational panel grid; dark OPEN RETURN DRAFT rail; lower brand band' },
    { kind: 'MAJOR_ZONES', value: 'hero + client identity + CLIENT HEALTH / risk · metrics rail with deltas · tab bar + export · filing workflow with dates · quarter tasks with assignees · important dates · mileage bars · fuel donut · vehicles · recent client activity · AIO team activity · risks / flags · next-action rail · lower brand band' },
    { kind: 'CORE_HIERARCHY', value: 'client health / risk → metrics vs prior quarter → workflow + tasks + dates → flags and activity' },
    { kind: 'CTA_HIERARCHY', value: 'one dark staff next-action rail per state (OPEN RETURN DRAFT in preparation); operational actions inline on tasks / flags' },
    { kind: 'CLIENT_STAFF_DISTINCTION', value: 'MIRROR, NOT COPY — the same quarter as a case file: health, tasks, team activity, risks, overrides and audit; never the client’s guided flow' },
    { kind: 'ACTOR_INTENT', value: 'I can see exactly what is blocking this filing and act on it.' },
    { kind: 'APPROVED_TERRITORY', value: 'derived from T03 THE ANALYTICS COMMAND (client parent)' },
  ],
  flexible_implementation_areas: [...FLEX, 'CONTROL_DENSITY', 'CONTROL_PLACEMENT'],
  reference_paths: paths('ACTOR_MODES_MOBILE', 'FOUNDER_STAFF_TABLET_DESKTOP'),
  brand_context_id: AIO_BRAND_CONTEXT_ID, experience_contract_id: EXPERIENCE_CONTRACT_ID, supersedes: null,
  lineage: {
    created: AIO_IFTA_INGESTED_AT, territory_lineage: [T03],
    founder_decisions: ['Derived from the locked client parent (pipeline steps 02–03); locked in the authority package (step 07)'],
    superseded_by: null,
    reason: 'Covers the single client-quarter CASE FILE. The multi-client FUEL TAX QUEUE has no reference authority in the package (gap G-STAFF-QUEUE).',
  },
};

export const AIO_IFTA_PUBLIC_AUTHORITY: PageFamilyAuthority = {
  ...base, authority_id: 'AIO.IFTA.PUBLIC.PFA.v1', actor: 'PUBLIC', viewports: ['MOBILE', 'TABLET', 'DESKTOP'],
  state_coverage: statesFor('PUBLIC'), territory_source: [T03], founder_status: 'APPROVED', authority_level: 'PAGE_FAMILY_AUTHORITY',
  core_logic_locks: [
    { kind: 'PRIMARY_OBJECT', value: 'THE IFTA FILING ROOM SERVICE — a clearly SAMPLE quarter as the hero object (never private client data)' },
    { kind: 'PRIMARY_COMPOSITION', value: 'dark cinematic hero with sample quarter + SEE HOW IT WORKS → sample metrics rail → clear-path explanation + image → five-step process → jurisdictions map → built-for pillars → full lockup band' },
    { kind: 'MAJOR_ZONES', value: 'nav (simple mark · sections · GET STARTED) · cinematic hero · sample metrics rail · clear-path explanation + image · process steps · jurisdictions map · built-for pillars · lower brand band' },
    { kind: 'CORE_HIERARCHY', value: 'promise → how it works → why it is different → how to start' },
    { kind: 'CTA_HIERARCHY', value: 'GET STARTED (gold, nav + explanation) starts the REQUEST FILING flow; SEE HOW IT WORKS (hero) scrolls to the process' },
    { kind: 'MEDIA_RELATIONSHIP', value: 'cinematic dark trucking imagery as hero and evidence card; map as the jurisdiction visual' },
    { kind: 'ACTOR_INTENT', value: 'I understand what AIO will handle every quarter and what I send.' },
    { kind: 'APPROVED_TERRITORY', value: 'derived from T03 THE ANALYTICS COMMAND (client parent)' },
  ],
  flexible_implementation_areas: FLEX,
  reference_paths: paths('ACTOR_MODES_MOBILE', 'PUBLIC_TABLET_DESKTOP'),
  brand_context_id: AIO_BRAND_CONTEXT_ID, experience_contract_id: EXPERIENCE_CONTRACT_ID, supersedes: null,
  lineage: {
    created: AIO_IFTA_INGESTED_AT, territory_lineage: [T03],
    founder_decisions: ['Derived from the same family DNA (pipeline steps 02–03); locked in the authority package (step 07)'],
    superseded_by: null,
    reason: 'Public mode is a service experience derived from the family DNA — not the client application with data hidden.',
  },
};

export const AIO_IFTA_DERIVATIONS: Record<'FOUNDER_STAFF' | 'PUBLIC', AuthorityDerivation> = {
  FOUNDER_STAFF: { parent: AIO_IFTA_CLIENT_AUTHORITY, parent_territories: AIO_IFTA_CLIENT_TERRITORIES, references: AIO_IFTA_STAFF_REFERENCES },
  PUBLIC: { parent: AIO_IFTA_CLIENT_AUTHORITY, parent_territories: AIO_IFTA_CLIENT_TERRITORIES, references: AIO_IFTA_PUBLIC_REFERENCES },
};

export const AIO_IFTA_AUTHORITIES: Record<'CLIENT' | 'FOUNDER_STAFF' | 'PUBLIC', PageFamilyAuthority> = {
  CLIENT: AIO_IFTA_CLIENT_AUTHORITY,
  FOUNDER_STAFF: AIO_IFTA_FOUNDER_STAFF_AUTHORITY,
  PUBLIC: AIO_IFTA_PUBLIC_AUTHORITY,
};

/* ─────────────────────────────── 07A / 07B page tree ─────────────────────────────── */

export const AIO_IFTA_PAGE_TREE_ID = 'AIO.IFTA.PAGE_TREE.v1' as const;

/** Produced by this sprint; the founder confirms it (pipeline step 10) before implementation may begin. */
export function aioIftaPageTreeConfirmation(open_decisions: string[]): PageTreeConfirmation {
  return { tree_id: AIO_IFTA_PAGE_TREE_ID, status: 'PRODUCED', produced_at: AIO_IFTA_INGESTED_AT, confirmed_at: null, founder_decision: null, open_decisions };
}
