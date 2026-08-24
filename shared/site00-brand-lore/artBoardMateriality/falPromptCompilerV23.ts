/**
 * FAL prompt compiler V2.3 — art-board materiality + human-made mark revision (P0.5C.4A).
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import { FAL_MATERIAL_PROMPT_SECTION_ORDER } from './constants.js';
import { NDX_SIGNATURE_LIME } from './signatureLime.js';

export function compileArtBoardMaterialityFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
  founderRevisionDirective?: string | null;
}): MarketingFalPromptContract {
  const c = params.contract;
  const ab = c.artBoardDirection;
  const cr = c.characterRetention;
  const cp = c.culturalParticipation;
  const hm = c.humanMadeEvaluation?.markSystem;
  const lime = c.humanMadeEvaluation?.limeIntervention;

  const sig = c.signatureLimeEvaluation?.accentSelection;

  const handDrawnSection = hm?.handDrawnIcons.length
    ? `HAND-DRAWN ICONS: ${hm.handDrawnIcons.map((i) => `${i.subject} — ${i.whyDrawn}`).join('; ')}. THE SMALL PRODUCT SYMBOLS MUST NOT LOOK LIKE STOCK ICONS, UI ICONS OR PERFECT VECTOR PICTOGRAMS. THEY SHOULD LOOK LIKE QUICK, CONFIDENT, LIME-GREEN HAND-DRAWN SYMBOLS CREATED BY THE SAME PERSON USING THE SAME MARKER SYSTEM. KEEP THEM LEGIBLE BUT IMPERFECT.`
    : 'HAND-DRAWN ICONS: none required for this topic — minimal maker intervention';

  const markLanguage = hm?.marks.length
    ? `HUMAN-MADE MARKS: ${hm.marks.map((m) => `${m.markClass} (${m.applicationMode}): ${m.causality}`).join(' | ')}`
    : 'HUMAN-MADE MARKS: restrained — only causally justified marks';

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
    `INFORMATION HIERARCHY: Level 1: ${c.primaryHook} — compressed, no re-expansion. MAKER INTERVENTION IS SUPPORTIVE, NOT A NEW CLUTTER LAYER.`,
    `TYPOGRAPHY ROLES: ${c.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)}`).join('; ')}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE`,
    `IMAGE / TYPE BALANCE: ${cp.visualParticipationMode}`,
    `READING PATH: 1: ${c.readingPath.firstLook} → 2: ${c.readingPath.secondLook} → 3: ${c.readingPath.thirdLook}`,
    `CHARACTER DENSITY: ${c.characterEvaluation.characterDensity.characterDensity}`,
    `INFORMATION DENSITY: ${c.textDensity.level}`,
    `MATERIAL DENSITY: ${c.materialityEvaluation.materialDensity.level}`,
    `CULTURAL PARTICIPATION: ${cp.visualParticipationMode}`,
    `LIME FUNCTION: ${c.limeFunction ?? 'intervention — NDX touched the page after base material existed'}`,
    handDrawnSection,
    markLanguage,
    `WHO DREW / MARKED WHAT: NDX applied ${hm?.makerActions.join(', ') ?? 'minimal marks'} using same-hand marker system (${hm?.sameHandFamily ?? 'ndx-lime-marker-system-v1'})`,
    `WHY MARK EXISTS: each mark answers WHY DID NDX DRAW/MARK THIS — not decoration for character`,
    `HAND-DRAWN VS PRINTED: printed type on surface; lime marks APPLIED after base material (marker/highlighter/ink/digital hand trace)`,
    `LIME INTERVENTION BEHAVIOR: density ${lime?.density ?? 'MODERATE'} — ${lime?.interventionSites.slice(0, 4).join(', ') ?? 'causal emphasis only'}. LIME IS AN INTERVENTION COLOR, NOT A DECORATIVE BACKGROUND FILL.`,
    `LIME APPLICATION MODE: ${lime?.applicationModes.join(', ') ?? 'MARKER, HIGHLIGHTER'}. Prefer MARKER/HIGHLIGHTER/INK/DIGITAL_HAND_TRACE for character-bearing elements.`,
    `MAKER ACTION: visible maker evidence target MODERATE+ — ${hm?.makerActions.join(', ') || 'annotate/circle/connect as causally required'}`,
    `ANTI-AI DETAIL CONSTRAINTS: no polished infographic icons; no vector icon library; no UI pictograms; no AI decorative symbols; no mismatched doodle styles; no perfect geometry for hand-drawn marks; no fake childlike doodles; no tiny lime accents that disappear at feed distance`,
    `SIGNATURE LIME REQUIREMENT: THIS ARTIFACT MUST CONTAIN AT LEAST ONE CLEAR, INTENTIONAL NDX SIGNATURE-LIME INTERVENTION (${NDX_SIGNATURE_LIME}). THE LIME SHOULD NOT DOMINATE THE COMPOSITION. LIME IS NDX'S SIGNATURE TRACE — EVIDENCE NDX TOUCHED THE ARTIFACT.`,
    `SEMANTIC LIME ACCENT: ${sig?.targetType ?? 'NDX_MARK'} — "${sig?.targetText ?? 'maker mark'}" because ${sig?.reason ?? 'semantic payoff or NDX intervention'}.${sig?.wordLevelAccent ? ` RENDER "${sig.wordLevelAccent.word}" IN SIGNATURE LIME.` : ''}${sig?.punctuationAccent ? ` RENDER "${sig.punctuationAccent}" PUNCTUATION IN SIGNATURE LIME.` : ''}${sig?.secondaryAccent ? ` ALSO: ${sig.secondaryAccent.targetText} in signature lime (not arbitrary red).` : ''}`,
    `NDX SIGNATURE LIME TOKEN: use canonical signal lime ${NDX_SIGNATURE_LIME} for all NDX-authored interventions. Material variation (marker/highlighter/print) allowed — do not invent new greens.`,
    `COLOR OWNERSHIP: SOURCE COLOR — preserve authentic original colors in source material (magazine typography, archival markings, photographs). BASE ARTIFACT COLOR — content-driven black/cream/photographic. NDX INTERVENTION COLOR — signature lime ${NDX_SIGNATURE_LIME} for NDX circles, arrows, corrections, icons, underlines, highlights, maker marks. REJECT accidental red/blue/yellow/orange for NDX-authored marks without source justification.`,
    `SOURCE VS NDX COLOR: NDX-authored circles, arrows, corrections, icons, underlines, annotations, stamps, handwritten reactions MUST default to signature lime — NOT random red. Source material may retain authentic red if it belongs to the original artifact.`,
    `STERILITY GUARD: alive not corporate — maker trace on surface must be visually undeniable`,
    `TEMPLATE GUARD: DO NOT DESIGN A RECTANGULAR SOCIAL POST ON TOP OF A BACKGROUND. CREATE THE ACTUAL ARTIFACT. CONTENT PRINTED ON, INSERTED INTO, ATTACHED TO, WRITTEN OVER, CUT INTO, FOLDED WITH, OR SCANNED FROM THE SURFACE. ${ab.whyNotCleanTemplate}`,
    `NEGATIVE CONSTRAINTS: no generic poster-on-background; no clean social template; no graphic card floating over texture; no fake paper texture filter; no polished infographic icons; no vector icon library look; no UI pictograms; no AI-generated decorative symbols; no mismatched doodle styles; no perfect geometry for hand-drawn marks; no fake childlike doodles; no decorative lime with no purpose; no fully monochrome NDX artifact without at least one signature-lime trace; no arbitrary red/blue/yellow NDX-authored marks; no lime background fill; no repeated lime corner template on every post; no tiny invisible lime; no random neon decoration; no generic AI editorial detailing; no scrapbook-for-scrapbook's-sake; no lowercase NDX copy`,
  ];

  if (params.founderRevisionDirective) {
    sections.push(`FOUNDER REVISION DIRECTIVE:\n${params.founderRevisionDirective}`);
  }

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'polished infographic icons, vector icon library, UI pictograms, AI decorative symbols, stock icons, perfect pictograms, generic infographic, fake handwriting, neon decoration, arbitrary red NDX mark, monochrome without lime, lime background fill';

  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_MATERIAL_PROMPT_SECTION_ORDER],
  };
}

export function materialFalPromptHasSignatureLimeRequirement(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('SIGNATURE LIME REQUIREMENT');
}

export function materialFalPromptDistinguishesSourceVsNdxColor(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('SOURCE VS NDX COLOR');
}

export function materialFalPromptHasHumanMadeSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('HUMAN-MADE MARKS');
}

export function materialFalPromptHasAntiAiConstraints(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('ANTI-AI DETAIL CONSTRAINTS');
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
