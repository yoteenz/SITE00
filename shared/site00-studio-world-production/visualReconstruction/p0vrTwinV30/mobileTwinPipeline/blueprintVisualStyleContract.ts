import { P0_VR_TWIN_V30R7MF3P5_LINEAGE } from '../constants.js';
import type { MobileTwinCompositionState } from './types.js';

export const MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID = 'mobile-light-technical-blueprint-v1' as const;
export const R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION = 'r7mf3p5-light-blueprint-v1' as const;

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
  promptContractVersion: typeof R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION;
  observedBackgroundClass: 'LIGHT' | 'DARK' | 'UNKNOWN';
  observedContrastClass: 'DARK_ON_LIGHT' | 'LIGHT_ON_DARK' | 'UNKNOWN';
  observedLineworkClass: 'TECHNICAL_BLUE' | 'OTHER' | 'UNKNOWN';
  observedGridClass: 'SUBTLE' | 'HEAVY' | 'NONE' | 'UNKNOWN';
  darkBackgroundRisk: DarkBlueprintRisk;
  deviceFrameRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  styleDriftRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  result: BlueprintVisualStyleReceiptResult;
  founderReviewRequired: boolean;
  failureCode: string | null;
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
    version: R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION,
  };
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
}): string {
  const contract = getLockedMobileLightBlueprintStyleContract();
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF3P5_LINEAGE}`,
    `PROMPT_CONTRACT_VERSION: ${R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION}`,
    `BLUEPRINT_VISUAL_STYLE_CONTRACT: ${contract.id}`,
    'representationMode: LIGHT_TECHNICAL_BLUEPRINT',
    'STRUCTURAL SOURCE: MobileTwinCompositionState (FROZEN) — NOT Actual Render pixels.',
    '',
    'CREATE A LIGHT TECHNICAL BLUEPRINT VERSION OF THE EXACT SAME MOBILE PAGE.',
    'THIS IS A REPRESENTATION TRANSFORMATION ONLY — same composition, same hierarchy, same page state.',
    '',
    'USE:',
    '- white or very light cool off-white background',
    '- clean blue technical linework (medium/dark blue primary, lighter blue secondary)',
    '- thin precise outlines and crisp borders',
    '- subtle cool-blue technical grid (low contrast — must not compete with UI)',
    '- highly legible technical labels (dark navy / technical blue text)',
    '- restrained blueprint annotations (selective — do not over-annotate)',
    '- clean architectural / interface drafting language',
    '- mostly unfilled surfaces or extremely light transparent fills',
    '- selected/active states: outline, hatch, or technical notation — not large dark fills',
    '- image/artifact regions: technical linework / blueprint tonal treatment — not full-color photorealistic raster',
    '',
    'DO NOT:',
    '- use a dark background or black/navy full-page fills',
    '- redesign the page or move objects',
    '- change object dimensions, hierarchy, navigation, or control positions',
    '- add or remove UI or change page state',
    '- alter artifact positions or invent new technical elements',
    '- make the image decorative or inherit dark editorial atmosphere for the sheet background',
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
  ].join('\n');
}

export function assessDarkBlueprintRisk(input: {
  twinImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
}): DarkBlueprintRisk {
  const meta = input.providerMetadata ?? {};
  if (meta.darkBackgroundLikelihood === 'HIGH' || meta.simulateDarkBlueprint === true) return 'HIGH';
  if (meta.darkBackgroundLikelihood === 'MEDIUM') return 'MEDIUM';
  const uri = input.twinImageUri.toLowerCase();
  if (uri.includes('dark-blueprint') || uri.includes('navy-sheet') || uri.includes('black-blueprint')) {
    return 'HIGH';
  }
  if (uri.includes('dark-mode-blueprint')) return 'MEDIUM';
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
}): BlueprintVisualStyleReceipt {
  const darkBackgroundRisk = assessDarkBlueprintRisk(input);
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
  } else if (darkBackgroundRisk === 'HIGH') {
    result = 'REVIEW_REQUIRED';
    failureCode = BLUEPRINT_DARK_MODE_VIOLATION;
    founderReviewRequired = true;
  } else if (styleDriftRisk === 'MEDIUM') {
    result = 'REVIEW_REQUIRED';
    failureCode = BLUEPRINT_VISUAL_STYLE_DRIFT;
    founderReviewRequired = true;
  }

  const observedBackgroundClass =
    darkBackgroundRisk === 'HIGH' ? 'DARK'
    : darkBackgroundRisk === 'LOW' ? 'LIGHT'
    : 'UNKNOWN';
  const observedContrastClass =
    darkBackgroundRisk === 'HIGH' ? 'LIGHT_ON_DARK'
    : darkBackgroundRisk === 'LOW' ? 'DARK_ON_LIGHT'
    : 'UNKNOWN';

  return {
    id: `bvsr-${input.blueprintRenderId}`,
    blueprintRenderId: input.blueprintRenderId,
    styleContractId: MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
    requestedMode: 'LIGHT_TECHNICAL_BLUEPRINT',
    promptContractVersion: R7MF3P5_LIGHT_BLUEPRINT_PROMPT_VERSION,
    observedBackgroundClass,
    observedContrastClass,
    observedLineworkClass: 'TECHNICAL_BLUE',
    observedGridClass: 'SUBTLE',
    darkBackgroundRisk,
    deviceFrameRisk,
    styleDriftRisk,
    result,
    founderReviewRequired,
    failureCode,
    createdAt: new Date().toISOString(),
  };
}

export function lightBlueprintPromptForbidsDarkBackground(prompt: string): boolean {
  return (
    prompt.includes('DO NOT') &&
    prompt.includes('dark background') &&
    prompt.includes(BLUEPRINT_DARK_MODE_VIOLATION)
  );
}
