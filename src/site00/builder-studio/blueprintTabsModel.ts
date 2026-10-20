/**
 * Blueprint tabs — the client-facing reading of a configuration for OVERVIEW · STRUCTURE · PAGES · FEATURES · TIMELINE.
 *
 * Every value here is derived from the contract: the selection, the chosen experiences, the effective capabilities,
 * and the canonical estimator (its own phase list and review assumptions). Nothing is restated or invented. This
 * file only groups and words what the contract already decided, in upper case, for the five approved tab layouts.
 */
import {
  CAPABILITY_BY_ID,
  EXPERIENCE_BY_ID,
  EXPERIENCE_DEPTHS,
  STRUCTURE_BY_ID,
  chosenExperiences,
  deriveBuildLevel,
  effectiveCapabilities,
  toEstimateConfig,
} from '../builder-experience';
import type { BuilderSelection, CapabilityId } from '../builder-experience';
import { estimateProject } from '../../studioos/estimation';
import type { BlueprintAnatomy } from './buildObject/anatomy';
import { resolvePageValue } from './pageValueIntelligence';

const up = (value: string) => value.toUpperCase();

/* ─────────────────────────────── pages ─────────────────────────────── */

export type PageGroupKey = 'FRONT_DOOR' | 'STORY_OFFER' | 'CLIENT_SPACE' | 'TEAM_ACCESS';

/** The contract's experience groups, read as the four client-facing purposes of the approved PAGES layout. */
const PAGE_GROUP_OF: Record<string, PageGroupKey> = {
  'FRONT DOOR': 'FRONT_DOOR',
  'WHAT YOU OFFER': 'STORY_OFFER',
  'DOING THINGS': 'STORY_OFFER',
  'SIGNED IN': 'CLIENT_SPACE',
  'BEHIND THE SCENES': 'TEAM_ACCESS',
};

export const PAGE_GROUPS: readonly { key: PageGroupKey; title: string; plain: string; private: boolean }[] = [
  { key: 'FRONT_DOOR', title: 'FRONT DOOR', plain: 'THE PAGES THAT INTRODUCE YOUR BUSINESS AND GUIDE PEOPLE IN.', private: false },
  { key: 'STORY_OFFER', title: 'STORY & OFFER', plain: 'WHERE YOUR MESSAGE, YOUR OFFER AND THE ACTIONS PEOPLE TAKE ARE EXPLORED.', private: false },
  { key: 'CLIENT_SPACE', title: 'CLIENT SPACE', plain: 'PROTECTED PAGES PEOPLE USE AFTER THEY SIGN IN.', private: true },
  { key: 'TEAM_ACCESS', title: 'TEAM & ACCESS', plain: 'HOW YOUR PLACE IS RUN, AND WHO CAN SEE AND DO WHAT.', private: true },
];

export type PageItem = {
  id: string;
  label: string;
  plain: string;
  depth: string;
  depthPlain: string;
  whyItMatters: string;
  featuresNote: string | null;
  limitation: string | null;
};
export type PageGroupView = (typeof PAGE_GROUPS)[number] & { pages: PageItem[] };

export type PagesView = { total: number; groups: PageGroupView[]; coreGroups: number; privatePages: number };

export function pagesView(selection: BuilderSelection): PagesView {
  const { level } = deriveBuildLevel(selection);
  const byGroup = new Map<PageGroupKey, PageItem[]>();
  for (const choice of chosenExperiences(selection, level)) {
    const exp = EXPERIENCE_BY_ID[choice.id];
    const key = PAGE_GROUP_OF[exp.group] ?? 'STORY_OFFER';
    const depth = EXPERIENCE_DEPTHS.find((d) => d.id === choice.depth);
    const value = resolvePageValue(selection, choice);
    const list = byGroup.get(key) ?? [];
    list.push({
      id: choice.id,
      label: up(exp.label),
      plain: value.purpose,
      depth: up(depth?.label ?? ''),
      depthPlain: value.depthSummary,
      whyItMatters: value.whyItMatters,
      featuresNote: value.featuresNote,
      limitation: value.limitation,
    });
    byGroup.set(key, list);
  }
  const groups = PAGE_GROUPS.filter((g) => byGroup.has(g.key)).map((g) => ({ ...g, pages: byGroup.get(g.key)! }));
  const total = groups.reduce((n, g) => n + g.pages.length, 0);
  const privatePages = groups.filter((g) => g.private).reduce((n, g) => n + g.pages.length, 0);
  return { total, groups, coreGroups: groups.length, privatePages };
}

