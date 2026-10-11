import { DEFAULT_ASSUMPTIONS, type EstimatorAssumptions } from './assumptions';
import {
  FEATURE_BY_ID,
  REFERENCE_BANDS,
  STRUCTURAL_ARCHETYPES,
  VISUAL_SYSTEM_BY_ID,
  WORLD_BY_ID,
} from './registries';
import type {
  DependencyEdge,
  EstimateOutcome,
  FamilyBreakdownLine,
  FamilyClass,
  FamilyInput,
  FeatureId,
  ManualOverride,
  PhaseEstimate,
  ProjectEstimateConfig,
  ProjectEstimateResult,
  RiskFlagId,
  WorldScopeInput,
} from './types';
import { ESTIMATOR_VERSION } from './version';

const FAMILY_CLASSES = new Set<FamilyClass>(['LIGHT', 'STANDARD', 'ADVANCED', 'SYSTEM', 'WORLD']);

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function descendantBand(count: number, assumptions: EstimatorAssumptions) {
  return assumptions.descendantBands.find((band) => count <= band.max) ?? assumptions.descendantBands[assumptions.descendantBands.length - 1];
}

function hasFeature(config: ProjectEstimateConfig, id: FeatureId): boolean {
  return config.featureIds.includes(id);
}

function heavyIntegration(config: ProjectEstimateConfig): boolean {
  return (
    hasFeature(config, 'ECOMMERCE') ||
    hasFeature(config, 'PAYMENTS') ||
    hasFeature(config, 'THIRD_PARTY_INTEGRATION') ||
    hasFeature(config, 'DATA_MIGRATION') ||
    hasFeature(config, 'MARKETPLACE')
  );
}

export function validateConfig(config: ProjectEstimateConfig): string[] {
  const errors: string[] = [];
  if (!config.projectType) errors.push('Project type is required.');
  if (!config.buildLevel) errors.push('Build level is required.');
  if (config.reviewRounds < 0) errors.push('Review rounds cannot be negative.');
  if (config.clientReviewSlaDays < 0) errors.push('Client review SLA cannot be negative.');
  const ids = new Set<string>();
  for (const family of config.families) {
    if (ids.has(family.id)) errors.push(`Family ${family.id} is listed twice.`);
    ids.add(family.id);
    if (!FAMILY_CLASSES.has(family.familyClass)) errors.push(`Family ${family.id} has an unknown class.`);
    if (!Number.isFinite(family.descendantCount) || family.descendantCount < 0) {
      errors.push(`Family ${family.id} has an invalid descendant count.`);
    }
  }
  for (const featureId of config.featureIds) {
    if (!FEATURE_BY_ID[featureId]) errors.push(`Unknown feature ${featureId}.`);
  }
  for (const world of config.worldScopes) {
    if (!WORLD_BY_ID[world.archetypeId]) errors.push(`Unknown world archetype ${world.archetypeId}.`);
    if (world.zoneCount < 0 || world.sceneCount < 0 || world.interactionCount < 0 || world.stateCount < 0) {
      errors.push('World counts cannot be negative.');
    }
  }
  if (config.visualSystemId && !VISUAL_SYSTEM_BY_ID[config.visualSystemId]) {
    errors.push('Unknown visual system.');
  }
  for (const override of config.manualModifiers) {
    if (!override.reason.trim()) errors.push('A founder override needs a reason.');
    if (!override.author.trim()) errors.push('A founder override needs an author.');
    if (!override.timestamp) errors.push('A founder override needs a timestamp.');
  }
  return errors;
}

function applyFamilyClassOverrides(families: FamilyInput[], overrides: ManualOverride[]): FamilyInput[] {
  return families.map((family) => {
    const hit = overrides.find((item) => item.field === 'familyClass' && item.targetId === family.id);
    if (!hit) return family;
    const next = String(hit.value) as FamilyClass;
    if (!FAMILY_CLASSES.has(next)) return family;
    return { ...family, familyClass: next };
  });
}

function worldFu(scope: WorldScopeInput, assumptions: EstimatorAssumptions): number {
  const archetype = WORLD_BY_ID[scope.archetypeId];
  const weights = assumptions.worldWeights;
  return (
    archetype.baseFu +
    scope.zoneCount * weights.zone +
    scope.sceneCount * weights.scene +
    scope.interactionCount * weights.interaction +
    scope.stateCount * weights.state +
    weights.inhabitant[scope.inhabitantComplexity] +
    weights.threeD[scope.threeDAssetLoad] +
    weights.navigation[scope.navigationComplexity]
  );
}

