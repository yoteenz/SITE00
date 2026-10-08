/**
 * SITE 00 Builder — Hybrid Spatial Studio presentation model.
 *
 * The four rooms (PLACE · FEEL · WORK · PACE) and the Blueprint reveal are a presentation over the canonical
 * Builder contract in `src/site00/builder-experience`. The studio keeps a small draft of what the client chose in
 * the rooms and derives the canonical `BuilderSelection` from it with `toSelection`. Every scope, level, window
 * and range comes from that contract and the canonical estimator. Nothing here estimates.
 */
import type { StructuralArchetypeId, VisualSystemId, WorldArchetypeId } from '../../studioos/estimation/types';
import {
  CAPABILITY_BY_ID,
  DEFAULT_WORLD_SELECTION,
  EXPRESSION_BY_ID,
  builderNotices,
  deriveBuildLevel,
  effectiveCapabilities,
  emptySelection,
  recommendedExperiences,
} from '../builder-experience';
import type {
  BuilderNotice,
  BuilderSelection,
  CapabilityId,
  ExperienceChoice,
  ExperienceDepth,
  ExperienceId,
} from '../builder-experience';

export const STUDIO_DRAFT_VERSION = 1 as const;
export const STUDIO_STORAGE_KEY = 'site00.builderStudio.draft.v1';
/** Storage prefix for the BUILDER intake sync (`useIntakeSync`). START OVER clears it so a new Blueprint is a new intake. */
export const STUDIO_INTAKE_STORAGE_PREFIX = 'site00-builder-studio';
/** Key used with the estimator's own `saveEstimateLocally` when the client saves the Blueprint. */
export const STUDIO_ESTIMATE_RECORD_KEY = 'builder-studio-blueprint';

/* ─────────────────────────────── rooms ─────────────────────────────── */

export type StudioRoomId = 'place' | 'feel' | 'work' | 'pace' | 'blueprint';

export type StudioRoom = {
  id: StudioRoomId;
  index: string;
  label: string;
  /** Headline lines exactly as the approved reference breaks them. A red full stop follows the last line. */
  headline: string[];
  lede: string;
  cta: string;
};

export const STUDIO_ROOMS: readonly StudioRoom[] = [
  {
    id: 'place',
    index: '01',
    label: 'PLACE',
    headline: ['WHAT ARE', 'WE CREATING?'],
    lede: 'CHOOSE THE KIND OF DIGITAL LOCATION YOU WANT TO BUILD. EACH OPTION OPENS A DIFFERENT POSSIBILITY.',
    cta: 'CONTINUE',
  },
  {
    id: 'feel',
    index: '02',
    label: 'FEEL',
    headline: ['HOW SHOULD', 'IT FEEL?'],
    lede: 'EXPLORE DIFFERENT VISUAL DIRECTIONS. THESE EXPRESSIONS SET THE TONE FOR YOUR DIGITAL LOCATION.',
    cta: 'CONTINUE',
  },
  {
    id: 'work',
    index: '03',
    label: 'WORK',
    headline: ['WHAT MUST', 'IT DO?'],
    lede: 'SELECT THE CAPABILITIES YOUR DIGITAL LOCATION NEEDS. EACH FEATURE ADDS A LAYER TO YOUR STRUCTURE.',
    cta: 'CONTINUE',
  },
  {
    id: 'pace',
    index: '04',
    label: 'PACE',
    headline: ['HOW SHOULD', 'WE BUILD IT?'],
    lede: 'SET YOUR PRIORITIES AND PREFERRED TIMING. WE’LL RECOMMEND THE RIGHT APPROACH BASED ON YOUR GOALS.',
    cta: 'REVIEW MY BLUEPRINT',
  },
  {
    id: 'blueprint',
    index: '05',
    label: 'BLUEPRINT',
    headline: ['YOUR', 'BLUEPRINT'],
    lede: 'A PROPOSED DIGITAL LOCATION BUILT AROUND YOUR GOALS. REVIEW YOUR SELECTIONS, EXPLORE THE STRUCTURE, AND SEE THE ESTIMATED TIMELINE AND INVESTMENT RANGE.',
    cta: 'CONFIRM & SUBMIT FOR REVIEW',
  },
];

