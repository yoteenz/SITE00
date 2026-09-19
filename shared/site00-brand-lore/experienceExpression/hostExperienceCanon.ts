/**
 * SITE 00 Host Experience Canon — host operating environment, not client brand.
 */

import type { HostExperienceCanon } from './types.js';

export function buildHostExperienceCanon(): HostExperienceCanon {
  return {
    version: 1,
    hostNavigation: [
      'OperatingWorldTopNav — global authenticated navigation',
      'Site00EcosystemMobileShell — mobile bottom navigation',
      'ExperienceContextBar — client context strip',
      'OperatingWorldStatusRail — desktop status rail',
    ],
    hostTypography: [
      'Martian Mono — SITE 00 host/interface typography (site00-fonts.css)',
      'Host UI labels and wayfinding use host stack — never client brand canon',
    ],
    hostColorBehavior: [
      'Bright white architectural environment',
      'Red host accent for wayfinding and action links (site00-label-red, site00-action-link--red)',
      'High-contrast black/white host shell',
    ],
    hostSpatialBehavior: [
      'Immersive spatial presentation — ecosystem shell with environmental background',
      'Translucent/glass information surfaces in operating world',
      'Project/world location metaphor — founder enters a project location inside SITE 00',
    ],
    hostMaterialBehavior: [
      'Architectural digital-location surfaces',
      'Glass/translucent panels for information',
      'Environmental photography backdrop in desktop shell',
    ],
    hostMotionBehavior: [
      'Subtle shell transitions',
      'Mobile bottom nav persistence',
    ],
    hostWayfinding: [
      'Back to projects navigation',
      'Section CTAs as host-styled action links',
      'Persistent bottom control on mobile',
    ],
    hostResponsiveBehavior: [
      'Desktop: top nav + status rail + wide content wrap',
      'Mobile: bottom nav shell + flush content modes',
      'Breakpoints follow site00-ecosystem-shell split',
    ],
    hostPersistentControls: [
      'Mobile bottom navigation (Site00EcosystemMobileShell)',
      'Global sign-out in control routes',
      'Experience context bar',
    ],
    hostAccessibilityRules: [
      'Touch targets on mobile nav',
      'Semantic sections and alerts on project page',
      'Keyboard-accessible links and buttons',
    ],
    hostUiTypography: 'HOST_UI_TYPOGRAPHY — Martian Mono and host stack only',
    extractedAt: new Date().toISOString(),
  };
}

export function hostClientSeparationValid(host: HostExperienceCanon): boolean {
  return host.hostUiTypography.includes('HOST_UI') && !host.hostTypography.some((t) => t.includes('client canon'));
}
