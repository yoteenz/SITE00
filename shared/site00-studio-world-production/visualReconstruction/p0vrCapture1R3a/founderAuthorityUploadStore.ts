/**
 * P0.VR.CAPTURE.1R3A — Browser-local founder authority upload bytes (pilot persistence).
 */

import { FOUNDER_AUTHORITY_UPLOAD_LS_PREFIX } from './constants.js';

export function buildFounderAuthorityStoragePath(input: {
  projectId: string;
  screenId: string;
  viewport: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '');
  return `/visual-references/founder/${input.projectId}/page-authority/${input.screenId}-${input.viewport}-${Date.now()}.${ext}`;
}

export function persistFounderAuthorityUpload(storagePath: string, dataUrl: string): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(`${FOUNDER_AUTHORITY_UPLOAD_LS_PREFIX}${storagePath}`, dataUrl);
  } catch {
    /* quota */
  }
}

export function readFounderAuthorityUpload(storagePath: string): string | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage.getItem(`${FOUNDER_AUTHORITY_UPLOAD_LS_PREFIX}${storagePath}`);
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (typeof globalThis.FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new globalThis.FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('READ_FAILED'));
      reader.readAsDataURL(file);
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'application/octet-stream';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}
