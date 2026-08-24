/**
 * P0.5C.4A — NDX Human-Made Mark System + consistency evaluation.
 */

import { randomUUID } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type {
  HandDrawnIconSpec,
  HumanMarkConsistencyEvaluation,
  HumanMadeMarkClass,
  LimeApplicationMode,
  NDXHumanMadeMarkSystem,
  NdxHumanMadeMark,
} from './types.js';
import { HAND_DRAWN_ICON_SUBJECTS } from './constants.js';

const SUBSCRIPTION_OWNERSHIP_ICONS: (typeof HAND_DRAWN_ICON_SUBJECTS)[number][] = [
  'camera',
  'game',
  'blender',
  'printer',
  'car',
  'headphones',
  'watch',
  'TV',
  'tool',
  'laptop',
  'bike',
  'coffee maker',
  'book',
  'luggage',
  'guitar',
];

export function buildHandDrawnIconSet(params: {
  whyDrawn: string;
  subjects?: readonly string[];
  applicationMode?: LimeApplicationMode;
}): HandDrawnIconSpec[] {
  const subjects = params.subjects ?? SUBSCRIPTION_OWNERSHIP_ICONS;
  return subjects.map((subject) => ({
    subject,
    markClass: 'HAND_DRAWN_ICON' as const,
    whyDrawn: params.whyDrawn,
    limeApplied: true as const,
    applicationMode: params.applicationMode ?? 'MARKER',
  }));
}

export function buildNdxHumanMadeMark(params: {
  markClass: HumanMadeMarkClass;
  causality: string;
  semanticPurpose: string;
  applicationMode?: LimeApplicationMode;
  limeApplied?: boolean;
  printedVsApplied?: 'PRINTED' | 'APPLIED';
}): NdxHumanMadeMark {
  return {
    markClass: params.markClass,
    appliedBy: 'NDX',
    applicationMode: params.applicationMode ?? 'MARKER',
    causality: params.causality,
    semanticPurpose: params.semanticPurpose,
    limeApplied: params.limeApplied ?? true,
    printedVsApplied: params.printedVsApplied ?? 'APPLIED',
  };
}

export function buildNdxHumanMadeMarkSystem(params: {
  artifactId: string;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
}): NDXHumanMadeMarkSystem {
  const marks: NdxHumanMadeMark[] = [];
  const makerActions: string[] = [];
  let handDrawnIcons: HandDrawnIconSpec[] = [];

  if (params.topicIndex === 1) {
    handDrawnIcons = buildHandDrawnIconSet({
      whyDrawn:
        'NDX compares things people used to OWN versus things now accessed through subscriptions — quick lime hand-drawn object symbols group ownership categories',
    });
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'CIRCLE',
        causality: 'NDX circled the recurring total after the receipt stack was placed',
        semanticPurpose: 'evidence connection — subscription cost vs owned objects',
      }),
      buildNdxHumanMadeMark({
        markClass: 'MARKER_ARROW',
        causality: 'Arrow connects owned-object column to subscription column',
        semanticPurpose: 'comparison marker',
      }),
      buildNdxHumanMadeMark({
        markClass: 'UNDERLINE',
        causality: 'Underline under the phrase that triggered the comparison',
        semanticPurpose: 'emphasis on the thesis hook',
        applicationMode: 'HIGHLIGHTER',
      }),
    );
    makerActions.push('drew', 'circled', 'connected', 'underlined');
  } else if (params.topicIndex === 2) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'TALLY',
        causality: 'NDX tallied elapsed minutes in margin during timed checkout',
        semanticPurpose: 'time evidence',
        applicationMode: 'INK',
      }),
    );
    makerActions.push('annotated', 'tallied');
  } else if (params.topicIndex === 4) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'CORRECTION_MARK',
        causality: 'Cross-out on prior headline after reassessment',
        semanticPurpose: 'self-correction',
        applicationMode: 'MARKER',
      }),
    );
    makerActions.push('crossed out', 'corrected');
  } else if (params.topicIndex === 8) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'MARGIN_MARK',
        causality: 'Handwritten reaction beside printed screenshot',
        semanticPurpose: 'character reaction to digital behavior',
        applicationMode: 'DIGITAL_HAND_TRACE',
      }),
    );
    makerActions.push('annotated');
  } else if (params.topicIndex === 3) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'CORRECTION_MARK',
        causality: 'Correction slip added to archival reassessment file',
        semanticPurpose: 'cultural reassessment note',
        applicationMode: 'INK',
      }),
    );
    makerActions.push('corrected');
  } else if (params.topicIndex === 5) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'UNDERLINE',
        causality: 'Underline on euphemism phrase in notebook margin',
        semanticPurpose: 'judgment emphasis',
        applicationMode: 'MARKER',
      }),
    );
    makerActions.push('underlined');
  } else if (params.topicIndex === 6) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'CIRCLE',
        causality: 'Circle around absurd wait time on thermal receipt',
        semanticPurpose: 'evidence highlight',
      }),
    );
    makerActions.push('circled');
  } else if (params.topicIndex === 9) {
    marks.push(
      buildNdxHumanMadeMark({
        markClass: 'UNDERLINE',
        causality: 'Single lime underline under fair-judgment phrase',
        semanticPurpose: 'restrained NDX touch on art board',
        applicationMode: 'MARKER',
      }),
    );
    makerActions.push('underlined');
  }

  return {
    systemId: `hmm-${params.artifactId}`,
    marks,
    handDrawnIcons,
    sameHandFamily: 'ndx-lime-marker-system-v1',
    makerActions,
    headlineHierarchyPreserved: true,
  };
}

export function evaluateHumanMarkConsistency(params: {
  artifactId: string;
  markSystem: NDXHumanMadeMarkSystem;
}): HumanMarkConsistencyEvaluation {
  const modes = new Set(params.markSystem.marks.map((m) => m.applicationMode));
  const hasIcons = params.markSystem.handDrawnIcons.length > 0;
  const hasMarks = params.markSystem.marks.length > 0;

  let result: HumanMarkConsistencyEvaluation['result'] = 'SAME_HAND';
  if (!hasIcons && !hasMarks) result = 'ADEQUATE';
  if (modes.size > 3 && hasIcons) result = 'MIXED_STYLES';

  return {
    evaluationId: `hmc-${randomUUID().slice(0, 8)}`,
    artifactId: params.artifactId,
    result,
    sameStrokeFamily: result === 'SAME_HAND' || result === 'ADEQUATE',
    mixedIconSystems: false,
    evaluatedAt: new Date().toISOString(),
  };
}

export function humanMarkRequiresCausality(mark: NdxHumanMadeMark): boolean {
  return mark.causality.length > 0 && mark.semanticPurpose.length > 0;
}

export function handDrawnIconRequiresSemanticReason(icon: HandDrawnIconSpec): boolean {
  return icon.whyDrawn.length > 0;
}

export function genericPictogramFails(hasVectorIconLook: boolean): boolean {
  return hasVectorIconLook;
}

export function vectorIconLookFails(hasPolishedPictograms: boolean): boolean {
  return hasPolishedPictograms;
}

export function multipleHandStylesFail(consistency: HumanMarkConsistencyEvaluation): boolean {
  return consistency.result === 'MIXED_STYLES' || consistency.result === 'VECTOR_ICON_MIXED';
}

export function notEveryPostRequiresIcons(topicIndicesWithIcons: number[]): boolean {
  return topicIndicesWithIcons.length < 9;
}

export function notEveryPostRequiresHandwriting(topicIndicesWithHandwriting: number[]): boolean {
  return topicIndicesWithHandwriting.length < 9;
}
