/**
 * AIO IFTA / Fuel Tax — the first Visual Authority Development Gate test case.
 *
 * The known failure: the IFTA experience contract was coded onto old AIO page geometry (OLD PAGE + NEW CONTENT).
 * This module builds the authority-development INPUT packages (PUBLIC · CLIENT · FOUNDER / STAFF) the founder + ChatGPT
 * use to test-run three composition territories. It does NOT implement the page and does NOT generate references.
 *
 * Inputs: Experience Brain (AIO_DNA, AIO_IFTA_CONTRACT) + brand canon + read-only AIO source (yoteenz/fsbw ·
 * all-in-one-enterprises/ @ fd8bf3c). Every existing AIO surface is FUNCTIONAL_REFERENCE_ONLY (no founder promotion).
 *
 * Since P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1 the test-run's output (the authority bundle) is
 * ingested in ./ifta-authority/ and drives the gate below; the input packages remain as the historical brief.
 */
import { aio } from '../../../studioos-experience-brain/index.js';
import type { ExperienceActor, ExperienceContract, StateVisualRelationship, ViewportBehavior } from '../../../studioos-experience-brain/schema.js';
import { isNotApplicable } from '../../../studioos-experience-brain/schema.js';
import { checkBrandContext, checkExperience, evaluateAuthorityGate, experienceIngest, legacyClassOf, type AuthorityGateResult } from '../../gate.js';
import { AIO_IFTA_AUTHORITIES, AIO_IFTA_CLIENT_REFERENCES, AIO_IFTA_CLIENT_TERRITORIES, AIO_IFTA_DERIVATIONS, AIO_IFTA_FOUNDER_DECISIONS, aioIftaPageTreeConfirmation } from './ifta-authority/authorities.js';
import { AIO_BRAND_AUTHORITY, AIO_BRAND_CONTEXT_ID, AIO_IFTA_BUNDLE_DIR, bundleFile } from './ifta-authority/bundle.js';
import { AIO_IFTA_OPEN_DECISION_IDS } from './ifta-authority/decisions.js';
import { AIO_IFTA_LEGACY_USES } from './ifta-authority/index.js';
import {
  AUTHORITY_DEVELOPMENT_SEQUENCE,
  CORE_LOGIC_LOCK_KINDS,
  DEFAULT_TERRITORY_COUNT,
  FLEXIBLE_IMPLEMENTATION_AREAS,
  LEGACY_FUNCTIONAL_DIMENSIONS,
  LEGACY_VISUAL_DIMENSIONS,
  REFERENCE_AUTHORITY_MUST_SHOW,
  TERRITORY_COSMETIC_LEVERS,
  TERRITORY_STRUCTURAL_DIMENSIONS,
  VISUAL_AUTHORITY_DOCTRINE,
  VISUAL_AUTHORITY_SPRINT,
  type AuthorityGateInput,
  type BrandContext,
  type LegacySurface,
} from '../../schema.js';

const SRC = aio.AIO_SOURCE_REPO;

/* ─────────────────────────────── 01 brand DNA ─────────────────────────────── */

/**
 * Brand context — updated from the founder-approved AIO IFTA AUTHORITY BUNDLE (00_BRAND + 06_CONTRACTS): palette,
 * uppercase typography, the LOCKED logo rule and the actor themes. Questions the bundle answered are closed; the
 * bundle's own internal conflicts are carried as open questions (decisions D-BRAND-TOKENS · D-TYPOGRAPHY).
 */
