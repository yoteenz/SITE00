/**
 * P0.VR.EXPERIENCE-EXPRESSION-PROMPT-ORCHESTRATION-AND-PACKAGING1
 *
 * PROMPT COUNT ≠ OUTPUT COUNT. Modular state prompts → packaging planner → 2–5 FAL outputs (+ BASE inherit).
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import {
  decomposeNdxbookOverviewExperiencePrompts,
  isNdxbookOverviewExperiencePage,
  planNdxbookOverviewExperiencePackaging,
} from './ndxbookOverviewExperienceExpressionContentSpec.js';

export const PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION = 'page-experience-expression-fal-v2-modular';

export type ExpressionPromptType =
  | 'BASE_PAGE_AT_REST'
  | 'MENU_EXPANDED_NAV'
  | 'PANEL_OR_DRAWER'
  | 'OVERLAY_OR_DETAIL_STATE'
  | 'COMBINED_STATE';

export type ExperienceOutputLabel =
  | 'BASE PAGE'
  | 'MENU / EXPANDED NAV'
  | 'PANEL / DRAWER'
  | 'OVERLAY / DETAIL'
  | 'ENTRY DETAIL / PANEL'
  | 'PROJECT ACCESS / OVERLAY'
  | 'COMBINED STATE';

export type ExperienceExpressionPrompt = {
  id: string;
  authorityId: string;
  conceptId: string;
  route: string;
  expressionType: ExpressionPromptType;
  promptText: string;
  preserveBlock: string;
  changeBlock: string;
  outputIntent: string;
  combinableWith: readonly ExpressionPromptType[];
  priority: number;
  primaryGoal: string;
  interactionSurface: string;
  antiDriftRules: readonly string[];
  /** NDXBOOK / page-specific review label */
  outputLabel?: ExperienceOutputLabel;
  /** Stable state id for packaging + single-state regeneration */
  stateId?: string;
};

export type CombinedExpressionGroup = {
  id: string;
  groupedExpressionTypes: readonly ExpressionPromptType[];
  rationale: string;
  expectedOutputCount: number;
  label: ExperienceOutputLabel;
  stateId: string;
};

export type ExperiencePackagingPlan = {
  authorityId: string;
  conceptId: string;
  candidatePrompts: readonly ExperienceExpressionPrompt[];
  groupedOutputs: readonly CombinedExpressionGroup[];
  totalRequestedOutputs: number;
  totalPlannedOutputs: number;
  packagingReasoning: string;
  promptVersion: string;
};

export type ExperienceOutputLineage = {
  outputStateId: string;
  label: ExperienceOutputLabel;
  packagingMode: 'SINGLE' | 'COMBINED';
  sourceExpressionTypes: readonly ExpressionPromptType[];
  sourcePromptIds: readonly string[];
  conceptId: string;
  authorityId: string;
};

export type ExperienceExpressionFalTarget = {
  stateId: string;
  label: ExperienceOutputLabel;
  patternType: ExperienceExpressionVisualState['patternType'];
  prompt: string;
  packagingMode: 'SINGLE' | 'COMBINED';
  sourceExpressionTypes: readonly ExpressionPromptType[];
  sourcePromptIds: readonly string[];
  lineage: ExperienceOutputLineage;
};

const MIN_FAL_OUTPUTS = 1;
const MAX_FAL_OUTPUTS = 4;
const MAX_TOTAL_EXPERIENCE_OUTPUTS = 5;

const ANTI_DRIFT_SHARED: readonly string[] = [
  'No redesign of the approved concept.',
  'No new page territory.',
  'No invented bottom navigation.',
  'No phone chrome or browser chrome.',
  'No letterboxing.',
  'No floating behavior text on screen.',
  'No presentation board in place of real UI states.',
  'No generic app-menu or dashboard drift.',
];

function behaviorBlob(functionContract: PageFunctionContract): string {
  return [...functionContract.regions, ...functionContract.interactions, ...functionContract.immutableBehaviors]
    .join(' ')
    .toLowerCase();
}

