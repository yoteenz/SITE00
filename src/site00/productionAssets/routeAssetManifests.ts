import type { RouteAssetManifest } from './types';

export const PRODUCTION_ROUTE_ASSET_MANIFESTS: readonly RouteAssetManifest[] = [
  {
    manifestId: 'hub.root',
    route: '/production',
    productionTab: 'hub',
    authorityRef: 'HUB parent — viewport hero crops',
    requiredAssetIds: ['hub.hero.mobile', 'hub.hero.tablet', 'hub.hero.desktop', 'nav.hub'],
    optionalAssetIds: ['hub.crystal'],
    missingSlots: [],
  },
  {
    manifestId: 'inbox.root',
    route: '/production/queue',
    productionTab: 'inbox',
    authorityRef: 'INBOX OPUS2 — typographic / live data',
    requiredAssetIds: ['nav.inbox'],
    optionalAssetIds: [],
    missingSlots: [
      {
        role: 'PROJECT_THUMBNAIL',
        classification: 'MISSING_SOURCE_ASSET',
        note: 'Inbox cards use live project data. No independent OpenArt attachment plate is mounted.',
      },
    ],
  },
  {
    manifestId: 'design.brand',
    route: '/production/:slug/design',
    productionTab: 'design',
    authorityRef: 'DESIGN modes brand|experience|surfaces|compiler|assets|viewport',
    requiredAssetIds: [
      'design.atrium',
      'design.core',
      'design.board.brand',
      'design.board.experience',
      'design.board.surfaces',
      'design.board.compiler',
      'design.board.assets',
      'design.board.viewport',
      'design.viewportCorridor',
      'nav.design',
    ],
    optionalAssetIds: ['design.pack.atrium', 'design.pack.nav.hub'],
    missingSlots: [],
  },
  {
    manifestId: 'experience.world',
    route: '/production/:slug/experience',
    productionTab: 'experience',
    authorityRef: 'EXPERIENCE world overview — one hero plate',
    requiredAssetIds: ['experience.worldHero', 'nav.experience'],
    optionalAssetIds: [],
    missingSlots: [
      {
        role: 'ZONE_PLATE',
        classification: 'SOURCE_MATCH_UNCERTAIN',
        note: '46 mobile + 46 desktop authorities exist as composition boards. Independent zone/portal generations were not separated from those boards in OpenArt history sampled (recent pages are LIBRARY boards). Do not crop the board as a new world asset.',
      },
      {
        role: 'PORTAL',
        classification: 'MISSING_SOURCE_ASSET',
        note: 'No dedicated portal file under production-authority-assets.',
      },
    ],
  },
  {
    manifestId: 'expression.root',
    route: '/production/:slug/expression',
    productionTab: 'expression',
    authorityRef: 'EXPRESSION stage + family shells',
    requiredAssetIds: ['expression.stageHero', 'nav.expression'],
    optionalAssetIds: [],
    missingSlots: [
      {
        role: 'RESIDENT_PORTRAIT',
        classification: 'MISSING_SOURCE_ASSET',
        note: 'SW-001–SW-008 portraits are not mounted in production-authority-assets. Do not treat the empty stage plate as a resident.',
      },
    ],
  },
  {
    manifestId: 'library.root',
    route: '/production/libraries',
    productionTab: 'library',
    authorityRef: 'LIBRARY vault — canon + red geometry',
    requiredAssetIds: ['library.canon', 'library.geometry.01', 'library.geometry.02', 'library.geometry.03', 'nav.library'],
    optionalAssetIds: ['experience.worldHero', 'expression.stageHero'],
    missingSlots: [
      {
        role: 'AUTHORITY_PREVIEW',
        classification: 'SOURCE_MATCH_UNCERTAIN',
        note: 'OpenArt project Q7IHYCEK3RPn2c1ConEG recent history is LIBRARY responsive composition boards (screenshot authorities), not discrete vault thumbnails. Boards are composition authority, not the underlying plate.',
      },
    ],
  },
  {
    manifestId: 'activity.root',
    route: '/production/activity',
    productionTab: 'activity',
    authorityRef: 'ACTIVITY OPUS1 three-viewport',
    requiredAssetIds: ['hub.crystal', 'nav.activity'],
    optionalAssetIds: [],
    missingSlots: [],
  },
];