export const AIO_BRAND_CONTEXT: BrandContext = {
  brand_context_id: AIO_BRAND_CONTEXT_ID,
  project_id: 'AIO',
  positioning: `${aio.AIO_DNA.brand.tagline} ${aio.AIO_DNA.brand.positioning} ${aio.AIO_DNA.brand.promise}`,
  audience: 'Owner-operators, small and growing fleets, office managers and shippers — interstate carriers who need the business side of trucking handled.',
  voice: aio.AIO_DNA.brand.voice,
  color: [...AIO_BRAND_AUTHORITY.palette.map((t) => `${t.token} ${t.hex} — ${t.role}`), ...AIO_BRAND_AUTHORITY.material_world.map((m) => `material world: ${m}`)],
  materials: [...AIO_BRAND_AUTHORITY.materials, 'brushed / satin metal (silver)', 'obsidian glass', 'charcoal steel', 'stone', 'champagne-gold accents', 'clean light operational surfaces (authenticated workspaces)'],
  typography: 'UPPERCASE PRIMARY (locked). Brand DNA board: MONUMENT EXTENDED (headline) · INTER (secondary) · BEBAS NEUE (accent / label). IFTA asset sheet: INTER TIGHT headings · INTER body (+2% tracking). Display face open (D-TYPOGRAPHY). Code tokens Plus Jakarta Sans / DM Sans carry no authority.',
  logo_rules: 'LOCKED: SIMPLE AIO MARK ONLY in tight / top navigation (also app launchers, favicons) — never the full text lockup there. FULL LOCKUP only in spacious lower brand bands / footer / exit regions.',
  mood: 'OPERATIONAL LUXURY — executive industrial × modern infrastructure; calm control over a moving operation. Actor themes: PUBLIC DARK_PRIMARY cinematic · CLIENT LIGHT_PRIMARY · FOUNDER / STAFF LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS.',
  references: [bundleFile('BRAND_DNA_BOARD').path, bundleFile('FULL_LOGO_LOCKUP').path, bundleFile('SIMPLE_NAV_MARK').path, bundleFile('ICON_ASSET_SHEET').path, `Photography direction: ${AIO_BRAND_AUTHORITY.photography.join(' · ')} (cinematic truck-on-highway perimeters per the IFTA authorities)`],
  architectural_language: 'The business office behind the truck: a command office over road infrastructure — rooms, desks, filed packets, ledgers, gauges; never a generic SaaS dashboard.',
  avoid_list: [...aio.AIO_DNA.visual_language.forbidden, 'stock smiles', 'alarm red as decoration', 'implying AIO is a government system', 'full lockup in tight navigation', 'generic emoji / other icon families / random colors', 'third-party fuel-brand logos', 'legacy AIO shell visuals'],
  history: ['AIO structural completion F01–F18 (canonical product graph)', 'Workspace Experience Brain AIO proof (28 material features; IFTA deepest proof)', 'Known failure: IFTA experience coded onto legacy page geometry (OLD PAGE + NEW CONTENT)', `AIO IFTA authority bundle ingested 2026-10-06 (${AIO_IFTA_BUNDLE_DIR})`],
  approved_decisions: [
    'Brand lines: WHERE BUSINESS MEETS THE ROAD. / THE BUSINESS OFFICE BEHIND THE TRUCK. / FROM STARTUP TO EVERY MILE AFTER.',
    'Voice: CLEAR · CAPABLE · CONNECTED · HUMAN',
    'Register: EXECUTIVE INDUSTRIAL × MODERN INFRASTRUCTURE; palette BLACK GOLD SILVER OBSIDIAN CHARCOAL STONE CHAMPAGNE',
    'IFTA metaphor: QUARTERLY FILING ROOM (experience contract)',
    'Secondary line: ONE OFFICE. THE WHOLE ROAD AHEAD.',
    'Logo: SIMPLE MARK ONLY in tight / top navigation; FULL LOCKUP only in lower brand bands (LOCKED)',
    'Typography: UPPERCASE PRIMARY',
    'Actor themes: PUBLIC DARK_PRIMARY · CLIENT LIGHT_PRIMARY · FOUNDER / STAFF LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS',
    'IFTA client parent authority: LIGHT ANALYTICS COMMAND',
    'Legacy AIO visuals have ZERO design authority',
  ],
  open_brand_questions: [
    'D-BRAND-TOKENS — brand DNA board vs IFTA asset sheet values for gold (#D4A853 vs #F4B223), charcoal (#1A1A1A vs #1F2937), darkest ink (#050505 vs #0B0B0B), light background (#F6F6F4 vs #FFFFFF).',
    'D-TYPOGRAPHY — display face MONUMENT EXTENDED (+ BEBAS NEUE labels; commercial licence) vs INTER TIGHT.',
    'Production brand assets not in the package: light-theme / transparent simple mark, transparent full lockups, approved hero photographs (reference images are not runtime assets).',
  ],
};

