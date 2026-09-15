import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { TRANSLATION_DRIVEN_CSS_PREFIX } from './constants.js';
import type { TranslationDrivenCssContract, TranslationDrivenStyleSystem } from './translationDrivenTypes.js';

export function buildTranslationDrivenCssContract(styleSystem: TranslationDrivenStyleSystem): TranslationDrivenCssContract {
  const rootClass = TRANSLATION_DRIVEN_CSS_PREFIX;
  const rulesAdded = [
    `.${rootClass} { background: var(--td-black); color: var(--td-text); overflow-x: hidden; }`,
    `.${rootClass}__hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr 0.55fr; gap: 6px; align-items: start; }`,
    `.${rootClass}__authority-rail { display: flex; flex-direction: column; gap: 4px; }`,
    `.${rootClass}__gallery-sheet { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }`,
    `.${rootClass}__structured-band { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }`,
    `.${rootClass}__readiness-row { display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; }`,
    `.${rootClass}__metadata-strip { display: flex; flex-wrap: wrap; gap: 4px; font-size: 9px; }`,
    `.${rootClass}__bottom-nav { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }`,
  ];

  const partial = {
    id: `tdcc-${styleSystem.id}`,
    styleSystemId: styleSystem.id,
    rootClass,
    rulesAdded,
    selectorsRemoved: [
      '.site00-mobile-twin-compiled-impl__hero-grid',
      '.site00-mobile-twin-compiled-impl__gallery',
      '.site00-mobile-twin-compiled-impl__structured',
    ],
    layoutRulesRemoved: ['absolute-positioned wireframe layout', 'generic 2-col structured grid'],
    genericDefaultsRemoved: ['full-width lime buttons', 'stack-all mobile default'],
  };

  return { ...partial, hash: fnv1aHex(JSON.stringify(partial)) };
}
