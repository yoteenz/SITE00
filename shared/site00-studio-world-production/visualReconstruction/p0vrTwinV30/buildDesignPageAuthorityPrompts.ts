import {
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
} from './constants.js';
import { skeletonPromptBlock } from './lockedExperienceSkeleton.js';

const HOST_CLIENT_FIREWALL = `
CRITICAL — HOST / CLIENT (fail if wrong):
- HOST = ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} (the product). Owns shell, frame, wayfinding, nav language, system red accents, operational tone, persistent controls.
- CLIENT = opened project (e.g. ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()}). Owns project title, artifact being upgraded, project-specific previews ONLY inside the workspace — NOT the app chrome.
- The mockup must read: "${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} → PROJECT: ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} → PAGE: DESIGN"
- FAIL if it looks like a standalone ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} design application or ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()}-branded shell.
- Do NOT use black-heavy ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()} app aesthetic for the host; bright white/off-white SITE 00 environment.
`.trim();

const SHARED_CREATIVE_BRIEF = `
${HOST_CLIENT_FIREWALL}

VISUAL HIERARCHY (strict order):
1. ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host shell / page frame (largest brand presence in chrome)
2. Active client project context (project open indicator — secondary to host)
3. DESIGN page workflow (review, approve, readiness — operational workspace)
4. Individual artifacts + technical details (tertiary)

SITE 00 design language: bright white/off-white, clean operational framing, red host accents, strong structure, founder daily-use workstation.
NOT: generic SaaS dashboard, endless text console, CMS admin, NDX overview page, fake KPIs.
One primary decision + one dominant primary action. Technical details collapsed (mobile bottom sheet / desktop right drawer).
Use workflow labels where helpful: review, approve, refine, regenerate, compare, readiness — not long prose blocks.
`.trim();

export function buildMobileDesignPageAuthorityPrompt(input: {
  clientProjectId: string;
  refineNotes?: string[];
}): string {
  const client = input.clientProjectId.toUpperCase();
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve host/client skeleton):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY UI MOCKUP — MOBILE authority for the ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN page with client project ${client} OPEN inside it.
Canvas: ${DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX}px width; ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host safe areas preserved.

${SHARED_CREATIVE_BRIEF}

LOCKED AUTHORITY AREAS (must appear; creative may recompose):
${skeletonPromptBlock()}

MOBILE COMPOSITION:
- Prominent ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host header + breadcrumb (${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} · ${client} · DESIGN)
- Dominant PRIMARY WORK AREA (central design-upgrade task — visual focal point)
- Compact CLIENT TARGET CONTEXT (project ${client}, route/page, mobile context, workflow stage chip)
- DECISION REVIEW surface with one primary CTA (approve / refine / regenerate hierarchy)
- STRUCTURED ARTIFACT GROUPING (authority visual, blueprint, overlay, assets — grouped, not text dump)
- SECONDARY DETAIL collapsed bottom-sheet affordance
${refine}
Output: portrait UI mock; must unmistakably be ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} host with ${client} open — not a ${client} app.
`.trim();
}

export function buildDesktopDesignPageAuthorityPrompt(input: {
  clientProjectId: string;
  refineNotes?: string[];
}): string {
  const client = input.clientProjectId.toUpperCase();
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve host/client skeleton):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY UI MOCKUP — DESKTOP authority for the ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN page with client project ${client} OPEN inside it.
Landscape workstation — NOT stretched mobile cards; NOT a standalone ${client} application window.

${SHARED_CREATIVE_BRIEF}

LOCKED AUTHORITY AREAS (must appear; creative may recompose):
${skeletonPromptBlock()}

DESKTOP COMPOSITION:
- Persistent ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} shell + wayfinding + project selector showing ${client} as OPEN project
- Large PRIMARY WORK AREA (center — design upgrade review)
- Side context for CLIENT TARGET + structured artifact groups
- Right-side SECONDARY DETAIL drawer (collapsed)
- Host red accents on ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} controls only; ${client} identity inside project band, not replacing host
${refine}
Output: landscape UI mock; reads as ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} design workspace with ${client} open.
`.trim();
}
