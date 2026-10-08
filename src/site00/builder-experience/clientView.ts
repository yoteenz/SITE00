/**
 * Client-facing views over the canonical estimator: live scope signal, the assembled Blueprint, and the estimate.
 *
 * Every figure comes from `estimateProject` + `toClientBlueprintEstimate`. This file only chooses words and
 * decides what to show. It never shows family units, raw weeks, lanes or decimal weeks.
 */
import { estimateProject } from '../../studioos/estimation/engine';
import { toClientBlueprintEstimate } from '../../studioos/estimation/clientContract';
import { VISUAL_SYSTEM_BY_ID } from '../../studioos/estimation/registries';
import type {
  ClientBlueprintEstimate,
  DependencyEdge,
  ProjectEstimateConfig,
  ProjectEstimateResult,
} from '../../studioos/estimation/types';
import { ESTIMATOR_VERSION } from '../../studioos/estimation/version';
import {
  BUILD_KINDS,
  CAPABILITY_BY_ID,
  COLOR_DIRECTIONS,
  CONFIDENCE_LABELS,
  DELIVERY_COPY,
  DOCUMENT_LABELS,
  EXPERIENCE_BY_ID,
  EXPERIENCE_DEPTHS,
  EXPRESSION_BY_ID,
  IMAGE_WORLDS,
  MOTION_CHARACTERS,
  SCOPE_SIGNAL_COPY,
  STRUCTURE_BY_ID,
  TYPE_DIRECTIONS,
  WORLD_FORMS,
} from './registry';
import {
  buildParts,
  builderNotices,
  chosenExperiences,
  deriveBuildLevel,
  effectiveCapabilities,
  effectiveMotion,
  expressionInfluences,
} from './rules';
import { toEstimateConfig } from './toEstimateConfig';
import type { BuilderNotice, BuilderSelection, EstimateStage, ScopeSignal } from './types';

/**
 * Recommended product rule (founder decision F4): offer priority only when the estimator says the extra capacity
 * actually shortens this project. Otherwise priority is shown as not available and nothing is charged for it.
 */
export const PRIORITY_REQUIRES_FEASIBLE_COMPRESSION = true;

function run(config: ProjectEstimateConfig): ProjectEstimateResult {
  const outcome = estimateProject(config);
  if (!outcome.ok) throw new Error(`Builder produced an invalid estimator config: ${outcome.errors.join(' ')}`);
  return outcome.result;
}

const BAND_TO_SIGNAL: Record<string, ScopeSignal> = {
  SIMPLE: 'LIGHT',
  STANDARD: 'MODERATE',
  ADVANCED: 'DEEP',
  'LARGE PRODUCT / PORTAL': 'EXPANSIVE',
  'WORLD / SPATIAL': 'EXPANSIVE',
  'SITE + WORLD + SYSTEMS': 'EXPANSIVE',
};

const LEVEL_LABEL = { SIMPLE: 'SIMPLE BUILD', ADVANCED: 'ADVANCED BUILD', CUSTOM: 'CUSTOM BUILD' } as const;

/** Range strings come from the canonical formatter. A collapsed range ("$3K–$3K") reads as one figure. */
export function readableRange(range: string): string {
  const [low, high] = range.split('–');
  return high && low === high ? `AROUND ${low}` : range;
}

/* ─────────────────────────────── live scope signal (no money, no dates) ─────────────────────────────── */

export type ScopeSignalView = {
  signal: ScopeSignal;
  plain: string;
  buildLevel: (typeof LEVEL_LABEL)[keyof typeof LEVEL_LABEL];
  customDirection: boolean;
  world: boolean;
};

export function builderScopeSignal(selection: BuilderSelection): ScopeSignalView {
  const config = toEstimateConfig(selection, 'SELF_SERVE', 'STANDARD');
  const result = run(config);
  const signal = BAND_TO_SIGNAL[result.complexityBand] ?? 'DEEP';
  return {
    signal,
    plain: SCOPE_SIGNAL_COPY[signal],
    buildLevel: LEVEL_LABEL[config.buildLevel],
    customDirection: selection.expression.primary === 'CUSTOM' || expressionInfluences(selection).length >= 2,
    world: buildParts(selection).includes('WORLD'),
  };
}

