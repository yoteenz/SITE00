import { DESIGN_PAGE_V3_CANONICAL_PATH, DESIGN_PAGE_V3_HOST_PRODUCT_NAME } from './constants.js';

/** Programmatic pre-flight for R2 authority prompts / prototypes (not visual ML). */
export type DesignPageAuthoritySelfCheck = {
  site00OwnsEnvironment: boolean;
  ndxbookIsClientNotHost: boolean;
  canonicalPathPresent: boolean;
  zonesDocumented: boolean;
  noStandaloneNdxbookAppLanguage: boolean;
  pass: boolean;
  failures: string[];
};

export function runDesignPageAuthoritySelfCheck(input: {
  promptOrArtifactText: string;
  zoneCount: number;
  minimumZones?: number;
}): DesignPageAuthoritySelfCheck {
  const t = input.promptOrArtifactText;
  const lower = t.toLowerCase();
  const failures: string[] = [];

  const site00OwnsEnvironment =
    t.includes(DESIGN_PAGE_V3_HOST_PRODUCT_NAME) &&
    (lower.includes('host') || lower.includes('shell') || lower.includes('site 00'));
  if (!site00OwnsEnvironment) failures.push('SITE_00_HOST_WEAK');

  const ndxbookIsClientNotHost =
    lower.includes('project: ndxbook') || lower.includes('client') || lower.includes('open inside');
  if (!ndxbookIsClientNotHost) failures.push('NDXBOOK_CLIENT_CONTEXT_MISSING');

  const canonicalPathPresent = t.includes('SITE 00') && lower.includes('design');
  if (!canonicalPathPresent) failures.push('CANONICAL_DESIGN_PATH_MISSING');

  const minimumZones = input.minimumZones ?? 7;
  const zonesDocumented = input.zoneCount >= minimumZones;
  if (!zonesDocumented) failures.push('R2_ZONES_INCOMPLETE');

  const badStandalone =
    /ndxbook design (app|tool|workstation)/i.test(t) && !/fail if|not a ndxbook/i.test(t);
  const noStandaloneNdxbookAppLanguage = !badStandalone;
  if (!noStandaloneNdxbookAppLanguage) failures.push('STANDALONE_NDXBOOK_APP_DRIFT');

  return {
    site00OwnsEnvironment,
    ndxbookIsClientNotHost,
    canonicalPathPresent,
    zonesDocumented,
    noStandaloneNdxbookAppLanguage,
    pass: failures.length === 0,
    failures,
  };
}

export function foundershiTestLine(): string {
  return `"This is ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME}'s design workspace, and I am currently working on the NDXBOOK project inside it." — required founder reaction.`;
}

export function canonicalReframeBlock(): string {
  return `
CANONICAL REFRAME (zero ambiguity):
${DESIGN_PAGE_V3_CANONICAL_PATH}
PURPOSE: founder operational workspace for directing, reviewing, and approving page-upgrade outputs.
NOT: NDXBOOK standalone app · NOT NDXBOOK-owned shell · NOT NDX overview page redesign.
`.trim();
}
