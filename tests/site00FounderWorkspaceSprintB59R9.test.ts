/**
 * B5.9R9 — Projects page account identity eyebrow tests.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  formatAccountIdentityEyebrow,
  resolveAuthenticatedAccountIdentity,
  accountEyebrowIsSafe,
  resolveAccountEyebrowLabel,
} from '../shared/site00-projects/accountDisplayIdentity.js';
import { resolveProjectsViewAccountIdentity } from '../shared/site00-projects/projectsAccountIdentityAdapter.js';

const ROOT = join(import.meta.dirname, '..');
const HERO = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHero.tsx'), 'utf8');
const EYEBROW = readFileSync(join(ROOT, 'src/site00/components/projectIndex/AccountIdentityEyebrow.tsx'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectsAccountIdentity.ts'), 'utf8');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const SHELL = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsPageShell.tsx'), 'utf8');
const INDEX_CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
const ADAPTER = readFileSync(join(ROOT, 'shared/site00-projects/projectsAccountIdentityAdapter.ts'), 'utf8');

describe('B5.9R9 Projects account identity eyebrow', () => {
  it('1. red eyebrow no longer hardcodes PROJECTS / in hero', () => {
    expect(HERO).not.toContain('PROJECTS /');
    expect(HERO).toContain('AccountIdentityEyebrow');
  });

  it('2. black title still renders PROJECTS', () => {
    expect(HERO).toContain('site00-pidx-hero__title">PROJECTS');
  });

  it('3. founder view reads authenticated account identity', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'Teena', lastName: 'Armstrong', email: 'founder@site00.com' },
    });
    expect(result.eyebrow).toBe('TEENA ARMSTRONG /');
    expect(result.identity.source).toBe('PROFILE');
  });

  it('4. client view reads active client identity when simulating', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { firstName: 'Teena', lastName: 'Armstrong', email: 'founder@site00.com' },
      clientProjectOwners: [
        { slug: 'client-project', email: 'client@example.com', firstName: 'Jordan', lastName: 'Cole' },
      ],
      simulatedClientProjectSlug: 'client-project',
      founderEmail: 'founder@site00.com',
    });
    expect(result.eyebrow).toBe('JORDAN COLE /');
    expect(result.identity.viewMode).toBe('CLIENT');
  });

  it('5. same AccountIdentityEyebrow component used in hero shell', () => {
    expect(HERO).toContain('<AccountIdentityEyebrow');
    expect(EYEBROW).toContain('site00-pidx-hero__kicker-red');
    expect(EYEBROW).toContain('export function AccountIdentityEyebrow');
  });

  it('6. same geometry classes preserved in hero shell', () => {
    expect(EYEBROW).toContain('site00-pidx-hero__kicker');
    expect(INDEX_CSS).toContain('.site00-pidx-hero__kicker-red');
    expect(HERO).toContain('ProjectsHeaderPlanet');
    expect(SHELL).toContain('ProjectIndexViewStrip');
  });

  it('7. uppercase presentation only — stored data unchanged', () => {
    const identity = resolveAuthenticatedAccountIdentity({ firstName: 'Teena', lastName: 'Lastname' });
    expect(identity.firstName).toBe('Teena');
    expect(formatAccountIdentityEyebrow(identity)).toBe('TEENA LASTNAME /');
  });

  it('8. missing first/last uses displayName then CLIENT fallback', () => {
    const withDisplay = resolveAuthenticatedAccountIdentity({ displayName: 'Studio Client' }, 'CLIENT');
    expect(formatAccountIdentityEyebrow(withDisplay)).toBe('STUDIO CLIENT /');

    const fallback = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { email: 'founder@site00.com' },
      founderEmail: 'founder@site00.com',
    });
    expect(fallback.eyebrow).toBe('CLIENT /');
  });

  it('9. no undefined / null eyebrow output', () => {
    const empty = resolveAuthenticatedAccountIdentity({});
    const eyebrow = formatAccountIdentityEyebrow(empty);
    expect(accountEyebrowIsSafe(eyebrow)).toBe(true);
    expect(eyebrow).not.toMatch(/undefined|null/i);
  });

  it('10. client view does not show founder name when simulating', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { firstName: 'Founder', lastName: 'Name', email: 'founder@site00.com' },
      activeClientProjectOwner: { firstName: 'Client', lastName: 'Person', email: 'client@example.com' },
      founderEmail: 'founder@site00.com',
    });
    expect(result.eyebrow).not.toContain('FOUNDER');
    expect(result.eyebrow).toBe('CLIENT PERSON /');
  });

  it('11. founder view does not use unrelated client owner profile', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'Founder', lastName: 'Name', email: 'founder@site00.com' },
      activeClientProjectOwner: { firstName: 'Client', lastName: 'Person', email: 'client@example.com' },
    });
    expect(result.eyebrow).toBe('FOUNDER NAME /');
  });

  it('12. shell-invariance — hero structure unchanged aside from eyebrow data', () => {
    expect(HERO).toContain('ALL PROJECTS. ONE SYSTEM.');
    expect(HERO).toContain('BUILDING BIGGER WORLDS');
    expect(HERO).toContain('PLAN');
    expect(SHELL).toContain('ProjectIndexControls');
    expect(INDEX_PAGE).toContain('site00-pidx--mobile');
    expect(INDEX_PAGE).toContain('site00-pidx--desktop');
  });

  it('13–14. mobile + desktop render hooks unchanged', () => {
    expect(INDEX_PAGE).toContain('site00-pidx--mobile');
    expect(INDEX_PAGE).toContain('site00-pidx--desktop');
    expect(HOOK).toContain('useProjectsAccountIdentity');
    expect(ADAPTER).toContain('resolveProjectsViewAccountIdentity');
  });

  it('15. resolveAccountEyebrowLabel never returns PROJECTS', () => {
    const identity = resolveAuthenticatedAccountIdentity({ displayName: 'Projects' });
    expect(resolveAccountEyebrowLabel(identity)).toBe('ACCOUNT');
  });

  it('16. privacy — simulated client blocks founder email match', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { firstName: 'Teena', lastName: 'Armstrong', email: 'same@example.com' },
      activeClientProjectOwner: { email: 'same@example.com', firstName: 'Teena', lastName: 'Armstrong' },
      founderEmail: 'same@example.com',
    });
    expect(result.eyebrow).toBe('CLIENT /');
  });
});
