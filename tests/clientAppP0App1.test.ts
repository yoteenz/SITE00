/**
 * P0.APP.1 — Client mobile app architecture tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildEligibleOpportunities,
  selectPrimaryOpportunity,
  isOpportunitySuppressed,
} from '../shared/site00-client-app/opportunityEngine.js';
import { buildClientAppExperience } from '../shared/site00-client-app/manifestBuilder.js';
import { buildManifestFromScope } from '../shared/site00-client-project-room/manifestTemplates.js';
import { capabilitiesForRole } from '../shared/site00-client-project-room/capabilities.js';
import {
  CLIENT_APP_FIXTURES,
  CLIENT_APP_FIXTURE_SLUGS,
} from '../shared/site00-client-app/fixtures.js';
import { clientAppPath, CLIENT_APP_NAV } from '../shared/site00-client-app/client.js';
import { shouldShowWebAppCta, nextOnboardingState } from '../shared/site00-client-app/onboarding.js';
import { isNotificationAllowed, CLIENT_NOTIFICATION_CONTRACTS } from '../shared/site00-client-app/notificationContract.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.APP.1 client mobile app', () => {
  it('defines five primary nav destinations matching reference', () => {
    expect(CLIENT_APP_NAV.map((n) => n.label)).toEqual(['HOME', 'PROJECT', 'REVIEWS', 'INBOX', 'LIBRARY']);
  });

  it('builds project pulse with client-safe signal values', () => {
    const manifest = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'test',
      displayName: 'TEST',
      projectNumber: 'P001',
      scope: 'IDENTITY_PLUS_WEBSITE',
      currentPhaseId: 'website',
      attentionState: 'WATCHING',
      startDate: '2025-01-01',
      permissions: capabilitiesForRole('CLIENT_OWNER'),
    });
    const exp = buildClientAppExperience({ manifest });
    expect(exp.projectPulse.projectSignal).toBeTruthy();
    expect(exp.modules).toContain('home');
    expect(exp.modules).toContain('library');
  });

  it('suppresses marketing opportunity when service already purchased', () => {
    const opps = buildEligibleOpportunities({
      projectId: '1',
      currentServices: ['WEBSITE', 'MARKETING'],
      currentPhase: 'website',
      projectType: 'NDX',
      appState: 'IN_PRODUCTION',
      attentionState: 'WATCHING',
      postLaunchState: false,
      liveDays: null,
      dismissedOffers: [],
      purchasedServices: ['MARKETING'],
      hasCriticalIssue: false,
      hasOpenClientAction: false,
      clientSuppression: [],
    });
    expect(opps.some((o) => o.recommendedOffer === 'MARKETING')).toBe(false);
  });

  it('shows idle marketing opportunity for website-only project', () => {
    const opps = buildEligibleOpportunities({
      projectId: '1',
      currentServices: ['WEBSITE'],
      currentPhase: 'website',
      projectType: 'WEB',
      appState: 'IN_PRODUCTION',
      attentionState: 'WATCHING',
      postLaunchState: false,
      liveDays: null,
      dismissedOffers: [],
      purchasedServices: ['WEBSITE'],
      hasCriticalIssue: false,
      hasOpenClientAction: false,
      clientSuppression: [],
    });
    expect(opps.some((o) => o.recommendedOffer === 'MARKETING')).toBe(true);
  });

  it('prioritizes client action over opportunity', () => {
    const manifest = buildManifestFromScope({
      projectId: '1',
      projectSlug: 'test',
      displayName: 'TEST',
      projectNumber: 'P001',
      scope: 'WEBSITE_ONLY',
      currentPhaseId: 'design',
      attentionState: 'YOUR_TURN',
      startDate: '2025-01-01',
      permissions: capabilitiesForRole('CLIENT_OWNER'),
    });
    const exp = buildClientAppExperience({ manifest });
    const primary = selectPrimaryOpportunity(exp.opportunities, exp.projectPulse);
    expect(exp.projectPulse.nextForYou).not.toBeNull();
    expect(primary).toBeNull();
  });

  it('suppresses dismissed opportunities', () => {
    expect(
      isOpportunitySuppressed(
        {
          projectId: '1',
          currentServices: ['WEBSITE'],
          currentPhase: 'website',
          projectType: 'WEB',
          appState: 'IN_PRODUCTION',
          attentionState: 'WATCHING',
          postLaunchState: false,
          liveDays: null,
          dismissedOffers: ['MARKETING'],
          purchasedServices: [],
          hasCriticalIssue: false,
          hasOpenClientAction: false,
          clientSuppression: [],
        },
        'MARKETING',
      ),
    ).toBe(true);
  });

  it('provides fixture states A–G', () => {
    expect(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.A_WEBSITE_ONLY].services).toEqual(['WEBSITE']);
    expect(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK].displayName).toBe('NDXBOOK');
    expect(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH].appExperience.projectPulse.isPostLaunch).toBe(true);
    expect(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.E_UNESTABLISHED_COLOR].colorProfileState).toBe('UNESTABLISHED');
    expect(CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.F_ESTABLISHED_COLOR].accentSource).toBe('CLIENT_COLOR_PROFILE');
  });

  it('tracks onboarding states without faking install telemetry', () => {
    expect(nextOnboardingState('NOT_INVITED', 'INVITE')).toBe('INVITED');
    expect(nextOnboardingState('INVITED', 'ONBOARD')).toBe('ONBOARDED');
    expect(shouldShowWebAppCta('ONBOARDED')).toBe(false);
    expect(shouldShowWebAppCta('INVITED')).toBe(true);
  });

  it('does not force marketing push notifications', () => {
    const opp = CLIENT_NOTIFICATION_CONTRACTS.find((c) => c.category === 'OPPORTUNITY_ELIGIBLE');
    expect(opp?.requiresMarketingConsent).toBe(true);
    expect(isNotificationAllowed('OPPORTUNITY_ELIGIBLE', {
      reviewReady: true,
      revisionReady: true,
      messages: true,
      milestones: true,
      fileDelivery: true,
      clientTasks: true,
      launchUpdates: true,
      postLaunchCheckin: true,
      marketingOpportunities: false,
    })).toBe(false);
  });

  it('implements dedicated /app route namespace', () => {
    expect(clientAppPath('ndxbook')).toBe('/app/projects/ndxbook');
    expect(clientAppPath('ndxbook', 'reviews')).toBe('/app/projects/ndxbook/reviews');
    expect(read('src/routes/Site00Routes.tsx')).toContain("path={SITE00_ROUTES.appProjectRoot}");
    expect(read('src/site00/styles/site00-client-app.css')).toContain('.site00-app-bottom-nav');
  });

  it('preserves P0.CLIENT web project room routes', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('clientProjectRoom');
    expect(read('src/site00/styles/site00-client-project-room-p0client1.css')).toContain('.site00-cpr');
  });
});
