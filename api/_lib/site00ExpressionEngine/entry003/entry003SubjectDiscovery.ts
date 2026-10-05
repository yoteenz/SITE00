/**
 * C1.2 — Autonomous Entry 003 subject discovery (5–8 divergent candidates).
 */

import type {
  Entry003SubjectCandidate,
  Entry003SubjectEvaluation,
  Entry003SubjectSelection,
} from '../../../../shared/site00-expression-engine/entry-003/types.js';
import { buildPriorEntryLineage } from '../creativeDirector/creativeDirectorContextBuilder.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../../shared/site00-expression-engine/constants.js';
import { CHAPTER_01_ID } from '../chapter01Canon.js';

const ENTRY_001_SURFACE = ['britney', 'broadcast', 'television', 'media complicity', 'rehabilitation', 'celebrity'];
const ENTRY_002_SURFACE = [
  '2016',
  'baddie',
  'nostalgia',
  'edit suite',
  'phone portal',
  'archive scroll',
  'same woman',
  'glitch',
  'fashion nostalgia',
];

function scorePriorSimilarity(blob: string): { e1: number; e2: number } {
  const lower = blob.toLowerCase();
  const e1Hits = ENTRY_001_SURFACE.filter((s) => lower.includes(s)).length;
  const e2Hits = ENTRY_002_SURFACE.filter((s) => lower.includes(s)).length;
  return {
    e1: Math.min(1, e1Hits / 2),
    e2: Math.min(1, e2Hits / 2),
  };
}

