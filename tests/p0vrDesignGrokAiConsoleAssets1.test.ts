/**
 * P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — staged AI-console iconography.
 *
 * Guards the construction grid, the three agent marks, the shared status
 * grammar, and the firewall: these drawings stay STAGED and never mutate an
 * approved asset manifest. Console geometry and workflow stay untouched.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  AIC_CONSOLE_MARK,
  AIC_EMPTY_ICON,
  AIC_ICON_FAMILY,
  AIC_ICON_IDS,
  AIC_ICON_INSET,
  AIC_ICON_STATUS,
  AIC_ICON_STROKE,
  AIC_ICON_VERSION,
  AIC_ICON_VIEWBOX,
  getAiConsoleIconDef,
  listStagedAiConsoleIcons,
  renderAiConsoleIconSvg,
  statusIconForLabel,
} from '../shared/site00-design-workspace-production/designAiConsoleIconography.js';

function read(relative: string): string {
  return readFileSync(join(import.meta.dirname, '..', relative), 'utf8');
}

const SHELL = 'src/site00/components/designBench/aiConsoles/AiConsoleShell.tsx';
const ICON = 'src/site00/components/designBench/aiConsoles/AiConsoleIcon.tsx';
const OPUS = 'src/site00/components/designBench/designAgent/DesignAgentDock.tsx';
const GROK = 'src/site00/components/designBench/designAgent/DesignGrokDock.tsx';
const AUTHORITY = 'src/site00/components/designBench/opusDirect/ViewportAuthorityEditor.tsx';
const CSS = 'src/site00/styles/site00-ai-consoles.css';
const MANIFEST = 'public/site00/ai-consoles/staged/manifest.json';

describe('P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — construction grid', () => {
  it('keeps one family, one viewBox, one stroke, one inset', () => {
    expect(AIC_ICON_VIEWBOX).toBe(24);
    expect(AIC_ICON_STROKE).toBe(1.5);
    expect(AIC_ICON_INSET).toBe(5);
    expect(AIC_ICON_FAMILY).toBe('SITE00_AI_CONSOLE_LINE_V1');
    expect(AIC_ICON_STATUS).toBe('STAGED');
    expect(AIC_ICON_VERSION).toBe('P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1');
  });

  it('defines every requested semantic id and can render each as SVG', () => {
    expect(AIC_ICON_IDS.length).toBeGreaterThanOrEqual(100);
    for (const id of AIC_ICON_IDS) {
      const def = getAiConsoleIconDef(id);
      expect(def.id).toBe(id);
      expect(def.primitives.length).toBeGreaterThan(0);
      expect(def.darkVariant).toBe('currentColor');
      const svg = renderAiConsoleIconSvg(id);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain(`data-aic-icon="${id}"`);
      expect(svg).toContain('data-aic-icon-status="STAGED"');
    }
  });

  it('gives Opus, Grok and CGPT distinct marks that stay monoline and architectural', () => {
    const opus = renderAiConsoleIconSvg('mark-opus');
    const grok = renderAiConsoleIconSvg('mark-grok');
    const cgpt = renderAiConsoleIconSvg('mark-cgpt');
    expect(opus).not.toBe(grok);
    expect(grok).not.toBe(cgpt);
    expect(opus).not.toBe(cgpt);
    expect(AIC_CONSOLE_MARK).toEqual({
      opus: 'mark-opus',
      grok: 'mark-grok',
      authority: 'mark-authority',
    });
    for (const mark of ['mark-opus', 'mark-grok', 'mark-cgpt'] as const) {
      const svg = renderAiConsoleIconSvg(mark);
      expect(svg).not.toMatch(/sparkle|brain|emoji|gradient/i);
    }
  });

  it('maps the shared status vocabulary onto shape ids, not colour alone', () => {
    expect(statusIconForLabel('READY')).toBe('status-ready');
    expect(statusIconForLabel('ONLINE')).toBe('status-online');
    expect(statusIconForLabel('NOT READY')).toBe('status-not-ready');
    expect(statusIconForLabel('BLOCKED')).toBe('status-blocked');
    expect(statusIconForLabel('THINKING')).toBe('status-thinking');
    expect(statusIconForLabel('GENERATING')).toBe('status-generating');
    expect(statusIconForLabel('REVIEW')).toBe('status-review');
    expect(statusIconForLabel('APPROVED')).toBe('status-approved');
    expect(statusIconForLabel('ERROR')).toBe('status-error');
    expect(statusIconForLabel('PENDING')).toBe('status-pending');
    expect(renderAiConsoleIconSvg('status-ready')).not.toBe(renderAiConsoleIconSvg('status-error'));
    expect(renderAiConsoleIconSvg('status-blocked')).toContain('<line');
  });

  it('covers empty states, upload states and preview controls', () => {
    expect(Object.values(AIC_EMPTY_ICON)).toEqual([
      'empty-context',
      'empty-authority',
      'empty-messages',
      'empty-attachments',
      'empty-concept',
      'empty-assets',
      'empty-staged',
    ]);
    for (const id of [
      'upload',
      'upload-progress',
      'upload-success',
      'upload-invalid',
      'upload-replace',
      'preview-fullscreen',
      'preview-fit',
      'preview-zoom-in',
      'preview-zoom-out',
      'preview-prev',
      'preview-next',
    ] as const) {
      expect(getAiConsoleIconDef(id).console).toBe('shared');
    }
  });
});

describe('P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — firewall and wiring', () => {
  it('stages every icon and records NONE approved-asset mutation', () => {
    const staged = listStagedAiConsoleIcons();
    expect(staged).toHaveLength(AIC_ICON_IDS.length);
    const manifest = JSON.parse(read(MANIFEST)) as {
      status: string;
      count: number;
      approvedAssetMutation: string;
      icons: { id: string }[];
    };
    expect(manifest.status).toBe('STAGED');
    expect(manifest.approvedAssetMutation).toBe('NONE');
    expect(manifest.count).toBe(AIC_ICON_IDS.length);
    expect(manifest.icons.map((icon) => icon.id)).toEqual([...AIC_ICON_IDS]);
  });

  it('does not register the family in an approved NDX / SITE 00 icon manifest', () => {
    const iconSource = read(ICON);
    expect(iconSource).toContain('AIC_ICON_STATUS');
    expect(iconSource).toContain('data-aic-icon-status');
    expect(iconSource).not.toContain('getNdxIconDefinition');
    expect(read('shared/site00-design-workspace-production/designPageActiveAssetManifest.ts')).not.toContain(
      'P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1',
    );
  });

  it('wires marks, status and empty glyphs through the shared shell', () => {
    const shell = read(SHELL);
    expect(shell).toContain('AIC_CONSOLE_MARK');
    expect(shell).toContain('statusIconForLabel');
    expect(shell).toContain('action-close');
    expect(shell).toContain('emptyIcon');
    expect(shell).toContain('AiConsoleLightboxControls');
    expect(read(CSS)).toContain('.s00-aic__mark');
    expect(read(CSS)).toContain('.s00-aic-icon');
    expect(read(CSS)).not.toContain('border-radius: 999px');
  });

  it('does not mutate console geometry or workflow', () => {
    const css = read(CSS);
    expect(css).toMatch(/\.s00-aic \{[^}]*width: min\(960px/);
    expect(css).toContain('height: 94dvh');
    expect(css).toContain('@media (max-width: 860px)');
    const opus = read(OPUS);
    const grok = read(GROK);
    const authority = read(AUTHORITY);
    expect(opus).toContain('console="opus"');
    expect(grok).toContain('console="grok"');
    expect(authority).toContain('console="authority"');
    expect(opus).toContain('opus-attach-reference');
    expect(opus).toContain('opus-cost');
    expect(grok).toContain('AIC_STAGE_ICON');
    expect(grok).toContain('badge-selected');
    expect(authority).toContain('mark-cgpt');
    expect(authority).toContain('auth-upload-reference');
    expect(authority).toContain('empty-messages');
    expect(grok).toContain('modeAllowedForEligibility');
    expect(grok).toContain('createFixtureGrokStagedAsset');
    expect(authority).toContain('regenerateAuthorityFixture');
  });

  it('keeps chips type-first — icons only replace prior unicode glyphs', () => {
    const opus = read(OPUS);
    const grok = read(GROK);
    const authority = read(AUTHORITY);
    expect(opus).not.toContain('⬚');
    expect(opus).not.toContain('✦');
    expect(grok).not.toContain('glyph="⟳"');
    expect(authority).not.toContain('▶');
    expect(authority).not.toContain('✎ EDIT');
  });
});