/* ─────────────────────────────── features ─────────────────────────────── */

export type FeatureIconKey =
  | 'DOCUMENT'
  | 'BAG'
  | 'CARD'
  | 'PERSON'
  | 'PEOPLE'
  | 'FOLDER'
  | 'CHART'
  | 'CALENDAR'
  | 'BADGE'
  | 'SEARCH'
  | 'BELL'
  | 'MAIL'
  | 'GLOBE'
  | 'LINK'
  | 'BOLT'
  | 'UPLOAD'
  | 'DATABASE'
  | 'CUBE'
  | 'SPARK'
  | 'STORE';

const FEATURE_ICON: Record<CapabilityId, FeatureIconKey> = {
  SELL: 'BAG',
  BOOK: 'CALENDAR',
  PAYMENTS: 'CARD',
  MEMBERSHIP: 'BADGE',
  ACCOUNTS: 'PERSON',
  COMMUNITY: 'PEOPLE',
  TEAM_ROLES: 'PEOPLE',
  MARKETPLACE: 'STORE',
  DASHBOARD: 'CHART',
  DATA_PORTAL: 'FOLDER',
  UPLOAD_FILES: 'UPLOAD',
  DOCUMENTS: 'DOCUMENT',
  EDIT_CONTENT: 'DOCUMENT',
  SEARCH: 'SEARCH',
  LIVE_UPDATES: 'BOLT',
  BRING_EXISTING_DATA: 'DATABASE',
  NOTIFICATIONS: 'BELL',
  EMAIL: 'MAIL',
  MULTILINGUAL: 'GLOBE',
  MEASURE: 'CHART',
  CUSTOM_INTEGRATIONS: 'LINK',
  AI: 'SPARK',
  '3D': 'CUBE',
  WORLD: 'CUBE',
};

/** The client's benefit, in the approved reference's voice, for the capabilities the reference names. */
const FEATURE_BENEFIT: Partial<Record<CapabilityId, string>> = {
  EDIT_CONTENT: 'UPDATE YOUR CORE TEXT AND IMAGERY WITHOUT WAITING ON SITE 00 FOR EVERY CHANGE.',
  SELL: 'PRESENT PRODUCTS OR PAID OFFERS WITH A POLISHED BROWSING AND CHECKOUT FLOW.',
  PAYMENTS: 'ACCEPT PAYMENTS SECURELY AND SEND RECEIPTS THROUGH YOUR CONNECTED CHECKOUT.',
  ACCOUNTS: 'GIVE PEOPLE THEIR OWN SIGN-IN AND ACCESS TO THE RIGHT PARTS OF THE EXPERIENCE.',
  DATA_PORTAL: 'A PRIVATE, SIGNED-IN AREA BUILT AROUND YOUR RECORDS AND THE WORK PEOPLE DO ON THEM.',
  DASHBOARD: 'KEY INFORMATION, PROGRESS AND ACTIVITY IN ONE PLACE.',
  TEAM_ROLES: 'CONTROL ACCESS SO THE RIGHT PEOPLE CAN SEE AND MANAGE THE RIGHT THINGS.',
};

export type FlowKey = 'ATTRACT' | 'ACT' | 'DELIVER' | 'SYNC';

