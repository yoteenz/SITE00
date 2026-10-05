/**
 * Typography provenance — HOST UI vs CLIENT brand typography separation.
 *
 * Invariant: HOST_UI typography cannot automatically become CLIENT_BRAND typography.
 * Font availability in CSS, admin UI, or historical output is NOT client canon.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CreativeDisplayCase, CreativeTypographyPolicy } from './brandIdentity.js';
import { resolveCanonicalBrandIdentity } from './brandIdentity.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_CSS = join(__dirname, '../../src/site00/styles/site00-fonts.css');

export type TypographyProvenanceClass =
  | 'HOST_UI'
  | 'CLIENT_CANON'
  | 'CLIENT_SUPPLIED'
  | 'DIRECTION_DERIVED'
  | 'CREATIVE_EXPLORATION'
  | 'HISTORICAL_OUTPUT';

export type TypographyIdentityStatus = 'UNRESOLVED' | 'RESOLVED' | 'CLIENT_SUPPLIED';

export const PROHIBITED_HOST_FONT_TOKENS = ['HOST_FONT_SITE00_MARTIAN_MONO'] as const;

/** Human-readable host font name — use only in HOST_UI contexts, not client creative payloads */
export const SITE00_HOST_FONT_FAMILY = 'Martian Mono';

export const HOST_UI_TYPOGRAPHY_INVARIANT =
  'HOST_UI typography cannot automatically become CLIENT_BRAND typography.';

export type HostUiTypographyDescriptor = {
  provenance: 'HOST_UI';
  fontFamily: typeof SITE00_HOST_FONT_FAMILY;
  usage: string[];
  cssSource: string;
  available: boolean;
};

export type DirectionDerivedTypographyRoles = {
  typographyIdentityStatus: TypographyIdentityStatus;
  provenance: TypographyProvenanceClass;
  displayVoice: string;
  systemVoice: string;
  revisionVoice: string;
  marginVoice: string;
  microVoice: string;
  rolesSummary: string[];
};

/** @deprecated Historical alias — use DirectionDerivedTypographyRoles */
export type MartianMonoTypographyRoles = DirectionDerivedTypographyRoles & {
  martianMonoAvailable?: boolean;
  actualSource?: string;
};

export type ClientTypographyProvenanceState = {
  typographyIdentityStatus: TypographyIdentityStatus;
  clientTypographyUnresolved: boolean;
  hostTypographyExcluded: boolean;
  benchmarkTypographyExcluded: boolean;
  typographyDerivationEnabled: boolean;
  typographicBehavior: Pick<
    CreativeTypographyPolicy,
    'headlineCase' | 'labelCase' | 'metadataCase' | 'annotationCase' | 'displayCase'
  >;
  fontSelectionStatus: TypographyIdentityStatus;
  prohibitedHostFontTokens: readonly string[];
  invariant: typeof HOST_UI_TYPOGRAPHY_INVARIANT;
};

export type HostFontLeakageResult = { passed: boolean; violations: string[] };

export function inspectHostUiTypography(): HostUiTypographyDescriptor {
  let available = false;
  let cssSource = 'not found in project';

  if (existsSync(FONTS_CSS)) {
    const css = readFileSync(FONTS_CSS, 'utf8');
    if (css.includes('Martian+Mono') || css.includes('Martian Mono')) {
      available = true;
      cssSource = 'src/site00/styles/site00-fonts.css';
    }
  }

  return {
    provenance: 'HOST_UI',
    fontFamily: SITE00_HOST_FONT_FAMILY,
    usage: [
      'questionnaires',
      'admin interfaces',
      'metadata',
      'system labels',
      'project controls',
      'validation screens',
      'founder review UI',
      'SITE 00 operational surfaces',
    ],
    cssSource,
    available,
  };
}

export function buildReplayClientTypographyState(brandSlug: string): ClientTypographyProvenanceState {
  const identity = resolveCanonicalBrandIdentity(brandSlug);
  return {
    typographyIdentityStatus: 'UNRESOLVED',
    clientTypographyUnresolved: true,
    hostTypographyExcluded: true,
    benchmarkTypographyExcluded: true,
    typographyDerivationEnabled: true,
    typographicBehavior: {
      displayCase: identity.typographyPolicy.displayCase,
      headlineCase: identity.typographyPolicy.headlineCase,
      labelCase: identity.typographyPolicy.labelCase,
      metadataCase: identity.typographyPolicy.metadataCase,
      annotationCase: identity.typographyPolicy.annotationCase,
    },
    fontSelectionStatus: 'UNRESOLVED',
    prohibitedHostFontTokens: PROHIBITED_HOST_FONT_TOKENS,
    invariant: HOST_UI_TYPOGRAPHY_INVARIANT,
  };
}

