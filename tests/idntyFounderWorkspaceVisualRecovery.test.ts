import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV } from '../src/site00/admin/founder-workspace/config/navigation';
import { age, readLifecycle } from '../src/site00/admin/founder-workspace/data/lifecycle';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('founder workspace visual recovery (Opus 1)', () => {
  it('local API loader bundles with an esbuild that parses TypeScript satisfies (cards.ts compile failure)', async () => {
    const loader = read('scripts/vite-site00-local-api.mjs');
    expect(loader).not.toMatch(/^import esbuild from 'esbuild';/m);
    expect(loader).toContain("resolve('vite/package.json'))('esbuild')");
    const req = createRequire(createRequire(join(ROOT, 'package.json')).resolve('vite/package.json'));
    const esbuild = req('esbuild') as typeof import('esbuild');
    const src = read('shared/site00-correspondence-studio/fndatn01/cards.ts');
    await expect(esbuild.transform(src, { loader: 'ts' })).resolves.toBeTruthy();
  });

  it('keeps the founder-locked phone bottom bar and routes the shell through it', () => {
    expect(FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV.map((i) => i.id)).toEqual(['overview', 'foundations', 'create', 'reviews', 'system']);
    const shell = read('src/site00/admin/founder-workspace/shell/FounderWorkspaceShell.tsx');
    expect(shell).toContain('FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV.map');
    expect(shell).toContain("import '../styles/ifw-authority.css'");
  });

  it('ports the approved stylesheet scoped to the workspace root, with link/button colour resets', () => {
    const css = read('src/site00/admin/founder-workspace/styles/ifw-authority.css');
    expect(css).not.toMatch(/:root\s*\{/);
    expect(css).not.toMatch(/^html, body/m);
    expect(css).toContain(':where(.ws) a { color: inherit; text-decoration: none; }');
    expect(css).toMatch(/:where\(\.ws\) button \{[^}]*color: inherit/);
    expect(css).toContain("--ws-display: 'SITE 00 Display'");
    expect(css).toContain("--ws-text: 'Saira Semi Condensed'");
    expect(css).toContain('env(safe-area-inset-bottom');
  });

  it('maps real artifact state onto the lifecycle grammar without inventing data', () => {
    expect(readLifecycle({ state: 'QUOTE_READY', payment_state: 'NONE' })).toMatchObject({ phase: 3, kind: 'founder', owner: 'FOUNDER', action: 'APPROVE QUOTE' });
    expect(readLifecycle({ state: 'INTAKE_IN_PROGRESS', payment_state: 'NONE' })).toMatchObject({ phase: 1, kind: 'client', owner: 'CLIENT' });
    expect(readLifecycle({ state: 'IN_PROGRESS', payment_state: 'PAID' })).toMatchObject({ phase: 5, kind: 'work', owner: 'SITE 00' });
    expect(readLifecycle({ state: 'PAID', payment_state: 'DISPUTED' })).toMatchObject({ kind: 'blocked', label: 'PAYMENT DISPUTED' });
    expect(readLifecycle({ state: 'IN_PROGRESS', payment_state: 'PAID' }, { artifact_id: 'x', business_name: null, payment_state: 'PAID', current_stage: null, next_action: null, blocker: 'dns ticket open' })).toMatchObject({ kind: 'blocked', action: 'DNS TICKET OPEN' });
    expect(readLifecycle({ state: 'SOMETHING_NEW', payment_state: 'NONE' })).toMatchObject({ kind: 'idle', label: 'SOMETHING NEW' });
  });

  it('formats compact ages', () => {
    const now = Date.parse('2026-10-19T12:00:00Z');
    expect(age('2026-10-19T11:20:00Z', now)).toBe('40M');
    expect(age('2026-10-19T09:00:00Z', now)).toBe('3H');
    expect(age('2026-10-17T12:00:00Z', now)).toBe('2D');
    expect(age(undefined, now)).toBe('—');
  });

  it('gates workspace UI until Display + Saira preload (no fallback font flash)', () => {
    const shell = read('src/site00/admin/founder-workspace/shell/FounderWorkspaceShell.tsx');
    expect(shell).toContain('useFounderWorkspaceFontsReady');
    expect(shell).toContain('ws--fonts-pending');
    const fonts = read('src/site00/admin/founder-workspace/shell/founderWorkspaceFonts.ts');
    expect(fonts).toContain('site00-correspondence-display.woff2');
    expect(fonts).toContain('document.fonts.load');
    const css = read('src/site00/admin/founder-workspace/styles/ifw-authority.css');
    expect(css).toContain('.ws--fonts-pending .ws-app');
    const app = read('src/site00/admin/founder-workspace/FounderWorkspaceApp.tsx');
    expect(app).toContain('site00-correspondence-fonts.css');
  });

  it('overview binds to the admin API and carries no illustrative fixtures', () => {
    const page = read('src/site00/admin/founder-workspace/pages/OverviewPage.tsx');
    expect(page).toContain('foundationAdminApi.list()');
    expect(page).toContain('foundationAdminApi.pipeline()');
    for (const fixture of ['HORIZON FREIGHT', 'CARTER & LANE', 'Horizon Freight', 'Anthony']) expect(page).not.toContain(fixture);
    for (const cls of ['ws-focus', 'ws-signals', 'reg__r', 'ov__needs', 'ov__move']) expect(page).toContain(cls);
  });
});
