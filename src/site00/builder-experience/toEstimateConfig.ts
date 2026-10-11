/**
 * Client selection → canonical estimator config.
 *
 * This is a pure translation onto the estimator's own enums (`ProjectEstimateConfig`). It contains no weights,
 * rates or calendar logic. Review rounds and the review SLA come from `DEFAULT_ASSUMPTIONS`. Every number the
 * client eventually sees is computed by `estimateProject`.
 */
import { DEFAULT_ASSUMPTIONS } from '../../studioos/estimation/assumptions';
import type {
  ConfidenceLevel,
  FamilyInput,
  InhabitantComplexity,
  NavigationComplexity,
  ProjectEstimateConfig,
  ResponsiveMode,
  RiskFlagId,
  ThreeDAssetLoad,
  WorldScopeInput,
} from '../../studioos/estimation/types';
import { EXPERIENCE_BY_ID, EXPERIENCE_DEPTHS } from './registry';
import {
  buildParts,
  chosenExperiences,
  deriveBuildLevel,
  effectiveFeatures,
  effectiveProjectType,
  visualComplexityFor,
} from './rules';
import type {
  BuilderSelection,
  EstimateStage,
  ExperienceChoice,
  ExperienceDepth,
  ViewportChoice,
  WorldChange,
  WorldDepth,
  WorldInhabitants,
  WorldMoments,
  WorldPlaces,
  WorldSelection,
  WorldThingsToDo,
  WorldWayfinding,
} from './types';

/** Placeholder world used for an estimate before the client has shaped their world. Shown as NOT CHOSEN. */
export const DEFAULT_WORLD_SELECTION: WorldSelection = {
  form: 'ESTATE',
  places: 'FEW',
  moments: 'FEW',
  thingsToDo: 'LOOK',
  inhabitants: 'NONE',
  change: 'STILL',
  depth: 'LAYERED',
  wayfinding: 'GUIDED_PATH',
};

/** Human world choices → estimator world-scope inputs. Counts are representative points inside each band. */
export const WORLD_INPUT_MAP = {
  places: { FEW: 4, SEVERAL: 8, MANY: 13 } satisfies Record<WorldPlaces, number>,
  moments: { FEW: 4, MANY: 10, CINEMATIC: 20 } satisfies Record<WorldMoments, number>,
  thingsToDo: { LOOK: 3, TOUCH: 10, PLAY: 24 } satisfies Record<WorldThingsToDo, number>,
  inhabitants: { NONE: 'NONE', GUIDES: 'LIGHT', CHARACTERS: 'STANDARD', CROWDS: 'HEAVY' } satisfies Record<WorldInhabitants, InhabitantComplexity>,
  change: { STILL: 1, TIME_OF_DAY: 3, LIVING: 8 } satisfies Record<WorldChange, number>,
  depth: { FLAT: 'NONE', LAYERED: 'LIGHT', DIMENSIONAL: 'STANDARD', FULLY_3D: 'HEAVY' } satisfies Record<WorldDepth, ThreeDAssetLoad>,
  wayfinding: { GUIDED_PATH: 'SIMPLE', FREE_ROAM: 'STANDARD', BOTH: 'ADVANCED' } satisfies Record<WorldWayfinding, NavigationComplexity>,
} as const;

export const VIEWPORT_MAP: Record<ViewportChoice, ResponsiveMode> = {
  PHONE_FIRST: 'MOBILE_ONLY',
  PHONE_AND_DESKTOP: 'MOBILE_DESKTOP',
  PHONE_TABLET_DESKTOP: 'MOBILE_TABLET_DESKTOP',
  ADAPTIVE: 'MULTI_VIEWPORT_ADVANCED',
};

export const STAGE_CONFIDENCE: Record<EstimateStage, ConfidenceLevel> = {
  SELF_SERVE: 'EARLY',
  FOUNDER_REVIEWED: 'BLUEPRINT',
  SCOPE_LOCKED: 'LOCKED',
};

/** Front-door experiences share one family: a family is not a page. Views each front-door experience adds. */
const FRONT_DOOR_VIEWS: Record<ExperienceDepth, number> = { ESSENTIAL: 1, FULL: 2, EXTENSIVE: 4 };
const DEPTH_ORDER: ExperienceDepth[] = ['ESSENTIAL', 'FULL', 'EXTENSIVE'];