export function generateEntry003SubjectCandidates(): Entry003SubjectCandidate[] {
  const raw: Omit<Entry003SubjectCandidate, 'similarityToEntry001' | 'similarityToEntry002'>[] = [
    {
      candidateId: 'e003-subject-clean-girl',
      subject: 'CLEAN GIRL / EFFORTLESS BEAUTY',
      surfaceTopic: 'Minimal makeup aesthetics marketed as natural',
      proposedThesis: 'WHEN EFFORTLESS BEAUTY REQUIRES MORE STEPS THAN THE OLD GLOSSY LOOK',
      culturalContradiction: 'Public claim of low-maintenance vs receipt trail of products, routines, and labor',
      whyNow: 'Clean-girl trend peaked while GRWM and routine content exploded',
      receiptPotential: 'Product counts, routine timestamps, before/after grids — pattern-level, not fabricated quotes',
      storyPotential: 'Routine escalation reveals effortless as performance category',
      visualPotential: 'Bathroom counter progression, mirror stages, product line growth',
      ndxbookFit: 'Receipt-first contradiction — claim vs visible labor',
      chapterFit: 'Two positions (effortless vs engineered) cannot both survive the routine receipts',
      riskLevel: 'MODERATE',
      researchRequirements: ['Aggregate product-count patterns in clean-girl GRWM — RESEARCH_REQUIRED'],
      obviousVersion: 'Before/after skin comparison carousel',
      whyItCouldBecomeNonObvious: 'Routine-lab world makes labor visible as architecture not commentary',
      culturalDomain: 'beauty',
    },
    {
      candidateId: 'e003-subject-therapy-speak',
      subject: 'THERAPY SPEAK / EMOTIONAL LANGUAGE INFLATION',
      surfaceTopic: 'Boundaries, healing, and trauma vocabulary in everyday discourse',
      proposedThesis: 'WHEN HEALING LANGUAGE OUTRUNS BEHAVIORAL RECEIPTS',
      culturalContradiction: 'Self-care/boundary rhetoric vs public behavior receipts that contradict the vocabulary',
      whyNow: 'Therapy-speak went mainstream in captions, podcasts, and corporate HR simultaneously',
      receiptPotential: 'Language patterns vs action patterns — conceptual receipts; specific posts RESEARCH_REQUIRED',
      storyPotential: 'Dictionary world where words accumulate faster than actions',
      visualPotential: 'Subtitle stacks, glossary cards, annotation layers',
      ndxbookFit: 'NDX tests language against record — core chapter grammar',
      chapterFit: 'CLAIM (I am healing) vs RECEIPT (behavior/language mismatch)',
      riskLevel: 'HIGH',
      researchRequirements: ['Specific public figure examples if used — RESEARCH_REQUIRED', 'Avoid fabricated quotes'],
      obviousVersion: 'Quote carousel of therapy buzzwords',
      whyItCouldBecomeNonObvious: 'Language-as-architecture world — not talking-head critique',
      culturalDomain: 'language',
    },
    {
      candidateId: 'e003-subject-deinfluencing',
      subject: 'DE-INFLUENCING / ANTI-CONSUMPTION CONTENT',
      surfaceTopic: 'Creators telling you to buy less while monetizing attention',
      proposedThesis: 'WHEN STOP BUYING STUFF BECOMES ITS OWN CONTENT CATEGORY',
      culturalContradiction: 'Anti-consumption message vs monetization/adjacent product receipts',
      whyNow: 'De-influencing trend collided with affiliate economics and platform incentives',
      receiptPotential: 'Content category growth vs stated anti-consumer ethic — pattern-level',
      storyPotential: 'Receipt ledger of do-not-buy posts adjacent to monetized recommendations',
      visualPotential: 'Split ledger, receipt printer, shopping bag archaeology',
      ndxbookFit: 'Cultural hypocrisy with countable receipts',
      chapterFit: 'Two positions on consumption cannot coexist with the monetization record',
      riskLevel: 'MODERATE',
      researchRequirements: ['Platform monetization disclosure patterns — RESEARCH_REQUIRED if citing individuals'],
      obviousVersion: 'Screenshot collage of contradictory posts',
      whyItCouldBecomeNonObvious: 'Ledger world makes hypocrisy spatial and cumulative',
      culturalDomain: 'consumer behavior',
    },
    {
      candidateId: 'e003-subject-dating-optimization',
      subject: 'DATING APP OPTIMIZATION / AUTHENTICITY PARADOX',
      surfaceTopic: 'Be yourself advice inside algorithmic selection systems',
      proposedThesis: 'WHEN AUTHENTICITY IS A PROFILE STRATEGY',
      culturalContradiction: 'Be genuine messaging vs optimization behavior (prompts, angles, timing)',
      whyNow: 'Dating discourse shifted to soft-launch performance and strategy content',
      receiptPotential: 'Strategy content vs authenticity claims — conceptual; specific stats RESEARCH_REQUIRED',
      storyPotential: 'Profile-as-stage where authenticity is rehearsed',
      visualPotential: 'Profile card theater — not phone-portal archive mechanic',
      ndxbookFit: 'Contradiction between stated value and system behavior',
      chapterFit: 'WHICH ONE IS IT — authentic or optimized?',
      riskLevel: 'MODERATE',
      researchRequirements: ['App UX references — conceptual OK; user statistics RESEARCH_REQUIRED'],
      obviousVersion: 'Dating app screenshot hot take',
      whyItCouldBecomeNonObvious: 'Casting-room world — not scroll archive',
      culturalDomain: 'dating',
    },
    {
      candidateId: 'e003-subject-body-wellness',
      subject: 'BODY POSITIVITY / WELLNESS INDUSTRIAL COMPLEX',
      surfaceTopic: 'Accept your body discourse alongside optimization products',
      proposedThesis: 'WHEN ACCEPTANCE AND OPTIMIZATION SELL THE SAME PRODUCT CYCLE',
      culturalContradiction: 'Body acceptance language vs optimization/receipt economy',
      whyNow: 'GLP-1 discourse and body-positive branding coexist in the same feed',
      receiptPotential: 'Brand language vs product category receipts — RESEARCH_REQUIRED for brand claims',
      storyPotential: 'Dual-label same product — acceptance on package, optimization in fine print',
      visualPotential: 'Label peel reveals second claim underneath',
      ndxbookFit: 'Receipt collision on same cultural object',
      chapterFit: 'Two positions on the body cannot survive the same SKU',
      riskLevel: 'HIGH',
      researchRequirements: ['Specific brand campaigns — RESEARCH_REQUIRED', 'Medical claims — RESEARCH_REQUIRED'],
      obviousVersion: 'Side-by-side influencer before/after',
      whyItCouldBecomeNonObvious: 'Peel-label artifact — not wellness montage',
      culturalDomain: 'aesthetics',
    },
    {
      candidateId: 'e003-subject-quiet-luxury',
      subject: 'QUIET LUXURY / STATUS SIGNALING',
      surfaceTopic: 'Understated wealth aesthetics as loud class literacy test',
      proposedThesis: 'WHEN QUIET IS THE LOUDEST STATUS SIGNAL',
      culturalContradiction: 'No-logo humility vs recognizable signifiers only insiders decode',
      whyNow: 'Quiet luxury trend made stealth wealth content its own visible genre',
      receiptPotential: 'Signifier literacy content vs humility claim — pattern receipts',
      storyPotential: 'Decode game proves quiet requires shared vocabulary of expensive normal',
      visualPotential: 'Material close-ups, tag reveals, class literacy progression',
      ndxbookFit: 'Cultural contradiction with teachable receipts',
      chapterFit: 'Claim (I do not perform wealth) vs receipt (signifier fluency content)',
      riskLevel: 'MODERATE',
      researchRequirements: ['Specific price/signifier examples — RESEARCH_REQUIRED if cited'],
      obviousVersion: 'Old money vs new money comparison reel',
      whyItCouldBecomeNonObvious: 'Material forensic world — not lifestyle montage',
      culturalDomain: 'status',
    },
    {
      candidateId: 'e003-subject-main-character',
      subject: 'MAIN CHARACTER ENERGY / PUBLIC FILMING',
      surfaceTopic: 'Living for the plot while filming bystanders',
      proposedThesis: 'WHEN MAIN CHARACTER ENERGY REQUIRES BACKGROUND CAST',
      culturalContradiction: 'Self-mythology content vs bystander inclusion in public receipts',
      whyNow: 'Street filming and story-time culture normalized public cast without consent discourse',
      receiptPotential: 'Filming-in-public patterns — conceptual; specific incidents RESEARCH_REQUIRED',
      storyPotential: 'Director chair in public space — protagonist vs background rights',
      visualPotential: 'Blocking marks on sidewalk, extras without release forms',
      ndxbookFit: 'Moral contradiction with visible production behavior',
      chapterFit: 'Two ethics of public storytelling cannot coexist',
      riskLevel: 'HIGH',
      researchRequirements: ['Specific viral incidents — RESEARCH_REQUIRED', 'Legal/ethics claims — RESEARCH_REQUIRED'],
      obviousVersion: 'POV montage with trending audio',
      whyItCouldBecomeNonObvious: 'Film-set world on public street — not POV hot take',
      culturalDomain: 'social norms',
    },
  ];

  return raw.map((c) => {
    const blob = `${c.subject} ${c.surfaceTopic} ${c.proposedThesis} ${c.culturalContradiction}`;
    const sim = scorePriorSimilarity(blob);
    return { ...c, similarityToEntry001: sim.e1, similarityToEntry002: sim.e2 };
  });
}