export function calculateFamilyUnits(
  config: ProjectEstimateConfig,
  assumptions: EstimatorAssumptions = DEFAULT_ASSUMPTIONS,
): { total: number; lines: FamilyBreakdownLine[]; customScopeRequired: boolean; featureFu: number; worldFu: number; systemFu: number } {
  const families = applyFamilyClassOverrides(config.families, config.manualModifiers);
  const visualFraction = assumptions.visualFraction[config.visualComplexity];
  const responsiveFraction = assumptions.responsiveFraction[config.responsiveMode];
  let customScopeRequired = false;
  const lines: FamilyBreakdownLine[] = families.map((family) => {
    const base = assumptions.classWeights[family.familyClass];
    const band = descendantBand(family.descendantCount, assumptions);
    if (band.customScopeRequired) customScopeRequired = true;
    const visual = base * visualFraction;
    const responsive = base * responsiveFraction;
    return {
      id: family.id,
      label: family.label,
      familyClass: family.familyClass,
      baseFu: round2(base),
      descendantModifierFu: round2(band.fu),
      responsiveFu: round2(responsive),
      visualFu: round2(visual),
      totalFu: round2(base + band.fu + visual + responsive),
      customScopeRequired: Boolean(band.customScopeRequired),
    };
  });
  const familySum = lines.reduce((sum, line) => sum + line.totalFu, 0);
  const featureFu = config.featureIds.reduce((sum, id) => sum + (FEATURE_BY_ID[id]?.productionFu ?? 0), 0);
  const world = config.worldScopes.reduce((sum, scope) => sum + worldFu(scope, assumptions), 0);
  const worldVisual = world * visualFraction;
  const worldResponsive = world * responsiveFraction;
  const worldTotal = world + worldVisual + worldResponsive;
  const systemFu = config.systems.length * assumptions.classWeights.SYSTEM;
  return {
    total: round2(familySum + featureFu + worldTotal + systemFu),
    lines,
    customScopeRequired,
    featureFu: round2(featureFu),
    worldFu: round2(worldTotal),
    systemFu: round2(systemFu),
  };
}

function collectRisks(config: ProjectEstimateConfig, customScopeRequired: boolean): RiskFlagId[] {
  const risks = new Set<RiskFlagId>(config.riskFlags);
  if (customScopeRequired) risks.add('LARGE_DESCENDANT_TREE');
  if (hasFeature(config, 'GENERATED_ASSET_SYSTEM') || config.visualComplexity === 'GENERATIVE_ASSET_HEAVY') {
    risks.add('HEAVY_GENERATIVE_ASSETS');
  }
  if (config.worldScopes.length > 0 || config.projectType === 'WORLD') risks.add('WORLD_COMPLEXITY');
  if (hasFeature(config, 'USER_ROLES')) risks.add('MULTI_ROLE_PERMISSIONS');
  if (hasFeature(config, 'THIRD_PARTY_INTEGRATION')) {
    risks.add('THIRD_PARTY_APPROVAL');
    risks.add('CUSTOM_INTEGRATION');
  }
  if (hasFeature(config, 'DATA_MIGRATION')) risks.add('MIGRATION_COMPLEXITY');
  return [...risks];
}

function dependencies(config: ProjectEstimateConfig): DependencyEdge[] {
  const edges: DependencyEdge[] = [
    { from: 'BRAND LOCK', to: 'VISUAL SYSTEM', serial: true, note: 'Expression follows the brand lock.' },
  ];
  if (hasFeature(config, 'AUTH_ACCOUNT')) {
    edges.push({ from: 'AUTH', to: 'ACCOUNT FAMILY', serial: true, note: 'Account surfaces follow auth.' });
  }
  if (hasFeature(config, 'DATABASE') && hasFeature(config, 'DASHBOARDS')) {
    edges.push({ from: 'DATABASE', to: 'DASHBOARD', serial: true, note: 'Dashboards follow the data contract.' });
  }
  if (config.families.some((family) => family.descendantCount > 0)) {
    edges.push({ from: 'PARENT AUTHORITY', to: 'DESCENDANTS', serial: true, note: 'Children follow the parent authority.' });
  }
  if (config.worldScopes.length > 0) {
    edges.push({ from: 'WORLD MASTER', to: 'ZONES', serial: true, note: 'Zones follow the world master.' });
  }
  if (heavyIntegration(config)) {
    edges.push({ from: 'INTEGRATION CONTRACT', to: 'LAUNCH', serial: true, note: 'Launch waits on the integration.' });
  }
  return edges;
}

