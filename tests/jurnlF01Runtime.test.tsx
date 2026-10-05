/**
 * P0.JURNL.SITE00-INGEST-F01 — JURNL F01 live runtime: routing (14 screens), state authorities (27), interaction
 * manifest → runtime bindings (74), overlays (drawers / sheets / modals / handoffs), password + form behaviour,
 * adapters (no fake production success), UPPERCASE contract, control geometry, host / project firewall,
 * no failed-harvest assets, no OpenArt.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { F01_CLAIMS, F01_COPY, passwordRuleState, passwordSatisfied } from '../src/projects/jurnl/data/f01/copy';
import { F01_RUNTIME_EXTRA_STATES } from '../src/projects/jurnl/data/f01/coverage';
import { F01_INTERACTION_MANIFEST, F01_OVERLAYS, JURNL_COMPONENT_RUNTIME, listF01Bindings } from '../src/projects/jurnl/data/f01/interactionBindings';
import { F01_SCREENS, F01_STATES, f01Screen } from '../src/projects/jurnl/data/f01/screens';
import * as primitives from '../src/projects/jurnl/runtime/components/primitives';
import JurnlRuntimeRoot, { JURNL_F01_SCREEN_COMPONENTS } from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import {
  createDesignPreviewAuthAdapter,
  createDesignPreviewNativeBridge,
  createUnconfiguredAuthAdapter,
  createWebUnavailableNativeBridge,
  memoryKV,
  readScenario,
} from '../src/projects/jurnl/runtime/state/adapters';
import { getProjectRuntime, isProjectRuntimeMessage, projectRuntimeUrl } from '../src/site00/projectRuntime/projectRuntimeRegistry';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
function walk(dir: string): string[] {
  return readdirSync(path.join(root, dir)).flatMap((f) => {
    const rel = `${dir}/${f}`;
    return statSync(path.join(root, rel)).isDirectory() ? walk(rel) : [rel];
  });
}
const BASE = '/production/jurnl/runtime';
/** Top-level selector list split (commas inside :where(...) / :is(...) stay put). */
function splitSelectors(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function renderRuntime(route: string, query = '', mode: 'design-preview' | 'production' = 'design-preview') {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode }) })),
    ),
  );
}
const screenRoute = (id: string) => (id === 'F02' ? 'setup' : f01Screen(id)!.route);
/** Visible text only (tags + attribute values removed). */
const visibleText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#?[a-z0-9]+;/gi, ' ');

describe('F01 routing — every screen is a live route', () => {
  it('14 screens, each with its own runtime component', () => {
    expect(F01_SCREENS.map((s) => s.id)).toEqual(Object.keys(JURNL_F01_SCREEN_COMPONENTS));
    expect(F01_SCREENS).toHaveLength(14);
  });
  for (const s of F01_SCREENS) {
    it(`${s.id} ${s.name} renders at /${s.route}`, () => {
      const html = renderRuntime(s.route);
      expect(html).toContain(`data-jrn-screen="${s.id}"`);
      expect(html).toContain('data-project-runtime="jurnl"');
      expect(html).toContain('data-jrn-logo="official"');
      expect(html).toContain('data-testid="jurnl-environment"');
    });
  }
  it('F01 → F02 family boundary is a live route with the family transition', () => {
    const html = renderRuntime('setup');
    expect(html).toContain('data-jrn-screen="F02.BOUNDARY"');
    expect(html).toContain('data-transition="family"');
  });
  it('the runtime is registered for the generic project-runtime route', () => {
    expect(getProjectRuntime('jurnl')).toBeTruthy();
    expect(getProjectRuntime('ndxbook')).toBeNull();
    expect(projectRuntimeUrl('jurnl', 'entry/sign-in', { state: 'locked', os: null })).toBe('/production/jurnl/runtime/entry/sign-in?state=locked');
    expect(isProjectRuntimeMessage({ source: 'site00-project-runtime', type: 'route' })).toBe(true);
    expect(isProjectRuntimeMessage({ source: 'other' })).toBe(false);
  });
});

