import { P0_VR_TWIN_V30R7MF3P5_LINEAGE, P0_VR_TWIN_V30R7MF3P6F1_LINEAGE } from '../constants.js';
import type { MobileTwinCompositionState } from './types.js';
import { BLUEPRINT_STYLE_REFERENCE_ROLE } from './resolveLightBlueprintStyleReference.js';

export const MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID = 'mobile-light-technical-blueprint-v1' as const;
export const R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION = 'r7mf3p5-light-blueprint-v1' as const;
/** Active prompt contract for locked NBP Blueprint (P6F1 hardening). */
export const R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION = 'r7mf3p6f1-light-blueprint-v1' as const;
export const LIGHT_BACKGROUND_PASS = 'LIGHT_BACKGROUND_PASS' as const;

export const BLUEPRINT_STYLE_STRUCTURE_FIREWALL = 'BlueprintStyleStructureFirewall' as const;
export const BLUEPRINT_PRESENTATION_FIREWALL = 'BLUEPRINT_PRESENTATION_FIREWALL' as const;
export const BLUEPRINT_VISUAL_STYLE_DRIFT = 'BLUEPRINT_VISUAL_STYLE_DRIFT' as const;
export const BLUEPRINT_DARK_MODE_VIOLATION = 'BLUEPRINT_DARK_MODE_VIOLATION' as const;
export const BLUEPRINT_PRESENTATION_VIOLATION = 'BLUEPRINT_PRESENTATION_VIOLATION' as const;
export const HISTORICAL_BLUEPRINT_VARIANT = 'HISTORICAL_BLUEPRINT_VARIANT' as const;

export type DarkBlueprintRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type BlueprintVisualStyleContract = {
  id: typeof MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID;
  viewport: 'MOBILE';
  mode: 'LIGHT';
  backgroundMode: 'WHITE_OR_COOL_OFF_WHITE';
  backgroundTone: 'VERY_LIGHT_COOL_NEUTRAL';
  gridMode: 'SUBTLE_COOL_BLUE_TECHNICAL';
  gridDensity: 'LOW_CONTRAST';
  lineColorFamily: 'TECHNICAL_BLUE';
  primaryLineWeight: 'MEDIUM_DARK';
  secondaryLineWeight: 'LIGHTER_BLUE';
  annotationLineWeight: 'THIN_SELECTIVE';
  textColorFamily: 'DARK_NAVY_TECHNICAL_BLUE';
  annotationColorFamily: 'BLUE_CYAN_RESTRAINED';
  surfaceFillMode: 'UNFILLED_OR_VERY_LIGHT_TRANSPARENT';
  selectedStateTreatment: 'OUTLINE_HATCH_NOTATION';
  imageRegionTreatment: 'TECHNICAL_LINEWORK_TONAL_NOT_PHOTOREAL';
  artifactTreatment: 'BLUEPRINT_LINE_ART';
  dimensionLineStyle: 'SELECTIVE_RESTRAINED';
  objectBoundaryStyle: 'THIN_CRISP_CONSISTENT';
  regionBoundaryStyle: 'CLEAR_SECTION_BOUNDARIES';
  technicalLabelStyle: 'HIGHLY_LEGIBLE';
  typographyTreatment: 'TECHNICAL_READABLE';
  contrastRequirement: 'DARK_ON_LIGHT';
  legibilityRequirement: 'FOUNDER_INSPECTION_PRIORITY';
  decorativeFreedom: 'NONE';
  status: 'LOCKED';
  version: typeof R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION;
};

export type BlueprintVisualStyleReceiptResult = 'PASS' | 'REVIEW_REQUIRED' | 'FAIL';

