/**
 * FAL prompt compiler V2.3 — art-board materiality + canvas-as-object.
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import { FAL_MATERIAL_PROMPT_SECTION_ORDER } from './constants.js';

export function compileArtBoardMaterialityFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
}): MarketingFalPromptContract {
  const c = params.contract;
  const ab = c.artBoardDirection;
  const cr = c.characterRetention;
  const cp = c.culturalParticipation;

  const sections = [
    `WHAT HAPPENED: ${params.artifact.topic} — ${params.artifact.subject}`,
    `WHAT NDX NOTICED: ${params.artifact.supportingLanguage[0] ?? c.primaryHook}`,
    `PRIMARY EDITORIAL IDEA: ${c.primaryHook}`,
    `VIEWER-FIRST READ: ${c.readingPath.firstLook}`,
    `VISUAL SUBJECT: ${cp.visualSubjectMatterDecision.culturalVisualSubject}`,
    `CHARACTER BEAT: ${cr.primaryCharacterBeat.text ?? 'visual punchline'} (${cr.primaryCharacterBeat.beatType})`,
    `HUMOR / HUMAN TRACE: ${cr.humorEligibility} — trace strength ${cr.humanTraceStrength}`,
    `ARTIFACT FORM: ${ab.artifactForm}`,
    `BASE SURFACE: ${ab.materialitySystem.baseSurface} — ${ab.materialAnchor}. THE CANVAS IS AN OBJECT, NOT A BACKGROUND.`,
    `PAGE CONSTRUCTION MODE: ${ab.pageConstructionMode}`,
    `CONSTRUCTION HISTORY: first ${ab.constructionHistory.firstPresent}; NDX added: ${ab.constructionHistory.ndxAdded.join(', ')}`,
    `EDGE BEHAVIOR: ${ab.edgeBehavior} — tear: ${ab.materialitySystem.tearBehavior}`,
    `LAYER STRUCTURE: primary ${ab.primaryLayer.layerType}; secondary: ${ab.secondaryLayers.map((l) => l.layerType).join(', ') || 'none'}`,
    `ATTACHMENT LOGIC: ${ab.attachmentLogic.map((a) => `${a.mechanism}: ${a.causality}`).join(' | ') || 'integrated print'}`,
    `MATERIAL DEPTH: ${ab.depthBehavior} — ${ab.canvasObject.layerCount} layers`,
    `PRINT / SCAN BEHAVIOR: ${ab.materialitySystem.printingBehavior}`,
    `HOW TYPOGRAPHY INTERACTS WITH SURFACE: ${ab.typographySurfaceInteraction.join('; ')}`,
    `HOW IMAGE INTERACTS WITH SURFACE: ${ab.imageSurfaceInteraction.join('; ')}`,
    `HOW EVIDENCE INTERACTS WITH SURFACE: ${ab.evidenceSurfaceInteraction.join('; ')}`,
    `CONTROLLED MISBEHAVIOR: ${cr.controlledMisbehavior.map((m) => m.causality).join(' | ') || 'minimal'}`,
    `INFORMATION HIERARCHY: Level 1: ${c.primaryHook} — compressed, no re-expansion`,
    `TYPOGRAPHY ROLES: ${c.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)}`).join('; ')}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE`,
    `IMAGE / TYPE BALANCE: ${cp.visualParticipationMode}`,
    `READING PATH: 1: ${c.readingPath.firstLook} → 2: ${c.readingPath.secondLook} → 3: ${c.readingPath.thirdLook}`,
    `CHARACTER DENSITY: ${c.characterEvaluation.characterDensity.characterDensity}`,
    `INFORMATION DENSITY: ${c.textDensity.level}`,
    `MATERIAL DENSITY: ${c.materialityEvaluation.materialDensity.level}`,
    `CULTURAL PARTICIPATION: ${cp.visualParticipationMode}`,
    `LIME FUNCTION: ${c.limeFunction ?? 'restrained — not material substitute'}`,
    `STERILITY GUARD: alive not corporate — maker trace on surface`,
    `TEMPLATE GUARD: DO NOT DESIGN A RECTANGULAR SOCIAL POST ON TOP OF A BACKGROUND. CREATE THE ACTUAL ARTIFACT. CONTENT PRINTED ON, INSERTED INTO, ATTACHED TO, WRITTEN OVER, CUT INTO, FOLDED WITH, OR SCANNED FROM THE SURFACE. ${ab.whyNotCleanTemplate}`,
    `NEGATIVE CONSTRAINTS: no generic poster-on-background; no clean social template; no graphic card floating over texture; no fake paper texture filter; no all-content perfect rectangle; no arbitrary torn paper/tape/folds/layers; no scrapbook-for-scrapbook's-sake; no cute stationery; no school notebook; no vintage craft unless thesis requires; no excessive aging; no fake coffee stains; no Canva collage; no Pinterest moodboard; no perfect template grid; no flat UI-card unless source requires; no lowercase NDX copy`,
  ];

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'poster on background, clean social template, graphic card floating, fake paper texture, uniform margins, arbitrary torn paper, arbitrary tape, scrapbook collage, cute stationery, school notebook, vintage craft, coffee stains, Canva collage, Pinterest moodboard, perfect grid, flat UI card, sterile editorial template';

  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_MATERIAL_PROMPT_SECTION_ORDER],
  };
}

export function materialFalPromptHasTemplateGuard(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('TEMPLATE GUARD');
}

export function materialFalPromptArtifactFormBeforeAesthetic(contract: MarketingFalPromptContract): boolean {
  const artifactIdx = contract.prompt.indexOf('ARTIFACT FORM');
  const negIdx = contract.prompt.indexOf('NEGATIVE CONSTRAINTS');
  return artifactIdx >= 0 && negIdx > artifactIdx;
}

export function falPositiveInstructionPresent(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('CREATE THE ACTUAL ARTIFACT');
}
