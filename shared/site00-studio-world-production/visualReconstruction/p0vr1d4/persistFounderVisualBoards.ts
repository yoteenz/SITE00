/**
 * P0.VR.1D.4 — Persist founder mood boards to canonical paths + Supabase.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  NDX_FOUNDER_BOARD_CANONICAL_PATHS,
  NDX_FOUNDER_BOARD_SUPABASE_PATHS,
} from '../p0vr1d2/resolveNdxFounderBoardAssets.js';
import type { FounderVisualBoardReference } from './types.js';
import { buildFounderVisualBoardReferences } from './founderVisualBoardReference.js';
import type { FounderBoardResolution } from '../p0vr1d2/types.js';

export type PersistFounderVisualBoardsInput = {
  projectId?: string;
  projectRoot?: string;
  desktopSourcePath: string;
  mobileSourcePath: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
};

export type PersistFounderVisualBoardsResult = {
  desktopCanonicalPath: string;
  mobileCanonicalPath: string;
  desktopUploaded: boolean;
  mobileUploaded: boolean;
  references: FounderVisualBoardReference[];
};

function abs(root: string, rel: string): string {
  return join(root, rel);
}

async function uploadToSupabase(
  supabaseUrl: string,
  serviceKey: string,
  objectPath: string,
  buffer: Buffer,
): Promise<boolean> {
  try {
    const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/live-preview/${objectPath}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: buffer,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function persistFounderVisualBoards(
  input: PersistFounderVisualBoardsInput,
): Promise<PersistFounderVisualBoardsResult> {
  const root = input.projectRoot ?? process.cwd();
  const projectId = input.projectId ?? 'ndxbook';

  if (!existsSync(input.desktopSourcePath) || !existsSync(input.mobileSourcePath)) {
    throw new Error('Founder board source files must exist before persistence');
  }

  const desktopCanonical = abs(root, NDX_FOUNDER_BOARD_CANONICAL_PATHS.desktop);
  const mobileCanonical = abs(root, NDX_FOUNDER_BOARD_CANONICAL_PATHS.mobile);
  mkdirSync(dirname(desktopCanonical), { recursive: true });
  mkdirSync(dirname(mobileCanonical), { recursive: true });
  copyFileSync(input.desktopSourcePath, desktopCanonical);
  copyFileSync(input.mobileSourcePath, mobileCanonical);

  const supabaseUrl = input.supabaseUrl ?? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = input.supabaseServiceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  let desktopUploaded = false;
  let mobileUploaded = false;

  if (supabaseUrl && serviceKey) {
    desktopUploaded = await uploadToSupabase(
      supabaseUrl,
      serviceKey,
      NDX_FOUNDER_BOARD_SUPABASE_PATHS.desktop,
      readFileSync(desktopCanonical),
    );
    mobileUploaded = await uploadToSupabase(
      supabaseUrl,
      serviceKey,
      NDX_FOUNDER_BOARD_SUPABASE_PATHS.mobile,
      readFileSync(mobileCanonical),
    );
  }

  const resolution: FounderBoardResolution = {
    source: desktopUploaded && mobileUploaded ? 'FOUNDER_PERSISTED' : 'CANONICAL_LOCAL',
    desktopPath: desktopCanonical,
    mobilePath: mobileCanonical,
    desktopUrl: desktopUploaded
      ? `${supabaseUrl}/storage/v1/object/live-preview/${NDX_FOUNDER_BOARD_SUPABASE_PATHS.desktop}`
      : null,
    mobileUrl: mobileUploaded
      ? `${supabaseUrl}/storage/v1/object/live-preview/${NDX_FOUNDER_BOARD_SUPABASE_PATHS.mobile}`
      : null,
    fixtureSubstitution: false,
    storageResolution: desktopUploaded && mobileUploaded ? 'supabase live-preview' : 'canonical local copy',
  };

  return {
    desktopCanonicalPath: desktopCanonical,
    mobileCanonicalPath: mobileCanonical,
    desktopUploaded,
    mobileUploaded,
    references: buildFounderVisualBoardReferences({ projectId, resolution }),
  };
}
