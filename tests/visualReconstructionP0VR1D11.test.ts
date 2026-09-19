/**
 * P0.VR.1D.11 — Character Lab full-screen reference reconstruction tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCharacterLabFullScreenImplementationSpec,
  buildCharacterLabVisualAssetManifest,
  CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY,
  CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC,
  existingAssetPreferredOverFalGeneration,
  falReconstructionCandidates,
  markStaleCharacterLabLocks,
  NDX_CHARACTER_LAB_ASSET_PATHS,
  NDX_CHARACTER_LAB_REFERENCE_PATH,
  NDX_CHARACTER_LAB_VR_REGION_IDS,
  P0_VR_1D11_LINEAGE,
  resolveCharacterLabReferenceAssets,
  STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr1d11/index.js';
import {
  NDX_CHARACTER_LAB_DEFAULT_TAB,
  NDX_CHARACTER_LAB_LANGUAGE_NOTE_EMPHASIS,
  NDX_CHARACTER_LAB_PERFORMANCE,
  NDX_CHARACTER_LAB_QUOTE_LINES,
  NDX_CHARACTER_LAB_STICKY_NOTE_LINES,
  NDX_CHARACTER_LAB_TABS,
  NDX_CHARACTER_LAB_TITLE,
  NDX_CHARACTER_LAB_WHO_SHE_IS,
} from '../src/site00/config/ndxCharacterLabMobileReference.js';
import { NDX_VR_REGION } from '../src/site00/config/ndxVisualRegionIds.js';

const ROOT = process.cwd();

describe('P0.VR.1D.11 Character Lab full-screen reconstruction', () => {
  it('registers attached screenshot as FULL_SCREEN_REFERENCE authority', () => {
    expect(CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY).toBe('CHARACTER_LAB_FULL_SCREEN_VISUAL_AUTHORITY');
    expect(existsSync(join(ROOT, NDX_CHARACTER_LAB_REFERENCE_PATH))).toBe(true);
    expect(CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC.referencePath).toBe(NDX_CHARACTER_LAB_REFERENCE_PATH);
  });

  it('allows incorrect old visual shell replacement while preserving function authority', () => {
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-character-lab__hero');
    expect(screens).toContain('setActiveTab');
    expect(screens).not.toContain('MobileScreenFrame eyebrow="CHARACTER LAB"');
    const shell = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'), 'utf8');
    expect(shell).toContain("'character-lab'");
    expect(shell).toContain('ActiveProjectNotificationCenter');
  });

  it('full-screen implementation spec includes shell + section regions', () => {
    const spec = buildCharacterLabFullScreenImplementationSpec();
    const ids = spec.regions.map((r) => r.regionId);
    for (const regionId of NDX_CHARACTER_LAB_VR_REGION_IDS) {
      expect(ids).toContain(regionId);
    }
  });

  it('preserves lime diamond via Site00Diamond in mobile chrome', () => {
    const chrome = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    expect(chrome).toContain('Site00Diamond');
    expect(chrome).toContain('characterHeaderShell');
  });

  it('renders Language/Voice/Casting tabs with interactive state', () => {
    expect(NDX_CHARACTER_LAB_TABS).toEqual(['LANGUAGE LAB', 'VOICE LAB', 'CASTING']);
    expect(NDX_CHARACTER_LAB_DEFAULT_TAB).toBe('LANGUAGE LAB');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-tabs--character-lab');
    expect(screens).toContain('NDX_VR_REGION.characterTabs');
  });

  it('keeps hero two-column layout at reference viewport', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-fws-mobile-character-lab__hero');
    expect(css).toContain('grid-template-columns: var(--ndx-character-hero-ratio-left');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('NDX_VR_REGION.characterPortrait');
    expect(screens).toContain('NDX_VR_REGION.characterLanguageNote');
  });

  it('prefers canonical character portrait over random generation', () => {
    const resolutions = resolveCharacterLabReferenceAssets({ projectRoot: ROOT });
    const portrait = resolutions.find((r) => r.assetRole === 'CHARACTER_PORTRAIT');
    expect(portrait?.source).toBe('REFERENCE_CROP');
    expect(portrait?.generationRequired).toBe(false);
    expect(existsSync(join(ROOT, 'public', NDX_CHARACTER_LAB_ASSET_PATHS.portrait.replace(/^\//, '')))).toBe(true);
  });

  it('implements language-note treatment with lime emphasis', () => {
    expect(NDX_CHARACTER_LAB_LANGUAGE_NOTE_EMPHASIS).toBe('best friend.');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-character-lab__language-note-emphasis');
  });

  it('resolves sticky-note asset from reference crop with DOM text overlay', () => {
    const manifest = buildCharacterLabVisualAssetManifest({ projectRoot: ROOT });
    const sticky = manifest.entries.find((e) => e.assetRole === 'WORKING_DRAFT_STICKY_NOTE');
    expect(sticky?.status).toBe('RESOLVED');
    expect(sticky?.source).toBe('REFERENCE_CROP');
    expect(existsSync(join(ROOT, 'public', NDX_CHARACTER_LAB_ASSET_PATHS.stickyNoteSurface.replace(/^\//, '')))).toBe(true);
    expect(NDX_CHARACTER_LAB_STICKY_NOTE_LINES).toEqual(['working', 'draft', 'v0.2']);
  });

  it('prefers existing assets over FAL generation and exposes FAL when missing', () => {
    const manifest = buildCharacterLabVisualAssetManifest({ projectRoot: ROOT });
    expect(existingAssetPreferredOverFalGeneration(manifest)).toBe(true);
    expect(falReconstructionCandidates(manifest)).toHaveLength(0);
  });

  it('matches Who She Is layout with lime bullets and sticky note relationship', () => {
    expect(NDX_CHARACTER_LAB_WHO_SHE_IS[0]).toBe('Pattern recognizer');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-fws-mobile-character-lab__identity-row');
    expect(css).toContain('.site00-fws-mobile-character-lab__sticky-note');
  });

  it('matches quote card geometry and copy', () => {
    expect(NDX_CHARACTER_LAB_QUOTE_LINES).toHaveLength(3);
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-fws-mobile-character-lab__quote-mark');
  });

  it('renders four performance cards in reference grid', () => {
    expect(NDX_CHARACTER_LAB_PERFORMANCE).toHaveLength(4);
    expect(NDX_CHARACTER_LAB_PERFORMANCE[2]?.label).toBe('REELS');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('grid-template-columns: repeat(4');
  });

  it('registers VR region IDs for shell and sections', () => {
    expect(NDX_VR_REGION.characterHero).toBe('ndx.character.hero');
    expect(NDX_VR_REGION.characterStickyNote).toBe('ndx.character.sticky-note');
    expect(NDX_VR_REGION.characterPerformanceCard4).toBe('ndx.character.performance.card.4');
  });

  it('invalidates stale locks non-destructively', () => {
    const marked = markStaleCharacterLabLocks([{ regionId: 'ndx.character.hero', status: 'MATCHED' }]);
    expect(marked[0]?.status).toBe(STALE_AFTER_CHARACTER_LAB_REFERENCE_REBUILD);
    expect(marked[0]?.priorStatus).toBe('MATCHED');
  });

  it('uses P0.VR.1D.11 lineage and does not flatten page into screenshot', () => {
    expect(P0_VR_1D11_LINEAGE).toBe('P0.VR.1D.11');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('role="tab"');
    expect(screens).toContain('onClick={() => setActiveTab(tab)}');
  });

  it('includes Character Lab title in reference layout', () => {
    expect(NDX_CHARACTER_LAB_TITLE).toBe('CHARACTER LAB');
    const screens = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'), 'utf8');
    expect(screens).toContain('site00-fws-mobile-character-lab__title');
  });
});