/** State authority → marker that proves the state renders. */
const STATE_MARKERS: Record<string, string> = {
  'F01.01.DEFAULT': 'data-jrn-trigger="create-first-name"',
  'F01.01.FOCUSED': 'data-focused="true"',
  'F01.01.VALIDATION_ERROR': 'data-jrn-trigger="create-error-validation"',
  'F01.01.EMAIL_IN_USE': 'data-jrn-trigger="create-error-email-in-use"',
  'F01.01.PASSWORD_SATISFIED': 'data-met="true"',
  'F01.01.LOADING': 'data-loading="true"',
  'F01.03.DEFAULT': 'data-jrn-trigger="signin-email"',
  'F01.03.INCORRECT_PASSWORD': 'data-jrn-trigger="signin-error-incorrect"',
  'F01.03.ACCOUNT_NOT_FOUND': 'data-jrn-trigger="signin-error-not-found"',
  'F01.03.LOCKED': 'data-jrn-overlay="locked"',
  'F01.03.LOADING': 'data-loading="true"',
  'F01.03.OFFLINE': 'data-jrn-trigger="signin-error-offline"',
  'F01.02.VERIFICATION_PENDING': 'data-jrn-trigger="verify-open-mail"',
  'F01.02.RESENT': 'data-jrn-trigger="verify-resend"',
  'F01.02.EXPIRED_LINK': 'data-jrn-trigger="verify-error-expired"',
  'F01.02.VERIFICATION_SUCCESS': 'data-jrn-trigger="verify-success-continue"',
  'F01.06.RESET_EMAIL_SENT': 'data-jrn-trigger="reset-sent-open-mail"',
  'F01.07.INVALID_RESET_LINK': 'data-jrn-trigger="newpw-error-invalid-link"',
  'F01.08.RESET_SUCCESS': 'data-jrn-trigger="reset-success-sign-in"',
  'F01.09.BIOMETRIC_PROMPT': 'data-jrn-overlay="faceid-enable"',
  'F01.09.BIOMETRIC_ENABLED': 'data-jrn-trigger="bio-enabled"',
  'F01.09.BIOMETRIC_DECLINED': 'data-jrn-overlay="biometric-denied"',
  'F01.09.BIOMETRIC_UNAVAILABLE': 'data-jrn-trigger="bio-error-unavailable"',
  'F01.10.DEVICE_TRUSTED': 'data-jrn-trigger="trust-trusted"',
  'F01.10.DEVICE_VERIFY_REQUIRED': 'data-jrn-trigger="trust-verify-required"',
  'F01.04.SESSION_EXPIRED': 'data-jrn-trigger="unlock-session-expired"',
  'F01.04.REAUTHENTICATION': 'data-jrn-trigger="unlock-reauthentication"',
};

describe('F01 state authorities — 27 states render through `?state=`', () => {
  it('every state authority has a marker', () => {
    expect(F01_STATES).toHaveLength(27);
    expect(Object.keys(STATE_MARKERS).sort()).toEqual(F01_STATES.map((s) => s.id).sort());
  });
  for (const st of F01_STATES) {
    it(`${st.id}`, () => {
      expect(renderRuntime(screenRoute(st.screenId), `state=${st.key}`)).toContain(STATE_MARKERS[st.id]);
    });
  }
  it('runtime-only interaction states render too', () => {
    const m: Record<string, string> = {
      'F01.04:faceid_failed': 'unlock-error-faceid',
      'F01.05:invalid_email': 'forgot-error-email',
      'F01.06:expired_link': 'reset-sent-error-expired',
      'F01.07:mismatch': 'newpw-error-mismatch',
      'F01.07:weak': 'newpw-error-weak',
    };
    for (const [screen, keys] of Object.entries(F01_RUNTIME_EXTRA_STATES)) {
      for (const k of keys) {
        const marker = m[`${screen}:${k}`];
        if (marker) expect(renderRuntime(screenRoute(screen), `state=${k}`), `${screen} ${k}`).toContain(`data-jrn-trigger="${marker}"`);
      }
    }
  });
});

