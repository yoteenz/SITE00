/**
 * FAL prompt compiler V2.2 — character retention + controlled misbehavior.
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { CharacterRetainedFirstSlideContract } from './types.js';
import { FAL_CHARACTER_PROMPT_SECTION_ORDER } from './constants.js';

export function compileCharacterRetentionFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: CharacterRetainedFirstSlideContract;
}): MarketingFalPromptContract {
  const c = params.contract;
  const cr = c.characterRetention;
  const cp = c.culturalParticipation;

  const sections = [
    `WHAT HAPPENED: ${params.artifact.topic} — ${params.artifact.subject}`,
    `WHAT NDX NOTICED: ${params.artifact.supportingLanguage[0] ?? c.primaryHook}`,
    `PRIMARY EDITORIAL IDEA: ${c.viewerShouldNoticeFirst}`,
    `VIEWER-FIRST READ: ${c.readingPath.firstLook}`,
    `VISUAL SUBJECT MATTER: ${cp.visualSubjectMatterDecision.culturalVisualSubject}`,
    `WHY VISUAL SUBJECT BELONGS: ${cp.whyImageBelongs ?? 'thesis-aligned'}`,
    `INFORMATION HIERARCHY: Level 1: ${c.primaryHook}; compressed — no re-expansion`,
    `INFORMATION DELIBERATELY REMOVED: ${cr.informationRemoved.join('; ')}`,
    `CHARACTER FACULTIES ACTIVE: ${cr.characterFacultiesRequired.join(', ')}`,
    `PRIMARY CHARACTER BEAT: ${cr.primaryCharacterBeat.beatType} — ${cr.primaryCharacterBeat.text ?? 'visual punchline'}`,
    `HUMOR ELIGIBILITY: ${cr.humorEligibility}`,
    `HUMOR / PUNCHLINE MECHANISM: ${cr.humorMechanism ?? 'none'} — ${cr.humorExpression?.whyNDX ?? ''}`,
    `HUMAN TRACE: strength ${cr.humanTraceStrength} — not handwriting-only; may include crop, overlap, correction, juxtaposition`,
    `CONTROLLED MISBEHAVIOR: ${cr.controlledMisbehavior.map((m) => `${m.mode}: ${m.causality}`).join(' | ') || 'minimal if serious topic'}`,
    `CHARACTER DENSITY TARGET: ${c.characterEvaluation.characterDensity.characterDensity}`,
    `TYPOGRAPHIC ROLE ASSIGNMENTS: ${c.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)}`).join('; ')}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE`,
    `IMAGE / TYPE BALANCE: ${cp.visualParticipationMode}`,
    `READING PATH: 1: ${c.readingPath.firstLook} → 2: ${c.readingPath.secondLook} → 3: ${c.readingPath.thirdLook}`,
    `INFORMATION DENSITY: ${c.textDensity.level} (low/controlled)`,
    `CULTURAL PARTICIPATION: ${cp.visualParticipationMode}`,
    `PLAYFULNESS: ${cp.playfulnessTarget}`,
    `EMOTIONAL TEMPERATURE: ${params.artifact.characterTemperature}`,
    `MATERIAL CONDITIONS: black/cream/lime — deliberately art-directed page NDX has touched`,
    `COMPOSITION: ${c.compositionIntent}. THIS IS NOT A PERFECT BRAND TEMPLATE. CLEAR ENOUGH TO READ IMMEDIATELY — NOT SO PERFECT THAT ALL HUMAN CHARACTER DISAPPEARS.`,
    `LIME FUNCTION: ${c.limeFunction ?? 'restrained intervention — not character substitute'}`,
    `STERILITY GUARD: must feel ALIVE not corporate; maker trace required where appropriate`,
    `NEGATIVE CONSTRAINTS: no sterile editorial layout; no corporate publication; no characterless minimalism; no random mess; no decorative scribbling; no forced handwriting; no joke stuffing; no meme formatting; no generic snark; no random rotation/tape/collage; no information re-expansion; no lowercase NDX-authored copy`,
  ];

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'sterile editorial layout, corporate publication, perfectly symmetrical brand template, generic magazine template, characterless minimalism, random mess, decorative scribbling, forced handwriting, joke stuffing, meme formatting, generic snark, random rotation, arbitrary tape, arbitrary collage, wall of text, research report, Swiss corporate minimalism';

  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_CHARACTER_PROMPT_SECTION_ORDER],
  };
}

export function characterFalPromptHasSterilityGuard(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('STERILITY GUARD');
}

export function falPositiveInstructionPresent(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('NDX HAS TOUCHED') || contract.prompt.includes('deliberately art-directed');
}
