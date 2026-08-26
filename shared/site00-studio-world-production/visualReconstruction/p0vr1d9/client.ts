/**
 * P0.VR.1D.9 — Client-safe mobile shell spec exports (no Node APIs).
 */

export {
  CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
  LAB_MOBILE_VISUAL_SHELL_SPEC,
  FUNCTIONAL_SHELL_AUTHORITY,
  CAMPAIGN_VISUAL_SHELL_AUTHORITY,
  LAB_VISUAL_SHELL_AUTHORITY,
  resolveMobileVisualShellSpec,
  mobileVisualShellSpecToCssVars,
  functionalAndVisualShellAuthoritySeparated,
} from './mobileScreenVisualShellSpec.js';
export type { MobileScreenVisualShellSpec } from './types.js';
