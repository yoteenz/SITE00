/** Shared FAL prompt block — SITE 00 host + design workspace UI casing law. */
export const DESIGN_WORKSPACE_UI_UPPERCASE_MARKER = 'ALL VISIBLE UI TEXT UPPERCASE';

export function formatDesignWorkspaceTypographyCasePromptBlock(): string {
  return `
TYPOGRAPHY CASE GOVERNANCE (REQUIRED — EVERY PAGE AND SURFACE VISIBLE IN FRAME):
- ${DESIGN_WORKSPACE_UI_UPPERCASE_MARKER} on SITE 00 host chrome: global nav, breadcrumbs, module tabs, buttons, chips, status, compiler/meta, workflow rail, authority dock, decision bar, drawers, bottom sheets.
- If the mockup shows multiple pages, routes, or page previews (PAGES · SKINS · thumbnails · secondary canvases): apply the same uppercase UI rule on EVERY page — no sentence-case or title-case product chrome on any page.
- Host wayfinding and system labels: Martian Mono + uppercase casing (font family ≠ casing rule).
- NDXBOOK workspace may use expressive editorial typefaces for artifacts, but designed UI labels, index marks, metadata lines, and NDX-authored display copy render UPPERCASE unless depicting verbatim external source material (preserve source casing only inside quoted/imported source snippets).
- FAIL if host or workspace controls read in mixed/lowercase while pretending to be product UI.
UPPERCASE IS A CASING RULE — NOT A FONT-FAMILY DECISION.
`.trim();
}