export const STUDIO_ROOM_BY_ID: Record<StudioRoomId, StudioRoom> = Object.fromEntries(
  STUDIO_ROOMS.map((room) => [room.id, room]),
) as Record<StudioRoomId, StudioRoom>;

/** The four configuration rooms that count on the progress rail (the Blueprint is the reveal, not a room). */
export const CONFIG_ROOMS: readonly StudioRoomId[] = ['place', 'feel', 'work', 'pace'];

export function roomOrder(id: StudioRoomId): number {
  return STUDIO_ROOMS.findIndex((room) => room.id === id);
}

/* ─────────────────────────────── 01 PLACE ─────────────────────────────── */

/**
 * The four journey paths from `BUILDER_CLIENT_JOURNEY.md` (SIMPLE · ADVANCED · CUSTOM · WORLD). A path is not a
 * commercial category and not a build level the client buys: it sets existing selection fields, and the build
 * level is still derived by `deriveBuildLevel`.
 */
export type StudioPath = 'SIMPLE' | 'ADVANCED' | 'CUSTOM' | 'WORLD';

export const PATH_OPTIONS: readonly { id: StudioPath; label: string; descriptor: string; plain: string }[] = [
  {
    id: 'SIMPLE',
    label: 'SIMPLE',
    descriptor: 'REFINE AN ESTABLISHED SYSTEM',
    plain: 'A proven visual system used closely, kept focused. Choices that need more are shown as decisions.',
  },
  {
    id: 'ADVANCED',
    label: 'ADVANCED',
    descriptor: 'RESHAPE THE SYSTEM',
    plain: 'The visual system developed for your project, with more of what the place does.',
  },
  {
    id: 'CUSTOM',
    label: 'CUSTOM',
    descriptor: 'BUILD FROM ZERO',
    plain: 'A custom creative direction designed from first principles with you.',
  },
  {
    id: 'WORLD',
    label: 'WORLD',
    descriptor: 'CREATE A CONNECTED ENVIRONMENT',
    plain: 'A spatial environment with places, moments and things to do.',
  },
];

/* ─────────────────────────────── 02 FEEL ─────────────────────────────── */

/**
 * Presentation labels over the canonical visual systems. The first four are the approved reference labels; the
 * last two keep the remaining canonical systems reachable (the rail scrolls).
 */
const FEEL_LABELS: { id: VisualSystemId; label: string; descriptor?: string }[] = [
  { id: 'ARCHITECTURAL_MINIMAL', label: 'MODERN', descriptor: 'CLEAN. REFINED. TIMELESS.' },
  { id: 'POP_EDITORIAL', label: 'BOLD' },
  { id: 'EDITORIAL_OBJECT', label: 'EDITORIAL' },
  { id: 'CINEMATIC_LUXURY', label: 'IMMERSIVE' },
  { id: 'SOFT_ORGANIC', label: 'WARM' },
  { id: 'INDUSTRIAL_COMMAND', label: 'OPERATIONAL' },
];

/** "Loud, playful, confident." → "LOUD. PLAYFUL. CONFIDENT." */
function feelsToDescriptor(feels: string): string {
  return feels
    .replace(/\.$/, '')
    .split(',')
    .map((part) => `${part.trim().toUpperCase()}.`)
    .join(' ');
}

export type FeelOption = { id: VisualSystemId; label: string; descriptor: string; systemLabel: string };

export const FEEL_OPTIONS: readonly FeelOption[] = FEEL_LABELS.map((item) => ({
  id: item.id,
  label: item.label,
  descriptor: item.descriptor ?? feelsToDescriptor(EXPRESSION_BY_ID[item.id].feels),
  systemLabel: EXPRESSION_BY_ID[item.id].label,
}));

export const FEEL_BY_ID: Record<VisualSystemId, FeelOption> = Object.fromEntries(
  FEEL_OPTIONS.map((item) => [item.id, item]),
) as Record<VisualSystemId, FeelOption>;

/* ─────────────────────────────── 03 WORK ─────────────────────────────── */

export type WorkModuleId = 'PAGES' | 'BLOG' | 'SHOP' | 'MEMBER_AREA' | 'BOOKING' | 'PORTAL';

