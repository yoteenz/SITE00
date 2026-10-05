/**
 * Behavior-first FAL prompt compiler for marketing artifacts — P0.5C.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem, MarketingFalPromptContract } from './types.js';
import { FAL_MARKETING_PROMPT_SECTION_ORDER } from './constants.js';

export function compileMarketingArtifactFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  expressionSystem: BrandMarketingExpressionSystem;
}): MarketingFalPromptContract {
  const a = params.artifact;
  const sections = [
    `SUBJECT / SITUATION: ${a.topic} — ${a.subject}`,
    `WHAT NDX NOTICED: ${a.supportingLanguage[0] ?? a.headline}`,
    `NDX REACTION: ${a.headline}`,
    `INVESTIGATION / CONNECTION / MEMORY: ${a.visibleEvidence.join('; ')}`,
    `JUDGMENT STATE: ${a.judgmentState}`,
    `REQUIRED INFORMATION: ${a.evidenceObjects.join('; ')}`,
    `ACTIONS NDX TOOK: ${a.makerTraces.join('; ')}`,
    `TRACES LEFT: ${a.visualCausalityRecords.map((r) => r.visualElement).join('; ')}`,
    `ARTIFACT TYPE: ${a.artifactExpressionClass.replace(/_/g, ' ')} — Instagram feed first slide`,
    `COMPOSITIONAL LOGIC: Show what NDX did to the information — bespoke hierarchy, not template card`,
    `MATERIAL CONDITIONS: Evidence surfaces thesis requires — ${a.artifactExpressionClass} — not decorative collage default`,
    `TYPOGRAPHIC BEHAVIOR: ${a.headline.length > 20 ? 'YELL / STATE' : 'QUESTION / REACT'} — do not prescribe font family`,
    `COLOR BEHAVIOR: Selection/emphasis if behavior requires — lime is ONE possible calibration, not mandatory palette`,
    `PHOTOGRAPHIC / ILLUSTRATIVE: Topic-specific evidence world for ${a.topic}`,
    `VISUAL FREEDOM: ${params.expressionSystem.visualFreedomContract}`,
    `NEGATIVE CONSTRAINTS: no "copy this visual style"; no lime-green editorial collage default; no scrapbook; no HEADLINE+IMAGE+CAPTION+LOGO template; no decorative circle/cross-out/highlight without cause; no Burn Book clone`,
  ];
  const prompt = sections.join('\n\n');
  const negativePrompt =
    'generic social post, template card, moodboard, logo board, decorative collage, random receipts, lime green default, handwriting default, corporate thought leadership, clickbait, style copy, north star pixel match';
  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_MARKETING_PROMPT_SECTION_ORDER],
  };
}

export function marketingFalPromptBeginsFromBehavior(contract: MarketingFalPromptContract): boolean {
  return contract.sectionOrder[0] === 'SUBJECT_SITUATION' && contract.prompt.startsWith('SUBJECT / SITUATION');
}

export function noAestheticKeywordSoup(contract: MarketingFalPromptContract): boolean {
  return !/^lime green editorial collage/i.test(contract.prompt);
}
