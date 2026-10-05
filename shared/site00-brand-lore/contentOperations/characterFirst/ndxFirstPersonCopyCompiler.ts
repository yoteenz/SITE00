/**
 * P0.5E.7 — First-person copy compiler + humor evaluation.
 */

import type { NDXContentSeed, NDXFirstPersonCopyOutput, HumorOpportunityEvaluation } from './types.js';

export function compileNDXFirstPersonCopy(params: {
  seed: NDXContentSeed;
  platform: 'PAGE' | 'MARGIN' | 'REEL' | 'TIKTOK' | 'THREAD';
}): NDXFirstPersonCopyOutput {
  const premise = params.seed.premise.spokenPremise.toUpperCase();
  const hooks = [premise, params.seed.firstReaction.toUpperCase(), params.seed.question.toUpperCase()];
  const headlines = [premise];
  const annotations = [
    params.seed.thoughtArc.currentView.toUpperCase(),
    params.seed.bookTrace.replace(/_/g, ' '),
  ];

  let captionDraft = '';
  let spokenLines: string[] = [];

  switch (params.platform) {
    case 'MARGIN':
      captionDraft = params.seed.firstReaction.toUpperCase();
      spokenLines = [params.seed.firstReaction.toUpperCase()];
      break;
    case 'TIKTOK':
      captionDraft = `OKAY, I THOUGHT ${params.seed.initialBelief}. APPARENTLY I WAS MISSING ANOTHER RULE.`;
      spokenLines = [captionDraft];
      break;
    case 'THREAD':
      captionDraft = `THE MOST ANNOYING KIND OF LESSON IS WHEN YOU DID THE "RESPONSIBLE" THING AND STILL HAD TO LEARN A SECOND RULE.`;
      spokenLines = [premise, params.seed.currentView.toUpperCase()];
      break;
    case 'REEL':
      captionDraft = `${params.seed.notice.toUpperCase()} → ${params.seed.firstReaction.toUpperCase()} → ${params.seed.investigationTrigger.toUpperCase()}`;
      spokenLines = [params.seed.firstReaction.toUpperCase(), params.seed.question.toUpperCase()];
      break;
    default:
      captionDraft = `${premise}\n\n${params.seed.currentView.toUpperCase()}`;
      spokenLines = hooks;
  }

  return {
    hooks,
    headlines,
    annotations,
    captionDraft,
    spokenLines,
    uppercaseAuthored: true,
  };
}

export function evaluateHumorOpportunity(seed: NDXContentSeed): HumorOpportunityEvaluation {
  const sources: string[] = [];
  if (seed.friction.includes('contradiction') || seed.changedMind) sources.push('contradiction');
  if (seed.characterBeat === 'WE_OWE_HER_AN_APOLOGY') sources.push('self-awareness');
  if (seed.firstReaction.length < 20) sources.push('deadpan');
  const level =
    seed.humorPotential === 'STRONG'
      ? 'STRONG'
      : seed.humorPotential === 'MODERATE'
        ? 'MODERATE'
        : sources.length >= 2
          ? 'MODERATE'
          : sources.length === 1
            ? 'SUBTLE'
            : 'NONE';
  return { level, sources, mechanicalJokeAppended: false };
}

export function ndxAuthoredDisplayCopyUppercase(text: string): boolean {
  return text === text.toUpperCase() || text.includes('AUTHENTIC SOURCE');
}
