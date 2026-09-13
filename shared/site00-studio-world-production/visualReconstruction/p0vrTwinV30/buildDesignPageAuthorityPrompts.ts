import {
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30R2_LINEAGE,
} from './constants.js';
import { canonicalReframeBlock, foundershiTestLine } from './designPageAuthoritySelfCheck.js';
import { formatDesignWorkspaceTypographyCasePromptBlock } from './formatDesignWorkspaceTypographyCasePromptBlock.js';
import { skeletonZoneLabelsForPrompt } from './lockedExperienceSkeleton.js';

const HOST_CLIENT_FIREWALL = `
CRITICAL — HOST / CLIENT (sprint fails if violated):
- HOST = ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME}. Owns shell, page structure, identity, global controls, framing, wayfinding, chrome, review flow structure, layout grammar, red accent logic, operational tone.
- CLIENT = ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} (opened project). Owns project identity, route target, project references/outputs/previews — NEVER the workspace shell.
- PRIMARY DECISION: ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} owns the workspace; ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} is active project inside it.
- If the mockup reads as ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} owning the workspace → FAIL and regenerate.
- Bright/light ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host; no black-dominant ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} app shell.
`.trim();

const R2_QUALITY_BAR = `
MANDATORY LAYOUT CHARACTER: designed product surface · editor/operator control workspace · visual decisions central.
NOT: inspector-only, plain report, documentation sheet, debug dump, Figma screenshot, ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} mini-app.

STRICT FAILURES (regenerate if any): standalone ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} tool; ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} owns shell; text-first console; generic dashboard; technical wall dominates; disconnected artifacts; next action unclear; ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} visually weak.

${foundershiTestLine()}

${P0_VR_TWIN_V30R2_LINEAGE} — polished founder-review-ready mockup, not rough wireframe.
`.trim();

const SHARED_CREATIVE_BRIEF = `
${canonicalReframeBlock()}

${HOST_CLIENT_FIREWALL}

NON-NEGOTIABLE HIERARCHY:
1. ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host environment
2. Active project: ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()}
3. Design-workspace workflow
4. Concept / blueprint / asset / readiness review
5. Technical detail (secondary only)

${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} language: bright/off-white, clean geometry, structured spacing, restrained red accents, typographic hierarchy, differentiated panels.
${formatDesignWorkspaceTypographyCasePromptBlock()}
Visual-first, scan-friendly, decisive — organize workflow visually, do not narrate with paragraphs.
No fake metrics. Representative status chips only.
`.trim();

function zoneCompositionBlock(viewport: 'mobile' | 'desktop'): string {
  const zones = skeletonZoneLabelsForPrompt();
  const form =
    viewport === 'mobile' ?
      'Strong stacking; primary workspace obvious; actions thumb-reachable; no long reading surfaces.'
    : 'Intentional columns; context + main workspace + supporting review; premium operating surface; no dead empty space.';
  return `
REQUIRED PAGE ZONES (A–G — all visible, hierarchical):
${zones}

${form}
`.trim();
}

export function buildMobileDesignPageAuthorityPrompt(input: {
  clientProjectId: string;
  refineNotes?: string[];
}): string {
  const client = input.clientProjectId.toUpperCase();
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve R2 zones + host/client):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY, founder-review-ready UI MOCKUP — MOBILE authority.
Subject: ${DESIGN_PAGE_V3_CANONICAL_PATH} with client project ${client} OPEN (not ${client}-owned app).
Canvas: ${DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX}px; ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host safe areas.

${SHARED_CREATIVE_BRIEF}
${R2_QUALITY_BAR}

${zoneCompositionBlock('mobile')}
${refine}
Output: portrait; unmistakably ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} design workspace with ${client} inside.
`.trim();
}

export function buildDesktopDesignPageAuthorityPrompt(input: {
  clientProjectId: string;
  refineNotes?: string[];
}): string {
  const client = input.clientProjectId.toUpperCase();
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve R2 zones + host/client):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY, founder-review-ready UI MOCKUP — DESKTOP authority.
Subject: ${DESIGN_PAGE_V3_CANONICAL_PATH} with client project ${client} OPEN.
Landscape workstation — NOT stretched mobile; NOT standalone ${client} application window.

${SHARED_CREATIVE_BRIEF}
${R2_QUALITY_BAR}

${zoneCompositionBlock('desktop')}
${refine}
Output: landscape; ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} owns environment; ${client} = active project band.
`.trim();
}
