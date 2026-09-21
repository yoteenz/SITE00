/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 — presentation model for the
 * GENERATE PAGE CONCEPTS pop-up.
 *
 * Shell only. Nothing here invokes CGPT, GPT2 or NBP, estimates spend, or
 * mutates production state — it is the founder-facing vocabulary and the
 * geometry contract the panel renders, plus the slot map Composer binds real
 * outputs into. The pop-up is a three-stage editorial wizard, so the stage
 * order, the output promise of each stage and the rendition grouping are
 * described once here rather than duplicated across mobile and desktop
 * compositions.
 */

import type { AiConsoleIconId } from './designAiConsoleIconography.js';

/** Visual states the shell defines treatments for. Wiring belongs to Composer. */
export type PageConceptStageState =
  | 'NOT_STARTED'
  | 'READY'
  | 'ACTIVE'
  | 'COMPLETE'
  | 'PENDING'
  | 'PARTIAL'
  | 'FAILED';

export const PAGE_CONCEPT_STAGE_STATES: readonly PageConceptStageState[] = [
  'NOT_STARTED',
  'READY',
  'ACTIVE',
  'COMPLETE',
  'PENDING',
  'PARTIAL',
  'FAILED',
];

/** Founder-readable label for each state. Uppercase is the panel's only voice. */
export const PAGE_CONCEPT_STATE_LABEL: Record<PageConceptStageState, string> = {
  NOT_STARTED: 'NOT STARTED',
  READY: 'READY',
  ACTIVE: 'RUNNING',
  COMPLETE: 'COMPLETE',
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
};

export const PAGE_CONCEPT_STATE_ICON: Record<PageConceptStageState, AiConsoleIconId> = {
  NOT_STARTED: 'status-not-ready',
  READY: 'status-ready',
  ACTIVE: 'status-generating',
  COMPLETE: 'status-approved',
  PENDING: 'status-pending',
  PARTIAL: 'status-review',
  FAILED: 'status-error',
};

export type PageConceptStageId = 'CGPT' | 'GPT2' | 'NBP';

/** How a stage card reserves space for its result. */
export type PageConceptResultKind = 'BRIEF' | 'AUTHORITY_IMAGE' | 'RENDITION_GROUPS';

export type PageConceptBriefRow = {
  id: string;
  label: string;
  icon: AiConsoleIconId;
  /** Lead row is the stage's headline output line — rendered with lime emphasis. */
  lead?: boolean;
};

export type PageConceptRenditionSlot = {
  /** Slot key Composer binds a rendition to, e.g. `nbp.mobile.a`. */
  id: string;
  label: string;
};

export type PageConceptRenditionGroup = {
  id: 'MOBILE' | 'DESKTOP';
  label: string;
  icon: AiConsoleIconId;
  slots: readonly PageConceptRenditionSlot[];
};

export type PageConceptStageShell = {
  id: PageConceptStageId;
  step: number;
  stepLabel: string;
  tag: string;
  title: string;
  subtitle: string;
  /** Progression caption under the wizard node. */
  progressionTitle: string;
  progressionNote: string;
  resultKind: PageConceptResultKind;
  outputLabel: string;
  outputNote: string;
  icon: AiConsoleIconId;
  /** Slot key Composer binds this stage's primary output into. */
  resultSlotId: string;
  briefRows?: readonly PageConceptBriefRow[];
  renditionGroups?: readonly PageConceptRenditionGroup[];
  /** Number of paging dots the result carousel reserves. */
  pagingDots?: number;
};

export const PAGE_CONCEPT_GENERATOR_TITLE = 'GENERATE PAGE CONCEPTS';

export const PAGE_CONCEPT_GENERATOR_SUMMARY = [
  { id: 'cgpt', count: '1 CGPT', label: 'CREATIVE' },
  { id: 'gpt2', count: '1 GPT2', label: 'AUTHORITY' },
  { id: 'nbp', count: '3 NBP', label: 'RENDITIONS' },
  { id: 'viewports', count: '6 VIEWPORT', label: 'OUTPUTS', note: '(MOBILE + DESKTOP)' },
] as const;

const CGPT_BRIEF_ROWS: readonly PageConceptBriefRow[] = [
  { id: 'page-intelligence', label: 'PAGE INTELLIGENCE', icon: 'opus-context' },
  { id: 'brand-context', label: 'BRAND CONTEXT', icon: 'attach-style' },
  { id: 'key-messages', label: 'KEY MESSAGES', icon: 'auth-cgpt-message' },
  { id: 'visual-moodboard', label: 'VISUAL MOODBOARD', icon: 'attach-image' },
  { id: 'creative-direction', label: 'CREATIVE DIRECTION', icon: 'opus-explore', lead: true },
];

