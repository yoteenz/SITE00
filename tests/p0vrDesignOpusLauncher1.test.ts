/**
 * P0.VR.DESIGN-OPUS-LAUNCHER1 — header OPUS control opens embedded agent dock.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveDesignAgentSurfaceMatch } from '../src/site00/components/designBench/designAgent/resolveDesignAgentSurface';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-OPUS-LAUNCHER1', () => {
  it('resolves canonical module DESIGN route to twin-opus-direct surface', () => {
    const surfaces = [
      { pageId: 'twin-opus-direct', route: '/projects/:projectSlug/design/twin-opus-direct' },
      { pageId: 'opus-native-proof', route: '/projects/:projectSlug/design/opus-native' },
    ];
    const match = resolveDesignAgentSurfaceMatch('/projects/design/ndxbook', surfaces);
    expect(match?.pageId).toBe('twin-opus-direct');
  });

  it('DesignWorkspaceCore mounts provider + embedded dock (no duplicate panel)', () => {
    const core = read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx');
    expect(core).toContain('DesignAgentDockProvider');
    expect(core).toContain('<DesignAgentDock />');
    expect(core).not.toContain('OpusNativeAgentPanel');
  });

  it('header OPUS control has handler and interaction id', () => {
    const ctx = read('src/site00/components/designBench/designAgent/DesignAgentDockContext.tsx');
    expect(ctx).toContain('onClick={toggle}');
    expect(ctx).toContain('data-interaction-id="header-opus"');
    expect(ctx).toContain('aria-label');
  });

  it('embedded dock is not unmounted when route is registered', () => {
    const dock = read('src/site00/components/designBench/designAgent/DesignAgentDock.tsx');
    expect(dock).not.toMatch(/registered === false && !targeting\.registryError\) return null/);
    expect(dock).toContain('data-testid="design-agent-dock"');
  });
});
