import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ImplementationTranslationBrief } from './implementationTranslationBriefTypes.js';
import type { VisualImplementationCodingPrompt } from './implementationTranslationBriefTypes.js';
import { VISUAL_IMPLEMENTATION_CODING_PROMPT_VERSION } from './constants.js';

const PREAMBLE =
  'BUILD THE APPROVED MOBILE DESIGN PAGE EXACTLY AS TRANSLATED BELOW.\n' +
  'DO NOT REDESIGN.\n' +
  'DO NOT GENERALIZE.\n' +
  'DO NOT SUBSTITUTE GENERIC DASHBOARD PATTERNS.\n' +
  'DO NOT INVENT VISUAL HIERARCHY.\n\n' +
  'USE:\n' +
  '- STRUCTURED PACKAGE FOR OBJECT IDENTITY, FUNCTION, OWNERSHIP\n' +
  '- BLUEPRINT AUTHORITY FOR GEOMETRY AND RELATIONSHIPS\n' +
  '- ACTUAL AUTHORITY + IMPLEMENTATION TRANSLATION BRIEF FOR VISUAL EXPRESSION\n';

function sectionBody(brief: ImplementationTranslationBrief): string {
  const lines: string[] = [];
  const push = (title: string, text: string) => {
    lines.push(`## ${title}`, text, '');
  };

  push('GLOBAL PAGE CHARACTER', brief.globalTranslation);
  for (const s of brief.sectionTranslations) {
    push(s.title, s.implementationGuidance);
  }
  push('TYPOGRAPHY', brief.typographyTranslation);
  push('COLOR / MATERIAL', brief.colorMaterialTranslation);
  push('ASSET TREATMENT', brief.assetTranslation);
  push('CONTROL HIERARCHY', brief.controlTranslation);
  push('INTERACTION STATES', brief.interactionTranslation);
  push('RESPONSIVE BEHAVIOR', brief.responsiveTranslation);
  push('DO NOT DO', brief.doNotDo);
  push(
    'IMPLEMENTATION CONSTRAINTS',
    'Compiler must consume this prompt with structured package + expression IR + canonical assets. ' +
      'Semantic/function conflicts resolve to structured truth. Geometry conflicts defer to blueprint.',
  );

  return lines.join('\n');
}

export function buildVisualImplementationCodingPrompt(brief: ImplementationTranslationBrief): VisualImplementationCodingPrompt {
  const body = sectionBody(brief);
  const fullText = `${PREAMBLE}\n${body}`;
  const partial = {
    id: `vicp-${brief.id}`,
    translationBriefId: brief.id,
    briefVersion: brief.briefVersion,
    promptVersion: VISUAL_IMPLEMENTATION_CODING_PROMPT_VERSION,
    preamble: PREAMBLE,
    body,
    fullText,
  };
  const hash = fnv1aHex(JSON.stringify(partial));
  return { ...partial, hash };
}