const NBP_GROUPS: readonly PageConceptRenditionGroup[] = [
  {
    id: 'MOBILE',
    label: 'MOBILE (3)',
    icon: 'auth-mobile',
    slots: [
      { id: 'nbp.mobile.a', label: 'A' },
      { id: 'nbp.mobile.b', label: 'B' },
      { id: 'nbp.mobile.c', label: 'C' },
    ],
  },
  {
    id: 'DESKTOP',
    label: 'DESKTOP (3)',
    icon: 'auth-desktop',
    slots: [
      { id: 'nbp.desktop.a', label: 'A' },
      { id: 'nbp.desktop.b', label: 'B' },
      { id: 'nbp.desktop.c', label: 'C' },
    ],
  },
];

export const PAGE_CONCEPT_GENERATOR_STAGES: readonly PageConceptStageShell[] = [
  {
    id: 'CGPT',
    step: 1,
    stepLabel: 'STEP 1',
    tag: 'CGPT',
    title: 'CREATIVE INJECTION',
    subtitle: 'STRATEGY + DIRECTION',
    progressionTitle: 'CGPT CREATIVE INJECTION',
    progressionNote: 'GENERATE CREATIVE DIRECTION, PAGE INTELLIGENCE AND BRAND CONTEXT.',
    resultKind: 'BRIEF',
    outputLabel: 'OUTPUT',
    outputNote: 'STRUCTURED CREATIVE BRIEF AND RECOMMENDATIONS.',
    icon: 'mark-cgpt',
    resultSlotId: 'cgpt.brief',
    briefRows: CGPT_BRIEF_ROWS,
  },
  {
    id: 'GPT2',
    step: 2,
    stepLabel: 'STEP 2',
    tag: 'GPT2',
    title: 'AUTHORITY CONCEPT',
    subtitle: 'SINGLE PAGE CONCEPT',
    progressionTitle: 'GPT2 AUTHORITY CONCEPT',
    progressionNote: 'CREATE A SINGLE, REFINED AUTHORITY CONCEPT FOR THE PAGE.',
    resultKind: 'AUTHORITY_IMAGE',
    outputLabel: 'OUTPUT',
    outputNote: '1 REFINED AUTHORITY PAGE CONCEPT.',
    icon: 'mark-authority',
    resultSlotId: 'gpt2.authorityImage',
  },
  {
    id: 'NBP',
    step: 3,
    stepLabel: 'STEP 3',
    tag: 'NBP',
    title: 'RENDITIONS',
    subtitle: 'MULTI-VIEWPORT OUTPUTS',
    progressionTitle: 'NBP RENDITIONS',
    progressionNote: 'PRODUCE MULTIPLE VIEWPORT RENDERS (MOBILE + DESKTOP) FROM THE CONCEPT.',
    resultKind: 'RENDITION_GROUPS',
    outputLabel: 'OUTPUT',
    outputNote: '3 RENDITION GROUPS (MOBILE + DESKTOP).',
    icon: 'mark-grok',
    resultSlotId: 'nbp.renditions',
    renditionGroups: NBP_GROUPS,
    pagingDots: 5,
  },
];

export const PAGE_CONCEPT_GENERATOR_FOOTER = {
  progressionNote: 'OUTPUTS WILL POPULATE BELOW AS EACH STAGE COMPLETES.',
  spendNote: 'CONFIRM BEFORE SEND.',
  /** Compact mobile footer — display only; full plan line stays on desktop. */
  spendMicroSummary: '1 CGPT + 1 GPT2 + 3 NBP · 6 OUTPUTS',
  generateLabel: 'GENERATE',
  cancelLabel: 'CANCEL',
} as const;

export function pageConceptGeneratorTargetLine(projectLabel: string, pageLabel: string): string {
  return `TARGET · ${projectLabel.toUpperCase()} / ${pageLabel.toUpperCase()}`;
}

/**
 * Default stage states for the untouched shell: stage one is the only
 * actionable thing on screen, the rest wait. Composer replaces this map with
 * real run state.
 */
export const PAGE_CONCEPT_DEFAULT_STAGE_STATE: Record<PageConceptStageId, PageConceptStageState> = {
  CGPT: 'READY',
  GPT2: 'PENDING',
  NBP: 'PENDING',
};

/**
 * Presentation-only projection of the pipeline's run status onto the three
 * stage cards. It reads the status the pipeline already publishes; it never
 * advances, retries or infers anything the pipeline has not reported.
 */
