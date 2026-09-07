/**
 * /enter desktop reference decomposition artifact (Sprint A).
 */

import type { EnterReferenceDecomposition } from '../../../shared/site00-experience-engine/types.js';
import {
  ENTER_DESKTOP_ENVIRONMENT_ASSET,
  ENTER_DESKTOP_VIEWPORT,
  ENTER_DESKTOP_PROOF_REGIONS,
} from '../../../shared/site00-experience-engine/constants.js';

const ENTER_DESKTOP_FOCAL = 'center 75%';

export function createEnterDesktopDecomposition(): EnterReferenceDecomposition {
  const panel = ENTER_DESKTOP_PROOF_REGIONS.find((r) => r.regionId === 'directory-panel')!;
  const strip = ENTER_DESKTOP_PROOF_REGIONS.find((r) => r.regionId === 'status-strip')!;

  return {
    routeId: '/enter',
    viewportClass: 'DESKTOP',
    viewportCanvas: { ...ENTER_DESKTOP_VIEWPORT },
    environment: {
      assetId: ENTER_DESKTOP_ENVIRONMENT_ASSET,
      focal: ENTER_DESKTOP_FOCAL,
      layer: 'BACKGROUND_COVER',
      liveDom: false,
    },
    directoryPanel: {
      role: 'DIRECTORY_PANEL',
      geometry: { ...panel.bounds },
      liveDom: true,
      selectors: ['.site00-enter-layout', '.site00-enter-menu', '.site00-enter-welcome'],
    },
    statusStrip: {
      role: 'STATUS_STRIP',
      geometry: { ...strip.bounds },
      liveDom: true,
      selectors: ['.site00-enter-status-strip', '.site00-summary-strip-panel'],
    },
    typographicHierarchy: [
      'site00-label-red (section numbers)',
      'site00-heading-lg (welcome title)',
      'site00-tagline (subtitle)',
      'site00-body (welcome body)',
      'site00-enter-row__title / __description (menu rows)',
    ],
    alignmentAnchors: [
      'welcome block top-left within directory column',
      'menu scroll region below welcome rule',
      'status strip pinned bottom full width',
      'environment background cover left field',
    ],
    spacingRelationships: [
      'header offset 96px (--site00-enter-header-offset)',
      'status strip height 36px (--site00-bottom-panel-height)',
      'menu padding 16px 24px',
    ],
    imageBasedElements: [ENTER_DESKTOP_ENVIRONMENT_ASSET],
    responsiveBehaviorInferred: [
      'desktop native viewport: environment cover + overlay directory panel',
      'mobile authority NOT inferred — BLOCKED_PENDING_REFERENCE_AUTHORITY',
    ],
  };
}
