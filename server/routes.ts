import type { ApiHandler } from './vercelAdapter.js';

import profileHandler from '../api/profile.js';
import activityHandler from '../api/activity.js';
import sessionCookieHandler from '../api/session-cookie.js';
import sessionRestoreHandler from '../api/session-restore.js';
import site00ProductionHandler from '../api/admin/site00-production.js';
import site00AsstsHandler from '../api/admin/site00-assts.js';

/** Express path → Vercel-style default export handler */
export const API_ROUTES: ReadonlyArray<{ path: string; handler: ApiHandler }> = [
  { path: '/api/profile', handler: profileHandler },
  { path: '/api/activity', handler: activityHandler },
  { path: '/api/session-cookie', handler: sessionCookieHandler },
  { path: '/api/session-restore', handler: sessionRestoreHandler },
  { path: '/api/admin/site00-production', handler: site00ProductionHandler },
  { path: '/api/admin/site00-assts', handler: site00AsstsHandler },
];
