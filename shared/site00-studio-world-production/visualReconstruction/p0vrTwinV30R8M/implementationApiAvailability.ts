/** Server persistence unavailable — client should use local compile + browser cache. */
export function isMobileTwinImplementationServerUnavailableMessage(message: string): boolean {
  return (
    message.includes('Load failed') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('MOBILE_TWIN_IMPLEMENTATION_STATE_FAILED') ||
    message.includes('MOBILE_TWIN_IMPLEMENTATION_API_UNREACHABLE') ||
    message.includes('MOBILE_TWIN_IMPLEMENTATION_SCHEMA_MISSING') ||
    message.includes('MOBILE_TWIN_IMPLEMENTATION_STORE_UNAVAILABLE')
  );
}

export const MOBILE_TWIN_SCHEMA_MISSING_FOUNDER_HINT =
  'Railway API is up but Supabase tables for mobile twin implementation are missing. Apply migration supabase/migrations/20260914193000_site00_mobile_twin_implementation_r8m.sql — until then, REBUILD TWIN DESIGN ROUTE uses local compile + browser cache on this device.';