export function experiencesToFamilies(choices: ExperienceChoice[]): FamilyInput[] {
  const frontDoor = choices.filter((choice) => EXPERIENCE_BY_ID[choice.id].group === 'FRONT DOOR');
  const rest = choices.filter((choice) => EXPERIENCE_BY_ID[choice.id].group !== 'FRONT DOOR');
  const families: FamilyInput[] = [];
  if (frontDoor.length) {
    const deepest = frontDoor.reduce<ExperienceDepth>((acc, c) => (DEPTH_ORDER.indexOf(c.depth) > DEPTH_ORDER.indexOf(acc) ? c.depth : acc), 'ESSENTIAL');
    families.push({
      id: 'front-door',
      label: `Front door (${frontDoor.map((c) => EXPERIENCE_BY_ID[c.id].label).join(', ')})`,
      familyClass: deepest === 'EXTENSIVE' ? 'STANDARD' : 'LIGHT',
      descendantCount: frontDoor.reduce((sum, c) => sum + FRONT_DOOR_VIEWS[c.depth], 0),
    });
  }
  for (const choice of rest) {
    const exp = EXPERIENCE_BY_ID[choice.id];
    families.push({
      id: exp.id.toLowerCase(),
      label: exp.label,
      familyClass: exp.familyClass,
      descendantCount: EXPERIENCE_DEPTHS.find((d) => d.id === choice.depth)!.descendantCount,
    });
  }
  return families;
}

function worldScope(world: WorldSelection): WorldScopeInput {
  return {
    archetypeId: world.form,
    zoneCount: WORLD_INPUT_MAP.places[world.places],
    sceneCount: WORLD_INPUT_MAP.moments[world.moments],
    interactionCount: WORLD_INPUT_MAP.thingsToDo[world.thingsToDo],
    inhabitantComplexity: WORLD_INPUT_MAP.inhabitants[world.inhabitants],
    stateCount: WORLD_INPUT_MAP.change[world.change],
    threeDAssetLoad: WORLD_INPUT_MAP.depth[world.depth],
    navigationComplexity: WORLD_INPUT_MAP.wayfinding[world.wayfinding],
  };
}

export function toEstimateConfig(
  selection: BuilderSelection,
  stage: EstimateStage = 'SELF_SERVE',
  deliveryOverride?: ProjectEstimateConfig['deliveryMode'],
): ProjectEstimateConfig {
  const parts = buildParts(selection);
  const world = parts.includes('WORLD');
  const { level } = deriveBuildLevel(selection);
  const siteFamilies = parts.some((part) => part === 'SITE' || part === 'SYSTEM') || !selection.build
    ? experiencesToFamilies(chosenExperiences(selection, level))
    : [];
  const risks: RiskFlagId[] = [];
  if (selection.brand !== 'READY') risks.push('BRAND_NOT_FINAL');
  if (selection.content !== 'READY') risks.push('CLIENT_CONTENT_PENDING');
  const primary = selection.expression.primary;
  return {
    projectType: effectiveProjectType(selection),
    buildLevel: level,
    structuralArchetype: parts.includes('SITE') || parts.includes('SYSTEM') || !selection.build
      ? selection.structure ?? (selection.build === 'SYSTEM' ? 'PORTAL' : null)
      : null,
    visualSystemId: primary && primary !== 'CUSTOM' ? primary : null,
    visualComplexity: visualComplexityFor(selection),
    families: siteFamilies,
    systems: [],
    featureIds: effectiveFeatures(selection),
    responsiveMode: world ? 'SPATIAL_RESPONSIVE' : VIEWPORT_MAP[selection.viewports],
    worldScopes: world ? [worldScope(selection.world ?? DEFAULT_WORLD_SELECTION)] : [],
    identityScope: selection.brand === 'NEEDS_IDENTITY' ? 'SEPARATE' : 'NONE',
    deliveryMode: deliveryOverride ?? selection.delivery,
    reviewRounds: DEFAULT_ASSUMPTIONS.defaultReviewRounds,
    clientReviewSlaDays: DEFAULT_ASSUMPTIONS.clientReviewSlaDays,
    confidenceLevel: STAGE_CONFIDENCE[stage],
    documentKind: 'ESTIMATE',
    riskFlags: risks,
    manualModifiers: [],
  };
}
