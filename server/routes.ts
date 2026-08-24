import type { ApiHandler } from './vercelAdapter.js';

import profileHandler from '../api/profile.js';
import activityHandler from '../api/activity.js';
import sessionCookieHandler from '../api/session-cookie.js';
import sessionRestoreHandler from '../api/session-restore.js';
import site00ProductionHandler from '../api/admin/site00-production.js';
import site00AsstsHandler from '../api/admin/site00-assts.js';
import site00AccessHandler from '../api/site00-access.js';
import site00AccessCredentialsAdminHandler from '../api/admin/site00-access-credentials.js';
import site00ClientProductionHandler from '../api/site00/client-production.js';
import site00ProjectsHandler from '../api/site00/projects.js';
import site00MarketingEngagementsHandler from '../api/site00/marketing-engagements.js';
import site00StudioWorldWebhookHandler from '../api/site00/studio-world-webhook.js';
import site00MarketingAdminHandler from '../api/admin/site00-marketing.js';
import site00OrchestrationHandler from '../api/admin/site00-orchestration.js';
import site00EvolveHandler from '../api/admin/site00-evolve.js';
import site00EvolveOAuthCallbackHandler from '../api/admin/site00-evolve-oauth-callback.js';
import site00IntakesHandler from '../api/site00/intakes.js';
import site00IntakeAccessHandler from '../api/site00/intake-access.js';
import site00IntakesAdminHandler from '../api/admin/site00-intakes.js';
import site00ClientIntakesAdminHandler from '../api/admin/site00-client-intakes.js';
import site00WorldIntakeHandler from '../api/site00/world-intake.js';
import captureAuthBootstrapHandler from '../api/capture-auth-bootstrap.js';

/** Express path → Vercel-style default export handler */
export const API_ROUTES: ReadonlyArray<{ path: string; handler: ApiHandler }> = [
  { path: '/api/profile', handler: profileHandler },
  { path: '/api/activity', handler: activityHandler },
  { path: '/api/session-cookie', handler: sessionCookieHandler },
  { path: '/api/session-restore', handler: sessionRestoreHandler },
  { path: '/api/site00-access', handler: site00AccessHandler },
  { path: '/api/site00/client-production', handler: site00ClientProductionHandler },
  { path: '/api/site00/projects', handler: site00ProjectsHandler },
  { path: '/api/site00/marketing-engagements', handler: site00MarketingEngagementsHandler },
  { path: '/api/site00/studio-world-webhook', handler: site00StudioWorldWebhookHandler },
  { path: '/api/admin/site00-marketing', handler: site00MarketingAdminHandler },
  { path: '/api/admin/site00-production', handler: site00ProductionHandler },
  { path: '/api/admin/site00-assts', handler: site00AsstsHandler },
  { path: '/api/admin/site00-access-credentials', handler: site00AccessCredentialsAdminHandler },
  { path: '/api/admin/site00-orchestration', handler: site00OrchestrationHandler },
  { path: '/api/admin/site00-evolve', handler: site00EvolveHandler },
  { path: '/api/admin/site00-evolve/oauth/callback', handler: site00EvolveOAuthCallbackHandler },
  { path: '/api/site00/intakes', handler: site00IntakesHandler },
  { path: '/api/site00/intake-access', handler: site00IntakeAccessHandler },
  { path: '/api/site00/world-intake', handler: site00WorldIntakeHandler },
  { path: '/api/admin/site00-intakes', handler: site00IntakesAdminHandler },
  { path: '/api/admin/site00-client-intakes', handler: site00ClientIntakesAdminHandler },
  { path: '/api/capture-auth-bootstrap', handler: captureAuthBootstrapHandler },
];
