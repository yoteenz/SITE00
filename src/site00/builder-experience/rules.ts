/**
 * Builder rules: dependencies, hybrid limits, build-level derivation and progressive disclosure.
 *
 * These rules decide WHAT the client has configured and which estimator enums it maps to. They do no estimating.
 * Every scope consequence is computed by the canonical estimator from the config `toEstimateConfig` produces.
 */
import { FEATURE_BY_ID, VISUAL_SYSTEM_BY_ID } from '../../studioos/estimation/registries';
import type { BuildLevel, FeatureId, StructuralArchetypeId, VisualComplexity, VisualSystemId } from '../../studioos/estimation/types';
import {
  CAPABILITY_BY_ID,
  EXPERIENCE_BY_ID,
  EXPRESSION_BY_ID,
  IMAGE_WORLDS,
  STRUCTURE_BY_ID,
} from './registry';
import type {
  BuildPart,
  BuilderNotice,
  BuilderSelection,
  BuilderStepId,
  CapabilityId,
  ExperienceChoice,
  ExperienceId,
  ImageWorldId,
  MotionCharacterId,
} from './types';

const LEVEL_ORDER: BuildLevel[] = ['SIMPLE', 'ADVANCED', 'CUSTOM'];
const maxLevel = (a: BuildLevel, b: BuildLevel): BuildLevel => (LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b);

const VISUAL_ORDER: VisualComplexity[] = [
  'TEMPLATE_LED',
  'CUSTOMIZED_TEMPLATE',
  'BESPOKE_EDITORIAL',
  'CINEMATIC',
  'GENERATIVE_ASSET_HEAVY',
  'SPATIAL_WORLD',
];
const maxVisual = (a: VisualComplexity, b: VisualComplexity): VisualComplexity =>
  VISUAL_ORDER.indexOf(a) >= VISUAL_ORDER.indexOf(b) ? a : b;

/** Structures that cannot exist without a capability. Shown as COMES WITH. */
const STRUCTURE_IMPLIES: Partial<Record<StructuralArchetypeId, CapabilityId[]>> = {
  COMMERCE: ['SELL'],
  PORTAL: ['ACCOUNTS', 'DATA_PORTAL'],
  COMMUNITY: ['COMMUNITY'],
};

/** Motion an ESSENTIAL edition actually delivers when the system's own default is more demanding. */
const ESSENTIAL_MOTION_CAP: Record<MotionCharacterId, MotionCharacterId> = {
  QUIET: 'QUIET',
  EDITORIAL: 'EDITORIAL',
  KINETIC: 'EDITORIAL',
  CINEMATIC: 'EDITORIAL',
  SPATIAL: 'EDITORIAL',
  CUSTOM: 'EDITORIAL',
};

export function buildParts(selection: BuilderSelection): BuildPart[] {
  const parts = new Set<BuildPart>();
  if (selection.build === 'HYBRID') selection.hybridParts.forEach((part) => parts.add(part));
  else if (selection.build) parts.add(selection.build);
  if (selection.capabilities.includes('WORLD')) parts.add('WORLD');
  return [...parts];
}

export function effectiveProjectType(selection: BuilderSelection): 'SITE' | 'WORLD' | 'SYSTEM' | 'HYBRID' {
  const parts = buildParts(selection);
  if (parts.length > 1) return 'HYBRID';
  return parts[0] ?? 'SITE';
}

/** Capabilities chosen plus everything they (and the structure) bring with them. */
export function effectiveCapabilities(selection: BuilderSelection): CapabilityId[] {
  const out = new Set<CapabilityId>();
  const queue: CapabilityId[] = [...selection.capabilities];
  for (const structure of [selection.structure, selection.structureSecondary]) {
    if (structure) queue.push(...(STRUCTURE_IMPLIES[structure] ?? []));
  }
  if (selection.build === 'SYSTEM' && !selection.structure) queue.push('ACCOUNTS', 'DATA_PORTAL');
  while (queue.length) {
    const next = queue.shift()!;
    if (out.has(next)) continue;
    out.add(next);
    queue.push(...CAPABILITY_BY_ID[next].comesWith);
  }
  return [...out];
}