export type WorkModule = {
  id: WorkModuleId;
  label: string;
  plain: string;
  /** Exactly one canonical binding per module. */
  binding: { capability: CapabilityId } | { experience: ExperienceId } | { depthStep: 1 };
  /** Placement around the structure, mirroring the approved reference. */
  side: 'left' | 'right';
  row: 0 | 1 | 2;
};

export const WORK_MODULES: readonly WorkModule[] = [
  { id: 'PAGES', label: 'PAGES', plain: 'Every page designed in more depth: more of the states and sub-views people meet.', binding: { depthStep: 1 }, side: 'left', row: 0 },
  { id: 'BLOG', label: 'BLOG', plain: 'A journal: news and stories over time.', binding: { experience: 'JOURNAL' }, side: 'right', row: 0 },
  { id: 'SHOP', label: 'SHOP', plain: CAPABILITY_BY_ID.SELL.plain, binding: { capability: 'SELL' }, side: 'left', row: 1 },
  { id: 'MEMBER_AREA', label: 'MEMBER AREA', plain: CAPABILITY_BY_ID.MEMBERSHIP.plain, binding: { capability: 'MEMBERSHIP' }, side: 'right', row: 1 },
  { id: 'BOOKING', label: 'BOOKING', plain: CAPABILITY_BY_ID.BOOK.plain, binding: { capability: 'BOOK' }, side: 'left', row: 2 },
  { id: 'PORTAL', label: 'PORTAL', plain: CAPABILITY_BY_ID.DATA_PORTAL.plain, binding: { capability: 'DATA_PORTAL' }, side: 'right', row: 2 },
];

export const WORK_MODULE_BY_ID: Record<WorkModuleId, WorkModule> = Object.fromEntries(
  WORK_MODULES.map((item) => [item.id, item]),
) as Record<WorkModuleId, WorkModule>;

/** Included in every build. ANALYTICS is bound to the canonical MEASURE capability so the estimate includes it. */
export const CORE_INCLUDED_CAPABILITIES: readonly CapabilityId[] = ['MEASURE'];

export type CoreIncludedId = 'WEBSITE' | 'MOBILE' | 'SEO' | 'ANALYTICS';
export const CORE_INCLUDED: readonly { id: CoreIncludedId; label: string; worldLabel: string; plain: string }[] = [
  { id: 'WEBSITE', label: 'WEBSITE', worldLabel: 'ENTRY', plain: 'The front door: home, about and a clear way to begin.' },
  { id: 'MOBILE', label: 'MOBILE', worldLabel: 'MOBILE', plain: 'Designed for phone and desktop.' },
  { id: 'SEO', label: 'SEO', worldLabel: 'SEO', plain: 'Search basics: titles, descriptions and a sitemap.' },
  { id: 'ANALYTICS', label: 'ANALYTICS', worldLabel: 'ANALYTICS', plain: CAPABILITY_BY_ID.MEASURE.plain },
];

/* ─────────────────────────────── 04 PACE ─────────────────────────────── */

export type StudioPace = 'STANDARD' | 'EXPEDITED' | 'FLEXIBLE';

export const PACE_OPTIONS: readonly {
  id: StudioPace;
  label: string;
  sub: string;
  delivery: BuilderSelection['delivery'];
  plain: string;
}[] = [
  { id: 'STANDARD', label: 'STANDARD', sub: 'OUR TYPICAL TIMELINE', delivery: 'STANDARD', plain: 'Production at the normal pace, with work in parallel wherever the plan allows.' },
  { id: 'EXPEDITED', label: 'EXPEDITED', sub: 'PRIORITY PLACEMENT', delivery: 'PRIORITY', plain: 'SITE 00 reserves extra capacity for your project. Offered only where it actually shortens the work.' },
  { id: 'FLEXIBLE', label: 'FLEXIBLE', sub: 'EXTENDED TIMELINE', delivery: 'CUSTOM_SCHEDULE', plain: 'No fixed deadline. Tell us your timing and SITE 00 proposes a schedule around it.' },
];

/* ─────────────────────────────── draft ─────────────────────────────── */

