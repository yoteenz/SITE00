/**
 * SITE 00 Builder — Hybrid Spatial Studio presentation model.
 *
 * The rooms (PLACE · FEEL · WORK · PACE) and the Blueprint reveal present Composer's spatial contract
 * (`src/site00/builder-experience/spatialStudio`). The client's choices live in `SpatialBuilderState`, which the
 * session hook keeps on the canonical BUILDER intake. The mapping onto `BuilderSelection`, the Blueprint, the
 * readiness rules and every estimate come from that contract. This file only names, orders and words them.
 */
import { CAPABILITY_BY_ID, EXPRESSION_BY_ID, builderNotices, deriveBuildLevel, effectiveCapabilities } from '../builder-experience';
import type { BuilderSelection } from '../builder-experience';
import {
  FEEL_OPTIONS as SPATIAL_FEEL_OPTIONS,
  PACE_OPTIONS as SPATIAL_PACE_OPTIONS,
  PLACE_OPTIONS as SPATIAL_PLACE_OPTIONS,
  WORK_OPTIONS as SPATIAL_WORK_OPTIONS,
  canEnterRoom as spatialCanEnterRoom,
  emptySpatialState,
  spatialSelectionToBuilder,
} from '../builder-experience/spatialStudio';
import type {
  FeelVibeId,
  PacePreferenceId,
  PlacePathId,
  SpatialBuilderState,
  SpatialRoomId,
  WorkModuleId,
} from '../builder-experience/spatialStudio';

export type { FeelVibeId, PacePreferenceId, PlacePathId, SpatialBuilderState, SpatialRoomId, WorkModuleId };

/* ─────────────────────────────── rooms ─────────────────────────────── */

/** URL segment of a room (`/bldr/studio/:room`). */
export type StudioRoomId = 'place' | 'feel' | 'work' | 'pace' | 'blueprint';