const FLOW_OF: Record<CapabilityId, FlowKey> = {
  EDIT_CONTENT: 'ATTRACT',
  SEARCH: 'ATTRACT',
  MULTILINGUAL: 'ATTRACT',
  WORLD: 'ATTRACT',
  '3D': 'ATTRACT',
  AI: 'ATTRACT',
  SELL: 'ACT',
  BOOK: 'ACT',
  PAYMENTS: 'ACT',
  MARKETPLACE: 'ACT',
  UPLOAD_FILES: 'ACT',
  ACCOUNTS: 'DELIVER',
  MEMBERSHIP: 'DELIVER',
  COMMUNITY: 'DELIVER',
  DATA_PORTAL: 'DELIVER',
  DOCUMENTS: 'DELIVER',
  DASHBOARD: 'SYNC',
  TEAM_ROLES: 'SYNC',
  LIVE_UPDATES: 'SYNC',
  NOTIFICATIONS: 'SYNC',
  EMAIL: 'SYNC',
  MEASURE: 'SYNC',
  CUSTOM_INTEGRATIONS: 'SYNC',
  BRING_EXISTING_DATA: 'SYNC',
};

export const FLOW_STEPS: readonly { key: FlowKey; title: string; plain: string }[] = [
  { key: 'ATTRACT', title: 'ATTRACT & INFORM', plain: 'PUBLIC PAGES AND CONTENT BUILD INTEREST.' },
  { key: 'ACT', title: 'TAKE ACTION', plain: 'PEOPLE EXPLORE, BOOK, SIGN UP OR BUY.' },
  { key: 'DELIVER', title: 'DELIVER VALUE', plain: 'ACCOUNTS AND PRIVATE AREAS KEEP THINGS MOVING.' },
  { key: 'SYNC', title: 'STAY IN SYNC', plain: 'YOUR TEAM AND YOUR TOOLS STAY ON TRACK.' },
];

export type FeatureItem = {
  id: CapabilityId;
  verb: string;
  plain: string;
  icon: FeatureIconKey;
  /** What brought this capability in, when the client did not pick it directly. */
  includedWith: string | null;
};

export type FeaturesView = {
  count: number;
  items: FeatureItem[];
  hasPrivate: boolean;
  payments: boolean;
  flow: { key: FlowKey; title: string; plain: string; features: string[] }[];
};

function includedWith(id: CapabilityId, selection: BuilderSelection): string | null {
  if (selection.capabilities.includes(id)) return null;
  const parent = selection.capabilities.find((c) => CAPABILITY_BY_ID[c].comesWith.includes(id));
  if (parent) return `INCLUDED WITH ${CAPABILITY_BY_ID[parent].verb}`;
  const structure = selection.structure ? STRUCTURE_BY_ID[selection.structure] : null;
  return structure ? `INCLUDED WITH YOUR ${up(structure.label)} STRUCTURE` : 'INCLUDED WITH YOUR CHOICES';
}

export function featuresView(selection: BuilderSelection): FeaturesView {
  const ids = effectiveCapabilities(selection);
  const items = ids.map((id) => {
    const cap = CAPABILITY_BY_ID[id];
    return { id, verb: up(cap.verb), plain: FEATURE_BENEFIT[id] ?? up(cap.plain), icon: FEATURE_ICON[id], includedWith: includedWith(id, selection) };
  });
  const pages = pagesView(selection);
  const flow = FLOW_STEPS.map((step) => ({ ...step, features: items.filter((i) => FLOW_OF[i.id] === step.key).map((i) => i.verb) })).filter(
    // Public pages always attract, so the first step stands even without a feature of its own.
    (step) => step.key === 'ATTRACT' || step.features.length > 0,
  );
  return { count: items.length, items, hasPrivate: pages.privatePages > 0, payments: ids.includes('PAYMENTS'), flow };
}

/* ─────────────────────────────── structure ─────────────────────────────── */

export type StructureGroupKey = 'FRONT_DOOR' | 'OFFER_ACTION' | 'CLIENT_SPACE' | 'OPERATIONS';

const STRUCTURE_FLOW_OF: Record<FlowKey, StructureGroupKey> = {
  ATTRACT: 'FRONT_DOOR',
  ACT: 'OFFER_ACTION',
  DELIVER: 'CLIENT_SPACE',
  SYNC: 'OPERATIONS',
};

const STRUCTURE_PAGES_OF: Record<PageGroupKey, StructureGroupKey> = {
  FRONT_DOOR: 'FRONT_DOOR',
  STORY_OFFER: 'OFFER_ACTION',
  CLIENT_SPACE: 'CLIENT_SPACE',
  TEAM_ACCESS: 'OPERATIONS',
};