function labelForType(type: ExpressionPromptType): ExperienceOutputLabel {
  switch (type) {
    case 'BASE_PAGE_AT_REST':
      return 'BASE PAGE';
    case 'MENU_EXPANDED_NAV':
      return 'MENU / EXPANDED NAV';
    case 'PANEL_OR_DRAWER':
      return 'PANEL / DRAWER';
    case 'OVERLAY_OR_DETAIL_STATE':
      return 'OVERLAY / DETAIL';
    case 'COMBINED_STATE':
      return 'COMBINED STATE';
  }
}

function patternForType(type: ExpressionPromptType): ExperienceExpressionVisualState['patternType'] {
  switch (type) {
    case 'MENU_EXPANDED_NAV':
      return 'MENU';
    case 'PANEL_OR_DRAWER':
      return 'DRAWER';
    case 'OVERLAY_OR_DETAIL_STATE':
      return 'MODAL';
    case 'COMBINED_STATE':
      return 'EXPANDED_PANEL';
    default:
      return 'EXPANDED_PANEL';
  }
}

export function buildExperienceSharedInheritanceBlock(input: {
  route: string;
  conceptId: string;
  authorityId: string;
  territoryLabel: string;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  functionContract: PageFunctionContract;
}): string {
  return [
    'SHARED AUTHORITY INHERITANCE (identical for every expression prompt)',
    `TARGET ROUTE: ${input.route}`,
    `APPROVED AUTHORITY / CONCEPT ID: ${input.conceptId}`,
    `EXPERIENCE AUTHORITY ID: ${input.authorityId}`,
    `PAGE IDENTITY: ${input.functionContract.route} · regions: ${input.functionContract.regions.join(' · ')}`,
    `BRAND / CONTEXT: ${input.cgptBrief.creativePremise.slice(0, 280)}`,
    `CONCEPT TERRITORY: ${input.territoryLabel}`,
    `SKIN CONTRACT: ${input.skinContract.version} · ${input.skinContract.brandSignals.slice(0, 4).join(' · ')}`,
    'PRESERVE: typography, composition language, imagery treatment, bottom navigation function, shell rules, hierarchy, materials, tone.',
    `IMMUTABLE BEHAVIORS: ${input.functionContract.immutableBehaviors.join(' · ')}`,
    `FORBIDDEN DRIFT: ${input.skinContract.forbiddenDrift.join(' · ')}`,
  ].join('\n');
}

function assemblePromptText(sections: {
  sharedBlock: string;
  expressionType: ExpressionPromptType;
  primaryGoal: string;
  preserveBlock: string;
  changeBlock: string;
  interactionSurface: string;
  stateContentRequirements: string;
  outputFraming: string;
}): string {
  return [
    'SITE 00 — MODULAR EXPERIENCE EXPRESSION (FAL edit from approved mobile authority reference)',
    sections.sharedBlock,
    '',
    `EXPRESSION TYPE: ${sections.expressionType}`,
    `PRIMARY GOAL: ${sections.primaryGoal}`,
    'WHAT MUST REMAIN UNCHANGED:',
    sections.preserveBlock,
    'WHAT IS ALLOWED TO CHANGE:',
    sections.changeBlock,
    'SPECIFIC INTERACTION SURFACE TO SHOW:',
    sections.interactionSurface,
    'STATE CONTENT REQUIREMENTS:',
    sections.stateContentRequirements,
    'ANTI-DRIFT RULES:',
    ...ANTI_DRIFT_SHARED.map((r) => `- ${r}`),
    'OUTPUT FRAMING RULES:',
    sections.outputFraming,
  ].join('\n');
}

