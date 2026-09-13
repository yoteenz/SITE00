import { DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX } from './constants.js';
import { skeletonPromptBlock } from './lockedExperienceSkeleton.js';

const SHARED_CREATIVE_BRIEF = `
SITE 00 Design Page — Creative Compiler Workstation (NDXBOOK).
Visual language: bright clean SITE 00, editorial hierarchy, restrained red accents (#E10600 family), high-contrast decision states.
NOT generic SaaS dashboard, NOT endless console, NOT CMS admin.
Host shell (global nav, account, notifications) stays minimal and separate — design workspace owns the creative compiler interior.
Use real workflow labels: TARGET, MASTER, BUNDLE, APPROVE, BUILD, FIDELITY, MASTER VISUAL, BLUEPRINT TWIN, OVERLAY, OBJECT DATA, ASSETS, FUNCTIONS, LINEAGE, COMPILER READINESS.
Do NOT invent fake metrics or percentages. Use representative status chips only (e.g. READY, BLOCKED, PASS) without numeric KPIs.
One primary decision + one dominant primary action visible. Secondary actions visually subordinate.
Technical details collapsed (mobile bottom sheet hint / desktop right drawer hint) — not dominant.
`.trim();

export function buildMobileDesignPageAuthorityPrompt(input: {
  projectLabel: string;
  refineNotes?: string[];
}): string {
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve product skeleton):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY UI MOCKUP (single static screen) for MOBILE design page authority.
Canvas: ${DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX}px product width inside preserved SITE 00 host safe areas.
Project context: ${input.projectLabel} — founder design workstation.

${SHARED_CREATIVE_BRIEF}

LOCKED PRODUCT AREAS (must all appear, creative may recompose layout):
${skeletonPromptBlock()}

MOBILE COMPOSITION:
- One dominant master concept preview (large, center stage)
- Compact target context strip (project, page, route, viewport)
- Glanceable workflow journey rail (TARGET→MASTER→BUNDLE→APPROVE→BUILD→FIDELITY) with state chips
- Obvious CURRENT DECISION / primary CTA (e.g. APPROVE MASTER)
- Derivative bundle shown as one family (master + blueprint twin + overlay tabs as siblings)
- Asset workspace as visual thumbnails grid (not text table)
- Function/ownership compact map (host vs client zones)
- Compiler readiness pre-flight checklist
- BUILD phase visually gated
- Fidelity compare zone hinted but secondary
- Technical details: collapsed bottom sheet affordance
${refine}
Output: polished product UI mock, portrait orientation, no lorem paragraphs.
`.trim();
}

export function buildDesktopDesignPageAuthorityPrompt(input: {
  projectLabel: string;
  refineNotes?: string[];
}): string {
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE NOTES (preserve product skeleton):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  return `
Generate a HIGH-FIDELITY UI MOCKUP (single static screen) for DESKTOP design page authority.
Landscape workstation layout — NOT stretched mobile cards.
Project context: ${input.projectLabel} — founder design workstation.

${SHARED_CREATIVE_BRIEF}

LOCKED PRODUCT AREAS (must all appear, creative may recompose layout):
${skeletonPromptBlock()}

DESKTOP COMPOSITION:
- Persistent left/top target + workflow context
- Large central master concept review canvas
- Adjacent derivative bundle / asset inspector column where helpful
- Right-side collapsed technical details drawer affordance
- Strong horizontal rhythm, less vertical stacking than mobile
- Same workflow semantics as mobile sibling authority
${refine}
Output: polished product UI mock, landscape orientation, no lorem paragraphs.
`.trim();
}