export const STRUCTURE_GROUPS: readonly { key: StructureGroupKey; title: string; plain: string; absent: string }[] = [
  {
    key: 'FRONT_DOOR',
    title: 'FRONT DOOR',
    plain: 'THE FIRST IMPRESSION OF YOUR BUSINESS: HOME, POSITIONING AND THE KEY WAYS IN.',
    absent: 'EVERY BUILD HAS A FRONT DOOR. SITE 00 SHAPES IT AT BLUEPRINT REVIEW.',
  },
  {
    key: 'OFFER_ACTION',
    title: 'OFFER & ACTION',
    plain: 'WHERE PEOPLE EXPLORE WHAT YOU PROVIDE AND ENQUIRE, BOOK OR BUY.',
    absent: 'NOT PART OF THIS BUILD. ADD SHOP, BOOKING OR BLOG IN ROOM 03 TO GIVE PEOPLE MORE TO DO.',
  },
  {
    key: 'CLIENT_SPACE',
    title: 'CLIENT SPACE',
    plain: 'PRIVATE AREAS FOR RECORDS, ACCOUNT ACCESS, UPDATES AND ACTIVE WORK.',
    absent: 'NOT PART OF THIS BUILD. ADD A MEMBER AREA OR PORTAL IN ROOM 03 FOR SIGNED-IN SPACES.',
  },
  {
    key: 'OPERATIONS',
    title: 'OPERATIONS LAYER',
    plain: 'THE TOOLS BEHIND THE SCENES THAT SUPPORT YOUR WORKFLOW, VISIBILITY AND TEAM.',
    absent: 'NO INTERNAL TOOLS IN THIS BUILD. YOUR PLACE IS RUN WITH SITE 00 BEHIND IT.',
  },
];

export type StructureGroupView = (typeof STRUCTURE_GROUPS)[number] & { present: boolean; includes: string[] };

export type StructureView = {
  groups: StructureGroupView[];
  access: string;
  flow: { n: string; title: string; plain: string }[];
};

export function structureView(selection: BuilderSelection): StructureView {
  const pages = pagesView(selection);
  const features = featuresView(selection);
  const includes = new Map<StructureGroupKey, string[]>();
  const push = (key: StructureGroupKey, label: string) => {
    const list = includes.get(key) ?? [];
    if (!list.includes(label)) list.push(label);
    includes.set(key, list);
  };
  for (const group of pages.groups) for (const page of group.pages) push(STRUCTURE_PAGES_OF[group.key], page.label);
  for (const item of features.items) push(STRUCTURE_FLOW_OF[FLOW_OF[item.id]], item.verb);
  const groups = STRUCTURE_GROUPS.map((g) => {
    const list = includes.get(g.key) ?? [];
    return { ...g, present: list.length > 0, includes: list };
  });
  const has = (key: StructureGroupKey) => groups.find((g) => g.key === key)!.present;
  const flow = [
    { title: 'DISCOVER', plain: 'VISITORS UNDERSTAND WHO YOU ARE AND WHAT YOU DO.' },
    has('OFFER_ACTION') ? { title: 'DECIDE', plain: 'THEY EXPLORE YOUR OFFER AND TAKE THE NEXT STEP.' } : null,
    has('CLIENT_SPACE') ? { title: 'CONTINUE', plain: 'CLIENTS AND YOUR TEAM USE PRIVATE AREAS TO MANAGE WORK.' } : null,
  ]
    .filter((step): step is { title: string; plain: string } => step !== null)
    .map((step, i) => ({ n: String(i + 1), ...step }));
  return { groups, access: pages.privatePages > 0 ? 'PUBLIC + PRIVATE AREAS' : 'PUBLIC', flow };
}

/** The main experience: the structure the contract chose for this build. */
export function mainExperience(selection: BuilderSelection): { label: string; plain: string } | null {
  if (!selection.structure) return null;
  const primary = STRUCTURE_BY_ID[selection.structure];
  const second = selection.structureSecondary ? STRUCTURE_BY_ID[selection.structureSecondary] : null;
  return {
    label: up(second ? `${primary.label} + ${second.label}` : primary.label),
    plain: up(primary.behavior),
  };
}

