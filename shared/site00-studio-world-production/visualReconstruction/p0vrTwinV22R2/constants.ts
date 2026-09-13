export const P0_VR_TWIN_V22R2_BUILD = 'v365' as const;

export const HOST_PREVIEW_NOT_WIRED = 'HOST_PREVIEW_NOT_WIRED' as const;

export const VISUAL_OWNERSHIP = [
  'HOST_OWNED_LOCKED',
  'CLIENT_OWNED_CREATIVE',
  'SHARED_BOUNDARY',
  'DEVICE_CHROME_EXCLUDED',
] as const;

/** Labels image models often invent — not SITE 00 canonical host nav (MOBILE_SITE_NAV). */
export const GENERATED_HOST_BOTTOM_NAV_LABELS = [
  'HOME',
  'PROJECTS',
  'CREATE',
  'MESSAGES',
  'ACCOUNT',
] as const;

export const TWIN_V2_HOST_BOUNDARY_VIOLATION = 'TWIN_V2_HOST_BOUNDARY_VIOLATION' as const;

export const HOST_SHELL_COMPONENT_REFS = {
  hostHeader: 'site00-twin-v2-ndx__host',
  hostBottomNav: 'TwinSite00HostBottomNav',
  clientMountRoot: 'site00-twin-v2-ndx__client-canvas',
} as const;