describe('interaction manifest is connected to the runtime (74 / 74)', () => {
  const bindings = listF01Bindings();
  it('every manifest row is bound', () => {
    expect(F01_INTERACTION_MANIFEST.interactions).toHaveLength(74);
    expect(bindings).toHaveLength(74);
  });
  it('every component_reference resolves to an exported runtime primitive', () => {
    for (const row of F01_INTERACTION_MANIFEST.interactions) {
      const rt = JURNL_COMPONENT_RUNTIME[row.component_reference];
      expect(rt, row.component_reference).toBeTruthy();
      expect(typeof (primitives as Record<string, unknown>)[rt!.component], rt!.component).toBe('function');
    }
    for (const rt of Object.values(JURNL_COMPONENT_RUNTIME)) expect(typeof (primitives as Record<string, unknown>)[rt.component], rt.component).toBe('function');
  });
  for (const b of bindings.filter((x) => x.trigger)) {
    it(`${b.interactionId} → trigger "${b.trigger}" is live on ${b.surface!.screenId}${b.surface!.query ? `?${b.surface!.query}` : ''}`, () => {
      const html = renderRuntime(screenRoute(b.surface!.screenId), b.surface!.query ?? '');
      expect(html).toContain(`data-jrn-trigger="${b.trigger}"`);
      if (b.action) expect(html).toContain(`data-jrn-trigger="${b.action}"`);
    });
  }
  it('route results point at real screens / the F02 boundary', () => {
    for (const b of bindings) {
      if (b.result.kind === 'route') expect(f01Screen(b.result.screenId), b.interactionId).toBeTruthy();
      if (b.result.kind === 'overlay') expect(Object.values(F01_OVERLAYS).flat(), b.interactionId).toContain(b.result.overlayId);
    }
  });
});

describe('overlays — drawers, sheets, modals, handoff boundaries', () => {
  const all = Object.entries(F01_OVERLAYS).flatMap(([screen, ids]) => ids.map((id) => ({ screen, id })));
  for (const { screen, id } of all) {
    it(`${screen} ?overlay=${id}`, () => {
      const html = renderRuntime(screenRoute(screen), `overlay=${id}`);
      expect(html).toContain(`data-jrn-overlay="${id}"`);
      expect(html).toMatch(/role="(dialog|alertdialog)"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="(dialog|alertdialog)"/);
    });
  }
  it('short + long drawers, a full-screen sheet, confirmation modals and both handoff boundaries are distinct', () => {
    expect(renderRuntime(screenRoute('F01.02'), 'overlay=change-email')).toContain('data-jrn-drawer="short"');
    expect(renderRuntime(screenRoute('F01.11'), 'overlay=privacy-ai-access')).toContain('data-jrn-drawer="long"');
    expect(renderRuntime(screenRoute('F01.04'), 'overlay=use-password')).toContain('data-jrn-sheet="full"');
    expect(renderRuntime(screenRoute('F01.12'), 'overlay=security-details')).toContain('data-jrn-sheet="full"');
    expect(renderRuntime(screenRoute('F01.04'), 'overlay=sign-out')).toContain('data-jrn-modal="confirm"');
    expect(renderRuntime(screenRoute('F01.11'), 'overlay=delete-account')).toContain('data-jrn-modal="confirm"');
    expect(renderRuntime(screenRoute('F01.02'), 'overlay=mail')).toContain('data-jrn-overlay="mail"');
    expect(renderRuntime(screenRoute('F01.04'), 'overlay=faceid-unlock')).toContain('data-jrn-handoff="native"');
    expect(renderRuntime(screenRoute('F01.01'), 'overlay=social-apple')).toContain('data-jrn-handoff="native"');
  });
  it('switch account surface lists accounts (square initials tiles) + ADD ACCOUNT + SIGN OUT', () => {
    const html = renderRuntime(screenRoute('F01.04'), 'overlay=switch-account');
    for (const t of ['switch-account-0', 'switch-add-account', 'switch-sign-out']) expect(html).toContain(`data-jrn-trigger="${t}"`);
  });
});