export function effectiveFeatures(selection: BuilderSelection): FeatureId[] {
  const features = new Set<FeatureId>();
  for (const id of effectiveCapabilities(selection)) CAPABILITY_BY_ID[id].features.forEach((f) => features.add(f));
  const motion = effectiveMotion(selection);
  if (motion === 'KINETIC' || motion === 'CINEMATIC' || motion === 'SPATIAL' || motion === 'CUSTOM') features.add('ADVANCED_MOTION');
  if (motion === 'CUSTOM') features.add('CUSTOM_INTERACTIONS');
  const image = explicitImageWorld(selection);
  if (image === 'GENERATIVE') features.add('GENERATED_ASSET_SYSTEM');
  if (image === 'SPATIAL_3D') features.add('3D');
  if (buildParts(selection).includes('WORLD')) {
    features.add('WORLD_SPATIAL');
    const depth = selection.world?.depth;
    if (depth === 'DIMENSIONAL' || depth === 'FULLY_3D') features.add('3D');
  }
  return [...features];
}

/** Systems the client is drawing on: primary, secondary, and any system they liked two or more parts of. */
export function expressionInfluences(selection: BuilderSelection): VisualSystemId[] {
  const { primary, secondary, likedParts } = selection.expression;
  const counts = new Map<VisualSystemId, number>();
  for (const part of likedParts) {
    if (part.system === primary) continue;
    counts.set(part.system, (counts.get(part.system) ?? 0) + 1);
  }
  const influences = new Set<VisualSystemId>();
  if (secondary && secondary !== primary) influences.add(secondary);
  for (const [system, count] of counts) if (count >= 2) influences.add(system);
  return [...influences];
}

function primarySystem(selection: BuilderSelection): VisualSystemId | null {
  const primary = selection.expression.primary;
  return primary && primary !== 'CUSTOM' ? primary : null;
}

export function effectiveMotion(selection: BuilderSelection): MotionCharacterId {
  if (selection.motion !== 'SYSTEM_DEFAULT') return selection.motion;
  const system = primarySystem(selection);
  if (!system) return 'QUIET';
  const fallback = EXPRESSION_BY_ID[system].defaults.motion;
  return selection.expression.edition === 'ESSENTIAL' ? ESSENTIAL_MOTION_CAP[fallback] : fallback;
}

function explicitImageWorld(selection: BuilderSelection): ImageWorldId | null {
  return selection.imageWorld === 'SYSTEM_DEFAULT' ? null : selection.imageWorld;
}

/** How many of type / color / image / motion the client moved away from the system's defaults. */
export function tunedCount(selection: BuilderSelection): number {
  const system = primarySystem(selection);
  if (!system) return 0;
  const d = EXPRESSION_BY_ID[system].defaults;
  let n = 0;
  if (selection.type !== 'SYSTEM_DEFAULT' && selection.type !== d.type) n += 1;
  if (selection.color !== 'SYSTEM_DEFAULT' && selection.color !== d.color) n += 1;
  if (selection.imageWorld !== 'SYSTEM_DEFAULT' && selection.imageWorld !== d.imageWorld) n += 1;
  if (selection.motion !== 'SYSTEM_DEFAULT' && selection.motion !== d.motion) n += 1;
  return n;
}

export function visualComplexityFor(selection: BuilderSelection): VisualComplexity {
  const system = primarySystem(selection);
  const influences = expressionInfluences(selection);
  let v: VisualComplexity = 'TEMPLATE_LED';
  if (tunedCount(selection) > 0 || selection.expression.likedParts.length > 0) v = maxVisual(v, 'CUSTOMIZED_TEMPLATE');
  if (selection.expression.edition === 'FULL' && system) v = maxVisual(v, VISUAL_SYSTEM_BY_ID[system].complexity);
  if (influences.length > 0 || selection.expression.primary === 'CUSTOM') v = maxVisual(v, 'BESPOKE_EDITORIAL');
  const motion = effectiveMotion(selection);
  const world = buildParts(selection).includes('WORLD');
  if (motion === 'CINEMATIC') v = maxVisual(v, 'CINEMATIC');
  if (motion === 'SPATIAL') v = maxVisual(v, world ? 'SPATIAL_WORLD' : 'CINEMATIC');
  const image = explicitImageWorld(selection);
  if (image === 'EDITORIAL_COLLAGE' || image === 'ILLUSTRATIVE' || image === 'MIXED_MEDIA') v = maxVisual(v, 'BESPOKE_EDITORIAL');
  if (image === 'GENERATIVE') v = maxVisual(v, 'GENERATIVE_ASSET_HEAVY');
  if (image === 'SPATIAL_3D') v = maxVisual(v, world ? 'SPATIAL_WORLD' : 'CINEMATIC');
  if (world) {
    const depth = selection.world?.depth ?? 'LAYERED';
    v = maxVisual(v, depth === 'FLAT' ? 'BESPOKE_EDITORIAL' : depth === 'LAYERED' ? 'CINEMATIC' : 'SPATIAL_WORLD');
  }
  return v;
}