function makePrompt(
  input: {
    authorityId: string;
    conceptId: string;
    route: string;
    sharedBlock: string;
    expressionType: ExpressionPromptType;
    primaryGoal: string;
    preserveBlock: string;
    changeBlock: string;
    interactionSurface: string;
    stateContentRequirements: string;
    outputFraming: string;
    combinableWith: ExpressionPromptType[];
    priority: number;
  },
  index: number,
): ExperienceExpressionPrompt {
  const promptText = assemblePromptText(input);
  assertModularPromptContract(promptText, input.expressionType);
  return {
    id: `eeprompt-${input.expressionType.toLowerCase()}-${index}`,
    authorityId: input.authorityId,
    conceptId: input.conceptId,
    route: input.route,
    expressionType: input.expressionType,
    promptText,
    preserveBlock: input.preserveBlock,
    changeBlock: input.changeBlock,
    outputIntent: input.primaryGoal,
    combinableWith: input.combinableWith,
    priority: input.priority,
    primaryGoal: input.primaryGoal,
    interactionSurface: input.interactionSurface,
    antiDriftRules: ANTI_DRIFT_SHARED,
  };
}

/** Reject legacy single essay-style experience prompts (no modular sections). */
export function assertModularPromptContract(promptText: string, expressionType: ExpressionPromptType): void {
  if (expressionType === 'BASE_PAGE_AT_REST') return;
  const required = [
    'EXPRESSION TYPE:',
    'PRIMARY GOAL:',
    'WHAT MUST REMAIN UNCHANGED:',
    'WHAT IS ALLOWED TO CHANGE:',
    'SHARED AUTHORITY INHERITANCE',
  ];
  for (const token of required) {
    if (!promptText.includes(token)) {
      throw new Error(`EXPERIENCE_BROAD_PROMPT_REJECTED: missing ${token}`);
    }
  }
  if (
    promptText.includes('EXPERIENCE EXPRESSION (same page, approved mobile authority as visual anchor)') &&
    !promptText.includes('EXPRESSION TYPE:')
  ) {
    throw new Error('EXPERIENCE_BROAD_PROMPT_REJECTED: legacy v1 essay prompt');
  }
}