export type StudioDraft = {
  version: typeof STUDIO_DRAFT_VERSION;
  path: StudioPath | null;
  feel: VisualSystemId | null;
  modules: WorkModuleId[];
  /** SIMPLE path only: the client chose to keep a capability that needs an advanced build. */
  acceptedLevelRaise: boolean;
  /** Null = suggested from the WORK room. Set from the Blueprint STRUCTURE tab. */
  structure: StructuralArchetypeId | null;
  /** WORLD path only. Null = the canonical default world form. */
  worldForm: WorldArchetypeId | null;
  pace: StudioPace;
  notes: string;
  furthestRoom: StudioRoomId;
  updatedAt: string | null;
  savedAt: string | null;
  submission: { intakeId: string; submittedAt: string } | null;
};

export function emptyDraft(): StudioDraft {
  return {
    version: STUDIO_DRAFT_VERSION,
    path: null,
    feel: null,
    modules: [],
    acceptedLevelRaise: false,
    structure: null,
    worldForm: null,
    pace: 'STANDARD',
    notes: '',
    furthestRoom: 'place',
    updatedAt: null,
    savedAt: null,
    submission: null,
  };
}

const PATH_IDS = new Set<StudioPath>(PATH_OPTIONS.map((item) => item.id));
const FEEL_IDS = new Set<VisualSystemId>(FEEL_OPTIONS.map((item) => item.id));
const MODULE_IDS = new Set<WorkModuleId>(WORK_MODULES.map((item) => item.id));
const PACE_IDS = new Set<StudioPace>(PACE_OPTIONS.map((item) => item.id));
const ROOM_IDS = new Set<StudioRoomId>(STUDIO_ROOMS.map((item) => item.id));
const STRUCTURE_IDS = new Set<StructuralArchetypeId>(['EDITORIAL', 'GALLERY', 'COMMERCE', 'SERVICE', 'PORTAL', 'HOSPITALITY', 'COMMUNITY']);
const WORLD_IDS = new Set<WorldArchetypeId>(['ESTATE', 'PROMENADE', 'HUB', 'DISTRICT', 'SANCTUARY', 'SHOWROOM', 'SOCIAL', 'STORY']);

/** Restores a saved draft. Anything unknown or malformed falls back to the empty draft's value. */
export function parseDraft(raw: string | null): StudioDraft | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (v.version !== STUDIO_DRAFT_VERSION) return null;
  const base = emptyDraft();
  const pick = <T>(set: Set<T>, candidate: unknown, fallback: T): T => (set.has(candidate as T) ? (candidate as T) : fallback);
  const submission = v.submission as StudioDraft['submission'];
  return {
    ...base,
    path: pick<StudioPath | null>(PATH_IDS as Set<StudioPath | null>, v.path, null),
    feel: pick<VisualSystemId | null>(FEEL_IDS as Set<VisualSystemId | null>, v.feel, null),
    modules: Array.isArray(v.modules) ? [...new Set(v.modules.filter((m): m is WorkModuleId => MODULE_IDS.has(m as WorkModuleId)))] : [],
    acceptedLevelRaise: v.acceptedLevelRaise === true,
    structure: pick<StructuralArchetypeId | null>(STRUCTURE_IDS as Set<StructuralArchetypeId | null>, v.structure, null),
    worldForm: pick<WorldArchetypeId | null>(WORLD_IDS as Set<WorldArchetypeId | null>, v.worldForm, null),
    pace: pick(PACE_IDS, v.pace, base.pace),
    notes: typeof v.notes === 'string' ? v.notes.slice(0, 2000) : '',
    furthestRoom: pick(ROOM_IDS, v.furthestRoom, base.furthestRoom),
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : null,
    savedAt: typeof v.savedAt === 'string' ? v.savedAt : null,
    submission:
      submission && typeof submission === 'object' && typeof submission.intakeId === 'string' && typeof submission.submittedAt === 'string'
        ? { intakeId: submission.intakeId, submittedAt: submission.submittedAt }
        : null,
  };
}

/* ─────────────────────────────── draft → canonical selection ─────────────────────────────── */

/** The site grammar the WORK room points to, until the client picks one in the Blueprint STRUCTURE tab. */
export function suggestedStructure(modules: readonly WorkModuleId[]): StructuralArchetypeId {
  return modules.includes('SHOP') ? 'COMMERCE' : 'SERVICE';
}