describe('password + forms', () => {
  it('requirements: 8+, uppercase, number, special', () => {
    expect(passwordRuleState('jurnl').map((r) => r.met)).toEqual([false, false, false, false]);
    expect(passwordRuleState('Jurnl-2026').map((r) => r.met)).toEqual([true, true, true, true]);
    expect(passwordSatisfied('Jurnl2026')).toBe(false);
  });
  it('show / hide password control is a square-rounded icon button on every password field', () => {
    for (const r of ['entry/create', 'entry/sign-in', 'entry/new-password']) {
      const html = renderRuntime(r);
      expect(html).toMatch(/class="jrn-field__reveal"[^>]*aria-label="SHOW PASSWORD"/);
      expect(html).toContain('type="password"');
    }
  });
  it('requirements expand inline under the password field (create account) and live on the new-password card', () => {
    expect(renderRuntime('entry/create')).toMatch(/data-open="false" data-jrn-trigger="create-password-requirements"/);
    expect(renderRuntime('entry/create', 'state=password_satisfied')).toMatch(/data-open="true" data-jrn-trigger="create-password-requirements"/);
    expect(renderRuntime('entry/new-password')).toContain('data-jrn-trigger="newpw-requirements"');
  });
  it('validation + loading states', () => {
    expect(renderRuntime('entry/create', 'state=validation_error')).toContain('PLEASE FIX THE FOLLOWING');
    expect(renderRuntime('entry/create', 'state=loading')).toContain('CREATING ACCOUNT...');
    expect(renderRuntime('entry/sign-in', 'state=loading')).toContain('SIGNING IN...');
  });
});

describe('auth + native boundaries never fake production success', () => {
  it('unconfigured (production) adapter fails honestly on every call', async () => {
    const a = createUnconfiguredAuthAdapter();
    for (const r of await Promise.all([a.signUp({ firstName: 'A', lastName: 'B', email: 'a@b.co', password: 'Jurnl-2026' }), a.signIn('a@b.co', 'x'), a.requestPasswordReset('a@b.co'), a.resetPassword('t', 'x')])) {
      expect(r.ok).toBe(false);
    }
    expect(await a.social('APPLE')).toEqual({ ok: false, code: 'PROVIDER_NOT_CONFIGURED' });
    expect(await createWebUnavailableNativeBridge().requestBiometric('ENABLE')).toBe('UNAVAILABLE');
  });
  it('design-preview adapter exercises real states', async () => {
    const kv = { ...memoryKV };
    const a = createDesignPreviewAuthAdapter({ kv, scenario: readScenario(new URLSearchParams('')), latencyMs: 0 });
    expect(await a.signUp({ firstName: 'E', lastName: 'S', email: 'emma@example.com', password: 'Jurnl-2026' })).toEqual({ ok: false, code: 'EMAIL_IN_USE' });
    expect((await a.signIn('EMMA@EXAMPLE.COM', 'Jurnl-2026')).ok).toBe(true);
    expect(await a.signIn('nobody@example.com', 'x')).toEqual({ ok: false, code: 'ACCOUNT_NOT_FOUND' });
    expect(await a.signIn('locked@example.com', 'Jurnl-2026')).toEqual({ ok: false, code: 'LOCKED' });
    const created = await a.signUp({ firstName: 'Ana', lastName: 'Lee', email: 'ana@example.com', password: 'Jurnl-2026!' });
    expect(created.ok && created.value.emailVerified).toBe(false);
    for (let i = 0; i < 4; i++) expect((await a.signIn('ana@example.com', 'nope')).ok).toBe(false);
    expect(await a.signIn('ana@example.com', 'nope')).toEqual({ ok: false, code: 'LOCKED' });
    expect(await a.validateResetToken('expired')).toEqual({ ok: false, code: 'INVALID_LINK' });
    expect(await a.social('GOOGLE')).toEqual({ ok: false, code: 'PROVIDER_NOT_CONFIGURED' });
    const offline = createDesignPreviewAuthAdapter({ kv, scenario: readScenario(new URLSearchParams('scenario=offline')), latencyMs: 0 });
    expect(await offline.signIn('EMMA@EXAMPLE.COM', 'Jurnl-2026')).toEqual({ ok: false, code: 'OFFLINE' });
  });
  it('native bridge reports OS outcomes and announces the handoff to the host — never renders OS UI', async () => {
    const seen: string[] = [];
    const bridge = createDesignPreviewNativeBridge({ scenario: readScenario(new URLSearchParams('os=denied')), notify: (t) => seen.push(t), latencyMs: 0 });
    expect(await bridge.requestBiometric('ENABLE')).toBe('DENIED');
    await bridge.openExternal('MAIL');
    expect(seen).toEqual(['FACE_ID_PERMISSION', 'MAIL']);
    const src = walk('src/projects/jurnl/runtime').map(read).join('\n');
    expect(src).not.toMatch(/SECURED BY APPLE|USE FACE ID\b(?!.*CONTINUE)/);
  });
});