export function decomposeExperienceExpressionPrompts(input: {
  authorityId: string;
  conceptId: string;
  route: string;
  territoryLabel: string;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
}): readonly ExperienceExpressionPrompt[] {
  const blob = behaviorBlob(input.functionContract);
  const sharedBlock = buildExperienceSharedInheritanceBlock({
    route: input.route,
    conceptId: input.conceptId,
    authorityId: input.authorityId,
    territoryLabel: input.territoryLabel,
    skinContract: input.skinContract,
    cgptBrief: input.cgptBrief,
    functionContract: input.functionContract,
  });

  const preserveBlock = [
    'Underlying page layout, hero/content hierarchy, brand materials, type scale, color logic, bottom nav labels and placement.',
    'All content regions from the approved mobile authority screenshot.',
  ].join(' ');

  const outputFraming =
    'Single mobile portrait UI screen (9:16), production-quality, no device frame, no browser chrome, real in-page UI state — not a wireframe or text summary.';

  const prompts: ExperienceExpressionPrompt[] = [];
  let idx = 0;

  prompts.push(
    makePrompt(
      {
        authorityId: input.authorityId,
        conceptId: input.conceptId,
        route: input.route,
        sharedBlock,
        expressionType: 'BASE_PAGE_AT_REST',
        primaryGoal: 'Anchor resting/default page state — reference only (inherit approved mobile image).',
        preserveBlock: 'Entire approved authority frame.',
        changeBlock: 'Nothing — this is the visual anchor.',
        interactionSurface: 'Default closed/resting navigation and panels.',
        stateContentRequirements: 'Match approved mobile authority exactly.',
        outputFraming,
        combinableWith: [],
        priority: 0,
      },
      idx++,
    ),
  );

  if (/menu|nav|dropdown/.test(blob)) {
    prompts.push(
      makePrompt(
        {
          authorityId: input.authorityId,
          conceptId: input.conceptId,
          route: input.route,
          sharedBlock,
          expressionType: 'MENU_EXPANDED_NAV',
          primaryGoal: 'Show primary navigation or menu expanded on this exact page.',
          preserveBlock,
          changeBlock: 'Only navigation/menu layer opens; page content remains visibly the same concept beneath.',
          interactionSurface: 'Primary nav, menu drawer, or dropdown expanded with real labels from the page function map.',
          stateContentRequirements: 'Expanded nav must be readable and clearly attached to this page — not a generic app menu.',
          outputFraming,
          combinableWith: ['PANEL_OR_DRAWER'],
          priority: 10,
        },
        idx++,
      ),
    );
  }

  if (/drawer|sheet|panel|slide|inspect|detail/.test(blob)) {
    prompts.push(
      makePrompt(
        {
          authorityId: input.authorityId,
          conceptId: input.conceptId,
          route: input.route,
          sharedBlock,
          expressionType: 'PANEL_OR_DRAWER',
          primaryGoal: 'Show contextual panel, drawer, or expandable content surface open on this page.',
          preserveBlock,
          changeBlock: 'Open one panel/drawer/sheet with plausible content; base page identity remains visible where appropriate.',
          interactionSurface: 'Bottom sheet, side panel, or inline expandable region tied to page interactions.',
          stateContentRequirements: 'Panel content must match page purpose — no placeholder lorem dashboards.',
          outputFraming,
          combinableWith: ['MENU_EXPANDED_NAV'],
          priority: 20,
        },
        idx++,
      ),
    );
  }

  if (/modal|dialog|popup|overlay|confirm|inspect/.test(blob)) {
    prompts.push(
      makePrompt(
        {
          authorityId: input.authorityId,
          conceptId: input.conceptId,
          route: input.route,
          sharedBlock,
          expressionType: 'OVERLAY_OR_DETAIL_STATE',
          primaryGoal: 'Show modal, overlay, inspect, or focused detail layer on this page.',
          preserveBlock,
          changeBlock: 'Add focused overlay/modal/detail with editorial scrim if needed; preserve shell and hierarchy cues.',
          interactionSurface: 'Modal dialog, overlay card, inspect/detail surface, or confirmation layer.',
          stateContentRequirements: 'Overlay must relate to a real interaction on this route — not abstract UX diagram.',
          outputFraming,
          combinableWith: [],
          priority: 30,
        },
        idx++,
      ),
    );
  }

  const interactive = prompts.filter((p) => p.expressionType !== 'BASE_PAGE_AT_REST');
  if (interactive.length === 0) {
    prompts.push(
      makePrompt(
        {
          authorityId: input.authorityId,
          conceptId: input.conceptId,
          route: input.route,
          sharedBlock,
          expressionType: 'PANEL_OR_DRAWER',
          primaryGoal: 'Show one representative expanded/interactive state for this page.',
          preserveBlock,
          changeBlock: 'Open one clear supporting surface (panel or overlay) without changing territory.',
          interactionSurface: 'Single expandable region appropriate to the function map.',
          stateContentRequirements: 'One legible interactive state only.',
          outputFraming,
          combinableWith: [],
          priority: 15,
        },
        idx++,
      ),
    );
  }

  return prompts;
}

function canCombine(a: ExperienceExpressionPrompt, b: ExperienceExpressionPrompt): boolean {
  if (a.expressionType === 'OVERLAY_OR_DETAIL_STATE' || b.expressionType === 'OVERLAY_OR_DETAIL_STATE') {
    return false;
  }
  return a.combinableWith.includes(b.expressionType) || b.combinableWith.includes(a.expressionType);
}

