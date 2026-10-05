/**
 * FAL prompt compiler V2.3 — art-board materiality + human-made + signature lime restraint (P0.5C.4B.1).
 * P0.5C.6A — authored artifact grammar + template frame removal + human history authority.
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import { FAL_MATERIAL_PROMPT_SECTION_ORDER } from './constants.js';
import { NDX_SIGNATURE_LIME } from './signatureLime.js';
import { buildFalPublicCopySections } from '../firstPersonAuthorship/falPromptPublicCopy.js';
import { prominenceLabel } from './signatureLimeRestraint.js';
import {
  resolveNDXPageObjectContract,
  resolveCarouselSequencePageRole,
} from './ndxPageObjectContract.js';
import { resolveNDXConstructionHistory } from './ndxConstructionHistory.js';
import { buildNotebookCarouselPromptSections } from './notebookCarouselPromptSections.js';
import { buildCharacterFirstAuthorityPromptSections } from '../contentOperations/characterFirst/characterFirstFalPromptSections.js';
import type { CharacterFirstRegenerationBundle } from '../contentOperations/characterFirst/types.js';

export function compileArtBoardMaterialityFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
  founderRevisionDirective?: string | null;
  topicIndex?: number;
  characterFirstBundle?: CharacterFirstRegenerationBundle | null;
}): MarketingFalPromptContract {
  const c = params.contract;
  const topicIndex = params.topicIndex ?? 1;
  const pageObject = resolveNDXPageObjectContract(c, topicIndex);
  const constructionHistory = resolveNDXConstructionHistory(c, topicIndex, pageObject);
  const sequenceRole = resolveCarouselSequencePageRole(topicIndex);
  const notebookSections = buildNotebookCarouselPromptSections({
    pageObject,
    constructionHistory,
    sequenceRole,
  });
  const ab = c.artBoardDirection;
  const cr = c.characterRetention;
  const cp = c.culturalParticipation;
  const hm = c.humanMadeEvaluation?.markSystem;
  const lime = c.humanMadeEvaluation?.limeIntervention;
  const restraint = c.signatureLimeRestraint;
  const sig = c.signatureLimeEvaluation?.accentSelection;

  const limeIconCount = hm?.handDrawnIcons.filter((i) => i.limeApplied).length ?? 0;
  const blackIconCount = (hm?.handDrawnIcons.length ?? 0) - limeIconCount;

  const handDrawnSection = hm?.handDrawnIcons.length
    ? `HAND-DRAWN ICONS: ${hm.handDrawnIcons
        .map((i) => {
          const color = i.limeApplied ? `signature lime ${NDX_SIGNATURE_LIME} (ATTENTION TARGET ONLY)` : 'black pen / charcoal hand-drawn line';
          return `${i.subject} — ${i.whyDrawn} — render in ${color}`;
        })
        .join('; ')}. THE SMALL PRODUCT SYMBOLS MUST NOT LOOK LIKE STOCK ICONS, UI ICONS OR PERFECT VECTOR PICTOGRAMS. THEY SHOULD LOOK LIKE QUICK, CONFIDENT, IMPERFECT HAND-DRAWN SYMBOLS BY THE SAME PERSON. DEFAULT ICON COLOR IS BLACK PEN — NOT LIME. ONLY THE ART-DIRECTION ATTENTION TARGET MAY USE SIGNATURE LIME.`
    : 'HAND-DRAWN ICONS: none required for this topic — minimal maker intervention';

  const markLanguage = hm?.marks.length
    ? `HUMAN-MADE MARKS: ${hm.marks
        .map((m) => {
          const color = m.limeApplied ? `signature lime ${NDX_SIGNATURE_LIME}` : 'black pen / graphite / charcoal / believable authored ink';
          return `${m.markClass} (${m.applicationMode}, ${color}): ${m.causality}`;
        })
        .join(' | ')}`
    : 'HUMAN-MADE MARKS: restrained — only causally justified marks';

  const publicCopySections = buildFalPublicCopySections({
    artifact: params.artifact,
    contract: c,
    heroPremiseOverride: params.characterFirstBundle?.premiseAuthority.spokenPremise ?? null,
  });
  const va = c.visualAuthorityEvaluation?.bespokeArtDirection;
  const aa = c.authoredArtifactEvaluation;
  const visualAuthorityBlock = va
    ? [
        `BESPOKE ARTISTIC PREMISE`,
        `ARTISTIC PREMISE: ${va.artisticPremise}`,
        `VISUAL ENTRY POINT: ${va.visualEntryPoint}`,
        `DOMINANT VISUAL SUBJECT: ${va.dominantVisualSubject}`,
        `WHY SOMEONE LOOKS BEFORE READING: ${va.whySomeoneLooksBeforeReading}`,
        `VISUAL TENSION: ${va.visualTension}`,
        `UNEXPECTED ELEMENT: ${va.unexpectedElement}`,
        `COMPOSITION BEHAVIOR: ${va.compositionBehavior}`,
        `IMAGE BEHAVIOR: ${va.imageBehavior}`,
        `SCALE / CROP / NEGATIVE SPACE: ${va.scaleBehavior} · ${va.cropBehavior} · ${va.negativeSpaceBehavior}`,
        `WHY TOPIC-SPECIFIC: ${va.whyThisCouldOnlyBelongToThisTopic}`,
        `COMPELLING WITHOUT COPY: ${va.whatWouldRemainCompellingWithoutCopy}`,
      ].join('\n')
    : `BESPOKE ARTISTIC PREMISE: Establish a topic-specific visual idea BEFORE editorial layout — not a generic document template.`;

  const rawArtifactBlock = aa
    ? [
        `RAW VISUAL ARTIFACT`,
        `WHAT EXISTED FIRST: ${aa.humanHistory.whatExistedFirst}`,
        `PRIMARY VISUAL OBJECT: ${aa.intervention.rawVisualArtifact}`,
        `THE CENTRAL VISUAL PREMISE MUST OCCUPY THE ARTIFACT — nearly full-frame when appropriate.`,
        `DO NOT SURROUND THE ARTWORK WITH EXPLANATORY UI OR INFOGRAPHIC SHELL.`,
      ].join('\n')
    : `RAW VISUAL ARTIFACT: The central visual subject exists as a handled object BEFORE editorial framing.`;

  const ndxInterventionBlock = aa
    ? [
        `NDX INTERVENTION`,
        `WHAT NDX DID: ${aa.intervention.authorIntervention}`,
        `WHY SHE DID IT: ${aa.intervention.interventionCausality}`,
        `IF ALL NDX MARKS WERE REMOVED, THE ORIGINAL VISUAL OBJECT MUST STILL BE IDENTIFIABLE.`,
        `HER INTERVENTIONS MUST REVEAL HER THOUGHT PROCESS — NOT DECORATE.`,
        `DO NOT SIMULATE HUMAN AUTHORSHIP WITH RANDOM SCRIBBLES OR DECORATIVE TAPE.`,
      ].join('\n')
    : `NDX INTERVENTION: Show evidence NDX handled, edited, and marked the artifact — every mark has causal meaning.`;

  const humanHistoryBlock = aa
    ? [
        `HUMAN HISTORY`,
        `WHAT EXISTED FIRST: ${aa.humanHistory.whatExistedFirst}`,
        `WHAT NDX DID TO IT: ${aa.humanHistory.whatAuthorDid}`,
        `WHAT CHANGED AFTER SHE LOOKED AT IT: ${aa.humanHistory.whatChangedAfterReview}`,
        `SURVIVING PROCESS TRACE: ${aa.humanHistory.survivingProcessTrace}`,
        `TRACE TYPE: ${aa.humanHistory.traceType.replace(/_/g, ' ')} — ${aa.humanHistory.causalReason}`,
        `THE FINAL IMAGE MUST CONTAIN AT LEAST ONE MEANINGFUL PIECE OF PROCESS HISTORY.`,
        `HUMAN-MADE MARKS MUST HAVE CAUSAL MEANING — NOT RANDOM ANALOG TEXTURE.`,
      ].join('\n')
    : `HUMAN HISTORY: Artifact shows it existed, was handled, interpreted, modified, and editorialized.`;

  const informationInhabitationBlock = aa
    ? [
        `INFORMATION INHABITATION`,
        `HEADLINE PLACEMENT: ${aa.informationInhabitation.headlinePlacement}`,
        `EVIDENCE PLACEMENT: ${aa.informationInhabitation.evidencePlacement}`,
        `INHABITATION MODE: ${aa.informationInhabitation.inhabitationMode.replace(/_/g, ' ')}`,
        `WHY HERE: ${aa.informationInhabitation.whyThisPlacement}`,
        `DO NOT AUTOMATICALLY RESERVE CLEAN RECTANGULAR AREAS FOR TEXT.`,
        `ASK: WHERE WOULD NDX HAVE ACTUALLY PUT THIS THOUGHT?`,
        `INFORMATION BELONGS INSIDE THE ARTIFACT WORLD — NOT IN A SEPARATE GRAPHIC-DESIGN SHELL.`,
        `EDITORIAL INFORMATION MUST NOT AUTOMATICALLY CREATE FRAMING ARCHITECTURE AROUND THE ARTWORK.`,
      ].join('\n')
    : `INFORMATION INHABITATION: Text lives inside the artifact world — written on, taped over, margin note, attached scrap — not in headline/evidence panels.`;

  const antiTemplateFrameBlock = [
    `ANTI-TEMPLATE FRAME`,
    `DO NOT DESIGN A FINISHED INFOGRAPHIC AROUND THE CENTRAL ARTWORK.`,
    `DO NOT AUTOMATICALLY CREATE A TOP HEADLINE PANEL OR BOTTOM INFORMATION PANEL.`,
    `DO NOT USE HEADER / BODY / FOOTER COMPOSITION UNLESS THE ARTISTIC PREMISE REQUIRES IT.`,
    `BANNED DEFAULT GRAMMAR: TITLE AREA + CENTER ART + BOTTOM EXPLANATION AREA.`,
    `BANNED: formal oversized headline panel at top; boxed evidence/footer module at bottom; symmetrical information zones; clean presentation boundaries; complete top-middle-bottom communication hierarchy.`,
    `THE ARTWORK SHOULD NOT BE SURROUNDED BY EXPLANATORY UI.`,
    `LET THE CENTRAL VISUAL PREMISE OCCUPY THE ARTIFACT.`,
  ].join('\n');

  const overResolutionGuardBlock = [
    `OVER-RESOLUTION GUARD`,
    `NDX WORK IS VISUALLY INTENTIONAL BUT NOT ALWAYS PERFECTLY RESOLVED.`,
    `FAIL ARTIFACTS THAT FEEL: too finalized, too packaged, too presentation-ready, too evenly distributed, too cleanly modular, too perfectly aligned, too comprehensively explained.`,
    `SOPHISTICATED AUTHORSHIP ≠ PERFECT TEMPLATE COMPLETION.`,
    `THE RESULT SHOULD FEEL AUTHORED, NOT GENERATED.`,
  ].join('\n');

  const authoredArtifactGrammarBlock = [
    `AUTHORED ARTIFACT GRAMMAR`,
    `NDX GRAPHICS ARE AUTHORED ARTIFACTS, NOT DESIGNED TEMPLATES.`,
    `THE VIEWER SHOULD SENSE: THE ORIGINAL THING + WHAT NDX DID TO IT.`,
    `THE VISUAL APPEARS TO HAVE EXISTED, BEEN HANDLED, INTERPRETED, MODIFIED, AND EDITORIALIZED.`,
    `INTEGRATE INFORMATION INTO THE PHYSICAL/VISUAL WORLD OF THE ARTIFACT.`,
    `SHOW EVIDENCE THAT THIS OBJECT HAS BEEN HANDLED, EDITED, RECONSIDERED, AND MARKED BY ITS AUTHOR.`,
    `EVERY HUMAN INTERVENTION MUST HAVE A REASON.`,
  ].join('\n');

  const preReadingBlock = [
    `PRE-READING VISUAL APPETITE`,
    `IS THERE SOMETHING HERE I WANT TO LOOK AT BEFORE I READ IT? — YES. Create credible human, object, cultural, photographic, or intentional typographic reason to stop.`,
    `WOULD I STOP ON THIS PAGE BEFORE I KNEW WHAT IT SAID? — Design for thumbnail/feed stopping power first.`,
    `DO NOT INTERPRET INFORMATION RESTRAINT AS VISUAL BLANDNESS.`,
    `DO NOT INTERPRET ONE DOMINANT THOUGHT AS ONE DOMINANT TEXT BLOCK.`,
    `DO NOT DESIGN A CLEAN TEMPLATE MERELY BECAUSE THE COPY IS SIMPLE.`,
    `DO NOT USE DOCUMENTS, RECEIPTS, SCREENSHOTS, OR TYPOGRAPHY AS A SUBSTITUTE FOR AN ARTISTIC PREMISE.`,
    `CREATE SOMETHING THE VIEWER WANTS TO LOOK AT BEFORE THEY FULLY UNDERSTAND IT.`,
    `THE ART DIRECTION SHOULD FEEL BESPOKE TO THIS SPECIFIC THOUGHT.`,
    `VISUAL COMPLEXITY AND INFORMATION COMPLEXITY ARE SEPARATE — ARTISTICALLY RICH, COGNITIVELY SIMPLE.`,
  ].join('\n');

  const compositionalBlock = [
    `COMPOSITIONAL DIRECTION`,
    `VISUAL PRIORITY: 1 ART/CULTURAL SUBJECT → 2 THE THOUGHT → 3 THE PROOF → 4 THE TRACE → 5 METADATA`,
    `CULTURAL IMAGE PARTICIPATION: ${cp.visualParticipationMode} — human imagery, photography, objects, juxtaposition, expressive crop encouraged when thesis-relevant.`,
    `EVIDENCE ROLE: Evidence SUPPORTS the artistic premise — it is NOT automatically the composition unless the evidence object IS the visual thesis.`,
  ].join('\n');

  const restraintSection = restraint
    ? [
        `SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION`,
        `NDX SIGNATURE LIME MUST BE PRESENT SOMEWHERE IN THE ARTIFACT, BUT IT MUST REMAIN AN ACCENT.`,
        `THE COMPOSITION MUST REMAIN VISUALLY DOMINATED BY BLACK, NEUTRAL PAPER/CANVAS, PHOTOGRAPHIC MATERIAL, AND SOURCE-AUTHENTIC COLORS.`,
        `LIME SHOULD CREATE A MOMENT OF ATTENTION — NOT BECOME THE COLOR OF THE INFORMATION SYSTEM.`,
        `DO NOT RENDER ALL HANDWRITING IN LIME.`,
        `DO NOT RENDER ALL ICONS IN LIME (${blackIconCount} black-pen icons expected when icons present; ${limeIconCount} lime attention icon(s) max).`,
        `DO NOT RENDER BODY COPY OR LARGE INFORMATION BLOCKS IN LIME.`,
        `DO NOT TURN SECONDARY INFORMATION INTO A LIME TYPOGRAPHIC LAYER.`,
        `DO NOT USE MULTIPLE LARGE LIME REGIONS.`,
        `DO NOT SATISFY THE SIGNATURE-COLOR REQUIREMENT BY SPRINKLING LIME RANDOMLY THROUGHOUT THE PAGE.`,
        `HUMAN-MADE DOES NOT MEAN LIME-MADE. Human trace defaults to black pen / graphite unless explicitly marked as lime attention target.`,
        `RESTRAINT MODE: ${restraint.restraintMode.replace(/_/g, ' ')}.`,
        `LIME ATTENTION TARGET: ${restraint.attentionHierarchy.limeAttentionTarget}.`,
        `WHY LIME HERE: ${restraint.attentionHierarchy.whyLimeIsUsedHere}.`,
        `WHAT VIEWER NOTICES: ${restraint.attentionHierarchy.whatViewerNoticesBecauseOfLime}.`,
        `WHY NOT MORE LIME: ${restraint.attentionHierarchy.whyAdditionalLimeWouldReduceHierarchy}.`,
        `PRIMARY TYPOGRAPHY: black / near-black / source-authentic neutral — NOT lime by default.`,
        `PROMINENCE GOVERNANCE: ${prominenceLabel(restraint.prominence).toLowerCase()} — lime prominence prohibited.`,
      ].join('\n')
    : `SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION: NDX signature lime must be present as a selective accent only — not default ink for handwriting, icons, or body copy.`;

  const characterFirstSections = params.characterFirstBundle
    ? buildCharacterFirstAuthorityPromptSections(params.characterFirstBundle, topicIndex)
    : [];

  const sections = [
    ...characterFirstSections,
    ...publicCopySections,
    `[INTERNAL GENERATION GUIDANCE — DO NOT RENDER AS VISIBLE LABELS ON ARTIFACT]`,
    params.characterFirstBundle
      ? `CHARACTER PREMISE (PRIMARY): ${params.characterFirstBundle.premiseAuthority.spokenPremise}`
      : `CONTENT THESIS: ${params.artifact.topic} — ${c.primaryHook}`,
    ...notebookSections,
    visualAuthorityBlock,
    authoredArtifactGrammarBlock,
    rawArtifactBlock,
    preReadingBlock,
    compositionalBlock,
    ndxInterventionBlock,
    humanHistoryBlock,
    informationInhabitationBlock,
    antiTemplateFrameBlock,
    overResolutionGuardBlock,
    params.characterFirstBundle
      ? `FACTUAL CONTEXT (NOT PRIMARY CREATIVE IDEA): ${params.characterFirstBundle.premiseAuthority.topicMetadata.join(', ')}`
      : `TOPIC CONTEXT: ${params.artifact.topic} — ${params.artifact.subject}`,
    `INTERNAL THESIS: ${c.primaryHook}`,
    `INTERNAL CHARACTER EXPRESSION: ${cr.primaryCharacterBeat.text ?? 'visual punchline'} (${cr.primaryCharacterBeat.beatType})`,
    `INTERNAL OBSERVATION: ${params.artifact.supportingLanguage[0] ?? c.primaryHook}`,
    `VIEWER-FIRST READ (GUIDANCE ONLY): ${c.readingPath.firstLook}`,
    `VISUAL SUBJECT: ${cp.visualSubjectMatterDecision.culturalVisualSubject}`,
    `HUMOR / HUMAN TRACE (GUIDANCE): ${cr.humorEligibility} — trace strength ${cr.humanTraceStrength}`,
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
    `CONTROLLED MISBEHAVIOR (GUIDANCE — NOT A VISIBLE LABEL): ${cr.controlledMisbehavior.map((m) => m.causality).join(' | ') || 'minimal'}`,
    `INFORMATION HIERARCHY: Level 1: ${c.primaryHook} — compressed, no re-expansion. PRIMARY DISPLAY IN BLACK/NEUTRAL. MAKER INTERVENTION IS SUPPORTIVE, NOT A NEW CLUTTER LAYER.`,
    `TYPOGRAPHY ROLES: ${c.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 40)} (default black/neutral ink — lime ONLY if explicit word-level accent below)`).join('; ')}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE — AUTHENTIC SOURCE TEXT MAY PRESERVE SOURCE CASING`,
    `IMAGE / TYPE BALANCE: ${cp.visualParticipationMode}`,
    `READING PATH: 1: ${c.readingPath.firstLook} → 2: ${c.readingPath.secondLook} → 3: ${c.readingPath.thirdLook}`,
    `CHARACTER DENSITY: ${c.characterEvaluation.characterDensity.characterDensity}`,
    `INFORMATION DENSITY: ${c.textDensity.level}`,
    `MATERIAL DENSITY: ${c.materialityEvaluation.materialDensity.level}`,
    `CULTURAL PARTICIPATION: ${cp.visualParticipationMode}`,
    `LIME FUNCTION: ${c.limeFunction ?? 'selective signature accent — NDX touched the page after base material existed'}`,
    handDrawnSection,
    markLanguage,
    `WHO DREW / MARKED WHAT: NDX applied ${hm?.makerActions.join(', ') ?? 'minimal marks'} using same-hand human trace system (${hm?.sameHandFamily ?? 'ndx-human-trace-system-v1'}) — black pen / graphite default; lime is ONE available instrument`,
    `WHY MARK EXISTS: each mark answers WHY DID NDX DRAW/MARK THIS — not decoration for character`,
    `HAND-DRAWN VS PRINTED: printed type on surface in black/neutral; human marks default black pen; signature lime ONLY at declared attention target`,
    `LIME INTERVENTION BEHAVIOR: density ${lime?.density ?? 'SUBTLE'} — ${lime?.interventionSites.slice(0, 3).join(', ') ?? 'one selective accent only'}. LIME IS AN INTERVENTION COLOR, NOT A DECORATIVE BACKGROUND FILL OR DEFAULT INK SYSTEM.`,
    `LIME APPLICATION MODE: ${lime?.applicationModes.join(', ') ?? 'MARKER, HIGHLIGHTER'}. Prefer single causal accent — not page-wide lime system.`,
    `MAKER ACTION: visible maker evidence — ${hm?.makerActions.join(', ') || 'annotate/circle/connect as causally required'} — human-made quality is stroke/pressure/irregularity, NOT lime color`,
    restraintSection,
    `ANTI-AI DETAIL CONSTRAINTS: no polished infographic icons; no vector icon library; no UI pictograms; no AI decorative symbols; no mismatched doodle styles; no perfect geometry for hand-drawn marks; no fake childlike doodles; no all-lime icon row; no all-lime handwriting layer`,
    `SIGNATURE LIME REQUIREMENT: THIS ARTIFACT MUST CONTAIN AT LEAST ONE CLEAR, INTENTIONAL NDX SIGNATURE-LIME INTERVENTION (${NDX_SIGNATURE_LIME}) AT THE DECLARED ATTENTION TARGET. THE LIME MUST NOT DOMINATE THE COMPOSITION. LIME IS NDX'S SIGNATURE TRACE — EVIDENCE NDX TOUCHED THE ARTIFACT ONCE (OR ONE CONNECTED PATH).`,
    `SEMANTIC LIME ACCENT: ${sig?.targetType ?? 'NDX_MARK'} — "${sig?.targetText ?? 'maker mark'}" because ${sig?.reason ?? 'semantic payoff or NDX intervention'}.${sig?.wordLevelAccent ? ` RENDER ONLY "${sig.wordLevelAccent.word}" IN SIGNATURE LIME — remainder of headline in black/neutral.` : ''}${sig?.punctuationAccent ? ` RENDER ONLY "${sig.punctuationAccent}" PUNCTUATION IN SIGNATURE LIME.` : ''}${sig?.secondaryAccent ? ` ALSO at secondary target: ${sig.secondaryAccent.targetText} in signature lime (not arbitrary red).` : ''}`,
    `NDX SIGNATURE LIME TOKEN: use canonical signal lime ${NDX_SIGNATURE_LIME} for the attention-target intervention only. Material variation (marker/highlighter/print) allowed — do not invent new greens.`,
    `COLOR OWNERSHIP: SOURCE COLOR — preserve authentic original colors in source material. BASE ARTIFACT COLOR — content-driven black/cream/photographic. NDX INTERVENTION COLOR — signature lime ${NDX_SIGNATURE_LIME} ONLY for the declared attention target (word, mark, icon, underline, highlight). Human trace defaults to black pen. REJECT all-lime body copy, all-lime icons, all-lime handwriting.`,
    `SOURCE VS NDX COLOR: Source material retains authentic colors. NDX-authored typography defaults black/neutral. Signature lime applies ONLY to the art-direction attention target — NOT every circle, arrow, icon, or underline.`,
    `STERILITY GUARD: alive not corporate — maker trace on surface must be visually undeniable without lime saturation`,
    `TEMPLATE GUARD: DO NOT DESIGN A RECTANGULAR SOCIAL POST ON TOP OF A BACKGROUND. CREATE THE ACTUAL ARTIFACT. CONTENT PRINTED ON, INSERTED INTO, ATTACHED TO, WRITTEN OVER, CUT INTO, FOLDED WITH, OR SCANNED FROM THE SURFACE. ${ab.whyNotCleanTemplate}`,
    `NEGATIVE CONSTRAINTS: no generic poster-on-background; no clean social template; no graphic card floating over texture; no fake paper texture filter; no polished infographic icons; no vector icon library look; no UI pictograms; no AI-generated decorative symbols; no mismatched doodle styles; no perfect geometry for hand-drawn marks; no fake childlike doodles; no decorative lime with no purpose; no fully monochrome NDX artifact without at least one signature-lime trace; no arbitrary red/blue/yellow NDX-authored marks; no lime background fill; no repeated lime corner template on every post; no tiny invisible lime; no random neon decoration; no generic AI editorial detailing; no scrapbook-for-scrapbook's-sake; no lowercase NDX copy; no clean digital template; no social media template; no rounded UI card; no perfect rectangular photo frame; no digital scrapbook effect; no fake notebook decoration; no decorative handwriting without function; no visible CHARACTER BEAT label; no visible WHAT NDX NOTICED label; no visible PRIMARY EDITORIAL IDEA label; no visible CONTROLLED MISBEHAVIOR label; no third-person NDX narration; no system documentation on artifact; no all-lime body copy; no all-lime secondary copy; no all-lime handwriting system; no all-lime icon system; no all-lime diagram system; no all-lime metadata; no lime as primary typographic color; no lime dominating black structural hierarchy; no multiple large lime regions; no sprinkling lime randomly to satisfy signature requirement; no top headline panel unless premise requires; no bottom evidence panel unless premise requires; no header-body-footer infographic shell; no symmetrical information zones; no presentation board composition; no content container around artwork; no random tape or scribbles without causality; no random analog texture; no over-resolved generated graphic; no decorative human marks`,
  ];

  if (params.founderRevisionDirective) {
    sections.push(`FOUNDER REVISION DIRECTIVE:\n${params.founderRevisionDirective}`);
  }

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'polished infographic icons, vector icon library, UI pictograms, AI decorative symbols, stock icons, perfect pictograms, generic infographic, fake handwriting, neon decoration, arbitrary red NDX mark, monochrome without lime, lime background fill, all lime handwriting, all lime icons, all lime body copy, lime typography layer, lime dominant composition, top headline panel, bottom evidence panel, header body footer template, infographic shell, presentation board, symmetrical information zones, content container around artwork, random tape, random scribbles, decorative human marks, over-resolved generated graphic';

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

export function materialFalPromptHasLimeRestraintSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION');
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

export function materialFalPromptBlocksAllLimeBodyCopy(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('no all-lime body copy');
}

export function materialFalPromptHumanMadeNotLimeMade(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('HUMAN-MADE DOES NOT MEAN LIME-MADE');
}

export function materialFalPromptHasVisualAuthoritySection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('BESPOKE ARTISTIC PREMISE');
}

export function materialFalPromptArtDirectionBeforeInformationHierarchy(contract: MarketingFalPromptContract): boolean {
  const artIdx = contract.prompt.indexOf('BESPOKE ARTISTIC PREMISE');
  const infoIdx = contract.prompt.indexOf('INFORMATION HIERARCHY');
  return artIdx >= 0 && infoIdx > artIdx;
}

export function materialFalPromptBlocksVisualBlandnessInterpretation(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('DO NOT INTERPRET INFORMATION RESTRAINT AS VISUAL BLANDNESS');
}

export function materialFalPromptHasAuthoredArtifactGrammar(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('AUTHORED ARTIFACT GRAMMAR');
}

export function materialFalPromptHasHumanHistorySection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('HUMAN HISTORY');
}

export function materialFalPromptHasAntiTemplateFrameSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('ANTI-TEMPLATE FRAME');
}

export function materialFalPromptHasNdxInterventionSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('NDX INTERVENTION');
}

export function materialFalPromptHasInformationInhabitationSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('INFORMATION INHABITATION');
}

export function materialFalPromptHasOverResolutionGuard(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('OVER-RESOLUTION GUARD');
}

export function materialFalPromptHumanHistoryBeforeInformationHierarchy(contract: MarketingFalPromptContract): boolean {
  const historyIdx = contract.prompt.indexOf('HUMAN HISTORY');
  const infoIdx = contract.prompt.indexOf('INFORMATION HIERARCHY');
  return historyIdx >= 0 && infoIdx > historyIdx;
}

export function materialFalPromptBlocksTopHeadlinePanel(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('DO NOT AUTOMATICALLY CREATE A TOP HEADLINE PANEL');
}

export function materialFalPromptBlocksBottomEvidencePanel(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('BOTTOM INFORMATION PANEL');
}

export function materialFalPromptHasPhysicalPageObjectSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('PHYSICAL PAGE OBJECT');
}

export function materialFalPromptHasNotebookAuthorityChain(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('VISUAL AUTHORITY CHAIN (P0.5C.7)') && contract.prompt.includes('PAGE_OBJECT');
}

export function materialFalPromptHasConstructionHistorySection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('CONSTRUCTION HISTORY') && contract.prompt.includes('HOW NDX MADE THIS PAGE');
}

export function materialFalPromptHasUppercaseAuthorshipSection(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('UPPERCASE AUTHORSHIP') && contract.prompt.includes('NDX_AUTHORED_TEXT = UPPERCASE');
}

export function materialFalPromptHasNegativeTemplateConstraints(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('NEGATIVE TEMPLATE CONSTRAINTS');
}

export function materialFalPromptPageObjectBeforeTypography(contract: MarketingFalPromptContract): boolean {
  const pageIdx = contract.prompt.indexOf('PHYSICAL PAGE OBJECT');
  const typoIdx = contract.prompt.indexOf('TYPOGRAPHY ROLES');
  return pageIdx >= 0 && typoIdx > pageIdx;
}