describe('UPPERCASE contract', () => {
  const strings: string[] = [];
  const collect = (v: unknown) => {
    if (typeof v === 'string') strings.push(v);
    else if (typeof v === 'function') strings.push(String((v as (x: string) => string)('APPLE')));
    else if (Array.isArray(v)) v.forEach(collect);
    // `id` fields are identifiers, not user-facing copy.
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => k !== 'id' && collect(x));
  };
  collect(F01_COPY);
  it('every copy string is uppercase', () => {
    expect(strings.length).toBeGreaterThan(250);
    for (const s of strings) expect(s, s).toBe(s.toUpperCase());
  });
  it('no rendered JURNL text (screens, states, overlays) contains a lowercase letter; aria labels are uppercase', () => {
    const pages: [string, string][] = [
      ...F01_SCREENS.map((s) => [s.route, ''] as [string, string]),
      ['setup', ''],
      ...F01_STATES.map((s) => [screenRoute(s.screenId), `state=${s.key}`] as [string, string]),
      ...Object.entries(F01_OVERLAYS).flatMap(([screen, ids]) => ids.map((id) => [screenRoute(screen), `overlay=${id}`] as [string, string])),
    ];
    for (const [route, q] of pages) {
      const html = renderRuntime(route, q);
      const text = visibleText(html);
      expect(text.match(/[a-z]/g), `${route}?${q}: ${text.match(/\S*[a-z]\S*/)?.[0]}`).toBeNull();
      for (const m of html.matchAll(/aria-label="([^"]*)"/g)) expect(m[1], `${route}?${q}`).toBe(m[1]!.toUpperCase());
    }
  });
  it('the runtime uppercases user-entered names / emails visually (never password values)', () => {
    const css = read('src/projects/jurnl/runtime/jurnl-runtime.css');
    expect(css).toMatch(/\.jrn \{[\s\S]*?text-transform: uppercase;/);
    expect(css).toMatch(/\.jrn input\[type='password'\] \{\s*text-transform: none;/);
  });
});

describe('control geometry — zero circular tappable controls', () => {
  const cssFiles = ['src/projects/jurnl/runtime/jurnl-runtime.css', 'src/projects/jurnl/runtime/jurnl-screens.css', 'src/projects/jurnl/runtime/jurnl-environment.css'];
  it('circular radii exist only on decorative environment parts (aria-hidden, pointer-events none)', () => {
    for (const f of cssFiles) {
      const css = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const sel = m[1]!.trim();
        const body = m[2]!;
        const radius = body.match(/border-radius:\s*([^;]+);/)?.[1] ?? '';
        if (/50%|999|9999|100%|circle/.test(radius)) expect(sel, `${f}: ${sel}`).toMatch(/^\.jrn \.jrn-p--[a-z]+$/);
      }
    }
    expect(read('src/projects/jurnl/runtime/jurnl-environment.css')).toMatch(/\.jrn \.jrn-env \{[^}]*pointer-events: none;/);
  });
  it('every interactive control radius is square-rounded (≤ 16px)', () => {
    for (const f of cssFiles) {
      for (const m of read(f).matchAll(/border-radius:\s*([^;]+);/g)) {
        for (const v of m[1]!.split(/\s+/)) {
          const px = /^(\d+(?:\.\d+)?)px$/.exec(v);
          if (px) expect(+px[1]!, `${f} ${m[0]}`).toBeLessThanOrEqual(16);
        }
      }
    }
  });
  it('rendered controls are buttons/inputs with JURNL square classes; no circle markup', () => {
    for (const s of F01_SCREENS) {
      const html = renderRuntime(s.route);
      expect(html).not.toMatch(/<circle/);
      for (const m of html.matchAll(/<button[^>]*class="([^"]*)"/g)) expect(m[1], s.id).toMatch(/^jrn-(btn|link|iconbtn|check|toggle|row|field__reveal|badge)/);
    }
  });
});

