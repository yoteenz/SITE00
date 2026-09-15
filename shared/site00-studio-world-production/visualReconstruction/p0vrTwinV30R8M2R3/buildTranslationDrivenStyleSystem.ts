import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ImplementationTranslationBrief } from '../p0vrTwinV30R8M2R2/implementationTranslationBriefTypes.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import { TRANSLATION_DRIVEN_CSS_PREFIX } from './constants.js';
import type { TranslationDrivenStyleSystem } from './translationDrivenTypes.js';

export function buildTranslationDrivenStyleSystem(input: {
  brief: ImplementationTranslationBrief;
  expressionIr: ImplementationExpressionIR;
}): TranslationDrivenStyleSystem {
  const partial = {
    id: `tdss-${input.brief.id}`,
    palette: {
      '--td-black': '#0a0a0a',
      '--td-ink': '#111111',
      '--td-panel': '#0f0f0f',
      '--td-text': '#f0f0f0',
      '--td-muted': '#9a9a9a',
      '--td-lime': '#c8ff00',
      '--td-border': '#333333',
    },
    typographyHierarchy: {
      display: '900 20px/1.05 uppercase',
      section: '700 9px/1.3 0.1em uppercase',
      body: '500 11px/1.35',
      meta: '500 9px/1.2 monospace',
      control: '700 10px/1 uppercase',
    },
    surfaceClasses: [
      `${TRANSLATION_DRIVEN_CSS_PREFIX}__surface-host`,
      `${TRANSLATION_DRIVEN_CSS_PREFIX}__surface-project`,
      `${TRANSLATION_DRIVEN_CSS_PREFIX}__surface-hero`,
      `${TRANSLATION_DRIVEN_CSS_PREFIX}__surface-rail`,
    ],
    borderSystem: '1px solid var(--td-border); sharp 2–4px radius',
    selectedStateSystem: '2px inset lime ring on SELECTED; never all-primary lime',
    controlHierarchy: {
      PRIMARY: 'lime fill #0a0a0a text',
      SECONDARY: '#161616 neutral border',
      SELECTED: 'lime ring',
      NEUTRAL: 'transparent #2a2a2a',
      LOCKED: 'dashed #666',
      SYSTEM: '#050505 host',
    },
    spacingSystem: {
      sectionGapPx: input.expressionIr.spatialRhythmSystem.sectionGapPx,
      innerPaddingPx: 8,
      cardGapPx: 4,
      railGapPx: 4,
    },
    densitySystem: input.brief.globalTranslation.includes('dense') ? 'editorial-compact' : 'compact',
  };
  return { ...partial, hash: fnv1aHex(JSON.stringify(partial)) };
}
