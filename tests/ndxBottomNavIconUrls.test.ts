/**
 * Bottom nav founder PNG icon URLs.
 */

import { describe, expect, it } from 'vitest';
import { NDX_BOTTOM_NAV_ICON_FILES } from '../src/site00/config/ndxBottomNavIconUrls.js';

describe('NDX bottom nav icon URLs', () => {
  it('maps all five project bottom panel icons', () => {
    expect(NDX_BOTTOM_NAV_ICON_FILES.overview).toBe('E1338D32-15BE-4B60-B743-E408EE8C99B7.png');
    expect(NDX_BOTTOM_NAV_ICON_FILES.campaigns).toBe('CE13C8F0-B45D-4146-A36C-BAFE0A7655A8.png');
    expect(NDX_BOTTOM_NAV_ICON_FILES.content_ops).toBe('C2E80426-CE34-4369-B8B6-4B9E035E29D7.png');
    expect(NDX_BOTTOM_NAV_ICON_FILES.lab).toBe('8DA238D1-0D12-4BD2-BC72-B6EC3742A112.png');
    expect(NDX_BOTTOM_NAV_ICON_FILES.more).toBe('47B47A35-B9AC-4D3B-A25B-9F6F89ABF2E7.png');
    expect(Object.keys(NDX_BOTTOM_NAV_ICON_FILES)).toHaveLength(5);
  });

  it('mobile chrome and fallback nav use NDXBottomNavIcon', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const root = join(import.meta.dirname, '..');
    const chrome = readFileSync(join(root, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'), 'utf8');
    const nav = readFileSync(join(root, 'src/site00/components/founderWorkspace/FounderWorkspaceMobileNav.tsx'), 'utf8');
    expect(chrome).toContain('NDXBottomNavIcon');
    expect(nav).toContain('NDXBottomNavIcon');
  });
});