/* ─────────────────────────────── timeline ─────────────────────────────── */

type EnginePhase = { id: string; label: string; parallelizable: boolean; clientDependency: boolean; studioDependency: boolean };

export type DeliveryPhase = {
  n: string;
  title: string;
  plain: string;
  siteDoes: string;
  youDo: string;
  needsYou: boolean;
  runsAlongside: boolean;
};

/**
 * The estimator's own phases (INCEPTION … LAUNCH), read as the five client-facing phases of the approved TIMELINE
 * layout. Whether a phase needs the client, and whether it runs alongside other work, comes from the engine.
 */
const DELIVERY_PHASES: readonly { n: string; title: string; engine: string[]; plain: string; siteDoes: string; youDo: string }[] = [
  {
    n: '01',
    title: 'BLUEPRINT & ALIGNMENT',
    engine: ['INCEPTION', 'BLUEPRINT'],
    plain: 'WE CONFIRM SCOPE, PRIORITIES AND STRUCTURAL DIRECTION.',
    siteDoes: 'SITE 00 REVIEWS YOUR BLUEPRINT WITH YOU, REFINES THE SCOPE AND ISSUES A QUOTE.',
    youDo: 'YOU CONFIRM WHAT THE BUILD MUST DO AND APPROVE THE REVIEWED BLUEPRINT.',
  },
  {
    n: '02',
    title: 'IDENTITY & DIRECTION',
    engine: ['AUTHORITY DEVELOPMENT'],
    plain: 'CORE VISUAL AND VERBAL CHOICES ARE SETTLED.',
    siteDoes: 'SITE 00 DEVELOPS CREATIVE DIRECTIONS FROM YOUR CHOICES AND REFINES ONE WITH YOU.',
    youDo: 'YOU CHOOSE A DIRECTION AND SIGN IT OFF BEFORE PRODUCTION RELIES ON IT.',
  },
  {
    n: '03',
    title: 'BUILD & INTEGRATION',
    engine: ['PRODUCTION', 'INTEGRATION'],
    plain: 'PAGES, FEATURES AND CONNECTED SYSTEMS ARE DEVELOPED.',
    siteDoes: 'SITE 00 PRODUCES YOUR PAGES AND FEATURES AND CONNECTS THE SYSTEMS THEY USE.',
    youDo: 'YOU SUPPLY COPY, IMAGES AND ACCESS TO ANY TOOLS YOUR BUILD CONNECTS TO.',
  },
  {
    n: '04',
    title: 'REVIEW & REFINEMENT',
    engine: ['RESPONSIVE QA', 'CLIENT REVIEW', 'FINAL QA'],
    plain: 'WE REVIEW, ADJUST AND TIGHTEN THE EXPERIENCE.',
    siteDoes: 'SITE 00 TESTS ON PHONE AND DESKTOP, FIXES WHAT IT FINDS AND RUNS FINAL CHECKS.',
    youDo: 'YOU REVIEW THE BUILT EXPERIENCE AND SEND YOUR CHANGES IN EACH REVIEW ROUND.',
  },
  {
    n: '05',
    title: 'LAUNCH PREPARATION',
    engine: ['LAUNCH'],
    plain: 'FINAL CHECKS, OUTSIDE-SYSTEM READINESS AND HANDOFF.',
    siteDoes: 'SITE 00 PREPARES THE LAUNCH AND HANDS OVER WHAT YOU NEED TO RUN YOUR PLACE.',
    youDo: 'YOU GIVE THE FINAL APPROVAL TO GO LIVE.',
  },
];

export type TimelineView = {
  phases: DeliveryPhase[];
  reviewRounds: number;
  reviewDays: number;
  factors: { key: string; title: string; plain: string }[];
};