function laneCap(config: ProjectEstimateConfig, risks: RiskFlagId[], requested: number): number {
  const streams = 1 + Math.floor(config.families.length / 5) + (config.worldScopes.length > 0 ? 1 : 0) + (config.systems.length > 2 ? 1 : 0);
  let cap = Math.min(requested, Math.max(1, streams));
  if (risks.includes('CUSTOM_INTEGRATION') || risks.includes('MIGRATION_COMPLEXITY') || risks.includes('THIRD_PARTY_APPROVAL')) {
    cap = Math.min(cap, 2);
  }
  return Math.max(1, cap);
}

function phases(config: ProjectEstimateConfig, assumptions: EstimatorAssumptions, productionWeeks: number): PhaseEstimate[] {
  const integration = heavyIntegration(config) ? assumptions.phaseFloors.integrationHeavy : assumptions.phaseFloors.integrationBase;
  return [
    { id: '01', label: 'INCEPTION', minimumWeeks: assumptions.phaseFloors.inception, estimatedWeeks: assumptions.phaseFloors.inception, parallelizable: false, clientDependency: true, studioDependency: true },
    { id: '02', label: 'BLUEPRINT', minimumWeeks: assumptions.phaseFloors.blueprint, estimatedWeeks: assumptions.phaseFloors.blueprint, parallelizable: false, clientDependency: true, studioDependency: true },
    { id: '03', label: 'AUTHORITY DEVELOPMENT', minimumWeeks: 0.6, estimatedWeeks: Math.max(0.6, productionWeeks * 0.2), parallelizable: true, clientDependency: true, studioDependency: true },
    { id: '04', label: 'PRODUCTION', minimumWeeks: 0, estimatedWeeks: Math.max(0, productionWeeks * 0.45), parallelizable: true, clientDependency: false, studioDependency: true },
    { id: '05', label: 'INTEGRATION', minimumWeeks: integration, estimatedWeeks: integration, parallelizable: false, clientDependency: false, studioDependency: true },
    { id: '06', label: 'RESPONSIVE QA', minimumWeeks: 0.3, estimatedWeeks: Math.max(0.3, productionWeeks * 0.1), parallelizable: true, clientDependency: false, studioDependency: true },
    { id: '07', label: 'FINAL QA', minimumWeeks: assumptions.phaseFloors.finalQa, estimatedWeeks: assumptions.phaseFloors.finalQa, parallelizable: false, clientDependency: false, studioDependency: true },
    { id: '08', label: 'CLIENT REVIEW', minimumWeeks: 0, estimatedWeeks: (config.reviewRounds * config.clientReviewSlaDays) / 5, parallelizable: false, clientDependency: true, studioDependency: false },
    { id: '09', label: 'LAUNCH', minimumWeeks: assumptions.phaseFloors.launch, estimatedWeeks: assumptions.phaseFloors.launch, parallelizable: false, clientDependency: true, studioDependency: true },
  ];
}

function phaseSerialFloor(config: ProjectEstimateConfig, assumptions: EstimatorAssumptions): number {
  const integration = heavyIntegration(config) ? assumptions.phaseFloors.integrationHeavy : assumptions.phaseFloors.integrationBase;
  return assumptions.phaseFloors.inception + assumptions.phaseFloors.blueprint + assumptions.phaseFloors.finalQa + assumptions.phaseFloors.launch + integration;
}

function complexityBand(config: ProjectEstimateConfig, totalFu: number): string {
  if (config.projectType === 'HYBRID') return 'SITE + WORLD + SYSTEMS';
  if (config.projectType === 'WORLD' || totalFu >= 30) return 'WORLD / SPATIAL';
  if (config.projectType === 'SYSTEM' || totalFu >= 22) return 'LARGE PRODUCT / PORTAL';
  if (totalFu >= 14) return 'ADVANCED';
  if (totalFu >= 7) return 'STANDARD';
  return 'SIMPLE';
}

function referenceBand(config: ProjectEstimateConfig, totalFu: number) {
  let match = 'SIMPLE_SITE';
  if (config.projectType === 'HYBRID') match = 'HYBRID';
  else if (config.projectType === 'WORLD') match = 'WORLD';
  else if (config.projectType === 'SYSTEM' || totalFu >= 22) match = 'LARGE_PRODUCT';
  else if (config.buildLevel === 'CUSTOM' || totalFu >= 14) match = 'ADVANCED_SITE';
  else if (config.buildLevel === 'ADVANCED' || totalFu >= 7) match = 'STANDARD_SITE';
  const band = REFERENCE_BANDS.find((item) => item.match === match) ?? REFERENCE_BANDS[0];
  return { id: band.id, label: band.label, window: band.window, note: 'Reference band only. The calculator result wins.' };
}

