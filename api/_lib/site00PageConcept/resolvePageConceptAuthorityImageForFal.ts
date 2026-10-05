/**
 * Resolve page-concept authority images (data URLs, raw base64, or persisted public URLs) for FAL upload.
 */

export type ResolvedAuthorityImage = {
  bytes: Buffer;
  mime: string;
  filename: string;
};

function mimeFromFilename(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

export async function resolvePageConceptAuthorityImageForFal(imageUri: string): Promise<ResolvedAuthorityImage> {
  const trimmed = imageUri.trim();
  if (!trimmed) throw new Error('EXPERIENCE_MOBILE_AUTHORITY_IMAGE_MISSING');

  const dataMatch = trimmed.match(/^data:(image\/[^;]+);base64,(.+)$/s);
  if (dataMatch) {
    const mime = dataMatch[1]!;
    const b64 = dataMatch[2]!.replace(/\s/g, '');
    const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
    return {
      mime,
      bytes: Buffer.from(b64, 'base64'),
      filename: `experience-anchor.${ext}`,
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const res = await fetch(trimmed);
    if (!res.ok) {
      throw new Error(`EXPERIENCE_MOBILE_AUTHORITY_FETCH_FAILED: HTTP ${res.status}`);
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 64) {
      throw new Error('EXPERIENCE_MOBILE_AUTHORITY_FETCH_FAILED: empty image body');
    }
    const ct = res.headers.get('content-type')?.split(';')[0]?.trim();
    const pathName = trimmed.split('/').pop()?.split('?')[0] ?? 'experience-anchor.png';
    const mime = ct && ct.startsWith('image/') ? ct : mimeFromFilename(pathName);
    return { bytes, mime, filename: pathName.includes('.') ? pathName : 'experience-anchor.png' };
  }

  try {
    const bytes = Buffer.from(trimmed.replace(/\s/g, ''), 'base64');
    if (bytes.length < 64) throw new Error('too small');
    return { bytes, mime: 'image/png', filename: 'experience-anchor.png' };
  } catch {
    throw new Error('EXPERIENCE_MOBILE_AUTHORITY_PARSE_FAILED');
  }
}