const DEPTH_STEP: Record<ExperienceDepth, ExperienceDepth> = { ESSENTIAL: 'FULL', FULL: 'EXTENSIVE', EXTENSIVE: 'EXTENSIVE' };

function moduleCapabilities(modules: readonly WorkModuleId[]): CapabilityId[] {
  const out: CapabilityId[] = [];
  for (const id of modules) {
    const binding = WORK_MODULE_BY_ID[id].binding;
    if ('capability' in binding) out.push(binding.capability);
  }
  return out;
}

export function isWorldPath(draft: Pick<StudioDraft, 'path'>): boolean {
  return draft.path === 'WORLD';
}

/** Modules that have no meaning for the current path (a world is designed as places, not pages). */
export function moduleUnavailableReason(draft: Pick<StudioDraft, 'path'>, id: WorkModuleId): string | null {
  if (isWorldPath(draft) && (id === 'PAGES' || id === 'BLOG')) return 'A WORLD IS DESIGNED AS PLACES, NOT PAGES.';
  return null;
}

/** Draft → canonical `BuilderSelection`. Pure; the only bridge between the rooms and the estimator. */
export function toSelection(draft: StudioDraft): BuilderSelection {
  const selection = emptySelection();
  const path = draft.path;
  const world = path === 'WORLD';
  selection.build = path ? (world ? 'WORLD' : 'SITE') : null;
  if (world) selection.world = { ...DEFAULT_WORLD_SELECTION, form: draft.worldForm ?? DEFAULT_WORLD_SELECTION.form };
  selection.keepItSimple = path === 'SIMPLE' && !draft.acceptedLevelRaise;

  if (path === 'CUSTOM') {
    // A custom creative direction; the FEEL choice travels with it as the starting influence.
    selection.expression = { primary: 'CUSTOM', secondary: draft.feel, likedParts: [], edition: 'FULL' };
  } else {
    selection.expression = {
      primary: draft.feel,
      secondary: null,
      likedParts: [],
      edition: path === 'ADVANCED' ? 'FULL' : 'ESSENTIAL',
    };
  }

  const modules = draft.modules.filter((id) => !moduleUnavailableReason(draft, id));
  selection.capabilities = [...new Set<CapabilityId>([...CORE_INCLUDED_CAPABILITIES, ...moduleCapabilities(modules)])];
  if (!world && path) selection.structure = draft.structure ?? suggestedStructure(modules);
  selection.delivery = PACE_OPTIONS.find((item) => item.id === draft.pace)?.delivery ?? 'STANDARD';

  const depthStep = modules.includes('PAGES');
  const extras = modules
    .map((id) => WORK_MODULE_BY_ID[id].binding)
    .filter((binding): binding is { experience: ExperienceId } => 'experience' in binding)
    .map((binding) => binding.experience);
  if (!world && (depthStep || extras.length)) {
    const { level } = deriveBuildLevel(selection);
    const base = recommendedExperiences(selection, level);
    const ids = new Set(base.map((choice) => choice.id));
    const defaultDepth: ExperienceDepth = level === 'SIMPLE' ? 'ESSENTIAL' : 'FULL';
    const withExtras: ExperienceChoice[] = [...base, ...extras.filter((id) => !ids.has(id)).map((id) => ({ id, depth: defaultDepth }))];
    selection.experiences = withExtras.map((choice) => ({ id: choice.id, depth: depthStep ? DEPTH_STEP[choice.depth] : choice.depth }));
  }
  return selection;
}

/* ─────────────────────────────── level guard (SIMPLE path) ─────────────────────────────── */

export type ModuleLevelCheck = { raises: false } | { raises: true; reason: string };

/**
 * Would adding this module take a SIMPLE client past a simple build? The Builder asks instead of silently
 * upgrading (BUILDER_CLIENT_JOURNEY.md §2, "Simple guard rails").
 */
export function moduleLevelCheck(draft: StudioDraft, id: WorkModuleId): ModuleLevelCheck {
  if (draft.path !== 'SIMPLE' || draft.acceptedLevelRaise || draft.modules.includes(id)) return { raises: false };
  const before = deriveBuildLevel(toSelection(draft)).level;
  const after = deriveBuildLevel(toSelection({ ...draft, modules: [...draft.modules, id] })).level;
  if (before === after) return { raises: false };
  return { raises: true, reason: `${WORK_MODULE_BY_ID[id].label} IS PART OF AN ADVANCED BUILD.` };
}