export type BlueprintVisualStyleReceipt = {
  id: string;
  blueprintRenderId: string;
  styleContractId: typeof MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID;
  requestedMode: 'LIGHT_TECHNICAL_BLUEPRINT';
  promptContractVersion: typeof R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION;
  dominantBackground: 'LIGHT' | 'DARK' | 'UNKNOWN';
  observedBackgroundClass: 'LIGHT' | 'DARK' | 'UNKNOWN';
  observedContrastClass: 'DARK_ON_LIGHT' | 'LIGHT_ON_DARK' | 'UNKNOWN';
  observedLineworkClass: 'TECHNICAL_BLUE' | 'OTHER' | 'UNKNOWN';
  observedGridClass: 'SUBTLE' | 'HEAVY' | 'NONE' | 'UNKNOWN';
  darkBackgroundRisk: DarkBlueprintRisk;
  lineworkContrast: 'DARK_ON_LIGHT' | 'LIGHT_ON_DARK' | 'UNKNOWN';
  pageOnlyStatus: 'PASS' | 'FAIL' | 'UNKNOWN';
  styleReferenceUsed: boolean;
  styleReferenceMode: typeof BLUEPRINT_STYLE_REFERENCE_ROLE | null;
  deviceFrameRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  styleDriftRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  result: BlueprintVisualStyleReceiptResult;
  founderReviewRequired: boolean;
  failureCode: string | null;
  backgroundClassification: typeof LIGHT_BACKGROUND_PASS | typeof BLUEPRINT_DARK_MODE_VIOLATION | 'UNKNOWN';
  createdAt: string;
};

export function getLockedMobileLightBlueprintStyleContract(): BlueprintVisualStyleContract {
  return {
    id: MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
    viewport: 'MOBILE',
    mode: 'LIGHT',
    backgroundMode: 'WHITE_OR_COOL_OFF_WHITE',
    backgroundTone: 'VERY_LIGHT_COOL_NEUTRAL',
    gridMode: 'SUBTLE_COOL_BLUE_TECHNICAL',
    gridDensity: 'LOW_CONTRAST',
    lineColorFamily: 'TECHNICAL_BLUE',
    primaryLineWeight: 'MEDIUM_DARK',
    secondaryLineWeight: 'LIGHTER_BLUE',
    annotationLineWeight: 'THIN_SELECTIVE',
    textColorFamily: 'DARK_NAVY_TECHNICAL_BLUE',
    annotationColorFamily: 'BLUE_CYAN_RESTRAINED',
    surfaceFillMode: 'UNFILLED_OR_VERY_LIGHT_TRANSPARENT',
    selectedStateTreatment: 'OUTLINE_HATCH_NOTATION',
    imageRegionTreatment: 'TECHNICAL_LINEWORK_TONAL_NOT_PHOTOREAL',
    artifactTreatment: 'BLUEPRINT_LINE_ART',
    dimensionLineStyle: 'SELECTIVE_RESTRAINED',
    objectBoundaryStyle: 'THIN_CRISP_CONSISTENT',
    regionBoundaryStyle: 'CLEAR_SECTION_BOUNDARIES',
    technicalLabelStyle: 'HIGHLY_LEGIBLE',
    typographyTreatment: 'TECHNICAL_READABLE',
    contrastRequirement: 'DARK_ON_LIGHT',
    legibilityRequirement: 'FOUNDER_INSPECTION_PRIORITY',
    decorativeFreedom: 'NONE',
    status: 'LOCKED',
    version: R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
  };
}

export function buildBlueprintPriorityLightStyleBlock(): string {
  return [
    'PRIORITY 1 — LIGHT BLUEPRINT STYLE (NON-OPTIONAL):',
    'OUTPUT A LIGHT TECHNICAL BLUEPRINT ON A WHITE OR VERY LIGHT COOL OFF-WHITE BACKGROUND.',
    'DO NOT OUTPUT A DARK BLUEPRINT.',
    'Dark blueprint styling is a failure state.',
  ].join('\n');
}

export function buildBlueprintNegativeStyleContractBlock(): string {
  return [
    'NEGATIVE STYLE CONTRACT — FORBIDDEN:',
    'NO DARK BACKGROUND.',
    'NO NAVY BACKGROUND.',
    'NO BLACK BACKGROUND.',
    'NO CHARCOAL BACKGROUND.',
    'NO LIGHT-LINES-ON-DARK-PAPER STYLE.',
    'NO cyan-on-dark blueprint.',
    'NO dark drafting sheet.',
    'NO neon technical style.',
  ].join('\n');
}