export type ScopeImpact = { size: 'NONE' | 'SMALL' | 'MEDIUM' | 'LARGE'; signalBefore: ScopeSignal; signalAfter: ScopeSignal; levelChanges: boolean };

/** "How does this change affect scope?" in words, by asking the estimator about both versions. */
export function scopeImpact(current: BuilderSelection, next: BuilderSelection): ScopeImpact {
  const a = run(toEstimateConfig(current, 'SELF_SERVE', 'STANDARD'));
  const b = run(toEstimateConfig(next, 'SELF_SERVE', 'STANDARD'));
  const delta = (b.familyUnits - a.familyUnits) / Math.max(a.familyUnits, 1);
  const size = Math.abs(delta) < 0.05 ? 'NONE' : Math.abs(delta) < 0.15 ? 'SMALL' : Math.abs(delta) < 0.35 ? 'MEDIUM' : 'LARGE';
  return {
    size,
    signalBefore: BAND_TO_SIGNAL[a.complexityBand] ?? 'DEEP',
    signalAfter: BAND_TO_SIGNAL[b.complexityBand] ?? 'DEEP',
    levelChanges: deriveBuildLevel(current).level !== deriveBuildLevel(next).level,
  };
}

/* ─────────────────────────────── 11 Blueprint ─────────────────────────────── */

export type BlueprintLine = { key: string; label: string; value: string | null; fromSystem?: boolean; open?: boolean };

export type BlueprintView = {
  title: 'PROJECT BLUEPRINT';
  lines: BlueprintLine[];
  experiences: { group: string; items: { label: string; depth: string }[] }[];
  capabilities: { verb: string; comesWith: boolean }[];
  decisions: BuilderNotice[];
  notes: BuilderNotice[];
  scope: ScopeSignalView;
  complete: boolean;
};

export function builderBlueprint(selection: BuilderSelection): BlueprintView {
  const { level } = deriveBuildLevel(selection);
  const parts = buildParts(selection);
  const primary = selection.expression.primary;
  const system = primary && primary !== 'CUSTOM' ? EXPRESSION_BY_ID[primary] : null;
  const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((item) => item.id === id)?.label ?? null;
  const tuned = (value: string, def: string | undefined, list: readonly { id: string; label: string }[]): BlueprintLine['value'] =>
    value === 'SYSTEM_DEFAULT' ? (def ? label(list, def) : null) : label(list, value);
  const lines: BlueprintLine[] = [
    { key: 'BUILD', label: 'BUILD TYPE', value: selection.build ? (selection.build === 'HYBRID' ? `HYBRID · ${parts.join(' + ')}` : BUILD_KINDS.find((b) => b.id === selection.build)!.label) : null },
    { key: 'LEVEL', label: 'BUILD LEVEL', value: LEVEL_LABEL[level] },
  ];
  if (!selection.build || parts.includes('SITE') || parts.includes('SYSTEM')) {
    const structure = selection.structure ? STRUCTURE_BY_ID[selection.structure].label : null;
    const second = selection.structureSecondary ? ` + ${STRUCTURE_BY_ID[selection.structureSecondary].label}` : '';
    lines.push({ key: 'STRUCTURE', label: 'STRUCTURE', value: structure ? `${structure}${second}` : null });
  }
  if (parts.includes('WORLD')) {
    lines.push({ key: 'WORLD', label: 'WORLD FORM', value: selection.world ? label(WORLD_FORMS, selection.world.form) : null });
  }
  const influences = expressionInfluences(selection);
  lines.push({
    key: 'EXPRESSION',
    label: 'VISUAL SYSTEM',
    value: primary === 'CUSTOM'
      ? 'CUSTOM CREATIVE DIRECTION'
      : system
        ? `${system.label}${influences.length ? ` + ${influences.map((id) => VISUAL_SYSTEM_BY_ID[id].label).join(' + ')}` : ''} · ${selection.expression.edition === 'FULL' ? 'FULL EDITION' : 'ESSENTIAL EDITION'}`
        : null,
  });
  lines.push({ key: 'TYPE', label: 'TYPOGRAPHY', value: tuned(selection.type, system?.defaults.type, TYPE_DIRECTIONS), fromSystem: selection.type === 'SYSTEM_DEFAULT' });
  lines.push({ key: 'COLOR', label: 'COLOR DIRECTION', value: tuned(selection.color, system?.defaults.color, COLOR_DIRECTIONS), fromSystem: selection.color === 'SYSTEM_DEFAULT' });
  lines.push({ key: 'IMAGE', label: 'IMAGE WORLD', value: tuned(selection.imageWorld, system?.defaults.imageWorld, IMAGE_WORLDS), fromSystem: selection.imageWorld === 'SYSTEM_DEFAULT' });
  lines.push({ key: 'MOTION', label: 'MOTION', value: system || selection.motion !== 'SYSTEM_DEFAULT' ? label(MOTION_CHARACTERS, effectiveMotion(selection)) : null, fromSystem: selection.motion === 'SYSTEM_DEFAULT' });
  lines.push({ key: 'DELIVERY', label: 'DELIVERY', value: DELIVERY_COPY[selection.delivery].label });
  for (const line of lines) line.open = line.value === null;

  const groups = new Map<string, { label: string; depth: string }[]>();
  for (const choice of chosenExperiences(selection, level)) {
    const exp = EXPERIENCE_BY_ID[choice.id];
    const list = groups.get(exp.group) ?? [];
    list.push({ label: exp.label, depth: EXPERIENCE_DEPTHS.find((d) => d.id === choice.depth)!.label });
    groups.set(exp.group, list);
  }
  const chosen = new Set(selection.capabilities);
  const notices = builderNotices(selection);
  return {
    title: 'PROJECT BLUEPRINT',
    lines,
    experiences: [...groups].map(([group, items]) => ({ group, items })),
    capabilities: effectiveCapabilities(selection).map((id) => ({ verb: CAPABILITY_BY_ID[id].verb, comesWith: !chosen.has(id) })),
    decisions: notices.filter((n) => n.kind === 'NEEDS_DECISION'),
    notes: notices.filter((n) => n.kind !== 'NEEDS_DECISION'),
    scope: builderScopeSignal(selection),
    complete: lines.every((line) => !line.open) && !notices.some((n) => n.kind === 'NEEDS_DECISION'),
  };
}