/* ─────────────────────────────── room access + readiness ─────────────────────────────── */

/** The first room the client still has to answer, or null when every required room is answered. */
export function firstOpenRoom(draft: StudioDraft): StudioRoomId | null {
  if (!draft.path) return 'place';
  if (!draft.feel) return 'feel';
  return null;
}

/** A room can be opened when every room before it that needs an answer has one. */
export function canEnterRoom(draft: StudioDraft, room: StudioRoomId): boolean {
  const open = firstOpenRoom(draft);
  if (!open) return true;
  return roomOrder(room) <= roomOrder(open);
}

export function roomComplete(draft: StudioDraft, room: StudioRoomId): boolean {
  switch (room) {
    case 'place':
      return draft.path !== null;
    case 'feel':
      return draft.feel !== null;
    case 'work':
    case 'pace':
      return roomOrder(draft.furthestRoom) > roomOrder(room);
    case 'blueprint':
      return draft.submission !== null;
  }
}

export function advanceFurthest(draft: StudioDraft, room: StudioRoomId): StudioDraft {
  return roomOrder(room) > roomOrder(draft.furthestRoom) ? { ...draft, furthestRoom: room } : draft;
}

export type StudioReadiness = {
  ready: boolean;
  missing: StudioRoomId[];
  decisions: BuilderNotice[];
};

/**
 * Submission readiness. Every required room answered and no open NEEDS_DECISION notice. The canonical
 * `builderBlueprint().complete` also requires the type / colour / image / motion lines, which a CUSTOM direction
 * deliberately leaves to creative direction; that gap is recorded for Composer (see the studio doc).
 */
export function studioReadiness(draft: StudioDraft, selection: BuilderSelection = toSelection(draft)): StudioReadiness {
  const missing: StudioRoomId[] = [];
  if (!draft.path) missing.push('place');
  if (!draft.feel) missing.push('feel');
  const decisions = builderNotices(selection).filter((notice) => notice.kind === 'NEEDS_DECISION');
  return { ready: missing.length === 0 && decisions.length === 0, missing, decisions };
}

/* ─────────────────────────────── display helpers ─────────────────────────────── */

/** "$12K–$18K" → "$12,000 – $18,000". Display only: the figures are the canonical formatter's. */
export function expandInvestment(range: string): string {
  return range
    .replace(/\$(\d+(?:\.\d+)?)K/g, (_, n: string) => `$${Math.round(Number(n) * 1000).toLocaleString('en-US')}`)
    .replace(/\s*–\s*/, ' – ');
}

/** "6–10 WEEKS" → "6 – 10 WEEKS" to match the reference's spaced dash. */
export function spacedRange(value: string): string {
  return value.replace(/\s*–\s*/, ' – ');
}

const LEVEL_DESCRIPTOR = {
  SIMPLE: 'Refine an established system for your needs.',
  ADVANCED: 'Reshape an established system around your needs.',
  CUSTOM: 'A custom direction built from zero around your needs.',
} as const;

export function buildTypeSummary(draft: StudioDraft, selection: BuilderSelection): { label: string; descriptor: string; reasons: string[] } {
  const { level, reasons } = deriveBuildLevel(selection);
  if (draft.path === 'WORLD') {
    return { label: 'WORLD', descriptor: `A connected environment people explore · ${level} build.`, reasons: reasons.map((r) => r.reason) };
  }
  return { label: level, descriptor: LEVEL_DESCRIPTOR[level], reasons: reasons.map((r) => r.reason) };
}

export function featureCount(selection: BuilderSelection): number {
  return effectiveCapabilities(selection).length;
}

export function draftSummaryLine(draft: StudioDraft): string {
  const parts = [
    draft.path ?? '—',
    draft.feel ? FEEL_BY_ID[draft.feel].label : '—',
    `${draft.modules.length} ${draft.modules.length === 1 ? 'FEATURE' : 'FEATURES'}`,
    draft.pace,
  ];
  return parts.join(' · ');
}