export function subjectsAreDivergent(candidates: Entry003SubjectCandidate[]): boolean {
  const domains = new Set(candidates.map((c) => c.culturalDomain));
  return candidates.length >= 5 && domains.size >= 5;
}

type ScoredEval = Entry003SubjectEvaluation & { totalScore: number };

export function evaluateEntry003Subjects(candidates: Entry003SubjectCandidate[]): Entry003SubjectEvaluation[] {
  const scored: ScoredEval[] = candidates.map((c) => {
    const priorDiff1 = 1 - c.similarityToEntry001;
    const priorDiff2 = 1 - c.similarityToEntry002;
    const receiptStrength = c.receiptPotential.includes('RESEARCH_REQUIRED') ? 0.72 : 0.85;
    const researchFeasibility = c.riskLevel === 'HIGH' ? 0.65 : 0.82;
    const scores = {
      culturalInsight: 0.8 + (c.whyNow.length > 30 ? 0.05 : 0),
      chapterFit: c.chapterFit.includes('cannot') ? 0.88 : 0.75,
      receiptStrength,
      contradictionClarity: c.culturalContradiction.length > 40 ? 0.87 : 0.7,
      narrativePotential: c.storyPotential.length > 25 ? 0.86 : 0.72,
      visualPotential: c.visualPotential.length > 20 ? 0.84 : 0.7,
      worldPotential: c.whyItCouldBecomeNonObvious.includes('world') ? 0.85 : 0.78,
      artifactPotential: 0.8,
      interjectionPotential: 0.82,
      socialFormatPotential: 0.83,
      originality: (priorDiff1 + priorDiff2) / 2,
      ndxbookSpecificity: c.ndxbookFit.toLowerCase().includes('receipt') ? 0.9 : 0.8,
      distanceFromEntry001: priorDiff1,
      distanceFromEntry002: priorDiff2,
      researchFeasibility,
      productionFeasibility: c.riskLevel === 'HIGH' ? 0.7 : 0.85,
    };
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      candidateId: c.candidateId,
      ...scores,
      qualitativeReasoning: `${c.subject}: chapter-fit ${scores.chapterFit.toFixed(2)}, prior-entry distance (${priorDiff1.toFixed(2)}/${priorDiff2.toFixed(2)}), ${c.culturalDomain} domain.`,
      totalScore: avg,
    };
  });

  return scored
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(({ totalScore: _t, ...rest }) => rest);
}