/* ─────────────────────────────── 03 legacy surfaces ─────────────────────────────── */

const legacy = (s: Omit<LegacySurface, 'project_id' | 'visual_class' | 'founder_decision'>): LegacySurface => ({
  project_id: 'AIO',
  visual_class: 'FUNCTIONAL_REFERENCE_ONLY',
  founder_decision: null,
  ...s,
});

/** Every current AIO surface IFTA touches. None is founder-approved → all FUNCTIONAL_REFERENCE_ONLY. */
export const AIO_IFTA_LEGACY_SURFACES: LegacySurface[] = [
  legacy({ surface_id: 'AIO.LEGACY.PUBLIC.SERVICE_DETAIL', actor: 'PUBLIC', route: 'services/:serviceSlug (ServiceCatalogDetailPage — ifta-filing / ifta-reg)', source: `${SRC} src/pages/ServiceCatalogDetailPage.tsx · src/routes/AioCoreRoutes.tsx:228`, functional_value: ['catalog copy + status (ifta-reg LIMITED_PILOT, ifta-filing PREPARING)', 'quote_required pricing relationship', 'documentsRequired list', 'request CTA routing'], note: 'Generic catalog detail template shared by every service — its geometry is the OLD PAGE.' }),
  legacy({ surface_id: 'AIO.LEGACY.PUBLIC.SERVICES_HUB', actor: 'PUBLIC', route: 'services', source: `${SRC} src/routes/AioCoreRoutes.tsx:211`, functional_value: ['discovery path into IFTA', 'service grouping (Permits, Taxes & Compliance)'] }),
  legacy({ surface_id: 'AIO.LEGACY.PUBLIC.ROAD_READY', actor: 'PUBLIC', route: 'road-ready', source: `${SRC} src/routes/AioCoreRoutes.tsx:239`, functional_value: ['IFTA recommendation for interstate carriers'] }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.PORTAL_SHELL', actor: 'CLIENT', route: 'portal (AIOPortalLayout)', source: `${SRC} src/layouts/AIOPortalLayout.tsx`, functional_value: ['auth + permissions', 'portal navigation targets', 'attention / next-action data'], note: 'Portal shell chrome is not an IFTA authority.' }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.SERVICES_CENTER', actor: 'CLIENT', route: 'portal/services (ServicesCenterPage)', source: `${SRC} src/routes/AioCoreRoutes.tsx:275`, functional_value: ['active services list', 'service status data', 'entry into the IFTA quarter'] }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.REQUESTS_CENTER', actor: 'CLIENT', route: 'portal/requests (ServiceRequestsCenterPage)', source: `${SRC} src/routes/AioCoreRoutes.tsx:274`, functional_value: ['service request engine states', 'quote acceptance'] }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.VAULT', actor: 'CLIENT', route: 'portal/vault (VaultPage)', source: `${SRC} src/pages/portal/VaultPage.tsx · vault/vaultTaxonomy.ts tax_fuel`, functional_value: ['tax_fuel taxonomy', 'receipt import source', 'filed packet destination'] }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.ROAD_READY', actor: 'CLIENT', route: 'portal/road-ready (RoadReadyPage)', source: `${SRC} src/pages/portal/RoadReadyPage.tsx`, functional_value: ['IFTA requirement item state'] }),
  legacy({ surface_id: 'AIO.LEGACY.CLIENT.IFTA_READINESS_ENGINE', actor: 'SYSTEM', route: '(engine — no page)', source: `${SRC} src/fleet/ifta/iftaReadiness.ts`, functional_value: ['MileageSourceType', 'IftaReadinessStatus', 'assessIftaReadiness verified-source rule'] }),
  legacy({ surface_id: 'AIO.LEGACY.STAFF.OFFICE_COMMAND_CENTER', actor: 'FOUNDER_STAFF', route: 'office/* (OfficeRouteGuard → OfficeRoutesLazy)', source: `${SRC} src/routes/AioCoreRoutes.tsx:388 · src/components/OfficeCommandCenterComponents.tsx`, functional_value: ['OfficeWorkItem queue data', 'division routing (permitting)', 'staff permissions'], note: 'Command-center panels are generic queue chrome — not a fuel-tax case-file authority.' }),
  legacy({ surface_id: 'AIO.LEGACY.STAFF.OFFICE_DOCUMENTS', actor: 'FOUNDER_STAFF', route: 'office/documents (Office Document Center)', source: `${SRC} OFFICE_WORK_MODEL.md · vault taxonomy`, functional_value: ['document review actions', 'audit trail'] }),
  legacy({ surface_id: 'AIO.LEGACY.SHARED.NAV', actor: 'ALL', route: 'AIONav', source: `${SRC} src/components/AIONav.tsx`, functional_value: ['route map', 'role-aware links'] }),
];