export type LevelReason = { reason: string; requires: BuildLevel };

/** The lowest build level that honours every choice, with the reason for each step up. */
export function deriveBuildLevel(selection: BuilderSelection): { level: BuildLevel; reasons: LevelReason[] } {
  const reasons: LevelReason[] = [];
  const parts = buildParts(selection);
  if (parts.includes('WORLD')) reasons.push({ reason: 'A world is designed as a place, not a set of pages.', requires: 'ADVANCED' });
  if (parts.includes('SYSTEM')) reasons.push({ reason: 'A working system has signed-in roles and live data.', requires: 'ADVANCED' });
  if (parts.length > 1) reasons.push({ reason: 'A hybrid joins more than one kind of place.', requires: 'ADVANCED' });
  if (selection.structure === 'HYBRID') reasons.push({ reason: 'Two structural grammars in one build.', requires: 'ADVANCED' });
  const article = (level: BuildLevel) => (level === 'ADVANCED' ? 'an advanced' : 'a custom');
  const levelFor = (features: FeatureId[]): BuildLevel =>
    features.reduce<BuildLevel>((acc, id) => {
      const allowed = FEATURE_BY_ID[id].allowedBuildTypes;
      return maxLevel(acc, allowed.includes('SIMPLE') ? 'SIMPLE' : allowed.includes('ADVANCED') ? 'ADVANCED' : 'CUSTOM');
    }, 'SIMPLE');
  // Name the client's verb, not the estimator feature, so the reason reads in the client's own words.
  for (const id of effectiveCapabilities(selection)) {
    const requires = levelFor(CAPABILITY_BY_ID[id].features);
    if (requires !== 'SIMPLE') reasons.push({ reason: `${CAPABILITY_BY_ID[id].verb} is part of ${article(requires)} build.`, requires });
  }
  const influences = expressionInfluences(selection);
  if (selection.expression.primary === 'CUSTOM') reasons.push({ reason: 'A custom creative direction is designed from first principles.', requires: 'CUSTOM' });
  if (influences.length >= 2) reasons.push({ reason: 'Three or more visual systems together become a custom direction.', requires: 'CUSTOM' });
  else if (influences.length === 1) reasons.push({ reason: 'A secondary influence blends two systems.', requires: 'ADVANCED' });
  if (selection.expression.edition === 'FULL') reasons.push({ reason: 'The full edition develops the system for this project.', requires: 'ADVANCED' });
  const motion = effectiveMotion(selection);
  if (selection.motion !== 'SYSTEM_DEFAULT' && motion !== 'QUIET' && motion !== 'EDITORIAL') {
    reasons.push({ reason: `${motion.toLowerCase()} motion is designed for the project.`, requires: 'ADVANCED' });
  }
  const image = explicitImageWorld(selection);
  if (image && IMAGE_WORLDS.find((item) => item.id === image)?.scopeHint !== 'NONE') {
    reasons.push({ reason: 'This image world is made for the project.', requires: 'ADVANCED' });
  }
  if (selection.viewports === 'ADAPTIVE') reasons.push({ reason: 'Layouts that change role by device are designed per device.', requires: 'ADVANCED' });
  const level = reasons.reduce<BuildLevel>((acc, item) => maxLevel(acc, item.requires), 'SIMPLE');
  return { level, reasons };
}

/** Experiences the structure and capabilities call for, with depth defaulted by build level. */
export function recommendedExperiences(selection: BuilderSelection, level: BuildLevel): ExperienceChoice[] {
  const ids = new Set<ExperienceId>();
  for (const structure of [selection.structure, selection.structureSecondary]) {
    if (structure) STRUCTURE_BY_ID[structure].starterExperiences.forEach((id) => ids.add(id));
  }
  if (selection.build === 'SYSTEM' && !selection.structure) STRUCTURE_BY_ID.PORTAL.starterExperiences.forEach((id) => ids.add(id));
  for (const id of effectiveCapabilities(selection)) CAPABILITY_BY_ID[id].addsExperiences.forEach((exp) => ids.add(exp));
  const depth = level === 'SIMPLE' ? 'ESSENTIAL' : 'FULL';
  return [...ids].map((id) => ({ id, depth }));
}

export function chosenExperiences(selection: BuilderSelection, level: BuildLevel): ExperienceChoice[] {
  return selection.experiences ?? recommendedExperiences(selection, level);
}

