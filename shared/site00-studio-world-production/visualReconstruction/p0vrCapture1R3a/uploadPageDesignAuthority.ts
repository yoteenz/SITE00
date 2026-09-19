/**
 * P0.VR.CAPTURE.1R3A — Supabase upload path for founder page-scoped design authority.
 */

export function buildPageDesignAuthorityStoragePath(input: {
  projectId: string;
  screenId: string;
  viewport: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '').toLowerCase() || 'webp';
  return `site00/visual-references/founder/${input.projectId}/page-authority/${input.screenId}-${input.viewport}-${Date.now()}.${ext}`;
}

export function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  try {
    return {
      mimeType: match[1] ?? 'image/png',
      buffer: Buffer.from(match[2] ?? '', 'base64'),
    };
  } catch {
    return null;
  }
}

export type PageDesignAuthorityUploadResult = {
  publicUrl: string;
  storagePath: string;
  byteSize: number;
  mimeType: string;
};
