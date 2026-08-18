/** Supabase project ref from VITE_SUPABASE_URL — standalone SITE 00 (no Frontal Slayer immune-system import). */
export function site00SupabaseProjectRef(): string {
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url) return '';
  try {
    return new URL(url).hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

export function site00SupabasePublicStorageBase(bucketPath = 'live-preview/site00/'): string {
  const ref = site00SupabaseProjectRef();
  if (!ref) return '/site00/';
  return `https://${ref}.supabase.co/storage/v1/object/public/${bucketPath}`;
}