export function timelineView(selection: BuilderSelection): TimelineView | null {
  let config: ReturnType<typeof toEstimateConfig>;
  try {
    config = toEstimateConfig(selection, 'SELF_SERVE');
  } catch {
    return null;
  }
  const outcome = estimateProject(config);
  if (!outcome.ok) return null;
  const engine = outcome.result.phases as EnginePhase[];
  const phases = DELIVERY_PHASES.map((p) => {
    const parts = engine.filter((e) => p.engine.includes(e.label));
    return {
      n: p.n,
      title: p.title,
      plain: p.plain,
      siteDoes: p.siteDoes,
      youDo: p.youDo,
      needsYou: parts.some((e) => e.clientDependency),
      runsAlongside: parts.length > 0 && parts.every((e) => e.parallelizable),
    };
  });
  const connects = outcome.result.dependencies.some((d) => d.from === 'INTEGRATION CONTRACT');
  const factors = [
    {
      key: 'APPROVALS',
      title: 'APPROVALS',
      plain: `${config.reviewRounds} REVIEW ${config.reviewRounds === 1 ? 'ROUND' : 'ROUNDS'}, EACH PLANNED AT ${config.clientReviewSlaDays} BUSINESS DAYS. A LATER REPLY MOVES THE WINDOW.`,
    },
    {
      key: 'CONTENT',
      title: 'CONTENT DELIVERY',
      plain:
        selection.content === 'READY'
          ? 'YOUR COPY AND IMAGES ARE READY WHEN PRODUCTION STARTS.'
          : 'THE WINDOW COUNTS FROM WHEN YOUR COPY AND IMAGES ARRIVE.',
    },
    connects
      ? { key: 'TOOLS', title: 'CONNECTED TOOLS', plain: 'LAUNCH WAITS ON THE OUTSIDE SYSTEMS YOU CONNECT.' }
      : {
          key: 'BRAND',
          title: 'YOUR BRAND',
          plain:
            selection.brand === 'READY'
              ? 'YOUR BRAND IS FINAL, SO THE VISUAL SYSTEM CAN BUILD ON IT.'
              : selection.brand === 'IN_PROGRESS'
                ? 'YOUR BRAND IS STILL SETTLING. THE VISUAL SYSTEM FOLLOWS IT.'
                : 'YOUR BRAND IS BUILT FIRST THROUGH IDNTY, OUTSIDE THIS RANGE.',
        },
    { key: 'SCOPE', title: 'SCOPE CHANGES', plain: 'CHANGES AFTER BLUEPRINT REVIEW PRODUCE A NEW ESTIMATE.' },
  ];
  return { phases, reviewRounds: config.reviewRounds, reviewDays: config.clientReviewSlaDays, factors };
}

/* ─────────────────────────────── where each part lives in the Build Object ─────────────────────────────── */

const STRUCTURE_PAGE_GROUPS: Record<StructureGroupKey, string[]> = {
  FRONT_DOOR: ['FRONT DOOR'],
  OFFER_ACTION: ['WHAT YOU OFFER', 'DOING THINGS'],
  CLIENT_SPACE: ['SIGNED IN'],
  OPERATIONS: ['BEHIND THE SCENES'],
};

function pageHomes(anatomy: BlueprintAnatomy, groups: readonly string[]): string[] {
  const ids = new Set<string>();
  for (const g of anatomy.pages?.groups ?? []) {
    if (!groups.includes(g.group)) continue;
    for (const page of g.pages) page.home?.elements.forEach((id) => ids.add(id));
  }
  return [...ids];
}

/** The model elements that carry one part of the structure: its pages' volumes and its features' modules. */
export function structurePartElements(anatomy: BlueprintAnatomy, key: StructureGroupKey): string[] {
  const ids = new Set(pageHomes(anatomy, STRUCTURE_PAGE_GROUPS[key]));
  for (const feature of anatomy.features) {
    if (feature.id && STRUCTURE_FLOW_OF[FLOW_OF[feature.id]] === key) feature.home?.elements.forEach((id) => ids.add(id));
  }
  return [...ids];
}

/** The model elements that hold one page group's pages. */
export function pageGroupElements(anatomy: BlueprintAnatomy, key: PageGroupKey): string[] {
  return pageHomes(
    anatomy,
    Object.entries(PAGE_GROUP_OF)
      .filter(([, group]) => group === key)
      .map(([registryGroup]) => registryGroup),
  );
}
