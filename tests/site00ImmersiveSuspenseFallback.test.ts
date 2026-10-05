/**
 * Suspense fallbacks must not re-portal an infinite loader after the cinematic gate completes.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('SITE 00 immersive suspense fallback guard', () => {
  it('exports immersive session complete helper', () => {
    expect(read('src/site00/components/loader/site00LoaderSession.ts')).toContain(
      'isSite00ImmersiveSessionComplete',
    );
  });

  it('world route suspense fallback never portals immersive loader', () => {
    const fallback = read('src/site00/components/loader/Site00RouteLoadingFallback.tsx');
    expect(fallback).not.toContain('Site00ImmersiveColdStartFallback');
    expect(fallback).toContain('ReferenceShellSuspenseFallback');
  });

  it('ASSTS route suspense fallback never portals immersive loader', () => {
    const suspense = read('src/site00/assts/components/AsstsRouteSuspense.tsx');
    expect(suspense).not.toContain('Site00ImmersiveLoader');
  });

  it('purge helper strips immersive loader DOM', () => {
    expect(read('src/site00/components/loader/site00PurgeImmersiveLoaderDom.ts')).toContain(
      '.site00-immersive-loader',
    );
    expect(read('public/site00-assts-boot-recovery.js')).toContain('watchdog-session-complete');
  });

  it('ASSTS cold start gate matches world gate failsafe hooks', () => {
    const gate = read('src/site00/assts/components/AsstsColdStartGate.tsx');
    expect(gate).toContain('forceRevealApp');
    expect(gate).toContain('wall-clock-failsafe');
    expect(gate).toContain('SITE00_FORCE_REVEAL_LOADER_EVENT');
  });

  it('boot CSS does not hide #root after boot shell is hidden', () => {
    expect(read('public/site00-assts-loader-boot.css')).toContain(':has(#site00-assts-boot-shell:not([hidden]))');
  });
});