export function selectEntry003Subject(
  candidates: Entry003SubjectCandidate[],
  evaluations: Entry003SubjectEvaluation[],
): Entry003SubjectSelection {
  const ranked = evaluations.map((e) => ({
    eval: e,
    candidate: candidates.find((c) => c.candidateId === e.candidateId)!,
  }));
  const primary = ranked[0]!;
  const runnerUp = ranked[1] ?? null;
  const others = ranked.slice(2, 5);

  return {
    selectedCandidateId: primary.candidate.candidateId,
    runnerUpCandidateId: runnerUp?.candidate.candidateId ?? null,
    subject: primary.candidate.subject,
    workingTitle: deriveWorkingTitle(primary.candidate),
    thesis: primary.candidate.proposedThesis,
    lockedPremiseCandidate: primary.candidate.culturalContradiction,
    whyItWins: primary.eval.qualitativeReasoning,
    whyRunnerUpLost: runnerUp
      ? `${runnerUp.candidate.subject}: lower receipt/research feasibility (${runnerUp.eval.receiptStrength.toFixed(2)} vs ${primary.eval.receiptStrength.toFixed(2)})`
      : null,
    whyOtherCandidatesLost: others.map((r) => `${r.candidate.subject}: ${r.eval.qualitativeReasoning}`),
    whatMakesThisNDXBOOK: primary.candidate.ndxbookFit,
    whyThisBelongsInChapter01: primary.candidate.chapterFit,
    whyThisIsNotEntry001Again: `No broadcast/TV/celebrity-rehabilitation — distance ${primary.candidate.similarityToEntry001.toFixed(2)}`,
    whyThisIsNotEntry002Again: `No nostalgia/edit-suite/phone-portal — distance ${primary.candidate.similarityToEntry002.toFixed(2)}`,
    researchRequired: primary.candidate.researchRequirements,
    creativeRisk: primary.candidate.riskLevel === 'HIGH' ? 'Moderate — verify receipts before production' : 'Controlled — pattern receipts sufficient for creative review',
    candidateStatus: 'ENTRY_003_CREATIVE_CANDIDATE',
  };
}

function deriveWorkingTitle(candidate: Entry003SubjectCandidate): string {
  if (candidate.candidateId === 'e003-subject-clean-girl') return 'NOT THAT EFFORTLESS';
  if (candidate.candidateId === 'e003-subject-deinfluencing') return 'STOP BUYING THIS VIDEO';
  if (candidate.candidateId === 'e003-subject-quiet-luxury') return 'QUIET LOUD';
  if (candidate.candidateId === 'e003-subject-therapy-speak') return 'BOUNDARY OR PERFORMANCE';
  return `ENTRY 003 — ${candidate.subject.split('/')[0]?.trim() ?? 'TBD'}`;
}

export function buildEntry003BriefFromSelection(selection: Entry003SubjectSelection) {
  return {
    brandId: NDXBOOK_PROOF_BRAND_ID,
    entryId: 'entry-003',
    chapterId: CHAPTER_01_ID,
    subject: selection.subject,
    topic: selection.subject,
    thesis: selection.thesis,
    chapterArgumentGrammar: ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS'] as string[],
    brandTruth: 'NDXBOOK documents cultural contradictions with receipts — not trend commentary.',
    brandPersonality: 'Sharp, observational, receipt-first, anti-generic optimism.',
    founderCreativeAppetite: 'BOLD' as const,
    priorEntryLineage: buildPriorEntryLineage(),
    formatTarget: 'REEL',
  };
}
