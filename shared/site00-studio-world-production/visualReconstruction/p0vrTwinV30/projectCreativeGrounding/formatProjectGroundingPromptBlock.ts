import type { AuthorityCreativeGenerationPayload } from './types.js';

export function formatProjectGroundingPromptBlock(payload: AuthorityCreativeGenerationPayload): string {
  const pkg = payload.projectCreativeContextPackage;
  const dna = pkg.creativeDNA;
  const artifactTypes = payload.sharedArtifactFamily.join(', ');
  const forbidden = pkg.visualLanguage.forbiddenMotifs.slice(0, 8).join('; ');
  const dont = pkg.dontRules.map((r) => `- ${r}`).join('\n');
  const doRules = pkg.doRules.map((r) => `- ${r}`).join('\n');
  const jobs = payload.designWorkspaceFunctionContract.jobs.join(', ');
  const sources = pkg.assetSourceMap.sources
    .slice(0, 5)
    .map((s) => `${s.priority}. ${s.label} (${s.sourceId}) → ${s.artifactTypes.join('/')}`)
    .join('\n');

  return `
PROJECT CREATIVE GROUNDING (REQUIRED — P0.VR.TWINV3.0R4):
ProjectCreativeContextPackage v${payload.projectCreativeContextVersion} · ${pkg.projectName} · ${pkg.projectType}

CORE PRINCIPLE: Generate the SITE 00 design workspace FOR this project using the project's ACTUAL creative system — NOT "an interface that looks vaguely like this project."

Project purpose: ${dna.projectPurpose}
Premise: ${dna.projectPremise}
Tone: ${dna.projectTone} · ${dna.emotionalRegister}
Non-negotiables: ${dna.nonNegotiables.join(' | ')}

TERRITORY CONTENT CONSISTENCY: Territories A/B/C share the SAME NDXBOOK artifact family (${artifactTypes}). Difference is SPATIAL COMPOSITION ONLY — not random content themes (no A=book, B=portrait, C=architecture). Same project truth — three spatial solutions only.

Artifact vocabulary types in frame (use these names): ${payload.projectArtifactVocabulary.entries
    .slice(0, 12)
    .map((e) => e.artifactType)
    .join(', ')}.

SOURCE PRIORITY (mandatory):
${payload.sourcePriorityRule}
Approved source map:
${sources}

KNOWN PROJECT ARTIFACTS (prefer these representations): ${pkg.knownProjectArtifacts.join(', ')}

DO:
${doRules}

DO NOT (no generic fallback when context exists):
${dont}

FORBIDDEN VISUAL MOTIFS: ${forbidden}

WORKSPACE FUNCTION CONTRACT — every major region supports real jobs: ${jobs}
Map UI regions to: REVIEW ACTIVE CONCEPT, COMPARE CONCEPTS, APPROVE, REFINE, REGENERATE, INSPECT BLUEPRINT, INSPECT ASSETS, VIEW READINESS, OPEN TECHNICAL DETAILS, MOVE TO BUILD WHEN READY.

NO GENERIC FALLBACK when project context exists — do not fill gaps with generic premium design tool, editorial dashboard, modern SaaS, or minimal admin UI.

NO UNGROUNDED VISUALS: Every image-like object must map to artifactType + source. If depicting placeholder content, use PROJECT-VALID placeholder within artifact family (e.g. NDXBOOK cultural-evidence placeholder) — never random architectural or portrait stock.

TYPOGRAPHY: Host = ${pkg.typographyExpression.hostTypography}. Project workspace = ${pkg.typographyExpression.projectTypography}. ${pkg.typographyExpression.allowedMixing}

MATERIAL: ${pkg.materialLanguage.allowedMaterials.slice(0, 5).join(', ')} — forbidden: ${pkg.materialLanguage.forbiddenMaterials.join(', ')}
`.trim();
}