/* ─────────────────────────────── per-actor input packages ─────────────────────────────── */

export type AuthorityInputActor = 'PUBLIC' | 'CLIENT' | 'FOUNDER_STAFF';

const VIEWPORTS_BY_ACTOR: Record<AuthorityInputActor, { primary: string; targets: string[]; note: string }> = {
  PUBLIC: { primary: 'MOBILE', targets: ['MOBILE', 'DESKTOP'], note: 'Discovery happens on phones; desktop is the considered-purchase read. Separate authorities if the composition cannot scale.' },
  CLIENT: { primary: 'MOBILE', targets: ['MOBILE', 'TABLET', 'DESKTOP'], note: 'Mobile = capture-first task flow at the pump; desktop = packet workbench. Never shrink the desktop bench into mobile.' },
  FOUNDER_STAFF: { primary: 'DESKTOP', targets: ['DESKTOP', 'TABLET', 'MOBILE'], note: 'Staff work the queue on desktop; tablet for review away from the desk. Mobile is in scope: the authority bundle includes a staff mobile derivation (ACTOR_MODES_MOBILE) — it supersedes the earlier “mobile out of scope” note.' },
};

/** Composition questions each actor's territories must answer differently (page logic, not paint). */
const TERRITORY_PROMPTS: Record<AuthorityInputActor, string[]> = {
  PUBLIC: [
    'What does the page lead with: the promise, the quarter object, or the six-step process?',
    'How does the public page preview the real workspace (workspace continuity) without becoming a fake dashboard?',
    'Where does cinematic trucking media sit relative to the explanation (backdrop · inset · evidence)?',
    'How is REQUEST FILING positioned against the IFTA-account prerequisite (registration blocker)?',
  ],
  CLIENT: [
    'What is the spatial model of THE QUARTER: a room, a packet on a bench, a timeline, or a checklist ledger?',
    'Where do receipts / mileage / vehicles live as compartments of one packet (never three equal cards)?',
    'How does the single next action dominate in COLLECTING vs NEEDS_CLIENT vs AWAITING_APPROVAL?',
    'How does mobile become capture-first (camera at the pump) while desktop becomes the workbench?',
    'How does FILED visibly collapse into a sealed quarter moving to the Vault?',
  ],
  FOUNDER_STAFF: [
    'Is the primary object the queue (many client-quarters) or the case file (one client-quarter)? How do they relate spatially?',
    'How does due-date × readiness drive the queue axis?',
    'Where do flags, MPG outliers and jurisdiction discrepancies sit relative to the reconciliation table?',
    'How is the staff view a MIRROR of the client quarter (case file) and not a copy of the client packet builder?',
    'Where do overrides + audit trail live without crowding the work?',
  ],
};

const statesFor = (c: ExperienceContract, actor: AuthorityInputActor): string[] =>
  c.states.filter((s) => (actor === 'PUBLIC' ? s.id === 'NOT_ENROLLED' : s.meaning[actor] !== undefined)).map((s) => s.id);

const relFor = (c: ExperienceContract, actor: AuthorityInputActor) =>
  c.visual_relationships
    .filter((r) => statesFor(c, actor).includes(r.state))
    .map((r: StateVisualRelationship) => ({ state: r.state, composition_emphasis: r.composition_emphasis, emphasis_role: r.emphasis_role, density: r.panel_density, primary_cta: r.primary_cta[actor] ?? null, artifact_visibility: r.artifact_visibility, quiet: r.quiet }));

