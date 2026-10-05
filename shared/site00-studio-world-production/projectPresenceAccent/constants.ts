/**
 * Host-canonical tokens — project colors live in brand registry, not here.
 */

/** Canonical SITE 00 host accent (matches --site-red in tokens.css). */
export const SITE00_HOST_ACCENT = '#e8192c' as const;

export const SITE00_HOST_ACCENT_TOKEN = '--site00-host-accent' as const;

export const SITE00_PROJECT_PRESENCE_ACCENT_TOKEN = '--site00-project-presence-accent' as const;

export const HOST_CRITICAL_SURFACES = [
  'global_host_wayfinding_red',
  'host_navigation_active',
  'admin_control_center',
  'host_error_state',
  'host_warning_state',
  'global_shell_border',
  'account_chrome',
  'host_system_typography',
] as const;