describe('host / project firewall', () => {
  const runtimeFiles = walk('src/projects/jurnl/runtime');
  it('runtime imports nothing from the host except the type-only mount contract (shared pure domain modules allowed)', () => {
    const PURE_SHARED = /^shared\/site00-(monetization|product-families)\//;
    for (const f of runtimeFiles.filter((x) => /\.tsx?$/.test(x))) {
      for (const m of read(f).matchAll(/^import\s+(type\s+)?[^;]*?from\s+'([^']+)'/gm)) {
        const spec = m[2]!;
        if (!spec.startsWith('.')) continue;
        const target = path.relative(root, path.resolve(path.dirname(path.join(root, f)), spec)).split(path.sep).join('/');
        if (target.startsWith('src/site00/')) {
          expect(m[1], `${f}: ${spec}`).toBe('type ');
          expect(spec, f).toMatch(/projectRuntime\/projectRuntimeRegistry$/);
        } else if (target.startsWith('shared/')) {
          expect(target, `${f}: only pure shared domain modules`).toMatch(PURE_SHARED);
        }
      }
    }
    // the allowed shared modules are dependency-free: no React, no CSS, no host code
    for (const f of [...walk('shared/site00-monetization'), ...walk('shared/site00-product-families')].filter((x) => /\.ts$/.test(x) && !x.endsWith('.test.ts'))) {
      expect(read(f), f).not.toMatch(/from 'react|\.css'|src\/site00/);
    }
  });
  it('host code never imports a project runtime module directly (only via the lazy registry)', () => {
    for (const f of walk('src/site00').filter((x) => /\.tsx?$/.test(x))) {
      const src = read(f);
      if (/projects\/[a-z0-9-]+\/runtime/.test(src)) expect(f).toBe('src/site00/projectRuntime/projectRuntimeRegistry.ts');
    }
    expect(read('src/site00/projectRuntime/projectRuntimeRegistry.ts')).toMatch(/load: \(\) => import\('\.\.\/\.\.\/projects\/jurnl\/runtime\/JurnlRuntimeRoot'\)/);
  });
  it('JURNL CSS is fully scoped under .jrn (no :root / html / body / host classes)', () => {
    for (const f of runtimeFiles.filter((x) => x.endsWith('.css'))) {
      const css = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '').replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*\s*\}/g, '');
      for (const m of css.matchAll(/(^|\})\s*([^{}@][^{}]*)\{/g)) {
        for (const sel of splitSelectors(m[2]!).filter((x) => !x.startsWith('@'))) expect(sel, f).toMatch(/^\.jrn\b/);
      }
      expect(css).not.toMatch(/:root|(^|[^-\w])(body|html)(?![-\w])|\.pxa|\.ph-|\.site00/m);
    }
    for (const f of walk('src/site00/styles')) expect(read(f), f).not.toMatch(/\.jrn[-\s{.]/);
  });
  it('JURNL fonts are project-scoped (own files + family names), never the host font registry', () => {
    const css = read('src/projects/jurnl/runtime/jurnl-runtime.css');
    expect(css).toContain("font-family: 'JURNL Display'");
    expect(css).toContain("url('/site00/projects/jurnl/fonts/instrument-serif-400.woff2')");
    expect(css).not.toMatch(/Martian Mono|\/site00\/fonts\//);
  });
  it('the runtime route mounts outside Site00Layout and without the SITE 00 loader', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    const at = routes.indexOf('path={SITE00_ROUTES.productionProjectRuntime}');
    const block = routes.slice(at, routes.indexOf('/>\n', at + 200) + 3);
    expect(block).toContain('Site00InternalProductionGuard');
    expect(block).toContain('<Suspense fallback={null}>');
    expect(block).not.toContain('Site00Layout');
    expect(read('src/site00/config/routes.ts')).toContain("productionProjectRuntime: '/production/:projectSlug/runtime/*'");
  });
});