const perspectiveFor = (c: ExperienceContract, actor: AuthorityInputActor) => {
  const p = actor === 'PUBLIC' ? c.perspectives.public : actor === 'CLIENT' ? c.perspectives.client : c.perspectives.founder_staff;
  return isNotApplicable(p) ? null : p;
};

const viewportBehavior = (c: ExperienceContract): Record<string, ViewportBehavior> => ({ MOBILE: c.mobile_behavior, TABLET: c.tablet_behavior, DESKTOP: c.desktop_behavior });

/**
 * Gate input after the authority bundle: CLIENT runs its three territories → LOVE_IT T03 (LIGHT) → locked parent;
 * FOUNDER_STAFF and PUBLIC derive from the locked client parent. Legacy is read for function only. The page / tab /
 * state tree is PRODUCED and awaits founder confirmation → AUTHORITY_APPROVED + PAGE_TREE_CONFIRMATION_REQUIRED.
 */
export function aioIftaGateInput(actor: AuthorityInputActor): AuthorityGateInput {
  const shared: AuthorityGateInput = {
    project_id: 'AIO',
    family_id: aio.AIO_IFTA_CONTRACT.family_id,
    feature_id: aio.AIO_IFTA_CONTRACT.feature_id,
    actor,
    material: true,
    family_locked: true,
    experience_contract: aio.AIO_IFTA_CONTRACT,
    brand_context: AIO_BRAND_CONTEXT,
    legacy_surfaces: AIO_IFTA_LEGACY_SURFACES,
    legacy_uses: AIO_IFTA_LEGACY_USES,
    founder_decision: AIO_IFTA_FOUNDER_DECISIONS[actor],
    authority: AIO_IFTA_AUTHORITIES[actor],
    page_tree: aioIftaPageTreeConfirmation(AIO_IFTA_OPEN_DECISION_IDS),
  };
  return actor === 'CLIENT'
    ? { ...shared, territories: AIO_IFTA_CLIENT_TERRITORIES, references: AIO_IFTA_CLIENT_REFERENCES }
    : { ...shared, derivation: AIO_IFTA_DERIVATIONS[actor] };
}

export function aioIftaGateStatus(actor: AuthorityInputActor): AuthorityGateResult {
  return evaluateAuthorityGate(aioIftaGateInput(actor));
}

