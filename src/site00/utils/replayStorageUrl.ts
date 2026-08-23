/** Public Supabase storage URL for SITE 00 assets (live-preview bucket). */
export function site00StoragePublicUrl(storagePath: string, bucket = 'live-preview'): string {
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url || !storagePath.trim()) return '';
  try {
    const ref = new URL(url).hostname.split('.')[0];
    const normalized = storagePath.replace(/^\/+/, '');
    return `https://${ref}.supabase.co/storage/v1/object/public/${bucket}/${normalized}`;
  } catch {
    return '';
  }
}
