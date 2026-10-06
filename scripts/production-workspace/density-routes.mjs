/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — route set for the
 * density / media audit. Root tabs first (HUB is the authority), then material child pages.
 */
export const ROOT_TABS = [
  { id: 'hub', tab: 'HUB', route: '/production' },
  { id: 'inbox', tab: 'INBOX', route: '/production/queue' },
  { id: 'design', tab: 'DESIGN', route: '/production/ndxbook/design' },
  { id: 'experience', tab: 'EXPERIENCE', route: '/production/ndxbook/experience' },
  { id: 'expression', tab: 'EXPRESSION', route: '/production/ndxbook/expression' },
  { id: 'library', tab: 'LIBRARY', route: '/production/libraries' },
  { id: 'activity', tab: 'ACTIVITY', route: '/production/activity' },
];

export const CHILD_PAGES = [
  { id: 'design-brand', tab: 'DESIGN', route: '/production/ndxbook/design?mode=brand' },
  { id: 'design-surfaces', tab: 'DESIGN', route: '/production/ndxbook/design?mode=surfaces' },
  { id: 'design-assets', tab: 'DESIGN', route: '/production/ndxbook/design?mode=assets' },
  { id: 'design-viewport', tab: 'DESIGN', route: '/production/ndxbook/design?mode=viewport' },
  { id: 'experience-world', tab: 'EXPERIENCE', route: '/production/ndxbook/experience/world' },
  { id: 'experience-environments', tab: 'EXPERIENCE', route: '/production/ndxbook/experience/environments' },
  { id: 'expression-narrative', tab: 'EXPRESSION', route: '/production/ndxbook/expression/narrative' },
  { id: 'expression-casting-actors', tab: 'EXPRESSION', route: '/production/ndxbook/expression/casting/actors' },
  { id: 'expression-wardrobe-looks', tab: 'EXPRESSION', route: '/production/ndxbook/expression/wardrobe/looks' },
  { id: 'expression-sets-environments', tab: 'EXPRESSION', route: '/production/ndxbook/expression/sets/environments' },
  { id: 'expression-storyboard', tab: 'EXPRESSION', route: '/production/ndxbook/expression/storyboard' },
  { id: 'library-collection-open', tab: 'LIBRARY', route: '/production/libraries', click: '[data-testid="library-actors"]' },
  { id: 'library-in-review', tab: 'LIBRARY', route: '/production/libraries', click: '[data-testid="library-tabs"] [role="tab"]:nth-child(2)' },
  // a LENS of the ACTIVITY root (same root hero + display title), audited as a material view state
  { id: 'activity-approvals', tab: 'ACTIVITY', route: '/production/activity?view=approvals', rootLens: true },
  { id: 'activity-milestone', tab: 'ACTIVITY', route: '/production/activity?milestone=narrative' },
  { id: 'inbox-watching', tab: 'INBOX', route: '/production/queue?view=watching' },
  { id: 'inbox-all', tab: 'INBOX', route: '/production/queue?view=all' },
  { id: 'inbox-decision-detail', tab: 'INBOX', route: '/production/queue', click: '[data-testid="inbox-review"]' },
];

export const VIEWPORTS = {
  mobile: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 834, height: 1194, deviceScaleFactor: 1, isMobile: false, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};