export type StudioRoom = {
  id: StudioRoomId;
  spatial: SpatialRoomId;
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
    spatial: 'PLACE',
    index: '01',
    label: 'PLACE',
    headline: ['WHAT ARE', 'WE CREATING?'],
    lede: 'CHOOSE THE KIND OF DIGITAL LOCATION YOU WANT TO BUILD. EACH OPTION OPENS A DIFFERENT POSSIBILITY.',
    cta: 'CONTINUE',
  },
  {
    id: 'feel',
    spatial: 'FEEL',
    index: '02',
    label: 'FEEL',
    headline: ['HOW SHOULD', 'IT FEEL?'],
    lede: 'EXPLORE DIFFERENT VISUAL DIRECTIONS. THESE EXPRESSIONS SET THE TONE FOR YOUR DIGITAL LOCATION.',
    cta: 'CONTINUE',
  },
  {
    id: 'work',
    spatial: 'WORK',
    index: '03',
    label: 'WORK',
    headline: ['WHAT MUST', 'IT DO?'],
    lede: 'SELECT THE CAPABILITIES YOUR DIGITAL LOCATION NEEDS. EACH FEATURE ADDS A LAYER TO YOUR STRUCTURE.',
    cta: 'CONTINUE',
  },
  {
    id: 'pace',
    spatial: 'PACE',
    index: '04',
    label: 'PACE',
    headline: ['HOW SHOULD', 'WE BUILD IT?'],
    lede: 'SET YOUR PRIORITIES AND PREFERRED TIMING. WE’LL RECOMMEND THE RIGHT APPROACH BASED ON YOUR GOALS.',
    cta: 'REVIEW MY BLUEPRINT',
  },
  {
    id: 'blueprint',
    spatial: 'BLUEPRINT',
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

export function studioRoomFromSpatial(room: SpatialRoomId): StudioRoomId {
  return STUDIO_ROOMS.find((item) => item.spatial === room)?.id ?? 'place';
}

export function spatialRoom(room: StudioRoomId): SpatialRoomId {
  return STUDIO_ROOM_BY_ID[room].spatial;
}

export function parseStudioRoom(segment: string | undefined): StudioRoomId | null {
  const id = (segment ?? '').split('/')[0].toLowerCase();
  return STUDIO_ROOMS.some((room) => room.id === id) ? (id as StudioRoomId) : null;
}

/** Room access is the contract's rule (`canEnterRoom`). */
export function canEnterStudioRoom(state: SpatialBuilderState, room: StudioRoomId): boolean {
  return spatialCanEnterRoom(state, spatialRoom(room));
}

/** The furthest room the client can open with what they have answered. */
export function furthestOpenRoom(state: SpatialBuilderState): StudioRoomId {
  let furthest: StudioRoomId = 'place';
  for (const room of STUDIO_ROOMS) {
    if (canEnterStudioRoom(state, room.id)) furthest = room.id;
  }
  return furthest;
}

export function roomAnswered(state: SpatialBuilderState, room: StudioRoomId): boolean {
  switch (room) {
    case 'place':
      return state.placePath !== null;
    case 'feel':
      return state.feelVibe !== null;
    case 'work':
      return state.workModules.length > 0;
    case 'pace':
      return state.pace !== null;
    case 'blueprint':
      return false;
  }
}

/** Whether the room's CONTINUE can move on: the next room's entry rule. */
export function roomCanContinue(state: SpatialBuilderState, room: StudioRoomId): boolean {
  const next = STUDIO_ROOMS[roomOrder(room) + 1];
  return next ? canEnterStudioRoom(state, next.id) : false;
}

/* ─────────────────────────────── 01 PLACE ─────────────────────────────── */

const PATH_PLAIN: Record<PlacePathId, string> = {
  SIMPLE: 'A proven visual system used closely, kept focused. Choices that need more are shown as decisions.',
  ADVANCED: 'The visual system developed for your project, with more of what the place does.',
  CUSTOM: 'A custom creative direction designed from first principles with you.',
  WORLD: 'A spatial environment with places, moments and things to do.',
};

export const PATH_OPTIONS: readonly { id: PlacePathId; label: string; descriptor: string; plain: string }[] = SPATIAL_PLACE_OPTIONS.map(
  (option) => ({ id: option.id, label: option.label, descriptor: option.hint, plain: PATH_PLAIN[option.id] }),
);

/* ─────────────────────────────── 02 FEEL ─────────────────────────────── */

/** "Loud, playful, confident." → "LOUD. PLAYFUL. CONFIDENT." */
function feelsToDescriptor(feels: string): string {
  return feels
    .replace(/\.$/, '')
    .split(',')
    .map((part) => `${part.trim().toUpperCase()}.`)
    .join(' ');
}

/** The canonical visual system the contract maps a direction onto (read from the mapping, never restated). */
export function feelVisualSystem(id: FeelVibeId) {
  const primary = spatialSelectionToBuilder({ ...emptySpatialState(), placePath: 'SIMPLE', feelVibe: id }).expression.primary;
  return primary && primary !== 'CUSTOM' ? EXPRESSION_BY_ID[primary] : null;
}

export type FeelOption = { id: FeelVibeId; label: string; descriptor: string; systemLabel: string; hint: string };

/** The approved reference's own words for MODERN; the others read the canonical system's feels. */
const FEEL_DESCRIPTOR_OVERRIDE: Partial<Record<FeelVibeId, string>> = { MODERN: 'CLEAN. REFINED. TIMELESS.' };

export const FEEL_OPTIONS: readonly FeelOption[] = SPATIAL_FEEL_OPTIONS.map((option) => {
  const system = feelVisualSystem(option.id);
  return {
    id: option.id,
    label: option.label,
    descriptor: FEEL_DESCRIPTOR_OVERRIDE[option.id] ?? (system ? feelsToDescriptor(system.feels) : option.hint.toUpperCase()),
    systemLabel: system?.label ?? option.label,
    hint: option.hint,
  };
});

export const FEEL_BY_ID: Record<FeelVibeId, FeelOption> = Object.fromEntries(FEEL_OPTIONS.map((item) => [item.id, item])) as Record<
  FeelVibeId,
  FeelOption
>;

/* ─────────────────────────────── 03 WORK ─────────────────────────────── */

export type WorkModule = {
  id: WorkModuleId;
  label: string;
  plain: string;
  /** Placement around the structure, mirroring the approved reference. */
  side: 'left' | 'right';
  row: 0 | 1 | 2;
};

const MODULE_LAYOUT: Record<WorkModuleId, { side: 'left' | 'right'; row: 0 | 1 | 2 }> = {
  PAGES: { side: 'left', row: 0 },
  BLOG: { side: 'right', row: 0 },
  SHOP: { side: 'left', row: 1 },
  MEMBER_AREA: { side: 'right', row: 1 },
  BOOKING: { side: 'left', row: 2 },
  PORTAL: { side: 'right', row: 2 },
};

/** Reference order: PAGES · BLOG / SHOP · MEMBER AREA / BOOKING · PORTAL. */
const MODULE_ORDER: WorkModuleId[] = ['PAGES', 'BLOG', 'SHOP', 'MEMBER_AREA', 'BOOKING', 'PORTAL'];

export const WORK_MODULES: readonly WorkModule[] = MODULE_ORDER.map((id) => {
  const option = SPATIAL_WORK_OPTIONS.find((item) => item.id === id)!;
  return { id, label: option.label, plain: option.hint, ...MODULE_LAYOUT[id] };
});

export const WORK_MODULE_BY_ID: Record<WorkModuleId, WorkModule> = Object.fromEntries(
  WORK_MODULES.map((item) => [item.id, item]),
) as Record<WorkModuleId, WorkModule>;

/**
 * What every build carries regardless of the WORK room. Only what the contract's selection backs is shown: a site
 * build and a phone + desktop layout. Search and analytics are not in the selection, so they are not claimed
 * (requested from Composer, see the studio doc).
 */
export type CoreIncludedId = 'WEBSITE' | 'MOBILE';
export const CORE_INCLUDED: readonly { id: CoreIncludedId; label: string; worldLabel: string; plain: string }[] = [
  { id: 'WEBSITE', label: 'WEBSITE', worldLabel: 'ENTRY', plain: 'The front door: home, about and a clear way to begin.' },
  { id: 'MOBILE', label: 'MOBILE', worldLabel: 'ADAPTIVE', plain: 'Designed for phone and desktop.' },
];

export type ModuleLevelCheck = { raises: false } | { raises: true; reason: string };

function levelDecisions(state: SpatialBuilderState): string[] {
  return builderNotices(spatialSelectionToBuilder(state))
    .filter((notice) => notice.kind === 'NEEDS_DECISION')
    .map((notice) => notice.id);
}

/**
 * Would adding this module take a SIMPLE build past what a simple build holds? The contract marks that as an open
 * decision (`NEEDS_DECISION`) and blocks submission. The studio asks first; the resolution the contract offers is
 * moving the build to the ADVANCED path.
 */
export function moduleLevelCheck(state: SpatialBuilderState, id: WorkModuleId): ModuleLevelCheck {
  if (state.placePath !== 'SIMPLE' || state.workModules.includes(id)) return { raises: false };
  const before = new Set(levelDecisions(state));
  const after = levelDecisions({ ...state, workModules: [...state.workModules, id] });
  if (!after.some((notice) => !before.has(notice))) return { raises: false };
  return { raises: true, reason: `${WORK_MODULE_BY_ID[id].label} IS PART OF AN ADVANCED BUILD.` };
}

/* ─────────────────────────────── 04 PACE ─────────────────────────────── */

const PACE_PLAIN: Record<PacePreferenceId, string> = {
  STANDARD: 'Production at the normal pace, with work in parallel wherever the plan allows.',
  EXPEDITED: 'SITE 00 reserves extra capacity for your project. Offered only where it actually shortens the work.',
  FLEXIBLE: 'No fixed deadline. Tell us your timing and SITE 00 proposes a schedule around it.',
};

export const PACE_OPTIONS: readonly { id: PacePreferenceId; label: string; sub: string; plain: string }[] = SPATIAL_PACE_OPTIONS.map(
  (option) => ({ id: option.id, label: option.label, sub: option.hint, plain: PACE_PLAIN[option.id] }),
);

/* ─────────────────────────────── Build Object spec ─────────────────────────────── */

export type BuildSpec = {
  path: PlacePathId | null;
  feel: FeelVibeId | null;
  modules: WorkModuleId[];
  pace: PacePreferenceId | null;
};

export function buildSpec(state: Pick<SpatialBuilderState, 'placePath' | 'feelVibe' | 'workModules' | 'pace'>): BuildSpec {
  return { path: state.placePath, feel: state.feelVibe, modules: state.workModules, pace: state.pace };
}

/* ─────────────────────────────── readiness copy ─────────────────────────────── */

/** Client words for the contract's `submission_blockers`. */
export const BLOCKER_COPY: Record<string, { text: string; room: StudioRoomId | null }> = {
  PLACE_NOT_CHOSEN: { text: 'CHOOSE WHAT WE ARE CREATING.', room: 'place' },
  FEEL_NOT_CHOSEN: { text: 'CHOOSE HOW IT SHOULD FEEL.', room: 'feel' },
  WORK_EMPTY: { text: 'CHOOSE AT LEAST ONE CAPABILITY.', room: 'work' },
  PACE_NOT_CHOSEN: { text: 'CHOOSE HOW WE SHOULD BUILD IT.', room: 'pace' },
  BLUEPRINT_INCOMPLETE: { text: 'YOUR BLUEPRINT HAS AN OPEN DECISION.', room: null },
  ESTIMATE_INVALID: { text: 'THIS CONFIGURATION CANNOT BE ESTIMATED YET.', room: null },
};

export function blockerCopy(code: string): { text: string; room: StudioRoomId | null } {
  return BLOCKER_COPY[code] ?? { text: code.replace(/_/g, ' '), room: null };
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

export function buildTypeSummary(path: PlacePathId | null, selection: BuilderSelection): { label: string; descriptor: string; reasons: string[] } {
  const { level, reasons } = deriveBuildLevel(selection);
  if (path === 'WORLD') {
    return { label: 'WORLD', descriptor: `A connected environment people explore · ${level} build.`, reasons: reasons.map((r) => r.reason) };
  }
  return { label: level, descriptor: LEVEL_DESCRIPTOR[level], reasons: reasons.map((r) => r.reason) };
}

export function featureCount(selection: BuilderSelection): number {
  return effectiveCapabilities(selection).length;
}

export function capabilityPlain(verb: string): string {
  return Object.values(CAPABILITY_BY_ID).find((c) => c.verb === verb)?.plain ?? '';
}

export function stateSummaryLine(state: Pick<SpatialBuilderState, 'placePath' | 'feelVibe' | 'workModules' | 'pace'>): string {
  return [
    state.placePath ?? '—',
    state.feelVibe ? FEEL_BY_ID[state.feelVibe].label : '—',
    state.workModules.map((id) => WORK_MODULE_BY_ID[id].label).join(' + ') || '—',
    state.pace ?? '—',
  ].join(' · ');
}