/* ─────────────────────────────── 12 Estimate ─────────────────────────────── */

const DEPENDENCY_COPY: Record<string, string> = {
  'BRAND LOCK→VISUAL SYSTEM': 'Your brand is settled before the visual system is finalised.',
  'AUTH→ACCOUNT FAMILY': 'Sign-in is built before the account areas that use it.',
  'DATABASE→DASHBOARD': 'Your information is defined before dashboards show it.',
  'PARENT AUTHORITY→DESCENDANTS': 'Each main experience is approved before its detail views are produced.',
  'WORLD MASTER→ZONES': 'The overall world is approved before individual places are built.',
  'INTEGRATION CONTRACT→LAUNCH': 'Launch waits on the outside systems you connect.',
};

function dependencyCopy(edge: DependencyEdge): string {
  return DEPENDENCY_COPY[`${edge.from}→${edge.to}`] ?? `${edge.from.toLowerCase()} comes before ${edge.to.toLowerCase()}.`;
}

export type DeliveryOptionView = { window: string; investment: string };

export type BuilderEstimateView = {
  document: string;
  confidence: { label: string; plain: string };
  binding: false;
  notAQuote: string;
  buildKind: string;
  buildLevel: string;
  scope: ScopeSignalView;
  productionWindow: string;
  investment: string;
  delivery: {
    selected: string;
    standard: DeliveryOptionView;
    priority: (DeliveryOptionView & { available: true; sooner: string; whyNotHalf: string }) | { available: false; reason: string };
  };
  included: {
    experiences: string[];
    capabilities: string[];
    direction: string;
    reviews: string;
  };
  dependencies: string[];
  assumptions: string[];
  timelineNote: string;
  whatHappensNext: string[];
  notices: BuilderNotice[];
  reference: string;
};

function priorityView(selection: BuilderSelection, stage: EstimateStage, standard: ProjectEstimateResult): BuilderEstimateView['delivery']['priority'] {
  const config = toEstimateConfig(selection, stage, 'PRIORITY');
  const result = run(config);
  if (PRIORITY_REQUIRES_FEASIBLE_COMPRESSION && !result.priorityFeasible) {
    return { available: false, reason: DELIVERY_COPY.PRIORITY.notAvailable };
  }
  const client = toClientBlueprintEstimate(config, result);
  const soonerPct = Math.max(0, Math.floor(((1 - result.expectedWeeks / standard.expectedWeeks) * 100) / 5) * 5);
  return {
    available: true,
    window: client.productionWindow,
    investment: readableRange(client.investmentRange),
    sooner: `ABOUT ${soonerPct}% SOONER`,
    whyNotHalf: DELIVERY_COPY.PRIORITY.whyNotHalf,
  };
}

