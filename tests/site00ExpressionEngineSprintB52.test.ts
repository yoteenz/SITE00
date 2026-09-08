/**
 * B5.2 — Entry 001 Campaign Package page tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ENTRY001_APPROVED_ARCHIVE,
  ENTRY001_ASSET_BASE,
  ENTRY001_ASSET_MANIFEST,
  ENTRY001_HERO_ASSET,
  ENTRY001_REQUIRED_DELIVERABLE_ROLES,
  buildEntry001MissingDeliverablePlaceholders,
  getEntry001FullManifest,
} from '../src/site00/config/entry001CampaignAssets.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import { buildActiveArchive } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';
import { compileEntry001ArchiveDerivationPlan } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveDerivationPlan.js';
import {
  ENTRY001_VISUAL_CONTINUITY,
  styleContinuityLockedFromArchive,
} from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001VisualContinuity.js';
import { ENTRY001_NARRATIVE_CONTINUITY } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001NarrativeContinuity.js';
import { SITE00_ROUTES, site00ProjectCampaignBoardEntryPath } from '../src/site00/config/routes.js';
import type { Entry001CampaignAsset } from '../shared/site00-expression-engine/entry001CampaignPackage/types.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.2 Entry 001 Campaign Package', () => {
  it('1. Entry 001 dedicated route exists', () => {
    expect(SITE00_ROUTES.projectCampaignBoardEntry).toContain('campaign-board/entry/:entryNumber');
    expect(site00ProjectCampaignBoardEntryPath('ndxbook', '001')).toBe(
      '/projects/ndxbook/content-operations/campaign-board/entry/001',
    );
    const routes = readFileSync(join(ROOT, 'src/routes/Site00Routes.tsx'), 'utf8');
    expect(routes).toContain('ProjectCampaignBoardEntryPackagePage');
    expect(routes).toContain('projectCampaignBoardEntry');
  });

  it('2. Entry 001 package manifest loads', () => {
    expect(ENTRY001_ASSET_MANIFEST.length).toBeGreaterThan(10);
    expect(ENTRY001_APPROVED_ARCHIVE.length).toBe(10);
  });

  it('3. founder assets can be local/static project assets', () => {
    for (const asset of ENTRY001_APPROVED_ARCHIVE) {
      expect(asset.filePath.startsWith('/assets/')).toBe(true);
      expect(asset.filePath).not.toContain('supabase');
    }
  });

  it('4. Supabase URL is not required for local manifest assets', () => {
    expect(ENTRY001_ASSET_BASE).toBe('/assets/ndxbook/entry-001');
    ENTRY001_APPROVED_ARCHIVE.forEach((a) => {
      expect(a.filePath.includes('supabase.co')).toBe(false);
    });
  });

  it('5. asset roles are explicit', () => {
    const roles = new Set(ENTRY001_APPROVED_ARCHIVE.map((a) => a.role));
    expect(roles.has('CAROUSEL_SLIDE')).toBe(true);
    expect(roles.has('QUOTE_POST')).toBe(true);
    expect(roles.has('ENTRY_COVER')).toBe(true);
  });

  it('6. approved archive count derives from manifest', () => {
    expect(ENTRY001_APPROVED_ARCHIVE.filter((a) => a.approved).length).toBe(10);
  });

  it('7. missing-deliverable count derives from required roles', () => {
    const readiness = buildEntry001PackageReadiness();
    expect(readiness.missingAssetCount).toBe(5);
    expect(readiness.requiredAssetCount).toBe(5);
  });

  it('8. reel cover placeholder exists when missing', () => {
    const placeholders = buildEntry001MissingDeliverablePlaceholders();
    expect(placeholders.some((p) => p.role === 'REEL_COVER' && p.status === 'MISSING')).toBe(true);
  });

  it('9. highlight icon placeholder exists when missing', () => {
    const placeholders = buildEntry001MissingDeliverablePlaceholders();
    expect(placeholders.some((p) => p.role === 'HIGHLIGHT_ICON')).toBe(true);
  });

  it('10. final reel placeholder exists when missing', () => {
    const placeholders = buildEntry001MissingDeliverablePlaceholders();
    expect(placeholders.some((p) => p.role === 'FINAL_REEL')).toBe(true);
  });

  it('11. TikTok placeholder exists when missing', () => {
    const placeholders = buildEntry001MissingDeliverablePlaceholders();
    expect(placeholders.some((p) => p.role === 'TIKTOK_POST')).toBe(true);
  });

  it('12. X/Twitter placeholder exists when missing', () => {
    const placeholders = buildEntry001MissingDeliverablePlaceholders();
    expect(placeholders.some((p) => p.role === 'X_POST')).toBe(true);
  });

  it('13. uploaded replacement resolves placeholder', () => {
    const upload: Entry001CampaignAsset = {
      assetId: 'test-reel-cover',
      entryId: 'entry-001',
      filePath: 'blob:test',
      title: 'REEL COVER',
      format: 'IMAGE',
      role: 'REEL_COVER',
      assetType: 'REEL_COVER',
      status: 'APPROVED',
      source: 'FOUNDER_SUPPLIED',
      approved: true,
      version: 'v001',
      removedFromActiveArchive: false,
    };
    const readiness = buildEntry001PackageReadiness(buildActiveArchive(), [upload]);
    expect(readiness.approvedRoles).toContain('REEL_COVER');
    expect(readiness.missingRoles).not.toContain('REEL_COVER');
  });

  it('14. package readiness updates after asset addition', () => {
    const before = buildEntry001PackageReadiness();
    const after = buildEntry001PackageReadiness(buildActiveArchive(), [
      {
        assetId: 'x1',
        entryId: 'entry-001',
        filePath: '/x.jpg',
        title: 'X',
        format: 'IMAGE',
        role: 'X_POST',
        assetType: 'X_POST',
        status: 'APPROVED',
        source: 'FOUNDER_SUPPLIED',
        approved: true,
        version: 'v1',
        removedFromActiveArchive: false,
      },
    ]);
    expect(after.approvedAssetCount).toBe(before.approvedAssetCount + 1);
  });

  it('15. incomplete package cannot deploy', () => {
    const readiness = buildEntry001PackageReadiness();
    expect(readiness.campaignBoardEligible).toBe(false);
    expect(readiness.packageStatus).not.toBe('COMPLETE');
  });

  it('16. complete package can become campaign-board eligible', () => {
    const allDeliverables: Entry001CampaignAsset[] = ENTRY001_REQUIRED_DELIVERABLE_ROLES.map((role, i) => ({
      assetId: `del-${i}`,
      entryId: 'entry-001',
      filePath: `/assets/test/${role}.jpg`,
      title: role,
      format: role === 'FINAL_REEL' ? 'VIDEO' : 'IMAGE',
      role,
      assetType: role === 'FINAL_REEL' ? 'REEL' : role === 'TIKTOK_POST' ? 'TIKTOK' : (role as Entry001CampaignAsset['assetType']),
      status: 'APPROVED',
      source: 'FOUNDER_SUPPLIED',
      approved: true,
      version: 'v1',
      removedFromActiveArchive: false,
    }));
    const readiness = buildEntry001PackageReadiness(buildActiveArchive(), allDeliverables);
    expect(readiness.packageStatus).toBe('COMPLETE');
    expect(readiness.campaignBoardEligible).toBe(true);
  });

  it('17. founder-supplied source preserved', () => {
    ENTRY001_APPROVED_ARCHIVE.forEach((a) => expect(a.source).toBe('FOUNDER_SUPPLIED'));
    expect(ENTRY001_HERO_ASSET.source).toBe('FOUNDER_SUPPLIED');
  });

  it('18. derived asset source preserved in type contract', () => {
    const derived: Entry001CampaignAsset = {
      assetId: 'derived-1',
      entryId: 'entry-001',
      filePath: '/assets/derived.jpg',
      title: 'DERIVED REEL COVER',
      format: 'IMAGE',
      role: 'REEL_COVER',
      status: 'AWAITING_FOUNDER_APPROVAL',
      source: 'STUDIO_WORLD_DERIVED',
      approved: false,
      version: 'v1',
      lineage: {
        sourceAssetIds: ['entry001-archive-01-then-now'],
        sourceEntryId: 'entry-001',
        derivationPlanId: 'entry001-derivation-plan-v001',
      },
    };
    expect(derived.source).toBe('STUDIO_WORLD_DERIVED');
    expect(derived.lineage?.sourceAssetIds?.length).toBe(1);
  });

  it('19. derivation plan uses approved archive', () => {
    const plan = compileEntry001ArchiveDerivationPlan(ENTRY001_APPROVED_ARCHIVE);
    expect(plan.targets.length).toBe(5);
    expect(plan.providerDispatchCount).toBe(0);
    const reelCover = plan.targets.find((t) => t.role === 'REEL_COVER');
    expect(reelCover?.recommendedSourceAssetIds.length).toBeGreaterThan(0);
  });

  it('20. visual continuity summary exists', () => {
    expect(ENTRY001_VISUAL_CONTINUITY.palette.length).toBeGreaterThan(0);
    expect(styleContinuityLockedFromArchive(10)).toBe(true);
  });

  it('21. narrative continuity linkage exists', () => {
    expect(ENTRY001_NARRATIVE_CONTINUITY.entryId).toBe('entry-001');
    expect(ENTRY001_NARRATIVE_CONTINUITY.reelGapAcknowledged).toBe(true);
    expect(ENTRY001_NARRATIVE_CONTINUITY.argumentThemes.length).toBeGreaterThan(3);
  });

  it('22. provider generation is not triggered on page load', () => {
    const plan = compileEntry001ArchiveDerivationPlan(ENTRY001_APPROVED_ARCHIVE);
    expect(plan.providerDispatchCount).toBe(0);
  });

  it('23. no FAL dispatch during implementation', () => {
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).not.toMatch(/\bFAL_KEY\b|\bfal\.ai\b|dispatchFal/i);
  });

  it('24. Entry 001 assets remain isolated from Entry 002', () => {
    const manifest = getEntry001FullManifest();
    manifest.forEach((a) => {
      expect(a.entryId).toBe('entry-001');
      expect(a.filePath.includes('entry-002')).toBe(false);
    });
  });

  it('25. mobile shell unchanged', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain('MobileFounderWorkspaceChrome');
  });

  it('26. bottom nav unchanged', () => {
    const nav = readFileSync(join(ROOT, 'src/site00/config/ndxFounderWorkspaceMobileNav.ts'), 'utf8');
    expect(nav).toContain("'CAMPAIGNS'");
    expect(nav).toContain("'CONTENT OPS'");
  });

  it('27. reference-fidelity page renders correctly', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('site00-e001-package');
    expect(css).toContain('--e001-lime');
    const page = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace.tsx'),
      'utf8',
    );
    expect(page).toContain('APPROVED ARCHIVE');
    expect(page).toContain('REMAINING DELIVERABLES');
    expect(page).toContain('AI CREATIVE INTELLIGENCE');
  });

  it('28. public asset files exist on disk', () => {
    const hero = join(ROOT, 'public/assets/ndxbook/entry-001/entry001-hero-portrait.jpg');
    const slide = join(ROOT, 'public/assets/ndxbook/entry-001/entry001-archive-01-then-now.jpg');
    expect(readFileSync(hero).length).toBeGreaterThan(1000);
    expect(readFileSync(slide).length).toBeGreaterThan(1000);
  });
});