export function buildAioIftaActorAuthorityInput(actor: AuthorityInputActor) {
  const c = aio.AIO_IFTA_CONTRACT;
  const gate = aioIftaGateStatus(actor);
  const actorKey = actor as ExperienceActor;
  const surfaces = AIO_IFTA_LEGACY_SURFACES.filter((s) => s.actor === actor || s.actor === 'ALL' || (actor === 'CLIENT' && s.actor === 'SYSTEM'));
  return {
    package_id: `AIO.IFTA.${actor}.AUTHORITY_INPUT`,
    sprint: VISUAL_AUTHORITY_SPRINT,
    doctrine: VISUAL_AUTHORITY_DOCTRINE,
    project_id: 'AIO',
    family_id: c.family_id,
    feature_id: c.feature_id,
    actor,
    purpose: 'Input for the founder + ChatGPT test-run of 3 composition territories. Not an implementation brief. Not a reference image.',
    gate_status: { state: gate.state, guard: gate.guard, durable_rule: gate.durable_rule, conditions: gate.conditions, next_step: gate.next_step },
    brand_dna: { brand_context_id: AIO_BRAND_CONTEXT.brand_context_id, positioning: AIO_BRAND_CONTEXT.positioning, voice: AIO_BRAND_CONTEXT.voice, color: AIO_BRAND_CONTEXT.color, emphasis_map: aio.AIO_DNA.visual_language.emphasis_map, materials: AIO_BRAND_CONTEXT.materials, typography: AIO_BRAND_CONTEXT.typography, mood: AIO_BRAND_CONTEXT.mood, imagery: aio.AIO_DNA.visual_language.imagery, architectural_language: AIO_BRAND_CONTEXT.architectural_language, avoid: AIO_BRAND_CONTEXT.avoid_list, open_brand_questions: AIO_BRAND_CONTEXT.open_brand_questions },
    experience_contract: {
      source: 'docs/studioos/experience-brain/AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json',
      visual_contract: 'docs/studioos/experience-brain/AIO_IFTA_FUEL_TAX_VISUAL_CONTRACT.json',
      e2e_contract: 'docs/studioos/experience-brain/AIO_IFTA_FUEL_TAX_E2E_CONTRACT.json',
      ingest: experienceIngest(c, actorKey),
      entry: actor === 'PUBLIC' ? c.public_entry : actor === 'CLIENT' ? c.client_entry : c.founder_staff_entry,
      perspective: perspectiveFor(c, actor),
      emotional_target: c.emotional_target[actorKey] ?? null,
      primary_visual_object: c.primary_visual_object,
      secondary_visual_objects: c.secondary_visual_objects,
      composition_rules: c.composition_rules,
      interaction_grammar: c.interaction_grammar.filter((v) => v.actor === actorKey),
      cta: actor === 'PUBLIC' ? c.public_cta : actor === 'CLIENT' ? c.client_cta : c.staff_cta,
      state_coverage: statesFor(c, actor),
      state_visual_relationships: relFor(c, actor),
      avoid_list: c.avoid_list,
    },
    viewport_targets: { ...VIEWPORTS_BY_ACTOR[actor], behavior: viewportBehavior(c) },
    legacy_visual_status: {
      default_class: 'FUNCTIONAL_REFERENCE_ONLY',
      rule: 'Read these for function / data / routing / permissions / content truth / state / interaction / capabilities only. Do NOT use old AIO page proportions, layout, geometry, panel system, nav visuals, spacing, typography, color, material, composition or responsive design.',
      surfaces: surfaces.map((s) => ({ surface_id: s.surface_id, route: s.route, source: s.source, visual_class: legacyClassOf(s), may_inform: [...LEGACY_FUNCTIONAL_DIMENSIONS], may_not_control: [...LEGACY_VISUAL_DIMENSIONS], functional_value: s.functional_value, note: s.note ?? null })),
    },
    territory_brief: {
      count: DEFAULT_TERRITORY_COUNT,
      must_differ_on: [...TERRITORY_STRUCTURAL_DIMENSIONS],
      never_distinct_by_alone: [...TERRITORY_COSMETIC_LEVERS],
      each_territory_defines: ['name', 'core_idea', 'metaphor', 'primary_object', 'page_logic', 'major_zones', 'actor_fit', 'state_fit', 'mobile_logic', 'desktop_logic', 'visual_language', 'risks', 'brand_fit', 'experience_fit'],
      composition_questions: TERRITORY_PROMPTS[actor],
      quality_test: 'If two territories could be produced by swapping the hero image, swapping colors or moving one card → TERRITORY_DISTINCTNESS_FAILURE.',
    },
    reference_authority_brief: {
      one_per_territory: true,
      must_show: [...REFERENCE_AUTHORITY_MUST_SHOW],
      allowed_formats: ['GENERATED_FULL_PAGE_REFERENCE', 'COMPOSED_BOARD', 'EXISTING_APPROVED_PAGE', 'HYBRID', 'WIREFRAME_PLUS_BRAND_RENDER', 'OTHER_APPROVED_PROOF'],
      not_acceptable: ['mood collage', 'decorative art', 'generic hero', 'old AIO page with new copy'],
      states_to_show: statesFor(c, actor).slice(0, 4),
      role: 'Page-logic / composition / direction contract — not a final screenshot. Authority ≠ runtime asset.',
    },
    founder_review: { verdicts: ['LOVE_IT', 'REVISE', 'REJECT', 'COMBINE', 'REQUEST_FOURTH_TERRITORY'], hybrid_allowed: 'e.g. A structure + C material', lock_requires: 'founder approval' },
    lock_template: {
      fields: ['AUTHORITY_ID', 'PROJECT_ID', 'FAMILY_ID', 'FEATURE_ID', 'ACTOR', 'VIEWPORT', 'STATE_COVERAGE', 'TERRITORY_SOURCE', 'FOUNDER_STATUS', 'CORE_LOGIC_LOCKS', 'FLEXIBLE_IMPLEMENTATION_AREAS', 'SUPERSEDES', 'LINEAGE'],
      authority_id: `AIO.IFTA.${actor}.PFA.v1`,
      core_logic_lock_kinds: [...CORE_LOGIC_LOCK_KINDS],
      flexible_implementation_areas: [...FLEXIBLE_IMPLEMENTATION_AREAS],
    },
    sequence: AUTHORITY_DEVELOPMENT_SEQUENCE.map((s) => `${s.step} ${s.id}`),
    constraints: { new_paid_generations: 0, credits_spent: 0, page_implementation: false },
  };
}