function overrideNumber(overrides: ManualOverride[], field: ManualOverride['field']): number | null {
  const hit = [...overrides].reverse().find((item) => item.field === field);
  if (!hit) return null;
  const value = Number(hit.value);
  return Number.isFinite(value) ? value : null;
}

export function estimateProject(
  config: ProjectEstimateConfig,
  assumptions: EstimatorAssumptions = DEFAULT_ASSUMPTIONS,
): EstimateOutcome {
  const errors = validateConfig(config);
  if (errors.length) return { ok: false, errors };

  const units = calculateFamilyUnits(config, assumptions);
  const risks = collectRisks(config, units.customScopeRequired);
  const fuOverride = overrideNumber(config.manualModifiers, 'familyUnits');
  const calculatedFamilyUnits = units.total;
  const familyUnits = fuOverride ?? calculatedFamilyUnits;
  const rawProductionWeeks = round2(familyUnits * assumptions.familyUnitWeeks);
  const serialFromShare = rawProductionWeeks * assumptions.serialShare;
  const serialWeeks = round2(Math.max(serialFromShare, familyUnits === 0 ? phaseSerialFloor(config, assumptions) : serialFromShare));
  const parallelWeeks = round2(rawProductionWeeks * assumptions.parallelShare);

  const priorityRequested = config.deliveryMode === 'PRIORITY';
  const priorityBlocked = config.manualModifiers.some((item) => item.field === 'priorityFeasible' && item.value === false);
  const requestedLanes = priorityRequested && !priorityBlocked ? assumptions.priorityLanes : assumptions.standardLanes;
  const effectiveLanes = laneCap(config, risks, requestedLanes);
  const priorityFeasible = priorityRequested && !priorityBlocked && effectiveLanes > assumptions.standardLanes;

  const productionElapsed = serialWeeks + (effectiveLanes > 0 ? parallelWeeks / effectiveLanes : parallelWeeks);
  const standardLanes = laneCap(config, risks, assumptions.standardLanes);
  const standardElapsed = serialWeeks + parallelWeeks / standardLanes;
  const priorityCompression = priorityRequested ? round2(1 - productionElapsed / Math.max(standardElapsed, 0.01)) : 0;

  const reviewBufferWeeks = round2((config.reviewRounds * config.clientReviewSlaDays * assumptions.reviewMilestones) / 5);
  let expectedWeeks = productionElapsed + reviewBufferWeeks;
  const timelineOverride = overrideNumber(config.manualModifiers, 'timelineWeeks');
  if (timelineOverride != null) expectedWeeks = timelineOverride;

  const spread = assumptions.confidenceSpread[config.confidenceLevel];
  const riskCount = risks.length;
  const extraWiden = overrideNumber(config.manualModifiers, 'riskWiden') ?? 0;
  const highWiden = Math.min(assumptions.riskWidenCap, riskCount * assumptions.riskWidenHigh + Math.max(0, extraWiden));
  const lowWiden = Math.min(0.2, riskCount * assumptions.riskWidenLow);
  let lowWeeks = expectedWeeks * spread.low * (1 - lowWiden);
  let highWeeks = expectedWeeks * spread.high * (1 + highWiden);
  if (units.customScopeRequired) highWeeks *= 1.15;
  lowWeeks = Math.max(phaseSerialFloor(config, assumptions), lowWeeks);

  const included = assumptions.includedFamilyUnits[config.buildLevel];
  const extraFu = Math.max(0, familyUnits - included);
  const baseBuild = assumptions.buildFloors[config.buildLevel];
  const familyUnitContribution = extraFu * assumptions.dollarsPerFamilyUnit;
  const optionDAddition = config.identityScope === 'HYBRID_OPTION_D' ? assumptions.optionDHybridAddition : 0;
  const priorityMultiplier = priorityRequested ? assumptions.priorityPriceMultiplier : 1;
  let investmentExpected = (baseBuild + familyUnitContribution + optionDAddition) * priorityMultiplier;
  const calculatedInvestmentExpected = round2(investmentExpected);
  const priceOverride = overrideNumber(config.manualModifiers, 'investment');
  if (priceOverride != null) investmentExpected = priceOverride;
  let investmentLow = investmentExpected * spread.low;
  let investmentHigh = investmentExpected * spread.high * (1 + highWiden);
  if (familyUnits === 0) {
    investmentLow = baseBuild;
    investmentExpected = baseBuild;
    investmentHigh = baseBuild * spread.high;
  }

  const assumptionsNotes = [
    `1 family unit is ${assumptions.familyUnitWeeks} weeks of raw production capacity.`,
    `Client review SLA is ${config.clientReviewSlaDays} business days. ${config.reviewRounds} review rounds are included.`,
    'Studio time and client time are separate. A late review moves the calendar.',
    'This is a projected estimate, not a quote and not a locked schedule, unless a founder sets that state explicitly.',
    `The dollar rate per family unit ($${assumptions.dollarsPerFamilyUnit}) is a calibration figure. Simple starts near $3K. Custom starts near $10K. Those floors are not caps.`,
    config.identityScope === 'SEPARATE' ? 'Identity is a separate pre-site offering and is not inside this range.' : 'Identity is not added as a separate package.',
    config.deliveryMode === 'PRIORITY'
      ? 'Priority production reserves capacity. It does not promise half the time.'
      : 'Standard delivery uses the normal lane count.',
    units.customScopeRequired ? 'A family is past 35 descendants. That scope is custom and the high side of the range is open.' : '',
    config.worldScopes.length ? 'World weights are marked calibration-needed. They are not a published world price.' : '',
    config.customScheduleNote ? `Custom schedule: ${config.customScheduleNote}` : '',
    ...config.featureIds
      .filter((id) => FEATURE_BY_ID[id] && !FEATURE_BY_ID[id].allowedBuildTypes.includes(config.buildLevel))
      .map((id) => `${FEATURE_BY_ID[id].label} is outside the usual set for a ${config.buildLevel} build.`),
  ].filter(Boolean);

  const structure = STRUCTURAL_ARCHETYPES.find((item) => item.id === config.structuralArchetype);
  if (structure && config.visualSystemId) {
    const visual = VISUAL_SYSTEM_BY_ID[config.visualSystemId];
    if (visual && !structure.compatibleVisualSystems.includes(visual.id) && structure.id !== 'HYBRID') {
      assumptionsNotes.push(`${visual.label} is not a usual pairing with ${structure.label}.`);
    }
  }

  const result: ProjectEstimateResult = {
    estimatorVersion: ESTIMATOR_VERSION,
    documentKind: config.documentKind,
    bindingQuote: false,
    approvals: {
      foundationApproved: false,
      quoteApproved: false,
      timelineLocked: config.documentKind === 'LOCKED_SCHEDULE',
      clientAccepted: false,
    },
    familyUnits: round2(familyUnits),
    calculatedFamilyUnits: round2(calculatedFamilyUnits),
    rawProductionWeeks: round2(rawProductionWeeks),
    serialWeeks,
    parallelWeeks,
    effectiveLanes,
    priorityCompression,
    priorityFeasible,
    effectiveProductionWeeks: round2(productionElapsed),
    reviewBufferWeeks,
    riskBufferNote: riskCount ? `${riskCount} risk flags widen the high side.` : 'No risk flags.',
    lowWeeks: round2(lowWeeks),
    expectedWeeks: round2(expectedWeeks),
    highWeeks: round2(highWeeks),
    investmentLow: round2(investmentLow),
    investmentExpected: round2(investmentExpected),
    investmentHigh: round2(investmentHigh),
    calculatedInvestmentExpected,
    complexityBand: complexityBand(config, familyUnits),
    deliveryMode: config.deliveryMode,
    confidence: config.confidenceLevel,
    assumptions: assumptionsNotes,
    dependencies: dependencies(config),
    riskFlags: risks,
    breakdown: units.lines,
    phases: phases(config, assumptions, productionElapsed),
    investment: {
      baseBuild,
      familyUnitContribution: round2(familyUnitContribution),
      identityNote: config.identityScope === 'SEPARATE' ? 'Identity stays outside this range.' : 'No separate identity package in this range.',
      optionDAddition,
      priorityMultiplier,
      expectedBeforeRound: calculatedInvestmentExpected,
      calibrationNeeded: true,
    },
    referenceBand: referenceBand(config, familyUnits),
    worldCalibrationNeeded: config.worldScopes.length > 0 || config.projectType === 'WORLD',
    customScopeRequired: units.customScopeRequired,
    overridesApplied: config.manualModifiers,
  };
  return { ok: true, result };
}