export function buildDirectionDerivedTypographyRoles(params?: {
  typographyIdentityStatus?: TypographyIdentityStatus;
  provenance?: TypographyProvenanceClass;
}): DirectionDerivedTypographyRoles {
  const status = params?.typographyIdentityStatus ?? 'UNRESOLVED';
  const provenance = params?.provenance ?? 'DIRECTION_DERIVED';

  return {
    typographyIdentityStatus: status,
    provenance,
    displayVoice:
      'DISPLAY / EDITORIAL AUTHORITY — high-contrast display voice at architectural scale; dominant claim voice; derive specific typeface from direction + personality',
    systemVoice:
      'SYSTEM / EVIDENCE VOICE — metadata, labels, issue IDs, captions, evidence, FILE/SOURCE/PAGE/DATE/STATUS/RECEIPT — font family MUST be derived from creative intelligence, NOT inherited from SITE 00 host UI',
    revisionVoice:
      'REVISION VOICE — contrasting disruptive sans or grotesque; behaves like an intervention inserted by a different hand',
    marginVoice:
      'MARGIN VOICE — handwriting-adjacent informal editorial reaction; human, imperfect; counter-argument register',
    microVoice:
      'MICRO / METADATA VOICE — extreme small scale indexing and evidence receipts; font family derived from direction',
    rolesSummary: [
      'DISPLAY makes the argument',
      'REVISION challenges it',
      'MARGIN reacts to it',
      'SYSTEM / EVIDENCE documents it',
      'FONT SELECTION UNRESOLVED until Identity Art Direction derives typography architecture',
    ],
  };
}

export function brandTypographicBehaviorBlock(brandSlug: string): string {
  const identity = resolveCanonicalBrandIdentity(brandSlug);
  const lines = [
    `BRAND DISPLAY NAME (exact): ${identity.displayName}`,
    `BRAND NAME IS ONE WORD: ${identity.displayName}`,
    'TYPOGRAPHY PROVENANCE: font selection is UNRESOLVED at replay start — derive from upstream brand intelligence.',
    HOST_UI_TYPOGRAPHY_INVARIANT,
    `PROHIBITED HOST FONT TOKENS (never client canon): ${PROHIBITED_HOST_FONT_TOKENS.join(', ')}`,
  ];

  if (identity.typographyPolicy.headlineCase === 'UPPERCASE') {
    lines.push('TYPOGRAPHIC BEHAVIOR — HEADLINE CASE: UPPERCASE.');
    lines.push('TYPOGRAPHIC BEHAVIOR — METADATA CASE: UPPERCASE.');
    lines.push('UPPERCASE IS A CASING RULE — NOT A FONT-FAMILY DECISION.');
    lines.push('headlineCase = UPPERCASE DOES NOT IMPLY any SITE 00 host UI font family.');
  }

  lines.push(
    'FONT SELECTION: derive from Brand Lore + Brand Personality + Primary Expression Context + Core Direction + Direction Expression.',
  );
  lines.push(
    'Identity Art Direction must explain WHY chosen typography belongs to this brand — personality fit, editorial authority, cultural fit, social readability.',
  );

  return lines.join('\n');
}

export function typographyRolesCondensedPromptBlock(roles: DirectionDerivedTypographyRoles): string[] {
  return [
    'TYPOGRAPHY ROLES (multi-voice architecture — NOT one font everywhere):',
    `TYPOGRAPHY IDENTITY STATUS: ${roles.typographyIdentityStatus}`,
    `PROVENANCE: ${roles.provenance}`,
    `- DISPLAY: ${roles.displayVoice.split('—')[0]?.trim() ?? roles.displayVoice}`,
    `- SYSTEM / EVIDENCE: metadata, issue IDs, evidence — DERIVE font from direction (NOT SITE 00 host UI)`,
    `- REVISION: condensed grotesque intervention voice`,
    `- MARGIN: handwriting-adjacent reactive counter-voice`,
    `- MICRO: extreme small scale metadata voice — DERIVE font from direction`,
    ...roles.rolesSummary.map((r) => `- ${r}`),
    HOST_UI_TYPOGRAPHY_INVARIANT,
  ];
}

export function typographyRolesPromptBlock(roles: DirectionDerivedTypographyRoles): string[] {
  return [
    'TYPOGRAPHIC ROLES (multi-voice system — NOT one font everywhere):',
    `TYPOGRAPHY IDENTITY STATUS: ${roles.typographyIdentityStatus}`,
    `PROVENANCE: ${roles.provenance}`,
    `- DISPLAY: ${roles.displayVoice}`,
    `- SYSTEM / EVIDENCE: ${roles.systemVoice}`,
    `- REVISION: ${roles.revisionVoice}`,
    `- MARGIN: ${roles.marginVoice}`,
    `- MICRO: ${roles.microVoice}`,
    ...roles.rolesSummary.map((r) => `- ${r}`),
    HOST_UI_TYPOGRAPHY_INVARIANT,
  ];
}

