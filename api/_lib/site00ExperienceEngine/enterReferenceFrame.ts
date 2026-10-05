/**
 * Compose approved environment asset into canonical viewport reference frame.
 */

import sharp from 'sharp';
import { ENTER_DESKTOP_VIEWPORT } from '../../../shared/site00-experience-engine/constants.js';

export type ComposeReferenceFrameInput = {
  assetBuffer: Buffer;
  width?: number;
  height?: number;
  /** CSS background-position equivalent — e.g. "center 75%" */
  focal?: string;
};

function parseFocal(focal: string): { x: number; y: number } {
  const parts = focal.trim().split(/\s+/);
  const parseAxis = (token: string, fallback: number): number => {
    if (token === 'center') return 0.5;
    if (token.endsWith('%')) return Number.parseFloat(token) / 100;
    return fallback;
  };
  return {
    x: parseAxis(parts[0] ?? 'center', 0.5),
    y: parseAxis(parts[1] ?? parts[0] ?? 'center', 0.5),
  };
}

/**
 * Cover-crop source image to viewport using focal anchor (matches CSS background-position behavior).
 */
export async function composeReferenceFrame(input: ComposeReferenceFrameInput): Promise<Buffer> {
  const width = input.width ?? ENTER_DESKTOP_VIEWPORT.width;
  const height = input.height ?? ENTER_DESKTOP_VIEWPORT.height;
  const focal = parseFocal(input.focal ?? 'center 75%');
  const meta = await sharp(input.assetBuffer).metadata();
  const srcW = meta.width ?? width;
  const srcH = meta.height ?? height;
  const scale = Math.max(width / srcW, height / srcH);
  const scaledW = Math.ceil(srcW * scale);
  const scaledH = Math.ceil(srcH * scale);
  const scaled = await sharp(input.assetBuffer).resize(scaledW, scaledH, { fit: 'fill' }).toBuffer();
  const maxLeft = Math.max(0, scaledW - width);
  const maxTop = Math.max(0, scaledH - height);
  const left = Math.round(maxLeft * focal.x);
  const top = Math.round(maxTop * focal.y);
  return sharp(scaled)
    .extract({ left, top, width: Math.min(width, scaledW), height: Math.min(height, scaledH) })
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
}

export async function fetchEnterDesktopAuthorityAsset(supabaseUrl?: string): Promise<Buffer> {
  const base = (supabaseUrl ?? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const projectRef = process.env.VITE_SUPABASE_URL?.includes('supabase.co')
    ? new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0]
    : 'hyycomvcaqxxvyrfupes';
  const url =
    base.length > 0
      ? `${base}/storage/v1/object/public/live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png`
      : `https://${projectRef}.supabase.co/storage/v1/object/public/live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch enter desktop authority asset: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
