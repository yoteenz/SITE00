/** Compiler semantics — must never appear as visible production copy. */
export const SEMANTIC_DEBUG_LABEL_PATTERNS = [
  /^HOST NAV$/i,
  /^DOMINANT HEADLINE$/i,
  /^DOMINANT SUBCOPY$/i,
  /^ARTIFACT IMAGE$/i,
  /^GALLERY THUMB/i,
  /^GROUNDING CARD$/i,
  /^BLUEPRINT CARD$/i,
  /^OVERLAY CARD$/i,
  /^ASSETS CARD$/i,
  /^FUNCTION CARD$/i,
  /^READINESS GAUGE$/i,
  /^PRIMARY NEXT ACTION$/i,
  /^TECHNICAL DETAILS TRIGGER$/i,
  /^HOST SHELL$/i,
  /^PRIMARY WORKSPACE$/i,
  /^AUTHORITY SIDE PANEL$/i,
  /^STRUCTURED OUTPUT$/i,
  /^READINESS PANEL$/i,
  /^GALLERY STRIP$/i,
  /^DECISION BAR$/i,
  /^CONTEXT STRIP$/i,
  /^MOBILE BOTTOM NAV SHELL$/i,
] as const;

export function isSemanticDebugLabel(text: string): boolean {
  const normalized = text.trim().replace(/_/g, ' ');
  return SEMANTIC_DEBUG_LABEL_PATTERNS.some((re) => re.test(normalized));
}

export function assertProductionCopyAllowed(text: string, objectId: string): void {
  if (isSemanticDebugLabel(text)) {
    throw new Error(`SEMANTIC_DEBUG_LABEL_RENDERED:${objectId}:${text}`);
  }
}

export function scanDocumentForSemanticLabelViolations(nodes: { objectId: string; displayText?: string | null }[]): string[] {
  const violations: string[] = [];
  for (const n of nodes) {
    const t = n.displayText?.trim();
    if (t && isSemanticDebugLabel(t)) violations.push(n.objectId);
  }
  return violations;
}
