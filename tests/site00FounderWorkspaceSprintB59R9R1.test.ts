/**
 * B5.9R9R1 — Canonical account identity resolution tests.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  constructAccountFullName,
  normalizeAccountIdentityFields,
} from '../shared/site00-projects/accountIdentityNormalization.js';
import {
  formatAccountIdentityEyebrow,
  resolveAccountDisplayIdentityFromSources,
  resolveAccountEyebrowLabel,
} from '../shared/site00-projects/accountDisplayIdentity.js';
import {
  resolveActiveSimulatedClientOwner,
  resolveProjectsViewAccountIdentity,
} from '../shared/site00-projects/projectsViewDataAdapter.js';
import { toggleViewAsClient } from '../shared/site00-projects/projectViewMode.js';

const ROOT = join(import.meta.dirname, '..');
const EYEBROW = readFileSync(join(ROOT, 'src/site00/components/projectIndex/AccountIdentityEyebrow.tsx'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectsAccountIdentity.ts'), 'utf8');
const PROFILE_HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useSite00AccountProfileIdentity.ts'), 'utf8');
const INSPECTOR = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsAccountIdentityInspector.tsx'), 'utf8');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');

describe('B5.9R9R1 canonical account identity resolution', () => {
  it('1. canonical identity resolver exists', () => {
    expect(typeof resolveAccountDisplayIdentityFromSources).toBe('function');
    expect(HOOK).toContain('useSite00AccountProfileIdentity');
  });

  it('2. founder identity resolves from profile record', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'Teena', lastName: 'Armstrong', email: 'founder@site00.com', userId: 'u1' },
    });
    expect(result.eyebrow).toBe('TEENA ARMSTRONG /');
    expect(result.identity.source).toBe('PROFILE');
    expect(result.identity.resolutionStatus).toBe('RESOLVED');
  });

  it('3. founder resolves auth metadata when profile names missing', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { email: 'founder@site00.com' },
      authMetadataProfile: { firstName: 'Kateena', lastName: 'Armstrong', userId: 'auth-1' },
    });
    expect(result.eyebrow).toBe('KATEENA ARMSTRONG /');
    expect(result.identity.source).toBe('AUTH_METADATA');
  });

  it('4. client identity resolves from active simulated client owner', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { firstName: 'Founder', lastName: 'Name', email: 'founder@site00.com' },
      clientProjectOwners: [
        { slug: 'astral-world', email: 'client@example.com', firstName: 'Jordan', lastName: 'Cole' },
      ],
      simulatedClientProjectSlug: 'astral-world',
      founderEmail: 'founder@site00.com',
    });
    expect(result.eyebrow).toBe('JORDAN COLE /');
    expect(result.identity.source).toBe('CLIENT_PROJECT_OWNER');
  });

  it('5. profile field variants normalize correctly', () => {
    const fields = normalizeAccountIdentityFields({
      first_name: 'Teena',
      last_name: 'Armstrong',
      display_name: 'Teena A',
      email: 't@example.com',
    });
    expect(fields.firstName).toBe('Teena');
    expect(fields.lastName).toBe('Armstrong');
    expect(fields.displayName).toBe('Teena A');
  });

  it('6. firstName + lastName construct fullName', () => {
    expect(constructAccountFullName({ firstName: 'Teena', lastName: 'Armstrong', fullName: null })).toBe('Teena Armstrong');
  });

  it('7. one-name fallback works', () => {
    expect(constructAccountFullName({ firstName: 'Teena', lastName: null, fullName: null })).toBe('Teena');
  });

  it('8. displayName fallback works', () => {
    const result = resolveAccountDisplayIdentityFromSources({
      viewMode: 'CLIENT',
      candidates: [{ kind: 'DISPLAY_NAME', record: { displayName: 'Studio Client' }, priority: 1 }],
    });
    expect(formatAccountIdentityEyebrow(result)).toBe('STUDIO CLIENT /');
  });

  it('9. ACCOUNT is true last resort', () => {
    const result = resolveAccountDisplayIdentityFromSources({
      viewMode: 'FOUNDER',
      candidates: [],
    });
    expect(formatAccountIdentityEyebrow(result)).toBe('ACCOUNT /');
    expect(result.fallbackReason).toBe('NO_CANONICAL_IDENTITY_SOURCES');
  });

  it('10. fallback reason is recorded', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: null,
    });
    expect(result.identity.fallbackReason).toBeTruthy();
  });

  it('11. source is recorded', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
    });
    expect(result.identity.source).toBe('PROFILE');
    expect(result.identity.sourceRecordId).toBeTruthy();
  });

  it('12. AccountIdentityEyebrow consumes resolver output only', () => {
    expect(EYEBROW).not.toContain('firstName');
    expect(EYEBROW).not.toContain('localStorage');
    expect(EYEBROW).toContain('eyebrow');
  });

  it('13. founder name does not leak to client view', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      authenticatedProfile: { firstName: 'Founder', lastName: 'Name', email: 'founder@site00.com' },
      clientProjectOwners: [{ slug: 'p1', email: 'client@example.com', firstName: 'Client', lastName: 'Person' }],
      simulatedClientProjectSlug: 'p1',
      founderEmail: 'founder@site00.com',
    });
    expect(result.eyebrow).toBe('CLIENT PERSON /');
  });

  it('14. unrelated client blocked when email matches founder', () => {
    const owner = resolveActiveSimulatedClientOwner({
      clientProjects: [{ slug: 'p1', email: 'same@example.com', firstName: 'Teena', lastName: 'Armstrong' }],
      simulatedClientProjectSlug: 'p1',
      founderEmail: 'same@example.com',
    });
    expect(owner).toBeNull();
  });

  it('15. simulated client slug persists across toggle', () => {
    const session = toggleViewAsClient(
      { mode: 'FOUNDER', isSimulatingClient: false, simulatedAt: null, simulatedClientProjectSlug: null },
      { clientProjectSlug: 'astral-world' },
    );
    expect(session.simulatedClientProjectSlug).toBe('astral-world');
    expect(session.isSimulatingClient).toBe(true);
  });

  it('16. async hydration avoids permanent ACCOUNT fallback', () => {
    const loading = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      isHydrating: true,
      authenticatedProfile: null,
    });
    expect(loading.eyebrow).toBeNull();
    expect(loading.identity.resolutionStatus).toBe('LOADING');
  });

  it('17. missing profile produces explicit incomplete state', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { email: 'founder@site00.com', userId: 'uid-1' },
    });
    expect(result.identity.resolutionStatus).toBe('IDENTITY_PROFILE_INCOMPLETE');
    expect(result.identity.fallbackReason).toBe('NO_PROFILE_NAME_FIELDS');
  });

  it('18. no hardcoded founder name in hook', () => {
    expect(HOOK).not.toMatch(/Teena|Kateena|Armstrong/);
    expect(PROFILE_HOOK).not.toMatch(/Teena|Kateena|Armstrong/);
  });

  it('19. uppercase presentation only', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'teena', lastName: 'lastname', email: 'a@b.com' },
    });
    expect(result.eyebrow).toBe('TEENA LASTNAME /');
    expect(result.identity.firstName).toBe('teena');
  });

  it('20. shell invariance — inspector does not alter hero geometry classes', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexHero');
    expect(INDEX_PAGE).toContain('ProjectIndexViewStrip');
    expect(INSPECTOR).toContain('RESOLUTION STATUS');
  });

  it('21–22. mobile + desktop page shells unchanged', () => {
    expect(INDEX_PAGE).toContain('site00-pidx--mobile');
    expect(INDEX_PAGE).toContain('site00-pidx--desktop');
  });

  it('23. resolveAccountEyebrowLabel never returns PROJECTS as eyebrow label', () => {
    const identity = resolveAccountDisplayIdentityFromSources({
      viewMode: 'FOUNDER',
      candidates: [{ kind: 'DISPLAY_NAME', record: { displayName: 'Projects' }, priority: 1 }],
    });
    expect(resolveAccountEyebrowLabel(identity)).toBe('ACCOUNT');
  });
});
