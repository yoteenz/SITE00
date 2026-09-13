import type { DesignPageV3TerritoryId } from '../hostProjectExpressionModel.js';
import { P0_VR_TWIN_V30R5F1_LINEAGE } from '../constants.js';
import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureManifestV1.js';
import { buildR5F1MasterAuthorityAmendment } from './masterAmendment.js';

function territoryFeatureExpression(id: DesignPageV3TerritoryId): string {
  if (id === 'A') {
    return `
TERRITORY A (CENTRAL STAGE) — R5F1 AUTHORITY FEATURE EXPRESSION:
- Hero artifact under review; SELECT FOR MOBILE / SELECT FOR DESKTOP adjacent to hero.
- Compact AUTHORITY PAIR status secondary to hero; PROMOTE + PAIR REVIEW + LOCK visible in flow.
`.trim();
  }
  if (id === 'B') {
    return `
TERRITORY B (EDITORIAL WORKBENCH) — R5F1 AUTHORITY FEATURE EXPRESSION:
- Editorial working set remains dominant; compact workbench tray for MOBILE MASTER + DESKTOP MASTER.
- Selection feels like choosing authoritative work from curated table — tray must not dominate.
`.trim();
  }
  return `
TERRITORY C (SPATIAL WORKFLOW) — R5F1 AUTHORITY FEATURE EXPRESSION:
- Spatial stages: CONCEPT CANDIDATES → VIEWPORT SELECTION → PROMOTION → AUTHORITY PAIR → LOCK → DERIVATION.
- Not a generic SaaS wizard — spatial adjacency communicates state.
`.trim();
}

export function formatFeatureManifestPromptBlock(input: {
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
  evolutionMode?: 'FULL_MASTER_REGENERATION' | 'MASTER_AMENDMENT';
}): string {
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const amendment = buildR5F1MasterAuthorityAmendment({ evolutionMode: input.evolutionMode ?? 'MASTER_AMENDMENT' });
  const required = manifest.requiredFeatureIds.join(', ');
  const viewportNote =
    input.viewport === 'mobile' ?
      'MOBILE: one dominant task; authority pair via compact expandable sheet; artifact central.'
    : 'DESKTOP: workstation layout; compact authority pair dock; inspector recessed.';

  return `
${P0_VR_TWIN_V30R5F1_LINEAGE} — DESIGN WORKSPACE FEATURE MANIFEST ${manifest.version}
MANIFEST CHECKSUM ${manifest.checksum}
REQUIRED FEATURES (identical for territories A/B/C — spatial expression only differs):
${required}

MASTER AMENDMENT ${amendment.id} (${amendment.evolutionMode}):
Preserve R4 spatial authorship + project grounding. Change ONLY regions needed for R5 authority-selection workflow.
${amendment.visualChangeInstructions.map((l) => `- ${l}`).join('\n')}

${territoryFeatureExpression(input.territoryId)}

${viewportNote}

Depict believable state: one concept under review; one viewport may show SELECTED to demonstrate workflow (no contradictory dual-lock).

REQUIRED VISIBLE AFFORDANCES (feature coverage — all must appear in mockup chrome/labels):
SITE 00 host + PROJECT + DESIGN context · REFERENCES · ASSETS · PAGES · SKINS · HISTORY · MORE
MOBILE · TABLET · DESKTOP viewport control · TARGET · ACTIVE context
CONCEPT · CANDIDATE · GALLERY · COMPARE · REFINE · REGENERATE · INSPECT · VIEW · FULLSCREEN
SELECT FOR MOBILE · SELECT FOR DESKTOP · AUTHORITY PAIR · MOBILE MASTER · DESKTOP MASTER
PROMOTE MOBILE · PROMOTE DESKTOP · REPLACE · PAIR REVIEW · REVIEW AUTHORITY
LOCK MOBILE + DESKTOP AUTHORITY PAIR · GROUNDING · BLUEPRINT · OVERLAY · ASSET · FUNCTION · OWNERSHIP
READINESS · COMPILER · MOVE TO BUILD · TECHNICAL · BOTTOM SHEET · DRAWER · HISTORY
FEATURE CHANGE · CHANGE HISTORY · MASTER UPDATE · AMENDMENT · PRIMARY ACTION · NEXT ACTION
`.trim();
}