export function buildAioIftaAuthorityDevelopmentInput() {
  const c = aio.AIO_IFTA_CONTRACT;
  const brand = checkBrandContext(AIO_BRAND_CONTEXT);
  const actors: AuthorityInputActor[] = ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'];
  return {
    package_id: 'AIO.IFTA.AUTHORITY_DEVELOPMENT_INPUT',
    sprint: VISUAL_AUTHORITY_SPRINT,
    doctrine: VISUAL_AUTHORITY_DOCTRINE,
    project_id: 'AIO',
    feature_id: c.feature_id,
    feature_name: c.feature_name,
    known_failure: {
      id: 'OLD_PAGE_PLUS_NEW_CONTENT',
      description: 'Implementation consumed the IFTA experience contract directly and placed new content onto legacy AIO page geometry.',
      lesson: 'EXPERIENCE CONTRACT ≠ VISUAL AUTHORITY. A material page family needs an approved page-family authority before implementation.',
    },
    brand_check: brand,
    experience_check: { CLIENT: checkExperience(c, 'CLIENT').status, FOUNDER_STAFF: checkExperience(c, 'FOUNDER_STAFF').status, PUBLIC: checkExperience(c, 'PUBLIC').status },
    gate_status: Object.fromEntries(actors.map((a) => { const g = aioIftaGateStatus(a); return [a, { state: g.state, guard: g.guard, durable_rule: g.durable_rule, next_step: g.next_step }]; })),
    actor_packages: {
      PUBLIC: 'docs/studioos/visual-authority-development/AIO_IFTA_PUBLIC_AUTHORITY_INPUT.json',
      CLIENT: 'docs/studioos/visual-authority-development/AIO_IFTA_CLIENT_AUTHORITY_INPUT.json',
      FOUNDER_STAFF: 'docs/studioos/visual-authority-development/AIO_IFTA_FOUNDER_AUTHORITY_INPUT.json',
    },
    legacy_surfaces: AIO_IFTA_LEGACY_SURFACES.map((s) => ({ surface_id: s.surface_id, actor: s.actor, route: s.route, visual_class: legacyClassOf(s) })),
    cross_actor_rules: [
      'PUBLIC page prepares the client for the real workspace (same six-step quarter, same quarter object) — continuity, not a copy of the portal.',
      'FOUNDER / STAFF mirrors the client quarter as a CASE FILE across many clients — mirror, not copy.',
      'The three actor authorities share brand DNA and the QUARTERLY FILING ROOM metaphor. Founder decision (authority bundle): the CLIENT parent authority precedes actor / viewport derivation — FOUNDER_STAFF and PUBLIC derive from the locked client parent instead of running their own three territories.',
    ],
    founder_test_run: {
      who: 'Founder + ChatGPT',
      steps: ['Read the actor package', 'Author 3 territories per actor that pass the distinctness test', 'Produce one reference authority per territory (no paid generation from this sprint)', 'Founder verdict per actor', 'Lock PAGE_FAMILY_AUTHORITY → AUTHORITY_APPROVED → IMPLEMENTATION_READY'],
      status: 'RAN — the founder + ChatGPT test produced the AIO IFTA AUTHORITY BUNDLE (client parent via 3 territories; staff + public derived). Ingested in docs/aio/ifta/authority-bundle/.',
    },
    constraints: { new_paid_generations: 0, credits_spent: 0, page_implementation: false },
  };
}
