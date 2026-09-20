/**
 * P0.VR.DESIGN.OPUS-AI-CONSOLES1 — the three DESIGN AI consoles.
 *
 * Two things are guarded here. First the presentation model: system enums must
 * arrive at the founder as sentences, and the compact readiness strip must not
 * report "ready" for a gate that is still blocked underneath it. Second the
 * consoles themselves: the old debug presentations (dark drawer, blocker wall,
 * plain white modal) must not come back, and the shared shell must stay shared.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  authorityDetailRows,
  authorityTags,
  authorityUploadRejection,
  composeOpusRequest,
  grokAssetCategories,
  grokAssetCategory,
  grokAssetDisplayName,
  grokConsoleStatus,
  grokModesForTab,
  grokReadinessStrip,
  opusConsoleStatus,
  opusContextAssistText,
  opusEditScopeRows,
  AUTHORITY_CONSOLE_TABS,
  GROK_CONSOLE_TABS,
  OPUS_CONSOLE_TABS,
  OPUS_INTENT_ORDER,
  OPUS_INTENT_PRESENTATION,
} from '../shared/site00-design-workspace-production/designAiConsolePresentation.js';
import { computeGrokAssetEligibility } from '../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import { createInitialPageAuthorityWorkflow } from '../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { DESIGN_AGENT_INTENTS } from '../shared/site00-opus-native/writePolicy.js';
import type { GrokAssetMode } from '../shared/site00-design-workspace-production/designGrokAssetModel.js';

function read(relative: string): string {
  return readFileSync(join(import.meta.dirname, '..', relative), 'utf8');
}

const OPUS = 'src/site00/components/designBench/designAgent/DesignAgentDock.tsx';
const GROK = 'src/site00/components/designBench/designAgent/DesignGrokDock.tsx';
const AUTHORITY = 'src/site00/components/designBench/opusDirect/ViewportAuthorityEditor.tsx';
const SHELL = 'src/site00/components/designBench/aiConsoles/AiConsoleShell.tsx';
const CONSOLE_CSS = 'src/site00/styles/site00-ai-consoles.css';

describe('P0.VR.DESIGN.OPUS-AI-CONSOLES1 — Opus presentation model', () => {
  it('maps runtime run status onto the founder status vocabulary', () => {
    expect(opusConsoleStatus({ runStatus: null, lastTool: null, estimating: false, failed: false })).toEqual({
      label: 'READY',
      tone: 'READY',
    });
    expect(opusConsoleStatus({ runStatus: 'THINKING', lastTool: null, estimating: false, failed: false }).label).toBe(
      'THINKING',
    );
    expect(
      opusConsoleStatus({ runStatus: 'WAITING_FOR_FOUNDER_REVIEW', lastTool: null, estimating: false, failed: false }),
    ).toEqual({ label: 'REVIEW', tone: 'REVIEW' });
    expect(opusConsoleStatus({ runStatus: 'RENDERING', lastTool: null, estimating: false, failed: false }).tone).toBe(
      'BUSY',
    );
    expect(opusConsoleStatus({ runStatus: null, lastTool: null, estimating: false, failed: true }).label).toBe('ERROR');
  });

  it('names the tool phase rather than printing the tool id', () => {
    const status = opusConsoleStatus({
      runStatus: 'TOOL_USE',
      lastTool: 'apply_patch',
      estimating: false,
      failed: false,
    });
    expect(status.label).toBe('PATCHING');
    expect(status.label).not.toContain('_');
  });

  it('presents every runtime intent, in founder scan order', () => {
    for (const intent of DESIGN_AGENT_INTENTS) {
      expect(OPUS_INTENT_PRESENTATION[intent]).toBeDefined();
      expect(OPUS_INTENT_ORDER).toContain(intent);
    }
    expect(OPUS_INTENT_ORDER[0]).toBe('REFINE_CURRENT');
    expect(OPUS_INTENT_ORDER).toHaveLength(DESIGN_AGENT_INTENTS.length);
  });

  it('never widens edit scope beyond the permitted write mode', () => {
    const readOnly = opusEditScopeRows('READ_ONLY');
    expect(readOnly.every((row) => row.allowed === false)).toBe(true);

    const styleOnly = opusEditScopeRows('STYLE_ONLY');
    expect(styleOnly.find((row) => row.id === 'styles')?.allowed).toBe(true);
    expect(styleOnly.find((row) => row.id === 'components')?.allowed).toBe(false);

    const derivative = opusEditScopeRows('DERIVATIVE_CREATE');
    expect(derivative.every((row) => row.allowed)).toBe(true);
  });

  it('attaches references by naming them in the dispatched request', () => {
    const composed = composeOpusRequest('Tighten the hero band.', [
      { id: 'current-capture', label: 'CURRENT CAPTURE', src: '/captures/a.png', origin: 'capture' },
    ]);
    expect(composed).toContain('Tighten the hero band.');
    expect(composed).toContain('REFERENCES:');
    expect(composed).toContain('/captures/a.png');
    expect(composeOpusRequest('Only text.', [])).toBe('Only text.');
  });

  it('context assist is deterministic and spends nothing', () => {
    const input = {
      projectSlug: 'ndxbook',
      pageLabel: 'OVERVIEW',
      viewport: 'MOBILE',
      viewMode: 'canonical',
      route: '/projects/ndxbook',
    };
    expect(opusContextAssistText(input)).toBe(opusContextAssistText(input));
    expect(opusContextAssistText(input)).toContain('NDXBOOK · OVERVIEW · CANONICAL · MOBILE');
  });
});

describe('P0.VR.DESIGN.OPUS-AI-CONSOLES1 — Grok presentation model', () => {
  const baseInput = (overrides: Record<string, unknown> = {}) => ({
    projectId: 'ndxbook',
    pageId: 'ndxbook:overview',
    viewport: 'MOBILE' as const,
    production: {
      promotedMobileConceptId: null,
      promotedDesktopConceptId: null,
      pairReviewOpenedAt: null,
      pairLockedAt: null,
      twinImplementationStatus: 'NONE' as const,
      twinPageReviewedAt: null,
    },
    pageWorkflow: createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview'),
    twinRouteReachable: null,
    twinRoute: null,
    hasPageConceptCandidates: false,
    ...overrides,
  });

  it('translates every eligibility enum into a headline and one instruction', () => {
    const blocked = grokConsoleStatus(computeGrokAssetEligibility(baseInput()));
    expect(blocked.label).toBe('NOT READY');
    expect(blocked.headline).toBe('ASSET PRODUCTION BLOCKED');
    expect(blocked.instruction).toBe('Complete page concept workflow first.');
    expect(blocked.headline).not.toMatch(/BLOCKED_[A-Z_]+/);

    const optedOut = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    optedOut.grokOptOut = true;
    const notRequired = grokConsoleStatus(computeGrokAssetEligibility(baseInput({ pageWorkflow: optedOut })));
    expect(notRequired.label).toBe('NOT REQUIRED');
    expect(notRequired.tone).toBe('IDLE');
  });

  it('collapses nine gates into four cells without reporting a pass it does not have', () => {
    const strip = grokReadinessStrip(computeGrokAssetEligibility(baseInput()).gates);
    expect(strip.map((cell) => cell.label)).toEqual([
      'PAGE CONCEPT',
      'AUTHORITY PAIR',
      'COMPOSER HANDOFF',
      'READY FOR ASSETS',
    ]);
    expect(strip.every((cell) => cell.state !== 'PASS')).toBe(true);

    const partial = grokReadinessStrip([
      { id: 'page_concepts', label: 'Page concept process', status: 'PASS' },
      { id: 'mobile_promoted', label: 'Mobile design promoted', status: 'PASS' },
      { id: 'desktop_promoted', label: 'Desktop design promoted', status: 'BLOCKED' },
      { id: 'pair_review', label: 'Pair review', status: 'PASS' },
      { id: 'authority_locked', label: 'Authority pair locked', status: 'PASS' },
      { id: 'composer_handoff', label: 'Composer handoff', status: 'PASS' },
      { id: 'twin_created', label: 'Twin page created', status: 'PASS' },
      { id: 'twin_review', label: 'Twin reviewable', status: 'PASS' },
      { id: 'current_capture', label: 'Current page capture', status: 'PASS' },
    ]);
    expect(partial.find((cell) => cell.id === 'page-concept')?.state).toBe('PASS');
    expect(partial.find((cell) => cell.id === 'authority-pair')?.state).toBe('LOCKED');
    expect(partial.find((cell) => cell.id === 'ready-for-assets')?.state).toBe('PENDING');
  });

  it('keeps every asset mode reachable from a tab', () => {
    const modes = new Set<GrokAssetMode>();
    for (const tab of GROK_CONSOLE_TABS) {
      for (const mode of grokModesForTab(tab.id)) modes.add(mode);
    }
    expect([...modes].sort()).toEqual([
      'ASSET_VARIATION',
      'ICON_SYSTEM',
      'PAGE_ASSET_PACK',
      'REPLACE_ASSET',
      'SINGLE_ASSET',
    ]);
  });

  it('only offers filters for categories the page actually has', () => {
    const assets = [{ slot: 'page-hero' }, { slot: 'icon-system' }, { slot: 'pattern-texture' }];
    expect(grokAssetCategories(assets).map((entry) => entry.id)).toEqual(['ALL', 'IMAGES', 'ICONS', 'TEXTURES']);
    expect(grokAssetCategories([]).map((entry) => entry.id)).toEqual(['ALL']);
    expect(grokAssetCategory({ slot: 'layout-plate' })).toBe('LAYOUTS');
  });

  it('gives assets a file name rather than an id', () => {
    const name = grokAssetDisplayName({ assetId: 'grok-fixture-1712-abcd', slot: 'page-hero', format: 'PNG' });
    expect(name).toBe('page_hero_abcd.png');
  });
});

describe('P0.VR.DESIGN.OPUS-AI-CONSOLES1 — Viewport Authority presentation model', () => {
  it('keeps mobile and desktop authority as separate tabs', () => {
    expect(AUTHORITY_CONSOLE_TABS.map((tab) => tab.id)).toEqual(['MOBILE', 'DESKTOP']);
  });

  it('renders compact details instead of a raw data block', () => {
    const rows = authorityDetailRows({
      pageLabel: 'overview',
      conceptLabel: 'Cultural intelligence editorial',
      viewport: 'MOBILE',
      versionLabel: 'v2',
      versionStatus: 'ACTIVE',
      createdAt: '2026-05-16T10:00:00.000Z',
      authorityId: 'ndxbook:overview:mobile-authority',
      isInitial: false,
    });
    expect(rows.find((row) => row.label === 'TYPE')?.value).toBe('REVISED AUTHORITY');
    expect(rows.find((row) => row.label === 'CREATED')?.value).toBe('2026-05-16');
    expect(rows.every((row) => row.value === row.value.toUpperCase())).toBe(true);
  });

  it('tags the authority from its own state', () => {
    expect(authorityTags({ viewport: 'MOBILE', hasMessages: false, isActive: true })).toEqual([
      'mobile',
      'authority',
      'founder',
      'active',
    ]);
    expect(authorityTags({ viewport: 'DESKTOP', hasMessages: true, isActive: false })).toContain('cgpt');
  });

  it('rejects uploads the authority store cannot take', () => {
    expect(authorityUploadRejection({ type: 'image/png', size: 1024 })).toBeNull();
    expect(authorityUploadRejection({ type: 'image/gif', size: 1024 })).toMatch(/UNSUPPORTED FORMAT/);
    expect(authorityUploadRejection({ type: 'image/png', size: 11 * 1024 * 1024 })).toMatch(/TOO LARGE/);
  });
});

describe('P0.VR.DESIGN.OPUS-AI-CONSOLES1 — consoles share one shell and no stale surface', () => {
  const opus = read(OPUS);
  const grok = read(GROK);
  const authority = read(AUTHORITY);
  const shell = read(SHELL);
  const css = read(CONSOLE_CSS);

  it('all three consoles are composed from the shared shell', () => {
    for (const source of [opus, grok, authority]) {
      expect(source).toContain('AiConsoleSurface');
      expect(source).toContain('AiConsoleSection');
    }
    expect(opus).toContain('console="opus"');
    expect(grok).toContain('console="grok"');
    expect(authority).toContain('console="authority"');
    expect(shell).toContain('site00-ai-consoles.css');
  });

  it('the shell composes desktop and mobile separately rather than scaling one', () => {
    expect(css).toContain('@media (max-width: 860px)');
    expect(css).toContain('height: 94dvh');
    expect(css).toContain('.s00-aic__grabber');
    expect(css).toMatch(/\.s00-aic \{[^}]*width: min\(960px/);
  });

  it('no console reintroduces the terminal / debug drawer aesthetic', () => {
    const opusCss = read('src/site00/styles/site00-design-agent.css');
    expect(opusCss).not.toMatch(/background:\s*#0a0a0a/);
    expect(opusCss).not.toContain('.s00-dad__rail');
    expect(opusCss).toContain('.s00-dad__close');
    const twinCss = read('src/site00/styles/site00-twin-opus-direct.css');
    expect(twinCss).not.toContain('.s00-grok-dock');
    expect(twinCss).not.toContain('.tod-auth-editor');
  });

  it('the authority console is not wrapped in the generic modal frame any more', () => {
    const overlays = read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx');
    expect(overlays).not.toMatch(
      /DesignChildSurfaceFrame[\s\S]{0,200}OV-VIEWPORT-AUTHORITY-EDITOR[\s\S]{0,200}DesignViewportAuthorityEditorOverlay/,
    );
    expect(overlays).toContain('<DesignViewportAuthorityEditorOverlay');
  });

  it('every console tab and console preview has a real surface behind it', () => {
    expect(OPUS_CONSOLE_TABS.map((tab) => tab.id)).toEqual(['SHELL', 'DESIGN', 'REVIEW', 'CONTEXT']);
    expect(opus).toContain("tab === 'SHELL'");
    expect(opus).toContain('OpusDesignShellPanel');
    // REVIEW is the only tab that can be unavailable, and it says why.
    expect(opus).toContain("disabled={entry.id === 'REVIEW' && !review}");
    expect(opus).toContain('No proposal yet');
    expect(grok).toContain('AiConsolePreview');
    expect(authority).toContain('AiConsolePreview');
  });

  it('keeps the gating, fixture and authority contracts the consoles are built on', () => {
    expect(grok).toContain('modeAllowedForEligibility');
    expect(grok).toContain('createFixtureGrokStagedAsset');
    expect(grok).toContain('NO GROK ASSETS NEEDED');
    expect(grok).not.toContain('fetch(');
    expect(authority).toContain('regenerateAuthorityFixture');
    expect(authority).not.toContain('fetch(');
  });
});