export function builderEstimateView(selection: BuilderSelection, stage: EstimateStage = 'SELF_SERVE'): BuilderEstimateView {
  const standardConfig = toEstimateConfig(selection, stage, 'STANDARD');
  const standard = run(standardConfig);
  const standardClient = toClientBlueprintEstimate(standardConfig, standard);
  const priority = priorityView(selection, stage, standard);
  const usePriority = selection.delivery === 'PRIORITY' && priority.available;
  const selectedConfig = usePriority ? toEstimateConfig(selection, stage, 'PRIORITY') : standardConfig;
  const selectedClient: ClientBlueprintEstimate = usePriority ? toClientBlueprintEstimate(selectedConfig, run(selectedConfig)) : standardClient;
  const { level } = deriveBuildLevel(selection);
  const confidence = CONFIDENCE_LABELS[selectedClient.confidence];
  const notices = builderNotices(selection);
  if (selection.delivery === 'PRIORITY' && !priority.available) {
    notices.push({ id: 'priority-not-available', kind: 'NOT_AVAILABLE', message: DELIVERY_COPY.PRIORITY.notAvailable });
  }
  const primary = selection.expression.primary;
  const assumptions = [
    'Your window assumes reviews and content arrive on time.',
    selection.content === 'READY' ? 'Your copy and images are ready when production starts.' : 'Some copy or images are still to come. The window starts counting from when they arrive.',
    selection.brand === 'READY' ? 'Your brand is final.' : selection.brand === 'IN_PROGRESS' ? 'Your brand is still settling. The visual system follows it.' : 'Your brand is built first through IDNTY. It is not part of this range.',
    buildParts(selection).includes('WORLD') ? 'World estimates are refined during Blueprint review.' : '',
    'Changes to scope after Blueprint review produce a new estimate.',
  ].filter(Boolean);
  return {
    document: DOCUMENT_LABELS.ESTIMATE,
    confidence,
    binding: false,
    notAQuote: 'This is a projected estimate. It is not a quote and not a schedule.',
    buildKind: selection.build ?? 'NOT CHOSEN',
    buildLevel: LEVEL_LABEL[level],
    scope: builderScopeSignal(selection),
    productionWindow: selectedClient.productionWindow,
    investment: readableRange(selectedClient.investmentRange),
    delivery: {
      selected: DELIVERY_COPY[usePriority ? 'PRIORITY' : selection.delivery === 'CUSTOM_SCHEDULE' ? 'CUSTOM_SCHEDULE' : 'STANDARD'].label,
      standard: { window: standardClient.productionWindow, investment: readableRange(standardClient.investmentRange) },
      priority,
    },
    included: {
      experiences: chosenExperiences(selection, level).map((c) => EXPERIENCE_BY_ID[c.id].label),
      capabilities: effectiveCapabilities(selection).map((id) => CAPABILITY_BY_ID[id].verb),
      direction: primary === 'CUSTOM'
        ? 'A custom creative direction, developed with you.'
        : 'Three creative directions developed from your choices, then one refined with you.',
      reviews: `${selectedConfig.reviewRounds} review rounds at each major approval point: creative direction, and the built experience before launch.`,
    },
    dependencies: run(selectedConfig).dependencies.map(dependencyCopy),
    assumptions,
    timelineNote: `Your window assumes each review comes back within ${selectedConfig.clientReviewSlaDays} business days. When a review or content arrives later, the window moves by the same amount.`,
    whatHappensNext: [
      'Send your Blueprint to SITE 00.',
      'A Blueprint review with SITE 00 refines the scope and the range.',
      'You receive a quote for the reviewed Blueprint.',
      'Creative direction begins once the quote is accepted.',
      'A production schedule is issued when scope is locked.',
    ],
    notices,
    reference: `Estimate reference v${ESTIMATOR_VERSION}`,
  };
}