export function buildBlueprintStyleReferenceFirewallBlock(): string {
  return [
    `STYLE REFERENCE ROLE: ${BLUEPRINT_STYLE_REFERENCE_ROLE}`,
    'If a second reference image is attached, use it ONLY for background treatment, linework palette, grid tone, and annotation color.',
    'DO NOT copy page geometry, object layout, hierarchy, or content from the style reference.',
    'Composition truth remains MobileTwinCompositionState + sibling Actual identity only.',
  ].join('\n');
}

export function buildBlueprintStyleStructureFirewallBlock(): string {
  return [
    `${BLUEPRINT_STYLE_STRUCTURE_FIREWALL} — STYLE vs STRUCTURE:`,
    'You MAY change: color treatment, fill treatment, line treatment, annotation treatment, grid treatment.',
    'You MUST NOT change: geometry, object identities, hierarchy, component count, module order, layout relationships, page state, feature presence.',
  ].join('\n');
}

export function buildBlueprintPresentationFirewallBlock(): string {
  return [
    `${BLUEPRINT_PRESENTATION_FIREWALL} — PAGE ONLY:`,
    'Render the flat mobile page artifact itself.',
    'FORBIDDEN: phone mockup, device shell, browser frame, tilted presentation, floating sheet, poster mockup, product presentation scene.',
    `Violation code: ${BLUEPRINT_PRESENTATION_VIOLATION}`,
  ].join('\n');
}

export function buildForbiddenBlueprintStylesBlock(): string {
  return [
    'FORBIDDEN BLUEPRINT STYLES (do not use):',
    '- dark navy full-page background',
    '- black blueprint background',
    '- charcoal drafting sheet',
    '- neon-on-black cyber schematic',
    '- high-contrast black wireframe on black',
    '- posterized blueprint art / cinematic blueprint lighting',
    '- glowing technical effects / decorative technical collage',
    '- vintage blueprint paper texture / sepia drafting paper',
    '- blueprint inside a device or frame',
    `Style drift failure: ${BLUEPRINT_VISUAL_STYLE_DRIFT}`,
    `Dark mode failure: ${BLUEPRINT_DARK_MODE_VIOLATION}`,
  ].join('\n');
}

