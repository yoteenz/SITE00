/**
 * P0.VR.1D.2 — Resolve actual founder NDX project hub mood boards.
 * Does not silently substitute wireframe fixtures for live execution.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { FounderBoardResolution } from './types.js';

export const NDX_FOUNDER_BOARD_CANONICAL_PATHS = {
  desktop: 'visual-references/founder/ndxbook/desktop-mood-board.png',
  mobile: 'visual-references/founder/ndxbook/mobile-mood-board.png',
} as const;

export const NDX_FOUNDER_BOARD_SUPABASE_PATHS = {
  desktop: 'site00/visual-references/projects/ndxbook/founder-workspace-desktop-board.png',
  mobile: 'site00/visual-references/projects/ndxbook/founder-workspace-mobile-board.png',
} as const;

export const NDX_WIREFRAME_FIXTURE_PATHS = {
  desktop: 'tests/fixtures/visual-reconstruction/ndxbook-workspace-desktop-primary.png',
  mobile: 'tests/fixtures/visual-reconstruction/ndxbook-workspace-mobile-primary.png',
} as const;

export const FAIL_FOUNDER_REFERENCE_MISSING = 'FAIL_FOUNDER_REFERENCE_MISSING' as const;

export type ResolveFounderBoardsInput = {
  projectRoot?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  allowFixtureFallback?: boolean;
  /** When true, emit hard warning if canonical founder boards are missing. */
  requireFounderReference?: boolean;
};

function abs(projectRoot: string, rel: string): string {
  return join(projectRoot, rel);
}

async function tryDownloadSupabaseObject(
  supabaseUrl: string,
  serviceKey: string,
  objectPath: string,
  destAbs: string,
): Promise<boolean> {
  try {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { dirname } = await import('node:path');
    const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/live-preview/${objectPath}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${serviceKey}` } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return false;
    mkdirSync(dirname(destAbs), { recursive: true });
    writeFileSync(destAbs, buf);
    return true;
  } catch {
    return false;
  }
}

export async function resolveNdxFounderProjectHubBoards(
  input: ResolveFounderBoardsInput = {},
): Promise<FounderBoardResolution> {
  const root = input.projectRoot ?? process.cwd();
  const envDesktop = process.env.NDX_FOUNDER_DESKTOP_BOARD_PATH?.trim();
  const envMobile = process.env.NDX_FOUNDER_MOBILE_BOARD_PATH?.trim();

  if (envDesktop && existsSync(envDesktop) && envMobile && existsSync(envMobile)) {
    return {
      source: 'ENV_OVERRIDE',
      desktopPath: envDesktop,
      mobilePath: envMobile,
      desktopUrl: null,
      mobileUrl: null,
      fixtureSubstitution: false,
      storageResolution: 'environment paths',
    };
  }

  const canonicalDesktop = abs(root, NDX_FOUNDER_BOARD_CANONICAL_PATHS.desktop);
  const canonicalMobile = abs(root, NDX_FOUNDER_BOARD_CANONICAL_PATHS.mobile);
  if (existsSync(canonicalDesktop) && existsSync(canonicalMobile)) {
    return {
      source: 'CANONICAL_LOCAL',
      desktopPath: canonicalDesktop,
      mobilePath: canonicalMobile,
      desktopUrl: null,
      mobileUrl: null,
      fixtureSubstitution: false,
      storageResolution: 'visual-references/founder/ndxbook/',
    };
  }

  const supabaseUrl = input.supabaseUrl ?? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = input.supabaseServiceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const cacheDesktop = abs(root, '.cache/ndx-founder-boards/desktop-mood-board.png');
    const cacheMobile = abs(root, '.cache/ndx-founder-boards/mobile-mood-board.png');
    const gotDesktop = await tryDownloadSupabaseObject(
      supabaseUrl,
      serviceKey,
      NDX_FOUNDER_BOARD_SUPABASE_PATHS.desktop,
      cacheDesktop,
    );
    const gotMobile = await tryDownloadSupabaseObject(
      supabaseUrl,
      serviceKey,
      NDX_FOUNDER_BOARD_SUPABASE_PATHS.mobile,
      cacheMobile,
    );
    if (gotDesktop && gotMobile) {
      return {
        source: 'FOUNDER_PERSISTED',
        desktopPath: cacheDesktop,
        mobilePath: cacheMobile,
        desktopUrl: `${supabaseUrl}/storage/v1/object/live-preview/${NDX_FOUNDER_BOARD_SUPABASE_PATHS.desktop}`,
        mobileUrl: `${supabaseUrl}/storage/v1/object/live-preview/${NDX_FOUNDER_BOARD_SUPABASE_PATHS.mobile}`,
        fixtureSubstitution: false,
        storageResolution: 'supabase live-preview',
      };
    }
  }

  if (input.allowFixtureFallback) {
    const fixtureDesktop = abs(root, NDX_WIREFRAME_FIXTURE_PATHS.desktop);
    const fixtureMobile = abs(root, NDX_WIREFRAME_FIXTURE_PATHS.mobile);
    if (existsSync(fixtureDesktop) && existsSync(fixtureMobile)) {
      return {
        source: 'FIXTURE_FALLBACK',
        desktopPath: fixtureDesktop,
        mobilePath: fixtureMobile,
        desktopUrl: null,
        mobileUrl: null,
        fixtureSubstitution: true,
        storageResolution: 'wireframe fixtures — NOT founder editorial boards',
        warning: input.requireFounderReference ? FAIL_FOUNDER_REFERENCE_MISSING : undefined,
      };
    }
  }

  return {
    source: 'NOT_FOUND',
    desktopPath: null,
    mobilePath: null,
    desktopUrl: null,
    mobileUrl: null,
    fixtureSubstitution: false,
    storageResolution: 'founder boards not persisted — upload to visual-references/founder/ndxbook/ or Supabase',
    failFounderReferenceMissing: input.requireFounderReference ?? true,
    warning: FAIL_FOUNDER_REFERENCE_MISSING,
  };
}

export function founderBoardsRequiredForLiveExecution(resolution: FounderBoardResolution): boolean {
  return resolution.source !== 'NOT_FOUND' && !resolution.fixtureSubstitution;
}
