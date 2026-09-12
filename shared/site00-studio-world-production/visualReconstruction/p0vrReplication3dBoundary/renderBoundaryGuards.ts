import type { RenderBoundaryFailureCode } from './types.js';

export function assertTwinContentRoot(contentRootPresent: boolean): RenderBoundaryFailureCode | null {
  return contentRootPresent ? null : 'INVALID_MOUNT_ROOT';
}

export function assertNotInsideShellChrome(mountInsideHostHeader: boolean): RenderBoundaryFailureCode | null {
  return mountInsideHostHeader ? 'INVALID_MOUNT_ROOT' : null;
}

export function assertNotInsideHeroMediaSlot(mountInsideHeroMedia: boolean): RenderBoundaryFailureCode | null {
  return mountInsideHeroMedia ? 'HERO_SLOT_MISBOUND' : null;
}

export function assertRegionOutputTypeCompatible(allowed: boolean, outputKind: string): RenderBoundaryFailureCode | null {
  if (allowed) return null;
  if (outputKind === 'PAGE_LEVEL_RENDER_CONTENT' || outputKind === 'LITERAL_SCREENSHOT_ASSET') {
    return 'NESTED_PAGE_RENDER';
  }
  return 'HERO_SLOT_MISBOUND';
}

export function assertCoordinateSpaceIsPageLevel(valid: boolean): RenderBoundaryFailureCode | null {
  return valid ? null : 'INVALID_COORDINATE_SPACE';
}
