import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(resolve(root, rel), 'utf8');
}

describe('Page creative upgrade drawer (mobile UPGRADE THIS PAGE)', () => {
  it('renders upgrade wizard in a portal drawer', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('createPortal');
    expect(panel).toContain('site00-dw-wizard-drawer');
    expect(panel).toContain('open: boolean');
  });

  it('stores upgrade session in React state and resolves canonical capture binding', () => {
    const workspace = read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx');
    expect(workspace).toContain('useState<PageCreativeUpgradeSession | null>');
    expect(workspace).toContain('resolveCurrentPageViewportCapture');
    expect(workspace).toContain('setUpgradeSession(session)');
    expect(workspace).not.toContain('if (!viewportCapture?.captureId) return;');
  });

  it('surfaces upgrade open failures in capture panel', () => {
    const capturePanel = read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx');
    expect(capturePanel).toContain('upgradeError');
  });
});