export function pageConceptStageStatesForRun(input: {
  status: string;
  failed?: boolean;
}): Record<PageConceptStageId, PageConceptStageState> {
  const failedStage = (stage: PageConceptStageState): PageConceptStageState =>
    input.failed ? 'FAILED' : stage;

  switch (input.status) {
    case 'CGPT_RUNNING':
      return { CGPT: failedStage('ACTIVE'), GPT2: 'PENDING', NBP: 'PENDING' };
    case 'GPT2_RUNNING':
      return { CGPT: 'COMPLETE', GPT2: failedStage('ACTIVE'), NBP: 'PENDING' };
    case 'NBP_RUNNING':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: failedStage('ACTIVE') };
    case 'PARTIAL_GENERATION':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'PARTIAL' };
    case 'READY_FOR_FOUNDER_REVIEW':
      return { CGPT: 'COMPLETE', GPT2: 'COMPLETE', NBP: 'COMPLETE' };
    case 'FAILED':
      return { CGPT: 'FAILED', GPT2: 'NOT_STARTED', NBP: 'NOT_STARTED' };
    default:
      return input.failed ?
          { CGPT: 'FAILED', GPT2: 'PENDING', NBP: 'PENDING' }
        : PAGE_CONCEPT_DEFAULT_STAGE_STATE;
  }
}

/**
 * Where Composer binds behaviour. The shell renders every one of these slots
 * and leaves them empty — it never fetches, stores or derives their contents.
 */
export const PAGE_CONCEPT_GENERATOR_HOOK_MAP = [
  {
    slot: 'stage.status',
    selector: '[data-stage-id][data-stage-state]',
    binds: 'PageConceptStageState per stage — drives node, chip and card treatment.',
  },
  {
    slot: 'cgpt.brief',
    selector: '[data-result-slot="cgpt.brief"]',
    binds: 'Structured creative brief rows (direction, intelligence, brand, messages, moodboard).',
  },
  {
    slot: 'gpt2.authorityImage',
    selector: '[data-result-slot="gpt2.authorityImage"]',
    binds: 'Single authority concept image plus its source concept caption.',
  },
  {
    slot: 'nbp.renditions',
    selector: '[data-result-slot="nbp.renditions"]',
    binds: 'Mobile A/B/C and desktop A/B/C rendition images, selection and paging index.',
  },
  {
    slot: 'action.generate',
    selector: '[data-interaction-id="page-concepts-generate"]',
    binds: 'Spend confirmation + generation dispatch.',
  },
  {
    slot: 'action.cancel',
    selector: '[data-interaction-id="page-concepts-cancel"]',
    binds: 'Close without dispatch.',
  },
] as const;

export type PageConceptGeneratorNoticeLines = {
  headline: string;
  hint?: string;
};

/** Display-only footer notice copy — does not affect readiness or pipeline. */
export function pageConceptGeneratorNoticeLines(notice: string): PageConceptGeneratorNoticeLines {
  const raw = notice.trim();
  if (!raw) return { headline: '' };
  if (
    raw === 'BLOCKED_NO_SOURCE_CAPTURE' ||
    raw === 'BLOCKED_NO_MOBILE_CAPTURE' ||
    raw === 'BLOCKED_NO_DESKTOP_CAPTURE' ||
    /missing implementation source capture/i.test(raw) ||
    /implementation source capture missing/i.test(raw) ||
    /capture the current mobile/i.test(raw) ||
    /capture the current desktop/i.test(raw)
  ) {
    const mobileOnly = /mobile page before generating/i.test(raw) || raw === 'BLOCKED_NO_MOBILE_CAPTURE';
    const desktopOnly = /desktop page before generating/i.test(raw) || raw === 'BLOCKED_NO_DESKTOP_CAPTURE';
    return {
      headline: 'BLOCKED · SOURCE CAPTURE REQUIRED',
      hint:
        mobileOnly ? 'CAPTURE THE CURRENT MOBILE PAGE BEFORE GENERATING CONCEPTS'
        : desktopOnly ? 'CAPTURE THE CURRENT DESKTOP PAGE BEFORE GENERATING CONCEPTS'
        : 'CAPTURE THE CURRENT MOBILE + DESKTOP PAGE BEFORE GENERATING CONCEPTS',
    };
  }
  const sentenceBreak = raw.indexOf('. ');
  if (sentenceBreak > 24 && raw.length > 72) {
    return {
      headline: raw.slice(0, sentenceBreak).toUpperCase(),
      hint: raw.slice(sentenceBreak + 2).toUpperCase(),
    };
  }
  return { headline: raw.toUpperCase() };
}

/** Display-only: true when the shell should show the micro plan summary on mobile. */
export function pageConceptGeneratorFootSpendShowsMicroSummary(note: string | null | undefined): boolean {
  if (!note?.trim()) return false;
  return /\d+\s+cgpt/i.test(note) && /gpt2/i.test(note) && /nbp/i.test(note);
}
