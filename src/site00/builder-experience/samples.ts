/**
 * Example client journeys. Used by tests, the docs export and the wireframes. They are examples of how a client
 * might configure the Builder, not offers or prices.
 */
import type { BuilderSelection, ExperienceChoice } from './types';

export function emptySelection(): BuilderSelection {
  return {
    build: null,
    hybridParts: [],
    structure: null,
    structureSecondary: null,
    world: null,
    expression: { primary: null, secondary: null, likedParts: [], edition: 'ESSENTIAL' },
    type: 'SYSTEM_DEFAULT',
    color: 'SYSTEM_DEFAULT',
    imageWorld: 'SYSTEM_DEFAULT',
    motion: 'SYSTEM_DEFAULT',
    capabilities: [],
    experiences: null,
    viewports: 'PHONE_AND_DESKTOP',
    brand: 'READY',
    content: 'READY',
    delivery: 'STANDARD',
    keepItSimple: false,
  };
}

const sel = (partial: Partial<BuilderSelection>): BuilderSelection => ({ ...emptySelection(), ...partial });

/** SIMPLE: a practice site. Structure + one system in its essential edition, no tuning. */
export const SAMPLE_SIMPLE_SERVICE: BuilderSelection = sel({
  build: 'SITE',
  structure: 'SERVICE',
  expression: { primary: 'ARCHITECTURAL_MINIMAL', secondary: null, likedParts: [], edition: 'ESSENTIAL' },
  capabilities: ['EDIT_CONTENT'],
  keepItSimple: true,
});

/** SIMPLE that asks for booking: still simple (booking is available to every build level). */
export const SAMPLE_SIMPLE_HOSPITALITY: BuilderSelection = sel({
  build: 'SITE',
  structure: 'HOSPITALITY',
  expression: { primary: 'SOFT_ORGANIC', secondary: null, likedParts: [{ system: 'EDITORIAL_OBJECT', facet: 'TYPE' }], edition: 'ESSENTIAL' },
  capabilities: ['BOOK', 'EDIT_CONTENT'],
  brand: 'IN_PROGRESS',
  keepItSimple: true,
});

/** ADVANCED: editorial publication with a secondary influence and tuned type. */
export const SAMPLE_ADVANCED_EDITORIAL: BuilderSelection = sel({
  build: 'SITE',
  structure: 'EDITORIAL',
  expression: { primary: 'ARCHITECTURAL_MINIMAL', secondary: 'EDITORIAL_OBJECT', likedParts: [], edition: 'FULL' },
  type: 'EDITORIAL_SERIF',
  capabilities: ['EDIT_CONTENT', 'SEARCH', 'EMAIL', 'MEMBERSHIP'],
  viewports: 'PHONE_TABLET_DESKTOP',
});

/** CUSTOM: "none of these" → custom creative direction on a commerce structure. */
export const SAMPLE_CUSTOM_COMMERCE: BuilderSelection = sel({
  build: 'SITE',
  structure: 'COMMERCE',
  expression: { primary: 'CUSTOM', secondary: null, likedParts: [{ system: 'CINEMATIC_LUXURY', facet: 'MOTION' }, { system: 'POP_EDITORIAL', facet: 'TYPE' }], edition: 'FULL', customDirectionNote: 'Like a gallery that happens to sell.' },
  motion: 'CINEMATIC',
  capabilities: ['ACCOUNTS', 'EMAIL', 'MEASURE'],
  viewports: 'PHONE_TABLET_DESKTOP',
  content: 'PARTIAL',
});

/** WORLD: a showroom world. */
export const SAMPLE_WORLD_SHOWROOM: BuilderSelection = sel({
  build: 'WORLD',
  world: { form: 'SHOWROOM', places: 'SEVERAL', moments: 'MANY', thingsToDo: 'TOUCH', inhabitants: 'GUIDES', change: 'TIME_OF_DAY', depth: 'DIMENSIONAL', wayfinding: 'BOTH' },
  expression: { primary: 'CINEMATIC_LUXURY', secondary: null, likedParts: [], edition: 'FULL' },
  imageWorld: 'SPATIAL_3D',
});

/** SYSTEM: a client portal. */
export const SAMPLE_SYSTEM_PORTAL: BuilderSelection = sel({
  build: 'SYSTEM',
  structure: 'PORTAL',
  expression: { primary: 'INDUSTRIAL_COMMAND', secondary: null, likedParts: [], edition: 'FULL' },
  capabilities: ['DOCUMENTS', 'NOTIFICATIONS', 'EMAIL', 'TEAM_ROLES'],
  viewports: 'PHONE_TABLET_DESKTOP',
});

const sixteen: ExperienceChoice[] = (
  ['HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'PROOF', 'JOURNAL', 'EVENTS', 'CARE', 'BOOKING', 'MEMBERSHIP', 'ACCOUNT', 'DASHBOARD', 'RECORDS', 'FILES', 'PEOPLE', 'SETTINGS', 'COMMUNITY', 'STORIES', 'STORY'] as const
).map((id) => ({ id, depth: 'FULL' }));

/** LARGE: a practice with a members platform behind it. Big enough for priority production to help. */
export const SAMPLE_LARGE_HYBRID: BuilderSelection = sel({
  build: 'HYBRID',
  hybridParts: ['SITE', 'SYSTEM'],
  structure: 'HYBRID',
  structureSecondary: 'PORTAL',
  expression: { primary: 'EDITORIAL_OBJECT', secondary: null, likedParts: [], edition: 'FULL' },
  capabilities: ['BOOK', 'MEMBERSHIP', 'DASHBOARD', 'DATA_PORTAL', 'DOCUMENTS', 'COMMUNITY', 'EMAIL', 'NOTIFICATIONS'],
  experiences: sixteen,
  delivery: 'PRIORITY',
});

export const BUILDER_SAMPLES = {
  SIMPLE_SERVICE: SAMPLE_SIMPLE_SERVICE,
  SIMPLE_HOSPITALITY: SAMPLE_SIMPLE_HOSPITALITY,
  ADVANCED_EDITORIAL: SAMPLE_ADVANCED_EDITORIAL,
  CUSTOM_COMMERCE: SAMPLE_CUSTOM_COMMERCE,
  WORLD_SHOWROOM: SAMPLE_WORLD_SHOWROOM,
  SYSTEM_PORTAL: SAMPLE_SYSTEM_PORTAL,
  LARGE_HYBRID: SAMPLE_LARGE_HYBRID,
} as const;
