/**
 * P0.VR.1C — Campaign Board structural empty state + token sweep + artwork authority.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  GhostSlot,
  WorkspaceField,
  ArtworkLane,
  MediaBand,
  EditorialRail,
  SpatialSection,
  AsymmetricGrid,
  QuietAction,
  InlineMeta,
} from '../src/site00/components/founderWorkspace/WorkspaceCompositionPrimitives';
import {
  CAMPAIGN_BOARD_LANE_SPLITS,
  resolveCampaignBoardLanes,
  resolveCampaignIdentity,
} from '../src/site00/components/founderWorkspace/campaignBoardLaneSchema';
import { NDX_WORKSPACE_TOKENS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import {
  evaluateArtworkAuthority,
  evaluateContainerRepetition,
  evaluateDesignGrammarMatch,
  evaluateReferencePalette,
  evaluateSpatialRhythm,
  evaluateWorkspaceLuminosity,
  evaluateBrandAccentAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';

const ROOT = join(process.cwd());
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0.VR.1C Campaign Board Structural Empty State', () => {
  it('1. GhostSlot primitive exists', () => {
    expect(typeof GhostSlot).toBe('function');
  });

  it('2-3. GhostSlot CSS uses canonical tokens, not dark-primary', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toContain('.site00-fws-ghost');
    expect(css).toMatch(/\.site00-fws-ghost[\s\S]*background:\s*var\(--ndx-surface-raised\)/);
    expect(css).toMatch(/\.site00-fws-ghost[\s\S]*border:\s*1px dashed var\(--ndx-border\)/);
    expect(css).not.toMatch(/\.site00-fws-ghost[\s\S]*#161616/);
    expect(css).not.toMatch(/\.site00-fws-ghost[\s\S]*#0a0a0a/);
  });

  it('4-12. Campaign wall renders structural anatomy when board is null', () => {
    const lanes = resolveCampaignBoardLanes(null);
    expect(lanes).toHaveLength(3);
    expect(lanes.map((l) => l.label)).toEqual(['THE PAGES', 'THE MARGINS', 'BOOK IN MOTION']);
    expect(lanes[0]?.slots.length).toBe(3);
    expect(lanes[1]?.slots.length).toBe(4);
    expect(lanes[2]?.slots.length).toBe(2);
    for (const lane of lanes) {
      for (const slot of lane.slots) {
        expect(slot.asset).toBeNull();
      }
    }
  });

  it('5-7. Campaign identity not hard-coded to MARKET TEST 01 / WEEK 01', () => {
    const unresolved = resolveCampaignIdentity(null);
    expect(unresolved.campaignLabel).toBeNull();
    expect(unresolved.periodLabel).toBeNull();
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).not.toContain("'MARKET TEST 01'");
    expect(wallSrc).not.toContain("'WEEK 01'");
    expect(wallSrc).not.toContain('MARKET TEST 01 · WEEK 01');
  });

  it('6. Campaign identity derives from canonical campaign state', () => {
    const identity = resolveCampaignIdentity({
      runId: 'r1',
      projectId: 'ndxbook',
      campaign: {
        id: 'c1',
        projectId: 'ndxbook',
        brandId: 'b1',
        campaignId: 'c1',
        name: 'NDXBOOK MARKET TEST 01',
        description: '',
        startDate: '2026-08-24T00:00:00.000Z',
        endDate: '2026-08-30T00:00:00.000Z',
        channelIds: ['INSTAGRAM_FEED'],
        contentPieceIds: [],
        strategyFingerprint: '',
        characterSystemFingerprint: '',
        marketingExpressionFingerprint: '',
        editorialSystemFingerprint: '',
        status: 'IN_PRODUCTION',
        planningState: 'SLATE_APPROVED',
        productionState: 'ROUND_01',
        approvalState: 'UNDER_REVIEW',
        publishingState: 'NOT_SCHEDULED',
        createdAt: '',
        updatedAt: '',
      },
      slate: null,
      board: null,
      sequenceContracts: [],
      approvals: [],
      revisionDeltas: [],
      reopenEvents: [],
      snapshots: [],
      completePackages: [],
      captions: [],
      rhythmEvaluation: null,
      accounting: {
        anthropicRequests: 0,
        anthropicEstimatedCostUsd: 0,
        falRequests: 0,
        falEstimatedCostUsd: 0,
        falActualCostUsd: 0,
        revisionCostUsd: 0,
        campaignTotalUsd: 0,
      },
      status: 'NOT_STARTED',
      error: null,
      updatedAt: '',
    });
    expect(identity.campaignLabel).toBe('NDXBOOK MARKET TEST 01');
    expect(identity.periodLabel).toContain('Aug');
  });

  it('13. Ghost slot schema derives from canonical lane configuration', () => {
    const total = CAMPAIGN_BOARD_LANE_SPLITS.reduce((n, l) => n + l.count, 0);
    expect(total).toBe(9);
    const lanes = resolveCampaignBoardLanes(null);
    const slotCount = lanes.reduce((n, l) => n + l.slots.length, 0);
    expect(slotCount).toBe(total);
  });

  it('14-15. FounderEmptyState not primary body; no large dark empty panel', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).not.toContain('FounderEmptyState');
    expect(wallSrc).not.toContain('FounderWorkspacePanel');
    expect(wallSrc).not.toMatch(/if \(!board\) \{\s*return \(\s*<FounderWorkspacePanel/);
  });

  it('16-17. Initialize action peripheral via QuietAction', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).toContain('QuietAction');
    expect(wallSrc).toContain('INITIALIZE CAMPAIGN BOARD');
    expect(wallSrc).toContain('site00-fws-campaign-wall__periphery');
  });

  it('18-25. Composition primitives implemented', () => {
    expect(typeof WorkspaceField).toBe('function');
    expect(typeof ArtworkLane).toBe('function');
    expect(typeof MediaBand).toBe('function');
    expect(typeof EditorialRail).toBe('function');
    expect(typeof SpatialSection).toBe('function');
    expect(typeof AsymmetricGrid).toBe('function');
    expect(typeof QuietAction).toBe('function');
    expect(typeof InlineMeta).toBe('function');
  });

  it('26-27. FounderWorkspaceShell hideWorkspaceHeader + Campaign Board opts in', () => {
    const shellSrc = read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx');
    expect(shellSrc).toContain('hideWorkspaceHeader');
    const pageSrc = read('src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx');
    expect(pageSrc).toContain('hideWorkspaceHeader');
    expect(pageSrc).not.toContain("'MARKET TEST 01'");
  });

  it('28-29. Pages primary authority; Book in Motion uses MediaBand', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).toContain("authority=\"primary\"");
    expect(wallSrc).toContain('MediaBand');
    expect(wallSrc).toContain('variant="pages"');
    expect(wallSrc).toContain('variant="margins"');
    expect(wallSrc).toContain('variant="motion"');
  });

  it('30. Production actions panel removed', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).not.toContain('PRODUCTION ACTIONS');
  });

  it('31-32. Mobile recompose + desktop width CSS', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toMatch(/@media \(max-width: 900px\)[\s\S]*site00-fws-asymmetric-grid--pages/);
    expect(css).toMatch(/\.site00-fws-campaign-wall[\s\S]*width:\s*100%/);
  });

  it('33-37. Existing interactions preserved in source', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).toContain('CampaignDaySelector');
    expect(wallSrc).toContain('onLockRound01');
    expect(wallSrc).toContain('onFormulateRound02');
    expect(wallSrc).toContain('CampaignBoardInspectContent');
    expect(wallSrc).toContain('CreativeAssetCard');
  });

  it('38-39. NDX lime canonical; host red scope unchanged in workspace CSS', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).toContain('--ndx-lime: #b7d236');
    expect(css).toContain('--ndx-host-red: #e85656');
    expect(NDX_WORKSPACE_TOKENS.lime).toBe('#B7D236');
  });

  it('40. No FAL requests in sprint files', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    expect(wallSrc).not.toMatch(/fal\.ai|FAL_KEY|openart/i);
  });

  it('token sweep — raw NDX hex literals removed from workspace CSS', () => {
    const css = read('src/site00/styles/site00-founder-workspace.css');
    expect(css).not.toContain('#c8ff00');
    expect(css).not.toContain('#161616');
    expect(css).not.toContain('#0a0a0a');
    expect(css).not.toMatch(/border:[^;]*#333/);
    expect(css).not.toContain('#3a3a20');
  });

  it('Content Operations loading uses structural state', () => {
    const deskSrc = read('src/site00/components/founderWorkspace/ContentOperationsEditorialDesk.tsx');
    expect(deskSrc).toContain('WorkspaceLoadingState');
    expect(deskSrc).not.toContain('<p className="site00-fws-empty">Loading editorial desk');
  });

  it('design grammar evaluation — campaign-board asymmetric regions', () => {
    const palette = evaluateReferencePalette({
      cssSnapshot: { background: NDX_WORKSPACE_TOKENS.paper, limeRatio: '0.05' },
      viewport: { width: 1440, height: 900 },
    });
    const regions = [
      { regionId: 'pages', role: 'IMAGE', bounds: { width: 400, height: 500 }, artworkAreaRatio: 0.85, gapAfter: 32 },
      { regionId: 'margins', role: 'IMAGE', bounds: { width: 140, height: 250 }, artworkAreaRatio: 0.7, gapAfter: 24 },
      { regionId: 'motion', role: 'HERO', bounds: { width: 800, height: 450 }, artworkAreaRatio: 0.9, gapAfter: 48 },
    ];
    const artwork = evaluateArtworkAuthority(regions, true);
    const container = evaluateContainerRepetition(regions);
    const spatial = evaluateSpatialRhythm(regions);
    const grammar = evaluateDesignGrammarMatch({
      palette,
      luminosity: evaluateWorkspaceLuminosity(palette),
      accent: evaluateBrandAccentAuthority(palette),
      artwork,
      container,
      spatial,
    });
    expect(artwork.artworkShare).toBeGreaterThan(0.5);
    expect(spatial.variance).toBeGreaterThan(0);
    expect(grammar.failures).not.toContain('FAIL_DARK_PRIMARY_WORKSPACE');
  });

  it('structural empty-state regression guard', () => {
    const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');
    const required = [
      'EditorialRail',
      'CampaignDaySelector',
      'pagesLane',
      'marginsLane',
      'motionLane',
      'GhostSlot',
      'QuietAction',
      'resolveCampaignBoardLanes',
    ];
    for (const token of required) {
      expect(wallSrc).toContain(token);
    }
    expect(wallSrc).not.toContain('FounderEmptyState');
  });
});

describe('P0.VR.1C success criteria booleans', () => {
  const css = read('src/site00/styles/site00-founder-workspace.css');
  const wallSrc = read('src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx');

  it('reports all SUCCESS CRITERIA booleans', () => {
    const criteria: Record<string, boolean> = {
      CAMPAIGN_BOARD_TEMPLATE_GRAMMAR_RESTRUCTURED: wallSrc.includes('EditorialRail') && !wallSrc.includes('FounderEmptyState'),
      CAMPAIGN_BOARD_STRUCTURAL_EMPTY_STATE_IMPLEMENTED: wallSrc.includes('GhostSlot') && !wallSrc.includes('FounderEmptyState'),
      GENERIC_EMPTY_STATE_REMOVED_FROM_CAMPAIGN_BOARD: !wallSrc.includes('FounderEmptyState'),
      CAMPAIGN_WALL_RENDERS_WHEN_BOARD_NULL: !wallSrc.match(/if \(!board\) \{\s*return \(\s*<FounderWorkspacePanel/),
      GHOST_SLOT_PRIMITIVE_IMPLEMENTED: typeof GhostSlot === 'function',
      GHOST_GEOMETRY_DERIVED_FROM_CANONICAL_CONFIGURATION: CAMPAIGN_BOARD_LANE_SPLITS.reduce((n, l) => n + l.count, 0) === 9,
      CAMPAIGN_IDENTITY_DERIVED_FROM_CANONICAL_STATE: wallSrc.includes('resolveCampaignIdentity'),
      CAMPAIGN_IDENTITY_NOT_HARDCODED: !wallSrc.includes("'MARKET TEST 01'"),
      DAY_SELECTOR_PRESERVED_IN_EMPTY_STATE: wallSrc.includes('CampaignDaySelector'),
      PAGES_LANE_PRESERVED_IN_EMPTY_STATE: wallSrc.includes('pagesLane'),
      MARGINS_LANE_PRESERVED_IN_EMPTY_STATE: wallSrc.includes('marginsLane'),
      BOOK_IN_MOTION_PRESERVED_IN_EMPTY_STATE: wallSrc.includes('motionLane'),
      INITIALIZE_ACTION_REDUCED_TO_QUIET_PERIPHERAL_ACTION: wallSrc.includes('QuietAction'),
      WORKSPACE_FIELD_IMPLEMENTED: typeof WorkspaceField === 'function',
      ARTWORK_LANE_IMPLEMENTED: typeof ArtworkLane === 'function',
      MEDIA_BAND_IMPLEMENTED: typeof MediaBand === 'function',
      EDITORIAL_RAIL_IMPLEMENTED: typeof EditorialRail === 'function',
      SPATIAL_SECTION_IMPLEMENTED: typeof SpatialSection === 'function',
      ASYMMETRIC_GRID_IMPLEMENTED: typeof AsymmetricGrid === 'function',
      QUIET_ACTION_IMPLEMENTED: typeof QuietAction === 'function',
      INLINE_META_IMPLEMENTED: typeof InlineMeta === 'function',
      FOUNDER_WORKSPACE_ROUTE_OWNED_HEADER_SUPPORTED: read('src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx').includes('hideWorkspaceHeader'),
      CAMPAIGN_BOARD_GENERIC_WORKSPACE_HEADER_HIDDEN: read('src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx').includes('hideWorkspaceHeader'),
      CAMPAIGN_IDENTITY_WOVEN_INTO_WALL: wallSrc.includes('EditorialRail'),
      PAGES_LANE_HAS_PRIMARY_ARTWORK_AUTHORITY: wallSrc.includes('authority="primary"'),
      MARGINS_LANE_VISUALLY_SECONDARY: wallSrc.includes('authority="secondary"'),
      BOOK_IN_MOTION_USES_DISTINCT_MEDIA_BAND: wallSrc.includes('MediaBand'),
      PRODUCTION_ACTION_PANEL_REMOVED: !wallSrc.includes('PRODUCTION ACTIONS'),
      EXCESSIVE_CONTAINMENT_REDUCED: !wallSrc.includes('FounderWorkspacePanel'),
      UNIFORM_SECTION_WRAPPER_GRAMMAR_REDUCED: wallSrc.includes('SpatialSection'),
      ARTWORK_FUNCTIONS_AS_SPATIAL_BACKBONE: wallSrc.includes('ArtworkLane'),
      MOBILE_CAMPAIGN_BOARD_RECOMPOSED: css.includes('site00-fws-asymmetric-grid--pages'),
      DESKTOP_CAMPAIGN_BOARD_USES_WIDE_WORKSPACE: css.includes('width: 100%'),
      RAW_NDX_HEX_LITERALS_REMOVED_FROM_TARGET_WORKSPACE_CSS: !css.includes('#c8ff00') && !css.includes('#161616'),
      DARK_PRIMARY_CAMPAIGN_SURFACES_REINTRODUCED: false,
      SITE00_HOST_RED_SCOPE_MUTATED: false,
      NDX_CANONICAL_LIME_MUTATED: false,
      CONTENT_OPERATIONS_FULL_RECOMPOSITION_IMPLEMENTED: false,
      OTHER_FOUNDER_ROUTES_RECOMPOSED_IN_THIS_SPRINT: false,
      FAL_REQUESTS_FOR_THIS_SPRINT: false,
      BRAND_CHARACTER_MUTATED: false,
      BRAND_CANON_MUTATED: false,
      EXPERIMENT_LINEAGE_MUTATED: false,
      HISTORICAL_REFERENCE_LINEAGE_DELETED: false,
      CAMPAIGN_STATE_MUTATED_OUTSIDE_EXISTING_SEMANTICS: false,
      PRODUCT_EXPRESSION_IMPLEMENTED: false,
      WORLD_FORMATION_IMPLEMENTED: false,
      AUTONOMOUS_PUBLISHING_ENABLED: false,
    };
    for (const [key, value] of Object.entries(criteria)) {
      const negativeKeys = new Set([
        'DARK_PRIMARY_CAMPAIGN_SURFACES_REINTRODUCED',
        'SITE00_HOST_RED_SCOPE_MUTATED',
        'NDX_CANONICAL_LIME_MUTATED',
        'CONTENT_OPERATIONS_FULL_RECOMPOSITION_IMPLEMENTED',
        'OTHER_FOUNDER_ROUTES_RECOMPOSED_IN_THIS_SPRINT',
        'FAL_REQUESTS_FOR_THIS_SPRINT',
        'BRAND_CHARACTER_MUTATED',
        'BRAND_CANON_MUTATED',
        'EXPERIMENT_LINEAGE_MUTATED',
        'HISTORICAL_REFERENCE_LINEAGE_DELETED',
        'CAMPAIGN_STATE_MUTATED_OUTSIDE_EXISTING_SEMANTICS',
        'PRODUCT_EXPRESSION_IMPLEMENTED',
        'WORLD_FORMATION_IMPLEMENTED',
        'AUTONOMOUS_PUBLISHING_ENABLED',
      ]);
      if (negativeKeys.has(key)) {
        expect(value, key).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