export function planExperienceExpressionPackaging(input: {
  authorityId: string;
  conceptId: string;
  candidatePrompts: readonly ExperienceExpressionPrompt[];
}): ExperiencePackagingPlan {
  const falCandidates = input.candidatePrompts
    .filter((p) => p.expressionType !== 'BASE_PAGE_AT_REST')
    .sort((a, b) => a.priority - b.priority);

  const totalRequestedOutputs = falCandidates.length;
  let grouped: CombinedExpressionGroup[] = [];
  const used = new Set<string>();

  const singles = (): CombinedExpressionGroup[] =>
    falCandidates.map((p, i) => ({
      id: `pkg-single-${p.expressionType}-${i}`,
      groupedExpressionTypes: [p.expressionType],
      rationale: `Dedicated output for ${p.expressionType} — maximum clarity for tablet/desktop inheritance.`,
      expectedOutputCount: 1,
      label: labelForType(p.expressionType),
      stateId: stateIdForGroup([p.expressionType], i),
    }));

  if (falCandidates.length <= MAX_FAL_OUTPUTS) {
    grouped = singles();
  } else {
    let slot = 0;
    for (let i = 0; i < falCandidates.length && grouped.length < MAX_FAL_OUTPUTS; i++) {
      const a = falCandidates[i]!;
      if (used.has(a.id)) continue;
      const b = falCandidates[i + 1];
      if (b && !used.has(b.id) && canCombine(a, b) && grouped.length < MAX_FAL_OUTPUTS - 1) {
        used.add(a.id);
        used.add(b.id);
        grouped.push({
          id: `pkg-combined-${slot}`,
          groupedExpressionTypes: [a.expressionType, b.expressionType],
          rationale: `Combined ${a.expressionType} + ${b.expressionType} in one legible screen to stay within output budget.`,
          expectedOutputCount: 1,
          label: 'COMBINED STATE',
          stateId: stateIdForGroup([a.expressionType, b.expressionType], slot++),
        });
        i++;
        continue;
      }
      used.add(a.id);
      grouped.push({
        id: `pkg-single-${slot}`,
        groupedExpressionTypes: [a.expressionType],
        rationale: `Separate output — not combinable or budget allows discrete state.`,
        expectedOutputCount: 1,
        label: labelForType(a.expressionType),
        stateId: stateIdForGroup([a.expressionType], slot++),
      });
    }
  }

  while (grouped.length < MIN_FAL_OUTPUTS && falCandidates.length > 0) {
    grouped = singles().slice(0, MIN_FAL_OUTPUTS);
    break;
  }

  const totalPlannedOutputs = grouped.length;
  const totalWithBase = totalPlannedOutputs + 1;
  if (totalWithBase > MAX_TOTAL_EXPERIENCE_OUTPUTS) {
    grouped = grouped.slice(0, MAX_TOTAL_EXPERIENCE_OUTPUTS - 1);
  }

  const packagingReasoning = [
    `Decomposed ${input.candidatePrompts.length} modular prompts (${totalRequestedOutputs} FAL-eligible).`,
    `Planned ${grouped.length} FAL image(s) + 1 inherited BASE PAGE (max ${MAX_TOTAL_EXPERIENCE_OUTPUTS} total).`,
    grouped.some((g) => g.groupedExpressionTypes.length > 1) ?
      'Used combined-state grouping where compatible to reduce redundancy.'
    : 'Kept states separate for clarity — no unnecessary combining.',
  ].join(' ');

  return {
    authorityId: input.authorityId,
    conceptId: input.conceptId,
    candidatePrompts: input.candidatePrompts,
    groupedOutputs: grouped,
    totalRequestedOutputs,
    totalPlannedOutputs: grouped.length,
    packagingReasoning,
    promptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
  };
}

function stateIdForGroup(types: readonly ExpressionPromptType[], index: number): string {
  if (types.length === 1) {
    const t = types[0]!;
    if (t === 'MENU_EXPANDED_NAV') return 'menu';
    if (t === 'PANEL_OR_DRAWER') return 'drawer';
    if (t === 'OVERLAY_OR_DETAIL_STATE') return 'overlay';
    return `expr-${index}`;
  }
  return `combined-${types.map((t) => t.replace(/_/g, '').slice(0, 6)).join('-')}-${index}`;
}