describe('assets + OpenArt restrictions', () => {
  const projectCode = [...walk('src/projects'), ...walk('src/site00/projectRuntime'), ...walk('shared/site00-product-families'), ...walk('shared/site00-project-ingestion')].filter((f) => /\.(tsx?|css)$/.test(f));
  it('failed F01 harvest assets / screen crops are never referenced by runtime code', () => {
    for (const f of walk('src/projects/jurnl/runtime')) {
      const src = read(f);
      expect(src, f).not.toMatch(/F01_ENTRY\/(ASSETS|OVERLAYS|ASSET_HARVEST|SHEETS|MANIFEST\/COMPONENT_REFERENCES)|ENTRY\.(ARCH|MATERIAL|OBJECT|BOTANICAL|PAPER|LIGHT)|_ARCHIVE_SCREENSHOT_CROPS/);
      expect(src, f).not.toMatch(/\/authorities\//);
    }
  });
  it('the only raster the runtime mounts is the official logo mark', () => {
    for (const s of F01_SCREENS) {
      const imgs = [...renderRuntime(s.route).matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(imgs), s.id).toEqual(new Set(['/site00/projects/jurnl/brand/jurnl-logo-official.png']));
    }
  });
  it('no OpenArt access anywhere in the ingestion / runtime code', () => {
    for (const f of projectCode) expect(read(f), f).not.toMatch(/openart/i);
  });
  it('no text, form or control is baked into imagery: the environment is aria-hidden with no interactive children', () => {
    const html = renderRuntime('entry');
    const env = html.slice(html.indexOf('data-testid="jurnl-environment"'), html.indexOf('data-runtime-bounds="column"'));
    expect(env).not.toMatch(/<(button|input|a)\b/);
  });
});

describe('privacy / security claims', () => {
  it('withheld claims never render; flagged claims render marked for substantiation', () => {
    const pages = ['overlay=security-data', 'overlay=security-details', 'overlay=security-sessions'].map((q) => renderRuntime('entry/security', q));
    pages.push(renderRuntime('entry/device-trust', 'overlay=device-learn'), renderRuntime('entry/privacy', 'overlay=privacy-data-export'), renderRuntime('entry/biometric'));
    const text = pages.join('\n');
    for (const c of F01_CLAIMS.filter((x) => x.status === 'WITHHELD')) {
      for (const part of c.text.split(/ \/ |\. /)) expect(text, c.id).not.toContain(part.replace(/\.$/, ''));
    }
    expect(text).not.toMatch(/BANK-LEVEL|ENCRYPT|FRAUD|AUDIT|NEVER SELL/);
    expect(renderRuntime('entry/biometric')).toContain('data-claim="C08"');
    expect(renderRuntime('entry/device-trust')).toContain('data-claim="C09"');
  });
});

describe('overlays are pinned to the runtime viewport (P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1)', () => {
  it('drawer / sheet / modal / native handoff portal into the root overlay host, never into scrolled screen content', () => {
    const prim = read('src/projects/jurnl/runtime/components/primitives.tsx');
    for (const marker of ['data-jrn-drawer={size}', 'data-jrn-sheet="full"', 'data-jrn-modal="confirm"', 'data-jrn-handoff="native"']) {
      const at = prim.indexOf(marker);
      expect(prim.lastIndexOf('<OverlayLayer>', at), marker).toBeGreaterThan(prim.lastIndexOf('export function', at));
    }
    expect(prim).toContain('createPortal(children, host)');
    const root = read('src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx');
    expect(root).toContain('<JurnlOverlayHostContext.Provider value={overlayHost}>');
    expect(root).toContain('data-jrn-overlay-host');
    expect(read('src/projects/jurnl/runtime/jurnl-runtime.css')).toMatch(/\.jrn \.jrn-overlay-host \{[^}]*position: absolute;[^}]*inset: 0;/);
  });
});

describe('no debug surface in the user-facing app', () => {
  it('inspection switches (?state / ?overlay / ?scenario / ?link) work in the design workspace only; a production shell ignores them', () => {
    expect(renderRuntime('entry/sign-in', 'state=locked')).toContain('data-jrn-overlay="locked"');
    expect(renderRuntime('entry/sign-in', 'state=locked', 'production')).not.toContain('data-jrn-overlay="locked"');
    expect(renderRuntime('entry/privacy', 'overlay=delete-account', 'production')).not.toContain('data-jrn-overlay="delete-account"');
    expect(renderRuntime('entry/verify-email', 'state=expired_link', 'production')).not.toContain('verify-error-expired');
    expect(renderRuntime('entry/verify-email', 'link=valid', 'production')).not.toContain('verify-success');
    const prod = renderRuntime('entry/sign-in', '', 'production');
    expect(prod).toContain('data-jrn-screen="F01.03"');
    expect(prod).not.toMatch(/PREVIEW|DEBUG|STATE:|SCENARIO/);
  });
});