export function builderNotices(selection: BuilderSelection): BuilderNotice[] {
  const notices: BuilderNotice[] = [];
  const chosen = new Set(selection.capabilities);
  for (const id of effectiveCapabilities(selection)) {
    if (chosen.has(id)) continue;
    notices.push({ id: `comes-with-${id}`, kind: 'COMES_WITH', message: `${CAPABILITY_BY_ID[id].verb} comes with this choice: ${CAPABILITY_BY_ID[id].plain}` });
  }
  const { reasons } = deriveBuildLevel(selection);
  for (const item of reasons) {
    if (item.requires === 'SIMPLE') continue;
    notices.push({ id: `level-${item.reason}`, kind: selection.keepItSimple ? 'NEEDS_DECISION' : 'RAISES_LEVEL', message: item.reason, requires: item.requires });
  }
  const effective = new Set(effectiveCapabilities(selection));
  if (effective.has('PAYMENTS') && !effective.has('SELL') && !effective.has('BOOK') && !effective.has('MEMBERSHIP') && !effective.has('MARKETPLACE')) {
    notices.push({ id: 'payments-for-what', kind: 'NEEDS_DECISION', message: 'What will people pay for? Choose SELL, BOOK or MEMBERSHIP, or keep payments for invoices only.' });
  }
  if (selection.brand === 'NEEDS_IDENTITY') {
    notices.push({ id: 'identity-first', kind: 'ROUTES_TO', message: 'Your brand comes first. IDNTY builds it as its own project; this estimate does not include it.' });
  }
  if (selection.color === 'CUSTOM_BRAND_LED' && selection.brand === 'NEEDS_IDENTITY') {
    notices.push({ id: 'brand-colours-need-brand', kind: 'NEEDS_DECISION', message: 'Brand-led colour needs a brand. Choose a colour direction for now, or wait for IDNTY.' });
  }
  if (selection.build === 'SITE' && selection.capabilities.includes('WORLD')) {
    notices.push({ id: 'site-plus-world', kind: 'ROUTES_TO', message: 'A world inside your site makes this a hybrid build. The world steps open.' });
  }
  if (expressionInfluences(selection).length >= 2) {
    notices.push({ id: 'many-systems', kind: 'ROUTES_TO', message: 'You are drawing on three or more systems. That becomes a custom creative direction.' });
  }
  for (const part of selection.expression.likedParts) {
    if (expressionInfluences(selection).includes(part.system) || part.system === selection.expression.primary) continue;
    notices.push({ id: `noted-${part.system}-${part.facet}`, kind: 'NOTED', message: `Noted for the creative team: the ${part.facet.toLowerCase()} of ${EXPRESSION_BY_ID[part.system].label}.` });
  }
  const primary = primarySystem(selection);
  if (primary && selection.structure && selection.structure !== 'HYBRID' && !STRUCTURE_BY_ID[selection.structure].compatibleExpressions.includes(primary)) {
    notices.push({ id: 'unusual-pairing', kind: 'UNUSUAL_PAIRING', message: `${EXPRESSION_BY_ID[primary].label} is an unusual pairing with ${STRUCTURE_BY_ID[selection.structure].label}. It can work; the creative team will check it at Blueprint.` });
  }
  if (selection.experiences) {
    for (const choice of selection.experiences) {
      const needs = EXPERIENCE_BY_ID[choice.id].needsCapability;
      if (needs && !effective.has(needs)) {
        notices.push({ id: `exp-needs-${choice.id}`, kind: 'NEEDS_DECISION', message: `${EXPERIENCE_BY_ID[choice.id].label} needs ${CAPABILITY_BY_ID[needs].verb}. Add it, or remove the experience.` });
      }
    }
  }
  return notices;
}

/** Progressive disclosure: the steps this client walks, and the ones they can open if they want. */
export function builderSteps(selection: BuilderSelection): { primary: BuilderStepId[]; optional: BuilderStepId[] } {
  const parts = buildParts(selection);
  const { level } = deriveBuildLevel(selection);
  const primary: BuilderStepId[] = ['BUILD'];
  if (!selection.build || parts.includes('SITE') || parts.includes('SYSTEM')) primary.push('STRUCTURE');
  if (parts.includes('WORLD')) primary.push('WORLD');
  primary.push('BRAND', 'EXPRESSION');
  const tune: BuilderStepId[] = ['TYPE', 'COLOR', 'IMAGE_WORLD', 'MOTION'];
  const tuneOpen = level !== 'SIMPLE' || selection.expression.edition === 'FULL' || selection.expression.primary === 'CUSTOM' || tunedCount(selection) > 0;
  if (tuneOpen) primary.push(...tune);
  primary.push('FEATURES', 'FAMILIES', 'DELIVERY', 'BLUEPRINT', 'ESTIMATE');
  return { primary, optional: tuneOpen ? [] : tune };
}