const HOST_FONT_CONTAMINATION_PATTERNS: RegExp[] = [
  /\bmartian\s*mono\b[^.\n]*(?:metadata|system voice|system\/metadata|documents the system|typographic dna|only for|available|application|footer|character)/i,
  /ndx system voice[^.\n]*martian\s*mono/i,
  /fontFamily\s*=\s*['"]?martian\s*mono/i,
  /martian\s*mono\s*must\s*enter/i,
  /use\s*martian\s*mono/i,
  /martian\s*mono\s*=\s*the book/i,
];

function stripAllowedHostFontMentions(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/prohibited host fonts/i.test(line))
    .join('\n')
    .replace(/does not imply fontFamily = Martian Mono/gi, '')
    .replace(/NOT inherited from SITE 00 host UI/gi, '')
    .replace(/do NOT use SITE 00 host UI fonts \(e\.g\. Martian Mono\)/gi, '')
    .replace(/never client canon/gi, '');
}

export function assertNoHostFontInText(text: string): HostFontLeakageResult {
  const violations: string[] = [];
  const scrubbed = stripAllowedHostFontMentions(text);
  for (const pattern of HOST_FONT_CONTAMINATION_PATTERNS) {
    if (pattern.test(scrubbed)) {
      violations.push(`Host font contamination: ${pattern.source}`);
    }
  }
  return { passed: violations.length === 0, violations };
}

export function assertNoHostFontInPayload(payload: unknown): HostFontLeakageResult {
  return assertNoHostFontInText(JSON.stringify(payload ?? {}));
}

export function classifyTypographyOccurrence(
  text: string,
  context: 'host_ui' | 'client_creative' | 'historical_output',
): TypographyProvenanceClass | 'INVALID_CROSS_CONTAMINATION' {
  const hasMartian = /\bmartian\s*mono\b/i.test(text);
  if (context === 'host_ui' && hasMartian) return 'HOST_UI';
  if (context === 'historical_output' && hasMartian) return 'HISTORICAL_OUTPUT';
  if (context === 'client_creative' && hasMartian) return 'INVALID_CROSS_CONTAMINATION';
  if (context === 'client_creative') return 'DIRECTION_DERIVED';
  return 'HOST_UI';
}

export const TYPOGRAPHY_FIXTURE_BRANDS = {
  ndxbook: {
    slug: 'ndxbook',
    personality: 'intelligent editorial skeptic',
    expectedUnresolvedAtReplayStart: true,
    headlineCase: 'UPPERCASE' as CreativeDisplayCase,
  },
  bloomBotanical: {
    slug: 'bloom-botanical',
    personality: 'warm organic luxury',
    expectedUnresolvedAtReplayStart: true,
    headlineCase: 'TITLE_CASE' as CreativeDisplayCase,
  },
} as const;

export function runHostFontLeakageTest(payload: unknown): boolean {
  return assertNoHostFontInPayload(payload).passed;
}

export function runSite00VisualDnaLeakageTest(payload: unknown): boolean {
  const check = assertNoHostFontInPayload(payload);
  return check.passed;
}

export function runClientTypographyProvenanceTest(state: ClientTypographyProvenanceState): boolean {
  return (
    state.clientTypographyUnresolved &&
    state.hostTypographyExcluded &&
    state.benchmarkTypographyExcluded &&
    state.typographyDerivationEnabled &&
    state.fontSelectionStatus === 'UNRESOLVED'
  );
}

export function runFontAvailabilityIsNotCanonTest(): boolean {
  const host = inspectHostUiTypography();
  const derived = buildDirectionDerivedTypographyRoles();
  return (
    host.available === true &&
    derived.typographyIdentityStatus === 'UNRESOLVED' &&
    !derived.systemVoice.toLowerCase().includes('martian mono')
  );
}

export function runHistoricalOutputIsNotCanonTest(historicalText: string, replayInput: unknown): boolean {
  const historicalHasHostFont = HOST_FONT_CONTAMINATION_PATTERNS.some((p) => p.test(historicalText));
  const replayLeak = assertNoHostFontInPayload(replayInput);
  if (!historicalHasHostFont) return true;
  return replayLeak.passed;
}

export function buildTypographyProvenanceEnvelope(brandSlug: string): Record<string, unknown> {
  const state = buildReplayClientTypographyState(brandSlug);
  const hostUi = inspectHostUiTypography();
  return {
    typographyProvenance: {
      ...state,
      hostUiTypography: {
        provenance: hostUi.provenance,
        fontToken: PROHIBITED_HOST_FONT_TOKENS[0],
        hostFontAvailableInCss: hostUi.available,
        cssSource: hostUi.cssSource,
        usage: hostUi.usage,
        mustNotBecomeClientCanon: true,
      },
      typographicBehaviorSeparateFromFontSelection: true,
    },
  };
}