export function buildMobileLightTechnicalBlueprintFalPrompt(input: {
  composition: MobileTwinCompositionState;
  siblingActualRenderId: string;
  styleReferenceAttached?: boolean;
}): string {
  const contract = getLockedMobileLightBlueprintStyleContract();
  return [
    buildBlueprintPriorityLightStyleBlock(),
    '',
    buildBlueprintNegativeStyleContractBlock(),
    '',
    `LINEAGE: ${P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}`,
    `PROMPT_CONTRACT_VERSION: ${R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION}`,
    `BLUEPRINT_VISUAL_STYLE_CONTRACT: ${contract.id}`,
    'representationMode: LIGHT_TECHNICAL_BLUEPRINT',
    'STRUCTURAL SOURCE: MobileTwinCompositionState (FROZEN) — NOT Actual Render pixels.',
    '',
    input.styleReferenceAttached ? buildBlueprintStyleReferenceFirewallBlock() : '',
    input.styleReferenceAttached ? '' : '',
    'CREATE A LIGHT TECHNICAL BLUEPRINT VERSION OF THE EXACT SAME MOBILE PAGE.',
    'THIS IS A REPRESENTATION TRANSFORMATION ONLY — same composition, same hierarchy, same page state.',
    '',
    'REQUIRED STYLE:',
    'BACKGROUND: pure white or very light cool off-white',
    'LINEWORK: medium/dark technical blue',
    'SECONDARY LINES: lighter technical blue',
    'GRID: subtle pale-blue drafting grid',
    'TEXT: dark blue/navy on light background',
    'SURFACES: white / near-white',
    'IMAGE REGIONS: blue monochrome technical treatment on light background',
    'ANNOTATIONS: blue technical notation',
    '',
    'DO NOT:',
    '- use a dark background or black/navy full-page fills',
    '- redesign the page or move objects',
    '- change object dimensions, hierarchy, navigation, or control positions',
    '- add or remove UI or change page state',
    '- alter artifact positions or invent new technical elements',
    '- wrap the page in a phone/device/browser frame',
    '',
    buildForbiddenBlueprintStylesBlock(),
    '',
    buildBlueprintStyleStructureFirewallBlock(),
    '',
    buildBlueprintPresentationFirewallBlock(),
    '',
    'PRESERVE EXACTLY:',
    '- layout, hierarchy, module placement, control placement, major text placement',
    '- artifact placement, selected/active state, overall composition',
    '',
    `compositionStateId: ${input.composition.id}`,
    `compositionHash: ${input.composition.compositionHash}`,
    `siblingActualRenderId: ${input.siblingActualRenderId}`,
    `objectDefinitionCount: ${input.composition.objectDefinitions.length}`,
    `featureBindingCount: ${input.composition.featureBindings.length}`,
    `hostProjectContractVersion: ${input.composition.hostProjectContractVersion}`,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');
}

export function classifyDominantBackground(input: {
  twinImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
}): 'LIGHT' | 'DARK' | 'UNKNOWN' {
  const meta = input.providerMetadata ?? {};
  if (meta.backgroundClass === 'LIGHT' || meta.dominantBackground === 'LIGHT') return 'LIGHT';
  if (meta.backgroundClass === 'DARK' || meta.dominantBackground === 'DARK') return 'DARK';
  if (typeof meta.dominantBackgroundLuminance === 'number') {
    return meta.dominantBackgroundLuminance >= 0.55 ? 'LIGHT' : 'DARK';
  }
  const risk = assessDarkBlueprintRisk(input);
  if (risk === 'HIGH') return 'DARK';
  if (risk === 'LOW') return 'LIGHT';
  return 'UNKNOWN';
}

export function assessDarkBlueprintRisk(input: {
  twinImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
}): DarkBlueprintRisk {
  const meta = input.providerMetadata ?? {};
  if (meta.darkBackgroundLikelihood === 'HIGH' || meta.simulateDarkBlueprint === true) return 'HIGH';
  if (meta.darkBackgroundLikelihood === 'MEDIUM') return 'MEDIUM';
  if (typeof meta.dominantBackgroundLuminance === 'number' && meta.dominantBackgroundLuminance < 0.45) return 'HIGH';
  const uri = input.twinImageUri.toLowerCase();
  if (uri.includes('dark-blueprint') || uri.includes('navy-sheet') || uri.includes('black-blueprint')) {
    return 'HIGH';
  }
  if (uri.includes('dark-mode-blueprint')) return 'MEDIUM';
  if (uri.includes('light-blueprint-pass')) return 'LOW';
  return 'LOW';
}

export function assessBlueprintDeviceFrameRisk(input: {
  twinImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
}): 'LOW' | 'MEDIUM' | 'HIGH' {
  const uri = input.twinImageUri.toLowerCase();
  const meta = input.providerMetadata ?? {};
  if (meta.deviceFrameLikelihood === 'HIGH' || uri.includes('phone-mockup') || uri.includes('device-frame')) {
    return 'HIGH';
  }
  return 'LOW';
}

export function buildBlueprintVisualStyleReceipt(input: {
  blueprintRenderId: string;
  twinImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
  styleReferenceUsed?: boolean;
}): BlueprintVisualStyleReceipt {
  const darkBackgroundRisk = assessDarkBlueprintRisk(input);
  const dominantBackground = classifyDominantBackground(input);
  const deviceFrameRisk = assessBlueprintDeviceFrameRisk(input);
  const styleDriftRisk: DarkBlueprintRisk =
    darkBackgroundRisk === 'HIGH' || deviceFrameRisk === 'HIGH' ? 'HIGH'
    : darkBackgroundRisk === 'MEDIUM' ? 'MEDIUM'
    : 'LOW';

  let result: BlueprintVisualStyleReceiptResult = 'PASS';
  let failureCode: string | null = null;
  let founderReviewRequired = false;

  if (deviceFrameRisk === 'HIGH') {
    result = 'FAIL';
    failureCode = BLUEPRINT_PRESENTATION_VIOLATION;
    founderReviewRequired = true;
  } else if (darkBackgroundRisk === 'HIGH' || dominantBackground === 'DARK') {
    result = 'REVIEW_REQUIRED';
    failureCode = BLUEPRINT_DARK_MODE_VIOLATION;
    founderReviewRequired = true;
  } else if (styleDriftRisk === 'MEDIUM') {
    result = 'REVIEW_REQUIRED';
    failureCode = BLUEPRINT_VISUAL_STYLE_DRIFT;
    founderReviewRequired = true;
  }

  const observedBackgroundClass = dominantBackground;
  const observedContrastClass =
    dominantBackground === 'DARK' ? 'LIGHT_ON_DARK'
    : dominantBackground === 'LIGHT' ? 'DARK_ON_LIGHT'
    : 'UNKNOWN';
  const lineworkContrast = observedContrastClass;
  const pageOnlyStatus = deviceFrameRisk === 'HIGH' ? 'FAIL' : 'PASS';
  const backgroundClassification =
    dominantBackground === 'LIGHT' && result === 'PASS' ? LIGHT_BACKGROUND_PASS
    : failureCode === BLUEPRINT_DARK_MODE_VIOLATION ? BLUEPRINT_DARK_MODE_VIOLATION
    : 'UNKNOWN';

  return {
    id: `bvsr-${input.blueprintRenderId}`,
    blueprintRenderId: input.blueprintRenderId,
    styleContractId: MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
    requestedMode: 'LIGHT_TECHNICAL_BLUEPRINT',
    promptContractVersion: R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
    dominantBackground,
    observedBackgroundClass,
    observedContrastClass,
    observedLineworkClass: 'TECHNICAL_BLUE',
    observedGridClass: 'SUBTLE',
    darkBackgroundRisk,
    lineworkContrast,
    pageOnlyStatus,
    styleReferenceUsed: Boolean(input.styleReferenceUsed),
    styleReferenceMode: input.styleReferenceUsed ? BLUEPRINT_STYLE_REFERENCE_ROLE : null,
    deviceFrameRisk,
    styleDriftRisk,
    result,
    founderReviewRequired,
    failureCode,
    backgroundClassification,
    createdAt: new Date().toISOString(),
  };
}

export function lightBlueprintPromptForbidsDarkBackground(prompt: string): boolean {
  return (
    prompt.includes('NO DARK BACKGROUND') &&
    prompt.includes('NO NAVY BACKGROUND') &&
    prompt.includes('DO NOT OUTPUT A DARK BLUEPRINT')
  );
}

export function lightBlueprintPromptStartsWithLightBackgroundRequirement(prompt: string): boolean {
  const head = prompt.slice(0, 280).toUpperCase();
  return head.includes('LIGHT TECHNICAL BLUEPRINT') && head.includes('WHITE OR VERY LIGHT');
}

/** Mark non-canonical dark/light-failed blueprint for history (preserve artifact). */
export function classifyBlueprintAsHistoricalVariant(
  blueprint: import('./types.js').MobileBlueprintTwinVisual,
): import('./types.js').MobileBlueprintTwinVisual {
  if (blueprint.blueprintVisualVariant === 'HISTORICAL_BLUEPRINT_VARIANT') return blueprint;
  return {
    ...blueprint,
    blueprintVisualVariant: 'HISTORICAL_BLUEPRINT_VARIANT',
    styleFailureCode: blueprint.styleFailureCode ?? BLUEPRINT_DARK_MODE_VIOLATION,
  };
}