function mergePromptsForGroup(
  prompts: readonly ExperienceExpressionPrompt[],
  group: CombinedExpressionGroup,
): string {
  const members = group.groupedExpressionTypes.flatMap((type) =>
    prompts.filter((p) => p.expressionType === type),
  );
  if (members.length === 1) return members[0]!.promptText;
  const shared = members[0]!.promptText.split('EXPRESSION TYPE:')[0];
  const goals = members.map((m) => `- ${m.expressionType}: ${m.primaryGoal}`).join('\n');
  const surfaces = members.map((m) => `- ${m.interactionSurface}`).join('\n');
  return [
    shared.trim(),
    '',
    `EXPRESSION TYPE: COMBINED_STATE`,
    `PRIMARY GOAL: Show ${group.groupedExpressionTypes.join(' + ')} in one legible mobile screen.`,
    'WHAT MUST REMAIN UNCHANGED:',
    members[0]!.preserveBlock,
    'WHAT IS ALLOWED TO CHANGE:',
    members.map((m) => m.changeBlock).join(' '),
    'SPECIFIC INTERACTION SURFACES TO SHOW (both must remain readable):',
    surfaces,
    'STATE CONTENT REQUIREMENTS:',
    goals,
    'ANTI-DRIFT RULES:',
    ...ANTI_DRIFT_SHARED.map((r) => `- ${r}`),
    'OUTPUT FRAMING RULES:',
    'Single mobile portrait UI — both grouped states visible without confusion; not a collage board.',
  ].join('\n');
}

export function buildExperienceExpressionFalTargetsFromPlan(
  plan: ExperiencePackagingPlan,
): readonly ExperienceExpressionFalTarget[] {
  const prompts = plan.candidatePrompts;
  return plan.groupedOutputs.map((group) => {
    const prompt = mergePromptsForGroup(prompts, group);
    assertModularPromptContract(prompt, group.groupedExpressionTypes.length > 1 ? 'COMBINED_STATE' : group.groupedExpressionTypes[0]!);
    const sourcePromptIds = group.groupedExpressionTypes.flatMap((type) =>
      prompts.filter((p) => p.expressionType === type).map((p) => p.id),
    );
    const lineage: ExperienceOutputLineage = {
      outputStateId: group.stateId,
      label: group.label,
      packagingMode: group.groupedExpressionTypes.length > 1 ? 'COMBINED' : 'SINGLE',
      sourceExpressionTypes: group.groupedExpressionTypes,
      sourcePromptIds,
      conceptId: plan.conceptId,
      authorityId: plan.authorityId,
    };
    return {
      stateId: group.stateId,
      label: group.label,
      patternType: patternForType(group.groupedExpressionTypes[group.groupedExpressionTypes.length - 1]!),
      prompt,
      packagingMode: lineage.packagingMode,
      sourceExpressionTypes: group.groupedExpressionTypes,
      sourcePromptIds,
      lineage,
    };
  });
}

export function buildExperienceExpressionPromptPipeline(input: {
  projectId: string;
  pageId?: string;
  screenId?: string;
  authorityId: string;
  conceptId: string;
  mobileArtifactId: string;
  route: string;
  territoryLabel: string;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
}): { plan: ExperiencePackagingPlan; falTargets: readonly ExperienceExpressionFalTarget[] } {
  const useNdxbook = isNdxbookOverviewExperiencePage({
    projectId: input.projectId,
    route: input.route,
    pageId: input.pageId,
    screenId: input.screenId,
  });

  const candidatePrompts =
    useNdxbook ?
      decomposeNdxbookOverviewExperiencePrompts({
        authorityId: input.authorityId,
        conceptId: input.conceptId,
        mobileArtifactId: input.mobileArtifactId,
        route: input.route,
        territoryLabel: input.territoryLabel,
        skinContract: input.skinContract,
        cgptBrief: input.cgptBrief,
        injection: input.injection,
        functionContract: input.functionContract,
      })
    : decomposeExperienceExpressionPrompts(input);

  const plan =
    useNdxbook ?
      planNdxbookOverviewExperiencePackaging({
        authorityId: input.authorityId,
        conceptId: input.conceptId,
        candidatePrompts,
      })
    : planExperienceExpressionPackaging({
        authorityId: input.authorityId,
        conceptId: input.conceptId,
        candidatePrompts,
      });

  const falTargets = buildExperienceExpressionFalTargetsFromPlan(plan);
  return { plan, falTargets };
}

export function experienceExpressionOutputCount(visualStates: readonly ExperienceExpressionVisualState[]): number {
  return visualStates.filter((v) => v.previewImageUri).length;
}

